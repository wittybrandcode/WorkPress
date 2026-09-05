import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../utils/html.js';
import { tasksApi, projectsApi } from '../api/client.js';
import sound from '../utils/sound.js';
import TaskCard from '../components/tasks/TaskCard.js';
import TaskModal from '../components/tasks/TaskModal.js';
import TaskAssignmentModal from '../components/tasks/TaskAssignmentModal.js';
import ContributionModal from '../components/contributions/ContributionModal.js';
import TaskQuickPreviewModal from '../components/tasks/TaskQuickPreviewModal.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import TaskFilterBar from '../components/tasks/TaskFilterBar.js';
import Loader from '../components/ui/Loader.js';
import { isStaffUser } from '../utils/userScope.js';
import { hooks } from '../utils/hooks.js';
import { toast } from '../utils/toast.js';

// Status mapping for independent column data streams
const colStatusMap = {
	new: 'new,open',
	assigned: 'assigned',
	in_progress: 'in_progress,in_review',
	completed: 'completed,closed'
};

const initialColumnsData = {
	new: { items: [], page: 1, totalPages: 1, total: 0, loading: false, loaded: false },
	assigned: { items: [], page: 1, totalPages: 1, total: 0, loading: false, loaded: false },
	in_progress: { items: [], page: 1, totalPages: 1, total: 0, loading: false, loaded: false },
	completed: { items: [], page: 1, totalPages: 1, total: 0, loading: false, loaded: false }
};

export default function KanbanPage({ refreshKey }) {
	// Independent Column Data Streams State
	const [ columnsData, setColumnsData ] = useState( initialColumnsData );
	const columnsDataRef = useRef( initialColumnsData );

	useEffect( () => {
		columnsDataRef.current = columnsData;
	}, [ columnsData ] );

	const [ projects, setProjects ] = useState( [] );
	const [ users, setUsers ] = useState( [] );
	const [ isDragging, setIsDragging ] = useState( false );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isAssignmentModalOpen, setIsAssignmentModalOpen ] = useState( false );
	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );
	const [ isQuickPreviewModalOpen, setIsQuickPreviewModalOpen ] = useState( false );
	const [ assignmentTask, setAssignmentTask ] = useState( null );
	const [ targetTaskForContribution, setTargetTaskForContribution ] = useState( null );
	const [ selectedTask, setSelectedTask ] = useState( null );
	const [ quickPreviewTask, setQuickPreviewTask ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );

	// Per-column Folding State (ايقونة طي الصناديق مستقلة لكل كانبان)
	const [ foldedColumns, setFoldedColumns ] = useState( () => {
		try {
			const saved = localStorage.getItem( 'workpress_kanban_folded_cols' );
			return saved ? JSON.parse( saved ) : {};
		} catch ( e ) {
			return {};
		}
	} );

	// Per-task Individual Unfold State when lane is folded (فتح الصندوق المطوي بزر التوسيع)
	const [ expandedTaskIds, setExpandedTaskIds ] = useState( {} );

	const toggleTaskCardExpand = ( taskId ) => {
		setExpandedTaskIds( prev => ({
			...prev,
			[taskId]: ! prev[taskId]
		}) );
		sound.play( 'click' );
	};

	// Per-Column Quick Search (خانة بحث سريعة في أعلى كل كانبان)
	const [ columnSearchQueries, setColumnSearchQueries ] = useState( {} );

	const toggleColumnFold = ( colId ) => {
		setFoldedColumns( prev => {
			const next = { ...prev, [colId]: ! prev[colId] };
			try {
				localStorage.setItem( 'workpress_kanban_folded_cols', JSON.stringify( next ) );
			} catch ( e ) {}
			sound.play( 'click' );
			return next;
		} );
	};

	// Lock page vertical scroll and reset viewport to top while Kanban view is active
	useEffect( () => {
		window.scrollTo( 0, 0 );
		document.body.classList.add( 'wp-kanban-view-active' );
		document.documentElement.classList.add( 'wp-kanban-view-active' );
		return () => {
			document.body.classList.remove( 'wp-kanban-view-active' );
			document.documentElement.classList.remove( 'wp-kanban-view-active' );
		};
	}, [] );

	const rtl = isRtl();

	// Master Filter States (مرتبطة بقاعدة البيانات في كل عمود)
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' );
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

	const columns = [ 
		{ 
			id: 'new', 
			label: __( 'New / Unassigned', 'workpress' ), 
			subtitle: __( 'Awaiting assignment and kickoff', 'workpress' ), 
			icon: 'dashicons-tag', 
			bg: '#f1f5f9', 
			headerBg: '#ffffff', 
			border: '#cbd5e1' 
		}, 
		{ 
			id: 'assigned', 
			label: __( 'Assigned & Targeted', 'workpress' ), 
			subtitle: __( 'Assigned members awaiting first contribution', 'workpress' ), 
			icon: 'dashicons-admin-users', 
			bg: '#f1f5f9', 
			headerBg: '#ffffff', 
			border: '#cbd5e1' 
		}, 
		{ 
			id: 'in_progress', 
			label: __( 'In Progress & Collaboration', 'workpress' ), 
			subtitle: __( 'Active contributions in execution', 'workpress' ), 
			icon: 'dashicons-hammer', 
			bg: '#f1f5f9', 
			headerBg: '#ffffff', 
			border: '#cbd5e1' 
		}, 
		{ 
			id: 'completed', 
			label: __( 'Completed & Verified', 'workpress' ), 
			subtitle: __( 'Approved solutions documented in knowledge base', 'workpress' ), 
			icon: 'dashicons-yes-alt', 
			bg: '#f1f5f9', 
			headerBg: '#ffffff', 
			border: '#cbd5e1' 
		} 
	];

	const columnScrollRefs = useRef( {} );

	// Fetch tasks for a specific column independently (جلب مستقل لكل كانبان)
	const fetchLaneTasks = ( colId, pageNum = 1, append = false ) => {
		const currentLane = columnsDataRef.current[colId];
		if ( append && ( currentLane.loading || pageNum > currentLane.totalPages ) ) {
			return Promise.resolve();
		}

		setColumnsData( prev => ({
			...prev,
			[colId]: { ...prev[colId], loading: true }
		}) );

		const params = {
			status: colStatusMap[colId],
			page: pageNum,
			number: 20,
			withPagination: true
		};

		if ( selectedProject ) params.project_id = selectedProject;
		if ( selectedPriority ) params.priority = selectedPriority;
		if ( selectedAssignee ) params.assignee = selectedAssignee;
		if ( searchQuery ) params.search = searchQuery;

		return tasksApi.list( params )
			.then( res => {
				setColumnsData( prev => {
					const existing = prev[colId] || {};
					let newItems = res.items || [];
					if ( append ) {
						const currentItems = existing.items || [];
						const merged = [ ...currentItems ];
						newItems.forEach( t => {
							if ( ! merged.some( e => e.id === t.id ) ) {
								merged.push( t );
							}
						} );
						newItems = merged;
					}

					return {
						...prev,
						[colId]: {
							items: newItems,
							page: pageNum,
							totalPages: res.totalPages || 1,
							total: typeof res.total === 'number' ? res.total : ( res.items ? res.items.length : 0 ),
							loading: false,
							loaded: true
						}
					};
				} );
			} )
			.catch( err => {
				console.error( 'Error fetching lane ' + colId, err );
				setColumnsData( prev => ({
					...prev,
					[colId]: { ...prev[colId], loading: false, loaded: true }
				}) );
			} );
	};

	// Fetch all lanes concurrently
	const fetchAllLanes = () => {
		return Promise.all( [
			fetchLaneTasks( 'new', 1, false ),
			fetchLaneTasks( 'assigned', 1, false ),
			fetchLaneTasks( 'in_progress', 1, false ),
			fetchLaneTasks( 'completed', 1, false ),
		] );
	};

	// Trigger full refresh on filter change or refreshKey
	useEffect( () => {
		fetchAllLanes();
	}, [ refreshKey, selectedProject, selectedPriority, selectedAssignee, searchQuery ] );

	// Independent Column Scroll Container Handler (التمرير المستقل لكل عمود)
	const handleColumnScroll = ( colId, e ) => {
		const lane = columnsDataRef.current[colId];
		if ( ! lane || lane.loading || lane.page >= lane.totalPages ) return;
		const el = e.currentTarget;
		if ( el.scrollHeight - el.scrollTop - el.clientHeight < 120 ) {
			fetchLaneTasks( colId, lane.page + 1, true );
		}
	};

	// Auto-fill individual lanes when folding collapses heights and no scrollbar exists
	useEffect( () => {
		columns.forEach( col => {
			if ( ! foldedColumns[col.id] ) return;
			const lane = columnsDataRef.current[col.id];
			if ( ! lane || lane.loading || lane.page >= lane.totalPages ) return;
			const el = columnScrollRefs.current[col.id];
			if ( ! el ) return;
			if ( el.scrollHeight <= el.clientHeight + 40 ) {
				fetchLaneTasks( col.id, lane.page + 1, true );
			}
		} );
	}, [ columnsData, foldedColumns ] );

	// Smart Background Polling (Silent refresh per lane)
	const isPollingBlocked = useRef(false);
	useEffect( () => {
		isPollingBlocked.current = isDragging || isModalOpen || isAssignmentModalOpen || 
								   isContributionModalOpen || isQuickPreviewModalOpen || 
								   confirmModalConfig.isActive;
	}, [isDragging, isModalOpen, isAssignmentModalOpen, isContributionModalOpen, isQuickPreviewModalOpen, confirmModalConfig.isActive] );

	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! isPollingBlocked.current ) {
				columns.forEach( col => {
					const lane = columnsDataRef.current[col.id];
					const pageSize = lane ? Math.max( 20, lane.items.length ) : 20;
					const params = {
						status: colStatusMap[col.id],
						page: 1,
						number: pageSize,
						withPagination: true
					};
					if ( selectedProject ) params.project_id = selectedProject;
					if ( selectedPriority ) params.priority = selectedPriority;
					if ( selectedAssignee ) params.assignee = selectedAssignee;
					if ( searchQuery ) params.search = searchQuery;

					tasksApi.list( params ).then( res => {
						setColumnsData( prev => ({
							...prev,
							[col.id]: {
								...prev[col.id],
								items: res.items || [],
								total: typeof res.total === 'number' ? res.total : ( res.items ? res.items.length : 0 ),
								totalPages: res.totalPages || 1
							}
						}) );
					} ).catch( () => {} );
				} );
			}
		}, 15000 );
		return () => clearInterval( interval );
	}, [ selectedProject, selectedPriority, selectedAssignee, searchQuery ] );

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
					priority: task.priority,
					estimated_hours: task.estimated_hours || 0,
					cover_id: task.cover_id || 0
				}).then( () => {
					toast( __( 'Task cloned successfully', 'workpress' ), 'success' );
					fetchAllLanes();
				} ).catch( err => toast( err.message || __( 'Failed to clone task', 'workpress' ), 'danger' ) );
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
						fetchAllLanes();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || __( 'Failed to send feedback, please try again.', 'workpress' ), 'danger' );
					} );
			}
		});
	};

	const handleRestoreTask = ( task ) => {
		tasksApi.update( task.id, { is_pending_trash: false } )
			.then( () => {
				toast( __( 'Task restored successfully', 'workpress' ), 'success' );
				fetchAllLanes();
			} )
			.catch( err => {
				toast( err.message || __( 'Failed to restore task', 'workpress' ), 'danger' );
				fetchAllLanes();
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
				tasksApi.delete( task.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( __( 'Task permanently deleted', 'workpress' ), 'success' );
						fetchAllLanes();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger' );
						fetchAllLanes();
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

	// Accurate Totals directly from Database Responses
	const totalCount = ( columnsData.new.total || 0 ) + 
					   ( columnsData.assigned.total || 0 ) + 
					   ( columnsData.in_progress.total || 0 ) + 
					   ( columnsData.completed.total || 0 );
	const newCount = columnsData.new.total || 0;
	const assignedCount = columnsData.assigned.total || 0;
	const inProgressCount = columnsData.in_progress.total || 0;
	const completedCount = columnsData.completed.total || 0;

	const isFilterActive = Boolean( ( selectedStatus && selectedStatus !== 'all' ) || searchQuery || selectedProject || selectedAssignee || selectedPriority );

	const handleResetFilters = () => {
		setSelectedStatus( 'all' );
		setSearchQuery( '' );
		setSelectedProject( '' );
		setSelectedAssignee( '' );
		setSelectedPriority( '' );
	};

	const isInitialLoading = ! columnsData.new.loaded && 
							 ! columnsData.assigned.loaded && 
							 ! columnsData.in_progress.loaded && 
							 ! columnsData.completed.loaded;

	if ( isInitialLoading ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label=${ __( 'Loading Kanban...', 'workpress' ) } size="large" />
			</div>
		`;
	}

	// Determine visible columns according to selected status filter
	const visibleColumns = ( selectedStatus && selectedStatus !== 'all' )
		? columns.filter( col => col.id === selectedStatus )
		: columns;

	return html`
		<div className="admin-workspace wp-kanban-page">
			<!-- 1. Master Unified Toolbar (Constitution §2.7) -->
			<${TaskFilterBar}
				totalCount=${ totalCount }
				newCount=${ newCount }
				assignedCount=${ assignedCount }
				inProgressCount=${ inProgressCount }
				completedCount=${ completedCount }
				selectedStatus=${ selectedStatus }
				setSelectedStatus=${ setSelectedStatus }
				searchQuery=${ searchQuery }
				setSearchQuery=${ setSearchQuery }
				selectedProject=${ selectedProject }
				setSelectedProject=${ setSelectedProject }
				projectOptions=${ projectOptions }
				selectedAssignee=${ selectedAssignee }
				setSelectedAssignee=${ setSelectedAssignee }
				users=${ users }
				selectedPriority=${ selectedPriority }
				setSelectedPriority=${ setSelectedPriority }
				priorityOptions=${ priorityOptions }
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			<!-- 2. Fixed-Height Kanban Board with Independent Column Streams -->
			<div className="wp-kanban-board is-flex">
				${ visibleColumns.map( col => {
					const laneData = columnsData[col.id] || { items: [], loading: false, total: 0, page: 1, totalPages: 1 };
					const isColFolded = Boolean( foldedColumns[col.id] );
					const loadedCount = ( laneData.items || [] ).length;
					const totalCount = typeof laneData.total === 'number' ? laneData.total : 0;
					const isAllLoaded = totalCount > 0 && loadedCount >= totalCount;

					// Per-Column Quick Search Filter (Instant in-memory filter on loaded lane items)
					const colQuery = ( columnSearchQueries[col.id] || '' ).trim().toLowerCase();
					const columnTasks = colQuery ? laneData.items.filter( t => {
						const matchTitle = ( t.title || '' ).toLowerCase().includes( colQuery );
						const matchContent = ( t.content || '' ).toLowerCase().includes( colQuery );
						const matchProject = ( t.project_name || '' ).toLowerCase().includes( colQuery );
						return matchTitle || matchContent || matchProject;
					} ) : laneData.items;

					return html`
					<div 
						key=${ col.id } 
						className="wp-kanban-column is-flex is-flex-direction-column"
						style=${{ 
							flex: '1 1 0',
							minWidth: '280px',
							height: '100%',
							maxHeight: '100%',
							overflow: 'hidden',
							backgroundColor: col.bg, 
							borderRadius: 0, 
							border: '1px solid #cbd5e1',
							boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
						}}
					>
						<!-- Column Header with Accurate Real-Count Badge and Dedicated Folding Toggle -->
						<div 
							className="px-3 py-2 is-flex is-justify-content-space-between is-align-items-center" 
							style=${{ backgroundColor: col.headerBg, height: '42px', borderBottom: '1px solid #cbd5e1', flexShrink: 0 }}
							title=${ col.subtitle }
						>
							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<i className=${ `dashicons ${ col.icon }` } style=${{ fontSize: '16px', color: '#0f172a', width: '16px', height: '16px' }}></i>
								<h3 className="title is-6 mb-0 has-text-weight-bold" style=${{ fontSize: '0.86rem', color: '#0f172a' }}>
									${ col.label }
								</h3>
							</div>

							<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<!-- Accurate Real-Count Database Badge (Loaded / Total) -->
								<span 
									className="wp-dense-chip" 
									style=${{ 
										height: '22px', 
										padding: '0 8px', 
										fontSize: '0.72rem', 
										fontWeight: '800', 
										backgroundColor: isAllLoaded ? '#ecfdf5' : '#f1f5f9', 
										border: `1px solid ${ isAllLoaded ? '#a7f3d0' : '#cbd5e1' }`, 
										color: isAllLoaded ? '#047857' : '#0f172a', 
										borderRadius: 0,
										display: 'inline-flex',
										alignItems: 'center',
										gap: '4px',
										transition: 'all 0.2s ease'
									}} 
									title=${ isAllLoaded 
										? sprintf( __( 'All %1$d tasks in this status are loaded', 'workpress' ), totalCount ) 
										: sprintf( __( '%1$d of %2$d tasks loaded in this status', 'workpress' ), loadedCount, totalCount ) 
									}
								>
									${ isAllLoaded && html`
										<i className="dashicons dashicons-yes" style=${{ fontSize: '11px', width: '11px', height: '11px', lineHeight: '11px', color: '#10b981' }}></i>
									` }
									<span>
										${ colQuery 
											? `${ columnTasks.length } / ${ totalCount }` 
											: ( totalCount > 0 ? `${ loadedCount } / ${ totalCount }` : '0' ) 
										}
									</span>
								</span>

								<!-- Dedicated Per-Column Folding Button (زر طي وتوسيع مربع منضبط) -->
								<button
									type="button"
									className=${ `wp-icon-btn is-small wp-kanban-fold-btn ${ isColFolded ? 'is-active' : '' }` }
									onClick=${ (e) => { e.stopPropagation(); toggleColumnFold(col.id); } }
									title=${ isColFolded ? __( 'Expand Lane (Show Images & Details)', 'workpress' ) : __( 'Fold Lane (Hide Images - Dense View)', 'workpress' ) }
								>
									<i className=${ `dashicons ${ isColFolded ? 'dashicons-arrow-down-alt2' : 'dashicons-arrow-up-alt2' }` }></i>
								</button>
							</div>
						</div>

						<!-- Per-Column Quick Search Box (خانة بحث سريعة في اعلى كل كانبان) -->
						<div 
							className="px-2 py-1 wp-kanban-col-search" 
							style=${{ backgroundColor: '#ffffff', borderBottom: '1px solid #cbd5e1', flexShrink: 0 }}
						>
							<div className="control has-icons-left has-icons-right" style=${{ width: '100%', position: 'relative' }}>
								<input 
									type="text" 
									className="input is-small wp-input" 
									style=${{ 
										height: '28px', 
										fontSize: '0.74rem', 
										borderRadius: 0, 
										backgroundColor: '#f8fafc',
										borderColor: '#cbd5e1',
										color: '#0f172a',
										paddingInlineStart: '28px', 
										paddingInlineEnd: columnSearchQueries[col.id] ? '26px' : '8px' 
									}}
									placeholder=${ sprintf( __( 'Search in %s...', 'workpress' ), col.label ) }
									value=${ columnSearchQueries[col.id] || '' }
									onInput=${ (e) => setColumnSearchQueries( prev => ({ ...prev, [col.id]: e.target.value }) ) }
								/>
								<span 
									className="icon is-small is-left" 
									style=${{ height: '28px', width: '28px', pointerEvents: 'none', color: '#94a3b8' }}
								>
									<i className="dashicons dashicons-search" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
								</span>
								${ columnSearchQueries[col.id] ? html`
									<span 
										className="icon is-small is-right" 
										style=${{ height: '28px', width: '26px', cursor: 'pointer', pointerEvents: 'all', color: '#64748b' }}
										onClick=${ () => setColumnSearchQueries( prev => ({ ...prev, [col.id]: '' }) ) }
										title=${ __( 'Clear lane search', 'workpress' ) }
									>
										<i className="dashicons dashicons-no-alt" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
									</span>
								` : null }
							</div>
						</div>

						<!-- Independent Internal Column Scroll Container with Independent Lazy Loading -->
						<div 
							ref=${ el => { if ( el ) columnScrollRefs.current[col.id] = el; } }
							className="p-3 wp-kanban-scroll is-flex-grow-1 is-flex is-flex-direction-column" 
							style=${{ overflowY: 'auto', overflowX: 'hidden', flex: '1 1 auto' }}
							onScroll=${ (e) => handleColumnScroll( col.id, e ) }
						>
							${ columnTasks.length > 0 ? columnTasks.map( task => {
								const isCardFolded = isColFolded && ! expandedTaskIds[task.id];
								return html`
									<${TaskCard} 
										key=${ task.id } 
										task=${ task } 
										isCompact=${ isCardFolded }
										draggable=${ false }
										onClick=${ () => window.location.hash = '#/tasks/' + task.id } 
										onToggleExpand=${ isColFolded ? ( t ) => toggleTaskCardExpand( t.id ) : null }
										onManageAssignment=${ (t) => { setAssignmentTask(t); setIsAssignmentModalOpen(true); } }
										onAddContribution=${ (t) => { setTargetTaskForContribution(t); setIsContributionModalOpen(true); } }
										onClone=${ handleCloneTask }
										onTrashRequest=${ handleTrashRequest }
										onRestore=${ handleRestoreTask }
										onDelete=${ handleDeleteTask }
										onEdit=${ (t) => { setSelectedTask(t); setIsModalOpen(true); } }
										onQuickPreview=${ (t) => { setQuickPreviewTask(t); setIsQuickPreviewModalOpen(true); } }
									/>
								`;
							} ) : html`
								<div className="has-text-centered p-5 has-background-white wp-card wp-kanban-empty-state" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1' }}>
									<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
										<i className=${'dashicons ' + col.icon} style=${{ fontSize: '18px', color: '#0f172a' }}></i>
									</div>
									<p className="is-size-7 has-text-grey-dark has-text-weight-bold mb-1">${ __( 'No tasks in this lane', 'workpress' ) }</p>
									<p className="is-size-7 has-text-grey mb-0">${ col.id === 'new' ? __( 'New tasks will appear here', 'workpress' ) : col.id === 'completed' ? __( 'Completed tasks appear here', 'workpress' ) : __( 'Active tasks in progress', 'workpress' ) }</p>
								</div>
							` }

							<!-- Independent Infinite Scroll Loader Indicator for this lane only -->
							${ ( laneData.loading && laneData.page < laneData.totalPages ) ? html`
								<div className="wp-kanban-loader py-2">
									<i className="dashicons dashicons-update" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
									<span>${ __( 'Loading more...', 'workpress' ) }</span>
								</div>
							` : null }

							<!-- Manual Load More button when not all loaded and not currently loading -->
							${ ( ! laneData.loading && loadedCount < totalCount ) ? html`
								<button
									type="button"
									className="button is-small is-fullwidth mt-2 wp-btn"
									style=${{ 
										borderRadius: 0, 
										fontSize: '0.72rem', 
										height: '28px', 
										backgroundColor: '#ffffff', 
										border: '1px dashed #cbd5e1', 
										color: '#475569', 
										fontWeight: 700 
									}}
									onClick=${ () => fetchLaneTasks( col.id, laneData.page + 1, true ) }
									title=${ __( 'Click to load next batch of tasks', 'workpress' ) }
								>
									<i className="dashicons dashicons-arrow-down-alt" style=${{ fontSize: '12px', width: '12px', height: '12px', marginInlineEnd: '4px' }}></i>
									<span>${ sprintf( __( 'Load more (%d remaining)...', 'workpress' ), totalCount - loadedCount ) }</span>
								</button>
							` : null }

							<!-- Clear Completion Stop Indicator when all tasks are loaded -->
							${ ( isAllLoaded && loadedCount > 0 ) ? html`
								<div 
									className="has-text-centered py-2 is-size-7" 
									style=${{ 
										color: '#64748b', 
										borderTop: '1px dashed #e2e8f0', 
										marginTop: '8px', 
										userSelect: 'none',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '4px'
									}}
								>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#10b981' }}></i>
									<span>${ sprintf( __( 'All %d tasks loaded', 'workpress' ), totalCount ) }</span>
								</div>
							` : null }
						</div>
					</div>
				` } ) }
			</div>
			
			<${TaskModal} 
				isActive=${ isModalOpen } 
				onClose=${ () => { setIsModalOpen(false); setSelectedTask(null); } } 
				onSave=${ fetchAllLanes }
				task=${ selectedTask }
			/>
			<${TaskAssignmentModal}
				isActive=${ isAssignmentModalOpen }
				onClose=${ () => { setIsAssignmentModalOpen(false); fetchAllLanes(); } }
				task=${ assignmentTask }
			/>
			<${ContributionModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => setIsContributionModalOpen(false) }
				onSave=${ () => fetchAllLanes() }
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
