<?php
/**
 * WorkPress Contribution Service.
 *
 * Encapsulates domain logic for Contributions, Evidence, and Timeline Events (wp_comments on CPT 'work_item').
 * Solution acceptance and knowledge transformation are delegated to `WorkPress_Solution_Transform_Service`.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 1.0.0
 * @version 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-workpress-solution-transform-service.php';

class WorkPress_Contribution_Service {

	// Contribution types — domain neutral (Principle 19).
	const TYPE_IMPLEMENTATION = 'implementation';
	const TYPE_PROPOSAL       = 'proposal';
	const TYPE_REVISION       = 'revision';
	const TYPE_FEEDBACK       = 'feedback';
	const TYPE_STATE_CHANGE   = 'state_change';
	const TYPE_ASSIGNMENT     = 'assignment';
	const TYPE_DECISION       = 'decision';

	/**
	 * Default built-in contribution types.
	 *
	 * @return array Default types.
	 */
	public static function get_default_types() {
		return array(
			array(
				'key'       => 'general',
				'label'     => __( 'General', 'workpress' ),
				'icon'      => 'dashicons-tag',
				'is_system' => true,
			),
			array(
				'key'       => self::TYPE_IMPLEMENTATION,
				'label'     => __( 'Technical Execution', 'workpress' ),
				'icon'      => 'dashicons-hammer',
				'is_system' => false,
			),
			array(
				'key'       => self::TYPE_PROPOSAL,
				'label'     => __( 'Proposed Solution', 'workpress' ),
				'icon'      => 'dashicons-star-filled',
				'is_system' => false,
			),
			array(
				'key'       => self::TYPE_REVISION,
				'label'     => __( 'Review & Audit', 'workpress' ),
				'icon'      => 'dashicons-search',
				'is_system' => false,
			),
			array(
				'key'       => self::TYPE_FEEDBACK,
				'label'     => __( 'Discussion & Note', 'workpress' ),
				'icon'      => 'dashicons-admin-comments',
				'is_system' => false,
			),
			array(
				'key'       => self::TYPE_DECISION,
				'label'     => __( 'Decision & Guidance', 'workpress' ),
				'icon'      => 'dashicons-yes-alt',
				'is_system' => false,
			),
			// System audit types (Principle 10 & 13)
			array(
				'key'       => self::TYPE_STATE_CHANGE,
				'label'     => __( 'Status Change', 'workpress' ),
				'icon'      => 'dashicons-randomize',
				'is_system' => true,
			),
			array(
				'key'       => self::TYPE_ASSIGNMENT,
				'label'     => __( 'Assignment', 'workpress' ),
				'icon'      => 'dashicons-groups',
				'is_system' => true,
			),
			array(
				'key'       => 'trash_request',
				'label'     => __( 'Deletion Request', 'workpress' ),
				'icon'      => 'dashicons-trash',
				'is_system' => true,
			),
			array(
				'key'       => 'client_feedback',
				'label'     => __( 'Stakeholder Feedback & Inquiry', 'workpress' ),
				'icon'      => 'dashicons-testimonial',
				'is_system' => false,
			),
			array(
				'key'       => 'client_revision_request',
				'label'     => __( 'Justified Revision Request', 'workpress' ),
				'icon'      => 'dashicons-update',
				'is_system' => false,
			),
			array(
				'key'       => 'client_signoff',
				'label'     => __( 'Sign-off & Receipt Signature', 'workpress' ),
				'icon'      => 'dashicons-awards',
				'is_system' => true,
			),
		);
	}

	/**
	 * Get registered contribution types (from options or defaults).
	 *
	 * @return array List of registered types.
	 */
	public static function get_registered_types() {
		$saved = get_option( 'workpress_contribution_types', null );
		if ( ! is_array( $saved ) || empty( $saved ) ) {
			return self::get_default_types();
		}
		return $saved;
	}

	/**
	 * Get human-readable labels for contribution types.
	 *
	 * @return array Map of type => label.
	 */
	public static function get_type_labels() {
		$types  = self::get_registered_types();
		$labels = array();
		foreach ( $types as $t ) {
			if ( ! empty( $t['key'] ) ) {
				$labels[ $t['key'] ] = $t['label'];
			}
		}
		return $labels;
	}

	/**
	 * Save/update contribution types registry.
	 *
	 * @param array $types List of type arrays.
	 * @return bool True on success.
	 */
	public static function save_custom_types( $types ) {
		if ( ! is_array( $types ) ) {
			return false;
		}
		$sanitized = array();
		foreach ( $types as $t ) {
			if ( empty( $t['key'] ) || empty( $t['label'] ) ) {
				continue;
			}
			$sanitized[] = array(
				'key'       => sanitize_key( $t['key'] ),
				'label'     => sanitize_text_field( $t['label'] ),
				'icon'      => sanitize_html_class( $t['icon'] ?? 'dashicons-admin-comments' ),
				'is_system' => ! empty( $t['is_system'] ),
			);
		}
		return update_option( 'workpress_contribution_types', $sanitized );
	}

	/**
	 * Add a custom contribution type.
	 *
	 * @param string $key Unique type slug.
	 * @param string $label Display label.
	 * @param string $icon Dashicon.
	 * @return bool|WP_Error
	 */
	public static function add_custom_type( $key, $label, $icon = 'dashicons-admin-comments' ) {
		$key   = sanitize_key( $key );
		$label = sanitize_text_field( $label );
		if ( empty( $key ) || empty( $label ) ) {
			return new WP_Error( 'invalid_data', __( 'Slug and label are required.', 'workpress' ) );
		}

		$types = self::get_registered_types();
		foreach ( $types as $t ) {
			if ( $t['key'] === $key ) {
				return new WP_Error( 'duplicate_key', __( 'Contribution type already exists with this slug.', 'workpress' ) );
			}
		}

		$types[] = array(
			'key'       => $key,
			'label'     => $label,
			'icon'      => sanitize_html_class( $icon ),
			'is_system' => false,
		);

		self::save_custom_types( $types );
		return true;
	}

	/**
	 * Delete a custom contribution type.
	 *
	 * @param string $key Type key slug.
	 * @return bool|WP_Error
	 */
	public static function delete_custom_type( $key ) {
		$key   = sanitize_key( $key );
		$types = self::get_registered_types();
		$new   = array();
		$found = false;

		foreach ( $types as $t ) {
			if ( $t['key'] === $key ) {
				if ( ! empty( $t['is_system'] ) ) {
					return new WP_Error( 'system_protected', __( 'Cannot delete protected system types.', 'workpress' ) );
				}
				$found = true;
				continue;
			}
			$new[] = $t;
		}

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Contribution type not found.', 'workpress' ) );
		}

		self::save_custom_types( $new );

		// Remap all contributions belonging to the deleted type to 'general' (Principle 13: History is never lost)
		$affected = get_comments( array(
			'type'       => 'wp_contribution',
			'meta_key'   => '_workpress_contribution_type',
			'meta_value' => $key,
			'number'     => 0,
			'fields'     => 'ids',
		) );
		foreach ( $affected as $cid ) {
			update_comment_meta( $cid, '_workpress_contribution_type', 'general' );
		}

		return true;
	}

	/**
	 * Add a contribution to a task.
	 *
	 * @param int    $task_id Post ID.
	 * @param int    $user_id User ID.
	 * @param string $content Text content / evidence.
	 * @param string $type Contribution type ('implementation', 'proposal', 'revision', 'feedback', 'state_change').
	 * @param array  $attachments Optional array of WP Media attachment IDs.
	 * @param array  $payload Optional structured data payload.
	 * @return array|WP_Error Formatted contribution or WP_Error.
	 */
	public static function add_contribution( $task_id, $user_id, $content, $type = 'implementation', $attachments = array(), $payload = array() ) {
		$task = get_post( (int) $task_id );
		if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
			return new WP_Error( 'invalid_task', __( 'Task not found.', 'workpress' ) );
		}

		$status = get_post_meta( $task_id, '_workpress_status', true ) ?: 'open';
		if ( 'closed' === $status ) {
			return new WP_Error( 'task_closed', __( 'Cannot add contributions to a closed task.', 'workpress' ) );
		}

		$user = $user_id > 0 ? get_userdata( (int) $user_id ) : null;
		if ( ! $user ) {
			// Fallback for automated system events (e.g. CLI, automated transitions)
			$admin = get_user_by( 'slug', 'admin' );
			$user  = $admin ? $admin : (object) array(
				'ID'           => 0,
				'display_name' => __( 'WorkPress System', 'workpress' ),
				'user_email'   => get_option( 'admin_email', 'system@workpress.local' ),
			);
		}

		$comment_id = wp_insert_comment(
			array(
				'comment_post_ID'      => (int) $task_id,
				'user_id'              => (int) $user_id,
				'comment_author'       => $user->display_name,
				'comment_author_email' => $user->user_email,
				'comment_content'      => wp_kses_post( $content ),
				'comment_approved'     => 1,
				'comment_type'         => 'wp_contribution',
			)
		);

		if ( ! $comment_id ) {
			return new WP_Error( 'insert_failed', __( 'Failed to save contribution.', 'workpress' ) );
		}

		$type        = sanitize_key( $type );
		$attachments = array_map( 'intval', (array) $attachments );

		update_comment_meta( $comment_id, '_workpress_contribution_type', $type );
		update_comment_meta( $comment_id, '_workpress_attachment_ids', $attachments );
		update_comment_meta( $comment_id, '_workpress_is_accepted', false );

		// Handle cover image if present in payload
		if ( ! empty( $payload['cover_id'] ) ) {
			update_comment_meta( $comment_id, '_workpress_cover_id', (int) $payload['cover_id'] );
		}

		// Handle visibility scope (internal vs client_review)
		$visibility_scope = ! empty( $payload['visibility_scope'] ) ? sanitize_key( $payload['visibility_scope'] ) : ( in_array( $type, array( 'deliverable', 'solution' ), true ) ? 'client_review' : 'internal' );
		update_comment_meta( $comment_id, '_workpress_visibility_scope', $visibility_scope );

		// Store structured payload if provided (ARCHITECTURE.md: _workpress_payload).
		if ( ! empty( $payload ) ) {
			update_comment_meta( $comment_id, '_workpress_payload', wp_json_encode( $payload ) );
		}

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_contribution_created( $comment_id, $task_id, $user_id );
		}

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		return self::format_contribution( get_comment( $comment_id ) );
	}

	/**
	 * Add a system log contribution.
	 *
	 * @param int    $task_id Post ID.
	 * @param string $log_msg Log message.
	 * @param int    $user_id Optional user ID.
	 * @return array|WP_Error Formatted contribution or WP_Error.
	 */
	public static function add_system_log( $task_id, $log_msg, $user_id = 0 ) {
		$user_id = $user_id > 0 ? $user_id : get_current_user_id();
		return self::add_contribution( $task_id, $user_id, $log_msg, 'state_change' );
	}

	/**
	 * Get timeline of contributions for a task.
	 *
	 * @param int $task_id Task Post ID.
	 * @return array List of formatted contributions.
	 */
	public static function get_task_timeline( $task_id ) {
		$comments = get_comments(
			array(
				'post_id' => (int) $task_id,
				'parent'  => 0,
				'type'    => 'wp_contribution',
				'orderby' => 'comment_date',
				'order'   => 'ASC',
			)
		);

		if ( empty( $comments ) ) {
			return array();
		}

		update_meta_cache( 'comment', wp_list_pluck( $comments, 'comment_ID' ) );
		$user_ids = array_unique( array_filter( wp_list_pluck( $comments, 'user_id' ) ) );
		if ( ! empty( $user_ids ) ) {
			cache_users( $user_ids );
		}

		$timeline = array();
		foreach ( $comments as $comment ) {
			$timeline[] = self::format_contribution( $comment );
		}

		return $timeline;
	}

	/**
	 * Get all contributions across the system (for the Contributions Board).
	 *
	 * @param array $args Query arguments.
	 * @return array List of formatted contributions.
	 */
	public static function get_all_contributions( $args = array() ) {
		$query_args = array(
			'type'    => 'wp_contribution',
			'parent'  => 0,
			'orderby' => 'comment_date',
			'order'   => 'DESC',
		);

		if ( ! empty( $args['number'] ) ) {
			$query_args['number'] = (int) $args['number'];
		} else {
			$query_args['number'] = 50; // Default limit
		}

		if ( ! empty( $args['user_id'] ) ) {
			$query_args['user_id'] = (int) $args['user_id'];
		}

		if ( ! empty( $args['task_id'] ) ) {
			$query_args['post_id'] = (int) $args['task_id'];
		} elseif ( ! empty( $args['project_id'] ) ) {
			$tasks = get_posts( array(
				'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => array(
					array(
						'taxonomy' => WorkPress_Install::TAX_PROJECT,
						'field'    => 'term_id',
						'terms'    => (int) $args['project_id'],
					),
				),
			) );
			if ( empty( $tasks ) ) {
				return array();
			}
			$query_args['post__in'] = $tasks;
		} elseif ( ! empty( $args['project_ids'] ) && is_array( $args['project_ids'] ) ) {
			$tasks = get_posts( array(
				'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => array(
					array(
						'taxonomy' => WorkPress_Install::TAX_PROJECT,
						'field'    => 'term_id',
						'terms'    => array_map( 'intval', $args['project_ids'] ),
						'operator' => 'IN',
					),
				),
			) );
			if ( empty( $tasks ) ) {
				return array();
			}
			$query_args['post__in'] = $tasks;
		}

		if ( ! empty( $args['search'] ) ) {
			$query_args['search'] = sanitize_text_field( $args['search'] );
		}

		$meta_query = array();
		if ( ! empty( $args['type_in'] ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_contribution_type',
				'value'   => (array) $args['type_in'],
				'compare' => 'IN',
			);
		}
		if ( ! empty( $args['type_not_in'] ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_contribution_type',
				'value'   => (array) $args['type_not_in'],
				'compare' => 'NOT IN',
			);
		}

		if ( isset( $args['is_accepted'] ) && 'all' !== $args['is_accepted'] && '' !== $args['is_accepted'] ) {
			if ( '1' === (string) $args['is_accepted'] || true === $args['is_accepted'] ) {
				$meta_query[] = array(
					'key'     => '_workpress_is_accepted',
					'value'   => '1',
					'compare' => '=',
				);
			} elseif ( '0' === (string) $args['is_accepted'] || false === $args['is_accepted'] ) {
				$meta_query[] = array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_is_accepted',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_is_accepted',
						'value'   => '1',
						'compare' => '!=',
					),
				);
			}
		}

		if ( ! empty( $meta_query ) ) {
			$query_args['meta_query'] = $meta_query;
		}

		$comments = get_comments( $query_args );

		if ( empty( $comments ) ) {
			return array();
		}

		update_meta_cache( 'comment', wp_list_pluck( $comments, 'comment_ID' ) );
		$user_ids = array_unique( array_filter( wp_list_pluck( $comments, 'user_id' ) ) );
		if ( ! empty( $user_ids ) ) {
			cache_users( $user_ids );
		}

		$contributions = array();
		foreach ( $comments as $comment ) {
			$contributions[] = self::format_contribution( $comment );
		}

		return $contributions;
	}

	/**
	 * Get a single contribution by ID.
	 *
	 * @param int $contribution_id Comment ID.
	 * @return array|WP_Error Formatted contribution or WP_Error.
	 */
	public static function get_contribution( $contribution_id ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ) );
		}
		return self::format_contribution( $comment );
	}

	/**
	 * Request deletion (Move contribution to Pending Trash).
	 *
	 * @param int    $contribution_id Comment ID.
	 * @param string $reason Reason for deletion request.
	 * @param int    $user_id User requesting deletion.
	 * @return array|WP_Error Updated contribution or error.
	 */
	public static function trash_request( $contribution_id, $reason = '', $user_id = 0 ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ) );
		}

		update_comment_meta( (int) $contribution_id, '_workpress_is_pending_trash', 1 );
		if ( ! empty( $reason ) ) {
			update_comment_meta( (int) $contribution_id, '_workpress_trash_reason', sanitize_textarea_field( $reason ) );
		}
		wp_cache_delete( (int) $contribution_id, 'comment' );

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( (int) $comment->comment_post_ID );
		}

		return self::get_contribution( $contribution_id );
	}

	/**
	 * Restore contribution from pending trash.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $user_id User restoring the contribution.
	 * @return array|WP_Error Updated contribution or error.
	 */
	public static function restore_from_trash( $contribution_id, $user_id = 0 ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ) );
		}

		delete_comment_meta( (int) $contribution_id, '_workpress_is_pending_trash' );
		delete_comment_meta( (int) $contribution_id, '_workpress_trash_reason' );
		wp_cache_delete( (int) $contribution_id, 'comment' );

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( (int) $comment->comment_post_ID );
		}

		return self::get_contribution( $contribution_id );
	}

	/**
	 * Soft delete a contribution using WordPress trash mechanism (Principle 13: History is never lost).
	 *
	 * @param int $contribution_id Comment ID.
	 * @return bool|WP_Error True on success, error on failure.
	 */
	public static function soft_delete( $contribution_id ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ) );
		}

		// Immutability rule: Block deleting an accepted solution
		$is_accepted = (bool) get_comment_meta( $comment->comment_ID, '_workpress_is_accepted', true );
		if ( $is_accepted ) {
			return new WP_Error( 'locked_accepted', __( 'Cannot delete an approved official solution; approval must be revoked first.', 'workpress' ) );
		}

		$task_id = (int) $comment->comment_post_ID;

		$result = wp_trash_comment( (int) $contribution_id );
		if ( ! $result ) {
			return new WP_Error( 'delete_failed', __( 'Failed to move contribution to trash.', 'workpress' ) );
		}

		wp_cache_delete( (int) $contribution_id, 'comment' );

		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		return true;
	}

	// ------------------------------------------------------------------------
	// Solution Transform & Knowledge Delegation Proxies (WorkPress_Solution_Transform_Service)
	// ------------------------------------------------------------------------

	public static function accept_solution( $contribution_id, $user_id = 0 ) {
		return WorkPress_Solution_Transform_Service::accept_solution( $contribution_id, $user_id );
	}

	public static function revoke_solution( $contribution_id, $user_id = 0 ) {
		return WorkPress_Solution_Transform_Service::revoke_solution( $contribution_id, $user_id );
	}

	public static function get_solution_for_task( $task_id ) {
		return WorkPress_Solution_Transform_Service::get_solution_for_task( $task_id );
	}

	public static function get_knowledge_base( $project_id = 0, $search = '' ) {
		return WorkPress_Solution_Transform_Service::get_knowledge_base( $project_id, $search );
	}

	// ------------------------------------------------------------------------
	// Formatting & Threaded Comments
	// ------------------------------------------------------------------------

	/**
	 * Format contribution — public accessor for KnowledgeService and API.
	 *
	 * @param WP_Comment $comment Comment object.
	 * @return array Formatted contribution.
	 */
	public static function format_contribution_public( $comment ) {
		return self::format_contribution( $comment );
	}

	/**
	 * Format WP_Comment into standardized contribution array.
	 *
	 * @param WP_Comment $comment Comment object.
	 * @return array Formatted contribution.
	 */
	private static function format_contribution( $comment ) {
		$type        = get_comment_meta( $comment->comment_ID, '_workpress_contribution_type', true ) ?: 'implementation';
		$is_accepted = (bool) get_comment_meta( $comment->comment_ID, '_workpress_is_accepted', true );
		$att_ids     = get_comment_meta( $comment->comment_ID, '_workpress_attachment_ids', true ) ?: array();
		$payload_raw = get_comment_meta( $comment->comment_ID, '_workpress_payload', true );
		$payload     = $payload_raw ? json_decode( $payload_raw, true ) : null;

		$type_labels = self::get_type_labels();

		$attachments = array();
		foreach ( (array) $att_ids as $att_id ) {
			if ( $att_id > 0 ) {
				$file_path = get_attached_file( $att_id );
				$file_size = $file_path && file_exists( $file_path ) ? size_format( filesize( $file_path ), 1 ) : '';
				$mime_type = get_post_mime_type( $att_id );
				$url       = wp_get_attachment_url( $att_id );
				if ( $url ) {
					$attachments[] = array(
						'id'        => (int) $att_id,
						'name'      => get_the_title( $att_id ) ?: basename( $file_path ?: 'file' ),
						'url'       => $url,
						'mime_type' => $mime_type,
						'size'      => $file_size,
						'is_image'  => wp_attachment_is_image( $att_id ),
					);
				}
			}
		}

		$cover_id = (int) get_comment_meta( $comment->comment_ID, '_workpress_cover_id', true );
		if ( ! $cover_id && ! empty( $payload['cover_id'] ) ) {
			$cover_id = (int) $payload['cover_id'];
		}
		if ( ! $cover_id ) {
			$cover_id = (int) get_post_meta( $comment->comment_post_ID, '_workpress_cover_id', true );
		}
		if ( ! $cover_id && ! empty( $att_ids ) ) {
			foreach ( (array) $att_ids as $aid ) {
				if ( function_exists( 'wp_attachment_is_image' ) && wp_attachment_is_image( $aid ) ) {
					$cover_id = (int) $aid;
					break;
				}
			}
		}
		$cover_url = $cover_id ? wp_get_attachment_image_url( $cover_id, 'large' ) : '';

		// Get Project Information
		$terms        = wp_get_object_terms( $comment->comment_post_ID, WorkPress_Install::TAX_PROJECT );
		$project_id   = 0;
		$project_name = '';
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
			$project_id   = (int) $terms[0]->term_id;
			$project_name = $terms[0]->name;
		}

		$current_uid = get_current_user_id();
		$can_accept  = false;
		if ( $current_uid > 0 && class_exists( 'WorkPress_Project_Service' ) ) {
			$can_accept = WorkPress_Project_Service::is_user_lead( $project_id, $current_uid );
		}

		// Check if author is a client
		$author_user = get_userdata( $comment->user_id );
		$is_client   = false;
		if ( $author_user ) {
			$user_roles = (array) $author_user->roles;
			if ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'subscriber', $user_roles, true ) || $type === 'client_feedback' ) {
				$is_client = true;
			}
		} elseif ( $type === 'client_feedback' ) {
			$is_client = true;
		}

		$comments = self::get_comments_for_contribution( $comment->comment_ID );

		return array(
			'id'                => (int) $comment->comment_ID,
			'task_id'           => (int) $comment->comment_post_ID,
			'task_title'        => get_the_title( $comment->comment_post_ID ),
			'project_id'        => $project_id,
			'project_name'      => $project_name,
			'user_id'           => (int) $comment->user_id,
			'author_name'       => $comment->comment_author,
			'author_avatar'     => get_avatar_url( $comment->user_id, array( 'size' => 48 ) ),
			'is_client'         => $is_client,
			'content'           => $comment->comment_content,
			'type'              => $type,
			'type_label'        => isset( $type_labels[ $type ] ) ? $type_labels[ $type ] : $type,
			'is_accepted'       => $is_accepted,
			'can_accept'        => $can_accept,
			'accepted_by'       => (int) get_comment_meta( $comment->comment_ID, '_workpress_accepted_by', true ),
			'accepted_at'       => get_comment_meta( $comment->comment_ID, '_workpress_accepted_at', true ),
			'payload'           => $payload,
			'attachments'       => $attachments,
			'cover_id'          => $cover_id,
			'cover_url'         => $cover_url,
			'featured_image'    => $cover_url,
			'featured_image_id' => $cover_id,
			'created_at'        => $comment->comment_date,
			'is_pending_trash'  => (bool) get_comment_meta( $comment->comment_ID, '_workpress_is_pending_trash', true ),
			'trash_reason'      => get_comment_meta( $comment->comment_ID, '_workpress_trash_reason', true ),
			'visibility_scope'  => get_comment_meta( $comment->comment_ID, '_workpress_visibility_scope', true ) ?: ( in_array( $type, array( 'implementation', 'proposal', 'solution', 'deliverable' ), true ) ? 'client_review' : 'internal' ),
			'comments'          => $comments,
			'comments_count'    => count( $comments ),
		);
	}

	/**
	 * Add a threaded comment/discussion to a contribution.
	 *
	 * @param int    $contribution_id Parent contribution comment ID.
	 * @param int    $user_id User adding the comment.
	 * @param string $content Comment text.
	 * @return array|WP_Error Formatted comment or error.
	 */
	public static function add_comment_to_contribution( $contribution_id, $user_id, $content ) {
		$parent = get_comment( (int) $contribution_id );
		if ( ! $parent || 'wp_contribution' !== $parent->comment_type ) {
			return new WP_Error( 'not_found', __( 'Contribution not found.', 'workpress' ) );
		}

		$content = trim( (string) $content );
		if ( empty( $content ) ) {
			return new WP_Error( 'empty_content', __( 'Cannot submit an empty comment.', 'workpress' ) );
		}

		$user = get_userdata( (int) $user_id );
		if ( ! $user ) {
			return new WP_Error( 'invalid_user', __( 'Invalid user.', 'workpress' ) );
		}

		$task_id = (int) $parent->comment_post_ID;

		// Check project membership / capabilities
		$terms      = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		if ( $project_id > 0 && class_exists( 'WorkPress_Project_Service' ) && ! WorkPress_Project_Service::user_can_access_project( $user_id, $project_id ) ) {
			return new WP_Error( 'forbidden', __( 'You do not have permission to comment in this project.', 'workpress' ) );
		}

		$commentdata = array(
			'comment_post_ID'      => $task_id,
			'comment_author'       => $user->display_name,
			'comment_author_email' => $user->user_email,
			'comment_author_url'   => $user->user_url,
			'comment_content'      => wp_kses_post( $content ),
			'comment_type'         => 'wp_contrib_reply',
			'comment_parent'       => $parent->comment_ID,
			'user_id'              => $user->ID,
			'comment_approved'     => 1,
		);

		$comment_id = wp_insert_comment( $commentdata );
		if ( ! $comment_id ) {
			return new WP_Error( 'insert_failed', __( 'Failed to save comment.', 'workpress' ) );
		}

		// Fire hook for notifications
		do_action( 'workpress_contribution_comment_added', $comment_id, (int) $parent->comment_ID, $user->ID );

		return self::format_contribution_comment( get_comment( $comment_id ) );
	}

	/**
	 * Get threaded comments for a contribution.
	 *
	 * @param int $contribution_id Parent comment ID.
	 * @return array List of formatted comments.
	 */
	public static function get_comments_for_contribution( $contribution_id ) {
		$comments = get_comments(
			array(
				'parent'  => (int) $contribution_id,
				'type'    => 'wp_contrib_reply',
				'orderby' => 'comment_date',
				'order'   => 'ASC',
			)
		);

		if ( empty( $comments ) ) {
			return array();
		}

		$formatted = array();
		foreach ( $comments as $c ) {
			$formatted[] = self::format_contribution_comment( $c );
		}

		return $formatted;
	}

	/**
	 * Format a contribution reply comment.
	 *
	 * @param WP_Comment $comment Comment object.
	 * @return array Formatted comment data.
	 */
	public static function format_contribution_comment( $comment ) {
		$current_uid = get_current_user_id();
		$task_id     = (int) $comment->comment_post_ID;
		$terms       = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id  = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		$is_author = (int) $comment->user_id === $current_uid;
		$is_lead   = class_exists( 'WorkPress_Project_Service' ) ? WorkPress_Project_Service::is_user_lead( $project_id, $current_uid ) : false;
		$is_admin  = current_user_can( 'manage_options' );

		$can_delete = $is_author || $is_lead || $is_admin;

		$author_user = get_userdata( $comment->user_id );
		$is_client   = false;
		if ( $author_user ) {
			$user_roles = (array) $author_user->roles;
			if ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'subscriber', $user_roles, true ) ) {
				$is_client = true;
			}
		}

		return array(
			'id'              => (int) $comment->comment_ID,
			'contribution_id' => (int) $comment->comment_parent,
			'task_id'         => $task_id,
			'user_id'         => (int) $comment->user_id,
			'author_name'     => $comment->comment_author,
			'author_avatar'   => get_avatar_url( $comment->user_id, array( 'size' => 48 ) ),
			'is_client'       => $is_client,
			'content'         => $comment->comment_content,
			'created_at'      => $comment->comment_date,
			'can_delete'      => $can_delete,
		);
	}

	/**
	 * Delete a contribution comment.
	 *
	 * @param int $comment_id Comment ID.
	 * @param int $user_id User attempting deletion.
	 * @return bool|WP_Error True or error.
	 */
	public static function delete_contribution_comment( $comment_id, $user_id = 0 ) {
		$comment = get_comment( (int) $comment_id );
		if ( ! $comment || 'wp_contrib_reply' !== $comment->comment_type ) {
			return new WP_Error( 'not_found', __( 'Comment not found.', 'workpress' ) );
		}

		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$task_id = (int) $comment->comment_post_ID;
		$terms   = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		$is_author = (int) $comment->user_id === $user_id;
		$is_lead   = class_exists( 'WorkPress_Project_Service' ) ? WorkPress_Project_Service::is_user_lead( $project_id, $user_id ) : false;
		$is_admin  = user_can( $user_id, 'manage_options' );

		if ( ! $is_author && ! $is_lead && ! $is_admin ) {
			return new WP_Error( 'forbidden', __( 'You do not have permission to delete this comment.', 'workpress' ) );
		}

		$result = wp_delete_comment( (int) $comment_id, true );
		if ( ! $result ) {
			return new WP_Error( 'delete_failed', __( 'Failed to delete comment.', 'workpress' ) );
		}

		return true;
	}
}
