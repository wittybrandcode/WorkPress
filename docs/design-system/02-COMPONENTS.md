# WorkPress Design System - 02: Components

هذا المستند يحدد الهيكلية البرمجية (HTML/CSS) لكل المكونات البصرية التي سيتم استخدامها في إضافة WorkPress. 
الهدف هو إعادة استخدام هذه الكلاسات (Classes) وتجنب كتابة كود CSS مضمّن (Inline CSS) أو كلاسات مخصصة لكل شاشة.

---

## 1. الأزرار (Buttons)

الأزرار هي وسيلة التفاعل الأساسية. تعتمد الأزرار في WorkPress على نمط **Fill-Swap** مع حدود قاطعة وزوايا مربعة.

### 1.1. الكلاس الأساسي `.wp-btn`
جميع الأزرار يجب أن تحمل الكلاس الأساسي `.wp-btn` الذي يحدد:
* `display: inline-flex; align-items: center; justify-content: center; gap: 8px;`
* `height: 40px; padding: 0 16px;`
* `font-weight: 800; font-family: var(--wp-font-sans); font-size: var(--wp-text-base);`
* `border-radius: 0; cursor: pointer; text-decoration: none;`
* `transition: all var(--wp-transition-fast);`

### 1.2. أنواع الأزرار (Button Variants)

#### الزر الرئيسي (Primary Button)
* **الكلاس:** `.wp-btn-primary`
* **الحالة العادية:** `background: var(--wp-surface); color: var(--wp-primary); border: 2px solid var(--wp-primary);`
* **عند التحويم (Hover):** `background: var(--wp-primary); color: var(--wp-surface);`
* **الاستخدام:** الإجراء الأهم في الشاشة (حفظ مشروع، إضافة مهمة).

#### الزر الثانوي (Secondary Button)
* **الكلاس:** `.wp-btn-secondary`
* **الحالة العادية:** `background: var(--wp-surface); color: var(--wp-dark); border: 2px solid var(--wp-dark);`
* **عند التحويم (Hover):** `background: var(--wp-dark); color: var(--wp-surface);`
* **الاستخدام:** إجراءات الإلغاء، أو الإجراءات الثانوية.

#### الزر الخفي (Ghost/Tertiary Button)
* **الكلاس:** `.wp-btn-ghost`
* **الحالة العادية:** `background: transparent; color: var(--wp-dark); border: 2px solid transparent;`
* **عند التحويم (Hover):** `background: var(--wp-light); border-color: var(--wp-light);`
* **الاستخدام:** أزرار الحذف، أو الأزرار الأقل أهمية داخل بطاقة.

#### الزر المصغر (Small Button)
* **الكلاس:** `.wp-btn-sm` (يُضاف مع الكلاسات السابقة)
* **المواصفات:** `height: 32px; padding: 0 12px; font-size: var(--wp-text-sm);`
* **الاستخدام:** أزرار التحرير/الحذف داخل بطاقات الكانبان.

---

## 2. الحقول والإدخال (Inputs & Forms)

### 2.1. الحقل القياسي (Standard Input)
* **الكلاس:** `.wp-input`
* **الحالة العادية:** `background: var(--wp-surface); border: 2px solid var(--wp-dark); color: var(--wp-dark); padding: 8px 12px; font-family: var(--wp-font-sans); font-size: var(--wp-text-base); border-radius: 0; outline: none;`
* **عند التركيز (Focus):** `border-color: var(--wp-primary); box-shadow: inset 0 0 0 1px var(--wp-primary);`

### 2.2. القوائم المنسدلة (Selects)
* **الكلاس:** `.wp-select` (نفس مواصفات `.wp-input` ولكن مع أيقونة سهم مخصصة).

### 2.3. عنوان الوثيقة (Document Title Input)
مخصص لعنوان المشروع أو المهمة لكي يظهر كعنوان مستند حقيقي.
* **الكلاس:** `.wp-doc-title-input`
* **الحالة العادية:** `font-size: var(--wp-text-3xl); font-weight: 800; padding: 8px 0; border: none; border-bottom: 2px dashed transparent; background: transparent;`
* **عند التركيز (Focus):** `border-bottom: 2px dashed var(--wp-primary);`

---

## 3. الشارات والعلامات (Badges & Tags)

تُستخدم لعرض الحالة، الأولوية، أو المعرف (ID) في مساحة صغيرة جداً ولكن بوضوح عالي.

* **الكلاس الأساسي:** `.wp-badge`
* **المواصفات:** `display: inline-flex; align-items: center; padding: 2px 8px; font-size: var(--wp-text-xs); font-weight: 800; border-radius: 0; line-height: 1.5;`

### 3.1. شارة المعرف (ID Badge)
* **الكلاس:** `.wp-badge-id`
* **المواصفات:** `font-family: var(--wp-font-mono); background: var(--wp-dark); color: var(--wp-surface); border: 1px solid var(--wp-dark);`

### 3.2. شارات الأولوية (Priority Badges)
* `.wp-badge-priority-low`: `background: var(--wp-info-bg); color: var(--wp-info-text); border: 1px solid var(--wp-info-text);`
* `.wp-badge-priority-medium`: `background: var(--wp-warning-bg); color: var(--wp-warning-text); border: 1px solid var(--wp-warning-text);`
* `.wp-badge-priority-high`: `background: var(--wp-danger-bg); color: var(--wp-danger-text); border: 1px solid var(--wp-danger-text);`

---

## 4. البطاقات (Cards)

البطاقات هي وحدات بناء الكانبان والويدجت (Widgets).

* **الكلاس:** `.wp-card`
* **المواصفات:** `background: var(--wp-surface); border: 2px solid var(--wp-dark); border-radius: 0; display: flex; flex-direction: column;`
* **محتويات البطاقة (Card Anatomy):**
  * `.wp-card-header`: `padding: 12px 16px; border-bottom: 2px solid var(--wp-dark); display: flex; justify-content: space-between;`
  * `.wp-card-body`: `padding: 16px;`
  * `.wp-card-footer`: `padding: 12px 16px; border-top: 1px solid var(--wp-border-muted);`

---

## 5. النوافذ المنبثقة (Modals)

النظام المؤسساتي يتطلب أن تفتح تفاصيل المهام في بيئة معزولة ونظيفة.

### 5.1. هيكل المودال (Modal Structure)
```html
<div class="wp-modal-overlay">
  <div class="wp-modal-window">
    <div class="wp-modal-header">
      <h3 class="wp-modal-title">...</h3>
      <button class="wp-modal-close-btn">&times;</button>
    </div>
    <div class="wp-modal-body">
      <!-- Content here -->
    </div>
    <div class="wp-modal-footer">
      <!-- Actions here -->
    </div>
  </div>
</div>
```

### 5.2. مواصفات المودال (Modal CSS)
* **`.wp-modal-overlay`:** `background: rgba(30, 30, 30, 0.85);` (خلفية داكنة جداً لعزل المستخدم عن الخلفية).
* **`.wp-modal-window`:** `background: var(--wp-surface); border: 2px solid var(--wp-dark); max-width: 900px; width: 100%; border-radius: 0; box-shadow: 10px 10px 0px rgba(0,0,0,0.5);` (استثناء وحيد لظل خشن ضخم لتمثيل ارتفاع النافذة).
* **`.wp-modal-close-btn`:** `width: 40px; height: 40px; background: var(--wp-surface); border: 2px solid var(--wp-dark); font-size: 24px; cursor: pointer;` وعند الـ Hover `background: var(--wp-dark); color: var(--wp-surface);`.
