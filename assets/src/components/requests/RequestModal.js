import { html, useState, __, isRtl } from '../../utils/html.js';
import { projectsApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

/**
 * RequestModal Component
 *
 * Dedicated modal for rapid proposal and request submission from anywhere in WorkPress.
 * Accessible directly via the QuickAddMenu (+) in the Breadcrumb horizon.
 */
export default function RequestModal({
	isActive,
	onClose,
	onSave
}) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [requestedBudget, setRequestedBudget] = useState('');
	const [requestedDueDate, setRequestedDueDate] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const rtl = isRtl();

	const handleClose = () => {
		setName('');
		setDescription('');
		setRequestedBudget('');
		setRequestedDueDate('');
		setIsSubmitting(false);
		if (onClose) onClose();
	};

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		if (!name.trim()) {
			toast(__('Please enter a title for the request.', 'workpress'), 'warning');
			return;
		}

		setIsSubmitting(true);
		try {
			await projectsApi.create({
				name: name.trim(),
				description: description.trim(),
				is_client_request: true,
				status: 'pending',
				requested_budget: requestedBudget.trim() || null,
				requested_due_date: requestedDueDate || null
			});

			toast(__('Request submitted successfully for review and triage.', 'workpress'), 'success');
			sound.play('congratulations');
			handleClose();
			if (onSave) onSave();
		} catch (err) {
			console.error('Failed to submit request:', err);
			toast(err.message || __('Failed to submit request.', 'workpress'), 'danger');
			sound.play('caution');
			setIsSubmitting(false);
		}
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div></div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button 
					type="button" 
					className="button wp-btn" 
					onClick=${ handleClose } 
					disabled=${ isSubmitting }
					style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
				>
					${ __( 'Cancel', 'workpress' ) }
				</button>
				<button 
					type="button" 
					className=${ `button wp-btn is-active ${ isSubmitting ? 'is-loading' : '' }` }
					onClick=${ handleSubmit }
					disabled=${ isSubmitting || !name.trim() }
					style=${{ borderRadius: 0 }}
				>
					<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
					<span>${ __( 'Submit Proposal', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal}
			isActive=${ isActive }
			onClose=${ handleClose }
			title=${ __( 'Submit New Request / Proposal', 'workpress' ) }
			footer=${ footer }
		>
			<form onSubmit=${ handleSubmit } className="p-4">
				<!-- Title Field -->
				<div className="field mb-4">
					<label className="label is-size-7 has-text-weight-bold" style=${{ color: '#0f172a' }}>
						${ __( 'Request Title / Proposal Name', 'workpress' ) } <span className="has-text-danger">*</span>
					</label>
					<div className="control">
						<input
							type="text"
							className="input wp-input"
							placeholder=${ __( 'e.g. Modernization of Core Workflow Dashboard...', 'workpress' ) }
							value=${ name }
							onInput=${ e => setName( e.target.value ) }
							required
							style=${{ borderRadius: 0 }}
						/>
					</div>
				</div>

				<!-- Description / Scope Field -->
				<div className="field mb-4">
					<label className="label is-size-7 has-text-weight-bold" style=${{ color: '#0f172a' }}>
						${ __( 'Objectives & Scope Details', 'workpress' ) }
					</label>
					<div className="control">
						<textarea
							className="textarea wp-input"
							rows="4"
							placeholder=${ __( 'Describe the problem to solve, scope requirements, and deliverables...', 'workpress' ) }
							value=${ description }
							onInput=${ e => setDescription( e.target.value ) }
							style=${{ borderRadius: 0 }}
						></textarea>
					</div>
				</div>

				<!-- Two Columns: Target Deadline & Proposed Budget -->
				<div className="columns is-variable is-2 mb-2">
					<div className="column is-6">
						<div className="field">
							<label className="label is-size-7 has-text-weight-bold" style=${{ color: '#0f172a' }}>
								${ __( 'Desired Delivery Date', 'workpress' ) }
							</label>
							<div className="control">
								<input
									type="date"
									className="input wp-input"
									value=${ requestedDueDate }
									onInput=${ e => setRequestedDueDate( e.target.value ) }
									style=${{ borderRadius: 0 }}
								/>
							</div>
						</div>
					</div>
					<div className="column is-6">
						<div className="field">
							<label className="label is-size-7 has-text-weight-bold" style=${{ color: '#0f172a' }}>
								${ __( 'Estimated / Proposed Budget', 'workpress' ) }
							</label>
							<div className="control">
								<input
									type="text"
									className="input wp-input"
									placeholder=${ __( 'e.g. $5,000 or Flexible', 'workpress' ) }
									value=${ requestedBudget }
									onInput=${ e => setRequestedBudget( e.target.value ) }
									style=${{ borderRadius: 0 }}
								/>
							</div>
						</div>
					</div>
				</div>
			</form>
		</${Modal}>
	`;
}
