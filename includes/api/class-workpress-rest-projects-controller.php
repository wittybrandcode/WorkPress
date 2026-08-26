<?php
/**
 * REST API Controller for Projects.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Projects_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'projects';
	}

	/**
	 * Register the routes for the objects of the controller.
	 */
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
				'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'get_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
				'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
			),
		) );
	}

	public function get_items_permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function get_items( $request ) {
		$args = array(
			'user_id' => get_current_user_id()
		);
		if ( $request->get_param( 'number' ) ) {
			$args['per_page'] = (int) $request->get_param( 'number' );
		}
		if ( $request->get_param( 'page' ) ) {
			$args['page'] = (int) $request->get_param( 'page' );
		}

		$result = WorkPress_Project_Service::get_projects( $args );
		
		$response = rest_ensure_response( $result['items'] );
		$response->header( 'X-WP-Total', $result['total'] );
		$response->header( 'X-WP-TotalPages', $result['total_pages'] );
		
		return $response;
	}

	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' ) || current_user_can( 'create_workpress_projects' );
	}

	public function create_item( $request ) {
		$name        = sanitize_text_field( $request->get_param( 'name' ) );
		$description = wp_kses_post( $request->get_param( 'description' ) );
		$prefix      = sanitize_text_field( $request->get_param( 'prefix' ) );
		$cover_id    = (int) $request->get_param( 'cover_id' );
		$status      = sanitize_key( $request->get_param( 'status' ) );
		$start_at    = sanitize_text_field( $request->get_param( 'start_at' ) );
		$due_at      = sanitize_text_field( $request->get_param( 'due_at' ) );

		if ( empty( $name ) ) {
			return new WP_Error( 'rest_missing_name', __( 'اسم المشروع مطلوب', 'workpress' ), array( 'status' => 400 ) );
		}

		$project = WorkPress_Project_Service::create_project( array(
			'name'        => $name,
			'description' => $description,
			'prefix'      => $prefix,
			'cover_id'    => $cover_id,
			'status'      => $status,
			'start_at'    => $start_at,
			'due_at'      => $due_at,
		) );

		if ( is_wp_error( $project ) ) {
			return $project;
		}

		return rest_ensure_response( $project );
	}

	public function get_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		$project_id = (int) $request['id'];
		return WorkPress_Permission_Service::can_view_project( get_current_user_id(), $project_id );
	}

	public function get_item( $request ) {
		$project_id = (int) $request['id'];
		$project    = WorkPress_Project_Service::get_project( $project_id );
		
		if ( is_wp_error( $project ) ) {
			return new WP_Error( 'rest_project_not_found', __( 'المشروع غير موجود', 'workpress' ), array( 'status' => 404 ) );
		}

		return rest_ensure_response( $project );
	}

	public function update_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		$project_id = (int) $request['id'];
		return WorkPress_Permission_Service::can_manage_project( get_current_user_id(), $project_id );
	}

	public function update_item( $request ) {
		$project_id  = (int) $request['id'];
		$existing    = WorkPress_Project_Service::get_project( $project_id );
		
		if ( is_wp_error( $existing ) ) {
			return $existing;
		}

		$name        = $request->has_param( 'name' ) ? sanitize_text_field( $request->get_param( 'name' ) ) : $existing['name'];
		$description = $request->has_param( 'description' ) ? wp_kses_post( $request->get_param( 'description' ) ) : $existing['description'];
		$prefix      = $request->has_param( 'prefix' ) ? sanitize_text_field( $request->get_param( 'prefix' ) ) : $existing['prefix'];
		$cover_id    = $request->has_param( 'cover_id' ) ? (int) $request->get_param( 'cover_id' ) : $existing['cover_id'];
		$status      = $request->has_param( 'status' ) ? sanitize_key( $request->get_param( 'status' ) ) : $existing['status'];
		$start_at    = $request->has_param( 'start_at' ) ? sanitize_text_field( $request->get_param( 'start_at' ) ) : $existing['start_at'];
		$due_at      = $request->has_param( 'due_at' ) ? sanitize_text_field( $request->get_param( 'due_at' ) ) : $existing['due_at'];

		if ( empty( $name ) ) {
			return new WP_Error( 'rest_missing_name', __( 'اسم المشروع مطلوب', 'workpress' ), array( 'status' => 400 ) );
		}

		$project = WorkPress_Project_Service::update_project( $project_id, array(
			'name'        => $name,
			'description' => $description,
			'prefix'      => $prefix,
			'cover_id'    => $cover_id,
			'status'      => $status,
			'start_at'    => $start_at,
			'due_at'      => $due_at,
		) );

		if ( is_wp_error( $project ) ) {
			return $project;
		}

		return rest_ensure_response( $project );
	}

	public function delete_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		// Only Admins can hard delete a project
		return current_user_can( 'manage_options' );
	}

	public function delete_item( $request ) {
		$project_id = (int) $request['id'];
		$result     = WorkPress_Project_Service::delete_project( $project_id );
		
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array( 'deleted' => true, 'previous' => $result ) );
	}

	public function get_item_schema() {
		return array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'workpress-project',
			'type'       => 'object',
			'properties' => array(
				'name' => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $param ) {
						return ! empty( $param );
					},
				),
				'prefix' => array(
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_key',
					'default'           => 'PRJ',
				),
				'status' => array(
					'type'              => 'string',
					'enum'              => array( 'active', 'on_hold', 'completed', 'archived' ),
					'default'           => 'active',
					'sanitize_callback' => 'sanitize_key',
				),
				'cover_id' => array(
					'type'    => 'integer',
					'default' => 0,
				),
			),
		);
	}
}
