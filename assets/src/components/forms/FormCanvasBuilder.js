import { html } from '../../utils/html.js';
import FormFieldEditor from './FormFieldEditor.js';

/**
 * Main Interactive Canvas Builder Component for Forms
 */
export default function FormCanvasBuilder({
	forms = [],
	activeIdx = 0,
	currentForm,
	FIELD_PRIMITIVES = {},
	updateCurrentForm,
	handleAddPrimitive,
	handleDeleteFormTemplate,
	handleMoveSpec,
	handleDeleteSpec,
	handleUpdateSpec,
	newOptionInputs = {},
	setNewOptionInputs,
	handleAddOptionToSpec,
	handleRemoveOptionFromSpec,
	newSuggestionInput = '',
	setNewSuggestionInput,
	handleAddSuggestion,
	handleRemoveSuggestion,
	handleSaveAll,
	isSaving = false
}) {
	if (!currentForm) return null;

	return html`
		<div className="columns is-variable is-4 mt-2 mb-6" style=${{ width: '100%' }}>
			<!-- Column 1: Elements Palette -->
			<div className="column is-3">
				<div className="box wp-card wp-form-palette-box p-4">
					<div className="mb-3 pb-2" style=${{ borderBottom: '1px solid #e2e8f0' }}>
						<h3 className="title is-6 mb-1 has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span className="icon is-small"><i className="dashicons dashicons-layout"></i></span>
							<span>لوحة الخانات واللبنات العامة</span>
						</h3>
						<p className="is-size-7 has-text-grey">انقر لإضافة أي خانة مباشرة إلى لوحة البناء:</p>
					</div>

					<div style=${{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						${Object.entries(FIELD_PRIMITIVES).map(([key, prim]) => {
							if (key === 'smart_title' || key === 'scope_description') return null;
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
									<span className="tag is-light is-size-7" style=${{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: 0 }}>
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

			<!-- Column 2: The Visual Canvas -->
			<div className="column is-9">
				<div className="box wp-card wp-form-canvas-box p-5">
					<!-- Form Top Meta in Canvas -->
					<div className="mb-5 pb-4" style=${{ borderBottom: '2px solid #f1f5f9' }}>
						<div className="is-flex is-justify-content-space-between is-align-items-center is-flex-wrap-wrap mb-2" style=${{ gap: '8px' }}>
							<div className="is-flex is-align-items-center" style=${{ gap: '8px', flexGrow: 1 }}>
								<span className="tag is-primary is-light has-text-weight-bold" style=${{ borderRadius: 0 }}>اسم النموذج في البوابة:</span>
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${currentForm.name || ''}
									onInput=${(e) => updateCurrentForm('name', e.target.value)}
									style=${{ fontWeight: '800', fontSize: '1rem', border: '1px solid #cbd5e1', flexGrow: 1, maxWidth: '500px' }}
								/>
							</div>
							
							${forms.length > 1 ? html`
								<button
									type="button"
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
					<div className="canvas-field-card wp-form-core-field-card p-4 mb-4">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
							<span className="tag is-info is-light has-text-weight-bold" style=${{ borderRadius: 0 }}>
								<i className="dashicons dashicons-tag ml-1"></i> 1. حقل العنوان والمعرف الذكي (Smart Title)
							</span>
							<span className="is-size-7 has-text-grey">ثابت وأساسي</span>
						</div>

						<div className="columns is-variable is-2 mb-2">
							<div className="column is-6">
								<label className="label is-size-7">مسمى الحقل للعميل:</label>
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${currentForm.title_label || ''}
									onInput=${(e) => updateCurrentForm('title_label', e.target.value)}
									style=${{ border: '1px solid #cbd5e1', fontWeight: '700' }}
								/>
							</div>
							<div className="column is-6">
								<label className="label is-size-7">نص التلميح (Placeholder):</label>
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${currentForm.title_placeholder || ''}
									onInput=${(e) => updateCurrentForm('title_placeholder', e.target.value)}
									style=${{ border: '1px solid #cbd5e1' }}
								/>
							</div>
						</div>

						<!-- Title Suggestions -->
						<div className="p-3" style=${{ backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
							<label className="label is-size-7 mb-1">قائمة الاقتراحات السريعة (تظهر كخيارات منسدلة سريعة + خيار كتابة حرة دائماً):</label>
							<div className="tags mb-2">
								${(currentForm.title_suggestions || []).map((sug, sIdx) => html`
									<span key=${sIdx} className="tag is-info is-light" style=${{ fontWeight: '600', borderRadius: 0 }}>
										<span>${sug}</span>
										<button className="delete is-small" onClick=${() => handleRemoveSuggestion(sIdx)}></button>
									</span>
								`)}
							</div>
							<div className="is-flex" style=${{ gap: '6px', maxWidth: '500px' }}>
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${newSuggestionInput}
									onInput=${(e) => setNewSuggestionInput(e.target.value)}
									onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestion(); } }}
									placeholder="أدخل اقتراحاً واضغط إضافة..."
								/>
								<button 
									type="button"
									className="button is-small is-info is-light wp-sharp-button" 
									onClick=${handleAddSuggestion}
								>
									+ إضافة
								</button>
							</div>
						</div>
					</div>

					<!-- Core Field 2: Scope Description -->
					<div className="canvas-field-card wp-form-core-field-card p-4 mb-4">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
							<span className="tag is-info is-light has-text-weight-bold" style=${{ borderRadius: 0 }}>
								<i className="dashicons dashicons-editor-paragraph ml-1"></i> 2. حقل الشرح وتفاصيل الطلب (Scope Description)
							</span>
							<span className="is-size-7 has-text-grey">ثابت وأساسي</span>
						</div>

						<div className="columns is-variable is-2">
							<div className="column is-6">
								<label className="label is-size-7">مسمى الحقل للعميل:</label>
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${currentForm.desc_label || ''}
									onInput=${(e) => updateCurrentForm('desc_label', e.target.value)}
									style=${{ border: '1px solid #cbd5e1', fontWeight: '700' }}
								/>
							</div>
							<div className="column is-6">
								<label className="label is-size-7">نص التوجيه الداخلي (Placeholder):</label>
								<input
									type="text"
									className="input is-small wp-sharp-input"
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
							<div className="p-5 has-text-centered" style=${{ border: '2px dashed #cbd5e1', backgroundColor: '#f8fafc', borderRadius: 0 }}>
								<p className="has-text-grey is-size-7 mb-2">لا توجد خانات مواصفات مضافة حالياً.</p>
								<p className="is-size-7 has-text-grey-light">اختر أي خانة من القائمة اليمنى للبدء بإضافتها هنا في النموذج.</p>
							</div>
						` : html`
							<div style=${{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
										newOptionValue=${newOptionInputs[sIdx] || ''}
										setNewOptionValue=${(val) => setNewOptionInputs({ ...newOptionInputs, [sIdx]: val })}
										onAddOption=${handleAddOptionToSpec}
										onRemoveOption=${handleRemoveOptionFromSpec}
									/>
								`)}
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
							type="button"
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
	`;
}
