# سجل التغييرات والإصدارات الرسمية (WorkPress Changelog)

> **WorkPress — Organizational Memory & Work Management Engine for WordPress**  
> *جميع التحديثات موثقة وفق المعيار الدستوري للمنظومة.*

---

## [2.2.1] — 2026-08-27 (Deep Architectural & Logic Hardening)

### 🛡️ التحصين الأمني والمعماري (Security & Architecture Hardening):
- **معالجة خطاف الحذف الأمني (`WorkPress_Security_Service`)**: تصحيح إرسال `$term_id` وتأمين إشعارات الحذف النهائي للمشاريع.
- **مطابقة الصلاحيات الرسمية 100% (`WorkPress_Keys`)**: توحيد ثوابت `CAP_ACCESS_PORTAL` و `CAP_EDIT_ASSIGNED_TASKS` و `CAP_EDIT_OTHERS_TASKS` مع سجل الصلاحيات.
- **توحيد توقيع خطاف الطلبات (`WorkPress_Hooks`)**: مزامنة معاملات `fire_project_request_submitted` مع مستمعات التنبيهات والـ Webhooks.
- **تصحيح استخراج بيانات التقارير التنفيذية (`WorkPress_Report_Service`)**: سحب أسماء المكلفين من `$task['assignees']` وقراءة `due_at` بدقة.
- **دعم رتبة المدير الفني (`WorkPress_Project_Service`)**: إدراج `ROLE_MANAGER` (`manager`) ضمن فحص قيادة المشروع `is_user_lead`.
- **توحيد مفتاح نوع المساهمة (`WorkPress_Keys`)**: مطابقة `META_CONTRIBUTION_TYPE` مع المعيار `_workpress_contribution_type`.
- **مبدأ DRY في استوديو الإعدادات (`WorkPress_REST_Settings_Controller`)**: تفويض مخطط النماذج إلى `ProjectService` المركزية وتضمين `sound_transition`.
- **أمان سلة المهملات وإلغاء التفعيل**: إضافة فحوصات Null Safety في `Trash_Controller` وتهيئة آمنة لكائن `$wp_roles`.
- **تنقية استعلامات بنك المعرفة (`WorkPress_Knowledge_Service`)**: حظر تسريب المساهمات قيد طلب الحذف أو غير المعتمدة.
- **تأمين وعود الواجهة الأمامية**: تغليف طلبات النسخ للذاكرة والـ API بكتل `.catch()` واستعادة حالات التحميل بأمان.

---

## [2.2.0] — 2026-08-26 (Stable Release — Production Ready)

### 🌟 الإضافات والميزات الجديدة (Added):
- **مخطط جانت فائق الكثافة (Master Gantt Suite)**:
  - إضافة أزرار التحكم الفوري في شجرة المشاريع `[ طي الكل ]` و `[ توسيع الكل ]`.
  - إضافة **مؤشر الوقت الحي (Live Current Time Needle)** في مقياس 24 ساعة لليوم الحالي.
  - دعم 4 مقاييس زمنية احترافية (24س، أيام كاملة بأسماء عربية، أسابيع، شهور).
  - بطاقات معاينة عائمة ذكية للبارات الزمنية بنظام `0px sharp geometry` تمنع التداخل مع شريط الأدوات.
- **تتبع الوقت والتقديرات (Task Time Tracker)**:
  - إضافة أشرطة الإضافة السريعة لساعات العمل `[ +15د ]` `[ +30د ]` `[ +1س ]` `[ +2س ]` `[ +4س ]` بنمط `.wp-dense-chip`.
- **تفاصيل المهمة (Task Detail Workspace)**:
  - إضافة **الترويسة الإجرائية المثبتة (`Sticky Action Bar`)** لتسهيل حفظ وتعديل المهام الطويلة الممتلئة بالمرفقات والمساهمات.
- **لوحة المؤشرات والقيادة (CoWorkPress Plaza)**:
  - جعل كافة بطاقات الإحصائيات (المشاريع، نسبة الإنجاز، المعرفة، طلبات الحذف) تفاعلية وقابلة للنقر مع توجيه فوري للمسار المناسب.
  - ترقية أزرار التبويبات العلوية في `App.js` بإضافة وسام المسار النشط الداكن عالي التباين (`.wp-header-btn.is-active`).

### 🛡️ الحوكمة والأمان والخدمات (Security & Governance):
- **دستور وركبرس الدائم (`workpress-constitution.md`)**: حارس المنهج المفروض على كافة الواجهات والخدمات.
- **ذاكرة الخبير المطور (`SKILL.md`)**: موسوعة معمارية من 10 فصول تغطي كافة الخدمات ونقاط الـ REST وحوكمة المواطنة.
- **تصويب مسارات التنبيهات في البوابة المستقلة**: دعم مساري `POST /portal/notifications/:id/read` و `POST /portal/notifications/read-all` لمنع أخطاء 404.
- **ترقية صلاحيات الوصول للمشاريع**: توسيع دالة `can_user_access_project` لتشمل الكوادر الفنية، المطابقة بالبريد الإلكتروني، والمكلفين بالمهام.

### 🎨 نظام التصميم والواجهات (Design System & Polish):
- الالتزام التام بنظام الزوايا الحادة `0px`، أيقونات `dashicons-*` الرسمية، والأرقام الغربية `1,2,3...`.
- ترقية مكوّن `PriorityBadge.js` إلى النمط فائق الكثافة `.wp-dense-chip`.
- إصلاح وتوحيد كافة أنماط `portal-app.js` لتتوافق 100% مع React 18 / Preact DOM.

---

## [2.1.0] — 2026-08-25 (Governance & Two-Way Synapses)
- تطبيق **هرم المواطنة الرباعي (4-Tier Citizenship Hierarchy)**:
  1. المدير العام (`administrator`)
  2. الكوادر الفنية والمنفذون (`editor/author/contributor`)
  3. المستفيدون وأصحاب الطلبات (`workpress_client`)
  4. المشتركون العاديون (`subscriber`)
- إنشاء **بوابة المستفيدين المستقلة (Standalone Client Portal)** عبر `template_include` ومسار `/portal/` مع صفر تداخل CSS.
- تطبيق **منظومة ثلاجة المشاريع (`WorkPress_Hibernation_Service`)** للتجميد والإذابة الآلية لمشاريع العملاء.
- إضافة محرك التفاعلات الثنائية الموثقة للأدلة (`client_feedback`, `client_revision_request`, `client_signoff`).

---

## [2.0.0] — 2026-08-23 (Enterprise Core Architecture)
- إعادة بناء المحرك بالكامل فوق WordPress Data Model الأصلي:
  - Project = `workpress_project` Taxonomy
  - Task = `work_item` Custom Post Type
  - Contribution = `wp_contribution` Custom Comment Type
  - Knowledge = Accepted Solutions Read Model
- تأسيس طبقة الـ 17 خدمة المعتمدة (`Services-Only Architecture`).
- دعم خطافات الويب المشفرة بـ HMAC-SHA256 (`WorkPress_Webhook_Service`) مع 6 أحداث تأسيسية وقوالب Discord و Slack و Teams.
- بناء لوحة الكانبان فائقة الكثافة مع بطاقات المهام المدمجة (220px غلاف + سطر المشروع + شريط الأيقونات السفلي).
