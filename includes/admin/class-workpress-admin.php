<?php
/**
 * WorkPress Admin Controller & Routing.
 *
 * Handles WP-Admin menu registration, view routing, assets, and AJAX actions.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Admin {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'enforce_portal_isolation' ) );
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_head', array( $this, 'inject_admin_favicon' ) );
		add_action( 'pre_get_comments', array( $this, 'hide_contribution_comments' ) );
	}

	/**
	 * Inject WorkPress custom or default favicon into the admin <head> when on WorkPress page.
	 */
	public function inject_admin_favicon() {
		if ( isset( $_GET['page'] ) && 'workpress' === $_GET['page'] ) {
			if ( class_exists( 'WorkPress_REST_Settings_Controller' ) ) {
				$favicon_url = WorkPress_REST_Settings_Controller::get_custom_favicon_url();
			} else {
				$favicon_url = WORKPRESS_URL . 'assets/brand/favicon.svg';
			}
			echo '<link rel="icon" type="image/svg+xml" href="' . esc_url( $favicon_url ) . '" />' . "\n";
		}
	}

	/**
	 * Enforce strict perimeter isolation:
	 * Redirect portal-only stakeholders away from wp-admin to /portal/
	 */
	public function enforce_portal_isolation() {
		if ( wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}

		if ( ! is_user_logged_in() ) {
			return;
		}

		// If user has portal access but NO admin/CoWorkPress capability, redirect them
		if ( current_user_can( 'access_workpress_portal' ) && ! current_user_can( 'access_workpress_admin' ) && ! current_user_can( 'manage_options' ) ) {
			wp_safe_redirect( home_url( '/portal/' ) );
			exit;
		}
	}

	/**
	 * Hide 'wp_contribution' comments from main WP Admin comments list.
	 *
	 * @param WP_Comment_Query $query The comment query object.
	 */
	public function hide_contribution_comments( $query ) {
		if ( ! is_admin() ) {
			return;
		}
		
		// If type is not explicitly requested, exclude our custom type
		$type = $query->query_vars['type'] ?? '';
		if ( empty( $type ) || 'wp_contribution' !== $type ) {
			$types = isset( $query->query_vars['type__not_in'] ) ? (array) $query->query_vars['type__not_in'] : array();
			$types[] = 'wp_contribution';
			$query->query_vars['type__not_in'] = $types;
		}
	}

	/**
	 * Register WP Admin Menu Page.
	 */
	public function register_menu() {
		add_menu_page(
			__( 'WorkPress', 'workpress' ),
			__( 'WorkPress', 'workpress' ),
			'read',
			'workpress',
			array( $this, 'render_admin_page' ),
			'dashicons-clipboard',
			3
		);
	}

	/**
	 * Enqueue CSS & JS Assets.
	 *
	 * @param string $hook Page hook.
	 */
	public function enqueue_assets( $hook ) {
		if ( false === strpos( $hook, 'workpress' ) && ! isset( $_GET['page'] ) || ( isset( $_GET['page'] ) && 'workpress' !== $_GET['page'] ) ) {
			return;
		}

		wp_enqueue_media(); // For project featured images
		wp_enqueue_editor(); // Ensure TinyMCE is fully loaded for the modals
		
		// Bulma Framework (Local)
		wp_enqueue_style( 'workpress-bulma', WORKPRESS_URL . 'assets/css/bulma.min.css', array(), '1.0.2' );
		wp_enqueue_style( 'dashicons' );
		
		$css_path  = WORKPRESS_PATH . 'assets/src/css/admin.css';
		$comp_path = WORKPRESS_PATH . 'assets/src/css/modules/components.css';
		$css_ver   = ( defined( 'WP_DEBUG' ) && WP_DEBUG )
			? time()
			: max(
				file_exists( $css_path ) ? filemtime( $css_path ) : 0,
				file_exists( $comp_path ) ? filemtime( $comp_path ) : 0,
				time()
			);
		wp_enqueue_style( 'workpress-app-css', WORKPRESS_URL . 'assets/src/css/admin.css', array( 'workpress-bulma' ), $css_ver );
		
		// Load React, wp-api-fetch & wp-i18n from WP Core
		wp_enqueue_script( 'wp-element' );
		wp_enqueue_script( 'wp-api-fetch' );
		wp_enqueue_script( 'wp-i18n' );
		
		// Load our ES Module Entry Point
		$js_path = WORKPRESS_PATH . 'assets/src/index.js';
		$js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $js_path ) ? filemtime( $js_path ) : WORKPRESS_VERSION );
		wp_enqueue_script( 'workpress-app-js', WORKPRESS_URL . 'assets/src/index.js', array( 'wp-element', 'wp-api-fetch', 'wp-i18n' ), $js_ver, true );
		wp_set_script_translations( 'workpress-app-js', 'workpress', WORKPRESS_PATH . 'languages' );

		$bell_js_path = WORKPRESS_PATH . 'assets/src/modules/notifications/notification-bell.js';
		$bell_js_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $bell_js_path ) ? filemtime( $bell_js_path ) : WORKPRESS_VERSION );
		wp_enqueue_script( 'workpress-notifications-js', WORKPRESS_URL . 'assets/src/modules/notifications/notification-bell.js', array( 'workpress-app-js' ), $bell_js_ver, true );

		// We must filter the script tag to add type="module" for our entry point while preserving any inline scripts
		add_filter( 'script_loader_tag', function( $tag, $handle, $src ) {
			if ( in_array( $handle, array( 'workpress-app-js', 'workpress-notifications-js' ), true ) ) {
				if ( false === strpos( $tag, 'type="module"' ) ) {
					$tag = preg_replace( '/<script\b([^>]*\bsrc=[\'"][^\'"]*[\'"][^>]*)>/i', '<script type="module"$1>', $tag );
				}
			}
			return $tag;
		}, 10, 3 );

		$settings = self::get_client_settings();
		if ( ! empty( $settings['localeData'] ) ) {
			wp_add_inline_script( 'wp-i18n', 'if (window.wp && window.wp.i18n) { window.wp.i18n.setLocaleData(' . wp_json_encode( $settings['localeData'] ) . ', "workpress"); }', 'after' );
		}
		wp_add_inline_script( 'workpress-app-js', 'window.workpressSettings = ' . wp_json_encode( $settings ) . ';', 'before' );
	}

	/**
	 * Get client runtime settings and user capabilities payload.
	 *
	 * @return array
	 */
	public static function get_client_settings() {
		$current_user = wp_get_current_user();
		$is_admin     = current_user_can( 'manage_options' );

		// Detect WordPress core locale vs WorkPress isolated preference
		$wp_locale = get_user_locale( $current_user->ID );
		if ( $wp_locale === 'en' ) {
			$wp_locale = 'en_US';
		}

		$sync_wp_meta = $current_user->ID ? get_user_meta( $current_user->ID, '_workpress_sync_wp_locale', true ) : '';
		// Default to true (auto-sync with WordPress) if not explicitly customized
		$is_sync_wp   = ( $sync_wp_meta === '' || $sync_wp_meta === '1' || $sync_wp_meta === 1 );

		if ( $is_sync_wp ) {
			$locale = $wp_locale;
		} else {
			$cookie_locale = isset( $_COOKIE['workpress_user_locale'] ) ? sanitize_text_field( wp_unslash( $_COOKIE['workpress_user_locale'] ) ) : '';
			$custom_locale = $current_user->ID ? get_user_meta( $current_user->ID, '_workpress_user_locale', true ) : '';
			$locale        = $custom_locale ?: ( $cookie_locale ?: $wp_locale );
		}

		if ( $locale === 'en' ) {
			$locale = 'en_US';
		}

		$is_rtl = in_array( substr( $locale, 0, 2 ), array( 'ar', 'he', 'fa', 'ur' ), true );

		// Load JED JSON translation data for active non-English locale
		$domain_data = null;
		if ( strpos( $locale, 'ar' ) === 0 ) {
			$json_file = WORKPRESS_PATH . 'languages/workpress-ar-workpress-app-js.json';
			if ( file_exists( $json_file ) ) {
				$raw_json = file_get_contents( $json_file );
				$decoded  = json_decode( $raw_json, true );
				if ( ! empty( $decoded['locale_data']['workpress'] ) ) {
					$domain_data = $decoded['locale_data']['workpress'];
				}
			}
		}

		$app_js_path = WORKPRESS_PATH . 'assets/src/App.js';
		$runtime_ver = ( defined( 'WP_DEBUG' ) && WP_DEBUG ) ? time() : ( file_exists( $app_js_path ) ? filemtime( $app_js_path ) : WORKPRESS_VERSION );

		return array(
			'version'            => $runtime_ver,
			'ajaxUrl'            => admin_url( 'admin-ajax.php' ),
			'nonce'              => wp_create_nonce( 'workpress_nonce' ),
			'restUrl'            => esc_url_raw( rest_url( 'workpress/v1/' ) ),
			'restNonce'          => wp_create_nonce( 'wp_rest' ),
			'siteName'           => get_bloginfo( 'name' ),
			'locale'             => $locale,
			'wpLocale'           => $wp_locale,
			'syncWpLocale'       => $is_sync_wp,
			'isRtl'              => $is_rtl,
			'activeLanguage'     => substr( $locale, 0, 2 ),
			'localeData'         => $domain_data,
			'supportedLanguages' => array(
				array( 'code' => 'en_US', 'short' => 'en', 'label' => 'English (US)', 'flag' => '🇺🇸', 'dir' => 'ltr' ),
				array( 'code' => 'ar',    'short' => 'ar', 'label' => 'العربية (Arabic)', 'flag' => '🇩🇿', 'dir' => 'rtl' ),
				array( 'code' => 'fr_FR', 'short' => 'fr', 'label' => 'Français (French)', 'flag' => '🇫🇷', 'dir' => 'ltr' ),
				array( 'code' => 'es_ES', 'short' => 'es', 'label' => 'Español (Spanish)', 'flag' => '🇪🇸', 'dir' => 'ltr' ),
			),
			'defaultPriority'    => get_option( 'workpress_default_priority', 'medium' ),
			'emailNotifications' => (bool) get_option( 'workpress_email_notifications', true ),
			'timezone'           => get_option( 'workpress_timezone', wp_timezone_string() ?: 'Africa/Algiers' ),
			'monthNaming'        => get_option( 'workpress_month_naming', 'maghrebi' ),
			'dateFormat'         => get_option( 'workpress_date_format', 'D MMMM YYYY' ),
			'relativeTime'       => (bool) get_option( 'workpress_relative_time', true ),
			'gmtOffset'          => (float) get_option( 'gmt_offset', 1 ),
			'sound_enabled'      => (bool) get_option( 'workpress_sound_enabled', true ),
			'sound_volume'       => (float) get_option( 'workpress_sound_volume', 0.7 ),
			'sound_kit'          => get_option( 'workpress_sound_kit', '01' ),
			'sound_notification' => get_option( 'workpress_sound_notification', 'notification' ),
			'sound_celebration'  => get_option( 'workpress_sound_celebration', 'celebration' ),
			'sound_button'       => get_option( 'workpress_sound_button', 'button' ),
			'sound_transition'   => get_option( 'workpress_sound_transition', 'transition_up' ),
			'sound_caution'       => get_option( 'workpress_sound_caution', 'caution' ),
			'sound_events_config' => get_option( 'workpress_sound_events_config', array() ),
			'intake_forms_schema' => get_option( 'workpress_intake_forms_schema', WorkPress_Project_Service::get_default_intake_forms_schema() ),
			'userCaps'           => array(
				'canManageProjects' => $is_admin || current_user_can( 'edit_workpress_projects' ),
				'canCreateTasks'    => $is_admin || current_user_can( 'create_workpress_tasks' ),
				'canManageOptions'  => $is_admin || current_user_can( 'manage_workpress_settings' ),
				'canAccessAdmin'    => $is_admin || current_user_can( 'access_workpress_admin' ),
				'canAccessPortal'   => $is_admin || current_user_can( 'access_workpress_portal' ),
				'canTriageRequests'   => $is_admin || current_user_can( 'triage_requests' ),
				'canAcceptSolutions'  => $is_admin || current_user_can( 'accept_solutions' ),
				'canManageBroadcasts' => $is_admin || current_user_can( 'manage_workpress_broadcasts' ),
			),
			'userId'             => $current_user->ID,
			'userRoles'          => (array) $current_user->roles,
			'userDisplayName'    => $current_user->display_name ?: $current_user->user_login,
			'userAvatar'         => get_avatar_url( $current_user->ID, array( 'size' => 64 ) ),
			'isAdmin'            => $is_admin,
			'pluginUrl'          => WORKPRESS_URL,
			'version'            => WORKPRESS_VERSION,
			'logoUrl'            => class_exists( 'WorkPress_REST_Settings_Controller' ) ? WorkPress_REST_Settings_Controller::get_custom_logo_url() : ( WORKPRESS_URL . 'assets/brand/workpress.svg' ),
			'faviconUrl'         => class_exists( 'WorkPress_REST_Settings_Controller' ) ? WorkPress_REST_Settings_Controller::get_custom_favicon_url() : ( WORKPRESS_URL . 'assets/brand/favicon.svg' ),
			'customLogoUrl'      => get_option( 'workpress_custom_logo_url', '' ),
			'customLogoId'       => (int) get_option( 'workpress_custom_logo_id', 0 ),
			'customFaviconUrl'   => get_option( 'workpress_custom_favicon_url', '' ),
			'customFaviconId'    => (int) get_option( 'workpress_custom_favicon_id', 0 ),
			'defaultLogoUrl'     => WORKPRESS_URL . 'assets/brand/workpress.svg',
			'defaultFaviconUrl'  => WORKPRESS_URL . 'assets/brand/favicon.svg',
			'broadcastNotice'    => get_option( 'workpress_broadcast_notice', array(
				'enabled' => true,
				'text'    => __( 'Welcome to WorkPress — please document your achievements via contributions and keep tasks updated.', 'workpress' )
			) ),
		);
	}

	/**
	 * Render Admin Page View.
	 */
	public function render_admin_page() {
		$settings = self::get_client_settings();
		// Direct inline script injection ensures immediate availability before deferred ES Modules run
		echo '<script>window.workpressSettings = ' . wp_json_encode( $settings ) . ';</script>';
		// App Shell for React SPA (ARCHITECTURE.md C.2)
		echo '<div class="wrap"><div id="workpress-app">جاري تحميل التطبيق...</div></div>';
	}

}

