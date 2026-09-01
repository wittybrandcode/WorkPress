import { html, __, sprintf } from '../../utils/html.js';

/**
 * Triage Kanban Board Component (4 Status Columns)
 */
export default function RequestTriageBoard({
	pendingRequests = [],
	underReviewRequests = [],
	activeRequests = [],
	rejectedRequests = [],
	completedRequests = [],
	handleOpenApproveModal,
	handleOpenReviewModal,
	handleOpenRejectModal,
	handleQuickStateChange
}) {
	return html`
		<div className="columns is-variable is-3 mb-5" style=${{ minHeight: '600px' }}>
			<!-- Column 1: Incoming / Pending -->
			<div className="column is-3">
				<div className="wp-request-kanban-col is-pending">
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #fcd34d' }}>
						<h3 className="title is-6 mb-0 has-text-warning-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span className="icon is-small"><i className="dashicons dashicons-clock"></i></span>
							<span>${ sprintf( __( 'Inbox / Pending Triage (%d)', 'workpress' ), pendingRequests.length ) }</span>
						</h3>
					</div>

					<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						${ pendingRequests.map( p => html`
							<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
								<span className="tag is-warning is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
								<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
									<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
								</h4>
								<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : __( 'Client', 'workpress' )}</p>
								${p.requested_budget ? html`<p className="is-size-7 has-text-success has-text-weight-bold mb-2">${p.requested_budget}</p>` : null}
								
								<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9', gap: '4px' }}>
									<button 
										className="button is-small is-success wp-sharp-button has-text-weight-bold"
										style=${{ flex: 1 }}
										onClick=${() => handleOpenApproveModal( p )}
									>
										<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
										<span>${ __( 'Approve', 'workpress' ) }</span>
									</button>
									<button 
										className="button is-small is-info is-light wp-sharp-button"
										onClick=${() => handleOpenReviewModal( p )}
										title=${ __( 'Under Review', 'workpress' ) }
									>
										<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
									</button>
									<button 
										className="button is-small is-danger is-light wp-sharp-button"
										onClick=${() => handleOpenRejectModal( p )}
										title=${ __( 'Reject', 'workpress' ) }
									>
										<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
									</button>
								</div>
							</div>
						` ) }
						${ pendingRequests.length === 0 && html`
							<p className="is-size-7 has-text-grey has-text-centered py-4">${ __( 'No pending requests', 'workpress' ) }</p>
						` }
					</div>
				</div>
			</div>

			<!-- Column 2: Under Review -->
			<div className="column is-3">
				<div className="wp-request-kanban-col is-review">
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #7dd3fc' }}>
						<h3 className="title is-6 mb-0 has-text-info-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
							<span>${ sprintf( __( 'Under Review (%d)', 'workpress' ), underReviewRequests.length ) }</span>
						</h3>
					</div>

					<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						${ underReviewRequests.map( p => html`
							<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
								<span className="tag is-info is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
								<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
									<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
								</h4>
								<p className="is-size-7 has-text-grey mb-1">${p.client ? p.client.display_name : __( 'Client', 'workpress' )}</p>
								${ p.review_notes ? html`
									<p className="is-size-7 has-text-grey-dark mb-2" style=${{ backgroundColor: '#f0f9ff', padding: '4px 6px', borderRadius: '4px' }}>
										${p.review_notes}
									</p>
								` : null }
								
								<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9', gap: '4px' }}>
									<button 
										className="button is-small is-success is-fullwidth wp-sharp-button has-text-weight-bold"
										onClick=${() => handleOpenApproveModal( p )}
									>
										<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
										<span>${ __( 'Approve', 'workpress' ) }</span>
									</button>
									<button 
										className="button is-small is-danger is-light wp-sharp-button"
										onClick=${() => handleOpenRejectModal( p )}
										title=${ __( 'Reject', 'workpress' ) }
									>
										<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
									</button>
								</div>
							</div>
						` ) }
						${ underReviewRequests.length === 0 && html`
							<p className="is-size-7 has-text-grey has-text-centered py-4">${ __( 'No requests under review', 'workpress' ) }</p>
						` }
					</div>
				</div>
			</div>

			<!-- Column 3: Approved & Active -->
			<div className="column is-3">
				<div className="wp-request-kanban-col is-active">
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #6ee7b7' }}>
						<h3 className="title is-6 mb-0 has-text-success-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span className="icon is-small"><i className="dashicons dashicons-yes"></i></span>
							<span>${ sprintf( __( 'Approved / Active (%d)', 'workpress' ), activeRequests.length ) }</span>
						</h3>
					</div>

					<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						${ activeRequests.map( p => html`
							<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
								<span className="tag is-success is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
								<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
									<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
								</h4>
								<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : __( 'Client', 'workpress' )}</p>
								
								<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
									<a href=${`#/projects/${p.id}`} className="button is-small is-primary is-outlined wp-sharp-button" style=${{ width: '48%' }}>
										<span>${ __( 'Workspace', 'workpress' ) }</span>
									</a>
									<button 
										className="button is-small is-info is-light wp-sharp-button" 
										style=${{ width: '48%' }}
										onClick=${() => handleQuickStateChange( p.id, 'completed' )}
									>
										<span>${ __( 'Complete', 'workpress' ) }</span>
									</button>
								</div>
							</div>
						` ) }
						${ activeRequests.length === 0 && html`
							<p className="is-size-7 has-text-grey has-text-centered py-4">${ __( 'No active requests', 'workpress' ) }</p>
						` }
					</div>
				</div>
			</div>

			<!-- Column 4: Rejected / Completed -->
			<div className="column is-3">
				<div className="wp-request-kanban-col is-archive">
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #94a3b8' }}>
						<h3 className="title is-6 mb-0 has-text-grey-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span className="icon is-small"><i className="dashicons dashicons-portfolio"></i></span>
							<span>${ sprintf( __( 'Rejected / Completed (%d)', 'workpress' ), rejectedRequests.length + completedRequests.length ) }</span>
						</h3>
					</div>

					<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
						${ rejectedRequests.map( p => html`
							<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #fecaca' }}>
								<span className="tag is-danger is-light is-small has-text-weight-bold mb-1">${p.prefix} (${ __( 'Rejected', 'workpress' ) })</span>
								<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
									<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
								</h4>
								<p className="is-size-7 has-text-grey mb-1">${p.client ? p.client.display_name : __( 'Client', 'workpress' )}</p>
								${ p.rejection_reason ? html`
									<p className="is-size-7 has-text-danger mb-2" style=${{ backgroundColor: '#fef2f2', padding: '4px 6px', borderRadius: '4px' }}>
										${p.rejection_reason}
									</p>
								` : null }
								<div className="pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
									<button 
										className="button is-small is-light is-fullwidth wp-sharp-button"
										onClick=${() => handleOpenReviewModal( p )}
									>
										<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
										<span>${ __( 'Re-evaluate', 'workpress' ) }</span>
									</button>
								</div>
							</div>
						` ) }

						${ completedRequests.map( p => html`
							<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
								<span className="tag is-success is-light is-small has-text-weight-bold mb-1">${p.prefix} (${ __( 'Completed', 'workpress' ) })</span>
								<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
									<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
								</h4>
								<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : __( 'Client', 'workpress' )}</p>
								<div className="pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
									<a href=${`#/projects/${p.id}`} className="button is-small is-light is-fullwidth wp-sharp-button">
										<span className="icon is-small"><i className="dashicons dashicons-archive"></i></span>
										<span>${ __( 'Review Deliverables', 'workpress' ) }</span>
									</a>
								</div>
							</div>
						` ) }

						${ rejectedRequests.length === 0 && completedRequests.length === 0 && html`
							<p className="is-size-7 has-text-grey has-text-centered py-4">${ __( 'No requests in this column', 'workpress' ) }</p>
						` }
					</div>
				</div>
			</div>
		</div>
	`;
}
