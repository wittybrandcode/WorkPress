import { html, useState } from '../utils/html.js';
import { settingsApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function IntakeFormsBuilderTab({ initialForms, onSaved }) {
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

	const [forms, setForms] = useState(
		Array.isArray(initialForms) && initialForms.length > 0 ? initialForms : [defaultUniversalForm]
	);
	const [activeIdx, setActiveIdx] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [newSuggestionText, setNewSuggestionText] = useState('');
	const [newOptionTexts, setNewOptionTexts] = useState({});

	const currentForm = forms[activeIdx] || forms[0] || defaultUniversalForm;

	const handleAddForm = () => {
		const newForm = {
			...defaultUniversalForm,
			id: 'form_' + Date.now(),
			name: `نموذج طلب جديد (${forms.length + 1})`,
			specs: [
				{
					id: 'spec_' + Date.now(),
					type: 'select_custom',
					label: 'نوع الخدمة:',
					options: ['الخيار الأول', 'الخيار الثاني'],
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

	const handleDeleteForm = (idxToDelete) => {
		if (forms.length <= 1) {
			toast('يجب الإبقاء على نموذج طلب واحد على الأقل.', 'warning');
			sound.play('caution');
			return;
		}
		const updated = forms.filter((_, i) => i !== idxToDelete);
		setForms(updated);
		setActiveIdx(Math.max(0, activeIdx - 1));
		sound.play('button');
		toast('تم حذف قالب النموذج.', 'info');
	};

	const updateCurrentForm = (key, val) => {
		const updated = [...forms];
		updated[activeIdx] = {
			...updated[activeIdx],
			[key]: val
		};
		setForms(updated);
	};

	// Suggestions
	const handleAddSuggestion = () => {
		if (!newSuggestionText.trim()) return;
		const suggestions = Array.isArray(currentForm.title_suggestions) ? [...currentForm.title_suggestions] : [];
		suggestions.push(newSuggestionText.trim());
		updateCurrentForm('title_suggestions', suggestions);
		setNewSuggestionText('');
		sound.play('button');
	};

	const handleRemoveSuggestion = (sIdx) => {
		const suggestions = currentForm.title_suggestions.filter((_, i) => i !== sIdx);
		updateCurrentForm('title_suggestions', suggestions);
		sound.play('button');
	};

	// Specs management
	const handleAddSpec = () => {
		const specs = Array.isArray(currentForm.specs) ? [...currentForm.specs] : [];
		specs.push({
			id: 'spec_' + Date.now(),
			type: 'short_text',
			label: 'مواصفة مخصصة جديدة',
			placeholder: 'اكتب القيمة المطلوبة...',
			options: [],
			required: false
		});
		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	const handleUpdateSpec = (sIdx, key, val) => {
		const specs = [...currentForm.specs];
		specs[sIdx] = {
			...specs[sIdx],
			[key]: val
		};
		updateCurrentForm('specs', specs);
	};

	const handleDeleteSpec = (sIdx) => {
		const specs = currentForm.specs.filter((_, i) => i !== sIdx);
		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	const handleAddOptionToSpec = (sIdx) => {
		const text = (newOptionTexts[sIdx] || '').trim();
		if (!text) return;
		const specs = [...currentForm.specs];
		const options = Array.isArray(specs[sIdx].options) ? [...specs[sIdx].options] : [];
		options.push(text);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		setNewOptionTexts({ ...newOptionTexts, [sIdx]: '' });
		sound.play('button');
	};

	const handleRemoveOptionFromSpec = (sIdx, optIdx) => {
		const specs = [...currentForm.specs];
		const options = specs[sIdx].options.filter((_, i) => i !== optIdx);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	// Save
	const handleSave = () => {
		setIsSaving(true);
		settingsApi.update({
			intake_forms_schema: forms
		}).then(() => {
			setIsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.intake_forms_schema = forms;
			}
			if (onSaved) onSaved(forms);
			toast('تم حفظ نماذج ومخططات استقبال الطلبات بنجاح', 'success');
			sound.play('celebration');
		}).catch((err) => {
			setIsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ النماذج.', 'danger');
			sound.play('caution');
		});
	};

	return html`
		<div className="wp-card p-5 mb-5" style=${{ border: '1px solid #cbd5e1' }}>
			<!-- Header -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
				<div>
					<h3 className="title is-5 mb-1 has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '8px' }}>
						<span className="icon is-small"><i className="dashicons dashicons-forms"></i></span>
						<span>منشئ نماذج استقبال الطلبات والمشاريع (Universal Request Forms Builder)</span>
					</h3>
					<p className="has-text-grey is-size-7">
						حدد وصمم نماذج الطلبات التي تظهر للعملاء في البوابة المستقلة؛ يمكنك تخصيص مسميات حقل العنوان والوصف وإضافة حقول مواصفات تخصصية تناسب أي نشاط تجاري دون قيود.
					</p>
				</div>
				<button 
					className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSave}
					disabled=${isSaving}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ واعتماد النماذج</span>
				</button>
			</div>

			<!-- Form Tabs Switcher -->
			<div className="is-flex is-align-items-center mb-4" style=${{ gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
				${forms.map((f, i) => html`
					<button
						key=${f.id || i}
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
					className="button is-small is-success is-outlined wp-sharp-button"
					onClick=${handleAddForm}
					title="إضافة نموذج طلب جديد"
				>
					<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
					<span>+ نموذج جديد</span>
				</button>
			</div>

			<!-- Active Form Configuration Card -->
			<div style=${{ backgroundColor: '#f8fafc', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
				<!-- Form Name & Delete -->
				<div className="columns is-vcentered mb-3">
					<div className="column is-8">
						<label className="label is-small has-text-weight-bold">اسم النموذج (يظهر في القائمة المنسدلة للعميل):</label>
						<input
							type="text"
							className="input is-small"
							value=${currentForm.name || ''}
							onInput=${(e) => updateCurrentForm('name', e.target.value)}
							style=${{ fontWeight: '700', border: '1px solid #cbd5e1' }}
						/>
					</div>
					<div className="column is-4 has-text-left">
						${forms.length > 1 ? html`
							<button
								className="button is-small is-danger is-outlined wp-sharp-button mt-4"
								onClick=${() => handleDeleteForm(activeIdx)}
							>
								<span className="icon"><i className="dashicons dashicons-trash"></i></span>
								<span>حذف هذا النموذج</span>
							</button>
						` : null}
					</div>
				</div>

				<hr style=${{ border: 0, borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />

				<!-- 1. Title Primitive Configuration -->
				<div className="mb-4" style=${{ backgroundColor: '#ffffff', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
					<h4 className="title is-6 mb-2 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
						<span></span>
						<span>1. حقل العنوان والمعرف الذكي (Smart Title Field)</span>
					</h4>
					<div className="columns">
						<div className="column is-6">
							<label className="label is-size-7">مسمى حقل العنوان المخصص:</label>
							<input
								type="text"
								className="input is-small"
								value=${currentForm.title_label || ''}
								onInput=${(e) => updateCurrentForm('title_label', e.target.value)}
								placeholder="مثال: عنوان الطلب، اسم المنظومة، موضوع الاستشارة..."
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">نص التلميح (Placeholder):</label>
							<input
								type="text"
								className="input is-small"
								value=${currentForm.title_placeholder || ''}
								onInput=${(e) => updateCurrentForm('title_placeholder', e.target.value)}
								placeholder="اكتب التلميح التوجيهي للعميل..."
							/>
						</div>
					</div>

					<!-- Title Suggestions Presets -->
					<div className="mt-2">
						<label className="label is-size-7">الاقتراحات السريعة المسبقة (تظهر في القائمة المنسدلة للعميل مع خيار الكتابة الحرة):</label>
						<div className="tags mb-2">
							${(currentForm.title_suggestions || []).map((sug, sIdx) => html`
								<span key=${sIdx} className="tag is-info is-light" style=${{ fontWeight: '600', padding: '0.4rem 0.6rem' }}>
									<span>${sug}</span>
									<button className="delete is-small" onClick=${() => handleRemoveSuggestion(sIdx)}></button>
								</span>
							`)}
						</div>
						<div className="is-flex" style=${{ gap: '8px', maxWidth: '500px' }}>
							<input
								type="text"
								className="input is-small"
								value=${newSuggestionText}
								onInput=${(e) => setNewSuggestionText(e.target.value)}
								onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestion(); } }}
								placeholder="أدخل اقتراحاً جديداً ثم اضغط إضافة..."
							/>
							<button className="button is-small is-info wp-sharp-button" onClick=${handleAddSuggestion}>
								+ إضافة
							</button>
						</div>
					</div>
				</div>

				<!-- 2. Scope / Description Primitive Configuration -->
				<div className="mb-4" style=${{ backgroundColor: '#ffffff', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
					<h4 className="title is-6 mb-2 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
						<span></span>
						<span>2. حقل الشرح وبيان تفاصيل الطلب (Scope Description Field)</span>
					</h4>
					<div className="columns">
						<div className="column is-6">
							<label className="label is-size-7">مسمى حقل الشرح:</label>
							<input
								type="text"
								className="input is-small"
								value=${currentForm.desc_label || ''}
								onInput=${(e) => updateCurrentForm('desc_label', e.target.value)}
								placeholder="مثال: بيان وشرح تفاصيل الطلب، وقائع المسألة، المتطلبات الوظيفية..."
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">نص التوجيه الداخلي (Placeholder):</label>
							<input
								type="text"
								className="input is-small"
								value=${currentForm.desc_placeholder || ''}
								onInput=${(e) => updateCurrentForm('desc_placeholder', e.target.value)}
								placeholder="اشرح ما تريده من العميل كتابته هنا..."
							/>
						</div>
					</div>
				</div>

				<!-- 3. Dynamic Custom Specifications Matrix -->
				<div style=${{ backgroundColor: '#ffffff', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
						<div>
							<h4 className="title is-6 mb-0 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
								<span>3. مصفوفة المواصفات والحقول التخصصية (Dynamic Specifications)</span>
							</h4>
							<p className="is-size-7 has-text-grey">أضف خانات إدخال مخصصة تناسب تفاصيل نشاطك وطبيعة مخرجاتك.</p>
						</div>
						<button className="button is-small is-primary is-outlined wp-sharp-button" onClick=${handleAddSpec}>
							<span className="icon"><i className="dashicons dashicons-plus-alt"></i></span>
							<span>إضافة مواصفة مخصصة</span>
						</button>
					</div>

					${(!currentForm.specs || currentForm.specs.length === 0) ? html`
						<div className="notification is-light p-3 has-text-centered has-text-grey is-size-7" style=${{ border: '1px dashed #cbd5e1' }}>
							لا توجد مواصفات تخصصية مضافة حالياً. انقر على "إضافة مواصفة مخصصة" للبدء.
						</div>
					` : html`
						<div style=${{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
							${currentForm.specs.map((spec, sIdx) => html`
								<div key=${spec.id || sIdx} style=${{ border: '1px solid #e2e8f0', padding: '1rem', backgroundColor: '#f8fafc' }}>
									<div className="columns is-vcentered mb-2">
										<div className="column is-5">
											<label className="label is-size-7">مسمى المواصفة / السؤال:</label>
											<input
												type="text"
												className="input is-small"
												value=${spec.label || ''}
												onInput=${(e) => handleUpdateSpec(sIdx, 'label', e.target.value)}
												placeholder="مثال: نوع التعاقد، الألوان، عدد الصفحات..."
											/>
										</div>

										<div className="column is-4">
											<label className="label is-size-7">نوع خانة الإدخال:</label>
											<div className="select is-small is-fullwidth">
												<select
													value=${spec.type || 'short_text'}
													onChange=${(e) => handleUpdateSpec(sIdx, 'type', e.target.value)}
												>
													<option value="select_custom">قائمة منسدلة باقتراحات + كتابة حرة</option>
													<option value="pills">وسوم وتصنيفات متعددة الاختيار</option>
													<option value="short_text">نص قصير (Short Text)</option>
													<option value="textarea">نص موسع (Textarea)</option>
													<option value="numeric">رقم / كمية / ميزانية</option>
													<option value="date">تاريخ وموعد مستهدف</option>
													<option value="upload">رفع ملفات ومستندات</option>
												</select>
											</div>
										</div>

										<div className="column is-2">
											<label className="checkbox is-size-7 mt-4" style=${{ fontWeight: '700' }}>
												<input
													type="checkbox"
													checked=${!!spec.required}
													onChange=${(e) => handleUpdateSpec(sIdx, 'required', e.target.checked)}
													style=${{ marginLeft: '6px' }}
												/>
												إجباري
											</label>
										</div>

										<div className="column is-1 has-text-left">
											<button
												className="button is-small is-danger is-inverted"
												onClick=${() => handleDeleteSpec(sIdx)}
												title="حذف هذه المواصفة"
											>
												<span className="icon"><i className="dashicons dashicons-trash"></i></span>
											</button>
										</div>
									</div>

									<!-- Options Manager for Select and Pills -->
									${(spec.type === 'select_custom' || spec.type === 'pills') ? html`
										<div className="p-2 mt-2" style=${{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1' }}>
											<label className="label is-size-7 mb-1">الخيارات المتاحة للاختيار:</label>
											<div className="tags mb-2">
												${(spec.options || []).map((opt, optIdx) => html`
													<span key=${optIdx} className="tag is-primary is-light">
														<span>${opt}</span>
														<button className="delete is-small" onClick=${() => handleRemoveOptionFromSpec(sIdx, optIdx)}></button>
													</span>
												`)}
											</div>
											<div className="is-flex" style=${{ gap: '6px', maxWidth: '420px' }}>
												<input
													type="text"
													className="input is-small"
													value=${newOptionTexts[sIdx] || ''}
													onInput=${(e) => setNewOptionTexts({ ...newOptionTexts, [sIdx]: e.target.value })}
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
							`)}
						</div>
					`}
				</div>
			</div>

			<!-- Footer Action -->
			<div className="is-flex is-justify-content-space-between is-align-items-center pt-3" style=${{ borderTop: '1px solid #ededed' }}>
				<p className="is-size-7 has-text-grey">
					<i className="dashicons dashicons-yes-alt ml-1 has-text-success"></i>
					يتم تخزين كافة المواصفات التي يملؤها الزبون كـ JSON مهيكل داخل كيان المشروع CPT_PROJECT بمسمياتها التي وضعتها أعلاه.
				</p>
				<button 
					className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSave}
					disabled=${isSaving}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ واعتماد النماذج</span>
				</button>
			</div>
		</div>
	`;
}
