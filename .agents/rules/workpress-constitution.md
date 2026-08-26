# دستور وقواعد التطوير والتصميم لنظام وركبرس (WorkPress Constitution)
# حارس المنهج الحتمي — يُحقن تلقائياً في كل جلسة عمل

> **هذه القواعد ملزمة في كافة عمليات البرمجة، التصميم، وتوليد الأكواد.
> عند تعارض أي قرار مع هذه القواعد، تتقدم القواعد. يُثبت أي استثناء صراحةً قبل اعتماده.**

---

## §1. الهوية المعمارية (Architectural Identity)

WorkPress هو **محرك الذاكرة المؤسسية (Organizational Memory Engine)** المبني فوق WordPress.
- الأشخاص ينشئون العمل → العمل يولّد المعرفة → المعرفة تصبح ذاكرة مؤسسية.
- **Project** = WordPress Taxonomy (`workpress_project`)
- **Task** = WordPress Custom Post Type (`work_item`)
- **Contribution** = WordPress Comment (`wp_contribution`)
- **Person** = WordPress User
- **Knowledge** = Read Model من المساهمات المعتمدة (ليس كياناً مستقلاً)
- المرجع الحاكم الأعلى هو `docs/core/FIRST_PRINCIPLES.md`.

---

## §2. القواعد البصرية الحتمية (Visual Laws — Zero Exceptions)

1. **الزوايا الحادة (`0px Sharp Geometry`)**:
   `border-radius: 0 !important` على كل عنصر بلا استثناء: أزرار، بطاقات، حقول، modals، toast، datepicker، dropdowns، tags.

2. **خط Cairo الموحد**:
   `font-family: 'Cairo', sans-serif !important` على كل نص، عنوان، زر، شارة، وحقل إدخال.
   - أوزان: `900` للعناوين الكبرى، `800` للأزرار والشارات، `700` للنصوص العادية.
   - تباعد الأسطر: `line-height: 1.35–1.45` لمنع تداخل الحروف العربية المتدلية.

3. **الأرقام الغربية القياسية (`Western Arabic: 1,2,3`)**:
   يمنع استخدام الأرقام الهندية المشرقية (`١٢٣`) في أي جدول أو عداد أو تقويم أو شارة.

4. **منع الإيموجي الصارم (`Zero Emojis`)**:
   تُستخدم أيقونات WordPress الرسمية (`dashicons-*`) حصراً لكافة الدلالات في الواجهات الرسمية.

5. **التباين الداكن المؤسسي (`High-Contrast Institutional Palette`)**:
   - Slate: `#0f172a` | Deep Emerald: `#064e3b` | Crimson: `#7f1d1d` | Amber: `#78350f` | Sky: `#0c4a6e`
   - الإشعارات تعتمد **الغلاف اللوني الشامل** (Full-Container Colored Atmosphere) لا مجرد خط جانبي.

6. **النمط فائق الكثافة (`High-Density Compact UI`)**:
   - ارتفاع الصفوف: `36px/38px` | أزرار أيقونية: `.wp-icon-btn` (`22px/26px/28px/32px`)
   - شرائح مدمجة: `.wp-dense-chip` (ارتفاع `20px`, خط `0.68rem`)
   - تلميحات فورية: `[data-wp-tooltip]` بدلاً من نصوص توضيحية طويلة
   - مجموعات أزرار متراصة: `.wp-btn-group-tight`

---

## §3. القواعد البرمجية الحتمية (Engineering Laws)

1. **React 18 + htm (لا JSX ولا Babel)**:
   - الخواص النمطية دائماً ككائنات: `style=${{ height: '38px' }}` ✅
   - يمنع السلاسل النصية: `style="height: 38px"` ❌
   - استخدام `html` tagged template من `htm/preact` و `createPortal` عند الحاجة.

2. **حماية ووردبريس الثلاثية (`Tri-Partite Security`)**:
   - **Capability**: فحص `current_user_can()` قبل أي عملية.
   - **Nonce**: التحقق عبر `wp_verify_nonce()` أو هيدر `X-WP-Nonce` في كل REST call.
   - **Sanitize**: `sanitize_text_field()`, `absint()`, `esc_html()`, `esc_attr()` لكل مدخل ومخرج.

3. **طبقة الخدمات الإلزامية (`Services-Only Layer`)**:
   - يمنع على REST Controllers أو واجهة CoWorkPress أو Office Packs التعامل مباشرة مع `$wpdb` أو `wp_posts` أو `wp_terms`.
   - كل عملية تمر عبر الخدمة المناسبة: `TaskService`, `ProjectService`, `ContributionService`, `MembershipService`, إلخ.

4. **الرؤية تتبع العضوية (`Visibility = Membership`)**:
   - المستخدم لا يرى إلا المشاريع التي ينتمي إليها عبر `_workpress_member_{user_id}`.
   - القدرة العامة وحدها لا تكشف مشروعاً خاصاً إلا في مسار إداري صريح وموثق.

5. **التاريخ لا يُمحى أبداً (`History is Immutable`)**:
   - كل تغيير حالة أو تكليف أو اعتماد أو إغلاق/إعادة فتح يُسجل كـ Contribution.
   - الحذف يتم بنظام طلب الأرشفة المسبب (`Trash Request with Reason`) وليس حذفاً مباشراً.

6. **المحركات المركزية الإلزامية (`Central Engines`)**:
   - **Toast**: `toast.success()`, `toast.error()`, `toast.decision()`, `toast.confirm()`, `toast.action({ onUndo })` (المصدر: `utils/toast.js`)
   - **Sound**: `sound.play('click'|'button'|'trash'|'complete')` (المصدر: `utils/sound.js`)
   - **DatePicker**: التقويم المخصص بالسطرين السريعين وزر `[ اليوم ]` (المصدر: `components/DatePicker.js`)
