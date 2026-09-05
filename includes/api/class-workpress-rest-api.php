<?php
/**
 * WorkPress REST API Bootstrapper
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_API {

	/**
	 * Initialize the API by hooking into rest_api_init.
	 */
	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
	}

	/**
	 * Register all WorkPress REST API routes.
	 */
	public static function register_routes() {
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-projects-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-tasks-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-contributions-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-trash-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-members-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-knowledge-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-roles-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-settings-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-dev-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-export-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-portal-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-report-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-broadcasts-controller.php';
		require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-webhooks-controller.php';

		$projects_controller = new WorkPress_REST_Projects_Controller();
		$projects_controller->register_routes();

		$tasks_controller = new WorkPress_REST_Tasks_Controller();
		$tasks_controller->register_routes();

		$contributions_controller = new WorkPress_REST_Contributions_Controller();
		$contributions_controller->register_routes();

		$trash_controller = new WorkPress_REST_Trash_Controller();
		$trash_controller->register_routes();
		
		$members_controller = new WorkPress_REST_Members_Controller();
		$members_controller->register_routes();

		$knowledge_controller = new WorkPress_REST_Knowledge_Controller();
		$knowledge_controller->register_routes();

		$roles_controller = new WorkPress_REST_Roles_Controller();
		$roles_controller->register_routes();

		$settings_controller = new WorkPress_REST_Settings_Controller();
		$settings_controller->register_routes();

		$dev_controller = new WorkPress_REST_Dev_Controller();
		$dev_controller->register_routes();

		$export_controller = new WorkPress_REST_Export_Controller();
		$export_controller->register_routes();

		$portal_controller = new WorkPress_REST_Portal_Controller();
		$portal_controller->register_routes();

		$report_controller = new WorkPress_REST_Report_Controller();
		$report_controller->register_routes();

		$broadcasts_controller = new WorkPress_REST_Broadcasts_Controller();
		$broadcasts_controller->register_routes();

		$webhooks_controller = new WorkPress_REST_Webhooks_Controller();
		$webhooks_controller->register_routes();
	}
}
