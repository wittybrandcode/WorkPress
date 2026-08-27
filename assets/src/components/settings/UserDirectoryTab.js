import { html } from '../../utils/html.js';
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
	if (activeTab === 'members') {
		return html`
			<div className="wp-card p-4">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-2" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">دليل أعضاء الفريق والمنفذين (Specialists & Staff Directory)</h3>
						<p className="has-text-grey is-size-7">إدارة الكوادر والمشرفين الفنيين المكلفين بإنجاز المهام والمشاريع داخل غرفة عمليات CoWorkPress.</p>
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
									<p className="mt-2">لا يوجد أعضاء فريق مسجلون حالياً في هذه الصفحة.</p>
								</div>
							`;
						}
						return html`
							<table className="table is-fullwidth is-hoverable wp-table mb-0">
								<thead>
									<tr>
										<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>العضو / المنفذ</th>
										<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>البريد الإلكتروني</th>
										<th style=${{ textAlign: 'right', width: '30%', borderBottom: '2px solid #0f172a' }}>الصلاحية (الدور)</th>
									</tr>
								</thead>
								<tbody>
									${teamUsers.map(u => {
										const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : 'author';
										return html`
											<tr key=${u.id}>
												<td className="is-vcentered" style=${{ textAlign: 'right' }}>
													<div className="is-flex is-align-items-center">
														<figure className="image is-24x24 mr-2" style=${{ marginLeft: '8px' }}>
															<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: 0 }} />
														</figure>
														<span className="has-text-weight-bold is-size-7">${u.name}</span>
													</div>
												</td>
												<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: 'right' }}>
													${u.email || '-'}
												</td>
												<td className="is-vcentered" style=${{ textAlign: 'right' }}>
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

					<!-- أزرار الترقيم Pagination Controls -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
						<span className="is-size-7 has-text-grey font-weight-bold">
							الصفحة ${page} من ${totalPages}
						</span>
						<div className="buttons mb-0">
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.max(1, p - 1))}
								disabled=${page <= 1}
								style=${{ borderRadius: 0 }}
							>
								السابق
							</button>
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
								disabled=${page >= totalPages}
								style=${{ borderRadius: 0 }}
							>
								التالي
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
						<h3 className="title is-5 mb-1 has-text-weight-bold">سجل المستفيدين وأصحاب الطلبات (Stakeholders & Subscribers Directory)</h3>
						<p className="has-text-grey is-size-7">إدارة حسابات المستفيدين الموسومين وأعضاء الموقع العاديين. يمكن ترقية أي مشترك عادي ليصبح مشتركاً مستفيداً يملك صلاحية البوابة.</p>
					</div>
					<div className="buttons mb-0">
						<a href="#/requests" className="button is-small wp-header-btn is-primary">
							<span>استوديو فرز الطلبات ↗</span>
						</a>
					</div>
				</div>

				<!-- شريط الفرز والتقسيم السريع -->
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 p-2" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
					<div className="buttons has-addons mb-0">
						<button 
							className=${`button is-small ${clientSubFilter === 'all' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('all')}
							style=${{ borderRadius: 0 }}
						>
							الكل (${users.length})
						</button>
						<button 
							className=${`button is-small ${clientSubFilter === 'stakeholders' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('stakeholders')}
							style=${{ borderRadius: 0 }}
						>
							المستفيدون (${users.filter(isStakeholderUser).length})
						</button>
						<button 
							className=${`button is-small ${clientSubFilter === 'subscribers' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
							onClick=${() => setClientSubFilter('subscribers')}
							style=${{ borderRadius: 0 }}
						>
							المشتركون (${users.filter(isStandardSubscriber).length})
						</button>
					</div>
					<span className="is-size-7 has-text-grey">
						إجمالي المسجلين في هذه الصفحة: <strong>${users.length}</strong>
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
											? 'لا يوجد مستفيدون معتمدون حالياً في هذه الصفحة.' 
											: 'لا يوجد أعضاء مطابقون في هذه الصفحة.'}
									</p>
									<p className="is-size-7 mt-1">
										${clientSubFilter === 'stakeholders' 
											? 'يمكنك ترقية أي عضو مشترك إلى مستفيد باستخدام زر «تعيين كمستفيد » من تبويب (المشتركون).' 
											: 'يتم إضافة الأعضاء تلقائياً عند تسجيلهم في ووردبريس أو تقديم طلبات جديدة.'}
									</p>
								</div>
							`;
						}
						return html`
							<table className="table is-fullwidth is-hoverable wp-table mb-0">
								<thead>
									<tr>
										<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>العضو / المستفيد</th>
										<th style=${{ textAlign: 'right', width: '25%', borderBottom: '2px solid #0f172a' }}>البريد الإلكتروني</th>
										<th style=${{ textAlign: 'right', width: '22%', borderBottom: '2px solid #0f172a' }}>الصلاحية (الدور)</th>
										<th style=${{ textAlign: 'center', width: '18%', borderBottom: '2px solid #0f172a' }}>الإجراء والوصول</th>
									</tr>
								</thead>
								<tbody>
									${displayedUsers.map(u => {
										const isStakeholder = isStakeholderUser(u);
										const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : (isStakeholder ? 'workpress_client' : 'subscriber');
										return html`
											<tr key=${u.id}>
												<td className="is-vcentered" style=${{ textAlign: 'right' }}>
													<div className="is-flex is-align-items-center">
														<figure className="image is-28x28 mr-2" style=${{ marginLeft: '8px' }}>
															<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: '50%' }} />
														</figure>
														<div>
															<span className="has-text-weight-bold is-size-7">${u.name}</span>
															${isStakeholder ? html`
																<span className="tag is-success is-light is-small ml-2" style=${{ fontSize: '0.68rem', fontWeight: 'bold' }}>
																	مستفيد
																</span>
															` : html`
																<span className="tag is-light is-small ml-2" style=${{ fontSize: '0.68rem', color: '#64748b' }}>
																	مشترك
																</span>
															`}
														</div>
													</div>
												</td>
												<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: 'right' }}>
													${u.email || '-'}
												</td>
												<td className="is-vcentered" style=${{ textAlign: 'right' }}>
													<${RoleDropdown} 
														currentRole=${currentRole} 
														onRoleChange=${(newRole) => handleRoleChange(u.id, newRole)}
														roleLabels=${dynamicRoleLabels}
													/>
												</td>
												<td className="is-vcentered has-text-centered">
													${isStakeholder ? html`
														<a href="#/requests" className="button is-small is-light wp-sharp-button" style=${{ fontSize: '0.75rem' }} title="استعراض وارد الطلبات">
															<span>وارد الطلبات ↗</span>
														</a>
													` : html`
														<button 
															className="button is-small is-primary is-light wp-sharp-button" 
															style=${{ fontSize: '0.75rem', fontWeight: 'bold' }} 
															onClick=${() => handleRoleChange(u.id, 'workpress_client')}
															title="ترقية العضو إلى مستفيد لتمكينه من دخول البوابة وطلب مشاريع"
														>
															<span>تعيين كمستفيد </span>
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

					<!-- أزرار الترقيم Pagination Controls -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
						<span className="is-size-7 has-text-grey font-weight-bold">
							الصفحة ${page} من ${totalPages}
						</span>
						<div className="buttons mb-0">
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.max(1, p - 1))}
								disabled=${page <= 1}
								style=${{ borderRadius: 0 }}
							>
								السابق
							</button>
							<button 
								className="button is-small wp-header-btn" 
								onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
								disabled=${page >= totalPages}
								style=${{ borderRadius: 0 }}
							>
								التالي
							</button>
						</div>
					</div>
				`}
			</div>
		`;
	}

	return null;
}
