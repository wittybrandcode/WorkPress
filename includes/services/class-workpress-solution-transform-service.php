<?php
/**
 * WorkPress Solution Transform & Knowledge Synthesis Service
 *
 * Dedicated domain engine for:
 * 1. Solution Acceptance Governance (Principle #11: Output Purification).
 * 2. Cascading Task State Derivation & Project Progress Invalidation.
 * 3. Solution Revocation & Audit Logging.
 * 4. Knowledge Transformation & Publication into Knowledge Tree (Principle #12).
 *
 * @package WorkPress
 * @subpackage Services
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Solution_Transform_Service {

	/**
	 * Accept a contribution as a validated solution (Principle 11).
	 * Cascading rule: Accepting a solution automatically closes the task, checks project completion, and publishes to Knowledge.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $user_id         User accepting the solution.
	 * @return array|WP_Error Updated contribution or error.
	 */
	public static function accept_solution( $contribution_id, $user_id = 0 ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment || 'wp_contribution' !== $comment->comment_type ) {
			return new WP_Error( 'not_found', __( 'المساهمة غير موجودة.', 'workpress' ) );
		}

		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$task_id = (int) $comment->comment_post_ID;

		// Get project ID
		$terms      = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		// Authorization Governance: Lead or Admin only
		if ( class_exists( 'WorkPress_Project_Service' ) && ! WorkPress_Project_Service::is_user_lead( $project_id, $user_id ) ) {
			return new WP_Error( 'forbidden', __( 'عذراً، حق اعتماد الحلول محصور بمدير المشروع أو المدير العام فقط.', 'workpress' ) );
		}

		// 1. Mark contribution as accepted
		update_comment_meta( $comment->comment_ID, '_workpress_is_accepted', '1' );
		update_comment_meta( $comment->comment_ID, '_workpress_accepted_by', (int) $user_id );
		update_comment_meta( $comment->comment_ID, '_workpress_accepted_at', current_time( 'mysql' ) );

		// 2. Cascading: Derive and sync task state automatically
		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		// 3. Log system audit
		$author_name = get_the_author_meta( 'display_name', $user_id );
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf(
					/* translators: %s: User display name */
					__( 'قام %s باعتماد هذه المساهمة كحل رسمي واكتملت المهمة.', 'workpress' ),
					$author_name
				),
				$user_id
			);
		}

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_contribution_accepted( $comment->comment_ID, $comment->comment_post_ID, $user_id );
		}

		if ( $project_id > 0 && class_exists( 'WorkPress_Project_Service' ) ) {
			WorkPress_Project_Service::invalidate_project_cache( $project_id );
		}

		wp_cache_delete( $comment->comment_ID, 'comment' );
		return WorkPress_Contribution_Service::format_contribution_public( get_comment( $comment->comment_ID ) );
	}

	/**
	 * Revoke a contribution from being an accepted solution.
	 * Cascading rule: Revoking a solution reopens the task for review and reopens the project if completed.
	 *
	 * @param int $contribution_id Comment ID.
	 * @param int $user_id         User revoking the solution.
	 * @return array|WP_Error Updated contribution or error.
	 */
	public static function revoke_solution( $contribution_id, $user_id = 0 ) {
		$comment = get_comment( (int) $contribution_id );
		if ( ! $comment || 'wp_contribution' !== $comment->comment_type ) {
			return new WP_Error( 'not_found', __( 'المساهمة غير موجودة.', 'workpress' ) );
		}

		$user_id = $user_id > 0 ? (int) $user_id : get_current_user_id();
		$task_id = (int) $comment->comment_post_ID;

		// Get project ID
		$terms      = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_id = ! empty( $terms ) && ! is_wp_error( $terms ) ? (int) $terms[0]->term_id : 0;

		// Authorization Governance: Lead or Admin only
		if ( class_exists( 'WorkPress_Project_Service' ) && ! WorkPress_Project_Service::is_user_lead( $project_id, $user_id ) ) {
			return new WP_Error( 'forbidden', __( 'عذراً، حق إلغاء اعتماد الحلول محصور بمدير المشروع أو المدير العام فقط.', 'workpress' ) );
		}

		// 1. Remove acceptance metadata
		delete_comment_meta( $comment->comment_ID, '_workpress_is_accepted' );
		delete_comment_meta( $comment->comment_ID, '_workpress_accepted_by' );
		delete_comment_meta( $comment->comment_ID, '_workpress_accepted_at' );

		// 2. Cascading: Derive and sync task state automatically
		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			WorkPress_Task_Service::derive_and_sync_task_state( $task_id );
		}

		// 3. Log system audit
		$author_name = get_the_author_meta( 'display_name', $user_id );
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			WorkPress_Contribution_Service::add_system_log(
				$task_id,
				sprintf(
					/* translators: %s: User display name */
					__( 'قام %s بإلغاء اعتماد الحل وأُعيد فتح المهمة للمراجعة.', 'workpress' ),
					$author_name
				),
				$user_id
			);
		}

		if ( class_exists( 'WorkPress_Hooks' ) ) {
			WorkPress_Hooks::fire_contribution_revoked( $comment->comment_ID, $comment->comment_post_ID, $user_id );
		}

		if ( $project_id > 0 && class_exists( 'WorkPress_Project_Service' ) ) {
			WorkPress_Project_Service::invalidate_project_cache( $project_id );
		}

		wp_cache_delete( $comment->comment_ID, 'comment' );
		return WorkPress_Contribution_Service::format_contribution_public( get_comment( $comment->comment_ID ) );
	}

	/**
	 * Get the accepted solution contribution ID for a task, if any.
	 *
	 * @param int $task_id Task Post ID.
	 * @return int|false Contribution ID or false.
	 */
	public static function get_solution_for_task( $task_id ) {
		$comments = get_comments(
			array(
				'post_id'    => (int) $task_id,
				'meta_key'   => '_workpress_is_accepted',
				'meta_value' => '1',
				'number'     => 1,
			)
		);

		if ( ! empty( $comments ) ) {
			return (int) $comments[0]->comment_ID;
		}

		return false;
	}

	/**
	 * Query accepted solutions across tasks for the Knowledge Base Engine (Principle 11).
	 *
	 * @param int    $project_id Optional project ID filter.
	 * @param string $search     Search term.
	 * @return array Formatted knowledge items.
	 */
	public static function get_knowledge_base( $project_id = 0, $search = '' ) {
		if ( class_exists( 'WorkPress_Knowledge_Service' ) ) {
			$result = WorkPress_Knowledge_Service::query( get_current_user_id(), $project_id, $search );
			return $result['items'];
		}
		return array();
	}
}
