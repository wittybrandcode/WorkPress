import { html, useState, useEffect, createPortal } from '../utils/html.js';
import { projectsApi, tasksApi, knowledgeApi, contributionsApi, usersApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import PriorityBadge from '../components/PriorityBadge.js';
import AvatarStack from '../components/AvatarStack.js';
import TaskModal from '../components/TaskModal.js';
import ProjectModal from '../components/ProjectModal.js';
import TaskAssignmentModal from '../components/TaskAssignmentModal.js';
import ContributionModal from '../components/ContributionModal.js';
import ContributionDetailModal from '../components/ContributionDetailModal.js';
import ProjectMembersModal from '../components/ProjectMembersModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
import ReportModal from '../components/ReportModal.js';
import Loader from '../components/Loader.js';

export default function DashboardPage() {
	const settings = window.workpressSettings || {};
	const currentUserId = parseInt( settings.userId, 10 ) || 0;
	const isSuperAdmin = !!settings.isAdmin;
	const userRoles = settings.userRoles || [];

	// Main Data State
	const [ projects, setProjects ] = useState( [] );
	const [ tasks, setTasks ] = useState( [] );
	const [ knowledge, setKnowledge ] = useState( [] );
	const [ contributions, setContributions ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	// Perspective State: 'admin', 'lead', 'member'
	const [ perspective, setPerspective ] = useState( 'admin' );

	// Modals State
	const [ isProjectModalOpen, setIsProjectModalOpen ] = useState( false );
	const [ isTaskModalOpen, setIsTaskModalOpen ] = useState( false );
	const [ selectedProject, setSelectedProject ] = useState( null );
	const [ selectedTask, setSelectedTask ] = useState( null );
	const [ reportModalProject, setReportModalProject ] = useState( null );
	
	const [ isAssignmentModalOpen, setIsAssignmentModalOpen ] = useState( false );
	const [ assignmentTask, setAssignmentTask ] = useState( null );

	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );
	const [ targetTaskForContribution, setTargetTaskForContribution ] = useState( null );

	const [ isDetailModalOpen, setIsDetailModalOpen ] = useState( false );
	const [ selectedContribution, setSelectedContribution ] = useState( null );

	const [ isMembersModalOpen, setIsMembersModalOpen ] = useState( false );
	const [ membersProject, setMembersProject ] = useState( null );

	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );

	// Search / Filter State for Projects Radar
	const [ projectFilter, setProjectFilter ] = useState( 'all' ); // 'all', 'active', 'completed', 'unassigned_lead'
	const [ knowledgeSearch, setKnowledgeSearch ] = useState( '' );

	const fetchData = () => {
		setIsLoading( true );
		Promise.all( [
			projectsApi.list(),
			tasksApi.list(),
			knowledgeApi.list(),
			contributionsApi.list( { number: 50 } )
		] ).then( ( [ prjs, tsks, knw, cntr ] ) => {
			const projectList = Array.isArray( prjs ) ? prjs : ( prjs.items || [] );
			const taskList = Array.isArray( tsks ) ? tsks : ( tsks.items || [] );
			const knowledgeList = Array.isArray( knw ) ? knw : ( knw.items || [] );
			const contribList = Array.isArray( cntr ) ? cntr : ( cntr.items || [] );

			setProjects( projectList );
			setTasks( taskList );
			setKnowledge( knowledgeList );
			setContributions( contribList );

			// Determine default perspective if first load
			if ( isSuperAdmin ) {
				setPerspective( 'admin' );
			} else {
				const isLeadOfAny = projectList.some( p => p.lead_id === currentUserId );
				if ( isLeadOfAny || userRoles.includes( 'editor' ) ) {
					setPerspective( 'lead' );
				} else {
					setPerspective( 'member' );
				}
			}
		} ).catch( err => {
			console.error( 'CoWorkPress data error:', err );
			toast( 'تعذر تحميل بيانات مساحة العمل', 'danger' );
		} ).finally( () => setIsLoading( false ) );
	};

	useEffect( () => {
		fetchData();
	}, [] );

	// Derive Subsets for Perspectives
	const totalProjectsCount = projects.length;
	const completedProjectsCount = projects.filter( p => p.is_completed || p.status === 'completed' ).length;
	const activeProjectsCount = totalProjectsCount - completedProjectsCount;

	const totalTasksCount = tasks.length;
	const completedTasksCount = tasks.filter( t => t.status === 'completed' || t.status === 'closed' ).length;
	const globalProgress = totalTasksCount > 0 ? Math.round( ( completedTasksCount / totalTasksCount ) * 100 ) : 0;

	// Pending Trash Items (Projects, Tasks, Contributions)
	const pendingTrashProjects = projects.filter( p => p.is_pending_trash );
	const pendingTrashTasks = tasks.filter( t => t.is_pending_trash );
	const pendingTrashContributions = contributions.filter( c => c.is_pending_trash );
	const totalPendingTrash = pendingTrashProjects.length + pendingTrashTasks.length + pendingTrashContributions.length;

	// Projects without Leads
	const unassignedLeadProjects = projects.filter( p => !p.lead_id || p.lead_id === 0 );

	// My Led Projects (for Lead Perspective)
	const myLedProjects = projects.filter( p => p.lead_id === currentUserId || ( isSuperAdmin && perspective === 'lead' ) );
	const myLedProjectIds = myLedProjects.map( p => p.id );

	// Pending Solutions awaiting Lead Review in my led projects
	const pendingSolutions = contributions.filter( c => 
		c.type === 'solution' && 
		!c.is_accepted && 
		( myLedProjectIds.includes( c.project_id ) || isSuperAdmin )
	);

	// Unassigned Tasks in my led projects
	const unassignedTasksInMyProjects = tasks.filter( t => 
		( t.status === 'new' || t.status === 'open' || t.status === 'pending' ) && 
		( !t.assignees || t.assignees.length === 0 ) && 
		( myLedProjectIds.includes( t.project_id ) || isSuperAdmin )
	);

	// My Assigned Tasks (for Member Perspective)
	const myAssignedTasks = tasks.filter( t => 
		t.assignees && t.assignees.some( a => ( typeof a === 'object' ? a.id === currentUserId : a === currentUserId ) )
	);
	const myAwaitingFirstActionTasks = myAssignedTasks.filter( t => t.status === 'assigned' || t.status === 'open' || t.status === 'new' || t.status === 'pending' );
	const myInProgressTasks = myAssignedTasks.filter( t => t.status === 'in_progress' || t.status === 'in_review' || t.status === 'review' );
	const myPendingTasks = myAssignedTasks.filter( t => t.status !== 'completed' && t.status !== 'closed' );
	const myCompletedTasks = myAssignedTasks.filter( t => t.status === 'completed' || t.status === 'closed' );

	// My Contributions History
	const myContributions = contributions.filter( c => c.user_id === currentUserId );

	// Filtered Projects for Admin Radar
	const filteredProjects = projects.filter( p => {
		if ( projectFilter === 'active' ) return !p.is_completed && p.status !== 'completed';
		if ( projectFilter === 'completed' ) return p.is_completed || p.status === 'completed';
		if ( projectFilter === 'unassigned_lead' ) return !p.lead_id || p.lead_id === 0;
		return true;
	} );

	// Filtered Knowledge for Member Perspective
	const filteredKnowledge = knowledge.filter( k => {
		if ( !knowledgeSearch.trim() ) return true;
		const query = knowledgeSearch.toLowerCase();
		return ( k.task_title && k.task_title.toLowerCase().includes( query ) ) ||
		       ( k.project_name && k.project_name.toLowerCase().includes( query ) ) ||
		       ( k.solution_content && k.solution_content.toLowerCase().includes( query ) );
	} );

	// Quick Action Helpers
	const openCreateTaskForProject = ( prj ) => {
		setSelectedProject( prj );
		setIsTaskModalOpen( true );
	};

	const openAssignLeadModal = ( prj ) => {
		setSelectedProject( prj );
		setIsProjectModalOpen( true );
	};

	const openTaskAssignment = ( task ) => {
		setAssignmentTask( task );
		setIsAssignmentModalOpen( true );
	};

	const openQuickContribution = ( task ) => {
		setTargetTaskForContribution( task );
		setIsContributionModalOpen( true );
	};

	const openContributionDetail = ( contrib ) => {
		setSelectedContribution( contrib );
		setIsDetailModalOpen( true );
	};

	const openProjectMembers = ( prj ) => {
		setMembersProject( prj );
		setIsMembersModalOpen( true );
	};

	// Handle Trash Actions
	const handleRestoreItem = ( entityType, id ) => {
		let apiCall;
		if ( entityType === 'task' ) apiCall = tasksApi.update( id, { is_pending_trash: false } );
		else if ( entityType === 'project' ) apiCall = projectsApi.update( id, { is_pending_trash: false } );
		else if ( entityType === 'contribution' ) apiCall = contributionsApi.update( id, { is_pending_trash: false } );

		if ( apiCall ) {
			apiCall.then( () => {
				toast( 'تم رفض طلب الحذف واستعادة العنصر بنجاح', 'success' );
				fetchData();
			} ).catch( () => toast( 'حدث خطأ أثناء الاستعادة', 'danger' ) );
		}
	};

	const handleDeleteItem = ( entityType, id ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'تأكيد الحذف النهائي',
			message: 'هل أنت متأكد من حذف هذا العنصر نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.',
			confirmText: 'حذف نهائي',
			confirmColor: 'is-danger',
			isDangerous: true,
			onConfirm: () => {
				let apiCall;
				if ( entityType === 'task' ) apiCall = tasksApi.delete( id );
				else if ( entityType === 'project' ) apiCall = projectsApi.delete( id );
				else if ( entityType === 'contribution' ) apiCall = contributionsApi.delete( id );

				if ( apiCall ) {
					apiCall.then( () => {
						toast( 'تم الحذف النهائي بنجاح', 'success' );
						setConfirmModalConfig( { isActive: false } );
						fetchData();
					} ).catch( () => {
						toast( 'حدث خطأ أثناء الحذف', 'danger' );
						setConfirmModalConfig( { isActive: false } );
					} );
				}
			}
		});
	};

	if ( isLoading ) {
		return html`
			<div className="admin-workspace py-6 mt-4">
				<${Loader} center=${true} label="جاري تحضير مساحة العمل CoWorkPress..." size="large" />
			</div>
		`;
	}

	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const perspectiveBar = html`
		<div className="wp-filter-toolbar">
			<!-- Perspective Switcher Tabs -->
			<div className="wp-filter-group is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<span className="wp-filter-label is-flex is-align-items-center" style=${{ color: '#64748b', fontSize: '0.8rem' }}>
					<i className="dashicons dashicons-networking ml-1" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
					<span>المنظور:</span>
				</span>

				<div className="buttons are-small mb-0" style=${{ gap: '4px' }}>
					${ isSuperAdmin && html`
						<button 
							type="button"
							className=${ `button wp-header-btn ${ perspective === 'admin' ? 'is-active' : '' }` }
							onClick=${ () => setPerspective( 'admin' ) }
							style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
						>
							<span className="icon is-small"><i className="dashicons dashicons-admin-generic"></i></span>
							<span className="has-text-weight-bold">الإدارة العليا</span>
						</button>
					` }
					${ ( isSuperAdmin || userRoles.includes('editor') || myLedProjects.length > 0 ) && html`
						<button 
							type="button"
							className=${ `button wp-header-btn ${ perspective === 'lead' ? 'is-active' : '' }` }
							onClick=${ () => setPerspective( 'lead' ) }
							style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
						>
							<span className="icon is-small"><i className="dashicons dashicons-businessman"></i></span>
							<span className="has-text-weight-bold">قيادة المشاريع</span>
						</button>
					` }
					<button 
						type="button"
						className=${ `button wp-header-btn ${ perspective === 'member' ? 'is-active' : '' }` }
						onClick=${ () => setPerspective( 'member' ) }
						style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
					>
						<span className="icon is-small"><i className="dashicons dashicons-edit"></i></span>
						<span className="has-text-weight-bold">مهامي وتنفيذي</span>
					</button>
				</div>
			</div>

			<!-- Lean Metrics on Left -->
			<div className="wp-filter-actions is-flex is-align-items-center">
				<span className="wp-filter-counter">
					<i className="dashicons dashicons-chart-pie" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
					${ totalProjectsCount } مشاريع • ${ globalProgress }% إنجاز (${ completedTasksCount }/${ totalTasksCount } مهمة)
				</span>
			</div>
		</div>
	`;

	return html`
		<div className="admin-workspace wp-cowork-plaza">
			
			${ portalRoot ? createPortal( perspectiveBar, portalRoot ) : perspectiveBar }

			<!-- ============================================================== -->
			<!-- PERSPECTIVE 1: SUPER ADMIN / EXECUTIVE COMMAND                 -->
			<!-- ============================================================== -->
			${ perspective === 'admin' && html`
				<div className="admin-perspective-view">
					
					<!-- Executive Top KPI Metrics Bar -->
					<div className="columns mb-5">
						<div className="column is-3">
							<div 
								className="box wp-card p-4 is-flex is-align-items-center is-justify-content-space-between wp-border"
								style=${{ cursor: 'pointer', transition: 'all 0.2s ease' }}
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
								className="box wp-card p-4 is-flex is-align-items-center is-justify-content-space-between wp-border"
								style=${{ cursor: 'pointer', transition: 'all 0.2s ease' }}
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
								className="box wp-card p-4 is-flex is-align-items-center is-justify-content-space-between wp-border"
								style=${{ cursor: 'pointer', transition: 'all 0.2s ease' }}
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
								className=${ `box wp-card p-4 is-flex is-align-items-center is-justify-content-space-between wp-border ${ totalPendingTrash > 0 ? 'has-background-danger-light' : '' }` }
								style=${{ cursor: 'pointer', transition: 'all 0.2s ease' }}
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
						<div className="box wp-card p-0 mb-5 wp-border" style=${{ borderLeft: '4px solid #ff3860' }}>
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
										<div className="box wp-card p-4 wp-border is-flex is-flex-direction-column h-100" style=${{ position: 'relative' }}>
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
			` }

			<!-- ============================================================== -->
			<!-- PERSPECTIVE 2: PROJECT LEAD COMMAND HUB                        -->
			<!-- ============================================================== -->
			${ perspective === 'lead' && html`
				<div className="lead-perspective-view">
					
					<!-- Lead Action Center: Solutions to Accept & Unassigned Tasks -->
					<div className="columns mb-5">
						
						<!-- Solutions Pending Approval Box -->
						<div className="column is-6">
							<div className="box wp-card p-0 h-100 wp-border">
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
							<div className="box wp-card p-0 h-100 wp-border">
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
										<div className="box wp-card p-4 wp-border is-flex is-flex-direction-column h-100">
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
			` }

			<!-- ============================================================== -->
			<!-- PERSPECTIVE 3: ASSIGNEE & FOCUS WORKBENCH                     -->
			<!-- ============================================================== -->
			${ perspective === 'member' && html`
				<div className="member-perspective-view">
					
					<!-- My Action Workbench: Tasks Assigned to Me -->
					<div className="columns mb-5">
						
						<!-- Tasks Awaiting My First Action -->
						<div className="column is-6">
							<div className="box wp-card p-0 h-100 wp-border">
								<div className="p-3 has-background-info-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
									<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
										<span className="icon ml-1 has-text-info"><i className="dashicons dashicons-edit"></i></span>
										<span>مهام مسندة إليك بانتظار مساهمتك الأولى</span>
									</h3>
									<span className="tag is-info has-text-weight-bold" style=${{ borderRadius: 0 }}>${ myAwaitingFirstActionTasks.length } مهمة</span>
								</div>
								<div className="p-4">
									${ myAwaitingFirstActionTasks.length === 0 ? html`
										<div className="has-text-centered py-4 has-text-grey">
											<span className="icon is-large mb-1"><i className="dashicons dashicons-yes-alt is-size-3"></i></span>
											<p className="is-size-7">رائع! لقد بدأت العمل في كافة المهام المسندة إليك.</p>
										</div>
									` : myAwaitingFirstActionTasks.map( t => html`
										<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
											<div className="wp-text-truncate" style=${{ maxWidth: '65%' }}>
												<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || 'مشروع' }</span>
												<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
												<span className="tag is-info is-light is-small mt-1" style=${{ borderRadius: 0 }}>مسندة</span>
											</div>
											<button 
												className="button is-small is-info wp-sharp-button"
												onClick=${ () => { setTargetTaskForContribution( t ); setIsContributionModalOpen( true ); } }
											>
												<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
												<span>بدء المساهمة</span>
											</button>
										</div>
									` ) }
								</div>
							</div>
						</div>

						<!-- My In-Progress Tasks Under Review -->
						<div className="column is-6">
							<div className="box wp-card p-0 h-100 wp-border">
								<div className="p-3 has-background-warning-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
									<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
										<span className="icon ml-1 has-text-warning"><i className="dashicons dashicons-hammer"></i></span>
										<span>مهامي الجارية قيد العمل والتنفيذ</span>
									</h3>
									<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0 }}>${ myInProgressTasks.length } مهمة</span>
								</div>
								<div className="p-4">
									${ myInProgressTasks.length === 0 ? html`
										<div className="has-text-centered py-4 has-text-grey">
											<span className="icon is-large mb-1"><i className="dashicons dashicons-clipboard is-size-3"></i></span>
											<p className="is-size-7">لا توجد مهام جارية حالياً.</p>
										</div>
									` : myInProgressTasks.map( t => html`
										<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
											<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
												<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || 'مشروع' }</span>
												<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
												<span className="tag is-warning is-light is-small mt-1" style=${{ borderRadius: 0 }}>قيد الإنجاز</span>
											</div>
											<a href=${ `#/tasks/${ t.id }` } className="button is-small is-white wp-border is-flex is-align-items-center">
												<span>متابعة المهمة</span>
												<span className="icon is-small mr-1"><i className="dashicons dashicons-arrow-left-alt2"></i></span>
											</a>
										</div>
									` ) }
								</div>
							</div>
						</div>

					</div>

					<!-- Knowledge Explorer for Specialists -->
					<div className="box wp-card p-0 mb-5 wp-border">
						<div className="p-3 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom has-background-light">
							<div className="is-flex is-align-items-center">
								<span className="icon ml-2 has-text-success"><i className="dashicons dashicons-book"></i></span>
								<h3 className="title is-6 mb-0 has-text-dark has-text-weight-bold">مستكشف المعرفة والحلول الملهمة (Knowledge Explorer)</h3>
							</div>
							<div className="field mb-0">
								<p className="control has-icons-right">
									<input 
										className="input is-small wp-sharp-input" 
										type="text" 
										placeholder="بحث في المعرفة والحلول المعتمدة..." 
										value=${ knowledgeSearch }
										onInput=${ (e) => setKnowledgeSearch( e.target.value ) }
										style=${{ width: '260px' }}
									/>
									<span className="icon is-small is-right"><i className="dashicons dashicons-search"></i></span>
								</p>
							</div>
						</div>
						<div className="p-4">
							<div className="columns is-multiline">
								${ filteredKnowledge.length === 0 ? html`
									<div className="column is-12 has-text-centered py-4 has-text-grey">
										لا توجد نتائج مطابقة لبحثك في المعرفة المعتمدة.
									</div>
								` : filteredKnowledge.slice( 0, 6 ).map( k => html`
									<div key=${ k.id } className="column is-4">
										<div className="box wp-card p-3 wp-border is-flex is-flex-direction-column h-100 has-background-white">
											<div className="is-flex is-justify-content-space-between is-align-items-center mb-1">
												<span className="tag is-success is-light is-small" style=${{ borderRadius: 0 }}><i className="dashicons dashicons-yes-alt ml-1"></i> حل معتمد</span>
												<span className="is-size-7 has-text-grey">${ k.project_name || 'عام' }</span>
											</div>
											<h5 className="title is-6 mb-2 wp-text-truncate">${ k.task_title || k.title || 'معرفة موثقة' }</h5>
											<div className="is-size-7 has-text-grey wp-text-truncate mb-2" dangerouslySetInnerHTML=${{ __html: k.content || '' }}></div>
											<div className="mt-auto pt-2 wp-border-top is-flex is-justify-content-space-between is-align-items-center is-size-7">
												<span className="has-text-grey">بواسطة: ${ k.author_name || 'فريق العمل' }</span>
												<a href="#/knowledge" className="has-text-success has-text-weight-bold is-flex is-align-items-center">
													<span>عرض كامل</span>
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
			` }

			<!-- Shared Modals across CoWorkPress -->
			<${ProjectModal} 
				isActive=${ isProjectModalOpen } 
				onClose=${ () => { setIsProjectModalOpen(false); setSelectedProject(null); } }
				onSave=${ fetchData }
				project=${ selectedProject }
			/>

			<${TaskModal} 
				isActive=${ isTaskModalOpen } 
				onClose=${ () => { setIsTaskModalOpen(false); setSelectedTask(null); } }
				onSave=${ fetchData }
				task=${ selectedTask }
			/>

			<${TaskAssignmentModal}
				isActive=${ isAssignmentModalOpen }
				onClose=${ () => { setIsAssignmentModalOpen(false); setAssignmentTask(null); fetchData(); } }
				task=${ assignmentTask }
			/>

			<${ContributionModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => { setIsContributionModalOpen(false); setTargetTaskForContribution(null); } }
				onSave=${ fetchData }
				defaultTaskId=${ targetTaskForContribution ? targetTaskForContribution.id : null }
			/>

			<${ContributionDetailModal}
				isActive=${ isDetailModalOpen }
				onClose=${ () => { setIsDetailModalOpen(false); setSelectedContribution(null); } }
				contribution=${ selectedContribution }
				onStatusChange=${ fetchData }
			/>

			<${ProjectMembersModal}
				isActive=${ isMembersModalOpen }
				onClose=${ () => { setIsMembersModalOpen(false); setMembersProject(null); fetchData(); } }
				project=${ membersProject }
			/>

			<${ConfirmModal}
				...${ confirmModalConfig }
				onClose=${ () => setConfirmModalConfig({ isActive: false }) }
			/>

			<${ReportModal}
				isActive=${ Boolean( reportModalProject ) }
				onClose=${ () => setReportModalProject( null ) }
				projectId=${ reportModalProject ? reportModalProject.id : null }
				projectName=${ reportModalProject ? reportModalProject.name : '' }
			/>

		</div>
	`;
}
