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
						اعتماد وتأسيس المشروع رسميًا في المنظومة
					</p>
					<button className="delete" aria-label="close" onClick=${() => setApprovingProject( null )}></button>
				</header>

				<section className="modal-card-body p-5">
					<div className="notification is-success is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
						<strong>المشروع المطلوب اعتماده:</strong> ${approvingProject.name} (${approvingProject.prefix})
						<br />
						<span className="is-size-7 has-text-grey">
							سيتم تحويل حالة المشروع إلى <strong>نشط (Active)</strong> وتدشينه وإشعار العميل فوراً في بوابته.
						</span>
					</div>

					<div className="field mb-4">
						<label className="label is-small">تعيين مدير / قائد للمشروع (Project Lead):</label>
						<div className="control">
							<${MemberSelect}
								users=${users}
								value=${selectedLeadId}
								onChange=${(uid) => setSelectedLeadId(uid)}
								placeholder="-- اختر قائد المشروع من الفريق الفني --"
							/>
						</div>
					</div>

					<div className="columns">
						<div className="column is-6">
							<div className="field">
								<label className="label is-small">الميزانية المعتمدة:</label>
								<div className="control">
									<input
										type="text"
										className="input is-small wp-sharp-input"
										value=${approvedBudget}
										onInput=${e => setApprovedBudget( e.target.value )}
										placeholder="الميزانية المتفق عليها..."
									/>
								</div>
							</div>
						</div>

						<div className="column is-6">
							<div className="field">
								<label className="label is-small">تاريخ التسليم المستهدف:</label>
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
						إلغاء
					</button>
					<button 
						className=${`button is-success wp-sharp-button has-text-weight-bold ${isApproving ? 'is-loading' : ''}`}
						onClick=${handleConfirmApprove}
						disabled=${isApproving}
						style=${{ backgroundColor: '#10b981', color: '#fff' }}
					>
						<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
						<span>تأكيد الاعتماد وبدء التنفيذ</span>
					</button>
				</footer>
			</div>
		</div>
	`;
}
