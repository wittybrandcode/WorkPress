import { html, useState, useEffect, useRef, __, isRtl, getLocale, setLocale, getSupportedLanguages, isSyncWithWp, getWpLocale } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import { settingsApi } from '../../api/client.js';
import sound from '../../utils/sound.js';
import { toast } from '../../utils/toast.js';

/**
 * LanguageQuickMenu Component
 *
 * Header dropdown menu for instant, seamless language switching in CoWorkPress Plaza.
 * Supports automatic synchronization with WordPress Core language and isolated overrides.
 */
export default function LanguageQuickMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const [syncActive, setSyncActive] = useState(isSyncWithWp);
	const dropdownRef = useRef(null);
	const rtl = isRtl();
	const currentLocale = getLocale();
	const wpLocale = getWpLocale();
	const supportedLanguages = getSupportedLanguages();

	useEffect(() => {
		const handleLocaleChange = () => {
			setSyncActive(isSyncWithWp());
		};
		window.addEventListener('workpress_locale_changed', handleLocaleChange);
		return () => window.removeEventListener('workpress_locale_changed', handleLocaleChange);
	}, []);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleSelectLanguage = (lang) => {
		if (isSwitching) return;

		setIsSwitching(true);
		sound.play('button');

		// Instant zero-delay reactive UI update with sync disabled
		setLocale(lang.code, false);
		setSyncActive(false);
		toast( `${ __( 'Language updated:', 'workpress' ) } ${lang.label}`, 'success', 1500 );
		setIsOpen(false);
		setIsSwitching(false);

		// Background sync to WorkPress database (isolated from WordPress core profile)
		settingsApi.updateLocale(lang.code, false).catch(() => {});
	};

	const handleSelectAutoSync = () => {
		if (isSwitching) return;

		setIsSwitching(true);
		sound.play('button');

		// Instant reactive UI update with auto-sync enabled
		setLocale('auto', true);
		setSyncActive(true);
		toast( __( 'Synchronized with WordPress language', 'workpress' ), 'success', 1500 );
		setIsOpen(false);
		setIsSwitching(false);

		// Background sync to database
		settingsApi.updateLocale('auto', true).catch(() => {});
	};

	const activeLangObj = supportedLanguages.find(l => l.code === currentLocale) || supportedLanguages[0];
	const wpLangObj = supportedLanguages.find(l => l.code === wpLocale) || supportedLanguages[0];

	return html`
		<div 
			ref=${dropdownRef} 
			className=${`dropdown ${rtl ? 'is-left' : 'is-right'} ${isOpen ? 'is-active' : ''}`} 
			style=${{ margin: 0, zIndex: isOpen ? 100 : 1, display: 'inline-flex', alignItems: 'center', position: 'relative' }}
		>
			<div className="dropdown-trigger">
				<button 
					className=${`button wp-header-btn ${isOpen ? 'is-active' : ''}`}
					onClick=${() => setIsOpen(!isOpen)}
					title=${ syncActive ? `${ __( 'Synced with WordPress:', 'workpress' ) } ${wpLangObj.label}` : __( 'Change Language', 'workpress' ) }
					aria-haspopup="true"
					style=${{ 
						height: '32px', 
						padding: '0 8px', 
						display: 'inline-flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						gap: '4px',
						position: 'relative'
					}}
				>
					<span className="icon is-small" style=${{ width: '16px', height: '16px' }}>
						<i className=${`dashicons ${syncActive ? 'dashicons-admin-site' : 'dashicons-translation'}`} style=${{ fontSize: '16px', lineHeight: '16px' }}></i>
					</span>
					<span className="is-size-7 has-text-weight-bold" style=${{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
						${activeLangObj.short.toUpperCase()}
					</span>
					${syncActive && html`
						<span 
							title=${ __( 'Auto-synced with WordPress', 'workpress' ) }
							style=${{
								width: '6px',
								height: '6px',
								borderRadius: '50%',
								backgroundColor: '#10b981',
								display: 'inline-block'
							}}
						></span>
					`}
				</button>
			</div>

			<div 
				className="dropdown-menu" 
				role="menu" 
				style=${{ 
					minWidth: '220px',
					maxWidth: 'min(240px, calc(100vw - 32px))',
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
						border: '1px solid #ededed', 
						boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
						backgroundColor: '#ffffff'
					}}
				>
					<div className="px-3 py-2" style=${{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
						<p className="is-size-7 has-text-weight-bold has-text-dark mb-0 is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<i className="dashicons dashicons-translation has-text-primary" style=${{ fontSize: '14px' }}></i>
							<span>${ __( 'Select Language', 'workpress' ) }</span>
						</p>
					</div>

					<div style=${{ padding: '4px 0' }}>
						<!-- Auto Sync with WordPress Option -->
						<button 
							type="button"
							className=${`dropdown-item is-flex is-justify-content-space-between is-align-items-center is-fullwidth px-3 py-2 ${syncActive ? 'has-background-light has-text-weight-bold' : ''}`}
							style=${{ 
								border: 'none', 
								borderBottom: '1px solid #f1f5f9',
								background: syncActive ? '#ecfdf5' : 'transparent', 
								cursor: 'pointer',
								textAlign: rtl ? 'right' : 'left',
								fontSize: '0.82rem',
								color: syncActive ? '#065f46' : '#0f172a',
								width: '100%',
								transition: 'background-color 0.15s ease'
							}}
							onClick=${handleSelectAutoSync}
							disabled=${isSwitching}
						>
							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<i className="dashicons dashicons-admin-site has-text-primary" style=${{ fontSize: '16px' }}></i>
								<div>
									<div style=${{ lineHeight: '1.2' }}>${ __( 'WordPress Auto-Sync', 'workpress' ) }</div>
									<div className="is-size-7 has-text-grey" style=${{ fontSize: '0.68rem' }}>${wpLangObj.flag} ${wpLangObj.label}</div>
								</div>
							</div>
							${syncActive ? html`
								<span className="icon is-small has-text-success">
									<i className="dashicons dashicons-yes"></i>
								</span>
							` : null}
						</button>

						<!-- Explicit Language Options -->
						${supportedLanguages.map(lang => {
							const isSelected = (!syncActive && currentLocale === lang.code);
							return html`
								<button 
									key=${lang.code}
									type="button"
									className=${`dropdown-item is-flex is-justify-content-space-between is-align-items-center is-fullwidth px-3 py-2 ${isSelected ? 'has-background-light has-text-weight-bold' : ''}`}
									style=${{ 
										border: 'none', 
										background: isSelected ? '#f1f5f9' : 'transparent', 
										cursor: 'pointer',
										textAlign: rtl ? 'right' : 'left',
										fontSize: '0.82rem',
										color: '#0f172a',
										width: '100%',
										transition: 'background-color 0.15s ease'
									}}
									onClick=${() => handleSelectLanguage(lang)}
									disabled=${isSwitching}
								>
									<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
										<span>${lang.flag}</span>
										<span>${lang.label}</span>
									</div>
									${isSelected ? html`
										<span className="icon is-small has-text-success">
											<i className="dashicons dashicons-yes"></i>
										</span>
									` : null}
								</button>
							`;
						})}
					</div>
				</div>
			</div>
		</div>
	`;
}

// Auto register in header brand actions
hooks.addFilter('workpress_header_brand_actions', 'workpress/language-quick-menu', (components) => {
	return [...components, LanguageQuickMenu];
});
