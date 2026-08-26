<?php
/**
 * WorkPress Assignment Service.
 *
 * Encapsulates domain logic for Task Assignments.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Assignment_Service {

	/**
	 * Check if a user is assignable to tasks (Principle #1: Role Clarity).
	 *
	 * A user cannot be assigned if they are a client/viewer (workpress_client, subscriber without edit caps, or viewer).
	 *
	 * @param int $user_id User ID.
	 * @param int $project_id Optional project ID to check project-level role.
	 * @return bool True if assignable, false otherwise.
	 */
	public static function is_user_assignable( $user_id, $project_id = 0 ) {
		$user_id = (int) $user_id;
		if ( ! $user_id ) {
			return false;
		}

		$user = get_userdata( $user_id );
		if ( ! $user ) {
			return false;
		}

		// 1. Check WordPress global roles - Exclude pure client/viewer roles
		$roles = (array) $user->roles;
		if ( in_array( 'workpress_client', $roles, true ) || in_array( 'workpress_viewer', $roles, true ) ) {
			return false;
		}

		// If user is just a Subscriber without any editing capability, treat as non-worker / stakeholder
		if ( in_array( 'subscriber', $roles, true ) && ! user_can( $user_id, 'edit_posts' ) && ! user_can( $user_id, 'edit_workpress_tasks' ) ) {
			return false;
		}

		// 2. Check Project-level role if project_id is provided
		if ( $project_id > 0 && class_exists( 'WorkPress_Membership_Service' ) ) {
			$client_id = (int) get_term_meta( $project_id, '_workpress_client_id', true );
			if ( $client_id === $user_id ) {
				return false;
			}

			$project_role = WorkPress_Membership_Service::get_user_role( $project_id, $user_id );
			if ( WorkPress_Membership_Service::ROLE_VIEWER === $project_role ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get assignable users for a project or globally.
	 *
	 * @param int $project_id Optional project ID.
	 * @return array Array of user info arrays.
	 */
	public static function get_assignable_users( $project_id = 0 ) {
		$project_id = (int) $project_id;
		$assignable = array();

		if ( $project_id > 0 && class_exists( 'WorkPress_Membership_Service' ) ) {
			$members = WorkPress_Membership_Service::get_members( $project_id );
			foreach ( $members as $m ) {
				if ( self::is_user_assignable( $m['id'], $project_id ) ) {
					$assignable[] = array(
						'id'           => $m['id'],
						'display_name' => $m['display_name'],
						'email'        => $m['email'],
						'avatar_url'   => $m['avatar_url'],
						'role'         => $m['role'],
					);
				}
			}
			return $assignable;
		}

		// Global assignable team members
		$users = get_users( array(
			'role__not_in' => array( 'workpress_client', 'workpress_viewer' ),
			'number'       => 100,
		) );

		foreach ( $users as $u ) {
			if ( self::is_user_assignable( $u->ID ) ) {
				$assignable[] = array(
					'id'           => $u->ID,
					'display_name' => $u->display_name,
					'email'        => $u->user_email,
					'avatar_url'   => get_avatar_url( $u->ID ),
				);
			}
		}

		return $assignable;
	}

	/**
	 * Assign users to a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $user_ids Array of user IDs.
	 * @param int   $assigner_id User performing the assignment.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function assign( $task_id, $user_ids, $assigner_id = 0 ) {
		$task = get_post( (int) $task_id );
		if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
			return new WP_Error( 'not_found', __( 'المهمة غير موجودة.', 'workpress' ) );
		}

		$project_id = 0;
		if ( class_exists( 'WorkPress_Install' ) ) {
			$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$project_id = (int) $terms[0]->term_id;
			}
		}

		// Filter out non-assignable users (clients, viewers)
		$sanitized_ids = array();
		foreach ( (array) $user_ids as $uid ) {
			$uid = (int) $uid;
			if ( self::is_user_assignable( $uid, $project_id ) ) {
				$sanitized_ids[] = $uid;
			}
		}

		$current_assignees = get_post_meta( $task_id, '_workpress_assignee_ids', true ) ?: array();
		$new_assignees     = array_unique( array_merge( (array) $current_assignees, $sanitized_ids ) );

		update_post_meta( $task_id, '_workpress_assignee_ids', $new_assignees );

		// Log contribution
		$assigner_id = $assigner_id > 0 ? $assigner_id : get_current_user_id();
		$names       = array();
		foreach ( (array) $sanitized_ids as $uid ) {
			$u = get_userdata( $uid );
			if ( $u ) {
				$names[] = $u->display_name;
			}
		}

		if ( ! empty( $names ) ) {
			$log_msg = sprintf(
				/* translators: %s: Comma separated user names */
				__( 'تم تكليف المستخدمين: %s.', 'workpress' ),
				implode( '، ', $names )
			);
			WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $assigner_id );
		}

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_assigned( $task_id, $new_assignees, $assigner_id );
		}

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		return true;
	}

	/**
	 * Unassign users from a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $user_ids Array of user IDs.
	 * @param int   $assigner_id User performing the unassignment.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function unassign( $task_id, $user_ids, $assigner_id = 0 ) {
		$task = get_post( (int) $task_id );
		if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
			return new WP_Error( 'not_found', __( 'المهمة غير موجودة.', 'workpress' ) );
		}

		$current_assignees = get_post_meta( $task_id, '_workpress_assignee_ids', true ) ?: array();
		$user_ids          = array_map( 'intval', (array) $user_ids );
		$new_assignees     = array_diff( (array) $current_assignees, $user_ids );

		update_post_meta( $task_id, '_workpress_assignee_ids', array_values( $new_assignees ) );

		// Log contribution
		$assigner_id = $assigner_id > 0 ? $assigner_id : get_current_user_id();
		$names       = array();
		foreach ( $user_ids as $uid ) {
			$u = get_userdata( $uid );
			if ( $u ) {
				$names[] = $u->display_name;
			}
		}

		$log_msg = sprintf(
			/* translators: %s: Comma separated user names */
			__( 'تم إلغاء تكليف المستخدمين: %s.', 'workpress' ),
			implode( '، ', $names )
		);

		WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $assigner_id );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_unassigned( $task_id, $user_ids, $assigner_id );
		}

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		return true;
	}

	/**
	 * Set assignees for a task (replaces all existing assignments).
	 *
	 * @param int   $task_id Task ID.
	 * @param array $user_ids Array of user IDs.
	 * @param int   $assigner_id User performing assignment.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function set_assignees( $task_id, $user_ids = array(), $assigner_id = 0 ) {
		$task = get_post( (int) $task_id );
		if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
			return new WP_Error( 'not_found', __( 'المهمة غير موجودة.', 'workpress' ) );
		}

		$project_id = 0;
		if ( class_exists( 'WorkPress_Install' ) ) {
			$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$project_id = (int) $terms[0]->term_id;
			}
		}

		$assigner_id   = $assigner_id > 0 ? $assigner_id : get_current_user_id();
		$raw_ids       = array_values( array_unique( array_filter( array_map( 'intval', (array) $user_ids ) ) ) );
		
		// Filter out non-assignable users (clients, viewers)
		$new_user_ids  = array();
		foreach ( $raw_ids as $uid ) {
			if ( self::is_user_assignable( $uid, $project_id ) ) {
				$new_user_ids[] = $uid;
			}
		}

		$old_user_ids = get_post_meta( $task_id, '_workpress_assignee_ids', true ) ?: array();

		update_post_meta( $task_id, '_workpress_assignee_ids', $new_user_ids );

		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			if ( ! empty( $new_user_ids ) ) {
				if ( function_exists( 'cache_users' ) ) {
					cache_users( $new_user_ids );
				}
				$names = array();
				foreach ( $new_user_ids as $uid ) {
					$u = get_userdata( $uid );
					if ( $u ) {
						$names[] = $u->display_name;
					}
				}
				$log_msg = sprintf(
					/* translators: %s: Comma separated user names */
					__( 'تم تعيين المكلفين بالمهمة: %s.', 'workpress' ),
					implode( '، ', $names )
				);
			} else {
				$log_msg = __( 'تمت إزالة جميع المكلفين من المهمة.', 'workpress' );
			}

			WorkPress_Contribution_Service::add_system_log( $task_id, $log_msg, $assigner_id );
		}

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_assigned( $task_id, $new_user_ids, $assigner_id );
		}

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		return true;
	}

	/**
	 * Get assignees for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Array of user objects or formatted arrays.
	 */
	public static function get_assignees( $task_id ) {
		$assignee_ids = get_post_meta( (int) $task_id, '_workpress_assignee_ids', true ) ?: array();
		$assignees    = array();

		if ( empty( $assignee_ids ) ) {
			return $assignees;
		}

		if ( function_exists( 'cache_users' ) ) {
			cache_users( (array) $assignee_ids );
		}

		foreach ( (array) $assignee_ids as $uid ) {
			$user = get_userdata( $uid );
			if ( $user ) {
				$assignees[] = array(
					'id'           => $user->ID,
					'display_name' => $user->display_name,
					'avatar'       => get_avatar_url( $user->ID ),
				);
			}
		}

		return $assignees;
	}
}
