import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * QuickAddMenu Component
 *
 * Universal executive quick-create dropdown button (+) in the Breadcrumb bar.
 * Replaces separate redundant buttons with a unified, high-density speed dial.
 */
export default function QuickAddMenu({
	onNewProject,
	onNewTask,
	onNewContribution,
	onNewRequest,
	onNewBroadcast,
	isAdmin = false,
	userCaps = {}
}) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const rtl = isRtl();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleAction = (callback) => {
		setIsOpen(false);
		sound.play('pop');
		if (callback) callback();
	};

	const items = [
		(isAdmin || userCaps.canManageProjects) && {
			id: 'project',
			title: __( 'New Project', 'workpress' ),
			subtitle: __( 'Create a new workspace and project with deliverables', 'workpress' ),
			icon: 'dashicons-category',
			action: () => handleAction(onNewProject)
		},
		(isAdmin || userCaps.canCreateTasks) && {
			id: 'task',
			title: __( 'New Task', 'workpress' ),
			subtitle: __( 'Assign new task and define responsibilities', 'workpress' ),
			icon: 'dashicons-clipboard',
			action: () => handleAction(onNewTask)
		},
		(isAdmin || userCaps.canManageBroadcasts || true) && {
			id: 'broadcast',
			title: __( 'Managerial Directive / Broadcast', 'workpress' ),
			subtitle: __( 'Publish managerial directive or operational alert to the horizon stream', 'workpress' ),
			icon: 'dashicons-megaphone',
			action: () => handleAction(onNewBroadcast ? onNewBroadcast : () => { window.location.hash = '#/broadcasts'; })
		},
		{
			id: 'contribution',
			title: __( 'Verified Solution / Contribution', 'workpress' ),
			subtitle: __( 'Attach deliverable or document solution for review and signoff', 'workpress' ),
			icon: 'dashicons-share-alt2',
			action: () => handleAction(onNewContribution)
		},
		{
			id: 'request',
			title: __( 'Intake Form Request', 'workpress' ),
			subtitle: __( 'Submit proposal or new project request for triage', 'workpress' ),
			icon: 'dashicons-email-alt',
			action: () => handleAction(onNewRequest ? onNewRequest : () => { window.location.hash = '#/requests'; })
		},
		(isAdmin || userCaps.canManageRequests || true) && {
			id: 'forms',
			title: __( 'Intake Forms Builder', 'workpress' ),
			subtitle: __( 'Design and customize intake form templates', 'workpress' ),
			icon: 'dashicons-forms',
			action: () => handleAction(() => { window.location.hash = '#/forms'; })
		},
		{
			id: 'knowledge',
			title: __( 'Knowledge Asset / Documentation', 'workpress' ),
			subtitle: __( 'Document lessons learned or benchmark solution in knowledge base', 'workpress' ),
			icon: 'dashicons-book',
			action: () => handleAction(() => { window.location.hash = '#/knowledge'; })
		}
	].filter(Boolean);

	return html`
		<div 
			ref=${dropdownRef} 
			className=${`dropdown ${rtl ? 'is-left' : 'is-right'} ${isOpen ? 'is-active' : ''}`} 
			style=${{ margin: 0, zIndex: isOpen ? 100 : 1, display: 'inline-flex', alignItems: 'center', position: 'relative' }}
		>
			<div className="dropdown-trigger">
				<button 
					type="button"
					className=${`button wp-btn ${isOpen ? 'is-active' : ''}`}
					onClick=${() => { setIsOpen(!isOpen); sound.play('button'); }}
					title=${ __( 'Quick Add', 'workpress' ) }
					aria-haspopup="true"
					style=${{ 
						height: '30px', 
						padding: '0 10px', 
						display: 'inline-flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						gap: '5px',
						position: 'relative',
						borderRadius: 0,
						border: '1px solid #cbd5e1'
					}}
				>
					<span className="icon is-small" style=${{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<i className="dashicons dashicons-plus-alt2" style=${{ fontSize: '15px' }}></i>
					</span>
					<span className="has-text-weight-bold" style=${{ fontSize: '0.78rem' }}>
						${ __( 'Add', 'workpress' ) }
					</span>
					<i className="dashicons dashicons-arrow-down-alt2" style=${{ fontSize: '10px', opacity: 0.6, [rtl ? 'marginRight' : 'marginLeft']: '1px' }}></i>
				</button>
			</div>

			<div 
				className="dropdown-menu" 
				role="menu" 
				style=${{ 
					minWidth: '270px',
					maxWidth: 'min(320px, calc(100vw - 32px))',
					insetInlineEnd: 0,
					insetInlineStart: 'auto',
					[rtl ? 'left' : 'right']: 0,
					[rtl ? 'right' : 'left']: 'auto',
					top: '100%',
					paddingTop: '6px',
					zIndex: 1200
				}}
			>
				<div 
					className="dropdown-content wp-card p-0" 
					style=${{ 
						borderRadius: 0, 
						border: '1px solid #cbd5e1', 
						boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)', 
						backgroundColor: '#ffffff',
						overflow: 'hidden'
					}}
				>
					<div 
						className="px-3 py-2 is-flex is-align-items-center is-justify-content-space-between" 
						style=${{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
					>
						<span className="has-text-weight-bold" style=${{ fontSize: '0.75rem', color: '#0f172a' }}>
							${ __( 'New addition to WorkPress', 'workpress' ) }
						</span>
						<span className="tag is-small" style=${{ borderRadius: 0, height: '18px', fontSize: '0.68rem', backgroundColor: '#f1f5f9', color: '#64748b' }}>
							${ items.length } ${ __( 'options', 'workpress' ) }
						</span>
					</div>

					<div className="py-1">
						${ items.map(item => html`
							<a 
								key=${item.id}
								className="dropdown-item is-flex is-align-items-center p-2 wp-quick-add-item"
								onClick=${item.action}
								style=${{ 
									textDecoration: 'none', 
									gap: '10px',
									borderBottom: '1px solid #f8fafc',
									cursor: 'pointer',
									transition: 'background-color 0.12s ease'
								}}
							>
								<div 
									className="is-flex is-align-items-center is-justify-content-center"
									style=${{ 
										width: '28px', 
										height: '28px', 
										backgroundColor: '#f1f5f9', 
										border: '1px solid #cbd5e1',
										borderRadius: 0,
										flexShrink: 0
									}}
								>
									<i className=${`dashicons ${item.icon}`} style=${{ fontSize: '15px', color: '#0f172a' }}></i>
								</div>
								<div style=${{ flex: 1, minWidth: 0 }}>
									<div className="has-text-weight-bold" style=${{ fontSize: '0.78rem', color: '#0f172a', lineHeight: '1.2' }}>
										${ item.title }
									</div>
									<div className="is-size-7 has-text-grey" style=${{ fontSize: '0.68rem', lineHeight: '1.2', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
										${ item.subtitle }
									</div>
								</div>
							</a>
						`) }
					</div>
				</div>
			</div>
		</div>
	`;
}
