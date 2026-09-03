import { html, __, sprintf, isRtl } from '../../utils/html.js';
import AvatarStack from '../ui/AvatarStack.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Table Header Component (Fixed 380px Width)
 * Minimalist icon-driven design matching WorkPress FilterBar
 */
export function GanttTableHeader({ areAllCollapsed = false, toggleAllProjects }) {
	const rtl = isRtl();

	return html`
		<div className="wp-gantt-table-header">
			<div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
				<span className="is-flex is-align-items-center" style=${{ gap: '6px', fontWeight: '800', fontSize: '0.85rem', color: '#0f172a' }} title=${ __( 'Projects & Work Items', 'workpress' ) }>
					<i className="dashicons dashicons-category" style=${{ fontSize: '17px', width: '17px', height: '17px', color: '#008478' }}></i>
					<span>${ __( 'Work Items', 'workpress' ) }</span>
				</span>
				
				<!-- Single Unified Expand / Collapse Toggle Button (Enlarged 32px) -->
				<button 
					type="button" 
					className="wp-header-toggle-btn" 
					onClick=${ toggleAllProjects }
					title=${ areAllCollapsed ? __( 'Expand all projects', 'workpress' ) : __( 'Collapse all projects', 'workpress' ) }
				>
					<i 
						className=${ `dashicons ${ areAllCollapsed ? 'dashicons-editor-expand' : 'dashicons-editor-contract' }` }
					></i>
				</button>
			</div>

			<!-- Meta Icon Group (Duration & Assignee) -->
			<div className="is-flex is-align-items-center" style=${{ gap: '4px' }} title=${ __( 'Duration & Assignee', 'workpress' ) }>
				<span className="wp-stat-chip" style=${{ height: '28px', padding: '0 8px', fontSize: '0.72rem', backgroundColor: '#f8fafc', color: '#64748b', gap: '5px' }}>
					<i className="dashicons dashicons-clock" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
					<i className="dashicons dashicons-admin-users" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
				</span>
			</div>
		</div>
	`;
}

/**
 * Gantt Right Master Table Component (380px)
 */
export default function GanttTableSidebar({
	tableContainerRef,
	onScroll,
	hideHeader = false,
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
	const rtl = isRtl();

	return html`
		<div ref=${ tableContainerRef } onScroll=${ onScroll } className="wp-gantt-master-table">
			<!-- Table Header (Height 58px) -->
			${ ! hideHeader && html`
				<${GanttTableHeader} 
					expandAllProjects=${ expandAllProjects } 
					collapseAllProjects=${ collapseAllProjects } 
				/>
			` }

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
									<i className=${ `dashicons ${ isCollapsed ? ( rtl ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-right-alt2' ) : 'dashicons-arrow-down-alt2' }` } style=${{ fontSize: '14px', color: '#64748b' }}></i>
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
											title=${ __( 'Click to view task details and quick preview', 'workpress' ) }
										>
											<span style=${{ width: '6px', height: '6px', flexShrink: 0, backgroundColor: [ 'completed', 'closed' ].includes( task.status ) ? '#10b981' : ( [ 'in_progress', 'in_review' ].includes( task.status ) ? '#f59e0b' : '#3b82f6' ) }}></span>
											<div style=${{ flex: 1, minWidth: 0 }}>
												<div style=${{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>
													${ task.title }
												</div>
												<div style=${{ fontSize: '0.67rem', color: isOverdue ? '#dc2626' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
													<span>${ formatDate( metrics.createdDate, { short: true } ) } - ${ formatDate( metrics.dueDate, { short: true } ) }</span>
													<span>(${ sprintf( __( '%d days', 'workpress' ), metrics.durationDays ) })</span>
													${ isOverdue ? html`<span style=${{ fontWeight: '800', color: '#dc2626' }}>[${ __( 'Overdue', 'workpress' ) }]</span>` : null }
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
