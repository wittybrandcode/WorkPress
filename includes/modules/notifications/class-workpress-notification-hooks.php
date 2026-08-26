<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Notification_Hooks {

	public static function init() {
		// Existing hooks (enhanced)
		add_action( 'workpress_task_assigned',           array( __CLASS__, 'on_task_assigned' ), 10, 3 );
		add_action( 'workpress_task_state_changed',      array( __CLASS__, 'on_task_state_changed' ), 10, 4 );
		add_action( 'workpress_contribution_created',    array( __CLASS__, 'on_contribution_created' ), 10, 3 );

		// New hooks
		add_action( 'workpress_task_unassigned',          array( __CLASS__, 'on_task_unassigned' ), 10, 3 );
		add_action( 'workpress_contribution_accepted',    array( __CLASS__, 'on_contribution_accepted' ), 10, 3 );
		add_action( 'workpress_contribution_revoked',     array( __CLASS__, 'on_contribution_revoked' ), 10, 3 );
		add_action( 'workpress_contribution_comment_added', array( __CLASS__, 'on_contribution_comment_added' ), 10, 3 );
		add_action( 'workpress_project_membership_changed', array( __CLASS__, 'on_member_added' ), 10, 3 );
		add_action( 'workpress_project_member_removed',   array( __CLASS__, 'on_member_removed' ), 10, 3 );
		add_action( 'workpress_client_feedback_submitted', array( __CLASS__, 'on_client_feedback' ), 10, 3 );
		add_action( 'workpress_project_request_submitted',    array( __CLASS__, 'on_project_request' ), 10, 2 );
		add_action( 'workpress_project_request_approved',     array( __CLASS__, 'on_project_request_approved' ), 10, 2 );
		add_action( 'workpress_project_request_under_review', array( __CLASS__, 'on_project_request_under_review' ), 10, 3 );
		add_action( 'workpress_project_request_rejected',     array( __CLASS__, 'on_project_request_rejected' ), 10, 3 );

		// Daily cleanup cron
		add_action( 'workpress_daily_cleanup', array( __CLASS__, 'cleanup' ) );
		if ( ! wp_next_scheduled( 'workpress_daily_cleanup' ) ) {
			wp_schedule_event( time(), 'daily', 'workpress_daily_cleanup' );
		}
	}

	// ── Existing Hooks (Enhanced) ──

	public static function on_task_assigned( $task_id, $assignee_ids, $assigner_id ) {
		foreach ( (array) $assignee_ids as $uid ) {
			WorkPress_Notification_Service::notify( $uid, array( 'task_id' => $task_id, 'type' => 'task_assigned', 'actor_id' => $assigner_id ) );
		}
	}

	public static function on_task_state_changed( $task_id, $old, $new, $user_id ) {
		if ( ! class_exists( 'WorkPress_Assignment_Service' ) ) return;
		$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );
		$type      = ( $new === 'open' ) ? 'task_reopened' : 'task_state_changed';

		foreach ( $assignees as $a ) {
			WorkPress_Notification_Service::notify( $a['id'], array( 'task_id' => $task_id, 'type' => $type, 'actor_id' => $user_id ) );
		}
		
		// Notify task author as well
		$post = get_post( $task_id );
		if ( $post && $post->post_author != $user_id ) {
			WorkPress_Notification_Service::notify( $post->post_author, array( 'task_id' => $task_id, 'type' => $type, 'actor_id' => $user_id ) );
		}
	}

	public static function on_contribution_created( $comment_id, $task_id, $user_id ) {
		if ( ! class_exists( 'WorkPress_Assignment_Service' ) ) return;
		$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );

		foreach ( $assignees as $a ) {
			WorkPress_Notification_Service::notify( $a['id'], array( 'task_id' => $task_id, 'type' => 'contribution_created', 'actor_id' => $user_id ) );
		}

		// Dispatch personal webhook to project client if deliverable is marked for client review
		$visibility = get_comment_meta( $comment_id, '_workpress_visibility_scope', true );
		if ( 'internal' !== $visibility && class_exists( 'WorkPress_Webhook_Service' ) ) {
			$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$client_id = (int) get_term_meta( $terms[0]->term_id, '_workpress_client_id', true );
				if ( $client_id > 0 && $client_id !== (int) $user_id ) {
					$task_post = get_post( $task_id );
					WorkPress_Webhook_Service::dispatch_client_personal_webhook( $client_id, 'workpress.deliverable_submitted', array(
						'task_id'      => (int) $task_id,
						'task_title'   => $task_post ? $task_post->post_title : '',
						'project_id'   => (int) $terms[0]->term_id,
						'project_name' => $terms[0]->name,
						'message'      => __( 'تم إيداع مخرج / حل فني جديد بانتظار مراجعتكم.', 'workpress' ),
					) );
				}
			}
		}
	}

	// ── New Hooks ──

	public static function on_task_unassigned( $task_id, $user_ids, $assigner_id ) {
		foreach ( (array) $user_ids as $uid ) {
			WorkPress_Notification_Service::notify( $uid, array( 'task_id' => $task_id, 'type' => 'task_unassigned', 'actor_id' => $assigner_id ) );
		}
	}

	public static function on_contribution_accepted( $comment_id, $task_id, $user_id ) {
		$comment = get_comment( $comment_id );
		if ( ! $comment ) return;
		
		WorkPress_Notification_Service::notify( $comment->user_id, array( 'task_id' => $task_id, 'type' => 'contribution_accepted', 'actor_id' => $user_id ) );

		// Notify client webhook about solution acceptance
		if ( class_exists( 'WorkPress_Webhook_Service' ) ) {
			$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				$client_id = (int) get_term_meta( $terms[0]->term_id, '_workpress_client_id', true );
				if ( $client_id > 0 ) {
					$task_post = get_post( $task_id );
					WorkPress_Webhook_Service::dispatch_client_personal_webhook( $client_id, 'workpress.solution_accepted', array(
						'task_id'      => (int) $task_id,
						'task_title'   => $task_post ? $task_post->post_title : '',
						'project_id'   => (int) $terms[0]->term_id,
						'project_name' => $terms[0]->name,
						'message'      => __( 'تم اعتماد الحل النهائي للمهمة بنجاح.', 'workpress' ),
					) );
				}
			}
		}
	}

	public static function on_contribution_revoked( $comment_id, $task_id, $user_id ) {
		$comment = get_comment( $comment_id );
		if ( ! $comment ) return;
		
		WorkPress_Notification_Service::notify( $comment->user_id, array( 'task_id' => $task_id, 'type' => 'contribution_revoked', 'actor_id' => $user_id ) );
	}

	public static function on_contribution_comment_added( $comment_id, $contribution_id, $commenter_id ) {
		$parent = get_comment( $contribution_id );
		if ( ! $parent ) return;

		$task_id = (int) $parent->comment_post_ID;

		// 1. Notify author of parent contribution if not commenter
		if ( (int) $parent->user_id !== (int) $commenter_id ) {
			WorkPress_Notification_Service::notify(
				$parent->user_id,
				array(
					'task_id'  => $task_id,
					'type'     => 'contribution_comment',
					'actor_id' => $commenter_id,
				)
			);
		}

		// 2. Notify project lead(s) if lead != commenter and lead != parent author
		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) && class_exists( 'WorkPress_Membership_Service' ) ) {
			$project_id = (int) $terms[0]->term_id;
			$members    = WorkPress_Membership_Service::get_members( $project_id );
			foreach ( $members as $m ) {
				if ( in_array( $m['role'], array( 'lead', 'manager' ), true ) ) {
					if ( (int) $m['id'] !== (int) $commenter_id && (int) $m['id'] !== (int) $parent->user_id ) {
						WorkPress_Notification_Service::notify(
							$m['id'],
							array(
								'task_id'  => $task_id,
								'type'     => 'contribution_comment',
								'actor_id' => $commenter_id,
							)
						);
					}
				}
			}
		}
	}

	public static function on_task_closed( $task_id, $user_id ) {
		if ( ! class_exists( 'WorkPress_Assignment_Service' ) ) return;
		$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );
		
		foreach ( $assignees as $a ) {
			WorkPress_Notification_Service::notify( $a['id'], array( 'task_id' => $task_id, 'type' => 'task_closed', 'actor_id' => $user_id ) );
		}
		
		// Notify author
		$post = get_post( $task_id );
		if ( $post && $post->post_author != $user_id ) {
			WorkPress_Notification_Service::notify( $post->post_author, array( 'task_id' => $task_id, 'type' => 'task_closed', 'actor_id' => $user_id ) );
		}
	}

	public static function on_member_added( $project_id, $user_id, $role ) {
		WorkPress_Notification_Service::notify( $user_id, array( 'project_id' => $project_id, 'type' => 'member_added' ) );
	}

	public static function on_member_removed( $project_id, $user_id, $remover_id ) {
		WorkPress_Notification_Service::notify( $user_id, array( 'project_id' => $project_id, 'type' => 'member_removed', 'actor_id' => $remover_id ) );
	}

	public static function on_client_feedback( $comment_id, $task_id, $client_user_id ) {
		// 1. Notify assignees of this task
		if ( class_exists( 'WorkPress_Assignment_Service' ) ) {
			$assignees = WorkPress_Assignment_Service::get_assignees( $task_id );
			foreach ( $assignees as $a ) {
				WorkPress_Notification_Service::notify(
					$a['id'],
					array(
						'task_id'  => $task_id,
						'type'     => 'client_feedback',
						'actor_id' => $client_user_id,
					)
				);
			}
		}

		// 2. Notify project lead & managers
		$terms = wp_get_object_terms( $task_id, WorkPress_Keys::TAX_PROJECT );
		if ( ! empty( $terms ) && ! is_wp_error( $terms ) && class_exists( 'WorkPress_Membership_Service' ) ) {
			$project_id = (int) $terms[0]->term_id;
			$members    = WorkPress_Membership_Service::get_members( $project_id );
			foreach ( $members as $m ) {
				if ( in_array( $m['role'], array( 'lead', 'manager' ), true ) ) {
					WorkPress_Notification_Service::notify(
						$m['id'],
						array(
							'task_id'    => $task_id,
							'project_id' => $project_id,
							'type'       => 'client_feedback',
							'actor_id'   => $client_user_id,
						)
					);
				}
			}
		}
	}

	public static function on_project_request( $project_id, $client_user_id ) {
		// Notify site administrators
		$admins = get_users( array( 'role' => 'administrator' ) );
		foreach ( $admins as $admin ) {
			WorkPress_Notification_Service::notify(
				$admin->ID,
				array(
					'project_id' => $project_id,
					'type'       => 'project_request',
					'actor_id'   => $client_user_id,
				)
			);
		}
	}

	public static function on_project_request_approved( $project_id, $approver_id ) {
		$client_id = (int) get_term_meta( $project_id, '_workpress_client_id', true );
		if ( $client_id <= 0 ) {
			$client_id = (int) get_term_meta( $project_id, '_workpress_created_by', true );
		}

		if ( $client_id > 0 ) {
			// 1. In-app DB notification
			WorkPress_Notification_Service::notify(
				$client_id,
				array(
					'project_id' => $project_id,
					'type'       => 'project_request_approved',
					'actor_id'   => $approver_id,
				)
			);

			// 2. Client Personal Webhook
			if ( class_exists( 'WorkPress_Webhook_Service' ) ) {
				$term = get_term( $project_id, WorkPress_Install::TAX_PROJECT );
				WorkPress_Webhook_Service::dispatch_client_personal_webhook(
					$client_id,
					'workpress.request_approved',
					array(
						'project_id'   => (int) $project_id,
						'project_name' => ( $term && ! is_wp_error( $term ) ) ? $term->name : '',
						'status'       => 'active',
						'approved_by'  => get_the_author_meta( 'display_name', $approver_id ) ?: 'الإدارة',
						'message'      => __( 'تم اعتماد طلبكم رسمياً وتدشين المشروع في المنظومة ', 'workpress' ),
					)
				);
			}
		}
	}

	public static function on_project_request_under_review( $project_id, $actor_id, $reason = '' ) {
		$client_id = (int) get_term_meta( $project_id, '_workpress_client_id', true );
		if ( $client_id <= 0 ) {
			$client_id = (int) get_term_meta( $project_id, '_workpress_created_by', true );
		}

		if ( $client_id > 0 ) {
			// 1. In-app DB notification
			WorkPress_Notification_Service::notify(
				$client_id,
				array(
					'project_id' => $project_id,
					'type'       => 'project_request_under_review',
					'actor_id'   => $actor_id,
				)
			);

			// 2. Client Personal Webhook
			if ( class_exists( 'WorkPress_Webhook_Service' ) ) {
				$term = get_term( $project_id, WorkPress_Install::TAX_PROJECT );
				WorkPress_Webhook_Service::dispatch_client_personal_webhook(
					$client_id,
					'workpress.request_under_review',
					array(
						'project_id'   => (int) $project_id,
						'project_name' => ( $term && ! is_wp_error( $term ) ) ? $term->name : '',
						'status'       => 'under_review',
						'reason'       => $reason,
						'reviewer'     => get_the_author_meta( 'display_name', $actor_id ) ?: 'الإدارة',
						'message'      => __( 'طلبكم قيد الدراسة الهندسية والتدقيق الفني ', 'workpress' ),
					)
				);
			}
		}
	}

	public static function on_project_request_rejected( $project_id, $actor_id, $reason = '' ) {
		$client_id = (int) get_term_meta( $project_id, '_workpress_client_id', true );
		if ( $client_id <= 0 ) {
			$client_id = (int) get_term_meta( $project_id, '_workpress_created_by', true );
		}

		if ( $client_id > 0 ) {
			// 1. In-app DB notification
			WorkPress_Notification_Service::notify(
				$client_id,
				array(
					'project_id' => $project_id,
					'type'       => 'project_request_rejected',
					'actor_id'   => $actor_id,
				)
			);

			// 2. Client Personal Webhook
			if ( class_exists( 'WorkPress_Webhook_Service' ) ) {
				$term = get_term( $project_id, WorkPress_Install::TAX_PROJECT );
				WorkPress_Webhook_Service::dispatch_client_personal_webhook(
					$client_id,
					'workpress.request_rejected',
					array(
						'project_id'   => (int) $project_id,
						'project_name' => ( $term && ! is_wp_error( $term ) ) ? $term->name : '',
						'status'       => 'rejected',
						'reason'       => $reason,
						'reviewer'     => get_the_author_meta( 'display_name', $actor_id ) ?: 'الإدارة',
						'message'      => __( 'تعذر اعتماد الطلب. يرجى مراجعة سبب الرفض.', 'workpress' ),
					)
				);
			}
		}
	}

	// ── Cleanup ──

	public static function cleanup() {
		WorkPress_Notification_DB::cleanup_old( 90 );
	}
}
