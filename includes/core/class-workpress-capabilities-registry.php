<?php
/**
 * WorkPress Capabilities Registry.
 *
 * @package WorkPress
 */

if (!defined('ABSPATH')) {
	exit;
}

class WorkPress_Capabilities_Registry {

	/**
	 * Get all registered capability groups and their capabilities.
	 *
	 * @return array
	 */
	public static function get_registered_capabilities() {
		$groups = array(
			'access' => array(
				'label' => __( 'واجهات الوصول والدخول (Access & Perimeter)', 'workpress' ),
				'caps'  => array(
					'access_workpress_admin'  => __( 'الدخول لغرفة عمليات CoWorkPress', 'workpress' ),
					'access_workpress_portal' => __( 'الدخول للبوابة المستقلة ومساحة المخرجات', 'workpress' ),
				),
			),
			'projects' => array(
				'label' => __( 'صلاحيات المشاريع وسياقات العمل (Projects)', 'workpress' ),
				'caps'  => array(
					'read_workpress_projects'   => __( 'الاطلاع على المشاريع المصرح بها', 'workpress' ),
					'create_workpress_projects' => __( 'إنشاء وتأسيس مشاريع جديدة', 'workpress' ),
					'edit_workpress_projects'   => __( 'تعديل بيانات ومواعيد المشاريع', 'workpress' ),
					'delete_workpress_projects' => __( 'حذف وأرشفة المشاريع', 'workpress' ),
					'manage_project_members'    => __( 'إدارة وتعيين أعضاء المشروع', 'workpress' ),
				),
			),
			'tasks' => array(
				'label' => __( 'صلاحيات المهام والكانبان (Tasks & Workflow)', 'workpress' ),
				'caps'  => array(
					'read_workpress_tasks'        => __( 'استعراض المهام وقراءتها', 'workpress' ),
					'create_workpress_tasks'      => __( 'إنشاء مهام جديدة', 'workpress' ),
					'edit_assigned_tasks'         => __( 'تعديل المهام المسندة للشخص', 'workpress' ),
					'edit_others_workpress_tasks' => __( 'تعديل كافة مهام المشروع', 'workpress' ),
					'change_task_status'          => __( 'تغيير حالات المهام ونقلها في الكانبان', 'workpress' ),
					'assign_tasks'                => __( 'إسناد المهام وتوزيع المسؤوليات', 'workpress' ),
					'delete_workpress_tasks'      => __( 'حذف المهام', 'workpress' ),
				),
			),
			'contributions' => array(
				'label' => __( 'المساهمات والحلول الفنية (Contributions & Evidence)', 'workpress' ),
				'caps'  => array(
					'read_contributions'   => __( 'قراءة مساهمات وأدلة المهام', 'workpress' ),
					'add_contributions'    => __( 'إضافة تعليق أو مساهمة فنية', 'workpress' ),
					'edit_contributions'   => __( 'تعديل مساهماته', 'workpress' ),
					'delete_contributions' => __( 'حذف مساهماته', 'workpress' ),
					'accept_solutions'     => __( 'اعتماد مساهمة كحل نهائي', 'workpress' ),
					'revoke_solutions'     => __( 'إلغاء اعتماد الحل وإعادة الفتح', 'workpress' ),
				),
			),
			'requests' => array(
				'label' => __( 'وارد الطلبات وحوكمة الفرز (Requests & Triage)', 'workpress' ),
				'caps'  => array(
					'submit_work_requests'   => __( 'تقديم طلبات مشاريع جديدة', 'workpress' ),
					'view_incoming_requests' => __( 'استعراض وارد الطلبات', 'workpress' ),
					'triage_requests'        => __( 'فرز ووضع الطلبات قيد الدراسة بتبرير', 'workpress' ),
					'approve_requests'       => __( 'اعتماد الطلب وتأسيس المشروع رسمياً', 'workpress' ),
					'reject_requests'        => __( 'رفض الطلب مع تبرير رسمي للمستفيد', 'workpress' ),
				),
			),
			'knowledge_reports' => array(
				'label' => __( 'المعرفة والتقارير التنفيذية (Knowledge & Reports)', 'workpress' ),
				'caps'  => array(
					'read_knowledge_base'        => __( 'الاطلاع على قاعدة المعرفة المستخلصة', 'workpress' ),
					'generate_executive_reports' => __( 'استخراج التقارير التنفيذية الرسمية (A4)', 'workpress' ),
					'export_knowledge_book'      => __( 'تصدير كتيب المعرفة المجمع (Markdown)', 'workpress' ),
				),
			),
			'system_tools' => array(
				'label' => __( 'أدوات وإعدادات النظام (System Administration)', 'workpress' ),
				'caps'  => array(
					'manage_workpress_settings' => __( 'إدارة إعدادات وتخصيصات المنظومة والمصفوفة', 'workpress' ),
					'manage_intake_forms'       => __( 'تصميم وبناء قوالب نماذج الاستقبال', 'workpress' ),
					'manage_webhooks'           => __( 'إدارة خطافات الويب والتكامل الخارجي', 'workpress' ),
				),
			),
			'portal_features' => array(
				'label' => __( 'خدمات البوابة ومساحة المستفيد (Portal Stakeholder Suite)', 'workpress' ),
				'caps'  => array(
					'view_own_deliverables'        => __( 'استعراض وتنزيل المخرجات والحلول المعتمدة', 'workpress' ),
					'submit_client_feedback'       => __( 'إرسال الملاحظات والاستفسارات على المخرجات', 'workpress' ),
					'signoff_project_deliverables' => __( 'التوقيع الرقمي واستخراج محضر الاستلام', 'workpress' ),
				),
			),
		);

		return apply_filters( 'workpress_registered_capabilities', $groups );
	}

	/**
	 * Get a flat list of all capability keys.
	 *
	 * @return array Array of capability keys.
	 */
	public static function get_all_capability_keys() {
		$keys = array();
		foreach ( self::get_registered_capabilities() as $group ) {
			foreach ( $group['caps'] as $key => $label ) {
				$keys[] = $key;
			}
		}
		return $keys;
	}
}
