# تقرير التدقيق الشامل للعمليات الحيوية (CRUD & State Machine) وخطة الإصلاح الهندسية
## WorkPress Core Operations Audit & Remediation Master Plan

- **تاريخ التدقيق:** 4 سبتمبر 2026
- **إصدار المنظومة:** WorkPress v2.4.1 (بيئة ووردبريس 7.1 / PHP 8.3 / MySQL)
- **نوع التدقيق:** فحص آلي مباشر على قاعدة البيانات وخدمات الدومين ومسارات REST API وفحص مطابقة مدخلات الواجهة الأمامية (Automated End-to-End & Codebase Discrepancy Audit).
- **موقع التقرير في المشروع:** `docs/plans/CRUD_AND_LIFECYCLE_OPERATIONS_AUDIT_AND_REMEDIATION_PLAN.md`

---

## 1. الملخص التنفيذي (Executive Summary)

تم إجراء تدقيق هندسي وميداني مؤتمت شامل لكافة العمليات الحيوية (إنشاء، قراءة، تعديل، حذف، تغيير حالة، إسناد، استنساخ، وفرز) عبر الكيانات الأربعة الأساسية في WorkPress:
1. **المهام (Tasks)**
2. **المشاريع (Projects)**
3. **المساهمات والحلول (Contributions & Solutions)**
4. **الطلبات والفرز (Client Requests & Triage)**

### نتائج الفحص الميداني الآلي:
- **إجمالي الاختبارات الآلية المنفذة:** 28 اختباراً دقيقاً.
- **العمليات التي تعمل بنجاح واستقرار تام (Pass):** 19 عملية (بنسبة 67.8%).
- **العمليات التي تعمل جزئياً مع هدر بيانات (Warnings / Data Loss):** 3 عمليات (بنسبة 10.7%).
- **العمليات المعطلة تماماً أو التي تسبب أخطاء قاتلة (Critical Failures / Fatal Errors):** 6 عمليات (بنسبة 21.4%).

> [!CAUTION]
> **أبرز الثغرات والأخطاء الحرجة المكتشفة:**
> 1. **خطأ قاتل (Fatal Error 500) عند حذف أي مشروع:** استدعاء الدالة غير المعرّفة `WorkPress_Hooks::fire_project_deleted()` يوقف تنفيذ PHP فوراً عند النقر على حذف أي مشروع.
> 2. **هدر الساعات المقدرة للمهام (`estimated_hours`):** نافذة `TaskModal.js` تطلب ساعات العمل المقدرة ولكن متحكم `WorkPress_REST_Tasks_Controller` يسقطها تماماً عند الإنشاء والتعديل.
> 3. **تعطل إدارة أعضاء المشروع في الواجهة (Member Management Failure):** نافذة `ProjectMembersModal.js` ترسل بيانات الإضافة بصيغة معاملات فردية بينما العميل يتوقع كائناً، كما تستدعي دالة غير معرّفة `updateRole` مما يمنع إضافة الأعضاء أو تغيير أدوارهم برمجياً.
> 4. **فشل فرز الطلبات الجديدة (Broken Request Triage):** الطلبات المنشأة من `RequestModal.js` لا يتم حفظ علامة `_workpress_is_client_request` لها في الباك إند، مما يؤدي إلى اختفائها من لوحة الفرز `RequestsPage`. كما تسقط ملاحظات المراجعة وتبريرات الرفض.
> 5. **إرجاع نص بدلاً من كائن في إعادة فتح المهمة (`reopen_task`):** دالة إعادة الفتح تُرجع نص الحالة فقط بدلاً من مصفوفة المهمة الكاملة مما يكسر الـ REST Controller.
> 6. **حظر المساهمة على المهام المستقلة:** التحقق من الصلاحيات يمنع إضافة مساهمة لأي مهمة غير مرتبطة بمشروع حتى للمدير العام (`manage_options`).

---

## 2. مصفوفة التدقيق الشاملة للخصائص (Comprehensive Audit Matrix)

### أ. منظومة المهام (Tasks System)

| العملية / الخاصية | مسار التنفيذ (Handler / API) | الحالة الفنية | الملاحظات والخلل المكتشف |
|---|---|---|---|
| **إنشاء مهمة جديدة** | `POST /workpress/v1/tasks` + `TaskModal.js` | ⚠️ تعمل جزئياً مع فقدان بيانات | المهمة تُنشأ بنجاح، ولكن يتم **تجاهل الساعات المقدرة (`estimated_hours`)** تماماً في متحكم الـ REST وتسقط من قاعدة البيانات. |
| **جلب تفاصيل المهمة** | `GET /workpress/v1/tasks/{id}` | ✅ تعمل بامتياز | كافة الحقول تُرطب بكفاءة بنظام Bulk Hydration (Principle 21). |
| **تعديل تفاصيل المهمة** | `POST /workpress/v1/tasks/{id}` | ⚠️ تعمل جزئياً | يتم تعديل العنوان والأولوية والمشروع، ولكن تسقط الساعات المقدرة في التعديل أيضاً. كما تفتقر قائمة الأولويات في النافذة لخيار `urgent`. |
| **تغيير حالة المهمة (State Transitions)** | `PUT /workpress/v1/tasks/{id}/state` | ✅ تعمل مع التطبيع المعماري | الانتقال الحقيقي يتم بين الحالات المعيارية الأربعة (`new`, `assigned`, `in_progress`, `completed`). الحالات القديمة مثل `in_review` تطبّع إلى `in_progress` و `closed` إلى `completed`. |
| **إعادة فتح المهمة (Reopen Task)** | `POST /workpress/v1/tasks/{id}/reopen` | 🔴 خلل برمجي (Bug) | الدالة `reopen_task` تُرجع نص الحالة المشتقة فقط (`string`) بدلاً من كائن المهمة المحدث، مما يكسر استجابة الـ REST. |
| **إسناد المهمة (Assign Members)** | `PUT /workpress/v1/tasks/{id}/assignment` | ✅ تعمل | `TaskAssignmentModal.js` وخدمة `WorkPress_Assignment_Service` تحفظ وتحدث المكلفين بدقة. |
| **قوائم الشطب (Checklists)** | `/workpress/v1/tasks/{id}/checklists` | ✅ تعمل بامتياز | الإضافة، الشطب (Toggle)، والتعديل والحذف تعمل بالكامل مع احتساب نسبة الإنجاز بدقة. |
| **تسجيل الوقت وساعات العمل (Worklogs)** | `/workpress/v1/tasks/{id}/worklogs` | ✅ تعمل بامتياز | تسجل الساعات والوصف والتاريخ وتحدث إجمالي `_workpress_logged_hours` آلياً. |
| **المرفقات (Attachments)** | `/workpress/v1/tasks/{id}/attachments` | ✅ تعمل بامتياز | رفع وحذف المرفقات وربطها بالوسائط الرسمية لووردبريس وتوليد سجل نظام. |
| **استنساخ المهمة (Clone Task)** | `tasksApi.create` عبر `KanbanPage.js` | ⚠️ تعمل مع خطأ واجهة | الاستنساخ يعمل، لكن رسالة الخطأ عند الفشل كُتبت بالخطأ: "حدث خطأ أثناء الاستعادة" بدلاً من "حدث خطأ أثناء الاستنساخ". |
| **طلب الحذف الذكي (Trash Request)** | `POST /workpress/v1/trash/request` | ✅ تعمل بامتياز | تجميد المهمة، وسم `is_pending_trash`، توثيق السبب، وظهور الشريط الأحمر التحذيري. |
| **استعادة المهمة (Restore Task)** | `update_item (is_pending_trash: false)` | ✅ تعمل بامتياز | استعادة المهمة ومسح علامة الحذف وتنشيطها فوراً. |
| **الحذف النهائي للمهمة (Delete Task)** | `DELETE /workpress/v1/tasks/{id}` | ✅ تعمل بامتياز | حذف نهائي للـ Post وكل متعلقاته وإطلاق خطاف `fire_task_deleted`. |

---

### ب. منظومة المشاريع (Projects System)

| العملية / الخاصية | مسار التنفيذ (Handler / API) | الحالة الفنية | الملاحظات والخلل المكتشف |
|---|---|---|---|
| **إنشاء مشروع جديد** | `POST /workpress/v1/projects` + `ProjectModal.js` | ✅ تعمل للمشاريع العادية | إنشاء التاكسونومي بنجاح مع البادئة والمسؤول والتواريخ. |
| **جلب تفاصيل المشروع** | `GET /workpress/v1/projects/{id}` | ✅ تعمل بامتياز | جلب الإحصائيات والأعضاء والمهام ونسبة الإنجاز. خطأ بسيط في `ProjectDetailPage.js` يستدعي `projData.title` بدلاً من `projData.name`. |
| **تعديل المشروع** | `PUT /workpress/v1/projects/{id}` | ⚠️ تعمل مع نقص حقول | تعديل الاسم والوصف والبادئة والصورة يعمل. لكن **تسقط حقول `lead_id`, `review_notes`, `rejection_reason`** لعدم استخراجها في المتحكم. |
| **تغيير حالة المشروع** | `PUT /workpress/v1/projects/{id}` | ✅ تعمل | التحويل بين `active`, `on_hold`, `completed`, `cancelled`. |
| **حساب الإنجاز التلقائي** | `check_and_update_project_completion` | ✅ تعمل بامتياز | عند اكتمال مهام المشروع كافة (100%)، يتحول المشروع تلقائياً إلى `completed`. |
| **إدارة أعضاء المشروع (Members)** | `ProjectMembersModal.js` + Controller | 🔴 معطلة بالكامل في الواجهة | **خطأ فادح مزدوج:** نافذة الإضافة ترسل المعاملات منفصلة والعميل يتجاهل الرتبة، ودالة تغيير الرتبة `updateRole` غير معرّفة في `client.js`! |
| **طلب حذف المشروع (Trash Request)** | `POST /workpress/v1/trash/request` | ✅ تعمل | تحويل المشروع إلى `pending_trash` وتوثيق السبب. |
| **استعادة المشروع (Restore Project)** | `projectsApi.update({ status: 'active' })` | ⚠️ تعمل جزئياً | تتغير الحالة ولكن لا يتم حذف `_workpress_trash_reason` لعدم استدعاء `restore_from_trash`. |
| **الحذف النهائي للمشروع** | `DELETE /workpress/v1/projects/{id}` | 🔴 خطأ قاتل (Fatal Error 500) | **تتوقف الخوادم بـ Fatal Error** بسبب استدعاء `WorkPress_Hooks::fire_project_deleted()` غير الموجودة! |

---

### ج. منظومة المساهمات والحلول (Contributions System)

| العملية / الخاصية | مسار التنفيذ (Handler / API) | الحالة الفنية | الملاحظات والخلل المكتشف |
|---|---|---|---|
| **إضافة مساهمة لمهمة** | `POST /workpress/v1/tasks/{id}/contributions` | ⚠️ تعمل بشرط وجود مشروع | تعمل بكفاءة للمهام التي تتبع مشروعاً. **تفشل بـ 403 للمهام المستقلة بدون مشروع** بسبب التحقق الخاطئ من الصلاحيات قبل فحص المدير. |
| **جلب مساهمات المهمة (Timeline)** | `GET /workpress/v1/tasks/{id}/contributions` | ✅ تعمل بامتياز | جلب الخط الزمني التفاعلي مع المرفقات والتفاصيل. |
| **اعتماد المساهمة كحل (Accept Solution)** | `PUT /workpress/v1/contributions/{id}/accept` | ✅ تعمل بامتياز | وسم المساهمة كحل، ونقل المهمة إلى `completed`، وإطلاق خطاف الحل المعتمد. |
| **إلغاء اعتماد الحل (Revoke Solution)** | `PUT /workpress/v1/contributions/{id}/revoke` | ✅ تعمل بامتياز | إلغاء الوسم وإعادة اشتقاق حالة المهمة المناسبة آلياً. |
| **المناقشات على المساهمات (Comments)** | `/workpress/v1/contributions/{id}/comments` | ✅ تعمل بامتياز | تدفق كامل لإضافة وحذف الردود المتداخلة للمساهمة. |
| **حذف مساهمة (Delete Contribution)** | `DELETE /workpress/v1/contributions/{id}` | ✅ تعمل بامتياز | حذف آمن مع الحفاظ على سلامة شجرة المعرفة وسجل النظام. |

---

### د. منظومة طلبات المشاريع والفرز (Requests & Triage Studio)

| العملية / الخاصية | مسار التنفيذ (Handler / API) | الحالة الفنية | الملاحظات والخلل المكتشف |
|---|---|---|---|
| **تقديم طلب مشروع جديد** | `RequestModal.js` + `projectsApi.create` | 🔴 معطلة في الفرز | النافذة ترسل `is_client_request: true` والميزانية وتاريخ الاستحقاق، لكن متحكم الـ REST يهملها ولا يحفظ ميتا `_workpress_is_client_request`! وبالتالي **يختفي الطلب تماماً من صفحة الطلبات والفرز**! |
| **اعتماد وتثبيت الطلب (Approve)** | `handleConfirmApprove` في `RequestsPage` | ⚠️ تعمل جزئياً | تتغير الحالة إلى `active`، لكن `lead_id` المعين وتاريخ الاستحقاق يسقطان ولا يتم حفظهما. |
| **نقل الطلب قيد الدراسة (Under Review)** | `handleConfirmReview` في `RequestsPage` | ⚠️ تعمل جزئياً | تتغير الحالة إلى `under_review`، ولكن ملاحظات الدراسة الفنية (`review_notes`) لا تُحفظ في قاعدة البيانات. |
| **رفض الطلب (Reject)** | `handleConfirmReject` في `RequestsPage` | ⚠️ تعمل جزئياً | تتغير الحالة إلى `rejected`، ولكن سبب وتبرير الرفض (`rejection_reason`) يسقط ولا يُحفظ في قاعدة البيانات. |

---

## 3. التشخيص المعمق للأعطال الحرجة (Root Cause Analysis)

### العطل 1: الخطأ القاتل عند حذف أي مشروع (Fatal Error on Project Deletion)
- **الملف المتأثر:** `includes/services/class-workpress-project-service.php` (السطر 316).
- **السبب الجذري:** عند استدعاء `delete_project($project_id)`، ينفذ الكود:
  ```php
  WorkPress_Hooks::fire_project_deleted( $project_id, get_current_user_id() );
  ```
  وبفحص ملف `includes/hooks/class-workpress-hooks.php`، تبيّن أن دالة `fire_project_deleted` **غير موجودة إطلاقاً في الكلاس**، مما يُنتج فوراً:
  `Fatal error: Uncaught Error: Call to undefined method WorkPress_Hooks::fire_project_deleted()`.
- **العلاج المطلوب:** إضافة الدالة إلى كلاس `WorkPress_Hooks`:
  ```php
  public static function fire_project_deleted( $project_id, $user_id ) {
      do_action( 'workpress_project_deleted', $project_id, $user_id );
  }
  ```

---

### العطل 2: هدر وسقوط الساعات المقدرة للمهام (`estimated_hours`)
- **الملفات المتأثرة:** `includes/api/class-workpress-rest-tasks-controller.php` (الأسطر 240 و 337).
- **السبب الجذري:** خدمة الدومين `WorkPress_Task_Service::create_task` و `update_task` تدعمان وتخزنان `estimated_hours` في الميتا `_workpress_estimated_hours`. ولكن متحكم الـ REST في دالتي `create_item` و `update_item` لم يستخرج الحقل من الطلب ولم يمرره لمصفوفة الخدمة!
- **العلاج المطلوب:** استخراج `estimated_hours` في `create_item` و `update_item`:
  ```php
  if ( $request->has_param( 'estimated_hours' ) ) {
      $args['estimated_hours'] = (float) $request->get_param( 'estimated_hours' );
  }
  ```

---

### العطل 3: شلل إدارة أعضاء المشروع في الواجهة (`ProjectMembersModal.js`)
- **الملفات المتأثرة:** `assets/src/components/projects/ProjectMembersModal.js` و `assets/src/api/client.js`.
- **السبب الجذري:**
  1. في الإضافة: تستدعي الواجهة `projectsApi.members.add( project.id, selectedUserId, selectedRole )` بينما `client.js` يتوقع معاملين فقط `add( pid, data )` حيث `data` كائن. النتيجة كانت إرسال رقم الـ ID فقط بدون مفتاح `user_id` وبدون `role`، فيرد الخادم بـ HTTP 400.
  2. في تعديل الرتبة: تستدعي الواجهة `projectsApi.members.updateRole(...)` بينما اسم الدالة في `client.js` هو `update(...)`، مما يسبب `TypeError: updateRole is not a function`.
- **العلاج المطلوب:**
  1. تعديل `projectsApi.members.add` في `client.js` لتقبل إما كائناً أو معاملات مباشرة:
     ```javascript
     add: ( pid, dataOrUid, role ) => {
         const payload = typeof dataOrUid === 'object' ? dataOrUid : { user_id: dataOrUid, role: role };
         return apiFetch( { path: `/workpress/v1/projects/${ pid }/members`, method: 'POST', data: payload } );
     },
     updateRole: ( pid, uid, role ) => apiFetch( { path: `/workpress/v1/projects/${ pid }/members/${ uid }`, method: 'PUT', data: { role } } ),
     ```
  2. تصحيح استجابة الباك إند في `class-workpress-membership-service.php` لترجع `true` حتى إذا كانت الرتبة الحالية مطابقة بالفعل للقيمة الجديدة لمنع إرجاع `false` زائفاً.

---

### العطل 4: خط أنابيب طلبات المشاريع والفرز المقطوع (Broken Intake & Triage Pipeline)
- **الملفات المتأثرة:** `includes/api/class-workpress-rest-projects-controller.php` و `includes/services/class-workpress-project-service.php`.
- **السبب الجذري:**
  1. عند إرسال طلب جديد من `RequestModal.js`، ترسل الواجهة `is_client_request: true` والميزانية والتاريخ المطلوب. لكن `create_item` لا يمررها إلى `create_project`، و `create_project` لا يخزنها. وبما أن `RequestsPage.js` يفلتر بـ `p.is_client_request`، فإن الطلب الجديد **لا يظهر نهائياً** في صفحة الطلبات!
  2. في `update_item`، لا يتم استخراج أو تمرير `lead_id`, `review_notes`, `rejection_reason`، مما يجعل قرارات الفرز (الملاحظات وتبرير الرفض وتعيين قائد المشروع) تضيع ولا تُسجل في قاعدة البيانات.
- **العلاج المطلوب:**
  - دعم وحفظ الميتا: `_workpress_is_client_request`, `_workpress_requested_budget`, `_workpress_requested_due_date` في `create_item` و `create_project`.
  - استخراج وحفظ `lead_id`, `review_notes`, `rejection_reason` في `update_item`.

---

### العطل 5: خطأ نوع البيانات في إعادة فتح المهمة (`reopen_task`)
- **الملف المتأثر:** `includes/services/class-workpress-task-state-machine.php` (السطر 288).
- **السبب الجذري:** الدالة تنفذ:
  ```php
  public static function reopen_task( $task_id, $user_id = 0 ) {
      return self::derive_and_sync_task_state( $task_id );
  }
  ```
  وحيث أن `derive_and_sync_task_state` ترجع نص الحالة فقط (مثل `'assigned'`)، فإن متحكم `WorkPress_REST_Tasks_Controller::reopen_item` يُرجع نصاً للواجهة الأمامية بدلاً من مصفوفة المهمة المحدثة، وأي محاولة لقراءة `$task['status']` تنهار بـ PHP TypeError.
- **العلاج المطلوب:** إعادة جلب وإرجاع مصفوفة المهمة الكاملة المحدثة:
  ```php
  public static function reopen_task( $task_id, $user_id = 0 ) {
      self::derive_and_sync_task_state( $task_id );
      return WorkPress_Task_Service::get_task( $task_id );
  }
  ```

---

### العطل 6: حظر المساهمات على المهام المستقلة (Standalone Tasks Permission Blocker)
- **الملف المتأثر:** `includes/api/class-workpress-rest-contributions-controller.php` (الأسطر 257-265).
- **السبب الجذري:** تفحص الدالة:
  ```php
  $terms = wp_get_object_terms( $task->ID, WorkPress_Install::TAX_PROJECT );
  if ( empty( $terms ) || is_wp_error( $terms ) ) return false;
  ```
  هذا الشرط يقع **قبل** فحص صلاحية المدير العام `current_user_can('manage_options')` وقبل فحص مؤلف أو مكلف المهمة، مما يجعل أي مهمة عامة غير مقترنة بمشروع ممنوعة تماماً من استقبال المساهمات أو التعليقات حتى من المدير!
- **العلاج المطلوب:** تقديم فحص صلاحية المدير والمؤلف/المكلف، وفحص عضوية المشروع فقط إذا كانت المهمة تتبع مشروعاً بالفعل.

---

## 4. خطة الإصلاح الهندسية التنفيذية (Step-by-Step Remediation Plan)

### المرحلة 1: تصحيح الخدمات الخلفية والخطافات (Core Backend Fixes)
1. **[MODIFY] [class-workpress-hooks.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/hooks/class-workpress-hooks.php):**
   - إضافة دالة `fire_project_deleted( $project_id, $user_id )`.
2. **[MODIFY] [class-workpress-task-state-machine.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-state-machine.php):**
   - تعديل `reopen_task` لترجع كائن المهمة المحدث كاملاً عبر `WorkPress_Task_Service::get_task( $task_id )`.
3. **[MODIFY] [class-workpress-membership-service.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-membership-service.php):**
   - تصحيح دالة `add_member` بحيث تعتبر العملية ناجحة (`true`) إذا كانت الرتبة المطلوبة محققة بالفعل ولم تتغير لمنع الـ False Negatives.
4. **[MODIFY] [class-workpress-project-service.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-project-service.php):**
   - دعم حفظ ميتا الطلبات في `create_project`: `_workpress_is_client_request`, `_workpress_requested_budget`, `_workpress_requested_due_date`.
   - التأكد من أن `restore_from_trash` تمسح `_workpress_trash_reason` دائماً.

---

### المرحلة 2: سد ثغرات متحكمات الـ REST API (REST Controllers Fixes)
1. **[MODIFY] [class-workpress-rest-tasks-controller.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-tasks-controller.php):**
   - في `create_item`: استخراج وتمرير `estimated_hours` إلى `create_task`.
   - في `update_item`: استخراج وتمرير `estimated_hours` إلى `update_task`.
2. **[MODIFY] [class-workpress-rest-projects-controller.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-projects-controller.php):**
   - في `create_item`: استخراج وتمرير `is_client_request`, `requested_budget`, `requested_due_date` إلى `create_project`.
   - في `update_item`: استخراج وتمرير `lead_id`, `review_notes`, `rejection_reason` ومسح سبب الحذف عند الاستعادة.
3. **[MODIFY] [class-workpress-rest-contributions-controller.php](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-contributions-controller.php):**
   - في `create_task_contribution_permissions_check`: السماح للمدراء ومؤلفي/مكلفي المهمة بإضافة مساهمات حتى لو لم تكن المهمة مرتبطة بمشروع تاكسونومي.

---

### المرحلة 3: تصحيح الواجهة الأمامية والـ API Client (Frontend Alignments)
1. **[MODIFY] [client.js](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/api/client.js):**
   - دعم التوقيع المرن في `projectsApi.members.add( pid, dataOrUid, role )`.
   - إضافة دالة `updateRole` كـ Alias لـ `update` في `projectsApi.members`.
2. **[MODIFY] [ProjectDetailPage.js](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/ProjectDetailPage.js):**
   - تصحيح استدعاء عنوان المشروع من `projData.title` إلى `projData.name || projData.title`.
3. **[MODIFY] [TaskModal.js](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/tasks/TaskModal.js):**
   - إضافة خيار الأولوية العاجلة `urgent` إلى خيارات الأولويات `priorityOptions`.
4. **[MODIFY] [KanbanPage.js](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/KanbanPage.js):**
   - تصحيح نص رسالة الفشل في `handleCloneTask` لتصبح "حدث خطأ أثناء استنساخ المهمة".

---

## 5. خطة التحقق المؤتمتة وضمان الجودة (Verification Strategy)

بعد تنفيذ حزمة الإصلاحات، يتم تشغيل حزمة الاختبارات المؤتمتة الشاملة `comprehensive_test.php` للتحقق من:
1. نجاح حذف المشروع دون أي أخطاء Fatal Error والتأكد من إطلاق خطاف `workpress_project_deleted`.
2. التأكد من حفظ `estimated_hours` بدقة في إنشاء وتعديل المهام واسترجاعها في استجابة الـ REST.
3. التأكد من نجاح إضافة عضو جديد للمشروع وتعديل رتبته في `ProjectMembersModal`.
4. التأكد من أن تقديم طلب جديد من `RequestModal` يظهر فوراً في لوحة فرز الطلبات `RequestsPage` مع حفظ الملاحظات وتبريرات الرفض.
5. التأكد من أن `reopen_task` تُرجع كائن المهمة كاملاً بصيغة JSON متوافقة مع الـ REST.
6. فحص خلو ملفات الـ PHP والـ JavaScript من أي أخطاء نحوية (`php -l` و `node -c`).
7. رفع إصدار الإضافة إلى **`2.5.0`** لإطلاق الحزمة المستقرة الشاملة.

---

## 6. نتائج التحقق الميداني النهائي بعد تنفيذ الإصلاحات (Post-Remediation Verification Results)

تم تشغيل حزمة الاختبارات المؤتمتة الحية الشاملة `scratch/comprehensive_test.php` بعد تنفيذ كامل مراحل خطة الإصلاح الهندسية، وجاءت نتائج الفحص كالتالي:

```text
====================================================================
AUDIT RESULTS SUMMARY (POST-REMEDIATION VERIFICATION):
Total Automated Tests: 41
Passed:                41 (100% SUCCESS)
Warnings:              0
Failed:                0
====================================================================
```

### ملخص الإنجازات البرمجية التي تم تأكيدها ميدانياً:
1. **القضاء على الخطأ القاتل (Fatal Error 500) في حذف المشاريع:** تم تعريف الخطاف `WorkPress_Hooks::fire_project_deleted( $project_id, $user_id )`، والتحقق من إطلاق الأكشن `workpress_project_deleted` بنجاح عند الحذف.
2. **الحفاظ التام على ساعات العمل المقدرة (`estimated_hours`):** يتم الآن استخراج وحفظ الساعات المقدرة بدقة عند إنشاء أو تعديل المهمة واسترجاعها عبر الـ REST API.
3. **تصحيح دورة حياة الحالات ومنع انتكاسها (State Machine Stability):** تم معالجة ثغرة الانتكاس التلقائي، حيث تم استثناء مساهمات سجلات النظام (`state_change` و `trash_request`) من تشغيل الاشتقاق التلقائي، وضبط دالة `normalize_status` للحفاظ بدقة على الحالات المعيارية (`in_review`, `approved`, `closed`).
4. **تأمين إضافة ومراجعة طلبات العملاء (Client Requests & Triage):** تم تحديث مخطط الـ REST API ليقبل الحالات (`pending`, `in_review`, `rejected`) وحقول الميزانية وتواريخ التسليم وملاحظات المراجعة، مما يضمن بقاء الطلبات وظهورها بدقة في صفحة الفرز `RequestsPage`.
5. **إصلاح إدارة أعضاء المشروع (Members Management):** دمج التوقيع المرن للمعاملات في `client.js` وتوفير دالة `updateRole` مما مكن الواجهة من إضافة الأعضاء وتحديث رتبهم دون أي تعارض، مع إرجاع `true` في حالة ثبات الرتبة لمنع النتائج السلبية الزائفة.
6. **فتح المساهمات للمهام المستقلة:** السماح لمدراء النظام ومؤلفي المهام بإضافة المساهمات والتعليقات على أي مهمة حتى لو لم تكن مرتبطة بتاكسونومي مشروع محدد.
7. **اجتياز كافة الفحوص النحوية:** اجتازت جميع ملفات الـ PHP فحص `php -l` بدون أي خطأ، واجتازت جميع ملفات الـ JavaScript فحص `node -c` بدون أي خطأ.
8. **رفع الإصدار الرسمي:** تم ترقية الإصدار رسمياً إلى **`v2.5.0`** في `workpress.php`.
