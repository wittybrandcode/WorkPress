import { html, useState } from '../utils/html.js';
import { settingsApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';
import { FIELD_PRIMITIVES, DEFAULT_UNIVERSAL_FORM } from './forms/FormFieldPrimitives.js';
import FormFieldEditor from './forms/FormFieldEditor.js';

/**
 * Settings Tab Component: Intake Forms Builder
 *
 * @package WorkPress
 * @subpackage Components/Settings
 */
export default function IntakeFormsBuilderTab({ initialForms, onSaved }) {
	const [forms, setForms] = useState(
		Array.isArray(initialForms) && initialForms.length > 0 ? initialForms : [DEFAULT_UNIVERSAL_FORM]
	);
	const [activeIdx, setActiveIdx] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [newSuggestionText, setNewSuggestionText] = useState('');
	const [newOptionTexts, setNewOptionTexts] = useState({});

	const currentForm = forms[activeIdx] || forms[0] || DEFAULT_UNIVERSAL_FORM;

	const handleAddForm = () => {
		const newForm = {
			...DEFAULT_UNIVERSAL_FORM,
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

	const handleAddSpec = (type) => {
		const prim = FIELD_PRIMITIVES[type] || FIELD_PRIMITIVES.short_text;
		const specs = Array.isArray(currentForm.specs) ? [...currentForm.specs] : [];
		const newSpec = {
			id: 'spec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
			type: type || 'short_text',
			label: prim.defaultLabel || 'مواصفة جديدة:',
			placeholder: prim.defaultPlaceholder || '',
			options: prim.defaultOptions ? [...prim.defaultOptions] : [],
			required: false
		};
		specs.push(newSpec);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast('تمت إضافة مواصفة جديدة إلى النموذج.', 'success');
	};

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
		toast('تم حذف المواصفة.', 'info');
	};

	const handleUpdateSpec = (sIdx, key, val) => {
		const specs = [...currentForm.specs];
		specs[sIdx] = {
			...specs[sIdx],
			[key]: val
		};
		updateCurrentForm('specs', specs);
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

	const handleSave = () => {
		setIsSaving(true);
		settingsApi.update({
			intake_forms_schema: forms
		}).then(() => {
			setIsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.intake_forms_schema = forms;
			}
			toast('تم حفظ نماذج استقبال طلبات العملاء بنجاح', 'success');
			sound.play('celebration');
			if (typeof onSaved === 'function') onSaved(forms);
		}).catch((err) => {
			setIsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ النماذج', 'danger');
			sound.play('caution');
		});
	};

	return html`
		<div className="tab-pane-content">
			<!-- Header / Info Bar -->
			<div className="notification is-light p-4 mb-4" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
				<h4 className="title is-6 mb-1 has-text-weight-bold">
					<i className="dashicons dashicons-forms ml-1"></i>
					استوديو تصميم نماذج واستمارات استقبال الطلبات (Intake Forms Studio)
				</h4>
				<p className="is-size-7 has-text-grey">
					يمكنك هنا إنشاء وتخصيص نماذج متعددة للخدمات، وتحديد الخانات والخيارات التي تظهر للعملاء في بوابتهم عند تقديم طلب مشروع جديد.
				</p>
			</div>

			<!-- Template Selector Bar -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 p-3 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
				<div className="is-flex is-align-items-center" style=${{ gap: '6px', flexWrap: 'wrap' }}>
					<span className="is-size-7 has-text-weight-bold has-text-dark ml-2">القوالب المتاحة:</span>
					${forms.map((f, i) => html`
						<button
							key=${f.id || i}
							type="button"
							className=${`button is-small wp-sharp-button ${activeIdx === i ? 'is-primary' : 'is-light'}`}
							onClick=${() => { setActiveIdx(i); sound.play('button'); }}
							style=${{ fontWeight: '700' }}
						>
							${f.name || `نموذج ${i + 1}`}
						</button>
					`)}
					<button
						type="button"
						className="button is-small is-success is-outlined wp-sharp-button"
						onClick=${handleAddForm}
						title="إضافة قالب نموذج طلب جديد"
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>+ نموذج جديد</span>
					</button>
				</div>

				<div className="buttons are-small mb-0">
					<a 
						href="/portal/#/new-request" 
						target="_blank" 
						className="button is-info is-outlined wp-sharp-button"
						title="معاينة البوابة"
					>
						<span className="icon"><i className="dashicons dashicons-external"></i></span>
						<span>معاينة في البوابة</span>
					</a>
				</div>
			</div>

			<!-- Template Editor Box -->
			<div className="box wp-card p-5 mb-4" style=${{ border: '1px solid #cbd5e1', borderRadius: 0 }}>
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #f1f5f9' }}>
					<div className="is-flex is-align-items-center" style=${{ gap: '10px', flex: 1, maxWidth: '600px' }}>
						<label className="label is-size-7 mb-0 has-text-weight-bold" style=${{ whiteSpace: 'nowrap' }}>اسم القالب:</label>
						<input
							type="text"
							className="input is-small wp-sharp-input"
							value=${currentForm.name || ''}
							onInput=${(e) => updateCurrentForm('name', e.target.value)}
							style=${{ fontWeight: '700' }}
						/>
					</div>
					${forms.length > 1 ? html`
						<button
							type="button"
							className="button is-small is-danger is-light wp-sharp-button"
							onClick=${() => handleDeleteForm(activeIdx)}
						>
							<span className="icon"><i className="dashicons dashicons-trash"></i></span>
							<span>حذف هذا النموذج</span>
						</button>
					` : null}
				</div>

				<!-- Section 1: Title Field Config -->
				<div className="wp-form-core-field-card p-4 mb-4">
					<h5 className="title is-7 mb-3 has-text-primary has-text-weight-bold">
						<i className="dashicons dashicons-tag ml-1"></i>
						1. حقل العنوان والمعرف الذكي للطلب (Smart Title)
					</h5>
					<div className="columns is-variable is-2 mb-2">
						<div className="column is-6">
							<label className="label is-size-7">مسمى الحقل:</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.title_label || ''}
								onInput=${(e) => updateCurrentForm('title_label', e.target.value)}
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">نص التلميح (Placeholder):</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.title_placeholder || ''}
								onInput=${(e) => updateCurrentForm('title_placeholder', e.target.value)}
							/>
						</div>
					</div>

					<!-- Suggestions Manager -->
					<div className="p-3" style=${{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
						<label className="label is-size-7 mb-1">اقتراحات العناوين السريعة الجاهزة:</label>
						<div className="tags mb-2">
							${(currentForm.title_suggestions || []).map((sug, sIdx) => html`
								<span key=${sIdx} className="tag is-info is-light" style=${{ borderRadius: 0 }}>
									<span>${sug}</span>
									<button className="delete is-small" onClick=${() => handleRemoveSuggestion(sIdx)}></button>
								</span>
							`)}
						</div>
						<div className="is-flex" style=${{ gap: '6px', maxWidth: '460px' }}>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${newSuggestionText}
								onInput=${(e) => setNewSuggestionText(e.target.value)}
								onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestion(); } }}
								placeholder="اكتب عنواناً مقترحاً واضغط إضافة..."
							/>
							<button type="button" className="button is-small is-info is-light wp-sharp-button" onClick=${handleAddSuggestion}>
								+ إضافة
							</button>
						</div>
					</div>
				</div>

				<!-- Section 2: Description Field Config -->
				<div className="wp-form-core-field-card p-4 mb-4">
					<h5 className="title is-7 mb-3 has-text-primary has-text-weight-bold">
						<i className="dashicons dashicons-editor-paragraph ml-1"></i>
						2. حقل شرح وتفاصيل الطلب (Scope Description)
					</h5>
					<div className="columns is-variable is-2">
						<div className="column is-6">
							<label className="label is-size-7">مسمى الحقل:</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.desc_label || ''}
								onInput=${(e) => updateCurrentForm('desc_label', e.target.value)}
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">نص التلميح والتوجيه:</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.desc_placeholder || ''}
								onInput=${(e) => updateCurrentForm('desc_placeholder', e.target.value)}
							/>
						</div>
					</div>
				</div>

				<!-- Section 3: Custom Specs Matrix -->
				<div className="p-4" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}>
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
						<h5 className="title is-7 mb-0 has-text-primary has-text-weight-bold">
							<i className="dashicons dashicons-list-view ml-1"></i>
							3. خانات ومواصفات الطلب التخصصية (Specs Matrix)
						</h5>
						<div className="buttons are-small mb-0">
							<button type="button" className="button is-small is-primary is-light wp-sharp-button" onClick=${() => handleAddSpec('select_custom')}>
								+ قائمة منسدلة
							</button>
							<button type="button" className="button is-small is-info is-light wp-sharp-button" onClick=${() => handleAddSpec('pills')}>
								+ وسوم متعددة
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('short_text')}>
								+ نص قصير
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('numeric')}>
								+ رقم/ميزانية
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('date')}>
								+ تاريخ
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('upload')}>
								+ ملفات
							</button>
						</div>
					</div>

					${(!currentForm.specs || currentForm.specs.length === 0) ? html`
						<div className="has-text-centered py-4 has-text-grey is-size-7" style=${{ border: '1px dashed #cbd5e1' }}>
							لا توجد مواصفات إضافية في هذا النموذج. استخدم الأزرار أعلاه لإضافة خانات.
						</div>
					` : html`
						<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							${currentForm.specs.map((spec, sIdx) => html`
								<${FormFieldEditor}
									key=${spec.id || sIdx}
									spec=${spec}
									sIdx=${sIdx}
									totalSpecs=${currentForm.specs.length}
									FIELD_PRIMITIVES=${FIELD_PRIMITIVES}
									onMoveSpec=${handleMoveSpec}
									onDeleteSpec=${handleDeleteSpec}
									onUpdateSpec=${handleUpdateSpec}
									newOptionValue=${newOptionTexts[sIdx] || ''}
									setNewOptionValue=${(val) => setNewOptionTexts({ ...newOptionTexts, [sIdx]: val })}
									onAddOption=${handleAddOptionToSpec}
									onRemoveOption=${handleRemoveOptionFromSpec}
								/>
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
					type="button"
					className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSave}
					disabled=${isSaving}
					style=${{ fontWeight: '800' }}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ واعتماد النماذج</span>
				</button>
			</div>
		</div>
	`;
}
