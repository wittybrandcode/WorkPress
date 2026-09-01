import { html, useState, __ } from '../../utils/html.js';
import Modal from './Modal.js';

export default function ConfirmModal({ isActive, onClose, onCancel, onConfirm, title, message, confirmText = null, confirmColor = 'is-primary', isDangerous = false, requiresReason = false, reasonLabel = null, isSubmitting = false }) {
	const defaultConfirmText = confirmText || __( 'Confirm', 'workpress' );
	const defaultReasonLabel = reasonLabel || __( 'Reason', 'workpress' );
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
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div></div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ handleClose } disabled=${ isSubmitting }>
					${ __( 'Cancel', 'workpress' ) }
				</button>
				<button 
					className=${ `button wp-sharp-button ${ confirmColor } ${ isSubmitting ? 'is-loading' : '' }` }
					onClick=${ handleConfirm }
					disabled=${ (requiresReason && !reason.trim()) || isSubmitting }
				>
					<span className="icon"><i className=${ isDangerous ? "dashicons dashicons-warning" : "dashicons dashicons-yes" }></i></span>
					<span>${ defaultConfirmText }</span>
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
						<span className="has-text-weight-bold">${ __( 'Warning: This action cannot be undone.', 'workpress' ) }</span>
					</div>
				` : null }
				<p className="is-size-5 mb-4">${ message }</p>
				${ requiresReason ? html`
					<div className="field mt-4">
						<label className="label">${ defaultReasonLabel } <span className="has-text-danger">*</span></label>
						<div className="control">
							<textarea 
								className="textarea wp-input" 
								placeholder=${ __( 'Please specify the reason here...', 'workpress' ) }
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
