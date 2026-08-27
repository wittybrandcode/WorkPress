<?php
/**
 * REST API Controller for WorkPress Settings.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_REST_Settings_Controller extends WP_REST_Controller {

	protected $namespace;
	protected $rest_base;

	public function __construct() {
		$this->namespace = 'workpress/v1';
		$this->rest_base = 'settings';
	}

	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_settings' ),
				'permission_callback' => array( $this, 'get_permissions_check' ),
			),
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_settings' ),
				'permission_callback' => array( $this, 'update_permissions_check' ),
			),
		) );
	}

	public function get_permissions_check( $request ) {
		return is_user_logged_in();
	}

	public function update_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function get_settings( $request ) {
		return rest_ensure_response( array(
			'siteName'           => get_bloginfo( 'name' ),
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
			'sound_caution'      => get_option( 'workpress_sound_caution', 'caution' ),
			'sound_events_config' => get_option( 'workpress_sound_events_config', array() ),
			'intake_forms_schema' => get_option( 'workpress_intake_forms_schema', WorkPress_Project_Service::get_default_intake_forms_schema() ),
		) );
	}

	public static function get_default_intake_forms_schema() {
		if ( class_exists( 'WorkPress_Project_Service' ) ) {
			return WorkPress_Project_Service::get_default_intake_forms_schema();
		}
		return array();
	}

	public function update_settings( $request ) {
		$params = $request->get_json_params();

		if ( isset( $params['siteName'] ) ) {
			update_option( 'blogname', sanitize_text_field( $params['siteName'] ) );
		}

		if ( isset( $params['defaultPriority'] ) ) {
			update_option( 'workpress_default_priority', sanitize_key( $params['defaultPriority'] ) );
		}

		if ( isset( $params['emailNotifications'] ) ) {
			update_option( 'workpress_email_notifications', (bool) $params['emailNotifications'] );
		}

		if ( isset( $params['timezone'] ) ) {
			$tz = sanitize_text_field( $params['timezone'] );
			update_option( 'workpress_timezone', $tz );
			if ( in_array( $tz, timezone_identifiers_list(), true ) ) {
				update_option( 'timezone_string', $tz );
			}
		}

		if ( isset( $params['monthNaming'] ) ) {
			update_option( 'workpress_month_naming', sanitize_key( $params['monthNaming'] ) );
		}

		if ( isset( $params['dateFormat'] ) ) {
			update_option( 'workpress_date_format', sanitize_text_field( $params['dateFormat'] ) );
		}

		if ( isset( $params['relativeTime'] ) ) {
			update_option( 'workpress_relative_time', (bool) $params['relativeTime'] );
		}

		if ( isset( $params['sound_enabled'] ) ) {
			update_option( 'workpress_sound_enabled', (bool) $params['sound_enabled'] );
		}

		if ( isset( $params['sound_volume'] ) ) {
			update_option( 'workpress_sound_volume', floatval( $params['sound_volume'] ) );
		}

		if ( isset( $params['sound_kit'] ) ) {
			update_option( 'workpress_sound_kit', sanitize_key( $params['sound_kit'] ) );
		}

		if ( isset( $params['sound_notification'] ) ) {
			update_option( 'workpress_sound_notification', sanitize_key( $params['sound_notification'] ) );
		}

		if ( isset( $params['sound_celebration'] ) ) {
			update_option( 'workpress_sound_celebration', sanitize_key( $params['sound_celebration'] ) );
		}

		if ( isset( $params['sound_button'] ) ) {
			update_option( 'workpress_sound_button', sanitize_key( $params['sound_button'] ) );
		}

		if ( isset( $params['sound_transition'] ) ) {
			update_option( 'workpress_sound_transition', sanitize_key( $params['sound_transition'] ) );
		}

		if ( isset( $params['sound_caution'] ) ) {
			update_option( 'workpress_sound_caution', sanitize_key( $params['sound_caution'] ) );
		}

		if ( isset( $params['sound_events_config'] ) && is_array( $params['sound_events_config'] ) ) {
			$sanitized_events = array();
			foreach ( $params['sound_events_config'] as $key => $conf ) {
				$s_key = sanitize_key( $key );
				$sanitized_events[ $s_key ] = array(
					'enabled' => ! empty( $conf['enabled'] ),
					'sound'   => sanitize_key( $conf['sound'] ?? '' ),
				);
			}
			update_option( 'workpress_sound_events_config', $sanitized_events );
		}

		if ( isset( $params['intake_forms_schema'] ) && is_array( $params['intake_forms_schema'] ) ) {
			$sanitized_forms = array();
			foreach ( $params['intake_forms_schema'] as $form ) {
				if ( ! is_array( $form ) ) continue;
				$sanitized_specs = array();
				if ( isset( $form['specs'] ) && is_array( $form['specs'] ) ) {
					foreach ( $form['specs'] as $spec ) {
						if ( ! is_array( $spec ) ) continue;
						$sanitized_specs[] = array(
							'id'          => sanitize_key( $spec['id'] ?? uniqid('spec_') ),
							'type'        => sanitize_key( $spec['type'] ?? 'text' ),
							'label'       => sanitize_text_field( $spec['label'] ?? '' ),
							'placeholder' => sanitize_text_field( $spec['placeholder'] ?? '' ),
							'options'     => isset( $spec['options'] ) && is_array( $spec['options'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $spec['options'] ) ) ) : array(),
							'required'    => ! empty( $spec['required'] ),
						);
					}
				}

				$sanitized_forms[] = array(
					'id'                => sanitize_key( $form['id'] ?? uniqid('form_') ),
					'name'              => sanitize_text_field( $form['name'] ?? 'نموذج طلب' ),
					'title_label'       => sanitize_text_field( $form['title_label'] ?? 'عنوان الطلب:' ),
					'title_placeholder' => sanitize_text_field( $form['title_placeholder'] ?? '' ),
					'title_suggestions' => isset( $form['title_suggestions'] ) && is_array( $form['title_suggestions'] ) ? array_values( array_filter( array_map( 'sanitize_text_field', $form['title_suggestions'] ) ) ) : array(),
					'desc_label'        => sanitize_text_field( $form['desc_label'] ?? 'تفاصيل الطلب:' ),
					'desc_placeholder'  => sanitize_text_field( $form['desc_placeholder'] ?? '' ),
					'specs'             => $sanitized_specs,
				);
			}
			update_option( 'workpress_intake_forms_schema', $sanitized_forms );
		}

		return $this->get_settings( $request );
	}
}
