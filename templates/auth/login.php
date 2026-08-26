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

$auth_config = array(
	'apiUrl'           => rest_url( 'workpress/v1/portal' ),
	'restNonce'        => wp_create_nonce( 'wp_rest' ),
	'siteUrl'          => $site_url,
	'siteName'         => $site_name ? $site_name : 'WorkPress',
	'adminUrl'         => admin_url( 'admin.php?page=workpress#/' ),
	'portalUrl'        => home_url( '/portal/' ),
	'redirectTo'       => $redirect_to,
	'initialView'      => $initial_view,
	'loggedOutMessage' => $logged_out,
);
?><!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo esc_html( $site_name ); ?> — تسجيل الدخول الموحد | WorkPress</title>

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
                    <h1 class="wp-auth-title" style="margin-bottom: 1rem;">تسجيل الدخول</h1>
                    <form method="post" action="<?php echo esc_url( site_url( 'wp-login.php', 'login_post' ) ); ?>">
                        <div class="wp-auth-group">
                            <label class="wp-auth-label">اسم المستخدم أو البريد</label>
                            <input type="text" name="log" class="wp-auth-input" required />
                        </div>
                        <div class="wp-auth-group">
                            <label class="wp-auth-label">كلمة المرور</label>
                            <input type="password" name="pwd" class="wp-auth-input" required />
                        </div>
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_to ? $redirect_to : admin_url( 'admin.php?page=workpress#/' ) ); ?>" />
                        <button type="submit" class="wp-auth-btn">تسجيل الدخول</button>
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
