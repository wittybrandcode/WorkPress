# ⚙️ مرجع خدمات النواة الخلفية (WorkPress Core Services Architecture)
## The 18 PHP Backend Services, Static Methods & Domain Logic Contracts

> **نوع الوثيقة:** المرجع المعماري والبرمجي الشامل لطبقة الخدمات المركزية (Services Layer)  
> **الإصدار المعتمد:** WorkPress v1.0.0-Stable  
> **الفلسفة الحاكمة:** مبدأ طبقة الخدمات الحصرية (Services-Only Layer Architecture) — لا تتواصل واجهات الـ REST أو الأحداث مع قاعدة البيانات مباشرة، بل تمر كافة العمليات حصراً عبر هذه الخدمات المركزية.  
> **المرجع الحاكم:** [ARCHITECTURE.md](../core/ARCHITECTURE.md) | [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md)

---

## 🏛️ 1. الخريطة المعمارية للخدمات المركزية

```
┌────────────────────────────────────────────────────────────────────────┐
│                     WorkPress REST API Controllers                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Core Services Layer (PHP)                       │
├───────────────────┬────────────────────┬───────────────────────────────┤
│ Domain Operations │ Knowledge & Portal │ Security & System Config      │
├───────────────────┼────────────────────┼───────────────────────────────┤
│ • Project Service │ • Knowledge Service│ • Security Service            │
│ • Task Service    │ • Portal Service   │ • Membership Service          │
│ • Assign Service  │ • Report Service   │ • Hibernation Service         │
│ • Contrib Service │ • Webhook Service  │ • Roles & Capabilities Service│
│ • Time Service    │ • Activity Service │ • Intake & Settings Service   │
│ • Broadcast Serv. │                    │                               │
└───────────────────┴────────────────────┴───────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Native WordPress Core Storage Engine                   │
│         (wp_terms, wp_termmeta, wp_posts, wp_postmeta, wp_comments)    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 2. تفصيل خدمات النواة الـ 17 ومسؤولياتها ودوالها العامة

### 1. `WorkPress_Project_Service` (`class-workpress-project-service.php`)
* **المسؤولية:** إدارة دورة حياة المشاريع، حساب نسب الإنجاز التلقائية، توليد الرموز المرجعية (`prefix`)، وفحص قيادة المشروع.
* **أبرز الدوال العامة (Public Static Methods):**
  * `create_project( $name, $args = array() )`: إنشاء مشروع كـ Taxonomy Term مع ضبط الميتاداتا.
  * `get_project( $project_id )`: جلب بيانات المشروع المنسقة مع مؤشرات المهام والتقدم.
  * `update_progress( $project_id )`: إعادة احتساب نسبة إنجاز المشروع بناءً على مهامه المكتملة.
  * `is_user_lead( $project_id, $user_id )`: التحقق مما إذا كان المستخدم قائد المشروع أو مديره الفني.

---

### 2. `WorkPress_Task_Service` (`class-workpress-task-service.php`)
* **المسؤولية:** إدارة المهام، التحقق من صحة الانتقال بين الحالات، قوائم الفحص (Checklists)، وتوليد المعرفات المرجعية `PRJ-XXXX`.
* **أبرز الدوال العامة:**
  * `create_task( $title, $project_id, $args = array() )`: إنشاء مهمة جديدة في الكانبان.
  * `update_task_status( $task_id, $new_status, $user_id )`: تغيير حالة المهمة وإطلاق الخطافات وسجل التدقيق.
  * `derive_and_sync_task_state( $task_id )`: مزامنة حالة المهمة آلياً عند اعتماد أو سحب الحلول.
  * `format_task( $post )`: تنسيق كائن المنشور وتحويله إلى حمولة JSON غنية ومتكاملة.

---

### 3. `WorkPress_Assignment_Service` (`class-workpress-assignment-service.php`)
* **المسؤولية:** إدارة تكليف الكوادر الفنية بالمهام، مع تطبيق حظر صريح لتكليف العملاء والمشاهدين (Principle #1: Role Clarity).
* **أبرز الدوال العامة:**
  * `is_user_assignable( $user_id, $project_id = 0 )`: فحص استحقاق وقدرة المستخدم على استلام المهام.
  * `assign_task( $task_id, $user_ids, $assigner_id )`: تعيين المستخدمين للمهمة وتسجيل سجل نظام وإطلاق التنبيهات.
  * `get_assignees( $task_id )`: جلب مصفوفة المكلفين بالمهمة منسقة مع الصور والأسماء.

---

### 4. `WorkPress_Contribution_Service` (`class-workpress-contribution-service.php`)
* **المسؤولية:** تسجيل المساهمات، الأدلة، الحلول، طلبات المراجعة، ونطاق الرؤية (`_workpress_visibility_scope`).
* **أبرز الدوال العامة:**
  * `add_contribution( $task_id, $content, $user_id, $args = array() )`: تسجيل مساهمة كتعليق مخصص `wp_contribution`.
  * `accept_solution( $contribution_id, $user_id )`: اعتماد المساهمة كحل ناجز وتفعيل الإنجاز المتسلسل.
  * `revoke_solution( $contribution_id, $user_id )`: سحب الاعتماد وإعادة فتح المهمة للنقاش.

---

### 5. `WorkPress_Portal_Service` (`class-workpress-portal-service.php`)
* **المسؤولية:** إدارة بوابة العميل المستقلة، فلترة المشاريع المسموحة، المخرجات المعتمدة، والتوقيع الرقمي النهائي.
* **أبرز الدوال العامة:**
  * `get_client_projects( $user_id )`: استرجاع المشاريع النشطة المرتبطة بحساب العميل.
  * `get_client_requests( $user_id )`: استرجاع طلبات المشاريع المعلقة ومتابعة مراحل الفرز.
  * `get_project_deliverables( $project_id, $user_id )`: جلب الحلول المعتمدة المتاحة لرؤية العميل.
  * `client_project_signoff( $project_id, $user_id, $feedback )`: توثيق استلام العميل للمشروع وبصمة SHA-256.

---

### 6. `WorkPress_Knowledge_Service` (`class-workpress-knowledge-service.php`)
* **المسؤولية:** بناء بنك المعرفة المؤسسي التراكمي المستخلص من الحلول المعتمدة، وتوليد كتيبات المعرفة بصيغة Markdown.
* **أبرز الدوال العامة:**
  * `get_project_knowledge( $project_id )`: جلب كافة الحلول الهندسية المعتمدة للمشروع.
  * `generate_markdown_book( $project_id )`: تجميع وتنسيق وثيقة Markdown مهيكلة تضم كافة الحلول المعتمدة.

---

### 7. `WorkPress_Webhook_Service` (`class-workpress-webhook-service.php`)
* **المسؤولية:** إدارة خطافات الويب الصادرة، التوقيع المشفر بـ `HMAC-SHA256`، وقوالب Discord و Slack و Teams.
* **أبرز الدوال العامة:**
  * `dispatch( $event_key, $payload )`: إرسال الحدث إلى كافة نقاط النهاية النشطة المسجلة في النظام.
  * `dispatch_client_personal_webhook( $client_id, $event, $data )`: إرسال تنبيه مباشر لرابط الويب هوك الخاص بالعميل.
  * `test_ping( $webhook_id )`: إرسال نبضة اختبار تجريبية للتحقق من سلامة الاتصال.

---

### 8. `WorkPress_Security_Service` (`class-workpress-security-service.php`)
* **المسؤولية:** منع الحذف القسري غير المصرح به للكيانات، حماية سلة المهملات، وإرسال تنبيهات الحذف النهائي.

---

### 9. `WorkPress_Membership_Service` (`class-workpress-membership-service.php`)
* **المسؤولية:** إدارة العضويات داخل المشاريع، فحص رتب الأعضاء (`lead`, `manager`, `specialist`, `viewer`).

---

### 10. `WorkPress_Hibernation_Service` (`class-workpress-hibernation-service.php`)
* **المسؤولية:** تجميد مشاريع العملاء تلقائياً (`status: frozen`) عند تغيير رتبهم أو إيقاف حساباتهم، وإذابتها عند التفعيل.

---

### 11. `WorkPress_Time_Service` (`class-workpress-time-service.php`)
* **المسؤولية:** إدارة سجلات الوقت الفعلي، تتبع الساعات المقدرة والمستهلكة، وحساب معدل الحرق الزمني.

---

### 12. `WorkPress_Report_Service` (`class-workpress-report-service.php`)
* **المسؤولية:** تجميع التقارير التنفيذية ومؤشرات الأداء KPI ووثائق الاستلام والاعتماد الرسمية.

---

### 13. `WorkPress_Intake_Service` (`class-workpress-intake-service.php`)
* **المسؤولية:** معالجة وتحقق مخطط نماذج استقبال الطلبات الديناميكية واستوديو الفرز الإداري.

---

### 14. `WorkPress_Activity_Service` (`class-workpress-activity-service.php`)
* **المسؤولية:** تسجيل الخط الزمني غير القابل للمحو لكافة الأنشطة والتحولات في النظام (Audit Trail).

---

### 15. `WorkPress_Capabilities_Registry` (`class-workpress-capabilities-registry.php`)
* **المسؤولية:** تسجيل وإدارة الصلاحيات الذرية الـ 34 وفرض قواعد التحقق الصارم في ووردبريس.

---

### 16. `WorkPress_Roles_Service` (`class-workpress-roles-service.php`)
* **المسؤولية:** استنساخ وتخصيص الأدوار وإنشاء رتب مخصصة مع ضبط مصفوفة الصلاحيات.

---

### 17. `WorkPress_Settings_Service` (`class-workpress-settings-service.php`)
* **المسؤولية:** إدارة إعدادات المنظومة المركزية، حزم المؤثرات الصوتية، والتوطين الزمني.

---

### 18. `WorkPress_Broadcast_Service` (`class-workpress-broadcast-service.php`)
* **المسؤولية:** محرك بث التوجيهات الإدارية والتنبيهات التشغيلية الحية ومزامنة شريط التنبيهات والأفق الرقمي.
* **أبرز الدوال العامة:**
  * `get_stream()`: توليد وتجميع الدفق الحي للتنبيهات التشغيلية والتوجيهات الإدارية النشطة.
  * `get_rules()` / `update_rules($rules)`: جلب وتحديث قواعد تنبيهات المواعيد المتأخرة والاحتفاءات.
  * `get_directives($args)` / `create_directive($data)`: جلب وإنشاء التوجيهات الإدارية والنشريات.
  * `invalidate_stream_cache()`: تطهير الكاش اللحظي للدفق لضمان المزامنة الفورية في الواجهة.

---
*كافة الخدمات مبنية بنمط Static Singleton Services لتوفير أقصى سرعة وأداء تحت ضغط العمليات.*

