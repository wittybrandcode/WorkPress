# 🛡️ الخطة التنفيذية الشاملة لمعالجة وتصحيح المنظومة الذرية
## WorkPress Master Atomic System Remediation Plan (v2.3.0-Hardened)

> **تاريخ إعداد الخطة:** 2 سبتمبر 2026  
> **مرجعية التدقيق:** [تقرير التدقيق الذري الشامل (ATOMIC_EXPERT_SYSTEM_AUDIT_REPORT.md)](../audits/ATOMIC_EXPERT_SYSTEM_AUDIT_REPORT.md)  
> **المرجعية الدستورية:** [المبادئ الـ 21 الأولى](../core/FIRST_PRINCIPLES.md) | [دستور وركبرس](../../.agents/rules/workpress-constitution.md) | [حارس المعمارية](../../.agents/skills/workpress-guardian/SKILL.md)  
> **حالة الخطة:** معتمدة للتنفيذ المرحلي (Ready for Phased Execution)

---

## 📑 فهرس الخطة التنفيذية

1. [مصفوفة المراحل والأولويات الاستراتيجية](#1-مصفوفة-المراحل-والأولويات-الاستراتيجية)
2. [المرحلة الأولى: التحصين الأمني الحرج وسد ثغرات الصلاحيات (Security & Access Hardening)](#2-المرحلة-الأولى-التحصين-الأمني-الحرج-وسد-ثغرات-الصلاحيات)
3. [المرحلة الثانية: تصحيح آلة الحالات وسلامة المعمارية وقاعدة البيانات (State Machine & Core Engine)](#3-المرحلة-الثانية-تصحيح-آلة-الحالات-وسلامة-المعمارية-وقاعدة-البيانات)
4. [المرحلة الثالثة: إصلاحات واجهة وتجربة المستخدم ونظام التدويل الزمني (UI/UX & Localization)](#4-المرحلة-الثالثة-إصلاحات-واجهة-وتجربة-المستخدم-ونظام-التدويل-الزمني)
5. [المرحلة الرابعة: تنظيف الحزم والذاكرة الخبيرة وإلغاء التثبيت (Packs, Skills & Hygiene)](#5-المرحلة-الرابعة-تنظيف-الحزم-والذاكرة-الخبيرة-وإلغاء-التثبيت)
6. [بروتوكول الاختبار والتحقق الآلي واليدوي (Verification Matrix)](#6-بروتوكول-الاختبار-والتحقق-الآلي-واليدوي)

---

## 1. مصفوفة المراحل والأولويات الاستراتيجية

تم تنظيم معالجة الـ **20 خطأ وثغرة** المكتشفة في التدقيق الذري ضمن **4 مراحل تنفيذية متسلسلة** تخضع لمبدأ "الأمان والاستقرار أولاً، ثم منطق الأعمال، ثم تجربة المستخدم، ثم النظافة المعمارية":

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 مسار المعالجة المرحلي                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  المرحلة 1: الأمان والحوكمة (9 بنود)    ← إغلاق الثغرات، منع التجاوز، تحصين الويب هوك   │
│  المرحلة 2: آلة الحالات والنواة (3 بنود) ← تصحيح استنتاج حالة المهام، إصلاح الفلاتر    │
│  المرحلة 3: تجربة المستخدم واللغات (5 بنود) ← تصحيح التقويم، تواريخ اللغات، توجيه الدخول │
│  المرحلة 4: الحزم والتنظيف (3 بنود)     ← تطبيع قوالب العمل، حارس الذاكرة، uninstall    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. المرحلة الأولى: التحصين الأمني الحرج وسد ثغرات الصلاحيات
### Phase 1: Security Hardening & Access Control (Items 01 - 09)

### 2.1 إغلاق الباب الخلفي وتجاوز المصادقة في البوابة المستقلة (Critical Auth Bypass)
* **الملف المستهدف:** [`templates/portal/index.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/templates/portal/index.php)
* **المشكلة:** معامل `?preview=admin` يمنح الزائر غير المسجل صلاحية مدير مفترضة ويُولد Nonce رسمي.
* **خطوات التعديل:**
  1. تعديل سطر التحقق من `$_GET['preview']` لحظر غير المسجلين وغير المالكين لصلاحية `manage_options`.
  2. منع تطبيق وضع المعاينة إلا إذا كان المستخدم الحقيقي الحالي مديراً نظامياً `current_user_can( 'manage_options' )`.
  3. حظر حقن `$is_logged_in = true` للمجهولين نهائياً.
* **كود التعديل النموذجي:**
  ```php
  // Only allow UI preview mode for actual logged-in administrators
  if ( isset( $_GET['preview'] ) && is_user_logged_in() && current_user_can( 'manage_options' ) ) {
      $preview_mode = sanitize_text_field( wp_unslash( $_GET['preview'] ) );
      if ( 'subscriber' === $preview_mode ) {
          $can_access_portal = false;
          $executive_type    = 'subscriber';
          $role_label        = __( 'Subscriber', 'workpress' );
      } elseif ( 'staff' === $preview_mode || 'admin' === $preview_mode ) {
          $can_access_portal = true;
          $executive_type    = 'admin';
          $role_label        = __( 'Administrator', 'workpress' );
      } elseif ( 'client' === $preview_mode ) {
          $can_access_portal = true;
          $executive_type    = 'client';
          $role_label        = __( 'Stakeholder', 'workpress' );
      }
  }
  ```

---

### 2.2 سد ثغرة كسر تفويض حذف المهام (Task Deletion IDOR)
* **الملفات المستهدفة:**
  * [`includes/services/class-workpress-permission-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-permission-service.php)
  * [`includes/services/class-workpress-capabilities-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-capabilities-service.php)
* **المشكلة:** دالة `can_delete_task()` تفوض لـ `can_edit_task()` التي تسمح لكاتب المنشور بحذفه حتى لو كان مستخدماً عادياً، وخريطة `map_meta_caps` تربط حذف المهمة بـ `edit_workpress_tasks`.
* **خطوات التعديل:**
  1. في `WorkPress_Permission_Service::can_delete_task()`: التحقق صراحة من امتلاك المستخدم لصلاحية `delete_workpress_tasks` أو كونه مديراً للمشروع التابع له المهمة (`WorkPress_Project_Service::is_user_lead`), وإلغاء الاكتفاء بكونه `post_author`.
  2. في `WorkPress_Capabilities_Service::map_meta_caps()`: فصل `delete_workpress_task` عن `edit_workpress_task` وربطها بالقدرة المركزية `delete_workpress_tasks`.

---

### 2.3 تحصين محدد عنوان IP وحماية مانع القوة الغاشمة (Anti-Spoofing & DoS Defense)
* **الملف المستهدف:** [`includes/services/class-workpress-auth-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-auth-service.php)
* **المشكلة:** الوثوق بترويسات `HTTP_CLIENT_IP` و `HTTP_X_FORWARDED_FOR` يمكن المخترق من التحايل على الحظر أو حجب الخدمة عن المستخدمين الشرعيين.
* **خطوات التعديل:**
  1. تحديث دالة `get_client_ip()` للاعتماد الصارم على `$_SERVER['REMOTE_ADDR']`.
  2. دعم ترويسة البروكسي فقط في حال تم تعريف ثابت ثقة مسبق مثل `WORKPRESS_TRUSTED_PROXY`.

---

### 2.4 تفعيل فحص شهادات SSL في الويب هوكس (Webhook SSL Enforcement)
* **الملف المستهدف:** [`includes/services/class-workpress-webhook-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php)
* **المشكلة:** `'sslverify' => false` معطل بشكل ثابت في إرسال الويب هوكس.
* **خطوات التعديل:**
  1. استبدال `false` بالفلتر القياسي لووردبريس:
     ```php
     'sslverify' => apply_filters( 'https_ssl_verify', true, $wh['url'] ),
     ```
  2. تحديث نسخة محرك الويب هوك في ترويسة `User-Agent` للاعتماد على `WORKPRESS_VERSION` بدلاً من النسخة المتقادمة `1.5.0`.

---

### 2.5 حماية اختبار الويب هوك من هجمات SSRF
* **الملف المستهدف:** [`includes/services/class-workpress-webhook-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php)
* **المشكلة:** دالة `test_webhook` لا تمنع عناوين الشبكة المحلية الحساسة مثل `127.0.0.1` أو `169.254.169.254`.
* **خطوات التعديل:**
  1. استخدام دالة ووردبريس الصارمة `wp_http_validate_url( $url )` للتحقق من أمان الهدف الخارجي.

---

### 2.6 تقوية التوقيع الرقمي لبصمة المشروع (HMAC-SHA256 Signoff Fingerprint)
* **الملف المستهدف:** [`includes/services/class-workpress-portal-signoff-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-signoff-service.php)
* **المشكلة:** توليد البصمة بدون مفتاح سري واستخدام `md5` داخل السلسلة النصية.
* **خطوات التعديل:**
  1. استبدال `md5` بـ `hash( 'sha256', (string) $notes )`.
  2. توقيع السلسلة عبر خوارزمية HMAC باستخدام ملح ووردبريس السري:
     ```php
     $sha256_fingerprint = hash_hmac( 'sha256', $certificate_seed, wp_salt( 'auth' ) );
     ```

---

### 2.7 تصحيح صلاحيات الـ REST API في الإعدادات والويب هوك
* **الملفات المستهدفة:**
  * [`includes/api/class-workpress-rest-settings-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-settings-controller.php)
  * [`includes/api/class-workpress-rest-webhooks-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-webhooks-controller.php)
* **المشكلة:** حصر الحفظ والإدارة في `manage_options` مما يحرم حاملي الصلاحيات المخصصة (`manage_workpress_settings` و `manage_webhooks`).
* **خطوات التعديل:**
  1. دعم الصلاحية المخصصة في دالة فحص الإعدادات:
     ```php
     return current_user_can( 'manage_options' ) || current_user_can( 'manage_workpress_settings' );
     ```
  2. دعم الصلاحية المخصصة في دالة فحص الويب هوك:
     ```php
     return current_user_can( 'manage_options' ) || current_user_can( 'manage_webhooks' );
     ```

---

### 2.8 ربط اعتماد الحلول بصلاحية `accept_solutions` المركزية
* **الملف المستهدف:** [`includes/services/class-workpress-solution-transform-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-solution-transform-service.php)
* **المشكلة:** حصر الدالة في `is_user_lead()` وتجاهل الصلاحية المعرفة في السجل `accept_solutions`.
* **خطوات التعديل:**
  1. السماح للمستخدم إذا كان يمتلك قدرة `accept_solutions` أو كان مديراً للمشروع أو مديراً للنظام.

---

### 2.9 ضبط نطاق المساهمات الافتراضي على الداخلي (Default Internal Scope)
* **الملف المستهدف:** [`includes/services/class-workpress-contribution-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php)
* **المشكلة:** نوع `implementation` يتم تعيينه افتراضياً كـ `client_review` مما قد يُسرب مسودات المطورين التقنية للعميل قبل أوانها.
* **خطوات التعديل:**
  1. حصر النطاق التلقائي لـ `client_review` في نوع `deliverable` فقط، وضبط `implementation` كـ `internal` افتراضياً ما لم يحدد المطور خلاف ذلك صراحة.

---

## 3. المرحلة الثانية: تصحيح آلة الحالات وسلامة المعمارية وقاعدة البيانات
### Phase 2: State Machine & Architectural Integrity (Items 10 - 12)

### 3.1 تصحيح دالة عد المساهمات الحقيقية (`count_real_contributions`)
* **الملف المستهدف:** [`includes/services/class-workpress-task-state-machine.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-state-machine.php)
* **المشكلة:** سجلات النظام (`state_change`, `assignment`, `trash_request`) تُحتسب كمساهمات وتجعل المهمة تتحول فوراً إلى `in_progress`.
* **خطوات التعديل:**
  1. إضافة شرط استبعاد لأنواع سجلات النظام إلى استعلام `get_comments` في `count_real_contributions()`:
  ```php
  'meta_query' => array(
      'relation' => 'AND',
      array(
          'relation' => 'OR',
          array(
              'key'     => '_workpress_is_pending_trash',
              'compare' => 'NOT EXISTS',
          ),
          array(
              'key'     => '_workpress_is_pending_trash',
              'value'   => '1',
              'compare' => '!=',
          ),
      ),
      array(
          'key'     => '_workpress_contribution_type',
          'value'   => array( 'state_change', 'assignment', 'trash_request' ),
          'compare' => 'NOT IN',
      ),
  ),
  ```

---

### 3.2 إحياء فلاتر عزل المهام وحماية الاستعلامات المباشرة
* **الملف المستهدف:** [`includes/services/class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php)
* **المشكلة:** استعلام `get_tasks` يضع `'suppress_filters' => true` مما يعطل خطاف `pre_get_posts` المربوط بـ `WorkPress_Capabilities_Service::enforce_task_visibility`.
* **خطوات التعديل:**
  1. إزالة `'suppress_filters' => true` من استعلام `get_tasks`، وضمان تمرير قيود المشاريع تلقائياً في صلب الاستعلام إذا لم يكن المستخدم مديراً، لضمان عدم تسريب المهام حتى لو تم استدعاء الخدمة برمجياً خارج الـ REST.

---

### 3.3 تطهير النصوص المصدرية (msgid) في تسجيل الكيانات (CPT i18n Standard)
* **الملف المستهدف:** [`includes/core/class-workpress-install.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/core/class-workpress-install.php)
* **المشكلة:** نصوص `_x('المشاريع')` و `_x('عناصر العمل')` مكتوبة بالعربية داخل كود النواة كـ `msgid`، مما يعطل عمل اللغات الأخرى في لوحة تحكم ووردبريس.
* **خطوات التعديل:**
  1. تحويل كافة النصوص المصدرية إلى الإنجليزية القياسية:
     * `'Projects'`, `'Project'`, `'Work Items'`, `'Work Item'`.
  2. توفير ترجماتها العربية في ملفات اللغة `.po/.mo`.

---

## 4. المرحلة الثالثة: إصلاحات واجهة وتجربة المستخدم ونظام التدويل الزمني
### Phase 3: UI/UX, DatePicker & Localization (Items 13 - 17)

### 4.1 تصحيح انعكاس أزرار التقويم في النمط العربي (`DatePicker.js`)
* **الملف المستهدف:** [`assets/src/components/ui/DatePicker.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/ui/DatePicker.js)
* **المشكلة:** في النمط العربي (RTL)، الزر الأيمن يستدعي `handleNextMonth` (الانتقال للأمام) بدلاً من `handlePrevMonth` مع ظهور تلميحة متناقضة.
* **خطوات التعديل:**
  1. تثبيت الاستدعاء الوظيفي: زر السابق يستدعي دائماً `handlePrevMonth`، وزر التالي يستدعي دائماً `handleNextMonth`.
  2. اقتصار التبديل الشرطي للـ RTL على أيقونة السهم البصرية فقط:
     ```javascript
     <button 
         type="button" 
         className="wp-icon-btn is-small"
         onClick=${ handlePrevMonth }
         title=${ __( 'Previous Month', 'workpress' ) }
     >
         <i className=${ rtl ? 'dashicons dashicons-arrow-right-alt2' : 'dashicons dashicons-arrow-left-alt2' }></i>
     </button>
     ```

---

### 4.2 دعم اللغات العالمية في محرك التواريخ (`datetime.js`)
* **الملف المستهدف:** [`assets/src/utils/datetime.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/utils/datetime.js)
* **المشكلة:** مصفوفة الأشهر والأيام تحتوي فقط على أسماء عربية، فتظهر التواريخ بالعربية عند اختيار الإنجليزية أو الفرنسية.
* **خطوات التعديل:**
  1. إضافة قواميس الأشهر والأيام للغات الإنجليزية (`en`)، والفرنسية (`fr`)، والإسبانية (`es`).
  2. ربط دالة `getMonthName` بلغة الواجهة الحالية المحددة في `workpressSettings.locale`.

---

### 4.3 تصحيح مسار التوجيه الذكي بعد تسجيل الدخول (Smart Redirect Hierarchy)
* **الملف المستهدف:** [`includes/services/class-workpress-auth-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-auth-service.php)
* **المشكلة:** إجبار كافة المستخدمين (بمن فيهم المدراء والتقنيون) على الذهاب إلى `/portal/?welcome=1`.
* **خطوات التعديل:**
  1. توجيه المدير والمسؤول والمحرر إلى غرفة عمليات ووردبريس:
     `admin_url( 'admin.php?page=workpress#/' )`
  2. قصر التوجيه إلى البوابة `/portal/` على العميل `workpress_client` وحامل صلاحية البوابة فقط.

---

### 4.4 إلزام لوحة التقرير التنفيذي بخط Cairo المؤسسي (`about.css`)
* **الملف المستهدف:** [`assets/src/css/modules/about.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/about.css)
* **المشكلة:** استخدام خط النظام في `.wp-report-canvas` مما يشوه النصوص العربية على ويندوز.
* **خطوات التعديل:**
  1. تعيين `font-family: 'Cairo', sans-serif !important;` على الحاوية التنفيذية.

---

### 4.5 استبدال الخاصية المادية في أعمدة الكانبان بخاصية منطقية (`kanban.css`)
* **الملف المستهدف:** [`assets/src/css/modules/kanban.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/kanban.css)
* **خطوات التعديل:**
  1. استبدال `border-left: 1px solid var(--wp-border-dark);` بـ `border-inline-start: 1px solid var(--wp-border-dark);`.

---

## 5. المرحلة الرابعة: تنظيف الحزم والذاكرة الخبيرة وإلغاء التثبيت
### Phase 4: Packs, Guardian Memory & Uninstall Hygiene (Items 18 - 20)

### 5.1 تطبيع حالات المهام في حزمة تطوير البرمجيات (`class-workpress-software-pack.php`)
* **الملف المستهدف:** [`includes/office-packs/class-workpress-software-pack.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/office-packs/class-workpress-software-pack.php)
* **المشكلة:** استخدام حالة `'open'` المنقرضة بدلاً من الحالات المعتمدة.
* **خطوات التعديل:**
  1. تحديث كافة مهام القالب لتكون `'status' => 'new'`.

---

### 5.2 تصحيح توثيق مفتاح حالة المشروع في مهارة حارس المعمارية (`SKILL.md`)
* **الملف المستهدف:** [`.agents/skills/workpress-guardian/SKILL.md`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/.agents/skills/workpress-guardian/SKILL.md)
* **المشكلة:** توثيق المفتاح كـ `_workpress_project_status` بدلاً من المفتاح الكودي الفعلي `_workpress_status`.
* **خطوات التعديل:**
  1. تحديث جدول الميتاداتا في الوثيقة لمطابقة كود النواة الفعلي وسجل المفاتيح `WorkPress_Keys`.

---

### 5.3 استكمال دورة التنظيف عند إلغاء التثبيت (`uninstall.php`)
* **الملف المستهدف:** [`uninstall.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/uninstall.php)
* **المشكلة:** بقاء جدول الإشعارات والخيارات المخصصة عند إلغاء التثبيت.
* **خطوات التعديل:**
  1. إسقاط جدول الإشعارات المخصص `{$wpdb->prefix}workpress_notifications`.
  2. حذف خيارات الويب هوكس والأصوات ومخططات النماذج.
  3. حذف ميتاداتا لغات المستخدمين.

---

## 6. بروتوكول الاختبار والتحقق الآلي واليدوي (Verification Matrix)

| البند المختبر | وسيلة التحقق | النتيجة المتوقعة للنجاح |
|---|---|---|
| **ثغرة `?preview=admin`** | فحص عبر المتصفح / cURL كزائر مجهول | رفض العرض وتوجيه الزائر إلى شاشة تسجيل الدخول أو إظهار شاشة الحظر. |
| **صلاحية حذف المهمة** | طلب `DELETE /tasks/{id}` بحساب مساهم مؤلف | الحصول على رد `403 Forbidden` ومنع حذف المهمة. |
| **تزييف الـ IP** | محاولات دخول فاشلة بترويسة `X-Forwarded-For` مزيفة | تسجيل الحظر على الـ IP الحقيقي وعدم تأثر المستخدمين الآخرين. |
| **تشفير الويب هوك** | فحص استجابة `dispatch_event()` | التحقق من صحة شهادة SSL وإلغاء خيار التعطيل. |
| **آلة الحالات والمهام الجديدة** | إنشاء مهمة جديدة برمجياً | بقاء حالة المهمة `new` وعدم تحولها الخاطئ إلى `in_progress`. |
| **تقويم التواريخ في RTL** | فحص التنقل بين الشهور بالمتصفح | الضغط على الزر الأيمن يعود للشهر السابق، والأيسر ينتقل للشهر التالي. |
| **شهادة التوقيع الرقمي** | فحص توقيع المشروع في البوابة | توليد بصمة SHA-256 مشفرة بملح النواة السري `hash_hmac`. |
| **سلامة الشيفرة البرمجية** | `php -l` عبر PHP 8.3 CLI | اجتياز 100% بدون أي أخطاء صياغة (No Syntax Errors). |
| **اختبارات المصادقة** | تشغيل `tests/test_auth_service.php` | اجتياز كافة اختبارات التوجيه الذكي بنسبة 100% PASS. |

---
> **جاهزية التنفيذ:** الخطة مكتملة ذرياً وتغطي كامل الثغرات والانحرافات المكتشفة بنسبة 100%. بمجرد الموافقة، يتم الانتقال الفوري للتنفيذ المرحلي الدقيق.
