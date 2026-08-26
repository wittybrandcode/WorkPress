<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package WorkPress
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Option: Only clean if user opted in (can be implemented later)
$clean = get_option( 'workpress_clean_on_uninstall', false );
if ( ! $clean ) {
	return;
}

global $wpdb;

// 1. Delete all work_item posts and their meta
$post_ids = $wpdb->get_col(
	"SELECT ID FROM {$wpdb->posts} WHERE post_type = 'work_item'"
);
foreach ( $post_ids as $pid ) {
	wp_delete_post( $pid, true );
}

// 2. Delete taxonomy terms and their meta
$term_ids = $wpdb->get_col( $wpdb->prepare(
	"SELECT t.term_id FROM {$wpdb->terms} t
	 JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id
	 WHERE tt.taxonomy = %s",
	'workpress_project'
) );
foreach ( $term_ids as $tid ) {
	wp_delete_term( $tid, 'workpress_project' );
}

// 3. Delete contribution comments
$wpdb->query(
	"DELETE FROM {$wpdb->comments} WHERE comment_type = 'wp_contribution'"
);

// 4. Delete options
delete_option( 'workpress_meta_migrated' );
delete_option( 'workpress_clean_on_uninstall' );
delete_option( 'workpress_db_version' );
delete_option( 'workpress_role_aliases' );

// 5. Remove custom roles
$custom_roles = get_option( 'workpress_custom_roles', array() );
if ( is_array( $custom_roles ) ) {
	foreach ( $custom_roles as $role_id => $role_data ) {
		remove_role( $role_id );
	}
}
delete_option( 'workpress_custom_roles' );

// 6. Remove capabilities
$custom_caps = array(
	'workpress_manage_projects', 'workpress_create_tasks',
	'workpress_manage_memberships', 'workpress_accept_solutions',
);

$registry_file = plugin_dir_path( __FILE__ ) . 'includes/core/class-workpress-capabilities-registry.php';
if ( file_exists( $registry_file ) ) {
	require_once $registry_file;
	if ( class_exists( 'WorkPress_Capabilities_Registry' ) ) {
		$all_new_caps = WorkPress_Capabilities_Registry::get_all_capability_keys();
		$custom_caps = array_merge( $custom_caps, $all_new_caps );
	}
}

foreach ( wp_roles()->roles as $role_name => $role_info ) {
	$role = get_role( $role_name );
	if ( $role ) {
		foreach ( $custom_caps as $cap ) {
			$role->remove_cap( $cap );
		}
	}
}
