<?php
/**
 * REST API Controller for Contributions.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Contributions_Controller extends WP_REST_Controller {

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'contributions';
	}

	public function register_routes() {
		// Task Contributions (Timeline & Add)
		register_rest_route( $this->namespace, '/tasks/(?P<task_id>[\d]+)/contributions', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_task_contributions' ),
				'permission_callback' => array( $this, 'get_task_contributions_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_task_contribution' ),
				'permission_callback' => array( $this, 'create_task_contribution_permissions_check' ),
			),
		) );

		// Global Contributions
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'update_item' ),
				'permission_callback' => array( $this, 'update_item_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_item' ),
				'permission_callback' => array( $this, 'delete_item_permissions_check' ),
			),
		) );

		// Manage Solutions (Accept / Revoke)
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/accept', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'accept_solution' ),
				'permission_callback' => array( $this, 'manage_solution_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/revoke', array(
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'revoke_solution' ),
				'permission_callback' => array( $this, 'manage_solution_permissions_check' ),
			),
		) );
		
		// Threaded Comments on Contributions
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/comments', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_comments' ),
				'permission_callback' => array( $this, 'get_comments_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_comment' ),
				'permission_callback' => array( $this, 'create_comment_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/(?P<id>[\d]+)/comments/(?P<comment_id>[\d]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_comment' ),
				'permission_callback' => array( $this, 'delete_comment_permissions_check' ),
			),
		) );

		// Contribution Types Registry (Principle 19: Domain Neutral)
		register_rest_route( $this->namespace, '/' . $this->rest_base . '/types', array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_types' ),
				'permission_callback' => array( $this, 'get_items_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_types' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/types/custom', array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create_custom_type' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			),
		) );

		register_rest_route( $this->namespace, '/' . $this->rest_base . '/types/custom/(?P<key>[a-zA-Z0-9_-]+)', array(
			array(
				'methods'             => WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_custom_type' ),
				'permission_callback' => array( $this, 'admin_permissions_check' ),
			),
		) );
	}

	public function admin_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function get_types( $request ) {
		$types = WorkPress_Contribution_Service::get_registered_types();
		return rest_ensure_response( $types );
	}

	public function update_types( $request ) {
		$types = $request->get_param( 'types' );
		if ( ! is_array( $types ) ) {
			return new WP_Error( 'invalid_data', __( 'Invalid data submitted.', 'workpress' ), array( 'status' => 400 ) );
		}
		WorkPress_Contribution_Service::save_custom_types( $types );
		return rest_ensure_response( WorkPress_Contribution_Service::get_registered_types() );
	}

	public function create_custom_type( $request ) {
		$key   = sanitize_key( $request->get_param( 'key' ) );
		$label = sanitize_text_field( $request->get_param( 'label' ) );
		$icon  = sanitize_html_class( $request->get_param( 'icon' ) ?: 'dashicons-admin-comments' );

		if ( empty( $key ) || empty( $label ) ) {
			return new WP_Error( 'missing_fields', __( 'Slug and label are required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$result = WorkPress_Contribution_Service::add_custom_type( $key, $label, $icon );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( WorkPress_Contribution_Service::get_registered_types() );
	}

	public function delete_custom_type( $request ) {
		$key = sanitize_key( $request['key'] );
		$result = WorkPress_Contribution_Service::delete_custom_type( $key );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return rest_ensure_response( array( 'deleted' => true, 'types' => WorkPress_Contribution_Service::get_registered_types() ) );
	}

	public function get_items_permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function get_items( $request ) {
		$args    = array();
		$user_id = get_current_user_id();

		if ( $request->get_param( 'project_id' ) ) {
			$project_id = (int) $request->get_param( 'project_id' );
			if ( ! WorkPress_Permission_Service::can_view_project( $user_id, $project_id ) ) {
				return new WP_Error( 'rest_forbidden', __( 'You are not authorized.', 'workpress' ), array( 'status' => 403 ) );
			}
			$args['project_id'] = $project_id;
		} else {
			if ( ! current_user_can( 'manage_options' ) ) {
				$visible_ids = WorkPress_Knowledge_Service::get_visible_project_ids( $user_id );
				if ( empty( $visible_ids ) ) {
					// Return empty if user has no visible projects
					$response = rest_ensure_response( array() );
					$response->header( 'X-WP-Total', 0 );
					return $response;
				}
				$args['project_ids'] = $visible_ids;
			}
		}

		if ( $request->get_param( 'user_id' ) ) {
			$args['user_id'] = (int) $request->get_param( 'user_id' );
		}
		if ( $request->get_param( 'task_id' ) ) {
			$args['task_id'] = (int) $request->get_param( 'task_id' );
		}
		if ( $request->get_param( 'type_in' ) ) {
			$type_in = $request->get_param( 'type_in' );
			$args['type_in'] = is_array( $type_in ) ? array_map( 'sanitize_key', $type_in ) : array_map( 'sanitize_key', explode( ',', $type_in ) );
		}
		if ( $request->get_param( 'type_not_in' ) ) {
			$type_not_in = $request->get_param( 'type_not_in' );
			$args['type_not_in'] = is_array( $type_not_in ) ? array_map( 'sanitize_key', $type_not_in ) : array_map( 'sanitize_key', explode( ',', $type_not_in ) );
		}
		if ( $request->get_param( 'search' ) ) {
			$args['search'] = sanitize_text_field( $request->get_param( 'search' ) );
		}
		if ( $request->get_param( 'is_accepted' ) !== null && $request->get_param( 'is_accepted' ) !== '' ) {
			$args['is_accepted'] = $request->get_param( 'is_accepted' );
		}
		if ( $request->get_param( 'number' ) ) {
			$args['number'] = (int) $request->get_param( 'number' );
		}
		
		$contributions = WorkPress_Contribution_Service::get_all_contributions( $args );
		
		$response = rest_ensure_response( $contributions );
		$response->header( 'X-WP-Total', count( $contributions ) );
		
		return $response;
	}

	public function get_task_contributions_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		
		$task = get_post( (int) $request['task_id'] );
		if ( ! $task ) return false;
		
		$terms = wp_get_object_terms( $task->ID, WorkPress_Install::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) return false;
		
		return WorkPress_Permission_Service::can_view_project( get_current_user_id(), $terms[0]->term_id );
	}

	public function get_task_contributions( $request ) {
		$task_id      = (int) $request['task_id'];
		$timeline = WorkPress_Contribution_Service::get_task_timeline( $task_id );
		
		$response = rest_ensure_response( $timeline );
		$response->header( 'X-WP-Total', count( $timeline ) );
		
		return $response;
	}

	public function create_task_contribution_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		
		$task = get_post( (int) $request['task_id'] );
		if ( ! $task ) return false;
		
		$terms = wp_get_object_terms( $task->ID, WorkPress_Install::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) return false;
		
		// Must be a member and have the capability, or be an admin
		$user_id = get_current_user_id();
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		
		if ( ! current_user_can( 'add_contributions' ) ) {
			return false;
		}
		
		return WorkPress_Membership_Service::is_member( $terms[0]->term_id, $user_id );
	}

	public function create_task_contribution( $request ) {
		$task_id     = (int) $request['task_id'];
		$content     = wp_kses_post( $request->get_param( 'content' ) );
		$type        = sanitize_key( $request->get_param( 'type' ) ?: 'implementation' );
		$payload     = $request->get_param( 'payload' ) ?: array();
		$raw_att     = $request->get_param( 'attachments' ) ?: $request->get_param( 'attachment_ids' );
		if ( empty( $raw_att ) && ! empty( $payload['attachments'] ) ) {
			$raw_att = $payload['attachments'];
		}
		$attachments = $raw_att ? array_map( 'intval', (array) $raw_att ) : array();

		if ( empty( $content ) && empty( $attachments ) && empty( $payload['cover_id'] ) ) {
			return new WP_Error( 'rest_missing_content', __( 'Content or attachments are required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$result = WorkPress_Contribution_Service::add_contribution( 
			$task_id, 
			get_current_user_id(), 
			$content, 
			$type, 
			$attachments, 
			is_array( $payload ) ? $payload : array() 
		);
		
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		
		return rest_ensure_response( $result );
	}

	public function manage_solution_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		
		$contribution_id = (int) $request['id'];
		$comment = get_comment( $contribution_id );
		if ( ! $comment ) return false;
		
		$terms = wp_get_object_terms( $comment->comment_post_ID, WorkPress_Install::TAX_PROJECT );
		$project_id = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		return WorkPress_Project_Service::is_user_lead( $project_id, get_current_user_id() );
	}

	public function accept_solution( $request ) {
		$contribution_id = (int) $request['id'];
		$result = WorkPress_Contribution_Service::accept_solution( $contribution_id, get_current_user_id() );
		
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		
		return rest_ensure_response( $result );
	}
	
	public function revoke_solution( $request ) {
		$contribution_id = (int) $request['id'];
		$result = WorkPress_Contribution_Service::revoke_solution( $contribution_id, get_current_user_id() );
		
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		
		return rest_ensure_response( $result );
	}
	
	public function update_item_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) return false;
		
		$contribution_id = (int) $request['id'];
		$comment = get_comment( $contribution_id );
		if ( ! $comment ) return false;
		
		// If restoring from pending trash, require manager permissions
		if ( $request->has_param( 'is_pending_trash' ) && ! $request->get_param( 'is_pending_trash' ) ) {
			if ( current_user_can( 'manage_options' ) ) return true;
			
			$terms = wp_get_object_terms( $comment->comment_post_ID, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$project_id = $terms[0]->term_id;
				return WorkPress_Membership_Service::get_user_role( $project_id, get_current_user_id() ) === WorkPress_Membership_Service::ROLE_MANAGER;
			}
		}
		
		return false;
	}

	public function update_item( $request ) {
		$contribution_id = (int) $request['id'];
		
		if ( $request->has_param( 'is_pending_trash' ) && ! $request->get_param( 'is_pending_trash' ) ) {
			$result = WorkPress_Contribution_Service::restore_from_trash( $contribution_id, get_current_user_id() );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
			return rest_ensure_response( $result );
		}
		
		$comment = get_comment( $contribution_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ), array( 'status' => 404 ) );
		}
		
		return rest_ensure_response( WorkPress_Contribution_Service::format_contribution_public( $comment ) );
	}

	public function delete_item_permissions_check( $request ) {
		return $this->update_item_permissions_check( $request );
	}

	public function delete_item( $request ) {
		$contribution_id = (int) $request['id'];
		$result = WorkPress_Contribution_Service::soft_delete( $contribution_id );
		
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		
		return rest_ensure_response( array( 'success' => true, 'message' => __( 'Contribution moved to trash.', 'workpress' ) ) );
	}

	/**
	 * Get comments for a contribution.
	 */
	public function get_comments( $request ) {
		$contribution_id = (int) $request['id'];
		$comments = WorkPress_Contribution_Service::get_comments_for_contribution( $contribution_id );
		return rest_ensure_response( $comments );
	}

	/**
	 * Create a comment on a contribution.
	 */
	public function create_comment( $request ) {
		$contribution_id = (int) $request['id'];
		$content = $request->get_param( 'content' );
		$user_id = get_current_user_id();

		if ( empty( $content ) ) {
			return new WP_Error( 'missing_content', __( 'Comment text is required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$result = WorkPress_Contribution_Service::add_comment_to_contribution( $contribution_id, $user_id, $content );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Delete a comment from a contribution.
	 */
	public function delete_comment( $request ) {
		$comment_id = (int) $request['comment_id'];
		$user_id = get_current_user_id();

		$result = WorkPress_Contribution_Service::delete_contribution_comment( $comment_id, $user_id );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( array( 'success' => true, 'deleted_id' => $comment_id ) );
	}

	/**
	 * Permission check for reading comments.
	 */
	public function get_comments_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		$contribution = get_comment( (int) $request['id'] );
		if ( ! $contribution ) {
			return false;
		}
		$task_id = (int) $contribution->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return true;
		}
		$project_id = (int) $terms[0]->term_id;
		return class_exists( 'WorkPress_Project_Service' ) ? WorkPress_Project_Service::user_can_access_project( get_current_user_id(), $project_id ) : true;
	}

	/**
	 * Permission check for creating comments.
	 */
	public function create_comment_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		$contribution = get_comment( (int) $request['id'] );
		if ( ! $contribution ) {
			return false;
		}
		$task_id = (int) $contribution->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return true;
		}
		$project_id = (int) $terms[0]->term_id;
		return class_exists( 'WorkPress_Project_Service' ) ? WorkPress_Project_Service::user_can_access_project( get_current_user_id(), $project_id ) : true;
	}

	/**
	 * Permission check for deleting comments.
	 */
	public function delete_comment_permissions_check( $request ) {
		if ( ! is_user_logged_in() ) {
			return false;
		}
		if ( current_user_can( 'manage_options' ) ) {
			return true;
		}
		$comment_id = (int) $request['comment_id'];
		$comment    = get_comment( $comment_id );
		if ( ! $comment || 'wp_contrib_reply' !== $comment->comment_type ) {
			return false;
		}
		$user_id = get_current_user_id();
		if ( (int) $comment->user_id === $user_id ) {
			return true;
		}
		$task_id = (int) $comment->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$project_id = (int) $terms[0]->term_id;
			return class_exists( 'WorkPress_Project_Service' ) && WorkPress_Project_Service::is_user_lead( $project_id, $user_id );
		}
		return false;
	}
}
