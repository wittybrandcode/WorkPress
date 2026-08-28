<?php
/**
 * Plugin Name: WorkPress
 * Plugin URI:  https://workpress.local
 * Description: Native Organizational Memory & Work Management Engine for WordPress.
 * Version:     2.2.1
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
define( 'WORKPRESS_VERSION', '2.2.1' );
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
 * Initialize WorkPress Core.
 */
function workpress_init() {
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

