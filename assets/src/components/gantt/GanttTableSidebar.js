import { html } from '../../utils/html.js';
import AvatarStack from '../ui/AvatarStack.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Right Master Table Component (380px)
 */
export default function GanttTableSidebar({
	projectGroups = {},
	collapsedProjects = {},
	toggleProjectCollapse,
	expandAllProjects,
	collapseAllProjects,
	getBarMetrics,
	today = new Date(),
	hoveredTaskId = null,
	setHoveredTaskId,
	setTooltipTargetRect,
	onTaskClick
}) {
	return html`
		<div className="wp-gantt-master-table">
			<!-- Table Header (Height 58px) -->
			<div className="wp-gantt-table-header">
				<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span>المشروع والمهمة</span>
					<div className="wp-btn-group-tight" style=${{ height: '22px' }}>
						<button 
							type="button" 
							className="button is-small" 
							onClick=${ expandAllProjects }
							title="توسيع كافة شجرة المشاريع"
							style=${{ height: '22px', fontSize: '10px', padding: '0 5px', fontWeight: '800' }}
						>
							توسيع
						</button>
						<button 
							type="button" 
							className="button is-small" 
							onClick=${ collapseAllProjects }
							title="طي كافة شجرة المشاريع"
							style=${{ height: '22px', fontSize: '10px', padding: '0 5px', fontWeight: '800' }}
						>
							طي
						</button>
					</div>
				</div>
				<span style=${{ fontSize: '0.72rem', color: '#64748b' }}>المدة والإسناد</span>
			</div>

			<!-- Table Rows List -->
			<div style=${{ display: 'flex', flexDirection: 'column' }}>
				${ Object.values( projectGroups ).map( group => {
					const isCollapsed = !!collapsedProjects[ group.id ];
					const groupTasksCount = group.tasks.length;
					const completedGroupTasks = group.tasks.filter( t => [ 'completed', 'closed' ].includes( t.status ) ).length;
					const groupProgress = groupTasksCount > 0 ? Math.round( ( completedGroupTasks / groupTasksCount ) * 100 ) : 0;

					return html`
						<div key=${ `p_${ group.id }` } style=${{ display: 'flex', flexDirection: 'column' }}>
							<!-- Project Header Row (Height 34px) -->
							<div 
								className="wp-gantt-project-row"
								onClick=${ () => toggleProjectCollapse && toggleProjectCollapse( group.id ) }
							>
								<div style=${{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
									<i className=${ `dashicons ${ isCollapsed ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-down-alt2' }` } style=${{ fontSize: '14px', color: '#64748b' }}></i>
									<span style=${{ fontWeight: '800', fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										${ group.name }
									</span>
									<span className="wp-dense-chip" style=${{ height: '18px', padding: '0 4px', fontSize: '0.65rem' }}>
										${ groupTasksCount }
									</span>
								</div>

								<div style=${{ fontSize: '0.72rem', fontWeight: '800', color: groupProgress === 100 ? '#10b981' : '#3b82f6' }}>
									${ groupProgress }%
								</div>
							</div>

							<!-- Task Rows under this project (Height 38px) -->
							${ ! isCollapsed ? group.tasks.map( task => {
								const metrics = getBarMetrics( task );
								const isHovered = hoveredTaskId === task.id;
								const isOverdue = [ 'open', 'assigned', 'in_progress' ].includes( task.status ) && metrics.dueDate < today;

								return html`
									<div 
										key=${ `task_row_${ task.id }` }
										className=${ `wp-gantt-task-row ${ isHovered ? 'is-hovered' : '' }` }
										onMouseEnter=${ ( e ) => {
											const rect = e.currentTarget.getBoundingClientRect();
											setTooltipTargetRect( { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, isTable: true } );
											setHoveredTaskId( task.id );
										} }
										onMouseLeave=${ () => {
											setHoveredTaskId( null );
											setTooltipTargetRect( null );
										} }
									>
										<div 
											style=${{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0, cursor: 'pointer' }}
											onClick=${ () => onTaskClick && onTaskClick( task.id ) }
											title="انقر لفتح تفاصيل المهمة والمعاينة السريعة"
										>
											<span style=${{ width: '6px', height: '6px', flexShrink: 0, backgroundColor: [ 'completed', 'closed' ].includes( task.status ) ? '#10b981' : ( [ 'in_progress', 'in_review' ].includes( task.status ) ? '#f59e0b' : '#3b82f6' ) }}></span>
											<div style=${{ flex: 1, minWidth: 0 }}>
												<div style=${{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>
													${ task.title }
												</div>
												<div style=${{ fontSize: '0.67rem', color: isOverdue ? '#dc2626' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
													<span>${ formatDate( metrics.createdDate, { short: true } ) } - ${ formatDate( metrics.dueDate, { short: true } ) }</span>
													<span>(${ metrics.durationDays } يوم)</span>
													${ isOverdue ? html`<span style=${{ fontWeight: '800', color: '#dc2626' }}>[متأخرة]</span>` : null }
												</div>
											</div>
										</div>

										<div style=${{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
											${ task.assignees && task.assignees.length > 0 ? html`
												<${AvatarStack} users=${ task.assignees } max=${ 1 } size=${ 18 } />
											` : html`
												<span style=${{ fontSize: '0.7rem', color: '#94a3b8' }}>-</span>
											` }
										</div>
									</div>
								`;
							} ) : null }
						</div>
					`;
				} ) }
			</div>
		</div>
	`;
}
