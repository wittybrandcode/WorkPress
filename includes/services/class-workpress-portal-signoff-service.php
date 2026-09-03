<?php
/**
 * WorkPress Portal Deliverables & Digital Signoff Service
 *
 * Dedicated domain engine for:
 * 1. Deliverables Purification (Principle #11).
 * 2. Candidate Proposal Evaluation & Threaded Review Discussions.
 * 3. Formal Solution Acceptance & Task State Derivation.
 * 4. Final Project Digital Handover & SHA-256 Fingerprinted Signoff Certificates.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Portal_Signoff_Service {

	/**
	 * Get candidate deliverables and proposals for client evaluation & interactive review.
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id    User ID.
	 * @return array Array of candidate deliverables.
	 */
	public static function get_project_candidate_deliverables( $project_id, $user_id ) {
		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return array();
		}

		$task_ids = get_posts( array(
			'post_type'      => WorkPress_Keys::CPT_WORK_ITEM,
			'post_status'    => 'publish',
			'posts_per_page' => 200,
			'fields'         => 'ids',
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Keys::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_id,
				),
			),
		) );

		if ( empty( $task_ids ) ) {
			return array();
		}

		$comments = get_comments( array(
			'post__in'   => $task_ids,
			'type'       => WorkPress_Keys::COMMENT_CONTRIBUTION,
			'status'     => 'approve',
			'meta_query' => array(
				array(
					'key'     => '_workpress_contribution_type',
					'value'   => array( 'proposal', 'implementation', 'revision', 'deliverable' ),
					'compare' => 'IN',
				),
			),
			'orderby'    => 'comment_date',
			'order'      => 'DESC',
		) );

		$candidates = array();
		foreach ( $comments as $comment ) {
			// Respect visibility scope: Skip internal technical drafts
			$visibility = get_comment_meta( $comment->comment_ID, '_workpress_visibility_scope', true );
			if ( 'internal' === $visibility ) {
				continue;
			}

			$task_post   = get_post( $comment->comment_post_ID );
			$author_user = get_userdata( $comment->user_id );
			$is_accepted = (bool) get_comment_meta( $comment->comment_ID, '_workpress_is_accepted', true );
			$type        = get_comment_meta( $comment->comment_ID, '_workpress_contribution_type', true ) ?: 'proposal';

			// Retrieve attachments
			$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachment_ids', true );
			if ( empty( $att_ids ) ) {
				$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachments', true );
			}
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

			// Cover image
			$cover_id = (int) get_comment_meta( $comment->comment_ID, '_workpress_cover_id', true );
			if ( ! $cover_id && $task_post ) {
				$cover_id = (int) get_post_meta( $task_post->ID, '_workpress_cover_id', true );
			}
			$cover_url = $cover_id ? wp_get_attachment_image_url( $cover_id, 'large' ) : '';

			// Count threaded comments
			$review_comments = get_comments( array(
				'parent' => $comment->comment_ID,
				'count'  => true,
			) );

			$candidates[] = array(
				'id'             => (int) $comment->comment_ID,
				'task_id'        => (int) $comment->comment_post_ID,
				'task_title'     => $task_post ? $task_post->post_title : '',
				'content'        => $comment->comment_content,
				'type'           => $type,
				'created_at'     => $comment->comment_date,
				'is_accepted'    => $is_accepted,
				'author_name'    => $author_user ? $author_user->display_name : $comment->comment_author,
				'author_avatar'  => get_avatar_url( $comment->user_id, array( 'size' => 48 ) ),
				'cover_url'      => $cover_url,
				'attachments'    => $attachments,
				'comments_count' => (int) $review_comments,
			);
		}

		return $candidates;
	}

	/**
	 * Convenience alias for project candidates.
	 *
	 * @param int $project_id Project Term ID.
	 * @return array
	 */
	public static function get_project_candidates( $project_id ) {
		return self::get_project_candidate_deliverables( $project_id, get_current_user_id() );
	}

	/**
	 * Get strictly accepted deliverables and solutions for a client project (Principle #11: Purification).
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id    User ID.
	 * @return array Array of purified deliverables.
	 */
	public static function get_project_deliverables( $project_id, $user_id ) {
		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return array();
		}

		// 1. Get task IDs belonging to this project
		$task_ids = get_posts( array(
			'post_type'      => WorkPress_Keys::CPT_WORK_ITEM,
			'post_status'    => 'publish',
			'posts_per_page' => 200,
			'fields'         => 'ids',
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Keys::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_id,
				),
			),
		) );

		if ( empty( $task_ids ) ) {
			return array();
		}

		// 2. Retrieve only accepted solutions (_workpress_is_accepted = 1)
		$comments = get_comments( array(
			'post__in'   => $task_ids,
			'type'       => WorkPress_Keys::COMMENT_CONTRIBUTION,
			'status'     => 'approve',
			'meta_query' => array(
				array(
					'key'     => '_workpress_is_accepted',
					'value'   => '1',
					'compare' => '=',
				),
			),
		) );

		$deliverables = array();
		foreach ( $comments as $comment ) {
			$task_post   = get_post( $comment->comment_post_ID );
			$author_user = get_userdata( $comment->user_id );

			// Retrieve attachments from _workpress_attachment_ids or _workpress_attachments
			$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachment_ids', true );
			if ( empty( $att_ids ) ) {
				$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachments', true );
			}
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

			// Retrieve Cover Image
			$cover_id = (int) get_comment_meta( $comment->comment_ID, '_workpress_cover_id', true );
			if ( ! $cover_id && $task_post ) {
				$cover_id = (int) get_post_meta( $task_post->ID, '_workpress_cover_id', true );
			}
			$cover_url = $cover_id ? wp_get_attachment_image_url( $cover_id, 'large' ) : '';

			$prj_prefix = get_term_meta( $project_id, '_workpress_prefix', true ) ?: 'PRJ';
			$task_ref   = $task_post ? ( get_post_meta( $task_post->ID, '_workpress_ref_key', true ) ?: $prj_prefix . '-' . $task_post->ID ) : '';

			$deliverables[] = array(
				'id'            => (int) $comment->comment_ID,
				'task_id'       => (int) $comment->comment_post_ID,
				'task_ref'      => $task_ref,
				'task_title'    => $task_post ? $task_post->post_title : '',
				'content'       => $comment->comment_content,
				'accepted_at'   => $comment->comment_date,
				'author_name'   => $author_user ? $author_user->display_name : $comment->comment_author,
				'author_avatar' => get_avatar_url( $comment->user_id, array( 'size' => 48 ) ),
				'cover_url'     => $cover_url,
				'attachments'   => $attachments,
			);
		}

		return $deliverables;
	}

	/**
	 * Get threaded review comments on a deliverable.
	 *
	 * @param int $deliverable_id Comment ID.
	 * @param int $user_id        User ID.
	 * @return array
	 */
	public static function get_deliverable_comments( $deliverable_id, $user_id ) {
		$parent_comment = get_comment( (int) $deliverable_id );
		if ( ! $parent_comment ) {
			return array();
		}

		$task_id = (int) $parent_comment->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Keys::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return array();
		}

		if ( ! WorkPress_Portal_Service::can_user_access_project( $terms[0]->term_id, $user_id ) ) {
			return array();
		}

		$comments = get_comments( array(
			'parent'  => $deliverable_id,
			'orderby' => 'comment_date',
			'order'   => 'ASC',
		) );

		$formatted = array();
		foreach ( $comments as $c ) {
			$u = get_userdata( $c->user_id );
			$formatted[] = array(
				'id'            => (int) $c->comment_ID,
				'content'       => $c->comment_content,
				'created_at'    => $c->comment_date,
				'author_name'   => $u ? $u->display_name : $c->comment_author,
				'author_avatar' => get_avatar_url( $c->user_id, array( 'size' => 36 ) ),
				'is_client'     => $u && in_array( 'workpress_client', (array) $u->roles, true ),
			);
		}

		return $formatted;
	}

	/**
	 * Add threaded review comment or revision request on a deliverable.
	 *
	 * @param int    $deliverable_id Comment ID.
	 * @param string $content        Feedback content.
	 * @param int    $user_id        User ID.
	 * @return array|WP_Error
	 */
	public static function add_deliverable_comment( $deliverable_id, $content, $user_id ) {
		$parent_comment = get_comment( (int) $deliverable_id );
		if ( ! $parent_comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ), array( 'status' => 404 ) );
		}

		$task_id = (int) $parent_comment->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Keys::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return new WP_Error( 'invalid_project', __( 'Project not found.', 'workpress' ), array( 'status' => 400 ) );
		}

		if ( ! WorkPress_Portal_Service::can_user_access_project( $terms[0]->term_id, $user_id ) ) {
			return new WP_Error( 'forbidden', __( 'You are not authorized to comment on this deliverable.', 'workpress' ), array( 'status' => 403 ) );
		}

		$user = get_userdata( (int) $user_id );
		if ( ! $user ) {
			return new WP_Error( 'invalid_user', __( 'User not found.', 'workpress' ), array( 'status' => 400 ) );
		}

		$comment_id = wp_insert_comment( array(
			'comment_post_ID'      => $task_id,
			'comment_parent'       => $deliverable_id,
			'user_id'              => $user_id,
			'comment_author'       => $user->display_name,
			'comment_author_email' => $user->user_email,
			'comment_content'      => wp_kses_post( $content ),
			'comment_approved'     => 1,
			'comment_type'         => 'wp_contribution',
		) );

		if ( ! $comment_id ) {
			return new WP_Error( 'insert_failed', __( 'Failed to save comment.', 'workpress' ), array( 'status' => 500 ) );
		}

		update_comment_meta( $comment_id, '_workpress_contribution_type', 'feedback' );

		// Fire notification action
		do_action( 'workpress_deliverable_comment_added', $comment_id, $deliverable_id, $task_id, $user_id );

		return array(
			'id'            => $comment_id,
			'content'       => wp_kses_post( $content ),
			'created_at'    => current_time( 'mysql' ),
			'author_name'   => $user->display_name,
			'author_avatar' => get_avatar_url( $user_id, array( 'size' => 36 ) ),
			'is_client'     => in_array( 'workpress_client', (array) $user->roles, true ),
		);
	}

	/**
	 * Client approves a candidate deliverable as the official solution.
	 *
	 * @param int $task_id      Task Post ID.
	 * @param int $comment_id   Contribution Comment ID.
	 * @param int $user_id      User ID.
	 * @return array|WP_Error
	 */
	public static function client_accept_deliverable( $task_id, $comment_id, $user_id ) {
		$deliverable_id = (int) $comment_id;
		if ( ! $deliverable_id ) {
			// Find primary candidate contribution for this task
			$latest = get_comments( array(
				'post_id' => (int) $task_id,
				'type'    => WorkPress_Keys::COMMENT_CONTRIBUTION,
				'number'  => 1,
				'status'  => 'approve',
			) );
			if ( ! empty( $latest ) ) {
				$deliverable_id = (int) $latest[0]->comment_ID;
			}
		}

		$comment = get_comment( (int) $deliverable_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Requested deliverable not found.', 'workpress' ), array( 'status' => 404 ) );
		}

		$task_id = (int) $comment->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Keys::TAX_PROJECT );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return new WP_Error( 'invalid_project', __( 'Project not found.', 'workpress' ), array( 'status' => 400 ) );
		}

		$project_id = (int) $terms[0]->term_id;
		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return new WP_Error( 'forbidden', __( 'You are not authorized to approve deliverables for this project.', 'workpress' ), array( 'status' => 403 ) );
		}

		$user = get_userdata( (int) $user_id );

		// Mark contribution as accepted
		update_comment_meta( $deliverable_id, '_workpress_is_accepted', '1' );
		update_comment_meta( $deliverable_id, '_workpress_accepted_by', (int) $user_id );
		update_comment_meta( $deliverable_id, '_workpress_accepted_at', current_time( 'mysql' ) );
		update_comment_meta( $deliverable_id, '_workpress_client_selected', '1' );

		// Derive and sync task state
		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		// Invalidate cache
		if ( class_exists( 'WorkPress_Project_Service' ) ) {
			WorkPress_Project_Service::invalidate_project_cache( $project_id );
		}

		// Log system audit
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf(
					/* translators: %s: Client name */
					__( 'Client %s officially approved this solution and it was delivered successfully.', 'workpress' ),
					$user ? $user->display_name : __( 'Client', 'workpress' )
				),
				$user_id
			);
		}

		// Fire hook
		do_action( 'workpress_client_deliverable_accepted', $deliverable_id, $task_id, $project_id, $user_id );

		return array(
			'success' => true,
			'message' => __( 'Solution approved successfully and task closed!', 'workpress' ),
			'task_id' => $task_id,
		);
	}

	/**
	 * Final project handover & signoff by client with SHA-256 fingerprint certificate.
	 *
	 * @param int    $project_id Project Term ID.
	 * @param int    $user_id    User ID.
	 * @param string $notes      Signoff feedback.
	 * @return array|WP_Error
	 */
	public static function client_project_signoff( $project_id, $user_id, $notes = '' ) {
		$project_id = absint( $project_id );
		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return new WP_Error( 'forbidden', __( 'You are not authorized to approve this project.', 'workpress' ), array( 'status' => 403 ) );
		}

		$user      = get_userdata( (int) $user_id );
		$now_gmt   = gmdate( 'Y-m-d H:i:s' );
		$now_local = current_time( 'mysql' );

		// Generate Cryptographic HMAC-SHA256 Certificate Fingerprint with WordPress Auth Salt
		$notes_digest = hash( 'sha256', (string) $notes );
		$certificate_seed = sprintf(
			'WORKPRESS_SIGNOFF|PRJ:%d|USR:%d|TIME:%s|NOTES:%s',
			$project_id,
			$user_id,
			$now_gmt,
			$notes_digest
		);
		$sha256_fingerprint = hash_hmac( 'sha256', $certificate_seed, wp_salt( 'auth' ) );

		update_term_meta( $project_id, '_workpress_client_signoff', '1' );
		update_term_meta( $project_id, '_workpress_client_signoff_by', (int) $user_id );
		update_term_meta( $project_id, '_workpress_client_signoff_at', $now_local );
		update_term_meta( $project_id, '_workpress_client_signoff_notes', sanitize_textarea_field( $notes ) );
		update_term_meta( $project_id, '_workpress_client_signoff_sha256', $sha256_fingerprint );
		update_term_meta( $project_id, WorkPress_Keys::META_PROJECT_STATUS, 'completed' );
		update_term_meta( $project_id, WorkPress_Keys::META_PROJECT_PROGRESS, 100 );

		if ( class_exists( 'WorkPress_Project_Service' ) ) {
			WorkPress_Project_Service::invalidate_project_cache( $project_id );
		}

		do_action( 'workpress_client_project_signed_off', $project_id, $user_id, $notes, $sha256_fingerprint );

		return array(
			'success'     => true,
			'message'     => __( 'Project signed off and delivered successfully! Thank you for trusting us.', 'workpress' ),
			'fingerprint' => $sha256_fingerprint,
		);
	}

	/**
	 * Convenience alias for signoff project.
	 *
	 * @param int    $project_id Project Term ID.
	 * @param int    $user_id    User ID.
	 * @param string $notes      Signoff feedback.
	 * @return array|WP_Error
	 */
	public static function signoff_project( $project_id, $user_id, $notes = '' ) {
		return self::client_project_signoff( $project_id, $user_id, $notes );
	}
}
