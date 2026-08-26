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

## اختبار القرار

قبل قبول أي ميزة أو schema أو endpoint أو امتداد، يجب الإجابة عن الأسئلة التالية:

1. هل يحافظ على WordPress Data Model كمصدر حقيقة؟
2. هل يضع قواعد الأعمال في Service مناسبة؟
3. هل يفصل الحالة الحالية عن التاريخ؟
4. هل يحترم العضوية والرؤية؟
5. هل يبقي Core محايدًا للمجال وقابلًا لإزالة الامتداد بلا فقد بيانات؟

إن كانت الإجابة «لا» على أي سؤال، يعاد التصميم قبل التنفيذ.
