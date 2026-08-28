import { html } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * Super Admin & Executive Command Perspective View
 */
export default function AdminPerspectiveView({
	totalProjectsCount = 0,
	activeProjectsCount = 0,
	completedProjectsCount = 0,
	globalProgress = 0,
	completedTasksCount = 0,
	totalTasksCount = 0,
	knowledge = [],
	totalPendingTrash = 0,
	pendingTrashTasks = [],
	unassignedLeadProjects = [],
	projects = [],
	filteredProjects = [],
	projectFilter = 'all',
	setProjectFilter,
	handleRestoreItem,
	handleDeleteItem,
	setSelectedProject,
	setIsProjectModalOpen,
	setMembersProject,
	setIsMembersModalOpen,
	setReportModalProject
}) {
	return html`
		<div className="admin-perspective-view">
			<!-- Executive Top KPI Metrics Bar -->
			<div className="columns mb-5">
				<div className="column is-3">
					<div 
						className="box wp-card wp-dashboard-kpi-card"
						onClick=${ () => { sound.play( 'click' ); window.location.hash = '#/projects'; } }
						title="انتقال إلى صفحة المشاريع"
					>
						<div>
							<p className="heading has-text-grey mb-1">المشاريع الكلية</p>
							<p className="title is-4 m-0 has-text-dark">${ totalProjectsCount } <span className="is-size-7 has-text-grey">(${ activeProjectsCount } نشط | ${ completedProjectsCount } مكتمل)</span></p>
						</div>
						<span className="icon is-large has-text-link"><i className="dashicons dashicons-portfolio is-size-3"></i></span>
					</div>
				</div>
				<div className="column is-3">
					<div 
						className="box wp-card wp-dashboard-kpi-card"
						onClick=${ () => { sound.play( 'click' ); window.location.hash = '#/kanban'; } }
						title="انتقال إلى لوحة الكانبان"
					>
						<div>
							<p className="heading has-text-grey mb-1">نسبة الإنجاز العامة</p>
							<p className="title is-4 m-0 has-text-info">${ globalProgress }% <span className="is-size-7 has-text-grey">(${ completedTasksCount }/${ totalTasksCount } مهمة)</span></p>
						</div>
						<span className="icon is-large has-text-info"><i className="dashicons dashicons-chart-pie is-size-3"></i></span>
					</div>
				</div>
				<div className="column is-3">
					<div 
						className="box wp-card wp-dashboard-kpi-card"
						onClick=${ () => { sound.play( 'click' ); window.location.hash = '#/knowledge'; } }
						title="انتقال إلى قاعدة المعرفة المعتمدة"
					>
						<div>
							<p className="heading has-text-grey mb-1">رصيد المعرفة المعتمدة</p>
							<p className="title is-4 m-0 has-text-success">${ knowledge.length } <span className="is-size-7 has-text-grey">حل موثق</span></p>
						</div>
						<span className="icon is-large has-text-success"><i className="dashicons dashicons-awards is-size-3"></i></span>
					</div>
				</div>
				<div className="column is-3">
					<div 
						className=${ `box wp-card wp-dashboard-kpi-card ${ totalPendingTrash > 0 ? 'has-background-danger-light' : '' }` }
						onClick=${ () => { sound.play( 'click' ); window.location.hash = '#/settings'; } }
						title="انتقال إلى إدارة المحذوفات والإعدادات"
					>
						<div>
							<p className="heading has-text-grey mb-1">طلبات الحذف العالقة</p>
							<p className=${ `title is-4 m-0 ${ totalPendingTrash > 0 ? 'has-text-danger has-text-weight-bold' : 'has-text-grey' }` }>
								${ totalPendingTrash } <span className="is-size-7">طلب معلق</span>
							</p>
						</div>
						<span className=${ `icon is-large ${ totalPendingTrash > 0 ? 'has-text-danger' : 'has-text-grey-light' }` }>
							<i className="dashicons dashicons-trash is-size-3"></i>
						</span>
					</div>
				</div>
			</div>

			<!-- Urgent Action Center (Pending Trash & Unassigned Leads) -->
			${ ( totalPendingTrash > 0 || unassignedLeadProjects.length > 0 ) && html`
				<div className="box wp-card p-0 mb-5 wp-dashboard-urgent-box">
					<div className="p-3 has-background-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
						<h3 className="title is-6 mb-0 has-text-danger is-flex is-align-items-center">
							<span className="icon ml-1"><i className="dashicons dashicons-warning"></i></span>
							<span>صندوق التدخلات والقرارات الإدارية العليا العاجلة</span>
						</h3>
						<span className="tag is-danger is-light has-text-weight-bold" style=${{ borderRadius: 0 }}>يتطلب قرارك</span>
					</div>
					<div className="p-4">
						<div className="columns is-multiline">
							<!-- Pending Trash Tasks/Projects/Contribs -->
							${ pendingTrashTasks.length > 0 && html`
								<div className="column is-12">
									<h4 className="title is-7 mb-2 has-text-grey">مهام بانتظار الموافقة على الحذف:</h4>
									${ pendingTrashTasks.map( t => html`
										<div key=${ t.id } className="p-3 mb-2 wp-border is-flex is-justify-content-space-between is-align-items-center has-background-white">
											<div>
												<strong>${ t.title }</strong>
												<span className="is-size-7 has-text-grey mr-2">(المشروع: ${ t.project_name || 'عام' })</span>
												<p className="is-size-7 has-text-danger mt-1">السبب: ${ t.trash_reason || 'غير محدد' }</p>
											</div>
											<div className="buttons are-small mb-0">
												<button className="button is-white wp-border" onClick=${ () => handleRestoreItem( 'task', t.id ) }>رفض واستعادة</button>
												<button className="button is-danger" onClick=${ () => handleDeleteItem( 'task', t.id ) }>موافقة وحذف</button>
											</div>
										</div>
									` ) }
								</div>
							` }

							<!-- Projects without Lead -->
							${ unassignedLeadProjects.length > 0 && html`
								<div className="column is-12">
									<h4 className="title is-7 mb-2 has-text-grey">مشاريع جديدة لم يُعين لها قائد مشروع:</h4>
									<div className="columns is-multiline">
										${ unassignedLeadProjects.map( p => html`
											<div key=${ p.id } className="column is-6">
												<div className="p-3 wp-border is-flex is-justify-content-space-between is-align-items-center has-background-white">
													<div>
														<strong>${ p.name }</strong>
														<span className="tag is-warning is-light is-small ml-2" style=${{ borderRadius: 0 }}>بلا قائد</span>
													</div>
													<button 
														className="button is-small is-primary wp-sharp-button"
														onClick=${ () => { setMembersProject( p ); setIsMembersModalOpen( true ); } }
													>
														<span className="icon"><i className="dashicons dashicons-businessman"></i></span>
														<span>تعيين قائد</span>
													</button>
												</div>
											</div>
										` ) }
									</div>
								</div>
							` }
						</div>
					</div>
				</div>
			` }

			<!-- All Projects Master Radar -->
			<div className="box wp-card p-0 mb-5 wp-border">
				<div className="p-3 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom has-background-light">
					<div className="is-flex is-align-items-center">
						<h3 className="title is-6 mb-0 ml-3 has-text-dark has-text-weight-bold">رادار كافة المشاريع (All Projects Radar)</h3>
						<div className="buttons are-small mb-0">
							<button className=${ `button wp-sharp-button ${ projectFilter === 'all' ? 'is-dark' : 'is-white wp-border' }` } onClick=${ () => setProjectFilter('all') }>الكل (${ projects.length })</button>
							<button className=${ `button wp-sharp-button ${ projectFilter === 'active' ? 'is-info' : 'is-white wp-border' }` } onClick=${ () => setProjectFilter('active') }>النشطة (${ activeProjectsCount })</button>
							<button className=${ `button wp-sharp-button ${ projectFilter === 'completed' ? 'is-success' : 'is-white wp-border' }` } onClick=${ () => setProjectFilter('completed') }>المكتملة (${ completedProjectsCount })</button>
						</div>
					</div>
					<button className="button is-primary is-small wp-sharp-button" onClick=${ () => { setSelectedProject(null); setIsProjectModalOpen(true); } }>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>مشروع جديد</span>
					</button>
				</div>

				<div className="p-4">
					<div className="columns is-multiline">
						${ filteredProjects.length === 0 ? html`
							<div className="column is-12 has-text-centered py-5 has-text-grey">
								لا توجد مشاريع مطابقة للفلتر المحدد.
							</div>
						` : filteredProjects.map( p => html`
							<div key=${ p.id } className="column is-4">
								<div className="wp-dashboard-radar-card">
									<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
										<span className="tag is-dark is-light is-small" style=${{ borderRadius: 0 }}>${ p.prefix }</span>
										${ p.is_completed ? html`
											<span className="tag is-success is-small has-text-weight-bold" style=${{ borderRadius: 0 }}><i className="dashicons dashicons-awards ml-1"></i> مكتمل (${ p.progress }%)</span>
										` : html`
											<span className="tag is-info is-light is-small" style=${{ borderRadius: 0 }}>نشط (${ p.progress }%)</span>
										` }
									</div>
									<h4 className="title is-6 mb-2 wp-text-truncate" title=${ p.name }>
										<a href=${ `#/projects` } className="has-text-dark">${ p.name }</a>
									</h4>
									<div className="mt-auto pt-3 wp-border-top is-flex is-justify-content-space-between is-align-items-center is-size-7 has-text-grey">
										<span>المهام: ${ p.completed_count || 0 }/${ p.count || 0 }</span>
										<div className="buttons are-small mb-0">
											<button className="button is-dark wp-border is-small" onClick=${ () => setReportModalProject(p) } title="استخراج التقرير التنفيذي وكتاب المعرفة">
												<i className="dashicons dashicons-media-document"></i>
											</button>
											<button className="button is-white wp-border is-small" onClick=${ () => { setMembersProject(p); setIsMembersModalOpen(true); } } title="إدارة الأعضاء">
												<i className="dashicons dashicons-admin-users"></i>
											</button>
											<button className="button is-white wp-border is-small" onClick=${ () => { setSelectedProject(p); setIsProjectModalOpen(true); } } title="تعديل المشروع">
												<i className="dashicons dashicons-edit"></i>
											</button>
										</div>
									</div>
								</div>
							</div>
						` ) }
					</div>
				</div>
			</div>
		</div>
	`;
}
