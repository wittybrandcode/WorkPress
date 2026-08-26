<?php
/**
 * WorkPress Export Service
 *
 * Handles complete workspace data extraction into portable JSON format.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Export_Service {

	/**
	 * Export all WorkPress workspace data into a comprehensive array.
	 *
	 * @return array
	 */
	public static function export_all() {
		$current_user = wp_get_current_user();

		// 1. System Metadata & Settings
		$meta = array(
			'generator'         => 'WorkPress Engine v' . WORKPRESS_VERSION,
			'exported_at'       => gmdate( 'c' ),
			'exported_by_user'  => $current_user->exists() ? $current_user->user_login : 'system',
			'site_name'         => get_bloginfo( 'name' ),
			'site_url'          => site_url(),
			'settings'          => array(
				'workspace_name'      => get_option( WorkPress_Keys::OPT_WORKSPACE_NAME, get_bloginfo( 'name' ) ),
				'default_priority'    => get_option( WorkPress_Keys::OPT_DEFAULT_PRIORITY, 'medium' ),
				'timezone'            => get_option( WorkPress_Keys::OPT_TIMEZONE, 'Africa/Algiers' ),
				'month_naming'        => get_option( WorkPress_Keys::OPT_MONTH_NAMING, 'maghrebi' ),
				'date_format'         => get_option( WorkPress_Keys::OPT_DATE_FORMAT, 'D MMMM YYYY' ),
				'relative_time'       => (bool) get_option( WorkPress_Keys::OPT_RELATIVE_TIME, true ),
				'email_notifications' => (bool) get_option( WorkPress_Keys::OPT_EMAIL_NOTIFICATIONS, false ),
				'custom_roles'        => get_option( WorkPress_Keys::OPT_CUSTOM_ROLES, array() ),
				'contribution_types'  => get_option( WorkPress_Keys::OPT_CONTRIBUTION_TYPES, array() ),
			),
		);

		// 2. Export Projects
		$projects = array();
		if ( class_exists( 'WorkPress_Project_Service' ) ) {
			$raw_projects = WorkPress_Project_Service::get_projects( array( 'per_page' => -1 ) );
			$projects = isset( $raw_projects['items'] ) ? $raw_projects['items'] : array();
		}

		// 3. Export Tasks
		$tasks = array();
		if ( class_exists( 'WorkPress_Task_Service' ) ) {
			$raw_tasks = WorkPress_Task_Service::get_tasks( array( 'number' => 1000 ) );
			$tasks = isset( $raw_tasks['items'] ) ? $raw_tasks['items'] : array();
		}

		// 4. Export Contributions & Comments
		$contributions = array();
		if ( class_exists( 'WorkPress_Contribution_Service' ) ) {
			$raw_contributions = WorkPress_Contribution_Service::get_all_contributions( array( 'per_page' => 2000 ) );
			$contributions = isset( $raw_contributions['items'] ) ? $raw_contributions['items'] : ( is_array( $raw_contributions ) ? $raw_contributions : array() );
		}

		// 5. Export Knowledge Base
		$knowledge = array();
		if ( class_exists( 'WorkPress_Knowledge_Service' ) ) {
			$raw_knowledge = WorkPress_Knowledge_Service::query( $current_user->ID, 0, '', 1000, 1 );
			$knowledge = isset( $raw_knowledge['items'] ) ? $raw_knowledge['items'] : array();
		}

		return array(
			'workpress_export_schema_version' => '1.0.0',
			'meta'                            => $meta,
			'stats'                           => array(
				'total_projects'      => count( $projects ),
				'total_tasks'         => count( $tasks ),
				'total_contributions' => count( $contributions ),
				'total_knowledge'     => count( $knowledge ),
			),
			'projects'                        => $projects,
			'tasks'                           => $tasks,
			'contributions'                   => $contributions,
			'knowledge_base'                  => $knowledge,
		);
	}
}
