# خطة التقسيم المعماري الشامل وتجريد التصميم لبوابة المستفيدين (WorkPress Portal)
## Full Portal Modularization, CSS Separation & Clean Architecture Plan

> **الهدف الاستراتيجي**: تحويل بوابة وركبرس المستقلة (`/portal/`) من نمط الكتل المدمجة والـ Inline Styles (`style="..."`) إلى معمارية موديولية قياسية مفصولة بنسبة 100% (Clean Separation of Concerns)، بحيث يُجرّد كود الـ JavaScript تماماً من التصميم الداخلي، وتتحول المكونات إلى هياكل دلالية (Semantic HTML)، ويتقلص المتحكم الرئيسي `portal-app.js` إلى أقل من 150 سطراً لإدارة الحالة والراوتر فقط.

---

## 📊 بطاقة متابعة حالة التنفيذ (Execution Progress Matrix)

| المرحلة | اسم المرحلة ونطاق العمل | المخرجات المستهدفة | الحالة الحالية |
|---|---|---|:---:|
| **المرحلة 1** | استخراج كلاسات التصميم وتجريد `portal.css` | توسيع `assets/css/portal.css` بكلاسات BEM معيارية | ⏳ في انتظار المراجعة |
| **المرحلة 2** | استخراج شاشة تسجيل الدخول المستقلة | إنشاء `assets/src/portal/portal-login.js` | ⏳ في انتظار المراجعة |
| **المرحلة 3** | استخراج الترويسة المؤسسية وشريط التنقل | إنشاء `assets/src/portal/portal-header.js` | ⏳ في انتظار المراجعة |
| **المرحلة 4** | تطهير الموديولات المستخرجة من الـ Inline Styles | تنظيف `portal-workspace.js`, `portal-request.js`, `portal-radar.js`, `portal-gateway.js`, `portal-modals.js` | ⏳ في انتظار المراجعة |
| **المرحلة 5** | إعادة هيكلة المتحكم الرئيسي `portal-app.js` | تقليص `portal-app.js` ليصبح < 150 سطر (Pure State & Router) | ⏳ في انتظار المراجعة |
| **المرحلة 6** | تسجيل الاعتمادات والاختبار الشامل | تحديث `index.php` وخدمات الـ PHP وتشغيل حزمة الـ E2E الكاملة | ⏳ في انتظار المراجعة |

---

## 🏛️ المبادئ المعمارية الحاكمة في الخطة (Guardian Rules)

1. **حظر الـ Inline Styles داخل الـ JS**:
   - منع استخدام أي `style="..."` داخل قوالب الـ HTM/Preact، واستبدالها بكلاسات معرفة مسبقاً في `portal.css`.
2. **الصرامة في هوية النظام (Design Tokens)**:
   - الحفاظ التام على الحواف الحادة (`0px border-radius`).
   - خط `Cairo` للنصوص و `Plus Jakarta Sans` للمؤشرات والأرقام.
   - أيقونات `dashicons-*` الرسمية بدون أي Unicode Emojis.
3. **التفكيك التدريجي غير الكاسر (Non-Breaking Incremental Extraction)**:
   - تنفيذ كل مرحلة واختبارها وضمان عمل البوابة وعدم انهيار أي شاشة قبل الانتقال للمرحلة التالية.
4. **تثبيت الاعتمادات في `window.WorkPressPortal`**:
   - جميع الموديولات المستخرجة تسجل دوال العرض في الـ namespace المركزي لضمان التوافق مع بيئة Zero-Build Preact UMD.

---

## 🛠️ التفاصيل الفنية لمراحل التنفيذ الست

```
assets/src/portal/
├── portal-core.js        # [موجود] أدوات API، محرك الصوت، الشعار
├── portal-login.js       # [جديد - مرحلة 2] واجهة تسجيل الدخول والتحقق
├── portal-header.js      # [جديد - مرحلة 3] الترويسة المؤسسية، الإشعارات، القوائم والتبويبات
├── portal-gateway.js     # [موجود - مرحلة 4] بوابة الترحيب (مطهرة من الـ Inline CSS)
├── portal-radar.js       # [موجود - مرحلة 4] الرادار التنفيذي (مطهر من الـ Inline CSS)
├── portal-modals.js      # [موجود - مرحلة 4] نافذة التقرير (مطهرة من الـ Inline CSS)
├── portal-request.js     # [موجود - مرحلة 4] استوديو الطلبات (مطهر من الـ Inline CSS)
├── portal-workspace.js   # [موجود - مرحلة 4] مساحة العمل (مطهرة من الـ Inline CSS)
└── portal-app.js         # [مرحلة 5] متحكم رشيق < 150 سطر للحالة والتوجيه فقط
```

---

### 🔹 المرحلة الأولى: هندسة ملف الـ CSS وتجريد التوكنات (`assets/css/portal.css`)
- **الهدف**: تزويد ملف `assets/css/portal.css` بجميع الكلاسات الهيكلية والألوان والتخطيط اللازمة لحذف كل كود CSS مضمن في الجافا سكريبت.
- **الكلاسات المضافة**:
  - كلاسات شاشة الدخول: `.portal-login-canvas`, `.portal-login-card`, `.portal-login-title`, `.portal-login-alert`
  - كلاسات الترويسة: `.portal-top-bar`, `.portal-brand-area`, `.portal-user-controls`, `.portal-avatar-box`, `.portal-profile-item`
  - كلاسات مساحة العمل: `.portal-kpi-grid`, `.portal-kpi-card`, `.portal-vault-item`, `.portal-milestone-card`
  - كلاسات التنبيهات: `.portal-toast-alert`, `.portal-notification-item`, `.portal-notification-unread`

---

### 🔹 المرحلة الثانية: استخراج شاشة تسجيل الدخول (`portal-login.js`)
- **الملف الجديد**: [`assets/src/portal/portal-login.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-login.js)
- **المسؤولية**:
  - تصدير `window.WorkPressPortal.renderLoginCanvas(ctx)`
  - عرض كارت تسجيل الدخول والشعار الرسمي وحقول الإدخال ورسائل الخطأ
  - استخدام كلاسات CSS دلالية فقط (0 سطر CSS مضمن)

---

### 🔹 المرحلة الثالثة: استخراج الترويسة وشريط التنقل (`portal-header.js`)
- **الملف الجديد**: [`assets/src/portal/portal-header.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-header.js)
- **المسؤولية**:
  - تصدير `window.WorkPressPortal.renderPortalHeader(ctx)`
  - الترويسة العلوية والشعار وروابط الموقع
  - زر الإشعارات ودرج التنبيهات الفوري مع تلوين غير المقروء وتحديد الكل
  - قائمة البروفايل المنسدلة وروابط غرفة العمليات والخروج
  - شريط الأزرار التفاعلية (زر طلب جديد + القائمة المنسدلة لتبديل المشروع النشط)
  - شريط التبويبات الأربعة (المخرجات، المراحل، الملاحظات، سجل الطلبات)

---

### 🔹 المرحلة الرابعة: تطهير الموديولات المستخرجة من الـ Inline Styles
- **الملفات المستهدفة**:
  1. [`portal-gateway.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-gateway.js)
  2. [`portal-radar.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-radar.js)
  3. [`portal-modals.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-modals.js)
  4. [`portal-request.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-request.js)
  5. [`portal-workspace.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-workspace.js)
- **الإجراء**: استبدال كافة وسوم `style="..."` بكلاسات الـ CSS من `portal.css`.

---

### 🔹 المرحلة الخامسة: إعادة هيكلة وتخفيف `portal-app.js` (< 150 سطر)
- **الملف المستهدف**: [`assets/src/portal/portal-app.js`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/assets/src/portal/portal-app.js)
- **المسؤولية الجديدة**:
  - إدارة حالة المكون (`state`)
  - معالجة التوجيه وتغير الـ URL Hash
  - استدعاء دوري للـ Pulse والإشعارات المباشرة
  - تفويض الـ `render()` بالكامل إلى المكونات المستخرجة:
    ```javascript
    render() {
        if (!this.state.isLoggedIn) {
            return window.WorkPressPortal.renderLoginCanvas(this.getLoginContext());
        }
        if (this.state.inGatewayTransition) {
            return window.WorkPressPortal.renderSmartGatewayCard(this.getGatewayContext());
        }
        if (this.state.executiveType !== 'client' && !this.state.isPreviewAsClient) {
            return window.WorkPressPortal.renderExecutiveRadar(this.getRadarContext());
        }
        return html`
            <div class="portal-app-wrapper">
                ${window.WorkPressPortal.renderPortalHeader(this.getHeaderContext())}
                <main class="portal-container">
                    ${this.renderActiveView()}
                </main>
                ${window.WorkPressPortal.renderProjectReportModal(this.getReportModalContext())}
            </div>
        `;
    }
    ```

---

### 🔹 المرحلة السادسة: تسجيل الاعتمادات والاختبار الشامل
- **التسجيل**:
  - تحديث [`templates/portal/index.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/templates/portal/index.php)
  - تحديث [`includes/services/class-workpress-portal-service.php`](file:///c:/laragon/www/WORKPRESS/wp-content/plugins/WorkPress/includes/services/class-workpress-portal-service.php)
- **ترتيب التحميل النهائي**:
  1. `preact.umd.js`
  2. `hooks.umd.js`
  3. `htm.umd.js`
  4. `portal-core.js`
  5. `portal-login.js`
  6. `portal-header.js`
  7. `portal-gateway.js`
  8. `portal-radar.js`
  9. `portal-modals.js`
  10. `portal-request.js`
  11. `portal-workspace.js`
  12. `portal-app.js`

---

## 🧪 خطة التحقق والاختبار (Verification Plan)

1. **فحص خلو ملفات الـ JS من الـ Syntax Errors**:
   ```powershell
   node --check assets/src/portal/portal-core.js assets/src/portal/portal-login.js assets/src/portal/portal-header.js assets/src/portal/portal-gateway.js assets/src/portal/portal-radar.js assets/src/portal/portal-modals.js assets/src/portal/portal-request.js assets/src/portal/portal-workspace.js assets/src/portal/portal-app.js
   ```
2. **فحص الـ Inline CSS في ملفات الـ JS**:
   - تشغيل grep للتأكد من انعدام وسوم `style=` في كافة ملفات `assets/src/portal/*.js`.
3. **تشغيل حزمة الاختبارات الآلية E2E**:
   ```powershell
   C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe tests/test_e2e_lifecycle.php
   C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe tests/test_auth_service.php
   ```
4. **تثبيت كل مرحلة بالتزام ذري في Git**.
