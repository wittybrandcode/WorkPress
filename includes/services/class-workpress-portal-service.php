<?php
/**
 * WorkPress Portal Service
 *
 * Handles routing, template interception, smart login redirection,
 * data isolation, and UI initialization for the Standalone Client Portal.
 *
 * Deliverables purification and digital signoff operations are delegated
 * to `WorkPress_Portal_Signoff_Service`.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 1.1.0
 * @version 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-workpress-portal-signoff-service.php';

class WorkPress_Portal_Service {

	/**
	 * Single instance.
	 *
	 * @var WorkPress_Portal_Service|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return WorkPress_Portal_Service
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'register_query_vars' ) );
		add_filter( 'template_include', array( $this, 'intercept_portal_template' ), 99 );
		add_filter( 'login_redirect', array( $this, 'handle_login_redirect' ), 10, 3 );
		add_shortcode( 'workpress_client_portal', array( $this, 'render_shortcode' ) );
		add_action( 'admin_init', array( $this, 'restrict_admin_access' ) );
		add_action( 'init', array( $this, 'hide_admin_bar_for_clients' ) );
	}

	/**
	 * Register Rewrite Rules for /portal/ endpoint.
	 */
	public function register_rewrite_rules() {
		add_rewrite_rule( '^portal/?$', 'index.php?workpress_client_portal=1', 'top' );

		// Auto-flush if rule is not in cached rewrite rules
		$rules = get_option( 'rewrite_rules' );
		if ( is_array( $rules ) && ! isset( $rules['^portal/?$'] ) ) {
			flush_rewrite_rules( false );
		}
	}

	/**
	 * Register custom query var.
	 *
	 * @param array $vars Query variables.
	 * @return array
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'workpress_client_portal';
		return $vars;
	}

	/**
	 * Check if current request matches the /portal/ URL (fail-safe).
	 *
	 * @return bool
	 */
	public static function is_portal_url() {
		if ( (int) get_query_var( 'workpress_client_portal' ) === 1 ) {
			return true;
		}
		if ( ! empty( $_SERVER['REQUEST_URI'] ) ) {
			$path = trim( (string) parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
			if ( $path === 'portal' || preg_match( '#(^|/)portal/?$#', $path ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Intercept template loading and serve standalone portal canvas with 0% CSS bleed.
	 *
	 * @param string $template Standard template file.
	 * @return string
	 */
	public function intercept_portal_template( $template ) {
		if ( self::is_portal_url() ) {
			$portal_template = WORKPRESS_PATH . 'templates/portal/index.php';
			if ( file_exists( $portal_template ) ) {
				return $portal_template;
			}
		}
		return $template;
	}

	/**
	 * Restrict wp-admin access for subscribers / clients and redirect to portal.
	 */
	public function restrict_admin_access() {
		if ( ( defined( 'DOING_AJAX' ) && DOING_AJAX ) || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}

		if ( ! is_user_logged_in() ) {
			return;
		}

		// If user cannot edit posts (i.e. Subscriber or Client), kick out of wp-admin
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_safe_redirect( home_url( '/portal/' ) );
			exit;
		}
	}

	/**
	 * Hide WordPress Admin Bar for Subscribers / Clients.
	 */
	public function hide_admin_bar_for_clients() {
		if ( is_user_logged_in() && ! current_user_can( 'edit_posts' ) ) {
			show_admin_bar( false );
		}
	}

	/**
	 * Handle smart login redirection based on user role and project memberships.
	 *
	 * @param string  $redirect_to           Default redirect URL.
	 * @param string  $requested_redirect_to Requested redirect URL.
	 * @param WP_User $user                  Logged in user object.
	 * @return string
	 */
	public function handle_login_redirect( $redirect_to, $requested_redirect_to, $user ) {
		if ( ! is_a( $user, 'WP_User' ) ) {
			return $redirect_to;
		}

		// 1. Administrators go to Admin CoWorkPress Plaza unless a specific URL was requested
		if ( in_array( 'administrator', (array) $user->roles, true ) ) {
			if ( empty( $requested_redirect_to ) || admin_url() === $requested_redirect_to ) {
				return admin_url( 'admin.php?page=workpress' );
			}
			return $redirect_to;
		}

		// 2. WorkPress Clients (Users with client capability or active project membership)
		if ( user_can( $user, WorkPress_Keys::CAP_ACCESS_PORTAL ) || in_array( WorkPress_Keys::ROLE_CLIENT, (array) $user->roles, true ) || self::user_has_any_projects( $user->ID ) ) {
			return home_url( '/portal/' );
		}

		// 3. Regular blog subscribers stay on the default site flow
		return $redirect_to;
	}

	/**
	 * Check if a user has any project membership in WorkPress.
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	public static function user_has_any_projects( $user_id ) {
		$projects = self::get_client_projects( $user_id );
		return ! empty( $projects );
	}

	/**
	 * Get projects for the authenticated client (Active/In-Progress/Completed).
	 *
	 * @param int $user_id User ID.
	 * @return array Array of formatted project data.
	 */
	public static function get_client_projects( $user_id ) {
		$user_id = absint( $user_id );
		if ( ! $user_id ) {
			return array();
		}

		// Administrators have global oversight
		$is_admin = user_can( $user_id, 'manage_options' );

		$args = array(
			'taxonomy'   => WorkPress_Keys::TAX_PROJECT,
			'hide_empty' => false,
		);

		if ( ! $is_admin ) {
			// Strict membership filter via Term Meta
			$args['meta_query'] = array(
				'relation' => 'OR',
				array(
					'key'     => '_workpress_member_' . $user_id,
					'compare' => 'EXISTS',
				),
				array(
					'key'     => WorkPress_Keys::META_LEAD_ID,
					'value'   => $user_id,
					'compare' => '=',
				),
				array(
					'key'     => '_workpress_client_id',
					'value'   => $user_id,
					'compare' => '=',
				),
			);
		}

		$terms = get_terms( $args );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		$projects = array();
		foreach ( $terms as $term ) {
			$project_id   = $term->term_id;
			$status       = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_STATUS, true ) ?: 'active';
			$is_req       = (bool) get_term_meta( $project_id, '_workpress_is_client_request', true );

			// Exclude pure pending requests from active projects tab
			if ( $is_req && 'pending' === $status ) {
				continue;
			}

			$lead_id      = absint( get_term_meta( $project_id, WorkPress_Keys::META_LEAD_ID, true ) );
			$lead_user    = $lead_id ? get_userdata( $lead_id ) : null;
			$progress     = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_PROGRESS, true );
			$due_at       = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_DUE_AT, true );
			$prefix       = get_term_meta( $project_id, WorkPress_Keys::META_PROJECT_PREFIX, true );
			$signoff      = (bool) get_term_meta( $project_id, '_workpress_client_signoff', true );
			$signoff_at   = get_term_meta( $project_id, '_workpress_client_signoff_at', true );

			$form_id      = get_term_meta( $project_id, '_workpress_request_form_id', true );
			$specs        = get_term_meta( $project_id, '_workpress_request_specs', true ) ?: array();
			$budget       = get_term_meta( $project_id, '_workpress_requested_budget', true );
			$due_date     = get_term_meta( $project_id, '_workpress_requested_due_date', true );
			$attachments  = get_term_meta( $project_id, '_workpress_request_attachments', true ) ?: array();
			$cover_id     = (int) get_term_meta( $project_id, '_workpress_cover_id', true );
			$cover_url    = $cover_id ? wp_get_attachment_url( $cover_id ) : '';
			$review_notes = get_term_meta( $project_id, '_workpress_review_notes', true ) ?: '';
			$rejection_rs = get_term_meta( $project_id, '_workpress_rejection_reason', true ) ?: '';

			$projects[] = array(
				'id'                  => $project_id,
				'name'                => $term->name,
				'slug'                => $term->slug,
				'description'         => $term->description,
				'prefix'              => $prefix ? $prefix : strtoupper( substr( $term->slug, 0, 4 ) ),
				'status'              => $status,
				'progress'            => is_numeric( $progress ) ? intval( $progress ) : 0,
				'due_at'              => $due_at ? $due_at : '',
				'is_signed_off'       => $signoff,
				'signed_off_at'       => $signoff_at,
				'is_client_request'   => $is_req,
				'request_form_id'     => $form_id ? $form_id : '',
				'request_specs'       => is_array( $specs ) ? $specs : array(),
				'requested_budget'    => $budget ? $budget : '',
				'requested_due_date'  => $due_date ? $due_date : '',
				'request_attachments' => is_array( $attachments ) ? $attachments : array(),
				'cover_id'            => $cover_id,
				'cover_url'           => $cover_url,
				'review_notes'        => $review_notes,
				'rejection_reason'    => $rejection_rs,
				'lead'                => array(
					'id'     => $lead_id,
					'name'   => $lead_user ? $lead_user->display_name : __( 'غير محدد', 'workpress' ),
					'avatar' => $lead_id ? get_avatar_url( $lead_id, array( 'size' => 64 ) ) : '',
				),
			);
		}

		return $projects;
	}

	/**
	 * Get client requests submitted by user (Pending / Under Review / Approved).
	 *
	 * @param int $user_id User ID.
	 * @return array Array of formatted request objects.
	 */
	public static function get_client_requests( $user_id ) {
		$user_id = absint( $user_id );
		if ( ! $user_id ) {
			return array();
		}

		$is_admin = user_can( $user_id, 'manage_options' );

		$args = array(
			'taxonomy'   => WorkPress_Keys::TAX_PROJECT,
			'hide_empty' => false,
		);

		if ( ! $is_admin ) {
			$args['meta_query'] = array(
				'relation' => 'AND',
				array(
					'key'     => '_workpress_is_client_request',
					'compare' => 'EXISTS',
				),
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_client_id',
						'value'   => array( $user_id, (string) $user_id ),
						'compare' => 'IN',
					),
					array(
						'key'     => '_workpress_member_' . $user_id,
						'compare' => 'EXISTS',
					),
				),
			);
		} else {
			$args['meta_query'] = array(
				array(
					'key'     => '_workpress_is_client_request',
					'compare' => 'EXISTS',
				),
			);
		}

		$terms = get_terms( $args );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array();
		}

		$requests = array();
		foreach ( $terms as $term ) {
			$pid          = $term->term_id;
			$status       = get_term_meta( $pid, WorkPress_Keys::META_PROJECT_STATUS, true ) ?: 'pending';
			$prefix       = get_term_meta( $pid, WorkPress_Keys::META_PROJECT_PREFIX, true ) ?: strtoupper( substr( $term->slug, 0, 4 ) );
			$form_id      = get_term_meta( $pid, '_workpress_request_form_id', true ) ?: 'standard_request';
			$specs        = get_term_meta( $pid, '_workpress_request_specs', true ) ?: array();
			$budget       = get_term_meta( $pid, '_workpress_requested_budget', true );
			$due_date     = get_term_meta( $pid, '_workpress_requested_due_date', true );
			$due_at       = get_term_meta( $pid, WorkPress_Keys::META_PROJECT_DUE_AT, true );
			$attachments  = get_term_meta( $pid, '_workpress_request_attachments', true ) ?: array();
			$client_id    = (int) get_term_meta( $pid, '_workpress_client_id', true );
			$client_user  = $client_id ? get_userdata( $client_id ) : null;
			$cover_id     = (int) get_term_meta( $pid, '_workpress_cover_id', true );
			$cover_url    = $cover_id ? wp_get_attachment_url( $cover_id ) : '';
			$review_notes = get_term_meta( $pid, '_workpress_review_notes', true ) ?: '';
			$rejection_rs = get_term_meta( $pid, '_workpress_rejection_reason', true ) ?: '';

			$current_step = 1;
			if ( 'pending' === $status ) {
				$current_step = 1;
			} elseif ( 'under_review' === $status ) {
				$current_step = 2;
			} elseif ( 'rejected' === $status ) {
				$current_step = 4;
			} elseif ( in_array( $status, array( 'active', 'in_progress', 'completed' ), true ) ) {
				$current_step = 3;
			}

			$requests[] = array(
				'id'                  => $pid,
				'name'                => $term->name,
				'prefix'              => $prefix,
				'description'         => $term->description,
				'status'              => $status,
				'form_id'             => $form_id,
				'request_form_id'     => $form_id,
				'specs'               => is_array( $specs ) ? $specs : array(),
				'request_specs'       => is_array( $specs ) ? $specs : array(),
				'budget'              => $budget ? $budget : '',
				'requested_budget'    => $budget ? $budget : '',
				'due_date'            => $due_date ? $due_date : '',
				'requested_due_date'  => $due_date ? $due_date : '',
				'due_at'              => $due_at ? $due_at : $due_date,
				'attachments'         => is_array( $attachments ) ? $attachments : array(),
				'request_attachments' => is_array( $attachments ) ? $attachments : array(),
				'client_id'           => $client_id,
				'client_name'         => $client_user ? $client_user->display_name : '',
				'cover_id'            => $cover_id,
				'cover_url'           => $cover_url,
				'review_notes'        => $review_notes,
				'rejection_reason'    => $rejection_rs,
				'current_step'        => $current_step,
				'is_client_request'   => true,
			);
		}

		return $requests;
	}

	/**
	 * Verify if a user is authorized to access a specific project (Principle #8).
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id    User ID.
	 * @return bool
	 */
	public static function can_user_access_project( $project_id, $user_id ) {
		$project_id = absint( $project_id );
		$user_id    = absint( $user_id );

		if ( ! $project_id || ! $user_id ) {
			return false;
		}

		// 1. Administrators and Technical Staff with project capabilities
		if ( user_can( $user_id, 'manage_options' ) || user_can( $user_id, 'edit_posts' ) || user_can( $user_id, 'read_workpress_projects' ) || user_can( $user_id, 'access_workpress_admin' ) ) {
			return true;
		}

		// 2. Project Lead
		$lead_id = absint( get_term_meta( $project_id, WorkPress_Keys::META_LEAD_ID, true ) );
		if ( $lead_id === $user_id ) {
			return true;
		}

		// 3. Client Stakeholder (by User ID)
		$client_id = absint( get_term_meta( $project_id, '_workpress_client_id', true ) );
		if ( $client_id === $user_id ) {
			return true;
		}

		// 4. Client Stakeholder (by Email matching user_email)
		$client_email = get_term_meta( $project_id, '_workpress_client_email', true );
		if ( $client_email ) {
			$user_data = get_userdata( $user_id );
			if ( $user_data && strtolower( trim( $user_data->user_email ) ) === strtolower( trim( $client_email ) ) ) {
				return true;
			}
		}

		// 5. Explicit Project Member
		$member_role = get_term_meta( $project_id, '_workpress_member_' . $user_id, true );
		if ( ! empty( $member_role ) ) {
			return true;
		}

		// 6. WorkPress Membership Service Check
		if ( class_exists( 'WorkPress_Membership_Service' ) && WorkPress_Membership_Service::can_user_view_project( $user_id, $project_id ) ) {
			return true;
		}

		// 7. Assigned Tasks Check (User is assigned to any work item within this project)
		$assigned_tasks = get_posts( array(
			'post_type'      => WorkPress_Keys::CPT_WORK_ITEM,
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'meta_query'     => array(
				array(
					'key'     => '_workpress_assignee_ids',
					'value'   => '"' . $user_id . '"',
					'compare' => 'LIKE',
				),
			),
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Keys::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_id,
				),
			),
		) );

		return ! empty( $assigned_tasks );
	}

	/**
	 * Get project milestones and tasks for client overview.
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id    User ID.
	 * @return array
	 */
	public static function get_project_milestones( $project_id, $user_id ) {
		if ( ! self::can_user_access_project( $project_id, $user_id ) ) {
			return array();
		}

		$task_posts = get_posts( array(
			'post_type'      => WorkPress_Keys::CPT_WORK_ITEM,
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Keys::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_id,
				),
			),
			'orderby'        => 'menu_order date',
			'order'          => 'ASC',
		) );

		$milestones = array();
		foreach ( $task_posts as $post ) {
			$task_id   = $post->ID;
			$status    = get_post_meta( $task_id, '_workpress_status', true ) ?: 'new';
			$priority  = get_post_meta( $task_id, '_workpress_priority', true ) ?: 'medium';
			$due_at    = get_post_meta( $task_id, '_workpress_due_at', true ) ?: '';
			$cover_id  = (int) get_post_meta( $task_id, '_workpress_cover_id', true );
			if ( ! $cover_id ) {
				$cover_id = (int) get_post_thumbnail_id( $task_id );
			}
			$cover_url = $cover_id ? wp_get_attachment_url( $cover_id ) : '';

			// Assignees
			$assignee_ids = get_post_meta( $task_id, '_workpress_assignee_ids', true );
			if ( empty( $assignee_ids ) ) {
				$assignee_ids = get_post_meta( $task_id, '_workpress_assignees', true );
			}
			$assignees = array();
			if ( is_array( $assignee_ids ) ) {
				foreach ( $assignee_ids as $uid ) {
					$u = get_userdata( (int) $uid );
					if ( $u ) {
						$assignees[] = array(
							'id'     => $u->ID,
							'name'   => $u->display_name,
							'avatar' => get_avatar_url( $u->ID, array( 'size' => 32 ) ),
						);
					}
				}
			}

			// Client-visible contributions for this task
			$comments = get_comments( array(
				'post_id'    => $task_id,
				'type'       => WorkPress_Keys::COMMENT_CONTRIBUTION,
				'status'     => 'approve',
				'orderby'    => 'comment_date',
				'order'      => 'ASC',
			) );

			$formatted_contribs = array();
			foreach ( $comments as $c ) {
				$vis = get_comment_meta( $c->comment_ID, '_workpress_visibility_scope', true );
				if ( 'internal' === $vis ) {
					continue;
				}
				$u = get_userdata( $c->user_id );
				$c_cover_id  = (int) get_comment_meta( $c->comment_ID, '_workpress_cover_id', true );
				$c_cover_url = $c_cover_id ? wp_get_attachment_url( $c_cover_id ) : '';

				$att_ids = get_comment_meta( $c->comment_ID, '_workpress_attachment_ids', true ) ?: get_comment_meta( $c->comment_ID, '_workpress_attachments', true );
				$attachments = array();
				if ( is_array( $att_ids ) ) {
					foreach ( $att_ids as $aid ) {
						if ( is_numeric( $aid ) && (int) $aid > 0 ) {
							$attachments[] = array(
								'id'   => (int) $aid,
								'name' => get_the_title( $aid ),
								'url'  => wp_get_attachment_url( $aid ),
							);
						} elseif ( is_array( $aid ) && ! empty( $aid['url'] ) ) {
							$attachments[] = $aid;
						}
					}
				}

				// Threaded comments on this contribution
				$threaded = self::get_deliverable_comments( $c->comment_ID, $user_id );

				$formatted_contribs[] = array(
					'id'            => (int) $c->comment_ID,
					'type'          => get_comment_meta( $c->comment_ID, '_workpress_contribution_type', true ) ?: 'comment',
					'content'       => $c->comment_content,
					'is_accepted'   => (bool) get_comment_meta( $c->comment_ID, '_workpress_is_accepted', true ),
					'created_at'    => $c->comment_date,
					'author_name'   => $u ? $u->display_name : $c->comment_author,
					'author_avatar' => get_avatar_url( $c->user_id, array( 'size' => 36 ) ),
					'cover_url'     => $c_cover_url,
					'attachments'   => $attachments,
					'comments'      => $threaded,
				);
			}

			$milestones[] = array(
				'id'            => (int) $task_id,
				'title'         => html_entity_decode( $post->post_title, ENT_QUOTES, 'UTF-8' ),
				'description'   => $post->post_content,
				'status'        => $status,
				'priority'      => $priority,
				'due_at'        => $due_at,
				'cover_url'     => $cover_url,
				'assignees'     => $assignees,
				'contributions' => $formatted_contribs,
			);
		}

		return $milestones;
	}

	/**
	 * Get real-time pulse data for portal UI.
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	public static function get_portal_pulse( $user_id ) {
		$user_id = absint( $user_id );
		if ( ! $user_id ) {
			return array();
		}

		$projects = self::get_client_projects( $user_id );
		$requests = self::get_client_requests( $user_id );

		// Unread notifications count and recent notification items
		$unread_count         = 0;
		$recent_notifications = array();
		if ( class_exists( 'WorkPress_Notification_DB' ) ) {
			$unread_count = WorkPress_Notification_DB::get_unread_count( $user_id );
			$raw_notes    = WorkPress_Notification_DB::get_user_notifications( $user_id, 10 );

			foreach ( $raw_notes as $n ) {
				$actor      = ! empty( $n['actor_id'] ) ? get_userdata( $n['actor_id'] ) : null;
				$actor_name = $actor ? $actor->display_name : __( 'الإدارة', 'workpress' );

				$task_title    = $n['task_id'] ? html_entity_decode( get_the_title( $n['task_id'] ), ENT_QUOTES, 'UTF-8' ) : '';
				$project_title = '';
				if ( ! empty( $n['project_id'] ) ) {
					$term = get_term( $n['project_id'] );
					if ( $term && ! is_wp_error( $term ) ) {
						$project_title = html_entity_decode( $term->name, ENT_QUOTES, 'UTF-8' );
					}
				}

				$msg = '';
				switch ( $n['type'] ) {
					case 'project_request_approved':
						$msg = sprintf( __( ' تم اعتماد طلبكم لمشروع "%s" وتدشينه رسمياً في المنظومة ', 'workpress' ), $project_title ?: __( 'المشروع', 'workpress' ) );
						break;
					case 'project_request_under_review':
						$rn  = ( ! empty( $n['project_id'] ) ) ? get_term_meta( $n['project_id'], '_workpress_review_notes', true ) : '';
						$msg = sprintf( __( ' طلبكم لمشروع "%1$s" قيد الدراسة الهندسية: %2$s', 'workpress' ), $project_title ?: __( 'المشروع', 'workpress' ), $rn ?: __( 'يجري الفحص الفني للجدوى', 'workpress' ) );
						break;
					case 'project_request_rejected':
						$rj  = ( ! empty( $n['project_id'] ) ) ? get_term_meta( $n['project_id'], '_workpress_rejection_reason', true ) : '';
						$msg = sprintf( __( ' تعذر اعتماد مشروع "%1$s". السبب: %2$s', 'workpress' ), $project_title ?: __( 'المشروع', 'workpress' ), $rj ?: __( 'خارج نطاق الخدمات المتاحة', 'workpress' ) );
						break;
					case 'contribution_created':
						$msg = sprintf( __( ' تم إيداع مخرج / مقترح جديد في مشروع "%s" بانتظار مراجعتكم.', 'workpress' ), $project_title ?: __( 'المشروع', 'workpress' ) );
						break;
					case 'contribution_accepted':
						$msg = sprintf( __( ' تم اعتماد الحل النهائي للمهمة: "%s"', 'workpress' ), $task_title ?: __( 'المهمة', 'workpress' ) );
						break;
					case 'project_request':
						$msg = sprintf( __( ' تم تقديم طلبكم لمشروع: "%s"', 'workpress' ), $project_title ?: __( 'المشروع', 'workpress' ) );
						break;
					default:
						$msg = sprintf( __( 'إشعار جديد بخصوص مشروع: %s', 'workpress' ), $project_title ?: __( 'مشاريعك', 'workpress' ) );
				}

				$recent_notifications[] = array(
					'id'         => (int) $n['id'],
					'type'       => $n['type'],
					'is_read'    => (bool) $n['is_read'],
					'message'    => $msg,
					'project_id' => (int) $n['project_id'],
					'created_at' => $n['created_at'],
					'actor_name' => $actor_name,
				);
			}
		}

		return array(
			'timestamp'             => current_time( 'mysql' ),
			'active_projects_count' => count( $projects ),
			'active_requests_count' => count( $requests ),
			'unread_notifications'  => $unread_count,
			'notifications'         => $recent_notifications,
		);
	}

	/**
	 * Mark client in-app notification as read.
	 *
	 * @param int $notification_id Notification DB ID.
	 * @param int $user_id         Client User ID.
	 * @return bool
	 */
	public static function mark_portal_notification_read( $notification_id, $user_id ) {
		if ( class_exists( 'WorkPress_Notification_DB' ) ) {
			return (bool) WorkPress_Notification_DB::mark_as_read( (int) $notification_id, (int) $user_id );
		}
		return false;
	}

	/**
	 * Mark all in-app notifications as read for client.
	 *
	 * @param int $user_id Client User ID.
	 * @return bool
	 */
	public static function mark_all_portal_notifications_read( $user_id ) {
		global $wpdb;
		if ( class_exists( 'WorkPress_Notification_DB' ) ) {
			$table = WorkPress_Notification_DB::get_table_name();
			return (bool) $wpdb->update(
				$table,
				array( 'is_read' => 1 ),
				array( 'user_id' => (int) $user_id ),
				array( '%d' ),
				array( '%d' )
			);
		}
		return false;
	}

	/**
	 * Get client notification channels & preferences.
	 *
	 * @param int $user_id User ID.
	 * @return array
	 */
	public static function get_client_channels( $user_id ) {
		$user_id = absint( $user_id );
		return array(
			'whatsapp'                => get_user_meta( $user_id, '_workpress_whatsapp_number', true ) ?: '',
			'telegram'                => get_user_meta( $user_id, '_workpress_telegram_chat_id', true ) ?: '',
			'webhook_url'             => get_user_meta( $user_id, '_workpress_webhook_url', true ) ?: '',
			'notify_on_milestone'     => (bool) get_user_meta( $user_id, '_workpress_notify_on_milestone', true ),
			'notify_on_deliverable'   => (bool) get_user_meta( $user_id, '_workpress_notify_on_deliverable', true ),
		);
	}

	/**
	 * Update client notification channels.
	 *
	 * @param int   $user_id User ID.
	 * @param array $data    Channels data.
	 * @return bool
	 */
	public static function update_client_channels( $user_id, $data ) {
		$user_id = absint( $user_id );
		if ( isset( $data['whatsapp'] ) ) {
			update_user_meta( $user_id, '_workpress_whatsapp_number', sanitize_text_field( $data['whatsapp'] ) );
		}
		if ( isset( $data['telegram'] ) ) {
			update_user_meta( $user_id, '_workpress_telegram_chat_id', sanitize_text_field( $data['telegram'] ) );
		}
		if ( isset( $data['webhook_url'] ) ) {
			update_user_meta( $user_id, '_workpress_webhook_url', esc_url_raw( $data['webhook_url'] ) );
		}
		if ( isset( $data['notify_on_milestone'] ) ) {
			update_user_meta( $user_id, '_workpress_notify_on_milestone', (bool) $data['notify_on_milestone'] );
		}
		if ( isset( $data['notify_on_deliverable'] ) ) {
			update_user_meta( $user_id, '_workpress_notify_on_deliverable', (bool) $data['notify_on_deliverable'] );
		}
		return true;
	}

	/**
	 * Update client profile details.
	 *
	 * @param int   $user_id User ID.
	 * @param array $data    Profile data.
	 * @return array|WP_Error
	 */
	public static function update_client_profile( $user_id, $data ) {
		$user_id = absint( $user_id );
		$args    = array( 'ID' => $user_id );

		if ( ! empty( $data['display_name'] ) ) {
			$args['display_name'] = sanitize_text_field( $data['display_name'] );
		}
		if ( ! empty( $data['email'] ) && is_email( $data['email'] ) ) {
			$args['user_email'] = sanitize_email( $data['email'] );
		}
		if ( ! empty( $data['password'] ) ) {
			$args['user_pass'] = $data['password'];
		}

		$result = wp_update_user( $args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$user = get_userdata( $user_id );
		return array(
			'id'           => $user->ID,
			'display_name' => $user->display_name,
			'email'        => $user->user_email,
		);
	}

	// ------------------------------------------------------------------------
	// Deliverables & Signoff Delegation Proxies (WorkPress_Portal_Signoff_Service)
	// ------------------------------------------------------------------------

	public static function get_project_candidate_deliverables( $project_id, $user_id ) {
		return WorkPress_Portal_Signoff_Service::get_project_candidate_deliverables( $project_id, $user_id );
	}

	public static function get_project_candidates( $project_id ) {
		return WorkPress_Portal_Signoff_Service::get_project_candidates( $project_id );
	}

	public static function get_project_deliverables( $project_id, $user_id ) {
		return WorkPress_Portal_Signoff_Service::get_project_deliverables( $project_id, $user_id );
	}

	public static function get_deliverable_comments( $deliverable_id, $user_id ) {
		return WorkPress_Portal_Signoff_Service::get_deliverable_comments( $deliverable_id, $user_id );
	}

	public static function add_deliverable_comment( $deliverable_id, $content_or_uid, $uid_or_content = null ) {
		// Handle signature variations safely: (id, user_id, content) or (id, content, user_id)
		if ( is_numeric( $content_or_uid ) ) {
			return WorkPress_Portal_Signoff_Service::add_deliverable_comment( $deliverable_id, (string) $uid_or_content, (int) $content_or_uid );
		}
		return WorkPress_Portal_Signoff_Service::add_deliverable_comment( $deliverable_id, (string) $content_or_uid, (int) $uid_or_content );
	}

	public static function client_accept_deliverable( $task_id, $comment_id = 0, $user_id = null ) {
		if ( null === $user_id ) {
			$user_id = get_current_user_id();
		}
		return WorkPress_Portal_Signoff_Service::client_accept_deliverable( $task_id, $comment_id, $user_id );
	}

	public static function client_project_signoff( $project_id, $user_id, $notes = '' ) {
		return WorkPress_Portal_Signoff_Service::client_project_signoff( $project_id, $user_id, $notes );
	}

	public static function signoff_project( $project_id, $user_id, $notes = '' ) {
		return WorkPress_Portal_Signoff_Service::signoff_project( $project_id, $user_id, $notes );
	}

	/**
	 * Render the [workpress_client_portal] shortcode.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string HTML output.
	 */
	public function render_shortcode( $atts = array() ) {
		wp_enqueue_style( 'dashicons' );
		$css_path = WORKPRESS_PATH . 'assets/css/portal.css';
		$css_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $css_path ) ? filemtime( $css_path ) : '1.2.0' );
		wp_enqueue_style( 'workpress-portal-css', WORKPRESS_URL . 'assets/css/portal.css', array( 'dashicons' ), $css_ver );

		wp_enqueue_script( 'preact', 'https://unpkg.com/preact@10.19.3/dist/preact.umd.js', array(), '10.19.3', true );
		wp_enqueue_script( 'htm', 'https://unpkg.com/htm@3.1.1/dist/htm.umd.js', array( 'preact' ), '3.1.1', true );

		$core_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-core.js';
		$core_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $core_js_path ) ? filemtime( $core_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-core-js', WORKPRESS_URL . 'assets/src/portal/portal-core.js', array( 'preact', 'htm' ), $core_js_ver, true );

		$login_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-login.js';
		$login_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $login_js_path ) ? filemtime( $login_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-login-js', WORKPRESS_URL . 'assets/src/portal/portal-login.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $login_js_ver, true );

		$header_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-header.js';
		$header_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $header_js_path ) ? filemtime( $header_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-header-js', WORKPRESS_URL . 'assets/src/portal/portal-header.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $header_js_ver, true );

		$gw_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-gateway.js';
		$gw_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $gw_js_path ) ? filemtime( $gw_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-gateway-js', WORKPRESS_URL . 'assets/src/portal/portal-gateway.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $gw_js_ver, true );

		$radar_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-radar.js';
		$radar_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $radar_js_path ) ? filemtime( $radar_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-radar-js', WORKPRESS_URL . 'assets/src/portal/portal-radar.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $radar_js_ver, true );

		$modals_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-modals.js';
		$modals_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $modals_js_path ) ? filemtime( $modals_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-modals-js', WORKPRESS_URL . 'assets/src/portal/portal-modals.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $modals_js_ver, true );

		$req_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-request.js';
		$req_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $req_js_path ) ? filemtime( $req_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-request-js', WORKPRESS_URL . 'assets/src/portal/portal-request.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $req_js_ver, true );

		$dash_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-dashboard.js';
		$dash_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $dash_js_path ) ? filemtime( $dash_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-dashboard-js', WORKPRESS_URL . 'assets/src/portal/portal-dashboard.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $dash_js_ver, true );

		$ws_js_path = WORKPRESS_PATH . 'assets/src/portal/portal-workspace.js';
		$ws_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $ws_js_path ) ? filemtime( $ws_js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-workspace-js', WORKPRESS_URL . 'assets/src/portal/portal-workspace.js', array( 'preact', 'htm', 'workpress-portal-core-js' ), $ws_js_ver, true );

		$js_path = WORKPRESS_PATH . 'assets/src/portal/portal-app.js';
		$js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $js_path ) ? filemtime( $js_path ) : '1.2.0' );
		wp_enqueue_script( 'workpress-portal-js', WORKPRESS_URL . 'assets/src/portal/portal-app.js', array( 'preact', 'htm', 'workpress-portal-core-js', 'workpress-portal-login-js', 'workpress-portal-header-js', 'workpress-portal-gateway-js', 'workpress-portal-radar-js', 'workpress-portal-modals-js', 'workpress-portal-request-js', 'workpress-portal-dashboard-js', 'workpress-portal-workspace-js' ), $js_ver, true );

		if ( class_exists( 'WorkPress_REST_Settings_Controller' ) ) {
			$logo_url    = WorkPress_REST_Settings_Controller::get_custom_logo_url();
			$favicon_url = WorkPress_REST_Settings_Controller::get_custom_favicon_url();
		} else {
			$logo_url    = WORKPRESS_URL . 'assets/brand/workpress.svg';
			$favicon_url = WORKPRESS_URL . 'assets/brand/favicon.svg';
		}
		$current_user   = wp_get_current_user();
		$is_logged_in   = is_user_logged_in();

		$can_access_portal = false;
		$executive_type    = 'subscriber';
		$role_label        = __( 'مشترك', 'workpress' );

		if ( $is_logged_in ) {
			if ( user_can( $current_user, 'manage_options' ) || in_array( 'administrator', (array) $current_user->roles, true ) ) {
				$executive_type    = 'admin';
				$role_label        = __( 'مدير عام', 'workpress' );
				$can_access_portal = true;
			} elseif ( in_array( 'workpress_client', (array) $current_user->roles, true ) || in_array( 'workpress_portal_user', (array) $current_user->roles, true ) || user_can( $current_user, 'access_workpress_portal' ) ) {
				$executive_type    = 'client';
				$role_label        = __( 'مستفيد', 'workpress' );
				$can_access_portal = true;
			} elseif ( in_array( 'editor', (array) $current_user->roles, true ) ) {
				$executive_type    = 'lead';
				$role_label        = __( 'قائد مشروع', 'workpress' );
				$can_access_portal = true;
			} elseif ( user_can( $current_user, 'edit_posts' ) || in_array( 'author', (array) $current_user->roles, true ) || in_array( 'contributor', (array) $current_user->roles, true ) ) {
				$executive_type    = 'member';
				$role_label        = __( 'منفذ فني', 'workpress' );
				$can_access_portal = true;
			} else {
				$executive_type    = 'subscriber';
				$role_label        = __( 'مشترك', 'workpress' );
				$can_access_portal = false;
			}
		}

		$portal_config = array(
			'apiUrl'          => rest_url( 'workpress/v1/portal' ),
			'restNonce'       => wp_create_nonce( 'wp_rest' ),
			'isLoggedIn'      => $is_logged_in,
			'canAccessPortal' => $can_access_portal,
			'intakeForms'     => get_option( 'workpress_intake_forms_schema', WorkPress_Project_Service::get_default_intake_forms_schema() ),
			'adminUrl'        => admin_url( 'admin.php?page=workpress#/' ),
			'executiveType'   => $executive_type,
			'roleLabel'       => $role_label,
			'user'            => array(
				'id'             => $is_logged_in ? $current_user->ID : 0,
				'display_name'   => $is_logged_in ? $current_user->display_name : '',
				'email'          => $is_logged_in ? $current_user->user_email : '',
				'roles'          => $is_logged_in ? (array) $current_user->roles : array(),
				'is_admin'       => $is_logged_in ? user_can( $current_user, 'manage_options' ) : false,
				'executive_type' => $executive_type,
				'role_label'     => $role_label,
			),
			'siteName'        => get_bloginfo( 'name' ),
			'siteUrl'         => home_url( '/' ),
			'logoUrl'         => $logo_url,
			'faviconUrl'      => $favicon_url,
			'customLogoUrl'   => get_option( 'workpress_custom_logo_url', '' ),
			'defaultLogoUrl'  => WORKPRESS_URL . 'assets/brand/workpress.svg',
			'defaultFaviconUrl' => WORKPRESS_URL . 'assets/brand/favicon.svg',
			'pluginUrl'       => WORKPRESS_URL,
		);

		wp_localize_script( 'workpress-portal-js', 'workpressPortalConfig', $portal_config );

		return '<div id="workpress-portal-root"><div class="portal-initial-loader"><div class="portal-spinner"></div><p>' . esc_html__( 'جاري تشغيل مساحة المشاريع...', 'workpress' ) . '</p></div></div>';
	}
}
