<?php
/**
 * REST API Controller for Project Members.
 *
 * Implements endpoints defined in ARCHITECTURE.md B.2.1.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Members_Controller extends WP_REST_Controller {

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'projects/(?P<project_id>[\d]+)/members';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'create_item_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<user_id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
			),
		) );
	}

	public function get_items_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		$project_id = (int) $request['project_id'];
		return WorkPress_Permission_Service::can_view_project( get_current_user_id(), $project_id );
	}

	public function get_items( $request ) {
		$project_id = (int) $request['project_id'];
		$members    = WorkPress_Membership_Service::get_members( $project_id );
		
		$response = rest_ensure_response( $members );
		$response->header( 'X-WP-Total', count( $members ) );
		$response->header( 'X-WP-TotalPages', 1 ); // Members usually don't need pagination for MVP
		
		return $response;
	}

	public function create_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		$project_id = (int) $request['project_id'];
		return WorkPress_Permission_Service::can_manage_project( get_current_user_id(), $project_id );
	}

	public function create_item( $request ) {
		$project_id = (int) $request['project_id'];
		$user_id    = (int) $request->get_param( 'user_id' );
		$role       = sanitize_key( $request->get_param( 'role' ) );

		if ( empty( $user_id ) || empty( $role ) ) {
			return new WP_Error( 'rest_missing_params', __( 'User ID and role are required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$success = WorkPress_Membership_Service::add_member( $project_id, $user_id, $role );
		if ( ! $success ) {
			return new WP_Error( 'rest_add_failed', __( 'Failed to add member.', 'workpress' ), array( 'status' => 500 ) );
		}

		$members = WorkPress_Membership_Service::get_members( $project_id );
		return rest_ensure_response( $members );
	}

	public function update_item_permissions_check( $request ) {
		return $this->create_item_permissions_check( $request );
	}

	public function update_item( $request ) {
		$project_id = (int) $request['project_id'];
		$user_id    = (int) $request['user_id'];
		$role       = sanitize_key( $request->get_param( 'role' ) );

		if ( empty( $role ) ) {
			return new WP_Error( 'rest_missing_role', __( 'Role is required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$success = WorkPress_Membership_Service::add_member( $project_id, $user_id, $role );
		if ( ! $success ) {
			return new WP_Error( 'rest_update_failed', __( 'Failed to update member.', 'workpress' ), array( 'status' => 500 ) );
		}

		$members = WorkPress_Membership_Service::get_members( $project_id );
		return rest_ensure_response( $members );
	}

	public function delete_item_permissions_check( $request ) {
		return $this->create_item_permissions_check( $request );
	}

	public function delete_item( $request ) {
		$project_id = (int) $request['project_id'];
		$user_id    = (int) $request['user_id'];

		$success = WorkPress_Membership_Service::remove_member( $project_id, $user_id );
		if ( ! $success ) {
			return new WP_Error( 'rest_delete_failed', __( 'Failed to remove member.', 'workpress' ), array( 'status' => 500 ) );
		}

		return rest_ensure_response( array( 'deleted' => true ) );
	}
}
