---
name: workpress-organizer
description: Comprehensive dependency-aware organizer and refactoring agent for WorkPress UI components, ensuring zero broken imports, domain categorization, and strict verification.
---

# 🏗️ مهارة تنظيم وهيكلة مكونات واجهة المستخدم (WorkPress Component Organizer)

تتولى هذه المهارة تنظيم وترتيب ملفات واجهة المستخدم في مجلد `assets/src/components/` ونقلها إلى مجلدات نطاقية متخصصة (Domain-Driven Categories) مع ضمان سلامة شجرة الاعتمادات (Dependency Graph) بنسبة 100% ودون كسر أي مسار استيراد (`import/export`).

---

## 📋 المبادئ الحاكمة لعملية الترحيل (Core Rules)

1. **المسح الاستباقي للاعتمادات (Pre-Migration Dependency Mapping)**:
   - قبل نقل أي ملف، يجب جرد جميع الملفات التي تستورده (Inbound Dependents) والملفات التي يستوردها (Outbound Imports).
2. **التصنيف النطاقي المستدام (Domain Categorization)**:
   - `ui/`: العناصر الأساسية الذرية المشتركة (Primitives) مثل DatePicker, CustomSelect, PriorityBadge.
   - `modals/`: النوافذ المنبثقة العامة والمشتركة مثل Base Modal, ConfirmModal, ReportModal.
   - `projects/`: بطاقات ونوافذ ومكونات نطاق المشاريع.
   - `tasks/`: بطاقات ومكونات ونوافذ إدارة المهام وتتبع الوقت وقوائم الفحص.
   - `contributions/`: مساهمات الحلول والأدلة ومناقشات المخرجات.
3. **التحديث الدقيق والشامل لمسارات الاستيراد (Import Path Rewriting)**:
   - عند نقل أي ملف من `components/X.js` إلى `components/category/X.js`، يتم تحديث مسارات استيراده في جميع الملفات التابعة (الصفحات والمكونات الأخرى).
   - تحديث المسارات النسبية داخل الملف المنقول نفسه لتتوافق مع موقعه الجديد.
4. **بوابة التحقق الصارمة (Strict Verification Gate)**:
   - تشغيل `node --check` على كل ملف يتم تعديله أو نقله.
   - تشغيل حزمة الاختبارات الآلية (`test_e2e_lifecycle.php`, `test_task_checklists.php`, `test_time_tracking.php`, `test_auth_service.php`).
5. **التثبيت النظيف في Git**:
   - تسجيل الالتزامات برسائل معيارية ودفعها إلى المستودع.
