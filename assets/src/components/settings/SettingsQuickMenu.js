import { html, useState, useEffect, useRef } from '../../utils/html.js';

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
		{ id: 'about', label: 'Ø¹Ù† WorkPress ÙˆØ§Ù„ÙÙ„Ø³ÙØ©', icon: 'dashicons-info' },
		{ id: 'intake_forms', label: 'Ù†Ù…Ø§Ø°Ø¬ Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª', icon: 'dashicons-forms', adminOnly: true },
		{ id: 'webhooks', label: 'Ø®Ø·Ø§ÙØ§Øª Ø§Ù„ÙˆÙŠØ¨ ÙˆØ§Ù„ØªÙƒØ§Ù…Ù„ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠ', icon: 'dashicons-rest-api', adminOnly: true },
		{ id: 'roles_permissions', label: 'Ù…ØµÙÙˆÙØ© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª', icon: 'dashicons-shield', adminOnly: true },
		{ id: 'role_management', label: 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¯ÙˆØ§Ø± ÙˆØ§Ù„Ù…Ø³Ù…ÙŠØ§Øª', icon: 'dashicons-id', adminOnly: true },
		{ id: 'contribution_types', label: 'Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª', icon: 'dashicons-share-alt2', adminOnly: true },
		{ id: 'members', label: 'Ø¯Ù„ÙŠÙ„ Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡ ÙˆØ§Ù„Ù…Ù†ÙØ°ÙŠÙ†', icon: 'dashicons-groups' },
		{ id: 'clients', label: 'Ø§Ù„Ù…Ø³ØªÙÙŠØ¯ÙˆÙ† ÙˆØ£ØµØ­Ø§Ø¨ Ø§Ù„Ø·Ù„Ø¨Ø§Øª', icon: 'dashicons-id-alt' },
		{ id: 'localization_time', label: 'Ø§Ù„ÙˆÙ‚Øª ÙˆØ§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ©', icon: 'dashicons-clock', adminOnly: true },
		{ id: 'general', label: 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù…', icon: 'dashicons-admin-generic', adminOnly: true },
		{ id: 'notifications', label: 'Ø§Ù„Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ÙˆØ§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª', icon: 'dashicons-bell' },
		{ id: 'sound_effects', label: 'Ø§Ù„Ø£ØµÙˆØ§Øª ÙˆØ§Ù„ØªØ£Ø«ÙŠØ±Ø§Øª Ø§Ù„ØªÙØ§Ø¹Ù„ÙŠØ©', icon: 'dashicons-format-audio' },
		{ id: 'export', label: 'Ø§Ù„ØªØµØ¯ÙŠØ± ÙˆØ§Ù„Ø£Ø±Ø´ÙØ©', icon: 'dashicons-database-export', adminOnly: true },
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
					title="Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ÙˆØ§Ù„Ø±ÙˆØ§Ø¨Ø· Ø§Ù„Ø³Ø±ÙŠØ¹Ø©"
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
					left: 0,
					right: 'auto',
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
							<span>Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª WorkPress</span>
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
							<span>ÙØªØ­ ØµÙØ­Ø© Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	`;
}
