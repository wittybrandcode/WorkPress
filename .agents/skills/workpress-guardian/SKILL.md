---
name: workpress-guardian
description: >-
  The definitive expert memory and architectural guardian for WorkPress.
  Contains the complete ontology, entity relationships, service registry,
  file map, UI component catalog, REST API contracts, security model,
  governance hierarchy, and design system tokens.
  Activate this skill when making ANY change to WorkPress code, architecture,
  database, APIs, UI components, or portal features.
---

# مهارة حارس دستور ومنهج وركبرس — ذاكرة الخبير المطور
# (WorkPress Expert Developer Memory & Architecture Guardian)

> **هذه المهارة هي الذاكرة الشاملة للمطور الخبير لنظام وركبرس.**
> تحتوي على كل ما يحتاجه أي وكيل ذكاء اصطناعي أو مطور بشري لفهم النظام بعمق
> واتخاذ قرارات معمارية وتصميمية وبرمجية صحيحة من المحاولة الأولى.

---

# الفصل الأول: الفلسفة والمبادئ التأسيسية

## 1.1 الرؤية الجوهرية

WorkPress هو **محرك الذاكرة المؤسسية (Organizational Memory Engine)** وليس مجرد مدير مهام:

```
الأشخاص ينشئون العمل → العمل يولّد المعرفة → المعرفة تصبح ذاكرة مؤسسية مستدامة
```

## 1.2 المبادئ الـ 21 غير القابلة للكسر (المصدر: `docs/core/FIRST_PRINCIPLES.md`)

| # | المبدأ | القاعدة التطبيقية |
|---|--------|-------------------|
| 1 | People create Work | الأشخاص هم الفاعلون، والنظام يوثق أفعالهم |
| 2 | Work generates Knowledge | كل مهمة مكتملة تتحول لأصل معرفي |
| 3 | Knowledge → Organizational Memory | المعرفة المتراكمة هي ذاكرة المؤسسة |
| 4 | Work is Content | العمل محتوى دائم، ليس بيانات تشغيلية عابرة |
| 5 | WordPress Data Model = Source of Truth | Project=Taxonomy, Task=Post, Contribution=Comment, Person=User |
| 6 | WordPress remains WordPress | لا نعيد بناء auth/users/roles/media/editor/REST/search |
| 7 | Capabilities → "Can I?" | القدرة تجيب عن الاستطاعة النظامية |
| 8 | Membership → "Where do I belong?" | العضوية تجيب عن الانتماء والرؤية |
| 9 | Assignment = Responsibility only | التكليف لا يمنح صلاحية ولا عضوية |
| 10 | Contributions preserve Evidence | كل فعل مهم يترك دليلاً غير قابل للمحو |
| 11 | Knowledge = Accepted Evidence | المعرفة عرض للأدلة المعتمدة، ليست كياناً مستقلاً |
| 12 | Current State ≠ History | الحالة الحالية في meta، والتاريخ في contributions |
| 13 | History is never lost | لا محو لأي أثر عمل أو قرار |
| 14 | Office interprets; Core never interprets | Core محايد، Office Pack يملك التخصص |
| 15 | Templates start work | قوالب المشاريع مفهوم Core، التطبيق لـ Office Packs |
| 16 | Workflow = States + Transitions only | Core يعرّف الانتقالات، المعنى التجاري لـ Office Pack |
| 17 | Services own business rules | REST/UI لا تلمس الجداول مباشرة |
| 18 | REST APIs expose services | الـ API عقد للنواة، ليس proxy لقاعدة البيانات |
| 19 | Core stays domain neutral | أي معرفة قطاعية تنتمي لـ Office Pack أو Module |
| 20 | Extensions are removable without data loss | الإضافات لا تملك البيانات الأساسية |
| 21 | Read models accelerate; never define truth | Index Tables اختيارية وقابلة لإعادة البناء |

## 1.3 اختبار القرار المعماري (Decision Test)

قبل قبول أي ميزة أو schema أو endpoint:
1. هل يحافظ على WordPress Data Model كمصدر حقيقة؟
2. هل يضع قواعد الأعمال في Service مناسبة؟
3. هل يفصل الحالة الحالية عن التاريخ؟
4. هل يحترم العضوية والرؤية؟
5. هل يبقي Core محايداً وقابلاً لإزالة الامتداد بلا فقد بيانات؟

**إن كانت الإجابة «لا» على أي سؤال → يُعاد التصميم قبل التنفيذ.**

---

# الفصل الثاني: أنطولوجيا الكيانات ونموذج البيانات

## 2.1 مصفوفة الكيانات الوجودية

| الكيان في WorkPress | الأصل في WordPress | السؤال الذي يجيب عنه |
|---|---|---|
| **المشروع (Project)** | Taxonomy (`workpress_project`) | «أين يجري العمل؟» |
| **المهمة (Task)** | CPT (`work_item`) | «ما هو العمل المطلوب؟» |
| **المساهمة (Contribution)** | Comment (`wp_contribution`) | «ما الذي حدث؟ وما الدليل؟» |
| **المعرفة (Knowledge)** | Read Model (مساهمات معتمدة) | «ما الذي تعلمناه؟» |
| **الشخص (Person)** | WP_User | «من الفاعل؟» |
| **العضوية (Membership)** | Term Meta (`_workpress_member_{user_id}`) | «إلى أين أنتمي؟» |
| **القدرة (Capability)** | WP Capability | «هل أستطيع نظامياً؟» |
| **التكليف (Assignment)** | Post Meta (`_workpress_assignees`) | «ما مسؤوليتي الآن؟» |

## 2.2 عقود الـ Meta الأساسية

```
Project (Term Meta):
  _workpress_member_{user_id}    → دور العضو في المشروع
  _workpress_project_status      → حالة المشروع (active/completed/frozen)
  _workpress_cover_id            → معرف صورة الغلاف
  _workpress_start_at            → تاريخ البدء (UTC ISO-8601)
  _workpress_due_at              → تاريخ الاستحقاق (UTC ISO-8601)

Task (Post Meta):
  _workpress_status              → الحالة الحالية (new/assigned/in_progress/in_review/completed/closed)
  _workpress_priority            → الأولوية (low/normal/high/critical)
  _workpress_due_at              → موعد الاستحقاق
  _workpress_assignee_ids        → المكلفون الحاليون (array of user IDs)
  _workpress_reviewer_ids        → المراجعون

Contribution (Comment Meta):
  _workpress_contribution_type   → النوع (code/review/solution/decision/progress/feedback)
  _workpress_payload             → البيانات الإضافية المهيكلة
  _workpress_attachment_ids      → معرفات المرفقات
  _workpress_is_accepted         → هل معتمدة كمعرفة؟ (0/1)
  _workpress_accepted_by         → من اعتمدها (user ID)
  _workpress_accepted_at         → متى اعتمدت (UTC ISO-8601)
```

**القاعدة**: التواريخ UTC / ISO-8601، المعرّفات integers، الحالة والأولوية في meta فقط.

---

# الفصل الثالث: الحوكمة وهرم المواطنة والأمان

## 3.1 هرم المواطنة الرباعي (4-Tier Citizenship Hierarchy)

| المستوى | الدور | القدرة الأساسية | الواجهة | التوجيه |
|---|---|---|---|---|
| 1. مدير عام | `administrator` | كافة الصلاحيات + تجاوز إداري | CoWorkPress + WP Admin | لوحة التحكم |
| 2. فريق فني | `editor/author/contributor` | `access_workpress_admin` | غرفة عمليات CoWorkPress | مساحة العمل |
| 3. مستفيد | `workpress_client` | `access_workpress_portal` | بوابة `/portal/` | توجيه تلقائي للبوابة |
| 4. مشترك | `subscriber` | `read` فقط | الموقع العام | **يبقى في الموقع** |

## 3.2 معادلة التفويض الثلاثية

```
Authorization = Access(الوصول) ∧ Visibility(الظهور/العضوية) ∧ Action(الأفعال)
```

- **Access**: أي واجهة يدخلها (`access_workpress_admin` أو `access_workpress_portal`)
- **Visibility**: ما يراه (محكوم بعضوية المشروع `_workpress_member_{user_id}`)
- **Action**: ما يفعله (محكوم بالقدرات الذرية في 8 حزم)

## 3.3 قواعد عزل القوائم في الواجهة (UI Scope Rules)

- **قوائم الكوادر الفنية (Staff Selectors)**: تُفلتر دائماً بـ `isStaffUser(user)`.
- يُمنع ظهور `subscriber` أو `workpress_client` في:
  - إضافة أعضاء المشروع (`ProjectMembersModal.js`)
  - تكليف المهام (`TaskDetailPage.js`, `TaskAssignmentModal.js`)
  - تعيين قادة المشاريع (`RequestsPage.js`)
  - فلتر المكلفين (`FilterBar.js`)

## 3.4 منظومة التجميد والإذابة (Hibernation/Freeze Engine)

- عند تحويل مستفيد → مشترك: `WorkPress_Hibernation_Service` يجمّد مشاريعه (`frozen`).
- عند إعادة الترقية: تُستعاد المشاريع تلقائياً من `_workpress_pre_freeze_status`.

---

# الفصل الرابع: سجل الخدمات ونقاط الـ REST API

## 4.1 سجل الخدمات (Service Registry)

| الخدمة | المسؤولية | الملف |
|---|---|---|
| `ProjectService` | دورة المشروع وبياناته | `services/class-workpress-project-service.php` |
| `TaskService` | دورة المهمة وحالتها | `services/class-workpress-task-service.php` |
| `ContributionService` | الأدلة والتعليقات والاعتماد | `services/class-workpress-contribution-service.php` |
| `MembershipService` | العضوية وأدوار المشروع | `services/class-workpress-membership-service.php` |
| `AssignmentService` | التكليفات والمسؤوليات | `services/class-workpress-assignment-service.php` |
| `PermissionService` | قرار التفويض الثلاثي | `services/class-workpress-permission-service.php` |
| `AuthService` | المصادقة والتوجيه وحراسة البوابة | `services/class-workpress-auth-service.php` |
| `KnowledgeService` | المعرفة المستنتجة من الأدلة المعتمدة | `services/class-workpress-knowledge-service.php` |
| `WorkflowService` | الحالات والانتقالات المسموحة | `services/class-workpress-workflow-service.php` |
| `PortalService` | بوابة المستفيد المعزولة والمخرجات | `services/class-workpress-portal-service.php` |
| `WebhookService` | خطافات الويب والتكاملات الخارجية | `services/class-workpress-webhook-service.php` |
| `HibernationService` | تجميد/إذابة مشاريع المستفيدين | `services/class-workpress-hibernation-service.php` |
| `ReportService` | التقارير التنفيذية والإحصائيات | `services/class-workpress-report-service.php` |
| `ExportService` | تصدير البيانات | `services/class-workpress-export-service.php` |
| `SecurityService` | الأمان والتعقيم | `services/class-workpress-security-service.php` |
| `CapabilitiesService` | إدارة القدرات والأدوار | `services/class-workpress-capabilities-service.php` |
| `TemplateService` | قوالب المشاريع | `services/class-workpress-template-service.php` |

## 4.2 نقاط الـ REST API الأساسية

```
/workpress/v1/projects                    → قائمة المشاريع
/workpress/v1/projects/{id}/members       → أعضاء المشروع
/workpress/v1/tasks                       → قائمة المهام
/workpress/v1/tasks/{id}                  → تفاصيل المهمة
/workpress/v1/tasks/{id}/state            → تغيير الحالة
/workpress/v1/tasks/{id}/assignment       → التكليف
/workpress/v1/tasks/{id}/contributions    → مساهمات المهمة
/workpress/v1/contributions/{id}/accept   → اعتماد المساهمة كمعرفة
/workpress/v1/tasks/{id}/close            → إغلاق المهمة
/workpress/v1/tasks/{id}/reopen           → إعادة فتح المهمة
/workpress/v1/knowledge                   → قاعدة المعرفة
/workpress/v1/portal/my-projects          → مشاريع المستفيد
/workpress/v1/portal/projects/{id}/deliverables → المخرجات المعتمدة
/workpress/v1/portal/feedback             → ملاحظات المستفيد
/workpress/v1/portal/refresh-nonce        → تجديد Nonce البوابة
/workpress/v1/portal/notifications        → تيار الإشعارات المباشرة للبوابة
/workpress/v1/portal/notifications/{id}/read → تحديد إشعار كمقروء
/workpress/v1/portal/notifications/read-all  → تحديد كافة الإشعارات كمقروءة
```

## 4.3 Hooks العامة للتكامل

```php
workpress_project_membership_changed   // تغيير عضوية مشروع
workpress_task_assigned                // تكليف مهمة
workpress_task_state_changed           // تغيير حالة مهمة
workpress_contribution_created         // إنشاء مساهمة
workpress_contribution_accepted        // اعتماد مساهمة كمعرفة
workpress_task_closed                  // إغلاق مهمة
```

---

# الفصل الخامس: خريطة الملفات والمكونات

## 5.1 البنية الخلفية (PHP Backend)

```
includes/
├── core/                           # الكيانات الأساسية والسجلات
│   └── class-workpress-capabilities-registry.php  # سجل القدرات الذرية (8 حزم)
├── services/                       # طبقة الخدمات (17 خدمة)
├── api/                            # REST API Controllers
├── hooks/                          # نقاط التمديد العامة
├── admin/                          # صفحات الإدارة والإعدادات
├── modules/                        # وحدات اختيارية
└── office-packs/                   # حزم القطاعات التخصصية
```

## 5.2 الواجهة الأمامية (React SPA — No Build)

```
assets/src/
├── App.js                          # التوجيه الرئيسي (Hash Router)
├── index.js                        # نقطة الدخول
├── api/                            # عملاء REST API (fetch wrappers)
├── auth/                           # حراسة المصادقة والتوجيه
├── utils/
│   ├── html.js                     # htm/preact tagged templates
│   ├── hooks.js                    # React hooks مخصصة
│   ├── toast.js                    # محرك الإشعارات والقرارات المركزي
│   └── sound.js                    # محرك الصوت والتغذية الراجعة
├── css/
│   └── admin.css                   # نظام التصميم الكامل + design tokens
├── components/ (35 مكون)
│   ├── TaskCard.js                 # بطاقة المهمة في الكانبان
│   ├── GanttChart.js               # مخطط جانت التفاعلي (4 مقاييس)
│   ├── DatePicker.js               # منتقي التاريخ والوقت المخصص
│   ├── FilterBar.js                # شريط الفلترة متعدد الأبعاد
│   ├── TaskModal.js                # نافذة إنشاء/تعديل المهمة
│   ├── ContributionModal.js        # نافذة إضافة المساهمة
│   ├── ProjectModal.js             # نافذة إنشاء/تعديل المشروع
│   ├── TaskChecklist.js            # قوائم الفحص الذرية
│   ├── TaskTimeTracker.js          # متتبع الوقت وساعات العمل
│   ├── TaskDocuments.js            # مرفقات ومستندات المهمة
│   ├── AvatarStack.js              # مكدس صور البروفايلات
│   ├── PriorityBadge.js            # شارة الأولوية
│   ├── MemberSelect.js             # منتقي الأعضاء الذكي
│   ├── CustomSelect.js             # قائمة منسدلة مخصصة
│   ├── WebhooksSettingsTab.js      # إعدادات خطافات الويب
│   ├── IntakeFormsBuilderTab.js    # بناء نماذج الاستقبال
│   └── ...                         # (35 مكون إجمالاً)
├── pages/ (12 صفحة)
│   ├── DashboardPage.js            # لوحة القيادة الرئيسية
│   ├── KanbanPage.js               # لوحة كانبان المهام
│   ├── GanttPage.js                # صفحة مخطط جانت
│   ├── ProjectsPage.js             # قائمة المشاريع
│   ├── ProjectDetailPage.js        # تفاصيل المشروع الواحد
│   ├── TaskDetailPage.js           # تفاصيل المهمة الواحدة
│   ├── ContributionsPage.js        # سجل المساهمات
│   ├── KnowledgePage.js            # قاعدة المعرفة
│   ├── RequestsPage.js             # وارد الطلبات واستوديو الفرز
│   ├── IntakeFormsPage.js          # نماذج الاستقبال
│   ├── ReportsPage.js              # التقارير التنفيذية
│   └── SettingsPage.js             # الإعدادات الشاملة
└── portal/                         # بوابة المستفيدين المستقلة
```

---

# الفصل السادس: نظام التصميم والتوكنات (Design System Tokens)

## 6.1 كلاسات CSS المؤسسية (في `admin.css`)

| الكلاس | الوظيفة | المقاسات |
|---|---|---|
| `.wp-icon-btn` | زر أيقوني مربع حاد | 28×28px قياسي |
| `.wp-icon-btn.is-dense` | زر أيقوني مصغّر | 22×22px |
| `.wp-icon-btn.is-small` | زر أيقوني صغير | 26×26px |
| `.wp-icon-btn.is-medium` | زر أيقوني متوسط | 32×32px |
| `.wp-icon-btn.is-dark` | خلفية داكنة `#0f172a` | — |
| `.wp-icon-btn.is-danger` | خلفية حمراء | — |
| `.wp-icon-btn.is-primary` | خلفية أساسية `#2563eb` | — |
| `.wp-btn-group-tight` | مجموعة أزرار متراصة بدون فواصل | ارتفاع 28px |
| `.wp-dense-chip` | شريحة معلوماتية مدمجة | ارتفاع 20px, خط 0.68rem |
| `.wp-dense-chip.is-success` | شريحة خضراء (مكتملة) | — |
| `.wp-dense-chip.is-info` | شريحة زرقاء (معلوماتية) | — |
| `.wp-dense-chip.is-warning` | شريحة برتقالية (قيد الإنجاز) | — |
| `.wp-dense-chip.is-danger` | شريحة حمراء (تحذيرية) | — |
| `[data-wp-tooltip]` | تلميح فوري CSS عند التمرير | — |

## 6.2 نظام الألوان المعتمد لأعمدة الكانبان

| الحالة | اللون الأساسي | خلفية العمود | خلفية الترويسة | لون الحد |
|---|---|---|---|---|
| جديدة | `#3b82f6` | `#f8fafc` | `#f1f5f9` | `#e2e8f0` |
| مسندة | `#0284c7` | `#f0f9ff` | `#e0f2fe` | `#bae6fd` |
| قيد الإنجاز | `#d97706` | `#fffbeb` | `#fef3c7` | `#fde68a` |
| مكتملة | `#059669` | `#ecfdf5` | `#d1fae5` | `#a7f3d0` |

## 6.3 ألوان الأجواء الغامرة لمنظومة التوست

| النوع | خلفية الحاوية | شريط التقدم |
|---|---|---|
| Success | `#064e3b` Deep Emerald | `#34d399` |
| Error | `#7f1d1d` Deep Crimson | `#f87171` |
| Warning | `#78350f` Deep Amber | `#fbbf24` |
| Info | `#0c4a6e` Deep Navy | `#38bdf8` |
| Decision | `#1e1b4b` Royal Indigo | `#818cf8` |

---

# الفصل السابع: دورة الحياة والتحول المعرفي

## 7.1 سلسلة الاكتمال المتسلسل

```
اعتماد مساهمة كحل → إغلاق المهمة تلقائياً → فحص المهام المتبقية →
  (إذا 0 مهام متبقية) → إغلاق المشروع تلقائياً →
  دخول الحل المعتمد فوراً في أرشيف المعرفة
```

## 7.2 قواعد حوكمة الاعتماد

1. زر الاعتماد يعمل حصرياً لـ: المدير العام أو مدير المشروع المعين.
2. المساهمة المعتمدة تُقفل من التعديل (Immutability).
3. عند إلغاء الاعتماد: المهمة → «قيد المراجعة»، المساهمة تُسحب من المعرفة، المشروع → «نشط».
4. لا تقبل المهمة مساهمات بعد `close`، وتقبلها بعد `reopen` المخول.

---

# الفصل الثامن: محرك خطافات الويب والتكاملات

## 8.1 الأحداث المدعومة

```
workpress.task_created          → إنشاء مهمة جديدة
workpress.solution_accepted     → اعتماد حل كمعرفة
workpress.request_submitted     → تقديم طلب جديد
workpress.project_completed     → اكتمال مشروع
workpress.task_assigned         → تكليف مهمة
workpress.deliverable_signed    → مصادقة استلام مخرجات
```

## 8.2 الأمان (HMAC-SHA256 Signatures)

كل طلب يحمل توقيعاً رقمياً:
```
X-WorkPress-Signature: sha256=HMAC_SHA256(Raw_Body, Secret)
X-WorkPress-Event: workpress.solution_accepted
X-WorkPress-Timestamp: Unix_Epoch
```

## 8.3 القوالب الجاهزة (Presets)

Generic JSON, Discord Embeds, Slack Blocks, Microsoft Teams Adaptive Cards.

---

# الفصل التاسع: البوابة المستقلة للمستفيدين (Portal)

## 9.1 العزل الأمني الكامل

- البوابة تعمل عبر `template_include` ومسار `/portal/` المعزول.
- **صفر تداخل CSS** مع الثيم العام (Standalone Virtual Template Canvas).
- حارس التوجيه: المستفيد يُحوّل تلقائياً من `/wp-admin/` إلى `/portal/`.
- المشترك العادي يرى كارت ترحيبي ودود في `/portal/` (ليس خطأ 403).

## 9.2 تفاعلات المستفيد الموثقة (Two-Way Synapses)

كل تفاعل من المستفيد يُسجل كـ Contribution:
- `client_feedback`: استفسار وملاحظة.
- `client_revision_request`: طلب تعديل مسبب.
- `client_signoff`: مصادقة وتوقيع رسمي على الاستلام.

---

# الفصل العاشر: قائمة فحص الجودة والمراجعة

## 10.1 قبل كل Commit

- [ ] `node -c <file.js>` → خلو من أخطاء Syntax.
- [ ] `style=${{ }}` ككائنات وليس سلاسل نصية.
- [ ] `border-radius: 0` على كل عنصر جديد.
- [ ] `font-family: 'Cairo'` على كل نص جديد.
- [ ] أرقام غربية (`1,2,3`) في كل جدول وعداد وتقويم.
- [ ] أيقونات `dashicons-*` بدلاً من Emojis.
- [ ] `current_user_can()` قبل كل عملية حساسة.
- [ ] `wp_verify_nonce()` في كل REST endpoint.
- [ ] `sanitize_text_field()` / `absint()` لكل مدخل.
- [ ] العمليات تمر عبر طبقة الخدمات وليس مباشرة للجداول.
- [ ] كل تغيير حالة يُسجل كـ Contribution في سجل التدقيق.
