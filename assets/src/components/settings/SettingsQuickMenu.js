import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';

/**
 * SettingsQuickMenu Component
 * 
 * Provides a sleek, sharp dropdown menu from the header settings gear icon,
 * offering instant direct navigation to any settings tab.
 */
export default function SettingsQuickMenu({ route }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const settings = window.workpressSettings || {};
	const isAdmin = !!settings.isAdmin;
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

	const isSettingsActive = route.startsWith('#/settings');

	const quickLinks = [
		{ id: 'about', label: __( 'About WorkPress & Philosophy', 'workpress' ), icon: 'dashicons-info' },
		{ id: 'intake_forms', label: __( 'Client Intake Forms', 'workpress' ), icon: 'dashicons-forms', adminOnly: true },
		{ id: 'webhooks', label: __( 'Enterprise Webhooks', 'workpress' ), icon: 'dashicons-rest-api', adminOnly: true },
		{ id: 'roles_permissions', label: __( 'Capability Matrix', 'workpress' ), icon: 'dashicons-shield', adminOnly: true },
		{ id: 'role_management', label: __( 'Role Aliases & Custom Roles', 'workpress' ), icon: 'dashicons-id', adminOnly: true },
		{ id: 'contribution_types', label: __( 'Contribution Types', 'workpress' ), icon: 'dashicons-share-alt2', adminOnly: true },
		{ id: 'members', label: __( 'Team Members Directory', 'workpress' ), icon: 'dashicons-groups' },
		{ id: 'clients', label: __( 'Clients & Stakeholders', 'workpress' ), icon: 'dashicons-id-alt' },
		{ id: 'localization_time', label: __( 'Timezone & Localization', 'workpress' ), icon: 'dashicons-clock', adminOnly: true },
		{ id: 'general', label: __( 'General System Settings', 'workpress' ), icon: 'dashicons-admin-generic', adminOnly: true },
		{ id: 'notifications', label: __( 'Notifications & Alerts', 'workpress' ), icon: 'dashicons-bell' },
		{ id: 'sound_effects', label: __( 'Sound Effects & Audio Cues', 'workpress' ), icon: 'dashicons-format-audio' },
		{ id: 'export', label: __( 'Export & Archiving', 'workpress' ), icon: 'dashicons-database-export', adminOnly: true },
	].filter(item => !item.adminOnly || isAdmin);

	return html`
		<div 
			ref=${dropdownRef} 
			className=${`dropdown ${isOpen ? 'is-active' : ''}`} 
			style=${{ margin: 0, zIndex: isOpen ? 100 : 1, display: 'inline-flex', alignItems: 'center', position: 'relative' }}
		>
			<div className="dropdown-trigger">
				<button 
					className=${`button wp-header-btn ${isSettingsActive || isOpen ? 'is-active' : ''}`}
					onClick=${() => setIsOpen(!isOpen)}
					title=${ __( 'Settings & Quick Navigation', 'workpress' ) }
					aria-haspopup="true"
					style=${{ 
						width: '32px', 
						height: '32px', 
						padding: 0, 
						display: 'inline-flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						position: 'relative'
					}}
				>
					<span className="icon" style=${{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<i className="dashicons dashicons-admin-settings" style=${{ fontSize: '18px', width: '18px', height: '18px', lineHeight: '18px' }}></i>
					</span>
				</button>
			</div>

			<div 
				className="dropdown-menu" 
				role="menu" 
				style=${{ 
					minWidth: '240px',
					[rtl ? 'right' : 'left']: 0,
					[rtl ? 'left' : 'right']: 'auto',
					top: '100%',
					paddingTop: '6px'
				}}
			>
				<div 
					className="dropdown-content wp-card p-0" 
					style=${{ 
						borderRadius: 0, 
						border: '1px solid #ededed', 
						boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
						backgroundColor: '#ffffff'
					}}
				>
					<div className="px-3 py-2" style=${{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
						<p className="is-size-7 has-text-weight-bold has-text-dark mb-0 is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<i className="dashicons dashicons-admin-settings has-text-primary" style=${{ fontSize: '15px' }}></i>
							<span>${ __( 'WorkPress Settings', 'workpress' ) }</span>
						</p>
					</div>

					<div style=${{ maxHeight: '380px', overflowY: 'auto' }}>
						${quickLinks.map(tab => html`
							<a 
								key=${tab.id}
								href=${tab.id === 'intake_forms' ? '#/forms' : `#/settings?tab=${tab.id}`}
								className="dropdown-item px-3 py-2 is-flex is-align-items-center"
								style=${{ 
									gap: '8px', 
									fontSize: '0.85rem',
									color: '#0f172a',
									borderBottom: '1px solid #f8fafc',
									transition: 'background-color 0.15s ease'
								}}
								onClick=${() => setIsOpen(false)}
								onMouseEnter=${(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
								onMouseLeave=${(e) => e.currentTarget.style.backgroundColor = 'transparent'}
							>
								<span className="icon is-small has-text-grey" style=${{ width: '18px', height: '18px' }}>
									<i className=${`dashicons ${tab.icon}`} style=${{ fontSize: '16px' }}></i>
								</span>
								<span className="has-text-weight-medium">${tab.label}</span>
							</a>
						`)}
					</div>

					<div className="p-2" style=${{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
						<a 
							href="#/settings" 
							className="button is-small is-fullwidth is-light wp-sharp-button has-text-weight-bold"
							onClick=${() => setIsOpen(false)}
							style=${{ border: '1px solid #cbd5e1' }}
						>
							<span className="icon is-small"><i className="dashicons dashicons-external"></i></span>
							<span>${ __( 'Open Settings Studio', 'workpress' ) }</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	`;
}
