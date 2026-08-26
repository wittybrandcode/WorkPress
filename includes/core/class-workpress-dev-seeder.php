<?php
/**
 * WorkPress Dev Data Seeder & Environment Manager
 *
 * Provides one-click realistic corporate demo data generation and safe purging.
 * Seeds Projects, Tasks across all 4 Kanban columns, Contributions, Accepted Solutions (Knowledge Base),
 * and Notifications without altering real WordPress content.
 *
 * @package WorkPress
 * @subpackage Core
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class WorkPress_Dev_Seeder {

	/**
	 * Meta key tag used to identify demo seed data.
	 */
	const SEED_TAG = '_workpress_is_demo_seed';

	/**
	 * Seed all corporate demo data.
	 *
	 * @return array Summary of created entities.
	 */
	public static function seed() {
		// Ensure current user or fallback to admin ID
		$admin_id = get_current_user_id();
		if ( ! $admin_id ) {
			$admin = get_users( array( 'role' => 'administrator', 'number' => 1 ) );
			$admin_id = ! empty( $admin ) ? $admin[0]->ID : 1;
		}

		$created_projects      = array();
		$created_tasks         = array();
		$created_contributions = array();
		$accepted_solutions    = array();

		// ---------------------------------------------------------------------
		// 1. Projects Data Definitions
		// ---------------------------------------------------------------------
		$projects_data = array(
			array(
				'name'        => 'تطوير البوابة الرقمية المؤسسية v2.0',
				'prefix'      => 'PORTAL',
				'description' => 'مشروع إعادة بناء وتطوير البوابة المؤسسية الذكية بالاعتماد على نظام التصميم الحاد (Sharp Design System) مع واجهة مستخدم فائقة السرعة.',
				'status'      => WorkPress_Keys::PROJECT_STATUS_ACTIVE,
				'lead_id'     => $admin_id,
				'start_at'    => gmdate( 'Y-m-d H:i:s', strtotime( '-30 days' ) ),
				'due_at'      => gmdate( 'Y-m-d H:i:s', strtotime( '+30 days' ) ),
			),
			array(
				'name'        => 'تدقيق الامتثال الأمني وحماية البيانات GDPR',
				'prefix'      => 'SEC',
				'description' => 'مشروع المراجعة الأمنية الشاملة لكافة قواعد البيانات وتطبيق معايير التشفير المتقدم وحظر الحذف التخريبي للبيانات الحساسة.',
				'status'      => WorkPress_Keys::PROJECT_STATUS_ACTIVE,
				'lead_id'     => $admin_id,
				'start_at'    => gmdate( 'Y-m-d H:i:s', strtotime( '-15 days' ) ),
				'due_at'      => gmdate( 'Y-m-d H:i:s', strtotime( '+45 days' ) ),
			),
			array(
				'name'        => 'ترقية البنية السحابية وهندسة الحاويات Kubernetes',
				'prefix'      => 'CLOUD',
				'description' => 'مشروع ترحيل الخدمات والأنظمة إلى بنية تحتية سحابية مرنة تدعم التوسع التلقائي وخطة استعادة الكوارث اللحظية.',
				'status'      => WorkPress_Keys::PROJECT_STATUS_COMPLETED,
				'lead_id'     => $admin_id,
				'start_at'    => gmdate( 'Y-m-d H:i:s', strtotime( '-60 days' ) ),
				'due_at'      => gmdate( 'Y-m-d H:i:s', strtotime( '-5 days' ) ),
			),
			array(
				'name'        => 'تدشين محرك المعرفة ومساعد الذكاء الاصطناعي',
				'prefix'      => 'AI',
				'description' => 'تطوير محرك الفهرسة الدلالية والبحث الذكي في مكتبة المعرفة المعتمدة لتقديم حلول مقترحة لحظية لأعضاء الفريق.',
				'status'      => WorkPress_Keys::PROJECT_STATUS_ACTIVE,
				'lead_id'     => $admin_id,
				'start_at'    => gmdate( 'Y-m-d H:i:s', strtotime( '-10 days' ) ),
				'due_at'      => gmdate( 'Y-m-d H:i:s', strtotime( '+60 days' ) ),
			),
		);

		// Ensure Client User exists for Portal Demo
		$client_user = get_user_by( 'login', 'client_demo' );
		if ( ! $client_user ) {
			$client_id = wp_insert_user( array(
				'user_login'   => 'client_demo',
				'user_pass'    => 'client123456',
				'user_email'   => 'client@workpress.test',
				'display_name' => 'أ. سامي المنصوري (شركة الأفق)',
				'role'         => 'workpress_client',
			) );
		} else {
			$client_id = $client_user->ID;
		}

		foreach ( $projects_data as $p_data ) {
			// Check if project with same name already seeded
			$term = get_term_by( 'name', $p_data['name'], WorkPress_Keys::TAX_PROJECT );
			if ( $term ) {
				$term_id = $term->term_id;
			} else {
				$res = wp_insert_term( $p_data['name'], WorkPress_Keys::TAX_PROJECT, array( 'description' => $p_data['description'] ) );
				if ( is_wp_error( $res ) ) {
					continue;
				}
				$term_id = $res['term_id'];
			}

			// Add Project Metadata
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_PREFIX, $p_data['prefix'] );
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_STATUS, $p_data['status'] );
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_LEAD_ID, $p_data['lead_id'] );
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_START_AT, $p_data['start_at'] );
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_DUE_AT, $p_data['due_at'] );
			update_term_meta( $term_id, self::SEED_TAG, 1 );

			// Seed members
			$members = array(
				array( 'id' => $admin_id, 'role' => 'manager', 'added_at' => current_time( 'mysql' ) )
			);
			if ( in_array( $p_data['prefix'], array( 'PORTAL', 'SEC' ), true ) && ! empty( $client_id ) && ! is_wp_error( $client_id ) ) {
				$members[] = array( 'id' => $client_id, 'role' => 'client', 'added_at' => current_time( 'mysql' ) );
				update_term_meta( $term_id, '_workpress_member_' . $client_id, 'client' );
			}
			update_term_meta( $term_id, WorkPress_Keys::META_PROJECT_MEMBERS, $members );

			$created_projects[ $p_data['prefix'] ] = $term_id;
		}

		// ---------------------------------------------------------------------
		// 2. Tasks Data Definitions (16 Tasks across 4 Kanban Columns)
		// ---------------------------------------------------------------------
		$tasks_data = array(
			// PORTAL Tasks
			array(
				'project'  => 'PORTAL',
				'title'    => 'بناء نظام التصميم الحاد (Sharp Design) وتوحيد المودالات',
				'content'  => '<p>تطبيق معايير الزوايا الحادة 0px radius وتوحيد أزرار التذييل وجميع النوافذ المنبثقة الـ 10 وفق لوحة الألوان الزمردية.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
				'has_sol'  => true,
				'solution' => 'تم استبدال كافة الأزرار القديمة وتوحيد Modal.js مع دعم مفتاح Escape وزوايا حادة 100% واجتياز كافة فحوصات الكود بنجاح.',
			),
			array(
				'project'  => 'PORTAL',
				'title'    => 'تطوير شريط الفلاتر الموحد والبحث الفوري',
				'content'  => '<p>بناء مكون FilterBar الموحد وتثبيته في أعلى الشاشة لمنع الإزاحة التخطيطية ودعم الفلترة السريعة في أقل من 5ms.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_IN_PROGRESS,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'PORTAL',
				'title'    => 'تطبيق المصادقة الثنائية 2FA للمدراء وقادة المشاريع',
				'content'  => '<p>ربط بروتوكول TOTP لإرسال رموز التحقق عبر تطبيق المصادقة وتأمين تسجيل الدخول للوحة التحكم.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_ASSIGNED,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'PORTAL',
				'title'    => 'إجراء اختبارات التوافقية والأداء على الشاشات الصغيرة',
				'content'  => '<p>فحص استجابة واجهات الكانبان وشاشات التفاصيل على أجهزة الهواتف الذكية والأجهزة اللوحية.</p>',
				'priority' => WorkPress_Keys::PRIORITY_LOW,
				'status'   => WorkPress_Keys::TASK_STATUS_OPEN,
				'assignees'=> array(),
			),

			// SEC Tasks
			array(
				'project'  => 'SEC',
				'title'    => 'تشفير السجلات الحساسة ومنع الحذف التخريبي للبيانات',
				'content'  => '<p>اعتراض خطافات الحذف الأصلية pre_delete_post وتحويلها إلى نظام طلبات حذف آمنة تتطلب موافقة المدير.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
				'has_sol'  => true,
				'solution' => 'تم بناء خدمة WorkPress_Security_Service بنجاح وفرض مراجعة طلبات الحذف ومنع الحذف المباشر لغير المدراء.',
			),
			array(
				'project'  => 'SEC',
				'title'    => 'إعداد مصفوفة الصلاحيات المخصصة للأدوار الوظيفية',
				'content'  => '<p>تحديث مصفوفة الصلاحيات (Capabilities Matrix) ودعم استنساخ الأدوار وإدارتها بسهولة من الإعدادات.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_IN_PROGRESS,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'SEC',
				'title'    => 'تصدير تقرير التدقيق الفني الأمني السنوي',
				'content'  => '<p>تجميع سجل الأنشطة والأذونات في ملف تقرير رسمي لتقديمه للجنة التدقيق والرقابة.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_ASSIGNED,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'SEC',
				'title'    => 'تحديث خطة الاستجابة للحوادث السيبرانية والطوارئ',
				'content'  => '<p>صياغة إجراءات العمل القياسية (SOP) للتعامل مع أي محاولات اختراق أو انقطاع في الخدمة.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_OPEN,
				'assignees'=> array(),
			),

			// CLOUD Tasks
			array(
				'project'  => 'CLOUD',
				'title'    => 'نقل قواعد البيانات والخدمات إلى بيئة Kubernetes السحابية',
				'content'  => '<p>إعداد ملفات التكوين والـ Pods ونقل قواعد البيانات والملفات الثابتة إلى السحابة.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
				'has_sol'  => true,
				'solution' => 'اكتملت عملية النقل بنجاح مع تسجيل زمن توقف أقل من 60 ثانية واستقرار كامل للخدمة بنسبة 99.99%.',
			),
			array(
				'project'  => 'CLOUD',
				'title'    => 'تفعيل نظام التوسع التلقائي للأحمال الحية (Auto-Scaling)',
				'content'  => '<p>ضبط إعدادات HPA لزيادة موارد الحاويات تلقائياً عند تجاوز استخدام المعالج نسبة 70%.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
				'has_sol'  => true,
				'solution' => 'تم تفعيل التوسع التلقائي واختبار تحمل المنظومة لأكثر من 50,000 مستخدم متزامن دون أي هبوط في الأداء.',
			),
			array(
				'project'  => 'CLOUD',
				'title'    => 'بناء لوحة المراقبة اللحظية Prometheus & Grafana',
				'content'  => '<p>ربط مقاييس النظام وإرسال تنبيهات فورية لقناة العمليات عند حدوث أي خلل فني.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'CLOUD',
				'title'    => 'أتمتة النسخ الاحتياطي الجغرافي اليومي',
				'content'  => '<p>إعداد سكريبتات النسخ الاحتياطي المشفر وتخزينه في مراكز بيانات متعددة جغرافياً.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_COMPLETED,
				'assignees'=> array( $admin_id ),
			),

			// AI Tasks
			array(
				'project'  => 'AI',
				'title'    => 'بناء محرك الفهرسة الدلالية واسترجاع المعرفة المعتمدة',
				'content'  => '<p>فهرسة كافة الحلول التقنية المعتمدة وبناء فضاء المتجهات لتمكين البحث الدلالي الذكي.</p>',
				'priority' => WorkPress_Keys::PRIORITY_HIGH,
				'status'   => WorkPress_Keys::TASK_STATUS_IN_PROGRESS,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'AI',
				'title'    => 'تطوير مساعد توليد تقارير المهام والمساهمات الفنية',
				'content'  => '<p>تطوير نموذج ذكي يقترح مسودات مساهمات وحلول فنية بناءً على عنوان وتفاصيل المهمة.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_ASSIGNED,
				'assignees'=> array( $admin_id ),
			),
			array(
				'project'  => 'AI',
				'title'    => 'تدقيق ومطابقة دقة الإجابات المسترجعة من مكتبة المعرفة',
				'content'  => '<p>إجراء اختبارات قياسية (Benchmarking) للتأكد من ملاءمة ودقة الإجابات المقترحة بنسبة > 95%.</p>',
				'priority' => WorkPress_Keys::PRIORITY_MEDIUM,
				'status'   => WorkPress_Keys::TASK_STATUS_OPEN,
				'assignees'=> array(),
			),
			array(
				'project'  => 'AI',
				'title'    => 'إعداد الدليل الإرشادي والتوعوي لاستخدام أدوات الذكاء الاصطناعي',
				'content'  => '<p>صياغة دليل إرشادي لفريق العمل يوضح أفضل الممارسات لتحقيق أقصى استفادة من المساعد الذكي.</p>',
				'priority' => WorkPress_Keys::PRIORITY_LOW,
				'status'   => WorkPress_Keys::TASK_STATUS_OPEN,
				'assignees'=> array(),
			),
		);

		$task_counter = 100;

		foreach ( $tasks_data as $t_data ) {
			$project_id = isset( $created_projects[ $t_data['project'] ] ) ? $created_projects[ $t_data['project'] ] : 0;
			if ( ! $project_id ) continue;

			$task_counter++;
			$ref_key = $t_data['project'] . '-' . $task_counter;

			// Insert Task Post
			$post_id = wp_insert_post( array(
				'post_title'   => $t_data['title'],
				'post_content' => $t_data['content'],
				'post_type'    => WorkPress_Keys::CPT_WORK_ITEM,
				'post_status'  => 'publish',
				'post_author'  => $admin_id,
			) );

			if ( is_wp_error( $post_id ) ) continue;

			// Set Taxonomy Term
			wp_set_object_terms( $post_id, array( $project_id ), WorkPress_Keys::TAX_PROJECT );

			// Set Task Meta
			update_post_meta( $post_id, WorkPress_Keys::META_TASK_REF_KEY, $ref_key );
			update_post_meta( $post_id, WorkPress_Keys::META_TASK_STATUS, $t_data['status'] );
			update_post_meta( $post_id, WorkPress_Keys::META_TASK_PRIORITY, $t_data['priority'] );
			update_post_meta( $post_id, WorkPress_Keys::META_TASK_ASSIGNEE_IDS, $t_data['assignees'] );
			update_post_meta( $post_id, self::SEED_TAG, 1 );

			$created_tasks[] = $post_id;

			// -----------------------------------------------------------------
			// 3. Seed Contributions & Solutions
			// -----------------------------------------------------------------
			// Add regular discussion contribution
			$comment_id = wp_insert_comment( array(
				'comment_post_ID'      => $post_id,
				'comment_author'       => 'فريق التطوير والعمليات',
				'comment_author_email' => 'dev@workpress.local',
				'comment_content'      => 'بدأ العمل على مراجعة المتطلبات الفنية وتنسيق الإجراءات اللازمة مع فريق المنظومة.',
				'comment_type'         => WorkPress_Keys::COMMENT_CONTRIBUTION,
				'user_id'              => $admin_id,
				'comment_approved'     => 1,
			) );

			if ( $comment_id ) {
				update_comment_meta( $comment_id, WorkPress_Keys::META_CONTRIBUTION_TYPE, WorkPress_Keys::CONTRIB_TYPE_IMPLEMENTATION );
				update_comment_meta( $comment_id, self::SEED_TAG, 1 );
				$created_contributions[] = $comment_id;
			}

			// If this task has an accepted solution, create and accept it!
			if ( ! empty( $t_data['has_sol'] ) && ! empty( $t_data['solution'] ) ) {
				$sol_comment_id = wp_insert_comment( array(
					'comment_post_ID'      => $post_id,
					'comment_author'       => 'قائد الفريق التقني',
					'comment_author_email' => 'lead@workpress.local',
					'comment_content'      => $t_data['solution'],
					'comment_type'         => WorkPress_Keys::COMMENT_CONTRIBUTION,
					'user_id'              => $admin_id,
					'comment_approved'     => 1,
				) );

				if ( $sol_comment_id ) {
					update_comment_meta( $sol_comment_id, WorkPress_Keys::META_CONTRIBUTION_TYPE, WorkPress_Keys::CONTRIB_TYPE_SOLUTION );
					update_comment_meta( $sol_comment_id, WorkPress_Keys::META_IS_ACCEPTED, true );
					update_comment_meta( $sol_comment_id, WorkPress_Keys::META_ACCEPTED_AT, current_time( 'mysql' ) );
					update_comment_meta( $sol_comment_id, WorkPress_Keys::META_ACCEPTED_BY, $admin_id );
					update_comment_meta( $sol_comment_id, self::SEED_TAG, 1 );

					// Link to task
					update_post_meta( $post_id, WorkPress_Keys::META_ACCEPTED_SOLUTION_ID, $sol_comment_id );
					update_post_meta( $post_id, WorkPress_Keys::META_TASK_STATUS, WorkPress_Keys::TASK_STATUS_CLOSED );

					$accepted_solutions[] = $sol_comment_id;
					$created_contributions[] = $sol_comment_id;
				}
			}
		}

		// ---------------------------------------------------------------------
		// 4. Recalculate Project Progress Rates
		// ---------------------------------------------------------------------
		foreach ( $created_projects as $prefix => $proj_id ) {
			if ( class_exists( 'WorkPress_Project_Service' ) ) {
				WorkPress_Project_Service::check_and_update_project_completion( $proj_id );
			}
		}

		// ---------------------------------------------------------------------
		// 5. Seed Sample Notifications
		// ---------------------------------------------------------------------
		if ( class_exists( 'WorkPress_Notification_DB' ) ) {
			$sample_notifs = array(
				array( 'type' => 'solution_accepted', 'task' => ! empty( $created_tasks[0] ) ? $created_tasks[0] : 0, 'proj' => ! empty( $created_projects['PORTAL'] ) ? $created_projects['PORTAL'] : 0 ),
				array( 'type' => 'task_assigned', 'task' => ! empty( $created_tasks[1] ) ? $created_tasks[1] : 0, 'proj' => ! empty( $created_projects['PORTAL'] ) ? $created_projects['PORTAL'] : 0 ),
				array( 'type' => 'contribution_added', 'task' => ! empty( $created_tasks[2] ) ? $created_tasks[2] : 0, 'proj' => ! empty( $created_projects['SEC'] ) ? $created_projects['SEC'] : 0 ),
				array( 'type' => 'project_updated', 'task' => 0, 'proj' => ! empty( $created_projects['CLOUD'] ) ? $created_projects['CLOUD'] : 0 ),
			);

			foreach ( $sample_notifs as $sn ) {
				WorkPress_Notification_DB::insert( $admin_id, $sn['task'], $sn['type'], $admin_id, $sn['proj'] );
			}
		}

		return array(
			'success'            => true,
			'message'            => 'تم توليد بيانات بيئة العمل التجريبية بنجاح!',
			'projects_count'     => count( $created_projects ),
			'tasks_count'        => count( $created_tasks ),
			'contributions_count'=> count( $created_contributions ),
			'knowledge_count'    => count( $accepted_solutions ),
		);
	}

	/**
	 * Purge all demo seed data safely.
	 *
	 * @return array Summary of purged entities.
	 */
	public static function purge() {
		global $wpdb;

		// 1. Purge Seeded Tasks (and their postmeta)
		$seeded_task_ids = $wpdb->get_col( $wpdb->prepare(
			"SELECT DISTINCT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
			self::SEED_TAG,
			'1'
		) );

		$purged_tasks_count = 0;
		if ( ! empty( $seeded_task_ids ) ) {
			$purged_tasks_count = count( $seeded_task_ids );
			foreach ( $seeded_task_ids as $tid ) {
				wp_delete_post( (int) $tid, true );
			}
		}

		// 2. Purge Seeded Contributions (Comments)
		$seeded_comment_ids = $wpdb->get_col( $wpdb->prepare(
			"SELECT DISTINCT comment_id FROM {$wpdb->commentmeta} WHERE meta_key = %s AND meta_value = %s",
			self::SEED_TAG,
			'1'
		) );

		$purged_contribs_count = 0;
		if ( ! empty( $seeded_comment_ids ) ) {
			$purged_contribs_count = count( $seeded_comment_ids );
			foreach ( $seeded_comment_ids as $cid ) {
				wp_delete_comment( (int) $cid, true );
			}
		}

		// 3. Purge Seeded Projects (Terms)
		$seeded_term_ids = $wpdb->get_col( $wpdb->prepare(
			"SELECT DISTINCT term_id FROM {$wpdb->termmeta} WHERE meta_key = %s AND meta_value = %s",
			self::SEED_TAG,
			'1'
		) );

		$purged_projects_count = 0;
		if ( ! empty( $seeded_term_ids ) ) {
			$purged_projects_count = count( $seeded_term_ids );
			foreach ( $seeded_term_ids as $term_id ) {
				wp_delete_term( (int) $term_id, WorkPress_Keys::TAX_PROJECT );
			}
		}

		// 4. Purge Notifications Table
		$table_name = WorkPress_Keys::get_table_name( WorkPress_Keys::TABLE_NOTIFICATIONS );
		$wpdb->query( "TRUNCATE TABLE `$table_name`" );

		// 5. Clean Caches
		wp_cache_flush();

		return array(
			'success'          => true,
			'message'          => 'تم تطهير وحذف كافة البيانات التجريبية بنجاح!',
			'purged_projects'  => $purged_projects_count,
			'purged_tasks'     => $purged_tasks_count,
			'purged_contribs'  => $purged_contribs_count,
		);
	}
}
