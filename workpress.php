<?php
/**
 * Plugin Name: WorkPress
 * Plugin URI:  https://workpress.local
 * Description: Native Organizational Memory & Work Management Engine for WordPress.
 * Version:     2.3.0
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
define( 'WORKPRESS_VERSION', '2.3.0' );
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
 * Filter WordPress locale for WorkPress portal and specific REST requests.
 * Standard WordPress admin requests remain completely unaffected.
 *
 * @param string $locale
 * @return string
 */
function workpress_filter_locale( $locale ) {
	// Never override locale on standard WordPress admin pages
	if ( is_admin() && ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) ) {
		return $locale;
	}

	$map = array(
		'en'    => 'en_US',
		'en_US' => 'en_US',
		'ar'    => 'ar',
		'fr'    => 'fr_FR',
		'fr_FR' => 'fr_FR',
		'es'    => 'es_ES',
		'es_ES' => 'es_ES',
	);

	// 1. URL Query parameter priority (instant preview / link sharing on portal)
	if ( isset( $_GET['lang'] ) ) {
		$get_lang = sanitize_text_field( wp_unslash( $_GET['lang'] ) );
		if ( isset( $map[ $get_lang ] ) ) {
			return $map[ $get_lang ];
		}
	}

	// 2. Portal independent client cookie
	if ( isset( $_COOKIE['workpress_portal_locale'] ) ) {
		$portal_locale = sanitize_text_field( wp_unslash( $_COOKIE['workpress_portal_locale'] ) );
		if ( isset( $map[ $portal_locale ] ) ) {
			return $map[ $portal_locale ];
		}
	}

	return $locale;
}
add_filter( 'locale', 'workpress_filter_locale', 99 );
add_filter( 'determine_locale', 'workpress_filter_locale', 99 );



