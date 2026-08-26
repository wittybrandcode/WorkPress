<?php
/**
 * WorkPress Permission Service.
 *
 * Centralized authorization engine based on capabilities and memberships.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Permission_Service {

	/**
	 * Check if user can view a project.
	 *
	 * @param int $user_id User ID.
	 * @param int $project_id Term ID.
	 * @return bool
	 */
	public static function can_view_project( $user_id, $project_id ) {
		// Only administrators have explicit system-wide bypass (PRD: مسار إداري صريح)
		if ( user_can( $user_id, 'manage_options' ) ) {
			return true;
		}
		// Visibility strictly follows project membership (Principle 8, PRD)
		return WorkPress_Membership_Service::is_member( $project_id, $user_id );
	}

	/**
	 * Check if user can manage a project (edit details, delete, manage members).
	 *
	 * @param int $user_id User ID.
	 * @param int $project_id Term ID.
	 * @return bool
	 */
	public static function can_manage_project( $user_id, $project_id ) {
		if ( user_can( $user_id, 'manage_options' ) || user_can( $user_id, 'edit_workpress_projects' ) ) {
			return true;
		}
		return WorkPress_Membership_Service::get_user_role( $project_id, $user_id ) === WorkPress_Membership_Service::ROLE_MANAGER;
	}

	/**
	 * Check if user can create tasks in a project.
	 *
	 * @param int $user_id User ID.
	 * @param int $project_id Term ID.
	 * @return bool
	 */
	public static function can_create_task( $user_id, $project_id ) {
		// Native check: does the user have the capability globally?
		if ( ! user_can( $user_id, 'create_workpress_tasks' ) && ! user_can( $user_id, 'manage_options' ) ) {
			return false;
		}
		
		// Context check: are they a member of this project? (Unless they are global manager)
		if ( user_can( $user_id, 'edit_workpress_projects' ) ) {
			return true;
		}
		
		return WorkPress_Membership_Service::is_member( $project_id, $user_id );
	}

	/**
	 * Check if user can edit a task.
	 *
	 * @param int $user_id User ID.
	 * @param int $task_id Post ID.
	 * @return bool
	 */
	public static function can_edit_task( $user_id, $task_id ) {
		if ( user_can( $user_id, 'manage_options' ) ) {
			return true;
		}
		
		$task = get_post( $task_id );
		if ( ! $task ) return false;
		
		if ( (int) $task->post_author === (int) $user_id ) {
			return true;
		}
		
		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$project_id = $terms[0]->term_id;
			return WorkPress_Membership_Service::get_user_role( $project_id, $user_id ) === WorkPress_Membership_Service::ROLE_MANAGER;
		}
		
		return false;
	}

	/**
	 * Check if user can contribute to a task.
	 *
	 * @param int $user_id User ID.
	 * @param int $task_id Post ID.
	 * @return bool
	 */
	public static function can_contribute( $user_id, $task_id ) {
		// Anyone who can read the task (based on map_meta_cap and membership) can contribute.
		return user_can( $user_id, 'read_workpress_task', $task_id );
	}

	/**
	 * Check if user can assign tasks.
	 *
	 * @param int $user_id User ID.
	 * @param int $task_id Post ID.
	 * @return bool
	 */
	public static function can_assign_task( $user_id, $task_id ) {
		// Only users who can edit the task can assign it.
		return user_can( $user_id, 'edit_workpress_task', $task_id );
	}

	/**
	 * Check if user can delete a task.
	 *
	 * @param int $user_id User ID.
	 * @param int $task_id Post ID.
	 * @return bool
	 */
	public static function can_delete_task( $user_id, $task_id ) {
		return self::can_edit_task( $user_id, $task_id );
	}

	/**
	 * Check if user can accept a solution for a task.
	 *
	 * @param int $user_id User ID.
	 * @param int $task_id Post ID.
	 * @return bool
	 */
	public static function can_accept_solution( $user_id, $task_id ) {
		if ( user_can( $user_id, 'accept_solutions' ) || user_can( $user_id, 'manage_options' ) ) {
			return true;
		}

		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			$task = get_post( $task_id );
			return $task ? (int) $task->post_author === (int) $user_id : false;
		}

		$project_id = $terms[0]->term_id;
		return WorkPress_Membership_Service::get_user_role( $project_id, $user_id ) === WorkPress_Membership_Service::ROLE_MANAGER;
	}
}
