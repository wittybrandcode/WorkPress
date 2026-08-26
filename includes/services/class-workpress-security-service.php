<?php
/**
 * WorkPress Security Service.
 *
 * Enforces hard delete restrictions and global security rules.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Security_Service {

	public static function init() {
		// Prevent non-admins from permanently deleting WorkPress posts (Tasks)
		add_filter( 'pre_delete_post', array( __CLASS__, 'prevent_hard_delete_post' ), 10, 3 );
		
		// Prevent non-admins from permanently deleting WorkPress terms (Projects)
		add_filter( 'pre_delete_term', array( __CLASS__, 'prevent_hard_delete_term' ), 10, 3 );
		
		// Prevent non-admins from permanently deleting WorkPress comments (Contributions)
		add_filter( 'pre_delete_comment', array( __CLASS__, 'prevent_hard_delete_comment' ), 10, 2 );
	}

	public static function prevent_hard_delete_post( $delete, $post, $force_delete ) {
		if ( ! $force_delete ) {
			return $delete; // Allow moving to trash
		}
		
		if ( ! is_object( $post ) || $post->post_type !== WorkPress_Keys::CPT_WORK_ITEM ) {
			return $delete;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false; // Block permanent deletion
		}

		return $delete;
	}

	public static function prevent_hard_delete_term( $delete, $term_id, $taxonomy = '' ) {
		if ( is_object( $term_id ) && isset( $term_id->taxonomy ) ) {
			$taxonomy = $term_id->taxonomy;
			$term_id  = $term_id->term_id;
		}

		if ( $taxonomy !== WorkPress_Keys::TAX_PROJECT ) {
			return $delete;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false; // Block deletion
		}

		// Notify members assigned to tasks in this project
		$args = array(
			'post_type'      => WorkPress_Keys::CPT_WORK_ITEM,
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Keys::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => (int) $term_id,
				)
			)
		);
		$task_ids = get_posts( $args );
		$users_to_notify = array();

		foreach ( $task_ids as $task_id ) {
			$assignees = get_post_meta( $task_id, WorkPress_Keys::META_TASK_ASSIGNEE_IDS, true );
			if ( empty( $assignees ) ) {
				$assignees = get_post_meta( $task_id, WorkPress_Keys::META_TASK_ASSIGNEES, true );
			}
			if ( is_array( $assignees ) ) {
				foreach ( $assignees as $uid ) {
					$users_to_notify[] = (int) $uid;
				}
			}
		}

		$users_to_notify = array_unique( $users_to_notify );

		if ( ! empty( $users_to_notify ) ) {
			WorkPress_Notification_Service::notify_many( $users_to_notify, array(
				'type'       => 'project_permanently_deleted',
				'project_id' => $term->term_id,
				'actor_id'   => get_current_user_id(),
			) );
		}

		return $delete;
	}

	public static function prevent_hard_delete_comment( $delete, $comment ) {
		// Only check comments on work_items
		$post = get_post( $comment->comment_post_ID );
		if ( ! $post || $post->post_type !== 'work_item' ) {
			return $delete;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return false; // Block deletion
		}

		return $delete;
	}
}
