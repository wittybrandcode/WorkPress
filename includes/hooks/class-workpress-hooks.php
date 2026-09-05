<?php
/**
 * WorkPress Hooks & Extension Points.
 *
 * This class serves as documentation and a centralized dispatcher for domain events.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Hooks {

	/**
	 * Fire when a task state changes.
	 *
	 * @param int    $task_id Post ID.
	 * @param string $old_status Old state.
	 * @param string $new_status New state.
	 * @param int    $user_id User who triggered the change.
	 */
	public static function fire_task_state_changed( $task_id, $old_status, $new_status, $user_id ) {
		do_action( 'workpress_task_state_changed', $task_id, $old_status, $new_status, $user_id );
	}

	/**
	 * Fire when a contribution is created.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $task_id Task ID.
	 * @param int $user_id User ID.
	 */
	public static function fire_contribution_created( $contribution_id, $task_id, $user_id ) {
		do_action( 'workpress_contribution_created', $contribution_id, $task_id, $user_id );
	}

	/**
	 * Fire when a contribution is accepted as a solution.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $task_id Task ID.
	 * @param int $user_id User ID.
	 */
	public static function fire_contribution_accepted( $contribution_id, $task_id, $user_id ) {
		do_action( 'workpress_contribution_accepted', $contribution_id, $task_id, $user_id );
	}

	/**
	 * Fire when a contribution is revoked from being a solution.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $task_id Task ID.
	 * @param int $user_id User ID.
	 */
	public static function fire_contribution_revoked( $contribution_id, $task_id, $user_id ) {
		do_action( 'workpress_contribution_revoked', $contribution_id, $task_id, $user_id );
	}

	/**
	 * Fire when users are assigned to a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $user_ids Array of User IDs.
	 * @param int   $assigner_id User performing assignment.
	 */
	public static function fire_task_assigned( $task_id, $user_ids, $assigner_id ) {
		do_action( 'workpress_task_assigned', $task_id, $user_ids, $assigner_id );
	}

	/**
	 * Fire when users are unassigned from a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $user_ids Array of User IDs.
	 * @param int   $assigner_id User performing unassignment.
	 */
	public static function fire_task_unassigned( $task_id, $user_ids, $assigner_id ) {
		do_action( 'workpress_task_unassigned', $task_id, $user_ids, $assigner_id );
	}

	/**
	 * Fire when a project membership changes.
	 *
	 * @param int    $project_id Project ID.
	 * @param int    $user_id User ID.
	 * @param string $role Member role.
	 */
	public static function fire_project_membership_changed( $project_id, $user_id, $role ) {
		do_action( 'workpress_project_membership_changed', $project_id, $user_id, $role );
	}

	/**
	 * Fire when a member is removed from a project.
	 *
	 * @param int $project_id Project ID.
	 * @param int $user_id User ID.
	 * @param int $remover_id User who performed the removal.
	 */
	public static function fire_project_member_removed( $project_id, $user_id, $remover_id ) {
		do_action( 'workpress_project_member_removed', $project_id, $user_id, $remover_id );
	}

	/**
	 * Fire when a task is closed (event distinct from general state change).
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User who closed it.
	 */
	public static function fire_task_closed( $task_id, $user_id ) {
		do_action( 'workpress_task_closed', $task_id, $user_id );
	}

	/**
	 * Fire when a task is reopened.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User who reopened it.
	 */
	public static function fire_task_reopened( $task_id, $user_id ) {
		do_action( 'workpress_task_reopened', $task_id, $user_id );
	}

	/**
	 * Fire when a task is created.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $task_data Task data.
	 * @param int   $user_id Author ID.
	 */
	public static function fire_task_created( $task_id, $task_data, $user_id ) {
		do_action( 'workpress_task_created', $task_id, $task_data, $user_id );
	}

	/**
	 * Fire when a task is deleted.
	 *
	 * @param int $task_id Task ID.
	 * @param int $user_id User ID performing deletion.
	 */
	public static function fire_task_deleted( $task_id, $user_id ) {
		do_action( 'workpress_task_deleted', $task_id, $user_id );
	}

	/**
	 * Fire when a project is deleted.
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id User ID performing deletion.
	 */
	public static function fire_project_deleted( $project_id, $user_id ) {
		do_action( 'workpress_project_deleted', $project_id, $user_id );
	}

	/**
	 * Fire when a project is 100% completed.
	 *
	 * @param int $project_id Term ID.
	 */
	public static function fire_project_completed( $project_id ) {
		do_action( 'workpress_project_completed', $project_id );
	}

	/**
	 * Fire when a completed project is reopened.
	 *
	 * @param int $project_id Term ID.
	 */
	public static function fire_project_reopened( $project_id ) {
		do_action( 'workpress_project_reopened', $project_id );
	}

	/**
	 * Fire when a project request is submitted by a client.
	 *
	 * @param int   $project_id     Term ID.
	 * @param int   $client_user_id Client User ID.
	 * @param array $specs          Request specifications payload.
	 */
	public static function fire_project_request_submitted( $project_id, $client_user_id, $specs = array() ) {
		do_action( 'workpress_project_request_submitted', $project_id, $client_user_id, $specs );
	}

	/**
	 * Fire when a project request is approved and activated.
	 *
	 * @param int $project_id Term ID.
	 * @param int $approver_id Approver User ID.
	 */
	public static function fire_project_request_approved( $project_id, $approver_id ) {
		do_action( 'workpress_project_request_approved', $project_id, $approver_id );
	}

	/**
	 * Fire when a project request is marked under review with study reason/notes.
	 *
	 * @param int    $project_id Term ID.
	 * @param int    $actor_id   Reviewer User ID.
	 * @param string $reason     Study / review explanation.
	 */
	public static function fire_project_request_under_review( $project_id, $actor_id, $reason = '' ) {
		do_action( 'workpress_project_request_under_review', $project_id, $actor_id, $reason );
	}

	/**
	 * Fire when a project request is rejected with justification.
	 *
	 * @param int    $project_id Term ID.
	 * @param int    $actor_id   Reviewer User ID.
	 * @param string $reason     Rejection justification.
	 */
	public static function fire_project_request_rejected( $project_id, $actor_id, $reason = '' ) {
		do_action( 'workpress_project_request_rejected', $project_id, $actor_id, $reason );
	}

	/**
	 * Fire when a broadcast notification is created.
	 *
	 * @param int   $broadcast_id Broadcast Post ID.
	 * @param array $data         Broadcast creation data.
	 * @param int   $user_id      Author / Creator User ID.
	 */
	public static function fire_broadcast_created( $broadcast_id, $data, $user_id ) {
		do_action( 'workpress_broadcast_created', $broadcast_id, $data, $user_id );
	}

	/**
	 * Fire when a broadcast notification is updated.
	 *
	 * @param int   $broadcast_id Broadcast Post ID.
	 * @param array $data         Updated attributes.
	 * @param int   $user_id      User who updated the broadcast.
	 */
	public static function fire_broadcast_updated( $broadcast_id, $data, $user_id ) {
		do_action( 'workpress_broadcast_updated', $broadcast_id, $data, $user_id );
	}

	/**
	 * Fire when a broadcast is deleted or archived.
	 *
	 * @param int  $broadcast_id Broadcast Post ID.
	 * @param bool $hard_delete  Whether it was permanently purged.
	 */
	public static function fire_broadcast_deleted( $broadcast_id, $hard_delete ) {
		do_action( 'workpress_broadcast_deleted', $broadcast_id, $hard_delete );
	}

	/**
	 * Filter task REST API response.
	 *
	 * @param array   $response Response array.
	 * @param WP_Post $post Task post object.
	 * @return array Modified response array.
	 */
	public static function filter_task_response( $response, $post ) {
		return apply_filters( 'workpress_prepare_task_response', $response, $post );
	}
}
