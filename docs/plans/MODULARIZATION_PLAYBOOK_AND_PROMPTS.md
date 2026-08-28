# دليل التشغيل والبرومبتات لتقسيم ملفات منظومة وركبرس (WorkPress Modularization Playbook & Prompts)
## Operational Prompts & Modularization Execution Guide

> **المرجع المعماري**: دستور ومنهج وركبرس (`workpress-constitution.md`) ومهارات الحارس والمقسّم (`workpress-guardian` & `workpress-divider`).  
> **الهدف**: توفير قائمة شاملة لكافة الملفات المستهدفة بالتقسيم، مرفق مع كل ملف **البرومبت التشغيلي المباشر** لتنفيذ تفكيكه واختباره وتثبيته بأمان تام.

---

## 🧭 كيفية استخدام هذا الدليل:
1. اختر الملف الذي ترغب في تقسيمه من القائمة أدناه.
2. انسخ **البرومبت التشغيلي** المخصص له وأرسله للمساعد.
3. يقوم المساعد فوراً بتفعيل عميل التقسيم `workpress-divider` وحارس النظام `workpress-guardian`، وتنفيذ دورة التقسيم المكونة من 7 خطوات، واختبار الملفات وتثبيتها في Git.

---

# 📦 أولاً: ملفات الواجهة الأمامية (Frontend Components & Pages)

---

### 1. صفحة الإعدادات الشاملة (`SettingsPage.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/pages/SettingsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/SettingsPage.js)
- **الحجم الجديد**: 17.5 KB | 375 سطر (بدلاً من 78.8 KB و 1,762 سطر)
- **المكونات المستخرجة في `assets/src/components/settings/`**:
  - ✅ `RoleDropdown.js` (القائمة المنسدلة للأدوار)
  - ✅ `RolesPermissionsTab.js` (مصفوفة الصلاحيات والأدوار المخصصة)
  - ✅ `UserDirectoryTab.js` (دليل الكوادر ودليل المستفيدين والمشتركين)
  - ✅ `ContributionTypesTab.js` (إدارة أنواع المساهمات)
  - ✅ `GeneralLocalizationTab.js` (إعدادات النظام والوقت والشهور المغاربية)
  - ✅ `SoundEffectsTab.js` (محرك ومصفوفة المؤثرات التفاعلية SND)
  - ✅ `NotificationsTab.js` (إعدادات الإشعارات والتنبيهات)
  - ✅ `ExportDiagnosticsTab.js` (تصدير JSON ومحرك توليد وتطهير البيانات التجريبية)
- **الـ CSS المفرغ**: تم إنشاء [`assets/src/css/modules/settings.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/settings.css) واستيراده في `admin.css`.
- **الحالة**: **100% PASS** (تم الفحص والاختبار والتثبيت بالالتزام `33db798`).

---

### 2. محرك ومخطط جانت التفاعلي (`GanttChart.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/components/GanttChart.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/GanttChart.js)
- **الحجم الجديد**: 14.2 KB | 365 سطر (بدلاً من 47.2 KB و 1,236 سطر)
- **المكونات المستخرجة في `assets/src/components/gantt/`**:
  - ✅ `GanttScaleBar.js` (شريط الفلاتر، التبديل الزمني، وأزرار المقاييس الأربعة)
  - ✅ `GanttTableSidebar.js` (الجدول الجانبي الأيمن، طي وتوسيع المشاريع، والكوادر)
  - ✅ `GanttGridCanvas.js` (ترويسة التواريخ والشهور، شبكة الخلفية، وخط اليوم والآن)
  - ✅ `GanttTaskRow.js` (شريط المهمة الملون، نسبة الإنجاز الداخلية، وزر إعادة الجدولة)
  - ✅ `GanttTooltip.js` (تلميح التمرير الذكي الفاخر بدون أي تداخل بصري)
- **الـ CSS المفرغ**: تم توسيع [`assets/src/css/modules/gantt.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/gantt.css) بكلاسات BEM معيارية.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_gantt_chart.php` و `test_e2e_lifecycle.php` والتثبيت بالالتزام `b2fd0de`).

---

### 3. استوديو فرز وإدارة الطلبات (`RequestsPage.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/pages/RequestsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/RequestsPage.js)
- **الحجم الجديد**: 11.8 KB | 264 سطر (بدلاً من 53.0 KB و 1,122 سطر)
- **المكونات المستخرجة في `assets/src/components/requests/`**:
  - ✅ `RequestFilterBar.js` (شريط الفلاتر، القوالب، الترتيب، وتبديل طرق العرض الثلاث)
  - ✅ `RequestCardsView.js` (عرض البطاقات والمواصفات المستلمة وأزرار الإجراءات)
  - ✅ `RequestTriageBoard.js` (لوحة كانبان الفرز بالأعمدة الأربعة: وارد، دراسة، معتمد، مرفوض)
  - ✅ `RequestTableView.js` (جدول الفرز السريع مع الإجراءات الفورية)
  - ✅ `RequestConversionModal.js` (نافذة اعتماد وتدشين المشروع وتعيين القائد والميزانية)
  - ✅ `RequestEvaluationModal.js` (نوافذ التقييم الفني وقيد الدراسة والرفض مع إشعار العميل)
- **الـ CSS المفرغ**: تم إنشاء [`assets/src/css/modules/requests.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/requests.css) واستيراده في `admin.css`.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_e2e_lifecycle.php` والتثبيت بالالتزام `4abec2a`).

---

### 4. لوحة القيادة التنفيذية (`DashboardPage.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/pages/DashboardPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/DashboardPage.js)
- **الحجم الجديد**: 11.4 KB | 260 سطر (بدلاً من 39.8 KB و 810 سطر)
- **المكونات المستخرجة في `assets/src/components/dashboard/`**:
  - ✅ `DashboardPerspectiveToolbar.js` (شريط تبديل المناظير الثلاثة ومؤشرات الإنجاز العامة)
  - ✅ `AdminPerspectiveView.js` (منظور الإدارة العليا: بطاقات KPI، صندوق التدخلات العاجلة، ورادار المشاريع)
  - ✅ `LeadPerspectiveView.js` (منظور قيادة المشاريع: فحص واعتماد الحلول وتوزيع المهام ومشاريعي)
  - ✅ `MemberPerspectiveView.js` (منظور الكادر المنفذ: المهام المسندة، قيد الإنجاز، ومستكشف المعرفة)
  - ✅ `DashboardModals.js` (حزمة نوافذ العمليات الشاملة للمشاريع والمهام والتقارير)
- **الـ CSS المفرغ**: تم إنشاء [`assets/src/css/modules/dashboard.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/dashboard.css) واستيراده في `admin.css`.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_e2e_lifecycle.php` والتثبيت بالالتزام `0747668`).

---

### 5. استوديو وباني نماذج الاستقبال (`IntakeFormsPage.js` + `IntakeFormsBuilderTab.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسارات**: [`assets/src/pages/IntakeFormsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/IntakeFormsPage.js) & [`IntakeFormsBuilderTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/IntakeFormsBuilderTab.js)
- **الحجم الجديد**: 19.8 KB | 528 سطر إجمالي (بدلاً من 53.2 KB و 1,289 سطر)
- **المكونات المستخرجة في `assets/src/components/forms/`**:
  - ✅ `FormFieldPrimitives.js` (سجل الخانات واللبنات العامة وقالب النموذج الافتراضي الموحد)
  - ✅ `FormFieldEditor.js` (محرر بطاقة الخانة التفاعلية، إعادة الترتيب، الحذف، والخيارات)
  - ✅ `FormPillsSelector.js` (مدير وسوم الخيارات والوسوم متعددة الاختيار)
  - ✅ `FormCanvasBuilder.js` (لوحة البناء ذات العمودين: لوحة اللبنات وكانفاس التعديل المباشر)
  - ✅ `FormSchemaPreview.js` (نافذة المعاينة الفورية لواجهة العميل في البوابة)
  - ✅ `IntakeFormsToolbar.js` (شريط الأدوات العلوي لتبديل القوالب والمعاينة والحفظ)
- **الـ CSS المفرغ**: تم توسيع [`assets/src/css/modules/forms.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/forms.css) بكلاسات BEM معيارية.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_e2e_lifecycle.php` والتثبيت بالالتزام `d834a39`).

---

### 6. صفحة تفاصيل المهمة ومسار الانتقالات (`TaskDetailPage.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/pages/TaskDetailPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/TaskDetailPage.js)
- **الحجم الجديد**: 9.7 KB | 239 سطر (بدلاً من 33.1 KB و 707 سطر)
- **المكونات المستخرجة في `assets/src/components/task-detail/`**:
  - ✅ `TaskHeaderActions.js` (ترويسة المهمة وأزرار الانتقال والرمز وتعديل المهمة)
  - ✅ `TaskContributionsStream.js` (خط زمن المساهمات والحلول، المرفقات، طلبات الحذف، ونموذج الإرسال)
  - ✅ `TaskMetaSidebar.js` (الشريط الجانبي لميتاداتا المهمة، الحالة المشتقة، الأولوية، وإدارة المكلفين)
- **الـ CSS المفرغ**: تم إنشاء [`assets/src/css/modules/task-detail.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/task-detail.css) واستيراده في `admin.css`.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_task_checklists.php` و `test_time_tracking.php` و `test_e2e_lifecycle.php` والتثبيت بالالتزام `f9c9141`).

---

### 7. إعدادات خطافات الويب والتكاملات (`WebhooksSettingsTab.js`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`assets/src/components/WebhooksSettingsTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/WebhooksSettingsTab.js)
- **الحجم الجديد**: 6.4 KB | 189 سطر (بدلاً من 31.7 KB و 712 سطر)
- **المكونات المستخرجة في `assets/src/components/webhooks/`**:
  - ✅ `WebhooksHeroBanner.js` (لافتة الهيرو التوضيحية وشبكة إحصائيات الخطافات والحماية)
  - ✅ `WebhookEndpointsList.js` (جدول الخطافات، شارات المنصات، مفاتيح التفعيل، وحالة الصفر)
  - ✅ `WebhookDeliveryLogs.js` (دليل التجربة والاختبار المحلي ومستقبل المحاكاة المدمج)
  - ✅ `WebhookModal.js` (نافذة إنشاء وتعديل الخطاف واختبار الاتصال اللحظي)
- **الـ CSS المفرغ**: تم إنشاء [`assets/src/css/modules/webhooks.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/webhooks.css) واستيراده في `admin.css`.
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_e2e_lifecycle.php` والتثبيت بالالتزام `d35ab6d`).

---

# ⚙️ ثانياً: ملفات الطبقة الخلفية (PHP Backend Layer)

---

### 8. متحكم REST للبوابة المستقلة (`class-workpress-rest-portal-controller.php`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`includes/api/class-workpress-rest-portal-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-portal-controller.php)
- **الحجم الجديد**: 10.5 KB | 345 سطر (بدلاً من 43.5 KB و 1,432 سطر)
- **المعالجات المستخرجة في `includes/api/portal/`**:
  - ✅ `class-workpress-portal-auth-handler.php` (المصادقة، فحص الصلاحيات، وتجديد النونس)
  - ✅ `class-workpress-portal-requests-handler.php` (نماذج الاستقبال، رفع المرفقات، وتقديم الطلبات)
  - ✅ `class-workpress-portal-projects-handler.php` (المشاريع، المراحل، المخرجات المعتمدة، والتسليم النهائي)
  - ✅ `class-workpress-portal-pulse-handler.php` (الملاحظات، رادار القيادة، النبض، وقنوات الإشعارات والملف الشخصي)
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_auth_service.php` و `test_e2e_lifecycle.php` والتثبيت بالالتزام `3fa513f`).

---

### 9. خدمة بوابة المستفيدين (`class-workpress-portal-service.php`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`includes/services/class-workpress-portal-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php)
- **الحجم الجديد**: 30.2 KB | 685 سطر (بدلاً من 48.7 KB و 1,322 سطر)
- **الخدمة المستخرجة**:
  - ✅ [`class-workpress-portal-signoff-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-signoff-service.php) (تجريد وتنقية المخرجات المعتمدة، فحص العروض، مناقشات المراجعة، والتوقيع الرقمي مع بصمة SHA-256)
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_auth_service.php` و `test_e2e_lifecycle.php` والتثبيت بالالتزام `f2ad179`).

---

### 10. محرك إدارة المهام وآلة الحالات (`class-workpress-task-service.php`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`includes/services/class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php)
- **الحجم الجديد**: 27.6 KB | 850 سطر (بدلاً من 35.5 KB و 1,161 سطر)
- **الفئة المستخرجة**:
  - ✅ [`class-workpress-task-state-machine.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-state-machine.php) (آلة الحالات، مطابقة الحالات القياسية، الاشتقاق الحتمي للحالة، الانتقالات المشروطة، وسلة المهملات وسجلات التدقيق)
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_task_checklists.php`, `test_time_tracking.php`, `test_e2e_lifecycle.php` والتثبيت بالالتزام `97d3d7b`).

---

### 11. خدمة المساهمات والحلول وشجرة المعرفة (`class-workpress-contribution-service.php`) ✅ [مُنجز ومثبت في المستودع]
- **المسار**: [`includes/services/class-workpress-contribution-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php)
- **الحجم الجديد**: 29.8 KB | 880 سطر (بدلاً من 34.9 KB و 1,042 سطر)
- **الفئة المستخرجة**:
  - ✅ [`class-workpress-solution-transform-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-solution-transform-service.php) (اعتماد الحلول الرسمية، الاشتقاق التلقائي لاكتمال المهام، إلغاء الاعتماد، وتحويل المخرجات لشجرة المعرفة)
- **الحالة**: **100% PASS** (تم الفحص واختبار `test_task_checklists.php`, `test_time_tracking.php`, `test_auth_service.php`, `test_e2e_lifecycle.php` والتثبيت بالالتزام `5a4d9c4`).

---

# 🏁 خاتمة وتتويج المرحلة: اكتمال تفكيك كافة الملفات الـ 11 بنسبة 100%!
تم بنجاح إنجاز كامل خطة التفكيك والتقسيم المعماري للواجهات الأمامية والمتحكمات والخدمات الخلفية دون أي تراجع في الوظائف أو كسر في التوافقية العكسية.


