import { html, useState } from '../../utils/html.js';
import { settingsApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';
import { FIELD_PRIMITIVES, DEFAULT_UNIVERSAL_FORM } from './FormFieldPrimitives.js';
import FormFieldEditor from './FormFieldEditor.js';

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
			name: `Ù†Ù…ÙˆØ°Ø¬ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ (${forms.length + 1})`,
			specs: [
				{
					id: 'spec_' + Date.now(),
					type: 'select_custom',
					label: 'Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø©:',
					options: ['Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø£ÙˆÙ„', 'Ø§Ù„Ø®ÙŠØ§Ø± Ø§Ù„Ø«Ø§Ù†ÙŠ'],
					required: true
				}
			]
		};
		const updated = [...forms, newForm];
		setForms(updated);
		setActiveIdx(updated.length - 1);
		sound.play('button');
		toast('ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ù‚Ø§Ù„Ø¨ Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø¯ÙŠØ¯.', 'info');
	};

	const handleDeleteForm = (idxToDelete) => {
		if (forms.length <= 1) {
			toast('ÙŠØ¬Ø¨ Ø§Ù„Ø¥Ø¨Ù‚Ø§Ø¡ Ø¹Ù„Ù‰ Ù†Ù…ÙˆØ°Ø¬ Ø·Ù„Ø¨ ÙˆØ§Ø­Ø¯ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.', 'warning');
			sound.play('caution');
			return;
		}
		const updated = forms.filter((_, i) => i !== idxToDelete);
		setForms(updated);
		setActiveIdx(Math.max(0, activeIdx - 1));
		sound.play('button');
		toast('ØªÙ… Ø­Ø°Ù Ù‚Ø§Ù„Ø¨ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬.', 'info');
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
			label: prim.defaultLabel || 'Ù…ÙˆØ§ØµÙØ© Ø¬Ø¯ÙŠØ¯Ø©:',
			placeholder: prim.defaultPlaceholder || '',
			options: prim.defaultOptions ? [...prim.defaultOptions] : [],
			required: false
		};
		specs.push(newSpec);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast('ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ù…ÙˆØ§ØµÙØ© Ø¬Ø¯ÙŠØ¯Ø© Ø¥Ù„Ù‰ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬.', 'success');
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
		toast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…ÙˆØ§ØµÙØ©.', 'info');
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
			toast('ØªÙ… Ø­ÙØ¸ Ù†Ù…Ø§Ø°Ø¬ Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡ Ø¨Ù†Ø¬Ø§Ø­', 'success');
			sound.play('celebration');
			if (typeof onSaved === 'function') onSaved(forms);
		}).catch((err) => {
			setIsSaving(false);
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ù†Ù…Ø§Ø°Ø¬', 'danger');
			sound.play('caution');
		});
	};

	return html`
		<div className="tab-pane-content">
			<!-- Header / Info Bar -->
			<div className="notification is-light p-4 mb-4" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
				<h4 className="title is-6 mb-1 has-text-weight-bold">
					<i className="dashicons dashicons-forms ml-1"></i>
					Ø§Ø³ØªÙˆØ¯ÙŠÙˆ ØªØµÙ…ÙŠÙ… Ù†Ù…Ø§Ø°Ø¬ ÙˆØ§Ø³ØªÙ…Ø§Ø±Ø§Øª Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª (Intake Forms Studio)
				</h4>
				<p className="is-size-7 has-text-grey">
					ÙŠÙ…ÙƒÙ†Ùƒ Ù‡Ù†Ø§ Ø¥Ù†Ø´Ø§Ø¡ ÙˆØªØ®ØµÙŠØµ Ù†Ù…Ø§Ø°Ø¬ Ù…ØªØ¹Ø¯Ø¯Ø© Ù„Ù„Ø®Ø¯Ù…Ø§ØªØŒ ÙˆØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø®Ø§Ù†Ø§Øª ÙˆØ§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± Ù„Ù„Ø¹Ù…Ù„Ø§Ø¡ ÙÙŠ Ø¨ÙˆØ§Ø¨ØªÙ‡Ù… Ø¹Ù†Ø¯ ØªÙ‚Ø¯ÙŠÙ… Ø·Ù„Ø¨ Ù…Ø´Ø±ÙˆØ¹ Ø¬Ø¯ÙŠØ¯.
				</p>
			</div>

			<!-- Template Selector Bar -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 p-3 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
				<div className="is-flex is-align-items-center" style=${{ gap: '6px', flexWrap: 'wrap' }}>
					<span className="is-size-7 has-text-weight-bold has-text-dark ml-2">Ø§Ù„Ù‚ÙˆØ§Ù„Ø¨ Ø§Ù„Ù…ØªØ§Ø­Ø©:</span>
					${forms.map((f, i) => html`
						<button
							key=${f.id || i}
							type="button"
							className=${`button is-small wp-sharp-button ${activeIdx === i ? 'is-primary' : 'is-light'}`}
							onClick=${() => { setActiveIdx(i); sound.play('button'); }}
							style=${{ fontWeight: '700' }}
						>
							${f.name || `Ù†Ù…ÙˆØ°Ø¬ ${i + 1}`}
						</button>
					`)}
					<button
						type="button"
						className="button is-small is-success is-outlined wp-sharp-button"
						onClick=${handleAddForm}
						title="Ø¥Ø¶Ø§ÙØ© Ù‚Ø§Ù„Ø¨ Ù†Ù…ÙˆØ°Ø¬ Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯"
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>+ Ù†Ù…ÙˆØ°Ø¬ Ø¬Ø¯ÙŠØ¯</span>
					</button>
				</div>

				<div className="buttons are-small mb-0">
					<a 
						href="/portal/#/new-request" 
						target="_blank" 
						className="button is-info is-outlined wp-sharp-button"
						title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø§Ù„Ø¨ÙˆØ§Ø¨Ø©"
					>
						<span className="icon"><i className="dashicons dashicons-external"></i></span>
						<span>Ù…Ø¹Ø§ÙŠÙ†Ø© ÙÙŠ Ø§Ù„Ø¨ÙˆØ§Ø¨Ø©</span>
					</a>
				</div>
			</div>

			<!-- Template Editor Box -->
			<div className="box wp-card p-5 mb-4" style=${{ border: '1px solid #cbd5e1', borderRadius: 0 }}>
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #f1f5f9' }}>
					<div className="is-flex is-align-items-center" style=${{ gap: '10px', flex: 1, maxWidth: '600px' }}>
						<label className="label is-size-7 mb-0 has-text-weight-bold" style=${{ whiteSpace: 'nowrap' }}>Ø§Ø³Ù… Ø§Ù„Ù‚Ø§Ù„Ø¨:</label>
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
							<span>Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬</span>
						</button>
					` : null}
				</div>

				<!-- Section 1: Title Field Config -->
				<div className="wp-form-core-field-card p-4 mb-4">
					<h5 className="title is-7 mb-3 has-text-primary has-text-weight-bold">
						<i className="dashicons dashicons-tag ml-1"></i>
						1. Ø­Ù‚Ù„ Ø§Ù„Ø¹Ù†ÙˆØ§Ù† ÙˆØ§Ù„Ù…Ø¹Ø±Ù Ø§Ù„Ø°ÙƒÙŠ Ù„Ù„Ø·Ù„Ø¨ (Smart Title)
					</h5>
					<div className="columns is-variable is-2 mb-2">
						<div className="column is-6">
							<label className="label is-size-7">Ù…Ø³Ù…Ù‰ Ø§Ù„Ø­Ù‚Ù„:</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.title_label || ''}
								onInput=${(e) => updateCurrentForm('title_label', e.target.value)}
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">Ù†Øµ Ø§Ù„ØªÙ„Ù…ÙŠØ­ (Placeholder):</label>
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
						<label className="label is-size-7 mb-1">Ø§Ù‚ØªØ±Ø§Ø­Ø§Øª Ø§Ù„Ø¹Ù†Ø§ÙˆÙŠÙ† Ø§Ù„Ø³Ø±ÙŠØ¹Ø© Ø§Ù„Ø¬Ø§Ù‡Ø²Ø©:</label>
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
								placeholder="Ø§ÙƒØªØ¨ Ø¹Ù†ÙˆØ§Ù†Ø§Ù‹ Ù…Ù‚ØªØ±Ø­Ø§Ù‹ ÙˆØ§Ø¶ØºØ· Ø¥Ø¶Ø§ÙØ©..."
							/>
							<button type="button" className="button is-small is-info is-light wp-sharp-button" onClick=${handleAddSuggestion}>
								+ Ø¥Ø¶Ø§ÙØ©
							</button>
						</div>
					</div>
				</div>

				<!-- Section 2: Description Field Config -->
				<div className="wp-form-core-field-card p-4 mb-4">
					<h5 className="title is-7 mb-3 has-text-primary has-text-weight-bold">
						<i className="dashicons dashicons-editor-paragraph ml-1"></i>
						2. Ø­Ù‚Ù„ Ø´Ø±Ø­ ÙˆØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø·Ù„Ø¨ (Scope Description)
					</h5>
					<div className="columns is-variable is-2">
						<div className="column is-6">
							<label className="label is-size-7">Ù…Ø³Ù…Ù‰ Ø§Ù„Ø­Ù‚Ù„:</label>
							<input
								type="text"
								className="input is-small wp-sharp-input"
								value=${currentForm.desc_label || ''}
								onInput=${(e) => updateCurrentForm('desc_label', e.target.value)}
							/>
						</div>
						<div className="column is-6">
							<label className="label is-size-7">Ù†Øµ Ø§Ù„ØªÙ„Ù…ÙŠØ­ ÙˆØ§Ù„ØªÙˆØ¬ÙŠÙ‡:</label>
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
							3. Ø®Ø§Ù†Ø§Øª ÙˆÙ…ÙˆØ§ØµÙØ§Øª Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„ØªØ®ØµØµÙŠØ© (Specs Matrix)
						</h5>
						<div className="buttons are-small mb-0">
							<button type="button" className="button is-small is-primary is-light wp-sharp-button" onClick=${() => handleAddSpec('select_custom')}>
								+ Ù‚Ø§Ø¦Ù…Ø© Ù…Ù†Ø³Ø¯Ù„Ø©
							</button>
							<button type="button" className="button is-small is-info is-light wp-sharp-button" onClick=${() => handleAddSpec('pills')}>
								+ ÙˆØ³ÙˆÙ… Ù…ØªØ¹Ø¯Ø¯Ø©
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('short_text')}>
								+ Ù†Øµ Ù‚ØµÙŠØ±
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('numeric')}>
								+ Ø±Ù‚Ù…/Ù…ÙŠØ²Ø§Ù†ÙŠØ©
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('date')}>
								+ ØªØ§Ø±ÙŠØ®
							</button>
							<button type="button" className="button is-small is-light wp-sharp-button" onClick=${() => handleAddSpec('upload')}>
								+ Ù…Ù„ÙØ§Øª
							</button>
						</div>
					</div>

					${(!currentForm.specs || currentForm.specs.length === 0) ? html`
						<div className="has-text-centered py-4 has-text-grey is-size-7" style=${{ border: '1px dashed #cbd5e1' }}>
							Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…ÙˆØ§ØµÙØ§Øª Ø¥Ø¶Ø§ÙÙŠØ© ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù†Ù…ÙˆØ°Ø¬. Ø§Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø£Ø²Ø±Ø§Ø± Ø£Ø¹Ù„Ø§Ù‡ Ù„Ø¥Ø¶Ø§ÙØ© Ø®Ø§Ù†Ø§Øª.
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
					ÙŠØªÙ… ØªØ®Ø²ÙŠÙ† ÙƒØ§ÙØ© Ø§Ù„Ù…ÙˆØ§ØµÙØ§Øª Ø§Ù„ØªÙŠ ÙŠÙ…Ù„Ø¤Ù‡Ø§ Ø§Ù„Ø²Ø¨ÙˆÙ† ÙƒÙ€ JSON Ù…Ù‡ÙŠÙƒÙ„ Ø¯Ø§Ø®Ù„ ÙƒÙŠØ§Ù† Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ CPT_PROJECT Ø¨Ù…Ø³Ù…ÙŠØ§ØªÙ‡Ø§ Ø§Ù„ØªÙŠ ÙˆØ¶Ø¹ØªÙ‡Ø§ Ø£Ø¹Ù„Ø§Ù‡.
				</p>
				<button 
					type="button"
					className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSave}
					disabled=${isSaving}
					style=${{ fontWeight: '800' }}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>Ø­ÙØ¸ ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†Ù…Ø§Ø°Ø¬</span>
				</button>
			</div>
		</div>
	`;
}
