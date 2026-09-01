<?php
/**
 * Plugin Name: WorkPress
 * Plugin URI:  https://workpress.local
 * Description: Native Organizational Memory & Work Management Engine for WordPress.
 * Version:     2.2.3
 * Author:      WorkPress Team
 * Text Domain: workpress
 * Domain Path: /languages
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

// Define Constants.
define( 'WORKPRESS_VERSION', '2.2.3' );
define( 'WORKPRESS_PATH', plugin_dir_path( __FILE__ ) );
define( 'WORKPRESS_URL', plugin_dir_url( __FILE__ ) );

/**
 * Include Core Dependencies & Services.
 */
require_once WORKPRESS_PATH . 'includes/core/class-workpress-keys.php';
require_once WORKPRESS_PATH . 'includes/core/class-workpress-install.php';
WorkPress_Install::init();
require_once WORKPRESS_PATH . 'includes/core/class-workpress-dev-seeder.php';
require_once WORKPRESS_PATH . 'includes/core/class-workpress-capabilities-registry.php';
require_once WORKPRESS_PATH . 'includes/hooks/class-workpress-hooks.php';

// Domain Services (ordered by dependency).
require_once WORKPRESS_PATH . 'includes/services/class-workpress-workflow-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-project-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-membership-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-permission-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-capabilities-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-assignment-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-task-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-task-state-machine.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-contribution-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-solution-transform-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-knowledge-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-template-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-security-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-export-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-portal-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-portal-signoff-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-report-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-webhook-service.php';
require_once WORKPRESS_PATH . 'includes/services/class-workpress-hibernation-service.php';
WorkPress_Hibernation_Service::init();
require_once WORKPRESS_PATH . 'includes/services/class-workpress-auth-service.php';
WorkPress_Auth_Service::init();

// REST API.
require_once WORKPRESS_PATH . 'includes/api/class-workpress-rest-api.php';
WorkPress_REST_API::init();

// Admin.
require_once WORKPRESS_PATH . 'includes/admin/class-workpress-admin.php';

// Activation and Deactivation Hooks.
register_activation_hook( __FILE__, array( 'WorkPress_Install', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'WorkPress_Install', 'deactivate' ) );

// Office Packs
require_once WORKPRESS_PATH . 'includes/office-packs/class-workpress-software-pack.php';

// Modules
require_once WORKPRESS_PATH . 'includes/modules/notifications/class-workpress-notification-module.php';

/**
 * Initialize WorkPress Core & Text Domain.
 */
function workpress_init() {
	// Load plugin text domain for native internationalization.
	load_plugin_textdomain( 'workpress', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

	WorkPress_Install::init();
	WorkPress_Capabilities_Service::init();
	WorkPress_Template_Service::init();
	WorkPress_Security_Service::init();
	WorkPress_Notification_Module::init();
	WorkPress_Portal_Service::get_instance();
	WorkPress_Auth_Service::init();
	WorkPress_Webhook_Service::init();
	new WorkPress_Admin();
}
add_action( 'plugins_loaded', 'workpress_init' );

/**
 * Filter WordPress locale for WorkPress requests and user preferences.
 *
 * @param string $locale
 * @return string
 */
function workpress_filter_locale( $locale ) {
	$cookie_locale = isset( $_COOKIE['workpress_user_locale'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['workpress_user_locale'] ) ) : '';
	if ( ! empty( $cookie_locale ) && in_array( $cookie_locale, array( 'ar', 'en_US', 'en', 'fr_FR', 'es_ES' ), true ) ) {
		return ( $cookie_locale === 'en' ) ? 'en_US' : $cookie_locale;
	}
	if ( is_user_logged_in() ) {
		$user_locale = get_user_meta( get_current_user_id(), 'locale', true );
		if ( ! empty( $user_locale ) && in_array( $user_locale, array( 'ar', 'en_US', 'en', 'fr_FR', 'es_ES' ), true ) ) {
			return ( $user_locale === 'en' ) ? 'en_US' : $user_locale;
		}
	}
	return $locale;
}
add_filter( 'locale', 'workpress_filter_locale', 99 );
add_filter( 'determine_locale', 'workpress_filter_locale', 99 );



