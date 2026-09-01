import { html, __, sprintf, isRtl } from '../../utils/html.js';
import { isStaffUser, isStakeholderUser, isStandardSubscriber } from '../../utils/userScope.js';
import RoleDropdown from './RoleDropdown.js';

/**
 * Members (Staff) and Stakeholders (Clients/Subscribers) Directory Tab
 */
export default function UserDirectoryTab({
	activeTab,
	users = [],
	isLoading = false,
	page = 1,
	totalPages = 1,
	setPage,
	dynamicRoleLabels,
	handleRoleChange,
	clientSubFilter = 'all',
	setClientSubFilter
}) {
	const rtl = isRtl();

	if (activeTab === 'members') {
		return html`
			<div className="wp-card p-4">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-2" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Team Members & Staff Directory', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Manage staff, specialists, and technical leads handling tasks in the CoWorkPress operations room.', 'workpress' ) }</p>
					</div>
				</div>

				${isLoading ? html`
					<div className="has-text-centered py-6">
						<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
					</div>
				` : html`
					${(() => {
						const teamUsers = users.filter(isStaffUser);
						if (teamUsers.length === 0) {
							return html`
								<div className="has-text-centered py-6 has-text-grey">
									<p className="mt-2">${ __( 'No team members registered on this page.', 'workpress' ) }</p>
								</div>
							`;
						}
						return html`
							<table className="table is-fullwidth is-hoverable wp-table mb-0">
								<thead>
									<tr>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '35%', borderBottom: '2px solid #0f172a' }}>${ __( 'Member / Specialist', 'workpress' ) }</th>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '35%', borderBottom: '2px solid #0f172a' }}>${ __( 'Email', 'workpress' ) }</th>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '30%', borderBottom: '2px solid #0f172a' }}>${ __( 'Role / Capability', 'workpress' ) }</th>
									</tr>
								</thead>
								<tbody>
									${teamUsers.map(u => {
										const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : 'author';
										return html`
											<tr key=${u.id}>
												<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													<div className="is-flex is-align-items-center">
														<figure className="image is-24x24" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}>
															<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: 0 }} />
														</figure>
														<span className="has-text-weight-bold is-size-7">${u.name}</span>
													</div>
												</td>
												<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													${u.email || '-'}
												</td>
												<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													<${RoleDropdown} 
														currentRole=${currentRole} 
														onRoleChange=${(newRole) => handleRoleChange(u.id, newRole)}
														roleLabels=${dynamicRoleLabels}
													/>
												</td>
											</tr>
										`;
									})}
								</tbody>
							</table>
						`;
					})()}

					<!-- Pagination Controls -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
						<span className="is-size-7 has-text-grey font-weight-bold">
							${ sprintf( __( 'Page %d of %d', 'workpress' ), page, totalPages ) }
						</span>
						<div className="buttons mb-0">
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.max(1, p - 1))}
								disabled=${page <= 1}
								style=${{ borderRadius: 0 }}
							>
								${ __( 'Previous', 'workpress' ) }
							</button>
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
								disabled=${page >= totalPages}
								style=${{ borderRadius: 0 }}
							>
								${ __( 'Next', 'workpress' ) }
							</button>
						</div>
					</div>
				`}
			</div>
		`;
	}

	if (activeTab === 'clients') {
		return html`
			<div className="wp-card p-4">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Stakeholders & Clients Directory', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Manage client accounts and subscribers. Upgrade any standard subscriber to a portal stakeholder.', 'workpress' ) }</p>
					</div>
					<div className="buttons mb-0">
						<a href="#/requests" className="button is-small wp-header-btn is-primary">
							<span>${ __( 'Triage Studio ↗', 'workpress' ) }</span>
						</a>
					</div>
				</div>

				<!-- Quick Filter Bar -->
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 p-2" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
					<div className="buttons has-addons mb-0">
						<button 
							className=${`button is-small ${clientSubFilter === 'all' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('all')}
							style=${{ borderRadius: 0 }}
						>
							${ sprintf( __( 'All (%d)', 'workpress' ), users.length ) }
						</button>
						<button 
							className=${`button is-small ${clientSubFilter === 'stakeholders' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('stakeholders')}
							style=${{ borderRadius: 0 }}
						>
							${ sprintf( __( 'Stakeholders (%d)', 'workpress' ), users.filter(isStakeholderUser).length ) }
						</button>
						<button 
							className=${`button is-small ${clientSubFilter === 'subscribers' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('subscribers')}
							style=${{ borderRadius: 0 }}
						>
							${ sprintf( __( 'Subscribers (%d)', 'workpress' ), users.filter(isStandardSubscriber).length ) }
						</button>
					</div>
					<span className="is-size-7 has-text-grey">
						${ sprintf( __( 'Total registered on this page: %d', 'workpress' ), users.length ) }
					</span>
				</div>

				${isLoading ? html`
					<div className="has-text-centered py-6">
						<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
					</div>
				` : html`
					${(() => {
						const displayedUsers = users.filter(u => {
							const isStakeholder = isStakeholderUser(u);
							const isSub = isStandardSubscriber(u);
							if (clientSubFilter === 'stakeholders') return isStakeholder;
							if (clientSubFilter === 'subscribers') return isSub;
							return isStakeholder || isSub;
						});

						if (displayedUsers.length === 0) {
							return html`
								<div className="has-text-centered py-6 has-text-grey">
									<p className="has-text-weight-bold mt-2">
										${clientSubFilter === 'stakeholders' 
											? __( 'No verified stakeholders on this page.', 'workpress' ) 
											: __( 'No matching users on this page.', 'workpress' )}
									</p>
									<p className="is-size-7 mt-1">
										${clientSubFilter === 'stakeholders' 
											? __( 'You can upgrade any subscriber using "Assign as Stakeholder" from the Subscribers tab.', 'workpress' ) 
											: __( 'Users appear here automatically when registered in WordPress or submitting requests.', 'workpress' )}
									</p>
								</div>
							`;
						}
						return html`
							<table className="table is-fullwidth is-hoverable wp-table mb-0">
								<thead>
									<tr>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '35%', borderBottom: '2px solid #0f172a' }}>${ __( 'Member / Stakeholder', 'workpress' ) }</th>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '25%', borderBottom: '2px solid #0f172a' }}>${ __( 'Email', 'workpress' ) }</th>
										<th style=${{ textAlign: rtl ? 'right' : 'left', width: '22%', borderBottom: '2px solid #0f172a' }}>${ __( 'Role / Capability', 'workpress' ) }</th>
										<th style=${{ textAlign: 'center', width: '18%', borderBottom: '2px solid #0f172a' }}>${ __( 'Action & Access', 'workpress' ) }</th>
									</tr>
								</thead>
								<tbody>
									${displayedUsers.map(u => {
										const isStakeholder = isStakeholderUser(u);
										const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : (isStakeholder ? 'workpress_client' : 'subscriber');
										return html`
											<tr key=${u.id}>
												<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													<div className="is-flex is-align-items-center">
														<figure className="image is-28x28" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}>
															<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: '50%' }} />
														</figure>
														<div>
															<span className="has-text-weight-bold is-size-7">${u.name}</span>
															${isStakeholder ? html`
																<span className="tag is-success is-light is-small" style=${{ [rtl ? 'marginRight' : 'marginLeft']: '0.5rem', fontSize: '0.68rem', fontWeight: 'bold' }}>
																	${ __( 'Stakeholder', 'workpress' ) }
																</span>
															` : html`
																<span className="tag is-light is-small" style=${{ [rtl ? 'marginRight' : 'marginLeft']: '0.5rem', fontSize: '0.68rem', color: '#64748b' }}>
																	${ __( 'Subscriber', 'workpress' ) }
																</span>
															`}
														</div>
													</div>
												</td>
												<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													${u.email || '-'}
												</td>
												<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
													<${RoleDropdown} 
														currentRole=${currentRole} 
														onRoleChange=${(newRole) => handleRoleChange(u.id, newRole)}
														roleLabels=${dynamicRoleLabels}
													/>
												</td>
												<td className="is-vcentered has-text-centered">
													${isStakeholder ? html`
														<a href="#/requests" className="button is-small is-light wp-sharp-button" style=${{ fontSize: '0.75rem' }} title=${ __( 'View incoming requests', 'workpress' ) }>
															<span>${ __( 'Incoming Requests ↗', 'workpress' ) }</span>
														</a>
													` : html`
														<button 
															className="button is-small is-primary is-light wp-sharp-button" 
															style=${{ fontSize: '0.75rem', fontWeight: 'bold' }} 
															onClick=${() => handleRoleChange(u.id, 'workpress_client')}
															title=${ __( 'Upgrade subscriber to stakeholder for portal access', 'workpress' ) }
														>
															<span>${ __( 'Assign as Stakeholder', 'workpress' ) }</span>
														</button>
													`}
												</td>
											</tr>
										`;
									})}
								</tbody>
							</table>
						`;
					})()}

					<!-- Pagination Controls -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
						<span className="is-size-7 has-text-grey font-weight-bold">
							${ sprintf( __( 'Page %d of %d', 'workpress' ), page, totalPages ) }
						</span>
						<div className="buttons mb-0">
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.max(1, p - 1))}
								disabled=${page <= 1}
								style=${{ borderRadius: 0 }}
							>
								${ __( 'Previous', 'workpress' ) }
							</button>
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
								disabled=${page >= totalPages}
								style=${{ borderRadius: 0 }}
							>
								${ __( 'Next', 'workpress' ) }
							</button>
						</div>
					</div>
				`}
			</div>
		`;
	}

	return null;
}
