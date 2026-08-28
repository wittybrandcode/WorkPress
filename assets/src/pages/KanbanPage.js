import { html, useState, useEffect, useRef } from '../utils/html.js';
import { tasksApi, projectsApi } from '../api/client.js';
import TaskCard from '../components/tasks/TaskCard.js';
import TaskModal from '../components/modals/Modal.js';
import TaskAssignmentModal from '../components/modals/Modal.js';
import ContributionModal from '../components/modals/Modal.js';
import TaskQuickPreviewModal from '../components/modals/Modal.js';
import ConfirmModal from '../components/modals/Modal.js';
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
		{ id: 'new', label: 'Ø¬Ø¯ÙŠØ¯Ø© / ØºÙŠØ± Ù…Ø³Ù†Ø¯Ø©', subtitle: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„ØªÙƒÙ„ÙŠÙ ÙˆØ¨Ø¯Ø¡ Ø§Ù„Ø¹Ù…Ù„', icon: 'dashicons-tag', color: '#3b82f6', bg: '#f8fafc', headerBg: '#f1f5f9', border: '#e2e8f0' }, 
		{ id: 'assigned', label: 'Ù…Ø³Ù†Ø¯Ø© ÙˆÙ…Ø®ØµØµØ©', subtitle: 'Ù…ÙƒÙ„ÙÙˆÙ† Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø§Ù„Ø£ÙˆÙ„Ù‰', icon: 'dashicons-admin-users', color: '#0284c7', bg: '#f0f9ff', headerBg: '#e0f2fe', border: '#bae6fd' }, 
		{ id: 'in_progress', label: 'Ù‚ÙŠØ¯ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² ÙˆØ§Ù„ØªØ¹Ø§ÙˆÙ†', subtitle: 'Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ø¬Ø§Ø±ÙŠØ© Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°', icon: 'dashicons-hammer', color: '#d97706', bg: '#fffbeb', headerBg: '#fef3c7', border: '#fde68a' }, 
		{ id: 'completed', label: 'Ù…ÙƒØªÙ…Ù„Ø© ÙˆÙ…Ø¹ØªÙ…Ø¯Ø©', subtitle: 'Ø­Ù„ÙˆÙ„ Ù…Ø¹ØªÙ…Ø¯Ø© ÙˆÙ…ÙˆØ«Ù‚Ø© Ø¨Ø§Ù„Ù…Ø¹Ø±ÙØ©', icon: 'dashicons-awards', color: '#059669', bg: '#ecfdf5', headerBg: '#d1fae5', border: '#a7f3d0' } 
	];

	const handleCloneTask = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø§Ø³ØªÙ†Ø³Ø§Ø®',
			message: `Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø³ØªÙ†Ø³Ø§Ø® Ø§Ù„Ù…Ù‡Ù…Ø© "${task.title}"ØŸ`,
			confirmText: 'Ø§Ø³ØªÙ†Ø³Ø§Ø®',
			confirmColor: 'is-info',
			onConfirm: () => {
				tasksApi.create({
					title: task.title + ' (Ù†Ø³Ø®Ø©)',
					content: task.content,
					project_id: task.project_id,
					priority: task.priority
				}).then( () => {
					toast('ØªÙ… Ø§Ø³ØªÙ†Ø³Ø§Ø® Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success');
					fetchTasks();
				} ).catch( err => toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§Ø³ØªÙ†Ø³Ø§Ø®', 'danger') );
				setConfirmModalConfig({ isActive: false });
			}
		});
	};

	const handleTrashRequest = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'Ø·Ù„Ø¨ Ø­Ø°Ù Ù…Ù‡Ù…Ø©',
			message: `Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ù…Ù‡Ù…Ø© "${task.title}"ØŸ`,
			confirmText: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨',
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: 'Ø³Ø¨Ø¨ Ø­Ø°Ù Ø§Ù„Ù…Ù‡Ù…Ø©',
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				tasksApi.trashRequest( task.id, reason )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'info' );
						fetchTasks();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø°Ù', 'danger' );
					} );
			}
		});
	};

	const handleRestoreTask = ( task ) => {
		setTasks( prev => prev.map( t => t.id === task.id ? { ...t, is_pending_trash: false } : t ) );
		tasksApi.update( task.id, { is_pending_trash: false } )
			.then( () => {
				toast( 'ØªÙ…Øª Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
				fetchTasks();
			} )
			.catch( err => {
				toast( err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ù‡Ù…Ø©', 'danger' );
				fetchTasks();
			} );
	};

	const handleDeleteTask = ( task ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ Ù„Ù„Ù…Ù‡Ù…Ø©',
			message: `Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø© Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ ÙˆÙ†Ù‚Ù„Ù‡Ø§ Ù„Ø³Ù„Ø© Ø§Ù„Ù…Ù‡Ù…Ù„Ø§ØªØŸ`,
			confirmText: 'Ø­Ø°Ù',
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
						toast( 'ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
						fetchTasks();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­Ø°Ù', 'danger' );
						fetchTasks();
					} );
			}
		});
	};

	const projectOptions = [
		{ value: '', label: '-- Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ --' },
		...projects.map( p => ({ value: p.id, label: p.name }) )
	];

	const assigneeOptions = [
		{ value: '', label: '-- Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…ÙƒÙ„ÙÙŠÙ† --' },
		{ value: 'unassigned', label: 'ØºÙŠØ± Ù…Ø³Ù†Ø¯Ø©' },
		...users.map( u => ({ value: u.id, label: u.name }) )
	];

	const priorityOptions = [
		{ value: '', label: '-- Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ§Øª --' },
		{ value: 'urgent', label: 'Ø·Ø§Ø±Ø¦Ø©' },
		{ value: 'high', label: 'Ø¹Ø§Ù„ÙŠØ©' },
		{ value: 'medium', label: 'Ù…ØªÙˆØ³Ø·Ø©' },
		{ value: 'low', label: 'Ù…Ù†Ø®ÙØ¶Ø©' }
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
				<${Loader} center=${true} label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ù„ÙˆØ­Ø© Ø§Ù„ÙƒØ§Ù†Ø¨Ø§Ù†..." size="large" />
			</div>
		`;
	}

	return html`
		<div className="admin-workspace wp-kanban-page">
			<${FilterBar}
				search=${{
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: 'Ø¨Ø­Ø« Ø³Ø±ÙŠØ¹ ÙÙŠ Ø§Ù„Ù…Ù‡Ø§Ù…...',
				}}
				filters=${[
					{
						key: 'project',
						label: 'Ø§Ù„Ù…Ø´Ø±ÙˆØ¹',
						icon: 'dashicons-category',
						value: selectedProject,
						onChange: setSelectedProject,
						options: projectOptions,
						isCustomSelect: true,
						width: '160px',
					},
					{
						key: 'assignee',
						label: 'Ø§Ù„Ù…ÙƒÙ„Ù',
						icon: 'dashicons-admin-users',
						value: selectedAssignee,
						onChange: setSelectedAssignee,
						users: users.filter( isStaffUser ),
						isMemberSelect: true,
						width: '160px',
					},
					{
						key: 'priority',
						label: 'Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©',
						icon: 'dashicons-flag',
						value: selectedPriority,
						onChange: setSelectedPriority,
						options: priorityOptions,
						width: '120px',
					}
				]}
				totalCount=${ filteredTasks.length }
				totalUnfiltered=${ tasks ? tasks.length : 0 }
				counterLabel="Ù…Ù‡Ù…Ø©"
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
						className="column p-0 mx-2 wp-kanban-column"
						style=${{ 
							borderTop: `4px solid ${ col.color }`,
							backgroundColor: col.bg,
							border: `1px solid ${ col.border }`,
							borderTopWidth: '4px'
						}}
					>
						<!-- Column Header with Status Theme and Count Badge (No Add Icon) -->
						<div 
							className="px-3 py-2 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom" 
							style=${{ backgroundColor: col.headerBg, height: '40px', borderBottom: `1px solid ${ col.border }` }}
							title=${ col.subtitle }
						>
							<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<i className=${ `dashicons ${ col.icon }` } style=${{ fontSize: '16px', color: col.color, width: '16px', height: '16px' }}></i>
								<h3 className="title is-6 mb-0 has-text-weight-bold has-text-dark" style=${{ fontSize: '0.86rem' }}>
									${ col.label }
								</h3>
							</div>

							<span className="wp-dense-chip" style=${{ height: '20px', padding: '0 6px', fontSize: '0.7rem', fontWeight: '900', backgroundColor: '#ffffff', borderColor: col.border, color: col.color }}>
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
									<p className="is-size-7 has-text-grey-dark has-text-weight-bold mb-1">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³Ø§Ø±</p>
									<p className="is-size-7 has-text-grey mb-0">${ col.id === 'open' ? 'Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© ØªØ¸Ù‡Ø± Ù‡Ù†Ø§' : col.id === 'completed' ? 'ØªØ¸Ù‡Ø± Ù‡Ù†Ø§ Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©' : 'Ø§Ø³Ø­Ø¨ Ø§Ù„Ù…Ù‡Ø§Ù… Ø¥Ù„Ù‰ Ù‡Ù†Ø§' }</p>
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
						ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø²ÙŠØ¯
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
