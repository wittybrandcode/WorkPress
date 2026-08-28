import { html, useState, useEffect, useRef } from '../../utils/html.js';

export default function ProjectCard( { project, onEdit, onManageMembers, onDelete, onRestore, onAddTask, onQuickPreview } ) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const cleanDescription = project.description ? project.description.replace(/<[^>]*>?/gm, '') : 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ Ù„Ù„Ù…Ø´Ø±ÙˆØ¹.';
	
	const descriptionStyle = {
		display: '-webkit-box',
		WebkitLineClamp: '2',
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		lineHeight: '1.5',
		minHeight: '3em',
		maxHeight: '3em'
	};

	const toggleMenu = (e) => {
		e.stopPropagation();
		setIsMenuOpen(!isMenuOpen);
	};

	return html`
		<div className=${`box wp-card wp-project-card p-0 h-100 is-flex is-flex-direction-column ${project.is_pending_trash ? 'is-pending-trash' : ''}`} style=${{ position: 'relative', border: project.is_pending_trash ? '2px solid #ff3860' : '', overflow: 'hidden' }} onClick=${ (e) => { if (project.is_pending_trash) { e.preventDefault(); return; } window.location.hash = '#/projects/' + project.id; } }>
			${ project.is_pending_trash ? html`
				<div style=${{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 56, 96, 0.15)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(3px)' }} onClick=${(e) => e.stopPropagation()}>
					<div className="box has-text-centered p-4" style=${{ width: '100%', backgroundColor: '#ff3860', color: 'white', border: '1px solid #ff1f4b', boxShadow: '0 8px 24px rgba(255,56,96,0.3)', borderRadius: '8px' }}>
						<span className="icon is-large mb-1"><i className="dashicons dashicons-warning" style=${{ fontSize: '36px', width: '36px', height: '36px' }}></i></span>
						<h4 className="title is-6 has-text-white mb-2">Ø·Ù„Ø¨ Ø­Ø°Ù Ù…Ø´Ø±ÙˆØ¹</h4>
						<p className="is-size-7 mb-4" style=${{ opacity: 0.9 }}>
							<strong>Ø§Ù„Ø³Ø¨Ø¨:</strong> ${ project.trash_reason || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' }
						</p>
						<div className="buttons is-centered">
							<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onRestore && onRestore(project); } }>
								<span className="icon"><i className="dashicons dashicons-undo"></i></span>
								<span>Ø±ÙØ¶ ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø©</span>
							</button>
							<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onDelete && onDelete(project); } }>
								<span className="icon"><i className="dashicons dashicons-trash"></i></span>
								<span>Ø­Ø°Ù Ù†Ù‡Ø§Ø¦ÙŠ</span>
							</button>
						</div>
					</div>
				</div>
			` : null }
			${ project.cover_url ? html`
				<figure className="image is-2by1 m-0 wp-border-bottom">
					<img src=${ project.cover_url } alt=${ project.name } style=${{ objectFit: 'cover' }} />
				</figure>
			` : html`
				<figure className="image is-2by1 m-0 wp-border-bottom">
					<div className="has-ratio has-background-dark is-flex is-align-items-center is-justify-content-center">
						<span className="icon is-large has-text-white-ter"><i className="dashicons dashicons-portfolio" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i></span>
					</div>
				</figure>
			`}
			
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
					<h3 className="title is-4 mb-0">${ project.name }</h3>
					${ (project.is_frozen || project.status === 'frozen') ? html`
						<span className="tag has-text-weight-bold" style=${{ borderRadius: 0, backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }} title="Ù…Ø´Ø±ÙˆØ¹ Ù…Ø­ÙÙˆØ¸ ÙÙŠ Ø«Ù„Ø§Ø¬Ø© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ù„ØªØºÙŠØ± Ø¯ÙˆØ± Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ Ø¥Ù„Ù‰ Ù…Ø´ØªØ±Ùƒ">
							ÙÙŠ Ø§Ù„Ø«Ù„Ø§Ø¬Ø© (Ù…Ø¬Ù…Ø¯)
						</span>
					` : ( project.is_client_request ? html`
						<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }} title="Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ù…Ø³ØªÙÙŠØ¯">
							Ø·Ù„Ø¨ Ù…Ø³ØªÙÙŠØ¯
						</span>
					` : ( ( project.is_completed || project.progress === 100 ) ? html`
						<span className="tag is-success has-text-weight-bold" style=${{ borderRadius: 0 }} title="Ù…Ø´Ø±ÙˆØ¹ Ù…ÙƒØªÙ…Ù„">
							<i className="dashicons dashicons-awards ml-1"></i> Ù…ÙƒØªÙ…Ù„ (${ project.progress || 100 }%)
						</span>
					` : ( project.progress > 0 ? html`
						<span className="tag is-info is-light has-text-weight-bold" style=${{ borderRadius: 0 }}>
							${ project.progress }%
						</span>
					` : null ) ) ) }
				</div>
				<p className="subtitle is-6 has-text-grey mb-4" style=${descriptionStyle}>
					${ cleanDescription }
				</p>
				<!-- Progress Bar -->
				<div className="mt-auto">
					<progress 
						className=${`progress is-small ${ (project.is_completed || project.progress === 100) ? 'is-success' : 'is-primary' }`} 
						value=${ project.progress || 0 } 
						max="100" 
						style=${{ height: '6px', borderRadius: 0, margin: 0 }}
					>
						${ project.progress || 0 }%
					</progress>
				</div>
			</div>
			
			<!-- Combined Footer Bar -->
			<div className="p-3 is-flex is-justify-content-space-between is-align-items-center has-background-light mt-auto wp-border-top">
				
				<!-- Right side: Stats -->
				<div className="is-flex is-align-items-center" style=${{ gap: '16px' }}>
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" style=${{ gap: '4px' }} title="Ø¹Ø¯Ø¯ Ø§Ù„Ù…Ù‡Ø§Ù…">
						<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span> 
						<span>${ project.count || project.total_tasks || 0 } Ù…Ù‡Ø§Ù…</span>
					</span>
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" style=${{ gap: '4px' }} title="Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©">
						<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span> 
						<span>${ project.completed_count || 0 } Ù…Ù†Ø¬Ø²Ø©</span>
					</span>
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" style=${{ gap: '4px' }} title="Ù†Ø³Ø¨Ø© Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²">
						<span className="icon is-small"><i className="dashicons dashicons-chart-pie"></i></span> 
						<span>${ project.progress || 0 }% Ø¥Ù†Ø¬Ø§Ø²</span>
					</span>
				</div>

				<!-- Left side: Actions Dropdown -->
				<div className="is-flex is-align-items-center">
					<button className="button is-small wp-icon-button mr-1" onClick=${ (e) => { e.stopPropagation(); onQuickPreview && onQuickPreview(project); } } title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø©">
						<span className="icon"><i className="dashicons dashicons-visibility"></i></span>
					</button>
					<div ref=${dropdownRef} className=${`dropdown is-up ${isMenuOpen ? 'is-active' : ''}`} style=${{ zIndex: isMenuOpen ? 100 : 1 }}>
						<div className="dropdown-trigger">
							<button className="button is-small wp-icon-button" aria-haspopup="true" aria-controls="dropdown-menu" onClick=${toggleMenu} title="Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹">
								<span className="icon has-text-grey-dark"><i className="dashicons dashicons-admin-generic"></i></span>
							</button>
						</div>
						<div className="dropdown-menu" id="dropdown-menu" role="menu">
							<div className="dropdown-content p-0" style=${{ borderRadius: '0', border: '1px solid #ededed', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
							${ project.is_pending_trash ? html`
								<div className="dropdown-item p-2 has-text-centered is-size-7 has-text-grey">
									Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù‚ÙŠØ¯ Ø§Ù„Ø­Ø°Ù
								</div>
							` : html`
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onAddTask && onAddTask(project); setIsMenuOpen(false); } }>
									<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span> <span>Ø¥Ø¶Ø§ÙØ© Ù…Ù‡Ù…Ø©</span>
								</a>
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onManageMembers && onManageMembers(project); setIsMenuOpen(false); } }>
									<span className="icon"><i className="dashicons dashicons-groups"></i></span> <span>Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡</span>
								</a>
								<hr className="dropdown-divider m-0" />
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onEdit && onEdit(project); setIsMenuOpen(false); } }>
									<span className="icon"><i className="dashicons dashicons-edit"></i></span> <span>ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</span>
								</a>
								<hr className="dropdown-divider m-0" />
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-danger" style=${{ gap: '8px' }} onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); onDelete && onDelete(project); setIsMenuOpen(false); } }>
									<span className="icon"><i className="dashicons dashicons-trash"></i></span> <span>Ø­Ø°Ù / Ø£Ø±Ø´ÙØ©</span>
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
