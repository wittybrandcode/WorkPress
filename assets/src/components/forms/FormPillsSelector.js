import { html } from '../../utils/html.js';

/**
 * Option Tags & Multi-Select Pills Manager Component
 */
export default function FormPillsSelector({
	options = [],
	sIdx,
	newOptionValue = '',
	setNewOptionValue,
	onAddOption,
	onRemoveOption
}) {
	return html`
		<div className="p-3 mt-2" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
			<label className="label is-size-7 mb-1">الخيارات المتاحة للاختيار:</label>
			<div className="tags mb-2">
				${options.map((opt, optIdx) => html`
					<span key=${optIdx} className="tag is-primary is-light" style=${{ borderRadius: 0 }}>
						<span>${opt}</span>
						<button className="delete is-small" onClick=${() => onRemoveOption(sIdx, optIdx)}></button>
					</span>
				`)}
			</div>
			<div className="is-flex" style=${{ gap: '6px', maxWidth: '450px' }}>
				<input
					type="text"
					className="input is-small wp-sharp-input"
					value=${newOptionValue}
					onInput=${(e) => setNewOptionValue(e.target.value)}
					onKeyDown=${(e) => { if (e.key === 'Enter') { e.preventDefault(); onAddOption(sIdx); } }}
					placeholder="اكتب خياراً واضغط إضافة..."
				/>
				<button 
					type="button"
					className="button is-small is-primary is-light wp-sharp-button" 
					onClick=${() => onAddOption(sIdx)}
				>
					+ إضافة خيار
				</button>
			</div>
		</div>
	`;
}
