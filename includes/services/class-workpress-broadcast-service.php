<?php
/**
 * WorkPress Broadcast & Operational Alerts Service.
 *
 * Core domain service managing managerial directives, announcements,
 * and automated system alerts (upcoming deadlines, overdue tasks, celebrations, triage).
 *
 * @package WorkPress
 * @subpackage Services
 * @since 2.5.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Broadcast_Service {

	const CPT_BROADCAST       = 'wp_broadcast';
	const OPTION_RULES        = 'workpress_broadcast_rules';
	const TRANSIENT_STREAM    = 'workpress_broadcast_stream';

	const PRIORITY_INFO       = 'info';
	const PRIORITY_WARNING    = 'warning';
	const PRIORITY_URGENT     = 'urgent';

	/**
	 * Default automated alert rules.
	 */
	private static function get_default_rules() {
		return array(
			'deadlines_enabled'         => true,
			'deadlines_threshold_hours' => 48,
			'overdue_enabled'           => true,
			'celebrations_enabled'      => true,
			'triage_pending_enabled'    => true,
			'unassigned_enabled'        => true,
			'slide_interval_seconds'    => 7,
		);
	}

	/**
	 * Get current rules for automated alert generation.
	 *
	 * @return array
	 */
	public static function get_rules() {
		$saved = get_option( self::OPTION_RULES, array() );
		return wp_parse_args( is_array( $saved ) ? $saved : array(), self::get_default_rules() );
	}

	/**
	 * Update automated alert rules.
	 *
	 * @param array $new_rules Rules to save.
	 * @return array Updated rules.
	 */
	public static function update_rules( $new_rules ) {
		$current = self::get_rules();
		$updated = array(
			'deadlines_enabled'         => isset( $new_rules['deadlines_enabled'] ) ? (bool) $new_rules['deadlines_enabled'] : $current['deadlines_enabled'],
			'deadlines_threshold_hours' => isset( $new_rules['deadlines_threshold_hours'] ) ? max( 1, (int) $new_rules['deadlines_threshold_hours'] ) : $current['deadlines_threshold_hours'],
			'overdue_enabled'           => isset( $new_rules['overdue_enabled'] ) ? (bool) $new_rules['overdue_enabled'] : $current['overdue_enabled'],
			'celebrations_enabled'      => isset( $new_rules['celebrations_enabled'] ) ? (bool) $new_rules['celebrations_enabled'] : $current['celebrations_enabled'],
			'triage_pending_enabled'    => isset( $new_rules['triage_pending_enabled'] ) ? (bool) $new_rules['triage_pending_enabled'] : $current['triage_pending_enabled'],
			'unassigned_enabled'        => isset( $new_rules['unassigned_enabled'] ) ? (bool) $new_rules['unassigned_enabled'] : $current['unassigned_enabled'],
			'slide_interval_seconds'    => isset( $new_rules['slide_interval_seconds'] ) ? max( 3, (int) $new_rules['slide_interval_seconds'] ) : $current['slide_interval_seconds'],
		);

		update_option( self::OPTION_RULES, $updated );
		self::invalidate_stream_cache();

		return $updated;
	}

	/**
	 * Invalidate cached live ticker stream.
	 */
	public static function invalidate_stream_cache() {
		delete_transient( self::TRANSIENT_STREAM );
	}

	/**
	 * Create a new managerial announcement / broadcast.
	 *
	 * @param array $data Announcement data.
	 * @param int   $user_id Author user ID.
	 * @return array|WP_Error
	 */
	public static function create_broadcast( $data, $user_id = 0 ) {
		if ( empty( $data['content'] ) && empty( $data['title'] ) ) {
			return new WP_Error( 'missing_content', __( 'Broadcast message content is required.', 'workpress' ), array( 'status' => 400 ) );
		}

		$title   = ! empty( $data['title'] ) ? sanitize_text_field( $data['title'] ) : wp_trim_words( sanitize_text_field( $data['content'] ), 8 );
		$content = ! empty( $data['content'] ) ? wp_kses_post( $data['content'] ) : $title;
		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();

		$post_id = wp_insert_post( array(
			'post_type'    => self::CPT_BROADCAST,
			'post_title'   => $title,
			'post_content' => $content,
			'post_status'  => 'publish',
			'post_author'  => $user_id,
		), true );

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$priority   = ! empty( $data['priority'] ) && in_array( $data['priority'], array( self::PRIORITY_INFO, self::PRIORITY_WARNING, self::PRIORITY_URGENT ), true ) ? $data['priority'] : self::PRIORITY_INFO;
		$start_at   = ! empty( $data['start_at'] ) ? sanitize_text_field( $data['start_at'] ) : current_time( 'mysql' );
		$expires_at = ! empty( $data['expires_at'] ) ? sanitize_text_field( $data['expires_at'] ) : '';
		$action_url = ! empty( $data['action_url'] ) ? esc_url_raw( $data['action_url'] ) : '';

		update_post_meta( $post_id, '_workpress_priority', $priority );
		update_post_meta( $post_id, '_workpress_start_at', $start_at );
		update_post_meta( $post_id, '_workpress_expires_at', $expires_at );
		update_post_meta( $post_id, '_workpress_action_url', $action_url );
		update_post_meta( $post_id, '_workpress_is_archived', 0 );

		self::invalidate_stream_cache();

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_broadcast_created( $post_id, $data, $user_id );
		}

		return self::get_broadcast( $post_id );
	}

	/**
	 * Get single broadcast by ID.
	 *
	 * @param int $id Broadcast post ID.
	 * @return array|WP_Error
	 */
	public static function get_broadcast( $id ) {
		$post = get_post( (int) $id );
		if ( ! $post || self::CPT_BROADCAST !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Broadcast not found.', 'workpress' ), array( 'status' => 404 ) );
		}

		return self::format_broadcast( $post );
	}

	/**
	 * Update an existing broadcast.
	 *
	 * @param int   $id Post ID.
	 * @param array $data Attributes to update.
	 * @return array|WP_Error
	 */
	public static function update_broadcast( $id, $data ) {
		$existing = self::get_broadcast( $id );
		if ( is_wp_error( $existing ) ) {
			return $existing;
		}

		$post_update = array( 'ID' => (int) $id );
		if ( isset( $data['title'] ) ) {
			$post_update['post_title'] = sanitize_text_field( $data['title'] );
		}
		if ( isset( $data['content'] ) ) {
			$post_update['post_content'] = wp_kses_post( $data['content'] );
		}

		if ( count( $post_update ) > 1 ) {
			wp_update_post( $post_update );
		}

		if ( isset( $data['priority'] ) && in_array( $data['priority'], array( self::PRIORITY_INFO, self::PRIORITY_WARNING, self::PRIORITY_URGENT ), true ) ) {
			update_post_meta( $id, '_workpress_priority', $data['priority'] );
		}
		if ( isset( $data['start_at'] ) ) {
			update_post_meta( $id, '_workpress_start_at', sanitize_text_field( $data['start_at'] ) );
		}
		if ( isset( $data['expires_at'] ) ) {
			update_post_meta( $id, '_workpress_expires_at', sanitize_text_field( $data['expires_at'] ) );
		}
		if ( isset( $data['action_url'] ) ) {
			update_post_meta( $id, '_workpress_action_url', esc_url_raw( $data['action_url'] ) );
		}
		if ( isset( $data['is_archived'] ) ) {
			update_post_meta( $id, '_workpress_is_archived', ! empty( $data['is_archived'] ) ? 1 : 0 );
		}

		self::invalidate_stream_cache();

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_broadcast_updated( $id, $data, get_current_user_id() );
		}

		return self::get_broadcast( $id );
	}

	/**
	 * Delete or archive a broadcast.
	 *
	 * @param int  $id Post ID.
	 * @param bool $hard_delete If true, delete permanently.
	 * @return bool|WP_Error
	 */
	public static function delete_broadcast( $id, $hard_delete = false ) {
		$post = get_post( (int) $id );
		if ( ! $post || self::CPT_BROADCAST !== $post->post_type ) {
			return new WP_Error( 'not_found', __( 'Broadcast not found.', 'workpress' ), array( 'status' => 404 ) );
		}

		if ( $hard_delete ) {
			$res = wp_delete_post( $id, true );
		} else {
			// Soft-delete / Archive preserving organizational memory (Principle 13)
			$res = update_post_meta( $id, '_workpress_is_archived', 1 );
		}

		self::invalidate_stream_cache();

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_broadcast_deleted( $id, $hard_delete );
		}

		return (bool) $res;
	}

	/**
	 * Get list of broadcasts with filtering and pagination.
	 *
	 * @param array $args Query arguments.
	 * @return array
	 */
	public static function get_broadcasts( $args = array() ) {
		$page     = ! empty( $args['page'] ) ? max( 1, (int) $args['page'] ) : 1;
		$per_page = ! empty( $args['number'] ) ? max( 1, (int) $args['number'] ) : 50;
		$status   = ! empty( $args['status'] ) ? sanitize_key( $args['status'] ) : 'all';
		$priority = ! empty( $args['priority'] ) ? sanitize_key( $args['priority'] ) : '';
		$search   = ! empty( $args['search'] ) ? sanitize_text_field( $args['search'] ) : '';

		$query_args = array(
			'post_type'      => self::CPT_BROADCAST,
			'post_status'    => 'publish',
			'paged'          => $page,
			'posts_per_page' => $per_page,
			'orderby'        => 'date',
			'order'          => 'DESC',
		);

		if ( ! empty( $search ) ) {
			$query_args['s'] = $search;
		}

		$meta_query = array();

		if ( ! empty( $priority ) ) {
			$meta_query[] = array(
				'key'     => '_workpress_priority',
				'value'   => $priority,
				'compare' => '=',
			);
		}

		// Archive filtering
		if ( 'archived' === $status ) {
			$meta_query[] = array(
				'key'     => '_workpress_is_archived',
				'value'   => '1',
				'compare' => '=',
			);
		} elseif ( 'all' !== $status ) {
			$meta_query[] = array(
				'relation' => 'OR',
				array(
					'key'     => '_workpress_is_archived',
					'compare' => 'NOT EXISTS',
				),
				array(
					'key'     => '_workpress_is_archived',
					'value'   => '0',
					'compare' => '=',
				),
			);
		}

		if ( ! empty( $meta_query ) ) {
			$query_args['meta_query'] = $meta_query;
		}

		$query = new WP_Query( $query_args );
		$items = array();

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $p ) {
				$formatted = self::format_broadcast( $p );

				// Filter by computed status if requested
				if ( 'active' === $status && 'active' !== $formatted['status'] ) {
					continue;
				}
				if ( 'scheduled' === $status && 'scheduled' !== $formatted['status'] ) {
					continue;
				}
				if ( 'expired' === $status && 'expired' !== $formatted['status'] ) {
					continue;
				}

				$items[] = $formatted;
			}
		}

		return array(
			'items'       => $items,
			'total'       => $query->found_posts,
			'total_pages' => $query->max_num_pages,
		);
	}

	/**
	 * Format WP_Post into standardized broadcast array.
	 *
	 * @param WP_Post $post Post object.
	 * @return array
	 */
	public static function format_broadcast( $post ) {
		$post_id     = $post->ID;
		$priority    = get_post_meta( $post_id, '_workpress_priority', true ) ?: self::PRIORITY_INFO;
		$start_at    = get_post_meta( $post_id, '_workpress_start_at', true ) ?: $post->post_date;
		$expires_at  = get_post_meta( $post_id, '_workpress_expires_at', true ) ?: '';
		$action_url  = get_post_meta( $post_id, '_workpress_action_url', true ) ?: '';
		$is_archived = (bool) get_post_meta( $post_id, '_workpress_is_archived', true );

		// Compute operational status
		$now = current_time( 'mysql' );
		if ( $is_archived ) {
			$computed_status = 'archived';
		} elseif ( ! empty( $start_at ) && $start_at > $now ) {
			$computed_status = 'scheduled';
		} elseif ( ! empty( $expires_at ) && $expires_at < $now ) {
			$computed_status = 'expired';
		} else {
			$computed_status = 'active';
		}

		$author_user = get_userdata( $post->post_author );

		return array(
			'id'          => $post_id,
			'title'       => $post->post_title,
			'content'     => $post->post_content,
			'priority'    => $priority,
			'start_at'    => $start_at,
			'expires_at'  => $expires_at,
			'action_url'  => $action_url,
			'is_archived' => $is_archived,
			'status'      => $computed_status,
			'author_id'   => (int) $post->post_author,
			'author_name' => $author_user ? $author_user->display_name : '',
			'created_at'  => $post->post_date,
			'type'        => 'directive',
			'category'    => 'directive',
		);
	}

	/**
	 * Evaluate and extract automated alerts from the system based on rules.
	 *
	 * @return array List of automated alerts.
	 */
	public static function evaluate_automated_alerts() {
		$rules  = self::get_rules();
		$alerts = array();
		$now    = current_time( 'mysql' );

		// 1. Overdue Tasks Alert
		if ( ! empty( $rules['overdue_enabled'] ) ) {
			$overdue_tasks = get_posts( array(
				'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'    => 'publish',
				'posts_per_page' => 5,
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'     => '_workpress_due_at',
						'value'   => $now,
						'compare' => '<',
						'type'    => 'DATETIME',
					),
					array(
						'key'     => '_workpress_due_at',
						'value'   => '',
						'compare' => '!=',
					),
					array(
						'key'     => '_workpress_status',
						'value'   => array( 'completed', 'closed' ),
						'compare' => 'NOT IN',
					),
				),
			) );

			if ( ! empty( $overdue_tasks ) ) {
				$count = count( $overdue_tasks );
				$first = $overdue_tasks[0];
				$alerts[] = array(
					'id'         => 'auto_overdue_' . $first->ID,
					'type'       => 'alert',
					'category'   => 'overdue',
					'priority'   => self::PRIORITY_URGENT,
					'title'      => sprintf(
						/* translators: %d: count of overdue tasks */
						_n( 'Overdue task: %d task requires immediate follow-up', 'Overdue tasks: %d tasks require immediate follow-up', $count, 'workpress' ),
						$count
					),
					'content'    => sprintf(
						/* translators: 1: task title, 2: count */
						__( 'Task "%1$s" and %2$d other items have passed their deadlines without completion.', 'workpress' ),
						$first->post_title,
						$count - 1
					),
					'action_url' => '#/tasks/' . $first->ID,
					'start_at'   => $now,
					'status'     => 'active',
				);
			}
		}

		// 2. Upcoming Deadlines Alert (< X hours)
		if ( ! empty( $rules['deadlines_enabled'] ) ) {
			$threshold_hours = (int) $rules['deadlines_threshold_hours'];
			$threshold_date  = date( 'Y-m-d H:i:s', strtotime( "+{$threshold_hours} hours", current_time( 'timestamp' ) ) );

			$impending_tasks = get_posts( array(
				'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
				'post_status'    => 'publish',
				'posts_per_page' => 3,
				'meta_query'     => array(
					'relation' => 'AND',
					array(
						'key'     => '_workpress_due_at',
						'value'   => array( $now, $threshold_date ),
						'compare' => 'BETWEEN',
						'type'    => 'DATETIME',
					),
					array(
						'key'     => '_workpress_status',
						'value'   => array( 'completed', 'closed' ),
						'compare' => 'NOT IN',
					),
				),
			) );

			foreach ( $impending_tasks as $t ) {
				$due_str = get_post_meta( $t->ID, '_workpress_due_at', true );
				$alerts[] = array(
					'id'         => 'auto_deadline_' . $t->ID,
					'type'       => 'alert',
					'category'   => 'deadline',
					'priority'   => self::PRIORITY_WARNING,
					'title'      => sprintf( __( 'Upcoming deadline: "%s"', 'workpress' ), $t->post_title ),
					'content'    => sprintf( __( 'Task "%s" is due on %s. Please review work progress.', 'workpress' ), $t->post_title, $due_str ),
					'action_url' => '#/tasks/' . $t->ID,
					'start_at'   => $now,
					'status'     => 'active',
				);
			}
		}

		// 3. Pending Triage Client Requests
		if ( ! empty( $rules['triage_pending_enabled'] ) && class_exists( 'WorkPress_Project_Service' ) ) {
			$pending_requests = get_terms( array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
				'number'     => 5,
				'meta_query' => array(
					'relation' => 'AND',
					array(
						'key'     => '_workpress_is_client_request',
						'value'   => '1',
						'compare' => '=',
					),
					array(
						'key'     => '_workpress_status',
						'value'   => 'pending',
						'compare' => '=',
					),
				),
			) );

			if ( ! empty( $pending_requests ) && ! is_wp_error( $pending_requests ) ) {
				$req_count = count( $pending_requests );
				$first_req = $pending_requests[0];
				$alerts[] = array(
					'id'         => 'auto_triage_' . $first_req->term_id,
					'type'       => 'alert',
					'category'   => 'triage',
					'priority'   => self::PRIORITY_WARNING,
					'title'      => sprintf( __( 'New incoming request: "%s"', 'workpress' ), $first_req->name ),
					'content'    => sprintf( __( 'There are %d incoming client requests awaiting review and triage.', 'workpress' ), $req_count ),
					'action_url' => '#/requests',
					'start_at'   => $now,
					'status'     => 'active',
				);
			}
		}

		// 4. Milestone Celebrations (100% completed projects in the last 48h)
		if ( ! empty( $rules['celebrations_enabled'] ) ) {
			$completed_projects = get_terms( array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
				'number'     => 2,
				'meta_query' => array(
					array(
						'key'     => '_workpress_status',
						'value'   => 'completed',
						'compare' => '=',
					),
				),
			) );

			if ( ! empty( $completed_projects ) && ! is_wp_error( $completed_projects ) ) {
				foreach ( $completed_projects as $cp ) {
					$alerts[] = array(
						'id'         => 'auto_celebration_' . $cp->term_id,
						'type'       => 'alert',
						'category'   => 'celebration',
						'priority'   => self::PRIORITY_INFO,
						'title'      => sprintf( __( 'Project Completed: %s (100%%)', 'workpress' ), $cp->name ),
						'content'    => sprintf( __( 'Congratulations to the team! Project "%s" has successfully reached 100%% completion.', 'workpress' ), $cp->name ),
						'action_url' => '#/projects/' . $cp->term_id,
						'start_at'   => $now,
						'status'     => 'active',
					);
				}
			}
		}

		return $alerts;
	}

	/**
	 * Get the live, prioritized queue of stream items for the ticker horizon.
	 *
	 * @return array
	 */
	public static function get_live_stream() {
		$cached = get_transient( self::TRANSIENT_STREAM );
		if ( false !== $cached && is_array( $cached ) ) {
			return $cached;
		}

		$stream = array();
		$now    = current_time( 'mysql' );

		// 1. Fetch active managerial broadcasts
		$query = new WP_Query( array(
			'post_type'      => self::CPT_BROADCAST,
			'post_status'    => 'publish',
			'posts_per_page' => 20,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => array(
				'relation' => 'AND',
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_is_archived',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_is_archived',
						'value'   => '0',
						'compare' => '=',
					),
				),
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_start_at',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_start_at',
						'value'   => $now,
						'compare' => '<=',
						'type'    => 'DATETIME',
					),
				),
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_expires_at',
						'compare' => 'NOT EXISTS',
					),
					array(
						'key'     => '_workpress_expires_at',
						'value'   => '',
						'compare' => '=',
					),
					array(
						'key'     => '_workpress_expires_at',
						'value'   => $now,
						'compare' => '>=',
						'type'    => 'DATETIME',
					),
				),
			),
		) );

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $p ) {
				$stream[] = self::format_broadcast( $p );
			}
		}

		// 2. Fetch automated alerts
		$auto_alerts = self::evaluate_automated_alerts();
		foreach ( $auto_alerts as $alert ) {
			$stream[] = $alert;
		}

		// 3. Fallback notice if stream is completely empty
		if ( empty( $stream ) ) {
			$stream[] = array(
				'id'         => 'fallback_welcome',
				'type'       => 'directive',
				'priority'   => self::PRIORITY_INFO,
				'title'      => __( 'Welcome to WorkPress', 'workpress' ),
				'content'    => __( 'Welcome to WorkPress — Document achievements in contributions and keep task statuses updated.', 'workpress' ),
				'action_url' => '',
				'start_at'   => $now,
				'status'     => 'active',
			);
		}

		// 4. Sort by priority: urgent (3) > warning (2) > info (1)
		$priority_weights = array(
			self::PRIORITY_URGENT  => 3,
			self::PRIORITY_WARNING => 2,
			self::PRIORITY_INFO    => 1,
		);

		usort( $stream, function( $a, $b ) use ( $priority_weights ) {
			$w_a = isset( $priority_weights[ $a['priority'] ] ) ? $priority_weights[ $a['priority'] ] : 1;
			$w_b = isset( $priority_weights[ $b['priority'] ] ) ? $priority_weights[ $b['priority'] ] : 1;
			if ( $w_a === $w_b ) {
				return strcmp( $b['start_at'], $a['start_at'] );
			}
			return $w_b <=> $w_a;
		} );

		// Cache for 5 minutes (300 seconds)
		set_transient( self::TRANSIENT_STREAM, $stream, 300 );

		return apply_filters( 'workpress_broadcast_stream', $stream );
	}
}
