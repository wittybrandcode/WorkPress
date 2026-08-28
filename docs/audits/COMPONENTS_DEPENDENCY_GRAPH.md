# 🗺️ مصفوفة اعتمادات مكونات واجهة المستخدم (Components Dependency Graph Matrix)

> **تاريخ التوثيق**: 28 أغسطس 2026  
> **الهدف**: خريطة شاملة لجميع ملفات `assets/src/components/` والروابط التبادلية قبل وأثناء تنفيذ عملية إعادة الهيكلة النطاقية (Domain-Driven Migration).

---

## 📊 جدول جرد المكونات وشجرة الاستيراد

| # | المكون الحالي | المجلد المستهدف | الملفات التي تستورده (Inbound Dependents) | الاستيرادات الخارجية للمكون (Outbound Dependencies) |
|---|---|---|---|---|
| **1** | `AvatarStack.js` | `ui/` | `TaskCard.js`, `TaskQuickPreviewModal.js`, `gantt/GanttTaskRow.js` | Preact |
| **2** | `CustomSelect.js` | `ui/` | `ContributionModal.js`, `FilterBar.js`, `ProjectModal.js`, `TaskModal.js`, `settings/RoleEditorForm.js` | Preact |
| **3** | `DatePicker.js` | `ui/` | `GanttChart.js` | Preact, dateUtils |
| **4** | `ErrorBoundary.js` | `ui/` | `App.js` | Preact |
| **5** | `FilterBar.js` | `ui/` | `ContributionsPage.js`, `KanbanPage.js`, `KnowledgePage.js`, `ProjectDetailPage.js`, `ProjectsPage.js`, `RequestsPage.js` | `MemberSelect`, `CustomSelect` |
| **6** | `ImagePicker.js` | `ui/` | `ContributionModal.js`, `ProjectModal.js`, `TaskModal.js`, `task-detail/TaskContributionsStream.js` | Preact, WP Media |
| **7** | `Loader.js` | `ui/` | 16 ملفاً عبر المنظومة | Preact |
| **8** | `MemberSelect.js` | `ui/` | `FilterBar.js`, `ProjectMembersModal.js`, `requests/RequestDetailsModal.js`, `task-detail/TaskMetaSidebar.js` | Preact, CustomSelect |
| **9** | `MultiFilePicker.js` | `ui/` | `ContributionDetailModal.js`, `TaskDocuments.js`, `task-detail/TaskContributionsStream.js` | Preact, WP Media |
| **10** | `PriorityBadge.js` | `ui/` | `TaskCard.js`, `TaskQuickPreviewModal.js`, `task-detail/TaskHeaderActions.js` | Preact |
| **11** | `SoundQuickToggle.js` | `ui/` | `App.js` | Preact, soundManager |
| **12** | `WorkPressLogo.js` | `ui/` | `App.js`, `about/AboutWorkPressTab.js` | Preact |
| **13** | `WpEditor.js` | `ui/` | `ContributionModal.js`, `ProjectModal.js`, `TaskModal.js`, `forms/FormSchemaPreview.js` | Preact, wp.editor |
| **14** | `Modal.js` | `modals/` | 9 ملفات نوافذ منبثقة | Preact |
| **15** | `ConfirmModal.js` | `modals/` | 10 ملفات عبر المنظومة | Preact, `Modal` |
| **16** | `ReportModal.js` | `modals/` | `DashboardModals.js`, `ProjectDetailPage.js`, `ProjectsPage.js` | Preact, `Modal`, `Loader` |
| **17** | `ProjectCard.js` | `projects/` | `ProjectsPage.js` | Preact, `PriorityBadge`, `AvatarStack` |
| **18** | `ProjectModal.js` | `projects/` | `App.js`, `DashboardModals.js`, `ProjectsPage.js` | Preact, `Modal`, `ImagePicker`, `CustomSelect`, `WpEditor` |
| **19** | `ProjectMembersModal.js` | `projects/` | `DashboardModals.js`, `ProjectsPage.js` | Preact, `Modal`, `MemberSelect`, `Loader` |
| **20** | `ProjectQuickPreviewModal.js` | `projects/` | `ProjectsPage.js` | Preact, `Modal` |
| **21** | `TaskCard.js` | `tasks/` | `KanbanPage.js` | Preact, `PriorityBadge`, `AvatarStack` |
| **22** | `TaskModal.js` | `tasks/` | `App.js`, `DashboardModals.js`, `KanbanPage.js`, `ProjectDetailPage.js`, `TaskDetailPage.js` | Preact, `Modal`, `ImagePicker`, `CustomSelect`, `WpEditor` |
| **23** | `TaskAssignmentModal.js` | `tasks/` | `DashboardModals.js`, `KanbanPage.js` | Preact, `Modal`, `MemberSelect` |
| **24** | `TaskQuickPreviewModal.js` | `tasks/` | `GanttPage.js`, `KanbanPage.js` | Preact, `Modal`, `PriorityBadge`, `AvatarStack` |
| **25** | `TaskChecklist.js` | `tasks/` | `TaskDetailPage.js` | Preact, `Loader` |
| **26** | `TaskTimeTracker.js` | `tasks/` | `TaskDetailPage.js` | Preact, `Loader` |
| **27** | `TaskDocuments.js` | `tasks/` | `TaskDetailPage.js` | Preact, `MultiFilePicker` |
| **28** | `ContributionModal.js` | `contributions/` | `App.js`, `DashboardModals.js`, `KanbanPage.js` | Preact, `Modal`, `ImagePicker`, `WpEditor` |
| **29** | `ContributionDetailModal.js` | `contributions/` | `DashboardModals.js`, `ContributionsPage.js`, `ProjectDetailPage.js`, `TaskDetailPage.js` | Preact, `Modal`, `MultiFilePicker`, `ContributionComments` |
| **30** | `ContributionComments.js` | `contributions/` | `ContributionDetailModal.js`, `task-detail/TaskContributionsStream.js` | Preact, `Loader`, `ConfirmModal` |
| **31** | `GanttChart.js` | `gantt/` | `GanttPage.js` | Preact, `gantt/*`, `DatePicker` |
| **32** | `IntakeFormsBuilderTab.js` | `forms/` | `SettingsPage.js` | Preact, `forms/*` |
| **33** | `WebhooksSettingsTab.js` | `webhooks/` | `SettingsPage.js` | Preact, `webhooks/*` |
| **34** | `SettingsQuickMenu.js` | `settings/` | `App.js` | Preact, soundManager |
| **35** | `AboutWorkPressTab.js` | `about/` | `SettingsPage.js` | Preact, `about/*`, `WorkPressLogo` |

---

## 🛡️ استراتيجية الترحيل الآمن (Zero-Risk Execution Protocol)

1. **الترحيل التدريجي حسب الطبقة (Layered Batch Migration)**:
   - **المرحلة 1**: نقل عناصر الأساس `ui/` (13 ملفاً) وتحديث استيراداتها في جميع الملفات.
   - **المرحلة 2**: نقل النوافذ المنبثقة `modals/` (3 ملفات) وتحديث استيراداتها.
   - **المرحلة 3**: نقل مكونات المشاريع `projects/` (4 ملفات) وتحديث استيراداتها.
   - **المرحلة 4**: نقل مكونات المهام `tasks/` (7 ملفات) وتحديث استيراداتها.
   - **المرحلة 5**: نقل مكونات المساهمات `contributions/` (3 ملفات) وتحديث استيراداتها.
   - **المرحلة 6**: نقل التبويبات الرئيسية إلى مجلداتها المتخصصة (`gantt/`, `forms/`, `webhooks/`, `settings/`, `about/`).

2. **بوابة الفحص الإلزامية بعد كل مرحلة**:
   - تشغيل `node --check` على جميع الملفات المنقولة والمعدلة.
   - تشغيل حزمة اختبارات الـ PHP لضمان استقرار الخادم وسلامة الواجهات.
