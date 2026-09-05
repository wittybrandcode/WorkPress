<?php
/**
 * WorkPress Standalone Authentication Canvas Template
 *
 * Provides a clean, modern SaaS-grade login and account recovery gateway
 * with 0% theme/core CSS bleed and strictly sharp geometry.
 *
 * @package WorkPress
 * @subpackage Templates
 * @version 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$site_name   = get_bloginfo( 'name' );
$site_url    = home_url( '/' );
$redirect_to = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : '';
$initial_view = isset( $_GET['view'] ) && 'lostpassword' === $_GET['view'] ? 'lostpassword' : 'login';
$logged_out  = isset( $_GET['loggedout'] ) && 'true' === $_GET['loggedout'];

$logo_url    = class_exists( 'WorkPress_REST_Settings_Controller' ) ? WorkPress_REST_Settings_Controller::get_custom_logo_url() : ( WORKPRESS_URL . 'assets/brand/workpress.svg' );
$favicon_url = class_exists( 'WorkPress_REST_Settings_Controller' ) ? WorkPress_REST_Settings_Controller::get_custom_favicon_url() : ( WORKPRESS_URL . 'assets/brand/favicon.svg' );

$auth_config = array(
	'apiUrl'           => rest_url( 'workpress/v1/portal' ),
	'restNonce'        => wp_create_nonce( 'wp_rest' ),
	'siteUrl'          => $site_url,
	'siteName'         => $site_name ? $site_name : 'WorkPress',
	'adminUrl'         => admin_url( 'admin.php?page=workpress#/' ),
	'portalUrl'        => home_url( '/portal/' ),
	'logoUrl'          => $logo_url,
	'faviconUrl'       => $favicon_url,
	'redirectTo'       => $redirect_to,
	'initialView'      => $initial_view,
	'loggedOutMessage' => $logged_out,
	'i18n'             => array(
		'Sign In' => __( 'Sign In', 'workpress' ),
		'Password Recovery' => __( 'Password Recovery', 'workpress' ),
		'Lost your password?' => __( 'Lost your password?', 'workpress' ),
		'Welcome back, please enter your credentials to continue' => __( 'Welcome back, please enter your credentials to continue', 'workpress' ),
		'Enter your email or username to reset your password' => __( 'Enter your email or username to reset your password', 'workpress' ),
		'Username or Email' => __( 'Username or Email', 'workpress' ),
		'Password' => __( 'Password', 'workpress' ),
		'Account username or email@domain.com' => __( 'Account username or email@domain.com', 'workpress' ),
		'Remember Me' => __( 'Remember Me', 'workpress' ),
		'Hide password' => __( 'Hide password', 'workpress' ),
		'Show password' => __( 'Show password', 'workpress' ),
		'Verifying credentials...' => __( 'Verifying credentials...', 'workpress' ),
		'Access Workspace' => __( 'Access Workspace', 'workpress' ),
		'Email or Username' => __( 'Email or Username', 'workpress' ),
		'Enter your registered email' => __( 'Enter your registered email', 'workpress' ),
		'Sending request...' => __( 'Sending request...', 'workpress' ),
		'Send password reset link' => __( 'Send password reset link', 'workpress' ),
		'Return to main website' => __( 'Return to main website', 'workpress' ),
		'WorkPress Engine v2.0' => __( 'WorkPress Engine v2.0', 'workpress' ),
		'You have been successfully and securely logged out.' => __( 'You have been successfully and securely logged out.', 'workpress' ),
		'Verified successfully! Redirecting to workspace...' => __( 'Verified successfully! Redirecting to workspace...', 'workpress' ),
		'Invalid login credentials, please try again.' => __( 'Invalid login credentials, please try again.', 'workpress' ),
		'Could not connect to server, please check connection and try again.' => __( 'Could not connect to server, please check connection and try again.', 'workpress' ),
		'If that account exists, a confirmation link has been sent to your email.' => __( 'If that account exists, a confirmation link has been sent to your email.', 'workpress' ),
		'Failed to send recovery request, please contact site administration.' => __( 'Failed to send recovery request, please contact site administration.', 'workpress' ),
	),
);
?><!DOCTYPE html>
<html lang="<?php echo esc_attr( get_bloginfo( 'language' ) ); ?>" dir="<?php echo is_rtl() ? 'rtl' : 'ltr'; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html( sprintf( __( '%1$s — Unified Sign In | %2$s', 'workpress' ), $site_name ? $site_name : 'WorkPress', 'WorkPress' ) ); ?></title>

    <link rel="icon" type="image/svg+xml" href="<?php echo esc_url( $favicon_url ); ?>">

    <!-- Dashicons -->
    <link rel="stylesheet" href="<?php echo esc_url( includes_url( 'css/dashicons.min.css' ) ); ?>?ver=<?php echo esc_attr( get_bloginfo( 'version' ) ); ?>">

    <!-- Modern Typography (Cairo & Plus Jakarta Sans) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- WorkPress Auth CSS (Strict Sharp Edges) -->
    <link rel="stylesheet" href="<?php echo esc_url( WORKPRESS_URL . 'assets/css/auth.css' ); ?>?ver=<?php echo esc_attr( WORKPRESS_VERSION ); ?>">

    <!-- Embedded Config -->
    <script>
        window.workpressAuthConfig = <?php echo wp_json_encode( $auth_config ); ?>;
    </script>
</head>
<body class="workpress-auth-body">

    <!-- Preact SPA Mount Root -->
    <div id="workpress-auth-root">
        <!-- Progressive Enhancement Fallback for non-JS environments -->
        <noscript>
            <div class="wp-auth-container">
                <div class="wp-auth-card">
                    <h1 class="wp-auth-title" style="margin-bottom: 1rem;"><?php esc_html_e( 'Sign In', 'workpress' ); ?></h1>
                    <form method="post" action="<?php echo esc_url( site_url( 'wp-login.php', 'login_post' ) ); ?>">
                        <div class="wp-auth-group">
                            <label class="wp-auth-label"><?php esc_html_e( 'Username or Email', 'workpress' ); ?></label>
                            <input type="text" name="log" class="wp-auth-input" required />
                        </div>
                        <div class="wp-auth-group">
                            <label class="wp-auth-label"><?php esc_html_e( 'Password', 'workpress' ); ?></label>
                            <input type="password" name="pwd" class="wp-auth-input" required />
                        </div>
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_to ? $redirect_to : admin_url( 'admin.php?page=workpress#/' ) ); ?>" />
                        <button type="submit" class="wp-auth-btn"><?php esc_html_e( 'Sign In', 'workpress' ); ?></button>
                    </form>
                </div>
            </div>
        </noscript>
    </div>

    <!-- Vendor Dependencies -->
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/vendor/preact.min.js' ); ?>"></script>
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/vendor/htm.js' ); ?>"></script>

    <!-- WorkPress Auth SPA Script -->
    <script src="<?php echo esc_url( WORKPRESS_URL . 'assets/src/auth/auth-app.js' ); ?>?ver=<?php echo esc_attr( WORKPRESS_VERSION ); ?>"></script>

</body>
</html>
