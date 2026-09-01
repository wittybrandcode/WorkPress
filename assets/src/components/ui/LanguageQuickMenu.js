import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import { settingsApi } from '../../api/client.js';
import sound from '../../utils/sound.js';
import { toast } from '../../utils/toast.js';

/**
 * LanguageQuickMenu Component
 *
 * Header dropdown menu for instant, seamless language switching in CoWorkPress Plaza.
 */
export default function LanguageQuickMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSwitching, setIsSwitching] = useState(false);
	const dropdownRef = useRef(null);
	const rtl = isRtl();

	const settings = window.workpressSettings || {};
	const currentLocale = settings.locale || (rtl ? 'ar' : 'en_US');
	const currentShort = (settings.activeLanguage || (rtl ? 'ar' : 'en')).toLowerCase();

	const supportedLanguages = [
		{ code: 'en_US', short: 'en', label: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
		{ code: 'ar',    short: 'ar', label: 'العربية (Arabic)', flag: '🇩🇿', dir: 'rtl' },
		{ code: 'fr_FR', short: 'fr', label: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
		{ code: 'es_ES', short: 'es', label: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' },
	];

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
		if (currentShort === lang.short || currentLocale === lang.code) {
			setIsOpen(false);
			return;
		}

		setIsSwitching(true);
		sound.play('button');
		toast( __( 'Switching language...', 'workpress' ), 'info', 1200 );

		settingsApi.updateLocale(lang.code)
			.then(() => {
				localStorage.setItem('workpress_locale', lang.code);
				toast( `${ __( 'Language updated:', 'workpress' ) } ${lang.label}`, 'success', 1500 );
				setTimeout(() => {
					window.location.reload();
				}, 350);
			})
			.catch((err) => {
				console.error(err);
				// Fallback: set cookie and reload anyway
				document.cookie = `workpress_user_locale=${lang.code}; path=/; max-age=31536000`;
				localStorage.setItem('workpress_locale', lang.code);
				setTimeout(() => {
					window.location.reload();
				}, 350);
			});
	};

	const activeLangObj = supportedLanguages.find(l => l.code === currentLocale || l.short === currentShort) || supportedLanguages[0];

	return html`
		<div 
			ref=${dropdownRef} 
			className=${`dropdown ${isOpen ? 'is-active' : ''}`} 
			style=${{ margin: 0, zIndex: isOpen ? 100 : 1, display: 'inline-flex', alignItems: 'center', position: 'relative' }}
		>
			<div className="dropdown-trigger">
				<button 
					className=${`button wp-header-btn ${isOpen ? 'is-active' : ''}`}
					onClick=${() => setIsOpen(!isOpen)}
					title=${ __( 'Change Language / تغيير اللغة', 'workpress' ) }
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
						<i className="dashicons dashicons-translation" style=${{ fontSize: '16px', lineHeight: '16px' }}></i>
					</span>
					<span className="is-size-7 has-text-weight-bold" style=${{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
						${activeLangObj.short.toUpperCase()}
					</span>
				</button>
			</div>

			<div 
				className="dropdown-menu" 
				role="menu" 
				style=${{ 
					minWidth: '200px',
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
							<i className="dashicons dashicons-translation has-text-primary" style=${{ fontSize: '14px' }}></i>
							<span>${ __( 'Select Language', 'workpress' ) }</span>
						</p>
					</div>

					<div style=${{ padding: '4px 0' }}>
						${supportedLanguages.map(lang => {
							const isSelected = (currentLocale === lang.code || currentShort === lang.short);
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
										fontSize: '0.84rem',
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
