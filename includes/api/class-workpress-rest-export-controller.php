<?php
/**
 * WorkPress REST Export Controller
 *
 * Exposes endpoint for downloading complete JSON workspace backup.
 *
 * @package WorkPress
 * @subpackage API
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Export_Controller extends WP_REST_Controller {

	/**
	 * Namespace for API routes.
	 *
	 * @var string
	 */
	protected $namespace = 'workpress/v1';

	/**
	 * Rest Base.
	 *
	 * @var string
	 */
	protected $rest_base = 'export';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		// GET /wp-json/workpress/v1/export/all
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/all',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_export_data' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				),
			)
		);
	}

	/**
	 * Check admin permissions.
	 */
	public function check_admin_permissions() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get full export data.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function get_export_data( $request ) {
		if ( ! class_exists( 'WorkPress_Export_Service' ) ) {
			return new WP_Error( 'export_service_missing', __( 'WorkPress_Export_Service not found', 'workpress' ), array( 'status' => 500 ) );
		}

		$data = WorkPress_Export_Service::export_all();
		return rest_ensure_response( $data );
	}
}
