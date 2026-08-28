import { html, useState, useEffect, useRef } from '../utils/html.js';
import { projectsApi } from '../api/client.js';
import ProjectCard from '../components/projects/ProjectCard.js';
import ProjectModal from '../components/modals/Modal.js';
import ProjectMembersModal from '../components/modals/Modal.js';
import TaskModal from '../components/modals/Modal.js';
import ProjectQuickPreviewModal from '../components/modals/Modal.js';
import ConfirmModal from '../components/modals/Modal.js';
import FilterBar from '../components/ui/FilterBar.js';
import Loader from '../components/ui/Loader.js';
import { toast } from '../utils/toast.js';

export default function ProjectsPage({ refreshKey }) {
	const [ projects, setProjects ] = useState( null );
	const [ page, setPage ] = useState( 1 );
	const [ totalPages, setTotalPages ] = useState( 1 );
	const [ isLoadingMore, setIsLoadingMore ] = useState( false );
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
	
	useEffect( () => {
		fetchProjects( 1, false );
	}, [refreshKey] );

	// Smart Background Polling
	const isPollingBlocked = useRef(false);
	useEffect( () => {
		isPollingBlocked.current = isModalOpen || isMembersModalOpen || isTaskModalOpen || 
								   isQuickPreviewModalOpen || confirmModalConfig.isActive;
	}, [isModalOpen, isMembersModalOpen, isTaskModalOpen, isQuickPreviewModalOpen, confirmModalConfig.isActive] );

	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! isPollingBlocked.current ) {
				// Silent fetch, no spinner
				projectsApi.list( { page: 1, number: 12 * page, withPagination: true } )
					.then( res => {
						setProjects( res.items );
					} ).catch( () => {} );
			}
		}, 30000 );
		return () => clearInterval( interval );
	}, [page] );

	const fetchProjects = ( pageNum = 1, append = false ) => {
		if ( pageNum > 1 ) setIsLoadingMore( true );
		projectsApi.list( { page: pageNum, number: 12, withPagination: true } )
			.then( res => {
				setTotalPages( res.totalPages );
				setPage( pageNum );
				if ( append && projects.length ) {
					const newProjects = [...projects];
					res.items.forEach( p => {
						if ( !newProjects.find( existing => existing.id === p.id ) ) {
							newProjects.push( p );
						}
					});
					setProjects( newProjects );
				} else {
					setProjects( res.items );
				}
			} )
			.catch( err => console.error(err) )
			.finally( () => setIsLoadingMore( false ) );
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

	const handleRestoreClick = ( project ) => {
		// Optimistic UI update
		setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'active', is_pending_trash: false } : p));
		
		projectsApi.update( project.id, { status: 'active' } ).then( () => {
			toast('ØªÙ… Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ù†Ø¬Ø§Ø­', 'success');
			fetchProjects();
		} ).catch( err => {
			toast( err.message || 'ÙØ´Ù„ Ø§Ø³ØªØ¹Ø§Ø¯Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹', 'danger' );
			fetchProjects(); // Revert on error
		});
	};

	const handleDeleteClick = ( project ) => {
		if ( project.is_pending_trash ) {
			// Hard delete for pending trash projects (Admin only)
			setConfirmModalConfig({
				isActive: true,
				title: 'ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ',
				message: `Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© Ø¹Ù„Ù‰ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø°Ù ÙˆÙ…Ø³Ø­ Ù…Ø´Ø±ÙˆØ¹ "${project.name}" Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ØŸ`,
				confirmText: 'Ù…ÙˆØ§ÙÙ‚Ø© ÙˆØ­Ø°Ù',
				confirmColor: 'is-danger',
				isDangerous: true,
				requiresReason: false,
				isSubmitting: false,
				onConfirm: () => {
					setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
					
					// Optimistic UI update
					setProjects(prev => prev.filter(p => p.id !== project.id));
					
					projectsApi.delete( project.id ).then( () => {
						setConfirmModalConfig({ isActive: false });
						toast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹', 'success');
						fetchProjects();
					} ).catch( err => {
						setConfirmModalConfig({ isActive: false });
						toast( err.message || 'ÙØ´Ù„ Ø§Ù„Ø­Ø°Ù Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ.', 'danger' );
						fetchProjects(); // Revert on error
					} );
				}
			});
			return;
		}

		setConfirmModalConfig({
			isActive: true,
			title: 'Ø·Ù„Ø¨ Ø­Ø°Ù / Ø£Ø±Ø´ÙØ©',
			message: `Ø£Ù†Øª Ø¹Ù„Ù‰ ÙˆØ´Ùƒ Ø·Ù„Ø¨ Ø£Ø±Ø´ÙØ©/Ø¥Ø®ÙØ§Ø¡ Ù…Ø´Ø±ÙˆØ¹ "${project.name}". Ø§Ù„Ø±Ø¬Ø§Ø¡ ØªÙˆØ¶ÙŠØ­ Ø§Ù„Ø³Ø¨Ø¨ Ù„ÙŠØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯Ù‡ Ù…Ù† Ø§Ù„Ø¥Ø¯Ø§Ø±Ø©.`,
			confirmText: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨',
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: 'Ø³Ø¨Ø¨ Ø§Ù„Ø£Ø±Ø´ÙØ©/Ø§Ù„Ø­Ø°Ù',
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				
				// Optimistic UI update
				setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_pending_trash: true, trash_reason: reason } : p));
				
				projectsApi.trashRequest( project.id, reason ).then( () => {
					setConfirmModalConfig({ isActive: false });
					toast('ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø§Ù„Ø­Ø°Ù/Ø§Ù„Ø£Ø±Ø´ÙØ© Ø¨Ù†Ø¬Ø§Ø­.', 'info');
					fetchProjects();
				} ).catch( err => {
					setConfirmModalConfig({ isActive: false });
					toast( err.message || 'ÙØ´Ù„ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨.', 'danger' );
					fetchProjects(); // Revert on error
				} );
			}
		});
	};

	const handleAddTaskClick = ( project ) => {
		setSelectedProjectIdForTask( project.id );
		setIsTaskModalOpen( true );
	};

	const statusOptions = [
		{ value: 'all', label: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª' },
		{ value: 'active', label: 'Ù†Ø´Ø·Ø©' },
		{ value: 'pending', label: 'Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙŠÙ† Ø§Ù„Ù…Ø¹Ù„Ù‚Ø©' },
		{ value: 'frozen', label: 'ÙÙŠ Ø§Ù„Ø«Ù„Ø§Ø¬Ø© (Ù…Ø¬Ù…Ø¯Ø©)' },
		{ value: 'completed', label: 'Ù…ÙƒØªÙ…Ù„Ø©' },
		{ value: 'archived', label: 'Ù…Ø¤Ø±Ø´ÙØ©' }
	];

	const isFilterActive = Boolean( searchQuery || selectedStatus !== 'all' );

	const handleResetFilters = () => {
		setSearchQuery( '' );
		setSelectedStatus( 'all' );
	};

	if ( projects === null ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø´Ø¨ÙƒØ© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹..." size="large" />
			</div>
		`;
	}

	const filteredProjects = projects.filter( p => {
		if ( searchQuery ) {
			const q = searchQuery.toLowerCase();
			const matchName = ( p.name || '' ).toLowerCase().includes( q );
			const matchPrefix = ( p.prefix || '' ).toLowerCase().includes( q );
			const matchDesc = ( p.description || '' ).toLowerCase().includes( q );
			if ( ! matchName && ! matchPrefix && ! matchDesc ) return false;
		}
		if ( selectedStatus !== 'all' ) {
			if ( selectedStatus === 'archived' ) {
				if ( p.status !== 'archived' && ! p.is_pending_trash ) return false;
			} else if ( selectedStatus === 'pending' ) {
				if ( p.status !== 'pending' && ! p.is_client_request ) return false;
			} else if ( selectedStatus === 'frozen' ) {
				if ( p.status !== 'frozen' && ! p.is_frozen ) return false;
			} else {
				if ( p.status !== selectedStatus ) return false;
			}
		}
		return true;
	} );

	return html`
		<div>
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
				<div></div>
				<div className="buttons are-small mb-0" style=${{ gap: '6px' }}>
					<a 
						href="#/requests"
						className="button is-small wp-sharp-button is-warning"
						style=${{ fontWeight: '800', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
					>
						<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
						<span>ÙˆØ§Ø±Ø¯ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡</span>
					</a>
					<a 
						href="#/forms"
						className="button is-small wp-sharp-button is-primary is-outlined"
						style=${{ fontWeight: '700' }}
					>
						<span className="icon"><i className="dashicons dashicons-forms"></i></span>
						<span>Ø¥Ø¯Ø§Ø±Ø© Ù†Ù…Ø§Ø°Ø¬ Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª</span>
					</a>
				</div>
			</div>

			<${FilterBar}
				search=${{
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: 'Ø¨Ø­Ø« ÙÙŠ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ (Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ø±Ù…Ø²ØŒ Ø§Ù„ÙˆØµÙ)...',
				}}
				filters=${[
					{
						key: 'status',
						label: 'Ø§Ù„Ø­Ø§Ù„Ø©',
						icon: 'dashicons-tag',
						value: selectedStatus,
						onChange: setSelectedStatus,
						options: statusOptions,
						width: '180px',
					}
				]}
				totalCount=${ filteredProjects.length }
				totalUnfiltered=${ projects.length }
				counterLabel="Ù…Ø´Ø±ÙˆØ¹"
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			<div className="columns is-multiline">
				${ filteredProjects.map( project => html`
					<div key=${ project.id } className="column is-4">
						<${ProjectCard} 
							project=${ project } 
							onEdit=${ handleEditClick }
							onManageMembers=${ handleManageMembersClick }
							onDelete=${ handleDeleteClick }
							onRestore=${ handleRestoreClick }
							onAddTask=${ handleAddTaskClick }
							onQuickPreview=${ (p) => { setQuickPreviewProject(p); setIsQuickPreviewModalOpen(true); } }
						/>
					</div>
				` ) }
				
				${ filteredProjects.length === 0 && html`
					<div className="column is-12">
						<div className="box has-text-centered p-6 wp-card" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
							<div className="mb-3" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
								<i className="dashicons dashicons-category has-text-primary" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
							</div>
							<h3 className="title is-5 mb-2 has-text-weight-bold has-text-dark">
								${ isFilterActive ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙŠØ¹ Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«' : 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙŠØ¹ ÙÙŠ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¹Ù…Ù„ Ø¨Ø¹Ø¯' }
							</h3>
							<p className="has-text-grey is-size-6 mb-5" style=${{ maxWidth: '460px', margin: '0 auto' }}>
								${ isFilterActive 
									? 'Ø¬Ø±Ø¨ ØªØ¹Ø¯ÙŠÙ„ Ø´Ø±ÙˆØ· Ø§Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø§Ù„ÙÙ„Ø§ØªØ± Ø§Ù„Ù…Ø®ØªØ§Ø±Ø© Ù„Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.' 
									: 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ù‡ÙŠ Ø§Ù„Ø­Ø§ÙˆÙŠØ© Ø§Ù„ÙƒØ¨Ø±Ù‰ Ù„Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©. Ø§Ø¨Ø¯Ø£ Ø§Ù„Ø¢Ù† Ø¨Ø¥Ù†Ø´Ø§Ø¡ Ø£ÙˆÙ„ Ù…Ø´Ø±ÙˆØ¹ Ù„ÙØ±ÙŠÙ‚Ùƒ.' }
							</p>
							${ isFilterActive ? html`
								<button className="button is-light wp-sharp-button" onClick=${ handleResetFilters }>
									<span className="icon"><i className="dashicons dashicons-image-rotate"></i></span>
									<span>Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø· Ø§Ù„ÙÙ„Ø§ØªØ±</span>
								</button>
							` : html`
								<button className="button is-primary wp-sharp-button" onClick=${ handleCreateClick }>
									<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
									<span>Ø¥Ù†Ø´Ø§Ø¡ Ø£ÙˆÙ„ Ù…Ø´Ø±ÙˆØ¹</span>
								</button>
							` }
						</div>
					</div>
				` }
			</div>
			
			${ page < totalPages ? html`
				<div className="has-text-centered mt-5">
					<button 
						className=${ `button wp-btn is-white ${ isLoadingMore ? 'is-loading' : '' }` } 
						onClick=${ () => fetchProjects( page + 1, true ) }
						style=${{ border: '2px solid #0f172a' }}
					>
						ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ù…Ø²ÙŠØ¯
					</button>
				</div>
			` : null }
			
			<${ProjectModal} 
				isActive=${ isModalOpen } 
				onClose=${ () => setIsModalOpen(false) } 
				project=${ editingProject }
				onSave=${ fetchProjects }
			/>

			<${ProjectMembersModal}
				isActive=${ isMembersModalOpen }
				onClose=${ () => setIsMembersModalOpen(false) }
				project=${ managingMembersProject }
			/>

			<${TaskModal}
				isActive=${ isTaskModalOpen }
				onClose=${ () => { setIsTaskModalOpen(false); setSelectedProjectIdForTask(null); } }
				projectId=${ selectedProjectIdForTask }
				onSave=${ () => { fetchProjects(); /* Refresh to update task count */ } }
			/>
			
			<${ProjectQuickPreviewModal}
				isActive=${ isQuickPreviewModalOpen }
				onClose=${ () => { setIsQuickPreviewModalOpen(false); setQuickPreviewProject(null); } }
				projectId=${ quickPreviewProject ? quickPreviewProject.id : null }
			/>
			
			<${ConfirmModal}
				...${ confirmModalConfig }
				onClose=${ () => setConfirmModalConfig({ isActive: false }) }
			/>
		</div>
	`;
}
