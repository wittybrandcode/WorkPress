# 🛠️ دليل المطور والمساهمة البرمجية (WorkPress Developer & Contribution Guide)
## Setup, Architecture Conventions, Testing Suites, Coding Standards & Extension Workflows

> **نوع الوثيقة:** الدليل العملي والهندسي الشامل للمطورين والمساهمين في منظومة WorkPress  
> **الإصدار المعتمد:** WorkPress v1.0.0-Stable  
> **المرجع الحاكم:** [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md) | [دستور وركبرس](../../.agents/rules/workpress-constitution.md)

---

## 🧭 1. فلسفة البناء والتطوير (Engineering Principles)

تم بناء منظومة **WorkPress** وفق معايير هندسية متقدمة ترتكز على:
1. **النموذج الأصيل في ووردبريس (Native Zero-Table):** لا جداول SQL مخصصة. البيانات تخزن في `Taxonomy` و `CPT` و `Comments`.
2. **معمارية الواجهة الأمامية بدون تجميع (No-Build Preact 18 SPA + HTM):**
   - تعمل لوحة التحكم بنظام Single Page Application (SPA) عالي السرعة مبني بـ Preact 18 و HTM عبر وحدات ES Modules المباشرة في المتصفح (136 موديولاً).
   - **الميزة الكبرى:** صفر تعقيد في الـ Build Step، وتعديل فوري للكود دون الحاجة لأي عمليات Webpack أو Vite في بيئة الإنتاج.
3. **نظام التصميم فائق الكثافة (0px Sharp Geometry):**
   - حظر الحواف المنحنية (`border-radius: 0px`).
   - خط **Cairo** المعتمد للعربية والأرقام الغربية (`1, 2, 3...`).
   - حظر أيقونات الصور أو SVG المجهولة والاعتماد الحصري على أيقونات `dashicons-*` الرسمية لضمان التوافق والأداء.

---

## 💻 2. إعداد بيئة التطوير المحلية (Local Development Setup)

### المتطلبات الأساسية:
* **PHP:** 8.0 أو 8.1 أو 8.2 أو 8.3+.
* **WordPress:** 6.0 إلى 6.7+ (أو أحدث).
* **خادم الويب:** Apache / Nginx / Laragon / LocalWP مع تفعيل الروابط الدائمة (Pretty Permalinks).

### مسار التثبيت:
انسخ مستودع الإضافة داخل مجلد إضافات ووردبريس:
```bash
cd wp-content/plugins/
git clone https://github.com/wittybrandcode/WorkPress.git
```

---

## 🗂️ 3. الهيكل الشجري للمشروع (Project Structure)

```
WorkPress/
├── workpress.php                         # نقطة الدخول الرئيسية للإضافة
├── CHANGELOG.md                          # سجل التغييرات الرسمي
├── README.md                             # الوثيقة الرئيسية (عربي / إنجليزي)
│
├── includes/                             # طبقة الـ Backend (PHP)
│   ├── core/                             # النواة والمفاتيح والتثبيت (Keys, Install, Roles)
│   ├── services/                         # طبقة الخدمات الـ 18 المركزية (Domain Logic)
│   ├── api/                              # متحكمات REST API (15 Controllers)
│   ├── hooks/                            # موزع الخطافات والأحداث (Hooks & Events)
│   ├── admin/                            # تهيئة لوحة التحكم وتمرير الإعدادات
│   └── modules/                          # الوحدات المتخصصة (الإشعارات، الويب هوكس)
│
├── assets/                               # طبقة الـ Frontend (No-Build SPA)
│   ├── css/                              # ملفات التنسيق المقطعية (admin.css, portal.css, kanban.css, ...)
│   ├── src/                              # مكونات Preact 18 (136 ES Modules)
│   │   ├── components/                   # المكونات الذرية (KanbanColumn, TaskCard, BroadcastTicker, ...)
│   │   ├── pages/                        # الصفحات الرئيسية (Plaza, Kanban, Gantt, Broadcasts, ...)
│   │   └── App.js                        # مجمع وموجه التطبيق الرئيسي
│   └── brand/                            # شعارات وهوية المنظومة الرسمية
│
├── docs/                                 # المرجع التوثيقي العالمي الشامل
│   ├── core/                             # الدستور والمبادئ الـ 21 ونماذج الحقيقة
│   ├── api/                              # مراجع الـ REST API والخطافات والخدمات
│   ├── guides/                           # الأدلة التشغيلية ودليل المطور
│   ├── design-system/                    # نظام التصميم ومعايير 0px
│   ├── audits/                           # تقرير الفحص والتدقيق المعماري وجاهزية الإصدار
│   ├── roadmap/                          # آفاق المستقبل للإصدارات الكبرى
│   └── archive/                          # الأرشيف التاريخي للخطط المنفذة
│
└── tests/                                # حزم الاختبارات والتحقق الآلي
    ├── validate_all_es_modules.php       # فحص النحو لجميع موديولات الـ ES الـ 136
    ├── verify_i18n_full_parity.php       # فحص التطابق اللغوي الكامل لـ 2,269 مفتاحاً
    ├── test_e2e_lifecycle.php            # فحص دورة الحياة الكاملة للمشروع
    ├── test_auth_service.php             # فحص بوابة الدخول والتوجيه
    ├── test_time_tracking.php            # فحص تتبع الوقت والتقديرات
    ├── test_task_checklists.php          # فحص قوائم الفحص والمهام الفرعية
    ├── test_multi_attachments.php        # فحص المرفقات المتعددة
    └── test_gantt_chart.php              # فحص محرك مخطط جانت والجدولة
```

---

## 🧪 4. تشغيل حزم الاختبارات الآلية (Testing Suite)

توفر المنظومة حزم اختبارات ذاتية شاملة مكتوبة بـ PHP CLI لا تتطلب أي أدوات معقدة:

### 1. فحص سلامة كافة موديولات ES Modules الـ 136:
```powershell
php tests/validate_all_es_modules.php
```

### 2. فحص التطابق اللغوي الكامل لجميع اللغات الـ 4 (i18n Full Parity):
```powershell
php tests/verify_i18n_full_parity.php
```

### 3. تشغيل اختبار دورة الحياة الشامل (Full E2E Lifecycle):
```powershell
php tests/test_e2e_lifecycle.php
```

### 4. تشغيل فحص الصياغة البرمجية لملفات PHP (Linter):
```powershell
Get-ChildItem -Recurse -Filter "*.php" | ForEach-Object { php -l $_.FullName }
```

---

## 📝 5. ضوابط كتابة الكود والمساهمة البرمجية (Contribution Standards)

عند إضافة أي ميزة أو تعديل كود، يجب الالتزام الصارم بالقواعد التالية:

1. **المرور حصراً عبر طبقة الخدمات (`Services Layer`):**
   - لا تستدعِ دوال `wp_insert_post` أو `update_post_meta` من متحكمات الـ API مباشرة؛ بل أنشئ دالة في الخدمة المختصة (`WorkPress_*_Service`) واستدعها من المتحكم.
2. **الأمان ومصادقة الـ Nonce والصلاحيات:**
   - تحقق دائماً من الصلاحية الذرية في `permission_callback`.
   - تحقق من صحة وتطهير كافة المدخلات (`sanitize_text_field`, `absint`, `esc_url_raw`).
3. **حظر الانهيارات الصامتة في الواجهة (Promise Safety):**
   - يجب إغلاق كافة استدعاءات `apiFetch` في Preact بكتل `.catch()` واستعادة حالة التحميل `setLoading(false)` لضمان عدم تجمد الأزرار.
4. **توليد الأحداث (Fire Hooks):**
   - عند حدوث أي تغيير في حالة كيان، أطلق الحدث المناسب عبر `WorkPress_Hooks` لتحديث الـ Webhooks وسجلات التدقيق التراكمية.

---
*تم إعداد هذا الدليل لتمكين أي مطور من الانطلاق والإنتاجية الفورية بأعلى درجات الاحترافية.*
