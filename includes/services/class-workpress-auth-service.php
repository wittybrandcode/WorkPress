<?php
/**
 * WorkPress Native Authentication & Access Gateway Service
 *
 * Provides standalone SaaS-grade authentication, login/logout URL interception,
 * role-based smart post-login redirection, and brute-force rate-limiting defense,
 * with ZERO modifications to WordPress core files.
 *
 * @package WorkPress
 * @subpackage Services
 * @since 2.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Auth_Service {

	/**
	 * Single instance.
	 *
	 * @var WorkPress_Auth_Service|null
	 */
	private static $instance = null;

	/**
	 * Option name for custom login activation.
	 *
	 * @var string
	 */
	const OPTION_CUSTOM_LOGIN_ENABLED = 'workpress_custom_login_enabled';

	/**
	 * Max failed login attempts before temporary lockout.
	 *
	 * @var int
	 */
	const MAX_FAILED_ATTEMPTS = 5;

	/**
	 * Lockout duration in seconds (15 minutes).
	 *
	 * @var int
	 */
	const LOCKOUT_DURATION = 900;

	/**
	 * Get singleton instance.
	 *
	 * @return WorkPress_Auth_Service
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Initialize service.
	 */
	public static function init() {
		self::get_instance();
	}

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'register_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'register_query_vars' ) );
		add_filter( 'template_include', array( $this, 'intercept_auth_template' ), 98 );

		// Core URL Filters (when custom login is enabled)
		if ( $this->is_custom_login_enabled() ) {
			add_filter( 'login_url', array( $this, 'filter_login_url' ), 10, 3 );
			add_filter( 'logout_url', array( $this, 'filter_logout_url' ), 10, 2 );
			add_action( 'login_init', array( $this, 'intercept_wp_login_requests' ) );
		}

		// Smart Post-Login Redirection Hierarchy
		add_filter( 'login_redirect', array( $this, 'handle_smart_login_redirect' ), 10, 3 );

		// Brute-force Throttling
		add_action( 'wp_login_failed', array( $this, 'record_failed_login' ) );
		add_filter( 'authenticate', array( $this, 'check_brute_force_lockout' ), 30, 3 );
		add_action( 'wp_login', array( $this, 'clear_failed_logins' ), 10, 2 );
	}

	/**
	 * Check if custom login is enabled in WorkPress settings.
	 *
	 * @return bool
	 */
	public function is_custom_login_enabled() {
		return 'no' !== get_option( self::OPTION_CUSTOM_LOGIN_ENABLED, 'yes' );
	}

	/**
	 * Register rewrite rule for /workpress-login/ endpoint.
	 */
	public function register_rewrite_rules() {
		add_rewrite_rule( '^workpress-login/?$', 'index.php?workpress_auth_gateway=1', 'top' );

		// Auto-flush if rule is not in cached rewrite rules
		$rules = get_option( 'rewrite_rules' );
		if ( is_array( $rules ) && ! isset( $rules['^workpress-login/?$'] ) ) {
			flush_rewrite_rules( false );
		}
	}

	/**
	 * Register custom query variable.
	 *
	 * @param array $vars Query variables.
	 * @return array
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'workpress_auth_gateway';
		return $vars;
	}

	/**
	 * Get the canonical URL of the WorkPress Login Gateway.
	 *
	 * @param string $redirect_to Optional redirect target.
	 * @return string
	 */
	public static function get_login_url( $redirect_to = '' ) {
		$url = home_url( '/workpress-login/' );
		if ( ! empty( $redirect_to ) ) {
			$url = add_query_arg( 'redirect_to', urlencode( $redirect_to ), $url );
		}
		return $url;
	}

	/**
	 * Check if current request is the WorkPress Login Gateway.
	 *
	 * @return bool
	 */
	public static function is_auth_gateway_url() {
		if ( (int) get_query_var( 'workpress_auth_gateway' ) === 1 ) {
			return true;
		}
		if ( ! empty( $_SERVER['REQUEST_URI'] ) ) {
			$path = trim( (string) parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
			if ( $path === 'workpress-login' || preg_match( '#(^|/)workpress-login/?$#', $path ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Intercept template loading to render the standalone WorkPress Login Canvas or process logout.
	 *
	 * @param string $template Current template file.
	 * @return string
	 */
	public function intercept_auth_template( $template ) {
		if ( self::is_auth_gateway_url() ) {
			// 1. Handle direct secure logout
			if ( isset( $_GET['action'] ) && 'logout' === $_GET['action'] ) {
				$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';
				if ( wp_verify_nonce( $nonce, 'log-out' ) || is_user_logged_in() ) {
					wp_logout();
				}
				$redirect_to = isset( $_GET['redirect_to'] ) ? esc_url_raw( urldecode( wp_unslash( $_GET['redirect_to'] ) ) ) : '';
				if ( empty( $redirect_to ) || false !== strpos( $redirect_to, 'wp-login' ) ) {
					$redirect_to = add_query_arg( 'loggedout', 'true', self::get_login_url() );
				}
				wp_safe_redirect( $redirect_to );
				exit;
			}

			// 2. If already logged in, smart redirect to their respective workspace
			if ( is_user_logged_in() ) {
				$current_user = wp_get_current_user();
				$redirect_to  = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : '';
				$target       = $this->resolve_role_landing_page( $current_user, $redirect_to );
				wp_safe_redirect( $target );
				exit;
			}

			$custom_template = WORKPRESS_PATH . 'templates/auth/login.php';
			if ( file_exists( $custom_template ) ) {
				return $custom_template;
			}
		}
		return $template;
	}

	/**
	 * Filter wp_login_url() to return the WorkPress Login Gateway URL.
	 *
	 * @param string $login_url Original login URL.
	 * @param string $redirect Target redirect URL.
	 * @param bool   $force_reauth Whether to force reauthentication.
	 * @return string
	 */
	public function filter_login_url( $login_url, $redirect = '', $force_reauth = false ) {
		// Don't intercept if emergency bypass is requested
		if ( isset( $_GET['workpress_native'] ) || isset( $_GET['wp_native_login'] ) ) {
			return $login_url;
		}
		return self::get_login_url( $redirect );
	}

	/**
	 * Filter wp_logout_url() to provide an instantaneous, secure WorkPress logout.
	 *
	 * @param string $logout_url Original logout URL.
	 * @param string $redirect Target redirect URL.
	 * @return string
	 */
	public function filter_logout_url( $logout_url, $redirect = '' ) {
		$target_redirect = ! empty( $redirect ) ? $redirect : add_query_arg( 'loggedout', 'true', self::get_login_url() );
		$nonce           = wp_create_nonce( 'log-out' );

		return add_query_arg(
			array(
				'action'      => 'logout',
				'_wpnonce'    => $nonce,
				'redirect_to' => urlencode( $target_redirect ),
			),
			home_url( '/workpress-login/' )
		);
	}

	/**
	 * Intercept direct visits to wp-login.php and redirect to WorkPress Gateway.
	 */
	public function intercept_wp_login_requests() {
		// Bypass if emergency rescue flag is passed
		if ( isset( $_GET['workpress_native'] ) || isset( $_GET['wp_native_login'] ) ) {
			return;
		}

		$action = isset( $_GET['action'] ) ? sanitize_text_field( wp_unslash( $_GET['action'] ) ) : '';

		// Handle wp-login.php?action=logout seamlessly
		if ( 'logout' === $action ) {
			$nonce = isset( $_REQUEST['_wpnonce'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ) ) : '';
			if ( wp_verify_nonce( $nonce, 'log-out' ) || is_user_logged_in() ) {
				wp_logout();
				$redirect_to = isset( $_GET['redirect_to'] ) ? esc_url_raw( urldecode( wp_unslash( $_GET['redirect_to'] ) ) ) : add_query_arg( 'loggedout', 'true', self::get_login_url() );
				wp_safe_redirect( $redirect_to );
				exit;
			}
		}

		// Allow core actions like password reset token handling, postpass, etc.
		$allowed_actions = array( 'postpass', 'confirmaction' );
		if ( in_array( $action, $allowed_actions, true ) ) {
			return;
		}

		// Allow POST requests
		if ( 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			return;
		}

		// If user is not logged in and is visiting standard login screen, redirect to WorkPress Gateway
		if ( ! is_user_logged_in() && ! self::is_auth_gateway_url() ) {
			$redirect_to = isset( $_GET['redirect_to'] ) ? esc_url_raw( wp_unslash( $_GET['redirect_to'] ) ) : '';
			$target      = self::get_login_url( $redirect_to );
			if ( 'lostpassword' === $action ) {
				$target = add_query_arg( 'view', 'lostpassword', $target );
			}
			wp_safe_redirect( $target );
			exit;
		}
	}

	/**
	 * Smart post-login redirection based on the 4-Tier Citizenship Hierarchy.
	 *
	 * @param string           $redirect_to Initial target redirect URL.
	 * @param string           $requested_redirect Requested redirect URL from form.
	 * @param WP_User|WP_Error $user Logged in user or error.
	 * @return string
	 */
	public function handle_smart_login_redirect( $redirect_to, $requested_redirect, $user ) {
		if ( ! is_a( $user, 'WP_User' ) ) {
			return $redirect_to;
		}
		return $this->resolve_role_landing_page( $user, $requested_redirect );
	}

	/**
	 * Resolve proper landing page for a user according to their role hierarchy.
	 *
	 * @param WP_User $user The authenticated user.
	 * @param string  $requested_target Optional requested redirect target.
	 * @return string
	 */
	public function resolve_role_landing_page( $user, $requested_target = '' ) {
		// If safe specific redirect was explicitly requested and is not a login/admin loop
		if ( ! empty( $requested_target ) && false === strpos( $requested_target, 'wp-login' ) && false === strpos( $requested_target, 'workpress-login' ) ) {
			// Check if client is trying to access wp-admin, reroute to portal
			if ( in_array( 'workpress_client', (array) $user->roles, true ) && false !== strpos( $requested_target, 'wp-admin' ) ) {
				return home_url( '/portal/' );
			}
			return $requested_target;
		}

		// Universal Smart Welcome Gateway Transition for all citizen tiers
		return home_url( '/portal/?welcome=1' );
	}

	/**
	 * Record failed login attempt for Brute-Force Rate Limiting.
	 *
	 * @param string $username Username attempted.
	 */
	public function record_failed_login( $username ) {
		$ip = $this->get_client_ip();
		$transient_key = 'wp_auth_fail_' . md5( $ip );
		$attempts = (int) get_transient( $transient_key );
		$attempts++;
		set_transient( $transient_key, $attempts, self::LOCKOUT_DURATION );
	}

	/**
	 * Clear failed logins on successful login.
	 *
	 * @param string  $username Logged in username.
	 * @param WP_User $user WP_User instance.
	 */
	public function clear_failed_logins( $username, $user ) {
		$ip = $this->get_client_ip();
		delete_transient( 'wp_auth_fail_' . md5( $ip ) );
	}

	/**
	 * Check if current IP is temporarily locked out before authenticating.
	 *
	 * @param WP_User|WP_Error|null $user User object or null.
	 * @param string                $username Username.
	 * @param string                $password Password.
	 * @return WP_User|WP_Error
	 */
	public function check_brute_force_lockout( $user, $username, $password ) {
		if ( empty( $username ) ) {
			return $user;
		}

		$ip = $this->get_client_ip();
		$attempts = (int) get_transient( 'wp_auth_fail_' . md5( $ip ) );

		if ( $attempts >= self::MAX_FAILED_ATTEMPTS ) {
			return new WP_Error(
				'workpress_too_many_attempts',
				__( 'تم تجاوز الحد المسموح من محاولات الدخول الخاطئة. تم قفل المحاولات مؤقتاً لمدة 15 دقيقة لدواعي الأمان والحماية.', 'workpress' )
			);
		}

		return $user;
	}

	/**
	 * Get reliable client IP address.
	 *
	 * @return string
	 */
	private function get_client_ip() {
		if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );
		}
		if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
			$ips = explode( ',', sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) );
			return trim( $ips[0] );
		}
		return ! empty( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '127.0.0.1';
	}
}
