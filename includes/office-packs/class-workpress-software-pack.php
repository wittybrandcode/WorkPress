<?php
/**
 * Software Development Pack
 *
 * Provides templates and defaults for software development projects.
 *
 * @package WorkPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Software_Pack {

	/**
	 * Initialize the pack.
	 */
	public static function init() {
		add_action( 'workpress_register_templates', array( __CLASS__, 'register_templates' ) );
	}

	/**
	 * Register templates provided by this pack.
	 */
	public static function register_templates() {
		if ( ! class_exists( 'WorkPress_Template_Service' ) ) {
			return;
		}

		WorkPress_Template_Service::register_template( 'software-dev', array(
			'label'       => __( 'Software Development', 'workpress' ),
			'description' => __( 'Specialized template for software development projects including requirement analysis, design, development, and testing.', 'workpress' ),
			'tasks'       => array(
				array(
					'title'    => __( 'Requirement Analysis', 'workpress' ),
					'content'  => __( 'Gather and analyze system requirements and prepare PRD document.', 'workpress' ),
					'priority' => 'high',
					'status'   => 'new',
				),
				array(
					'title'    => __( 'User Interface Design (UI/UX)', 'workpress' ),
					'content'  => __( 'Design system interfaces and user experience.', 'workpress' ),
					'priority' => 'medium',
					'status'   => 'new',
				),
				array(
					'title'    => __( 'Build and develop APIs', 'workpress' ),
					'content'  => __( 'Build required API endpoints based on architectural design.', 'workpress' ),
					'priority' => 'high',
					'status'   => 'new',
				),
				array(
					'title'    => __( 'Automated Testing', 'workpress' ),
					'content'  => __( 'Write unit tests and verify code coverage.', 'workpress' ),
					'priority' => 'medium',
					'status'   => 'new',
				),
			),
			'roles'       => array(
				'manager',
				'developer',
				'tester',
				'designer',
			),
		) );
	}
}

// Initialize the pack.
WorkPress_Software_Pack::init();
