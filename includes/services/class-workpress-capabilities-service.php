<?php
/**
 * WorkPress Capabilities Service.
 *
 * Implements WordPress-native contextual permissions via map_meta_cap
 * and enforces visibility using pre_get_posts.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Capabilities_Service {

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_filter( 'map_meta_cap', array( __CLASS__, 'map_meta_caps' ), 10, 4 );
		add_action( 'pre_get_posts', array( __CLASS__, 'enforce_task_visibility' ) );
	}

	/**
	 * Map contextual capabilities.
	 *
	 * @param array  $caps    Returns the user's actual capabilities.
	 * @param string $cap     Capability name.
	 * @param int    $user_id The user ID.
	 * @param array  $args    Adds the context to the cap. Typically the object ID.
	 * @return array
	 */
	public static function map_meta_caps( $caps, $cap, $user_id, $args ) {
		// Only intercept specific WorkPress capabilities.
		$wp_caps = array( 'edit_workpress_task', 'read_workpress_task', 'delete_workpress_task' );
		if ( ! in_array( $cap, $wp_caps, true ) ) {
			return $caps;
		}

		// Admins bypass everything.
		if ( user_can( $user_id, 'manage_options' ) ) {
			return $caps; // Let WP default logic handle it (which grants to admin).
		}

		$task_id = isset( $args[0] ) ? (int) $args[0] : 0;
		if ( ! $task_id ) {
			return $caps;
		}

		$post = get_post( $task_id );
		if ( ! $post || WorkPress_Install::CPT_WORK_ITEM !== $post->post_type ) {
			return $caps;
		}

		// 1. Check Project Membership (Visibility Foundation)
		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id = ( ! empty( $terms ) && ! is_wp_error( $terms ) ) ? $terms[0]->term_id : 0;

		if ( $project_id ) {
			if ( ! WorkPress_Membership_Service::is_member( $project_id, $user_id ) ) {
				// Not a member? Completely blocked.
				return array( 'do_not_allow' );
			}
		}

		// 2. Action-Specific Logic based on Project Role and Assignment
		switch ( $cap ) {
			case 'read_workpress_task':
				// Membership is sufficient for reading.
				$caps = array( 'read' ); 
				break;

			case 'edit_workpress_task':
			case 'delete_workpress_task':
				if ( $project_id ) {
					$project_role = WorkPress_Membership_Service::get_user_role( $project_id, $user_id );
					if ( WorkPress_Membership_Service::ROLE_MANAGER === $project_role ) {
						// Project Managers map to the primitive capability.
						$caps = array( 'edit_workpress_tasks' ); 
					} else {
						// Regular members need to be assigned to edit.
						// (Delete is usually blocked for regular members entirely, but we map to primitive caps 
						// which we can control via the role's global capabilities).
						if ( class_exists( 'WorkPress_Assignment_Service' ) ) {
							$assignees = get_post_meta( $task_id, '_workpress_assignee_ids', true ) ?: array();
							if ( in_array( (int) $user_id, (array) $assignees, true ) || (int) $post->post_author === (int) $user_id ) {
								$caps = array( 'edit_workpress_tasks' );
							} else {
								$caps = array( 'do_not_allow' );
							}
						} else {
							$caps = array( 'do_not_allow' );
						}
					}
				} else {
					// Orphaned task logic: Creator can edit.
					if ( (int) $post->post_author === (int) $user_id ) {
						$caps = array( 'edit_workpress_tasks' );
					} else {
						$caps = array( 'do_not_allow' );
					}
				}
				break;
		}

		return $caps;
	}

	/**
	 * Enforce visibility of tasks using pre_get_posts.
	 *
	 * Only show tasks belonging to projects the user is a member of.
	 *
	 * @param WP_Query $query The WP_Query instance (passed by reference).
	 */
	public static function enforce_task_visibility( $query ) {
		// Only run for our CPT
		if ( WorkPress_Install::CPT_WORK_ITEM !== $query->get( 'post_type' ) ) {
			return;
		}

		// Ignore for administrators.
		if ( current_user_can( 'manage_options' ) ) {
			return;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			// Unauthenticated users see nothing.
			$query->set( 'post__in', array( 0 ) );
			return;
		}

		// Get all projects the user is a member of.
		// Since membership is term meta, we find terms where _workpress_member_{user_id} exists.
		$args = array(
			'taxonomy'   => WorkPress_Install::TAX_PROJECT,
			'hide_empty' => false,
			'fields'     => 'ids',
			'meta_query' => array(
				array(
					'key'     => '_workpress_member_' . $user_id,
					'compare' => 'EXISTS',
				),
			),
		);
		$user_projects = get_terms( $args );

		if ( empty( $user_projects ) || is_wp_error( $user_projects ) ) {
			// Not a member of any project? Show no tasks (except perhaps ones they authored without a project).
			$query->set( 'author', $user_id ); 
		} else {
			// Show tasks from these projects, OR authored by the user.
			$tax_query = $query->get( 'tax_query' ) ?: array();
			$tax_query[] = array(
				'taxonomy' => WorkPress_Install::TAX_PROJECT,
				'field'    => 'term_id',
				'terms'    => $user_projects,
				'operator' => 'IN',
			);
			$query->set( 'tax_query', $tax_query );
		}
	}
}
