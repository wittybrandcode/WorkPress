<?php
/**
 * WorkPress Notification Service.
 *
 * Encapsulates domain logic for notifications and acts as the central router for sending alerts.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Notification_Service {

	/**
	 * Send a notification. This is the single entry point.
	 *
	 * @param int   $user_id Recipient user ID.
	 * @param array $args    Additional arguments (task_id, project_id, type, actor_id).
	 * @return int|false Notification ID on success, false otherwise.
	 */
	public static function notify( $user_id, $args = array() ) {
		$defaults = array(
			'task_id'    => 0,
			'project_id' => 0,
			'type'       => 'info',
			'actor_id'   => get_current_user_id(),
		);
		$args = wp_parse_args( $args, $defaults );

		// Do not notify a user about their own action
		if ( (int) $user_id === (int) $args['actor_id'] ) {
			return false;
		}

		// Infer project_id from task_id if not provided
		if ( ! $args['project_id'] && $args['task_id'] ) {
			$args['project_id'] = self::get_project_id_for_task( $args['task_id'] );
		}

		return WorkPress_Notification_DB::insert(
			$user_id,
			$args['task_id'],
			$args['type'],
			$args['actor_id'],
			$args['project_id']
		);
	}

	/**
	 * Send a notification to multiple users.
	 *
	 * @param array $user_ids Array of recipient user IDs.
	 * @param array $args     Additional arguments.
	 */
	public static function notify_many( $user_ids, $args = array() ) {
		foreach ( (array) $user_ids as $uid ) {
			self::notify( (int) $uid, $args );
		}
	}

	/**
	 * Helper: Get project ID for a task.
	 *
	 * @param int $task_id Task Post ID.
	 * @return int Project Term ID or 0.
	 */
	public static function get_project_id_for_task( $task_id ) {
		$terms = wp_get_object_terms( (int) $task_id, WorkPress_Install::TAX_PROJECT, array( 'fields' => 'ids' ) );
		return ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0] : 0;
	}
}
