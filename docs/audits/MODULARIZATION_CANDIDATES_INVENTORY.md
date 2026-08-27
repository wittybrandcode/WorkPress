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
| **3** | [`assets/src/pages/RequestsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/RequestsPage.js) | **53.0 KB** | **1,122** | يدمج لوحة فرز الطلبات، نافذة التقييم الفني، نافذة تحويل الطلب لمشروع، ونافذة الرفض. | `assets/src/components/requests/`<br>• `RequestTriageBoard.js`<br>• `RequestEvaluationModal.js`<br>• `RequestConversionModal.js`<br>• `RequestFilterBar.js`<br>• `RequestsPage.js` (Lean controller) | 🔴 **عالية (P1)** |
| **4** | [`assets/src/pages/DashboardPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/DashboardPage.js) | **39.8 KB** | **810** | يجمع مؤشرات السرعة (Velocity)، رادار العمليات، مخطط عبء عمل الفريق، وتيار الأنشطة. | `assets/src/components/dashboard/`<br>• `VelocityKpiGrid.js`<br>• `TeamWorkloadCard.js`<br>• `LiveActivityFeed.js`<br>• `DashboardPage.js` (Lean coordinator) | 🟡 **متوسطة (P2)** |
| **5** | [`assets/src/pages/IntakeFormsPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/IntakeFormsPage.js) + [`IntakeFormsBuilderTab.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/IntakeFormsBuilderTab.js) | **53.2 KB** | **1,289** | محرر نماذج الاستقبال، قائمة الحقول، المعاينة الفورية، وتخصيص الخيارات مدمجة في كتل معقدة. | `assets/src/components/forms/`<br>• `FormFieldEditor.js`<br>• `FormSchemaPreview.js`<br>• `FormPillsSelector.js`<br>• `IntakeFormsPage.js` (Lean controller) | 🟡 **متوسطة (P2)** |
| **6** | [`assets/src/pages/TaskDetailPage.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/TaskDetailPage.js) | **33.1 KB** | **707** | تجميع ترويسة المهمة، انتقالات الحالات، قوائم الفحص، متتبع الوقت، وتيار المساهمات. | `assets/src/components/task-detail/`<br>• `TaskHeaderActions.js`<br>• `TaskContributionsStream.js`<br>• `TaskMetaSidebar.js`<br>• `TaskDetailPage.js` (Lean controller) | 🟡 **متوسطة (P2)** |
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
