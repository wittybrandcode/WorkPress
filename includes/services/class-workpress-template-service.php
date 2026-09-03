<?php
/**
 * WorkPress Template Service.
 *
 * Provides the mechanism for Project Templates.
 * Core defines the registry; Office Packs supply the actual templates (Principle 15).
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Template_Service {

	/**
	 * Registered templates.
	 *
	 * @var array
	 */
	private static $templates = array();

	/**
	 * Initialize template registration hook.
	 */
	public static function init() {
		/**
		 * Fires when templates should be registered.
		 * Office Packs hook here to register their templates.
		 */
		do_action( 'workpress_register_templates' );
	}

	/**
	 * Register a project template.
	 *
	 * @param string $slug   Unique template slug.
	 * @param array  $config Template configuration.
	 * @return bool True on success, false if slug already exists.
	 */
	public static function register_template( $slug, $config ) {
		$slug = sanitize_key( $slug );
		if ( isset( self::$templates[ $slug ] ) ) {
			return false;
		}

		$defaults = array(
			'slug'        => $slug,
			'label'       => '',
			'description' => '',
			'tasks'       => array(),
			'roles'       => array( 'manager', 'member' ),
		);

		self::$templates[ $slug ] = wp_parse_args( $config, $defaults );
		return true;
	}

	/**
	 * Get all registered templates.
	 *
	 * @return array Map of slug => template config.
	 */
	public static function get_templates() {
		// Ensure templates have been registered.
		if ( empty( self::$templates ) ) {
			self::init();
		}
		return self::$templates;
	}

	/**
	 * Get a single template by slug.
	 *
	 * @param string $slug Template slug.
	 * @return array|null Template config or null if not found.
	 */
	public static function get_template( $slug ) {
		$templates = self::get_templates();
		return isset( $templates[ $slug ] ) ? $templates[ $slug ] : null;
	}

	/**
	 * Apply a template to a newly created project.
	 *
	 * Creates default tasks as defined in the template.
	 *
	 * @param int    $project_id  Project term ID.
	 * @param string $template_slug Template slug.
	 * @return array|WP_Error Array of created task IDs or WP_Error.
	 */
	public static function apply_template( $project_id, $template_slug ) {
		$template = self::get_template( $template_slug );
		if ( ! $template ) {
			return new WP_Error( 'template_not_found', __( 'Template not found.', 'workpress' ) );
		}

		$project = get_term( $project_id, WorkPress_Install::TAX_PROJECT );
		if ( ! $project || is_wp_error( $project ) ) {
			return new WP_Error( 'project_not_found', __( 'Project not found.', 'workpress' ) );
		}

		$created_tasks = array();

		foreach ( $template['tasks'] as $task_config ) {
			$task_data = array(
				'title'      => isset( $task_config['title'] ) ? $task_config['title'] : __( 'New Task', 'workpress' ),
				'content'    => isset( $task_config['content'] ) ? $task_config['content'] : '',
				'project_id' => $project_id,
				'priority'   => isset( $task_config['priority'] ) ? $task_config['priority'] : 'medium',
				'status'     => isset( $task_config['status'] ) ? $task_config['status'] : 'open',
			);

			$task = WorkPress_Task_Service::create_task( $task_data );
			if ( ! is_wp_error( $task ) ) {
				$created_tasks[] = $task['id'];
			}
		}

		return $created_tasks;
	}
}

// Register the default empty template.
add_action( 'workpress_register_templates', function() {
	WorkPress_Template_Service::register_template( 'blank', array(
		'label'       => __( 'Empty Project', 'workpress' ),
		'description' => __( 'Project without initial tasks.', 'workpress' ),
		'tasks'       => array(),
	) );
} );
