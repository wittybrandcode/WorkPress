<?php
/**
 * WorkPress REST Portal Controller (Modular Dispatcher)
 *
 * Dedicated REST endpoints for the Standalone Client Portal.
 * Enforces strict membership isolation (Principle #8) and
 * output purification (Principle #11).
 *
 * Dispatches requests cleanly to domain-specific handlers in `includes/api/portal/`.
 *
 * @package WorkPress
 * @subpackage API
 * @since 1.1.0
 * @version 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Load Domain Handlers
require_once __DIR__ . '/portal/class-workpress-portal-auth-handler.php';
require_once __DIR__ . '/portal/class-workpress-portal-requests-handler.php';
require_once __DIR__ . '/portal/class-workpress-portal-projects-handler.php';
require_once __DIR__ . '/portal/class-workpress-portal-pulse-handler.php';

class WorkPress_REST_Portal_Controller extends WP_REST_Controller {

	/**
	 * Namespace for the API.
	 *
	 * @var string
	 */
	protected $namespace = 'workpress/v1';

	/**
	 * Rest base for portal routes.
	 *
	 * @var string
	 */
	protected $rest_base = 'portal';

	/**
	 * Domain Handlers.
	 */
	protected $auth_handler;
	protected $requests_handler;
	protected $projects_handler;
	protected $pulse_handler;

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->auth_handler     = new WorkPress_Portal_Auth_Handler();
		$this->requests_handler = new WorkPress_Portal_Requests_Handler();
		$this->projects_handler = new WorkPress_Portal_Projects_Handler();
		$this->pulse_handler    = new WorkPress_Portal_Pulse_Handler();
	}

	/**
	 * Register all portal routes.
	 */
	public function register_routes() {
		// 1. Get Authorized Client Projects
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/my-projects',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_my_projects' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 2. Get Single Project Details
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_project' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 3. Get Project Milestones / Tasks (Read-only)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)/milestones',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_project_milestones' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 4. Get Purified Deliverables Only
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)/deliverables',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_project_deliverables' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 5. Submit Client Feedback / Inquiry
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/feedback',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'submit_feedback' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 6. Submit New Project / Service Request
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/request',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->requests_handler, 'submit_project_request' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 7. Portal AJAX Login Endpoint
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/login',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->auth_handler, 'portal_login' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		// 8. Refresh Nonce Endpoint (Session Keep-Alive)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/refresh-nonce',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->auth_handler, 'refresh_nonce' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		// 9. Get Active Intake Forms Schema
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/intake-forms',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->requests_handler, 'get_intake_forms' ),
					'permission_callback' => '__return_true',
				),
			)
		);

		// 10. Upload Request Attachment Endpoint
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/upload',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->requests_handler, 'upload_attachment' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 11. Role-Tailored Executive Portal Radar Intelligence
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/radar',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->pulse_handler, 'get_radar_intelligence' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 12. Client Requests Stream (Separated from active projects)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/my-requests',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->requests_handler, 'get_my_requests' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 13. Candidate Deliverables Review & Proposals
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)/candidates',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_project_candidate_deliverables' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 14. Client Accept Deliverable / Proposal
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/deliverables/(?P<id>\d+)/accept',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->projects_handler, 'client_accept_deliverable' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 15. Deliverable Review Thread & Revision Discussion
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/deliverables/(?P<id>\d+)/comments',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_deliverable_comments' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->projects_handler, 'add_deliverable_comment' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 16. Live Pulse Data Stream
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/pulse',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->pulse_handler, 'get_portal_pulse' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 17. Notification Channels & Communication Hub
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/channels',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->pulse_handler, 'get_client_channels' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'update_client_channels' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 18. Client Profile Update
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/profile',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'update_client_profile' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 19. Final Project Handover & Signoff
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)/signoff',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->projects_handler, 'client_project_signoff' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 20. Get Executive Project Summary Report (Handover Document)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/projects/(?P<id>\d+)/report',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->projects_handler, 'get_project_report' ),
					'permission_callback' => array( $this->auth_handler, 'check_project_access_permission' ),
				),
			)
		);

		// 21. Portal Notifications Stream
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this->pulse_handler, 'get_portal_notifications' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 21. Mark Notification as Read (Supports both URL param /:id/read and Body payload /mark-read)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/(?P<id>\d+)/read',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'mark_portal_notification_read' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/mark-read',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'mark_portal_notification_read' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		// 22. Mark All Notifications as Read (Supports /read-all and /mark-all-read)
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/read-all',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'mark_all_portal_notifications_read' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/mark-all-read',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this->pulse_handler, 'mark_all_portal_notifications_read' ),
					'permission_callback' => array( $this->auth_handler, 'check_logged_in_permission' ),
				),
			)
		);
	}

	// ------------------------------------------------------------------------
	// Backward-Compatibility Proxies
	// ------------------------------------------------------------------------

	public function check_logged_in_permission() {
		return $this->auth_handler->check_logged_in_permission();
	}

	public function check_project_access_permission( $request ) {
		return $this->auth_handler->check_project_access_permission( $request );
	}

	public function portal_login( $request ) {
		return $this->auth_handler->portal_login( $request );
	}

	public function refresh_nonce() {
		return $this->auth_handler->refresh_nonce();
	}

	public function get_my_projects( $request ) {
		return $this->projects_handler->get_my_projects( $request );
	}

	public function get_project( $request ) {
		return $this->projects_handler->get_project( $request );
	}

	public function get_project_milestones( $request ) {
		return $this->projects_handler->get_project_milestones( $request );
	}

	public function get_project_deliverables( $request ) {
		return $this->projects_handler->get_project_deliverables( $request );
	}

	public function get_project_candidate_deliverables( $request ) {
		return $this->projects_handler->get_project_candidate_deliverables( $request );
	}

	public function client_accept_deliverable( $request ) {
		return $this->projects_handler->client_accept_deliverable( $request );
	}

	public function get_deliverable_comments( $request ) {
		return $this->projects_handler->get_deliverable_comments( $request );
	}

	public function add_deliverable_comment( $request ) {
		return $this->projects_handler->add_deliverable_comment( $request );
	}

	public function client_project_signoff( $request ) {
		return $this->projects_handler->client_project_signoff( $request );
	}

	public function get_intake_forms( $request ) {
		return $this->requests_handler->get_intake_forms( $request );
	}

	public function upload_attachment( $request ) {
		return $this->requests_handler->upload_attachment( $request );
	}

	public function submit_project_request( $request ) {
		return $this->requests_handler->submit_project_request( $request );
	}

	public function get_my_requests( $request ) {
		return $this->requests_handler->get_my_requests( $request );
	}

	public function submit_feedback( $request ) {
		return $this->pulse_handler->submit_feedback( $request );
	}

	public function get_radar_intelligence( $request ) {
		return $this->pulse_handler->get_radar_intelligence( $request );
	}

	public function get_portal_pulse( $request ) {
		return $this->pulse_handler->get_portal_pulse( $request );
	}

	public function get_client_channels( $request ) {
		return $this->pulse_handler->get_client_channels( $request );
	}

	public function update_client_channels( $request ) {
		return $this->pulse_handler->update_client_channels( $request );
	}

	public function update_client_profile( $request ) {
		return $this->pulse_handler->update_client_profile( $request );
	}

	public function get_portal_notifications( $request ) {
		return $this->pulse_handler->get_portal_notifications( $request );
	}

	public function mark_portal_notification_read( $request ) {
		return $this->pulse_handler->mark_portal_notification_read( $request );
	}

	public function mark_all_portal_notifications_read( $request ) {
		return $this->pulse_handler->mark_all_portal_notifications_read( $request );
	}
}
