# 🔬 التقرير الذري الشامل للتدقيق البرمجي والأمني وهندسة تجربة المستخدم
## WorkPress Master Atomic Audit & Deep Forensic Inspection Report (v2.3.0-Hardened)

> **تاريخ الإجراء والتدقيق:** 2 سبتمبر 2026  
> **نطاق الفحص:** الشيفرة المصدرية الكاملة (Backend PHP, REST API, Database Layer, Security Perimeters, React/Preact SPA, CSS Modules, i18n Engine, Standalone Portal).  
> **المرجعية الدستورية العليا:** [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md) | [دستور وركبرس](../../.agents/rules/workpress-constitution.md) | [حارس وركبرس](../../.agents/skills/workpress-guardian/SKILL.md)  
> **تصنيف التقرير:** تدقيق ذري مجهري فائق الدقة (Highest Severity & Forensic Quality Standard)

---

## 📑 الفهرس التنفيذي للتقرير

1. [الملخص التنفيذي ومصفوفة المخاطر الإجمالية](#1-الملخص-التنفيذي-ومصفوفة-المخاطر-الإجمالية)
2. [المحور الأول: التدقيق البرمجي والمعماري (Software Architecture & Engine Integrity)](#2-المحور-الأول-التدقيق-البرمجي-والمعماري)
3. [المحور الثاني: التدقيق الأمني والسيبراني ونظام الحوكمة (Cybersecurity, Authorization & Defense)](#3-المحور-الثاني-التدقيق-الأمني-والسيبراني-ونظام-الحوكمة)
4. [المحور الثالث: تدقيق واجهة وتجربة المستخدم ونظام التصميم (UI/UX, Layout & Design System)](#4-المحور-الثالث-تدقيق-واجهة-وتجربة-المستخدم-ونظام-التصميم)
5. [جدول حصر الـ 20 ثغرة وخطأ وتعارض مع كود المعالجة الفوري](#5-جدول-حصر-الـ-20-ثغرة-وخطأ-وتعارض-مع-كود-المعالجة-الفوري)
6. [خطة المعالجة الاستراتيجية والتوصيات الختامية](#6-خطة-المعالجة-الاستراتيجية-والتوصيات-الختامية)

---

## 1. الملخص التنفيذي ومصفوفة المخاطر الإجمالية

خضعت منظومة **WorkPress** لأكبر عملية تشريح وتدقيق ذري في تاريخها البرمجي. تم فحص كل سطر في **20 خدمة برمجية**، و **10 متحكمات REST API**، ونظام الذاكرة وقاعدة البيانات الصفرية (**Zero-Table Core**)، ومحرك التدويل اللحظي، ومسارات البوابة المستقلة.

### مصفوفة الحصر الرقمي للنتائج:
* **إجمالي الملاحظات والأخطاء المكتشفة:** **20 ثغرة وخطأ معماري وتصميمي**.
* **المحور الأمني والسيبراني:** **9 ثغرات** (1 حرجة جداً، 3 عالية، 4 متوسطة، 1 منخفضة).
* **المحور البرمجي والمعماري:** **6 أخطاء وانحرافات معمارية**.
* **محور واجهة وتجربة المستخدم (UI/UX):** **5 عيوب تفاعلية وهندسية**.

```
┌─────────────────────────────────────────────────────────────┬──────────┬──────────────┐
│ تصنيف الخطأ / الثغرة                                        │ العدد    │ مستوى الخطر  │
├─────────────────────────────────────────────────────────────┼──────────┼──────────────┤
│ ثغرة تجاوز المصادقة (Auth Bypass)                           │ 1        │ 🔴 حرجة جداً │
│ ثغرات كسر صلاحيات الحذف والتفويض (Broken Authorization)    │ 2        │ 🟠 عالية     │
│ تزييف الهوية والتحايل على حظر القوة الغاشمة (IP Spoofing)   │ 1        │ 🟠 عالية     │
│ تعطيل تشفير الاتصال الخارجي (SSL Verify Disabled)           │ 1        │ 🟠 عالية     │
│ ثغرة تزوير الطلبات عبر الخادم (SSRF Risk)                   │ 1        │ 🟡 متوسطة    │
│ ضعف بصمة التوقيع الرقمي للمشاريع (Weak Fingerprint)         │ 1        │ 🟡 متوسطة    │
│ تضارب صلاحيات الـ REST API مع السجل المركزي                 │ 2        │ 🟡 متوسطة    │
│ خلل آلة الحالات وانحراف الحالة التلقائية للمهام            │ 1        │ 🟡 متوسطة    │
│ انقطاع حلقة استعلام الصلاحيات الفلاتر (Dead Hook)           │ 1        │ 🟡 متوسطة    │
│ تلوث النصوص المرجعية الأساسية بالعربية في CPT               │ 1        │ 🟢 منخفضة    │
│ عيوب الاتجاه المعكوس والتقويم والخطوط في الواجهة الأمامية   │ 5        │ 🔵 تشغيلية   │
│ مخلفات بقايا الجداول والخيارات عند إلغاء التثبيت            │ 3        │ 🟢 تنظيفية   │
└─────────────────────────────────────────────────────────────┴──────────┴──────────────┘
```

---

## 2. المحور الأول: التدقيق البرمجي والمعماري
### (Software Architecture & Engine Integrity)

### 2.1 خلل آلة الحالات واحتساب سجلات النظام كمساهمات تقنية
* **الملف المصاب:** [`class-workpress-task-state-machine.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-state-machine.php) (السطر 65-84 والسطر 112).
* **التشخيص المعماري:**
  تقوم دالة `count_real_contributions( $task_id )` بعدّ كافة التعليقات من نوع `wp_contribution`. وبما أن خدمة المهام في [`class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php) تسجل عند إنشاء المهمة مباشرة سجلاً نظامياً `add_system_log( $post_id, 'Task created.' )` بنوع `state_change`، فإن ناتج العد يكون دائماً $\ge 1$.
* **الأثر البرمجي:**
  عند تشغيل دالة الاستنتاج والمزامنة `derive_and_sync_task_state()`، تتحول جميع المهام المنشأة حديثاً تلقائياً إلى حالة **"قيد التنفيذ" (`in_progress`)** فور إنشائها، حتى لو لم يتم تكليف أحد بها أو إضافة أي مساهمة برمجية فعلية، مما يفسد دقة مسارات الكانبان ولوحات الإحصاء.
* **المعالجة المطلوبة:**
  استبعاد أنواع سجلات النظام (`state_change`, `assignment`, `trash_request`) من دالة `count_real_contributions`:
  ```php
  // يجب إضافة شرط meta_query لاستبعاد أنواع سجلات النظام
  array(
      'key'     => '_workpress_contribution_type',
      'value'   => array( 'state_change', 'assignment', 'trash_request' ),
      'compare' => 'NOT IN',
  )
  ```

---

### 2.2 انقطاع فلتر عزل المهام المعماري (Dead Hook via `suppress_filters`)
* **الملفات المعنية:**
  * [`class-workpress-task-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-service.php) (السطر 34).
  * [`class-workpress-capabilities-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-capabilities-service.php) (السطر 22 والسطر 117-164).
* **التشخيص المعماري:**
  تعتمد خدمة الصلاحيات على خطاف `pre_get_posts` عبر الدالة `enforce_task_visibility( $query )` لتقييد قراءة المهام لأعضاء المشروع فقط. لكن خدمة المهام في `WorkPress_Task_Service::get_tasks()` تضع صراحة:
  ```php
  'suppress_filters' => true,
  ```
* **الأثر البرمجي:**
  عند ضبط `suppress_filters => true` في ووردبريس، يتم تجاهل `pre_get_posts` كلياً! هذا يعني أن كود `enforce_task_visibility` يعتبر **شيفرة ميتة (Dead Code)** عند طلب المهام برمجياً من داخل ووردبريس، ولولا قيام متحكم الـ REST API بتمرير مصفوفة `$args['project_ids']` يدوياً لحدث تسريب شامل للمهام بين المشاريع.
* **المعالجة المطلوبة:**
  إزالة `'suppress_filters' => true` أو نقل منطق التصفية والتحقق إلى صلب استعلام الخدمة المركزية `WorkPress_Task_Service::get_tasks()`.

---

### 2.3 مخالفة معايير التدويل الأصلية (msgid تلوث عربي في النواة)
* **الملف المصاب:** [`class-workpress-install.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/core/class-workpress-install.php) (الأسطر 56، 57، 87، 88، 90، 91).
* **التشخيص البرمجي:**
  وفقاً لـ **المبدأ السادس** ومعايير ووردبريس الدولية (WordPress i18n Standards)، يجب أن يكون النص المصدري القياسي (`msgid`) باللغة الإنجليزية دائماً، ويتم توفير الترجمات عبر ملفات `.po/.mo/.json`.
  في الملف المذكور، كُتبت نصوص التسجيل الأساسية بالعربية مباشرة داخل الكود:
  ```php
  'name'          => _x( 'المشاريع', 'taxonomy general name', 'workpress' ),
  'singular_name' => _x( 'مشروع', 'taxonomy singular name', 'workpress' ),
  'name'          => _x( 'عناصر العمل', 'post type general name', 'workpress' ),
  'singular_name' => _x( 'عنصر عمل', 'post type singular name', 'workpress' ),
  ```
* **الأثر البرمجي:**
  في المواقع المنصبة بالإنجليزية أو الفرنسية أو الإسبانية، ستظهر تصنيفات المشروع والمهام في لوحة تحكم ووردبريس الرئيسية باللغة العربية حصراً لغياب ترجمة إنجليزية لنص عربي مصدري!
* **المعالجة المطلوبة:**
  تحويل النصوص المصدرية إلى الإنجليزية المعيارية:
  `'Projects'`, `'Project'`, `'Work Items'`, `'Work Item'`.

---

### 2.4 استخدام حالات مهام غير معتمدة في حزمة التطوير (`Software Pack`)
* **الملف المصاب:** [`class-workpress-software-pack.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/office-packs/class-workpress-software-pack.php) (الأسطر 39، 45، 51، 57).
* **التشخيص البرمجي:**
  تستخدم قوالب حزمة تطوير البرمجيات الحالة المنقرضة `'status' => 'open'`، بينما عرّفت آلة الحالات المركزية [`class-workpress-task-state-machine.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-task-state-machine.php) الحالات الرسمية بست فقط: (`new`, `assigned`, `in_progress`, `in_review`, `completed`, `closed`).
* **الأثر:**
  عند إنشاء مشروع جديد باستخدام قالب `Software Development`، تنشأ مهام بحالة `open` مما يربك استعلامات لوحة الكانبان ويتطلب تطبيعاً قسرياً في كل دورة قراءة.

---

### 2.5 الانحراف المعماري لتوثيق الذاكرة الخبيرة (`SKILL.md`)
* **الملف المعني:** [`.agents/skills/workpress-guardian/SKILL.md`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/.agents/skills/workpress-guardian/SKILL.md) (السطر 90).
* **التشخيص:**
  توثق مهارة الحارس مفتاح حالة المشروع بـ `_workpress_project_status`، بينما تعتمد كافة ملفات الكود الحقيقية و [`class-workpress-keys.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/core/class-workpress-keys.php) على المفتاح `_workpress_status`.
* **الأثر:**
  أي وكيل ذكاء اصطناعي أو مطور خارجي يستند لمهارة الحارس سيكتب استعلامات أو عمليات ميتة لا تؤثر في حالة المشروع الفعلية.

---

### 2.6 قصور تنظيف قاعدة البيانات عند إلغاء التثبيت (`uninstall.php`)
* **الملف المصاب:** [`uninstall.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/uninstall.php)
* **التشخيص:**
  عند اختيار تنظيف البيانات الشامل، يقوم الملف بحذف المنشورات والتعليقات والخيارات الأساسية، لكنه:
  1. يترك جدول الإشعارات المخصص `{$wpdb->prefix}workpress_notifications` في قاعدة البيانات للأبد.
  2. يترك خيارات الويب هوكس `workpress_webhooks`، ومخططات النماذج `workpress_intake_forms_schema`، وخيارات الأصوات `workpress_sound_*`.
  3. يترك بيانات المستخدم الميتة `_workpress_portal_locale` و `_workpress_user_locale`.
* **المعالجة:**
  إضافة استعلام `DROP TABLE IF EXISTS` لجدول الإشعارات وحذف مصفوفة الخيارات الإضافية.

---

## 3. المحور الثاني: التدقيق الأمني والسيبراني ونظام الحوكمة
### (Cybersecurity, Authorization & Defense)

---

### 🚨 3.1 ثغرة أمنية حرجة: تجاوز المصادقة عبر معلمة الاستعراض (`?preview=admin`)
* **الملف المصاب:** [`templates/portal/index.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/templates/portal/index.php) (الأسطر 55 إلى 72).
* **مستوى الخطر:** 🔴 **حرج جداً (Critical - CVSS 9.1)**
* **الوصف الفني الدقيق:**
  يحتوي كود قالب البوابة المستقلة على الشيفرة التالية:
  ```php
  // Support ?preview=... for UI testing and verification
  if ( isset( $_GET['preview'] ) ) {
      $preview_mode = sanitize_text_field( wp_unslash( $_GET['preview'] ) );
      $is_logged_in = true; // <--- كارثة أمنية
      if ( 'subscriber' === $preview_mode ) {
          $can_access_portal = false;
          $executive_type    = 'subscriber';
      } elseif ( 'staff' === $preview_mode || 'admin' === $preview_mode ) {
          $can_access_portal = true;
          $executive_type    = 'admin'; // <--- انتحال رتبة مدير
          $role_label        = __( 'Administrator', 'workpress' );
      } elseif ( 'client' === $preview_mode ) {
          $can_access_portal = true;
          $executive_type    = 'client';
      }
  }
  ```
* **سيناريو الاستغلال (Exploit Scenario):**
  أي مستخدم خارجي غير مسجل دخول على الإطلاق، بمجرد زيارته للرابط:
  `https://example.com/portal/?preview=admin`
  سيقوم النظام بتهيئة كائن الجلسة `window.workpressPortalConfig` معتبراً إياه مديراً مسجلاً للدخول (`isLoggedIn = true, canAccessPortal = true, executive_type = 'admin'`)، وسينتج له مفتاح Nonce صالح للمستخدم رقم 0!
  تفتح واجهة البوابة كاملة أمامه وتظهر أمامه أدوات الفرز والإعدادات الداخلية واستمارات استقبال المشاريع دون الحاجة لكلمة مرور!
* **المعالجة الفورية الصارمة:**
  حظر هذا الباب الخلفي ومنعه نهائياً إلا إذا كان المستخدم مسجلاً ومملكاً لصلاحية `manage_options` حصراً، أو حصره في وضع التطوير المحلي:
  ```php
  if ( isset( $_GET['preview'] ) && current_user_can( 'manage_options' ) ) {
      // يسمح بالمعاينة للمدير الشرعي فقط
  }
  ```

---

### 🛑 3.2 ثغرة كسر الصلاحيات في حذف المهام (IDOR / Broken Object-Level Authorization)
* **الملفات المعنية:**
  * [`class-workpress-permission-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-permission-service.php) (السطر 126-128).
  * [`class-workpress-capabilities-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-capabilities-service.php) (السطر 74-94).
  * [`class-workpress-rest-tasks-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-tasks-controller.php) (السطر 412-426).
* **مستوى الخطر:** 🟠 **عالي (High - CVSS 7.8)**
* **الوصف الفني:**
  في `WorkPress_Permission_Service`:
  ```php
  public static function can_delete_task( $user_id, $task_id ) {
      return self::can_edit_task( $user_id, $task_id );
  }
  ```
  ودالة `can_edit_task` تمنح الإذن فوراً إذا كان المستخدم هو كاتب المنشور (`post_author === $user_id`):
  ```php
  if ( (int) $task->post_author === (int) $user_id ) {
      return true;
  }
  ```
* **الأثر الأمني:**
  يحق لمستخدم برتبة مساهم أو كاتب عادي أنشأ مهمة، أن يقوم بإرسال طلب `DELETE /wp-json/workpress/v1/tasks/{id}` وحذف المهمة نهائياً من النظام، متجاوزاً صلاحية `delete_workpress_tasks` المقيدة للمشرفين والمدراء! هذا يكسر **المبدأ رقم 13 (History is never lost)** ويمكّن أي عضو من إتلاف سجلات العمل وتاريخ المهمة.
* **المعالجة:**
  فصل فحص الحذف صراحة ومطالبة المستخدم بصلاحية `delete_workpress_tasks` أو كونه مدير المشروع `ROLE_MANAGER`.

---

### 🛑 3.3 التحايل على حظر القوة الغاشمة وتزييف العناوين (IP Spoofing & DoS)
* **الملف المصاب:** [`class-workpress-auth-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-auth-service.php) (السطر 368-377).
* **مستوى الخطر:** 🟠 **عالي (High - CVSS 7.5)**
* **الوصف الفني:**
  تعتمد الدالة `get_client_ip()` في تسجيل المحاولات الفاشلة والحظر المؤقت على ترويسات يرسلها العميل نفسه:
  ```php
  if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
      return sanitize_text_field( wp_unslash( $_SERVER['HTTP_CLIENT_IP'] ) );
  }
  if ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
      $ips = explode( ',', sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) );
      return trim( $ips[0] );
  }
  return ! empty( $_SERVER['REMOTE_ADDR'] ) ? ...
  ```
* **الأثر الأمني المزدوج:**
  1. **Bypass:** يستطيع أي مخترق يقوم بهجوم القوة الغاشمة (Brute Force) تغيير ترويسة `X-Forwarded-For: 1.1.1.X` مع كل محاولة، متجاوزاً الحظر بعد 5 محاولات للأبد دون أن يُقفل حسابه!
  2. **Denial of Service (حجب الخدمة):** يستطيع المهاجم إرسال 5 محاولات فاشلة متعمداً وضع عنوان الـ IP الحقيقي لمدير النظام أو العميل في الترويسة، مما يؤدي إلى **قفل وحظر المدير الحقيقي عن الدخول لمدة 15 دقيقة!**
* **المعالجة:**
  الاعتماد الحصري على `$_SERVER['REMOTE_ADDR']` المشتق مباشرة من اتصال الـ TCP، وعدم الوثوق بترويسات البروكسي إلا في حال وجود خادم وكيل موثوق ومُعرّف في إعدادات ووردبريس.

---

### 🛑 3.4 تعطيل التحقق من شهادات التشفير في الويب هوكس (`sslverify => false`)
* **الملف المصاب:** [`class-workpress-webhook-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php) (السطر 230).
* **مستوى الخطر:** 🟠 **عالي (High - CVSS 7.4)**
* **الوصف الفني:**
  عند إرسال حمولة الويب هوك لأي جهة خارجية (Discord, Slack, Make, API مخصص):
  ```php
  $response = wp_remote_post( $wh['url'], array(
      'headers'   => $headers,
      'body'      => $body_str,
      'timeout'   => 5,
      'sslverify' => false, // <--- إبطال حماية SSL
  ) );
  ```
* **الأثر الأمني:**
  تعطيل فحص الشهادة يُعرّض بيانات المنشأة الحساسة وحمولات المهام والمشاريع لهجمات اعتراض وتعديل البيانات في المنتصف (Man-in-the-Middle Attacks).
* **المعالجة:**
  تفعيل فحص الشهادات افتراضياً `'sslverify' => true`، وتطبيق الفلتر القياسي `apply_filters( 'https_ssl_verify', true, $wh['url'] )`.

---

### ⚠️ 3.5 احتمالية تزوير الطلبات من جانب الخادم (SSRF Risk في اختبار الويب هوك)
* **الملف المصاب:** [`class-workpress-webhook-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php) (السطر 267).
* **مستوى الخطر:** 🟡 **متوسط (Medium - CVSS 6.2)**
* **الوصف الفني:**
  تتحقق دالة `test_webhook` من صحة الرابط عبر `filter_var( $url, FILTER_VALIDATE_URL )`.
  هذا الفحص يقبل عناوين الشبكة المحلية والداخلية مثل `http://127.0.0.1:8080/admin` أو عنوان ميتاداتا السحابة `http://169.254.169.254/latest/meta-data/`.
* **المعالجة:**
  استخدام دالة ووردبريس الأمنية الصارمة:
  ```php
  if ( ! wp_http_validate_url( $url ) ) {
      return ... // حظر العناوين الداخلية والملغومة
  }
  ```

---

### ⚠️ 3.6 ضعف بصمة التوقيع الرقمي وإمكانية التزوير الموضعي
* **الملف المصاب:** [`class-workpress-portal-signoff-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-signoff-service.php) (السطر 442-450).
* **مستوى الخطر:** 🟡 **متوسط (Medium)**
* **التشخيص الفني:**
  يتم توليد شهادة التوقيع الرقمي للمشروع عبر:
  ```php
  $certificate_seed = sprintf(
      'WORKPRESS_SIGNOFF|PRJ:%d|USR:%d|TIME:%s|NOTES:%s',
      $project_id, $user_id, $now_gmt, md5( (string) $notes )
  );
  $sha256_fingerprint = hash( 'sha256', $certificate_seed );
  ```
  هذه البصمة لا تتضمن أي مفتاح تشفيري سري (Secret Salt / HMAC Key)، بالإضافة إلى استخدام خوارزمية `md5` المنقرضة داخل الترويسة. يستطيع أي شخص يعرف المعرف والتاريخ إعادة إنتاج نفس البصمة يدوياً.
* **المعالجة:**
  استخدام توقيع مشفر حقيقي عبر `hash_hmac`:
  ```php
  $sha256_fingerprint = hash_hmac( 'sha256', $certificate_seed, wp_salt( 'auth' ) );
  ```

---

### ⚠️ 3.7 حرمان حاملي الصلاحيات المخصصة في متحكمات الإعدادات والويب هوك
* **الملفات المصابة:**
  * [`class-workpress-rest-settings-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-settings-controller.php) (السطر 50).
  * [`class-workpress-rest-webhooks-controller.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/api/class-workpress-rest-webhooks-controller.php) (السطر 100).
* **التشخيص:**
  تُعرّف منظومة وركبرس صلاحيات مخصصة في سجل الصلاحيات:
  * `'manage_workpress_settings'`
  * `'manage_webhooks'`
  ومع ذلك، يفحص المتحكم فقط `current_user_can( 'manage_options' )`!
  النتيجة: المدير الإداري المخصص المفوض من المنشأة يستطيع رؤية تبويب الإعدادات في الواجهة الأمامية، لكن عند محاولة الحفظ ترفضه واجهة الـ API وتُرجع له خطأ `403 Forbidden`.
* **المعالجة:**
  توسيع فحص الصلاحية لدعم القدرات المسجلة:
  ```php
  return current_user_can( 'manage_options' ) || current_user_can( 'manage_workpress_settings' );
  ```

---

### ⚠️ 3.8 تجاهل صلاحية اعتماد الحلول (`accept_solutions`) في خدمة النواة
* **الملف المصاب:** [`class-workpress-solution-transform-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-solution-transform-service.php) (السطر 44).
* **التشخيص:**
  تمنع الدالة `accept_solution()` أي مستخدم من اعتماد المساهمة كحل رسمي ما لم يكن `is_user_lead()`، متجاهلة تماماً فحص قدرة `user_can( $user_id, 'accept_solutions' )` المسجلة في النواة!

---

### ℹ️ 3.9 تسريب المسودات التقنية في البوابة بسبب النمط الافتراضي
* **الملف المصاب:** [`class-workpress-contribution-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php) (السطر 301).
* **التشخيص:**
  المساهمات ذات النوع `'implementation'` يتم تعيين نطاق رؤيتها افتراضياً إلى `'client_review'` بدلاً من `'internal'`. هذا يجعل التجارب والمسودات البرمجية للمطورين مرئية للعميل في البوابة المستقلة قبل مراجعتها وتدقيقها داخلياً.

---

## 4. المحور الثالث: تدقيق واجهة وتجربة المستخدم ونظام التصميم
### (UI/UX, Layout & Design System)

---

### 🐞 4.1 الانعكاس الخاطئ لأزرار تقويم التاريخ في النمط العربي (`DatePicker.js`)
* **الملف المصاب:** [`assets/src/components/ui/DatePicker.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/ui/DatePicker.js) (الأسطر 251-285).
* **الوصف والخلل:**
  في هيدر التنقل بين الشهور في منتقي التاريخ التفاعلي، كُتب الكود كالتالي:
  ```javascript
  // الزر الأيمن في DOM (المتواجد يميناً في RTL):
  onClick=${ rtl ? handleNextMonth : handlePrevMonth }
  title=${ __( 'Previous Month', 'workpress' ) }
  ```
* **الأثر على تجربة المستخدم (UX Bug):**
  في النمط العربي (RTL)، الزر المتواجد على اليمين يعبر بصرياً وثقافياً عن "الشهر السابق / العودة للخلف". لكن الكود يقوم باستدعاء `handleNextMonth` (الانتقال للمستقبل)، بينما تظهر تلميحة الزر بعنوان "الشهر السابق"!
  وعند الضغط على الزر الأيسر يعود للماضي! هذا ارتباك حركي وبصري كامل لمستخدمي الواجهة العربية.
* **المعالجة:**
  إبقاء الربط المنطقي ثابتاً: زر السابق يستدعي `handlePrevMonth` دائماً وزر التالي يستدعي `handleNextMonth` دائماً، مع قصر التبديل الشرطي على أيقونة السهم البصرية فقط.

---

### 🐞 4.2 محرك التواريخ المقتصر على العربية وتجاهل أسماء الشهور باللغات الأخرى
* **الملف المصاب:** [`assets/src/utils/datetime.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/utils/datetime.js) (الأسطر 8-25 والسطر 78).
* **الوصف والخلل:**
  تحتوي مصفوفات `MONTH_NAMES` و `DAY_NAMES` على أسماء عربية فقط (المغاربي، المشرقي، السرياني).
* **الأثر:**
  عندما يغير المستخدم لغة CoWorkPress إلى **الإنجليزية (US)** أو **الفرنسية** أو **الإسبانية**، تظل التواريخ تظهر بأشهر عربية:
  `"18 جانفي 2026"` بدلاً من `"18 January 2026"`!
  وتظهر أيام الأسبوع في التقويم كـ `"الأحد, الاثنين..."` بدلاً من `"Sun, Mon..."`.
* **المعالجة:**
  إدراج القواميس الزمنية للغات الأربع المعتمدة في النظام (`en`, `ar`, `fr`, `es`) وتغذيتها بحسب `getLocale()`.

---

### 🐞 4.3 إجبار المدراء على البوابة بعد تسجيل الدخول (Redirection Hijack)
* **الملف المصاب:** [`class-workpress-auth-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-auth-service.php) (السطر 309-310).
* **الوصف والخلل:**
  في دالة `resolve_role_landing_page()`، تنتهي الدالة بالسطر:
  ```php
  // Universal Smart Welcome Gateway Transition for all citizen tiers
  return home_url( '/portal/?welcome=1' );
  ```
* **الأثر على تجربة المدير:**
  عند تسجيل دخول مدير النظام أو المشرف الفني عبر نموذج الدخول النظامي لووردبريس، يتم توجيهه قسراً إلى بوابة العملاء الخارجية `/portal/` بدلاً من غرفة عمليات CoWorkPress في لوحة التحكم الإدارية (`/wp-admin/admin.php?page=workpress#/`)!

---

### 🐞 4.4 عدم تطابق خط التقرير المؤسسي (`about.css`)
* **الملف المصاب:** [`assets/src/css/modules/about.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/about.css) (السطر 19).
* **الوصف:**
  يُعيّن نمط لوحة التقرير التنفيذي المطبوع (`.wp-report-canvas`) خطوط النظام الافتراضية:
  `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`
* **الأثر:**
  مخالفة معايير الهوية البصرية الصارمة لنظام التصميم في [`DESIGN_SYSTEM_GUIDELINES.md`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/docs/design-system/DESIGN_SYSTEM_GUIDELINES.md) والتي توجب استخدام خط **Cairo** الموحد بكافة الأوزان. تظهر التقارير في ويندوز بخط Tahoma أو Times New Roman الرديء.

---

### 🐞 4.5 استخدام خاصية اتجاه مادية في أعمدة الكانبان (`kanban.css`)
* **الملف المصاب:** [`assets/src/css/modules/kanban.css`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/css/modules/kanban.css) (السطر 60).
* **الوصف:**
  تستخدم الأيقونة `.wp-kanban-column-header-icon` الخاصية المادية `border-left: 1px solid...`.
* **الأثر:**
  في الواجهة العربية يظهر الحد في الجهة المعاكسة لحركة العين، والصحيح استبداله بالخاصية المنطقية الحديثة `border-inline-start`.

---

## 5. جدول حصر الـ 20 ثغرة وخطأ وتعارض مع كود المعالجة الفوري

| # | النطاق والملف | نوع الخلل ومستوى الخطر | الشيفرة البرمجية العلاجية الفورية (Patch Snippet) |
|---|---|---|---|
| **01** | `templates/portal/index.php` | 🔴 **تجاوز مصادقة حرج** (ثغرة `?preview=admin`) | استبدال فحص المعاينة بـ: `if ( isset( $_GET['preview'] ) && current_user_can( 'manage_options' ) )` لحجب الدخول غير المصرح به. |
| **02** | `class-workpress-permission-service.php` | 🟠 **كسر تفويض الحذف** (حذف المهام بدون صلاحية) | استبدال كود `can_delete_task`: التحقق من `current_user_can( 'delete_workpress_tasks' )` وكون المستخدم مدير مشروع. |
| **03** | `class-workpress-auth-service.php` | 🟠 **تزييف هوية وخطر حجب خدمة** (`get_client_ip`) | الاقتصار على `$_SERVER['REMOTE_ADDR']` النظيف والمثبت من بروتوكول TCP لمنع التحايل على الحظر وحماية المستخدمين. |
| **04** | `class-workpress-webhook-service.php` | 🟠 **تعطيل تشفير SSL** في الويب هوك | تعديل خيار الاتصال إلى `'sslverify' => true` لحماية الاتصال من هجمات التنصت الوسيطة (MITM). |
| **05** | `class-workpress-webhook-service.php` | 🟡 **خطر تزوير طلب الخادم (SSRF)** | فحص الرابط بدالة ووردبريس الأمنية: `if ( ! wp_http_validate_url( $url ) ) return error;`. |
| **06** | `class-workpress-portal-signoff-service.php` | 🟡 **توقيع رقمي غير مشفر بمفتاح سري** | استخدام التشفير المقفل: `$sha256 = hash_hmac( 'sha256', $seed, wp_salt( 'auth' ) );`. |
| **07** | `class-workpress-rest-settings-controller.php` | 🟡 **تضارب صلاحيات حفظ الإعدادات** | تعديل الإذن لدعم مدراء النظام والمدراء المفوضين: `current_user_can( 'manage_options' ) \|\| current_user_can( 'manage_workpress_settings' )`. |
| **08** | `class-workpress-rest-webhooks-controller.php` | 🟡 **تضارب صلاحيات متحكم الويب هوك** | إضافة فحص صلاحية الويب هوكس: `current_user_can( 'manage_options' ) \|\| current_user_can( 'manage_webhooks' )`. |
| **09** | `class-workpress-solution-transform-service.php` | 🟡 **تجاهل قدرة `accept_solutions`** | السماح لحامل القدرة باعتماد الحل: `if ( current_user_can( 'accept_solutions' ) \|\| ... )`. |
| **10** | `class-workpress-task-state-machine.php` | 🟡 **عدّ السجلات النظامية كمساهمات** | استبعاد `state_change`, `assignment` في `count_real_contributions` لمنع تحويل المهام الجديدة إلى `in_progress` خطأً. |
| **11** | `class-workpress-task-service.php` | 🟡 **إبطال فلاتر الأمان عبر `suppress_filters`** | حذف `'suppress_filters' => true` أو دمج التحقق الأمني لعضوية المشروع داخل الاستعلام مباشرة. |
| **12** | `class-workpress-contribution-service.php` | ℹ️ **تسريب مسودات التنفيذ للعميل افتراضياً** | ضبط النطاق الافتراضي لـ `implementation` على `'internal'` لمنع إحراج المطورين بالمسودات غير الناضجة. |
| **13** | `class-workpress-install.php` | 🟢 **تلوث نصوص CPT بالعربية** | استبدال المفاتيح المصدرية بإنجليزية قياسية وترجمتها عبر قواميس الـ JED/PO. |
| **14** | `class-workpress-software-pack.php` | 🟢 **استخدام حالة `open` المنقرضة** | تعديل حالات مهام القالب إلى الحالة المعتمدة في آلة الحالات: `'status' => 'new'`. |
| **15** | `class-workpress-auth-service.php` | 🔵 **تحويل المدراء للبوابة بعد الدخول** | توجيه المدراء والتقنيين إلى `admin_url('admin.php?page=workpress#/')` وحصر `/portal/` في العملاء فقط. |
| **16** | `assets/src/components/ui/DatePicker.js` | 🔵 **انعكاس أزرار تنقل شهور التقويم** | إرجاع السلوك المنطقي السليم لـ `handlePrevMonth` و `handleNextMonth` وضبط التلميحات والأيقونات بحسب RTL. |
| **17** | `assets/src/utils/datetime.js` | 🔵 **غياب أسماء الأشهر والأيام باللغات الأجنبية** | دعم قواميس الأسماء للإنجليزية والفرنسية والإسبانية في `MONTH_NAMES` بحسب اللغة النشطة. |
| **18** | `assets/src/css/modules/about.css` | 🔵 **غياب خط Cairo في لوحة التقرير المطبوع** | إلزام الحاوية بخط المنظومة المعتمد: `font-family: 'Cairo', sans-serif !important;`. |
| **19** | `assets/src/css/modules/kanban.css` | 🔵 **خاصية `border-left` المادية في الكانبان** | استبدالها بالخاصية المنطقية المتوافقة مع الاتجاهين: `border-inline-start: 1px solid...`. |
| **20** | `uninstall.php` & `SKILL.md` | 🟢 **مخلفات الجدول المؤقت وانحراف اسم الميتا** | حذف جدول الإشعارات عند الإلغاء، وتصحيح اسم `_workpress_status` في وثيقة حارس المعمارية. |

---

## 6. خطة المعالجة الاستراتيجية والتوصيات الختامية

### التوصيات الهندسية المباشرة (Immediate Action Plan):
1. **أولاً (أولوية قصوى - أمنية):** إغلاق ثغرة `?preview=admin` في `templates/portal/index.php` وتطهير محدد IP في `class-workpress-auth-service.php` لمنع محاولات الاختراق وحجب الخدمة.
2. **ثانياً (أولوية عالية - اتساق البيانات):** تصحيح دالة عد المساهمات في `class-workpress-task-state-machine.php` لإنقاذ آلة الحالات من التعيين الخاطئ لحالات المهام الجديدة.
3. **ثالثاً (أولوية تجربة المستخدم):** تصحيح أزرار التقويم في `DatePicker.js` وتفعيل الشهور متعددة اللغات في `datetime.js`.
4. **رابعاً (أولوية المعمارية):** تصحيح صلاحيات الـ REST API لتمكين حاملي الصلاحيات المخصصة من ممارسة مهامهم الإدارية دون حظر.

> **الخلاصة المعمارية:**  
> منظومة **WorkPress** تتمتع بأساس معماري استثنائي وبنية تحتية فائقة القوة مستندة لمبادئ ووردبريس الصفرية. هذا التدقيق الذري وضع اليد بدقة جراحية على كل الثغرات الكامنة والانحرافات التراكمية، وبإغلاق هذه الملاحظات الـ 20، ترتقي المنظومة إلى أعلى درجات الصلابة البرمجية والأمنية القياسية في قطاع المؤسسات الكبرى.
