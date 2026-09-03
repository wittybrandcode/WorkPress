import { html, useState, useEffect, useRef, __ } from '../utils/html.js';
import { tasksApi, projectsApi } from '../api/client.js';
import TaskCard from '../components/tasks/TaskCard.js';
import TaskModal from '../components/tasks/TaskModal.js';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.js';
import ContributionModal from '../components/contributions/ContributionModal.js';
import TaskQuickPreviewModal from '../components/tasks/TaskQuickPreviewModal.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import FilterBar from '../components/ui/FilterBar.js';
import Loader from '../components/ui/Loader.js';
import { isStaffUser } from '../utils/userScope.js';
import { hooks } from '../utils/hooks.js';
import { toast } from '../utils/toast.js';

export default function KanbanPage({ refreshKey }) {
	const [ tasks, setTasks ] = useState( null );
	const [ projects, setProjects ] = useState( [] );
	const [ users, setUsers ] = useState( [] );
	const [ page, setPage ] = useState( 1 );
	const [ totalPages, setTotalPages ] = useState( 1 );
	const [ isLoadingMore, setIsLoadingMore ] = useState( false );
	const [ isDragging, setIsDragging ] = useState( false );
	const [ dragOverColumn, setDragOverColumn ] = useState( null );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isAssignmentModalOpen, setIsAssignmentModalOpen ] = useState( false );
	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );
	const [ isQuickPreviewModalOpen, setIsQuickPreviewModalOpen ] = useState( false );
	const [ assignmentTask, setAssignmentTask ] = useState( null );
	const [ targetTaskForContribution, setTargetTaskForContribution ] = useState( null );
	const [ selectedTask, setSelectedTask ] = useState( null );
	const [ quickPreviewTask, setQuickPreviewTask ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );

	// Filter States
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ selectedProject, setSelectedProject ] = useState( '' );
	const [ selectedAssignee, setSelectedAssignee ] = useState( '' );
	const [ selectedPriority, setSelectedPriority ] = useState( '' );

	// Load Projects & Users for filters
	useEffect( () => {
		projectsApi.list().then( data => {
			setProjects( Array.isArray( data ) ? data : ( data.items || [] ) );
		} ).catch( () => {} );

		if ( window.wp && window.wp.apiFetch ) {
			window.wp.apiFetch( { path: '/wp/v2/users?context=edit&roles=administrator,editor,author,contributor&per_page=100' } )
				.then( data => {
					const all = Array.isArray( data ) ? data : [];
					setUsers( all.filter( isStaffUser ) );
				} )
				.catch( () => {} );
		}
	}, [] );
	
	const fetchTasks = ( pageNum = 1, append = false ) => {
		if ( pageNum > 1 ) setIsLoadingMore( true );
		tasksApi.list( { page: pageNum, number: 20, withPagination: true } )
			.then( res => {
				setTotalPages( res.totalPages );
				setPage( pageNum );
				if ( append && tasks ) {
					// Merge ensuring no duplicates
					const newTasks = [...tasks];
					res.items.forEach( t => {
						if ( !newTasks.find( existing => existing.id === t.id ) ) {
							newTasks.push( t );
						}
					});
					setTasks( newTasks );
				} else {
					setTasks( res.items );
				}
			} )
			.catch( err => console.error(err) )
			.finally( () => setIsLoadingMore( false ) );
	};

	useEffect( () => {
		fetchTasks( 1, false );
	}, [refreshKey] );

	// Smart Background Polling
	const isPollingBlocked = useRef(false);
	useEffect( () => {
		isPollingBlocked.current = isDragging || isModalOpen || isAssignmentModalOpen || 
								   isContributionModalOpen || isQuickPreviewModalOpen || 
								   confirmModalConfig.isActive;
	}, [isDragging, isModalOpen, isAssignmentModalOpen, isContributionModalOpen, isQuickPreviewModalOpen, confirmModalConfig.isActive] );

	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! isPollingBlocked.current ) {
				// Silent fetch, no spinner
				tasksApi.list( { page: 1, number: 20 * page, withPagination: true } )
					.then( res => {
						setTasks( res.items );
					} ).catch( () => {} );
			}
		}, 15000 );
		return () => clearInterval( interval );
	}, [page] );

	const columns = [ 
		{ id: 'new', label: __( 'New / Unassigned', 'workpress' ), subtitle: __( 'Awaiting assignment and kickoff', 'workpress' ), icon: 'dashicons-tag', color: '#0f172a', bg: '#f8fafc', headerBg: '#f1f5f9', border: '#e2e8f0' }, 
		{ id: 'assigned', label: __( 'Assigned & Targeted', 'workpress' ), subtitle: __( 'Assigned members awaiting first contribution', 'workpress' ), icon: 'dashicons-admin-users', color: '#0f172a', bg: '#f8fafc', headerBg: '#f1f5f9', border: '#e2e8f0' }, 
		{ id: 'in_progress', label: __( 'In Progress & Collaboration', 'workpress' ), subtitle: __( 'Active contributions in execution', 'workpress' ), icon: 'dashicons-hammer', color: '#0f172a', bg: '#f8fafc', headerBg: '#f1f5f9', border: '#e2e8f0' }, 
		{ id: 'completed', label: __( 'Completed & Verified', 'workpress' ), subtitle: __( 'Approved solutions documented in knowledge base', 'workpress' ), icon: 'dashicons-yes-alt', color: '#0f172a', bg: '#f8fafc', headerBg: '#f1f5f9', border: '#e2e8f0' } 
	];

	const handleCloneTask = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: __( 'Confirm Task Clone', 'workpress' ),
			message: `${ __( 'Are you sure you want to clone task', 'workpress' ) } "${task.title}"?`,
			confirmText: __( 'Confirm', 'workpress' ),
			confirmColor: 'is-active',
			onConfirm: () => {
				tasksApi.create({
					title: task.title + ' (' + __( 'Copy', 'workpress' ) + ')',
					content: task.content,
					project_id: task.project_id,
					priority: task.priority
				}).then( () => {
					toast( __( 'Task cloned successfully', 'workpress' ), 'success' );
					fetchTasks();
				} ).catch( err => toast( err.message || __( 'An error occurred during restore', 'workpress' ), 'danger' ) );
				setConfirmModalConfig({ isActive: false });
			}
		});
	};

	const handleTrashRequest = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: __( 'Trash / Delete Request', 'workpress' ),
			message: `${ __( 'Are you sure you want to request trashing task', 'workpress' ) } "${task.title}"?`,
			confirmText: __( 'Submit Request', 'workpress' ),
			confirmColor: 'is-active',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: __( 'Reason for deletion', 'workpress' ),
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				tasksApi.trashRequest( task.id, reason )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( __( 'Trash request sent successfully.', 'workpress' ), 'info' );
						fetchTasks();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || __( 'Failed to send feedback, please try again.', 'workpress' ), 'danger' );
					} );
			}
		});
	};

	const handleRestoreTask = ( task ) => {
		setTasks( prev => prev.map( t => t.id === task.id ? { ...t, is_pending_trash: false } : t ) );
		tasksApi.update( task.id, { is_pending_trash: false } )
			.then( () => {
				toast( __( 'Task restored successfully', 'workpress' ), 'success' );
				fetchTasks();
			} )
			.catch( err => {
				toast( err.message || __( 'Failed to restore project', 'workpress' ), 'danger' );
				fetchTasks();
			} );
	};

	const handleDeleteTask = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: __( 'Confirm Permanent Deletion', 'workpress' ),
			message: __( 'Are you sure you want to permanently delete this item? This action cannot be undone.', 'workpress' ),
			confirmText: __( 'Delete Permanently', 'workpress' ),
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				setTasks( prev => prev.filter( t => t.id !== task.id ) );
				tasksApi.delete( task.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( __( 'Task permanently deleted', 'workpress' ), 'success' );
						fetchTasks();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger' );
						fetchTasks();
					} );
			}
		});
	};

	const projectOptions = [
		{ value: '', label: `-- ${ __( 'All Projects', 'workpress' ) } --` },
		...projects.map( p => ({ value: p.id, label: p.name }) )
	];

	const assigneeOptions = [
		{ value: '', label: `-- ${ __( 'Assignees', 'workpress' ) } --` },
		{ value: 'unassigned', label: __( 'Unassigned', 'workpress' ) },
		...users.map( u => ({ value: u.id, label: u.name }) )
	];

	const priorityOptions = [
		{ value: '', label: `-- ${ __( 'Priority', 'workpress' ) } --` },
		{ value: 'urgent', label: __( 'Critical', 'workpress' ) },
		{ value: 'high', label: __( 'High', 'workpress' ) },
		{ value: 'medium', label: __( 'Medium', 'workpress' ) },
		{ value: 'low', label: __( 'Low', 'workpress' ) }
	];

	const isFilterActive = Boolean( searchQuery || selectedProject || selectedAssignee || selectedPriority );

	const handleResetFilters = () => {
		setSearchQuery( '' );
		setSelectedProject( '' );
		setSelectedAssignee( '' );
		setSelectedPriority( '' );
	};

	const filterSingleTask = ( t ) => {
		if ( searchQuery ) {
			const q = searchQuery.toLowerCase();
			const matchTitle = ( t.title || '' ).toLowerCase().includes( q );
			const matchContent = ( t.content || '' ).toLowerCase().includes( q );
			if ( ! matchTitle && ! matchContent ) return false;
		}
		if ( selectedProject ) {
			if ( String( t.project_id ) !== String( selectedProject ) ) return false;
		}
		if ( selectedAssignee ) {
			if ( selectedAssignee === 'unassigned' ) {
				if ( t.assignees && t.assignees.length > 0 ) return false;
			} else {
				const hasUser = t.assignees && t.assignees.some( a => String( a.id || a ) === String( selectedAssignee ) );
				if ( ! hasUser ) return false;
			}
		}
		if ( selectedPriority ) {
			if ( t.priority !== selectedPriority ) return false;
		}
		return true;
	};

	const filteredTasks = tasks ? tasks.filter( filterSingleTask ) : [];

	const filterTasksForColumn = ( columnId ) => {
		return filteredTasks.filter( t => {
			if ( columnId === 'new' ) return t.status === 'new' || t.status === 'open';
			if ( columnId === 'assigned' ) return t.status === 'assigned';
			if ( columnId === 'in_progress' ) return t.status === 'in_progress' || t.status === 'in_review';
			if ( columnId === 'completed' ) return t.status === 'completed' || t.status === 'closed';
			return false;
		} );
	};

	if ( ! tasks ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label=${ __( 'Loading...', 'workpress' ) } size="large" />
			</div>
		`;
	}

	return html`
		<div className="admin-workspace wp-kanban-page">
			<${FilterBar}
				search=${{
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: __( 'Search tasks...', 'workpress' ),
				}}
				filters=${[
					{
						key: 'project',
						label: __( 'Project', 'workpress' ),
						icon: 'dashicons-category',
						value: selectedProject,
						onChange: setSelectedProject,
						options: projectOptions,
						isCustomSelect: true,
						width: '160px',
					},
					{
						key: 'assignee',
						label: __( 'Assignees', 'workpress' ),
						icon: 'dashicons-admin-users',
						value: selectedAssignee,
						onChange: setSelectedAssignee,
						users: users.filter( isStaffUser ),
						isMemberSelect: true,
						width: '160px',
					},
					{
						key: 'priority',
						label: __( 'Priority', 'workpress' ),
						icon: 'dashicons-flag',
						value: selectedPriority,
						onChange: setSelectedPriority,
						options: priorityOptions,
						width: '120px',
					}
				]}
				totalCount=${ filteredTasks.length }
				totalUnfiltered=${ tasks ? tasks.length : 0 }
				counterLabel=${ __( 'Task', 'workpress' ) }
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			<!-- Status-Colored High-Density Kanban Board -->
			<div className="columns is-mobile wp-kanban-board mx-0">
				${ columns.map( col => {
					const columnTasks = filterTasksForColumn( col.id );
					return html`
					<div 
						key=${ col.id } 
						className="column wp-kanban-column p-0 is-flex is-flex-direction-column"
						style=${{ 
							backgroundColor: '#f8fafc', 
							borderRadius: 0, 
							border: '1px solid #cbd5e1'
						}}
					>
						<!-- Column Header with Status Theme and Count Badge -->
						<div 
							className="px-3 py-2 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom" 
							style=${{ backgroundColor: '#f1f5f9', height: '40px', borderBottom: '1px solid #e2e8f0' }}
							title=${ col.subtitle }
						>
							<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<i className=${ `dashicons ${ col.icon }` } style=${{ fontSize: '16px', color: '#0f172a', width: '16px', height: '16px' }}></i>
								<h3 className="title is-6 mb-0 has-text-weight-bold has-text-dark" style=${{ fontSize: '0.86rem' }}>
									${ col.label }
								</h3>
							</div>

							<span className="wp-dense-chip" style=${{ height: '22px', padding: '0 8px', fontSize: '0.72rem', fontWeight: '800', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: 0 }}>
								${ columnTasks.length }
							</span>
						</div>
						<div className="p-3 wp-kanban-scroll is-flex-grow-1 is-flex is-flex-direction-column">
							${ columnTasks.length > 0 ? columnTasks.map( task => html`
								<${TaskCard} 
									key=${ task.id } 
									task=${ task } 
									draggable=${ false }
									onClick=${ () => window.location.hash = '#/tasks/' + task.id } 
									onManageAssignment=${ (t) => { setAssignmentTask(t); setIsAssignmentModalOpen(true); } }
									onAddContribution=${ (t) => { setTargetTaskForContribution(t); setIsContributionModalOpen(true); } }
									onClone=${ handleCloneTask }
									onTrashRequest=${ handleTrashRequest }
									onRestore=${ handleRestoreTask }
									onDelete=${ handleDeleteTask }
									onEdit=${ (t) => { setSelectedTask(t); setIsModalOpen(true); } }
									onQuickPreview=${ (t) => { setQuickPreviewTask(t); setIsQuickPreviewModalOpen(true); } }
								/>
							` ) : html`
								<div className="has-text-centered p-5 has-background-white wp-card wp-kanban-empty-state" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1' }}>
									<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
										<i className=${'dashicons ' + col.icon + ' has-text-grey'} style=${{ fontSize: '20px' }}></i>
									</div>
									<p className="is-size-7 has-text-grey-dark has-text-weight-bold mb-1">${ __( 'No tasks in this lane', 'workpress' ) }</p>
									<p className="is-size-7 has-text-grey mb-0">${ col.id === 'new' ? __( 'New tasks will appear here', 'workpress' ) : col.id === 'completed' ? __( 'Completed tasks appear here', 'workpress' ) : __( 'Active tasks in progress', 'workpress' ) }</p>
								</div>
							` }
						</div>
					</div>
				` } ) }
			</div>
			
			${ page < totalPages ? html`
				<div className="has-text-centered mt-5">
					<button 
						className=${ `button wp-btn is-white wp-border ${ isLoadingMore ? 'is-loading' : '' }` } 
						onClick=${ () => fetchTasks( page + 1, true ) }
					>
						${ __( 'Load More', 'workpress' ) }
					</button>
				</div>
			` : null }
			
			<${TaskModal} 
				isActive=${ isModalOpen } 
				onClose=${ () => { setIsModalOpen(false); setSelectedTask(null); } } 
				onSave=${ fetchTasks }
				task=${ selectedTask }
			/>
			<${TaskAssignmentModal}
				isActive=${ isAssignmentModalOpen }
				onClose=${ () => { setIsAssignmentModalOpen(false); fetchTasks(); } }
				task=${ assignmentTask }
			/>
			<${ContributionModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => setIsContributionModalOpen(false) }
				onSave=${ () => fetchTasks() }
				defaultTaskId=${ targetTaskForContribution ? targetTaskForContribution.id : null }
			/>
			<${TaskQuickPreviewModal}
				isActive=${ isQuickPreviewModalOpen }
				onClose=${ () => { setIsQuickPreviewModalOpen(false); setQuickPreviewTask(null); } }
				taskId=${ quickPreviewTask ? quickPreviewTask.id : null }
			/>
			<${ConfirmModal}
				...${ confirmModalConfig }
				onClose=${ () => setConfirmModalConfig({ isActive: false }) }
			/>
		</div>
	`;
}
