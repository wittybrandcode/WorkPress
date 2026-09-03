import { html, useState, useEffect, __, sprintf, isRtl } from '../utils/html.js';
import { projectsApi, reportsApi, tasksApi, contributionsApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import Loader from '../components/ui/Loader.js';
import ReportModal from '../components/modals/ReportModal.js';
import ReportFilterBar from '../components/reports/ReportFilterBar.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function ReportsPage( { refreshKey } ) {
	// Active Analytics Domain: 'projects' | 'tasks' | 'team'
	const [ activeDomain, setActiveDomain ] = useState( 'projects' );

	// Raw Data State
	const [ projects, setProjects ] = useState( [] );
	const [ tasks, setTasks ] = useState( [] );
	const [ contributions, setContributions ] = useState( [] );
	const [ users, setUsers ] = useState( [] );
	const [ analytics, setAnalytics ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );

	// Filter & Control State
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ statusFilter, setStatusFilter ] = useState( 'all' );
	const [ sortBy, setSortBy ] = useState( 'newest' ); // 'newest' | 'progress_desc' | 'name'
	const [ viewMode, setViewMode ] = useState( 'cards' ); // 'cards' | 'table'
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const itemsPerPage = 12;
	const rtl = isRtl();

	// Report Modal state
	const [ selectedProject, setSelectedProject ] = useState( null );
	const [ modalInitialTab, setModalInitialTab ] = useState( 'report' );

	// Reset page to 1 whenever filtering, search, or domain changes
	useEffect( () => {
		setCurrentPage( 1 );
	}, [ activeDomain, statusFilter, searchQuery, sortBy ] );

	useEffect( () => {
		setIsLoading( true );
		Promise.all( [
			projectsApi.list( { number: 100 } ),
			tasksApi.list( { number: 300 } ).catch( () => [] ),
			contributionsApi.list( { number: 200 } ).catch( () => [] ),
			window.wp.apiFetch( { path: '/wp/v2/users?per_page=100' } ).catch( () => [] ),
			reportsApi.getWorkspaceAnalytics().catch( () => null ),
		] )
			.then( ( [ projectsRes, tasksRes, contributionsRes, usersRes, analyticsRes ] ) => {
				const projectItems = projectsRes && projectsRes.items ? projectsRes.items : ( Array.isArray( projectsRes ) ? projectsRes : [] );
				setProjects( projectItems );
				setTasks( Array.isArray( tasksRes ) ? tasksRes : [] );
				setContributions( Array.isArray( contributionsRes ) ? contributionsRes : [] );
				setUsers( Array.isArray( usersRes ) ? usersRes : [] );
				if ( analyticsRes ) {
					setAnalytics( analyticsRes );
				}
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( __( 'Failed to load workspace intelligence data', 'workpress' ), 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	}, [ refreshKey ] );

	// 1. Projects Domain Calculations
	const totalProjects = projects.length;
	const activeProjectsCount = projects.filter( p => p.status === 'in_progress' || p.status === 'active' ).length;
	const completedProjectsCount = projects.filter( p => p.status === 'completed' ).length;
	const atRiskProjectsCount = projects.filter( p => p.is_at_risk || p.health === 'critical' ).length;
	const totalSolutions = analytics && analytics.total_solutions !== undefined ? analytics.total_solutions : contributions.filter( c => c.is_accepted ).length;
	const avgProgress = totalProjects > 0
		? Math.round( projects.reduce( ( acc, p ) => acc + ( Number( p.progress ) || 0 ), 0 ) / totalProjects )
		: 0;

	// 2. Tasks Domain Calculations
	const now = new Date();
	const overdueTasks = tasks.filter( t => t.due_date && new Date( t.due_date ) < now && t.status !== 'completed' );
	const inProgressTasks = tasks.filter( t => t.status === 'in_progress' );
	const reviewTasks = tasks.filter( t => t.status === 'review' );
	const completedTasks = tasks.filter( t => t.status === 'completed' );

	const taskStats = {
		total: tasks.length,
		inProgress: inProgressTasks.length,
		review: reviewTasks.length,
		completed: completedTasks.length,
		overdue: overdueTasks.length
	};

	// 3. Team Domain Calculations
	const teamWorkloadList = users.map( user => {
		const userTasks = tasks.filter( t => String( t.assigned_to ) === String( user.id ) );
		const userActiveTasks = userTasks.filter( t => t.status !== 'completed' );
		const userCompletedTasks = userTasks.filter( t => t.status === 'completed' );
		const userSolutions = contributions.filter( c => String( c.user_id ) === String( user.id ) && c.is_accepted );

		let workloadLevel = 'available';
		if ( userActiveTasks.length > 6 ) {
			workloadLevel = 'high';
		} else if ( userActiveTasks.length >= 2 ) {
			workloadLevel = 'balanced';
		} else if ( userActiveTasks.length === 1 ) {
			workloadLevel = 'light';
		}

		return {
			...user,
			totalTasks: userTasks.length,
			activeTasks: userActiveTasks.length,
			completedTasks: userCompletedTasks.length,
			solutionsCount: userSolutions.length,
			workloadLevel
		};
	} );

	const teamStats = {
		totalMembers: users.length,
		activeTasks: tasks.filter( t => t.status !== 'completed' && t.assigned_to ).length,
		verifiedSolutions: contributions.filter( c => c.is_accepted ).length,
		highLoadMembers: teamWorkloadList.filter( m => m.workloadLevel === 'high' ).length
	};

	// Domain Filtering & Sorting
	let filteredData = [];

	if ( activeDomain === 'projects' ) {
		filteredData = projects.filter( project => {
			if ( statusFilter === 'active' && project.status !== 'in_progress' && project.status !== 'active' ) return false;
			if ( statusFilter === 'completed' && project.status !== 'completed' ) return false;
			if ( statusFilter === 'at_risk' && ! project.is_at_risk && project.health !== 'critical' ) return false;
			if ( statusFilter === 'has_solutions' && ! ( Number( project.solutions_count ) > 0 ) ) return false;

			if ( searchQuery.trim() ) {
				const q = searchQuery.toLowerCase();
				const matchName = ( project.name || '' ).toLowerCase().includes( q );
				const matchLead = ( project.lead_name || '' ).toLowerCase().includes( q );
				return matchName || matchLead;
			}
			return true;
		} );

		filteredData.sort( ( a, b ) => {
			if ( sortBy === 'progress_desc' ) return ( Number( b.progress ) || 0 ) - ( Number( a.progress ) || 0 );
			if ( sortBy === 'name' ) return ( a.name || '' ).localeCompare( b.name || '' );
			return new Date( b.created_at || 0 ) - new Date( a.created_at || 0 );
		} );
	} else if ( activeDomain === 'tasks' ) {
		filteredData = tasks.filter( task => {
			if ( statusFilter === 'in_progress' && task.status !== 'in_progress' ) return false;
			if ( statusFilter === 'review' && task.status !== 'review' ) return false;
			if ( statusFilter === 'completed' && task.status !== 'completed' ) return false;
			if ( statusFilter === 'overdue' && ! ( task.due_date && new Date( task.due_date ) < now && task.status !== 'completed' ) ) return false;

			if ( searchQuery.trim() ) {
				const q = searchQuery.toLowerCase();
				const matchTitle = ( task.title || '' ).toLowerCase().includes( q );
				const matchProj = ( task.project_name || '' ).toLowerCase().includes( q );
				return matchTitle || matchProj;
			}
			return true;
		} );

		filteredData.sort( ( a, b ) => {
			if ( sortBy === 'name' ) return ( a.title || '' ).localeCompare( b.title || '' );
			return new Date( b.created_at || 0 ) - new Date( a.created_at || 0 );
		} );
	} else if ( activeDomain === 'team' ) {
		filteredData = teamWorkloadList.filter( member => {
			if ( statusFilter === 'high_load' && member.workloadLevel !== 'high' ) return false;
			if ( searchQuery.trim() ) {
				const q = searchQuery.toLowerCase();
				const matchName = ( member.name || member.display_name || '' ).toLowerCase().includes( q );
				return matchName;
			}
			return true;
		} );

		filteredData.sort( ( a, b ) => {
			if ( sortBy === 'progress_desc' ) return b.activeTasks - a.activeTasks;
			if ( sortBy === 'name' ) return ( a.name || '' ).localeCompare( b.name || '' );
			return b.solutionsCount - a.solutionsCount;
		} );
	}

	// Pagination
	const totalItems = filteredData.length;
	const totalPages = Math.ceil( totalItems / itemsPerPage ) || 1;
	const validCurrentPage = Math.min( Math.max( 1, currentPage ), totalPages );
	const startIndex = ( validCurrentPage - 1 ) * itemsPerPage;
	const endIndex = Math.min( startIndex + itemsPerPage, totalItems );
	const paginatedData = filteredData.slice( startIndex, endIndex );

	const getPageNumbers = ( current, total ) => {
		if ( total <= 7 ) return Array.from( { length: total }, ( _, i ) => i + 1 );
		if ( current <= 4 ) return [ 1, 2, 3, 4, 5, '...', total ];
		if ( current >= total - 3 ) return [ 1, '...', total - 4, total - 3, total - 2, total - 1, total ];
		return [ 1, '...', current - 1, current, current + 1, '...', total ];
	};

	const handleExport = () => {
		window.print();
	};

	return html`
		<div className="reports-page pb-6">
			<!-- شريط الأدوات والتحليلات الموحد ثلاثي المجالات -->
			<${ReportFilterBar}
				activeDomain=${ activeDomain }
				setActiveDomain=${ setActiveDomain }
				totalProjects=${ totalProjects }
				activeProjectsCount=${ activeProjectsCount }
				completedProjectsCount=${ completedProjectsCount }
				atRiskProjectsCount=${ atRiskProjectsCount }
				totalSolutions=${ totalSolutions }
				completionRate=${ avgProgress }
				taskStats=${ taskStats }
				teamStats=${ teamStats }
				searchQuery=${ searchQuery }
				setSearchQuery=${ setSearchQuery }
				statusFilter=${ statusFilter }
				setStatusFilter=${ setStatusFilter }
				sortBy=${ sortBy }
				setSortBy=${ setSortBy }
				viewMode=${ viewMode }
				setViewMode=${ setViewMode }
				onExport=${ handleExport }
			/>

			${ isLoading ? html`
				<div className="py-6 mt-4 has-text-centered">
					<${Loader} center=${ true } label=${ __( 'Calculating intelligence metrics...', 'workpress' ) } size="large" />
				</div>
			` : totalItems === 0 ? html`
				<div className="box wp-card has-text-centered py-6 mt-4" style=${{ borderRadius: 0 }}>
					<span className="icon is-large has-text-grey-light mb-3">
						<i className="dashicons dashicons-chart-pie" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h3 className="title is-5 mb-2 has-text-dark">${ __( 'No matching records in this analytics domain', 'workpress' ) }</h3>
					<p className="subtitle is-6 has-text-grey-light mb-4">${ __( 'Try resetting filters or adjusting search terms.', 'workpress' ) }</p>
					<button
						className="button is-light wp-btn"
						onClick=${ () => { setStatusFilter( 'all' ); setSearchQuery( '' ); } }
					>
						<i className="dashicons dashicons-image-rotate" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
						<span>${ __( 'Reset Filters', 'workpress' ) }</span>
					</button>
				</div>
			` : activeDomain === 'projects' ? html`
				<!-- ================= مجال 1: تحليلات المشاريع ================= -->
				${ viewMode === 'table' ? html`
					<div className="wp-reports-table-container mt-4">
						<table className="wp-reports-table">
							<thead>
								<tr>
									<th style=${{ width: '120px' }}>${ __( 'Code', 'workpress' ) }</th>
									<th>${ __( 'Project Name', 'workpress' ) }</th>
									<th style=${{ width: '180px' }}>${ __( 'Completion Progress', 'workpress' ) }</th>
									<th style=${{ width: '110px' }}>${ __( 'Tasks', 'workpress' ) }</th>
									<th style=${{ width: '140px' }}>${ __( 'Lead', 'workpress' ) }</th>
									<th style=${{ width: '120px' }}>${ __( 'Due Date', 'workpress' ) }</th>
									<th style=${{ width: '110px', textAlign: rtl ? 'left' : 'right' }}>${ __( 'Actions', 'workpress' ) }</th>
								</tr>
							</thead>
							<tbody>
								${ paginatedData.map( project => {
									const progress = Math.min( 100, Math.max( 0, Number( project.progress ) || 0 ) );
									const isCompleted = project.status === 'completed';
									return html`
										<tr key=${ project.id }>
											<td>
												<span className="tag is-dark is-rounded is-small has-text-weight-bold">
													${ project.code || `PRJ-${ project.id }` }
												</span>
											</td>
											<td>
												<strong className="has-text-dark wp-hover-primary" style=${{ cursor: 'pointer' }} onClick=${ () => { setSelectedProject( project ); setModalInitialTab( 'report' ); } }>
													${ project.name }
												</strong>
											</td>
											<td>
												<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
													<div className="progress-bar-container" style=${{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
														<div style=${{ height: '100%', width: `${ progress }%`, backgroundColor: isCompleted ? '#10b981' : ( progress < 30 ? '#ef4444' : '#10b981' ) }}></div>
													</div>
													<span className="is-size-7 has-text-weight-bold" style=${{ width: '35px', textAlign: 'end' }}>${ progress }%</span>
												</div>
											</td>
											<td><span className="is-size-7 has-text-grey-dark">${ project.tasks_count || 0 } ${ __( 'Tasks', 'workpress' ) }</span></td>
											<td><span className="is-size-7 has-text-dark has-text-weight-semibold">${ project.lead_name || __( 'Unassigned', 'workpress' ) }</span></td>
											<td><span className="is-size-7 has-text-grey">${ project.end_date ? formatDate( project.end_date, { hideYear: true } ) : '—' }</span></td>
											<td style=${{ textAlign: rtl ? 'left' : 'right' }}>
												<button
													type="button"
													className="button is-small wp-btn"
													onClick=${ () => { setSelectedProject( project ); setModalInitialTab( 'report' ); } }
													style=${{ height: '28px', padding: '0 8px' }}
													title=${ __( 'View Intelligence Dossier', 'workpress' ) }
												>
													<i className="dashicons dashicons-analytics"></i>
												</button>
											</td>
										</tr>
									`;
								} ) }
							</tbody>
						</table>
					</div>
				` : html`
					<div className="columns is-multiline mt-4">
						${ paginatedData.map( project => {
							const progress = Math.min( 100, Math.max( 0, Number( project.progress ) || 0 ) );
							const isCompleted = project.status === 'completed';
							const isAtRisk = project.is_at_risk || project.health === 'critical';
							const borderTopColor = isCompleted ? '#10b981' : ( isAtRisk ? '#ef4444' : '#10b981' );

							return html`
								<div key=${ project.id } className="column is-4-desktop is-6-tablet is-12-mobile">
									<div
										className="wp-card p-4 is-flex is-flex-direction-column is-justify-content-space-between"
										style=${{ height: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0, boxSizing: 'border-box' }}
									>
										<div>
											<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
												<span className="tag is-dark is-rounded is-small has-text-weight-bold">
													${ project.code || `PRJ-${ project.id }` }
												</span>
												<span className="is-size-7 has-text-weight-bold" style=${{ color: isCompleted ? '#10b981' : ( isAtRisk ? '#ef4444' : '#10b981' ) }}>
													${ isCompleted ? __( 'Completed', 'workpress' ) : ( isAtRisk ? __( 'At Risk', 'workpress' ) : __( 'Active', 'workpress' ) ) }
												</span>
											</div>

											<h3
												className="title is-6 mb-2 wp-hover-primary"
												style=${{ cursor: 'pointer', lineHeight: '1.4' }}
												onClick=${ () => { setSelectedProject( project ); setModalInitialTab( 'report' ); } }
											>
												${ project.name }
											</h3>

											<!-- Micro Stats Grid (2x2) -->
											<div className="wp-card-stats-grid mb-3">
												<div className="wp-card-stat-box">
													<span className="wp-stat-label"><i className="dashicons dashicons-clipboard has-text-primary"></i> ${ __( 'Tasks', 'workpress' ) }</span>
													<strong className="is-size-7 has-text-dark">${ project.tasks_count || 0 } ${ __( 'Tasks', 'workpress' ) }</strong>
												</div>
												<div className="wp-card-stat-box">
													<span className="wp-stat-label"><i className="dashicons dashicons-admin-users has-text-info"></i> ${ __( 'Project Lead', 'workpress' ) }</span>
													<strong className="is-size-7 has-text-dark wp-text-truncate" style=${{ maxWidth: '100px' }}>${ project.lead_name || __( 'Unassigned', 'workpress' ) }</strong>
												</div>
												<div className="wp-card-stat-box">
													<span className="wp-stat-label"><i className="dashicons dashicons-calendar-alt has-text-warning"></i> ${ __( 'Due Date', 'workpress' ) }</span>
													<strong className="is-size-7 has-text-dark">${ project.end_date ? formatDate( project.end_date, { hideYear: true } ) : '—' }</strong>
												</div>
												<div className="wp-card-stat-box">
													<span className="wp-stat-label"><i className="dashicons dashicons-star-filled has-text-success"></i> ${ __( 'Knowledge Assets', 'workpress' ) }</span>
													<strong className="is-size-7 has-text-dark">${ project.solutions_count || 0 } ⭐</strong>
												</div>
											</div>
										</div>

										<div>
											<div className="mb-3">
												<div className="is-flex is-justify-content-space-between is-align-items-center mb-1">
													<span className="is-size-7 has-text-grey font-weight-bold">${ __( 'Completion', 'workpress' ) }</span>
													<span className="is-size-7 has-text-weight-bold" style=${{ color: isCompleted ? '#10b981' : '#10b981' }}>${ progress }%</span>
												</div>
												<div style=${{ height: '6px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
													<div style=${{ height: '100%', width: `${ progress }%`, backgroundColor: isCompleted ? '#10b981' : ( isAtRisk ? '#ef4444' : '#10b981' ) }}></div>
												</div>
											</div>

											<div className="is-flex is-justify-content-space-between is-align-items-center pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
												<button
													type="button"
													className="button is-small wp-btn"
													onClick=${ () => { setSelectedProject( project ); setModalInitialTab( 'report' ); } }
													style=${{ height: '28px', fontSize: '0.74rem' }}
												>
													<i className="dashicons dashicons-analytics" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
													<span>${ __( 'Executive Report', 'workpress' ) }</span>
												</button>
												<button
													type="button"
													className="button is-small wp-btn"
													onClick=${ () => { setSelectedProject( project ); setModalInitialTab( 'book' ); } }
													style=${{ height: '28px', fontSize: '0.74rem' }}
												>
													<i className="dashicons dashicons-book" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
													<span>${ __( 'Knowledge Book', 'workpress' ) }</span>
												</button>
											</div>
										</div>
									</div>
								</div>
							`;
						} ) }
					</div>
				` }
			` : activeDomain === 'tasks' ? html`
				<!-- ================= مجال 2: تحليلات المهام وسرعة الإنجاز ================= -->
				<div className="wp-reports-table-container mt-4">
					<table className="wp-reports-table">
						<thead>
							<tr>
								<th style=${{ width: '90px' }}>${ __( 'Task ID', 'workpress' ) }</th>
								<th>${ __( 'Task Title', 'workpress' ) }</th>
								<th style=${{ width: '160px' }}>${ __( 'Project', 'workpress' ) }</th>
								<th style=${{ width: '130px' }}>${ __( 'Stage', 'workpress' ) }</th>
								<th style=${{ width: '140px' }}>${ __( 'Assignee', 'workpress' ) }</th>
								<th style=${{ width: '120px' }}>${ __( 'Due Date', 'workpress' ) }</th>
								<th style=${{ width: '110px', textAlign: rtl ? 'left' : 'right' }}>${ __( 'Velocity', 'workpress' ) }</th>
							</tr>
						</thead>
						<tbody>
							${ paginatedData.map( task => {
								const isOverdue = task.due_date && new Date( task.due_date ) < now && task.status !== 'completed';
								return html`
									<tr key=${ task.id }>
										<td><span className="tag is-light is-rounded is-small has-text-weight-bold">#${ task.id }</span></td>
										<td>
											<a href=${ `#/tasks/${ task.id }` } className="has-text-dark has-text-weight-bold wp-hover-primary is-block">
												${ task.title }
											</a>
										</td>
										<td><span className="is-size-7 has-text-grey-dark wp-text-truncate" style=${{ maxWidth: '150px' }}>${ task.project_name || '—' }</span></td>
										<td>
											<span className=${ `tag is-small is-rounded has-text-weight-bold ${ task.status === 'completed' ? 'is-success is-light' : ( task.status === 'review' ? 'is-warning is-light' : 'is-info is-light' ) }` }>
												${ task.status === 'completed' ? __( 'Completed', 'workpress' ) : ( task.status === 'review' ? __( 'Under Review', 'workpress' ) : __( 'In Progress', 'workpress' ) ) }
											</span>
										</td>
										<td><span className="is-size-7 has-text-dark font-weight-bold">${ task.assigned_name || __( 'Unassigned', 'workpress' ) }</span></td>
										<td>
											<span className=${ `is-size-7 ${ isOverdue ? 'has-text-danger has-text-weight-bold' : 'has-text-grey' }` }>
												${ task.due_date ? formatDate( task.due_date, { hideYear: true } ) : '—' }
												${ isOverdue ? ' ⚠️' : '' }
											</span>
										</td>
										<td style=${{ textAlign: rtl ? 'left' : 'right' }}>
											<a href=${ `#/tasks/${ task.id }` } className="button is-small is-light wp-btn" style=${{ height: '26px', padding: '0 8px' }}>
												<i className="dashicons dashicons-external"></i>
											</a>
										</td>
									</tr>
								`;
							} ) }
						</tbody>
					</table>
				</div>
			` : html`
				<!-- ================= مجال 3: أداء الفريق وموازن الأحمال ================= -->
				<div className="columns is-multiline mt-4">
					${ paginatedData.map( member => {
						const isHigh = member.workloadLevel === 'high';
						const isBalanced = member.workloadLevel === 'balanced';
						const borderTopColor = isHigh ? '#ef4444' : ( isBalanced ? '#10b981' : '#64748b' );

						return html`
							<div key=${ member.id } className="column is-4-desktop is-6-tablet is-12-mobile">
								<div
									className="wp-card p-4 is-flex is-flex-direction-column is-justify-content-space-between"
									style=${{ height: '100%', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0 }}
								>
									<div>
										<div className="is-flex is-align-items-center mb-3">
											<figure className="image is-40x40 mr-3" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '10px' }}>
												<img
													src=${ member.avatar_urls && member.avatar_urls['48'] ? member.avatar_urls['48'] : '' }
													alt=${ member.name }
													style=${{ borderRadius: 0, backgroundColor: '#e2e8f0' }}
												/>
											</figure>
											<div>
												<h4 className="title is-6 mb-0 has-text-dark">${ member.name || member.display_name }</h4>
												<span className="tag is-light is-small mt-1">${ member.roles && member.roles[0] ? member.roles[0] : __( 'Specialist', 'workpress' ) }</span>
											</div>
										</div>

										<!-- Capacity Indicator -->
										<div className="p-2 mb-3" style=${{ backgroundColor: isHigh ? '#fef2f2' : ( isBalanced ? '#f0fdf4' : '#f8fafc' ), border: `1px solid ${ isHigh ? '#fecaca' : ( isBalanced ? '#bbf7d0' : '#e2e8f0' ) }` }}>
											<div className="is-flex is-justify-content-space-between is-align-items-center">
												<span className="is-size-7 has-text-weight-bold" style=${{ color: isHigh ? '#dc2626' : ( isBalanced ? '#16a34a' : '#475569' ) }}>
													${ isHigh ? __( '🔴 High Workload', 'workpress' ) : ( isBalanced ? __( '🟢 Balanced Workload', 'workpress' ) : __( '⚪ Available for Tasks', 'workpress' ) ) }
												</span>
												<strong className="is-size-7">${ member.activeTasks } ${ __( 'Active', 'workpress' ) }</strong>
											</div>
										</div>

										<!-- Micro Stats 2x2 -->
										<div className="wp-card-stats-grid mb-2">
											<div className="wp-card-stat-box">
												<span className="wp-stat-label"><i className="dashicons dashicons-clipboard has-text-primary"></i> ${ __( 'Assigned', 'workpress' ) }</span>
												<strong className="is-size-7">${ member.totalTasks }</strong>
											</div>
											<div className="wp-card-stat-box">
												<span className="wp-stat-label"><i className="dashicons dashicons-yes-alt has-text-success"></i> ${ __( 'Completed', 'workpress' ) }</span>
												<strong className="is-size-7">${ member.completedTasks }</strong>
											</div>
											<div className="wp-card-stat-box">
												<span className="wp-stat-label"><i className="dashicons dashicons-star-filled has-text-warning"></i> ${ __( 'Solutions', 'workpress' ) }</span>
												<strong className="is-size-7">${ member.solutionsCount } ⭐</strong>
											</div>
											<div className="wp-card-stat-box">
												<span className="wp-stat-label"><i className="dashicons dashicons-controls-play has-text-info"></i> ${ __( 'In Flight', 'workpress' ) }</span>
												<strong className="is-size-7">${ member.activeTasks }</strong>
											</div>
										</div>
									</div>
								</div>
							</div>
						`;
					} ) }
				</div>
			` }

			<!-- ترقيم الصفحات المتوافق مع كافة المجالات -->
			${ ! isLoading && totalItems > 0 && html`
				<div className="wp-reports-pagination-container">
					<div className="is-size-7 has-text-grey has-text-weight-semibold">
						${ sprintf( __( 'Showing %d - %d of %d items', 'workpress' ), startIndex + 1, endIndex, totalItems ) }
					</div>

					${ totalPages > 1 && html`
						<div className="wp-pagination-controls">
							<button
								type="button"
								className="wp-pagination-btn"
								disabled=${ validCurrentPage <= 1 }
								onClick=${ () => { setCurrentPage( prev => Math.max( 1, prev - 1 ) ); sound.play( 'click' ); } }
								title=${ __( 'Previous Page', 'workpress' ) }
							>
								<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` }></i>
							</button>

							${ getPageNumbers( validCurrentPage, totalPages ).map( ( p, idx ) => {
								if ( p === '...' ) return html`<span key=${ `el_${ idx }` } className="wp-pagination-ellipsis">…</span>`;
								return html`
									<button
										key=${ `p_${ p }` }
										type="button"
										className=${ `wp-pagination-num-btn ${ p === validCurrentPage ? 'is-active' : '' }` }
										onClick=${ () => { setCurrentPage( p ); sound.play( 'click' ); } }
									>
										${ p }
									</button>
								`;
							} ) }

							<button
								type="button"
								className="wp-pagination-btn"
								disabled=${ validCurrentPage >= totalPages }
								onClick=${ () => { setCurrentPage( prev => Math.min( totalPages, prev + 1 ) ); sound.play( 'click' ); } }
								title=${ __( 'Next Page', 'workpress' ) }
							>
								<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-right-alt2' }` }></i>
							</button>
						</div>
					` }
				</div>
			` }

			<!-- نافذة التقرير التنفيذي وكتاب المعرفة -->
			${ selectedProject && html`
				<${ReportModal}
					isActive=${ Boolean( selectedProject ) }
					onClose=${ () => setSelectedProject( null ) }
					projectId=${ selectedProject.id }
					initialTab=${ modalInitialTab }
				/>
			` }
		</div>
	`;
}
