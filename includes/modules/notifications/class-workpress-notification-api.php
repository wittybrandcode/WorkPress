<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Notification_API extends WP_REST_Controller {

	public function register_routes() {
		$namespace = 'workpress/v1/notifications';

		register_rest_route( $namespace, '/user', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_notifications' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			),
		) );

		register_rest_route( $namespace, '/(?P<id>[\d]+)/read', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'mark_read' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			),
		) );
		
		register_rest_route( $namespace, '/read-all', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'mark_all_read' ),
				'permission_callback' => array( $this, 'permissions_check' ),
			),
		) );
	}

	public function permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function get_notifications( $request ) {
		$user_id = get_current_user_id();
		$limit = $request->get_param( 'limit' ) ? (int) $request->get_param( 'limit' ) : 20;
		
		$notifications = WorkPress_Notification_DB::get_user_notifications( $user_id, $limit );
		$unread_count  = WorkPress_Notification_DB::get_unread_count( $user_id );

		// Enrich each notification with actor data and generate message
		foreach ( $notifications as &$n ) {
			if ( ! empty( $n['actor_id'] ) ) {
				$actor = get_userdata( $n['actor_id'] );
				$n['actor_name']   = $actor ? $actor->display_name : __( 'Someone', 'workpress' );
				$n['actor_avatar'] = $actor ? get_avatar_url( $actor->ID, array( 'size' => 32 ) ) : '';
			} else {
				$n['actor_name']   = __( 'System', 'workpress' );
				$n['actor_avatar'] = '';
			}

			// Context info (clean decoded titles)
			$raw_task_title = $n['task_id'] ? get_the_title( $n['task_id'] ) : '';
			$task_title     = html_entity_decode( $raw_task_title, ENT_QUOTES, 'UTF-8' );
			$project_title  = '';
			if ( ! empty( $n['project_id'] ) ) {
				$term = get_term( $n['project_id'] );
				if ( $term && ! is_wp_error( $term ) ) {
					$project_title = html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' );
				}
			}
			
			// Generate message based on type
			switch ( $n['type'] ) {
				case 'task_assigned':
					$n['message'] = sprintf( __( 'You have been assigned to a new task: %s', 'workpress' ), $task_title );
					break;
				case 'task_unassigned':
					$n['message'] = sprintf( __( 'You have been unassigned from task: %s', 'workpress' ), $task_title );
					break;
				case 'task_state_changed':
					$n['message'] = sprintf( __( 'Task status changed: %s', 'workpress' ), $task_title );
					break;
				case 'task_reopened':
					$n['message'] = sprintf( __( 'Task reopened: %s', 'workpress' ), $task_title );
					break;
				case 'task_closed':
					$n['message'] = sprintf( __( 'Task closed: %s', 'workpress' ), $task_title );
					break;
				case 'contribution_created':
					$n['message'] = sprintf( __( '%1$s added a new contribution to task: %2$s', 'workpress' ), $n['actor_name'], $task_title );
					break;
				case 'contribution_comment':
					$n['message'] = sprintf( __( '%1$s commented on a contribution in task: %2$s', 'workpress' ), $n['actor_name'], $task_title );
					break;
				case 'contribution_accepted':
					$n['message'] = sprintf( __( 'Your contribution was approved as solution for task: %s', 'workpress' ), $task_title );
					break;
				case 'contribution_revoked':
					$n['message'] = sprintf( __( 'Your contribution approval was revoked for task: %s', 'workpress' ), $task_title );
					break;
				case 'member_added':
					$n['message'] = sprintf( __( 'You have been added to project: %s', 'workpress' ), $project_title );
					break;
				case 'member_removed':
					$n['message'] = sprintf( __( 'You have been removed from project: %s', 'workpress' ), $project_title );
					break;
				case 'project_permanently_deleted':
					$n['message'] = sprintf( __( 'Your project and its tasks have been permanently deleted: %s', 'workpress' ), $project_title ? $project_title : __( 'Deleted Project', 'workpress' ) );
					break;
				case 'deletion_requested':
					$reason = '';
					if ( $n['task_id'] ) {
						$reason = get_post_meta( $n['task_id'], '_workpress_trash_reason', true );
					} elseif ( $n['project_id'] ) {
						$reason = get_term_meta( $n['project_id'], '_workpress_trash_reason', true );
					}
					$reason = $reason ? $reason : __( 'Unspecified', 'workpress' );
					$entity_name = $task_title ? $task_title : ( $project_title ? $project_title : __( 'Item', 'workpress' ) );
					$n['message'] = sprintf( __( '<strong>Trash request:</strong> %1$s requests deletion of "%2$s". <br><strong>Reason:</strong> %3$s', 'workpress' ), $n['actor_name'], $entity_name, esc_html( $reason ) );
					break;
				case 'client_feedback':
					$n['message'] = sprintf( __( '<strong>Client inquiry:</strong> %1$s sent feedback about task: "%2$s"', 'workpress' ), $n['actor_name'], $task_title ? $task_title : __( 'Task', 'workpress' ) );
					break;
				case 'project_request':
					$n['message'] = sprintf( __( '<strong>New project request:</strong> Client %1$s submitted a new project request: "%2$s"', 'workpress' ), $n['actor_name'], $project_title ? $project_title : __( 'New Project', 'workpress' ) );
					break;
				case 'project_request_approved':
					$n['message'] = sprintf( __( '<strong>Request approved:</strong> Management has approved your project request "%s" and officially launched it in your workspace.', 'workpress' ), $project_title ? $project_title : __( 'Project', 'workpress' ) );
					break;
				case 'project_request_under_review':
					$review_notes = ( ! empty( $n['project_id'] ) ) ? get_term_meta( $n['project_id'], '_workpress_review_notes', true ) : '';
					$reason_str   = $review_notes ? sprintf( __( '<br><strong>Management note:</strong> %s', 'workpress' ), esc_html( $review_notes ) ) : '';
					$n['message'] = sprintf( __( '<strong>Request under review:</strong> Technical review is underway for project request "%1$s".%2$s', 'workpress' ), $project_title ? $project_title : __( 'Project', 'workpress' ), $reason_str );
					break;
				case 'project_request_rejected':
					$rejection_reason = ( ! empty( $n['project_id'] ) ) ? get_term_meta( $n['project_id'], '_workpress_rejection_reason', true ) : '';
					$reason_str       = $rejection_reason ? sprintf( __( '<br><strong>Rejection reason:</strong> %s', 'workpress' ), esc_html( $rejection_reason ) ) : '';
					$n['message']     = sprintf( __( '<strong>Request update:</strong> Project "%1$s" could not be approved.%2$s', 'workpress' ), $project_title ? $project_title : __( 'Project', 'workpress' ), $reason_str );
					break;
				default:
					$n['message'] = __( 'You have a new notification', 'workpress' );
			}
		}

		return rest_ensure_response( array(
			'items'        => $notifications,
			'unread_count' => $unread_count,
		) );
	}

	public function mark_read( $request ) {
		$id = (int) $request['id'];
		$user_id = get_current_user_id();
		
		$result = WorkPress_Notification_DB::mark_as_read( $id, $user_id );
		
		if ( false === $result ) {
			return new WP_Error( 'db_error', __( 'An error occurred while updating the notification', 'workpress' ), array( 'status' => 500 ) );
		}
		
		return rest_ensure_response( array( 'success' => true ) );
	}
	
	public function mark_all_read( $request ) {
		$user_id = get_current_user_id();
		global $wpdb;
		$table = WorkPress_Notification_DB::get_table_name();
		
		$wpdb->update(
			$table,
			array( 'is_read' => 1 ),
			array( 'user_id' => $user_id, 'is_read' => 0 ),
			array( '%d' ),
			array( '%d', '%d' )
		);
		
		return rest_ensure_response( array( 'success' => true ) );
	}
}
