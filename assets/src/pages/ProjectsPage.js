import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../utils/html.js';
import { projectsApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import sound from '../utils/sound.js';
import ProjectCard from '../components/projects/ProjectCard.js';
import ProjectFilterBar from '../components/projects/ProjectFilterBar.js';
import ProjectModal from '../components/projects/ProjectModal.js';
import ProjectMembersModal from '../components/projects/ProjectMembersModal.js';
import TaskModal from '../components/tasks/TaskModal.js';
import ProjectQuickPreviewModal from '../components/projects/ProjectQuickPreviewModal.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import Loader from '../components/ui/Loader.js';
import { toast } from '../utils/toast.js';

export default function ProjectsPage({ refreshKey }) {
	const [ projects, setProjects ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ viewMode, setViewMode ] = useState( 'cards' ); // 'cards' | 'table'
	const [ sortBy, setSortBy ] = useState( 'newest' ); // 'newest' | 'progress_desc' | 'name'
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const itemsPerPage = 12; // 3 columns x 4 rows
	const rtl = isRtl();

	// Modal States
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isMembersModalOpen, setIsMembersModalOpen ] = useState( false );
	const [ isTaskModalOpen, setIsTaskModalOpen ] = useState( false );
	const [ editingProject, setEditingProject ] = useState( null );
	const [ managingMembersProject, setManagingMembersProject ] = useState( null );
	const [ selectedProjectIdForTask, setSelectedProjectIdForTask ] = useState( null );
	const [ isQuickPreviewModalOpen, setIsQuickPreviewModalOpen ] = useState( false );
	const [ quickPreviewProject, setQuickPreviewProject ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );

	// Filters
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' );

	// Reset page on filter or search changes
	useEffect( () => {
		setCurrentPage( 1 );
	}, [ searchQuery, selectedStatus, sortBy ] );

	useEffect( () => {
		fetchProjects();
	}, [ refreshKey ] );

	// Smart Background Polling (pauses when modals are open)
	const isPollingBlocked = useRef( false );
	useEffect( () => {
		isPollingBlocked.current = isModalOpen || isMembersModalOpen || isTaskModalOpen ||
								   isQuickPreviewModalOpen || confirmModalConfig.isActive;
	}, [ isModalOpen, isMembersModalOpen, isTaskModalOpen, isQuickPreviewModalOpen, confirmModalConfig.isActive ] );

	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! isPollingBlocked.current ) {
				projectsApi.list( { number: 100 } )
					.then( res => {
						const items = res && res.items ? res.items : ( Array.isArray( res ) ? res : [] );
						setProjects( items );
					} ).catch( () => {} );
			}
		}, 30000 );
		return () => clearInterval( interval );
	}, [] );

	const fetchProjects = () => {
		setIsLoading( true );
		projectsApi.list( { number: 100 } )
			.then( res => {
				const items = res && res.items ? res.items : ( Array.isArray( res ) ? res : [] );
				setProjects( items );
			} )
			.catch( err => {
				console.error( err );
				toast( __( 'Failed to load projects', 'workpress' ), 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	};

	const handleCreateClick = () => {
		setEditingProject( null );
		setIsModalOpen( true );
	};

	const handleEditClick = ( project ) => {
		setEditingProject( project );
		setIsModalOpen( true );
	};

	const handleManageMembersClick = ( project ) => {
		setManagingMembersProject( project );
		setIsMembersModalOpen( true );
	};

	const handleAddTaskClick = ( project ) => {
		setSelectedProjectIdForTask( project.id );
		setIsTaskModalOpen( true );
	};

	const handleQuickPreviewClick = ( project ) => {
		setQuickPreviewProject( project );
		setIsQuickPreviewModalOpen( true );
	};

	const handleRestoreClick = ( project ) => {
		setProjects( prev => prev.map( p => p.id === project.id ? { ...p, status: 'active', is_pending_trash: false } : p ) );
		projectsApi.update( project.id, { status: 'active' } )
			.then( () => {
				toast( __( 'Project restored successfully', 'workpress' ), 'success' );
				fetchProjects();
			} )
			.catch( err => {
				toast( err.message || __( 'Failed to restore project', 'workpress' ), 'danger' );
				fetchProjects();
			} );
	};

	const handleDeleteClick = ( project ) => {
		if ( project.is_pending_trash ) {
			setConfirmModalConfig( {
				isActive: true,
				title: __( 'Confirm Permanent Deletion', 'workpress' ),
				message: `${ __( 'Are you sure you want to permanently delete this project?', 'workpress' ) } ("${ project.name }")`,
				confirmText: __( 'Approve & Delete', 'workpress' ),
				confirmColor: 'is-danger',
				isDangerous: true,
				requiresReason: false,
				isSubmitting: false,
				onConfirm: () => {
					setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
					setProjects( prev => prev.filter( p => p.id !== project.id ) );
					projectsApi.delete( project.id )
						.then( () => {
							setConfirmModalConfig( { isActive: false } );
							toast( __( 'Project permanently deleted', 'workpress' ), 'success' );
							fetchProjects();
						} )
						.catch( err => {
							setConfirmModalConfig( { isActive: false } );
							toast( err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger' );
							fetchProjects();
						} );
				}
			} );
			return;
		}

		setConfirmModalConfig( {
			isActive: true,
			title: __( 'Trash / Archive Request', 'workpress' ),
			message: `${ __( 'You are about to request archiving/trashing project', 'workpress' ) } "${ project.name }". ${ __( 'Please state the reason for executive review.', 'workpress' ) }`,
			confirmText: __( 'Submit Request', 'workpress' ),
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: __( 'Reason for trash / archive', 'workpress' ),
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				setProjects( prev => prev.map( p => p.id === project.id ? { ...p, is_pending_trash: true, trash_reason: reason } : p ) );
				projectsApi.trashRequest( project.id, reason )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						toast( __( 'Trash request sent successfully.', 'workpress' ), 'info' );
						fetchProjects();
					} )
					.catch( err => {
						setConfirmModalConfig( { isActive: false } );
						toast( err.message || __( 'Failed to submit request', 'workpress' ), 'danger' );
						fetchProjects();
					} );
			}
		} );
	};

	const rawProjects = projects || [];

	// Baseline KPI Counts for Section 1 Toolbar Chips
	const totalCount = rawProjects.length;
	const activeCount = rawProjects.filter( p => ( p.status === 'active' || p.status === 'in_progress' ) && ! p.is_pending_trash ).length;
	const completedCount = rawProjects.filter( p => p.status === 'completed' || p.is_completed || p.progress === 100 ).length;
	const pendingCount = rawProjects.filter( p => p.is_client_request || p.status === 'pending' ).length;
	const frozenCount = rawProjects.filter( p => p.is_frozen || p.status === 'frozen' ).length;
	const archivedCount = rawProjects.filter( p => p.status === 'archived' || p.is_pending_trash ).length;

	// Filter & Sort
	const filteredProjects = rawProjects.filter( p => {
		if ( searchQuery.trim() ) {
			const q = searchQuery.toLowerCase();
			const matchName = ( p.name || '' ).toLowerCase().includes( q );
			const matchPrefix = ( p.prefix || p.code || '' ).toLowerCase().includes( q );
			const matchDesc = ( p.description || '' ).toLowerCase().includes( q );
			const matchLead = ( p.lead_name || '' ).toLowerCase().includes( q );
			if ( ! matchName && ! matchPrefix && ! matchDesc && ! matchLead ) return false;
		}

		if ( selectedStatus !== 'all' ) {
			if ( selectedStatus === 'archived' ) {
				if ( p.status !== 'archived' && ! p.is_pending_trash ) return false;
			} else if ( selectedStatus === 'pending' ) {
				if ( p.status !== 'pending' && ! p.is_client_request ) return false;
			} else if ( selectedStatus === 'frozen' ) {
				if ( p.status !== 'frozen' && ! p.is_frozen ) return false;
			} else if ( selectedStatus === 'completed' ) {
				if ( p.status !== 'completed' && ! p.is_completed && p.progress !== 100 ) return false;
			} else if ( selectedStatus === 'active' ) {
				if ( p.status !== 'active' && p.status !== 'in_progress' ) return false;
				if ( p.is_pending_trash || p.is_frozen || p.status === 'completed' ) return false;
			} else {
				if ( p.status !== selectedStatus ) return false;
			}
		}
		return true;
	} );

	filteredProjects.sort( ( a, b ) => {
		if ( sortBy === 'progress_desc' ) return ( Number( b.progress ) || 0 ) - ( Number( a.progress ) || 0 );
		if ( sortBy === 'name' ) return ( a.name || '' ).localeCompare( b.name || '' );
		return new Date( b.created_at || b.date || 0 ) - new Date( a.created_at || a.date || 0 );
	} );

	// Pagination
	const totalItems = filteredProjects.length;
	const totalPages = Math.ceil( totalItems / itemsPerPage ) || 1;
	const validCurrentPage = Math.min( Math.max( 1, currentPage ), totalPages );
	const startIndex = ( validCurrentPage - 1 ) * itemsPerPage;
	const endIndex = Math.min( startIndex + itemsPerPage, totalItems );
	const paginatedProjects = filteredProjects.slice( startIndex, endIndex );

	const getPageNumbers = ( current, total ) => {
		if ( total <= 7 ) return Array.from( { length: total }, ( _, i ) => i + 1 );
		if ( current <= 4 ) return [ 1, 2, 3, 4, 5, '...', total ];
		if ( current >= total - 3 ) return [ 1, '...', total - 4, total - 3, total - 2, total - 1, total ];
		return [ 1, '...', current - 1, current, current + 1, '...', total ];
	};

	const handleResetFilters = () => {
		setSearchQuery( '' );
		setSelectedStatus( 'all' );
		setSortBy( 'newest' );
		sound.play( 'pop' );
	};

	return html`
		<div className="projects-page pb-6">
			<!-- شريط الأدوات الموحد القياسي (UnifiedToolbar) -->
			<${ProjectFilterBar}
				totalCount=${ totalCount }
				activeCount=${ activeCount }
				completedCount=${ completedCount }
				pendingCount=${ pendingCount }
				frozenCount=${ frozenCount }
				archivedCount=${ archivedCount }
				selectedStatus=${ selectedStatus }
				setSelectedStatus=${ setSelectedStatus }
				searchQuery=${ searchQuery }
				setSearchQuery=${ setSearchQuery }
				sortBy=${ sortBy }
				setSortBy=${ setSortBy }
				viewMode=${ viewMode }
				setViewMode=${ setViewMode }
				onNewProject=${ handleCreateClick }
				onReset=${ handleResetFilters }
			/>

			${ isLoading && ! projects ? html`
				<div className="py-6 mt-4 has-text-centered">
					<${Loader} center=${ true } label=${ __( 'Loading projects...', 'workpress' ) } size="large" />
				</div>
			` : totalItems === 0 ? html`
				<div className="box wp-card has-text-centered py-6 mt-4" style=${{ borderRadius: 0 }}>
					<span className="icon is-large has-text-grey-light mb-3">
						<i className="dashicons dashicons-portfolio" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h3 className="title is-5 mb-2 has-text-dark">
						${ ( searchQuery || selectedStatus !== 'all' ) ? __( 'No projects matching selected filters', 'workpress' ) : __( 'No projects registered yet', 'workpress' ) }
					</h3>
					<p className="subtitle is-6 has-text-grey-light mb-4">
						${ ( searchQuery || selectedStatus !== 'all' ) ? __( 'Try resetting filters or adjusting search terms.', 'workpress' ) : __( 'Create your first organizational project to start coordinating tasks and knowledge.', 'workpress' ) }
					</p>
					<div className="buttons is-centered">
						${ ( searchQuery || selectedStatus !== 'all' ) ? html`
							<button className="button is-light wp-btn" onClick=${ handleResetFilters }>
								<i className="dashicons dashicons-image-rotate" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
								<span>${ __( 'Reset Filters', 'workpress' ) }</span>
							</button>
						` : html`
							<button className="button is-primary wp-btn has-text-weight-bold" onClick=${ handleCreateClick }>
								<i className="dashicons dashicons-plus-alt2" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
								<span>${ __( 'Create First Project', 'workpress' ) }</span>
							</button>
						` }
					</div>
				</div>
			` : viewMode === 'table' ? html`
				<!-- نمط الجدول التنفيذي الموحد للمشاريع -->
				<div className="wp-reports-table-container mt-4">
					<table className="wp-reports-table">
						<thead>
							<tr>
								<th style=${{ width: '110px' }}>${ __( 'Code', 'workpress' ) }</th>
								<th>${ __( 'Project Name', 'workpress' ) }</th>
								<th style=${{ width: '130px' }}>${ __( 'Status', 'workpress' ) }</th>
								<th style=${{ width: '180px' }}>${ __( 'Completion Progress', 'workpress' ) }</th>
								<th style=${{ width: '110px' }}>${ __( 'Tasks', 'workpress' ) }</th>
								<th style=${{ width: '130px' }}>${ __( 'Lead', 'workpress' ) }</th>
								<th style=${{ width: '120px' }}>${ __( 'Due Date', 'workpress' ) }</th>
								<th style=${{ width: '120px', textAlign: rtl ? 'left' : 'right' }}>${ __( 'Actions', 'workpress' ) }</th>
							</tr>
						</thead>
						<tbody>
							${ paginatedProjects.map( project => {
								const progress = Math.min( 100, Math.max( 0, Number( project.progress ) || 0 ) );
								const isCompleted = project.is_completed || progress === 100 || project.status === 'completed';
								const isFrozen = project.is_frozen || project.status === 'frozen';
								const isTrash = Boolean( project.is_pending_trash );

								return html`
									<tr key=${ project.id } style=${{ backgroundColor: isTrash ? '#fef2f2' : 'transparent' }}>
										<td>
											<span className="tag is-dark is-rounded is-small has-text-weight-bold">
												${ project.code || project.prefix || `PRJ-${ project.id }` }
											</span>
										</td>
										<td>
											<a href=${ `#/projects/${ project.id }` } className="has-text-dark has-text-weight-bold wp-hover-primary is-block mb-1">
												${ project.name }
											</a>
											<span className="is-size-7 has-text-grey wp-text-truncate is-block" style=${{ maxWidth: '380px' }}>
												${ project.description ? project.description.replace( /<[^>]*>?/gm, '' ) : '—' }
											</span>
										</td>
										<td>
											${ isCompleted ? html`
												<span className="tag is-success is-light is-rounded is-small has-text-weight-bold">
													${ __( 'Completed', 'workpress' ) }
												</span>
											` : isFrozen ? html`
												<span className="tag is-info is-light is-rounded is-small has-text-weight-bold">
													${ __( 'Frozen', 'workpress' ) }
												</span>
											` : isTrash ? html`
												<span className="tag is-danger is-light is-rounded is-small has-text-weight-bold">
													${ __( 'Pending Trash', 'workpress' ) }
												</span>
											` : html`
												<span className="tag is-primary is-light is-rounded is-small has-text-weight-bold">
													${ __( 'Active', 'workpress' ) }
												</span>
											` }
										</td>
										<td>
											<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
												<div style=${{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
													<div style=${{ height: '100%', width: `${ progress }%`, backgroundColor: isCompleted ? '#10b981' : ( progress < 30 ? '#ef4444' : '#10b981' ) }}></div>
												</div>
												<span className="is-size-7 has-text-weight-bold" style=${{ width: '35px', textAlign: 'end' }}>${ progress }%</span>
											</div>
										</td>
										<td>
											<span className="is-size-7 has-text-grey-dark">
												${ project.count || project.total_tasks || 0 } ${ __( 'Tasks', 'workpress' ) }
											</span>
										</td>
										<td>
											<span className="is-size-7 has-text-dark has-text-weight-semibold">
												${ project.lead_name || __( 'Unassigned', 'workpress' ) }
											</span>
										</td>
										<td>
											<span className="is-size-7 has-text-grey">
												${ project.due_at || project.end_date ? formatDate( project.due_at || project.end_date, { hideYear: true } ) : '—' }
											</span>
										</td>
										<td style=${{ textAlign: rtl ? 'left' : 'right' }}>
											<div className="is-inline-flex" style=${{ gap: '4px' }}>
												<a
													href=${ `#/projects/${ project.id }` }
													className="button is-small wp-btn is-light"
													title=${ __( 'Open Workspace', 'workpress' ) }
													style=${{ height: '28px', padding: '0 8px' }}
												>
													<i className="dashicons dashicons-portfolio"></i>
												</a>
												<button
													type="button"
													className="button is-small wp-btn is-light"
													onClick=${ () => handleQuickPreviewClick( project ) }
													title=${ __( 'Quick Preview', 'workpress' ) }
													style=${{ height: '28px', padding: '0 8px' }}
												>
													<i className="dashicons dashicons-visibility"></i>
												</button>
												<button
													type="button"
													className="button is-small wp-btn is-light"
													onClick=${ () => handleEditClick( project ) }
													title=${ __( 'Edit Project', 'workpress' ) }
													style=${{ height: '28px', padding: '0 8px' }}
												>
													<i className="dashicons dashicons-edit"></i>
												</button>
											</div>
										</td>
									</tr>
								`;
							} ) }
						</tbody>
					</table>
				</div>
			` : html`
				<!-- نمط شبكة الصناديق الثلاثية الحديثة (3 في السطر) -->
				<div className="columns is-multiline mt-4">
					${ paginatedProjects.map( project => html`
						<div key=${ project.id } className="column is-4-desktop is-6-tablet is-12-mobile">
							<${ProjectCard}
								project=${ project }
								onEdit=${ handleEditClick }
								onManageMembers=${ handleManageMembersClick }
								onDelete=${ handleDeleteClick }
								onRestore=${ handleRestoreClick }
								onAddTask=${ handleAddTaskClick }
								onQuickPreview=${ handleQuickPreviewClick }
							/>
						</div>
					` ) }
				</div>
			` }

			<!-- ترقيم الصفحات المتوافق مع الفلاتر -->
			${ ! isLoading && totalItems > 0 && html`
				<div className="wp-reports-pagination-container">
					<div className="is-size-7 has-text-grey has-text-weight-semibold">
						${ sprintf( __( 'Showing %d - %d of %d projects', 'workpress' ), startIndex + 1, endIndex, totalItems ) }
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

			<!-- النوافذ المنبثقة الإدارية -->
			${ isModalOpen && html`
				<${ProjectModal}
					isActive=${ isModalOpen }
					onClose=${ () => { setIsModalOpen( false ); setEditingProject( null ); } }
					project=${ editingProject }
					onSave=${ fetchProjects }
					onSaved=${ fetchProjects }
				/>
			` }

			${ isMembersModalOpen && html`
				<${ProjectMembersModal}
					isActive=${ isMembersModalOpen }
					onClose=${ () => { setIsMembersModalOpen( false ); setManagingMembersProject( null ); } }
					project=${ managingMembersProject }
					onSave=${ fetchProjects }
					onSaved=${ fetchProjects }
				/>
			` }

			${ isTaskModalOpen && html`
				<${TaskModal}
					isActive=${ isTaskModalOpen }
					onClose=${ () => { setIsTaskModalOpen( false ); setSelectedProjectIdForTask( null ); } }
					projectId=${ selectedProjectIdForTask }
					defaultProjectId=${ selectedProjectIdForTask }
					onSave=${ fetchProjects }
					onSaved=${ fetchProjects }
				/>
			` }

			${ isQuickPreviewModalOpen && html`
				<${ProjectQuickPreviewModal}
					isActive=${ isQuickPreviewModalOpen }
					onClose=${ () => { setIsQuickPreviewModalOpen( false ); setQuickPreviewProject( null ); } }
					project=${ quickPreviewProject }
					onEdit=${ () => { setIsQuickPreviewModalOpen( false ); handleEditClick( quickPreviewProject ); } }
					onManageMembers=${ () => { setIsQuickPreviewModalOpen( false ); handleManageMembersClick( quickPreviewProject ); } }
				/>
			` }

			${ confirmModalConfig.isActive && html`
				<${ConfirmModal}
					isActive=${ confirmModalConfig.isActive }
					title=${ confirmModalConfig.title }
					message=${ confirmModalConfig.message }
					confirmText=${ confirmModalConfig.confirmText }
					confirmColor=${ confirmModalConfig.confirmColor }
					isDangerous=${ confirmModalConfig.isDangerous }
					requiresReason=${ confirmModalConfig.requiresReason }
					reasonLabel=${ confirmModalConfig.reasonLabel }
					isSubmitting=${ confirmModalConfig.isSubmitting }
					onConfirm=${ confirmModalConfig.onConfirm }
					onCancel=${ () => setConfirmModalConfig( { isActive: false } ) }
				/>
			` }
		</div>
	`;
}
