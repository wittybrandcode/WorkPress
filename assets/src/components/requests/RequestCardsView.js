import { html, __, sprintf, isRtl } from '../../utils/html.js';

/**
 * Request Detailed Cards Matrix View with Specifications Vault Summary
 */
export default function RequestCardsView({
	filteredRequests = [],
	handleOpenApproveModal,
	handleOpenReviewModal,
	handleOpenRejectModal
}) {
	const rtl = isRtl();

	return html`
		<div className="columns is-multiline">
			${ filteredRequests.map( p => {
				const isPending = p.status === 'pending' || p.status === 'draft';
				const isUnderReview = p.status === 'under_review';
				const isRejected = p.status === 'rejected';
				const isCompleted = p.status === 'completed';
				const specs = p.request_specs || {};
				const specsEntries = Object.entries( specs );

				const cardClass = isPending 
					? 'wp-request-card is-pending' 
					: (isUnderReview 
						? 'wp-request-card is-review' 
						: (isRejected 
							? 'wp-request-card is-rejected' 
							: 'wp-request-card is-active'));

				return html`
					<div key=${p.id} className="column is-12 mb-3">
						<div className=${`box p-0 ${cardClass}`}>
							<!-- Card Top Bar: Client Info & Status Badge -->
							<div className="wp-request-card-header" style=${{ backgroundColor: isPending ? '#fffbeb' : (isUnderReview ? '#f0f9ff' : (isRejected ? '#fef2f2' : '#f8fafc')) }}>
								<div className="is-flex is-align-items-center" style=${{ gap: '12px' }}>
									${ p.client && p.client.avatar ? html`
										<figure className="image is-40x40 m-0">
											<img src=${p.client.avatar} alt=${p.client.display_name} className="is-rounded" style=${{ border: '2px solid #fff' }} />
										</figure>
									` : html`
										<div className="is-flex is-align-items-center is-justify-content-center has-background-primary-light" style=${{ width: '40px', height: '40px', borderRadius: '50%', color: '#6366f1', fontWeight: '800' }}>
											<span className="icon"><i className="dashicons dashicons-admin-users"></i></span>
										</div>
									`}

									<div>
										<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
											<span className="has-text-weight-bold has-text-dark" style=${{ fontSize: '0.98rem' }}>
												${ p.client ? p.client.display_name : __( 'Client', 'workpress' ) }
											</span>
											${ p.client && p.client.email ? html`
												<span className="is-size-7 has-text-grey">(${p.client.email})</span>
											` : null }
										</div>
										<span className="is-size-7 has-text-grey">
											${ __( 'Form Template:', 'workpress' ) } <strong>${p.request_form_id || __( 'Default Form', 'workpress' )}</strong>
										</span>
									</div>
								</div>

								<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
									${ isPending ? html`
										<span className="tag is-warning has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
											${ __( 'Pending Triage', 'workpress' ) }
										</span>
									` : ( isUnderReview ? html`
										<span className="tag is-info has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
											${ __( 'Under Review', 'workpress' ) }
										</span>
									` : ( isRejected ? html`
										<span className="tag is-danger has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
											${ __( 'Rejected', 'workpress' ) }
										</span>
									` : ( isCompleted ? html`
										<span className="tag is-success has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem' }}>
											${ __( 'Completed', 'workpress' ) }
										</span>
									` : html`
										<span className="tag is-success is-light has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', border: '1px solid #a7f3d0' }}>
											${ __( 'Approved / In Progress', 'workpress' ) }
										</span>
									` ) ) ) }
								</div>
							</div>

							<!-- Card Content Body -->
							<div className="p-5">
								${ isUnderReview && p.review_notes ? html`
									<div className="notification is-info is-light p-3 mb-4" style=${{ borderRadius: 0, fontSize: '0.88rem', [rtl ? 'borderRight' : 'borderLeft']: '4px solid #0284c7' }}>
										<strong>${ __( 'Review Notes (Visible to client in portal):', 'workpress' ) }</strong>
										<p className="mt-1" style=${{ whiteSpace: 'pre-wrap' }}>${p.review_notes}</p>
									</div>
								` : null }

								${ isRejected && p.rejection_reason ? html`
									<div className="notification is-danger is-light p-3 mb-4" style=${{ borderRadius: 0, fontSize: '0.88rem', [rtl ? 'borderRight' : 'borderLeft']: '4px solid #ef4444' }}>
										<strong>${ __( 'Rejection Reason (Visible to client in portal):', 'workpress' ) }</strong>
										<p className="mt-1" style=${{ whiteSpace: 'pre-wrap' }}>${p.rejection_reason}</p>
									</div>
								` : null }

								<div className="columns">
									<!-- Column 1: Title & Scope -->
									<div className="column is-7">
										<div className="is-flex is-align-items-center mb-2" style=${{ gap: '8px' }}>
											<a href=${`#/projects/${p.id}`} className="title is-4 mb-0 has-text-dark" style=${{ textDecoration: 'none' }}>
												${p.name}
											</a>
											<span className="tag is-light is-small" style=${{ fontWeight: '700' }}>${p.prefix}</span>
										</div>

										<div className="content has-text-grey-dark mb-4" style=${{ fontSize: '0.92rem', lineHeight: '1.6' }}>
											${ p.description || __( 'No additional details provided.', 'workpress' ) }
										</div>

										<!-- Key Project Badges -->
										<div className="is-flex is-flex-wrap-wrap" style=${{ gap: '1rem' }}>
											${ p.requested_budget ? html`
												<div className="is-flex is-align-items-center" style=${{ gap: '4px', fontSize: '0.85rem' }}>
													<span className="has-text-grey">${ __( 'Proposed Budget:', 'workpress' ) }</span>
													<strong className="has-text-success">${p.requested_budget}</strong>
												</div>
											` : null }

											${ ( p.requested_due_date || p.due_at ) ? html`
												<div className="is-flex is-align-items-center" style=${{ gap: '4px', fontSize: '0.85rem' }}>
													<span className="has-text-grey">${ __( 'Deadline:', 'workpress' ) }</span>
													<strong className="has-text-warning-dark">${( p.requested_due_date || p.due_at ).substring( 0, 10 )}</strong>
												</div>
											` : null }
										</div>
									</div>

									<!-- Column 2: Client Specifications Vault Summary -->
									<div className="column is-5">
										<div className="wp-request-specs-box">
											<div className="is-flex is-justify-content-space-between is-align-items-center mb-2 pb-1" style=${{ borderBottom: '1px solid #e2e8f0' }}>
												<span className="is-size-7 has-text-weight-bold has-text-primary is-flex is-align-items-center" style=${{ gap: '4px' }}>
													<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
													<span>${ sprintf( __( 'Received Specs (%d)', 'workpress' ), specsEntries.length ) }</span>
												</span>
												<span className="tag is-white is-small has-text-grey">Client Specs</span>
											</div>

											${ specsEntries.length === 0 ? html`
												<p className="is-size-7 has-text-grey-light">${ __( 'No detailed specifications submitted.', 'workpress' ) }</p>
											` : html`
												<div className="wp-request-specs-list">
													${ specsEntries.map( ([sKey, sVal]) => {
														let displayVal = sVal;
														if ( Array.isArray( sVal ) ) {
															displayVal = sVal.map( (v, vi) => {
																if ( typeof v === 'object' && v !== null && v.url ) {
																	return html`
																		<a key=${vi} href=${v.url} target="_blank" download className="button is-small is-light p-1 ml-1" style=${{ height: '22px', fontSize: '0.75rem' }}>
																			<span className="icon is-small"><i className="dashicons dashicons-paperclip"></i></span>
																			<span>${v.name || __( 'File', 'workpress' )}</span>
																		</a>
																	`;
																}
																return html`<span key=${vi} className="tag is-info is-light is-small ml-1">${v}</span>`;
															} );
														}

														return html`
															<div key=${sKey} className="is-flex is-justify-content-space-between is-align-items-center is-size-7" style=${{ borderBottom: '1px dashed #f1f5f9', paddingBottom: '3px' }}>
																<span className="has-text-grey">${sKey}:</span>
																<strong className="has-text-dark">${displayVal || '—'}</strong>
															</div>
														`;
													} ) }
												</div>
											` }
										</div>
									</div>
								</div>
							</div>

							<!-- Card Actions Footer -->
							<div className="p-4 is-flex is-justify-content-space-between is-align-items-center" style=${{ borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
								<div>
									<a href=${`#/projects/${p.id}`} className="button is-small wp-sharp-button is-light" style=${{ fontWeight: '700' }}>
										<span className="icon"><i className="dashicons dashicons-portfolio"></i></span>
										<span>${ __( 'Open Workspace', 'workpress' ) }</span>
									</a>
								</div>

								<div className="buttons mb-0" style=${{ gap: '8px' }}>
									${ ( isPending || isUnderReview || isRejected ) ? html`
										<button
											className="button is-small is-success wp-sharp-button has-text-weight-bold"
											onClick=${() => handleOpenApproveModal( p )}
											style=${{ backgroundColor: '#10b981', color: '#ffffff', boxShadow: '0 2px 8px rgba(16,185,129,0.2)' }}
											title=${ __( 'Approve & initialize project workspace', 'workpress' ) }
										>
											<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
											<span>${ __( 'Approve', 'workpress' ) }</span>
										</button>

										${ ! isUnderReview ? html`
											<button
												className="button is-small is-info is-light wp-sharp-button has-text-weight-bold"
												onClick=${() => handleOpenReviewModal( p )}
												style=${{ color: '#0369a1', borderColor: '#bae6fd' }}
												title=${ __( 'Mark as under review with note to client', 'workpress' ) }
											>
												<span className="icon"><i className="dashicons dashicons-search"></i></span>
												<span>${ __( 'Under Review', 'workpress' ) }</span>
											</button>
										` : null }

										${ ! isRejected ? html`
											<button
												className="button is-small is-danger is-light wp-sharp-button has-text-weight-bold"
												onClick=${() => handleOpenRejectModal( p )}
												style=${{ color: '#dc2626', borderColor: '#fca5a5' }}
												title=${ __( 'Reject request with explanation to client', 'workpress' ) }
											>
												<span className="icon"><i className="dashicons dashicons-dismiss"></i></span>
												<span>${ __( 'Reject', 'workpress' ) }</span>
											</button>
										` : null }
									` : html`
										<a href=${`#/projects/${p.id}`} className="button is-small is-primary is-outlined wp-sharp-button" style=${{ fontWeight: '700' }}>
											<span className="icon"><i className="dashicons dashicons-admin-tools"></i></span>
											<span>${ __( 'Tasks', 'workpress' ) }</span>
										</a>
									` }
								</div>
							</div>
						</div>
					</div>
				`;
			} ) }
		</div>
	`;
}
