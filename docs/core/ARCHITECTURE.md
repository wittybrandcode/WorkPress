# WorkPress — المعمارية التقنية v2

## القرار المعماري

WorkPress هو **Organizational Memory Engine**: الأشخاص ينشئون العمل، والعمل يولّد معرفة، والمعرفة تصبح ذاكرة المؤسسة. Project وTask وContribution هياكل تنظّم العمل داخل هذه الفلسفة، وليست تعريف المنتج. [FIRST_PRINCIPLES.md](FIRST_PRINCIPLES.md) هو المرجع الحاكم لهذه المعمارية.

WorkPress مبني بالكامل فوق الكيانات الأصلية في WordPress؛ وليس نظامًا موازيًا له. WordPress Data Model هو مصدر الحقيقة، ولا توجد طبقة صلاحيات بديلة.

```text
WordPress Platform
  └─ WorkPress Core
       └─ CoWorkPress Experience
            └─ Office Packs
                 └─ Optional Modules
```

### 3. CoWorkPress (Experience Layer)
**المسؤوليات:**
- تقديم واجهة مستخدم احترافية داخل لوحة تحكم WordPress (`CoWorkPress Plaza`).
- تقديم **بوابة ومساحة العميل المستقلة بالواجهة الأمامية (`Standalone Virtual Template Canvas`)** عبر خطاف `template_include` ومسار `/portal/` المعزول، دون استدعاء هيدر/فوتر الثيم العام لمنع أي تداخل CSS (0% CSS Bleed)، مع دعم التوجيه الذكي للمستخدمين عبر `login_redirect` بناءً على قدرة `access_workpress_client_portal`.

لا يجوز أن تتجاوز طبقة ما الطبقة التي تحتها: Modules لا تعتمد على Office Pack، وOffice Packs لا تعدل Core، وواجهة CoWorkPress لا تقرر صلاحيات أو منطق أعمال.

## مسؤوليات الطبقات

| طبقة | المسؤولية | ممنوع عليها |
| --- | --- | --- |
| WordPress | authentication، users، roles/capabilities، media، editor، revisions، REST، database، search | منطق العمل |
| WorkPress Core | projects، tasks، membership، assignment، contributions، timeline، knowledge وقواعد النزاهة | تجربة خاصة بمجال معين |
| CoWorkPress | workspace، navigation، dashboards، views، terminology وUX | تعديل البيانات مباشرة أو قواعد الأعمال |
| Office Pack | **Domain Interpretation**: vocabulary، dashboards، project templates، workflow definitions، layouts وعروض متخصصة | Theme أو Module أو تعديل Core/schema الأساسية |
| Module | calendar، board، reports، notifications، AI وغيرها عبر API/hooks | افتراض تفاصيل Office Pack أو كتابة منطق في Core |

## نموذج المجال والتخزين

| مفهوم المجال | تمثيله في WordPress | التخزين |
| --- | --- | --- |
| Project | `workpress_project` taxonomy | term + term meta |
| Task | `work_item` CPT | post + post meta |
| Contribution / event | comment | comment + comment meta |
| Person | WP user | users/usermeta |
| Membership | علاقة مستخدم/مشروع | term meta |
| Assignment الحالي | مسؤولية المهمة | post meta |
| Knowledge | ناتج query للمساهمات المعتمدة | لا كيان مستقل |

### العقود الأساسية للـ meta

- Project: `_workpress_member_{user_id}` (project role)، `_workpress_project_status`، `_workpress_cover_id`، `_workpress_start_at`، `_workpress_due_at`.
- Task: `_workpress_status`، `_workpress_priority`، `_workpress_due_at`، `_workpress_assignee_ids`، `_workpress_reviewer_ids`.
- Contribution: `_workpress_contribution_type`، `_workpress_payload`، `_workpress_attachment_ids`، `_workpress_is_accepted`، `_workpress_accepted_by`، `_workpress_accepted_at`.

التواريخ UTC / ISO-8601 والمعرفات integers. الحالة والأولوية تحفظان في meta كمصدر حقيقة وحيد؛ لا تكرارهما في taxonomy. يمكن أن تكون labels تصنيفًا اختياريًا، أما department فهو مسؤولية Office Pack عند الحاجة.

## التفويض والرؤية وحوكمة المواطنة (Governance & Authorization)

يعتمد WorkPress نموذج **التفويض الثلاثي الصارم (Tri-Partite Authorization Model)** و **هرم المواطنة الرباعي (4-Tier Citizenship Hierarchy)** لضمان عزل الفضاءات وتوافق تام مع فلسفة ووردبريس:

$$\text{Authorization Decision} = \text{Access (صلاحية الوصول)} \land \text{Visibility (صلاحية الظهور)} \land \text{Action (صلاحية الأفعال)}$$

### 1. هرم المواطنة الرباعي (4-Tier Citizen Hierarchy)

1. **المدير العام (`administrator`)**: كامل الصلاحيات الإدارية، حوكمة مصفوفة الأدوار، الفرز العام، وإعدادات النظام.
2. **الفريق الفني والمنفذون (`editor`, `author`, `contributor`, Custom Staff)**: يملكون صلاحية الوصول إلى غرفة عمليات CoWorkPress (`access_workpress_admin`) والكانبان وإنجاز المهام.
3. **المستفيدون وأصحاب الطلبات الموسومون (`workpress_client`)**: يملكون صلاحية البوابة المستقلة (`access_workpress_portal`) حصرياً، وتُحجب عنهم لوحة الإدارة (`/wp-admin/`) بحارس التوجيه التلقائي، مع احتفاظهم بحق تصفح الموقع العام كأي مستخدم.
4. **المشتركون والمتابعون العاديون (`subscriber`)**: مواطنون عاديون في ووردبريس يقرؤون ويعلقون في الموقع العام دون أي تحويل للبوابة أو مساحة العمل.

### 2. محددات القرار المعماري

1. **صلاحية الوصول (Access & Perimeter)**: تحدد الواجهة المسموح بدخولها (`access_workpress_admin` لغرفة العمليات، و `access_workpress_portal` للبوابة المستقلة).
2. **صلاحية الظهور (Visibility & Membership)**: تحدد ما يراه المستخدم؛ محكومة حصرياً بعضوية المشروع (`_workpress_member_{user_id}`). لا يرى المستخدم إلا مشاريعه المصرح بها.
3. **صلاحية الأفعال (Action & Decision)**: تحدد القرارات المسموح باتخاذها (إنشاء، تعديل، فرز، إسناد، اعتماد حل، مصادقة استلام).
4. **التكليف (Assignment)**: يحدد المسؤولية التشغيلية الآنية فقط، ولا يمنح صلاحية نظامية أو عضوية.

تقرر خدمات Core التفويض قبل أي استعلام أو تعديل: `capability + membership + project role (+ assignment عند الحاجة)`. يملك المدير الإداري ذو capability صريحة مسار تجاوز موثقًا فقط.

## دورة الحياة والتاريخ

كل تغيير أعمال ينشئ Contribution غير قابل للمحو منطقيًا: تكليف، تقدم، مراجعة، قرار، قبول، رفض، نقل، إغلاق وإعادة فتح. قبول مساهمة لا يغلق المهمة تلقائيًا، ويمكن قبول أكثر من مساهمة. حدث `close` فقط يقفل المساهمات؛ و`reopen` يعيد فتحها وفق التفويض.

## Service Registry

قواعد الأعمال ملك للخدمات فقط. لا تلمس REST API أو CoWorkPress أو Office Packs أو Modules posts أو terms أو comments أو meta مباشرة؛ بل تستدعي الخدمة المناسبة عبر العقود العامة.

| Service | المسؤولية |
| --- | --- |
| `ProjectService` | دورة المشروع وبياناته |
| `TemplateService` | مفهوم Project Template وتطبيق القوالب |
| `WorkflowService` | states وallowed transitions فقط |
| `MembershipService` | العضوية وأدوار المشروع والرؤية |
| `PermissionService` | قرار `capability + membership + project role (+ assignment)` |
| `TaskService` | دورة المهمة وحالتها الحالية |
| `AssignmentService` | المسؤوليات الحالية وأحداث التكليف |
| `ContributionService` | الأدلة والـ timeline والقبول ومساهمات العميل (`client_feedback`) |
| `KnowledgeService` | المعرفة المستنتجة من الأدلة المقبولة ضمن الرؤية |
| `PortalService` | إدارة بوابة العميل المعزولة، التوجيه الذكي، تصفية المخرجات المعتمدة |

## عقود التكامل

Core هو صاحب القرار ويوفر REST وhooks، لا وصولًا مباشرًا للواجهة إلى الجداول:

- `/workpress/v1/projects` و`/projects/{id}/members`
- `/workpress/v1/tasks` و`/tasks/{id}` و`/tasks/{id}/state` و`/tasks/{id}/assignment`
- `/workpress/v1/tasks/{id}/contributions` و`/contributions/{id}/accept`
- `/workpress/v1/tasks/{id}/close` و`/tasks/{id}/reopen`
- `/workpress/v1/knowledge` و`/views/board`
- `/workpress/v1/portal/my-projects` و`/portal/projects/{id}/deliverables` و`/portal/feedback` و`/portal/refresh-nonce`

Hooks العامة: `workpress_project_membership_changed`، `workpress_task_assigned`، `workpress_task_state_changed`، `workpress_contribution_created`، `workpress_contribution_accepted`، `workpress_task_closed`.

## البنية المقترحة

```text
workpress/
├─ includes/
│  ├─ domain/        # Projects, Tasks, Membership, Assignment, Contributions
│  ├─ services/      # authorization, timeline, knowledge
│  ├─ rest/          # controllers وrequest/response mappers
│  ├─ hooks/         # public extension points
│  └─ class-workpress-*.php
├─ templates/        # App Shell فقط، بلا business logic
├─ assets/           # CoWorkPress React client
├─ office-packs/     # أمثلة/حزم اختيارية، خارج Core
└─ modules/          # إضافات اختيارية، خارج Core
```

## متطلبات الجودة

- كل endpoint يفحص الرؤية قبل جلب البيانات؛ لا تسريب بين المشاريع.
- التحقق والتعقيم في Core، وnonce/cookie أو Application Passwords للمصادقة.
- pagination، schemas، وأخطاء REST موحدة.
- cache آمن مع invalidation عند تغيير العضوية، ومؤشرات أداء أقل من 150ms لطلبات MVP في بيانات الاختبار.
- عند الحاجة للأداء، تكون Index Tables read models اختيارية وقابلة لإعادة البناء من كيانات WordPress؛ لا تصبح مصدر الحقيقة أو مسار كتابة مستقلًا.
