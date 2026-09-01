import { html, __, sprintf } from '../../utils/html.js';

/**
 * Request Technical Evaluation & Rejection Modals Component
 */
export default function RequestEvaluationModal({
	reviewingProject,
	setReviewingProject,
	reviewNotes = '',
	setReviewNotes,
	isReviewing = false,
	handleConfirmReview,
	rejectingProject,
	setRejectingProject,
	rejectionReason = '',
	setRejectionReason,
	isRejecting = false,
	handleConfirmReject
}) {
	return html`
		<div>
			<!-- Under Review Modal -->
			${ reviewingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setReviewingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#0369a1' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								${ __( 'Mark Request Under Technical Review', 'workpress' ) }
							</p>
							<button className="delete" aria-label="close" onClick=${() => setReviewingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-info is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>${ __( 'Project Request:', 'workpress' ) }</strong> ${reviewingProject.name} (${reviewingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									${ __( 'The request status will be changed to Under Review and the client will be notified immediately.', 'workpress' ) }
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">${ __( 'Review Notes (Explanation visible to client in portal):', 'workpress' ) }</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${reviewNotes}
										onInput=${e => setReviewNotes( e.target.value )}
										placeholder=${ __( 'e.g., We are assessing technical feasibility and scheduling required resources with the team...', 'workpress' ) }
									></textarea>
								</div>
								<p className="help has-text-grey">${ __( 'This explanation will appear directly in the client portal and notification alerts.', 'workpress' ) }</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setReviewingProject( null )} disabled=${isReviewing}>
								${ __( 'Cancel', 'workpress' ) }
							</button>
							<button 
								className=${`button is-info wp-sharp-button has-text-weight-bold ${isReviewing ? 'is-loading' : ''}`}
								onClick=${handleConfirmReview}
								disabled=${isReviewing}
								style=${{ backgroundColor: '#0284c7', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
								<span>${ __( 'Confirm Review & Notify Client', 'workpress' ) }</span>
							</button>
						</footer>
					</div>
				</div>
			` }

			<!-- Reject Request Modal -->
			${ rejectingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setRejectingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#991b1b' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								${ __( 'Reject Project Request with Reason', 'workpress' ) }
							</p>
							<button className="delete" aria-label="close" onClick=${() => setRejectingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-danger is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>${ __( 'Project Request:', 'workpress' ) }</strong> ${rejectingProject.name} (${rejectingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									${ __( 'The request will be recorded as Rejected and an immediate notification will be sent to the client.', 'workpress' ) }
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">${ __( 'Rejection Justification (Reason shown to client):', 'workpress' ) }</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${rejectionReason}
										onInput=${e => setRejectionReason( e.target.value )}
										placeholder=${ __( 'e.g., We cannot accommodate this request due to current capacity constraints or scope boundaries...', 'workpress' ) }
									></textarea>
								</div>
								<p className="help has-text-danger">${ __( 'Please formulate the justification courteously as it will be shown to the client.', 'workpress' ) }</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setRejectingProject( null )} disabled=${isRejecting}>
								${ __( 'Cancel', 'workpress' ) }
							</button>
							<button 
								className=${`button is-danger wp-sharp-button has-text-weight-bold ${isRejecting ? 'is-loading' : ''}`}
								onClick=${handleConfirmReject}
								disabled=${isRejecting}
								style=${{ backgroundColor: '#ef4444', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
								<span>${ __( 'Confirm Rejection & Notify Client', 'workpress' ) }</span>
							</button>
						</footer>
					</div>
				</div>
			` }
		</div>
	`;
}
