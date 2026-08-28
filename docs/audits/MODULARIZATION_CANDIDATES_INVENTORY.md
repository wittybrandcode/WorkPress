# جرد وتحليل ملفات المنظومة المستهدفة بالتقسيم وتجريد التصميم (Modularization Candidates Inventory)
## WorkPress Comprehensive Codebase Decoupling & Modularization Audit

> **تاريخ الإعداد**: 27 أغسطس 2026  
> **المرجع المعماري**: دستور ومنهج وركبرس (`workpress-constitution.md`) وذاكرة الحارس (`workpress-guardian`)  
> **الهدف**: جرد شامل لكافة الملفات الضخمة وذات المسؤوليات المتداخلة في النظام، وتصنيفها، وتحديد مسار التقسيم الدقيق لكل منها عبر عميل التقسيم المتخصص `workpress-divider`.

---

## 📊 1. مصفوفة الأولويات العامة للملفات المستهدفة (Priority Matrix)

```
                       ┌─────────────────────────────────────────────────────────┐
                       │     مستودع وركبرس — خريطة الملفات المرشحة للتقسيم       │
                       └────────────────────────────┬────────────────────────────┘
                                                    │
             ┌──────────────────────────────────────┴──────────────────────────────────────┐
             │                                                                            │
             ▼                                                                            ▼
┌─────────────────────────┐                                                  ┌─────────────────────────┐
│     الواجهة الأمامية     │                                                  │      الطبقة الخلفية     │
│   (Frontend React/Preact)│                                                 │       (PHP Backend)     │
└────────────┬────────────┘                                                  └────────────┬────────────┘
             │                                                                            │
   ┌─────────┼─────────┬─────────┐                                              ┌─────────┼─────────┐
   ▼         ▼         ▼         ▼                                              ▼         ▼         ▼
Settings   Gantt    Requests  Dashboard                                     PortalREST TaskSvc  ContribSvc
 (79 KB)   (47 KB)   (53 KB)   (40 KB)                                       (44 KB)   (36 KB)   (35 KB)
```

---

## 📑 2. جرد ملفات الواجهة الأمامية (Frontend Catalog)

| # | اسم الملف والمسار | الحجم الحالي | عدد الأسطر | سبب الاستهداف | الهيكل المستهدف بعد التقسيم عبر `divider` | الأولوية |
|---|---|:---:|:---:|---|---|:---:|
| **1** | [`assets/src/pages/SettingsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/SettingsPage.js) | **17.5 KB** | **375** | تفكيك التبويبات وتجريد الـ CSS المضمن. | `assets/src/components/settings/`<br>✅ `RoleDropdown.js`<br>✅ `RolesPermissionsTab.js`<br>✅ `UserDirectoryTab.js`<br>✅ `ContributionTypesTab.js`<br>✅ `GeneralLocalizationTab.js`<br>✅ `SoundEffectsTab.js`<br>✅ `NotificationsTab.js`<br>✅ `ExportDiagnosticsTab.js` | ✅ **مُنجز ومثبت** |
| **2** | [`assets/src/components/GanttChart.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/GanttChart.js) | **14.2 KB** | **365** | عزل الحسابات والكانفاس والجدول الجانبي وشريط المهام. | `assets/src/components/gantt/`<br>✅ `GanttScaleBar.js`<br>✅ `GanttTableSidebar.js`<br>✅ `GanttGridCanvas.js`<br>✅ `GanttTaskRow.js`<br>✅ `GanttTooltip.js` | ✅ **مُنجز ومثبت** |
| **3** | [`assets/src/pages/RequestsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/RequestsPage.js) | **11.8 KB** | **264** | عزل لوحة الفرز والبطاقات والجدول ونوافذ التقييم. | `assets/src/components/requests/`<br>✅ `RequestFilterBar.js`<br>✅ `RequestCardsView.js`<br>✅ `RequestTriageBoard.js`<br>✅ `RequestTableView.js`<br>✅ `RequestConversionModal.js`<br>✅ `RequestEvaluationModal.js` | ✅ **مُنجز ومثبت** |
| **4** | [`assets/src/pages/DashboardPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/DashboardPage.js) | **11.4 KB** | **260** | عزل مناظير لوحة القيادة الثلاثة وشبكات المؤشرات. | `assets/src/components/dashboard/`<br>✅ `DashboardPerspectiveToolbar.js`<br>✅ `AdminPerspectiveView.js`<br>✅ `LeadPerspectiveView.js`<br>✅ `MemberPerspectiveView.js`<br>✅ `DashboardModals.js` | ✅ **مُنجز ومثبت** |
| **5** | [`assets/src/pages/IntakeFormsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/IntakeFormsPage.js) + [`IntakeFormsBuilderTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/IntakeFormsBuilderTab.js) | **19.8 KB** | **528** | عزل اللبنات، محرر الحقول، المعاينة، وشريط الأدوات. | `assets/src/components/forms/`<br>✅ `FormFieldPrimitives.js`<br>✅ `FormFieldEditor.js`<br>✅ `FormPillsSelector.js`<br>✅ `FormCanvasBuilder.js`<br>✅ `FormSchemaPreview.js`<br>✅ `IntakeFormsToolbar.js` | ✅ **مُنجز ومثبت** |
| **6** | [`assets/src/pages/TaskDetailPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/TaskDetailPage.js) | **9.7 KB** | **239** | عزل ترويسة المهمة، تيار المساهمات، والشريط الجانبي. | `assets/src/components/task-detail/`<br>✅ `TaskHeaderActions.js`<br>✅ `TaskContributionsStream.js`<br>✅ `TaskMetaSidebar.js` | ✅ **مُنجز ومثبت** |
| **7** | [`assets/src/components/WebhooksSettingsTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/WebhooksSettingsTab.js) | **31.7 KB** | **712** | إدارة نقاط الويب، فاحص سجلات التسليم، ومولد المفاتيح السرية في ملف واحد. | `assets/src/components/webhooks/`<br>• `WebhookEndpointsList.js`<br>• `WebhookDeliveryLogs.js`<br>• `WebhookModal.js`<br>• `WebhooksSettingsTab.js` (Lean container) | 🟢 **منخفضة (P3)** |

---

## ⚙️ 3. جرد ملفات الطبقة الخلفية (PHP Backend Catalog)

| # | اسم الملف والمسار | الحجم الحالي | عدد الأسطر | سبب الاستهداف | الهيكل المستهدف بعد التقسيم | الأولوية |
|---|---|:---:|:---:|---|---|:---:|
| **1** | [`includes/api/class-workpress-rest-portal-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-portal-controller.php) | **43.5 KB** | **1,432** | متحكم عملاق يدير أكثر من 15 نقطة نهاية (Endpoints) مختلفة للبوابة. | استخراج معالجات الطلبات إلى Handlers متخصصة لكل Domain. | 🟡 **متوسطة (P2)** |
| **2** | [`includes/services/class-workpress-portal-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php) | **48.7 KB** | **1,322** | يجمع إدارة الـ Shortcode، المخرجات المعتمدة، والمصادقة الرقمية والتنبيهات. | فصل خدمة الاعتماد الرقمي في `class-workpress-portal-signoff-service.php`. | 🟡 **متوسطة (P2)** |
| **3** | [`includes/services/class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php) | **35.5 KB** | **1,161** | محرك المهمة يجمع دورة الحياة، الانتقال المشروط، وقوائم الفحص وتتبع الوقت. | استخراج آلة الحالات (State Machine) في كلاس مستقل. | 🟢 **منخفضة (P3)** |
| **4** | [`includes/services/class-workpress-contribution-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php) | **34.9 KB** | **1,042** | تسجيل الأدلة، اعتماد الحلول، وتحديث شجرة المعرفة في ملف واحد. | فصل منطق التحول المعرفي في كلاس مخصص. | 🟢 **منخفضة (P3)** |

---

## 🎯 4. بروتوكول التشغيل المعتمد لعميل التقسيم (`workpress-divider`)

عند إطلاق عميل التقسيم `workpress-divider` على أي ملف من الجدول أعلاه، يلتزم بالدورة القياسية التالية:

```
1. التحليل الدقيق للملف والاعتمادات (Dependencies)
   └── 2. تجريد الـ Inline CSS ونقله إلى ملف الـ CSS المعني (admin.css أو portal.css)
       └── 3. استخراج المكونات الفرعية الذرية وتثبيتها في مجلد فرعي مخصص
           └── 4. إعادة صياغة الملف الأصلي ليصبح Controller/Coordinator رشيق (< 150 سطر)
               └── 5. الفحص النحوي الفوري (node --check)
                   └── 6. تشغيل حزمة الاختبارات الآلية (E2E & Unit Tests)
                       └── 7. تثبيت التعديل في Git وإرسال تقرير إنجاز للحارس
```
