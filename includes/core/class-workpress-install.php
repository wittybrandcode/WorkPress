<?php
/**
 * WorkPress Core Installation & Entity Registration.
 *
 * Handles CPT 'work_item', Taxonomy 'workpress_project', and activation tasks.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Install {

	/**
	 * CPT Name constant.
	 */
	const CPT_WORK_ITEM = 'work_item';

	/**
	 * Taxonomy Name constant.
	 */
	const TAX_PROJECT = 'workpress_project';

	/**
	 * Initialize hooks.
	 */
	public static function init() {
		add_action( 'init', array( __CLASS__, 'register_entities' ) );
		add_action( 'init', array( __CLASS__, 'ensure_roles' ), 5 );
	}

	/**
	 * Ensure essential roles exist in WordPress.
	 */
	public static function ensure_roles() {
		if ( ! get_role( 'workpress_client' ) ) {
			self::add_roles();
		}
	}

	/**
	 * Register Custom Post Types and Taxonomies.
	 */
	public static function register_entities() {
		self::register_taxonomy();
		self::register_post_type();
	}

	/**
	 * Register 'workpress_project' Taxonomy.
	 */
	private static function register_taxonomy() {
		$labels = array(
			'name'              => _x( 'Projects', 'taxonomy general name', 'workpress' ),
			'singular_name'     => _x( 'Project', 'taxonomy singular name', 'workpress' ),
			'search_items'      => __( 'Search Projects', 'workpress' ),
			'all_items'         => __( 'All Projects', 'workpress' ),
			'parent_item'       => __( 'Parent Project', 'workpress' ),
			'parent_item_colon' => __( 'Parent Project:', 'workpress' ),
			'edit_item'         => __( 'Edit Project', 'workpress' ),
			'update_item'       => __( 'Update Project', 'workpress' ),
			'add_new_item'      => __( 'Add New Project', 'workpress' ),
			'new_item_name'     => __( 'New Project Name', 'workpress' ),
			'menu_name'         => __( 'Projects', 'workpress' ),
		);

		$args = array(
			'hierarchical'      => true,
			'labels'            => $labels,
			'show_ui'           => true,
			'show_admin_column' => true,
			'query_var'         => true,
			'rewrite'           => array( 'slug' => 'project' ),
			'show_in_rest'      => true,
		);

		register_taxonomy( self::TAX_PROJECT, array( self::CPT_WORK_ITEM ), $args );
	}

	/**
	 * Register 'work_item' Custom Post Type.
	 */
	private static function register_post_type() {
		$labels = array(
			'name'               => _x( 'Work Items', 'post type general name', 'workpress' ),
			'singular_name'      => _x( 'Work Item', 'post type singular name', 'workpress' ),
			'menu_name'          => _x( 'WorkPress', 'admin menu', 'workpress' ),
			'name_admin_bar'     => _x( 'Work Item', 'add new on admin bar', 'workpress' ),
			'add_new'            => _x( 'Add New', 'work_item', 'workpress' ),
			'add_new_item'       => __( 'Add New Work Item', 'workpress' ),
			'new_item'           => __( 'New Work Item', 'workpress' ),
			'edit_item'          => __( 'Edit Work Item', 'workpress' ),
			'view_item'          => __( 'View Work Item', 'workpress' ),
			'all_items'          => __( 'All Work Items', 'workpress' ),
			'search_items'       => __( 'Search Work Items', 'workpress' ),
			'not_found'          => __( 'No Work Items found', 'workpress' ),
			'not_found_in_trash' => __( 'No Work Items found in trash', 'workpress' ),
		);

		$args = array(
			'labels'             => $labels,
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => true,
			'show_in_menu'       => false, // Handled via WorkPress_Admin custom menu
			'query_var'          => true,
			'rewrite'            => array( 'slug' => 'work-item' ),
			'capability_type'    => array( 'workpress_task', 'workpress_tasks' ),
			'map_meta_cap'       => true,
			'has_archive'        => false,
			'hierarchical'       => false,
			'menu_position'      => null,
			'supports'           => array( 'title', 'editor', 'author', 'comments', 'custom-fields' ),
			'show_in_rest'       => true,
		);

		register_post_type( self::CPT_WORK_ITEM, $args );
	}

	/**
	 * Activation Hook Callback.
	 */
	public static function activate() {
		self::register_entities();
		self::add_roles();
		self::create_db_indexes();
		self::migrate_legacy_meta();
		if ( class_exists( 'WorkPress_Notification_DB' ) ) {
			WorkPress_Notification_DB::create_table();
			self::drop_legacy_notification_columns();
		}
		flush_rewrite_rules();
	}

	/**
	 * Drop legacy columns from notification table.
	 */
	private static function drop_legacy_notification_columns() {
		global $wpdb;
		$table = $wpdb->prefix . 'workpress_notifications';
		$row = $wpdb->get_results( "SHOW COLUMNS FROM `$table` LIKE 'message'" );
		if ( ! empty( $row ) ) {
			$wpdb->query( "ALTER TABLE `$table` DROP COLUMN `message`" );
		}
	}

	/**
	 * Create Custom DB Indexes (Phase 3).
	 */
	private static function create_db_indexes() {
		global $wpdb;

		// Add index for _workpress_status in postmeta
		$index_name = 'idx_workpress_status';
		$index_exists = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->postmeta} WHERE Key_name = '{$index_name}'" );
		if ( ! $index_exists ) {
			$wpdb->query( "CREATE INDEX {$index_name} ON {$wpdb->postmeta} (meta_key(32), meta_value(32))" );
		}

		// Add index for _workpress_priority in postmeta
		$index_name_priority = 'idx_workpress_priority';
		$index_exists_priority = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->postmeta} WHERE Key_name = '{$index_name_priority}'" );
		if ( ! $index_exists_priority ) {
			$wpdb->query( "CREATE INDEX {$index_name_priority} ON {$wpdb->postmeta} (meta_key(32), meta_value(32))" );
		}

		// Add index for _workpress_assignee_ids in postmeta
		$index_name_assignee = 'idx_workpress_assignee_ids';
		$index_exists_assignee = $wpdb->get_row( "SHOW INDEX FROM {$wpdb->postmeta} WHERE Key_name = '{$index_name_assignee}'" );
		if ( ! $index_exists_assignee ) {
			$wpdb->query( "CREATE INDEX {$index_name_assignee} ON {$wpdb->postmeta} (meta_key(32), meta_value(64))" );
		}
	}

	/**
	 * Migrate legacy metadata to new schema.
	 */
	private static function migrate_legacy_meta() {
		global $wpdb;
		
		if ( get_option( 'workpress_meta_migrated' ) ) {
			return;
		}

		// Update _status to _workpress_status
		$wpdb->query( "
			UPDATE {$wpdb->postmeta} pm
			JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			SET pm.meta_key = '_workpress_status'
			WHERE p.post_type = 'work_item' AND pm.meta_key = '_status'
		" );

		// Update _priority to _workpress_priority
		$wpdb->query( "
			UPDATE {$wpdb->postmeta} pm
			JOIN {$wpdb->posts} p ON p.ID = pm.post_id
			SET pm.meta_key = '_workpress_priority'
			WHERE p.post_type = 'work_item' AND pm.meta_key = '_priority'
		" );

		update_option( 'workpress_meta_migrated', true );
	}

	/**
	 * Add WorkPress Roles and Custom Capabilities.
	 */
	public static function add_roles() {
		// Define standardized CPT capabilities matching capability_type ('workpress_task', 'workpress_tasks')
		$cpt_edit_caps = array(
			'edit_workpress_task'              => true,
			'read_workpress_task'              => true,
			'delete_workpress_task'            => true,
			'edit_workpress_tasks'             => true,
			'edit_others_workpress_tasks'      => true,
			'publish_workpress_tasks'          => true,
			'read_private_workpress_tasks'     => true,
			'delete_workpress_tasks'           => true,
			'delete_private_workpress_tasks'   => true,
			'delete_published_workpress_tasks' => true,
			'delete_others_workpress_tasks'    => true,
			'edit_private_workpress_tasks'     => true,
			'edit_published_workpress_tasks'   => true,
			// Legacy aliases for backward compatibility
			'edit_work_item'                   => true,
			'read_work_item'                   => true,
			'delete_work_item'                 => true,
			'edit_work_items'                  => true,
		);

		// Cleanup old WorkPress custom roles if they exist
		remove_role( 'workpress_manager' );
		remove_role( 'workpress_employee' );
		remove_role( 'workpress_client' );

		// 1. Editor Role (Project Lead / Manager)
		$editor = get_role( 'editor' );
		if ( $editor ) {
			$editor_caps = array(
				'access_workpress_admin', 'access_workpress_portal',
				'read_workpress_projects', 'create_workpress_projects', 'edit_workpress_projects', 'manage_project_members',
				'read_workpress_tasks', 'create_workpress_tasks', 'edit_assigned_tasks', 'edit_others_workpress_tasks', 'change_task_status', 'assign_tasks',
				'read_contributions', 'add_contributions', 'edit_contributions', 'delete_contributions', 'accept_solutions', 'revoke_solutions',
				'view_incoming_requests', 'triage_requests', 'approve_requests', 'reject_requests',
				'read_knowledge_base', 'generate_executive_reports', 'export_knowledge_book',
			);
			foreach ( $editor_caps as $cap ) {
				$editor->add_cap( $cap );
			}
		}

		// 2. Author Role (Core Specialist / Employee)
		$author = get_role( 'author' );
		if ( $author ) {
			$author_caps = array(
				'access_workpress_admin',
				'read_workpress_projects',
				'read_workpress_tasks', 'create_workpress_tasks', 'edit_assigned_tasks', 'change_task_status',
				'read_contributions', 'add_contributions', 'edit_contributions',
				'read_knowledge_base', 'export_knowledge_book',
			);
			foreach ( $author_caps as $cap ) {
				$author->add_cap( $cap );
			}
		}

		// 3. Contributor Role (Collaborator / Freelancer / Junior)
		$contributor = get_role( 'contributor' );
		if ( $contributor ) {
			$contributor_caps = array(
				'access_workpress_admin',
				'read_workpress_projects',
				'read_workpress_tasks',
				'read_contributions', 'add_contributions', 'edit_contributions',
				'read_knowledge_base',
			);
			foreach ( $contributor_caps as $cap ) {
				$contributor->add_cap( $cap );
			}
		}

		// 4. Subscriber Role (Standard WordPress Site Member / Reader)
		// Clean any previous WorkPress capabilities so standard subscribers remain standard site citizens
		$subscriber = get_role( 'subscriber' );
		if ( $subscriber ) {
			$portal_caps_to_clean = array(
				'access_workpress_admin',
				'access_workpress_portal',
				'read_workpress_projects',
				'read_workpress_tasks',
				'submit_work_requests',
				'view_own_deliverables',
				'submit_client_feedback',
				'signoff_project_deliverables',
				'read_knowledge_base',
			);
			foreach ( $portal_caps_to_clean as $cap ) {
				$subscriber->remove_cap( $cap );
			}
		}

		// 5. Dedicated WorkPress Portal Stakeholder Role (Tagged Clients & Requesters)
		add_role(
			'workpress_client',
			__( 'Stakeholder', 'workpress' ),
			array(
				'read'                         => true,
				'access_workpress_portal'      => true,
				'read_workpress_projects'      => true,
				'read_workpress_tasks'         => true,
				'submit_work_requests'         => true,
				'view_own_deliverables'        => true,
				'submit_client_feedback'       => true,
				'signoff_project_deliverables' => true,
				'read_knowledge_base'          => true,
			)
		);

		// 6. Grant all capabilities to Administrator
		$admin = get_role( 'administrator' );
		if ( $admin ) {
			foreach ( $cpt_edit_caps as $cap => $granted ) {
				$admin->add_cap( $cap );
			}
			$all_caps = WorkPress_Capabilities_Registry::get_all_capability_keys();
			foreach ( $all_caps as $cap ) {
				$admin->add_cap( $cap );
			}
		}
	}

	/**
	 * Deactivation Hook Callback.
	 */
	public static function deactivate() {
		self::remove_roles_and_capabilities();
		flush_rewrite_rules();
	}

	/**
	 * Remove Custom Roles and Capabilities on deactivation.
	 */
	private static function remove_roles_and_capabilities() {
		// Ensure old roles are also removed (cleanup for existing installations)
		remove_role( 'workpress_manager' );
		remove_role( 'workpress_employee' );
		remove_role( 'workpress_client' );

		// Remove caps from remaining roles (like administrator)
		$old_custom_caps = array(
			'workpress_manage_projects',
			'workpress_create_tasks',
			'workpress_manage_memberships',
			'workpress_accept_solutions',
			'read_workpress_projects',
			'edit_workpress_projects',
		);
		
		$all_new_caps = WorkPress_Capabilities_Registry::get_all_capability_keys();
		$caps_to_remove = array_merge($old_custom_caps, $all_new_caps);
		
		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = new WP_Roles();
		}
		
		if ( ! empty( $wp_roles->roles ) && is_array( $wp_roles->roles ) ) {
			foreach ( $wp_roles->roles as $role_name => $role_info ) {
				$role = get_role( $role_name );
				if ( $role ) {
					foreach ( $caps_to_remove as $cap ) {
						$role->remove_cap( $cap );
					}
				}
			}
		}
	}
}
