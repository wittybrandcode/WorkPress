import { html, __ } from '../../utils/html.js';

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
						<th>${ __( 'Prefix', 'workpress' ) }</th>
						<th>${ __( 'Request / Project Name', 'workpress' ) }</th>
						<th>${ __( 'Client', 'workpress' ) }</th>
						<th>${ __( 'Form Template', 'workpress' ) }</th>
						<th>${ __( 'Budget', 'workpress' ) }</th>
						<th>${ __( 'Delivery Date', 'workpress' ) }</th>
						<th>${ __( 'Status', 'workpress' ) }</th>
						<th className="has-text-centered">${ __( 'Actions', 'workpress' ) }</th>
					</tr>
				</thead>
				<tbody>
					${ filteredRequests.map( p => {
						const isPending = p.status === 'pending' || p.status === 'draft';
						const isUnderReview = p.status === 'under_review';
						const isRejected = p.status === 'rejected';

						let statusLabel = __( 'Completed', 'workpress' );
						if ( isPending ) statusLabel = __( 'Pending', 'workpress' );
						else if ( isUnderReview ) statusLabel = __( 'Review', 'workpress' );
						else if ( isRejected ) statusLabel = __( 'Rejected', 'workpress' );
						else if ( p.status === 'active' ) statusLabel = __( 'Approved', 'workpress' );

						return html`
							<tr key=${p.id}>
								<td><strong>${p.prefix}</strong></td>
								<td>
									<a href=${`#/projects/${p.id}`} className="has-text-dark has-text-weight-bold">${p.name}</a>
								</td>
								<td>${p.client ? p.client.display_name : '—'}</td>
								<td><span className="tag is-light is-small">${p.request_form_id || __( 'Default', 'workpress' )}</span></td>
								<td><strong className="has-text-success">${p.requested_budget || '—'}</strong></td>
								<td>${p.requested_due_date ? p.requested_due_date.substring( 0, 10 ) : '—'}</td>
								<td>
									<span className=${`tag is-small ${isPending ? 'is-warning' : (isUnderReview ? 'is-info' : (isRejected ? 'is-danger' : (p.status === 'active' ? 'is-success' : 'is-light')))}`}>
										${ statusLabel }
									</span>
								</td>
								<td className="has-text-centered">
									<div className="buttons is-centered are-small mb-0" style=${{ gap: '4px' }}>
										${ ( isPending || isUnderReview || isRejected ) ? html`
											<button className="button is-small is-success is-outlined wp-sharp-button" onClick=${() => handleOpenApproveModal( p )} title=${ __( 'Approve', 'workpress' ) }>
												<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
											</button>
											${ ! isUnderReview ? html`
												<button className="button is-small is-info is-light wp-sharp-button" onClick=${() => handleOpenReviewModal( p )} title=${ __( 'Under Review', 'workpress' ) }>
													<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
												</button>
											` : null }
											${ ! isRejected ? html`
												<button className="button is-small is-danger is-light wp-sharp-button" onClick=${() => handleOpenRejectModal( p )} title=${ __( 'Reject', 'workpress' ) }>
													<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
												</button>
											` : null }
										` : html`
											<a href=${`#/projects/${p.id}`} className="button is-small is-light wp-sharp-button" title=${ __( 'Open Workspace', 'workpress' ) }>
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
