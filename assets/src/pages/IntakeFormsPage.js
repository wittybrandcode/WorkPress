import { html, useState, useEffect, createPortal } from '../utils/html.js';
import { settingsApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

/**
 * Registry of Abstract Generic Field Primitives.
 * Designed for pure domain-agnostic flexibility & future extensibility.
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

/**
 * IntakeFormsToolbar is defined inline (not as sub-component) to match
 * the exact same createPortal pattern used by DashboardPage and FilterBar.
 */

export default function IntakeFormsPage() {
	const defaultUniversalForm = {
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

	const wpSettings = window.workpressSettings || {};
	const [forms, setForms] = useState(
		Array.isArray(wpSettings.intake_forms_schema) && wpSettings.intake_forms_schema.length > 0
			? wpSettings.intake_forms_schema
			: [defaultUniversalForm]
	);

	const [activeIdx, setActiveIdx] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [newSuggestionInput, setNewSuggestionInput] = useState('');
	const [newOptionInputs, setNewOptionInputs] = useState({});

	const currentForm = forms[activeIdx] || forms[0] || defaultUniversalForm;

	// Form template management
	const handleAddFormTemplate = () => {
		const newForm = {
			...defaultUniversalForm,
			id: 'form_' + Date.now(),
			name: `نموذج طلب جديد (${forms.length + 1})`,
			specs: [
				{
					id: 'spec_' + Date.now(),
					type: 'select_custom',
					label: 'نوع الخدمة أو الطلب:',
					options: ['الخيار الأول القياسي', 'الخيار الثاني المتقدم'],
					required: true
				}
			]
		};
		const updated = [...forms, newForm];
		setForms(updated);
		setActiveIdx(updated.length - 1);
		sound.play('button');
		toast('تم إنشاء قالب نموذج جديد.', 'info');
	};

	const handleDeleteFormTemplate = (idxToDelete) => {
		if (forms.length <= 1) {
			toast('يجب الإبقاء على نموذج طلب واحد على الأقل.', 'warning');
			sound.play('caution');
			return;
		}
		const updated = forms.filter((_, i) => i !== idxToDelete);
		setForms(updated);
		setActiveIdx(Math.max(0, activeIdx - 1));
		sound.play('button');
		toast('تم حذف النموذج.', 'info');
	};

	const updateCurrentForm = (key, val) => {
		const updated = [...forms];
		updated[activeIdx] = {
			...updated[activeIdx],
			[key]: val
		};
		setForms(updated);
	};

	// Add element into canvas
	const handleAddPrimitive = (primitiveType) => {
		const prim = FIELD_PRIMITIVES[primitiveType];
		if (!prim) return;

		const specs = Array.isArray(currentForm.specs) ? [...currentForm.specs] : [];
		const newSpec = {
			id: 'spec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
			type: primitiveType,
			label: prim.defaultLabel,
			placeholder: prim.defaultPlaceholder || '',
			options: prim.defaultOptions ? [...prim.defaultOptions] : [],
			required: false
		};

		specs.push(newSpec);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast(`تمت إضافة خانة: ${prim.label.split('(')[0]}`, 'success');
	};

	// Move element up/down on canvas
	const handleMoveSpec = (sIdx, direction) => {
		const specs = [...currentForm.specs];
		const targetIdx = sIdx + direction;
		if (targetIdx < 0 || targetIdx >= specs.length) return;

		const temp = specs[sIdx];
		specs[sIdx] = specs[targetIdx];
		specs[targetIdx] = temp;

		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	const handleDeleteSpec = (sIdx) => {
		const specs = currentForm.specs.filter((_, i) => i !== sIdx);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast('تمت إزالة الخانة من النموذج.', 'info');
	};

	const handleUpdateSpec = (sIdx, key, val) => {
		const specs = [...currentForm.specs];
		specs[sIdx] = {
			...specs[sIdx],
			[key]: val
		};
		updateCurrentForm('specs', specs);
	};

	// Option Tag Handlers
	const handleAddOptionToSpec = (sIdx) => {
		const text = (newOptionInputs[sIdx] || '').trim();
		if (!text) return;
		const specs = [...currentForm.specs];
		const options = Array.isArray(specs[sIdx].options) ? [...specs[sIdx].options] : [];
		options.push(text);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		setNewOptionInputs({ ...newOptionInputs, [sIdx]: '' });
		sound.play('button');
	};

	const handleRemoveOptionFromSpec = (sIdx, optIdx) => {
		const specs = [...currentForm.specs];
		const options = specs[sIdx].options.filter((_, i) => i !== optIdx);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	// Suggestions
	const handleAddSuggestion = () => {
		if (!newSuggestionInput.trim()) return;
		const suggestions = Array.isArray(currentForm.title_suggestions) ? [...currentForm.title_suggestions] : [];
		suggestions.push(newSuggestionInput.trim());
		updateCurrentForm('title_suggestions', suggestions);
		setNewSuggestionInput('');
		sound.play('button');
	};

	const handleRemoveSuggestion = (sIdx) => {
		const suggestions = currentForm.title_suggestions.filter((_, i) => i !== sIdx);
		updateCurrentForm('title_suggestions', suggestions);
		sound.play('button');
	};

	// Save All Forms
	const handleSaveAll = () => {
		setIsSaving(true);
		settingsApi.update({
			intake_forms_schema: forms
		}).then(() => {
			setIsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.intake_forms_schema = forms;
			}
			toast('تم حفظ واعتماد كافة نماذج استقبال الطلبات بنجاح', 'success');
			sound.play('celebration');
		}).catch((err) => {
			setIsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ النماذج.', 'danger');
			sound.play('caution');
		});
	};

	// Portal root for sticky toolbar — exact same pattern as DashboardPage
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const topToolbarContent = html`
		<div className="wp-filter-toolbar">
			<div className="wp-filter-group">
				<span className="wp-filter-label">
					<i className="dashicons dashicons-forms"></i>
					النماذج المتاحة:
				</span>

				<div className="buttons are-small mb-0" style=${{ gap: '6px', flexWrap: 'wrap' }}>
					${forms.map((f, i) => html`
						<button
							key=${f.id || i}
							type="button"
							className=${`button is-small wp-sharp-button ${activeIdx === i ? 'is-primary' : 'is-light'}`}
							onClick=${() => {
								setActiveIdx(i);
								sound.play('button');
							}}
							style=${{ fontWeight: '700' }}
						>
							<span>${f.name || `نموذج ${i + 1}`}</span>
						</button>
					`)}

					<button
						type="button"
						className="button is-small is-success is-outlined wp-sharp-button"
						onClick=${handleAddFormTemplate}
						title="إضافة قالب نموذج طلب جديد"
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>نموذج جديد</span>
					</button>
				</div>
			</div>

			<div className="wp-filter-actions">
				<button
					type="button"
					className="button is-small is-info is-outlined wp-sharp-button"
					onClick=${() => setShowPreviewModal(true)}
				>
					<span className="icon"><i className="dashicons dashicons-visibility"></i></span>
					<span>معاينة واجهة العميل</span>
				</button>

				<button
					type="button"
					className=${`button is-small is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSaveAll}
					disabled=${isSaving}
					style=${{ fontWeight: '800', minWidth: '140px' }}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ واعتماد النماذج</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<div className="workpress-form-builder-page" style=${{ width: '100%' }}>
			
			${ portalRoot ? createPortal( topToolbarContent, portalRoot ) : topToolbarContent }

			<!-- Main Builder Workspace: Full Available Width 2-Column Responsive Layout -->
			<div className="columns is-variable is-4 mt-2 mb-6" style=${{ width: '100%' }}>
				
				<!-- Column 1: Elements Palette (لوحة الخانات العامة) -->
				<div className="column is-3">
					<div className="box wp-card p-4" style=${{ position: 'sticky', top: '125px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
						<div className="mb-3 pb-2" style=${{ borderBottom: '1px solid #e2e8f0' }}>
							<h3 className="title is-6 mb-1 has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<span className="icon is-small"><i className="dashicons dashicons-layout"></i></span>
								<span>لوحة الخانات واللبنات العامة</span>
							</h3>
							<p className="is-size-7 has-text-grey">انقر لإضافة أي خانة مباشرة إلى لوحة البناء:</p>
						</div>

						<div style=${{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							${Object.entries(FIELD_PRIMITIVES).map(([key, prim]) => {
								if (key === 'smart_title' || key === 'scope_description') return null; // Built-in Core
								return html`
									<button
										key=${key}
										type="button"
										className="button is-small wp-sharp-button is-fullwidth is-justify-content-space-between p-3"
										style=${{ 
											backgroundColor: '#ffffff', 
											border: '1px solid #e2e8f0', 
											height: 'auto',
											textAlign: 'right'
										}}
										onClick=${() => handleAddPrimitive(key)}
									>
										<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
											<span className="icon is-small has-text-primary"><i className=${`dashicons ${prim.icon}`}></i></span>
											<span className="has-text-weight-bold is-size-7">${prim.label.split('(')[0]}</span>
										</div>
										<span className="tag is-light is-size-7" style=${{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
											+ إضافة
										</span>
									</button>
								`;
							})}
						</div>

						<div className="notification is-light p-3 mt-4" style=${{ border: '1px dashed #cbd5e1', backgroundColor: '#ffffff', borderRadius: 0 }}>
							<p className="is-size-7 has-text-grey-dark">
								<strong>فلسفة العموم والتجريد:</strong> كافة الخانات عامة بنسبة 100%، وتملك الحرية الكاملة لتسمية كل خانة بحسب تخصصك.
							</p>
						</div>
					</div>
				</div>

				<!-- Column 2: The Pure White Visual Canvas taking FULL AVAILABLE WIDTH -->
				<div className="column is-9">
					<div 
						className="box wp-card p-5" 
						style=${{ 
							backgroundColor: '#ffffff', 
							border: '1px solid #cbd5e1', 
							boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
							minHeight: '650px',
							width: '100%',
							borderRadius: '4px'
						}}
					>
						<!-- Form Top Meta in Canvas -->
						<div className="mb-5 pb-4" style=${{ borderBottom: '2px solid #f1f5f9' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap mb-2" style=${{ gap: '8px' }}>
								<div className="is-flex is-align-items-center" style=${{ gap: '8px', flexGrow: 1 }}>
									<span className="tag is-primary is-light has-text-weight-bold">اسم النموذج في البوابة:</span>
									<input
										type="text"
										className="input is-small"
										value=${currentForm.name || ''}
										onInput=${(e) => updateCurrentForm('name', e.target.value)}
										style=${{ fontWeight: '800', fontSize: '1rem', border: '1px solid #cbd5e1', flexGrow: 1, maxWidth: '500px' }}
									/>
								</div>
								
								${forms.length > 1 ? html`
									<button
										className="button is-small is-danger is-outlined wp-sharp-button"
										onClick=${() => handleDeleteFormTemplate(activeIdx)}
									>
										<span className="icon"><i className="dashicons dashicons-trash"></i></span>
										<span>حذف النموذج</span>
									</button>
								` : null}
							</div>
							<p className="is-size-7 has-text-grey">هكذا تظهر خانات واستمارة الطلب للعميل داخل البوابة، يمكنك تعديل النصوص والمسميات مباشرة:</p>
						</div>

						<!-- Core Field 1: Smart Title -->
						<div className="canvas-field-card p-4 mb-4" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
								<span className="tag is-info is-light has-text-weight-bold">
									<i className="dashicons dashicons-tag ml-1"></i> 1. حقل العنوان والمعرف الذكي (Smart Title)
								</span>
								<span className="is-size-7 has-text-grey">ثابت وأساسي</span>
							</div>

							<div className="columns is-variable is-2 mb-2">
								<div className="column is-6">
									<label className="label is-size-7">مسمى الحقل للعميل:</label>
									<input
										type="text"
										className="input is-small"
										value=${currentForm.title_label || ''}
										onInput=${(e) => updateCurrentForm('title_label', e.target.value)}
										style=${{ border: '1px solid #cbd5e1', fontWeight: '700' }}
									/>
								</div>
								<div className="column is-6">
									<label className="label is-size-7">نص التلميح (Placeholder):</label>
									<input
										type="text"
										className="input is-small"
										value=${currentForm.title_placeholder || ''}
										onInput=${(e) => updateCurrentForm('title_placeholder', e.target.value)}
										style=${{ border: '1px solid #cbd5e1' }}
									/>
								</div>
							</div>

							<!-- Title Suggestions -->
							<div className="p-3" style=${{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
								<label className="label is-size-7 mb-1">قائمة الاقتراحات السريعة (تظهر كخيارات منسدلة سريعة + خيار كتابة حرة دائماً):</label>
								<div className="tags mb-2">
									${(currentForm.title_suggestions || []).map((sug, sIdx) => html`
										<span key=${sIdx} className="tag is-info is-light" style=${{ fontWeight: '600' }}>
											<span>${sug}</span>
											<button className="delete is-small" onClick=${() => handleRemoveSuggestion(sIdx)}></button>
										</span>
									`)}
								</div>
								<div className="is-flex" style=${{ gap: '6px', maxWidth: '500px' }}>
									<input
										type="text"
										className="input is-small"
										value=${newSuggestionInput}
										onInput=${(e) => setNewSuggestionInput(e.target.value)}
										onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestion(); } }}
										placeholder="أدخل اقتراحاً واضغط إضافة..."
									/>
									<button className="button is-small is-info is-light wp-sharp-button" onClick=${handleAddSuggestion}>
										+ إضافة
									</button>
								</div>
							</div>
						</div>

						<!-- Core Field 2: Scope Description -->
						<div className="canvas-field-card p-4 mb-4" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
								<span className="tag is-info is-light has-text-weight-bold">
									<i className="dashicons dashicons-editor-paragraph ml-1"></i> 2. حقل الشرح وتفاصيل الطلب (Scope Description)
								</span>
								<span className="is-size-7 has-text-grey">ثابت وأساسي</span>
							</div>

							<div className="columns is-variable is-2">
								<div className="column is-6">
									<label className="label is-size-7">مسمى الحقل للعميل:</label>
									<input
										type="text"
										className="input is-small"
										value=${currentForm.desc_label || ''}
										onInput=${(e) => updateCurrentForm('desc_label', e.target.value)}
										style=${{ border: '1px solid #cbd5e1', fontWeight: '700' }}
									/>
								</div>
								<div className="column is-6">
									<label className="label is-size-7">نص التوجيه الداخلي (Placeholder):</label>
									<input
										type="text"
										className="input is-small"
										value=${currentForm.desc_placeholder || ''}
										onInput=${(e) => updateCurrentForm('desc_placeholder', e.target.value)}
										style=${{ border: '1px solid #cbd5e1' }}
									/>
								</div>
							</div>
						</div>

						<!-- Custom Specifications Stack -->
						<div className="mb-4">
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
								<span className="has-text-weight-bold is-size-7 has-text-primary">3. مصفوفة المواصفات والمدخلات التخصصية:</span>
								<span className="is-size-7 has-text-grey">${(currentForm.specs || []).length} خانات مضافة</span>
							</div>

							${(!currentForm.specs || currentForm.specs.length === 0) ? html`
								<div className="p-5 has-text-centered" style=${{ border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
									<p className="has-text-grey is-size-7 mb-2">لا توجد خانات مواصفات مضافة حالياً.</p>
									<p className="is-size-7 has-text-grey-light">اختر أي خانة من القائمة اليمنى للبدء بإضافتها هنا في النموذج.</p>
								</div>
							` : html`
								<div style=${{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
									${currentForm.specs.map((spec, sIdx) => {
										const prim = FIELD_PRIMITIVES[spec.type] || FIELD_PRIMITIVES.short_text;

										return html`
											<div key=${spec.id || sIdx} className="canvas-spec-card p-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative', borderRadius: '4px' }}>
												<!-- Spec Card Header / Actions -->
												<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #f1f5f9' }}>
													<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
														<span className="tag is-dark is-small" style=${{ borderRadius: 0, fontWeight: '700' }}>#${sIdx + 1}</span>
														<span className="tag is-light is-small" style=${{ fontWeight: '700' }}>
															<i className=${`dashicons ${prim.icon} ml-1`}></i>
															${prim.label.split('(')[0]}
														</span>
													</div>

													<div className="buttons are-small mb-0" style=${{ gap: '4px' }}>
														<!-- Move Up -->
														<button 
															className="button is-small is-light" 
															disabled=${sIdx === 0} 
															onClick=${() => handleMoveSpec(sIdx, -1)}
															title="تحريك لأعلى"
														>
															▲
														</button>
														<!-- Move Down -->
														<button 
															className="button is-small is-light" 
															disabled=${sIdx === currentForm.specs.length - 1} 
															onClick=${() => handleMoveSpec(sIdx, 1)}
															title="تحريك لأسفل"
														>
															▼
														</button>
														<!-- Delete -->
														<button 
															className="button is-small is-danger is-light" 
															onClick=${() => handleDeleteSpec(sIdx)}
															title="حذف هذه الخانة"
														>
															<i className="dashicons dashicons-trash"></i>
														</button>
													</div>
												</div>

												<!-- Inline Editable Fields -->
												<div className="columns is-variable is-2 is-vcentered mb-2">
													<div className="column is-6">
														<label className="label is-size-7">مسمى الخانة / السؤال للعميل:</label>
														<input
															type="text"
															className="input is-small"
															value=${spec.label || ''}
															onInput=${(e) => handleUpdateSpec(sIdx, 'label', e.target.value)}
															style=${{ fontWeight: '700', border: '1px solid #cbd5e1' }}
															placeholder="اكتب اسم الخانة..."
														/>
													</div>

													<div className="column is-4">
														<label className="label is-size-7">نوع الخانة:</label>
														<div className="select is-small is-fullwidth">
															<select
																value=${spec.type || 'short_text'}
																onChange=${(e) => handleUpdateSpec(sIdx, 'type', e.target.value)}
															>
																${Object.entries(FIELD_PRIMITIVES).map(([pk, pv]) => {
																	if (pk === 'smart_title' || pk === 'scope_description') return null;
																	return html`<option key=${pk} value=${pk}>${pv.label}</option>`;
																})}
															</select>
														</div>
													</div>

													<div className="column is-2">
														<label className="checkbox is-size-7 mt-4 has-text-weight-bold">
															<input
																type="checkbox"
																checked=${!!spec.required}
																onChange=${(e) => handleUpdateSpec(sIdx, 'required', e.target.checked)}
																style=${{ marginLeft: '4px' }}
															/>
															إجباري
														</label>
													</div>
												</div>

												<!-- Options Manager for select and pills -->
												${(spec.type === 'select_custom' || spec.type === 'pills') ? html`
													<div className="p-3 mt-2" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
														<label className="label is-size-7 mb-1">الخيارات المتاحة للاختيار:</label>
														<div className="tags mb-2">
															${(spec.options || []).map((opt, optIdx) => html`
																<span key=${optIdx} className="tag is-primary is-light">
																	<span>${opt}</span>
																	<button className="delete is-small" onClick=${() => handleRemoveOptionFromSpec(sIdx, optIdx)}></button>
																</span>
															`)}
														</div>
														<div className="is-flex" style=${{ gap: '6px', maxWidth: '450px' }}>
															<input
																type="text"
																className="input is-small"
																value=${newOptionInputs[sIdx] || ''}
																onInput=${(e) => setNewOptionInputs({ ...newOptionInputs, [sIdx]: e.target.value })}
																onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOptionToSpec(sIdx); } }}
																placeholder="اكتب خياراً واضغط إضافة..."
															/>
															<button className="button is-small is-primary is-light wp-sharp-button" onClick=${() => handleAddOptionToSpec(sIdx)}>
																+ إضافة خيار
															</button>
														</div>
													</div>
												` : null}
											</div>
										`;
									})}
								</div>
							`}
						</div>

						<!-- Canvas Bottom Actions -->
						<div className="is-flex is-justify-content-space-between is-align-items-center pt-4" style=${{ borderTop: '2px solid #f1f5f9' }}>
							<p className="is-size-7 has-text-grey">
								<i className="dashicons dashicons-yes-alt ml-1 has-text-success"></i>
								يتم حفظ وتوليد الخانات تلقائياً في بوابة العميل المستقلة فور نقر زر الحفظ.
							</p>
							<button 
								className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
								onClick=${handleSaveAll}
								disabled=${isSaving}
								style=${{ fontWeight: '800' }}
							>
								<span className="icon"><i className="dashicons dashicons-saved"></i></span>
								<span>حفظ واعتماد النماذج</span>
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- 3. Live Client Portal Preview Modal -->
			${showPreviewModal && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setShowPreviewModal(false)}></div>
					<div className="modal-card" style=${{ maxWidth: '780px', width: '90%' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#0f172a', color: '#ffffff' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								معاينة فورية: كيف يظهر هذا النموذج للزبون في بوابة العميل (/portal/#/new-request)
							</p>
							<button className="delete" aria-label="close" onClick=${() => setShowPreviewModal(false)}></button>
						</header>
						<section className="modal-card-body" style=${{ backgroundColor: '#0a0e17', color: '#f8fafc', padding: '2rem' }}>
							<div style=${{ border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', backgroundColor: 'rgba(15,23,42,0.8)' }}>
								<h3 style=${{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.4rem' }}>
									${currentForm.name || 'طلب مشروع جديد'}
								</h3>
								<p style=${{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
									حدد متطلباتك وسيصل طلبك مباشرة للإدارة العامة كمشروع رسمي للمراجعة والتسعير والاعتماد.
								</p>

								<!-- Smart Title Preview -->
								<div className="mb-4">
									<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
										${currentForm.title_label}
									</label>
									<select style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
										${(currentForm.title_suggestions || []).map((s, i) => html`<option key=${i}>${s}</option>`)}
										<option>أخرى: كتابة عنوان مخصص...</option>
									</select>
								</div>

								<!-- Scope Desc Preview -->
								<div className="mb-4">
									<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
										${currentForm.desc_label}
									</label>
									<textarea rows="3" style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} placeholder="${currentForm.desc_placeholder}"></textarea>
								</div>

								<!-- Specs Preview -->
								${(currentForm.specs || []).map((spec, si) => html`
									<div key=${si} className="mb-3">
										<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
											${spec.label} ${spec.required ? '*' : ''}
										</label>
										${spec.type === 'pills' ? html`
											<div style=${{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
												${(spec.options || []).map((opt, oi) => html`
													<span key=${oi} style=${{ padding: '0.3rem 0.75rem', backgroundColor: oi === 0 ? '#6366f1' : '#1e293b', color: '#fff', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600' }}>
														${opt}
													</span>
												`)}
											</div>
										` : (spec.type === 'select_custom' ? html`
											<select style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }}>
												${(spec.options || []).map((opt, oi) => html`<option key=${oi}>${opt}</option>`)}
											</select>
										` : html`
											<input type="text" placeholder="${spec.placeholder || ''}" style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px' }} />
										`)}
									</div>
								`)}

								<button type="button" style=${{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer' }}>
									إرسال طلب المشروع واعتماد البيانات
								</button>
							</div>
						</section>
						<footer className="modal-card-foot is-justify-content-flex-end">
							<button className="button is-primary wp-sharp-button" onClick=${() => setShowPreviewModal(false)}>إغلاق المعاينة</button>
						</footer>
					</div>
				</div>
			`}
		</div>
	`;
}
