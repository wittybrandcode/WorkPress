<?php
/**
 * WorkPress REST Report Controller.
 *
 * Exposes endpoints for Executive Sign-off Reports, Knowledge Books, and Analytics.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Report_Controller {

	/**
	 * Route namespace.
	 *
	 * @var string
	 */
	protected $namespace = 'workpress/v1';

	/**
	 * Register REST API routes.
	 */
	public function register_routes() {
		// 1. Get Project Executive Report Summary
		register_rest_route(
			$this->namespace,
			'/projects/(?P<id>[\d]+)/report',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_project_report' ),
				'permission_callback' => array( $this, 'check_project_access' ),
				'args'                => array(
					'id' => array(
						'validate_callback' => function( $param ) {
							return is_numeric( $param ) && (int) $param > 0;
						},
					),
				),
			)
		);

		// 2. Get Project Compiled Knowledge Book (.md)
		register_rest_route(
			$this->namespace,
			'/projects/(?P<id>[\d]+)/knowledge-book',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_knowledge_book' ),
				'permission_callback' => array( $this, 'check_project_access' ),
				'args'                => array(
					'id' => array(
						'validate_callback' => function( $param ) {
							return is_numeric( $param ) && (int) $param > 0;
						},
					),
				),
			)
		);

		// 3. Get Workspace-wide Analytics Overview
		register_rest_route(
			$this->namespace,
			'/analytics/overview',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_workspace_analytics' ),
				'permission_callback' => array( $this, 'check_authenticated' ),
			)
		);
	}

	/**
	 * Permission callback: Check if current user can access project data.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error True if authorized, WP_Error otherwise.
	 */
	public function check_project_access( $request ) {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول أولاً.', 'workpress' ), array( 'status' => 401 ) );
		}

		$user_id    = get_current_user_id();
		$project_id = (int) $request->get_param( 'id' );

		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}

		if ( WorkPress_Project_Service::user_can_access_project( $user_id, $project_id ) ) {
			return true;
		}

		return new WP_Error( 'rest_forbidden', __( 'ليس لديك صلاحية للاطلاع على تقارير هذا المشروع.', 'workpress' ), array( 'status' => 403 ) );
	}

	/**
	 * Permission callback: Check if user is logged in.
	 *
	 * @return bool|WP_Error
	 */
	public function check_authenticated() {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول أولاً.', 'workpress' ), array( 'status' => 401 ) );
		}
		return true;
	}

	/**
	 * Get executive project summary report.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_project_report( $request ) {
		$project_id = (int) $request->get_param( 'id' );
		$summary    = WorkPress_Report_Service::get_project_summary( $project_id );

		if ( is_wp_error( $summary ) ) {
			return $summary;
		}

		return rest_ensure_response( $summary );
	}

	/**
	 * Get compiled project knowledge book.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_knowledge_book( $request ) {
		$project_id = (int) $request->get_param( 'id' );
		$markdown   = WorkPress_Report_Service::generate_knowledge_book( $project_id );

		$project = WorkPress_Project_Service::get_project( $project_id );
		$filename = ! is_wp_error( $project ) && ! empty( $project['prefix'] ) 
			? 'knowledge-book-' . strtolower( $project['prefix'] ) . '.md' 
			: 'knowledge-book-project-' . $project_id . '.md';

		return rest_ensure_response( array(
			'project_id' => $project_id,
			'filename'   => $filename,
			'markdown'   => $markdown,
		) );
	}

	/**
	 * Get workspace-wide analytics overview.
	 *
	 * @return WP_REST_Response
	 */
	public function get_workspace_analytics() {
		$transient_key = 'wp_ws_analytics_summary';
		$cached = get_transient( $transient_key );

		if ( false === $cached ) {
			$cached = WorkPress_Report_Service::get_workspace_analytics();
			set_transient( $transient_key, $cached, 15 * MINUTE_IN_SECONDS );
		}

		return rest_ensure_response( $cached );
	}
}
