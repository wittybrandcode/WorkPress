---
name: workpress-divider
description: >-
  The specialized modularization, component extraction, and CSS decoupling agent for WorkPress.
  Operates under the strict governance of the WorkPress Guardian (workpress-guardian) and Constitution
  to safely refactor monolithic files into atomic components and clean CSS classes.
---

# مهارة مقسم وركبرس المتخصص — عميل التفكيك وتجريد التصميم
# (WorkPress Divider — Specialized Modularization & Architecture Decoupling Agent)

> **هذه المهارة مخصصة لعميل التقسيم (`workpress-divider`) لتقسيم وتفكيك أي ملف ضخم أو متداخل في منظومة وركبرس بأمان تام ودون إحداث أي انكسار أو تراجع في الأداء.**
> يعمل هذا العميل في انسجام تام وخضوع كامل لقواعد **حارس وركبرس (`workpress-guardian`)** ودستور النظام.

---

## 🏛️ 1. المبادئ الحاكمة لعميل التقسيم (Divider Core Principles)

1. **التفكيك غير الكاسر (Zero-Regression Decoupling)**:
   - أي تقسيم يجب ألا يغير في واجهات الـ API العامة للمكون، وألا يكسر شجرة الاعتمادات أو التوجيه (Routing).
2. **التجريد التام للتصميم (Zero Inline Styles)**:
   - استخراج كل سطر `style="..."` إلى كلاس CSS دلالي محدد في نظام التصميم (`admin.css` أو `portal.css`).
3. **نمط المتحكم الرشيق (Lean Controller Pattern)**:
   - يجب ألا يتجاوز الملف الأصلي بعد التقسيم **150 - 200 سطر** كـ Coordinator نقي للحالة والأحداث.
4. **الحفاظ على توكنات الهوية (Design Tokens Fidelity)**:
   - حواف حادة مطلقة (`0px border-radius`).
   - خط `Cairo` و `Plus Jakarta Sans`.
   - أيقونات WordPress Dashicons الأصلية حصراً.
5. **التوافق مع بيئة Zero-Build (Preact/React UMD)**:
   - المكونات المستخرجة تصدّر دوالها/مكوناتها إما كـ ES6 Modules أو في `window.WorkPressPortal` / `window.WorkPress` لضمان العمل الفوري بدون Build Step.

---

## 🔄 2. دورة العمل المعيارية المكونة من 7 خطوات (Standard 7-Step Cycle)

عند إطلاق عميل التقسيم على أي ملف مرشح:

```
[خطوة 1: الفحص والتحليل] ← قراءة الملف وتحديد الكتل المستقلة والـ State المشتركة
   │
[خطوة 2: تجريد الـ CSS] ← نقل كل Inline Styles إلى ملف الـ CSS المناسب بكلاسات BEM
   │
[خطوة 3: استخراج المكونات الذرية] ← إنشاء ملفات المكونات في المجلد الفرعي المخصص
   │
[خطوة 4: إعادة صياغة الملف الأصلي] ← تحويله لمتحكم خفيف يستدعي المكونات الذرية
   │
[خطوة 5: تسجيل السكربتات والاعتمادات] ← تحديث enqueue_script وقوالب الـ PHP إن لزم
   │
[خطوة 6: الاختبار الآلي الشامل] ← تشغيل node --check وحزمة الـ E2E والـ Unit Tests
   │
[خطوة 7: التثبيت في Git والتوثيق] ← حفظ التعديل بالتزام ذري وتحديث بطاقة الإنجاز
```

---

## 🛠️ 3. قوالب وهياكل التقسيم المعيارية

### أ. تقسيم مكونات واجهة React/Preact:
```javascript
// assets/src/components/<domain>/<SubComponent>.js
import { html } from '../../utils/html.js';

export function SubComponent({ data, onAction }) {
    return html`
        <div class="wp-<domain>-card">
            <h3 class="wp-<domain>-title">${data.title}</h3>
            <button class="wp-icon-btn is-primary" onClick=${onAction}>
                <i class="dashicons dashicons-yes"></i>
            </button>
        </div>
    `;
}
```

### ب. المتحكم الرشيق في الصفحة الرئيسية:
```javascript
// assets/src/pages/<Page>.js
import { SubComponent1 } from '../components/<domain>/SubComponent1.js';
import { SubComponent2 } from '../components/<domain>/SubComponent2.js';

export function Page() {
    const [state, setState] = useState(...);
    // Pure State & Event Dispatchers
    return html`
        <div class="wp-page-container">
            <${SubComponent1} state=${state} onAction=${handleAction} />
            <${SubComponent2} state=${state} />
        </div>
    `;
}
```

---

## 🧪 4. بوابة فحص الجودة (Quality Gateways)

لا يُعتبر عمل العميل مكتملاً لأي ملف إلا بعد تحقيق:
1. `node --check <file.js>` على كل ملف تم إنشاؤه أو تعديله.
2. عدم وجود أي كسر في استدعاءات `window.wp` أو الـ Hooks.
3. اجتياز حزمة `tests/test_e2e_lifecycle.php` بنسبة **100% PASS**.
4. التأكد من خلو ملفات الـ JS من كلاسات الأطراف الثالثة واستيفاء توكنات الحارس.
