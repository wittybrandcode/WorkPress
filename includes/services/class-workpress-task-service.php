<?php
/**
 * WorkPress Task Service.
 *
 * Encapsulates domain logic for Tasks (CPT 'work_item').
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Task_Service {

	/**
	 * Get tasks matching query args.
	 *
	 * @param array $args Query parameters.
	 * @return array Array of formatted task objects.
	 */
	public static function get_tasks( $args = array() ) {
		$query_args = array(
			'post_type'        => WorkPress_Install::CPT_WORK_ITEM,
			'post_status'      => 'any',
			'suppress_filters' => true,
			'posts_per_page'   => isset( $args['number'] ) ? (int) $args['number'] : 50,
			'paged'            => isset( $args['paged'] ) ? (int) $args['paged'] : 1,
			'orderby'          => 'date',
			'order'            => 'DESC',
		);

		if ( ! empty( $args['project_id'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => (int) $args['project_id'],
				),
			);
		} elseif ( ! empty( $args['project_ids'] ) && is_array( $args['project_ids'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => array_map( 'intval', $args['project_ids'] ),
					'operator' => 'IN',
				),
			);
		}

		$meta_query = array();
		if ( ! empty( $args['status'] ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_status',
				'value'   => sanitize_key( $args['status'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $args['priority'] ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_priority',
				'value'   => sanitize_key( $args['priority'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $meta_query ) ) {
			$query_args['meta_query'] = $meta_query;
		}

		$query = new WP_Query( $query_args );
		$tasks = array();

		if ( $query->have_posts() ) {
			$post_ids = wp_list_pluck( $query->posts, 'ID' );

			//  High-Performance Bulk Hydration: Prime post metas and project terms in ONE SQL Query (Principle 21)
			if ( ! empty( $post_ids ) ) {
				if ( function_exists( 'update_postmeta_cache' ) ) {
					update_postmeta_cache( $post_ids );
				}
				if ( function_exists( 'update_object_term_cache' ) ) {
					update_object_term_cache( $post_ids, WorkPress_Install::TAX_PROJECT );
				}
			}

			// Prime Caches for Users (Authors & Assignees)
			$user_ids_to_prime = array();
			foreach ( $query->posts as $p ) {
				$user_ids_to_prime[] = (int) $p->post_author;
				$assignees = get_post_meta( $p->ID, '_workpress_assignee_ids', true );
				if ( is_array( $assignees ) ) {
					$user_ids_to_prime = array_merge( $user_ids_to_prime, $assignees );
				}
			}
			
			if ( ! empty( $user_ids_to_prime ) ) {
				cache_users( array_unique( array_filter( $user_ids_to_prime ) ) );
			}

			while ( $query->have_posts() ) {
				$query->the_post();
				$tasks[] = self::format_task( get_post() );
			}
			wp_reset_postdata();
		}

		return array(
			'items'       => $tasks,
			'total'       => $query->found_posts,
			'total_pages' => $query->max_num_pages,
		);
	}

	/**
	 * Get single task by ID.
	 *
	 * @param int $task_id Post ID.
	 * @return array|WP_Error Formatted task or WP_Error.
	 */
	public static function get_task( $task_id ) {
		$post = get_post( (int) $task_id );
		if ( ! $post || WorkPress_Install::CPT_WORK_ITEM !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'المهمة غير موجودة.', 'workpress' ) );
		}

		return self::format_task( $post );
	}

	/**
	 * Create a new task.
	 *
	 * @param array $data Task attributes.
	 * @return array|WP_Error Created task or WP_Error.
	 */
	public static function create_task( $data ) {
		if ( empty( $data['title'] ) ) {
			return new WP_Error( 'missing_title', __( 'عنوان المهمة مطلوب.', 'workpress' ) );
		}

		$post_id = wp_insert_post(
			array(
				'post_title'   => sanitize_text_field( $data['title'] ),
				'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
				'post_type'    => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'  => 'publish',
				'post_author'  => ! empty( $data['author_id'] ) ? (int) $data['author_id'] : get_current_user_id(),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		// Attach project taxonomy.
		$project_id = ! empty( $data['project_id'] ) ? (int) $data['project_id'] : 0;
		if ( $project_id > 0 ) {
			wp_set_object_terms( $post_id, $project_id, WorkPress_Install::TAX_PROJECT );
		}

		// Default metadata.
		$status    = ! empty( $data['status'] ) ? sanitize_key( $data['status'] ) : 'open';
		$priority  = ! empty( $data['priority'] ) ? sanitize_key( $data['priority'] ) : 'medium';
		$due_at    = ! empty( $data['due_at'] ) ? sanitize_text_field( $data['due_at'] ) : '';
		$assignees = ! empty( $data['assignee_ids'] ) ? array_map( 'intval', (array) $data['assignee_ids'] ) : array();

		update_post_meta( $post_id, '_workpress_status', $status );
		update_post_meta( $post_id, '_workpress_priority', $priority );
		update_post_meta( $post_id, '_workpress_due_at', $due_at );
		update_post_meta( $post_id, '_workpress_assignee_ids', $assignees );

		if ( isset( $data['estimated_hours'] ) ) {
			update_post_meta( $post_id, '_workpress_estimated_hours', max( 0, round( (float) $data['estimated_hours'], 2 ) ) );
		}

		$cover_id = ! empty( $data['cover_id'] ) ? (int) $data['cover_id'] : 0;
		if ( $cover_id > 0 ) {
			update_post_meta( $post_id, '_workpress_cover_id', $cover_id );
		}

		self::clear_task_cache( $post_id );

		// Initial System Log for creation
		WorkPress_Contribution_Service::add_system_log( $post_id, __( 'تم إنشاء المهمة.', 'workpress' ) );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_created( $post_id, $data, get_current_user_id() );
		}

		return self::get_task( $post_id );
	}

	/**
	 * Update an existing task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $data Task data.
	 * @return array|WP_Error Formatted updated task or WP_Error.
	 */
	public static function update_task( $task_id, $data ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		if ( empty( $data['title'] ) ) {
			return new WP_Error( 'missing_title', __( 'عنوان المهمة مطلوب.', 'workpress' ) );
		}

		$post_update = array(
			'ID'           => (int) $task_id,
			'post_title'   => sanitize_text_field( $data['title'] ),
			'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
		);

		$result = wp_update_post( $post_update, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$changes = array();
		if ( $data['title'] !== $task['title'] ) {
			$changes[] = __( 'العنوان', 'workpress' );
		}
		if ( isset( $data['priority'] ) && $data['priority'] !== $task['priority'] ) {
			update_post_meta( $task_id, '_workpress_priority', sanitize_key( $data['priority'] ) );
			$changes[] = __( 'الأولوية', 'workpress' );
		}
		if ( isset( $data['estimated_hours'] ) ) {
			$new_est = max( 0, round( (float) $data['estimated_hours'], 2 ) );
			if ( $new_est !== (float) ( $task['estimated_hours'] ?? 0 ) ) {
				update_post_meta( $task_id, '_workpress_estimated_hours', $new_est );
				$changes[] = __( 'الساعات المقدرة', 'workpress' );
			}
		}
		
		if ( isset( $data['project_id'] ) && (int) $data['project_id'] !== (int) $task['project_id'] ) {
			wp_set_object_terms( $task_id, array( (int) $data['project_id'] ), WorkPress_Install::TAX_PROJECT );
			$changes[] = __( 'المشروع', 'workpress' );
		}

		if ( isset( $data['cover_id'] ) ) {
			if ( empty( $data['cover_id'] ) ) {
				delete_post_meta( $task_id, '_workpress_cover_id' );
			} else {
				update_post_meta( $task_id, '_workpress_cover_id', (int) $data['cover_id'] );
			}
		}

		self::clear_task_cache( $task_id );

		if ( ! empty( $changes ) && class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf(
					/* translators: %s: Comma separated list of changed fields */
					__( 'تم تعديل تفاصيل المهمة: %s.', 'workpress' ),
					implode( '، ', $changes )
				),
				get_current_user_id()
			);
		}

		return self::get_task( $task_id );
	}

	public static function normalize_status( $status ) {
		if ( empty( $status ) ) {
			return 'new';
		}
		
		$status_map = array(
			'جديدة'        => 'new',
			'مفتوحة'       => 'new',
			'open'         => 'new',
			'new'          => 'new',
			'مسندة'        => 'assigned',
			'مخصصة'        => 'assigned',
			'assigned'     => 'assigned',
			'قيد التنفيذ'  => 'in_progress',
			'قيد الإنجاز'  => 'in_progress',
			'في المراجعة'  => 'in_progress',
			'قيد المراجعة' => 'in_progress',
			'in_review'    => 'in_progress',
			'in_progress'  => 'in_progress',
			'معتمدة'       => 'completed',
			'مكتملة'       => 'completed',
			'مغلقة'        => 'completed',
			'closed'       => 'completed',
			'completed'    => 'completed',
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
		$comments = get_comments( array(
			'post_id'    => (int) $task_id,
			'type'       => 'wp_contribution',
			'count'      => true,
			'meta_query' => array(
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
		) );
		return (int) $comments;
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
			// T6: Check transition permissions via WorkflowService (respecting domain/Office Pack constraints)
			if ( class_exists( 'WorkPress_Workflow_Service' ) ) {
				if ( ! WorkPress_Workflow_Service::can_transition( $current_state, $derived_state ) ) {
					return $current_state;
				}
			}

			update_post_meta( $task_id, '_workpress_status', $derived_state );
			self::clear_task_cache( $task_id );

			// T5: Preserve audit history by logging state derivation (Principle 10, 12, 13)
			if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
				$state_labels = class_exists( 'WorkPress_Workflow_Service' ) ? WorkPress_Workflow_Service::get_state_labels() : array();
				$old_label = isset( $state_labels[ $current_state ] ) ? $state_labels[ $current_state ] : $current_state;
				$new_label = isset( $state_labels[ $derived_state ] ) ? $state_labels[ $derived_state ] : $derived_state;

				WorkPress_Contribution_Service::add_system_log(
					$task_id,
					sprintf(
						/* translators: 1: Old status label, 2: New status label */
						__( 'تم تحديث حالة المهمة آلياً: من %1$s إلى %2$s', 'workpress' ),
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
		$task = self::get_task( $task_id );
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
			__( 'تم تغيير حالة المهمة من ( %1$s ) إلى ( %2$s ).', 'workpress' ),
			$old_label,
			$new_label
		);

		WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $user_id );
		
		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_state_changed( $task_id, $old_status, $new_status, $user_id );
		}

		return self::get_task( $task_id );
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
		return self::derive_and_sync_task_state( $task_id );
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
		$task = self::get_task( $task_id );
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
					__( 'تم تقديم طلب حذف المهمة (السبب: %s).', 'workpress' ),
					$reason
				)
				: __( 'تم تقديم طلب حذف المهمة.', 'workpress' );

			WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $user_id );
		}

		return self::get_task( $task_id );
	}

	/**
	 * Restore task from pending trash.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User restoring the task.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function restore_from_trash( $task_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
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
				__( 'تمت استعادة المهمة وإلغاء طلب الحذف.', 'workpress' ),
				$user_id
			);
		}

		return self::get_task( $task_id );
	}

	/**
	 * Delete a task (Move to Trash).
	 *
	 * @param int $task_id Post ID.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete_task( $task_id ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				__( 'تم حذف المهمة ونقلها إلى سلة المهملات نهائياً.', 'workpress' ),
				get_current_user_id()
			);
		}

		$result = wp_trash_post( $task_id );
		if ( ! $result ) {
			return new WP_Error( 'delete_failed', __( 'فشل حذف المهمة.', 'workpress' ) );
		}
		
		self::clear_task_cache( $task_id );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_deleted( $task_id, get_current_user_id() );
		}

		return true;
	}

	/**
	 * Format WP_Post into standardized task array.
	 *
	 * @param WP_Post $post Post object.
	 * @return array Formatted task.
	 */
	private static function format_task( $post ) {
		$terms      = wp_get_object_terms( $post->ID, WorkPress_Install::TAX_PROJECT );
		$project    = ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0] : null;
		$prj_prefix = $project ? ( get_term_meta( $project->term_id, '_workpress_prefix', true ) ?: 'PRJ' ) : 'TASK';
		$ref_key    = $prj_prefix . '-' . $post->ID;

		$author_user = get_userdata( $post->post_author );
		$author_name = $author_user ? $author_user->display_name : '';

		$status   = get_post_meta( $post->ID, '_workpress_status', true ) ?: 'open';
		$status   = self::normalize_status( $status );

		$priority = get_post_meta( $post->ID, '_workpress_priority', true ) ?: 'medium';
		
		$cover_id  = (int) get_post_meta( $post->ID, '_workpress_cover_id', true );
		$cover_url = $cover_id ? wp_get_attachment_image_url( $cover_id, 'large' ) : '';

		$checklists = self::get_task_checklists( $post->ID );
		$checklists_count = count( $checklists );
		$checklists_completed = 0;
		foreach ( $checklists as $chk ) {
			if ( ! empty( $chk['is_completed'] ) ) {
				$checklists_completed++;
			}
		}
		$checklists_progress = $checklists_count > 0 ? round( ( $checklists_completed / $checklists_count ) * 100 ) : 0;

		$estimated_hours = (float) get_post_meta( $post->ID, '_workpress_estimated_hours', true );
		$logged_hours    = (float) get_post_meta( $post->ID, '_workpress_logged_hours', true );
		$remaining_hours = max( 0.0, round( $estimated_hours - $logged_hours, 2 ) );
		$time_progress   = $estimated_hours > 0 ? round( ( $logged_hours / $estimated_hours ) * 100 ) : 0;
		$worklogs        = self::get_task_worklogs( $post->ID );

		$attachments = self::get_task_attachments( $post->ID );

		$formatted = array(
			'id'           => $post->ID,
			'ref_key'      => $ref_key,
			'title'        => $post->post_title,
			'content'      => $post->post_content,
			'status'       => sanitize_key( $status ),
			'priority'     => sanitize_key( $priority ),
			'due_at'       => get_post_meta( $post->ID, '_workpress_due_at', true ),
			'assignee_ids' => get_post_meta( $post->ID, '_workpress_assignee_ids', true ) ?: array(),
			'project_id'   => $project ? $project->term_id : 0,
			'project_name' => $project ? $project->name : '',
			'author_id'    => (int) $post->post_author,
			'author_name'  => $author_name,
			'created_at'   => $post->post_date,
			'comments_num' => (int) $post->comment_count,
			'cover_id'     => $cover_id,
			'cover_url'    => $cover_url,
			'assignees'    => class_exists( 'WorkPress_Assignment_Service' ) ? WorkPress_Assignment_Service::get_assignees( $post->ID ) : array(),
			'is_pending_trash' => (bool) get_post_meta( $post->ID, '_workpress_is_pending_trash', true ),
			'trash_reason'     => get_post_meta( $post->ID, '_workpress_trash_reason', true ),
			'checklists'       => $checklists,
			'checklists_count' => $checklists_count,
			'checklists_completed_count' => $checklists_completed,
			'checklists_progress' => $checklists_progress,
			'estimated_hours'  => $estimated_hours,
			'logged_hours'     => $logged_hours,
			'remaining_hours'  => $remaining_hours,
			'time_progress'    => $time_progress,
			'worklogs'         => $worklogs,
			'worklogs_count'   => count( $worklogs ),
			'attachments'      => $attachments,
			'attachments_count'=> count( $attachments ),
		);

		return apply_filters( 'workpress_prepare_task_response', $formatted, $post );
	}

	/**
	 * Get worklogs for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Worklogs list.
	 */
	public static function get_task_worklogs( $task_id ) {
		$logs = get_post_meta( (int) $task_id, '_workpress_worklogs', true );
		if ( ! is_array( $logs ) ) {
			return array();
		}
		return $logs;
	}

	/**
	 * Set estimated hours for a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param float $hours Estimated hours.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function set_estimated_hours( $task_id, $hours ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$hours = max( 0, round( (float) $hours, 2 ) );
		update_post_meta( (int) $task_id, '_workpress_estimated_hours', $hours );
		self::clear_task_cache( $task_id );

		return self::get_task( $task_id );
	}

	/**
	 * Add a worklog to a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param float  $hours Hours spent.
	 * @param string $note Work note.
	 * @param string $date Date of work.
	 * @param int    $user_id User logging.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function add_worklog( $task_id, $hours, $note = '', $date = '', $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$hours = round( (float) $hours, 2 );
		if ( $hours <= 0 ) {
			return new WP_Error( 'invalid_hours', __( 'يجب أن تكون الساعات المسجلة أكبر من الصفر.', 'workpress' ) );
		}

		$user_id   = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$user_data = get_userdata( $user_id );
		$user_name = $user_data ? $user_data->display_name : __( 'مستخدم', 'workpress' );
		$date      = ! empty( $date ) ? sanitize_text_field( $date ) : current_time( 'Y-m-d' );

		$worklogs = self::get_task_worklogs( $task_id );

		$new_log = array(
			'id'          => 'log_' . time() . '_' . wp_rand( 100, 999 ),
			'user_id'     => $user_id,
			'user_name'   => $user_name,
			'user_avatar' => get_avatar_url( $user_id, array( 'size' => 48 ) ),
			'hours'       => $hours,
			'note'        => sanitize_textarea_field( $note ),
			'date'        => $date,
			'created_at'  => current_time( 'mysql' ),
		);

		$worklogs[] = $new_log;
		update_post_meta( (int) $task_id, '_workpress_worklogs', $worklogs );

		// Recalculate logged hours total
		$total_logged = 0;
		foreach ( $worklogs as $w ) {
			$total_logged += (float) ( $w['hours'] ?? 0 );
		}
		$total_logged = round( $total_logged, 2 );
		update_post_meta( (int) $task_id, '_workpress_logged_hours', $total_logged );

		self::clear_task_cache( $task_id );

		// System Log
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf( __( 'قام %1$s بتسجيل %2$s ساعة عمل: "%3$s"', 'workpress' ), $user_name, $hours, $note ?: __( 'عمل بدون ملاحظة', 'workpress' ) ),
				$user_id
			);
		}

		return array(
			'worklogs'     => $worklogs,
			'total_logged' => $total_logged,
			'task'         => self::get_task( $task_id ),
		);
	}

	/**
	 * Delete a worklog from a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $log_id Worklog ID.
	 * @param int    $user_id User deleting.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function delete_worklog( $task_id, $log_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$worklogs = self::get_task_worklogs( $task_id );
		$filtered = array();
		$found    = false;

		foreach ( $worklogs as $w ) {
			if ( $w['id'] === $log_id ) {
				$found = true;
				continue;
			}
			$filtered[] = $w;
		}

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'سجل العمل غير موجود.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_worklogs', $filtered );

		// Recalculate logged hours total
		$total_logged = 0;
		foreach ( $filtered as $w ) {
			$total_logged += (float) ( $w['hours'] ?? 0 );
		}
		$total_logged = round( $total_logged, 2 );
		update_post_meta( (int) $task_id, '_workpress_logged_hours', $total_logged );

		self::clear_task_cache( $task_id );

		return array(
			'worklogs'     => $filtered,
			'total_logged' => $total_logged,
			'task'         => self::get_task( $task_id ),
		);
	}

	/**
	 * Get checklists for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Checklist items.
	 */
	public static function get_task_checklists( $task_id ) {
		$checklists = get_post_meta( (int) $task_id, '_workpress_checklists', true );
		if ( ! is_array( $checklists ) ) {
			return array();
		}
		return $checklists;
	}

	/**
	 * Add a checklist item to a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $title Item title.
	 * @param int    $user_id User adding item.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function add_checklist_item( $task_id, $title, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$title = sanitize_text_field( trim( $title ) );
		if ( empty( $title ) ) {
			return new WP_Error( 'empty_title', __( 'عنوان عنصر قائمة الفحص مطلوب.', 'workpress' ) );
		}

		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$checklists = self::get_task_checklists( $task_id );

		$new_item = array(
			'id'           => 'chk_' . time() . '_' . wp_rand( 100, 999 ),
			'title'        => $title,
			'is_completed' => false,
			'created_by'   => $user_id,
			'created_at'   => current_time( 'mysql' ),
			'completed_by' => 0,
			'completed_at' => '',
		);

		$checklists[] = $new_item;
		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Toggle checklist item completion.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param int    $user_id User toggling.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function toggle_checklist_item( $task_id, $item_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$checklists = self::get_task_checklists( $task_id );
		$found = false;

		foreach ( $checklists as &$item ) {
			if ( $item['id'] === $item_id ) {
				$item['is_completed'] = ! ( ! empty( $item['is_completed'] ) );
				if ( $item['is_completed'] ) {
					$item['completed_by'] = $user_id;
					$item['completed_at'] = current_time( 'mysql' );
				} else {
					$item['completed_by'] = 0;
					$item['completed_at'] = '';
				}
				$found = true;
				break;
			}
		}
		unset( $item );

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'عنصر قائمة الفحص غير موجود.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Update checklist item title.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param string $title New title.
	 * @param int    $user_id User updating.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function update_checklist_item( $task_id, $item_id, $title, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$title = sanitize_text_field( trim( $title ) );
		if ( empty( $title ) ) {
			return new WP_Error( 'empty_title', __( 'عنوان عنصر قائمة الفحص مطلوب.', 'workpress' ) );
		}

		$checklists = self::get_task_checklists( $task_id );
		$found = false;

		foreach ( $checklists as &$item ) {
			if ( $item['id'] === $item_id ) {
				$item['title'] = $title;
				$found = true;
				break;
			}
		}
		unset( $item );

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'عنصر قائمة الفحص غير موجود.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Delete a checklist item from a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param int    $user_id User deleting.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function delete_checklist_item( $task_id, $item_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$checklists = self::get_task_checklists( $task_id );
		$filtered = array();
		$found = false;

		foreach ( $checklists as $item ) {
			if ( $item['id'] === $item_id ) {
				$found = true;
				continue;
			}
			$filtered[] = $item;
		}

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'عنصر قائمة الفحص غير موجود.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $filtered );
		self::clear_task_cache( $task_id );

		return $filtered;
	}

	/**
	 * Get attachments for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Formatted attachments list.
	 */
	public static function get_task_attachments( $task_id ) {
		$att_ids = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			return array();
		}

		$attachments = array();
		foreach ( $att_ids as $att_id ) {
			$att_id = (int) $att_id;
			if ( $att_id > 0 ) {
				$file_path = get_attached_file( $att_id );
				$file_size = $file_path && file_exists( $file_path ) ? size_format( filesize( $file_path ), 1 ) : '';
				$mime_type = get_post_mime_type( $att_id );
				$url       = wp_get_attachment_url( $att_id );
				if ( $url ) {
					$attachments[] = array(
						'id'        => $att_id,
						'name'      => get_the_title( $att_id ) ?: basename( $file_path ?: 'file' ),
						'url'       => $url,
						'mime_type' => $mime_type,
						'size'      => $file_size,
						'is_image'  => wp_attachment_is_image( $att_id ),
					);
				}
			}
		}

		return $attachments;
	}

	/**
	 * Add attachment to a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $attachment_id Attachment ID.
	 * @param int $user_id User ID.
	 * @return array|WP_Error Updated attachments or error.
	 */
	public static function add_task_attachment( $task_id, $attachment_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$attachment_id = (int) $attachment_id;
		if ( $attachment_id <= 0 || ! wp_get_attachment_url( $attachment_id ) ) {
			return new WP_Error( 'invalid_attachment', __( 'المرفق غير صالح.', 'workpress' ) );
		}

		$att_ids = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			$att_ids = array();
		}

		if ( ! in_array( $attachment_id, $att_ids, true ) ) {
			$att_ids[] = $attachment_id;
			update_post_meta( (int) $task_id, '_workpress_attachment_ids', $att_ids );
			self::clear_task_cache( $task_id );

			if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
				$user_id   = $user_id > 0 ? (int) $user_id : get_current_user_id();
				$user_data = get_userdata( $user_id );
				$user_name = $user_data ? $user_data->display_name : __( 'مستخدم', 'workpress' );
				$att_title = get_the_title( $attachment_id ) ?: __( 'ملف مرفق', 'workpress' );
				WorkPress_Contribution_Service::add_system_log(
					$task_id,
					sprintf( __( 'قام %1$s بإضافة مرفق جديد للمهمة: "%2$s"', 'workpress' ), $user_name, $att_title ),
					$user_id
				);
			}
		}

		return self::get_task_attachments( $task_id );
	}

	/**
	 * Delete attachment from a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $attachment_id Attachment ID.
	 * @param int $user_id User ID.
	 * @return array|WP_Error Updated attachments or error.
	 */
	public static function delete_task_attachment( $task_id, $attachment_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$attachment_id = (int) $attachment_id;
		$att_ids       = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			$att_ids = array();
		}

		$filtered = array_values( array_diff( $att_ids, array( $attachment_id ) ) );
		update_post_meta( (int) $task_id, '_workpress_attachment_ids', $filtered );
		self::clear_task_cache( $task_id );

		return self::get_task_attachments( $task_id );
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
