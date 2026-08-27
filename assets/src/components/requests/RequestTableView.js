import { html } from '../../utils/html.js';

/**
 * Triage Quick Table View Component
 */
export default function RequestTableView({
	filteredRequests = [],
	handleOpenApproveModal,
	handleOpenReviewModal,
	handleOpenRejectModal
}) {
	return html`
		<div className="box wp-card p-0 mb-5" style=${{ backgroundColor: '#fff' }}>
			<table className="table is-fullwidth is-hoverable mb-0" style=${{ fontSize: '0.88rem' }}>
				<thead>
					<tr style=${{ backgroundColor: '#f8fafc' }}>
						<th>الرمز</th>
						<th>اسم الطلب / المشروع</th>
						<th>العميل</th>
						<th>قالب النموذج</th>
						<th>الميزانية</th>
						<th>تاريخ التسليم</th>
						<th>الحالة</th>
						<th className="has-text-centered">الإجراءات</th>
					</tr>
				</thead>
				<tbody>
					${ filteredRequests.map( p => {
						const isPending = p.status === 'pending' || p.status === 'draft';
						const isUnderReview = p.status === 'under_review';
						const isRejected = p.status === 'rejected';

						return html`
							<tr key=${p.id}>
								<td><strong>${p.prefix}</strong></td>
								<td>
									<a href=${`#/projects/${p.id}`} className="has-text-dark has-text-weight-bold">${p.name}</a>
								</td>
								<td>${p.client ? p.client.display_name : '—'}</td>
								<td><span className="tag is-light is-small">${p.request_form_id || 'قياسي'}</span></td>
								<td><strong className="has-text-success">${p.requested_budget || '—'}</strong></td>
								<td>${p.requested_due_date ? p.requested_due_date.substring( 0, 10 ) : '—'}</td>
								<td>
									<span className=${`tag is-small ${isPending ? 'is-warning' : (isUnderReview ? 'is-info' : (isRejected ? 'is-danger' : (p.status === 'active' ? 'is-success' : 'is-light')))}`}>
										${isPending ? 'وارد' : (isUnderReview ? 'دراسة' : (isRejected ? 'مرفوض' : (p.status === 'active' ? 'معتمد' : 'مكتمل')))}
									</span>
								</td>
								<td className="has-text-centered">
									<div className="buttons is-centered are-small mb-0" style=${{ gap: '4px' }}>
										${ ( isPending || isUnderReview || isRejected ) ? html`
											<button className="button is-small is-success is-outlined wp-sharp-button" onClick=${() => handleOpenApproveModal( p )} title="اعتماد">
												<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
											</button>
											${ ! isUnderReview ? html`
												<button className="button is-small is-info is-light wp-sharp-button" onClick=${() => handleOpenReviewModal( p )} title="قيد الدراسة">
													<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
												</button>
											` : null }
											${ ! isRejected ? html`
												<button className="button is-small is-danger is-light wp-sharp-button" onClick=${() => handleOpenRejectModal( p )} title="رفض">
													<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
												</button>
											` : null }
										` : html`
											<a href=${`#/projects/${p.id}`} className="button is-small is-light wp-sharp-button" title="عرض">
												<span className="icon is-small"><i className="dashicons dashicons-visibility"></i></span>
											</a>
										` }
									</div>
								</td>
							</tr>
						`;
					} ) }
				</tbody>
			</table>
		</div>
	`;
}
