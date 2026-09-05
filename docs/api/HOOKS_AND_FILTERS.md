# 🪝 مرجع الخطافات والفلاتر البرمجية (WorkPress Hooks & Filters Reference)
## Action Hooks, Filters, Parameter Signatures & Extension Examples

> **نوع الوثيقة:** المرجع التقني الشامل لكافة نقاط التوسعة البرمجية (Extension Points)  
> **الإصدار المعتمد:** WorkPress v1.0.0-Stable  
> **الفئة المستهدفة:** مطورو إضافات ووردبريس والمهندسون التقنيون  
> **المرجع الحاكم:** [ARCHITECTURE.md](../core/ARCHITECTURE.md) | [class-workpress-hooks.php](../../includes/hooks/class-workpress-hooks.php)

---

## 🎯 1. فلسفة الخطافات ونقاط التوسعة في WorkPress

تعتمد المنظومة نمط **الأحداث الصريحة (Explicit Domain Events)**؛ حيث يطلق المحرك خطافات ووردبريس القياسية (`do_action` و `apply_filters`) عند كل تغيير حالة أو اعتماد مساهمة، مما يسمح لأي مطور بربط أنظمة خارجية (مثل ERP، CRM، إشعارات SMS، ومسارات عمل مخصصة) دون المساس بنواة الإضافة.

---

## ⚡ 2. خطافات أحداث المهام والكانبان (Task Actions)

### 1. `workpress_task_state_changed`
يتم إطلاقه لحظة انتقال المهمة بين الحالات (مثلاً: من `in_progress` إلى `under_review` أو `completed`).

* **توقيع المعاملات:**
```php
add_action( 'workpress_task_state_changed', function( $task_id, $old_status, $new_status, $user_id ) {
    // كود مخصص عند تغير حالة المهمة
}, 10, 4 );
```
* **المعاملات:**
  * `$task_id` (int): معرف المهمة (`wp_posts ID`).
  * `$old_status` (string): الحالة السابقة (`backlog`, `in_progress`, `under_review`, `completed`).
  * `$new_status` (string): الحالة الجديدة.
  * `$user_id` (int): معرف المستخدم الذي قام بالعملية.

---

### 2. `workpress_task_created`
يتم إطلاقه عند إنشاء مهمة جديدة في المشروع.

* **توقيع المعاملات:**
```php
add_action( 'workpress_task_created', function( $task_id, $task_data, $user_id ) {
    // إرسال تنبيه أو تسجيل سجل خارجي
}, 10, 3 );
```

---

### 3. `workpress_task_assigned` & `workpress_task_unassigned`
يتم إطلاقهما عند تعيين أو إزالة المكلفين بالمهمة.

* **توقيع المعاملات:**
```php
add_action( 'workpress_task_assigned', function( $task_id, $user_ids, $assigner_id ) {
    // $user_ids: مصفوفة بمعرفات المستخدمين المعينين
}, 10, 3 );
```

---

### 4. `workpress_task_closed` & `workpress_task_deleted` & `workpress_task_reopened`
يتم إطلاقها عند إغلاق المهمة رسمياً، حذفها، أو إعادة فتحها للنقاش.

---

## 💡 3. خطافات المساهمات والحلول المعمارية (Contribution Actions)

### 1. `workpress_contribution_created`
يُطلق فور إيداع أي مساهمة أو دليل أو ملاحظة داخل المهمة.

* **توقيع المعاملات:**
```php
add_action( 'workpress_contribution_created', function( $contribution_id, $task_id, $user_id ) {
    // $contribution_id: معرف التعليق الأصيل (wp_comments ID)
}, 10, 3 );
```

---

### 2. `workpress_contribution_accepted` *(الحل الناجز والاعتماد المعماري)*
**أهم خطاف في المنظومة:** يُطلق عند اعتماد مساهمة كحل رسمي للمهمة من قبل قائد المشروع أو المدير.
يقوم المحرك آلياً بإغلاق المهمة، تحديث مؤشرات المشروع، واستخلاص الحل في بنك المعرفة التراكمي.

* **توقيع المعاملات:**
```php
add_action( 'workpress_contribution_accepted', function( $contribution_id, $task_id, $user_id ) {
    // كود الأتمتة المخصصة، مثل تحديث نظام الفوترة أو إرسال شهادة إنجاز
}, 10, 3 );
```

---

### 3. `workpress_contribution_revoked`
يُطلق عند سحب الاعتماد عن مساهمة وإعادة فتح المهمة للنقاش.

---

## 🏢 4. خطافات دورة حياة المشاريع وبوابة العميل (Project & Portal Actions)

### 1. `workpress_project_request_submitted`
يُطلق فور تقديم العميل لطلب مشروع جديد عبر نماذج الاستقبال الديناميكية في البوابة.

* **توقيع المعاملات:**
```php
add_action( 'workpress_project_request_submitted', function( $project_id, $client_user_id, $specs ) {
    // $project_id: معرف المشروع الأصيل (Term ID)
    // $client_user_id: معرف حساب العميل
    // $specs: مصفوفة المواصفات والميزانية والتواريخ المدخلة
}, 10, 3 );
```

---

### 2. `workpress_project_request_approved` & `under_review` & `rejected`
تُطلق عند تغيير مسار دراسة واعتماد طلبات المشاريع في البوابة.

---

### 3. `workpress_project_completed` & `workpress_project_reopened`
يُطلقان عند اكتمال 100% من مهام المشروع أو إعادة فتحه.

---

### 4. `workpress_project_membership_changed` & `workpress_project_member_removed`
يُطلقان عند إضافة، ترقية رتبة، أو إزالة عضو داخل المشروع (`lead`, `manager`, `specialist`, `viewer`).

---

## 📢 5. خطافات التنبيهات الإدارية والبث الحي (Broadcasts & Directives Actions)

### 1. `workpress_broadcast_created`
يُطلق عند إنشاء توجيه إداري أو تنبيه تشغيلي جديد.
```php
add_action( 'workpress_broadcast_created', function( $broadcast_id, $data, $user_id ) {
    // إرسال تنبيه عبر Slack / Telegram أو قناة إدارية مخصصة
}, 10, 3 );
```

### 2. `workpress_broadcast_updated`
يُطلق عند تعديل نص، أولوية، أو جدولة تنبيه قائم.
```php
add_action( 'workpress_broadcast_updated', function( $broadcast_id, $data, $user_id ) {
    // مزامنة التعديل
}, 10, 3 );
```

### 3. `workpress_broadcast_deleted`
يُطلق عند أرشفة أو إزالة تنبيه إداري.
```php
add_action( 'workpress_broadcast_deleted', function( $broadcast_id, $hard_delete ) {
    // تفريغ الكاش الخارجي
}, 10, 2 );
```

---

## ✍️ 6. خطافات تسليمات العميل والإغلاق الرقمي (Sign-off & Portal Feedback)

### 1. `workpress_client_deliverable_accepted`
يُطلق عند اعتماد العميل لمخرج أو تسليمة محددة داخل البوابة.
```php
add_action( 'workpress_client_deliverable_accepted', function( $deliverable_id, $task_id, $project_id, $user_id ) {
    // تحديث مراحل المشروع أو إصدار فاتورة المرحلة
}, 10, 4 );
```

### 2. `workpress_client_project_signed_off`
يُطلق عند الإغلاق والاعتماد النهائي للمشروع وتوقيعه رقمياً ببصمة SHA-256 مشفرة.
```php
add_action( 'workpress_client_project_signed_off', function( $project_id, $user_id, $notes, $sha256_fingerprint ) {
    // حفظ السجل المشفر أو إنشاء شهادة الإنجاز الرسمية
}, 10, 4 );
```

---

## 🎨 7. فلاتر التعديل والتخصيص (Core Filters)

### 1. `workpress_prepare_task_response`
يتيح للمطورين تعديل أو إضافة حقول مخصصة على كائن المهمة قبل إرساله في استجابات REST API.
```php
add_filter( 'workpress_prepare_task_response', function( $response, $post ) {
    $response['custom_erp_code'] = get_post_meta( $post->ID, '_custom_erp_code', true );
    return $response;
}, 10, 2 );
```

### 2. `workpress_prepare_project_response`
يتيح تخصيص وإثراء كائنات المشاريع المُرجعة في REST API.

### 3. `workpress_broadcast_stream`
يتيح حقن تنبيهات أو توجيهات إضافية في شريط البث الحي اللحظي من مصادر بيانات خارجية.
```php
add_filter( 'workpress_broadcast_stream', function( $stream ) {
    // إضافة تنبيه مخصص من نظام خارجي
    return $stream;
} );
```

### 4. `workpress_workflow_transitions` & `workpress_workflow_state_labels`
تخصيص مسارات الانتقال المسموحة بين حالات المهام ومسمياتها بحسب سياسة المنشأة.

### 5. `workpress_registered_capabilities`
يتيح للمطورين إضافة أو تعديل مصفوفة الصلاحيات المدارة عبر لوحة التحكم.

---
*تم توثيق كافة الخطافات بنسبة 100% لتوفير أقصى درجات القابلية للتوسع والتكامل البرمجي لنظام WorkPress v1.0.0-Stable.*
