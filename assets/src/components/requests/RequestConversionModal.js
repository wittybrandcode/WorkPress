import { html } from '../../utils/html.js';
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
			<div className="modal-background" onClick=${() => setApprovingProject( null )}></div>
			<div className="modal-card" style=${{ maxWidth: '560px' }}>
				<header className="modal-card-head" style=${{ backgroundColor: '#1e293b' }}>
					<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
						Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªØ£Ø³ÙŠØ³ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø±Ø³Ù…ÙŠÙ‹Ø§ ÙÙŠ Ø§Ù„Ù…Ù†Ø¸ÙˆÙ…Ø©
					</p>
					<button className="delete" aria-label="close" onClick=${() => setApprovingProject( null )}></button>
				</header>

				<section className="modal-card-body p-5">
					<div className="notification is-success is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
						<strong>Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ Ø§Ø¹ØªÙ…Ø§Ø¯Ù‡:</strong> ${approvingProject.name} (${approvingProject.prefix})
						<br />
						<span className="is-size-7 has-text-grey">
							Ø³ÙŠØªÙ… ØªØ­ÙˆÙŠÙ„ Ø­Ø§Ù„Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¥Ù„Ù‰ <strong>Ù†Ø´Ø· (Active)</strong> ÙˆØªØ¯Ø´ÙŠÙ†Ù‡ ÙˆØ¥Ø´Ø¹Ø§Ø± Ø§Ù„Ø¹Ù…ÙŠÙ„ ÙÙˆØ±Ø§Ù‹ ÙÙŠ Ø¨ÙˆØ§Ø¨ØªÙ‡.
						</span>
					</div>

					<div className="field mb-4">
						<label className="label is-small">ØªØ¹ÙŠÙŠÙ† Ù…Ø¯ÙŠØ± / Ù‚Ø§Ø¦Ø¯ Ù„Ù„Ù…Ø´Ø±ÙˆØ¹ (Project Lead):</label>
						<div className="control">
							<${MemberSelect}
								users=${users}
								value=${selectedLeadId}
								onChange=${(uid) => setSelectedLeadId(uid)}
								placeholder="-- Ø§Ø®ØªØ± Ù‚Ø§Ø¦Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù…Ù† Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„ÙÙ†ÙŠ --"
							/>
						</div>
					</div>

					<div className="columns">
						<div className="column is-6">
							<div className="field">
								<label className="label is-small">Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©:</label>
								<div className="control">
									<input
										type="text"
										className="input is-small wp-sharp-input"
										value=${approvedBudget}
										onInput=${e => setApprovedBudget( e.target.value )}
										placeholder="Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ© Ø§Ù„Ù…ØªÙÙ‚ Ø¹Ù„ÙŠÙ‡Ø§..."
									/>
								</div>
							</div>
						</div>

						<div className="column is-6">
							<div className="field">
								<label className="label is-small">ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ³Ù„ÙŠÙ… Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù:</label>
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
						Ø¥Ù„ØºØ§Ø¡
					</button>
					<button 
						className=${`button is-success wp-sharp-button has-text-weight-bold ${isApproving ? 'is-loading' : ''}`}
						onClick=${handleConfirmApprove}
						disabled=${isApproving}
						style=${{ backgroundColor: '#10b981', color: '#fff' }}
					>
						<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
						<span>ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ¨Ø¯Ø¡ Ø§Ù„ØªÙ†ÙÙŠØ°</span>
					</button>
				</footer>
			</div>
		</div>
	`;
}
