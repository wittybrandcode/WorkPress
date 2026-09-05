<?php
/**
 * WorkPress Task Service.
 *
 * Encapsulates domain logic for Tasks (CPT 'work_item'), including
 * CRUD operations, bulk hydration, checklists, worklogs, and attachments.
 * State machine transitions and lifecycle derivation are delegated to
 * `WorkPress_Task_State_Machine`.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 1.0.0
 * @version 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/class-workpress-task-state-machine.php';

class WorkPress_Task_Service {

	/**
	 * Get tasks matching query args.
	 *
	 * @param array $args Query parameters.
	 * @return array Array of formatted task objects.
	 */
	public static function get_tasks( $args = array() ) {
		$query_args = array(
			'post_type'        => WorkPress_Install::CPT_WORK_ITEM,
			'post_status'      => 'any',
			'suppress_filters' => false,
			'posts_per_page'   => isset( $args['number'] ) ? (int) $args['number'] : 50,
			'paged'            => isset( $args['paged'] ) ? (int) $args['paged'] : 1,
			'orderby'          => 'date',
			'order'            => 'DESC',
		);

		if ( ! empty( $args['project_id'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => (int) $args['project_id'],
				),
			);
		} elseif ( ! empty( $args['project_ids'] ) && is_array( $args['project_ids'] ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => array_map( 'intval', $args['project_ids'] ),
					'operator' => 'IN',
				),
			);
		} elseif ( ! current_user_can( 'manage_options' ) && is_user_logged_in() && class_exists( 'WorkPress_Knowledge_Service' ) ) {
			$visible_ids = WorkPress_Knowledge_Service::get_visible_project_ids( get_current_user_id() );
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => ! empty( $visible_ids ) ? array_map( 'intval', $visible_ids ) : array( 0 ),
					'operator' => 'IN',
				),
			);
		}

		// Keyword search in title/content
		if ( ! empty( $args['search'] ) ) {
			$query_args['s'] = sanitize_text_field( $args['search'] );
		}

		$meta_query = array();
		if ( ! empty( $args['status'] ) ) {
			$statuses = is_array( $args['status'] ) ? $args['status'] : explode( ',', $args['status'] );
			$statuses = array_filter( array_map( 'sanitize_key', array_map( 'trim', $statuses ) ) );
			if ( ! empty( $statuses ) ) {
				$meta_query[] = array(
					'key'     => '_workpress_status',
					'value'   => count( $statuses ) === 1 ? reset( $statuses ) : array_values( $statuses ),
					'compare' => count( $statuses ) === 1 ? '=' : 'IN',
				);
			}
		}

		if ( ! empty( $args['priority'] ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_priority',
				'value'   => sanitize_key( $args['priority'] ),
				'compare' => '=',
			);
		}

		if ( ! empty( $args['assignee'] ) ) {
			if ( 'unassigned' === $args['assignee'] ) {
				$meta_query[] = array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_assignee_ids',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_assignee_ids',
						'value'   => 'a:0:{}',
						'compare' => '=',
					),
					array(
						'key'     => '_workpress_assignee_ids',
						'value'   => '',
						'compare' => '=',
					),
				);
			} elseif ( is_numeric( $args['assignee'] ) ) {
				$meta_query[] = array(
					'key'     => '_workpress_assignee_ids',
					'value'   => '"' . (int) $args['assignee'] . '"',
					'compare' => 'LIKE',
				);
			}
		}

		if ( ! empty( $meta_query ) ) {
			if ( count( $meta_query ) > 1 ) {
				$meta_query['relation'] = 'AND';
			}
			$query_args['meta_query'] = $meta_query;
		}

		$query = new WP_Query( $query_args );
		$tasks = array();

		if ( $query->have_posts() ) {
			$post_ids = wp_list_pluck( $query->posts, 'ID' );

			// High-Performance Bulk Hydration: Prime post metas and project terms in ONE SQL Query (Principle 21)
			if ( ! empty( $post_ids ) ) {
				if ( function_exists( 'update_postmeta_cache' ) ) {
					update_postmeta_cache( $post_ids );
				}
				if ( function_exists( 'update_object_term_cache' ) ) {
					update_object_term_cache( $post_ids, WorkPress_Install::TAX_PROJECT );
				}
			}

			// Prime Caches for Users (Authors & Assignees)
			$user_ids_to_prime = array();
			foreach ( $query->posts as $p ) {
				$user_ids_to_prime[] = (int) $p->post_author;
				$assignees = get_post_meta( $p->ID, '_workpress_assignee_ids', true );
				if ( is_array( $assignees ) ) {
					$user_ids_to_prime = array_merge( $user_ids_to_prime, $assignees );
				}
			}

			if ( ! empty( $user_ids_to_prime ) ) {
				cache_users( array_unique( array_filter( $user_ids_to_prime ) ) );
			}

			while ( $query->have_posts() ) {
				$query->the_post();
				$tasks[] = self::format_task( get_post() );
			}
			wp_reset_postdata();
		}

		return array(
			'items'       => $tasks,
			'total'       => $query->found_posts,
			'total_pages' => $query->max_num_pages,
		);
	}

	/**
	 * Get single task by ID.
	 *
	 * @param int $task_id Post ID.
	 * @return array|WP_Error Formatted task or WP_Error.
	 */
	public static function get_task( $task_id ) {
		$post = get_post( (int) $task_id );
		if ( ! $post || WorkPress_Install::CPT_WORK_ITEM !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Task not found.', 'workpress' ) );
		}

		return self::format_task( $post );
	}

	/**
	 * Create a new task.
	 *
	 * @param array $data Task attributes.
	 * @return array|WP_Error Created task or WP_Error.
	 */
	public static function create_task( $data ) {
		if ( empty( $data['title'] ) ) {
			return new WP_Error( 'missing_title', __( 'Task title is required.', 'workpress' ) );
		}

		$post_id = wp_insert_post(
			array(
				'post_title'   => sanitize_text_field( $data['title'] ),
				'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
				'post_type'    => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'  => 'publish',
				'post_author'  => ! empty( $data['author_id'] ) ? (int) $data['author_id'] : get_current_user_id(),
			),
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		// Attach project taxonomy.
		$project_id = ! empty( $data['project_id'] ) ? (int) $data['project_id'] : 0;
		if ( $project_id > 0 ) {
			wp_set_object_terms( $post_id, $project_id, WorkPress_Install::TAX_PROJECT );
		}

		// Default metadata.
		$status    = ! empty( $data['status'] ) ? sanitize_key( $data['status'] ) : 'open';
		$priority  = ! empty( $data['priority'] ) ? sanitize_key( $data['priority'] ) : 'medium';
		$due_at    = ! empty( $data['due_at'] ) ? sanitize_text_field( $data['due_at'] ) : '';
		$assignees = ! empty( $data['assignee_ids'] ) ? array_map( 'intval', (array) $data['assignee_ids'] ) : array();

		update_post_meta( $post_id, '_workpress_status', $status );
		update_post_meta( $post_id, '_workpress_priority', $priority );
		update_post_meta( $post_id, '_workpress_due_at', $due_at );
		update_post_meta( $post_id, '_workpress_assignee_ids', $assignees );

		if ( isset( $data['estimated_hours'] ) ) {
			update_post_meta( $post_id, '_workpress_estimated_hours', max( 0, round( (float) $data['estimated_hours'], 2 ) ) );
		}

		$cover_id = ! empty( $data['cover_id'] ) ? (int) $data['cover_id'] : 0;
		if ( $cover_id > 0 ) {
			update_post_meta( $post_id, '_workpress_cover_id', $cover_id );
		}

		self::clear_task_cache( $post_id );

		// Initial System Log for creation
		WorkPress_Contribution_Service::add_system_log( $post_id, __( 'Task created.', 'workpress' ) );

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_task_created( $post_id, $data, get_current_user_id() );
		}

		return self::get_task( $post_id );
	}

	/**
	 * Update an existing task.
	 *
	 * @param int   $task_id Task ID.
	 * @param array $data Task data.
	 * @return array|WP_Error Formatted updated task or WP_Error.
	 */
	public static function update_task( $task_id, $data ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		if ( empty( $data['title'] ) ) {
			return new WP_Error( 'missing_title', __( 'Task title is required.', 'workpress' ) );
		}

		$post_update = array(
			'ID'           => (int) $task_id,
			'post_title'   => sanitize_text_field( $data['title'] ),
			'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : '',
		);

		$result = wp_update_post( $post_update, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$changes = array();
		if ( $data['title'] !== $task['title'] ) {
			$changes[] = __( 'Title', 'workpress' );
		}
		if ( isset( $data['priority'] ) && $data['priority'] !== $task['priority'] ) {
			update_post_meta( $task_id, '_workpress_priority', sanitize_key( $data['priority'] ) );
			$changes[] = __( 'Priority', 'workpress' );
		}
		if ( isset( $data['estimated_hours'] ) ) {
			$new_est = max( 0, round( (float) $data['estimated_hours'], 2 ) );
			if ( $new_est !== (float) ( $task['estimated_hours'] ?? 0 ) ) {
				update_post_meta( $task_id, '_workpress_estimated_hours', $new_est );
				$changes[] = __( 'Estimated hours', 'workpress' );
			}
		}

		if ( isset( $data['project_id'] ) && (int) $data['project_id'] !== (int) $task['project_id'] ) {
			wp_set_object_terms( $task_id, array( (int) $data['project_id'] ), WorkPress_Install::TAX_PROJECT );
			$changes[] = __( 'Project', 'workpress' );
		}

		if ( isset( $data['due_at'] ) ) {
			$due = sanitize_text_field( $data['due_at'] );
			if ( $due !== ( $task['due_at'] ?? '' ) ) {
				update_post_meta( $task_id, '_workpress_due_at', $due );
				$changes[] = __( 'Due date', 'workpress' );
			}
		}

		if ( isset( $data['cover_id'] ) ) {
			if ( empty( $data['cover_id'] ) ) {
				delete_post_meta( $task_id, '_workpress_cover_id' );
			} else {
				update_post_meta( $task_id, '_workpress_cover_id', (int) $data['cover_id'] );
			}
		}

		self::clear_task_cache( $task_id );

		if ( ! empty( $changes ) && class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf(
					/* translators: %s: Comma separated list of changed fields */
					__( 'Task details modified: %s.', 'workpress' ),
					implode( '، ', $changes )
				),
				get_current_user_id()
			);
		}

		return self::get_task( $task_id );
	}

	/**
	 * Format WP_Post into standardized task array.
	 *
	 * @param WP_Post $post Post object.
	 * @return array Formatted task.
	 */
	private static function format_task( $post ) {
		$terms      = wp_get_object_terms( $post->ID, WorkPress_Install::TAX_PROJECT );
		$project    = ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0] : null;
		$prj_prefix = $project ? ( get_term_meta( $project->term_id, '_workpress_prefix', true ) ?: 'PRJ' ) : 'TASK';
		$ref_key    = $prj_prefix . '-' . $post->ID;

		$author_user = get_userdata( $post->post_author );
		$author_name = $author_user ? $author_user->display_name : '';

		$status   = get_post_meta( $post->ID, '_workpress_status', true ) ?: 'open';
		$status   = self::normalize_status( $status );

		$priority = get_post_meta( $post->ID, '_workpress_priority', true ) ?: 'medium';

		$cover_id  = (int) get_post_meta( $post->ID, '_workpress_cover_id', true );
		if ( ! $cover_id ) {
			$cover_id = (int) get_post_thumbnail_id( $post->ID );
		}
		$cover_url = $cover_id ? wp_get_attachment_image_url( $cover_id, 'large' ) : '';
		if ( ! $cover_url && $cover_id ) {
			$cover_url = wp_get_attachment_url( $cover_id ) ?: '';
		}

		$checklists = self::get_task_checklists( $post->ID );
		$checklists_count = count( $checklists );
		$checklists_completed = 0;
		foreach ( $checklists as $chk ) {
			if ( ! empty( $chk['is_completed'] ) ) {
				$checklists_completed++;
			}
		}
		$checklists_progress = $checklists_count > 0 ? round( ( $checklists_completed / $checklists_count ) * 100 ) : 0;

		$estimated_hours = (float) get_post_meta( $post->ID, '_workpress_estimated_hours', true );
		$logged_hours    = (float) get_post_meta( $post->ID, '_workpress_logged_hours', true );
		$remaining_hours = max( 0.0, round( $estimated_hours - $logged_hours, 2 ) );
		$time_progress   = $estimated_hours > 0 ? round( ( $logged_hours / $estimated_hours ) * 100 ) : 0;
		$worklogs        = self::get_task_worklogs( $post->ID );

		$attachments = self::get_task_attachments( $post->ID );

		$formatted = array(
			'id'                         => $post->ID,
			'ref_key'                    => $ref_key,
			'title'                      => $post->post_title,
			'content'                    => $post->post_content,
			'status'                     => sanitize_key( $status ),
			'priority'                   => sanitize_key( $priority ),
			'due_at'                     => get_post_meta( $post->ID, '_workpress_due_at', true ),
			'assignee_ids'               => get_post_meta( $post->ID, '_workpress_assignee_ids', true ) ?: array(),
			'project_id'                 => $project ? $project->term_id : 0,
			'project_name'               => $project ? $project->name : '',
			'author_id'                  => (int) $post->post_author,
			'author_name'                => $author_name,
			'created_at'                 => $post->post_date,
			'comments_num'               => (int) $post->comment_count,
			'cover_id'                   => $cover_id,
			'cover_url'                  => $cover_url,
			'assignees'                  => class_exists( 'WorkPress_Assignment_Service' ) ? WorkPress_Assignment_Service::get_assignees( $post->ID ) : array(),
			'is_pending_trash'           => (bool) get_post_meta( $post->ID, '_workpress_is_pending_trash', true ),
			'trash_reason'               => get_post_meta( $post->ID, '_workpress_trash_reason', true ),
			'checklists'                 => $checklists,
			'checklists_count'           => $checklists_count,
			'checklists_completed_count' => $checklists_completed,
			'checklists_progress'        => $checklists_progress,
			'estimated_hours'            => $estimated_hours,
			'logged_hours'               => $logged_hours,
			'remaining_hours'            => $remaining_hours,
			'time_progress'              => $time_progress,
			'worklogs'                   => $worklogs,
			'worklogs_count'             => count( $worklogs ),
			'attachments'                => $attachments,
			'attachments_count'          => count( $attachments ),
		);

		return apply_filters( 'workpress_prepare_task_response', $formatted, $post );
	}

	// ------------------------------------------------------------------------
	// State Machine Delegation Proxies (WorkPress_Task_State_Machine)
	// ------------------------------------------------------------------------

	public static function normalize_status( $status ) {
		return WorkPress_Task_State_Machine::normalize_status( $status );
	}

	public static function count_real_contributions( $task_id ) {
		return WorkPress_Task_State_Machine::count_real_contributions( $task_id );
	}

	public static function derive_and_sync_task_state( $task_id ) {
		return WorkPress_Task_State_Machine::derive_and_sync_task_state( $task_id );
	}

	public static function migrate_and_normalize_all_states() {
		WorkPress_Task_State_Machine::migrate_and_normalize_all_states();
	}

	public static function update_task_status( $task_id, $new_status, $user_id = 0 ) {
		return WorkPress_Task_State_Machine::update_task_status( $task_id, $new_status, $user_id );
	}

	public static function close_task( $task_id, $user_id = 0 ) {
		return WorkPress_Task_State_Machine::close_task( $task_id, $user_id );
	}

	public static function reopen_task( $task_id, $user_id = 0 ) {
		return WorkPress_Task_State_Machine::reopen_task( $task_id, $user_id );
	}

	public static function trash_request( $task_id, $reason = '', $user_id = 0 ) {
		return WorkPress_Task_State_Machine::trash_request( $task_id, $reason, $user_id );
	}

	public static function restore_from_trash( $task_id, $user_id = 0 ) {
		return WorkPress_Task_State_Machine::restore_from_trash( $task_id, $user_id );
	}

	public static function delete_task( $task_id ) {
		return WorkPress_Task_State_Machine::delete_task( $task_id );
	}

	public static function clear_task_cache( $task_id ) {
		WorkPress_Task_State_Machine::clear_task_cache( $task_id );
	}

	// ------------------------------------------------------------------------
	// Time Tracking & Worklogs Engine
	// ------------------------------------------------------------------------

	/**
	 * Get worklogs for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Worklogs list.
	 */
	public static function get_task_worklogs( $task_id ) {
		$logs = get_post_meta( (int) $task_id, '_workpress_worklogs', true );
		if ( ! is_array( $logs ) ) {
			return array();
		}
		return $logs;
	}

	/**
	 * Set estimated hours for a task.
	 *
	 * @param int   $task_id Task ID.
	 * @param float $hours Estimated hours.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function set_estimated_hours( $task_id, $hours ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$hours = max( 0, round( (float) $hours, 2 ) );
		update_post_meta( (int) $task_id, '_workpress_estimated_hours', $hours );
		self::clear_task_cache( $task_id );

		return self::get_task( $task_id );
	}

	/**
	 * Add a worklog to a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param float  $hours Hours spent.
	 * @param string $note Work note.
	 * @param string $date Date of work.
	 * @param int    $user_id User logging.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function add_worklog( $task_id, $hours, $note = '', $date = '', $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$hours = round( (float) $hours, 2 );
		if ( $hours <= 0 ) {
			return new WP_Error( 'invalid_hours', __( 'Logged hours must be greater than zero.', 'workpress' ) );
		}

		$user_id   = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$user_data = get_userdata( $user_id );
		$user_name = $user_data ? $user_data->display_name : __( 'User', 'workpress' );
		$date      = ! empty( $date ) ? sanitize_text_field( $date ) : current_time( 'Y-m-d' );

		$worklogs = self::get_task_worklogs( $task_id );

		$new_log = array(
			'id'          => 'log_' . time() . '_' . wp_rand( 100, 999 ),
			'user_id'     => $user_id,
			'user_name'   => $user_name,
			'user_avatar' => get_avatar_url( $user_id, array( 'size' => 48 ) ),
			'hours'       => $hours,
			'note'        => sanitize_textarea_field( $note ),
			'date'        => $date,
			'created_at'  => current_time( 'mysql' ),
		);

		$worklogs[] = $new_log;
		update_post_meta( (int) $task_id, '_workpress_worklogs', $worklogs );

		// Recalculate logged hours total
		$total_logged = 0;
		foreach ( $worklogs as $w ) {
			$total_logged += (float) ( $w['hours'] ?? 0 );
		}
		$total_logged = round( $total_logged, 2 );
		update_post_meta( (int) $task_id, '_workpress_logged_hours', $total_logged );

		self::clear_task_cache( $task_id );

		// System Log
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf( __( '%1$s logged %2$s work hours: "%3$s"', 'workpress' ), $user_name, $hours, $note ?: __( 'Work without notes', 'workpress' ) ),
				$user_id
			);
		}

		return array(
			'worklogs'     => $worklogs,
			'total_logged' => $total_logged,
			'task'         => self::get_task( $task_id ),
		);
	}

	/**
	 * Delete a worklog from a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $log_id Worklog ID.
	 * @param int    $user_id User deleting.
	 * @return array|WP_Error Updated task or error.
	 */
	public static function delete_worklog( $task_id, $log_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$worklogs = self::get_task_worklogs( $task_id );
		$filtered = array();
		$found    = false;

		foreach ( $worklogs as $w ) {
			if ( $w['id'] === $log_id ) {
				$found = true;
				continue;
			}
			$filtered[] = $w;
		}

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Work log not found.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_worklogs', $filtered );

		// Recalculate logged hours total
		$total_logged = 0;
		foreach ( $filtered as $w ) {
			$total_logged += (float) ( $w['hours'] ?? 0 );
		}
		$total_logged = round( $total_logged, 2 );
		update_post_meta( (int) $task_id, '_workpress_logged_hours', $total_logged );

		self::clear_task_cache( $task_id );

		return array(
			'worklogs'     => $filtered,
			'total_logged' => $total_logged,
			'task'         => self::get_task( $task_id ),
		);
	}

	// ------------------------------------------------------------------------
	// Checklists Engine
	// ------------------------------------------------------------------------

	/**
	 * Get checklists for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Checklist items.
	 */
	public static function get_task_checklists( $task_id ) {
		$checklists = get_post_meta( (int) $task_id, '_workpress_checklists', true );
		if ( ! is_array( $checklists ) ) {
			return array();
		}
		return $checklists;
	}

	/**
	 * Add a checklist item to a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $title Item title.
	 * @param int    $user_id User adding item.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function add_checklist_item( $task_id, $title, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$title = sanitize_text_field( trim( $title ) );
		if ( empty( $title ) ) {
			return new WP_Error( 'empty_title', __( 'Checklist item title is required.', 'workpress' ) );
		}

		$user_id    = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$checklists = self::get_task_checklists( $task_id );

		$new_item = array(
			'id'           => 'chk_' . time() . '_' . wp_rand( 100, 999 ),
			'title'        => $title,
			'is_completed' => false,
			'created_by'   => $user_id,
			'created_at'   => current_time( 'mysql' ),
			'completed_by' => 0,
			'completed_at' => '',
		);

		$checklists[] = $new_item;
		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Toggle checklist item completion.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param int    $user_id User toggling.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function toggle_checklist_item( $task_id, $item_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$user_id    = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$checklists = self::get_task_checklists( $task_id );
		$found      = false;

		foreach ( $checklists as &$item ) {
			if ( $item['id'] === $item_id ) {
				$item['is_completed'] = ! ( ! empty( $item['is_completed'] ) );
				if ( $item['is_completed'] ) {
					$item['completed_by'] = $user_id;
					$item['completed_at'] = current_time( 'mysql' );
				} else {
					$item['completed_by'] = 0;
					$item['completed_at'] = '';
				}
				$found = true;
				break;
			}
		}
		unset( $item );

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Checklist item not found.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Update checklist item title.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param string $title New title.
	 * @param int    $user_id User updating.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function update_checklist_item( $task_id, $item_id, $title, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$title = sanitize_text_field( trim( $title ) );
		if ( empty( $title ) ) {
			return new WP_Error( 'empty_title', __( 'Checklist item title is required.', 'workpress' ) );
		}

		$checklists = self::get_task_checklists( $task_id );
		$found      = false;

		foreach ( $checklists as &$item ) {
			if ( $item['id'] === $item_id ) {
				$item['title'] = $title;
				$found         = true;
				break;
			}
		}
		unset( $item );

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Checklist item not found.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $checklists );
		self::clear_task_cache( $task_id );

		return $checklists;
	}

	/**
	 * Delete a checklist item from a task.
	 *
	 * @param int    $task_id Task ID.
	 * @param string $item_id Item ID.
	 * @param int    $user_id User deleting.
	 * @return array|WP_Error Updated checklists array or error.
	 */
	public static function delete_checklist_item( $task_id, $item_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$checklists = self::get_task_checklists( $task_id );
		$filtered   = array();
		$found      = false;

		foreach ( $checklists as $item ) {
			if ( $item['id'] === $item_id ) {
				$found = true;
				continue;
			}
			$filtered[] = $item;
		}

		if ( ! $found ) {
			return new WP_Error( 'not_found', __( 'Checklist item not found.', 'workpress' ) );
		}

		update_post_meta( (int) $task_id, '_workpress_checklists', $filtered );
		self::clear_task_cache( $task_id );

		return $filtered;
	}

	// ------------------------------------------------------------------------
	// Attachments Engine
	// ------------------------------------------------------------------------

	/**
	 * Get attachments for a task.
	 *
	 * @param int $task_id Task ID.
	 * @return array Formatted attachments list.
	 */
	public static function get_task_attachments( $task_id ) {
		$att_ids = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			return array();
		}

		$attachments = array();
		foreach ( $att_ids as $att_id ) {
			$att_id = (int) $att_id;
			if ( $att_id > 0 ) {
				$file_path = get_attached_file( $att_id );
				$file_size = $file_path && file_exists( $file_path ) ? size_format( filesize( $file_path ), 1 ) : '';
				$mime_type = get_post_mime_type( $att_id );
				$url       = wp_get_attachment_url( $att_id );
				if ( $url ) {
					$attachments[] = array(
						'id'        => $att_id,
						'name'      => get_the_title( $att_id ) ?: basename( $file_path ?: 'file' ),
						'url'       => $url,
						'mime_type' => $mime_type,
						'size'      => $file_size,
						'is_image'  => wp_attachment_is_image( $att_id ),
					);
				}
			}
		}

		return $attachments;
	}

	/**
	 * Add attachment to a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $attachment_id Attachment ID.
	 * @param int $user_id User ID.
	 * @return array|WP_Error Updated attachments or error.
	 */
	public static function add_task_attachment( $task_id, $attachment_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$attachment_id = (int) $attachment_id;
		if ( $attachment_id <= 0 || ! wp_get_attachment_url( $attachment_id ) ) {
			return new WP_Error( 'invalid_attachment', __( 'Invalid attachment.', 'workpress' ) );
		}

		$att_ids = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			$att_ids = array();
		}

		if ( ! in_array( $attachment_id, $att_ids, true ) ) {
			$att_ids[] = $attachment_id;
			update_post_meta( (int) $task_id, '_workpress_attachment_ids', $att_ids );
			self::clear_task_cache( $task_id );

			if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
				$user_id   = $user_id > 0 ? (int) $user_id : get_current_user_id();
				$user_data = get_userdata( $user_id );
				$user_name = $user_data ? $user_data->display_name : __( 'User', 'workpress' );
				$att_title = get_the_title( $attachment_id ) ?: __( 'Attached File', 'workpress' );
				WorkPress_Contribution_Service::add_system_log(
					$task_id,
					sprintf( __( '%1$s added a new attachment to task: "%2$s"', 'workpress' ), $user_name, $att_title ),
					$user_id
				);
			}
		}

		return self::get_task_attachments( $task_id );
	}

	/**
	 * Delete attachment from a task.
	 *
	 * @param int $task_id Task ID.
	 * @param int $attachment_id Attachment ID.
	 * @param int $user_id User ID.
	 * @return array|WP_Error Updated attachments or error.
	 */
	public static function delete_task_attachment( $task_id, $attachment_id, $user_id = 0 ) {
		$task = self::get_task( $task_id );
		if ( is_wp_error( $task ) ) {
			return $task;
		}

		$attachment_id = (int) $attachment_id;
		$att_ids       = get_post_meta( (int) $task_id, '_workpress_attachment_ids', true );
		if ( ! is_array( $att_ids ) ) {
			$att_ids = array();
		}

		$filtered = array_values( array_diff( $att_ids, array( $attachment_id ) ) );
		update_post_meta( (int) $task_id, '_workpress_attachment_ids', $filtered );
		self::clear_task_cache( $task_id );

		return self::get_task_attachments( $task_id );
	}
}
