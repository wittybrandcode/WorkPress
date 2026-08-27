# 🧩 كتالوج المكونات المعمارية (WorkPress Preact Component Catalog)
## Preact 18 Component Hierarchy, Props Contracts, CSS Hooks & Usage Patterns

> **نوع الوثيقة:** المرجع التقني لمكونات الواجهة الأمامية (Frontend Components)  
> **الإصدار المعتمد:** WorkPress v2.2.1-Stable  
> **التقنية:** Preact 18 + HTM (No-Build Standalone Architecture)  
> **المسار المصدري:** `assets/src/components/` & `assets/src/pages/`

---

## 🏛️ 1. الخريطة الهيكلية للمكونات (Component Architecture Map)

```
App.js (Main SPA Shell & Global State)
├── Header & Navigation (Plaza, Kanban, Gantt, Knowledge, Settings)
├── Global Modals & Toasts (ToastContainer, AudioEffects)
│
└── Routed Pages:
    ├── PlazaPage.js              ──► StatCards, ActivityFeed, QuickActions
    ├── KanbanPage.js             ──► KanbanColumn, TaskCard, TaskDetailModal
    ├── GanttPage.js              ──► GanttControls, GanttTimeline, TimeNeedle
    ├── KnowledgePage.js          ──► SolutionCard, MarkdownViewer, BookExport
    ├── SettingsPage.js           ──► SoundKitSelector, WebhooksStudio, FormBuilder
    └── TaskDetailPage.js        ──► TimeTracker, Checklists, Attachments, ContributionStream
```

---

## 📦 2. أبرز المكونات القياسية واستخداماتها

### 1. `TaskCard.js` (بطاقة المهمة في الكانبان)
* **المسؤولية:** عرض بطاقة المهمة متراصة الكثافة بارتفاع غلاف 220px، مع شريط الأولوية، سطر المشروع، عدادات الوقت والمرفقات، وصور المكلفين.
* **الخصائص (Props):**
  * `task` (Object): كائن المهمة المنسق من REST API.
  * `onClick` (Function): فتح نافذة تفاصيل المهمة.
  * `onDragStart` (Function): بدء السحب لتغيير الحالة.

---

### 2. `TaskTimeTracker.js` (متتبع الوقت وشرائح الإضافة)
* **المسؤولية:** تسجيل ساعات العمل الفعلية، إدارة التقديرات، وعرض شرائح الإضافة السريعة `[ +15د ]` `[ +30د ]` `[ +1س ]` `[ +2س ]` `[ +4س ]`.
* **الخصائص (Props):**
  * `taskId` (Number): معرف المهمة.
  * `estimatedHours` (Number): التقدير الزمني الكلي.
  * `loggedHours` (Number): الساعات المستهلكة المسجلة.
  * `onTimeUpdated` (Function): استدعاء تحديث البيانات بعد التسجيل.

---

### 3. `PriorityBadge.js` (شارة الأولوية الذرية)
* **المسؤولية:** عرض وسم الأولوية (`low`, `medium`, `high`, `urgent`) بنمط `.wp-dense-chip` وزوايا 0px وأيقونات متوافقة.

---

### 4. `ContributionModal.js` (نموذج إيداع المساهمات والأدلة)
* **المسؤولية:** إدخال مساهمة جديدة، رفع المرفقات المتعددة، وتحديد نطاق الرؤية (`client_review` أو `internal`).

---

### 5. `TaskAssignmentModal.js` (نافذة تعيين وتكليف الأعضاء)
* **المسؤولية:** اختيار وتكليف أعضاء الفريق الفني بالمهمة، مع تطبيق فلترة برمجية تستبعد حسابات العملاء والمشاهدين.

---
*تم تصميم كافة المكونات للعمل المباشر في المتصفح بكفاءة مطلقة ودون أي تبعيات ثقيلة.*
