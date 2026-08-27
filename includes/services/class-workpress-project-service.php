<?php
/**
 * WorkPress Project Service.
 *
 * Encapsulates domain logic for Projects (Taxonomy 'workpress_project').
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Project_Service {

	/**
	 * Get all projects.
	 *
	 * @param int $user_id Optional user ID to filter visible projects.
	 * @return array Array of formatted project objects.
	 */
	public static function get_projects( $args = array() ) {
		$user_id = isset( $args['user_id'] ) ? (int) $args['user_id'] : 0;
		$per_page = isset( $args['per_page'] ) ? (int) $args['per_page'] : 20;
		$page     = isset( $args['page'] ) ? (int) $args['page'] : 1;
		
		$terms = get_terms(
			array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
			)
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return array( 'items' => array(), 'total' => 0, 'total_pages' => 0 );
		}

		//  High-Performance Bulk Hydration: Prime term metas in ONE SQL Query (Principle 21)
		$term_ids = wp_list_pluck( $terms, 'term_id' );
		if ( ! empty( $term_ids ) && function_exists( 'update_termmeta_cache' ) ) {
			update_termmeta_cache( $term_ids );
		}

		$projects = array();
		foreach ( $terms as $term ) {
			if ( $user_id > 0 && ! self::user_can_access_project( $user_id, $term->term_id ) ) {
				continue;
			}
			
			$status = get_term_meta( $term->term_id, '_workpress_status', true );
			$is_archived = get_term_meta( $term->term_id, '_workpress_archived', true );
			if ( ( 'archived' === $status || ! empty( $is_archived ) ) && empty( $args['include_archived'] ) ) {
				continue;
			}
			
			$cache_key = 'wp_prj_' . $term->term_id;
			$formatted = wp_cache_get( $cache_key, 'workpress' );
			if ( false === $formatted ) {
				$formatted = self::format_project( $term );
				wp_cache_set( $cache_key, $formatted, 'workpress', DAY_IN_SECONDS );
			}
			
			$projects[] = $formatted;
		}

		$total = count( $projects );
		
		// Handle offset and limit
		if ( $per_page > 0 ) {
			$offset = ( $page - 1 ) * $per_page;
			$projects = array_slice( $projects, $offset, $per_page );
		}
		
		return array(
			'items'       => $projects,
			'total'       => $total,
			'total_pages' => $per_page > 0 ? ceil( $total / $per_page ) : 1,
		);
	}

	/**
	 * Get single project by ID.
	 *
	 * @param int $project_id Term ID.
	 * @return array|WP_Error Formatted project array or WP_Error.
	 */
	public static function get_project( $project_id ) {
		$term = get_term( (int) $project_id, WorkPress_Install::TAX_PROJECT );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', __( 'المشروع غير موجود.', 'workpress' ) );
		}

		$cache_key = 'wp_prj_' . $project_id;
		$formatted = wp_cache_get( $cache_key, 'workpress' );
		if ( false !== $formatted ) {
			return $formatted;
		}
		
		$formatted = self::format_project( $term );
		wp_cache_set( $cache_key, $formatted, 'workpress', DAY_IN_SECONDS );
		
		return $formatted;
	}

	/**
	 * Create a new project.
	 *
	 * @param array $data Project attributes.
	 * @return array|WP_Error Formatted created project or WP_Error.
	 */
	public static function create_project( $data ) {
		if ( empty( $data['name'] ) ) {
			return new WP_Error( 'missing_name', __( 'اسم المشروع مطلوب.', 'workpress' ) );
		}

		$result = wp_insert_term(
			sanitize_text_field( $data['name'] ),
			WorkPress_Install::TAX_PROJECT,
			array(
				'description' => isset( $data['description'] ) ? wp_kses_post( $data['description'] ) : '',
			)
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$term_id = $result['term_id'];

		// Set default metadata.
		$prefix   = ! empty( $data['prefix'] ) ? strtoupper( sanitize_key( $data['prefix'] ) ) : 'PRJ';
		$status   = ! empty( $data['status'] ) ? sanitize_key( $data['status'] ) : 'active';
		$lead_id  = ! empty( $data['lead_id'] ) ? (int) $data['lead_id'] : get_current_user_id();
		$cover_id = ! empty( $data['cover_id'] ) ? (int) $data['cover_id'] : 0;
		$start_at = ! empty( $data['start_at'] ) ? sanitize_text_field( $data['start_at'] ) : current_time( 'mysql' );
		$due_at   = ! empty( $data['due_at'] ) ? sanitize_text_field( $data['due_at'] ) : '';

		update_term_meta( $term_id, '_workpress_prefix', $prefix );
		update_term_meta( $term_id, '_workpress_status', $status );
		update_term_meta( $term_id, '_workpress_lead_id', $lead_id );
		update_term_meta( $term_id, '_workpress_cover_id', $cover_id );
		update_term_meta( $term_id, '_workpress_start_at', $start_at );
		update_term_meta( $term_id, '_workpress_due_at', $due_at );

		// Set lead as manager member.
		WorkPress_Membership_Service::add_member( $term_id, $lead_id, WorkPress_Membership_Service::ROLE_MANAGER );

		$creator_id = get_current_user_id();
		if ( $creator_id > 0 && $creator_id !== $lead_id ) {
			WorkPress_Membership_Service::add_member( $term_id, $creator_id, WorkPress_Membership_Service::ROLE_MANAGER );
		}

		self::invalidate_project_cache( $term_id );

		return self::get_project( $term_id );
	}

	/**
	 * Update an existing project.
	 *
	 * @param int   $project_id Term ID.
	 * @param array $data Project data.
	 * @return array|WP_Error Formatted updated project or WP_Error.
	 */
	public static function update_project( $project_id, $data ) {
		$project = self::get_project( $project_id );
		if ( is_wp_error( $project ) ) {
			return $project;
		}

		$project_name = ! empty( $data['name'] ) ? sanitize_text_field( $data['name'] ) : ( $project['name'] ?? '' );
		if ( empty( $project_name ) ) {
			return new WP_Error( 'missing_name', __( 'اسم المشروع مطلوب.', 'workpress' ) );
		}

		$update_args = array(
			'name' => $project_name,
		);

		if ( isset( $data['description'] ) ) {
			$update_args['description'] = wp_kses_post( $data['description'] );
		}

		$result = wp_update_term( $project_id, WorkPress_Install::TAX_PROJECT, $update_args );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( isset( $data['prefix'] ) ) {
			update_term_meta( $project_id, '_workpress_prefix', strtoupper( sanitize_key( $data['prefix'] ) ) );
		}

		if ( isset( $data['featured_image'] ) ) {
			update_term_meta( $project_id, '_workpress_cover_id', (int) $data['featured_image'] );
		} elseif ( isset( $data['cover_id'] ) ) {
			update_term_meta( $project_id, '_workpress_cover_id', (int) $data['cover_id'] );
		}
		
		if ( isset( $data['review_notes'] ) ) {
			update_term_meta( $project_id, '_workpress_review_notes', sanitize_textarea_field( $data['review_notes'] ) );
		}

		if ( isset( $data['rejection_reason'] ) ) {
			update_term_meta( $project_id, '_workpress_rejection_reason', sanitize_textarea_field( $data['rejection_reason'] ) );
		}

		if ( isset( $data['status'] ) ) {
			$old_status = get_term_meta( $project_id, '_workpress_status', true ) ?: 'active';
			$new_status = sanitize_key( $data['status'] );
			update_term_meta( $project_id, '_workpress_status', $new_status );

			// Check if a client request is being approved/activated
			if ( ( 'pending' === $old_status || 'draft' === $old_status || 'under_review' === $old_status ) && 'active' === $new_status ) {
				if ( class_exists( 'WorkPress_Hooks' ) ) {
					WorkPress_Hooks::fire_project_request_approved( $project_id, get_current_user_id() );
				}
			} elseif ( 'under_review' === $new_status && 'under_review' !== $old_status ) {
				if ( class_exists( 'WorkPress_Hooks' ) ) {
					$reason = isset( $data['review_notes'] ) ? sanitize_textarea_field( $data['review_notes'] ) : '';
					WorkPress_Hooks::fire_project_request_under_review( $project_id, get_current_user_id(), $reason );
				}
			} elseif ( 'rejected' === $new_status && 'rejected' !== $old_status ) {
				if ( class_exists( 'WorkPress_Hooks' ) ) {
					$reason = isset( $data['rejection_reason'] ) ? sanitize_textarea_field( $data['rejection_reason'] ) : '';
					WorkPress_Hooks::fire_project_request_rejected( $project_id, get_current_user_id(), $reason );
				}
			}
		}
		
		if ( isset( $data['start_at'] ) ) {
			update_term_meta( $project_id, '_workpress_start_at', sanitize_text_field( $data['start_at'] ) );
		}
		
		if ( isset( $data['due_at'] ) ) {
			update_term_meta( $project_id, '_workpress_due_at', sanitize_text_field( $data['due_at'] ) );
		}
		
		if ( isset( $data['lead_id'] ) ) {
			update_term_meta( $project_id, '_workpress_lead_id', (int) $data['lead_id'] );
		}

		self::invalidate_project_cache( $project_id );

		return self::get_project( $project_id );
	}

	/**
	 * Request deletion (Move project to Pending Trash).
	 *
	 * @param int    $project_id Project Term ID.
	 * @param string $reason Reason for deletion request.
	 * @param int    $user_id User requesting deletion.
	 * @return array|WP_Error Updated project or error.
	 */
	public static function trash_request( $project_id, $reason = '', $user_id = 0 ) {
		$project = self::get_project( $project_id );
		if ( is_wp_error( $project ) ) {
			return $project;
		}

		update_term_meta( (int) $project_id, '_workpress_status', 'pending_trash' );
		if ( ! empty( $reason ) ) {
			update_term_meta( (int) $project_id, '_workpress_trash_reason', sanitize_textarea_field( $reason ) );
		}

		self::invalidate_project_cache( $project_id );

		return self::get_project( $project_id );
	}

	/**
	 * Restore project from pending trash.
	 *
	 * @param int $project_id Project Term ID.
	 * @param int $user_id User restoring the project.
	 * @return array|WP_Error Updated project or error.
	 */
	public static function restore_from_trash( $project_id, $user_id = 0 ) {
		$project = self::get_project( $project_id );
		if ( is_wp_error( $project ) ) {
			return $project;
		}

		update_term_meta( (int) $project_id, '_workpress_status', 'active' );
		delete_term_meta( (int) $project_id, '_workpress_trash_reason' );

		self::invalidate_project_cache( $project_id );

		return self::get_project( $project_id );
	}

	/**
	 * Delete a project (Soft-Delete / Archiving).
	 * Preserves organizational memory and historical integrity (Principle 13).
	 *
	 * @param int $project_id Term ID.
	 * @return bool|WP_Error True on success, WP_Error on failure.
	 */
	public static function delete_project( $project_id ) {
		$project_id = (int) $project_id;
		$term = get_term( $project_id, WorkPress_Install::TAX_PROJECT );
		if ( ! $term || is_wp_error( $term ) ) {
			return new WP_Error( 'not_found', __( 'المشروع غير موجود.', 'workpress' ) );
		}

		// Soft-delete / Archive project preserving historical integrity (Principle 13)
		update_term_meta( $project_id, '_workpress_status', 'archived' );
		update_term_meta( $project_id, '_workpress_archived', 1 );
		update_term_meta( $project_id, '_workpress_archived_at', current_time( 'mysql', true ) );
		update_term_meta( $project_id, '_workpress_archived_by', get_current_user_id() );
		delete_term_meta( $project_id, '_workpress_trash_reason' );

		self::invalidate_project_cache( $project_id );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_project_deleted( $project_id, get_current_user_id() );
		}

		return true;
	}

	/**
	 * Check user project access.
	 *
	 * @param int $user_id User ID.
	 * @param int $project_id Term ID.
	 * @return bool True if accessible.
	 */
	public static function user_can_access_project( $user_id, $project_id ) {
		if ( user_can( $user_id, 'manage_options' ) ) {
			return true;
		}

		$role = get_term_meta( $project_id, '_workpress_member_' . (int) $user_id, true );
		return ! empty( $role );
	}

	/**
	 * Format WP_Term into standardized project array.
	 *
	 * @param WP_Term $term Term object.
	 * @return array Formatted project.
	 */
	private static function format_project( $term ) {
		$status       = get_term_meta( $term->term_id, '_workpress_status', true );
		$cover_id     = (int) get_term_meta( $term->term_id, '_workpress_cover_id', true );
		$trash_reason = get_term_meta( $term->term_id, '_workpress_trash_reason', true );
		$cover_url    = $cover_id > 0 ? wp_get_attachment_url( $cover_id ) : '';
		$total_count  = (int) $term->count;
		$completed_ct = self::count_completed_tasks( $term->term_id );
		$progress     = $total_count > 0 ? round( ( $completed_ct / $total_count ) * 100 ) : 0;

		$formatted = array(
			'id'               => $term->term_id,
			'name'             => $term->name,
			'description'      => $term->description,
			'prefix'           => get_term_meta( $term->term_id, '_workpress_prefix', true ) ?: 'PRJ',
			'status'           => $status ? $status : 'active',
			'is_completed'     => 'completed' === $status || ( $total_count > 0 && $completed_ct === $total_count ),
			'progress'         => $progress,
			'is_pending_trash' => $status === 'pending_trash',
			'trash_reason'     => $trash_reason,
			'lead_id'          => (int) get_term_meta( $term->term_id, '_workpress_lead_id', true ),
			'cover_id'         => $cover_id,
			'cover_url'        => $cover_url,
			'start_at'           => get_term_meta( $term->term_id, '_workpress_start_at', true ),
			'due_at'             => get_term_meta( $term->term_id, '_workpress_due_at', true ),
			'count'              => $total_count,
			'completed_count'    => $completed_ct,
			'is_client_request'  => (bool) get_term_meta( $term->term_id, '_workpress_is_client_request', true ),
			'is_frozen'          => ( 'frozen' === $status ),
			'frozen_at'          => get_term_meta( $term->term_id, '_workpress_frozen_at', true ),
			'freeze_reason'      => get_term_meta( $term->term_id, '_workpress_freeze_reason', true ),
			'client_id'          => (int) get_term_meta( $term->term_id, '_workpress_client_id', true ),
			'client'             => ( (int) get_term_meta( $term->term_id, '_workpress_client_id', true ) > 0 && ( $cu = get_userdata( (int) get_term_meta( $term->term_id, '_workpress_client_id', true ) ) ) ) ? array(
				'id'           => $cu->ID,
				'display_name' => $cu->display_name,
				'email'        => $cu->user_email,
				'avatar'       => get_avatar_url( $cu->ID, array( 'size' => 64 ) ),
			) : null,
			'request_form_id'     => get_term_meta( $term->term_id, '_workpress_request_form_id', true ),
			'request_specs'       => get_term_meta( $term->term_id, '_workpress_request_specs', true ) ?: array(),
			'request_attachments' => get_term_meta( $term->term_id, '_workpress_request_attachments', true ) ?: array(),
			'requested_budget'    => get_term_meta( $term->term_id, '_workpress_requested_budget', true ),
			'requested_due_date'  => get_term_meta( $term->term_id, '_workpress_requested_due_date', true ),
			'review_notes'        => get_term_meta( $term->term_id, '_workpress_review_notes', true ) ?: '',
			'rejection_reason'    => get_term_meta( $term->term_id, '_workpress_rejection_reason', true ) ?: '',
		);

		return apply_filters( 'workpress_prepare_project_response', $formatted, $term );
	}

	/**
	 * Check if user is Project Lead or Administrator.
	 *
	 * @param int $project_id Term ID.
	 * @param int $user_id User ID.
	 * @return bool True if lead or admin.
	 */
	public static function is_user_lead( $project_id, $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return false;
		}

		if ( user_can( $user_id, 'manage_options' ) ) {
			return true;
		}

		$project_id = (int) $project_id;
		if ( $project_id <= 0 ) {
			return false;
		}

		$lead_id = (int) get_term_meta( $project_id, '_workpress_lead_id', true );
		if ( $lead_id === $user_id ) {
			return true;
		}

		$member_role = get_term_meta( $project_id, '_workpress_member_' . $user_id, true );
		return in_array( $member_role, array( 'manager', 'lead', WorkPress_Membership_Service::ROLE_MANAGER ), true );
	}

	/**
	 * Check project tasks and update project completion status automatically.
	 * Rule: Completion of all tasks necessarily implies completion of the project.
	 *
	 * @param int $project_id Term ID.
	 * @return array Project completion stats.
	 */
	public static function check_and_update_project_completion( $project_id ) {
		$project_id = (int) $project_id;
		if ( $project_id <= 0 ) {
			return array();
		}

		$tasks = get_posts( array(
			'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_id,
				),
			),
			'fields'         => 'ids',
		) );

		$total_tasks  = count( $tasks );
		$closed_tasks = 0;

		foreach ( $tasks as $tid ) {
			$st = get_post_meta( $tid, '_workpress_status', true ) ?: 'open';
			if ( in_array( $st, array( 'closed', 'completed' ), true ) ) {
				$closed_tasks++;
			}
		}

		$progress = $total_tasks > 0 ? round( ( $closed_tasks / $total_tasks ) * 100 ) : 0;
		update_term_meta( $project_id, '_workpress_progress', $progress );

		$current_status = get_term_meta( $project_id, '_workpress_status', true );
		if ( empty( $current_status ) ) {
			$current_status = $total_tasks === 0 ? 'new' : 'active';
		}

		if ( $total_tasks === 0 ) {
			if ( 'pending_trash' !== $current_status && 'archived' !== $current_status && 'new' !== $current_status ) {
				update_term_meta( $project_id, '_workpress_status', 'new' );
				delete_term_meta( $project_id, '_workpress_completed_at' );
			}
		} elseif ( $closed_tasks === $total_tasks ) {
			if ( 'completed' !== $current_status && 'pending_trash' !== $current_status ) {
				update_term_meta( $project_id, '_workpress_status', 'completed' );
				update_term_meta( $project_id, '_workpress_completed_at', current_time( 'mysql' ) );
				do_action( 'workpress_project_completed', $project_id );
			}
		} else {
			if ( 'completed' === $current_status || 'new' === $current_status ) {
				update_term_meta( $project_id, '_workpress_status', 'active' );
				delete_term_meta( $project_id, '_workpress_completed_at' );
				if ( 'completed' === $current_status ) {
					do_action( 'workpress_project_reopened', $project_id );
				}
			}
		}

		self::invalidate_project_cache( $project_id );

		return array(
			'project_id'   => $project_id,
			'total_tasks'  => $total_tasks,
			'closed_tasks' => $closed_tasks,
			'progress'     => $progress,
			'status'       => get_term_meta( $project_id, '_workpress_status', true ) ?: ( $total_tasks === 0 ? 'new' : 'active' ),
		);
	}

	/**
	 * Count completed tasks for a project.
	 *
	 * @param int $project_id Term ID.
	 * @return int Number of completed tasks.
	 */
	private static function count_completed_tasks( $project_id ) {
		$transient_key = 'workpress_completed_count_' . $project_id;
		$count = get_transient( $transient_key );
		
		if ( false === $count ) {
			$args = array(
				'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'tax_query'      => array(
					array(
						'taxonomy' => WorkPress_Install::TAX_PROJECT,
						'field'    => 'term_id',
						'terms'    => (int) $project_id,
					),
				),
				'meta_query'     => array(
					array(
						'key'     => '_workpress_status',
						'value'   => array( 'completed', 'closed' ),
						'compare' => 'IN',
					),
				),
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'no_found_rows'          => false,
			);
			$query = new WP_Query( $args );
			$count = $query->found_posts;
			
			set_transient( $transient_key, $count, HOUR_IN_SECONDS );
		}
		
		return (int) $count;
	}

	/**
	 * Invalidate project cache.
	 *
	 * @param int $project_id
	 */
	public static function invalidate_project_cache( $project_id ) {
		wp_cache_delete( 'wp_prj_' . $project_id, 'workpress' );
		delete_transient( 'wp_prj_stats_' . $project_id );
		delete_transient( 'workpress_completed_count_' . $project_id );
	}

	/**
	 * Get default universal generic intake forms schema.
	 *
	 * @return array
	 */
	public static function get_default_intake_forms_schema() {
		return array(
			array(
				'id'                => 'standard_request',
				'name'              => 'نموذج طلب خدمة / عمل قياسي',
				'title_label'       => 'عنوان الطلب / اسم المشروع:',
				'title_placeholder' => 'اكتب اسم أو عنوان طلبك...',
				'title_suggestions' => array(
					'تنفيذ مشروع وخدمة جديدة متكاملة',
					'طلب تعديل وتطوير على أعمال سابقة',
					'استشارة فنية ودراسة متطلبات متخصصة',
					'مهمة دورية وإشراف تنفيذي',
				),
				'desc_label'        => 'بيان وشرح تفاصيل الطلب:',
				'desc_placeholder'  => 'وضح بالتفصيل ما تريده من فريق العمل، المخرجات المستهدفة، وأي متطلبات خاصة...',
				'specs'             => array(
					array(
						'id'          => 'service_tier',
						'type'        => 'select_custom',
						'label'       => 'تصنيف أو نوع الخدمة المطلوبة:',
						'options'     => array( 'خدمة أساسية قياسية', 'خدمة متقدمة شاملة', 'حزمة مخصصة بحسب الاتفاق' ),
						'required'    => true,
					),
					array(
						'id'          => 'deliverables_options',
						'type'        => 'pills',
						'label'       => 'الخيارات والمواصفات المحددة:',
						'options'     => array( 'تسليم سريع ومستعجل', 'توثيق وتدريب مفصل', 'مراجعة واعتماد رسمي', 'دعم ومتابعة مستمرة' ),
						'required'    => false,
					),
					array(
						'id'          => 'budget_est',
						'type'        => 'numeric',
						'label'       => 'الميزانية أو الكمية التقديرية (اختياري):',
						'placeholder' => 'مثال: 5,000',
						'required'    => false,
					),
					array(
						'id'          => 'target_date',
						'type'        => 'date',
						'label'       => 'تاريخ الإنجاز المطلوب (Target Deadline):',
						'required'    => false,
					),
					array(
						'id'          => 'attachments',
						'type'        => 'upload',
						'label'       => 'ملفات ومستندات مرجعية داعمة للطلب:',
						'required'    => false,
					),
				),
			),
		);
	}
}
