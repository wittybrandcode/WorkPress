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
			'label'       => __( 'تطوير برمجيات (Software Development)', 'workpress' ),
			'description' => __( 'قالب مخصص لمشاريع تطوير البرمجيات يشمل مهام تحليل المتطلبات، التصميم، التطوير، والاختبار.', 'workpress' ),
			'tasks'       => array(
				array(
					'title'    => __( 'تحليل المتطلبات', 'workpress' ),
					'content'  => __( 'جمع وتحليل متطلبات النظام وإعداد وثيقة المتطلبات (PRD).', 'workpress' ),
					'priority' => 'high',
					'status'   => 'open',
				),
				array(
					'title'    => __( 'تصميم واجهة المستخدم (UI/UX)', 'workpress' ),
					'content'  => __( 'تصميم واجهات النظام وتجربة المستخدم.', 'workpress' ),
					'priority' => 'medium',
					'status'   => 'open',
				),
				array(
					'title'    => __( 'بناء وتطوير واجهات برمجة التطبيقات (API)', 'workpress' ),
					'content'  => __( 'بناء نقاط الاتصال المطلوبة بناءً على التصميم المعماري.', 'workpress' ),
					'priority' => 'high',
					'status'   => 'open',
				),
				array(
					'title'    => __( 'الاختبار الأوتوماتيكي (Automated Testing)', 'workpress' ),
					'content'  => __( 'كتابة اختبارات الوحدة والتحقق من التغطية البرمجية.', 'workpress' ),
					'priority' => 'medium',
					'status'   => 'open',
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
