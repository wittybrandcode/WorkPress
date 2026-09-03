# 📑 الفهرس المرجعي العام لتوثيق منظومة WorkPress
## WorkPress Master Documentation & Engineering Architecture Hub (v2.3.0-Stable)

> **هذا الملف هو الخريطة المرجعية العليا لكافة وثائق، معمارية، أدلة، ومراجع منظومة WorkPress.**  
> تم تنظيم وتطهير التوثيق بالكامل في **7 محاور هندسية وتاريخية متخصصة** تمثل المرجع المؤسسي والبرمجي المتكامل للمطورين والمنشآت.  
> **الدستور الحاكم الأعلى:** [FIRST_PRINCIPLES.md](core/FIRST_PRINCIPLES.md) | [دستور وركبرس](../../.agents/rules/workpress-constitution.md) | [حارس وركبرس](../../.agents/skills/workpress-guardian/SKILL.md)

---

## 🧭 شجرة المجلدات والتصنيف المعماري المعتمد

```
docs/
├── README.md                                         # (أنت هنا) الفهرس المرجعي العام الشامل
│
├── 🏛️ core/                                         # 1. النواة التأسيسية والدستور المعماري الدائم
│   ├── FIRST_PRINCIPLES.md                          # الدستور المعماري الأعلى غير القابل للكسر (المبادئ الـ 21 + الملاحق التكميلية)
│   ├── ARCHITECTURE.md                              # الهيكل المعماري والتقني الشامل ونماذج الحقيقة
│   ├── GOVERNANCE_AND_CITIZENSHIP_SPECIFICATION.md   # 👑 مواصفة الحوكمة وهرم المواطنة الرباعي والتفويض الثلاثي
│   ├── PRD.md                                       # وثيقة متطلبات وتحديد ملامح المنتج
│   ├── SYSTEM_SYNTHESIS_AND_ONTOLOGY_STUDY.md       # دراسة التركيب والأنطولوجيا الكلية للكيانات
│   ├── SYSTEM_MAINTAINABILITY_AND_HARDENING_REPORT.md # خطة منهجة النظام وقابلية الصيانة والتطوير المستدام
│   └── WEBHOOKS_AND_INTEGRATIONS_ARCHITECTURE.md     # ⚡ المعمارية البرمجية الشاملة لمحرك خطافات الويب
│
├── 🔌 api/                                          # 2. مراجع المطورين والـ API للتكامل والتوسع البرمجي
│   ├── REST_API_REFERENCE.md                        # 🌐 المرجع الكامل لـ 45+ نقطة نهاية REST API والمصادقة ونماذج JSON
│   ├── HOOKS_AND_FILTERS.md                         # 🪝 مرجع كافة الخطافات (do_action) والفلاتر (apply_filters)
│   └── SERVICES_REFERENCE.md                        # ⚙️ المرجع المعماري لخدمات النواة الـ 17 ودوالها العامة
│
├── 📖 guides/                                       # 3. الأدلة التشغيلية ودليل المطور الشامل
│   ├── DEVELOPER_GUIDE.md                           # 🛠️ دليل المطور، إعداد البيئة، الاختبارات، ومعايير الكود
│   ├── CLIENT_PORTAL_GUIDE.md                       # 🏢 دليل بوابة ومساحة المستفيدين المستقلة، العزل البصري، والتوقيع الرقمي
│   ├── DYNAMIC_FORMS_GUIDE.md                       # 📝 دليل نماذج استقبال الطلبات الديناميكية واستوديو الفرز
│   ├── WEBHOOKS_INTEGRATION_GUIDE.md                # 🔗 دليل التكامل مع Discord و Slack و Teams و Make.com
│   ├── COWORKPRESS_USER_GUIDE.md                    # 🧭 الدليل التشغيلي السردي لغرفة عمليات CoWorkPress والكانبان
│   └── visual-guides/                               # 🌟 المحاكيات البصرية التفاعلية (HTML Explorers)
│       ├── workpress-visual-guide.html
│       ├── client-portal-visual-guide.html
│       └── dynamic-request-forms-visual-guide.html
│
├── 🎨 design-system/                                # 4. نظام التصميم المؤسسي والهندسة الحادة (0px Sharp)
│   ├── DESIGN_SYSTEM_GUIDELINES.md                  # دليل نظام التصميم، معايير 0px، لوحة الألوان، وخط Cairo
│   ├── COMPONENT_CATALOG.md                         # كتالوج مكونات Preact 18 والخصائص (Props Contracts)
│   └── BRAND_IDENTITY_GUIDELINES.md                 # دليل الهوية البصرية، الشعار، والرموز الرسمية
│
├── 🛡️ audits/                                       # 5. تقرير التدقيق المعماري والأمني الشامل
│   ├── ARCHITECTURE_AND_SECURITY_AUDIT.md           # 🔍 التقرير المعتمد لجودة الكود، الأمان، ونتائج الاختبارات 100%
│   └── ATOMIC_EXPERT_SYSTEM_AUDIT_REPORT.md         # 🔍 تقرير فحص ومطابقة القدرات والخطافات الذرية
│
├── 🚀 roadmap/                                      # 6. خريطة الآفاق والابتكارات المستقبلية (v3.0+)
│   └── FUTURE_HORIZONS.md                           # 🧠 محرك الذكاء الاصطناعي المؤسسي RAG وحزم القطاعات المتخصصة
│
└── 🗄️ archive/                                      # 7. الأرشيف التاريخي للخطط والترقيات المنفذة
    └── plans/                                       # وثائق الخطط التنفيذية المنجزة السابقة
```

---

## 📚 تفصيل محتويات الأقسام المعتمدة

### 1. 🏛️ النواة والمعمارية التأسيسية (`docs/core/`)
* [FIRST_PRINCIPLES.md](core/FIRST_PRINCIPLES.md): **الوثيقة الأعلى سلطة في المشروع** — تتضمن المبادئ الـ 21 غير القابلة للكسر وقواعد اتخاذ القرار الهندسي.
* [ARCHITECTURE.md](core/ARCHITECTURE.md): الهيكلية التقنية وكيفية ترسيخ نماذج ووردبريس الأصلية (Taxonomy, CPT, Comments) كمصدر وحيد للحقيقة (Native Zero-Table).
* [GOVERNANCE_AND_CITIZENSHIP_SPECIFICATION.md](core/GOVERNANCE_AND_CITIZENSHIP_SPECIFICATION.md): مواصفة الحوكمة، هرم المواطنة الرباعي، ومعادلة التفويض الثلاثي الصارمة.
* [PRD.md](core/PRD.md): وثيقة مواصفات المنتج الأساسية، وحالات الاستخدام، والحدود التشغيلية.
* [SYSTEM_SYNTHESIS_AND_ONTOLOGY_STUDY.md](core/SYSTEM_SYNTHESIS_AND_ONTOLOGY_STUDY.md): التركيب الأنطولوجي الشامل لكافة مفاهيم العمل والمساهمة والذاكرة.
* [SYSTEM_MAINTAINABILITY_AND_HARDENING_REPORT.md](core/SYSTEM_MAINTAINABILITY_AND_HARDENING_REPORT.md): استراتيجية منهجة النظام وقابلية الصيانة والتطوير المستدام.
* [WEBHOOKS_AND_INTEGRATIONS_ARCHITECTURE.md](core/WEBHOOKS_AND_INTEGRATIONS_ARCHITECTURE.md): التوثيق البرمجي والمعماري لمحرك خطافات الويب والتكامل المؤسسي.

---

### 2. 🔌 مراجع المطورين والـ API (`docs/api/`)
* [REST_API_REFERENCE.md](api/REST_API_REFERENCE.md): 🌐 **المرجع الكامل والشامل لواجهة الـ REST API** (45+ نقطة نهاية، الترويسات، المصادقة، مصفوفات الصلاحيات، وحمولات JSON).
* [HOOKS_AND_FILTERS.md](api/HOOKS_AND_FILTERS.md): 🪝 **مرجع الخطافات والفلاتر البرمجية** لكافة أحداث المهام، المساهمات، المشاريع، ونقاط التعديل.
* [SERVICES_REFERENCE.md](api/SERVICES_REFERENCE.md): ⚙️ **المرجع المعماري لطبقة الخدمات المركزية الـ 17** ودوالها العامة وعقود تبادل البيانات.

---

### 3. 📖 الأدلة التشغيلية ودليل المطور (`docs/guides/`)
* [DEVELOPER_GUIDE.md](guides/DEVELOPER_GUIDE.md): 🛠️ **دليل المطور والمساهمة البرمجية** (إعداد البيئة، تشغيل حزم الاختبارات PHP CLI، معايير الكود، وضوابط التوسعة).
* [CLIENT_PORTAL_GUIDE.md](guides/CLIENT_PORTAL_GUIDE.md): 🏢 **دليل بوابة ومساحة المستفيدين المستقلة** (العزل البصري Zero CSS Bleed، دورة حياة الطلبات، والتوقيع الرقمي بـ SHA-256).
* [DYNAMIC_FORMS_GUIDE.md](guides/DYNAMIC_FORMS_GUIDE.md): 📝 **دليل نماذج استقبال الطلبات الديناميكية** (المخطط التجريدي JSON Schema واستوديو الفرز الإداري).
* [WEBHOOKS_INTEGRATION_GUIDE.md](guides/WEBHOOKS_INTEGRATION_GUIDE.md): 🔗 **دليل التكامل الخارجي** وربط الـ Webhooks مع Discord و Slack و Teams و Make.com.
* [COWORKPRESS_USER_GUIDE.md](guides/COWORKPRESS_USER_GUIDE.md): 🧭 **الدليل التشغيلي السردي الشامل** للوحة التحكم، الكانبان، ومخطط جانت وتتبع الوقت.
* [visual-guides/](guides/visual-guides/): 🌟 **المحاكيات البصرية التفاعلية (HTML)** لاستعراض رحلة العمل والبوابات بأسلوب تفاعلي.

---

### 4. 🎨 نظام التصميم المؤسسي والهندسة الحادة (`docs/design-system/`)
* [DESIGN_SYSTEM_GUIDELINES.md](design-system/DESIGN_SYSTEM_GUIDELINES.md): معايير نظام التصميم، فلسفة الزوايا الحادة 0px، خط Cairo، ولوحة الألوان.
* [COMPONENT_CATALOG.md](design-system/COMPONENT_CATALOG.md): كتالوج مكونات Preact 18، الخصائص (Props)، وأنماط الواجهة الأمامية.
* [BRAND_IDENTITY_GUIDELINES.md](design-system/BRAND_IDENTITY_GUIDELINES.md): دليل الهوية البصرية، الشعار، والأصول الرسمية.

---

### 5. 🛡️ التدقيق والمراجعة المعمارية (`docs/audits/`)
* [ARCHITECTURE_AND_SECURITY_AUDIT.md](audits/ARCHITECTURE_AND_SECURITY_AUDIT.md): 🔍 **التقرير المعماري والأمني الشامل** ونتائج الفحص الآلي وحزم الاختبارات (100% Pass Rate).

---

### 6. 🚀 خريطة الآفاق والابتكارات المستقبلية (`docs/roadmap/`)
* [FUTURE_HORIZONS.md](roadmap/FUTURE_HORIZONS.md): 🧠 **خريطة الإصدارات الكبرى القادمة (v3.0+)**، محرك الذكاء الاصطناعي المبني على المعرفة الحقيقية (RAG)، وحزم القطاعات المتخصصة (Office Packs).

---

### 7. 🗄️ الأرشيف التاريخي للخطط والترقيات (`docs/archive/`)
* [archive/plans/](archive/plans/): 📁 **الأرشيف التاريخي للخطط التنفيذية المكتملة بنجاح**، متضمناً خطة التدقيق الذري الشامل، خطة التدويل والتعريب الكبرى، وخطة تطوير التقارير والمساهمات ومعمارية أشرطة الأدوات الموحدة.

---
*تم تنقيح وبناء هذا التوثيق ليمثل المرجع الهندسي القياسي لـ WorkPress v2.3.0-Stable.*
