<?php
/**
 * REST API Controller for WorkPress Broadcasts & Operational Alerts.
 *
 * @package WorkPress
 * @subpackage API
 * @since 2.5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Broadcasts_Controller extends WP_REST_Controller {

	protected $namespace;
	protected $rest_base;

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'broadcasts';
	}

	public function register_routes() {
		// Live Ticker Stream (Dynamic Horizon Feed)
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/stream', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_stream' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
			),
		) );

		// Automated Alert Rules Config
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/rules', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_rules' ),
				'permission_callback' => array( $this, 'manage_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_rules' ),
				'permission_callback' => array( $this, 'manage_permissions_check' ),
			),
		) );

		// Broadcast Directives Collection (CRUD)
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_item' ),
				'permission_callback' => array( $this, 'manage_permissions_check' ),
			),
		) );

		// Single Broadcast Resource
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_item' ),
				'permission_callback' => array( $this, 'read_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'manage_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'manage_permissions_check' ),
			),
		) );
	}

	public function read_permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function manage_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		return current_user_can( 'manage_options' ) 
			|| current_user_can( 'manage_workpress_broadcasts' )
			|| current_user_can( 'manage_workpress_settings' );
	}

	/**
	 * Get live active ticker stream.
	 */
	public function get_stream( $request ) {
		$stream = WorkPress_Broadcast_Service::get_live_stream();
		return rest_ensure_response( $stream );
	}

	/**
	 * Get automated alert rules.
	 */
	public function get_rules( $request ) {
		$rules = WorkPress_Broadcast_Service::get_rules();
		return rest_ensure_response( $rules );
	}

	/**
	 * Update automated alert rules.
	 */
	public function update_rules( $request ) {
		$params  = $request->get_json_params() ?: $request->get_params();
		$updated = WorkPress_Broadcast_Service::update_rules( $params );
		return rest_ensure_response( $updated );
	}

	/**
	 * Get list of managerial broadcasts.
	 */
	public function get_items( $request ) {
		$args = array(
			'page'     => (int) $request->get_param( 'page' ) ?: 1,
			'number'   => (int) $request->get_param( 'per_page' ) ?: 50,
			'status'   => sanitize_key( $request->get_param( 'status' ) ?: 'all' ),
			'priority' => sanitize_key( $request->get_param( 'priority' ) ?: '' ),
			'search'   => sanitize_text_field( $request->get_param( 'search' ) ?: '' ),
		);

		$result   = WorkPress_Broadcast_Service::get_broadcasts( $args );
		$response = rest_ensure_response( $result['items'] );
		$response->header( 'X-WP-Total', (int) $result['total'] );
		$response->header( 'X-WP-TotalPages', (int) $result['total_pages'] );

		return $response;
	}

	/**
	 * Create a new broadcast.
	 */
	public function create_item( $request ) {
		$data = array(
			'title'      => sanitize_text_field( $request->get_param( 'title' ) ),
			'content'    => wp_kses_post( $request->get_param( 'content' ) ),
			'priority'   => sanitize_key( $request->get_param( 'priority' ) ?: 'info' ),
			'start_at'   => sanitize_text_field( $request->get_param( 'start_at' ) ?: '' ),
			'expires_at' => sanitize_text_field( $request->get_param( 'expires_at' ) ?: '' ),
			'action_url' => esc_url_raw( $request->get_param( 'action_url' ) ?: '' ),
		);

		$result = WorkPress_Broadcast_Service::create_broadcast( $data, get_current_user_id() );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return new WP_REST_Response( $result, 201 );
	}

	/**
	 * Get single broadcast details.
	 */
	public function get_item( $request ) {
		$id     = (int) $request['id'];
		$result = WorkPress_Broadcast_Service::get_broadcast( $id );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Update single broadcast.
	 */
	public function update_item( $request ) {
		$id   = (int) $request['id'];
		$data = array();

		if ( $request->has_param( 'title' ) ) {
			$data['title'] = sanitize_text_field( $request->get_param( 'title' ) );
		}
		if ( $request->has_param( 'content' ) ) {
			$data['content'] = wp_kses_post( $request->get_param( 'content' ) );
		}
		if ( $request->has_param( 'priority' ) ) {
			$data['priority'] = sanitize_key( $request->get_param( 'priority' ) );
		}
		if ( $request->has_param( 'start_at' ) ) {
			$data['start_at'] = sanitize_text_field( $request->get_param( 'start_at' ) );
		}
		if ( $request->has_param( 'expires_at' ) ) {
			$data['expires_at'] = sanitize_text_field( $request->get_param( 'expires_at' ) );
		}
		if ( $request->has_param( 'action_url' ) ) {
			$data['action_url'] = esc_url_raw( $request->get_param( 'action_url' ) );
		}
		if ( $request->has_param( 'is_archived' ) ) {
			$data['is_archived'] = rest_sanitize_boolean( $request->get_param( 'is_archived' ) );
		}

		$result = WorkPress_Broadcast_Service::update_broadcast( $id, $data );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Delete/archive broadcast.
	 */
	public function delete_item( $request ) {
		$id          = (int) $request['id'];
		$hard_delete = rest_sanitize_boolean( $request->get_param( 'force' ) );
		$result      = WorkPress_Broadcast_Service::delete_broadcast( $id, $hard_delete );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array( 'deleted' => true, 'id' => $id ) );
	}
}
