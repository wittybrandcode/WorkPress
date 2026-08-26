# WorkPress Design System - 01: Tokens & Fundamentals (Modern SaaS)

## 1. الفلسفة المعمارية (Architectural Philosophy)

يتبنى نظام WorkPress التصميمي فلسفة **Modern SaaS Design** بالاعتماد التام على إطار العمل **Bulma**. يركز هذا النمط على توفير بيئة مريحة للعين، واحترافية، ومألوفة لمستخدمي تطبيقات إدارة المشاريع الحديثة. نحن نستخدم الظلال الناعمة لإعطاء عمق للبطاقات، وحواف دائرية خفيفة لكسر الحدة، ولوحة ألوان تعتمد على تدرجات الـ Slate والـ Emerald.

### المبادئ الأساسية (Core Principles):
1. **راحة العين (Visual Comfort):** استخدام ألوان داكنة مريحة (Slate) بدلاً من الأسود القاتم، ومساحات بيضاء كافية.
2. **العمق البصري (Visual Depth):** الاعتماد على الظلال (Soft Shadows) لتمييز البطاقات والنوافذ المنبثقة عن الخلفية بدلاً من الحدود القاسية فقط.
3. **الانسجام مع Bulma:** استخدام فئات Bulma القياسية (`box`, `button`, `is-flex`, `column`) كبنية أساسية، مع تخصيصات طفيفة عبر Utility Classes في `admin.css`.
4. **التفاعل الناعم (Smooth Interaction):** استخدام انتقالات (Transitions) ناعمة عند التحويم (Hover) لتعزيز الشعور بالاحترافية السلسة.

---

## 2. لوحة الألوان (Color Palette)

الألوان مستوحاة من لوحة ألوان Tailwind CSS المريحة والمناسبة لبيئات الـ SaaS، وتم دمجها كمتغيرات في `admin.css`.

### 2.1. الألوان الهيكلية (Structural Colors)

* **النص الأساسي (Primary Text):** `--wp-text-primary: #0f172a;` (Slate 900)
* **النص الثانوي (Secondary Text):** `--wp-text-secondary: #64748b;` (Slate 500)
* **النص الباهت (Muted Text):** `--wp-text-muted: #94a3b8;` (Slate 400)

### 2.2. الألوان التفاعلية (Interactive Colors)

* **اللون الأساسي (Primary/Emerald):** `--wp-accent-green: #10b981;` (Emerald 500) - يُستخدم للأزرار الرئيسية وتأكيد الإنجاز.
* **لون التحويم (Hover Fill):** `--wp-hover-fill: #757E8E;` - لون رمادي مزرق عند تمرير الماوس على الأزرار والقوائم.
* **ألوان الحالة (State Colors):**
  * `Danger:` `--wp-danger: #f14668;` (للإلغاء والحذف)
  * `Info:` `--wp-info: #3e8ed0;` (للمعلومات العامة)

### 2.3. الخلفيات والحدود (Backgrounds & Borders)

* **الحدود (Borders):**
  * أساسي: `--wp-border: #e2e8f0;`
  * باهت: `--wp-border-subtle: #f1f5f9;`
  * داكن: `--wp-border-dark: #ededed;`
* **الخلفيات (Backgrounds):**
  * الصفحة (Canvas): `--wp-bg-page: #f5f5f5;`
  * البطاقات (Cards): `--wp-bg-card: #ffffff;`
  * أعمدة الكانبان (Columns): `--wp-bg-column: #ebecf0;`

---

## 3. الظلال والعمق (Shadows & Depth)

نستخدم الظلال الناعمة لإنشاء تراتبية في مستويات الواجهة:

* `--wp-shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.02);` - للحاويات والبطاقات العادية.
* `--wp-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.06);` - عند التحويم (Hover) على البطاقات.
* `--wp-shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.1);` - للقوائم المنسدلة والعناصر العائمة.
* `--wp-shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);` - للنوافذ المنبثقة لإبرازها عن الخلفية.

---

## 4. الطباعة والنصوص (Typography)

* **الخط الأساسي:** `font-family: 'Cairo', sans-serif;` - مُطبق على كافة عناصر الواجهة لضمان دعم ممتاز للغة العربية بمظهر عصري.
* **تراتبية الأحجام:** نعتمد على فئات Bulma الافتراضية للتراتبية (مثل `is-size-4` للعناوين، `is-size-7` للبيانات الوصفية الصغيرة).

---

## 5. المسافات والمحاذاة (Spacing & Alignment)

لا ينبغي استخدام مسافات وتنسيقات مضمنة (Inline Styles). يجب الاعتماد على فئات Bulma المساعدة:

* **الهوامش الداخلية والخارجية:** استخدام `m-1` إلى `m-6` و `p-1` إلى `p-6`.
* **محاذاة الأيقونات مع النصوص:** 
  يجب دائماً تجميع الأيقونة (Dashicons) مع النص المجاور لها داخل حاوية من نوع `is-flex is-align-items-center` مع إضافة مسافة فاصلة باستخدام أسلوب `gap`.
  *مثال:* `<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>`

---

## 6. التحريك (Transitions)

الانتقالات الناعمة جزء من تجربة الـ SaaS:

* `--wp-transition-fast: 0.15s ease;`
* `--wp-transition-base: 0.2s ease;`
* `--wp-transition-slow: 0.3s ease;`
