<?php
/**
 * WorkPress Portal Requests & Intake Forms Handler
 *
 * Handles client service requests, intake form schemas, uploads, and request streams.
 *
 * @package WorkPress
 * @subpackage API/Portal
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Portal_Requests_Handler {

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
	 * Upload file attachment for intake form request.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function upload_attachment( $request ) {
		if ( empty( $_FILES['file'] ) ) {
			return new WP_Error( 'no_file', __( 'No file was uploaded.', 'workpress' ), array( 'status' => 400 ) );
		}

		$uploaded = $_FILES['file'];
		$filename = sanitize_file_name( $uploaded['name'] );
		$ext      = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );
		$blocked  = array( 'php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'sh', 'bat', 'cmd', 'js', 'py', 'cgi', 'pl', 'asp', 'aspx', 'jsp', 'shtml' );

		if ( in_array( $ext, $blocked, true ) ) {
			return new WP_Error( 'blocked_file_type', __( 'Sorry, uploading this file type is not permitted for security reasons.', 'workpress' ), array( 'status' => 403 ) );
		}

		if ( ! empty( $uploaded['size'] ) && $uploaded['size'] > 25 * 1024 * 1024 ) {
			return new WP_Error( 'file_too_large', __( 'File size exceeds the maximum limit of 25MB.', 'workpress' ), array( 'status' => 400 ) );
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
			return new WP_Error( 'empty_title', __( 'Please enter a title or request name.', 'workpress' ), array( 'status' => 400 ) );
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
				'message'    => __( 'Project request submitted successfully. A notification will be sent to the administrator for review and estimation.', 'workpress' ),
				'project_id' => $project_id,
				'project'    => WorkPress_Project_Service::get_project( $project_id ),
			),
			201
		);
	}

	/**
	 * Get client requests stream.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_my_requests( $request ) {
		$user_id  = get_current_user_id();
		$requests = WorkPress_Portal_Service::get_client_requests( $user_id );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'requests' => $requests,
			),
			200
		);
	}
}
