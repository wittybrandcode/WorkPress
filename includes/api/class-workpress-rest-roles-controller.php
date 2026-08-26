<?php
/**
 * REST API Roles & Capabilities Controller.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Roles_Controller extends WP_REST_Controller {

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'roles';
	}

	/**
	 * Register routes.
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'update_items' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/aliases',
			array(
				array(
					'methods'             => 'PUT',
					'callback'            => array( $this, 'update_aliases' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/custom',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_custom_role' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/custom/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_custom_role' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Check permissions (Only Admin can manage roles).
	 */
	public function permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get WorkPress roles and their capabilities.
	 */
	public function get_items( $request ) {
		$wp_roles = wp_roles();
		
		// The native roles + workpress_client + any custom roles created by WorkPress
		$custom_roles = get_option( 'workpress_custom_roles', array() );
		$target_roles = array_unique( array_merge( array( 'administrator', 'editor', 'author', 'contributor', 'subscriber', 'workpress_client' ), $custom_roles ) );
		
		// The capabilities we want to expose in the UI matrix
		$target_caps_groups = WorkPress_Capabilities_Registry::get_registered_capabilities();

		// Fetch Aliases
		$aliases = get_option( 'workpress_role_aliases', array() );

		$data = array(
			'roles'   => array(),
			'groups'  => $target_caps_groups,
			'aliases' => $aliases,
		);

		$native_labels = array(
			'administrator'    => __( 'مدير عام', 'workpress' ),
			'editor'           => __( 'قائد مشروع', 'workpress' ),
			'author'           => __( 'منفذ رئيسي', 'workpress' ),
			'contributor'      => __( 'مساهم فني', 'workpress' ),
			'subscriber'       => __( 'مشترك', 'workpress' ),
			'workpress_client' => __( 'مستفيد', 'workpress' ),
		);

		foreach ( $target_roles as $role_name ) {
			$role = $wp_roles->get_role( $role_name );
			if ( $role ) {
				$raw_name     = isset( $wp_roles->role_names[ $role_name ] ) ? translate_user_role( $wp_roles->role_names[ $role_name ] ) : $role_name;
				$display_name = isset( $native_labels[ $role_name ] ) ? $native_labels[ $role_name ] : $raw_name;
				$alias        = isset( $aliases[ $role_name ] ) && ! empty( $aliases[ $role_name ] ) ? $aliases[ $role_name ] : $display_name;

				$role_data = array(
					'name'         => $role_name,
					'display_name' => $display_name,
					'alias'        => $alias,
					'is_custom'    => in_array( $role_name, $custom_roles, true ),
					'capabilities' => array(),
				);
				
				foreach ( $target_caps_groups as $group_key => $group ) {
					foreach ( $group['caps'] as $cap_key => $cap_label ) {
						$role_data['capabilities'][ $cap_key ] = $role->has_cap( $cap_key );
					}
				}
				
				$data['roles'][] = $role_data;
			}
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Update capabilities for roles.
	 */
	public function update_items( $request ) {
		$updates = $request->get_param( 'updates' );
		
		if ( ! is_array( $updates ) ) {
			return new WP_Error( 'invalid_data', __( 'بيانات غير صالحة', 'workpress' ), array( 'status' => 400 ) );
		}

		$wp_roles = wp_roles();
		
		foreach ( $updates as $role_name => $caps ) {
			$role = $wp_roles->get_role( $role_name );
			if ( $role && is_array( $caps ) ) {
				foreach ( $caps as $cap_name => $is_granted ) {
					if ( $is_granted ) {
						$role->add_cap( $cap_name );
					} else {
						$role->remove_cap( $cap_name );
					}
				}
			}
		}

		return rest_ensure_response( array( 'success' => true ) );
	}

	/**
	 * Update role aliases (Custom Display Names).
	 */
	public function update_aliases( $request ) {
		$aliases = $request->get_param( 'aliases' );
		
		if ( ! is_array( $aliases ) ) {
			return new WP_Error( 'invalid_data', __( 'بيانات غير صالحة', 'workpress' ), array( 'status' => 400 ) );
		}

		// Sanitize
		$sanitized_aliases = array();
		foreach ( $aliases as $role => $alias ) {
			$sanitized_aliases[ sanitize_key( $role ) ] = sanitize_text_field( $alias );
		}

		update_option( 'workpress_role_aliases', $sanitized_aliases );

		return rest_ensure_response( array( 'success' => true, 'aliases' => $sanitized_aliases ) );
	}

	/**
	 * Create a custom role cloned from an existing one.
	 */
	public function create_custom_role( $request ) {
		$role_id = sanitize_key( $request->get_param( 'role_id' ) );
		$display_name = sanitize_text_field( $request->get_param( 'display_name' ) );
		$clone_from = sanitize_key( $request->get_param( 'clone_from' ) );

		if ( empty( $role_id ) || empty( $display_name ) || empty( $clone_from ) ) {
			return new WP_Error( 'missing_fields', __( 'جميع الحقول مطلوبة', 'workpress' ), array( 'status' => 400 ) );
		}

		$wp_roles = wp_roles();
		
		if ( $wp_roles->is_role( $role_id ) ) {
			return new WP_Error( 'role_exists', __( 'هذا الدور موجود مسبقاً', 'workpress' ), array( 'status' => 400 ) );
		}

		$base_role = $wp_roles->get_role( $clone_from );
		if ( ! $base_role ) {
			return new WP_Error( 'invalid_base_role', __( 'الدور الأساسي غير صالح', 'workpress' ), array( 'status' => 400 ) );
		}

		// Create the new role with the base role's capabilities
		add_role( $role_id, $display_name, $base_role->capabilities );

		// Save it in our custom roles array
		$custom_roles = get_option( 'workpress_custom_roles', array() );
		if ( ! in_array( $role_id, $custom_roles, true ) ) {
			$custom_roles[] = $role_id;
			update_option( 'workpress_custom_roles', $custom_roles );
		}

		// Add an alias immediately so it matches what the user typed
		$aliases = get_option( 'workpress_role_aliases', array() );
		$aliases[ $role_id ] = $display_name;
		update_option( 'workpress_role_aliases', $aliases );

		return rest_ensure_response( array( 'success' => true, 'role_id' => $role_id ) );
	}

	/**
	 * Delete a custom role.
	 */
	public function delete_custom_role( $request ) {
		$role_id = sanitize_key( $request['id'] );
		
		$custom_roles = get_option( 'workpress_custom_roles', array() );
		
		if ( ! in_array( $role_id, $custom_roles, true ) ) {
			return new WP_Error( 'not_custom_role', __( 'لا يمكن حذف هذا الدور أو أنه غير موجود', 'workpress' ), array( 'status' => 403 ) );
		}
		
		// Remove from custom roles array
		$custom_roles = array_diff( $custom_roles, array( $role_id ) );
		update_option( 'workpress_custom_roles', $custom_roles );
		
		// Remove from aliases
		$aliases = get_option( 'workpress_role_aliases', array() );
		if ( isset( $aliases[ $role_id ] ) ) {
			unset( $aliases[ $role_id ] );
			update_option( 'workpress_role_aliases', $aliases );
		}
		
		// Remove role from WordPress
		remove_role( $role_id );
		
		return rest_ensure_response( array( 'success' => true, 'deleted' => $role_id ) );
	}
}
