<?php
/**
 * WorkPress REST Portal Controller
 *
 * Dedicated REST endpoints for the Standalone Client Portal.
 * Enforces strict membership isolation (Principle #8) and
 * output purification (Principle #11).
 *
 * @package WorkPress
 * @subpackage API
 * @since 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
					'callback'            => array( $this, 'get_my_projects' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_project' ),
					'permission_callback' => array( $this, 'check_project_access_permission' ),
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
					'callback'            => array( $this, 'get_project_milestones' ),
					'permission_callback' => array( $this, 'check_project_access_permission' ),
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
					'callback'            => array( $this, 'get_project_deliverables' ),
					'permission_callback' => array( $this, 'check_project_access_permission' ),
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
					'callback'            => array( $this, 'submit_feedback' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'submit_project_request' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'portal_login' ),
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
					'callback'            => array( $this, 'refresh_nonce' ),
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
					'callback'            => array( $this, 'get_intake_forms' ),
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
					'callback'            => array( $this, 'upload_attachment' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_radar_intelligence' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_my_requests' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_project_candidate_deliverables' ),
					'permission_callback' => array( $this, 'check_project_access_permission' ),
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
					'callback'            => array( $this, 'client_accept_deliverable' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_deliverable_comments' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'add_deliverable_comment' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_portal_pulse' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'get_client_channels' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_client_channels' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'update_client_profile' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'client_project_signoff' ),
					'permission_callback' => array( $this, 'check_project_access_permission' ),
				),
			)
		);

		// 20. Portal Notifications Stream
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_portal_notifications' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'mark_portal_notification_read' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/mark-read',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'mark_portal_notification_read' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
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
					'callback'            => array( $this, 'mark_all_portal_notifications_read' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/notifications/mark-all-read',
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'mark_all_portal_notifications_read' ),
					'permission_callback' => array( $this, 'check_logged_in_permission' ),
				),
			)
		);
	}

	/**
	 * Permission check: User must be logged in.
	 *
	 * @return bool|WP_Error
	 */
	public function check_logged_in_permission() {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول للوصول إلى بوابة المشاريع.', 'workpress' ), array( 'status' => 401 ) );
		}
		return true;
	}

	/**
	 * Permission check: User must have membership in the requested project.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function check_project_access_permission( $request ) {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول أولاً.', 'workpress' ), array( 'status' => 401 ) );
		}

		$project_id = absint( $request['id'] );
		$user_id    = get_current_user_id();

		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return new WP_Error( 'rest_forbidden_project', __( 'ليس لديك صلاحية للاطلاع على هذا المشروع.', 'workpress' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * Get projects for the authenticated client.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_my_projects( $request ) {
		$user_id  = get_current_user_id();
		$projects = WorkPress_Portal_Service::get_client_projects( $user_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'count'   => count( $projects ),
				'data'    => $projects,
			),
			200
		);
	}

	/**
	 * Get single project details.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get_project( $request ) {
		$project_id = absint( $request['id'] );
		$term       = get_term( $project_id, WorkPress_Keys::TAX_PROJECT );

		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'project_not_found', __( 'المشروع غير موجود.', 'workpress' ), array( 'status' => 404 ) );
		}

		$lead_id   = absint( get_term_meta( $project_id, WorkPress_Keys::META_LEAD_ID, true ) );
		$lead_user = $lead_id ? get_userdata( $lead_id ) : null;
		$progress  = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_PROGRESS, true );
		$status    = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_STATUS, true );
		$due_at    = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_DUE_AT, true );
		$prefix    = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_PREFIX, true );

		$project_data = array(
			'id'          => $project_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'description' => $term->description,
			'prefix'      => $prefix ? $prefix : strtoupper( substr( $term->slug, 0, 4 ) ),
			'status'      => $status ? $status : 'active',
			'progress'    => is_numeric( $progress ) ? intval( $progress ) : 0,
			'due_at'      => $due_at ? $due_at : '',
			'lead'        => array(
				'id'     => $lead_id,
				'name'   => $lead_user ? $lead_user->display_name : __( 'غير محدد', 'workpress' ),
				'avatar' => $lead_id ? get_avatar_url( $lead_id, array( 'size' => 64 ) ) : '',
			),
		);

		return new WP_REST_Response(
			array(
				'success' => true,
				'data'    => $project_data,
			),
			200
		);
	}

	/**
	 * Get project milestones and tasks.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_project_milestones( $request ) {
		$project_id = absint( $request['id'] );
		$user_id    = get_current_user_id();
		$milestones = WorkPress_Portal_Service::get_project_milestones( $project_id, $user_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'count'   => count( $milestones ),
				'data'    => $milestones,
			),
			200
		);
	}

	/**
	 * Get accepted deliverables for the project.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_project_deliverables( $request ) {
		$project_id   = absint( $request['id'] );
		$user_id      = get_current_user_id();
		$deliverables = WorkPress_Portal_Service::get_project_deliverables( $project_id, $user_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'count'   => count( $deliverables ),
				'data'    => $deliverables,
			),
			200
		);
	}

	/**
	 * Submit feedback / inquiry from the client.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function submit_feedback( $request ) {
		$task_id     = absint( $request->get_param( 'task_id' ) );
		$message     = sanitize_textarea_field( $request->get_param( 'message' ) );
		$action_type = sanitize_key( $request->get_param( 'action_type' ) ?: 'client_feedback' );

		$allowed_types = array( 'client_feedback', 'client_revision_request', 'client_signoff' );
		if ( ! in_array( $action_type, $allowed_types, true ) ) {
			$action_type = 'client_feedback';
		}

		if ( empty( $message ) && 'client_signoff' !== $action_type ) {
			return new WP_Error( 'empty_feedback', __( 'يرجى كتابة نص الملاحظة أو الاستفسار أو سبب طلب الاستدراك.', 'workpress' ), array( 'status' => 400 ) );
		}

		if ( empty( $message ) && 'client_signoff' === $action_type ) {
			$message = __( 'تم اعتماد ومصادقة استلام المخرجات والحلول الفنية رسمياً من قِبل المستفيد.', 'workpress' );
		}

		$user = wp_get_current_user();

		// Record feedback/signoff as an official immutable WorkPress task contribution (Evidence)
		$contrib = WorkPress_Contribution_Service::add_contribution( $task_id, $user->ID, $message, $action_type );
		if ( is_wp_error( $contrib ) ) {
			return $contrib;
		}

		$comment_id = ! empty( $contrib['id'] ) ? $contrib['id'] : 0;

		// Trigger notification hook for project lead & audit timeline
		do_action( 'workpress_client_feedback_submitted', $comment_id, $task_id, $user->ID, $action_type );

		$success_msg = __( 'تم إرسال ملاحظتك واستفسارك بنجاح لفريق العمل.', 'workpress' );
		if ( 'client_revision_request' === $action_type ) {
			$success_msg = __( 'تم إرسال طلب التعديل والاستدراك المسبب لمدير المشروع.', 'workpress' );
		} elseif ( 'client_signoff' === $action_type ) {
			$success_msg = __( 'تم تسجيل توقيعك والمصادقة على استلام المخرجات بنجاح.', 'workpress' );
		}

		return new WP_REST_Response(
			array(
				'success'      => true,
				'message'      => $success_msg,
				'comment_id'   => $comment_id,
				'contribution' => $contrib,
			),
			201
		);
	}

	/**
	 * Get Active Intake Forms Schema for Portal.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_intake_forms( $request ) {
		$schemas = get_option( 'workpress_intake_forms_schema', WorkPress_Project_Service::get_default_intake_forms_schema() );
		return rest_ensure_response(
			array(
				'success' => true,
				'forms'   => $schemas,
			)
		);
	}

	/**
	 * Submit a new project or service request.
	 *
	 * Creates a formal Project entity in taxonomy 'workpress_project' tagged as a client request.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function submit_project_request( $request ) {
		$title       = sanitize_text_field( $request->get_param( 'title' ) );
		$description = sanitize_textarea_field( $request->get_param( 'description' ) );
		$form_id     = sanitize_key( $request->get_param( 'form_id' ) ?: 'standard_request' );
		$budget      = sanitize_text_field( $request->get_param( 'budget' ) );
		$due_date    = sanitize_text_field( $request->get_param( 'due_date' ) );
		$raw_specs   = $request->get_param( 'specs' );

		if ( empty( $title ) ) {
			return new WP_Error( 'empty_title', __( 'يرجى إدخال عنوان أو اسم الطلب.', 'workpress' ), array( 'status' => 400 ) );
		}

		$user = wp_get_current_user();

		// Clean and sanitize specs payload
		$specs = array();
		if ( ! empty( $raw_specs ) && is_array( $raw_specs ) ) {
			foreach ( $raw_specs as $key => $val ) {
				$s_key = sanitize_text_field( $key );
				if ( is_array( $val ) ) {
					$specs[ $s_key ] = array_map( 'sanitize_text_field', $val );
				} else {
					$specs[ $s_key ] = sanitize_text_field( (string) $val );
				}
			}
		}

		// Create Project in Taxonomy 'workpress_project'
		$project = WorkPress_Project_Service::create_project( array(
			'name'        => $title,
			'description' => $description,
			'status'      => 'pending',
			'due_at'      => $due_date,
		) );

		if ( is_wp_error( $project ) ) {
			return $project;
		}

		$project_id = $project['id'];

		// Update Request Metadata
		update_term_meta( $project_id, '_workpress_is_client_request', 1 );
		update_term_meta( $project_id, '_workpress_client_id', $user->ID );
		update_term_meta( $project_id, '_workpress_request_form_id', $form_id );
		update_term_meta( $project_id, '_workpress_request_specs', $specs );
		if ( ! empty( $budget ) ) {
			update_term_meta( $project_id, '_workpress_requested_budget', $budget );
		}
		if ( ! empty( $due_date ) ) {
			update_term_meta( $project_id, '_workpress_requested_due_date', $due_date );
		}

		$raw_attachments = $request->get_param( 'attachments' );
		if ( ! empty( $raw_attachments ) && is_array( $raw_attachments ) ) {
			$attachments = array();
			foreach ( $raw_attachments as $att ) {
				if ( is_array( $att ) && ! empty( $att['id'] ) ) {
					$attachments[] = array(
						'id'   => (int) $att['id'],
						'name' => sanitize_text_field( $att['name'] ?? 'attachment' ),
						'url'  => esc_url_raw( $att['url'] ?? '' ),
						'size' => sanitize_text_field( $att['size'] ?? '' ),
					);
				}
			}
			if ( ! empty( $attachments ) ) {
				update_term_meta( $project_id, '_workpress_request_attachments', $attachments );
			}
		}

		// Assign current user as Client member
		WorkPress_Membership_Service::add_member( $project_id, $user->ID, 'client' );

		// Clear cache
		WorkPress_Project_Service::invalidate_project_cache( $project_id );

		// Notify Admin of new request
		do_action( 'workpress_project_request_submitted', $project_id, $user->ID, $specs );

		return new WP_REST_Response(
			array(
				'success'    => true,
				'message'    => __( 'تم تقديم طلب المشروع بنجاح وسيصل إشعار فوري لمدير المنظومة للمراجعة والتسعير ', 'workpress' ),
				'project_id' => $project_id,
				'project'    => WorkPress_Project_Service::get_project( $project_id ),
			),
			201
		);
	}

	/**
	 * AJAX Portal Login handler.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function portal_login( $request ) {
		$username = sanitize_user( $request->get_param( 'username' ) );
		$password = $request->get_param( 'password' );

		if ( empty( $username ) || empty( $password ) ) {
			return new WP_Error( 'missing_credentials', __( 'يرجى إدخال اسم المستخدم وكلمة المرور.', 'workpress' ), array( 'status' => 400 ) );
		}

		$credentials = array(
			'user_login'    => $username,
			'user_password' => $password,
			'remember'      => true,
		);

		$user = wp_signon( $credentials, is_ssl() );

		if ( is_wp_error( $user ) ) {
			return new WP_Error( 'invalid_credentials', __( 'بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة ثانية.', 'workpress' ), array( 'status' => 401 ) );
		}

		wp_set_current_user( $user->ID );

		$user_roles     = (array) $user->roles;
		$can_access     = false;
		$executive_type = 'subscriber';
		$role_label     = __( 'مشترك', 'workpress' );
		$redirect       = home_url( '/' );

		if ( in_array( 'administrator', $user_roles, true ) || user_can( $user, 'manage_options' ) ) {
			$executive_type = 'admin';
			$role_label     = __( 'مدير عام', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		} elseif ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'workpress_portal_user', $user_roles, true ) || user_can( $user, 'access_workpress_portal' ) ) {
			$executive_type = 'client';
			$role_label     = __( 'مستفيد', 'workpress' );
			$can_access     = true;
			$redirect       = home_url( '/portal/' );
		} elseif ( in_array( 'editor', $user_roles, true ) ) {
			$executive_type = 'lead';
			$role_label     = __( 'قائد مشروع', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		} elseif ( user_can( $user, 'edit_posts' ) || in_array( 'author', $user_roles, true ) || in_array( 'contributor', $user_roles, true ) ) {
			$executive_type = 'member';
			$role_label     = __( 'منفذ فني', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		}

		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = new WP_Roles();
		}
		$primary_slug = ! empty( $user_roles ) ? $user_roles[0] : 'subscriber';
		$role_name    = isset( $wp_roles->roles[ $primary_slug ]['name'] ) ? translate_user_role( $wp_roles->roles[ $primary_slug ]['name'] ) : $role_label;

		return new WP_REST_Response(
			array(
				'success'  => true,
				'user'     => array(
					'id'             => $user->ID,
					'display_name'   => $user->display_name,
					'email'          => $user->user_email,
					'avatar_url'     => get_avatar_url( $user->ID, array( 'size' => 128 ) ),
					'roles'          => $user_roles,
					'role_name'      => $role_name,
					'role_label'     => $role_label,
					'executive_type' => $executive_type,
					'can_access'     => $can_access,
					'is_admin'       => user_can( $user, 'manage_options' ),
				),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'redirect' => $redirect,
			),
			200
		);
	}

	/**
	 * Refresh and return a fresh REST nonce (Session Keep-Alive).
	 *
	 * @return WP_REST_Response
	 */
	public function refresh_nonce() {
		$is_logged_in = is_user_logged_in();
		$user         = wp_get_current_user();

		$user_data = null;
		if ( $is_logged_in ) {
			$user_roles     = (array) $user->roles;
			$executive_type = 'subscriber';
			$role_label     = __( 'مشترك', 'workpress' );
			$can_access     = false;

			if ( in_array( 'administrator', $user_roles, true ) || user_can( $user, 'manage_options' ) ) {
				$executive_type = 'admin';
				$role_label     = __( 'مدير عام', 'workpress' );
				$can_access     = true;
			} elseif ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'workpress_portal_user', $user_roles, true ) || user_can( $user, 'access_workpress_portal' ) ) {
				$executive_type = 'client';
				$role_label     = __( 'مستفيد', 'workpress' );
				$can_access     = true;
			} elseif ( in_array( 'editor', $user_roles, true ) ) {
				$executive_type = 'lead';
				$role_label     = __( 'قائد مشروع', 'workpress' );
				$can_access     = true;
			} elseif ( user_can( $user, 'edit_posts' ) || in_array( 'author', $user_roles, true ) || in_array( 'contributor', $user_roles, true ) ) {
				$executive_type = 'member';
				$role_label     = __( 'منفذ فني', 'workpress' );
				$can_access     = true;
			}

			global $wp_roles;
			if ( ! isset( $wp_roles ) ) {
				$wp_roles = new WP_Roles();
			}
			$primary_slug = ! empty( $user_roles ) ? $user_roles[0] : 'subscriber';
			$role_name    = isset( $wp_roles->roles[ $primary_slug ]['name'] ) ? translate_user_role( $wp_roles->roles[ $primary_slug ]['name'] ) : $role_label;

			$user_data = array(
				'id'             => $user->ID,
				'display_name'   => $user->display_name,
				'email'          => $user->user_email,
				'avatar_url'     => get_avatar_url( $user->ID, array( 'size' => 128 ) ),
				'roles'          => $user_roles,
				'role_name'      => $role_name,
				'role_label'     => $role_label,
				'executive_type' => $executive_type,
				'can_access'     => $can_access,
				'is_admin'       => user_can( $user, 'manage_options' ),
			);
		}

		return new WP_REST_Response(
			array(
				'success'    => true,
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'isLoggedIn' => $is_logged_in,
				'user'       => $user_data,
			),
			200
		);
	}

	/**
	 * Upload file attachment for intake form request.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function upload_attachment( $request ) {
		if ( empty( $_FILES['file'] ) ) {
			return new WP_Error( 'no_file', __( 'لم يتم إرسال أي ملف.', 'workpress' ), array( 'status' => 400 ) );
		}

		$uploaded = $_FILES['file'];
		$filename = sanitize_file_name( $uploaded['name'] );
		$ext      = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		$blocked  = array( 'php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'sh', 'bat', 'cmd', 'js', 'py', 'cgi', 'pl', 'asp', 'aspx', 'jsp', 'shtml' );

		if ( in_array( $ext, $blocked, true ) ) {
			return new WP_Error( 'blocked_file_type', __( 'عذراً، لا يُسمح برفع هذا النوع من الملفات لأسباب أمنية.', 'workpress' ), array( 'status' => 403 ) );
		}

		if ( ! empty( $uploaded['size'] ) && $uploaded['size'] > 25 * 1024 * 1024 ) {
			return new WP_Error( 'file_too_large', __( 'حجم الملف يتجاوز الحد الأقصى المسموح به (25 ميجابايت).', 'workpress' ), array( 'status' => 400 ) );
		}

		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_upload( 'file', 0 );

		if ( is_wp_error( $attachment_id ) ) {
			return $attachment_id;
		}

		$url  = wp_get_attachment_url( $attachment_id );
		$size = ! empty( $uploaded['size'] ) ? size_format( $uploaded['size'] ) : '';

		return new WP_REST_Response(
			array(
				'success' => true,
				'id'      => $attachment_id,
				'url'     => $url,
				'name'    => $filename,
				'size'    => $size,
			),
			200
		);
	}

	/**
	 * Get Role-Tailored Executive Portal Radar Intelligence.
	 *
	 * Returns real-time metrics, latest incoming client requests, and latest client feedback
	 * scoped to the executive user's specific tier (Admin, Project Lead, or Team Member).
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_radar_intelligence( $request ) {
		$user_id      = get_current_user_id();
		$current_user = wp_get_current_user();
		$is_admin     = user_can( $user_id, 'manage_options' ) || in_array( 'administrator', (array) $current_user->roles, true );

		// 1. Determine Executive Tier & Scope
		$executive_type     = 'client';
		$role_label         = __( 'عميل', 'workpress' );
		$scoped_project_ids = array();

		if ( $is_admin ) {
			$executive_type = 'admin';
			$role_label     = __( 'المدير العام', 'workpress' );
		} else {
			// Find projects led by this user
			$lead_terms = get_terms( array(
				'taxonomy'   => 'workpress_project',
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'   => '_workpress_lead_id',
						'value' => $user_id,
					),
				),
			) );

			if ( ! empty( $lead_terms ) && ! is_wp_error( $lead_terms ) ) {
				$executive_type     = 'lead';
				$role_label         = __( 'قائد مشروع', 'workpress' );
				$scoped_project_ids = wp_list_pluck( $lead_terms, 'term_id' );
			} elseif ( user_can( $user_id, 'edit_posts' ) || in_array( 'editor', (array) $current_user->roles, true ) || in_array( 'author', (array) $current_user->roles, true ) ) {
				$executive_type = 'member';
				$role_label     = __( 'عضو فريق العمل', 'workpress' );
			}
		}

		// 2. Fetch Latest Client Requests
		$req_args = array(
			'taxonomy'   => 'workpress_project',
			'hide_empty' => false,
			'number'     => 6,
			'orderby'    => 'id',
			'order'      => 'DESC',
			'meta_query' => array(
				array(
					'key'   => '_workpress_is_client_request',
					'value' => '1',
				),
			),
		);

		if ( 'lead' === $executive_type && ! empty( $scoped_project_ids ) ) {
			$req_args['include'] = $scoped_project_ids;
		}

		$request_terms   = get_terms( $req_args );
		$recent_requests = array();
		if ( ! empty( $request_terms ) && ! is_wp_error( $request_terms ) ) {
			foreach ( $request_terms as $t ) {
				$c_id   = (int) get_term_meta( $t->term_id, '_workpress_client_id', true );
				$c_user = $c_id > 0 ? get_userdata( $c_id ) : null;
				$status = get_term_meta( $t->term_id, '_workpress_status', true ) ?: 'pending';
				$prefix = get_term_meta( $t->term_id, '_workpress_prefix', true ) ?: 'PRJ';
				$budget = get_term_meta( $t->term_id, '_workpress_requested_budget', true );
				$due    = get_term_meta( $t->term_id, '_workpress_requested_due_date', true );
				$form   = get_term_meta( $t->term_id, '_workpress_request_form_id', true );

				$recent_requests[] = array(
					'id'            => $t->term_id,
					'name'          => $t->name,
					'prefix'        => $prefix,
					'status'        => $status,
					'form_id'       => $form,
					'budget'        => $budget,
					'due_date'      => $due,
					'client_name'   => $c_user ? $c_user->display_name : __( 'عميل مسجل', 'workpress' ),
					'client_email'  => $c_user ? $c_user->user_email : '',
					'client_avatar' => $c_id > 0 ? get_avatar_url( $c_id, array( 'size' => 48 ) ) : '',
					'workpress_url' => admin_url( 'admin.php?page=workpress#/requests' ),
				);
			}
		}

		// 3. Fetch Latest Client Feedback / Inquiries
		$fb_args = array(
			'post_type'  => 'workpress_task',
			'meta_key'   => '_workpress_type',
			'meta_value' => 'client_feedback',
			'number'     => 6,
			'status'     => 'approve',
			'orderby'    => 'comment_date_gmt',
			'order'      => 'DESC',
		);

		if ( 'lead' === $executive_type && ! empty( $scoped_project_ids ) ) {
			$fb_args['tax_query'] = array(
				array(
					'taxonomy' => 'workpress_project',
					'field'    => 'term_id',
					'terms'    => $scoped_project_ids,
				),
			);
		} elseif ( 'member' === $executive_type ) {
			// Find tasks assigned to this user
			$my_task_ids = get_posts( array(
				'post_type'      => 'workpress_task',
				'posts_per_page' => 100,
				'fields'         => 'ids',
				'meta_query'     => array(
					array(
						'key'     => '_workpress_assignees',
						'value'   => '"' . $user_id . '"',
						'compare' => 'LIKE',
					),
				),
			) );

			if ( ! empty( $my_task_ids ) ) {
				$fb_args['post__in'] = $my_task_ids;
			} else {
				$fb_args['post__in'] = array( 0 );
			}
		}

		$feedback_comments = get_comments( $fb_args );
		$recent_feedbacks   = array();

		if ( ! empty( $feedback_comments ) ) {
			foreach ( $feedback_comments as $c ) {
				$task_post = get_post( $c->comment_post_ID );
				$author_u  = $c->user_id > 0 ? get_userdata( $c->user_id ) : null;

				// Get Project Term for task
				$terms  = wp_get_post_terms( $c->comment_post_ID, 'workpress_project' );
				$p_term = ( ! empty( $terms ) && ! is_wp_error( $terms ) ) ? $terms[0] : null;

				$recent_feedbacks[] = array(
					'id'            => (int) $c->comment_ID,
					'task_id'       => (int) $c->comment_post_ID,
					'task_title'    => $task_post ? $task_post->post_title : __( 'مهمة', 'workpress' ),
					'project_id'    => $p_term ? $p_term->term_id : 0,
					'project_name'  => $p_term ? $p_term->name : '',
					'content'       => wp_trim_words( $c->comment_content, 20, '...' ),
					'author_name'   => $author_u ? $author_u->display_name : $c->comment_author,
					'author_avatar' => $c->user_id > 0 ? get_avatar_url( $c->user_id, array( 'size' => 48 ) ) : '',
					'created_at'    => $c->comment_date,
					'workpress_url' => admin_url( 'admin.php?page=workpress#/tasks/' . $c->comment_post_ID ),
				);
			}
		}

		// 4. Calculate Live Pulse Counters
		$pending_req_count = count( get_terms( array(
			'taxonomy'   => 'workpress_project',
			'hide_empty' => false,
			'fields'     => 'ids',
			'meta_query' => array(
				array(
					'key'   => '_workpress_is_client_request',
					'value' => '1',
				),
				array(
					'key'     => '_workpress_status',
					'value'   => array( 'pending', 'draft' ),
					'compare' => 'IN',
				),
			),
		) ) );

		$active_projects_count = count( get_terms( array(
			'taxonomy'   => 'workpress_project',
			'hide_empty' => false,
			'fields'     => 'ids',
			'meta_query' => array(
				array(
					'key'   => '_workpress_status',
					'value' => 'active',
				),
			),
		) ) );

		$total_clients_count = count( get_users( array(
			'role__in' => array( 'workpress_client', 'subscriber' ),
			'fields'   => 'ID',
		) ) );

		return new WP_REST_Response(
			array(
				'success'        => true,
				'executiveType'  => $executive_type,
				'roleLabel'      => $role_label,
				'counters'       => array(
					'pendingRequests' => $pending_req_count,
					'recentFeedbacks' => count( $recent_feedbacks ),
					'activeProjects'  => $active_projects_count,
					'totalClients'    => $total_clients_count,
				),
				'recentRequests' => $recent_requests,
				'recentFeedbacks'=> $recent_feedbacks,
				'quickLaunchers' => array(
					array(
						'title' => __( 'استوديو فرز الطلبات', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/requests' ),
						'badge' => $pending_req_count > 0 ? (string) $pending_req_count : null,
					),
					array(
						'title' => __( 'إدارة المشاريع', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/projects' ),
						'badge' => $active_projects_count > 0 ? (string) $active_projects_count : null,
					),
					array(
						'title' => __( 'لوحة الكانبان', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/kanban' ),
					),
					array(
						'title' => __( 'نماذج استقبال الطلبات', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/forms' ),
					),
					array(
						'title' => __( 'قاعدة المعرفة', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/knowledge' ),
					),
				),
			),
			200
		);
	}

	/**
	 * Get client requests stream.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_my_requests( $request ) {
		$user_id = get_current_user_id();
		$requests = WorkPress_Portal_Service::get_client_requests( $user_id );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'requests' => $requests,
			),
			200
		);
	}

	/**
	 * Get candidate deliverables / submissions for a project.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_project_candidate_deliverables( $request ) {
		$project_id = (int) $request->get_param( 'id' );
		$candidates = WorkPress_Portal_Service::get_project_candidates( $project_id );

		return new WP_REST_Response(
			array(
				'success'    => true,
				'candidates' => $candidates,
			),
			200
		);
	}

	/**
	 * Client accepts deliverable / proposal.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function client_accept_deliverable( $request ) {
		$task_id = (int) $request->get_param( 'id' );
		$params  = $request->get_json_params();
		$comment_id = isset( $params['comment_id'] ) ? (int) $params['comment_id'] : 0;
		$user_id = get_current_user_id();

		$result = WorkPress_Portal_Service::client_accept_deliverable( $task_id, $comment_id, $user_id );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => $result->get_error_message(),
				),
				400
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'تم قبول المخرج بنجاح!', 'workpress' ),
			),
			200
		);
	}

	/**
	 * Get review thread for deliverable.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_deliverable_comments( $request ) {
		$task_id = (int) $request->get_param( 'id' );
		$user_id = get_current_user_id();

		$comments = WorkPress_Portal_Service::get_deliverable_comments( $task_id, $user_id );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'comments' => $comments,
			),
			200
		);
	}

	/**
	 * Add comment/feedback to deliverable.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function add_deliverable_comment( $request ) {
		$task_id = (int) $request->get_param( 'id' );
		$params  = $request->get_json_params();
		$content = isset( $params['content'] ) ? sanitize_textarea_field( $params['content'] ) : '';
		$user_id = get_current_user_id();

		if ( empty( $content ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => __( 'نص التعليق مطلوب.', 'workpress' ),
				),
				400
			);
		}

		$result = WorkPress_Portal_Service::add_deliverable_comment( $task_id, $content, $user_id );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => $result->get_error_message(),
				),
				400
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'تم إرسال التعليق بنجاح.', 'workpress' ),
				'comment' => $result,
			),
			200
		);
	}

	/**
	 * Get live pulse data stream.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_portal_pulse( $request ) {
		$user_id = get_current_user_id();
		$pulse = WorkPress_Portal_Service::get_portal_pulse( $user_id );

		return new WP_REST_Response(
			array(
				'success' => true,
				'pulse'   => $pulse,
			),
			200
		);
	}

	/**
	 * Get notification channels configuration.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_client_channels( $request ) {
		$user_id = get_current_user_id();
		$channels = WorkPress_Portal_Service::get_notification_channels( $user_id );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'channels' => $channels,
			),
			200
		);
	}

	/**
	 * Update notification channels configuration.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function update_client_channels( $request ) {
		$user_id = get_current_user_id();
		$channels_data = $request->get_json_params();

		$result = WorkPress_Portal_Service::update_notification_channels( $user_id, $channels_data );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'message'  => __( 'تم حفظ إعدادات قنوات الإشعارات بنجاح.', 'workpress' ),
				'channels' => $result,
			),
			200
		);
	}

	/**
	 * Update client profile.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function update_client_profile( $request ) {
		$user_id = get_current_user_id();
		$data = $request->get_json_params();

		$result = WorkPress_Portal_Service::update_client_profile( $user_id, $data );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => $result->get_error_message(),
				),
				400
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'تم تحديث الملف التعريفي بنجاح.', 'workpress' ),
				'profile' => $result,
			),
			200
		);
	}

	/**
	 * Sign off and close project.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function client_project_signoff( $request ) {
		$project_id = (int) $request->get_param( 'id' );
		$user_id    = get_current_user_id();
		$params     = $request->get_json_params();
		$notes      = isset( $params['notes'] ) ? sanitize_textarea_field( $params['notes'] ) : '';

		$result = WorkPress_Portal_Service::signoff_project( $project_id, $user_id, $notes );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'message' => $result->get_error_message(),
				),
				400
			);
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'message' => __( 'تم اعتماد المشروع وإغلاقه بنجاح! شكراً لتعاونكم.', 'workpress' ),
			),
			200
		);
	}

	/**
	 * Get notifications for the portal client.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_portal_notifications( $request ) {
		$user_id = get_current_user_id();
		$pulse   = WorkPress_Portal_Service::get_portal_pulse( $user_id );

		return new WP_REST_Response(
			array(
				'success'       => true,
				'notifications' => $pulse['notifications'] ?? array(),
				'unread_count'  => $pulse['unread_notifications'] ?? 0,
			),
			200
		);
	}

	/**
	 * Mark a single portal notification as read.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function mark_portal_notification_read( $request ) {
		$user_id         = get_current_user_id();
		$params          = $request->get_json_params();
		$notification_id = isset( $request['id'] ) ? (int) $request['id'] : ( isset( $params['id'] ) ? (int) $params['id'] : 0 );

		$success = WorkPress_Portal_Service::mark_portal_notification_read( $notification_id, $user_id );

		return new WP_REST_Response(
			array(
				'success' => $success,
			),
			200
		);
	}

	/**
	 * Mark all portal notifications as read.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function mark_all_portal_notifications_read( $request ) {
		$user_id = get_current_user_id();
		$success = WorkPress_Portal_Service::mark_all_portal_notifications_read( $user_id );

		return new WP_REST_Response(
			array(
				'success' => $success,
			),
			200
		);
	}
}
