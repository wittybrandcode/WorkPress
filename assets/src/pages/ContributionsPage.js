import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../utils/html.js';
import { contributionsApi, projectsApi, tasksApi } from '../api/client.js';
import { hooks } from '../utils/hooks.js';
import { toast } from '../utils/toast.js';
import { formatDate, formatDateTime, formatRelativeTime, formatDateTimeSegments, formatDetailedDuration } from '../utils/datetime.js';
import ContributionFilterBar from '../components/contributions/ContributionFilterBar.js';
import ContributionDetailModal from '../components/contributions/ContributionDetailModal.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import Loader from '../components/ui/Loader.js';
import sound from '../utils/sound.js';

/**
 * Modern High-Density Contribution Card
 * 
 * Completely eliminates the bulky dark placeholder box.
 * Displays rich project & task identity, content excerpt,
 * 2x2 micro-stats grid (Author, Task ID, Files, Governance), and sleek actions.
 */
function ContributionCard({ contribution, onRefresh, onPreview, onAccept, onRevoke, onTrashRequest, onRestore, onHardDelete, isSelected = false, onToggleSelect }) {
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const dropdownRef = useRef( null );
	const rtl = isRtl();

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( dropdownRef.current && ! dropdownRef.current.contains( event.target ) ) {
				setIsMenuOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => document.removeEventListener( 'mousedown', handleClickOutside );
	}, [] );

	const isAccepted = Boolean( contribution.is_accepted );
	const isTrash = Boolean( contribution.is_pending_trash );
	const isSystem = [ 'state_change', 'assignment', 'trash_request' ].includes( contribution.type );

	const cleanContent = contribution.content
		? contribution.content.replace( /<[^>]*>?/gm, '' )
		: __( 'No additional details provided.', 'workpress' );

	const toggleMenu = ( e ) => {
		e.stopPropagation();
		setIsMenuOpen( ! isMenuOpen );
	};

	const createdParts = formatDateTimeSegments( contribution.created_at );
	const elapsedDetailed = formatDetailedDuration( contribution.created_at, new Date() );
	const attachmentCount = ( contribution.attachments && contribution.attachments.length ) || 0;

	return html`
		<div
			className="wp-card wp-contribution-card"
			style=${{
				backgroundColor: '#ffffff',
				border: '1px solid #e2e8f0',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 0,
				borderRadius: 0,
				position: 'relative',
				boxSizing: 'border-box',
				overflow: 'hidden',
				cursor: 'pointer'
			}}
			onClick=${ ( e ) => {
				if ( isTrash ) return;
				if ( onPreview ) onPreview( contribution );
			} }
		>
			<!-- Pending Trash Overlay Alert if applicable -->
			${ isTrash ? html`
				<div
					style=${{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(239, 68, 68, 0.94)',
						zIndex: 10,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						padding: '1.2rem',
						color: '#ffffff',
						textAlign: 'center'
					}}
					onClick=${ ( e ) => e.stopPropagation() }
				>
					<i className="dashicons dashicons-warning mb-2" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
					<h4 className="title is-6 has-text-white mb-1">${ __( 'Trash Request Pending', 'workpress' ) }</h4>
					<p className="is-size-7 mb-3" style=${{ opacity: 0.9 }}>
						${ contribution.trash_reason || __( 'Requested by author', 'workpress' ) }
					</p>
					<div className="buttons is-centered mb-0" style=${{ gap: '6px' }}>
						<button
							type="button"
							className="button is-small is-white is-outlined wp-btn"
							onClick=${ ( e ) => { e.stopPropagation(); onRestore && onRestore( contribution ); } }
						>
							${ __( 'Restore', 'workpress' ) }
						</button>
						<button
							type="button"
							className="button is-small is-white has-text-danger has-text-weight-bold wp-btn"
							onClick=${ ( e ) => { e.stopPropagation(); onHardDelete && onHardDelete( contribution ); } }
						>
							${ __( 'Delete Permanently', 'workpress' ) }
						</button>
					</div>
				</div>
			` : null }

			<!-- 1. Top Section: Full-Bleed Cover Image or Pure Symbolic Icon Container (No Text) -->
			${ contribution.cover_url ? html`
				<figure className="image is-3by1 m-0" style=${{ overflow: 'hidden', borderBottom: '1px solid #e2e8f0', width: '100%', height: '110px' }}>
					<img src=${ contribution.cover_url } alt=${ contribution.task_title } style=${{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
				</figure>
			` : html`
				<div
					className="m-0 is-flex is-align-items-center is-justify-content-center"
					style=${{
						backgroundColor: '#f8fafc',
						borderBottom: '1px solid #e2e8f0',
						width: '100%',
						height: '110px',
						boxSizing: 'border-box'
					}}
				>
					<span className="icon is-large has-text-grey-light">
						<i
							className=${ `dashicons ${ isAccepted ? 'dashicons-awards' : ( isSystem ? 'dashicons-admin-generic' : 'dashicons-format-chat' ) }` }
							style=${{ fontSize: '42px', width: '42px', height: '42px', color: isAccepted ? '#10b981' : '#94a3b8' }}
						></i>
					</span>
				</div>
			` }

			<!-- 2. Middle Body Section (Title & Scope) -->
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column is-justify-content-space-between">
				<div>
					<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-3" style=${{ gap: '12px' }}>
						<!-- Right Column: Project Context, Task Title & Excerpt -->
						<div style=${{ flex: 1, minWidth: 0 }}>
							<!-- Project Context Badge/Label -->
							<div className="is-size-7 has-text-grey mb-1 is-flex is-align-items-center" style=${{ gap: '4px' }}>
								<i className="dashicons dashicons-portfolio has-text-grey-light" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
								<span className="has-text-weight-bold has-text-grey-dark wp-text-truncate" style=${{ maxWidth: '240px' }}>
									${ contribution.project_name || __( 'Project', 'workpress' ) }
								</span>
							</div>

							<!-- Task Title Link -->
							<h3 className="title is-6 mb-1" style=${{ lineHeight: '1.4' }}>
								<a
									href=${ `#/tasks/${ contribution.task_id }` }
									onClick=${ ( e ) => e.stopPropagation() }
									className="has-text-dark wp-hover-primary"
									style=${{ fontWeight: '800' }}
								>
									${ contribution.task_title || `${ __( 'Task #', 'workpress' ) }${ contribution.task_id }` }
								</a>
							</h3>

							<!-- Content Excerpt -->
							<p
								className="is-size-7 has-text-grey mb-0"
								style=${{
									display: '-webkit-box',
									WebkitLineClamp: '2',
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
									lineHeight: '1.45',
									minHeight: '2.9em'
								}}
							>
								${ cleanContent }
							</p>
						</div>

						<!-- Left Column: Checkbox + Status Tag -->
						<div className="is-flex is-align-items-center" style=${{ flexShrink: 0, gap: '6px' }}>
							<input
								type="checkbox"
								checked=${ isSelected }
								onChange=${ onToggleSelect }
								onClick=${ ( e ) => e.stopPropagation() }
								title=${ __( 'Select for bulk action', 'workpress' ) }
								style=${{ cursor: 'pointer', accentColor: '#10b981', width: '15px', height: '15px', margin: 0 }}
							/>

							${ isAccepted ? html`
								<span className="tag is-success is-light is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${ __( 'Approved Solution', 'workpress' ) }
								</span>
							` : isSystem ? html`
								<span className="tag is-light is-small has-text-weight-bold has-text-grey" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-admin-generic" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${ contribution.type_label || __( 'System Log', 'workpress' ) }
								</span>
							` : html`
								<span className="tag is-info is-light is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-format-chat" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${ contribution.type_label || __( 'Contribution', 'workpress' ) }
								</span>
							` }
						</div>
					</div>
				</div>

				<div>
					<!-- 3. سطر حاويات الوقت الموحد في سطر واحد مباشرة فوق المؤشر الأخضر -->
					<div
						className="wp-timeline-horizon-strip is-flex is-align-items-center mb-2"
						style=${{
							gap: '5px',
							width: '100%',
							overflowX: 'auto',
							whiteSpace: 'nowrap',
							scrollbarWidth: 'none',
							fontSize: '0.71rem',
							lineHeight: 1.3
						}}
					>
						<!-- 1. حاوية تاريخ ووقت التقديم -->
						${ createdParts.isValid ? html`
							<div
								className="is-flex is-align-items-center"
								style=${{
									gap: '4px',
									color: '#334155',
									backgroundColor: '#f8fafc',
									padding: '4px 8px',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									flexShrink: 0
								}}
								title=${ sprintf( __( 'Submitted: %s %s %s %s', 'workpress' ), createdParts.day, createdParts.month, createdParts.year, createdParts.time ) }
							>
								<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>${ createdParts.day }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#334155' }}>${ createdParts.month }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#64748b' }}>${ createdParts.year }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a', fontFamily: 'monospace' }}>${ createdParts.time }</span>
							</div>
						` : null }

						<!-- 2. حاوية الوقت المنقضي منذ التقديم -->
						<div
							className="is-flex is-align-items-center"
							style=${{
								gap: '5px',
								color: '#0f172a',
								backgroundColor: '#f8fafc',
								padding: '4px 8px',
								border: '1px solid #e2e8f0',
								borderRadius: 0,
								flexShrink: 0
							}}
							title=${ `${ __( 'Elapsed since submission:', 'workpress' ) } ${ elapsedDetailed }` }
						>
							<i className="dashicons dashicons-backup" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
							<span>${ __( 'مضى على التقديم', 'workpress' ) } <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${ elapsedDetailed }</strong></span>
						</div>

						<!-- 3. حاوية حالة الاعتماد والتحقق -->
						<div
							className="is-flex is-align-items-center"
							style=${{
								gap: '5px',
								color: '#0f172a',
								backgroundColor: '#f8fafc',
								padding: '4px 8px',
								border: '1px solid #e2e8f0',
								borderRadius: 0,
								flexShrink: 0
							}}
						>
							<i
								className=${ `dashicons ${ isAccepted ? 'dashicons-yes-alt' : 'dashicons-hourglass' }` }
								style=${{
									fontSize: '14px',
									width: '14px',
									height: '14px',
									color: '#0f172a'
								}}
							></i>
							<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>
								${ isAccepted ? __( 'معتمد كحل رسمي', 'workpress' ) : __( 'قيد المراجعة والتدقيق', 'workpress' ) }
							</span>
						</div>
					</div>

					<!-- 4. Progress Bar (Status Line across the card) -->
					<div className="mb-3">
						<div
							style=${{
								height: '5px',
								backgroundColor: '#e2e8f0',
								borderRadius: 0,
								overflow: 'hidden',
								width: '100%'
							}}
							title=${ isAccepted ? __( 'Approved Solution', 'workpress' ) : __( 'Under Review', 'workpress' ) }
						>
							<div
								style=${{
									height: '100%',
									width: '100%',
									backgroundColor: '#10b981',
									transition: 'background-color 0.3s ease'
								}}
							></div>
						</div>
					</div>

					<!-- 5. Bottom Footer Bar -->
					<div
						className="is-flex is-justify-content-space-between is-align-items-center pt-2 wp-border-top"
						style=${{ gap: '8px' }}
						onClick=${ ( e ) => e.stopPropagation() }
					>
						<!-- Right Group: أزرار المعلومات فقط أيقونة ورقم/اسم (Info Chips) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '5px' }}>
							<!-- 1. الكاتب -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Author: %s', 'workpress' ), contribution.author_name || __( 'Staff', 'workpress' ) ) }
							>
								<i className=${ `dashicons ${ contribution.is_client ? 'dashicons-star-filled' : 'dashicons-admin-users' }` } style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ contribution.author_name || __( 'Staff', 'workpress' ) }</span>
							</div>

							<!-- 2. رقم المهمة -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Task ID: #%s', 'workpress' ), contribution.task_id ) }
							>
								<i className="dashicons dashicons-clipboard" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>#${ contribution.task_id }</span>
							</div>

							<!-- 3. عدد الملفات المرفقة -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Attachments: %d', 'workpress' ), attachmentCount ) }
							>
								<i className="dashicons dashicons-paperclip" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ attachmentCount }</span>
							</div>

							<!-- 4. وسام الحل المعتمد -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ isAccepted ? __( 'Verified Solution', 'workpress' ) : __( 'Under Review', 'workpress' ) }
							>
								<i className="dashicons dashicons-awards" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>
									${ isAccepted ? __( 'Approved', 'workpress' ) : __( 'Review', 'workpress' ) }
								</span>
							</div>
						</div>

						<!-- Left Group: أيقونات وظيفية مربعة (28px) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '4px' }}>
							<!-- 1. Preview / المعاينة -->
							<button
								type="button"
								className="button is-small wp-btn"
								onClick=${ () => onPreview && onPreview( contribution ) }
								title=${ __( 'Preview full details', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-visibility" style=${{ fontSize: '14px' }}></i>
							</button>

							<!-- 2. Go to Task / الذهاب للمهمة -->
							<a
								href=${ `#/tasks/${ contribution.task_id }` }
								className="button is-small wp-btn"
								title=${ __( 'Go to Task', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-external" style=${{ fontSize: '14px' }}></i>
							</a>

							<!-- 3. Quick Accept / Quick Revoke Button -->
							${ ( contribution.can_accept && ! isAccepted ) ? html`
								<button
									type="button"
									className="button is-small wp-btn"
									onClick=${ () => onAccept && onAccept( contribution ) }
									title=${ __( 'Accept Solution & Complete Task', 'workpress' ) }
									style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
								>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '14px' }}></i>
								</button>
							` : ( isAccepted && contribution.can_revoke ) ? html`
								<button
									type="button"
									className="button is-small wp-btn is-active"
									onClick=${ () => onRevoke && onRevoke( contribution ) }
									title=${ __( 'Revoke Approval', 'workpress' ) }
									style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #10b981' }}
								>
									<i className="dashicons dashicons-undo" style=${{ fontSize: '14px' }}></i>
								</button>
							` : null }

							<!-- 4. Actions Menu Dropdown -->
							<div ref=${ dropdownRef } className=${ `dropdown is-up ${ rtl ? 'is-left' : 'is-right' } ${ isMenuOpen ? 'is-active' : '' }` }>
								<div className="dropdown-trigger">
									<button
										type="button"
										className="button is-small wp-btn is-light"
										onClick=${ toggleMenu }
										title=${ __( 'More Options', 'workpress' ) }
										style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #e2e8f0' }}
									>
										<i className="dashicons dashicons-ellipsis" style=${{ fontSize: '14px', color: '#475569' }}></i>
									</button>
								</div>
								<div className="dropdown-menu" role="menu">
									<div className="dropdown-content p-0" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
										<a
											href=${ `#/tasks/${ contribution.task_id }` }
											className="dropdown-item py-2 is-size-7 is-flex is-align-items-center"
											style=${{ gap: '6px' }}
										>
											<i className="dashicons dashicons-external"></i>
											<span>${ __( 'Go to Task', 'workpress' ) }</span>
										</a>

										${ isAccepted && contribution.can_revoke ? html`
											<a
												className="dropdown-item py-2 is-size-7 has-text-warning is-flex is-align-items-center"
												style=${{ gap: '6px' }}
												onClick=${ () => { setIsMenuOpen( false ); onRevoke && onRevoke( contribution ); } }
											>
												<i className="dashicons dashicons-undo"></i>
												<span>${ __( 'Revoke Approval', 'workpress' ) }</span>
											</a>
										` : null }

										${ ! isAccepted ? html`
											<a
												className="dropdown-item py-2 is-size-7 has-text-danger is-flex is-align-items-center"
												style=${{ gap: '6px' }}
												onClick=${ () => { setIsMenuOpen( false ); onTrashRequest && onTrashRequest( contribution ); } }
											>
												<i className="dashicons dashicons-trash"></i>
												<span>${ __( 'Delete Contribution', 'workpress' ) }</span>
											</a>
										` : null }
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}

export default function ContributionsPage({ refreshKey }) {
	const [ contributions, setContributions ] = useState( [] );
	const [ projects, setProjects ] = useState( [] );
	const [ tasks, setTasks ] = useState( [] );
	const [ availableTypes, setAvailableTypes ] = useState( [] );
	const [ users, setUsers ] = useState( [] );

	// Global baseline stats for toolbar chips
	const [ stats, setStats ] = useState( {
		total: 0,
		accepted: 0,
		pending: 0,
		work: 0,
		system: 0
	} );

	// Filter & Navigation State
	const [ selectedProject, setSelectedProject ] = useState( '' );
	const [ selectedTask, setSelectedTask ] = useState( '' );
	const [ selectedAuthor, setSelectedAuthor ] = useState( '' );
	const [ selectedType, setSelectedType ] = useState( 'all' ); // 'all' | 'work' | 'system' | type_slug
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' ); // 'all' | 'accepted' | 'pending'
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ viewMode, setViewMode ] = useState( 'cards' ); // 'cards' | 'table'
	const [ currentPage, setCurrentPage ] = useState( 1 );
	const [ selectedIds, setSelectedIds ] = useState( [] ); // Bulk selection IDs
	const itemsPerPage = 12; // 3 columns x 4 rows
	const rtl = isRtl();

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isPreviewModalOpen, setIsPreviewModalOpen ] = useState( false );
	const [ previewContribution, setPreviewContribution ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );

	// Reset page and clear bulk selections whenever any filter or search changes
	useEffect( () => {
		setCurrentPage( 1 );
		setSelectedIds( [] );
	}, [ selectedProject, selectedTask, selectedAuthor, selectedType, selectedStatus, searchQuery ] );

	// Initial data loading
	useEffect( () => {
		projectsApi.list().then( data => {
			setProjects( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		tasksApi.list().then( data => {
			setTasks( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		contributionsApi.types.list().then( data => {
			setAvailableTypes( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		window.wp.apiFetch( { path: '/wp/v2/users?per_page=100' } ).then( data => {
			setUsers( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		fetchBaselineStats();
	}, [] );

	const fetchBaselineStats = () => {
		contributionsApi.list( { number: 200 } ).then( list => {
			if ( Array.isArray( list ) ) {
				const accepted = list.filter( c => c.is_accepted ).length;
				const work = list.filter( c => ! [ 'state_change', 'assignment', 'trash_request' ].includes( c.type ) ).length;
				const system = list.filter( c => [ 'state_change', 'assignment', 'trash_request' ].includes( c.type ) ).length;
				const pending = list.filter( c => ! c.is_accepted && ! [ 'state_change', 'assignment', 'trash_request' ].includes( c.type ) ).length;
				setStats( {
					total: list.length,
					accepted,
					pending,
					work,
					system
				} );
			}
		} ).catch( console.error );
	};

	const fetchContributions = () => {
		setIsLoading( true );

		const filters = { number: 150 };
		if ( selectedProject ) filters.project_id = selectedProject;
		if ( selectedTask ) filters.task_id = selectedTask;
		if ( selectedAuthor ) filters.user_id = selectedAuthor;
		if ( searchQuery.trim() ) filters.search = searchQuery.trim();

		if ( selectedStatus === 'accepted' ) {
			filters.is_accepted = '1';
		} else if ( selectedStatus === 'pending' ) {
			filters.is_accepted = '0';
		}

		if ( selectedType === 'work' ) {
			filters.type_not_in = 'state_change,assignment,trash_request';
		} else if ( selectedType === 'system' ) {
			filters.type_in = 'state_change,assignment,trash_request';
		} else if ( selectedType !== 'all' ) {
			filters.type_in = selectedType;
		}

		contributionsApi.list( filters ).then( data => {
			setContributions( Array.isArray( data ) ? data : [] );
			setIsLoading( false );
		} ).catch( err => {
			console.error( err );
			setIsLoading( false );
		} );
	};

	useEffect( () => {
		const timer = setTimeout( () => {
			fetchContributions();
		}, searchQuery ? 300 : 0 );
		return () => clearTimeout( timer );
	}, [ selectedProject, selectedTask, selectedAuthor, selectedType, selectedStatus, searchQuery, refreshKey ] );

	const handleAccept = ( contribution ) => {
		setConfirmModalConfig( {
			isActive: true,
			title: __( 'Accept Contribution as Verified Solution', 'workpress' ),
			message: `${ __( 'Are you sure you want to accept this contribution as verified solution for task', 'workpress' ) } "${ contribution.task_title }"?`,
			confirmText: __( 'Accept Solution & Complete Task', 'workpress' ),
			confirmColor: 'is-success',
			isDangerous: false,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				contributionsApi.accept( contribution.id )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						toast( __( 'Solution accepted and task completed successfully', 'workpress' ), 'success' );
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction( 'workpress_refresh_notifications' );
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'An error occurred during accept', 'workpress' ), 'danger' );
					} );
			}
		} );
	};

	const handleRevoke = ( contribution ) => {
		setConfirmModalConfig( {
			isActive: true,
			title: __( 'Revoke Approval', 'workpress' ),
			message: `${ __( 'Are you sure you want to revoke approval for solution in task', 'workpress' ) } "${ contribution.task_title }"?`,
			confirmText: __( 'Revoke & Reopen', 'workpress' ),
			confirmColor: 'is-warning',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				contributionsApi.revoke( contribution.id )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						toast( __( 'Approval revoked and task reopened successfully', 'workpress' ), 'info' );
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction( 'workpress_refresh_notifications' );
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'An error occurred during revoke', 'workpress' ), 'danger' );
					} );
			}
		} );
	};

	const handleTrashRequest = ( contribution ) => {
		setConfirmModalConfig( {
			isActive: true,
			title: __( 'Trash Contribution Request', 'workpress' ),
			message: `${ __( 'Are you sure you want to request trashing contribution for task', 'workpress' ) } "${ contribution.task_title }"?`,
			confirmText: __( 'Submit Request', 'workpress' ),
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: __( 'Reason for deletion', 'workpress' ),
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				contributionsApi.trashRequest( contribution.id, reason )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						toast( __( 'Trash request sent successfully.', 'workpress' ), 'info' );
						fetchContributions();
						fetchBaselineStats();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'Failed to send feedback, please try again.', 'workpress' ), 'danger' );
					} );
			}
		} );
	};

	const handleRestore = ( contribution ) => {
		setContributions( prev => prev.map( c => c.id === contribution.id ? { ...c, is_pending_trash: false } : c ) );
		contributionsApi.update( contribution.id, { is_pending_trash: false } )
			.then( () => {
				toast( __( 'Contribution restored successfully', 'workpress' ), 'success' );
				fetchContributions();
				fetchBaselineStats();
			} )
			.catch( err => {
				toast( err.message || __( 'An error occurred during restore', 'workpress' ), 'danger' );
				fetchContributions();
			} );
	};

	const handleHardDelete = ( contribution ) => {
		setConfirmModalConfig( {
			isActive: true,
			title: __( 'Confirm Permanent Deletion', 'workpress' ),
			message: __( 'Are you sure you want to permanently delete this item? This action cannot be undone.', 'workpress' ),
			confirmText: __( 'Delete Permanently', 'workpress' ),
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				setContributions( prev => prev.filter( c => c.id !== contribution.id ) );
				contributionsApi.delete( contribution.id )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						toast( __( 'Contribution permanently deleted', 'workpress' ), 'success' );
						fetchContributions();
						fetchBaselineStats();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger' );
						fetchContributions();
					} );
			}
		} );
	};

	const handleToggleSelect = ( id ) => {
		setSelectedIds( prev => prev.includes( id ) ? prev.filter( x => x !== id ) : [ ...prev, id ] );
	};

	const handleSelectAll = () => {
		const pageIds = paginatedContributions.map( c => c.id );
		const allSelected = pageIds.length > 0 && pageIds.every( id => selectedIds.includes( id ) );
		if ( allSelected ) {
			setSelectedIds( prev => prev.filter( id => ! pageIds.includes( id ) ) );
		} else {
			setSelectedIds( prev => Array.from( new Set( [ ...prev, ...pageIds ] ) ) );
		}
	};

	const handleBulkAccept = () => {
		const pendingSelected = contributions.filter( c => selectedIds.includes( c.id ) && ! c.is_accepted );
		if ( pendingSelected.length === 0 ) {
			toast( __( 'No pending contributions among selected items', 'workpress' ), 'warning' );
			return;
		}
		setConfirmModalConfig( {
			isActive: true,
			title: sprintf( __( 'Bulk Approve %d Solutions', 'workpress' ), pendingSelected.length ),
			message: sprintf( __( 'Are you sure you want to approve %d selected contributions as official verified solutions and complete their respective tasks?', 'workpress' ), pendingSelected.length ),
			confirmText: __( 'Approve All Selected', 'workpress' ),
			confirmColor: 'is-success',
			isDangerous: false,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				Promise.all( pendingSelected.map( c => contributionsApi.accept( c.id ) ) )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						setSelectedIds( [] );
						toast( __( 'Selected solutions approved successfully', 'workpress' ), 'success' );
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction( 'workpress_refresh_notifications' );
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'An error occurred during bulk approve', 'workpress' ), 'danger' );
						fetchContributions();
					} );
			}
		} );
	};

	const handleBulkTrash = () => {
		setConfirmModalConfig( {
			isActive: true,
			title: sprintf( __( 'Bulk Delete %d Contributions', 'workpress' ), selectedIds.length ),
			message: sprintf( __( 'Are you sure you want to request deletion for %d selected contributions?', 'workpress' ), selectedIds.length ),
			confirmText: __( 'Delete Selected', 'workpress' ),
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: true,
			reasonLabel: __( 'Reason for deletion', 'workpress' ),
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ( { ...prev, isSubmitting: true } ) );
				Promise.all( selectedIds.map( id => contributionsApi.trashRequest( id, reason ) ) )
					.then( () => {
						setConfirmModalConfig( { isActive: false } );
						setSelectedIds( [] );
						toast( __( 'Deletion requests submitted successfully', 'workpress' ), 'info' );
						fetchContributions();
						fetchBaselineStats();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ( { ...prev, isSubmitting: false } ) );
						toast( err.message || __( 'An error occurred during bulk delete', 'workpress' ), 'danger' );
						fetchContributions();
					} );
			}
		} );
	};

	const handleProjectChange = ( val ) => {
		setSelectedProject( val );
		setSelectedTask( '' );
		sound.play( 'click' );
	};

	const projectOptions = [
		{ value: '', label: __( 'All Projects', 'workpress' ) },
		...projects.map( p => ( { value: String( p.id ), label: p.name } ) )
	];

	const filteredTasks = selectedProject
		? tasks.filter( t => String( t.project_id ) === String( selectedProject ) )
		: tasks;

	const taskOptions = [
		{ value: '', label: __( 'All Tasks', 'workpress' ) },
		...filteredTasks.map( t => ( { value: String( t.id ), label: t.title || `#${ t.id }` } ) )
	];

	const authorOptions = [
		{ value: '', label: __( 'All Members', 'workpress' ) },
		...users.map( u => ( { value: String( u.id ), label: u.name || u.display_name || u.username } ) )
	];

	const isFilterActive = Boolean( selectedProject || selectedTask || selectedAuthor || selectedType !== 'all' || selectedStatus !== 'all' || searchQuery );

	const handleResetFilters = () => {
		setSelectedProject( '' );
		setSelectedTask( '' );
		setSelectedAuthor( '' );
		setSelectedType( 'all' );
		setSelectedStatus( 'all' );
		setSearchQuery( '' );
	};

	// Pagination calculations
	const totalItems = contributions.length;
	const totalPages = Math.ceil( totalItems / itemsPerPage ) || 1;
	const validCurrentPage = Math.min( Math.max( 1, currentPage ), totalPages );
	const startIndex = ( validCurrentPage - 1 ) * itemsPerPage;
	const endIndex = Math.min( startIndex + itemsPerPage, totalItems );
	const paginatedContributions = contributions.slice( startIndex, endIndex );

	const getPageNumbers = ( current, total ) => {
		if ( total <= 7 ) {
			return Array.from( { length: total }, ( _, i ) => i + 1 );
		}
		if ( current <= 4 ) {
			return [ 1, 2, 3, 4, 5, '...', total ];
		}
		if ( current >= total - 3 ) {
			return [ 1, '...', total - 4, total - 3, total - 2, total - 1, total ];
		}
		return [ 1, '...', current - 1, current, current + 1, '...', total ];
	};

	return html`
		<div className="contributions-page pb-6">
			<!-- شريط الأدوات والفلترة العلوي الموحد -->
			<${ContributionFilterBar}
				totalCount=${ stats.total || contributions.length }
				acceptedCount=${ stats.accepted }
				pendingCount=${ stats.pending }
				workCount=${ stats.work }
				systemCount=${ stats.system }
				searchQuery=${ searchQuery }
				setSearchQuery=${ setSearchQuery }
				selectedStatus=${ selectedStatus }
				setSelectedStatus=${ setSelectedStatus }
				selectedType=${ selectedType }
				setSelectedType=${ setSelectedType }
				selectedProject=${ selectedProject }
				onProjectChange=${ handleProjectChange }
				projectOptions=${ projectOptions }
				selectedTask=${ selectedTask }
				setSelectedTask=${ setSelectedTask }
				taskOptions=${ taskOptions }
				selectedAuthor=${ selectedAuthor }
				setSelectedAuthor=${ setSelectedAuthor }
				authorOptions=${ authorOptions }
				viewMode=${ viewMode }
				setViewMode=${ setViewMode }
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			<!-- قائمة المساهمات (بطاقات أو جدول تنفيذي) -->
			${ isLoading ? html`
				<div className="py-6 mt-4 has-text-centered">
					<${Loader} center=${ true } label=${ __( 'Loading contributions...', 'workpress' ) } size="large" />
				</div>
			` : totalItems === 0 ? html`
				<div className="box wp-card has-text-centered py-6 mt-4" style=${{ borderRadius: 0 }}>
					<span className="icon is-large has-text-grey-light mb-3">
						<i className="dashicons dashicons-admin-comments" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h3 className="title is-5 mb-2 has-text-dark">${ isFilterActive ? __( 'No contributions matching selected filters', 'workpress' ) : __( 'Contributions stream is currently empty', 'workpress' ) }</h3>
					<p className="subtitle is-6 has-text-grey-light mb-4">${ isFilterActive ? __( 'Try adjusting search terms or active filters to find what you are looking for.', 'workpress' ) : __( 'Contributions represent technical solutions and work evidence submitted by team members.', 'workpress' ) }</p>
					${ isFilterActive && html`
						<button className="button is-light wp-btn" onClick=${ handleResetFilters }>
							<i className="dashicons dashicons-image-rotate" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
							<span>${ __( 'Reset Filters', 'workpress' ) }</span>
						</button>
					` }
				</div>
			` : viewMode === 'table' ? html`
				<div className="wp-contributions-table-container mt-4">
					<table className="wp-contributions-table">
						<thead>
							<tr>
								<th style=${{ width: '38px', textAlign: 'center' }}>
									<input
										type="checkbox"
										checked=${ paginatedContributions.length > 0 && paginatedContributions.every( c => selectedIds.includes( c.id ) ) }
										onChange=${ handleSelectAll }
										title=${ __( 'Select all on this page', 'workpress' ) }
										style=${{ cursor: 'pointer', accentColor: '#10b981' }}
									/>
								</th>
								<th style=${{ width: '150px' }}>${ __( 'Project', 'workpress' ) }</th>
								<th>${ __( 'Task & Content', 'workpress' ) }</th>
								<th style=${{ width: '130px' }}>${ __( 'Type', 'workpress' ) }</th>
								<th style=${{ width: '120px' }}>${ __( 'Author', 'workpress' ) }</th>
								<th style=${{ width: '110px' }}>${ __( 'Date', 'workpress' ) }</th>
								<th style=${{ width: '100px', textAlign: rtl ? 'left' : 'right' }}>${ __( 'Actions', 'workpress' ) }</th>
							</tr>
						</thead>
						<tbody>
							${ paginatedContributions.map( item => {
								const isAccepted = Boolean( item.is_accepted );
								const clean = item.content ? item.content.replace( /<[^>]*>?/gm, '' ) : '';

								return html`
									<tr key=${ `tr_${ item.id }` } style=${{ backgroundColor: selectedIds.includes( item.id ) ? '#f0fdf4' : 'transparent' }}>
										<td style=${{ textAlign: 'center' }} onClick=${ e => e.stopPropagation() }>
											<input
												type="checkbox"
												checked=${ selectedIds.includes( item.id ) }
												onChange=${ () => handleToggleSelect( item.id ) }
												style=${{ cursor: 'pointer', accentColor: '#10b981' }}
											/>
										</td>
										<td>
											<span className="tag is-dark is-rounded is-small has-text-weight-bold wp-text-truncate" style=${{ maxWidth: '140px' }}>
												${ item.project_name || __( 'PRJ', 'workpress' ) }
											</span>
										</td>
										<td>
											<a href=${ `#/tasks/${ item.task_id }` } className="has-text-dark has-text-weight-bold wp-hover-primary is-block mb-1">
												${ item.task_title || `#${ item.task_id }` }
											</a>
											<span className="is-size-7 has-text-grey wp-text-truncate is-block" style=${{ maxWidth: '380px' }}>
												${ clean }
											</span>
										</td>
										<td>
											${ isAccepted ? html`
												<span className="tag is-success is-light is-rounded is-small has-text-weight-bold">
													${ __( 'Approved Solution', 'workpress' ) }
												</span>
											` : html`
												<span className="tag is-info is-light is-rounded is-small has-text-weight-bold">
													${ item.type_label || __( 'Work', 'workpress' ) }
												</span>
											` }
										</td>
										<td>
											<span className="is-size-7 has-text-weight-bold has-text-dark">
												${ item.author_name || __( 'Staff', 'workpress' ) }
											</span>
										</td>
										<td>
											<span className="is-size-7 has-text-grey">
												${ formatDate( item.created_at, { hideYear: true } ) }
											</span>
										</td>
										<td style=${{ textAlign: rtl ? 'left' : 'right' }}>
											<div className="is-inline-flex" style=${{ gap: '4px' }}>
												<button
													type="button"
													className="button is-light is-small wp-btn"
													onClick=${ () => { setPreviewContribution( item ); setIsPreviewModalOpen( true ); } }
													title=${ __( 'Preview details', 'workpress' ) }
													style=${{ height: '28px', padding: '0 8px' }}
												>
													<i className="dashicons dashicons-visibility"></i>
												</button>
												${ ( item.can_accept && ! isAccepted ) ? html`
													<button
														type="button"
														className="button is-success is-small wp-btn"
														onClick=${ () => handleAccept( item ) }
														title=${ __( 'Accept Solution', 'workpress' ) }
														style=${{ height: '28px', padding: '0 8px' }}
													>
														<i className="dashicons dashicons-yes-alt"></i>
													</button>
												` : null }
											</div>
										</td>
									</tr>
								`;
							} ) }
						</tbody>
					</table>
				</div>
			` : html`
				<div className="columns is-multiline mt-4">
					${ paginatedContributions.map( item => html`
						<div key=${ item.id } className="column is-4-desktop is-6-tablet is-12-mobile">
							<${ContributionCard}
								contribution=${ item }
								isSelected=${ selectedIds.includes( item.id ) }
								onToggleSelect=${ () => handleToggleSelect( item.id ) }
								onRefresh=${ fetchContributions }
								onPreview=${ ( c ) => { setPreviewContribution( c ); setIsPreviewModalOpen( true ); } }
								onAccept=${ handleAccept }
								onRevoke=${ handleRevoke }
								onTrashRequest=${ handleTrashRequest }
								onRestore=${ handleRestore }
								onHardDelete=${ handleHardDelete }
							/>
						</div>
					` ) }
				</div>
			` }

			<!-- شريط الإجراءات الجماعية العائم (Bulk Floating Actions Bar) -->
			${ selectedIds.length > 0 && html`
				<div className="wp-bulk-actions-floating-bar">
					<div className="wp-bulk-actions-content">
						<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
							<span className="tag is-primary is-rounded has-text-weight-bold" style=${{ padding: '2px 8px', fontSize: '0.75rem', height: '22px' }}>
								${ sprintf( __( '%d Selected', 'workpress' ), selectedIds.length ) }
							</span>
							<span className="is-size-7 has-text-white" style=${{ opacity: 0.9 }}>
								${ __( 'Actions for selected items:', 'workpress' ) }
							</span>
						</div>
						<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<!-- Bulk Approve Button -->
							<button
								type="button"
								className="button is-success is-small wp-btn has-text-weight-bold"
								onClick=${ handleBulkAccept }
								style=${{ height: '28px', fontSize: '0.75rem' }}
							>
								<i className="dashicons dashicons-yes-alt" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
								<span>${ __( 'Bulk Verify & Complete', 'workpress' ) }</span>
							</button>

							<!-- Bulk Trash Button -->
							<button
								type="button"
								className="button is-danger is-small wp-btn has-text-weight-bold"
								onClick=${ handleBulkTrash }
								style=${{ height: '28px', fontSize: '0.75rem' }}
							>
								<i className="dashicons dashicons-trash" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
								<span>${ __( 'Bulk Delete', 'workpress' ) }</span>
							</button>

							<!-- Clear Selection Button -->
							<button
								type="button"
								className="button is-white is-outlined is-small wp-btn"
								onClick=${ () => setSelectedIds( [] ) }
								title=${ __( 'Cancel selection', 'workpress' ) }
								style=${{ height: '28px', width: '28px', padding: 0 }}
							>
								<i className="dashicons dashicons-no-alt" style=${{ fontSize: '14px' }}></i>
							</button>
						</div>
					</div>
				</div>
			` }

			<!-- ترقيم الصفحات المتوافق مع الفلاتر -->
			${ ! isLoading && totalItems > 0 && html`
				<div className="wp-reports-pagination-container">
					<div className="is-size-7 has-text-grey has-text-weight-semibold">
						${ sprintf( __( 'Showing %d - %d of %d contributions', 'workpress' ), startIndex + 1, endIndex, totalItems ) }
					</div>

					${ totalPages > 1 && html`
						<div className="wp-pagination-controls">
							<!-- Previous Page Button -->
							<button
								type="button"
								className="wp-pagination-btn"
								disabled=${ validCurrentPage <= 1 }
								onClick=${ () => { setCurrentPage( prev => Math.max( 1, prev - 1 ) ); sound.play( 'click' ); } }
								title=${ __( 'Previous Page', 'workpress' ) }
							>
								<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` }></i>
							</button>

							<!-- Page Number Buttons -->
							${ getPageNumbers( validCurrentPage, totalPages ).map( ( p, idx ) => {
								if ( p === '...' ) {
									return html`<span key=${ `el_${ idx }` } className="wp-pagination-ellipsis">…</span>`;
								}
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

							<!-- Next Page Button -->
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

			<!-- نافذة تفاصيل المساهمة الكاملة -->
			<${ContributionDetailModal}
				isActive=${ isPreviewModalOpen }
				onClose=${ () => { setIsPreviewModalOpen( false ); setPreviewContribution( null ); } }
				contribution=${ previewContribution }
				onStatusChange=${ () => { fetchContributions(); fetchBaselineStats(); } }
			/>

			<!-- نافذة تأكيد الإجراءات -->
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
		</div>
	`;
}
