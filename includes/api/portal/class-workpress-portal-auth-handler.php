<?php
/**
 * WorkPress Portal Auth & Permissions Handler
 *
 * Manages Portal authentication, session keep-alive (nonces), and access permission callbacks.
 *
 * @package WorkPress
 * @subpackage API/Portal
 * @since 2.2.3
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Portal_Auth_Handler {

	/**
	 * Permission check: User must be logged in.
	 *
	 * @return bool|WP_Error
	 */
	public function check_logged_in_permission() {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول للوصول إلى بوابة المشاريع.', 'workpress' ), array( 'status' => 401 ) );
		}
		return true;
	}

	/**
	 * Permission check: User must have membership in the requested project.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return bool|WP_Error
	 */
	public function check_project_access_permission( $request ) {
		if ( ! is_user_logged_in() ) {
			return new WP_Error( 'rest_not_logged_in', __( 'يجب تسجيل الدخول أولاً.', 'workpress' ), array( 'status' => 401 ) );
		}

		$project_id = absint( $request['id'] );
		$user_id    = get_current_user_id();

		if ( ! WorkPress_Portal_Service::can_user_access_project( $project_id, $user_id ) ) {
			return new WP_Error( 'rest_forbidden_project', __( 'ليس لديك صلاحية للاطلاع على هذا المشروع.', 'workpress' ), array( 'status' => 403 ) );
		}

		return true;
	}

	/**
	 * AJAX Portal Login handler.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response|WP_Error
	 */
	public function portal_login( $request ) {
		$username = sanitize_user( $request->get_param( 'username' ) );
		$password = $request->get_param( 'password' );

		if ( empty( $username ) || empty( $password ) ) {
			return new WP_Error( 'missing_credentials', __( 'يرجى إدخال اسم المستخدم وكلمة المرور.', 'workpress' ), array( 'status' => 400 ) );
		}

		$credentials = array(
			'user_login'    => $username,
			'user_password' => $password,
			'remember'      => true,
		);

		$user = wp_signon( $credentials, is_ssl() );

		if ( is_wp_error( $user ) ) {
			return new WP_Error( 'invalid_credentials', __( 'بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة ثانية.', 'workpress' ), array( 'status' => 401 ) );
		}

		wp_set_current_user( $user->ID );

		$user_roles     = (array) $user->roles;
		$can_access     = false;
		$executive_type = 'subscriber';
		$role_label     = __( 'مشترك', 'workpress' );
		$redirect       = home_url( '/' );

		if ( in_array( 'administrator', $user_roles, true ) || user_can( $user, 'manage_options' ) ) {
			$executive_type = 'admin';
			$role_label     = __( 'مدير عام', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		} elseif ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'workpress_portal_user', $user_roles, true ) || user_can( $user, 'access_workpress_portal' ) ) {
			$executive_type = 'client';
			$role_label     = __( 'مستفيد', 'workpress' );
			$can_access     = true;
			$redirect       = home_url( '/portal/' );
		} elseif ( in_array( 'editor', $user_roles, true ) ) {
			$executive_type = 'lead';
			$role_label     = __( 'قائد مشروع', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		} elseif ( user_can( $user, 'edit_posts' ) || in_array( 'author', $user_roles, true ) || in_array( 'contributor', $user_roles, true ) ) {
			$executive_type = 'member';
			$role_label     = __( 'منفذ فني', 'workpress' );
			$can_access     = true;
			$redirect       = admin_url( 'admin.php?page=workpress#/' );
		}

		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = new WP_Roles();
		}
		$primary_slug = ! empty( $user_roles ) ? $user_roles[0] : 'subscriber';
		$role_name    = isset( $wp_roles->roles[ $primary_slug ]['name'] ) ? translate_user_role( $wp_roles->roles[ $primary_slug ]['name'] ) : $role_label;

		return new WP_REST_Response(
			array(
				'success'  => true,
				'user'     => array(
					'id'             => $user->ID,
					'display_name'   => $user->display_name,
					'email'          => $user->user_email,
					'avatar_url'     => get_avatar_url( $user->ID, array( 'size' => 128 ) ),
					'roles'          => $user_roles,
					'role_name'      => $role_name,
					'role_label'     => $role_label,
					'executive_type' => $executive_type,
					'can_access'     => $can_access,
					'is_admin'       => user_can( $user, 'manage_options' ),
				),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'redirect' => $redirect,
			),
			200
		);
	}

	/**
	 * Refresh and return a fresh REST nonce (Session Keep-Alive).
	 *
	 * @return WP_REST_Response
	 */
	public function refresh_nonce() {
		$is_logged_in = is_user_logged_in();
		$user         = wp_get_current_user();

		$user_data = null;
		if ( $is_logged_in ) {
			$user_roles     = (array) $user->roles;

			if ( in_array( 'administrator', $user_roles, true ) || user_can( $user, 'manage_options' ) ) {
				$executive_type = 'admin';
				$role_label     = __( 'Administrator', 'workpress' );
				$can_access     = true;
			} elseif ( in_array( 'workpress_client', $user_roles, true ) || in_array( 'workpress_portal_user', $user_roles, true ) || user_can( $user, 'access_workpress_portal' ) ) {
				$executive_type = 'client';
				$role_label     = __( 'Client', 'workpress' );
				$can_access     = true;
			} elseif ( in_array( 'editor', $user_roles, true ) ) {
				$executive_type = 'lead';
				$role_label     = __( 'Project Lead', 'workpress' );
				$can_access     = true;
			} elseif ( user_can( $user, 'edit_posts' ) || in_array( 'author', $user_roles, true ) || in_array( 'contributor', $user_roles, true ) ) {
				$executive_type = 'member';
				$role_label     = __( 'Technical Staff', 'workpress' );
				$can_access     = true;
			}
		}

		global $wp_roles;
		if ( ! isset( $wp_roles ) ) {
			$wp_roles = new WP_Roles();
		}
		$primary_slug = ! empty( $user_roles ) ? $user_roles[0] : 'subscriber';
		$role_name    = isset( $wp_roles->roles[ $primary_slug ]['name'] ) ? translate_user_role( $wp_roles->roles[ $primary_slug ]['name'] ) : $role_label;

		$user_data = array(
			'id'             => $user ? $user->ID : 0,
			'display_name'   => $user ? $user->display_name : '',
			'email'          => $user ? $user->user_email : '',
			'avatar_url'     => $user ? get_avatar_url( $user->ID, array( 'size' => 128 ) ) : '',
			'roles'          => $user_roles,
			'role_name'      => $role_name,
			'role_label'     => $role_label,
			'executive_type' => $executive_type,
			'can_access'     => $can_access,
			'is_admin'       => $user ? user_can( $user, 'manage_options' ) : false,
		);

		return new WP_REST_Response(
			array(
				'success'    => true,
				'nonce'      => wp_create_nonce( 'wp_rest' ),
				'isLoggedIn' => $is_logged_in,
				'user'       => $user_data,
			),
			200
		);
	}

	/**
	 * Set client preferred language in user meta and cookie.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function set_language( $request ) {
		$lang = sanitize_key( $request->get_param( 'lang' ) );
		$allowed = array( 'ar', 'en_US', 'fr_FR', 'es_ES', 'en', 'fr', 'es' );
		if ( ! in_array( $lang, $allowed, true ) ) {
			$lang = 'ar';
		}

		if ( is_user_logged_in() ) {
			update_user_meta( get_current_user_id(), '_workpress_portal_locale', $lang );
		}

		if ( ! headers_sent() ) {
			setcookie( 'workpress_portal_locale', $lang, time() + YEAR_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), false );
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'lang'    => $lang,
				'is_rtl'  => in_array( substr( $lang, 0, 2 ), array( 'ar', 'he', 'fa', 'ur' ), true ),
				'message' => __( 'Language updated successfully.', 'workpress' ),
			),
			200
		);
	}
}
