<?php
/**
 * REST API Controller for Knowledge Base.
 *
 * Implements endpoints defined in ARCHITECTURE.md B.2.5.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Knowledge_Controller extends WP_REST_Controller {

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'knowledge';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
		) );
	}

	public function get_items_permissions_check( $request ) {
		return is_user_logged_in(); // KnowledgeService handles visibility filtering internally
	}

	public function get_items( $request ) {
		$project_id = (int) $request->get_param( 'project_id' );
		$search     = sanitize_text_field( $request->get_param( 'search' ) );
		$per_page   = (int) $request->get_param( 'per_page' ) ?: 20;
		$page       = (int) $request->get_param( 'page' ) ?: 1;

		$result = WorkPress_Knowledge_Service::query( get_current_user_id(), $project_id, $search, $per_page, $page );

		$response = rest_ensure_response( $result['items'] );
		$response->header( 'X-WP-Total', $result['total'] );
		$response->header( 'X-WP-TotalPages', (int) ceil( $result['total'] / $per_page ) );
		
		return $response;
	}
}
