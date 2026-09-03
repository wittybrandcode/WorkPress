import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import PriorityBadge from '../ui/PriorityBadge.js';
import AvatarStack from '../ui/AvatarStack.js';

export default function TaskCard( { task, isSkeleton, onClick, draggable, onDragStart, onDragEnd, onEdit, onManageAssignment, onDelete, onTrashRequest, onRestore, onAddContribution, onClone, onQuickPreview } ) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSelfDragging, setIsSelfDragging] = useState(false);
	const dropdownRef = useRef(null);
	const rtl = isRtl();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const toggleMenu = (e) => {
		e.stopPropagation();
		setIsMenuOpen(!isMenuOpen);
	};

	const handleDragStartInternal = (e) => {
		setIsSelfDragging(true);
		if (onDragStart) onDragStart(e, task);
	};

	const handleDragEndInternal = (e) => {
		setIsSelfDragging(false);
		if (onDragEnd) onDragEnd(e, task);
	};

	const cardClass = 'box wp-card wp-project-card p-0 mb-3 is-flex is-flex-direction-column' + (isSelfDragging ? ' wp-task-card-dragging' : '');

	const cardStyle = {
		cursor: draggable ? (isSelfDragging ? 'grabbing' : 'grab') : 'pointer',
		zIndex: isMenuOpen ? 20 : 1,
		position: 'relative'
	};

	if (isSkeleton) {
		return html`
			<div className="box wp-card p-0 mb-3 wp-task-card-skeleton">
				<div>
					<span className="icon is-large has-text-grey"><i className="dashicons dashicons-portfolio" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i></span>
				</div>
			</div>
		`;
	}

	const getStatusBadge = (status) => {
		switch (status) {
			case 'completed':
			case 'closed':
				return html`<span className="wp-dense-chip is-success" title=${ __( 'Completed', 'workpress' ) }><i className="dashicons dashicons-yes-alt"></i> <span>${ __( 'Completed', 'workpress' ) }</span></span>`;
			case 'in_progress':
			case 'in_review':
				return html`<span className="wp-dense-chip is-warning" title=${ __( 'In Progress', 'workpress' ) }><i className="dashicons dashicons-hammer"></i> <span>${ __( 'In Progress', 'workpress' ) }</span></span>`;
			case 'assigned':
				return html`<span className="wp-dense-chip is-info" title=${ __( 'Assigned', 'workpress' ) }><i className="dashicons dashicons-admin-users"></i> <span>${ __( 'Assigned', 'workpress' ) }</span></span>`;
			case 'new':
			case 'open':
			default:
				return html`<span className="wp-dense-chip" title=${ __( 'New', 'workpress' ) }><i className="dashicons dashicons-tag"></i> <span>${ __( 'New', 'workpress' ) }</span></span>`;
		}
	};

	return html`
		<div className=${cardClass} style=${cardStyle} onClick=${ (e) => { if (task.is_pending_trash) { e.preventDefault(); return; } if (onClick) onClick(task); } }>
			${ task.is_pending_trash ? html`
				<div style=${{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 56, 96, 0.15)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }} onClick=${(e) => e.stopPropagation()}>
					<div style=${{ width: '100%', backgroundColor: '#7f1d1d', color: 'white', border: '1px solid #b91c1c', padding: '12px', textAlign: 'center', borderRadius: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
						<div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px', fontWeight: '900', fontSize: '0.85rem' }}>
							<i className="dashicons dashicons-warning" style=${{ color: '#fca5a5' }}></i>
							<span>${ __( 'Trash / Archive Request', 'workpress' ) }</span>
						</div>
						<p style=${{ fontSize: '0.72rem', opacity: 0.9, marginBottom: '8px' }}>
							${ task.trash_reason || __( 'No reason specified', 'workpress' ) }
						</p>
						<div style=${{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
							<button className="button is-small is-light wp-sharp-button" style=${{ height: '26px', fontSize: '0.72rem', fontWeight: '800' }} onClick=${ (e) => { e.stopPropagation(); onRestore && onRestore(task); } }>
								${ __( 'Restore & Reject', 'workpress' ) }
							</button>
							<button className="button is-small is-danger wp-sharp-button" style=${{ height: '26px', fontSize: '0.72rem', fontWeight: '800' }} onClick=${ (e) => { e.stopPropagation(); onDelete && onDelete(task); } }>
								${ __( 'Delete Permanently', 'workpress' ) }
							</button>
						</div>
					</div>
				</div>
			` : null }

			<!-- 1. Cover Image or Pure Symbolic Icon Container (No Text) -->
			${ task.cover_url ? html`
				<figure className="image m-0 wp-border-bottom" style=${{ height: '180px', overflow: 'hidden', backgroundColor: '#0f172a' }}>
					<img src=${ task.cover_url } alt=${ task.title } style=${{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
				</figure>
			` : html`
				<figure className="image m-0 wp-border-bottom" style=${{ height: '140px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #e2e8f0' }}>
					<div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<span className="icon is-large has-text-grey-light" style=${{ width: '48px', height: '48px' }}>
							<i className="dashicons dashicons-clipboard" style=${{ fontSize: '42px', width: '42px', height: '42px', color: '#94a3b8' }}></i>
						</span>
					</div>
				</figure>
			` }

			<!-- 2. Middle Body: Title Row + Project Row with Icon -->
			<div className="p-3 is-flex-grow-1" style=${{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
				<!-- Line 1: Task Title -->
				<div className="has-text-dark has-text-weight-bold" style=${{ fontSize: '0.92rem', lineHeight: 1.35, wordBreak: 'break-word' }} title=${ task.title }>
					${ task.title }
				</div>

				<!-- Line 2: Project with Portfolio Icon -->
				<div className="is-flex is-align-items-center has-text-grey" style=${{ fontSize: '0.76rem', fontWeight: '700', gap: '4px' }}>
					<i className="dashicons dashicons-portfolio" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#64748b' }}></i>
					<span className="wp-text-truncate" style=${{ maxWidth: '240px' }}>
						${ task.project_name || __( 'No Project', 'workpress' ) }
					</span>
				</div>
			</div>

			<!-- 3. Bottom Bar: Status, Priority, Time, Checklist, Attachments, Comments, Assignees, Actions -->
			<div className="px-3 py-2 is-flex is-justify-content-space-between is-align-items-center has-background-light mt-auto wp-border-top" style=${{ minHeight: '36px', flexWrap: 'wrap', gap: '6px' }}>
				
				<!-- Left Icons Stack -->
				<div className="is-flex is-align-items-center" style=${{ gap: '4px', flexWrap: 'wrap' }}>
					<!-- 1. Status Badge -->
					${ getStatusBadge(task.status) }

					<!-- 2. Priority Badge -->
					<${PriorityBadge} priority=${ task.priority } />

					<!-- 3. Time Tracker Chip -->
					${ ( task.estimated_hours > 0 || task.logged_hours > 0 ) ? html`
						<span 
							className=${ `wp-dense-chip ${ ( task.estimated_hours > 0 && task.logged_hours > task.estimated_hours ) ? 'is-danger' : '' }` }
							title=${ sprintf( __( 'Logged: %sh / Estimated: %sh', 'workpress' ), task.logged_hours || 0, task.estimated_hours || 0 ) }
						>
							<i className="dashicons dashicons-clock"></i>
							<span>${ task.logged_hours || 0 }${ task.estimated_hours > 0 ? `/${ task.estimated_hours }` : '' }h</span>
						</span>
					` : null }

					<!-- 4. Checklist Progress Chip -->
					${ task.checklists_count > 0 ? html`
						<span 
							className=${ `wp-dense-chip ${ task.checklists_progress === 100 ? 'is-success' : 'is-info' }` }
							title=${ sprintf( __( 'Checklist: %d of %d completed (%d%%)', 'workpress' ), task.checklists_completed_count, task.checklists_count, task.checklists_progress ) }
						>
							<i className="dashicons dashicons-editor-ul"></i>
							<span>${ task.checklists_completed_count }/${ task.checklists_count }</span>
						</span>
					` : null }

					<!-- 5. Attachments Chip -->
					${ task.attachments_count > 0 ? html`
						<span className="wp-dense-chip" title=${ sprintf( __( '%d attachments and documents', 'workpress' ), task.attachments_count ) }>
							<i className="dashicons dashicons-paperclip"></i>
							<span>${ task.attachments_count }</span>
						</span>
					` : null }

					<!-- 6. Comments Chip -->
					${ task.comment_count > 0 ? html`
						<span className="wp-dense-chip" title=${ sprintf( __( '%d contributions & comments', 'workpress' ), task.comment_count ) }>
							<i className="dashicons dashicons-admin-comments"></i>
							<span>${ task.comment_count }</span>
						</span>
					` : null }

					<!-- 7. Assignees Profile Avatar Stack -->
					${ task.assignees && task.assignees.length > 0 ? html`
						<div title=${ __( 'Assignees', 'workpress' ) } className="is-flex is-align-items-center mr-1">
							<${AvatarStack} users=${ task.assignees } max=${ 3 } size=${ 20 } />
						</div>
					` : null }
				</div>

				<!-- Right Action Micro Icon Buttons -->
				<div className="is-flex is-align-items-center" style=${{ gap: '3px' }} onClick=${ (e) => e.stopPropagation() }>
					<button 
						type="button" 
						className="wp-icon-btn is-dense" 
						onClick=${ (e) => { e.stopPropagation(); onQuickPreview && onQuickPreview(task); } } 
						title=${ __( 'Quick Preview', 'workpress' ) }
					>
						<i className="dashicons dashicons-visibility"></i>
					</button>

					<div ref=${dropdownRef} className=${`dropdown is-up ${rtl ? 'is-left' : 'is-right'} ${isMenuOpen ? 'is-active' : ''}`} style=${{ zIndex: isMenuOpen ? 100 : 1 }}>
						<div className="dropdown-trigger">
							<button 
								type="button" 
								className="wp-icon-btn is-dense" 
								aria-haspopup="true" 
								aria-controls="dropdown-menu" 
								onClick=${toggleMenu} 
								title=${ __( 'Extra Actions', 'workpress' ) }
							>
								<i className="dashicons dashicons-ellipsis"></i>
							</button>
						</div>
						<div 
							className="dropdown-menu" 
							id="dropdown-menu" 
							role="menu" 
							style=${{ 
								zIndex: 1000,
								minWidth: '190px',
								insetInlineEnd: 0,
								insetInlineStart: 'auto',
								[rtl ? 'left' : 'right']: 0,
								[rtl ? 'right' : 'left']: 'auto'
							}}
						>
							<div className="dropdown-content p-0" style=${{ borderRadius: '0', border: '1px solid #0f172a', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
								${ task.is_pending_trash ? html`
									<div className="dropdown-item p-2 has-text-centered is-size-7 has-text-grey">
										${ __( 'Task pending deletion', 'workpress' ) }
									</div>
								` : html`
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onAddContribution && onAddContribution(task); setIsMenuOpen(false); } }>
										<i className="dashicons dashicons-plus-alt2"></i> <span>${ __( 'Add Contribution', 'workpress' ) }</span>
									</a>
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onEdit && onEdit(task); setIsMenuOpen(false); } }>
										<i className="dashicons dashicons-edit"></i> <span>${ __( 'Edit Task', 'workpress' ) }</span>
									</a>
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onManageAssignment && onManageAssignment(task); setIsMenuOpen(false); } }>
										<i className="dashicons dashicons-admin-users"></i> <span>${ __( 'Assignees', 'workpress' ) }</span>
									</a>
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onClone && onClone(task); setIsMenuOpen(false); } }>
										<i className="dashicons dashicons-admin-page"></i> <span>${ __( 'Clone', 'workpress' ) }</span>
									</a>
									<hr className="dropdown-divider m-0" />
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-danger" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onTrashRequest ? onTrashRequest(task) : (onDelete && onDelete(task)); setIsMenuOpen(false); } }>
										<i className="dashicons dashicons-trash"></i> <span>${ __( 'Trash / Archive Request', 'workpress' ) }</span>
									</a>
								`}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}
