# 🛠️ دليل المطور والمساهمة البرمجية (WorkPress Developer & Contribution Guide)
## Setup, Architecture Conventions, Testing Suites, Coding Standards & Extension Workflows

> **نوع الوثيقة:** الدليل العملي والهندسي الشامل للمطورين والمساهمين في منظومة WorkPress  
> **الإصدار المعتمد:** WorkPress v2.2.1-Stable  
> **المرجع الحاكم:** [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md) | [دستور وركبرس](../../.agents/rules/workpress-constitution.md)

---

## 🧭 1. فلسفة البناء والتطوير (Engineering Principles)

تم بناء منظومة **WorkPress** وفق معايير هندسية متقدمة ترتكز على:
1. **النموذج الأصيل في ووردبريس (Native Zero-Table):** لا جداول SQL مخصصة. البيانات تخزن في `Taxonomy` و `CPT` و `Comments`.
2. **معمارية الواجهة الأمامية بدون تجميع (No-Build Preact 18 SPA + HTM):**
   - تعمل لوحة التحكم بنظام Single Page Application (SPA) عالي السرعة مبني بـ Preact 18 و HTM عبر وحدات ES Modules المباشرة في المتصفح.
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
│   ├── services/                         # طبقة الخدمات الـ 17 المركزية (Domain Logic)
│   ├── api/                              # متحكمات REST API (14 Controllers)
│   ├── hooks/                            # موزع الخطافات والأحداث (Hooks & Events)
│   ├── admin/                            # تهيئة لوحة التحكم وتمرير الإعدادات
│   └── modules/                          # الوحدات المتخصصة (الإشعارات، الويب هوكس)
│
├── assets/                               # طبقة الـ Frontend (No-Build SPA)
│   ├── css/                              # ملفات التنسيق المقطعية (admin.css, portal.css, kanban.css, ...)
│   ├── src/                              # مكونات Preact 18 (Components, Pages, App.js)
│   │   ├── components/                   # المكونات الذرية (KanbanColumn, TaskCard, Modal, ...)
│   │   ├── pages/                        # الصفحات الرئيسية (Plaza, Kanban, Gantt, Knowledge, ...)
│   │   └── App.js                        # مجمع وموجه التطبيق الرئيسي
│   └── brand/                            # شعارات وهوية المنظومة الرسمية
│
├── docs/                                 # المرجع التوثيقي العالمي الشامل
│   ├── core/                             # الدستور والمبادئ الـ 21 ونماذج الحقيقة
│   ├── api/                              # مراجع الـ REST API والخطافات والخدمات
│   ├── guides/                           # الأدلة التشغيلية ودليل المطور
│   ├── design-system/                    # نظام التصميم ومعايير 0px
│   ├── audits/                           # تقرير الفحص والتدقيق المعماري
│   └── roadmap/                          # آفاق المستقبل للإصدارات الكبرى
│
└── tests/                                # حزم الاختبارات والتحقق الآلي
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

### 1. تشغيل اختبار دورة الحياة الشامل (Full E2E Lifecycle):
```powershell
php tests/test_e2e_lifecycle.php
```
*يختبر تدفق العمل من لحظة تقديم العميل لطلب المشروع، اعتماده من الإدارة، إنشاء المهمة في الكانبان، تسليم الحل من المتخصص، مراجعة العميل وتوقيعه بـ SHA-256، وتوليد التقرير التنفيذي.*

### 2. تشغيل فحص الصياغة البرمجية (Linter):
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
