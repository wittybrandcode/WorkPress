import { html, useState, useEffect, __ } from '../utils/html.js';
import { projectsApi, tasksApi, knowledgeApi, contributionsApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import Loader from '../components/ui/Loader.js';
import DashboardPerspectiveToolbar from '../components/dashboard/DashboardPerspectiveToolbar.js';
import AdminPerspectiveView from '../components/dashboard/AdminPerspectiveView.js';
import LeadPerspectiveView from '../components/dashboard/LeadPerspectiveView.js';
import MemberPerspectiveView from '../components/dashboard/MemberPerspectiveView.js';
import DashboardModals from '../components/dashboard/DashboardModals.js';

/**
 * WorkPress Executive Dashboard & Operational Hub (Lean Coordinator)
 *
 * @package WorkPress
 * @subpackage Pages/Dashboard
 * @version 2.3.0
 */
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

	// Search / Filter State
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
			toast( __( 'Failed to load workspace data', 'workpress' ), 'danger' );
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

	// Pending Trash Items
	const pendingTrashTasks = tasks.filter( t => t.is_pending_trash );
	const totalPendingTrash = projects.filter( p => p.is_pending_trash ).length + 
		pendingTrashTasks.length + 
		contributions.filter( c => c.is_pending_trash ).length;

	// Projects without Leads
	const unassignedLeadProjects = projects.filter( p => !p.lead_id || p.lead_id === 0 );

	// My Led Projects (for Lead Perspective)
	const myLedProjects = projects.filter( p => p.lead_id === currentUserId || ( isSuperAdmin && perspective === 'lead' ) );
	const myLedProjectIds = myLedProjects.map( p => p.id );

	// Pending Solutions awaiting Lead Review
	const pendingSolutions = contributions.filter( c => 
		c.type === 'solution' && 
		!c.is_accepted && 
		( myLedProjectIds.includes( c.project_id ) || isSuperAdmin )
	);

	// Unassigned Tasks in led projects
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

	// Handle Trash Actions
	const handleRestoreItem = ( entityType, id ) => {
		let apiCall;
		if ( entityType === 'task' ) apiCall = tasksApi.update( id, { is_pending_trash: false } );
		else if ( entityType === 'project' ) apiCall = projectsApi.update( id, { is_pending_trash: false } );
		else if ( entityType === 'contribution' ) apiCall = contributionsApi.update( id, { is_pending_trash: false } );

		if ( apiCall ) {
			apiCall.then( () => {
				toast( __( 'Trash request rejected and item restored successfully', 'workpress' ), 'success' );
				fetchData();
			} ).catch( () => toast( __( 'An error occurred during restore', 'workpress' ), 'danger' ) );
		}
	};

	const handleDeleteItem = ( entityType, id ) => {
		setConfirmModalConfig({
			isActive: true,
			title: __( 'Confirm Permanent Deletion', 'workpress' ),
			message: __( 'Are you sure you want to permanently delete this item? This action cannot be undone.', 'workpress' ),
			confirmText: __( 'Delete Permanently', 'workpress' ),
			confirmColor: 'is-danger',
			isDangerous: true,
			onConfirm: () => {
				let apiCall;
				if ( entityType === 'task' ) apiCall = tasksApi.delete( id );
				else if ( entityType === 'project' ) apiCall = projectsApi.delete( id );
				else if ( entityType === 'contribution' ) apiCall = contributionsApi.delete( id );

				if ( apiCall ) {
					apiCall.then( () => {
						toast( __( 'Permanently deleted successfully', 'workpress' ), 'success' );
						setConfirmModalConfig( { isActive: false } );
						fetchData();
					} ).catch( () => {
						toast( __( 'An error occurred during deletion', 'workpress' ), 'danger' );
						setConfirmModalConfig( { isActive: false } );
					} );
				}
			}
		});
	};

	if ( isLoading ) {
		return html`
			<div className="admin-workspace py-6 mt-4">
				<${Loader} center=${true} label=${ __( 'Loading Workspace...', 'workpress' ) } size="large" />
			</div>
		`;
	}

	return html`
		<div className="admin-workspace wp-cowork-plaza wp-dashboard-root">
			<!-- Perspective Selector Header -->
			<${DashboardPerspectiveToolbar}
				isSuperAdmin=${isSuperAdmin}
				userRoles=${userRoles}
				myLedProjects=${myLedProjects}
				perspective=${perspective}
				setPerspective=${setPerspective}
				totalProjectsCount=${totalProjectsCount}
				globalProgress=${globalProgress}
				completedTasksCount=${completedTasksCount}
				totalTasksCount=${totalTasksCount}
			/>

			<!-- Perspective 1: Super Admin / Executive Command -->
			${ perspective === 'admin' && html`
				<${AdminPerspectiveView}
					totalProjectsCount=${totalProjectsCount}
					activeProjectsCount=${activeProjectsCount}
					completedProjectsCount=${completedProjectsCount}
					globalProgress=${globalProgress}
					completedTasksCount=${completedTasksCount}
					totalTasksCount=${totalTasksCount}
					knowledge=${knowledge}
					totalPendingTrash=${totalPendingTrash}
					pendingTrashTasks=${pendingTrashTasks}
					unassignedLeadProjects=${unassignedLeadProjects}
					projects=${projects}
					filteredProjects=${filteredProjects}
					projectFilter=${projectFilter}
					setProjectFilter=${setProjectFilter}
					handleRestoreItem=${handleRestoreItem}
					handleDeleteItem=${handleDeleteItem}
					setSelectedProject=${setSelectedProject}
					setIsProjectModalOpen=${setIsProjectModalOpen}
					setMembersProject=${setMembersProject}
					setIsMembersModalOpen=${setIsMembersModalOpen}
					setReportModalProject=${setReportModalProject}
				/>
			`}

			<!-- Perspective 2: Project Lead Command Hub -->
			${ perspective === 'lead' && html`
				<${LeadPerspectiveView}
					pendingSolutions=${pendingSolutions}
					setSelectedContribution=${setSelectedContribution}
					setIsDetailModalOpen=${setIsDetailModalOpen}
					unassignedTasksInMyProjects=${unassignedTasksInMyProjects}
					setAssignmentTask=${setAssignmentTask}
					setIsAssignmentModalOpen=${setIsAssignmentModalOpen}
					myLedProjects=${myLedProjects}
					setSelectedTask=${setSelectedTask}
					setIsTaskModalOpen=${setIsTaskModalOpen}
				/>
			`}

			<!-- Perspective 3: Assignee & Focus Workbench -->
			${ perspective === 'member' && html`
				<${MemberPerspectiveView}
					myAwaitingFirstActionTasks=${myAwaitingFirstActionTasks}
					setTargetTaskForContribution=${setTargetTaskForContribution}
					setIsContributionModalOpen=${setIsContributionModalOpen}
					myInProgressTasks=${myInProgressTasks}
					filteredKnowledge=${filteredKnowledge}
					knowledgeSearch=${knowledgeSearch}
					setKnowledgeSearch=${setKnowledgeSearch}
				/>
			`}

			<!-- Shared Operations Modals -->
			<${DashboardModals}
				isProjectModalOpen=${isProjectModalOpen}
				setIsProjectModalOpen=${setIsProjectModalOpen}
				selectedProject=${selectedProject}
				setSelectedProject=${setSelectedProject}
				isTaskModalOpen=${isTaskModalOpen}
				setIsTaskModalOpen=${setIsTaskModalOpen}
				selectedTask=${selectedTask}
				setSelectedTask=${setSelectedTask}
				isAssignmentModalOpen=${isAssignmentModalOpen}
				setIsAssignmentModalOpen=${setIsAssignmentModalOpen}
				assignmentTask=${assignmentTask}
				setAssignmentTask=${setAssignmentTask}
				isContributionModalOpen=${isContributionModalOpen}
				setIsContributionModalOpen=${setIsContributionModalOpen}
				targetTaskForContribution=${targetTaskForContribution}
				setTargetTaskForContribution=${setTargetTaskForContribution}
				isDetailModalOpen=${isDetailModalOpen}
				setIsDetailModalOpen=${setIsDetailModalOpen}
				selectedContribution=${selectedContribution}
				setSelectedContribution=${setSelectedContribution}
				isMembersModalOpen=${isMembersModalOpen}
				setIsMembersModalOpen=${setIsMembersModalOpen}
				membersProject=${membersProject}
				setMembersProject=${setMembersProject}
				confirmModalConfig=${confirmModalConfig}
				setConfirmModalConfig=${setConfirmModalConfig}
				reportModalProject=${reportModalProject}
				setReportModalProject=${setReportModalProject}
				fetchData=${fetchData}
			/>
		</div>
	`;
}
