<p align="center">
  <br />
  <a href="https://github.com/wittybrandcode/WorkPress">
    <img src="assets/brand/workpress.svg" alt="WorkPress Brand Logo" width="480" />
  </a>
  <br />
  <strong>محرك السيادة التشغيلية والذاكرة المؤسسية الأصيل لمنظومة ووردبريس</strong>
  <br />
  <em>The Native Organizational Memory & Work Management Engine for WordPress</em>
  <br />
  <br />
</p>

<p align="center">
  <a href="https://github.com/wittybrandcode/WorkPress/releases"><img src="https://img.shields.io/badge/Release-v2.2.1--Stable-10b981?style=for-the-badge&logo=git&logoColor=white" alt="Release" /></a>
  <a href="https://wordpress.org/"><img src="https://img.shields.io/badge/WordPress-6.0%20➔%207.x-21759b?style=for-the-badge&logo=wordpress&logoColor=white" alt="WordPress" /></a>
  <a href="https://php.net/"><img src="https://img.shields.io/badge/PHP-8.0%20➔%208.3-777bb4?style=for-the-badge&logo=php&logoColor=white" alt="PHP" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPLv2-00192f?style=for-the-badge" alt="License" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Architecture-Zero%20Table%20Native-047857?style=for-the-badge&logo=mysql&logoColor=white" alt="Zero Table" /></a>
  <a href="#"><img src="https://img.shields.io/badge/UI%20Engine-No--Build%20Preact%20SPA-f59e0b?style=for-the-badge&logo=javascript&logoColor=white" alt="No Build SPA" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Security-Tri--Partite%20Auth-dc2626?style=for-the-badge&logo=auth0&logoColor=white" alt="Tri-Partite Auth" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Aesthetics-0px%20Sharp%20Geometry-0f172a?style=for-the-badge" alt="Sharp Geometry" /></a>
</p>

<p align="center">
  <a href="#-english"><strong>🇬🇧 English Documentation</strong></a> &bull; 
  <a href="#-العربية"><strong>🇸🇦 التوثيق باللغة العربية</strong></a>
</p>

---

<a name="english"></a>
# 🇬🇧 English

## 🧭 Vision & "just work." Philosophy

> **«WorkPress — just work.»**  
> *You focus on executing tasks and submitting verifiable evidence; WorkPress autonomously handles lifecycle governance, cascading completion, permanent knowledge preservation, and stakeholder sign-offs.*

**WorkPress** is an enterprise-grade sovereign engine that transforms WordPress from a Content Management System (CMS) into a **robust organizational operating system, project & task delivery platform, client collaboration suite, and immutable knowledge repository**.

---

## 🏛️ 6 Core Architectural Pillars

```
                     ┌────────────────────────────────────────────────────────┐
                     │         Organizational Memory & Sovereign Engine       │
                     └──────────────────────────┬─────────────────────────────┘
                                                │
       ┌─────────────────┬──────────────────────┼──────────────────────┬─────────────────┐
       ▼                 ▼                      ▼                      ▼                 ▼
 ┌───────────┐     ┌───────────┐          ┌───────────┐          ┌───────────┐     ┌───────────┐
 │ 1. Native │     │ 2. Truth  │          │ 3. Cascade│          │ 4. Portal │     │ 5. RBAC   │
 │ Zero-Table│     │ -Driven   │          │ Completion│          │ 0% CSS    │     │ Tri-Part  │
 │ WP Schema │     │ Evidence  │          │ & Extract │          │ Bleed     │     │ Auth      │
 └───────────┘     └───────────┘          └───────────┘          └───────────┘     └───────────┘
```

1. 🏛️ **Native Zero-Table Architecture:** Zero custom SQL tables. Projects map to `Taxonomy`, Tasks to Custom Post Types (`work_item`), and Contributions to Comments (`wp_contribution`), ensuring eternal compatibility with core WordPress backup, caching, and export utilities.
2. 🛡️ **Truth-Driven State:** No synthetic statuses or manual checkboxes. Verifiable contributions and evidence are the sole drivers of progress, logged forever in an immutable audit timeline.
3. ⚡ **Cascading Completion & Knowledge Extraction:** Accepting a solution contribution completes the task, updates project metrics, closes finished milestones, and indexes the solution into a permanent Knowledge Base.
4. 🏢 **Standalone Portal & 4-Tier Citizenship:** An isolated `Zero CSS Bleed` portal at `/portal/` completely separate from `/wp-admin/`, preventing client access to sensitive internal technical discussions.
5. 🔒 **Tri-Partite Authorization Formula:** Strict operational security: $\text{CanPerform} = \text{GlobalCap} \land \text{ProjectVisibility} \land \text{ResourceRelationship}$ governed by 8 atomic capability packages (34 granular capabilities).
6. 📡 **Cryptographic Webhooks Pipeline:** Real-time event dispatching signed with `HMAC-SHA256` keys, supporting Discord, Slack, Microsoft Teams, and custom ERP webhooks.

---

## 👥 4-Tier Citizenship & Tri-Space Separation

### 1. The 4-Tier Citizenship Hierarchy

| Tier | Role / Identity | Dedicated Interface | Security Scope & Context |
| :---: | :--- | :--- | :--- |
| **👑 1** | **Administrator** (`administrator`) | CoWorkPress Admin SPA (`/wp-admin/`) | Full governance, capability matrix management, lead assignments, and audit control |
| **🛠️ 2** | **Technical Staff** (`editor`, `author`, `contributor`) | Kanban, Gantt, and Time Tracker | **Editor:** Project lead & solution acceptor. **Author:** Self-directed producer. **Contributor:** Assigned task executor |
| **💼 3** | **Client Stakeholder** (`workpress_client`) | Standalone Client Portal (`/portal/`) | **Isolated from /wp-admin/**; submits project intake requests, reviews deliverables, and performs digital sign-offs |
| **👁️ 4** | **Subscriber / Community** (`subscriber`) | WordPress Frontend | Public user context; protected with zero access to internal technical workspaces |

### 2. Tri-Space Separation Architecture

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│   Space 1: WP Public Frontend    │   │  Space 2: Standalone Portal      │   │ Space 3: CoWorkPress Workspace   │
│       (example.com/)             │   │    (example.com/portal/)         │   │  (/wp-admin/admin.php?page=wp)   │
├──────────────────────────────────┤   ├──────────────────────────────────┤   ├──────────────────────────────────┤
│ • General site visitors & readers│   │ • Clients and project owners     │   │ • Technical staff & management   │
│ • Zero access to internal tasks  │   │ • 100% Zero Theme CSS Bleed      │   │ • Kanban, Gantt, Knowledge Base  │
│ • Zero WorkPress bundle loaded   │   │ • Request intake & sign-offs     │   │ • Tri-Partite Security Formula   │
└──────────────────────────────────┘   └──────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🛡️ 8 Atomic Capability Packages (34 Capabilities)

```text
1. Project Management      ➔ read_workpress_projects, create_workpress_projects, edit_workpress_projects, delete_workpress_projects, manage_project_members
2. Task Execution          ➔ read_workpress_tasks, create_workpress_tasks, edit_assigned_tasks, edit_others_workpress_tasks, change_task_status, assign_tasks, delete_workpress_tasks
3. Contribution Flow       ➔ read_contributions, add_contributions, edit_contributions, delete_contributions, accept_solutions, revoke_solutions
4. Requests Management     ➔ submit_work_requests, view_incoming_requests, triage_requests, approve_requests, reject_requests
5. Knowledge Governance    ➔ read_knowledge_base, generate_executive_reports, export_knowledge_book
6. System Administration   ➔ access_workpress_admin, manage_workpress_settings, manage_intake_forms, manage_webhooks
7. Client Portal           ➔ access_workpress_portal, view_own_deliverables, submit_client_feedback, signoff_project_deliverables
```

---

## 🚀 High-Density Productive Engines

1. **Ultra-Dense Kanban Studio:** 220px cover cards, distinct project badge row, compact footer with priority chips, time badges, and assignee avatars with smooth drag-and-drop.
2. **Master Gantt Suite:** 4 time scales (24h live day, full days, weeks, months), a pulsating Live Current Time Needle, and one-click `[ Expand All ]` & `[ Collapse All ]` tree controls.
3. **Knowledge Base & Book Generator:** Automatic indexing of accepted solutions, full-text search, and one-click export to comprehensive **Markdown (.md) knowledge books** and **A4 PDF handover certificates**.
4. **Project Cold Storage (Hibernation Engine):** Automatic freezing (`status: frozen`) when a client is demoted, and instant thawing upon reactivation to protect proprietary assets.
5. **Precision Time Tracker:** Session tracker with quick increment chips `[ +15m ]` `[ +30m ]` `[ +1h ]` `[ +2h ]` `[ +4h ]` and a sticky action header for long task views.
6. **Web Audio Sound Suite:** Pure sine, acoustic grand piano, and tactile ASMR mechanical feedback with a granular event matrix and undoable action toasts.

---

## ⚙️ 17 Backend Core Services

| Service Class | Responsibility |
| :--- | :--- |
| `WorkPress_Project_Service` | Project lifecycle, progress calculations, prefix indexing, and lead assignment |
| `WorkPress_Task_Service` | Task state transitions, checklist verification, and priority governance |
| `WorkPress_Contribution_Service` | Evidence recording, pending deletion requests, and solution acceptance |
| `WorkPress_Knowledge_Service` | Extraction of accepted solutions, markdown book generation, and search indexing |
| `WorkPress_Portal_Service` | Client portal workspace, deliverable feedback, and digital sign-offs |
| `WorkPress_Webhook_Service` | HMAC-SHA256 signature generation and Discord/Slack/Teams dispatchers |
| `WorkPress_Hibernation_Service` | Automatic freezing and thawing of client projects upon role changes |
| `WorkPress_Membership_Service` | Project membership verification, lead checks, and client email matching |
| `WorkPress_Intake_Service` | Dynamic intake form schema processing and request triaging |
| `WorkPress_Activity_Service` | Immutable audit trail generation for all state transitions |
| `WorkPress_Metrics_Service` | Aggregation of executive metrics, velocity indicators, and completion stats |
| `WorkPress_Capabilities_Registry` | Registration and enforcement of all 27 atomic capability permissions |
| `WorkPress_Roles_Service` | Dynamic custom role creation, archetype cloning, and role aliases |
| `WorkPress_Settings_Service` | System preferences, time localization, and sound event mappings |
| `WorkPress_Notification_Service` | Internal notifications and automated email dispatchers |
| `WorkPress_Time_Service` | Work log sessions, estimate accuracy tracking, and budget burn rates |
| `WorkPress_Export_Service` | Full system JSON backups and printable handover report generation |

---

## 🗄️ Native Zero-Table Data Model

```
┌─────────────────────────┬───────────────────────────────┬─────────────────────────────────┬──────────────────────────────────────────┐
│ Entity                  │ WordPress Core Construct      │ Core Database Table             │ Metadata Storage                         │
├─────────────────────────┼───────────────────────────────┼─────────────────────────────────┼──────────────────────────────────────────┤
│ Project                 │ Custom Taxonomy (workpress_project) │ wp_terms & wp_term_taxonomy │ wp_termmeta (Lead, Status, Client, Prefix)│
│ Task                    │ Custom Post Type (work_item)  │ wp_posts                        │ wp_postmeta (Priority, Estimate, Assign) │
│ Contribution            │ Custom Comment (wp_contribution) │ wp_comments                  │ wp_commentmeta (Type, Is_Solution, Trash)│
│ Knowledge Base          │ Read Model of Accepted Solutions │ wp_comments (is_solution = 1)│ Direct query model (Zero data redundancy)│
│ Audit Trail             │ Audit Comments (wp_audit)     │ wp_comments                     │ Immutable historical logs                │
│ Webhooks                │ Option Key with HMAC Secret   │ wp_options                      │ Encrypted SHA256 webhook configurations  │
└─────────────────────────┴───────────────────────────────┴─────────────────────────────────┴──────────────────────────────────────────┘
```

---

<a name="العربية"></a>
# 🇸🇦 العربية

## 🧭 الرؤية وفلسفة العمل السيادية (Vision & Philosophy)

> **«WorkPress — just work.»**  
> *أنت تركز على العمل الفعلي وتوثيق الأدلة، وWorkPress يتولى الحوكمة، الإكمال المتتالي، أرشفة الذاكرة، وإشعار أصحاب المصلحة آلياً.*

**WorkPress (وركـبـرس)** هو محرك سيادي مؤسسي (Enterprise Work & Knowledge Engine) يحول ووردبريس من مجرد نظام لإدارة المحتوى (CMS) إلى **بيئة تشغيل مؤسسية متقدمة، ومنصة لإدارة المشاريع والمهام، ومصادقة مخرجات العملاء، وتوليد بنك معرفة دائم غير قابل للمحو**.

---

## 🏛️ الركائز الهندسية الست لمنظومة WorkPress

1. 🏛️ **الأنطولوجيا الأصلية بدون جداول مخصصة (Native Zero-Table Ontology):**
   صفر جداول SQL ملوثة؛ كافة كيانات النظام مبنية أصلياً فوق معمارية ووردبريس (`Terms`, `Posts`, `Comments`, `Meta`) لضمان استدامة وتوافق البيانات للأبد.
2. 🛡️ **الحقيقة تقود الحالة (Truth-Driven State):**
   لا توجد حالات وهمية أو تعديلات عشوائية؛ المساهمة الفنية المعتمدة والدليل المرفق هما البرهان الوحيد على تقدم العمل، مع حفظ أثر تاريخي غير قابل للمحو.
3. ⚡ **الإكمال المتتالي وسلسلة الاستخلاص المعرفي (Cascading Lifecycle & Knowledge):**
   اعتماد الحل $\rightarrow$ إكمال المهمة $\rightarrow$ اختتام المشروع $\rightarrow$ استخلاص الحل كأصل معرفي دائم في بنك المعرفة.
4. 🏢 **البوابة المستقلة وهرم المواطنة (Standalone Portal & 4-Tier Citizenship):**
   عزل تام 100% بنظام `Zero CSS Bleed` لبوابة المستفيدين `/portal/`، مع فصل كامل بين الإدارة الفنية والعملاء.
5. 🔒 **مصفوفة التفويض الثلاثي والقدرات الذرية (Tri-Partite Authorization):**
   فرض معادلة الأمان: $\text{CanPerform} = \text{GlobalCapability} \land \text{ProjectVisibility} \land \text{ResourceRelationship}$ عبر 8 حزم صلاحيات ذرية.
6. 📡 **خطافات الويب والتكامل الخارجي المشفر (Cryptographic Webhooks):**
   بث فوري لأحداث المنظومة بتوقيع رقمي مشفر `HMAC-SHA256` مع قوالب جاهزة لـ Discord و Slack و Teams و ERPs.

---

## 👥 هرم المواطنة وعزل المساحات الثلاث (Citizenship & Tri-Space Sovereignty)

### 1. هرم المواطنة الرباعي (4-Tier Citizenship Hierarchy)

| المستوى | الرتبة والدور | الواجهة المخصصة | السلوك الأمني وسياق العمل |
| :---: | :--- | :--- | :--- |
| **👑 1** | **المدير العام** (`administrator`) | غرفة عمليات CoWorkPress (`/wp-admin/`) | الحوكمة الشاملة، تعديل مصفوفة الصلاحيات، تعيين القادة، وإدارة غرف العمليات |
| **🛠️ 2** | **الكوادر الفنية وفرق التنفيذ** (`editor`, `author`, `contributor`) | غرفة العمليات والكانبان ومخطط جانت | **المحرر:** قيادة المشاريع واعتماد الحلول. **الكاتب:** إنتاج مستقل. **المساهم:** مهام مسندة |
| **💼 3** | **المستفيدون وأصحاب الطلبات** (`workpress_client`) | بوابة المستفيدين المعزولة (`/portal/`) | **معزول تماماً عن لوحة الإدارة**؛ تقديم الطلبات، المراجعة التفاعلية، والتوقيع الرقمي للمخرجات |
| **👁️ 4** | **المشتركون والمجتمع** (`subscriber`) | واجهة الموقع العام (Frontend) | حساب المتابعة العامة المحمي، مع توجيه ذكي وآمن عند تسجيل الدخول |

### 2. الفصل المعماري والسيادي للمساحات الثلاث (The Tri-Space Separation)

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│   المساحة 1: موقع WP العام       │   │  المساحة 2: بوابة المستفيدين     │   │ المساحة 3: غرفة عمليات CoWorkPress│
│    (Public Web Front-end)        │   │    (Standalone Portal /portal/)  │   │     (Admin SPA Workspace)        │
├──────────────────────────────────┤   ├──────────────────────────────────┤   ├──────────────────────────────────┤
│ • الزوار، القراء، والعموم        │   │ • المستفيدون وأصحاب المشاريع     │   │ • الكوادر الفنية وفرق التنفيذ    │
│ • صفر وصول للعمليات الداخلية     │   │ • عزل تام 100% Zero CSS Bleed   │   │ • الكانبان، جانت، بنك المعرفة   │
│ • صفر استهلاك لأصول وركبرس       │   │ • تقديم الطلبات والتوقيع الرقمي  │   │ • حماية بمعادلة التفويض الثلاثي  │
└──────────────────────────────────┘   └──────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 🛡️ مصفوفة الصلاحيات والحزم الذرية (34 Atomic Capabilities)

توفر المنظومة **34 صلاحية ذرية سيادية** مجمعة في حزم مبرمجة، قابلة للتعديل والتخصيص الفوري لكل دور ومستخدم:

```text
1. إدارة المشاريع       ➔ read_workpress_projects, create_workpress_projects, edit_workpress_projects, delete_workpress_projects, manage_project_members
2. تنفيذ المهام         ➔ read_workpress_tasks, create_workpress_tasks, edit_assigned_tasks, edit_others_workpress_tasks, change_task_status, assign_tasks, delete_workpress_tasks
3. تدفق المساهمات       ➔ read_contributions, add_contributions, edit_contributions, delete_contributions, accept_solutions, revoke_solutions
4. وارد واستقبال الطلبات ➔ submit_work_requests, view_incoming_requests, triage_requests, approve_requests, reject_requests
5. حوكمة وبنك المعرفة   ➔ read_knowledge_base, generate_executive_reports, export_knowledge_book
6. إدارة وتكوين النظام  ➔ access_workpress_admin, manage_workpress_settings, manage_intake_forms, manage_webhooks
7. بوابة المستفيدين     ➔ access_workpress_portal, view_own_deliverables, submit_client_feedback, signoff_project_deliverables
```

---

## 🚀 منظومة المحركات الإنتاجية المدمجة (High-Density Productive Engines)

### 1. لوحة الكانبان فائقة الكثافة (Ultra-Dense Kanban Studio)
- بطاقات مهام غنية بأغلفة بارزة بارتفاع **220px** وزوايا حادة **0px**.
- سطر مستقل للمشروع المنتمي مع أيقونة المحفظة، وشريط أدوات سفلي متراص يضم شارات الأولوية والحالة وعدادات الوقت وتكليفات الأعضاء.
- سحب وإفلات تفاعلي سلس مع تحديث فوري للحالات وسجل التدقيق.

### 2. مخطط جانت والجدولة الزمنية المؤسسية (Master Gantt Suite)
- **4 مقاييس زمنية متكاملة:** (24 ساعة لليوم الحالي، أيام كاملة بأسماء عربية، أسابيع، وشهور).
- **مؤشر الوقت الحي (Live Current Time Needle):** خط رأسي أحمر نابض يوضح الساعة والدقيقة الفعلية لليوم.
- **أزرار التحكم الجماعي في شجرة المشاريع:** أزرار `[ توسيع الكل ]` و `[ طي الكل ]` لإدارة مئات المهام المتفرعة بنقرة واحدة.
- بطاقات معاينة عائمة ذكية عريضة **350px** بنظام التصاق يمنع حجب البارات.

### 3. بنك المعرفة والأرشفة الحية (Knowledge Base Engine)
- استخلاص تلقائي فوري لكافة الحلول والمساهمات المعتمدة وتحويلها إلى بنك معرفي قابل للبحث والاسترجاع.
- **مولد كتيب المعرفة الشامل (.md):** تصدير كامل المعرفة الهندسية المعتمدة بصيغة Markdown بضغطة زر.
- وثائق استلام واعتماد مجهزة للتصدير والطباعة الرسمية بجودة **A4 Corporate PDF**.

### 4. ثلاجة المشاريع السيادية (Project Cold Storage & Hibernation)
- محرك تجميد وإذابة آلي للمشاريع (`status: frozen`) عند تغيير أو خفض رتبة العملاء لحماية سرية وأمان المنشأة.

### 5. متتبع الوقت وشرائح الإضافة السريعة (Task Time Tracker)
- تتبع الساعات المقدرة والفعلية مع شرائح الإضافة السريعة `[ +15د ]` `[ +30د ]` `[ +1س ]` `[ +2س ]` `[ +4س ]`.
- ترويسة إجرائية مثبتة (`Sticky Action Bar`) في صفحة تفاصيل المهمة لتسهيل الحفظ والتعديل أثناء التمرير.

### 6. المؤثرات الصوتية والتوست التفاعلي الشامل (Audio & Notification Suite)
- حزمة نغمات إلكترونية وميكانيكية وبيانو مدمجة بمحرك `Web Audio API` لتأكيد العمليات (الاعتماد، الحذف، التنبيهات).
- نظام توست إشعارات ملون وشامل يتيح التراجع الفوري عن القرارات الخاطئة.

---

## ⚡ متطلبات التشغيل والتثبيت (Installation)

### المتطلبات الأساسية (Prerequisites):
- **WordPress:** 6.0 أو أحدث.
- **PHP:** 8.0 أو 8.1 أو 8.2 أو 8.3+.
- **Web Server:** Apache / Nginx / LiteSpeed مع تمكين الروابط الدائمة (Pretty Permalinks).

### خطوات التثبيت:
1. انسخ مجلد `WorkPress` داخل مسار إضافات ووردبريس:
   ```bash
   wp-content/plugins/WorkPress/
   ```
2. فعّل الإضافة من لوحة تحكم ووردبريس: **إضافات ➔ إضافات منصّبة ➔ تفعيل WorkPress**.
3. استمتع بغرف العمليات والبوابات عبر الروابط المباشرة:
   - **غرفة عمليات CoWorkPress:** `https://your-domain.com/wp-admin/admin.php?page=workpress`
   - **بوابة المستفيدين المستقلة:** `https://your-domain.com/portal/`
   - **بوابة تسجيل الدخول الذكية:** `https://your-domain.com/workpress-login/`

---

## 📜 الترخيص والحقوق (License)

مشروع **WorkPress** مرخص بالكامل تحت رخصة **GNU General Public License v2.0 (GPLv2)**.  
راجع ملف [LICENSE](LICENSE) للاطلاع على نص الرخصة كاملاً.

---

<p align="center">
  صُنع بأعلى معايير الهندسة المعمارية والسيادة الرقمية لخدمة المنشآت وفرق العمل الاحترافية.<br />
  <strong>WorkPress Core Engineering Team &bull; 2026</strong>
</p>
