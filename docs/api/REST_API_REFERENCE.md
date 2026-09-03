# 🔌 مرجع واجهة برمجة التطبيقات (WorkPress REST API Reference)
## Complete REST API Endpoints, Authentication, Permissions & Data Schemas

> **نوع الوثيقة:** المرجع البرمجي والتقني الشامل لواجهة برمجة التطبيقات REST API  
> **الإصدار المعتمد:** WorkPress v2.3.0-Stable  
> **المسار الأساسي (Base URL):** `/wp-json/workpress/v1/`  
> **المرجع الحاكم:** [ARCHITECTURE.md](../core/ARCHITECTURE.md) | [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md)

---

## 🔐 1. المصادقة والترويسات الأمنية (Authentication & Headers)

تعتمد واجهة WorkPress REST API على معايير الأمان القياسية في ووردبريس وتتطلب الترويسات التالية في كافة الطلبات:

```http
Content-Type: application/json
X-WP-Nonce: [WP_REST_NONCE]
```

### رموز الحالة والاستجابات القياسية (HTTP Status Codes):
* `200 OK` / `201 Created`: نجاح العملية وإرجاع البيانات المهيكلة.
* `400 Bad Request`: معاملات ناقصة أو غير صالحة، مع رسالة خطأ واضحة باللغة العربية والإنجليزية.
* `401 Unauthorized`: المستخدم غير مسجل الدخول أو الـ Nonce منتهي الصلاحية.
* `403 Forbidden`: المستخدم لا يمتلك الصلاحية الذرية (`GlobalCap`) أو ليس عضواً في المشروع (`ProjectMembership`).
* `404 Not Found`: الكيان المطلوب (مشروع، مهمة، مساهمة) غير موجود أو محذوف.

---

## 📂 2. مسارات المشاريع وإدارتها (`/projects`)

### `GET /projects`
* **الوصف:** استرجاع قائمة المشاريع المصرح للمستخدم بالاطلاع عليها وفق معادلة التفويض الثلاثي.
* **الصلاحية المطلوبة:** `read_workpress_projects` أو عضوية صريحة في المشروع.
* **المعاملات الاختيارية (Query Params):**
  * `status` (string): `active` | `archived` | `frozen` | `completed` | `all`
  * `search` (string): كلمة مفتاحية للبحث في الاسم والوصف.
* **نموذج الاستجابة (Response):**
```json
[
  {
    "id": 12,
    "name": "مشروع التحول الرقمي",
    "slug": "digital-transformation",
    "prefix": "DIG",
    "status": "active",
    "description": "مشروع حوسبة العمليات الإدارية",
    "lead_id": 1,
    "lead_name": "المدير العام",
    "progress": 65,
    "total_tasks": 20,
    "completed_tasks": 13,
    "members_count": 5,
    "created_at": "2026-08-01 10:00:00",
    "due_at": "2026-09-15 18:00:00"
  }
]
```

### `POST /projects`
* **الوصف:** إنشاء مشروع جديد وتوليد الرمز المرجعي الفريد (`prefix`).
* **الصلاحية المطلوبة:** `create_workpress_projects`
* **جسم الطلب (Request Body):**
```json
{
  "name": "بناء البوابة السحابية",
  "prefix": "CLD",
  "description": "تطوير البنية السحابية",
  "lead_id": 1,
  "due_at": "2026-10-01"
}
```

### `GET /projects/:id`
* **الوصف:** جلب تفاصيل مشروع مفرد بكافة مؤشرات الأداء، الأعضاء، وحالة التقدم.

### `PATCH /projects/:id`
* **الوصف:** تحديث بيانات المشروع (الاسم، الوصف، قائد المشروع، تاريخ الاستحقاق، الحالة).
* **الصلاحية المطلوبة:** `edit_workpress_projects` أو أن يكون المستخدم قائد المشروع المعين (`Project Lead`).

### `DELETE /projects/:id`
* **الوصف:** نقل المشروع إلى سلة المهملات (`Trash`) أو حذفه نهائياً للمدير.
* **الصلاحية المطلوبة:** `delete_workpress_projects`

### `GET /projects/:id/members`
* **الوصف:** جلب قائمة الأعضاء والمنفذين المشاركين في المشروع مع رتبهم الداخلية (`lead`, `manager`, `specialist`, `viewer`).

### `POST /projects/:id/members`
* **الوصف:** إضافة أو تعديل دور عضو داخل المشروع.
* **جسم الطلب:** `{"user_id": 5, "role": "specialist"}`

---

## 📋 3. مسارات المهام والكانبان (`/tasks`)

### `GET /tasks`
* **الوصف:** استرجاع قائمة المهام مع إمكانية التصفية بالمشروع أو الحالة أو المسؤول.
* **المعاملات (Query Params):**
  * `project_id` (int): تصفية بـ Term ID لمشروع معين.
  * `status` (string): `backlog` | `in_progress` | `under_review` | `completed`
  * `assignee_id` (int): تصفية بالمعين له المهمة.
* **نموذج الاستجابة:**
```json
[
  {
    "id": 105,
    "ref_key": "DIG-105",
    "title": "تجهيز خادم Redis والتخزين المؤقت",
    "status": "in_progress",
    "priority": "high",
    "project_id": 12,
    "project_name": "مشروع التحول الرقمي",
    "project_prefix": "DIG",
    "assignees": [
      { "id": 5, "display_name": "ديفيد المهندس", "avatar": "https://..." }
    ],
    "estimated_hours": 8.0,
    "logged_hours": 3.5,
    "checklists_count": 4,
    "checklists_completed": 3,
    "attachments_count": 2,
    "due_at": "2026-09-05"
  }
]
```

### `POST /tasks`
* **الوصف:** إنشاء مهمة جديدة في الكانبان وتوليد المعرف المرجعي الآلي (`PRJ-XXXX`).
* **الصلاحية المطلوبة:** `create_workpress_tasks`
* **جسم الطلب:**
```json
{
  "title": "إعداد مسار المصادقة الثنائية",
  "project_id": 12,
  "priority": "high",
  "estimated_hours": 10,
  "assignee_ids": [5],
  "due_at": "2026-09-10"
}
```

### `POST /tasks/:id/move`
* **الوصف:** نقل المهمة بين أعمدة الكانبان (تغيير الحالة اللحظي بالسحب والإفلات).
* **جسم الطلب:** `{"status": "under_review", "new_index": 2}`

### `POST /tasks/:id/assign`
* **الوصف:** تعيين أو استبدال المكلفين بالمهمة (مع فحص حظر رتبة العملاء).
* **جسم الطلب:** `{"assignee_ids": [5, 7]}`

### `POST /tasks/:id/worklog`
* **الوصف:** تسجيل جلسة عمل زمنية على المهمة (`Time Tracker`).
* **جسم الطلب:** `{"hours": 2.5, "note": "إنجاز اختبارات الأمان"}`

---

## 💬 4. مسارات المساهمات والأدلة (`/contributions`)

### `GET /contributions`
* **الوصف:** استرجاع جدول تدفق المساهمات العام عبر كافة المشاريع والمهام مع دعم التصفية المتقدمة والتحديد والترقيم.
* **المعاملات الاختيارية (Query Params):**
  * `project_id` (int): تصفية مساهمات مشروع محدد.
  * `task_id` (int): تصفية مساهمات مهمة محددة.
  * `user_id` (int): تصفية المساهمات الخاصة بعضو محدد.
  * `is_accepted` (bool/int): `1` لجلب الحلول المعتمدة فقط، `0` لغير المعتمدة.
  * `type_in` / `type_not_in` (string): أنواع المساهمات المشمولة أو المستبعدة (مثل `work`, `solution`, `state_change`).
  * `search` (string): بحث نصي في محتوى المساهمة.
  * `number` / `per_page` (int): عدد العناصر في الصفحة.
  * `page` (int): رقم الصفحة المطلوبة.

### `GET /tasks/:id/contributions`
* **الوصف:** استرجاع الجدول الزمني لكافة المساهمات والأدلة وسجلات النظام للمهمة.

### `POST /tasks/:id/contributions`
* **الوصف:** إيداع مساهمة جديدة (ملاحظة، حل مقترح، مخرج نهائي، طلب مراجعة).
* **جسم الطلب:**
```json
{
  "content": "تم رفع الكود المصدري وربطه بقاعدة البيانات بنجاح.",
  "type": "solution",
  "visibility_scope": "client_review",
  "attachment_ids": [204, 205]
}
```

### `POST /contributions/:id/accept`
* **الوصف:** اعتماد المساهمة كحل رسمي ناجز للمهمة (Cascading Completion)، وإغلاق المهمة وفهرستها في بنك المعرفة تلقائياً. يدعم العمليات الفردية والجماعية.
* **الصلاحية المطلوبة:** `accept_solutions` أو أن يكون المستخدم قائد المشروع (`Project Lead`).

### `POST /contributions/:id/revoke`
* **الوصف:** سحب الاعتماد وإعادة فتح المهمة للنقاش والتعديل.

### `POST /contributions/:id/trash-request`
* **الوصف:** تقديم طلب حذف مسبب لمساهمة تمهيداً لمراجعته من الإدارة.
* **جسم الطلب:** `{"reason": "تم إرفاق الكود بالخطأ ويوجد تحديث أحدث"}`

### `POST /contributions/:id/restore`
* **الوصف:** استعادة مساهمة معلقة في سلة المهملات وإلغاء طلب الحذف.

### `DELETE /contributions/:id`
* **الوصف:** الحذف النهائي الصارم للمساهمة من قاعدة البيانات (يتطلب صلاحية إدارية عليا).

---

## 🏢 5. مسارات بوابة العميل المستقلة (`/portal`)

### `GET /portal/projects`
* **الوصف:** جلب المشاريع المعتمدة والنشطة الخاصة بحساب العميل المسجل فقط.

### `GET /portal/requests`
* **الوصف:** جلب الطلبات والمقترحات المعلقة التي قدمها العميل وتتبع مرحلتها (`Stepper`).

### `POST /portal/requests`
* **الوصف:** تقديم طلب مشروع جديد عبر نماذج الاستقبال الديناميكية.
* **جسم الطلب:**
```json
{
  "form_id": "general_request",
  "name": "تطوير تطبيق الهواتف الذكية",
  "specs": {
    "target_platform": "iOS & Android",
    "scope_summary": "تطبيق متكامل لخدمة العملاء"
  },
  "budget": "15000 USD",
  "due_date": "2026-12-01",
  "attachments": [301]
}
```

### `GET /portal/deliverables`
* **الوصف:** جلب قائمة المخرجات والحلول المعتمدة المتاحة لمراجعة العميل.

### `POST /portal/projects/:id/signoff`
* **الوصف:** التوقيع الرقمي النهائي للعميل على استلام وتسليم المشروع وختمه بـ SHA-256.
* **جسم الطلب:** `{"feedback": "تم استلام كافة المخرجات والمواصفات ومصادقتها بالكامل."}`

---

## 🧠 6. مسارات بنك المعرفة والتقارير (`/knowledge`)

### `GET /knowledge`
* **الوصف:** استرجاع فهرس بنك المعرفة المستخلص من الحلول المعتمدة.

### `GET /knowledge/project/:id/export-md`
* **الوصف:** توليد وتنزيل كتيب المعرفة الكامل للمشروع بصيغة **Markdown (.md)**.

### `GET /knowledge/project/:id/summary`
* **الوصف:** جلب التقرير التنفيذي الشامل وإحصائيات السرعة وإنجاز المعالم للمشروع.

### `GET /analytics/overview`
* **الوصف:** جلب المؤشرات التحليلية الكلية لمساحة العمل (إجمالي المشاريع، المهام المنجزة، الحلول المعتمدة، متوسط نسب الإنجاز التراكمي، وأرقام رادار المخاطر).
* **الصلاحية المطلوبة:** `read_workpress_projects`

---

## ⚙️ 7. مسارات الإعدادات والتكامل (`/settings` & `/webhooks`)

### `GET /settings`
* **الوصف:** قراءة إعدادات المنظومة (الأصوات، التوقيت، النماذج، الصلاحيات).
* **الصلاحية المطلوبة:** `manage_workpress_settings`

### `POST /settings`
* **الوصف:** حفظ وتحديث خيارات وإعدادات المنظومة.

### `GET /webhooks` & `POST /webhooks`
* **الوصف:** إدارة خطافات الويب المؤسسية (Slack, Discord, Teams, Generic JSON).

### `POST /webhooks/test`
* **الوصف:** إرسال نبضة اختبار تجريبية مشفرة بـ HMAC-SHA256 للتحقق من الاتصال.

---
*تم توثيق كافة نقاط النهاية وفق معايير OpenAPI / WordPress REST API 2.0.*
