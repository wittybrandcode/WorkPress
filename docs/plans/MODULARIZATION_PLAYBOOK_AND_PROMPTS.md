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

### 2. محرك ومخطط جانت التفاعلي (`GanttChart.js`) 🔴 [P1]
- **المسار**: [`assets/src/components/GanttChart.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/GanttChart.js)
- **الحجم والأسطر**: 47.2 KB | 1,236 سطر
- **الهدف**: عزل خوارزميات الحساب الزمني، متجهات SVG، والتحكم بالمقاييس في `assets/src/components/gantt/`.
- **المخرجات المستهدفة**:
  - `GanttScaleBar.js` (شريط التبديل بين الأيام، الأسابيع، الأشهر، الأرباع)
  - `GanttGridCanvas.js` (شبكة التواريخ والخلفية)
  - `GanttDependencyLinks.js` (حساب ورسم خطوط ربط الاعتمادات)
  - `GanttTaskRow.js` (شريط المهمة وسحب وتعديل المواعيد)
  - `GanttChart.js` (مكون المنسق الرئيسي)

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك محرك مخطط جانت assets/src/components/GanttChart.js:
> 1. إنشاء مجلد assets/src/components/gantt/ واستخراج (GanttScaleBar.js, GanttGridCanvas.js, GanttDependencyLinks.js, GanttTaskRow.js).
> 2. تجريد أي أنماط مضمنة ونقلها إلى admin.css مع الحفاظ على الحواف الحادة 0px.
> 3. إبقاء GanttChart.js كمنسق رشيق يربط الحسابات بالعرض.
> 4. التحقق عبر node --check واختبار test_gantt_chart.php و test_e2e_lifecycle.php بنسبة 100% PASS ثم التثبيت في Git.
> ```

---

### 3. استوديو فرز وإدارة الطلبات (`RequestsPage.js`) 🔴 [P1]
- **المسار**: [`assets/src/pages/RequestsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/RequestsPage.js)
- **الحجم والأسطر**: 53.0 KB | 1,122 سطر
- **الهدف**: عزل لوحة الفرز ونوافذ التقييم والتحويل والرفض في `assets/src/components/requests/`.
- **المخرجات المستهدفة**:
  - `RequestTriageBoard.js` (لوحة كانبان لفرز الطلبات)
  - `RequestEvaluationModal.js` (نافذة الفحص والتقدير الفني والمالي)
  - `RequestConversionModal.js` (نافذة تحويل الطلب إلى مشروع رسمي وتعيين القائد)
  - `RequestFilterBar.js` (شريط فلترة وبحث الطلبات)
  - `RequestsPage.js` (متحكم الصفحة الرشيق)

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك استوديو فرز الطلبات assets/src/pages/RequestsPage.js:
> 1. إنشاء مجلد assets/src/components/requests/ واستخراج (RequestTriageBoard.js, RequestEvaluationModal.js, RequestConversionModal.js, RequestFilterBar.js).
> 2. تجريد الـ Inline CSS وضبط كلاسات BEM في admin.css.
> 3. تحويل RequestsPage.js لمتحكم حالة نقي يدير طلبات الـ REST والتنقل.
> 4. التحقق بـ node --check واختبار test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 4. لوحة القيادة التنفيذية (`DashboardPage.js`) 🟡 [P2]
- **المسار**: [`assets/src/pages/DashboardPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/DashboardPage.js)
- **الحجم والأسطر**: 39.8 KB | 810 سطر
- **الهدف**: استخراج بطاقات مؤشرات السرعة، مخطط عبء العمل، وتيار الأنشطة في `assets/src/components/dashboard/`.
- **المخرجات المستهدفة**:
  - `VelocityKpiGrid.js` (شبكة بطاقات المؤشرات الرقمية الحية)
  - `TeamWorkloadCard.js` (مخطط توزيع عبء العمل على الكوادر)
  - `RecentActivityFeed.js` (تيار الأنشطة والقرارات المعرفية)
  - `DashboardPage.js` (منسق الصفحة الرئيسي)

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك لوحة القيادة assets/src/pages/DashboardPage.js:
> 1. استخراج المكونات في assets/src/components/dashboard/ (VelocityKpiGrid.js, TeamWorkloadCard.js, RecentActivityFeed.js).
> 2. عزل الـ Styles إلى admin.css والتأكد من الحواف الحادة 0px.
> 3. إعادة صياغة DashboardPage.js كمنسق رشيق.
> 4. التحقق بـ node --check واختبار test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 5. استوديو وباني نماذج الاستقبال (`IntakeFormsPage.js` + `IntakeFormsBuilderTab.js`) 🟡 [P2]
- **المسار**: [`assets/src/pages/IntakeFormsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/IntakeFormsPage.js) & [`IntakeFormsBuilderTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/IntakeFormsBuilderTab.js)
- **الحجم والأسطر**: 53.2 KB | 1,289 سطر
- **الهدف**: عزل محرر الحقول، المعاينة الحية، ومحرر الخيارات في `assets/src/components/forms/`.
- **المخرجات المستهدفة**:
  - `FormFieldEditor.js` (محرر خصائص ونوع الحقل)
  - `FormSchemaPreview.js` (العرض والمعاينة التفاعلية الحية للنموذج)
  - `FormPillsSelector.js` (إدارة خيارات الخانات متعددة الاختيار)
  - `IntakeFormsPage.js` (المتحكم الرئيسي)

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك استوديو نماذج الاستقبال:
> 1. تقسيم assets/src/components/IntakeFormsBuilderTab.js إلى (FormFieldEditor.js, FormSchemaPreview.js, FormPillsSelector.js) في assets/src/components/forms/.
> 2. تنظيف الـ Inline CSS وربط الكلاسات في admin.css.
> 3. التحقق بـ node --check واختبار test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 6. صفحة تفاصيل المهمة ومسار الانتقالات (`TaskDetailPage.js`) 🟡 [P2]
- **المسار**: [`assets/src/pages/TaskDetailPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/TaskDetailPage.js)
- **الحجم والأسطر**: 33.1 KB | 707 سطر
- **الهدف**: عزل ترويسة المهمة والأزرار، الشريط الجانبي للميتاداتا، وتيار المساهمات.
- **المخرجات المستهدفة**:
  - `TaskHeaderActions.js` (ترويسة المهمة وأزرار الانتقال والاعتماد)
  - `TaskMetaSidebar.js` (الشريط الجانبي للمكلفين والمشروع والمواعيد)
  - `TaskContributionsStream.js` (خط زمن المساهمات والحلول)
  - `TaskDetailPage.js` (متحكم الصفحة الرشيق)

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك صفحة تفاصيل المهمة assets/src/pages/TaskDetailPage.js:
> 1. استخراج (TaskHeaderActions.js, TaskMetaSidebar.js, TaskContributionsStream.js) في assets/src/components/task-detail/.
> 2. تجريد الـ CSS المضمن ونقله لـ admin.css.
> 3. التحقق بـ node --check واختبار test_task_checklists.php و test_time_tracking.php و test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 7. إعدادات خطافات الويب والتكاملات (`WebhooksSettingsTab.js`) 🟢 [P3]
- **المسار**: [`assets/src/components/WebhooksSettingsTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/WebhooksSettingsTab.js)
- **الحجم والأسطر**: 31.7 KB | 712 سطر
- **الهدف**: استخراج قائمة النقاط، فاحص السجلات، ونافذة الإضافة في `assets/src/components/webhooks/`.
- **المخرجات المستهدفة**:
  - `WebhookEndpointsList.js`
  - `WebhookDeliveryLogs.js`
  - `WebhookModal.js`
  - `WebhooksSettingsTab.js`

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك تبويب خطافات الويب assets/src/components/WebhooksSettingsTab.js إلى مكونات ذرية في assets/src/components/webhooks/ واختبارها عبر node --check و test_e2e_lifecycle.php ثم التثبيت في Git.
> ```

---

# ⚙️ ثانياً: ملفات الطبقة الخلفية (PHP Backend Layer)

---

### 8. متحكم REST للبوابة المستقلة (`class-workpress-rest-portal-controller.php`) 🟡 [P2]
- **المسار**: [`includes/api/class-workpress-rest-portal-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-portal-controller.php)
- **الحجم والأسطر**: 43.5 KB | 1,432 سطر
- **الهدف**: استخراج معالجات الطلبات (Handlers) المخصصة للبوابة (Requests, Feedback, Pulse, Signoff).

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك متحكم REST للبوابة includes/api/class-workpress-rest-portal-controller.php واستخراج Request Handlers مخصصة في includes/api/portal/ واختبار حزمة test_auth_service.php و test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 9. خدمة بوابة المستفيدين (`class-workpress-portal-service.php`) 🟡 [P2]
- **المسار**: [`includes/services/class-workpress-portal-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php)
- **الحجم والأسطر**: 48.7 KB | 1,322 سطر
- **الهدف**: فصل خدمة الاعتماد والتوقيع الرقمي في `class-workpress-portal-signoff-service.php`.

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لتفكيك includes/services/class-workpress-portal-service.php واستخراج خدمة الاعتماد الرقمي والتوقيع في class-workpress-portal-signoff-service.php مع تشغيل test_e2e_lifecycle.php والتثبيت في Git.
> ```

---

### 10. محرك إدارة المهام وآلة الحالات (`class-workpress-task-service.php`) 🟢 [P3]
- **المسار**: [`includes/services/class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php)
- **الحجم والأسطر**: 35.5 KB | 1,161 سطر
- **الهدف**: استخراج آلة الحالات وانتقالات دورة الحياة في `class-workpress-task-state-machine.php`.

> 📋 **البرومبت التشغيلي (Operational Prompt):**
> ```text
> @[c:\laragon\www\WORKPRESS\wp-content\plugins\WorkPress\.agents\skills\workpress-divider\SKILL.md] أطلق عميل التقسيم workpress-divider لاستخراج آلة حالات المهام من includes/services/class-workpress-task-service.php إلى class-workpress-task-state-machine.php واختبار حزمة test_e2e_lifecycle.php والتثبيت في Git.
> ```
