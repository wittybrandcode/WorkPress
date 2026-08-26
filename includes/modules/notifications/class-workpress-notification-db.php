<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WorkPress Notification Database Manager.
 *
 * Architectural Note (Principle 21: Read models may accelerate; they never define truth):
 * This custom table serves strictly as an ephemeral index/read model for fast notification lookup and unread counts.
 * It is NOT a source of truth for work items, contributions, or projects, and can be purged or rebuilt at any time
 * without loss of organizational memory.
 *
 * @package WorkPress
 */
class WorkPress_Notification_DB {

	public static function get_table_name() {
		return WorkPress_Keys::get_table_name( WorkPress_Keys::TABLE_NOTIFICATIONS );
	}

	public static function create_table() {
		global $wpdb;
		$table_name = self::get_table_name();
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			actor_id bigint(20) unsigned DEFAULT 0,
			type varchar(50) NOT NULL DEFAULT 'info',
			task_id bigint(20) unsigned DEFAULT 0,
			project_id bigint(20) unsigned DEFAULT 0,
			is_read tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id),
			KEY is_read (is_read),
			KEY type (type)
		) $charset_collate;";

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
		dbDelta( $sql );
	}

	public static function insert( $user_id, $task_id = 0, $type = 'info', $actor_id = 0, $project_id = 0 ) {
		global $wpdb;
		$wpdb->insert(
			self::get_table_name(),
			array(
				'user_id'    => (int) $user_id,
				'actor_id'   => (int) $actor_id,
				'type'       => sanitize_key( $type ),
				'task_id'    => (int) $task_id,
				'project_id' => (int) $project_id,
				'is_read'    => 0,
				'created_at' => current_time( 'mysql' ),
			),
			array( '%d', '%d', '%s', '%d', '%d', '%d', '%s' )
		);
		return $wpdb->insert_id;
	}

	public static function mark_as_read( $id, $user_id ) {
		global $wpdb;
		return $wpdb->update(
			self::get_table_name(),
			array( 'is_read' => 1 ),
			array( 'id' => (int) $id, 'user_id' => (int) $user_id ),
			array( '%d' ),
			array( '%d', '%d' )
		);
	}

	public static function get_user_notifications( $user_id, $limit = 20 ) {
		global $wpdb;
		$table = self::get_table_name();
		
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $table WHERE user_id = %d ORDER BY created_at DESC LIMIT %d",
				(int) $user_id,
				(int) $limit
			),
			ARRAY_A
		);
		
		return $results ? $results : array();
	}
	
	public static function get_unread_count( $user_id ) {
		global $wpdb;
		$table = self::get_table_name();
		
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM $table WHERE user_id = %d AND is_read = 0",
				(int) $user_id
			)
		);
	}

	public static function cleanup_old( $days = 90 ) {
		global $wpdb;
		$table = self::get_table_name();
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM $table WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY) AND is_read = 1",
				(int) $days
			)
		);
	}
}
