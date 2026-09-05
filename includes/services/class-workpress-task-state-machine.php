<?php
/**
 * WorkPress Task State Machine & Lifecycle Transitions Engine
 *
 * Encapsulates status normalization, real contribution counting, deterministic
 * state derivation (Principle #10, #12, #13), conditional transitions, trash workflows,
 * and lifecycle audit logging.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Task_State_Machine {

	/**
	 * Canonical status normalization map.
	 *
	 * @param string $status Raw status string.
	 * @return string Normalized canonical status key.
	 */
	public static function normalize_status( $status ) {
		if ( empty( $status ) ) {
			return 'new';
		}

		$status_map = array(
			'جديدة'        => 'new',
			'new'          => 'new',
			'مفتوحة'       => 'open',
			'open'         => 'open',
			'مسندة'        => 'assigned',
			'مخصصة'        => 'assigned',
			'assigned'     => 'assigned',
			'قيد التنفيذ'  => 'in_progress',
			'قيد الإنجاز'  => 'in_progress',
			'in_progress'  => 'in_progress',
			'في المراجعة'  => 'in_review',
			'قيد المراجعة' => 'in_review',
			'in_review'    => 'in_review',
			'معتمدة'       => 'approved',
			'approved'     => 'approved',
			'مكتملة'       => 'completed',
			'completed'    => 'completed',
			'مغلقة'        => 'closed',
			'closed'       => 'closed',
		);

		if ( isset( $status_map[ $status ] ) ) {
			return $status_map[ $status ];
		}

		return sanitize_key( $status );
	}

	/**
	 * Count real contributions for a task (excluding trashed or pending trash).
	 *
	 * @param int $task_id Post ID.
	 * @return int Number of contributions.
	 */
	public static function count_real_contributions( $task_id ) {
		$comment_ids = get_comments( array(
			'post_id'    => (int) $task_id,
			'type'       => 'wp_contribution',
			'fields'     => 'ids',
			'meta_query' => array(
				'relation' => 'AND',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_is_pending_trash',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_is_pending_trash',
						'value'   => '1',
						'compare' => '!=',
					),
				),
				array(
					'key'     => '_workpress_contribution_type',
					'value'   => array( 'state_change', 'assignment', 'trash_request' ),
					'compare' => 'NOT IN',
				),
			),
		) );
		return is_array( $comment_ids ) ? count( array_unique( $comment_ids ) ) : 0;
	}

	/**
	 * Deterministically derive and synchronize task state based on real events:
	 * 1. Has accepted solution -> 'completed'
	 * 2. Has >= 1 contributions -> 'in_progress'
	 * 3. Has >= 1 assignees -> 'assigned'
	 * 4. Otherwise -> 'new'
	 *
	 * @param int $task_id Post ID.
	 * @return string Derived state key.
	 */
	public static function derive_and_sync_task_state( $task_id ) {
		$task_id = (int) $task_id;
		if ( $task_id <= 0 ) {
			return 'new';
		}

		// 1. Check if an accepted solution exists
		$accepted_solution = false;
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			$accepted_solution = WorkPress_Contribution_Service::get_solution_for_task( $task_id );
		}

		if ( $accepted_solution ) {
			$derived_state = 'completed';
		} else {
			// 2. Check real contributions count
			$contrib_count = self::count_real_contributions( $task_id );
			if ( $contrib_count > 0 ) {
				$derived_state = 'in_progress';
			} else {
				// 3. Check assignees count
				$assignees = array();
				if ( class_exists( 'WorkPress_Assignment_Service' ) ) {
					$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );
				}
				if ( ! empty( $assignees ) ) {
					$derived_state = 'assigned';
				} else {
					$derived_state = 'new';
				}
			}
		}

		$current_state = get_post_meta( $task_id, '_workpress_status', true );
		if ( empty( $current_state ) ) {
			$current_state = 'new';
		}
		$current_state = self::normalize_status( $current_state );

		if ( $current_state !== $derived_state ) {
			// Check transition permissions via WorkflowService
			if ( class_exists( 'WorkPress_Workflow_Service' ) ) {
				if ( ! WorkPress_Workflow_Service::can_transition( $current_state, $derived_state ) ) {
					return $current_state;
				}
			}

			update_post_meta( $task_id, '_workpress_status', $derived_state );
			self::clear_task_cache( $task_id );

			// Preserve audit history by logging state derivation (Principle 10, 12, 13)
			if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
				$state_labels = class_exists( 'WorkPress_Workflow_Service' ) ? WorkPress_Workflow_Service::get_state_labels() : array();
				$old_label    = isset( $state_labels[ $current_state ] ) ? $state_labels[ $current_state ] : $current_state;
				$new_label    = isset( $state_labels[ $derived_state ] ) ? $state_labels[ $derived_state ] : $derived_state;

				WorkPress_Contribution_Service::add_system_log(
					$task_id,
					sprintf(
						/* translators: 1: Old status label, 2: New status label */
						__( 'Task status automatically updated: from %1$s to %2$s', 'workpress' ),
						$old_label,
						$new_label
					),
					get_current_user_id()
				);
			}

			if ( class_exists( 'WorkPress_Hooks' ) ) {
				WorkPress_Hooks::fire_task_state_changed( $task_id, $current_state, $derived_state, get_current_user_id() );
			}

			// Update project completion status automatically
			$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) && class_exists( 'WorkPress_Project_Service' ) ) {
				WorkPress_Project_Service::check_and_update_project_completion( (int) $terms[0]->term_id );
			}
		}

		return $derived_state;
	}

	/**
	 * Migrate and normalize all existing tasks and projects in DB.
	 */
	public static function migrate_and_normalize_all_states() {
		$tasks = get_posts( array(
			'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'fields'         => 'ids',
		) );

		foreach ( $tasks as $task_id ) {
			self::derive_and_sync_task_state( $task_id );
		}

		$projects = get_terms( array(
			'taxonomy'   => WorkPress_Install::TAX_PROJECT,
			'hide_empty' => false,
			'fields'     => 'ids',
		) );

		if ( ! is_wp_error( $projects ) && ! empty( $projects ) && class_exists( 'WorkPress_Project_Service' ) ) {
			foreach ( $projects as $proj_id ) {
				WorkPress_Project_Service::check_and_update_project_completion( $proj_id );
			}
		}
	}

	/**
	 * Update task status manually or via event.
	 *
	 * @param int    $task_id Post ID.
	 * @param string $new_status New status key.
	 * @param int    $user_id User changing the status.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function update_task_status( $task_id, $new_status, $user_id = 0 ) {
		$task = WorkPress_Task_Service::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$old_status = empty( $task['status'] ) ? 'new' : $task['status'];
		$old_status = self::normalize_status( $old_status );
		$new_status = self::normalize_status( $new_status );

		if ( $old_status === $new_status ) {
			return $task;
		}

		update_post_meta( (int) $task_id, '_workpress_status', $new_status );
		self::clear_task_cache( $task_id );

		// Cascading rule: Update project progress and check completion automatically
		$terms = wp_get_object_terms( (int) $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) && class_exists( 'WorkPress_Project_Service' ) ) {
			WorkPress_Project_Service::check_and_update_project_completion( (int) $terms[0]->term_id );
		}

		$old_label = class_exists( 'WorkPress_Workflow_Service' ) ? WorkPress_Workflow_Service::get_state_label( $old_status ) : $old_status;
		$new_label = class_exists( 'WorkPress_Workflow_Service' ) ? WorkPress_Workflow_Service::get_state_label( $new_status ) : $new_status;

		$log_msg = sprintf(
			/* translators: 1: Old Status 2: New Status */
			__( 'Task status changed from ( %1$s ) to ( %2$s ).', 'workpress' ),
			$old_label,
			$new_label
		);

		WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $user_id );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_state_changed( $task_id, $old_status, $new_status, $user_id );
		}

		return WorkPress_Task_Service::get_task( $task_id );
	}

	/**
	 * Close a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User closing the task.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function close_task( $task_id, $user_id = 0 ) {
		$result = self::update_task_status( $task_id, 'completed', $user_id );

		if ( ! is_wp_error( $result ) && class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_closed( $task_id, $user_id );
		}

		return $result;
	}

	/**
	 * Reopen a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User reopening the task.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function reopen_task( $task_id, $user_id = 0 ) {
		update_post_meta( (int) $task_id, '_workpress_status', 'open' );
		self::clear_task_cache( $task_id );
		self::derive_and_sync_task_state( $task_id );
		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_reopened( $task_id, $user_id );
		}
		return WorkPress_Task_Service::get_task( $task_id );
	}

	/**
	 * Request deletion (Move to Pending Trash).
	 *
	 * @param int    $task_id Task ID.
	 * @param string $reason Reason for deletion request.
	 * @param int    $user_id User requesting deletion.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function trash_request( $task_id, $reason = '', $user_id = 0 ) {
		$task = WorkPress_Task_Service::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$user_id = $user_id > 0 ? $user_id : get_current_user_id();

		update_post_meta( (int) $task_id, '_workpress_is_pending_trash', 1 );
		if ( ! empty( $reason ) ) {
			update_post_meta( (int) $task_id, '_workpress_trash_reason', sanitize_textarea_field( $reason ) );
		}

		self::clear_task_cache( $task_id );

		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			$log_msg = ! empty( $reason )
				? sprintf(
					/* translators: %s: Reason */
					__( 'Task deletion requested (reason: %s).', 'workpress' ),
					$reason
				)
				: __( 'Task deletion requested.', 'workpress' );

			WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $user_id );
		}

		return WorkPress_Task_Service::get_task( $task_id );
	}

	/**
	 * Restore task from pending trash.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User restoring the task.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function restore_from_trash( $task_id, $user_id = 0 ) {
		$task = WorkPress_Task_Service::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$user_id = $user_id > 0 ? $user_id : get_current_user_id();

		delete_post_meta( (int) $task_id, '_workpress_is_pending_trash' );
		delete_post_meta( (int) $task_id, '_workpress_trash_reason' );

		self::clear_task_cache( $task_id );

		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				__( 'Task restored and deletion request cancelled.', 'workpress' ),
				$user_id
			);
		}

		return WorkPress_Task_Service::get_task( $task_id );
	}

	/**
	 * Delete a task (Move to Trash).
	 *
	 * @param int $task_id Post ID.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete_task( $task_id ) {
		$task = WorkPress_Task_Service::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				__( 'Task deleted and moved to trash permanently.', 'workpress' ),
				get_current_user_id()
			);
		}

		$result = wp_trash_post( $task_id );
		if ( ! $result ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete task.', 'workpress' ) );
		}

		self::clear_task_cache( $task_id );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_deleted( $task_id, get_current_user_id() );
		}

		return true;
	}

	/**
	 * Clear caches related to a task.
	 *
	 * @param int $task_id Task ID.
	 */
	public static function clear_task_cache( $task_id ) {
		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				delete_transient( 'workpress_completed_count_' . $term->term_id );
				if ( class_exists( 'WorkPress_Project_Service' ) ) {
					WorkPress_Project_Service::invalidate_project_cache( $term->term_id );
				}
			}
		}
	}
}
