import { html } from '../../utils/html.js';

/**
 * Project Lead Command Hub Perspective View
 */
export default function LeadPerspectiveView({
	pendingSolutions = [],
	setSelectedContribution,
	setIsDetailModalOpen,
	unassignedTasksInMyProjects = [],
	setAssignmentTask,
	setIsAssignmentModalOpen,
	myLedProjects = [],
	setSelectedTask,
	setIsTaskModalOpen
}) {
	return html`
		<div className="lead-perspective-view">
			<!-- Lead Action Center: Solutions to Accept & Unassigned Tasks -->
			<div className="columns mb-5">
				
				<!-- Solutions Pending Approval Box -->
				<div className="column is-6">
					<div className="box wp-card p-0 wp-dashboard-action-box">
						<div className="p-3 has-background-warning-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
							<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
								<span className="icon ml-1 has-text-warning"><i className="dashicons dashicons-awards"></i></span>
								<span>حلول معروضة تنتظر اعتمادك واكتمال المهمة</span>
							</h3>
							<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0 }}>${ pendingSolutions.length } حل</span>
						</div>
						<div className="p-4">
							${ pendingSolutions.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-yes-alt is-size-3"></i></span>
									<p className="is-size-7">لا توجد حلول معلقة بانتظار الاعتماد. كل الحلول مفحوصة!</p>
								</div>
							` : pendingSolutions.map( sol => html`
								<div key=${ sol.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ sol.project_name || 'مشروع' }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ sol.task_title || 'مهمة' }</strong>
										<span className="is-size-7 has-text-grey">بواسطة: ${ sol.author_name || 'عضو الفريق' }</span>
									</div>
									<button 
										className="button is-small is-success wp-sharp-button"
										onClick=${ () => { setSelectedContribution( sol ); setIsDetailModalOpen( true ); } }
									>
										<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
										<span>فحص واعتماد</span>
									</button>
								</div>
							` ) }
						</div>
					</div>
				</div>

				<!-- Unassigned Tasks in My Projects Box -->
				<div className="column is-6">
					<div className="box wp-card p-0 wp-dashboard-action-box">
						<div className="p-3 has-background-info-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
							<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
								<span className="icon ml-1 has-text-info"><i className="dashicons dashicons-admin-users"></i></span>
								<span>مهام جديدة تنتظر التوزيع والتكليف</span>
							</h3>
							<span className="tag is-info has-text-weight-bold" style=${{ borderRadius: 0 }}>${ unassignedTasksInMyProjects.length } مهمة</span>
						</div>
						<div className="p-4">
							${ unassignedTasksInMyProjects.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-groups is-size-3"></i></span>
									<p className="is-size-7">كافة المهام موزعة ومسندة لأعضاء الفريق!</p>
								</div>
							` : unassignedTasksInMyProjects.map( t => html`
								<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || 'مشروع' }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
										<span className="tag is-dark is-light is-small mt-1" style=${{ borderRadius: 0 }}>جديدة</span>
									</div>
									<button 
										className="button is-small is-primary is-outlined wp-sharp-button"
										onClick=${ () => { setAssignmentTask( t ); setIsAssignmentModalOpen( true ); } }
									>
										<span className="icon"><i className="dashicons dashicons-admin-users"></i></span>
										<span>تخصيص عضو</span>
									</button>
								</div>
							` ) }
						</div>
					</div>
				</div>

			</div>

			<!-- My Led Projects Grid -->
			<div className="box wp-card p-0 mb-5 wp-border">
				<div className="p-3 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom has-background-light">
					<h3 className="title is-6 mb-0 has-text-dark has-text-weight-bold">المشاريع التي أقودها (My Led Projects)</h3>
					<button className="button is-primary is-small wp-sharp-button" onClick=${ () => { setSelectedTask(null); setIsTaskModalOpen(true); } }>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>+ مهمة جديدة لمشروعي</span>
					</button>
				</div>
				<div className="p-4">
					<div className="columns is-multiline">
						${ myLedProjects.length === 0 ? html`
							<div className="column is-12 has-text-centered py-4 has-text-grey">
								لم يتم تعيينك كقائد لأي مشروع بعد.
							</div>
						` : myLedProjects.map( p => html`
							<div key=${ p.id } className="column is-4">
								<div className="box wp-card p-4 wp-border is-flex is-flex-direction-column h-100" style=${{ borderRadius: 0 }}>
									<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
										<span className="tag is-dark is-light is-small" style=${{ borderRadius: 0 }}>${ p.prefix }</span>
										<span className="tag is-info is-small" style=${{ borderRadius: 0 }}>${ p.progress }% منجز</span>
									</div>
									<h4 className="title is-6 mb-2 wp-text-truncate">${ p.name }</h4>
									<div className="mt-auto pt-3 wp-border-top is-flex is-justify-content-space-between is-align-items-center is-size-7 has-text-grey">
										<span>المهام المكتملة: ${ p.completed_count || 0 }/${ p.count || 0 }</span>
										<a href="#/kanban" className="button is-small is-white wp-border is-flex is-align-items-center">
											<span>فتح الكانبان</span>
											<span className="icon is-small mr-1"><i className="dashicons dashicons-arrow-left-alt2"></i></span>
										</a>
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
