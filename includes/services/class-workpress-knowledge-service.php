<?php
/**
 * WorkPress Knowledge Service.
 *
 * Queries accepted evidence (contributions) within the user's visibility scope.
 * Knowledge is not a standalone data entity — it is a derived view of accepted contributions
 * (Principle 11: Knowledge is accepted evidence).
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Knowledge_Service {

	/**
	 * Query accepted knowledge within the user's visibility scope.
	 *
	 * Respects Principle 8 (Membership determines visibility) by only returning
	 * knowledge from projects the user is a member of.
	 *
	 * @param int    $user_id    User requesting knowledge.
	 * @param int    $project_id Optional project ID filter (0 = all visible projects).
	 * @param string $search     Optional search term.
	 * @param int    $per_page   Results per page.
	 * @param int    $page       Page number.
	 * @return array Array with 'items' and 'total' keys.
	 */
	public static function query( $user_id, $project_id = 0, $search = '', $per_page = 20, $page = 1 ) {
		// Step 1: Determine visible project IDs based on membership (Principle 8).
		$visible_project_ids = self::get_visible_project_ids( $user_id, $project_id );

		// If user has no visible projects and no admin override, return empty.
		if ( empty( $visible_project_ids ) && ! user_can( $user_id, 'manage_options' ) ) {
			return array( 'items' => array(), 'total' => 0 );
		}

		// Step 2: Get task IDs belonging to visible projects.
		$task_ids = self::get_task_ids_for_projects( $visible_project_ids, $user_id );

		if ( empty( $task_ids ) ) {
			return array( 'items' => array(), 'total' => 0 );
		}

		// Step 3: Query accepted contributions from those tasks.
		$comment_args = array(
			'post__in'   => $task_ids,
			'post_type'  => WorkPress_Install::CPT_WORK_ITEM,
			'status'     => 'approve',
			'type'       => 'wp_contribution',
			'orderby'    => 'comment_date',
			'order'      => 'DESC',
			'number'     => (int) $per_page,
			'offset'     => ( (int) $page - 1 ) * (int) $per_page,
			'meta_query' => array(
				'relation' => 'AND',
				array(
					'key'   => '_workpress_is_accepted',
					'value' => '1',
				),
				array(
					'relation' => 'OR',
					array(
						'key'     => '_workpress_is_pending_trash',
						'value'   => '1',
						'compare' => '!=',
					),
					array(
						'key'     => '_workpress_is_pending_trash',
						'compare' => 'NOT EXISTS',
					),
				),
			),
		);

		if ( ! empty( $search ) ) {
			$comment_args['search'] = sanitize_text_field( $search );
		}

		$comments = get_comments( $comment_args );

		// Step 4: Count total for pagination.
		$count_args           = $comment_args;
		$count_args['count']  = true;
		$count_args['number'] = 0;
		$count_args['offset'] = 0;
		$total                = (int) get_comments( $count_args );

		// Step 5: Format results.
		$items = array();
		foreach ( $comments as $comment ) {
			$task = get_post( $comment->comment_post_ID );
			if ( ! $task || WorkPress_Install::CPT_WORK_ITEM !== $task->post_type ) {
				continue;
			}

			$item = WorkPress_Contribution_Service::format_contribution_public( $comment );

			// Enrich with task context.
			$item['task_title'] = $task->post_title;
			$item['task_id']    = $task->ID;
			$item['ref_key']    = get_post_meta( $task->ID, '_workpress_ref_key', true ) ?: 'TSK';

			$terms = wp_get_object_terms( $task->ID, WorkPress_Install::TAX_PROJECT );
			$item['project_name'] = ( ! empty( $terms ) && ! is_wp_error( $terms ) ) ? $terms[0]->name : '';
			$item['project_id']   = ( ! empty( $terms ) && ! is_wp_error( $terms ) ) ? $terms[0]->term_id : 0;

			$items[] = $item;
		}

		return array(
			'items' => $items,
			'total' => $total,
		);
	}

	/**
	 * Count knowledge items visible to a user.
	 *
	 * @param int $user_id    User ID.
	 * @param int $project_id Optional project filter.
	 * @return int
	 */
	public static function count( $user_id, $project_id = 0 ) {
		$result = self::query( $user_id, $project_id, '', 1, 1 );
		return $result['total'];
	}

	/**
	 * Get visible project IDs for a user.
	 *
	 * @param int $user_id    User ID.
	 * @param int $project_id Specific project (0 = all visible).
	 * @return array Array of term IDs.
	 */
	public static function get_visible_project_ids( $user_id, $project_id = 0 ) {
		// If a specific project is requested, verify visibility.
		if ( $project_id > 0 ) {
			if ( WorkPress_Permission_Service::can_view_project( $user_id, $project_id ) ) {
				return array( $project_id );
			}
			return array();
		}

		// Otherwise, get all projects the user can see.
		// Admin can see all.
		if ( user_can( $user_id, 'manage_options' ) || user_can( $user_id, 'manage_workpress_settings' ) ) {
			$all_terms = get_terms( array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
				'fields'     => 'ids',
			) );
			return is_wp_error( $all_terms ) ? array() : $all_terms;
		}

		// Regular user: get projects where they are a member.
		$all_terms = get_terms( array(
			'taxonomy'   => WorkPress_Install::TAX_PROJECT,
			'hide_empty' => false,
		) );

		if ( is_wp_error( $all_terms ) || empty( $all_terms ) ) {
			return array();
		}

		$visible = array();
		foreach ( $all_terms as $term ) {
			if ( WorkPress_Membership_Service::is_member( $term->term_id, $user_id ) ) {
				$visible[] = $term->term_id;
			}
		}

		return $visible;
	}

	/**
	 * Get task IDs belonging to given projects.
	 *
	 * @param array $project_ids Array of term IDs.
	 * @param int   $user_id    User ID (for admin override).
	 * @return array Array of post IDs.
	 */
	private static function get_task_ids_for_projects( $project_ids, $user_id = 0 ) {
		$query_args = array(
			'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		);

		// Admin with manage_options can see all tasks.
		if ( user_can( $user_id, 'manage_options' ) && empty( $project_ids ) ) {
			// No filter — get all.
		} elseif ( ! empty( $project_ids ) ) {
			$query_args['tax_query'] = array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => $project_ids,
				),
			);
		} else {
			return array();
		}

		$query = new WP_Query( $query_args );
		return $query->posts;
	}
}
