/**
 * Registry of Abstract Generic Field Primitives.
 * Designed for pure domain-agnostic flexibility & future extensibility.
 * 
 * @package WorkPress
 * @subpackage Components/Forms
 */
export const FIELD_PRIMITIVES = {
	smart_title: {
		type: 'smart_title',
		label: 'حقل العنوان والمعرف الذكي',
		icon: 'dashicons-tag',
		badge: 'رئيسي',
		defaultLabel: 'عنوان الطلب / اسم المشروع:',
		defaultPlaceholder: 'اكتب اسم أو عنوان طلبك...',
		description: 'يقبل قائمة اقتراحات سريعة مسبقة مع خيار كتابة حرة دائماً للعميل.'
	},
	scope_description: {
		type: 'scope_description',
		label: 'شرح وبيان تفاصيل الطلب',
		icon: 'dashicons-editor-paragraph',
		badge: 'رئيسي',
		defaultLabel: 'بيان وشرح تفاصيل الطلب:',
		defaultPlaceholder: 'وضح بالتفصيل ما تريده من فريق العمل، المخرجات المستهدفة، وأي متطلبات خاصة...',
		description: 'مساحة نصية موسعة لكتابة تفاصيل ونطاق المشروع.'
	},
	select_custom: {
		type: 'select_custom',
		label: 'قائمة خيارات منسدلة (Single Select)',
		icon: 'dashicons-arrow-down-alt2',
		badge: 'خيارات',
		defaultLabel: 'نوع أو تصنيف الخدمة:',
		defaultOptions: ['الخيار الأول القياسي', 'الخيار الثاني المتقدم'],
		description: 'قائمة خيارات يحددها المدير مع إتاحة كتابة خيار مخصص.'
	},
	pills: {
		type: 'pills',
		label: 'وسوم وتصنيفات متعددة (Multi-select)',
		icon: 'dashicons-tagcloud',
		badge: 'متعدد',
		defaultLabel: 'المواصفات والشروط المحددة:',
		defaultOptions: ['تسليم سريع', 'توثيق رسمي', 'دعم ومتابعة'],
		description: 'أزرار وسوم يختار العميل منها خياراً واحداً أو أكثر.'
	},
	short_text: {
		type: 'short_text',
		label: 'نص قصير (Short Text)',
		icon: 'dashicons-editor-textcolor',
		badge: 'نص',
		defaultLabel: 'معلومة أو شرط إضافي:',
		defaultPlaceholder: 'اكتب هنا...',
		description: 'خانة نصية موجزة لمعلومة محددة مثل رابط أو مرجع.'
	},
	textarea: {
		type: 'textarea',
		label: 'نص موسع (Detailed Textarea)',
		icon: 'dashicons-align-right',
		badge: 'نص',
		defaultLabel: 'ملاحظات أو شروط خاصة:',
		defaultPlaceholder: 'أدخل أي شروط تفصيلية...',
		description: 'مساحة نصية لكتابة تعليمات أو بنود خاصة.'
	},
	numeric: {
		type: 'numeric',
		label: 'رقم / ميزانية / كمية (Numeric)',
		icon: 'dashicons-money-alt',
		badge: 'رقم',
		defaultLabel: 'الميزانية أو الكمية التقديرية:',
		defaultPlaceholder: 'مثال: 5,000',
		description: 'خانة أرقام للكميات، الساعات، أو التقديرات المالية.'
	},
	date: {
		type: 'date',
		label: 'موعد وتاريخ تسليم (Target Date)',
		icon: 'dashicons-calendar-alt',
		badge: 'تاريخ',
		defaultLabel: 'تاريخ الإنجاز المطلوب:',
		description: 'محدد تاريخ لموعد التسليم المأمول أو تاريخ البدء.'
	},
	upload: {
		type: 'upload',
		label: 'رفع ملفات ومستندات (Attachments)',
		icon: 'dashicons-upload',
		badge: 'ملفات',
		defaultLabel: 'ملفات ومستندات مرجعية داعمة:',
		description: 'منطقة رفع لسحب وإرفاق العقود والمستندات والتصاميم.'
	}
};

export const DEFAULT_UNIVERSAL_FORM = {
	id: 'standard_request',
	name: 'نموذج طلب خدمة / عمل قياسي',
	title_label: 'عنوان الطلب / اسم المشروع:',
	title_placeholder: 'اكتب اسم أو عنوان طلبك...',
	title_suggestions: [
		'تنفيذ مشروع وخدمة جديدة متكاملة',
		'طلب تعديل وتطوير على أعمال سابقة',
		'استشارة فنية ودراسة متطلبات متخصصة',
		'مهمة دورية وإشراف تنفيذي'
	],
	desc_label: 'بيان وشرح تفاصيل الطلب:',
	desc_placeholder: 'وضح بالتفصيل ما تريده من فريق العمل، المخرجات المستهدفة، وأي متطلبات خاصة...',
	specs: [
		{
			id: 'service_tier',
			type: 'select_custom',
			label: 'تصنيف أو نوع الخدمة المطلوبة:',
			options: ['خدمة أساسية قياسية', 'خدمة متقدمة شاملة', 'حزمة مخصصة بحسب الاتفاق'],
			required: true
		},
		{
			id: 'deliverables_options',
			type: 'pills',
			label: 'الخيارات والمواصفات المحددة:',
			options: ['تسليم سريع ومستعجل', 'توثيق وتدريب مفصل', 'مراجعة واعتماد رسمي', 'دعم ومتابعة مستمرة'],
			required: false
		},
		{
			id: 'budget_est',
			type: 'numeric',
			label: 'الميزانية أو الكمية التقديرية (اختياري):',
			placeholder: 'مثال: 5,000',
			required: false
		},
		{
			id: 'target_date',
			type: 'date',
			label: 'تاريخ الإنجاز المطلوب (Target Deadline):',
			required: false
		},
		{
			id: 'attachments',
			type: 'upload',
			label: 'ملفات ومستندات مرجعية داعمة للطلب:',
			required: false
		}
	]
};
