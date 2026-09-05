<?php
/**
 * WorkPress Membership Service.
 *
 * Encapsulates domain logic for Project Memberships.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Membership_Service {

	/**
	 * Roles available.
	 */
	const ROLE_MANAGER = 'manager';
	const ROLE_MEMBER  = 'member';
	const ROLE_VIEWER  = 'viewer';

	/**
	 * Add or update member in a project.
	 *
	 * @param int    $project_id Term ID.
	 * @param int    $user_id User ID.
	 * @param string $role Member role.
	 * @return bool Success.
	 */
	public static function add_member( $project_id, $user_id, $role = self::ROLE_MEMBER ) {
		$sanitized_role = sanitize_key( $role );
		$current_role   = get_term_meta( (int) $project_id, '_workpress_member_' . (int) $user_id, true );
		if ( $current_role === $sanitized_role ) {
			return true;
		}
		$result = update_term_meta( (int) $project_id, '_workpress_member_' . (int) $user_id, $sanitized_role );
		if ( $result && class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_project_membership_changed( $project_id, $user_id, $sanitized_role );
		}
		return (bool) $result;
	}

	/**
	 * Remove member from a project.
	 *
	 * @param int $project_id Term ID.
	 * @param int $user_id User ID.
	 * @return bool Success.
	 */
	public static function remove_member( $project_id, $user_id ) {
		$result = delete_term_meta( (int) $project_id, '_workpress_member_' . (int) $user_id );
		if ( $result && class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_project_member_removed( $project_id, $user_id, get_current_user_id() );
		}
		return $result;
	}

	/**
	 * Get user role in a project.
	 *
	 * @param int $project_id Term ID.
	 * @param int $user_id User ID.
	 * @return string|false Role string or false if not a member.
	 */
	public static function get_user_role( $project_id, $user_id ) {
		$role = get_term_meta( (int) $project_id, '_workpress_member_' . (int) $user_id, true );
		return empty( $role ) ? false : $role;
	}

	/**
	 * Check if user is a member of the project.
	 *
	 * @param int $project_id Term ID.
	 * @param int $user_id User ID.
	 * @return bool True if member.
	 */
	public static function is_member( $project_id, $user_id ) {
		return (bool) self::get_user_role( $project_id, $user_id );
	}

	/**
	 * Get all members of a project.
	 *
	 * @param int $project_id Term ID.
	 * @return array List of user IDs with their roles.
	 */
	public static function get_members( $project_id ) {
		$term_meta = get_term_meta( $project_id );
		$members   = array();
		
		if ( empty( $term_meta ) ) {
			return $members;
		}
		
		foreach ( $term_meta as $key => $values ) {
			if ( strpos( $key, '_workpress_member_' ) === 0 ) {
				$user_id = (int) str_replace( '_workpress_member_', '', $key );
				$role    = $values[0];
				
				$user = get_userdata( $user_id );
				if ( $user ) {
					$members[] = array(
						'id'           => $user_id,
						'user_id'      => $user_id,
						'display_name' => $user->display_name,
						'email'        => $user->user_email,
						'role'         => $role,
						'avatar_url'   => get_avatar_url( $user_id ),
						'system_roles' => (array) $user->roles,
						'system_role'  => ! empty( $user->roles ) ? $user->roles[0] : '',
					);
				}
			}
		}
		
		return $members;
	}
}
