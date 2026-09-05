# WorkPress — المعمارية التقنية والهندسة المؤسسية (v1.0.0-Stable)

## 🏛️ القرار المعماري

WorkPress هو **محرك الذاكرة المؤسسية (Organizational Memory Engine)**: الأشخاص ينشئون العمل، والعمل يولّد معرفة، والمعرفة تصبح ذاكرة المؤسسة الدائمة. 
Project و Task و Contribution هياكل تنظّم العمل داخل هذه الفلسفة وليست مجرد جداول تشغيلية. 
[FIRST_PRINCIPLES.md](FIRST_PRINCIPLES.md) و [دستور وركبرس](../../.agents/rules/workpress-constitution.md) هما المرجعان الحاكمان لهذه المعمارية.

WorkPress مبني بالكامل فوق الكيانات الأصلية في WordPress؛ وليس نظامًا موازيًا له. WordPress Data Model هو مصدر الحقيقة الوحيد (Zero Custom Tables)، ولا توجد طبقة صلاحيات بديلة.

```text
WordPress Platform (Source of Truth)
  └─ WorkPress Core Services (18 Central Services)
       ├─ CoWorkPress Operation Plaza (Staff & Admin SPA - 136 ES Modules)
       └─ Standalone Client Portal (/portal/ - Isolated Virtual Canvas)
            ├─ Office Packs (Domain Interpretation)
            └─ Optional Modules & Webhook Integrations
```

---

## 🧭 مسؤوليات الطبقات

| طبقة | المسؤولية | الممنوعات الصارمة |
| --- | --- | --- |
| **WordPress Platform** | المصادقة (Auth)، المستخدمون (Users)، الأدوار والقدرات، الوسائط، المراجعات، REST API | منطق الأعمال المخصص |
| **WorkPress Core** | طبقة الخدمات الـ 18 (Projects, Tasks, Membership, Assignment, Contributions, Timeline, Knowledge, Security, Broadcasts) | تجربة خاصة بمجال معين |
| **CoWorkPress Plaza** | غرفة العمليات، الكانبان، مخطط جانت، استوديو الفرز، النشريات، وتتبع الوقت (136 موديول معياري) | استعلام `$wpdb` أو تعديل البيانات مباشرة |
| **Standalone Portal** | بوابة المستفيد المستقلة (`/portal/`)، استوديو الطلبات، خزانة المخرجات، والتوقيع الرقمي المشفر بـ SHA-256 | اختراق عزل CSS أو تعديل صلاحيات الكانبان |
| **Office Pack** | التفسير التخصصي للقطاعات: القوالب، المفردات، والمخططات | تعديل جداول Core الأساسية |
| **Module** | التقويم، الإشعارات، الذكاء الاصطناعي، وخطافات الويب عبر API/hooks | كتابة منطق مباشر في Core |

---

## 🗄️ نموذج المجال والتخزين (Zero Custom Tables)

| مفهوم المجال في WorkPress | تمثيله في WordPress | طريقة التخزين الأصلية |
| --- | --- | --- |
| **المشروع (Project)** | Taxonomy (`workpress_project`) | Term + Term Meta |
| **المهمة (Task)** | Custom Post Type (`work_item`) | Post + Post Meta |
| **المساهمة والدليل (Contribution)** | Comment (`wp_contribution`) | Comment + Comment Meta |
| **الشخص (Person)** | WP User | `WP_User` + User Meta |
| **العضوية (Membership)** | علاقة مستخدم/مشروع | Term Meta (`_workpress_member_{user_id}`) |
| **التكليف الحالي (Assignment)** | مسؤولية المهمة الآنية | Post Meta (`_workpress_assignee_ids`) |
| **المعرفة المؤسسية (Knowledge)** | Read Model للمساهمات المعتمدة | ناتج استعلام المساهمات المعتمدة (لا كيان مستقل) |

---

## 🛡️ هرم المواطنة الرباعي ونموذج التفويض الثلاثي

$$\text{Authorization Decision} = \text{Access (صلاحية الوصول)} \land \text{Visibility (صلاحية الظهور)} \land \text{Action (صلاحية الأفعال)}$$

```
Level 1: المدير العام (administrator)           → تجاوز إداري وحوكمة كاملة
Level 2: الكوادر الفنية (Staff & Specialists)    → وصول لغرفة العمليات CoWorkPress Plaza
Level 3: المستفيدون المعتمدون (workpress_client) → بوابة /portal/ المعزولة والتوقيع الرقمي
Level 4: المشتركون العاديون (subscriber)        → الموقع العام دون أي توجيه إداري
```

---

## ⚙️ سجل الخدمات المركزية (Core Service Registry - 17 Services)

قواعد الأعمال محصورة بالكامل داخل طبقة الخدمات (`includes/services/`)، ولا يُسمح للـ REST API أو الواجهات بالتعامل المباشر مع قاعدة البيانات:

1. `WorkPress_Project_Service`: دورة حياة وبيانات المشاريع.
2. `WorkPress_Task_Service`: دورة حياة المهام وحالاتها وانتقالاتها.
3. `WorkPress_Contribution_Service`: تسجيل الأدلة والتحكيم ومساهمات المستفيدين.
4. `WorkPress_Membership_Service`: إدارة العضوية ونطاق الرؤية والأدوار.
5. `WorkPress_Assignment_Service`: تكليف المهام وتعيين المسؤوليات.
6. `WorkPress_Permission_Service`: قرار التفويض الثلاثي ومصفوفة القدرات.
7. `WorkPress_Auth_Service`: المصادقة، وحراسة البوابة، والتوجيه التلقائي.
8. `WorkPress_Knowledge_Service`: استخلاص الذاكرة والمعرفة من الأدلة المعتمدة.
9. `WorkPress_Workflow_Service`: الحالات والانتقالات المسموحة.
10. `WorkPress_Portal_Service`: إدارة بوابة المستفيد وعزل مسار `/portal/`.
11. `WorkPress_Portal_Signoff_Service`: محرك التوقيع الرقمي المشفر بـ SHA-256 وشهادات الاستلام.
12. `WorkPress_Webhook_Service`: خطافات الويب والتكامل مع Discord و Slack و Teams.
13. `WorkPress_Hibernation_Service`: تجميد وإذابة مشاريع المستفيدين تلقائياً عند تغيير الرتب.
14. `WorkPress_Report_Service`: توليد التقارير التنفيذية وكتب المعرفة Markdown.
15. `WorkPress_Export_Service`: تصدير البيانات الشامل.
16. `WorkPress_Security_Service`: الحماية والتعقيم والتحقق من Nonce.
17. `WorkPress_Capabilities_Service`: إدارة مصفوفة الحزم الثمانية للقدرات الذرية.

---

## 🧩 معمارية الواجهة الأمامية (Modular SPA Architecture - 111 Modules)

تم تفكيك الواجهات بالكامل إلى **111 موديولاً معيارياً عالي التماسك (High Cohesion, Low Coupling)**:
- **نواة التشغيل والتوجيه**: `assets/src/App.js` مع Hash Router.
- **غرفة عمليات CoWorkPress**: `assets/src/pages/` (12 صفحة) و `assets/src/components/` (35 مكوناً).
- **بوابة المستفيد المستقلة**: `assets/src/portal/` (10 وحدات تخصصية) مع CSS معزول بالكامل في `assets/css/portal/`.
- **نظام التصميم والدستور البصري**: زوايا حادة 0px (`border-radius: 0 !important;`)، خط كايرو الموحد (`Cairo`)، صفر إيموجي، وألوان مؤسسية عالية التباين.

---
*هذه الوثيقة تمثل المعمارية التشغيلية والبرمجية المعتمدة لنظام وركبرس v2.2.2.*
