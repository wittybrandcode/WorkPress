<?php
/**
 * WorkPress Portal Projects & Deliverables Handler
 *
 * Handles client project retrieval, milestones, purified deliverables, proposal reviews,
 * comment threads, and digital signoff.
 *
 * @package WorkPress
 * @subpackage API/Portal
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Portal_Projects_Handler {

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
		$task_id    = (int) $request->get_param( 'id' );
		$params     = $request->get_json_params();
		$comment_id = isset( $params['comment_id'] ) ? (int) $params['comment_id'] : 0;
		$user_id    = get_current_user_id();

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
		$task_id  = (int) $request->get_param( 'id' );
		$user_id  = get_current_user_id();
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
}
