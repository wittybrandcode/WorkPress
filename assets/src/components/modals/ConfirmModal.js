import { html, useState } from '../../utils/html.js';
import Modal from './Modal.js';

export default function ConfirmModal({ isActive, onClose, onCancel, onConfirm, title, message, confirmText = 'ØªØ£ÙƒÙŠØ¯', confirmColor = 'is-primary', isDangerous = false, requiresReason = false, reasonLabel = 'Ø§Ù„Ø³Ø¨Ø¨', isSubmitting = false }) {
	const [reason, setReason] = useState('');
	const handleClose = () => {
		if (onClose) onClose();
		else if (onCancel) onCancel();
	};

	const handleConfirm = () => {
		onConfirm(reason);
		if (!requiresReason) {
			handleClose();
		}
	};
	const footer = html`
		<div className="is-flex is-justify-content-flex-end" style=${{ width: '100%' }}>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ handleClose } disabled=${ isSubmitting }>
					Ø¥Ù„ØºØ§Ø¡
				</button>
				<button 
					className=${ `button wp-sharp-button ${ confirmColor } ${ isSubmitting ? 'is-loading' : '' }` }
					onClick=${ handleConfirm }
					disabled=${ (requiresReason && !reason.trim()) || isSubmitting }
				>
					<span className="icon"><i className=${ isDangerous ? "dashicons dashicons-warning" : "dashicons dashicons-yes" }></i></span>
					<span>${ confirmText }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} isActive=${ isActive } onClose=${ handleClose } title=${ title } footer=${ footer }>
			<div className="p-4">
				${ isDangerous ? html`
					<div className="has-text-danger mb-4 is-flex is-align-items-center">
						<span className="icon is-large mr-2"><i className="dashicons dashicons-warning" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i></span>
						<span className="has-text-weight-bold">ØªØ­Ø°ÙŠØ±: Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.</span>
					</div>
				` : null }
				<p className="is-size-5 mb-4">${ message }</p>
				${ requiresReason ? html`
					<div className="field mt-4">
						<label className="label">${ reasonLabel } <span className="has-text-danger">*</span></label>
						<div className="control">
							<textarea 
								className="textarea wp-input" 
								placeholder="Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªÙˆØ¶ÙŠØ­ Ø§Ù„Ø³Ø¨Ø¨ Ù‡Ù†Ø§..."
								value=${ reason }
								onInput=${ e => setReason(e.target.value) }
								disabled=${ isSubmitting }
							></textarea>
						</div>
					</div>
				` : null }
			</div>
		</${Modal}>
	`;
}
