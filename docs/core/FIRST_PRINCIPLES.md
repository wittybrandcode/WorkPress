# WorkPress — First Principles

> هذه الوثيقة هي السلطة المعمارية الأعلى في WorkPress. عند تعارض قرار أو وثيقة أو امتداد معها، تتقدم هذه المبادئ. يثبت أي تغيير استثناءه صراحةً قبل اعتماده.

## المبادئ غير القابلة للكسر

1. **People create Work.** الأشخاص هم من ينشئون العمل.
2. **Work generates Knowledge.** العمل المنجز يولّد معرفة.
3. **Knowledge becomes Organizational Memory.** المعرفة المتراكمة تصبح ذاكرة المؤسسة.
4. **Work is Content.** العمل محتوى دائم، لا بيانات تشغيلية عابرة.
5. **WordPress Data Model is the Source of Truth.** Project هو Taxonomy، وTask هو Post، وContribution هو Comment، وPerson هو User.
6. **WordPress remains WordPress.** لا يعيد WorkPress بناء authentication أو users أو roles أو capabilities أو media أو editor أو REST أو search.
7. **Capabilities are owned by WordPress.** القدرة تجيب: «Can I?».
8. **Membership belongs to WorkPress.** العضوية تجيب: «Where do I belong?» والرؤية تتبعها.
9. **Assignment is responsibility.** التكليف يجيب: «What am I responsible for?» ولا يمنح صلاحية أو عضوية.
10. **Contributions preserve what happened.** المساهمة تجيب: «What happened?» وكل فعل مهم يترك Evidence.
11. **Knowledge is accepted evidence.** المعرفة تجيب: «What has been learned?» وهي عرض مصرح به للأدلة المقبولة، لا كيان بيانات مستقل.
12. **Current State is not History.** الحالة الحالية تحفظ منفصلة عن سجل الأحداث.
13. **History is never lost.** لا يمحو WorkPress أثر عمل أو قرار؛ أي إخفاء أو إلغاء يبقى قابلاً للتدقيق.
14. **Office interprets; Core never interprets.** Office هو Domain Interpretation، لا Theme ولا Module، ولا يغير النواة.
15. **Templates start work.** Project Templates مفهوم من Core؛ Office Packs توفر تطبيقاته وقوالبه.
16. **Workflow defines possibility, not meaning.** Core يعرّف States وAllowed Transitions فقط؛ المعنى التجاري للانتقالات ملك Office Packs.
17. **Services own business rules.** لا تتعامل REST أو CoWorkPress أو Office Packs أو Modules مع كيانات WordPress مباشرة.
18. **REST APIs expose services.** الـ API عقد للنواة، وليس proxy لقاعدة البيانات.
19. **Core stays domain neutral.** أي معرفة خاصة بقطاع تنتمي إلى Office Pack أو Module، لا إلى Core.
20. **Extensions are removable without data loss.** Office Packs وModules لا تملك البيانات الأساسية ولا تفقدها عند الإزالة.
21. **Read models may accelerate; they never define truth.** يجوز مستقبلًا إنشاء Index Tables اختيارية قابلة لإعادة البناء للأداء، لكنها لا تصبح المصدر القانوني للبيانات.

---

## اختبار القرار

قبل قبول أي ميزة أو schema أو endpoint أو امتداد، يجب الإجابة عن الأسئلة التالية:

1. هل يحافظ على WordPress Data Model كمصدر حقيقة؟
2. هل يضع قواعد الأعمال في Service مناسبة؟
3. هل يفصل الحالة الحالية عن التاريخ؟
4. هل يحترم العضوية والرؤية؟
5. هل يبقي Core محايدًا للمجال وقابلًا لإزالة الامتداد بلا فقد بيانات؟

إن كانت الإجابة «لا» على أي سؤال، يعاد التصميم قبل التنفيذ.

---

## 🏛️ الملاحق الدستورية التكميلية (Constitutional Addenda)
> **ملاحق تشغيلية وهندسية ملزمة مستخلصة من الممارسة الواقعية لتحصين المبادئ التأسيسية ومنع الانحراف المعماري.**

### أ. ملحق العزل اللغوي ومصفوفة التموضع الرباعية (Linguistic Autonomy)
* **استقلال الهوية اللغوية:** تطبيق WorkPress كيان مستقل لغوياً عن لغة لوحة تحكم ووردبريس الأساسية؛ يُحدد اتجاهه الصريح عبر خاصية الحاوية المستقلة `[dir="rtl"]` أو `[dir="ltr"]` ولا يُبنى أبداً على افتراض تطابق مع `body.rtl`.
* **مصفوفة الحالات الأربع:** يجب على كافة الواجهات التجاوب بصلابة مع كافة احتمالات تقاطع لغة التطبيق ولغة ووردبريس (LTR/LTR, LTR/RTL, RTL/RTL, RTL/LTR) مع حظر استخدام وحدات العرض المطلقة للشاشة (`100vw`) أو تجاوز حدود القائمة الجانبية لووردبريس.

### ب. ملحق الحوكمة المركزية لأشرطة الأدوات والمكونات (Unified Component Governance)
* **قانون شريط الأدوات الموحد (`UnifiedToolbar`):** يُحظر إنشاء أشرطة أدوات أو فلترة متباينة أو عشوائية؛ تلتزم كافة شاشات النظام بحاوية الـ Portal القياسية بارتفاع `44px` وهوامش داخلية ثابتة `padding: 0 1.5rem;` مع الفصل الصارم بين قسم المؤشرات والإحصائيات (Section 1) وقسم الأدوات والبحث والفرز (Section 2).
* **قانون القوائم المنسدلة المركزية (`CustomSelect`):** يُحظر استخدام الأسهم الافتراضية المزدوجة للمتصفح أو المثلثات المصمتة؛ تتوحد كافة القوائم المنسدلة على سهم الخط المفرغ القياسي (`dashicons-arrow-down-alt2`) مع زوايا حادة `0px`، وتطبيق قاعدة **الانفتاح الذكي نحو الداخل** لضمان بقاء القوائم داخل حدود الشاشة في كلا الاتجاهين.
* **شريط الإجراءات الجماعية العائم:** تلتزم عمليات التحديد المتعدد بالحاوية الكحلية الداكنة العائمة أسفل الشاشة لتوفير حوكمة سريعة وآمنة.

### ج. ملحق دورة حياة المعرفة والأدلة المعتمدة (Knowledge & Verification Cascade)
* **اعتماد الحل هو إغلاق حتمي:** اعتماد المساهمة (`Accept Solution`) كحل رسمي هو حدث حتمي متسلسل (`Cascading Event`) يؤدي فوراً وبشكل تلقائي إلى إغلاق المهمة كمنجزة وأرشفة المخرج في بنك المعرفة المؤسسي.
* **النزاهة والعدالة:** لا يجوز إتلاف المساهمات أو إخفاؤها؛ أي حذف يتم عبر مسار طلب الحذف المسبب (`Trash Request`) الخاضع لرقابة الإدارة.

### د. ملحق نزاهة بيئة التشغيل وأتمتة الكاش (Runtime Integrity & Automated Cache-Busting)
* **حظر التحديث اليدوي للكاش:** يُمنع قطعياً على المطورين والوكلاء البرمجيين تعديل معاملات الكاش يدوياً مثل `App.js?v=XX`.
* **التحميل الديناميكي المعتمد على النواة:** تستمد الواجهة الأمامية بصمة الإصدار وزمن تعديل الملفات تلقائياً من إعدادات PHP عبر `window.workpressSettings.version` لضمان تحميل أحدث الأصول البرمجية فورياً دون أي تدخل بشري.
