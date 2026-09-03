<?php
/**
 * WorkPress Portal Pulse, Radar, Feedback & Communications Handler
 *
 * Handles client feedback, executive radar metrics, live pulse streams, notification channels,
 * profile updates, and in-app notifications.
 *
 * @package WorkPress
 * @subpackage API/Portal
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Portal_Pulse_Handler {

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
			return new WP_Error( 'empty_feedback', __( 'Please enter feedback text, inquiry, or reason for revision request.', 'workpress' ), array( 'status' => 400 ) );
		}

		if ( empty( $message ) && 'client_signoff' === $action_type ) {
			$message = __( 'Deliverables and technical solutions officially approved and signed off by the stakeholder.', 'workpress' );
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

		$success_msg = __( 'Your feedback and inquiry were sent successfully to the team.', 'workpress' );
		if ( 'client_revision_request' === $action_type ) {
			$success_msg = __( 'The justified revision request was sent to the project lead.', 'workpress' );
		} elseif ( 'client_signoff' === $action_type ) {
			$success_msg = __( 'Your signature and sign-off for deliverables were recorded successfully.', 'workpress' );
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
		$role_label         = __( 'Client', 'workpress' );
		$scoped_project_ids = array();

		if ( $is_admin ) {
			$executive_type = 'admin';
			$role_label     = __( 'General Manager', 'workpress' );
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
				$role_label         = __( 'Project Lead', 'workpress' );
				$scoped_project_ids = wp_list_pluck( $lead_terms, 'term_id' );
			} elseif ( user_can( $user_id, 'edit_posts' ) || in_array( 'editor', (array) $current_user->roles, true ) || in_array( 'author', (array) $current_user->roles, true ) ) {
				$executive_type = 'member';
				$role_label     = __( 'Team Member', 'workpress' );
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
					'client_name'   => $c_user ? $c_user->display_name : __( 'Registered Client', 'workpress' ),
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
					'task_title'    => $task_post ? $task_post->post_title : __( 'Task', 'workpress' ),
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
						'title' => __( 'Request Triage Studio', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/requests' ),
						'badge' => $pending_req_count > 0 ? (string) $pending_req_count : null,
					),
					array(
						'title' => __( 'Project Management', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/projects' ),
						'badge' => $active_projects_count > 0 ? (string) $active_projects_count : null,
					),
					array(
						'title' => __( 'Kanban Board', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/kanban' ),
					),
					array(
						'title' => __( 'Intake Forms', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/forms' ),
					),
					array(
						'title' => __( 'Knowledge Base', 'workpress' ),
						'icon'  => '',
						'url'   => admin_url( 'admin.php?page=workpress#/knowledge' ),
					),
				),
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
		$pulse   = WorkPress_Portal_Service::get_portal_pulse( $user_id );

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
		$user_id  = get_current_user_id();
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
		$user_id       = get_current_user_id();
		$channels_data = $request->get_json_params();

		$result = WorkPress_Portal_Service::update_notification_channels( $user_id, $channels_data );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'message'  => __( 'Notification channel settings saved successfully.', 'workpress' ),
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
		$data    = $request->get_json_params();

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
				'message' => __( 'Profile updated successfully.', 'workpress' ),
				'profile' => $result,
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
