<?php
/**
 * WorkPress Report & Analytics Service.
 *
 * Encapsulates domain logic for Executive Sign-off Reports,
 * Compiled Knowledge Books (Markdown/PDF), and Workspace KPI Insights.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Report_Service {

	/**
	 * Get full executive summary report for a project.
	 *
	 * @param int $project_id Project Term ID.
	 * @return array|WP_Error Formatted executive report data.
	 */
	public static function get_project_summary( $project_id ) {
		$project_id = (int) $project_id;
		$project = WorkPress_Project_Service::get_project( $project_id );
		if ( is_wp_error( $project ) || ! $project ) {
			return new WP_Error( 'project_not_found', __( 'المشروع غير موجود.', 'workpress' ) );
		}

		// Retrieve all tasks for this project (unlimited).
		$tasks_res = WorkPress_Task_Service::get_tasks( array(
			'project_id' => $project_id,
			'number'     => -1,
		) );
		$tasks = isset( $tasks_res['items'] ) ? $tasks_res['items'] : array();

		$total_tasks      = count( $tasks );
		$completed_tasks  = 0;
		$in_progress_tasks = 0;
		$open_tasks       = 0;
		$priority_counts  = array(
			'urgent' => 0,
			'high'   => 0,
			'medium' => 0,
			'low'    => 0,
		);

		$tasks_summary = array();
		$task_ids      = array();

		foreach ( $tasks as $task ) {
			$task_ids[] = (int) $task['id'];
			$status     = ! empty( $task['status'] ) ? $task['status'] : 'open';
			$priority   = ! empty( $task['priority'] ) ? $task['priority'] : 'medium';

			if ( in_array( $status, array( 'completed', 'closed' ), true ) ) {
				$completed_tasks++;
			} elseif ( in_array( $status, array( 'in_progress', 'in_review' ), true ) ) {
				$in_progress_tasks++;
			} else {
				$open_tasks++;
			}

			if ( isset( $priority_counts[ $priority ] ) ) {
				$priority_counts[ $priority ]++;
			}

			$tasks_summary[] = array(
				'id'          => (int) $task['id'],
				'ref_key'     => ! empty( $task['ref_key'] ) ? $task['ref_key'] : '#' . $task['id'],
				'title'       => $task['title'],
				'status'      => $status,
				'priority'    => $priority,
				'assignee'    => ! empty( $task['assignees'] ) && is_array( $task['assignees'] ) ? implode( '، ', array_filter( wp_list_pluck( $task['assignees'], 'display_name' ) ) ) : __( 'غير مسند', 'workpress' ),
				'created_at'  => $task['created_at'],
				'due_date'    => ! empty( $task['due_at'] ) ? $task['due_at'] : null,
			);
		}

		$completion_rate = $total_tasks > 0 ? round( ( $completed_tasks / $total_tasks ) * 100 ) : 0;

		// Retrieve all deliverables / accepted solutions for this project.
		$deliverables = self::get_project_accepted_solutions( $project_id, $task_ids );

		// Project Members
		$members = class_exists( 'WorkPress_Membership_Service' ) ? WorkPress_Membership_Service::get_members( $project_id ) : array();

		// Organization info
		$org_name = get_bloginfo( 'name' );
		$org_desc = get_bloginfo( 'description' );

		// Calculate KPIs
		$kpis = self::calculate_project_kpis( $project_id, $tasks, $deliverables );

		return array(
			'project'          => $project,
			'organization'     => array(
				'name'        => $org_name,
				'description' => $org_desc,
				'logo_url'    => get_site_icon_url(),
				'generated_at'=> current_time( 'mysql' ),
			),
			'metrics'          => array(
				'total_tasks'       => $total_tasks,
				'completed_tasks'   => $completed_tasks,
				'in_progress_tasks' => $in_progress_tasks,
				'open_tasks'        => $open_tasks,
				'completion_rate'   => $completion_rate,
				'priority_counts'   => $priority_counts,
				'deliverables_count'=> count( $deliverables ),
				'members_count'     => count( $members ),
			),
			'kpis'             => $kpis,
			'members'          => $members,
			'deliverables'     => $deliverables,
			'tasks'            => $tasks_summary,
		);
	}

	/**
	 * Retrieve all accepted solutions (Deliverables) for a project.
	 *
	 * @param int   $project_id Project Term ID.
	 * @param array $task_ids   List of Task Post IDs.
	 * @return array Array of accepted deliverables.
	 */
	public static function get_project_accepted_solutions( $project_id, $task_ids = array() ) {
		if ( empty( $task_ids ) ) {
			$tasks_res = WorkPress_Task_Service::get_tasks( array(
				'project_id' => (int) $project_id,
				'number'     => -1,
			) );
			$tasks    = isset( $tasks_res['items'] ) ? $tasks_res['items'] : array();
			$task_ids = wp_list_pluck( $tasks, 'id' );
		}

		if ( empty( $task_ids ) ) {
			return array();
		}

		$comments = get_comments( array(
			'post__in'   => $task_ids,
			'type'       => WorkPress_Keys::COMMENT_CONTRIBUTION,
			'status'     => 'approve',
			'meta_query' => array(
				array(
					'key'     => '_workpress_is_accepted',
					'value'   => '1',
					'compare' => '=',
				),
			),
			'orderby'    => 'comment_date',
			'order'      => 'ASC',
		) );

		$deliverables = array();
		foreach ( $comments as $comment ) {
			$task_post   = get_post( $comment->comment_post_ID );
			$author_user = get_userdata( $comment->user_id );
			$ref_key     = get_post_meta( $comment->comment_post_ID, '_workpress_ref_key', true );
			if ( empty( $ref_key ) ) {
				$ref_key = '#' . $comment->comment_post_ID;
			}

			// Attachments
			$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachment_ids', true );
			if ( empty( $att_ids ) ) {
				$att_ids = get_comment_meta( $comment->comment_ID, '_workpress_attachments', true );
			}
			$attachments = array();
			if ( is_array( $att_ids ) ) {
				foreach ( $att_ids as $aid ) {
					if ( is_numeric( $aid ) && (int) $aid > 0 ) {
						$attachments[] = array(
							'id'   => (int) $aid,
							'name' => get_the_title( $aid ),
							'url'  => wp_get_attachment_url( $aid ),
						);
					} elseif ( is_array( $aid ) && ! empty( $aid['url'] ) ) {
						$attachments[] = $aid;
					}
				}
			}

			// Accepted By
			$accepted_by_id = (int) get_comment_meta( $comment->comment_ID, '_workpress_accepted_by', true );
			$accepted_by_user = $accepted_by_id ? get_userdata( $accepted_by_id ) : null;

			$deliverables[] = array(
				'id'               => (int) $comment->comment_ID,
				'task_id'          => (int) $comment->comment_post_ID,
				'task_ref'         => $ref_key,
				'task_title'       => $task_post ? $task_post->post_title : '',
				'content'          => $comment->comment_content,
				'accepted_at'      => $comment->comment_date,
				'author_name'      => $author_user ? $author_user->display_name : $comment->comment_author,
				'author_avatar'    => get_avatar_url( $comment->user_id, array( 'size' => 48 ) ),
				'accepted_by_name' => $accepted_by_user ? $accepted_by_user->display_name : __( 'قائد المشروع', 'workpress' ),
				'attachments'      => $attachments,
			);
		}

		return $deliverables;
	}

	/**
	 * Calculate project KPIs and velocity metrics.
	 *
	 * @param int   $project_id   Project ID.
	 * @param array $tasks        Tasks array.
	 * @param array $deliverables Deliverables array.
	 * @return array Calculated KPIs.
	 */
	public static function calculate_project_kpis( $project_id, $tasks = array(), $deliverables = array() ) {
		$task_ids = wp_list_pluck( $tasks, 'id' );

		// 1. Total technical contributions (proposals + implementations)
		$total_proposals = 0;
		if ( ! empty( $task_ids ) ) {
			$total_proposals = get_comments( array(
				'post__in' => $task_ids,
				'type'     => WorkPress_Keys::COMMENT_CONTRIBUTION,
				'count'    => true,
				'meta_query' => array(
					array(
						'key'     => '_workpress_type',
						'value'   => array( 'proposal', 'implementation' ),
						'compare' => 'IN',
					),
				),
			) );
		}

		$accepted_count = count( $deliverables );
		$acceptance_rate = $total_proposals > 0 ? round( ( $accepted_count / $total_proposals ) * 100 ) : 100;

		// 2. Average cycle time (days from task creation to completion)
		$total_days = 0;
		$measured_tasks = 0;

		foreach ( $tasks as $task ) {
			if ( in_array( $task['status'], array( 'completed', 'closed' ), true ) && ! empty( $task['created_at'] ) ) {
				$created_ts = strtotime( $task['created_at'] );
				$completed_ts = ! empty( $task['updated_at'] ) ? strtotime( $task['updated_at'] ) : current_time( 'timestamp' );
				if ( $completed_ts >= $created_ts ) {
					$diff_days = max( 1, round( ( $completed_ts - $created_ts ) / DAY_IN_SECONDS ) );
					$total_days += $diff_days;
					$measured_tasks++;
				}
			}
		}

		$avg_cycle_time_days = $measured_tasks > 0 ? round( $total_days / $measured_tasks, 1 ) : 0;

		// 3. Knowledge Champions (Who authored the accepted solutions)
		$champions = array();
		foreach ( $deliverables as $deliv ) {
			$author = $deliv['author_name'];
			if ( ! isset( $champions[ $author ] ) ) {
				$champions[ $author ] = array(
					'name'             => $author,
					'avatar'           => $deliv['author_avatar'],
					'accepted_solutions' => 0,
				);
			}
			$champions[ $author ]['accepted_solutions']++;
		}
		usort( $champions, function( $a, $b ) {
			return $b['accepted_solutions'] - $a['accepted_solutions'];
		} );

		return array(
			'acceptance_rate'     => $acceptance_rate,
			'avg_cycle_time_days' => $avg_cycle_time_days,
			'total_solutions'     => $accepted_count,
			'knowledge_champions' => array_values( $champions ),
		);
	}

	/**
	 * Generate a Compiled Knowledge Book formatted as clean, structured Markdown.
	 *
	 * @param int $project_id Project Term ID.
	 * @return string Markdown content.
	 */
	public static function generate_knowledge_book( $project_id ) {
		$summary = self::get_project_summary( $project_id );
		if ( is_wp_error( $summary ) ) {
			return '# خطأ: تعذر جلب بيانات المشروع';
		}

		$project      = $summary['project'];
		$metrics      = $summary['metrics'];
		$deliverables = $summary['deliverables'];
		$org          = $summary['organization'];

		$md = array();
		$md[] = "# كتاب المعرفة المؤسسية: {$project['name']}";
		$md[] = "## {$org['name']} — توثيق الحلول والمخرجات الفنية المعتمدة";
		$md[] = "";
		$md[] = "> **الكود التعريفي للمشروع:** `{$project['prefix']}`  ";
		$md[] = "> **تاريخ إصدار الوثيقة:** " . date_i18n( 'j F Y - H:i' ) . "  ";
		$md[] = "> **نسبة اكتمال المشروع:** {$metrics['completion_rate']}% ({$metrics['completed_tasks']}/{$metrics['total_tasks']} مهمة)  ";
		$md[] = "> **إجمالي الحلول المعتمدة المودعة في بنك المعرفة:** " . count( $deliverables ) . " حل فني معتمد";
		$md[] = "";
		$md[] = "---";
		$md[] = "";

		// Project Overview
		$md[] = "### 1. نبذة عن المشروع";
		$desc = ! empty( $project['description'] ) ? $project['description'] : 'لا يوجد وصف مدون للمشروع.';
		$md[] = $desc;
		$md[] = "";

		// Specs Vault if available
		if ( ! empty( $project['specs'] ) && is_array( $project['specs'] ) ) {
			$md[] = "#### المواصفات الفنية المعتمدة للطلب:";
			$md[] = "| البند | القيمة المحددة |";
			$md[] = "| :--- | :--- |";
			foreach ( $project['specs'] as $label => $val ) {
				$val_str = is_array( $val ) ? implode( ', ', $val ) : (string) $val;
				$md[] = "| **" . esc_html( $label ) . "** | " . esc_html( $val_str ) . " |";
			}
			$md[] = "";
		}

		// Table of Contents
		$md[] = "### 2. فهرس الحلول والمخرجات المعتمدة";
		$md[] = "";
		if ( empty( $deliverables ) ) {
			$md[] = "_لا توجد حلول معتمدة مدونة في هذا المشروع بعد._";
		} else {
			$index = 1;
			foreach ( $deliverables as $deliv ) {
				$slug = sanitize_title( $deliv['task_ref'] . '-' . $deliv['task_title'] );
				$md[] = "{$index}. [{$deliv['task_ref']}: {$deliv['task_title']}](#" . $slug . ") — *بواسطة: {$deliv['author_name']}*";
				$index++;
			}
		}
		$md[] = "";
		$md[] = "---";
		$md[] = "";

		// Verified Solutions Catalog
		$md[] = "### ⭐ 3. موسوعة الحلول الفنية والقرارات المعتمدة";
		$md[] = "";

		if ( empty( $deliverables ) ) {
			$md[] = "_لم يتم اعتماد أي حلول فنية في هذا المشروع حتى تاريخ إصدار هذه الوثيقة._";
		} else {
			foreach ( $deliverables as $deliv ) {
				$md[] = "#### [{$deliv['task_ref']}] {$deliv['task_title']}";
				$md[] = "- **المنفذ المعتمد:** {$deliv['author_name']}";
				$md[] = "- **تاريخ الاعتماد الرسمي:** " . date_i18n( 'j F Y', strtotime( $deliv['accepted_at'] ) );
				$md[] = "- **المعتمد بواسطة:** {$deliv['accepted_by_name']}";
				$md[] = "";
				$md[] = "**نص الحل الفني والإجراء المعتمد:**";
				$md[] = "```";
				$md[] = trim( strip_tags( $deliv['content'] ) );
				$md[] = "```";
				$md[] = "";

				if ( ! empty( $deliv['attachments'] ) ) {
					$md[] = "**المرفقات والمستندات الفنية:**";
					foreach ( $deliv['attachments'] as $att ) {
						$att_name = ! empty( $att['name'] ) ? $att['name'] : 'مرفق فني';
						$att_url  = ! empty( $att['url'] ) ? $att['url'] : '#';
						$md[] = "- [{$att_name}]({$att_url})";
					}
					$md[] = "";
				}

				$md[] = "---";
				$md[] = "";
			}
		}

		// Executive Sign-off block in Markdown
		$md[] = "### 4. توقيع واستلام المشروع الرسمي";
		$md[] = "";
		$md[] = "| قائد وموجه المشروع | ممثل العميل / المستفيد | المدير العام / الإدارة التنفيذية |";
		$md[] = "| :---: | :---: | :---: |";
		$md[] = "| **الاسم:** ...................... | **الاسم:** ...................... | **الاسم:** ...................... |";
		$md[] = "| **التوقيع:** ................... | **التوقيع:** ................... | **التوقيع:** ................... |";
		$md[] = "| **التاريخ:** .... / .... / 2026 | **التاريخ:** .... / .... / 2026 | **التاريخ:** .... / .... / 2026 |";
		$md[] = "";
		$md[] = "> *تم توليد هذه الوثيقة تلقائياً عبر نظام WorkPress v1.4.0 — الذاكرة المؤسسية المعتمدة.*";

		return implode( "\n", $md );
	}

	/**
	 * Get workspace-wide executive analytics.
	 *
	 * @return array Analytics overview.
	 */
	public static function get_workspace_analytics() {
		$projects_res = WorkPress_Project_Service::get_projects( array( 'per_page' => 100 ) );
		$projects     = $projects_res['items'];

		$total_projects     = count( $projects );
		$completed_projects = 0;
		$active_projects    = 0;

		foreach ( $projects as $proj ) {
			if ( ! empty( $proj['is_completed'] ) || 'completed' === $proj['status'] ) {
				$completed_projects++;
			} else {
				$active_projects++;
			}
		}

		// Total tasks across workspace
		$all_tasks_res = WorkPress_Task_Service::get_tasks( array( 'number' => -1 ) );
		$all_tasks     = isset( $all_tasks_res['items'] ) ? $all_tasks_res['items'] : array();
		$total_tasks   = count( $all_tasks );
		$completed_tasks = 0;
		foreach ( $all_tasks as $t ) {
			if ( in_array( $t['status'], array( 'completed', 'closed' ), true ) ) {
				$completed_tasks++;
			}
		}

		// Total Knowledge Base solutions
		$total_solutions = get_comments( array(
			'type'       => WorkPress_Keys::COMMENT_CONTRIBUTION,
			'status'     => 'approve',
			'count'      => true,
			'meta_query' => array(
				array(
					'key'     => '_workpress_is_accepted',
					'value'   => '1',
					'compare' => '=',
				),
			),
		) );

		return array(
			'total_projects'     => $total_projects,
			'active_projects'    => $active_projects,
			'completed_projects' => $completed_projects,
			'total_tasks'        => $total_tasks,
			'completed_tasks'    => $completed_tasks,
			'total_solutions'    => (int) $total_solutions,
			'completion_rate'    => $total_tasks > 0 ? round( ( $completed_tasks / $total_tasks ) * 100 ) : 0,
		);
	}
}
