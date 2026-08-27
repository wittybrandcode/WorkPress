/**
 * WorkPress Encyclopedia Structured Data (SSOT)
 * 
 * Separates encyclopedic content from presentation templates.
 * 
 * @package WorkPress
 * @subpackage Components/About
 */

export const SECTIONS = [
	{ id: 'all', label: 'الموسوعة الشاملة (الكل)', icon: 'dashicons-book-alt' },
	{ id: 'philosophy', label: 'الفلسفة والركائز الست', icon: 'dashicons-lightbulb' },
	{ id: 'roles_spaces', label: 'الأدوار والمساحات الثلاث', icon: 'dashicons-groups' },
	{ id: 'capabilities', label: 'مصفوفة الصلاحيات الذرية الـ 8', icon: 'dashicons-shield' },
	{ id: 'tripartite', label: 'معادلة التفويض وقواعد الأمان', icon: 'dashicons-lock' },
	{ id: 'lifecycle', label: 'دورة حياة العمل الشاملة', icon: 'dashicons-randomize' },
	{ id: 'services', label: 'الخدمات المعمارية الـ 17', icon: 'dashicons-rest-api' },
	{ id: 'database', label: 'البنية التحتية للبيانات', icon: 'dashicons-database' },
	{ id: 'engines', label: 'المحركات الإنتاجية المدمجة', icon: 'dashicons-performance' },
];

export const PILLARS = [
	{
		title: 'الأنطولوجيا الأصلية في ووردبريس',
		subtitle: 'Native WordPress Ontology',
		icon: 'dashicons-wordpress-alt',
		color: '#008478',
		desc: 'استخدام جداول ووردبريس الأساسية (wp_terms للمشاريع، wp_posts للمهام، wp_comments للمساهمات) دون جداول SQL مخصصة، لضمان التوافق الأبدي وسرعة الكاش.'
	},
	{
		title: 'العمل أولاً وحماية الأثر',
		subtitle: 'Just Work Philosophy',
		icon: 'dashicons-hammer',
		color: '#0284c7',
		desc: 'المنفذ يركز على تقديم الحل ورفع الدليل، بينما تتولى المنظومة تلقائياً إكمال المهام وتحديث التقدم وأرشفة الحل في المعرفة فور اعتماد القائد.'
	},
	{
		title: 'هرم المواطنة وعزل البوابات',
		subtitle: '4-Tier Citizenship & Standalone Portal',
		icon: 'dashicons-shield-alt',
		color: '#7c3aed',
		desc: 'فصل تام بين الفريق الفني وعملاء المنشأة، مع بوابة مستقلة `/portal/` خالية من أي تسريب بصري وتمنع التكليف العشوائي.'
	},
	{
		title: 'معادلة التفويض الثلاثي',
		subtitle: 'Tri-Partite Authorization Formula',
		icon: 'dashicons-lock',
		color: '#d97706',
		desc: 'التحقق الصارم من 3 طبقات: الصلاحية العامة + عضوية المشروع + العلاقة المباشرة بالكيان لمنع أي تسريب للمعلومات الحساسة.'
	},
	{
		title: 'المعرفة التراكمية السيادية',
		subtitle: 'Living Institutional Memory',
		icon: 'dashicons-book',
		color: '#059669',
		desc: 'الحلول المعتمدة رسمياً تتحول لحظياً إلى ذاكرة معرفية تراكمية للمنشأة، قابلة للتصدير ككتيبات Markdown قابلة للطباعة.'
	},
	{
		title: 'خطافات الويب والأتمتة الحية',
		subtitle: 'Outbound Webhooks & Integrations',
		icon: 'dashicons-rest-api',
		color: '#e11d48',
		desc: 'بث لحظي لأحداث العمليات والمشاريع إلى Discord و Slack و Teams و Make.com مع توقيع مشفر بـ HMAC-SHA256.'
	}
];

export const CORE_SERVICES = [
	{ name: 'WorkPress_Project_Service', file: 'class-workpress-project-service.php', role: 'إدارة المشاريع، حساب مؤشرات الإنجاز، وفحص قيادة المشروع.' },
	{ name: 'WorkPress_Task_Service', file: 'class-workpress-task-service.php', role: 'إدارة المهام، التحقق من الحالات، وقوائم الفحص التفاعلية.' },
	{ name: 'WorkPress_Assignment_Service', file: 'class-workpress-assignment-service.php', role: 'حوكمة تكليف المنفذين وحظر تكليف العملاء والمشاهدين.' },
	{ name: 'WorkPress_Contribution_Service', file: 'class-workpress-contribution-service.php', role: 'تسجيل المساهمات والأدلة واعتماد الحلول الناجزة.' },
	{ name: 'WorkPress_Portal_Service', file: 'class-workpress-portal-service.php', role: 'إدارة فضاء وبوابة العميل المستقلة والتوقيع الرقمي.' },
	{ name: 'WorkPress_Knowledge_Service', file: 'class-workpress-knowledge-service.php', role: 'بناء بنك المعرفة واستخلاص كتب التوثيق .md.' },
	{ name: 'WorkPress_Webhook_Service', file: 'class-workpress-webhook-service.php', role: 'بث الأحداث وتوليد حمولات Discord و Slack و Teams.' },
	{ name: 'WorkPress_Security_Service', file: 'class-workpress-security-service.php', role: 'تأمين سلة المهملات ومنع الحذف العشوائي للكيانات.' },
	{ name: 'WorkPress_Membership_Service', file: 'class-workpress-membership-service.php', role: 'إدارة عضويات المشاريع ومطابقة رتب الأعضاء.' },
	{ name: 'WorkPress_Hibernation_Service', file: 'class-workpress-hibernation-service.php', role: 'تجميد وإذابة مشاريع العملاء تلقائياً عند تغيير رتبهم.' },
	{ name: 'WorkPress_Time_Service', file: 'class-workpress-time-service.php', role: 'تتبع الساعات الفعلية وتقديرات الإنجاز ومعدل الحرق.' },
	{ name: 'WorkPress_Report_Service', file: 'class-workpress-report-service.php', role: 'تجميع التقارير التنفيذية ومؤشرات الأداء KPI.' },
	{ name: 'WorkPress_Intake_Service', file: 'class-workpress-intake-service.php', role: 'إدارة مخطط نماذج الاستقبال الديناميكية واستوديو الفرز.' },
	{ name: 'WorkPress_Activity_Service', file: 'class-workpress-activity-service.php', role: 'تسجيل سجل الأنشطة والتدقيق غير القابل للتعديل.' },
	{ name: 'WorkPress_Capabilities_Registry', file: 'class-workpress-capabilities-registry.php', role: 'تسجيل وإدارة الصلاحيات الذرية الـ 34.' },
	{ name: 'WorkPress_Roles_Service', file: 'class-workpress-roles-service.php', role: 'إدارة وتخصيص الأدوار والرتب في ووردبريس.' },
	{ name: 'WorkPress_Settings_Service', file: 'class-workpress-settings-service.php', role: 'إدارة إعدادات المنظومة وحزم المؤثرات الصوتية.' }
];
