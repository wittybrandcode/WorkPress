import { html } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import PriorityBadge from '../PriorityBadge.js';
import MemberSelect from '../MemberSelect.js';

/**
 * Task Detail Metadata & Assignees Sidebar Component
 */
export default function TaskMetaSidebar({
	task,
	assignees = [],
	availableUsers = [],
	selectedAssigneeId = '',
	setSelectedAssigneeId,
	handleAssign,
	handleUnassign
}) {
	if (!task) return null;

	const isCompleted = task.status === 'completed' || task.status === 'closed';
	const isInProgress = task.status === 'in_progress' || task.status === 'in_review';
	const isAssigned = task.status === 'assigned';
	const isNew = task.status === 'new' || task.status === 'open' || !task.status;

	return html`
		<div className="task-meta-sidebar">
			<div className="wp-card wp-task-sidebar-card p-4 mb-4">
				<h3 className="title is-6 mb-4 has-text-grey">إدارة المهمة</h3>
				
				<!-- Task Status Section -->
				<div className="field mb-4">
					<label className="label is-small">حالة المهمة (الحالة المشتقة حياً)</label>
					<div className="p-3 wp-border" style=${{ backgroundColor: '#f8fafc' }}>
						<div className="mb-2">
							${ isCompleted && html`
								<span className="tag is-success is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
									<i className="dashicons dashicons-yes-alt ml-1"></i> مكتملة ومعتمدة
								</span>
							` }
							${ isInProgress && html`
								<span className="tag is-warning is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
									<i className="dashicons dashicons-hammer ml-1"></i> قيد الإنجاز والتعاون
								</span>
							` }
							${ isAssigned && html`
								<span className="tag is-info is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
									<i className="dashicons dashicons-admin-users ml-1"></i> مسندة ومخصصة
								</span>
							` }
							${ isNew && html`
								<span className="tag is-dark is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
									<i className="dashicons dashicons-tag ml-1"></i> جديدة وغير مسندة
								</span>
							` }
						</div>
						<p className="is-size-7 has-text-grey">
							<i className="dashicons dashicons-update is-size-7 ml-1"></i>
							تتدرج الحالة أوتوماتيكياً: (تخصيص عضو ← إضافة مساهمة ← اعتماد الحل).
						</p>
					</div>
				</div>
				
				<!-- Priority Level Section -->
				<div className="field mb-4">
					<label className="label is-small">مستوى الأولوية</label>
					<div className="p-1" style=${{ border: '1px solid #ededed', backgroundColor: '#f8fafc' }}>
						<${PriorityBadge} priority=${ task.priority } />
					</div>
				</div>
				
				<hr style=${{ backgroundColor: '#0f172a', height: '2px' }} />
				
				<!-- Assignees Section -->
				<div className="field mb-4">
					<label className="label is-small">المكلَّفون بالمهمة</label>
					<div className="mb-2">
						${ assignees.length === 0 ? html`
							<p className="has-text-grey is-size-7">لا يوجد أعضاء مكلفين بهذه المهمة.</p>
						` : assignees.map( a => html`
							<div key=${a.id} className="is-flex is-align-items-center is-justify-content-space-between p-2 mb-1" style=${{ border: '1px solid #ededed', backgroundColor: '#fff' }}>
								<div className="is-flex is-align-items-center">
									<figure className="image is-24x24 mr-2" style=${{ marginLeft: '8px' }}>
										<img src=${a.avatar} alt=${a.display_name} style=${{ borderRadius: 0 }} />
									</figure>
									<span className="is-size-7 has-text-weight-bold">${a.display_name}</span>
								</div>
								<button className="delete is-small" onClick=${() => handleUnassign(a.id)} title="إلغاء التكليف"></button>
							</div>
						`)}
					</div>
					
					<div className="field">
						<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
							<div style=${{ flex: 1 }}>
								<${MemberSelect}
									users=${availableUsers.filter( u => !assignees.find( a => parseInt(a.id) === parseInt(u.id) ) )}
									value=${selectedAssigneeId}
									onChange=${(uid) => setSelectedAssigneeId(uid)}
									placeholder="-- اختر عضواً للتكليف --"
									size="small"
								/>
							</div>
							<button 
								type="button"
								className="button is-primary is-small wp-sharp-button" 
								onClick=${handleAssign} 
								disabled=${!selectedAssigneeId}
								style=${{ height: '32px' }}
							>
								تكليف
							</button>
						</div>
					</div>
				</div>
				
				<hr style=${{ backgroundColor: '#0f172a', height: '2px' }} />
				
				<!-- Quick Actions -->
				<div className="field mb-2">
					<button type="button" className="button is-fullwidth wp-sidebar-action wp-sharp-button" onClick=${ () => window.location.hash = '#/kanban' } style=${{ justifyContent: 'flex-start' }}>
						<span className="icon"><i className="dashicons dashicons-columns"></i></span>
						<span>العودة للكانبان</span>
					</button>
				</div>

				<!-- Custom Task Sidebar Actions Hook -->
				${ hooks.applyFilters('workpress_task_sidebar_actions', [], task).map((ActionComp, i) => html`<${ActionComp} key=${i} task=${task} />`) }
				<!-- Custom Task Meta Details Hook -->
				${ hooks.applyFilters('workpress_task_meta_details', [], task).map((MetaComp, i) => html`<${MetaComp} key=${i} task=${task} />`) }
			</div>
		</div>
	`;
}
