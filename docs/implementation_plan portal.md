# [خطة التطوير والتنفيذ: حوكمة مساحة العميل والتكامل المعرفي الشامل]

تحديث وتثبيت البنية المعمارية لبوابة العميل (Client Portal) وتحويلها إلى مساحة تفاعلية رصينة، مع تطبيق حوكمة صارمة تعزل رتبة العميل عن التكليف بالمهام، وتزويد المساهمات بنطاق رؤية مخصص (`visibility_scope`)، وتفعيل قنوات التنبيه الشخصية للزبون (Personal Webhooks).

## User Review Required

> [!IMPORTANT]
> **القرارات المعمارية المحدثة والمعتمدة:**
> 1. **عزل العميل عن التكليف (Assignment Isolation):** استبعاد رتبة `workpress_client` و `viewer` من التكليف برمجياً في الـ Backend (`WorkPress_Assignment_Service`) والـ Frontend (`TaskAssignmentModal.js`).
> 2. **نطاق رؤية المساهمات (`_workpress_visibility_scope`):** دعم تمييز المساهمة كـ "داخلية للفريق فقط" (`internal`) أو "متاحة لمراجعة العميل" (`client_review`) لضمان عدم عرض المسودات التقنية غير الجاهزة للعميل.
> 3. **تفعيل قنوات العميل الفردية (Personal Webhook Dispatch):** إرسال تنبيهات مباشرة لـ Webhook العميل الشخصي (`_workpress_webhook_url`) عند إيداع تسليم جديد أو اعتماد حل لمشروعه.
> 4. **فصل مسار الطلبات عن المشاريع (Requests vs Projects):** دعم تبويبي المشاريع والطلبات المستقلين مع Stepper متابعة المراحل.

---

## Proposed Changes

### Core & Services

#### [MODIFY] [class-workpress-keys.php](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/core/class-workpress-keys.php)
- إضافة مفتاح الميتاداتا `META_VISIBILITY_SCOPE = '_workpress_visibility_scope'` وقيم الثوابت `VISIBILITY_INTERNAL` و `VISIBILITY_CLIENT`.

#### [MODIFY] [class-workpress-contribution-service.php](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php)
- تحديث `add_contribution()` لحفظ `_workpress_visibility_scope`.
- تحديث `format_contribution()` لتضمين `visibility_scope`.

#### [MODIFY] [class-workpress-portal-service.php](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php)
- تنقية قائمة المخرجات المرشحة في `get_project_candidate_deliverables()` لاستبعاد المساهمات ذات النطاق الداخلي (`internal`).

#### [MODIFY] [class-workpress-webhook-service.php](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php)
- إضافة دالة `dispatch_client_personal_webhook($client_user_id, $event_key, $data)` لإرسال التنبيهات لرابط الويب هوك الخاص بالعميل وتوقيعه بـ HMAC SHA-256.

#### [MODIFY] [class-workpress-notification-hooks.php](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/modules/notifications/class-workpress-notification-hooks.php)
- ربط إطلاق الويب هوك الخاص بالعميل عند إضافة تسليم موجه للعميل أو اعتماد حل رسمي أو توقيع المشروع.

---

### Components & Frontend

#### [MODIFY] [TaskAssignmentModal.js](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/TaskAssignmentModal.js)
- التأكد من استبعاد أي عضو يحمل رتبة `workpress_client` أو `viewer` من قائمة التكليف بالمهام.

#### [MODIFY] [ContributionModal.js](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/components/ContributionModal.js)
- إضافة خيار تحديد نطاق الرؤية (متاح لمراجعة العميل 🌐 / داخلي للفريق فقط 🔒) وتمريره مع حمولة إنشاء المساهمة.

#### [MODIFY] [TaskDetailPage.js](file:///C:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/pages/TaskDetailPage.js)
- إضافة محدد نطاق الرؤية في نموذج إضافة المساهمة الفوري داخل تفاصيل المهمة.

---

## Verification Plan

### Automated Checks
- تشغيل فحص أخطاء لغة PHP (Linting) على كافة الملفات المعدلة:
  ```powershell
  & "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" -l wp-content/plugins/WorkPress/includes/core/class-workpress-keys.php
  & "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" -l wp-content/plugins/WorkPress/includes/services/class-workpress-contribution-service.php
  & "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" -l wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php
  & "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" -l wp-content/plugins/WorkPress/includes/services/class-workpress-webhook-service.php
  & "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe" -l wp-content/plugins/WorkPress/includes/modules/notifications/class-workpress-notification-hooks.php
  ```

### Manual Verification
1. **اختبار نطاق الرؤية:** إضافة مساهمة بنطاق `internal` ومساهمة بنطاق `client_review`، وفتح بوابة العميل للتأكد من ظهور مساهمة `client_review` فقط واختفاء الـ `internal`.
2. **اختبار التكليف:** فتح نافذة إسناد المهمة والتأكد من عدم ظهور مستخدمي رتبة `workpress_client`.
3. **اختبار ويب هوك العميل الشخصي:** إدخال رابط Webhook في إعدادات العميل واختبار وصول التنبيه عند اعتماد تسليم.
