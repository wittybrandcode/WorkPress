# WorkPress Design System - 03: Layouts & Views

هذا المستند يحدد المخططات الهيكلية (Layouts) للشاشات الرئيسية للإضافة، وكيف سيتم توظيف الكلاسات المحددة في `02-COMPONENTS.md` لإنشاء واجهة متماسكة لا تعتمد على الأكواد العشوائية (Inline Styles).

---

## 1. الهيكل العام للتطبيق (Global App Wrapper)

يجب أن تكون كامل بيئة الإضافة محاطة بحاوية أساسية توحد النمط العام عبر جميع صفحات WorkPress داخل لوحة تحكم WordPress.

### الهيكل (Structure)
```html
<div class="wp-app-wrapper">
  <!-- 1. شريط التنقل العلوي (Topbar) -->
  <header class="wp-topbar">...</header>
  
  <!-- 2. مساحة العمل (Canvas) -->
  <main class="wp-canvas">
    <!-- محتوى الصفحة المعنية (Kanban, Dashboard, etc.) -->
  </main>
</div>
```

### المواصفات (CSS)
* **`.wp-app-wrapper`:** `font-family: var(--wp-font-sans); background: var(--wp-light); color: var(--wp-dark); min-height: 100vh; display: flex; flex-direction: column;`
* **`.wp-topbar`:** `background: var(--wp-surface); border-bottom: 2px solid var(--wp-dark); padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: var(--wp-z-sticky);`
* **`.wp-canvas`:** `flex: 1; padding: 24px; overflow-x: auto;`

---

## 2. لوحة الكانبان (Kanban Board)

الكانبان هو التحدي البصري الأكبر. يجب أن يكون مخططاً صلباً (Rigid Grid) لتجنب التشوه البصري أثناء السحب والإفلات.

### 2.1. تخطيط الكانبان (Kanban Layout)
```html
<div class="wp-kanban-board">
  
  <!-- العمود الواحد -->
  <div class="wp-kanban-column" data-status="todo">
    <div class="wp-kanban-column-header">
      <h4 class="wp-kanban-column-title">مفتوحة</h4>
      <span class="wp-badge">5</span>
    </div>
    <div class="wp-kanban-column-body wp-kanban-dropzone">
      <!-- بطاقات المهام -->
      <div class="wp-card wp-task-card">...</div>
      <div class="wp-card wp-task-card">...</div>
    </div>
  </div>

  <!-- أعمدة أخرى... -->
</div>
```

### 2.2. مواصفات الكانبان (Kanban CSS)
* **`.wp-kanban-board`:** `display: flex; gap: var(--wp-space-lg); align-items: flex-start; height: calc(100vh - 120px); overflow-x: auto; padding-bottom: 24px;`
* **`.wp-kanban-column`:** `flex: 0 0 320px; background: var(--wp-surface); border: 2px solid var(--wp-dark); display: flex; flex-direction: column; max-height: 100%;`
* **`.wp-kanban-column-header`:** `padding: 16px; border-bottom: 2px solid var(--wp-dark); display: flex; justify-content: space-between; align-items: center; background: var(--wp-dark); color: var(--wp-surface);` (الرأس أسود والنص أبيض للتباين الأقصى).
* **`.wp-kanban-column-body`:** `padding: 16px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: var(--wp-light);`

### 2.3. بطاقة المهمة في الكانبان (Task Card)
بناءً على المكون الأساسي `.wp-card` المذكور في المستند السابق:
* **`.wp-task-card`:** تتبنى `.wp-card`، وعند سحبها (Drag) تُضاف فئة `.wp-is-dragging` التي تطبق `transform: rotate(3deg); box-shadow: 10px 10px 0px rgba(0,0,0,0.2);` ليعطي إيحاء بفيزيائية الكرت.

---

## 3. قائمة المشاريع (Projects List / Grid)

شاشة عرض المشاريع يجب أن تدعم عرضاً شبكياً (Grid View).

### 3.1. التخطيط (Layout)
```html
<div class="wp-page-header">
  <h1 class="wp-page-title">المشاريع</h1>
  <button class="wp-btn wp-btn-primary">مشروع جديد</button>
</div>

<div class="wp-projects-grid">
  <!-- بطاقة المشروع -->
  <div class="wp-card wp-project-card">
    <div class="wp-card-header">
      <h3 class="wp-project-title">تصميم هوية بصرية</h3>
      <span class="wp-badge wp-badge-id">PRJ-101</span>
    </div>
    <div class="wp-card-body">
      <!-- التفاصيل والإحصائيات -->
    </div>
    <div class="wp-card-footer">
      <a href="..." class="wp-btn wp-btn-ghost">عرض المهام</a>
    </div>
  </div>
</div>
```

### 3.2. مواصفات المشاريع (Projects CSS)
* **`.wp-page-header`:** `display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;`
* **`.wp-projects-grid`:** `display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px;`
* **`.wp-project-card`:** `transition: transform var(--wp-transition-fast);`. وعند التحويم: `transform: translateY(-4px); box-shadow: 6px 6px 0px var(--wp-dark);` (لإبراز المشروع التفاعلي).

---

## 4. شاشة لوحتي (Dashboard Widgets)

لوحة القيادة عبارة عن شبكة (Grid) مرنة تحتوي إحصائيات.

### التخطيط (Layout)
```html
<div class="wp-dashboard-grid">
  
  <!-- ويدجت إحصائية بسيطة -->
  <div class="wp-card wp-widget-stat">
    <div class="wp-widget-icon">...</div>
    <div class="wp-widget-data">
      <span class="wp-widget-label">المهام المنجزة</span>
      <span class="wp-widget-value">42</span>
    </div>
  </div>

  <!-- ويدجت المهام العاجلة -->
  <div class="wp-card wp-widget-urgent">
    <div class="wp-card-header">...</div>
    <div class="wp-card-body">...</div>
  </div>

</div>
```

### المواصفات (Dashboard CSS)
* **`.wp-dashboard-grid`:** `display: grid; grid-template-columns: repeat(12, 1fr); gap: 24px;`
* **`.wp-widget-stat`:** `grid-column: span 3; display: flex; align-items: center; padding: 24px; gap: 16px;`
* **`.wp-widget-value`:** `font-size: 3rem; font-weight: 800; font-family: var(--wp-font-mono); color: var(--wp-primary);`

---

## 5. قواعد المحتوى الثري داخل المودال (Rich Content in Modals)

يُستخدم في عرض محتوى المهمة أو المشروع المقروء. يجب أن تكون النصوص مقروءة جداً وتشبه الأوراق الرسمية المطبوعة.

* الكلاس الشامل: `.wp-rich-document`
* **العناوين (Headings):** `font-weight: 800; color: var(--wp-dark); margin: 32px 0 16px 0; border-bottom: 2px solid var(--wp-dark); padding-bottom: 8px; display: inline-block;` (خط سفلي جاد تحت العناوين).
* **الاقتباسات (Blockquotes):** `border-right: 4px solid var(--wp-dark); padding: 16px; background: var(--wp-light); font-style: normal; font-weight: 600;` (ليست مائلة، بل بارزة).
* **الأكواد (Code Blocks):** `border: 2px solid var(--wp-dark); background: var(--wp-surface); padding: 16px; font-family: var(--wp-font-mono);` (زوايا حادة، حدود سوداء).

---
*بناءً على هذه المستندات الثلاثة (`01`, `02`, `03`)، نحن جاهزون لهدم الـ `admin.css` القديم وبناء النظام الجديد.*
