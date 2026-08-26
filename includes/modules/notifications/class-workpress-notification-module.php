<?php
/**
 * WorkPress Notifications Module
 * 
 * Provides an internal notifications engine and UI bell.
 * 
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once WORKPRESS_PATH . 'includes/modules/notifications/class-workpress-notification-db.php';
require_once WORKPRESS_PATH . 'includes/modules/notifications/class-workpress-notification-service.php';
require_once WORKPRESS_PATH . 'includes/modules/notifications/class-workpress-notification-hooks.php';
require_once WORKPRESS_PATH . 'includes/modules/notifications/class-workpress-notification-api.php';

class WorkPress_Notification_Module {

	public static function init() {
		WorkPress_Notification_Hooks::init();
		
		$api = new WorkPress_Notification_API();
		add_action( 'rest_api_init', array( $api, 'register_routes' ) );
	}
}
