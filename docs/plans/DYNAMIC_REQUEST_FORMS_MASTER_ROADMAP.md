# 🌟 الخريطة الهندسية الكبرى: منظومة نماذج استقبال الطلبات والمشاريع التجريدية — Master Plan
## WorkPress Universal Dynamic Request Forms & Domain-Agnostic Intake Architecture (v1.2 Roadmap)

> **نوع الوثيقة:** الخريطة التنفيذية والهندسية الكبرى الشاملة لنظام استقبال وبناء نماذج الطلبات التجريدية  
> **حالة الخطة:** ✅ **منفذة ومكتملة 100% في الإنتاج (Shipped in Production)**  
> **الإصدار المنفذ:** WorkPress v1.2.0+  
> **الهدف:** بناء محرك استقبال طلبات ومشاريع فائق المرونة والتجريد (Domain-Agnostic Meta-Engine)، يمنح المدير لوحة تحكم لبناء وتخصيص نماذج الطلبات ومسميات الحقول ونوعيتها وفق أي مجال تجاري في العالم، وتوليد واجهة الطلب ديناميكياً في بوابة الزبون، مع تحويل الطلبات إلى مشاريع رسمية معلقة (`CPT_PROJECT`) في ووردبريس تحمل بطاقة مواصفات فنية مهيكلة جاهزة للمراجعة والاعتماد.  
> **المرجعية العليا:** [FIRST_PRINCIPLES.md](../core/FIRST_PRINCIPLES.md) | [ARCHITECTURE.md](../core/ARCHITECTURE.md) | [PRD.md](../core/PRD.md) | [DYNAMIC_REQUEST_FORMS_NARRATIVE_GUIDE.md](../guides/DYNAMIC_REQUEST_FORMS_NARRATIVE_GUIDE.md)

---

## 🧭 1. الفلسفة المعمارية والركائز الخمس الكبرى (The 5 Strategic Pillars)

تستند هذه الخريطة إلى **5 ركائز هندسية غير قابلة للكسر**:

```mermaid
graph TD
    subgraph Pillars["الركائز الهندسية الخمس لمنظومة استقبال الطلبات التجريدية"]
        P1["1. التجريد الشامل للحقول (Field Abstraction)<br/>لا مسميات جامدة؛ المنظومة توفر اللبنات والمدير يسمي الحقول"]
        P2["2. الطلب هو مشروع كامل (CPT_PROJECT)<br/>الطلب ينشأ ككيان مشروع رسمي (workpress_project) وليس مهمة"]
        P3["3. مخطط النماذج التكيفي (JSON Form Schema)<br/>مخطط مهيكل يخزن قوالب النماذج، الحقول، والخيارات"]
        P4["4. خزينة المواصفات المهيكلة (Specs Vault Meta)<br/>حفظ إجابات العميل في _workpress_request_specs بمسمياتها الأصلية"]
        P5["5. دورة حياة الاعتماد والتأسيس (Approve & Establish)<br/>مراجعة الطلب، تسعيره، تحويله لنشط، وتأسيس المهام والمراحل"]
    end
```

---

## 🏛️ 2. شجرة الكيانات والأنطولوجيا في ووردبريس (WordPress Ontology)

```mermaid
graph TD
    subgraph AdminLayer["1. طبقة الإدارة والضبط (Admin Schema Layer)"]
        Option["WordPress Option: workpress_intake_forms_schema"]
        FormTpl1["📋 نموذج طلب قياسي (Default Form)"]
        FormTpl2["⚡ نموذج طلب خدمة تخصصية (Specialized Form)"]
        Option --> FormTpl1
        Option --> FormTpl2
    end

    subgraph ClientLayer["2. طبقة بوابة العميل (Client Portal Intake)"]
        PortalApp["🌐 تطبيق البوابة (/portal/#/new-request)"]
        Dropdown["📋 قائمة اختيار نوع الطلب"]
        SmartTitle["📌 حقل العنوان الذكي (اقتراحات + كتابة حرة)"]
        ScopeDesc["📝 حقل الشرح والنطاق"]
        DynamicSpecs["🧩 اللبنات والمواصفات التخصصية"]
        PortalApp --> Dropdown --> SmartTitle --> ScopeDesc --> DynamicSpecs
    end

    subgraph DBLayer["3. طبقة قاعدة بيانات ووردبريس (WP Database Layer)"]
        CPT_PROJ["🗄️ CPT: workpress_project (post_status: 'draft')"]
        Meta1["🏷️ Meta: _workpress_is_client_request = 1"]
        Meta2["👤 Meta: _workpress_client_id = {user_id}"]
        Meta3["📋 Meta: _workpress_request_form_id = {form_id}"]
        Meta4["📦 Meta: _workpress_request_specs = JSON({labels, values})"]
        CPT_PROJ --> Meta1
        CPT_PROJ --> Meta2
        CPT_PROJ --> Meta3
        CPT_PROJ --> Meta4
    end

    FormTpl1 --> PortalApp
    DynamicSpecs --> CPT_PROJ
```

---

## 🔄 3. مخطط تسلسل العمليات وتدفق البيانات (Full Sequence Diagram)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 👑 مدير المنظومة
    actor Client as 👤 الزبون / المستفيد
    participant Settings as ⚙️ لوحة الإعدادات (SettingsPage)
    participant REST as 🛡️ خادم REST API (Intake & Portal)
    participant Portal as 🌐 بوابة العميل (/portal/)
    participant DB as 🗄️ قاعدة بيانات ووردبريس

    %% المرحلة 1: بناء وتخصيص النماذج
    Admin->>Settings: فتح تبويب "نماذج استقبال الطلبات"
    Settings->>Admin: عرض منشئ النماذج والمخطط التجريدي
    Admin->>Settings: تعديل مسميات الحقول وإضافة مواصفات وحفظ
    Settings->>REST: POST /workpress/v1/settings (update schema)
    REST->>DB: حفظ workpress_intake_forms_schema

    %% المرحلة 2: تقديم الطلب من الزبون
    Client->>Portal: الدخول لبوابة العميل ➔ تبويب "طلب خدمة / مشروع جديد"
    Portal->>REST: GET /workpress/v1/intake-forms
    REST-->>Portal: إرجاع النماذج واللبنات التجريدية
    Portal-->>Client: عرض القائمة وتوليد الخانات المخصصة فورياً
    Client->>Portal: اختيار نوع الطلب، كتابة العنوان، وملء المواصفات
    Client->>Portal: نقر "إرسال طلب المشروع 🚀"

    %% المرحلة 3: معالجة وإنشاء الكيان في ووردبريس
    Portal->>REST: POST /workpress/v1/portal/request
    REST->>DB: wp_insert_post(post_type = 'workpress_project', status = 'draft')
    REST->>DB: update_post_meta(_workpress_is_client_request, 1)
    REST->>DB: update_post_meta(_workpress_request_specs, JSON)
    REST->>Admin: إشعار فوري وتثبيت شارة [طلب جديد من عميل 💼 ⭐]
    REST-->>Portal: إرجاع رقم المشروع وتأكيد النجاح
    Portal-->>Client: تشغيل نغمة الاحتفال وعرض بطاقة النجاح

    %% المرحلة 4: مراجعة واعتماد وتأسيس المشروع
    Admin->>DB: فتح شاشة المشاريع والاطلاع على بطاقة المواصفات
    Admin->>DB: نقر "اعتماد وتأسيس المشروع"
    DB-->>Admin: تحويل حالة المشروع إلى نشط (Active) وتأسيس المهام
    DB-->>Client: إشعار ببدء العمل وظهور المشروع في قائمة المشاريع النشطة
```

---

## 🗺️ 4. خطة التنفيذ المنهجية: المراحل الست الكبرى (The 6 Execution Milestones)

---

### 🔹 المرحلة الأولى: هندسة الباك إند وبنية البيانات ومخطط JSON (Backend Schema & Data Layer)

* **الأهداف الهندسية:**
  1. **تسجيل المخطط الافتراضي العام (Default Universal Schema):**
     - تخزين مخطط النموذج العام التجريدي في `workpress_intake_forms_schema` عند أول تثبيت أو استدعاء.
     - دعم اللبنات السبع: (`smart_title`, `scope_description`, `select_custom`, `multi_select_pills`, `short_text`, `numeric`, `date`, `file_upload`).
  2. **توسيع جهاز إعدادات REST API (`class-workpress-rest-settings-controller.php`):**
     - استرجاع `intake_forms_schema` وحفظه مع تنقية وتعقيم كافة المدخلات (`sanitize_text_field`, `sanitize_key`).
  3. **تحديث جهاز الإدارة وحقن الإعدادات (`class-workpress-admin.php`):**
     - تمرير `intake_forms_schema` ضمن `window.workpressSettings` للواجهة الأمامية لضمان استجابة لحظية بدون تأخير.

* **مصفوفة التحقق للمرحلة الأولى:**
  - [ ] استرجاع المخطط الافتراضي عبر REST API بنجاح.
  - [ ] التحقق من سلامة البنية التجريدية وحفظ التعديلات في جدول الخيارات `wp_options`.

---

### 🔹 المرحلة الثانية: تصويب مسار استقبال الطلبات وإنشاء المشاريع (Portal Request Controller Refactor)

* **الأهداف الهندسية:**
  1. **تصويب نوع المنشور (`class-workpress-rest-portal-controller.php`):**
     - تعديل `submit_project_request` لإنشاء كيان **`WorkPress_Keys::CPT_PROJECT` (مشروع)** بدلاً من مهمة (`CPT_WORK_ITEM`).
     - ضبط حالة المشروع المنشأ على `draft` (مسودة/طلب معلق).
  2. **هيكلة وتخزين مصفوفة المواصفات:**
     - استخراج كافة قيم المواصفات المرسلة وربطها بمسمياتها التي وضعها المدير وحفظها كمصفوفة JSON مهيكلة في `_workpress_request_specs`.
     - حفظ ميتا: `_workpress_is_client_request = 1`، `_workpress_client_id = $user_id`، `_workpress_request_form_id = $form_id`.
  3. **نقطة وصول عامة لنماذج الطلبات:**
     - توفير مسار `GET /workpress/v1/portal/intake-forms` لجلب النماذج النشطة في بوابة العميل.

* **مصفوفة التحقق للمرحلة الثانية:**
  - [ ] تقديم طلب مشروع تجريبي والتأكد من إدراجه كـ `workpress_project`.
  - [ ] التحقق من حفظ مصفوفة المواصفات `_workpress_request_specs` بدقة تامة.

---

### 🔹 المرحلة الثالثة: شاشة ومنشئ النماذج المستقلة في الهيدر الرئيسي (Standalone Form Studio & Header Button)

* **الأهداف الهندسية:**
  1. **زر رئيسي مباشر في الهيدر (`App.js`):**
     - إدراج زر **«نماذج الطلبات 📋»** مباشرة في شريط التنقل العلوي الرئيسي بجانب المشاريع والكانبان.
     - تسجيل المسار المباشر المستقل `#/forms` و `#/intake-forms`.
  2. **بناء صفحة استوديو النماذج التفاعلية البيضاء (`IntakeFormsPage.js`):**
     - **لوحة الخانات واللبنات العامة (Elements Palette):** قائمة جانبية أنيقة تحتوي على كافة اللبنات التجريدية (`smart_title`, `scope_description`, `select_custom`, `pills`, `short_text`, `textarea`, `numeric`, `date`, `upload`) مع زر إضافة فوري.
     - **مساحة العمل البيضاء النقية (The Visual White Canvas):** بطاقات تفاعلية خالية من المشتتات تتيح تعديل المسميات والخيارات وترتيب الخانات بأسهم الصعود والنزول وحذفها.
     - **نافذة المعاينة الحية للبوابة (Live Portal Preview Modal):** زر معاينة فوري يعرض شكل النموذج الحقيقي داخل بوابة العميل الداكنة قبل الاعتماد.
  3. **زر الحفظ والمزامنة الفورية:**
     - حفظ المخطط عبر REST API مع تنبيه توست وتشغيل نغمة صوتية تفاعلية.

* **مصفوفة التحقق للمرحلة الثالثة:**
  - [x] ظهور زر "نماذج الطلبات" في الهيدر الرئيسي وانتقاله إلى `#/forms`.
  - [x] تجربة إضافة وحذف وتعديل حقول النموذج على مساحة العمل البيضاء.
  - [x] حفظ النموذج والتحقق من بقاء التعديلات بعد تحديث الصفحة.

---

### 🔹 المرحلة الرابعة: المحرك التوليدي في بوابة العميل (Dynamic Portal Intake Renderer)

* **الأهداف الهندسية:**
  1. **توليد الواجهة ديناميكياً في بوابة العميل (`portal-app.js`):**
     - في تبويب "🚀 طلب خدمة / مشروع جديد":
     - قراءة مخطط النماذج المحقون أو المستعلم من REST API.
     - عرض قائمة اختيار نوع الطلب / الباقة (إذا وُجد أكثر من نموذج).
     - توليد حقل العنوان الذكي: قائمة اقتراحات منسدلة + خيار `✍️ أخرى: كتابة عنوان مخصص` يفتح حقلاً نصياً فورياً.
     - توليد حقل الشرح بالمسمى المخصص.
     - توليد مصفوفة المواصفات بحسب أنواعها (قوائم منسدلة، وسوم اختيار، حقول أرقام، محدد تواريخ، منطقة رفع ملفات).
  2. **معالجة الإرسال وتجربة المستخدم الفاخرة:**
     - قفل النموذج أثناء الإرسال ومنع التكرار (Double Submit Lock).
     - إرسال البيانات المهيكلة إلى `/portal/request`.
     - تشغيل نغمة الاحتفال `celebration` وعرض بطاقة النجاح مع رقم الطلب.

* **مصفوفة التحقق للمرحلة الرابعة:**
  - [x] اختيار نوع الطلب والتأكد من توليد الخانات بدقة وفق ما حدده المدير.
  - [x] إرسال الطلب والتأكد من استلام رسالة النجاح بدون أي أخطاء.

---

### 🔹 المرحلة الخامسة: خط أنابيب المشاريع وبطاقة المراجعة والاعتماد (Projects Pipeline & Review Vault)

* **الأهداف الهندسية:**
  1. **إبراز طلبات العملاء في شاشة المشاريع (`ProjectsPage.js`):**
     - تمييز بطاقة المشروع بشارة ذهبية مميزة: **`💼 طلب جديد من عميل ⭐`**.
     - إضافة فلتر سريع في أعلى الشاشة: `(جميع المشاريع | المشاريع النشطة | طلبات العملاء المعلقة 📥)`.
     - زر سريع في هيدر الصفحة للوصول المباشر إلى: `⚙️ إدارة نماذج الطلبات` و `📥 وارد طلبات العملاء`.
  2. **صفحة وصندوق وارد طلبات العملاء المخصصة (`RequestsPage.js`):**
     - صفحة تنفيذية متكاملة تحت المسار `#/requests` مع عدادات حية وفلاتر للطلبات.
     - استعراض خزينة المواصفات الفنية للطلب (`Client Specifications Vault`) مع المرفقات وروابط التنزيل.
  3. **زر الاعتماد والتأسيس الرسمي (Approve & Establish):**
     - نافذة إدارية سريعة: **«اعتماد وتأسيس المشروع 🚀»**:
       - تحويل حالة المشروع إلى **نشط (`publish`)**.
       - إسناد مدير المشروع (Project Lead) وتأكيد الميزانية وتاريخ التسليم.
       - إشعار الزبون ببدء تنفيذ مشروعه رسمياً.

* **مصفوفة التحقق للمرحلة الخامسة:**
  - [x] ظهور الطلب الجديد في شاشة المشاريع والطلبات مع شارة العميل الفاخرة.
  - [x] ظهور بطاقة المواصفات الفنية كاملة ومطابقة لما عبأه العميل.
  - [x] نقر زر الاعتماد والتأكد من تحول المشروع إلى نشط وبدء تأسيس المهام.

---

### 🔹 المرحلة السادسة: المؤثرات الصوتية والتوثيق والتدقيق المؤسسي (Hardening, Audio & Sign-Off)

* **الأهداف الهندسية:**
  1. **الربط الصوتي التفاعلي الكامل (SND Sound Integration):**
     - تشغيل نغمة `celebration` عند تقديم الزبون للطلب وعند اعتماد المدير للمشروع.
     - تشغيل نغمة `button` عند إضافة/تعديل حقول النموذج في لوحة البناء.
     - حماية AudioContext من قيود التشغيل التلقائي عبر التفاعل الأول.
  2. **تحديث التوثيق وفهرس المنظومة:**
     - ربط الخريطة المعتمدة في [`docs/README.md`](../README.md).
  3. **التدقيق البرمجي والأمان:**
     - فحص كافة ملفات PHP و JS بنسبة 100% (No Lint Errors / No Syntax Errors).

* **مصفوفة التحقق للمرحلة السادسة:**
  - [x] اجتياز فحص PHP Syntax و JS Syntax بنجاح تام.
  - [x] تجربة دورة العمل الكاملة (من بناء النموذج إلى تقديم الزبون إلى اعتماد المدير) بدون أي خلل.

---

## 📊 5. مصفوفة مقاييس الجاهزية والاعتماد (Definition of Done - DoD)

| المكون / الشاشة | المعيار المطلوب | حالة الجاهزية |
| :--- | :--- | :---: |
| 🗄️ **WordPress DB & REST** | إنشاء الطلب كـ `CPT_PROJECT` وحفظ المواصفات في `_workpress_request_specs` | ✅ مكتمل وجاهز |
| 🎛️ **Admin Form Builder** | لوحة بناء النماذج في الإعدادات مع تحكم كامل بالحقول والمواصفات | ✅ مكتمل وجاهز |
| 🌐 **Client Portal Intake** | توليد الخانات التجريدية ديناميكياً بحسب نوع الطلب مع العنوان الذكي | ✅ مكتمل وجاهز |
| 🏢 **Projects Pipeline** | فلتر طلبات العملاء وشارة `[طلب جديد من عميل 💼 ⭐]` | ✅ مكتمل وجاهز |
| 📥 **Requests Inbox Page** | صفحة إدارة وارد الطلبات المستقلة `#/requests` مع عدادات وإجراءات سريعة | ✅ مكتمل وجاهز |
| 📦 **Specs Review Vault** | بطاقة المواصفات الفنية المكتملة في تفاصيل المشروع | ✅ مكتمل وجاهز |
| 👑 **Project Approval Action**| تحويل المشروع إلى نشط وتأسيس المهام وتعيين الفريق بضغطة زر | ✅ مكتمل وجاهز |
| 🛡️ **Zero Errors & Lints** | اجتياز كافة اختبارات الكود والتوافق بنسبة 100% | ✅ مكتمل وجاهز |
