import { html, __, isRtl } from '../../utils/html.js';

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
	const rtl = isRtl();

	return html`
		<div className="lead-perspective-view">
			<!-- Lead Action Center: Solutions to Accept & Unassigned Tasks -->
			<div className="columns mb-5">
				
				<!-- Solutions Pending Approval Box -->
				<div className="column is-6">
					<div className="box wp-card p-0 wp-dashboard-action-box">
						<div className="p-3 has-background-warning-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
							<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
								<span className=${ `icon ${ rtl ? 'ml-1' : 'mr-1' } has-text-warning` }><i className="dashicons dashicons-awards"></i></span>
								<span>${ __( 'Solutions awaiting your review and milestone sign-off', 'workpress' ) }</span>
							</h3>
							<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0 }}>${ pendingSolutions.length } ${ __( 'Deliverables', 'workpress' ) }</span>
						</div>
						<div className="p-4">
							${ pendingSolutions.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-yes-alt is-size-3"></i></span>
									<p className="is-size-7">${ __( 'No pending solutions awaiting review. All solutions verified!', 'workpress' ) }</p>
								</div>
							` : pendingSolutions.map( sol => html`
								<div key=${ sol.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ sol.project_name || __( 'Project', 'workpress' ) }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ sol.task_title || __( 'Task', 'workpress' ) }</strong>
										<span className="is-size-7 has-text-grey">${ __( 'Lead:', 'workpress' ) } ${ sol.author_name || __( 'Staff', 'workpress' ) }</span>
									</div>
									<button 
										className="button is-small is-success wp-sharp-button"
										onClick=${ () => { setSelectedContribution( sol ); setIsDetailModalOpen( true ); } }
									>
										<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
										<span>${ __( 'Review & Sign-off', 'workpress' ) }</span>
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
								<span className=${ `icon ${ rtl ? 'ml-1' : 'mr-1' } has-text-info` }><i className="dashicons dashicons-admin-users"></i></span>
								<span>${ __( 'New tasks awaiting assignment', 'workpress' ) }</span>
							</h3>
							<span className="tag is-info has-text-weight-bold" style=${{ borderRadius: 0 }}>${ unassignedTasksInMyProjects.length } ${ __( 'Tasks', 'workpress' ) }</span>
						</div>
						<div className="p-4">
							${ unassignedTasksInMyProjects.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-groups is-size-3"></i></span>
									<p className="is-size-7">${ __( 'All tasks are assigned to team members!', 'workpress' ) }</p>
								</div>
							` : unassignedTasksInMyProjects.map( t => html`
								<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || __( 'Project', 'workpress' ) }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
										<span className="tag is-dark is-light is-small mt-1" style=${{ borderRadius: 0 }}>${ __( 'Pending', 'workpress' ) }</span>
									</div>
									<button 
										className="button is-small is-primary is-outlined wp-sharp-button"
										onClick=${ () => { setAssignmentTask( t ); setIsAssignmentModalOpen( true ); } }
									>
										<span className="icon"><i className="dashicons dashicons-admin-users"></i></span>
										<span>${ __( 'Assignees', 'workpress' ) }</span>
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
					<h3 className="title is-6 mb-0 has-text-dark has-text-weight-bold">${ __( 'My Led Projects', 'workpress' ) }</h3>
					<button className="button is-primary is-small wp-sharp-button" onClick=${ () => { setSelectedTask(null); setIsTaskModalOpen(true); } }>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>+ ${ __( 'Add New Work Item', 'workpress' ) }</span>
					</button>
				</div>
				<div className="p-4">
					<div className="columns is-multiline">
						${ myLedProjects.length === 0 ? html`
							<div className="column is-12 has-text-centered py-4 has-text-grey">
								${ __( 'You have not been assigned as lead to any projects yet.', 'workpress' ) }
							</div>
						` : myLedProjects.map( p => html`
							<div key=${ p.id } className="column is-4">
								<div className="box wp-card p-4 wp-border is-flex is-flex-direction-column h-100" style=${{ borderRadius: 0 }}>
									<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
										<span className="tag is-dark is-light is-small" style=${{ borderRadius: 0 }}>${ p.prefix }</span>
										<span className="tag is-info is-small" style=${{ borderRadius: 0 }}>${ p.progress }% ${ __( 'Completed', 'workpress' ) }</span>
									</div>
									<h4 className="title is-6 mb-2 wp-text-truncate">${ p.name }</h4>
									<div className="mt-auto pt-3 wp-border-top is-flex is-justify-content-space-between is-align-items-center is-size-7 has-text-grey">
										<span>${ __( 'Tasks:', 'workpress' ) } ${ p.completed_count || 0 }/${ p.count || 0 }</span>
										<a href="#/kanban" className="button is-small is-white wp-border is-flex is-align-items-center">
											<span>${ __( 'Kanban', 'workpress' ) }</span>
											<span className=${ `icon is-small ${ rtl ? 'mr-1' : 'ml-1' }` }><i className=${ rtl ? 'dashicons dashicons-arrow-left-alt2' : 'dashicons dashicons-arrow-right-alt2' }></i></span>
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
