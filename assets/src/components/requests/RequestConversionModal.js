import { html, __, sprintf } from '../../utils/html.js';
import MemberSelect from '../ui/MemberSelect.js';

/**
 * Project Approval & Conversion Modal Component
 */
export default function RequestConversionModal({
	approvingProject,
	setApprovingProject,
	users = [],
	selectedLeadId,
	setSelectedLeadId,
	approvedBudget,
	setApprovedBudget,
	approvedDueDate,
	setApprovedDueDate,
	isApproving = false,
	handleConfirmApprove
}) {
	if ( ! approvingProject ) return null;

	return html`
		<div className="modal is-active">
			<!-- Non-clickable backdrop strictly preventing accidental loss of user work -->
			<div className="modal-background"></div>
			<div className="modal-card is-medium" style=${{ maxWidth: '560px' }}>
				<header className="modal-card-head">
					<p className="modal-card-title has-text-weight-bold">
						${ __( 'Approve & Initialize Project Workspace', 'workpress' ) }
					</p>
					<button 
						type="button"
						className="wp-modal-close-btn" 
						aria-label=${ __( 'Close', 'workpress' ) } 
						title=${ __( 'Close', 'workpress' ) } 
						onClick=${() => setApprovingProject( null )}
					>
						<svg viewBox="0 0 24 24" width="16" height="16">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</header>

				<section className="modal-card-body p-5">
					<div className="notification is-success is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
						<strong>${ __( 'Project to approve:', 'workpress' ) }</strong> ${approvingProject.name} (${approvingProject.prefix})
						<br />
						<span className="is-size-7 has-text-grey">
							${ __( 'The project status will be converted to Active and launched, notifying the client in their portal.', 'workpress' ) }
						</span>
					</div>

					<div className="field mb-4">
						<label className="label is-small">${ __( 'Assign Project Lead:', 'workpress' ) }</label>
						<div className="control">
							<${MemberSelect}
								users=${users}
								value=${selectedLeadId}
								onChange=${(uid) => setSelectedLeadId(uid)}
								placeholder=${ `-- ${ __( 'Select a team member...', 'workpress' ) } --` }
							/>
						</div>
					</div>

					<div className="columns">
						<div className="column is-6">
							<div className="field">
								<label className="label is-small">${ __( 'Approved Budget:', 'workpress' ) }</label>
								<div className="control">
									<input
										type="text"
										className="input is-small wp-sharp-input"
										value=${approvedBudget}
										onInput=${e => setApprovedBudget( e.target.value )}
										placeholder=${ __( 'Agreed budget...', 'workpress' ) }
									/>
								</div>
							</div>
						</div>

						<div className="column is-6">
							<div className="field">
								<label className="label is-small">${ __( 'Target Delivery Date:', 'workpress' ) }</label>
								<div className="control">
									<input
										type="date"
										className="input is-small wp-sharp-input"
										value=${approvedDueDate ? approvedDueDate.substring( 0, 10 ) : ''}
										onInput=${e => setApprovedDueDate( e.target.value )}
									/>
								</div>
							</div>
						</div>
					</div>
				</section>

				<footer className="modal-card-foot is-justify-content-space-between p-4">
					<button className="button is-light wp-sharp-button" onClick=${() => setApprovingProject( null )} disabled=${isApproving}>
						${ __( 'Cancel', 'workpress' ) }
					</button>
					<button 
						className=${`button is-success wp-sharp-button has-text-weight-bold ${isApproving ? 'is-loading' : ''}`}
						onClick=${handleConfirmApprove}
						disabled=${isApproving}
						style=${{ backgroundColor: '#10b981', color: '#fff' }}
					>
						<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
						<span>${ __( 'Confirm & Launch Project', 'workpress' ) }</span>
					</button>
				</footer>
			</div>
		</div>
	`;
}
