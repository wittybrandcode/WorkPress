<?php
/**
 * WorkPress REST Dev & Seeder Controller
 *
 * Exposes endpoints for seeding realistic corporate demo data and purging environments.
 *
 * @package WorkPress
 * @subpackage API
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Dev_Controller extends WP_REST_Controller {

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
	protected $rest_base = 'dev';

	/**
	 * Register routes.
	 */
	public function register_routes() {
		// POST /wp-json/workpress/v1/dev/seed
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/seed',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'seed_data' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				),
			)
		);

		// POST /wp-json/workpress/v1/dev/purge
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/purge',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'purge_data' ),
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
	 * Seed corporate demo data.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function seed_data( $request ) {
		if ( ! class_exists( 'WorkPress_Dev_Seeder' ) ) {
			return new WP_Error( 'seeder_missing', __( 'WorkPress_Dev_Seeder class not found', 'workpress' ), array( 'status' => 500 ) );
		}

		$result = WorkPress_Dev_Seeder::seed();
		return rest_ensure_response( $result );
	}

	/**
	 * Purge all demo seed data.
	 *
	 * @param WP_REST_Request $request
	 * @return WP_REST_Response
	 */
	public function purge_data( $request ) {
		if ( ! class_exists( 'WorkPress_Dev_Seeder' ) ) {
			return new WP_Error( 'seeder_missing', __( 'WorkPress_Dev_Seeder class not found', 'workpress' ), array( 'status' => 500 ) );
		}

		$result = WorkPress_Dev_Seeder::purge();
		return rest_ensure_response( $result );
	}
}
