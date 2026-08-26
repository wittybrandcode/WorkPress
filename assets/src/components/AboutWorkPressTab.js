import { html, useState } from '../utils/html.js';
import WorkPressLogo from './WorkPressLogo.js';

/**
 * AboutWorkPressTab Component
 * 
 * Master Architectural Encyclopedia & Institutional Guide for WorkPress v2.2.0.
 * Covers Operating Philosophy, 6 Pillars, 4-Tier Citizenship, 8 Atomic Capability Packages,
 * Tri-Partite Authorization Formula, Complete Lifecycle Pipeline, 17 Core Services, and Native Data Architecture.
 */
export default function AboutWorkPressTab() {
	const [activeSection, setActiveSection] = useState('all');

	const sections = [
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

	return html`
		<div className="wp-about-page" style=${{ color: '#0f172a' }}>
			
			<!-- Logo & Version Showcase Banner -->
			<div className="wp-card p-6 mb-5 has-text-centered" style=${{ 
				backgroundColor: '#ffffff', 
				border: '1px solid #e2e8f0', 
				borderRadius: 0,
				boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
				paddingTop: '2.5rem',
				paddingBottom: '2.5rem'
			}}>
				<div className="is-flex is-justify-content-center is-align-items-center mb-3">
					<div style=${{ maxWidth: '520px', width: '100%', display: 'flex', justifyContent: 'center' }}>
						<${WorkPressLogo} height=${58} />
					</div>
				</div>

				<p className="is-size-6 has-text-grey mb-3" style=${{ fontWeight: '600' }}>
					الموسوعة الهندسية والمعمارية الشاملة لمنظومة إدارة وتوثيق العمل الأصلية في ووردبريس
				</p>

				<div className="is-flex is-justify-content-center is-align-items-center" style=${{ gap: '10px', flexWrap: 'wrap' }}>
					<span className="tag is-primary is-light has-text-weight-bold" style=${{ 
						borderRadius: 0, 
						fontSize: '0.92rem',
						height: '32px',
						padding: '0 16px',
						backgroundColor: '#ecfdf5',
						color: '#047857',
						border: '1px solid #a7f3d0'
					}}>
						WorkPress v2.2.0 — Stable Release
					</span>
					<span className="tag is-dark has-text-weight-bold" style=${{ 
						borderRadius: 0, 
						fontSize: '0.92rem',
						height: '32px',
						padding: '0 16px',
						backgroundColor: '#0f172a',
						color: '#ffffff'
					}}>
						Zero-Table Native Engine
					</span>
					<span className="tag is-info is-light has-text-weight-bold" style=${{ 
						borderRadius: 0, 
						fontSize: '0.92rem',
						height: '32px',
						padding: '0 16px',
						backgroundColor: '#eff6ff',
						color: '#1d4ed8',
						border: '1px solid #bfdbfe'
					}}>
						8 Capability Packages • 17 Core Services
					</span>
				</div>
			</div>

			<!-- Interactive Encyclopedic Quick Navigation -->
			<div className="wp-card p-3 mb-5" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
				<div className="is-flex is-align-items-center is-flex-wrap-wrap" style=${{ gap: '6px' }}>
					${sections.map(sec => html`
						<button 
							key=${sec.id}
							type="button"
							className=${`button wp-header-btn ${activeSection === sec.id ? 'is-active' : ''}`}
							onClick=${() => setActiveSection(sec.id)}
							style=${{ height: '30px', padding: '0 12px', fontSize: '0.8rem' }}
						>
							<span className="icon is-small"><i className=${`dashicons ${sec.icon}`}></i></span>
							<span>${sec.label}</span>
						</button>
					`)}
				</div>
			</div>

			<!-- ============================================================== -->
			<!-- SECTION 1: PHILOSOPHY & 6 CORE PILLARS                         -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'philosophy') && html`
				<div className="mb-6">
					<!-- Philosophy Statement (فلسفة العمل) -->
					<div className="wp-card p-5 mb-5" style=${{ 
						backgroundColor: '#ffffff', 
						border: '1px solid #e2e8f0', 
						borderRight: '5px solid #10b981', 
						borderRadius: 0,
						boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
					}}>
						<div className="is-flex is-align-items-center mb-3">
							<span className="icon has-text-success ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-lightbulb" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								فلسفة العمل والسيادة التشغيلية — just work.
							</h3>
						</div>
						<div className="content is-size-6" style=${{ lineHeight: '1.9', color: '#1e293b', fontWeight: '500' }}>
							<p style=${{ margin: 0 }}>
								<strong>WorkPress — just work.</strong> ليست مجرد أداة لإدارة المهام؛ بل هي <strong>بنية تحتية سيادية للذاكرة المؤسسية</strong> مبنية داخل نسيج ووردبريس الأصلي. الفلسفة تقوم على مبدأ حاسم: <strong>التركيز على العمل نفسه</strong>. بدلاً من إضاعة الوقت في تحديث الحالات اليدوية أو الحقول الوهمية، يقوم المنفذ بعمله الفعلي؛ يكتب، يرفع الدليل، ويقترح الحل. فور اعتماد الحل من قائد المشروع، تتولى المنظومة بقية السلسلة تلقائياً: إكمال المهمة، تحديث تقدم المشروع، إيداع الحل في بنك المعرفة الدائم، وإشعار العميل عبر بوابته المستقلة. <strong>أنت تعمل، وWorkPress يوثق ويحمي ويحكم الأثر.</strong>
							</p>
						</div>
					</div>

					<!-- 6 Core Architectural Pillars (الركائز الهندسية الست للمنظومة) -->
					<h3 className="title is-5 mb-3 has-text-weight-bold has-text-dark is-flex is-align-items-center">
						<span className="icon ml-2" style=${{ marginLeft: '8px' }}><i className="dashicons dashicons-grid-view has-text-success"></i></span>
						<span>الركائز الهندسية الست لمنظومة WorkPress v2.2.0</span>
					</h3>

					<div className="columns is-multiline">
						
						<!-- Pillar 1: Native WP Ontology -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-primary ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-database" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										1. الأنطولوجيا الأصلية (Native WP)
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									صفر جداول مخصصة عشوائية؛ المشاريع تصنيفات <code style=${{ borderRadius: 0 }}>Taxonomy</code>، المهام منشورات مخصصة <code style=${{ borderRadius: 0 }}>CPT</code>، والمساهمات تعليقات متقدمة <code style=${{ borderRadius: 0 }}>Comments</code> تضمن استدامة وتوافق بياناتك للأبد.
								</p>
							</div>
						</div>

						<!-- Pillar 2: Truth & Immutable History -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-success ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										2. الحقيقة تقود الحالة
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									لا توجد حالات وهمية؛ المساهمة المعتمدة والدليل الفني هما البرهان الوحيد على تقدم العمل، وكافة العمليات توثق كأثر تاريخي غير قابل للمحو في سجل المساهمات.
								</p>
							</div>
						</div>

						<!-- Pillar 3: Cascading Completion & Knowledge -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-info ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-randomize" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										3. الإكمال المتتالي والمعرفة
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									اعتماد الحل الفني يكمل المهمة فوراً، واكتمال كافة المهام يختتم المشروع تلقائياً ويحول الحلول المعتمدة إلى أصل معرفي قابل للبحث والتصدير بصيغ Markdown و PDF.
								</p>
							</div>
						</div>

						<!-- Pillar 4: Standalone Portal & 4-Tier Citizenship -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-warning ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-shield-alt" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										4. البوابة المستقلة وهرم المواطنة
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									عزل تام 0% CSS Bleed لبوابة المستفيدين <code style=${{ borderRadius: 0 }}>/portal/</code>، مع تطبيق هرم المواطنة الرباعي لمنع تسريب بيانات العمليات الفنية للعملاء.
								</p>
							</div>
						</div>

						<!-- Pillar 5: Tri-Partite Authorization -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-danger ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-lock" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										5. التفويض الثلاثي (RBAC)
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									معادلة أمنية صارمة: <code style=${{ borderRadius: 0 }}>Access ∧ Visibility ∧ Action</code> عبر 8 حزم صلاحيات ذرية تضمن عدم تجاوز أي مستخدم لحدود مشاريعه المصرح بها.
								</p>
							</div>
						</div>

						<!-- Pillar 6: Cryptographic Webhooks -->
						<div className="column is-4">
							<div className="wp-card p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
								<div className="is-flex is-align-items-center mb-2">
									<span className="icon is-medium has-text-info ml-2" style=${{ marginLeft: '8px' }}>
										<i className="dashicons dashicons-rest-api" style=${{ fontSize: '22px' }}></i>
									</span>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">
										6. خطافات الويب المشفرة
									</h4>
								</div>
								<p className="is-size-7 has-text-grey mb-0" style=${{ lineHeight: '1.7' }}>
									تكامل خارجي فوري مع Discord و Slack و Teams والأنظمة المؤسسية بتوقيع رقمي مشفر <code style=${{ borderRadius: 0 }}>HMAC-SHA256</code> عبر 6 أحداث تأسيسية حية.
								</p>
							</div>
						</div>

					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 2: ROLES, CUSTOM ROLES & TRI-SPACE SOVEREIGNTY         -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'roles_spaces') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-primary ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-groups" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								هندسة الأدوار، الرتب المخصصة، والفصل المعماري للمساحات الثلاث
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							يوفر WorkPress نموذج حوكمة سيادي فريد يجمع بين إدارة الأدوار القياسية، استنساخ الرتب المخصصة ديناميكياً، مع فرض عزل تام بين المساحات الثلاث:
						</p>

						<!-- Part 1: Canonical Roles vs Custom Roles -->
						<h4 className="title is-6 mb-3 has-text-dark is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<i className="dashicons dashicons-id has-text-info"></i>
							<span>1. الأدوار القياسية المدمجة والأدوار المخصصة (Canonical & Custom Roles):</span>
						</h4>

						<div className="columns is-multiline mb-4">
							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-admin-generic has-text-danger ml-1"></i>
										<strong className="has-text-dark is-size-7">المدير العام (Administrator)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">الحوكمة الشاملة، الإشراف على غرف العمليات، تعديل مصفوفة الصلاحيات، تعيين قادة المشاريع، والتحكم في المحذوفات والتكاملات الخارجية.</p>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-businessman has-text-info ml-1"></i>
										<strong className="has-text-dark is-size-7">المحرر (Editor — نمط قيادة المشاريع)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">قائد المشاريع المسؤول عن تفكيك الأهداف إلى مهام، تخصيص المنفذين، ضبط التقديرات الزمنية، وفحص واعتماد الحلول الفنية الرسمية.</p>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-edit has-text-success ml-1"></i>
										<strong className="has-text-dark is-size-7">الكاتب (Author — نمط الإنتاج المستقل)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">منفذ مستقل يملك القدرة على إنشاء مهامه الذاتية، تسجيل ساعات العمل، واقتراح الحلول وإرفاق الأدلة الفنية لمشاريع الفريق.</p>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-admin-users has-text-warning ml-1"></i>
										<strong className="has-text-dark is-size-7">المساهم (Contributor — نمط التنفيذ الموجه)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">منفذ يعمل حصرياً في المهام المسندة إليه، يقدم تقارير الإنجاز والمساهمات للمراجعة، دون صلاحية إنشاء مشاريع أو إغلاق مهام.</p>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-id-alt has-text-primary ml-1"></i>
										<strong className="has-text-dark is-size-7">مستفيد وركبرس (workpress_client)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">دور سيادي معزول تماماً عن لوحة الإدارة الفنية؛ يعمل حصرياً داخل البوابة المستقلة <code style=${{ borderRadius: 0 }}>/portal/</code> لتقديم الطلبات واعتماد محاضر التسليم.</p>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-1">
										<i className="dashicons dashicons-visibility has-text-grey ml-1"></i>
										<strong className="has-text-dark is-size-7">المشترك (Subscriber — الحساب الافتراضي)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-0">المستخدم العام المسجل في ووردبريس، محمي ومعزول بالكامل عن العمليات الفنية مع توجيه ذكي للبوابة عند تسجيل الدخول.</p>
								</div>
							</div>
						</div>

						<!-- Part 2: Custom Roles Engine & Aliases -->
						<div className="notification p-4 mb-5" style=${{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 0 }}>
							<h4 className="title is-6 mb-2 has-text-dark is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<i className="dashicons dashicons-randomize has-text-primary"></i>
								<span>محرك الرتب المخصصة والأسماء المستعارة (Custom Roles & Aliases Engine):</span>
							</h4>
							<p className="is-size-7 has-text-grey-dark mb-2" style=${{ lineHeight: '1.8' }}>
								• <strong>الاستنساخ الذري من الأنماط (Archetype Cloning):</strong> يمكنك إنشاء أي عدد من الأدوار الإضافية (مثل: <code style=${{ borderRadius: 0 }}>qa_specialist</code>, <code style=${{ borderRadius: 0 }}>project_coordinator</code>, <code style=${{ borderRadius: 0 }}>financial_auditor</code>) باستنساخ سلوك أحد الأنماط القياسية.
							</p>
							<p className="is-size-7 has-text-grey-dark mb-2" style=${{ lineHeight: '1.8' }}>
								• <strong>الضبط المستقل لمصفوفة الصلاحيات:</strong> لكل دور مخصص سطر مستقل في مصفوفة الصلاحيات؛ يمكنك منحه أو سحب أي قدرة من الـ 27 صلاحية ذرية وتطبيقها فوراً دون أي إعادة تحميل.
							</p>
							<p className="is-size-7 has-text-grey-dark mb-0" style=${{ lineHeight: '1.8' }}>
								• <strong>محرك المسميات الوظيفية (Role Aliases):</strong> إمكانية تعريب وتغيير التسمية الظاهرة للأدوار (مثلاً: إظهار دور المحرر باسم "مدير العمليات" أو "رئيس الفريق") ليتناسب تماماً مع ثقافة المنشأة.
							</p>
						</div>

						<!-- Part 3: The Tri-Space Sovereign Separation Architecture -->
						<h4 className="title is-6 mb-3 has-text-dark is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<i className="dashicons dashicons-shield-alt has-text-success"></i>
							<span>2. الفصل المعماري والسيادي للمساحات الثلاث (The Tri-Space Separation):</span>
						</h4>
						<p className="is-size-7 has-text-grey mb-3">
							يقسم WorkPress بيئة المنشأة إلى 3 مساحات تشغيلية معزولة جدارياً لمنع أي تسريب بيانات أو تداخل بين الواجهات:
						</p>

						<div className="columns is-multiline">
							
							<!-- Space 1 -->
							<div className="column is-4">
								<div className="p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon has-text-info ml-2"><i className="dashicons dashicons-admin-site-alt3" style=${{ fontSize: '20px' }}></i></span>
										<strong className="has-text-dark is-size-6">المساحة 1: موقع ووردبريس العام</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>WordPress Public Front-end</code></p>
									<p className="is-size-7 has-text-grey-dark mb-2" style=${{ lineHeight: '1.7' }}>
										<strong>الجمهور:</strong> الزوار، القراء، والعموم.
									</p>
									<p className="is-size-7 has-text-grey-dark mb-0" style=${{ lineHeight: '1.7' }}>
										<strong>العزل والحماية:</strong> صفر وصول للمشاريع أو المهام الداخلية؛ لا يتم تحميل أي سكريبتات أو أنماط لـ WorkPress على القالب العام، مما يحافظ على سرعة الموقع وأمانه التام.
									</p>
								</div>
							</div>

							<!-- Space 2 -->
							<div className="column is-4">
								<div className="p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '2px solid #10b981' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon has-text-success ml-2"><i className="dashicons dashicons-id-alt" style=${{ fontSize: '20px' }}></i></span>
										<strong className="has-text-dark is-size-6">المساحة 2: بوابة المستفيدين المعزولة</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>Standalone Portal: /portal/</code></p>
									<p className="is-size-7 has-text-grey-dark mb-2" style=${{ lineHeight: '1.7' }}>
										<strong>الجمهور:</strong> المستفيدون، أصحاب المشاريع، ورتبة <code style=${{ borderRadius: 0 }}>workpress_client</code>.
									</p>
									<p className="is-size-7 has-text-grey-dark mb-0" style=${{ lineHeight: '1.7' }}>
										<strong>العزل والحماية:</strong> عزل تام 100% بنظام <code style=${{ borderRadius: 0 }}>Zero CSS Bleed</code>؛ تتجاوز قالب الموقع تماماً، ولا تسمح للعميل بدخول لوحة الإدارة الفنية <code style=${{ borderRadius: 0 }}>/wp-admin/</code> أو رؤية المداولات الفنية الداخلية.
									</p>
								</div>
							</div>

							<!-- Space 3 -->
							<div className="column is-4">
								<div className="p-4 h-100" style=${{ backgroundColor: '#ffffff', border: '2px solid #0f172a' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon has-text-danger ml-2"><i className="dashicons dashicons-networking" style=${{ fontSize: '20px' }}></i></span>
										<strong className="has-text-dark is-size-6">المساحة 3: غرفة عمليات CoWorkPress</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>Admin SPA Workspace</code></p>
									<p className="is-size-7 has-text-grey-dark mb-2" style=${{ lineHeight: '1.7' }}>
										<strong>الجمهور:</strong> الكوادر الفنية، قادة المشاريع، المنفذون، والإدارة العليا.
									</p>
									<p className="is-size-7 has-text-grey-dark mb-0" style=${{ lineHeight: '1.7' }}>
										<strong>العزل والحماية:</strong> غرفة العمليات الكاملة (الكانبان، جانت، بنك المعرفة، تتبع الوقت، والمصفوفة). محمية بمعادلة التفويض الثلاثي وتمنع أي مستخدم غير مصرح من الاطلاع على تفاصيل المنشأة.
									</p>
								</div>
							</div>

						</div>

					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 3: 8 ATOMIC CAPABILITY PACKAGES                        -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'capabilities') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-primary ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-shield" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								مصفوفة الصلاحيات والحزم الذرية الـ 8 (Atomic Capability Packages)
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							تنقسم صلاحيات WorkPress إلى 8 حزم ذرية سيادية، تتيح تخصيصاً فائق الدقة لكل دور ومستخدم، وتعمل على نحو ديناميكي فوري دون الحاجة لتعديل الكود:
						</p>

						<div className="columns is-multiline">
							
							<!-- Package 1 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-link ml-2"><i className="dashicons dashicons-portfolio"></i></span>
										<strong className="has-text-dark is-size-6">1. حزمة إدارة المشاريع (Project Management)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_project_management</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>manage_workpress_projects</code>: الإدارة الشاملة للمشاريع وتعيين القادة وتعديل الإعدادات.</li>
										<li><code style=${{ borderRadius: 0 }}>create_workpress_projects</code>: إنشاء مشاريع جديدة وضبط بادئات الرمز التلقائي (Prefix).</li>
										<li><code style=${{ borderRadius: 0 }}>edit_workpress_projects</code>: تعديل تفاصيل المشاريع ومواعيد التسليم والميزانيات المقدرة.</li>
										<li><code style=${{ borderRadius: 0 }}>delete_workpress_projects</code>: تقديم طلبات حذف المشاريع ونقلها للمراجعة الأمنية.</li>
										<li><code style=${{ borderRadius: 0 }}>archive_workpress_projects</code>: أرشفة واختتام المشاريع المكتملة وتجميد العمليات عليها.</li>
									</ul>
								</div>
							</div>

							<!-- Package 2 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-success ml-2"><i className="dashicons dashicons-list-view"></i></span>
										<strong className="has-text-dark is-size-6">2. حزمة تنفيذ وإدارة المهام (Task Execution)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_task_execution</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>create_workpress_tasks</code>: إنشاء بطاقات المهام وتعيين الأولويات وتقديرات الوقت.</li>
										<li><code style=${{ borderRadius: 0 }}>edit_workpress_tasks</code>: تعديل تفاصيل المهمة وبنود قوائم التدقيق (Checklists).</li>
										<li><code style=${{ borderRadius: 0 }}>assign_workpress_tasks</code>: توزيع وإسناد المهام لأعضاء الفريق والمنفذين.</li>
										<li><code style=${{ borderRadius: 0 }}>delete_workpress_tasks</code>: طلب حذف المهام العالقة وتحويلها لمركز المحذوفات.</li>
										<li><code style=${{ borderRadius: 0 }}>close_workpress_tasks</code>: الإغلاق اليدوي للمهمة واعتماد الإنجاز الفني.</li>
									</ul>
								</div>
							</div>

							<!-- Package 3 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-primary ml-2"><i className="dashicons dashicons-share-alt2"></i></span>
										<strong className="has-text-dark is-size-6">3. حزمة تدفق المساهمات والأدلة (Contribution Flow)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_contribution_flow</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>submit_workpress_contributions</code>: إضافة تقرير فني، تعليق، أو اقتراح حل رسمي مع الدليل.</li>
										<li><code style=${{ borderRadius: 0 }}>review_workpress_contributions</code>: مراجعة وتدقيق مساهمات وتقارير أعضاء الفريق.</li>
										<li><code style=${{ borderRadius: 0 }}>accept_workpress_contributions</code>: اعتماد الحل المقترح وتفعيل الإكمال المتتالي آلياً.</li>
										<li><code style=${{ borderRadius: 0 }}>delete_workpress_contributions</code>: طلب حذف المساهمة الخاطئة مع ذكر السبب.</li>
									</ul>
								</div>
							</div>

							<!-- Package 4 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-warning ml-2"><i className="dashicons dashicons-awards"></i></span>
										<strong className="has-text-dark is-size-6">4. حزمة حوكمة المعرفة المؤسسية (Knowledge Governance)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_knowledge_governance</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>view_workpress_knowledge</code>: البحث والاطلاع على رصيد الحلول المعتمدة ومكتبة الخبرات.</li>
										<li><code style=${{ borderRadius: 0 }}>publish_workpress_knowledge</code>: اعتماد الحلول كأصول معرفية رسمية ونشرها للفريق.</li>
										<li><code style=${{ borderRadius: 0 }}>export_workpress_knowledge</code>: تصدير كتيب المعرفة الشامل بصيغة Markdown أو تقارير PDF.</li>
									</ul>
								</div>
							</div>

							<!-- Package 5 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-info ml-2"><i className="dashicons dashicons-id-alt"></i></span>
										<strong className="has-text-dark is-size-6">5. حزمة بوابة المستفيدين (Client Portal Experience)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_client_portal</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>access_workpress_portal</code>: الدخول إلى واجهة البوابة المستقلة المعزولة <code style=${{ borderRadius: 0 }}>/portal/</code>.</li>
										<li><code style=${{ borderRadius: 0 }}>submit_workpress_requests</code>: تعبئة وإرسال طلبات المشاريع عبر النماذج الذكية.</li>
										<li><code style=${{ borderRadius: 0 }}>review_workpress_deliverables</code>: استعراض مخرجات ووثائق المشروع وتقديم الملاحظات.</li>
										<li><code style=${{ borderRadius: 0 }}>signoff_workpress_deliverables</code>: التوقيع الرقمي النهائي واعتماد محاضر الاستلام الرسمية.</li>
									</ul>
								</div>
							</div>

							<!-- Package 6 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-link ml-2"><i className="dashicons dashicons-rest-api"></i></span>
										<strong className="has-text-dark is-size-6">6. حزمة خطافات الويب والتكامل (Webhooks & Synapses)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_webhooks_integration</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>manage_workpress_webhooks</code>: إنشاء وتعديل روابط خطافات الويب وضبط مفاتيح HMAC السرية.</li>
										<li><code style=${{ borderRadius: 0 }}>test_workpress_webhooks</code>: إرسال أحداث الاختبار الحية والتحقق من رموز الاستجابة.</li>
									</ul>
								</div>
							</div>

							<!-- Package 7 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-danger ml-2"><i className="dashicons dashicons-trash"></i></span>
										<strong className="has-text-dark is-size-6">7. حزمة الأمان والرقابة والمحذوفات (Security & Audit)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_security_audit</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>view_workpress_audit_logs</code>: استعراض سجل النشاطات التاريخية الموثقة وغير القابلة للمحو.</li>
										<li><code style=${{ borderRadius: 0 }}>manage_workpress_trash</code>: فحص وقبول أو رفض طلبات حذف المهام والمساهمات.</li>
										<li><code style=${{ borderRadius: 0 }}>purge_workpress_data</code>: التطهير والحذف النهائي للبيانات مع ضمان سلامة الموقع.</li>
									</ul>
								</div>
							</div>

							<!-- Package 8 -->
							<div className="column is-6">
								<div className="p-4 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<div className="is-flex is-align-items-center mb-2">
										<span className="icon is-small has-text-dark ml-2"><i className="dashicons dashicons-admin-generic"></i></span>
										<strong className="has-text-dark is-size-6">8. حزمة ضبط النظام وتخصيص الصلاحيات (Configuration)</strong>
									</div>
									<p className="is-size-7 has-text-grey mb-2"><code style=${{ borderRadius: 0 }}>workpress_system_configuration</code></p>
									<ul className="is-size-7 has-text-grey-dark" style=${{ listStyleType: 'disc', marginRight: '1.2rem', lineHeight: '1.8' }}>
										<li><code style=${{ borderRadius: 0 }}>manage_workpress_settings</code>: ضبط التوقيت المحلي، حزم الأصوات، والإشعارات البريدية.</li>
										<li><code style=${{ borderRadius: 0 }}>manage_workpress_capabilities</code>: تعديل مصفوفة صلاحيات الأدوار المخصصة ديناميكياً.</li>
									</ul>
								</div>
							</div>

						</div>
					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 3: TRI-PARTITE AUTHORIZATION & CITIZENSHIP             -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'tripartite') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-danger ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-lock" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								معادلة التفويض الثلاثي وقواعد الأمان السيادي (Tri-Partite Authorization)
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							لا يعتمد WorkPress على فحص الصلاحية المجردة (<code style=${{ borderRadius: 0 }}>current_user_can</code>) بمفردها؛ بل يطبق معادلة أمنية ثلاثية الأطراف في كافة نقاط الـ REST والواجهات:
						</p>

						<div className="notification p-4 mb-4" style=${{ backgroundColor: '#0f172a', color: '#ffffff', borderRadius: 0, borderRight: '5px solid #38bdf8' }}>
							<p className="is-size-6 has-text-weight-bold mb-1" style=${{ fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' }}>
								CanPerform(User, Action, Resource) = HasGlobalCapability(User, Cap) ∧ HasProjectVisibility(User, Project) ∧ HasResourceRelationship(User, Resource)
							</p>
							<p className="is-size-7 mt-2" style=${{ color: '#cbd5e1' }}>
								لكي يُسمح لأي مستخدم بتنفيذ أي إجراء على مشروع أو مهمة أو مساهمة، يجب تحقق الشروط الثلاثة معاً دون أي استثناء.
							</p>
						</div>

						<div className="columns is-multiline">
							<div className="column is-4">
								<div className="p-3 h-100" style=${{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
									<strong className="is-block mb-1 has-text-dark is-size-6">1. الصلاحية الذرية (Global Cap)</strong>
									<p className="is-size-7 has-text-grey mb-0">هل يملك دور المستخدم الصلاحية الفنية المطلوبة في مصفوفة الصلاحيات (مثل <code style=${{ borderRadius: 0 }}>accept_workpress_contributions</code>)؟</p>
								</div>
							</div>
							<div className="column is-4">
								<div className="p-3 h-100" style=${{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
									<strong className="is-block mb-1 has-text-dark is-size-6">2. رؤية المشروع (Project Visibility)</strong>
									<p className="is-size-7 has-text-grey mb-0">هل المستخدم عضو رسمي في المشروع، أو قائده (<code style=${{ borderRadius: 0 }}>Lead</code>)، أو العميل المالك (<code style=${{ borderRadius: 0 }}>Client</code>)، أو مدير عام؟</p>
								</div>
							</div>
							<div className="column is-4">
								<div className="p-3 h-100" style=${{ border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
									<strong className="is-block mb-1 has-text-dark is-size-6">3. علاقة المورد (Resource Relation)</strong>
									<p className="is-size-7 has-text-grey mb-0">هل المستخدم هو منشئ المساهمة، أو المسند إليه المهمة، أو يملك حق الحوكمة الإشرافية لاعتماد حلول الآخرين؟</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 4: COMPLETE LIFECYCLE PIPELINE                         -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'lifecycle') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-info ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-randomize" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								دورة حياة العمل الشاملة (The Complete Lifecycle Pipeline)
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							كيف يتدفق العمل داخل WorkPress من لحظة وصول الطلب وحتى أرشفته كأصل معرفي دائم:
						</p>

						<div className="timeline-pipeline" style=${{ borderRight: '2px solid #cbd5e1', paddingRight: '1rem', marginRight: '0.5rem' }}>
							
							<!-- Step 1 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#3b82f6', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">1. الاستقبال الذكي عبر النماذج (Intake & Request Generation)</h5>
								<p className="is-size-7 has-text-grey mb-0">يقوم المستفيد بتعبئة نموذج مخصص يولد طلباً رسمياً مشفوعاً بالحقول الديناميكية والمرفقات.</p>
							</div>

							<!-- Step 2 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#6366f1', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">2. الترقية لمشروع وتعيين القائد (Project Formulation & Lead Assignment)</h5>
								<p className="is-size-7 has-text-grey mb-0">تقوم الإدارة العليا بمراجعة الطلب وترقيته إلى مشروع رسمي <code style=${{ borderRadius: 0 }}>Taxonomy</code> وتعيين قائد المشروع (<code style=${{ borderRadius: 0 }}>Project Lead</code>).</p>
							</div>

							<!-- Step 3 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#0284c7', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">3. تفكيك المشروع إلى مهام وتكليف المنفذين (Atomic Task Decomposition)</h5>
								<p className="is-size-7 has-text-grey mb-0">يقوم القائد بإنشاء مهام الكانبان، ضبط قوائم التدقيق والتقديرات الزمنية، وتخصيص المنفذين.</p>
							</div>

							<!-- Step 4 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#eab308', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">4. التنفيذ الفعلي ورفع المساهمات والأدلة (Work & Evidence Submission)</h5>
								<p className="is-size-7 has-text-grey mb-0">يعمل المنفذ على المهمة ويسجل ساعات العمل، ثم يقترح حلاً رسمياً (<code style=${{ borderRadius: 0 }}>Solution Contribution</code>) مرفقاً بالأدلة الفنية.</p>
							</div>

							<!-- Step 5 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#10b981', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">5. اعتماد الحل والإكمال المتتالي الآلي (Lead Acceptance & Cascading Completion)</h5>
								<p className="is-size-7 has-text-grey mb-0">يقوم قائد المشروع بمراجعة واعتماد الحل؛ فتتحول المهمة فوراً لحالة <code style=${{ borderRadius: 0 }}>مكتملة</code> ويُعاد احتساب مؤشرات المشروع الحية.</p>
							</div>

							<!-- Step 6 -->
							<div className="mb-4" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#059669', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">6. المعاينة التفاعلية والتوقيع الرقمي للمستفيد (Client Review & Sign-Off)</h5>
								<p className="is-size-7 has-text-grey mb-0">يطلع العميل عبر بوابته المستقلة على المخرجات النهائية، ويقوم بالتوقيع الرقمي واعتماد محضر التسليم الرسمي.</p>
							</div>

							<!-- Step 7 -->
							<div className="mb-0" style=${{ position: 'relative' }}>
								<div style=${{ position: 'absolute', right: '-1.45rem', top: '2px', width: '12px', height: '12px', backgroundColor: '#0f172a', border: '2px solid #ffffff' }}></div>
								<h5 className="title is-6 mb-1 has-text-weight-bold has-text-dark">7. الفهرسة المعرفية والأرشفة السيادية (Knowledge Base Indexing & Permanent Archiving)</h5>
								<p className="is-size-7 has-text-grey mb-0">تودع كافة الحلول المعتمدة تلقائياً في بنك المعرفة الدائم للفريق، ويختتم المشروع مع إمكانية تصدير التقرير الفني المكتمل.</p>
							</div>

						</div>
					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 5: 17 ARCHITECTURAL CORE SERVICES                      -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'services') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-link ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-rest-api" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								طبقة الخدمات الهندسية الـ 17 المعتمدة (Services-Only Layer)
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							تعتمد بنية WorkPress الخلفية على نمط الخدمات الحصري (<code style=${{ borderRadius: 0 }}>Services Pattern</code>)، حيث تتولى 17 خدمة معيارية تنفيذ كافة قواعد العمل دون أي منطق مبعثر:
						</p>

						<div className="columns is-multiline">
							${[
								{ name: 'WorkPress_Project_Service', desc: 'إدارة دورة حياة المشاريع، احتساب التقدم، وتعيين القادة والميزانيات.' },
								{ name: 'WorkPress_Task_Service', desc: 'إدارة بطاقات المهام، الانتقال بين حالات الكانبان، وتحديث قوائم التدقيق.' },
								{ name: 'WorkPress_Contribution_Service', desc: 'إدارة سجل المساهمات، طلبات الحذف المعلقة، واعتماد الحلول الرسمية.' },
								{ name: 'WorkPress_Knowledge_Service', desc: 'استخلاص الحلول المعتمدة وبناء الفهرس المعرفي وتصدير وثائق Markdown.' },
								{ name: 'WorkPress_Portal_Service', desc: 'إدارة تجربة المستفيد المعزولة، التفاعل الثنائي، والتوقيع الرقمي للمخرجات.' },
								{ name: 'WorkPress_Webhook_Service', desc: 'إرسال خطافات الويب المشفرة بـ HMAC-SHA256 وقوالب Discord و Slack و Teams.' },
								{ name: 'WorkPress_Hibernation_Service', desc: 'التجميد والإذابة الآلية لمشاريع العملاء وفق الحالة السيادية لحساباتهم.' },
								{ name: 'WorkPress_Membership_Service', desc: 'ضبط العضوية في المشاريع، التحقق من التكليف، ومطابقة بريد العملاء.' },
								{ name: 'WorkPress_Intake_Service', desc: 'بناء ومعالجة نماذج استقبال الطلبات الديناميكية وتحويلها لطلبات مشاريع.' },
								{ name: 'WorkPress_Activity_Service', desc: 'تسجيل الأثر التاريخي وكافة عمليات النظام في سجل أحداث غير قابل للتلاعب.' },
								{ name: 'WorkPress_Metrics_Service', desc: 'تجميع الإحصائيات التنفيذية ونسب الإنجاز العامة لغرف القيادة.' },
								{ name: 'WorkPress_Capabilities_Registry', desc: 'تسجيل وإدارة الـ 8 حزم صلاحيات ذرية والتحقق البرمجي الصارم.' },
								{ name: 'WorkPress_Roles_Service', desc: 'تخصيص الأدوار، استنساخ الرتب، وإدارة المسميات والأسماء المستعارة.' },
								{ name: 'WorkPress_Settings_Service', desc: 'إدارة وحفظ إعدادات النظام، التوقيت، وحزم النغمات والأصوات التفاعلية.' },
								{ name: 'WorkPress_Notification_Service', desc: 'إرسال التنبيهات الداخلية وإشعارات البريد الإلكتروني للمكلفين بالمهام.' },
								{ name: 'WorkPress_Time_Service', desc: 'تتبع الساعات المقدرة والفعلية، تسجيل الجلسات، واحتساب معدلات الإنتاجية.' },
								{ name: 'WorkPress_Export_Service', desc: 'تصدير النسخ الاحتياطية الشاملة بصيغة JSON، وتوليد تقارير الإنجاز المؤسسية.' },
							].map((srv, idx) => html`
								<div key=${idx} className="column is-4">
									<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
										<code className="is-size-7 is-block mb-1 has-text-weight-bold has-text-dark" style=${{ borderRadius: 0 }}>${srv.name}</code>
										<p className="is-size-7 has-text-grey mb-0">${srv.desc}</p>
									</div>
								</div>
							`)}
						</div>
					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 6: NATIVE ZERO-TABLE DATA ARCHITECTURE                 -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'database') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-2">
							<span className="icon has-text-success ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-database" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								البنية التحتية الأصلية للبيانات (Zero-Table WordPress Mapping)
							</h3>
						</div>
						<p className="is-size-7 has-text-grey mb-4">
							لا يقوم WorkPress بإنشاء أي جداول SQL هجينة أو ملوثة لقاعدة بياناتك؛ بل يستغل القوة الكاملة لنموذج ووردبريس الأصلي لضمان التوافق والأمان:
						</p>

						<div className="table-container">
							<table className="table is-fullwidth is-striped is-hoverable" style=${{ border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
								<thead>
									<tr style=${{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
										<th style=${{ width: '22%' }}>عنصر المنظومة</th>
										<th style=${{ width: '25%' }}>الكائن الأصلي في ووردبريس</th>
										<th style=${{ width: '25%' }}>جدول البيانات الأساسي</th>
										<th style=${{ width: '28%' }}>البيانات الوصفية (Metadata)</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td><strong>المشروع (Project)</strong></td>
										<td>تصنيف مخصص <code style=${{ borderRadius: 0 }}>workpress_project</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_terms</code> & <code style=${{ borderRadius: 0 }}>wp_term_taxonomy</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_termmeta</code> (Lead, Status, Client, Prefix)</td>
									</tr>
									<tr>
										<td><strong>المهمة (Task)</strong></td>
										<td>منشور مخصص <code style=${{ borderRadius: 0 }}>work_item</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_posts</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_postmeta</code> (Priority, Estimate, Assignees)</td>
									</tr>
									<tr>
										<td><strong>المساهمة (Contribution)</strong></td>
										<td>تعليق متقدم <code style=${{ borderRadius: 0 }}>wp_contribution</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_comments</code></td>
										<td><code style=${{ borderRadius: 0 }}>wp_commentmeta</code> (Type, Is_Solution, Trash_Reason)</td>
									</tr>
									<tr>
										<td><strong>المعرفة (Knowledge)</strong></td>
										<td>نموذج قراءة مستنتج للحلول المعتمدة</td>
										<td><code style=${{ borderRadius: 0 }}>wp_comments</code> (<code style=${{ borderRadius: 0 }}>is_solution = 1</code>)</td>
										<td>فهرسة مباشرة وفورية بدون تخزين مكرر</td>
									</tr>
									<tr>
										<td><strong>سجل الأنشطة والرقابة</strong></td>
										<td>تعليقات تدقيق نظامية مشفرة</td>
										<td><code style=${{ borderRadius: 0 }}>wp_comments</code> (<code style=${{ borderRadius: 0 }}>comment_type = wp_audit</code>)</td>
										<td>أثر تاريخي دائم غير قابل للمحو</td>
									</tr>
									<tr>
										<td><strong>خطافات الويب (Webhooks)</strong></td>
										<td>خيار نظامي مشفر</td>
										<td><code style=${{ borderRadius: 0 }}>wp_options</code></td>
										<td>تشفير مفاتيح HMAC-SHA256 السرية</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			`}

			<!-- ============================================================== -->
			<!-- SECTION 7: PRODUCTIVITY ENGINES SUITE                          -->
			<!-- ============================================================== -->
			${(activeSection === 'all' || activeSection === 'engines') && html`
				<div className="mb-6">
					<div className="wp-card p-5 mb-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center mb-3">
							<span className="icon has-text-info ml-2" style=${{ marginLeft: '8px' }}>
								<i className="dashicons dashicons-performance" style=${{ fontSize: '24px' }}></i>
							</span>
							<h3 className="title is-5 mb-0 has-text-weight-bold has-text-dark">
								منظومة الأدوات والإنتاجية فائقة الكثافة المدمجة
							</h3>
						</div>

						<div className="columns is-multiline">
							
							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-columns has-text-info"></i>
										<span>لوحة الكانبان فائقة الكثافة</span>
									</strong>
									<span className="is-size-7 has-text-grey">بطاقات 220px بغلاف بارز، سطر المشروع، شريط أيقونات مدمج، وتحديث سحب وإفلات فوري.</span>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-calendar-alt has-text-success"></i>
										<span>مخطط جانت والجدولة الزمنية</span>
									</strong>
									<span className="is-size-7 has-text-grey">4 مقاييس (24س، أيام، أسابيع، شهور)، مؤشر الوقت الحي، أزرار الطي والتوسيع لشجرة المشاريع.</span>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-book has-text-warning"></i>
										<span>بنك المعرفة والتوثيق الحي</span>
									</strong>
									<span className="is-size-7 has-text-grey">استخلاص تلقائي للحلول المعتمدة، تصدير كتيب المعرفة بصيغة Markdown، وتقارير تنفيذية A4.</span>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-snow has-text-info"></i>
										<span>ثلاجة المشاريع (Hibernation)</span>
									</strong>
									<span className="is-size-7 has-text-grey">تجميد وإذابة آلية للمشاريع عند تغيير أو خفض رتبة العملاء لحماية أمان بيانات المنشأة.</span>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-bell has-text-danger"></i>
										<span>محرك الإشعارات والتوست الغامر</span>
									</strong>
									<span className="is-size-7 has-text-grey">إشعارات ملونة شاملة للقرارات والعمليات، مع دعم التراجع الفوري وربط الأحداث الصوتية.</span>
								</div>
							</div>

							<div className="column is-4">
								<div className="p-3 h-100" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<strong className="is-size-7 is-block mb-1 has-text-dark is-flex is-align-items-center" style=${{ gap: '5px' }}>
										<i className="dashicons dashicons-clock has-text-primary"></i>
										<span>تقويم DatePicker السريع وتتبع الوقت</span>
									</strong>
									<span className="is-size-7 has-text-grey">منتقي تواريخ 24س مخصص مع شرائح الإضافة السريعة لساعات العمل وتتبع الميزانيات.</span>
								</div>
							</div>

						</div>
					</div>
				</div>
			`}

			<!-- Footer Meta -->
			<div className="p-3 is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap" style=${{ 
				backgroundColor: '#f8fafc', 
				border: '1px solid #e2e8f0', 
				borderRadius: 0,
				fontSize: '0.85rem',
				color: '#475569'
			}}>
				<div className="is-flex is-align-items-center">
					<span className="icon is-small ml-1" style=${{ marginLeft: '6px' }}><i className="dashicons dashicons-yes-alt has-text-success"></i></span>
					<span>منظومة إدارة وتوثيق العمل والذاكرة المؤسسية الأصلية في ووردبريس</span>
				</div>
				<div>
					<strong className="has-text-dark">WorkPress Engine v2.2.0 Stable — Production Certified</strong>
				</div>
			</div>

		</div>
	`;
}
