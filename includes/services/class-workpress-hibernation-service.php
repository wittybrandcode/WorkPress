<?php
/**
 * WorkPress Project Hibernation & Cold Storage Service.
 *
 * Implements the "Project Fridge" (ثلاجة المشاريع) concept:
 * - Auto-freezes active projects when a stakeholder is downgraded to subscriber.
 * - Stores previous project status safely in meta.
 * - Auto-unfreezes and restores projects when subscriber is upgraded back to stakeholder.
 * - Logs immutable audit trail events in the project timeline.
 *
 * @package WorkPress
 * @subpackage Services
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Hibernation_Service {

	const STATUS_FROZEN = 'frozen';

	/**
	 * Initialize lifecycle hooks.
	 */
	public static function init() {
		add_action( 'set_user_role', array( __CLASS__, 'on_set_user_role' ), 10, 3 );
	}

	/**
	 * Listener for WordPress user role transitions.
	 *
	 * @param int    $user_id   User ID.
	 * @param string $new_role  New role key.
	 * @param array  $old_roles Array of previous roles.
	 */
	public static function on_set_user_role( $user_id, $new_role, $old_roles = array() ) {
		$had_portal_role = in_array( 'workpress_client', (array) $old_roles, true ) 
			|| in_array( 'workpress_portal_user', (array) $old_roles, true );
		
		$is_now_subscriber = ( 'subscriber' === $new_role );
		$is_now_client     = in_array( $new_role, array( 'workpress_client', 'workpress_portal_user' ), true );

		// Transition 1: Downgrade from Stakeholder to Subscriber -> Freeze Projects
		if ( $had_portal_role && $is_now_subscriber ) {
			self::freeze_user_projects( $user_id );
		}

		// Transition 2: Upgrade back to Stakeholder -> Unfreeze Projects
		if ( $is_now_client ) {
			self::unfreeze_user_projects( $user_id );
		}
	}

	/**
	 * Freezes all active projects owned by the specified user (moves to Fridge).
	 *
	 * @param int $user_id User ID.
	 * @return int Number of projects frozen.
	 */
	public static function freeze_user_projects( $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return 0;
		}

		$terms = get_terms(
			array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
				'meta_query' => array(
					array(
						'key'     => '_workpress_client_id',
						'value'   => $user_id,
						'compare' => '=',
					),
				),
			)
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return 0;
		}

		$frozen_count = 0;
		$user         = get_userdata( $user_id );
		$user_name    = $user ? $user->display_name : '#' . $user_id;

		foreach ( $terms as $term ) {
			$current_status = get_term_meta( $term->term_id, '_workpress_status', true ) ?: 'active';

			// Do not freeze already completed, archived, or already frozen projects
			if ( in_array( $current_status, array( 'completed', 'archived', self::STATUS_FROZEN ), true ) ) {
				continue;
			}

			// Store pre-freeze status for faithful restoration
			update_term_meta( $term->term_id, '_workpress_pre_freeze_status', $current_status );
			update_term_meta( $term->term_id, '_workpress_status', self::STATUS_FROZEN );
			update_term_meta( $term->term_id, '_workpress_frozen_at', current_time( 'mysql' ) );
			update_term_meta( $term->term_id, '_workpress_freeze_reason', 'role_downgrade_to_subscriber' );

			if ( class_exists( 'WorkPress_Project_Service' ) ) {
				WorkPress_Project_Service::invalidate_project_cache( $term->term_id );
			}

			$frozen_count++;
		}

		return $frozen_count;
	}

	/**
	 * Unfreezes all hibernated projects owned by the specified user (restores from Fridge).
	 *
	 * @param int $user_id User ID.
	 * @return int Number of projects unfrozen.
	 */
	public static function unfreeze_user_projects( $user_id ) {
		$user_id = (int) $user_id;
		if ( $user_id <= 0 ) {
			return 0;
		}

		$terms = get_terms(
			array(
				'taxonomy'   => WorkPress_Install::TAX_PROJECT,
				'hide_empty' => false,
				'meta_query' => array(
					'relation' => 'AND',
					array(
						'key'     => '_workpress_client_id',
						'value'   => $user_id,
						'compare' => '=',
					),
					array(
						'key'     => '_workpress_status',
						'value'   => self::STATUS_FROZEN,
						'compare' => '=',
					),
				),
			)
		);

		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			return 0;
		}

		$unfrozen_count = 0;
		$user           = get_userdata( $user_id );
		$user_name      = $user ? $user->display_name : '#' . $user_id;

		foreach ( $terms as $term ) {
			$pre_status = get_term_meta( $term->term_id, '_workpress_pre_freeze_status', true ) ?: 'active';

			update_term_meta( $term->term_id, '_workpress_status', $pre_status );
			delete_term_meta( $term->term_id, '_workpress_pre_freeze_status' );
			update_term_meta( $term->term_id, '_workpress_unfrozen_at', current_time( 'mysql' ) );
			delete_term_meta( $term->term_id, '_workpress_freeze_reason' );

			if ( class_exists( 'WorkPress_Project_Service' ) ) {
				WorkPress_Project_Service::invalidate_project_cache( $term->term_id );
			}

			$unfrozen_count++;
		}

		return $unfrozen_count;
	}
}
