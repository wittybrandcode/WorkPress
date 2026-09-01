import { html, __, isRtl } from '../../utils/html.js';
import FormPillsSelector from './FormPillsSelector.js';

/**
 * Individual Canvas Field Card Editor Component
 */
export default function FormFieldEditor({
	spec,
	sIdx,
	totalSpecs = 0,
	FIELD_PRIMITIVES = {},
	onMoveSpec,
	onDeleteSpec,
	onUpdateSpec,
	newOptionValue = '',
	setNewOptionValue,
	onAddOption,
	onRemoveOption
}) {
	const prim = FIELD_PRIMITIVES[spec.type] || FIELD_PRIMITIVES.short_text || { label: spec.type, icon: 'dashicons-admin-generic' };
	const rtl = isRtl();

	return html`
		<div className="canvas-spec-card wp-form-spec-card p-4">
			<!-- Spec Card Header / Actions -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #f1f5f9' }}>
				<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
					<span className="tag is-dark is-small" style=${{ borderRadius: 0, fontWeight: '700' }}>#${sIdx + 1}</span>
					<span className="tag is-light is-small" style=${{ fontWeight: '700' }}>
						<i className=${`dashicons ${prim.icon} ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
						${prim.label ? prim.label.split('(')[0] : spec.type}
					</span>
				</div>

				<div className="buttons are-small mb-0" style=${{ gap: '4px' }}>
					<!-- Move Up -->
					<button 
						type="button" 
						className="button is-small is-light wp-sharp-button" 
						disabled=${sIdx === 0} 
						onClick=${() => onMoveSpec(sIdx, -1)}
						title=${ __( 'Move Up', 'workpress' ) }
					>
						▲
					</button>
					<!-- Move Down -->
					<button 
						type="button" 
						className="button is-small is-light wp-sharp-button" 
						disabled=${sIdx === totalSpecs - 1} 
						onClick=${() => onMoveSpec(sIdx, 1)}
						title=${ __( 'Move Down', 'workpress' ) }
					>
						▼
					</button>
					<!-- Delete -->
					<button 
						type="button" 
						className="button is-small is-danger is-light wp-sharp-button" 
						onClick=${() => onDeleteSpec(sIdx)}
						title=${ __( 'Delete Field', 'workpress' ) }
					>
						<i className="dashicons dashicons-trash"></i>
					</button>
				</div>
			</div>

			<!-- Inline Editable Fields -->
			<div className="columns is-variable is-2 is-vcentered mb-2">
				<div className="column is-6">
					<label className="label is-size-7">${ __( 'Field Label / Question for Client:', 'workpress' ) }</label>
					<input
						type="text"
						className="input is-small wp-sharp-input"
						value=${spec.label || ''}
						onInput=${(e) => onUpdateSpec(sIdx, 'label', e.target.value)}
						style=${{ fontWeight: '700', border: '1px solid #cbd5e1' }}
						placeholder=${ __( 'Field name...', 'workpress' ) }
					/>
				</div>

				<div className="column is-4">
					<label className="label is-size-7">${ __( 'Field Type:', 'workpress' ) }</label>
					<div className="select is-small is-fullwidth wp-sharp-input">
						<select
							value=${spec.type || 'short_text'}
							onChange=${(e) => onUpdateSpec(sIdx, 'type', e.target.value)}
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
							onChange=${(e) => onUpdateSpec(sIdx, 'required', e.target.checked)}
							style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}
						/>
						${ __( 'Required', 'workpress' ) }
					</label>
				</div>
			</div>

			<!-- Options Manager for select and pills -->
			${(spec.type === 'select_custom' || spec.type === 'pills') ? html`
				<${FormPillsSelector}
					options=${spec.options || []}
					sIdx=${sIdx}
					newOptionValue=${newOptionValue}
					setNewOptionValue=${setNewOptionValue}
					onAddOption=${onAddOption}
					onRemoveOption=${onRemoveOption}
				/>
			` : null}
		</div>
	`;
}
