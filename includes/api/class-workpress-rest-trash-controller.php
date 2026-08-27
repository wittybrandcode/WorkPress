<?php
/**
 * REST API Controller for Smart Deletion (Trash Request).
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Trash_Controller extends WP_REST_Controller {

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'trash';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/request', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'request_deletion' ),
				'permission_callback' => array( $this, 'permissions_check' ),
				'args'                => array(
					'entity_type' => array(
						'required'          => true,
						'type'              => 'string',
						'enum'              => array( 'project', 'task', 'contribution' ),
						'sanitize_callback' => 'sanitize_key',
					),
					'entity_id'   => array(
						'required'          => true,
						'type'              => 'integer',
					),
					'reason'      => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_textarea_field',
					),
				),
			),
		) );
	}

	public function permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function request_deletion( $request ) {
		$entity_type = $request->get_param( 'entity_type' );
		$entity_id   = (int) $request->get_param( 'entity_id' );
		$reason      = sanitize_textarea_field( $request->get_param( 'reason' ) );
		$user_id     = get_current_user_id();

		if ( empty( $reason ) ) {
			return new WP_Error( 'missing_reason', __( 'سبب الحذف مطلوب', 'workpress' ), array( 'status' => 400 ) );
		}

		$can_delete = false;
		switch ( $entity_type ) {
			case 'project':
				$can_delete = WorkPress_Permission_Service::can_manage_project( $user_id, $entity_id );
				break;
			case 'task':
				$can_delete = WorkPress_Permission_Service::can_edit_task( $user_id, $entity_id );
				break;
			case 'contribution':
				$comment = get_comment( $entity_id );
				if ( $comment ) {
					$can_delete = (int) $comment->user_id === $user_id || WorkPress_Permission_Service::can_edit_task( $user_id, $comment->comment_post_ID );
				}
				break;
		}

		if ( ! $can_delete ) {
			return new WP_Error( 'rest_forbidden', __( 'عذراً، لا تملك صلاحية لطلب حذف هذا العنصر.', 'workpress' ), array( 'status' => 403 ) );
		}

		$project_id = 0;

		switch ( $entity_type ) {
			case 'project':
				$result = WorkPress_Project_Service::trash_request( $entity_id, $reason, $user_id );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$project_id = $entity_id;
				break;

			case 'task':
				$result = WorkPress_Task_Service::trash_request( $entity_id, $reason, $user_id );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$terms = wp_get_post_terms( $entity_id, 'workpress_project' );
				if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
					$project_id = $terms[0]->term_id;
				}
				break;

			case 'contribution':
				$result = WorkPress_Contribution_Service::trash_request( $entity_id, $reason, $user_id );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$comment = get_comment( $entity_id );
				if ( $comment ) {
					$terms = wp_get_post_terms( $comment->comment_post_ID, 'workpress_project' );
					if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
						$project_id = $terms[0]->term_id;
					}
				}
				break;
		}

		// Notify all admins
		$admins = get_users( array( 'role' => 'administrator', 'fields' => 'ID' ) );
		if ( ! empty( $admins ) ) {
			WorkPress_Notification_Service::notify_many( $admins, array(
				'type'       => 'deletion_requested',
				'task_id'    => $entity_type === 'task' ? $entity_id : ( ( $entity_type === 'contribution' && ! empty( $comment ) ) ? (int) $comment->comment_post_ID : 0 ),
				'project_id' => $project_id,
				'actor_id'   => $user_id,
				// We pass reason indirectly, or API will reconstruct it. 
				// Actually, since Notification API reconstructs it, we can fetch the meta in Notification API.
			) );
		}

		return rest_ensure_response( array(
			'success' => true,
			'message' => __( 'تم تقديم طلب الحذف بنجاح', 'workpress' ),
		) );
	}
}
