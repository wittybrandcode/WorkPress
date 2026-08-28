<?php
/**
 * Standalone Client Portal Template Canvas (0% CSS Bleed)
 *
 * Fully isolated from the active theme. Renders the pure executive
 * customer workspace with dynamic brand inheritance.
 *
 * @package WorkPress
 * @subpackage Templates
 * @since 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// 1. Extract Custom Logo & Site Identity
$custom_logo_id = get_theme_mod( 'custom_logo' );
$logo_url       = $custom_logo_id ? wp_get_attachment_image_url( $custom_logo_id, 'full' ) : '';
$site_name      = get_bloginfo( 'name' );
$site_url       = home_url( '/' );

// 2. Prepare Current User Session Context
$current_user = wp_get_current_user();
$is_logged_in = is_user_logged_in();

$can_access_portal = false;
$executive_type    = 'subscriber';
$role_label        = __( 'مشترك', 'workpress' );

if ( $is_logged_in ) {
	if ( user_can( $current_user, 'manage_options' ) || in_array( 'administrator', (array) $current_user->roles, true ) ) {
		$executive_type    = 'admin';
		$role_label        = __( 'مدير عام', 'workpress' );
		$can_access_portal = true;
	} elseif ( in_array( 'workpress_client', (array) $current_user->roles, true ) || in_array( 'workpress_portal_user', (array) $current_user->roles, true ) || user_can( $current_user, 'access_workpress_portal' ) ) {
		$executive_type    = 'client';
		$role_label        = __( 'مستفيد', 'workpress' );
		$can_access_portal = true;
	} elseif ( in_array( 'editor', (array) $current_user->roles, true ) ) {
		$executive_type    = 'lead';
		$role_label        = __( 'قائد مشروع', 'workpress' );
		$can_access_portal = true;
	} elseif ( user_can( $current_user, 'edit_posts' ) || in_array( 'author', (array) $current_user->roles, true ) || in_array( 'contributor', (array) $current_user->roles, true ) ) {
		$executive_type    = 'member';
		$role_label        = __( 'منفذ فني', 'workpress' );
		$can_access_portal = true;
	} else {
		$executive_type    = 'subscriber';
		$role_label        = __( 'مشترك', 'workpress' );
		$can_access_portal = false;
	}
}

// Support ?preview=... for UI testing and verification
if ( isset( $_GET['preview'] ) ) {
	$preview_mode = sanitize_text_field( wp_unslash( $_GET['preview'] ) );
	$is_logged_in = true;
	if ( 'subscriber' === $preview_mode ) {
		$can_access_portal = false;
		$executive_type    = 'subscriber';
		$role_label        = __( 'مشترك', 'workpress' );
	} elseif ( 'staff' === $preview_mode || 'admin' === $preview_mode ) {
		$can_access_portal = true;
		$executive_type    = 'admin';
		$role_label        = __( 'مدير عام', 'workpress' );
	} elseif ( 'client' === $preview_mode ) {
		$can_access_portal = true;
		$executive_type    = 'client';
		$role_label        = __( 'مستفيد', 'workpress' );
	}
}

$user_roles        = $is_logged_in ? (array) $current_user->roles : array();
$primary_role_slug = ! empty( $user_roles ) ? $user_roles[0] : 'subscriber';
global $wp_roles;
if ( ! isset( $wp_roles ) ) {
	$wp_roles = new WP_Roles();
}
$role_system_name = isset( $wp_roles->roles[ $primary_role_slug ]['name'] ) ? translate_user_role( $wp_roles->roles[ $primary_role_slug ]['name'] ) : $primary_role_slug;

$portal_user_data = array(
	'id'             => $is_logged_in ? $current_user->ID : 0,
	'display_name'   => $is_logged_in ? $current_user->display_name : '',
	'email'          => $is_logged_in ? $current_user->user_email : '',
	'avatar_url'     => $is_logged_in ? get_avatar_url( $current_user->ID, array( 'size' => 128 ) ) : '',
	'roles'          => $user_roles,
	'role_name'      => $role_system_name,
	'is_admin'       => $is_logged_in ? user_can( $current_user, 'manage_options' ) : false,
	'executive_type' => $executive_type,
	'role_label'     => $role_label,
);

$portal_config = array(
	'apiUrl'          => rest_url( 'workpress/v1/portal' ),
	'restNonce'       => wp_create_nonce( 'wp_rest' ),
	'isLoggedIn'      => $is_logged_in,
	'canAccessPortal' => $can_access_portal,
	'intakeForms'     => get_option( 'workpress_intake_forms_schema', WorkPress_Project_Service::get_default_intake_forms_schema() ),
	'adminUrl'        => admin_url( 'admin.php?page=workpress#/' ),
	'portalUrl'       => home_url( '/portal/' ),
	'loginUrl'        => home_url( '/workpress-login/' ),
	'logoutUrl'       => wp_logout_url( home_url( '/portal/' ) ),
	'executiveType'   => $executive_type,
	'roleLabel'       => $role_label,
	'user'            => $portal_user_data,
	'siteName'        => $site_name ? $site_name : 'WorkPress',
	'siteUrl'         => $site_url,
	'logoUrl'         => $logo_url,
	'pluginUrl'       => WORKPRESS_URL,
);
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html( __( 'بوابة ومساحة متابعة المشاريع', 'workpress' ) . ' — ' . ( $site_name ? $site_name : 'WorkPress' ) ); ?></title>
    
    <!-- Google Fonts: Cairo & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
    
    <!-- WordPress Native Dashicons -->
    <link rel="stylesheet" href="<?php echo esc_url( includes_url( 'css/dashicons.min.css' ) ); ?>">
    
    <!-- WorkPress Isolated Portal Stylesheet -->
    <?php
    $portal_css_file = WORKPRESS_PATH . 'assets/css/portal.css';
    $portal_css_ver  = file_exists( $portal_css_file ) ? filemtime( $portal_css_file ) : WORKPRESS_VERSION;
    $portal_js_file  = WORKPRESS_PATH . 'assets/src/portal/portal-app.js';
    $portal_js_ver   = file_exists( $portal_js_file ) ? filemtime( $portal_js_file ) : WORKPRESS_VERSION;
    ?>
    <?php
    $portal_favicon_url = class_exists( 'WorkPress_REST_Settings_Controller' ) ? WorkPress_REST_Settings_Controller::get_custom_favicon_url() : ( WORKPRESS_URL . 'assets/brand/favicon.svg' );
    ?>
    <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( $portal_favicon_url ); ?>">
    <link rel="stylesheet" href="<?php echo esc_url( WORKPRESS_URL . 'assets/css/portal.css?v=' . $portal_css_ver ); ?>">
</head>
<body class="workpress-portal-body">

    <!-- Standalone Single Page Application Mount Point -->
    <div id="workpress-portal-root">
        <!-- Initial Loader Shell -->
        <div class="portal-initial-loader">
            <div class="portal-spinner"></div>
            <p><?php esc_html_e( 'جاري تشغيل بوابة ومساحة المشاريع...', 'workpress' ); ?></p>
        </div>
    </div>

    <!-- Inlined Portal Configuration Object -->
    <script>
        window.workpressPortalConfig = <?php echo wp_json_encode( $portal_config ); ?>;
    </script>

    <!-- Preact & HTM Zero-Build Engine -->
    <script src="https://unpkg.com/preact@10.19.3/dist/preact.umd.js"></script>
    <script src="https://unpkg.com/preact@10.19.3/hooks/dist/hooks.umd.js"></script>
    <script src="https://unpkg.com/htm@3.1.1/dist/htm.umd.js"></script>

    <!-- WorkPress Portal Core & Modules -->
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-core.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-login.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-header.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-gateway.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-radar.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-modals.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-request.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-dashboard.js?v=' . $portal_js_ver ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-workspace.js?v=' . $portal_js_ver ); ?>"></script>

    <!-- WorkPress Portal SPA Application -->
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/portal/portal-app.js?v=' . $portal_js_ver ); ?>"></script>
</body>
</html>
