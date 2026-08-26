<?php
/**
 * WorkPress Webhook Service
 *
 * Handles outgoing enterprise webhooks dispatching, HMAC signing, event listeners,
 * and preset payload formatting for Slack, Discord, Microsoft Teams, and Generic JSON.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Webhook_Service {

	const OPTION_KEY = 'workpress_webhooks_config';

	/**
	 * Boot hooks and event listeners.
	 */
	public static function init() {
		add_action( 'workpress_contribution_accepted', array( __CLASS__, 'on_contribution_accepted' ), 10, 3 );
		add_action( 'workpress_contribution_revoked', array( __CLASS__, 'on_contribution_revoked' ), 10, 3 );
		add_action( 'workpress_project_request_submitted', array( __CLASS__, 'on_request_submitted' ), 10, 3 );
		add_action( 'workpress_task_state_changed', array( __CLASS__, 'on_task_state_changed' ), 10, 4 );
		add_action( 'workpress_project_completed', array( __CLASS__, 'on_project_completed' ), 10, 1 );
	}

	/**
	 * Get all registered events and their descriptive Arabic labels.
	 *
	 * @return array
	 */
	public static function get_supported_events() {
		return array(
			'workpress.solution_accepted'   => array(
				'label'       => __( 'اعتماد حل رسمي لمهمة (Solution Accepted)', 'workpress' ),
				'description' => __( 'يُطلق فور قيام مدير المشروع أو المسؤول باعتماد مساهمة كحل رسمي معتمد.', 'workpress' ),
				'icon'        => 'dashicons-yes-alt',
			),
			'workpress.solution_revoked'    => array(
				'label'       => __( 'إلغاء اعتماد حل لمهمة (Solution Revoked)', 'workpress' ),
				'description' => __( 'يُطلق عند إلغاء اعتماد حل وإعادة فتح المهمة للمراجعة.', 'workpress' ),
				'icon'        => 'dashicons-undo',
			),
			'workpress.request_submitted'   => array(
				'label'       => __( 'تقديم طلب مشروع جديد من عميل (Client Request Submitted)', 'workpress' ),
				'description' => __( 'يُطلق فور إرسال عميل لطلب مشروع جديد عبر نماذج الاستقبال بالبوابة.', 'workpress' ),
				'icon'        => 'dashicons-forms',
			),
			'workpress.task_status_changed' => array(
				'label'       => __( 'تغيير حالة المهمة (Task Status Changed)', 'workpress' ),
				'description' => __( 'يُطلق عند نقل مهمة بين أعمدة الكانبان أو إغلاقها.', 'workpress' ),
				'icon'        => 'dashicons-update',
			),
			'workpress.project_completed'   => array(
				'label'       => __( 'اكتمال كافة مهام المشروع 100% (Project Completed)', 'workpress' ),
				'description' => __( 'يُطلق عند إنجاز واعتماد الحلول لجميع مهام المشروع بنسبة 100%.', 'workpress' ),
				'icon'        => 'dashicons-awards',
			),
		);
	}

	/**
	 * Get all registered webhooks from options.
	 *
	 * @return array
	 */
	public static function get_webhooks() {
		$webhooks = get_option( self::OPTION_KEY, array() );
		return is_array( $webhooks ) ? array_values( $webhooks ) : array();
	}

	/**
	 * Save the entire list of webhooks.
	 *
	 * @param array $webhooks
	 * @return bool
	 */
	public static function save_webhooks( $webhooks ) {
		if ( ! is_array( $webhooks ) ) {
			return false;
		}
		return update_option( self::OPTION_KEY, array_values( $webhooks ) );
	}

	/**
	 * Get single webhook by ID.
	 *
	 * @param string $id
	 * @return array|null
	 */
	public static function get_webhook( $id ) {
		$webhooks = self::get_webhooks();
		foreach ( $webhooks as $wh ) {
			if ( isset( $wh['id'] ) && $wh['id'] === $id ) {
				return $wh;
			}
		}
		return null;
	}

	/**
	 * Create or update a webhook.
	 *
	 * @param array $data
	 * @return array|WP_Error
	 */
	public static function save_webhook( $data ) {
		$webhooks = self::get_webhooks();
		$id       = ! empty( $data['id'] ) ? sanitize_key( $data['id'] ) : 'wh_' . substr( md5( uniqid( (string) wp_rand(), true ) ), 0, 10 );
		$name     = ! empty( $data['name'] ) ? sanitize_text_field( $data['name'] ) : __( 'خطاف جديد', 'workpress' );
		$url      = ! empty( $data['url'] ) ? esc_url_raw( trim( $data['url'] ) ) : '';
		$preset   = ! empty( $data['preset'] ) && in_array( $data['preset'], array( 'generic', 'discord', 'slack', 'teams' ), true ) ? $data['preset'] : 'generic';
		$events   = ! empty( $data['events'] ) && is_array( $data['events'] ) ? array_map( 'sanitize_text_field', $data['events'] ) : array( 'workpress.solution_accepted' );
		$secret   = ! empty( $data['secret'] ) ? sanitize_text_field( $data['secret'] ) : 'whsec_' . wp_generate_password( 24, false );
		$active   = isset( $data['active'] ) ? (bool) $data['active'] : true;

		if ( empty( $url ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return new WP_Error( 'invalid_url', __( 'يرجى إدخال رابط Webhook صالح.', 'workpress' ) );
		}

		$existing_index = -1;
		foreach ( $webhooks as $idx => $wh ) {
			if ( isset( $wh['id'] ) && $wh['id'] === $id ) {
				$existing_index = $idx;
				break;
			}
		}

		$record = array(
			'id'              => $id,
			'name'            => $name,
			'url'             => $url,
			'preset'          => $preset,
			'events'          => $events,
			'secret'          => $secret,
			'active'          => $active,
			'created_at'      => $existing_index >= 0 ? ( $webhooks[ $existing_index ]['created_at'] ?? current_time( 'mysql' ) ) : current_time( 'mysql' ),
			'last_status'     => $existing_index >= 0 ? ( $webhooks[ $existing_index ]['last_status'] ?? null ) : null,
			'last_latency_ms' => $existing_index >= 0 ? ( $webhooks[ $existing_index ]['last_latency_ms'] ?? null ) : null,
			'last_sent_at'    => $existing_index >= 0 ? ( $webhooks[ $existing_index ]['last_sent_at'] ?? null ) : null,
			'last_error'      => $existing_index >= 0 ? ( $webhooks[ $existing_index ]['last_error'] ?? null ) : null,
		);

		if ( $existing_index >= 0 ) {
			$webhooks[ $existing_index ] = $record;
		} else {
			$webhooks[] = $record;
		}

		self::save_webhooks( $webhooks );
		return $record;
	}

	/**
	 * Delete a webhook by ID.
	 *
	 * @param string $id
	 * @return bool
	 */
	public static function delete_webhook( $id ) {
		$webhooks = self::get_webhooks();
		$filtered = array();
		$found    = false;

		foreach ( $webhooks as $wh ) {
			if ( isset( $wh['id'] ) && $wh['id'] === $id ) {
				$found = true;
				continue;
			}
			$filtered[] = $wh;
		}

		if ( $found ) {
			self::save_webhooks( $filtered );
			return true;
		}

		return false;
	}

	/**
	 * Dispatch an event to all subscribed active webhooks.
	 *
	 * @param string $event_key Event key.
	 * @param array  $data      Domain payload data.
	 * @return int Number of webhooks dispatched to.
	 */
	public static function dispatch_event( $event_key, $data = array() ) {
		$webhooks = self::get_webhooks();
		if ( empty( $webhooks ) ) {
			return 0;
		}

		$workspace_name = get_bloginfo( 'name' );
		$dispatched     = 0;
		$updated_any    = false;

		foreach ( $webhooks as $idx => $wh ) {
			if ( empty( $wh['active'] ) || empty( $wh['url'] ) ) {
				continue;
			}

			$subscribed = ! empty( $wh['events'] ) && is_array( $wh['events'] ) ? $wh['events'] : array();
			if ( ! in_array( $event_key, $subscribed, true ) && ! in_array( '*', $subscribed, true ) ) {
				continue;
			}

			$preset   = $wh['preset'] ?? 'generic';
			$secret   = $wh['secret'] ?? '';
			$payload  = self::format_payload( $preset, $event_key, $data, $workspace_name );
			$body_str = wp_json_encode( $payload );

			$signature = 'sha256=' . hash_hmac( 'sha256', $body_str, $secret );
			$headers   = array(
				'Content-Type'          => 'application/json; charset=utf-8',
				'User-Agent'            => 'WorkPress-Webhook-Engine/' . ( defined( 'WORKPRESS_VERSION' ) ? WORKPRESS_VERSION : '1.5.0' ),
				'X-WorkPress-Event'     => $event_key,
				'X-WorkPress-Signature' => $signature,
				'X-WorkPress-Timestamp' => (string) time(),
			);

			$start_time = microtime( true );
			$response   = wp_remote_post( $wh['url'], array(
				'headers'   => $headers,
				'body'      => $body_str,
				'timeout'   => 5,
				'sslverify' => false,
			) );
			$latency    = round( ( microtime( true ) - $start_time ) * 1000 );

			if ( is_wp_error( $response ) ) {
				$webhooks[ $idx ]['last_status']     = 0;
				$webhooks[ $idx ]['last_error']      = $response->get_error_message();
				$webhooks[ $idx ]['last_latency_ms'] = $latency;
				$webhooks[ $idx ]['last_sent_at']    = current_time( 'mysql' );
			} else {
				$code = wp_remote_retrieve_response_code( $response );
				$webhooks[ $idx ]['last_status']     = (int) $code;
				$webhooks[ $idx ]['last_error']      = $code >= 400 ? wp_remote_retrieve_response_message( $response ) : '';
				$webhooks[ $idx ]['last_latency_ms'] = $latency;
				$webhooks[ $idx ]['last_sent_at']    = current_time( 'mysql' );
			}

			$updated_any = true;
			$dispatched++;
		}

		if ( $updated_any ) {
			self::save_webhooks( $webhooks );
		}

		return $dispatched;
	}

	/**
	 * Send an instant Test Ping to a target URL.
	 *
	 * @param string $url
	 * @param string $secret
	 * @param string $preset
	 * @return array
	 */
	public static function test_webhook( $url, $secret = '', $preset = 'generic' ) {
		if ( empty( $url ) || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return array(
				'success'       => false,
				'status_code'   => 0,
				'latency_ms'    => 0,
				'error_message' => __( 'الرابط المدخل غير صالح.', 'workpress' ),
				'response_body' => '',
			);
		}

		$workspace_name = get_bloginfo( 'name' );
		$sample_data    = array(
			'test'         => true,
			'message'      => 'هذا إشعار تجريبي لاختبار الربط المباشر مع WorkPress Webhook Engine بنجاح.',
			'project_name' => 'مشروع تجريبي: تطوير المنصة المؤسسية',
			'task_title'   => 'إعداد خادم البريد والمصادقة الثنائية وتكامل الـ Webhooks',
			'user_name'    => wp_get_current_user()->display_name ?: 'مدير النظام',
			'triggered_at' => current_time( 'mysql' ),
		);

		$payload  = self::format_payload( $preset, 'workpress.test_ping', $sample_data, $workspace_name );
		$body_str = wp_json_encode( $payload );

		$signature = 'sha256=' . hash_hmac( 'sha256', $body_str, $secret );
		$headers   = array(
			'Content-Type'          => 'application/json; charset=utf-8',
			'User-Agent'            => 'WorkPress-Webhook-Engine/1.5.0',
			'X-WorkPress-Event'     => 'workpress.test_ping',
			'X-WorkPress-Signature' => $signature,
			'X-WorkPress-Timestamp' => (string) time(),
		);

		$start_time = microtime( true );
		$response   = wp_remote_post( $url, array(
			'headers'   => $headers,
			'body'      => $body_str,
			'timeout'   => 8,
			'sslverify' => false,
		) );
		$latency    = round( ( microtime( true ) - $start_time ) * 1000 );

		if ( is_wp_error( $response ) ) {
			return array(
				'success'       => false,
				'status_code'   => 0,
				'latency_ms'    => $latency,
				'error_message' => $response->get_error_message(),
				'response_body' => '',
			);
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = wp_remote_retrieve_body( $response );

		return array(
			'success'       => ( $code >= 200 && $code < 300 ),
			'status_code'   => (int) $code,
			'latency_ms'    => $latency,
			'error_message' => $code >= 400 ? wp_remote_retrieve_response_message( $response ) : '',
			'response_body' => substr( $body, 0, 500 ),
			'signature'     => $signature,
		);
	}

	/**
	 * Format payload according to the selected preset (Generic, Discord, Slack, Teams).
	 *
	 * @param string $preset         generic|discord|slack|teams
	 * @param string $event_key      Event name
	 * @param array  $data           Domain data
	 * @param string $workspace_name
	 * @return array
	 */
	public static function format_payload( $preset, $event_key, $data, $workspace_name = 'WorkPress' ) {
		$timestamp = current_time( 'c' );

		// 1. DISCORD EMBEDS PRESET
		if ( 'discord' === $preset ) {
			$title = 'WorkPress: ' . ( self::get_supported_events()[ $event_key ]['label'] ?? $event_key );
			$desc  = $data['message'] ?? ( $data['task_title'] ?? 'حدث جديد تم تنفيذه في النظام.' );
			$color = 0x4f46e5; // Indigo

			if ( 'workpress.solution_accepted' === $event_key ) {
				$color = 0x10b981; // Green
				$title = 'تم اعتماد حل رسمي لمهمة!';
				$desc  = sprintf( "**المشروع:** %s\n**المهمة:** %s\n**المنفذ:** %s\n**المعتمد:** %s", $data['project_name'] ?? '', $data['task_title'] ?? '', $data['author_name'] ?? '', $data['accepted_by'] ?? '' );
			} elseif ( 'workpress.request_submitted' === $event_key ) {
				$color = 0x3b82f6; // Blue
				$title = 'تم تقديم طلب مشروع جديد من العميل!';
				$desc  = sprintf( "**المشروع:** %s\n**العميل:** %s\n**النموذج:** %s", $data['project_name'] ?? '', $data['client_name'] ?? '', $data['form_title'] ?? '' );
			} elseif ( 'workpress.project_completed' === $event_key ) {
				$color = 0xf59e0b; // Gold
				$title = 'اكتملت كافة مهام المشروع بنسبة 100%!';
				$desc  = sprintf( "**المشروع:** %s\n**إجمالي المهام المنجزة:** %d", $data['project_name'] ?? '', $data['tasks_count'] ?? 0 );
			}

			return array(
				'username'   => 'WorkPress Engine',
				'avatar_url' => 'https://raw.githubusercontent.com/WordPress/dashicons/master/svg/clipboard.svg',
				'embeds'     => array(
					array(
						'title'       => $title,
						'description' => $desc,
						'color'       => $color,
						'footer'      => array(
							'text' => $workspace_name . ' • ' . date( 'Y-m-d H:i' ),
						),
					),
				),
			);
		}

		// 2. SLACK BLOCK KIT PRESET
		if ( 'slack' === $preset ) {
			$title = '*WorkPress Event:* ' . ( self::get_supported_events()[ $event_key ]['label'] ?? $event_key );
			$desc  = $data['message'] ?? ( $data['task_title'] ?? 'حدث جديد في المنظومة.' );

			return array(
				'text'   => $title,
				'blocks' => array(
					array(
						'type' => 'header',
						'text' => array(
							'type'  => 'plain_text',
							'text'  => 'WorkPress Workspace Alert',
							'emoji' => true,
						),
					),
					array(
						'type' => 'section',
						'text' => array(
							'type' => 'mrkdwn',
							'text' => "*{$title}*\n{$desc}\n_Workspace: {$workspace_name}_",
						),
					),
				),
			);
		}

		// 3. MICROSOFT TEAMS MESSAGE CARD PRESET
		if ( 'teams' === $preset ) {
			return array(
				'@type'      => 'MessageCard',
				'@context'   => 'https://schema.org/extensions',
				'themeColor' => '4F46E5',
				'summary'    => 'WorkPress Notification: ' . $event_key,
				'title'      => 'WorkPress: ' . ( self::get_supported_events()[ $event_key ]['label'] ?? $event_key ),
				'text'       => $data['message'] ?? ( $data['task_title'] ?? 'New event triggered in WorkPress.' ),
				'sections'   => array(
					array(
						'activityTitle'    => $workspace_name,
						'activitySubtitle' => $timestamp,
						'facts'            => array(
							array( 'name' => 'Event', 'value' => $event_key ),
							array( 'name' => 'Project', 'value' => $data['project_name'] ?? '—' ),
						),
					),
				),
			);
		}

		// 4. GENERIC REST JSON PRESET (DEFAULT)
		return array(
			'event'     => $event_key,
			'timestamp' => $timestamp,
			'workspace' => $workspace_name,
			'data'      => $data,
		);
	}

	// ==========================================
	// DOMAIN EVENT LISTENERS
	// ==========================================

	/**
	 * Handle solution accepted.
	 */
	public static function on_contribution_accepted( $comment_id, $task_id, $user_id ) {
		$task = get_post( (int) $task_id );
		if ( ! $task ) {
			return;
		}

		$comment = get_comment( (int) $comment_id );
		$terms   = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_name = ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0]->name : 'مشروع عام';

		$payload = array(
			'task_id'         => (int) $task_id,
			'task_title'      => $task->post_title,
			'project_name'    => $project_name,
			'author_name'     => $comment ? $comment->comment_author : 'أحد الأعضاء',
			'accepted_by'     => get_the_author_meta( 'display_name', $user_id ) ?: 'مدير المشروع',
			'solution_snip'   => $comment ? wp_trim_words( $comment->comment_content, 30, '...' ) : '',
			'task_url'        => admin_url( 'admin.php?page=workpress#/task/' . $task_id ),
		);

		self::dispatch_event( 'workpress.solution_accepted', $payload );
	}

	/**
	 * Handle solution revoked.
	 */
	public static function on_contribution_revoked( $comment_id, $task_id, $user_id ) {
		$task = get_post( (int) $task_id );
		if ( ! $task ) {
			return;
		}

		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_name = ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0]->name : 'مشروع عام';

		$payload = array(
			'task_id'      => (int) $task_id,
			'task_title'   => $task->post_title,
			'project_name' => $project_name,
			'revoked_by'   => get_the_author_meta( 'display_name', $user_id ) ?: 'مدير المشروع',
			'task_url'     => admin_url( 'admin.php?page=workpress#/task/' . $task_id ),
		);

		self::dispatch_event( 'workpress.solution_revoked', $payload );
	}

	/**
	 * Handle client project request submitted.
	 */
	public static function on_request_submitted( $project_id, $client_user_id, $specs = array() ) {
		$term = get_term( (int) $project_id, WorkPress_Install::TAX_PROJECT );
		if ( ! $term || is_wp_error( $term ) ) {
			return;
		}

		$client  = get_userdata( (int) $client_user_id );
		$form_id = get_term_meta( $project_id, '_workpress_request_form_id', true ) ?: 'custom';
		$payload = array(
			'project_id'   => (int) $project_id,
			'project_name' => $term->name,
			'client_name'  => $client ? $client->display_name : 'عميل',
			'client_email' => $client ? $client->user_email : '',
			'form_title'   => is_array( $specs ) && ! empty( $specs['form_title'] ) ? $specs['form_title'] : $form_id,
			'project_url'  => admin_url( 'admin.php?page=workpress#/project/' . $project_id ),
		);

		self::dispatch_event( 'workpress.request_submitted', $payload );
	}

	/**
	 * Handle task state changed.
	 */
	public static function on_task_state_changed( $task_id, $old_status, $new_status, $user_id ) {
		$task = get_post( (int) $task_id );
		if ( ! $task ) {
			return;
		}

		$terms = wp_get_object_terms( $task_id, WorkPress_Install::TAX_PROJECT );
		$project_name = ! empty( $terms ) && ! is_wp_error( $terms ) ? $terms[0]->name : 'مشروع عام';

		$payload = array(
			'task_id'      => (int) $task_id,
			'task_title'   => $task->post_title,
			'project_name' => $project_name,
			'old_status'   => $old_status,
			'new_status'   => $new_status,
			'changed_by'   => get_the_author_meta( 'display_name', $user_id ) ?: 'أحد الأعضاء',
			'task_url'     => admin_url( 'admin.php?page=workpress#/task/' . $task_id ),
		);

		self::dispatch_event( 'workpress.task_status_changed', $payload );
	}

	/**
	 * Handle project completed.
	 */
	public static function on_project_completed( $project_id ) {
		$term = get_term( (int) $project_id, WorkPress_Install::TAX_PROJECT );
		if ( ! $term || is_wp_error( $term ) ) {
			return;
		}

		$tasks = get_posts( array(
			'post_type'      => WorkPress_Install::CPT_WORK_ITEM,
			'posts_per_page' => -1,
			'post_status'    => 'any',
			'tax_query'      => array(
				array(
					'taxonomy' => WorkPress_Install::TAX_PROJECT,
					'field'    => 'term_id',
					'terms'    => (int) $project_id,
				),
			),
			'fields'         => 'ids',
		) );

		$payload = array(
			'project_id'   => (int) $project_id,
			'project_name' => $term->name,
			'tasks_count'  => count( $tasks ),
			'project_url'  => admin_url( 'admin.php?page=workpress#/project/' . $project_id ),
		);

		self::dispatch_event( 'workpress.project_completed', $payload );
	}

	/**
	 * Dispatch an event specifically to a client's personalized webhook URL.
	 *
	 * @param int    $client_user_id Client User ID.
	 * @param string $event_key      Event identifier.
	 * @param array  $data           Event payload data.
	 * @return bool|WP_Error
	 */
	public static function dispatch_client_personal_webhook( $client_user_id, $event_key, $data = array() ) {
		$client_user_id = (int) $client_user_id;
		if ( $client_user_id <= 0 ) {
			return false;
		}

		$webhook_url = get_user_meta( $client_user_id, '_workpress_webhook_url', true );
		if ( empty( $webhook_url ) || ! filter_var( $webhook_url, FILTER_VALIDATE_URL ) ) {
			return false;
		}

		$notify_on_deliverable = get_user_meta( $client_user_id, '_workpress_notify_on_deliverable', true );
		$notify_on_milestone   = get_user_meta( $client_user_id, '_workpress_notify_on_milestone', true );

		if ( strpos( $event_key, 'deliverable' ) !== false && ! $notify_on_deliverable ) {
			return false;
		}
		if ( strpos( $event_key, 'project' ) !== false && ! $notify_on_milestone ) {
			return false;
		}

		$workspace_name = get_bloginfo( 'name' );
		$payload        = self::format_payload( 'generic', $event_key, $data, $workspace_name );
		$body_str       = wp_json_encode( $payload );
		$signature      = 'sha256=' . hash_hmac( 'sha256', $body_str, (string) $client_user_id );

		return wp_remote_post( $webhook_url, array(
			'headers'   => array(
				'Content-Type'          => 'application/json; charset=utf-8',
				'User-Agent'            => 'WorkPress-Client-Webhook-Engine/' . ( defined( 'WORKPRESS_VERSION' ) ? WORKPRESS_VERSION : '2.0.0' ),
				'X-WorkPress-Event'     => $event_key,
				'X-WorkPress-Signature' => $signature,
				'X-WorkPress-Timestamp' => (string) time(),
			),
			'body'      => $body_str,
			'timeout'   => 5,
			'sslverify' => false,
		) );
	}
}
