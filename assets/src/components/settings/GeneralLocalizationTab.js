import { html, useState, __, sprintf, isRtl, getSupportedLanguages, getWpLocale } from '../../utils/html.js';
import { formatDate, formatDateTime, formatNumber, formatPercent } from '../../utils/datetime.js';
import WorkPressLogo from '../ui/WorkPressLogo.js';

/**
 * General Settings & Localization/Time Management Tab
 */
export default function GeneralLocalizationTab({
	activeTab,
	timezone = 'Africa/Algiers',
	setTimezone,
	monthNaming = 'maghrebi',
	setMonthNaming,
	dateFormat = 'D MMMM YYYY',
	setDateFormat,
	relativeTime = true,
	setRelativeTime,
	syncWpLocale = true,
	setSyncWpLocale,
	selectedLocale = 'ar',
	setSelectedLocale,
	handleResetToWordPressLocale,
	siteName = 'WorkPress Workspace',
	setSiteName,
	defaultPriority = 'medium',
	setDefaultPriority,
	logoUrl = '',
	setLogoUrl,
	logoId = 0,
	setLogoId,
	faviconUrl = '',
	setFaviconUrl,
	faviconId = 0,
	setFaviconId,
	defaultLogoUrl = '',
	defaultFaviconUrl = '',
	broadcastEnabled = true,
	setBroadcastEnabled,
	broadcastText = '',
	setBroadcastText,
	isSettingsSaving = false,
	handleSaveLocalizationSettings,
	handleSaveGeneralSettings
}) {
	const rtl = isRtl();
	const wpLocale = getWpLocale();
	const supportedLanguages = getSupportedLanguages();
	const wpLangObj = supportedLanguages.find(l => l.code === wpLocale) || supportedLanguages[0];

	const openMediaSelector = (title, onSelected) => {
		if (!window.wp || !window.wp.media) {
			console.error('WordPress Media Library is not available.');
			return;
		}

		const frame = window.wp.media({
			title: title || __( 'Select Image', 'workpress' ),
			button: {
				text: __( 'Use this image', 'workpress' )
			},
			multiple: false
		});

		frame.on('select', () => {
			const attachment = frame.state().get('selection').first().toJSON();
			if (attachment && attachment.url) {
				onSelected(attachment.id, attachment.url);
			}
		});

		frame.open();
	};

	const handleChooseLogo = () => {
		openMediaSelector( __( 'Select or upload custom WorkPress logo', 'workpress' ), (id, url) => {
			if (setLogoId) setLogoId(id);
			if (setLogoUrl) setLogoUrl(url);
		});
	};

	const handleResetLogo = () => {
		if (setLogoId) setLogoId(0);
		if (setLogoUrl) setLogoUrl('');
	};

	const handleChooseFavicon = () => {
		openMediaSelector( __( 'Select or upload Favicon icon', 'workpress' ), (id, url) => {
			if (setFaviconId) setFaviconId(id);
			if (setFaviconUrl) setFaviconUrl(url);
		});
	};

	const handleResetFavicon = () => {
		if (setFaviconId) setFaviconId(0);
		if (setFaviconUrl) setFaviconUrl('');
	};

	const effectiveLogoSrc = logoUrl && logoUrl.trim() !== '' ? logoUrl : (defaultLogoUrl || '/wp-content/plugins/WorkPress/assets/brand/workpress.svg');
	const isCustomLogoActive = !!(logoUrl && logoUrl.trim() !== '');

	const effectiveFaviconSrc = faviconUrl && faviconUrl.trim() !== '' ? faviconUrl : (defaultFaviconUrl || '/wp-content/plugins/WorkPress/assets/brand/favicon.svg');
	const isCustomFaviconActive = !!(faviconUrl && faviconUrl.trim() !== '');

	if (activeTab === 'general') {
		return html`
			<div className="wp-card p-5">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'System Settings & Visual Identity', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Configure workspace environment, brand logo, and favicon for WorkPress and Client Portal.', 'workpress' ) }</p>
					</div>
					<button 
						className="button wp-btn is-primary"
						disabled=${isSettingsSaving}
						onClick=${handleSaveGeneralSettings}
					>
						${isSettingsSaving ? __( 'Saving...', 'workpress' ) : __( 'Save System Settings', 'workpress' )}
					</button>
				</div>

				<div className="columns is-variable is-5">
					<div className="column is-6">
						<h4 className="title is-6 has-text-weight-bold mb-3 pb-1" style=${{ borderBottom: '1px solid #f1f5f9' }}>
							<i className=${`dashicons dashicons-admin-settings ${ rtl ? 'ml-1' : 'mr-1' } has-text-primary`}></i>
							${ __( 'Workspace Environment', 'workpress' ) }
						</h4>

						<div className="field mb-4">
							<label className="label is-small">${ __( 'Workspace Name', 'workpress' ) }</label>
							<div className="control">
								<input 
									className="input is-small" 
									type="text" 
									value=${siteName} 
									onInput=${(e) => setSiteName(e.target.value)}
									style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
								/>
							</div>
							<p className="help has-text-grey is-size-7">${ __( 'Displayed in navigation header, project reports, and browser tab titles.', 'workpress' ) }</p>
						</div>

						<div className="field mb-4">
							<label className="label is-small">${ __( 'Default Priority for New Tasks', 'workpress' ) }</label>
							<div className="control">
								<div className="select is-small is-fullwidth">
									<select 
										value=${defaultPriority} 
										onChange=${(e) => setDefaultPriority(e.target.value)}
										style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
									>
										<option value="low">${ __( 'Low', 'workpress' ) }</option>
										<option value="medium">${ __( 'Medium', 'workpress' ) }</option>
										<option value="high">${ __( 'High', 'workpress' ) }</option>
									</select>
								</div>
							</div>
						</div>

						<!-- Manager Broadcast Ticker Settings -->
						<div className="box p-3 mb-4" style=${{ border: '1px solid #cbd5e1', borderRadius: 0, background: '#f8fafc' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
								<label className="label is-small mb-0">
									<i className=${`dashicons dashicons-megaphone ${ rtl ? 'ml-1' : 'mr-1' } has-text-primary`}></i>
									${ __( 'Managerial Directives & Broadcast Ticker', 'workpress' ) }
								</label>
								<label className="checkbox is-size-7" style=${{ userSelect: 'none' }}>
									<input 
										type="checkbox" 
										checked=${broadcastEnabled} 
										onChange=${(e) => setBroadcastEnabled && setBroadcastEnabled(e.target.checked)}
										className=${ rtl ? 'ml-1' : 'mr-1' }
									/>
									${ __( 'Enable ticker in breadcrumb', 'workpress' ) }
								</label>
							</div>
							<p className="has-text-grey is-size-7 mb-2">${ __( 'This text appears as a live ticker in the breadcrumb bar to broadcast management directives to team members.', 'workpress' ) }</p>
							<textarea 
								className="textarea is-small" 
								rows="2" 
								value=${broadcastText} 
								onInput=${(e) => setBroadcastText && setBroadcastText(e.target.value)}
								placeholder=${ __( 'Write managerial directives and notices here...', 'workpress' ) }
								style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
							></textarea>
						</div>

						<!-- Scope & Isolation Alert Box -->
						<div className="message is-info is-small mt-5" style=${{ borderRadius: 0 }}>
							<div className="message-body p-3 is-size-7" style=${{ lineHeight: '1.5' }}>
								<p className="has-text-weight-bold mb-1">
									<i className=${`dashicons dashicons-shield ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
									${ __( 'Visual Identity Scope:', 'workpress' ) }
								</p>
								<span>${ __( 'Logo and Favicon settings apply to WorkPress admin, Client Portal, and Unified Login screen without modifying the public WordPress theme.', 'workpress' ) }</span>
							</div>
						</div>
					</div>

					<div className="column is-6">
						<h4 className="title is-6 has-text-weight-bold mb-3 pb-1" style=${{ borderBottom: '1px solid #f1f5f9' }}>
							<i className=${`dashicons dashicons-art ${ rtl ? 'ml-1' : 'mr-1' } has-text-primary`}></i>
							${ __( 'Visual Identity & Brand Logo', 'workpress' ) }
						</h4>

						<!-- 1. Logo -->
						<div className="box p-4 mb-4" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, background: '#f8fafc' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
								<label className="label is-small mb-0">${ __( 'Workspace Logo', 'workpress' ) }</label>
								<span className=${`tag is-small ${isCustomLogoActive ? 'is-success is-light' : 'is-dark is-light'}`} style=${{ borderRadius: 0, fontSize: '0.7rem' }}>
									${isCustomLogoActive ? __( 'Custom Logo Active', 'workpress' ) : __( 'Default Logo', 'workpress' )}
								</span>
							</div>

							<!-- Live Preview -->
							<div 
								className="is-flex is-justify-content-center is-align-items-center p-3 mb-3 has-background-white" 
								style=${{ 
									border: '1px dashed #cbd5e1', 
									minHeight: '64px'
								}}
							>
								${isCustomLogoActive ? html`
									<img 
										src=${effectiveLogoSrc} 
										alt="WorkPress Brand Logo" 
										style=${{ maxHeight: '42px', maxWidth: '100%', objectFit: 'contain' }}
									/>
								` : html`
									<${WorkPressLogo} height=${32} />
								`}
							</div>

							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<button 
									type="button" 
									className="button is-small is-primary" 
									onClick=${handleChooseLogo}
									style=${{ borderRadius: 0 }}
								>
									<i className=${`dashicons dashicons-upload ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
									<span>${ __( 'Choose / Upload Logo', 'workpress' ) }</span>
								</button>

								${isCustomLogoActive && html`
									<button 
										type="button" 
										className="button is-small is-light is-danger" 
										onClick=${handleResetLogo}
										style=${{ borderRadius: 0 }}
										title=${ __( 'Reset to default WorkPress logo', 'workpress' ) }
									>
										<i className=${`dashicons dashicons-undo ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
										<span>${ __( 'Restore Default', 'workpress' ) }</span>
									</button>
								`}
							</div>
							<p className="help has-text-grey is-size-7 mt-1">${ __( 'Recommended: SVG vector, or transparent PNG (180-260px width, 36-54px height).', 'workpress' ) }</p>
						</div>

						<!-- 2. Favicon -->
						<div className="box p-4 mb-3" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, background: '#f8fafc' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
								<label className="label is-small mb-0">${ __( 'Browser Tab Favicon', 'workpress' ) }</label>
								<span className=${`tag is-small ${isCustomFaviconActive ? 'is-success is-light' : 'is-dark is-light'}`} style=${{ borderRadius: 0, fontSize: '0.7rem' }}>
									${isCustomFaviconActive ? __( 'Custom Favicon', 'workpress' ) : __( 'Default Favicon', 'workpress' )}
								</span>
							</div>

							<!-- Browser Tab Preview -->
							<div className="p-2 mb-3 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
								<p className="is-size-7 has-text-grey mb-1" style=${{ fontSize: '0.7rem' }}>${ __( 'Browser Tab Simulation Preview:', 'workpress' ) }</p>
								<div 
									className="is-flex is-align-items-center px-3 py-1" 
									style=${{ 
										background: '#f1f5f9', 
										border: '1px solid #cbd5e1', 
										width: 'fit-content', 
										maxWidth: '220px', 
										borderRadius: '4px 4px 0 0',
										gap: '8px'
									}}
								>
									<img 
										src=${effectiveFaviconSrc} 
										alt="Favicon" 
										style=${{ width: '16px', height: '16px', objectFit: 'contain' }}
									/>
									<span className="is-size-7 has-text-weight-bold has-text-dark is-truncated" style=${{ fontSize: '0.75rem', maxWidth: '160px' }}>
										${siteName || 'WorkPress Workspace'}
									</span>
								</div>
							</div>

							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<button 
									type="button" 
									className="button is-small is-primary" 
									onClick=${handleChooseFavicon}
									style=${{ borderRadius: 0 }}
								>
									<i className=${`dashicons dashicons-upload ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
									<span>${ __( 'Choose / Upload Favicon', 'workpress' ) }</span>
								</button>

								${isCustomFaviconActive && html`
									<button 
										type="button" 
										className="button is-small is-light is-danger" 
										onClick=${handleResetFavicon}
										style=${{ borderRadius: 0 }}
										title=${ __( 'Reset to default WorkPress favicon', 'workpress' ) }
									>
										<i className=${`dashicons dashicons-undo ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
										<span>${ __( 'Restore Default', 'workpress' ) }</span>
									</button>
								`}
							</div>
							<p className="help has-text-grey is-size-7 mt-1">${ __( 'Recommended: SVG, or square PNG (32x32px or 64x64px).', 'workpress' ) }</p>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	if (activeTab === 'localization_time') {
		return html`
			<div className="wp-card p-5">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Language, Timezone & Regional Localization', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Manage interface language sync with WordPress, workspace timezone, and month naming conventions.', 'workpress' ) }</p>
					</div>
					<button 
						className="button wp-btn is-primary"
						disabled=${isSettingsSaving}
						onClick=${handleSaveLocalizationSettings}
					>
						${isSettingsSaving ? __( 'Saving...', 'workpress' ) : __( 'Save Localization Settings', 'workpress' )}
					</button>
				</div>

				<!-- Language & WordPress Synchronization Box -->
				<div className="box p-4 mb-5" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, background: '#f8fafc' }}>
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #e2e8f0' }}>
						<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
							<i className="dashicons dashicons-translation has-text-primary" style=${{ fontSize: '18px' }}></i>
							<h4 className="title is-6 mb-0 has-text-weight-bold">${ __( 'Interface Language & WordPress Sync', 'workpress' ) }</h4>
						</div>
						<span className=${`tag is-small ${syncWpLocale ? 'is-success is-light' : 'is-info is-light'}`} style=${{ borderRadius: 0, fontSize: '0.72rem' }}>
							${syncWpLocale ? __( 'Auto-Synced with WordPress', 'workpress' ) : __( 'Custom Language Active', 'workpress' )}
						</span>
					</div>

					<!-- Auto-Sync Toggle Switch -->
					<div className="field mb-4">
						<label className="checkbox is-size-7 has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '8px', cursor: 'pointer' }}>
							<input 
								type="checkbox" 
								checked=${syncWpLocale} 
								onChange=${(e) => {
									const isChecked = e.target.checked;
									setSyncWpLocale(isChecked);
									if (isChecked) {
										setSelectedLocale(wpLocale);
									}
								}}
								style=${{ width: '16px', height: '16px', margin: 0 }}
							/>
							<span>${ __( 'Auto-sync WorkPress language with WordPress user profile language', 'workpress' ) }</span>
						</label>
						<p className="help has-text-grey is-size-7 mt-1">
							${ __( 'When enabled, WorkPress automatically follows any language change made in your WordPress profile or site settings.', 'workpress' ) }
						</p>
					</div>

					<!-- Language Selection & Reset Row -->
					<div className="columns is-variable is-3 is-align-items-flex-end">
						<div className="column is-7">
							<label className="label is-small">${ __( 'Active WorkPress Language', 'workpress' ) }</label>
							<div className="control">
								<div className=${`select is-fullwidth wp-input ${syncWpLocale ? 'is-disabled' : ''}`}>
									<select 
										value=${selectedLocale} 
										disabled=${syncWpLocale}
										onChange=${(e) => {
											setSelectedLocale(e.target.value);
											setSyncWpLocale(false);
										}}
										style=${{ borderRadius: 0 }}
									>
										${supportedLanguages.map(l => html`
											<option key=${l.code} value=${l.code}>
												${l.flag} ${l.label} ${l.code === wpLocale ? `(${ __( 'WordPress Default', 'workpress' ) })` : ''}
											</option>
										`)}
									</select>
								</div>
							</div>
							${syncWpLocale ? html`
								<p className="help has-text-success is-size-7 mt-1">
									<i className="dashicons dashicons-yes"></i>
									<span>${ __( 'Following WordPress language:', 'workpress' ) } <strong>${wpLangObj.label}</strong></span>
								</p>
							` : html`
								<p className="help has-text-info is-size-7 mt-1">
									<i className="dashicons dashicons-admin-generic"></i>
									<span>${ __( 'Custom language applied strictly to WorkPress interface.', 'workpress' ) }</span>
								</p>
							`}
						</div>

						<div className="column is-5">
							<button 
								type="button" 
								className="button is-small is-fullwidth is-light is-link"
								onClick=${handleResetToWordPressLocale}
								style=${{ borderRadius: 0, height: '36px' }}
								title=${ __( 'Reset WorkPress language to match WordPress user profile', 'workpress' ) }
							>
								<i className=${`dashicons dashicons-image-rotate ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
								<span>${ __( 'Reset to Match WordPress', 'workpress' ) }</span>
							</button>
						</div>
					</div>
				</div>

				<div className="columns is-variable is-5">
					<div className="column is-7">
						<!-- Timezone Selector -->
						<div className="field mb-5">
							<label className="label is-small">${ __( 'Workspace Timezone', 'workpress' ) }</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${timezone} 
										onChange=${(e) => setTimezone(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<optgroup label=${ __( 'North Africa & Maghreb', 'workpress' ) }>
											<option value="Africa/Algiers">Algeria (GMT+1) - Africa/Algiers</option>
											<option value="Africa/Casablanca">Morocco / Casablanca (GMT+1) - Africa/Casablanca</option>
											<option value="Africa/Tunis">Tunisia (GMT+1) - Africa/Tunis</option>
											<option value="Africa/Tripoli">Libya / Tripoli (GMT+2) - Africa/Tripoli</option>
											<option value="Africa/Cairo">Egypt / Cairo (GMT+2) - Africa/Cairo</option>
										</optgroup>
										<optgroup label=${ __( 'Middle East & Gulf', 'workpress' ) }>
											<option value="Asia/Riyadh">Saudi Arabia / Riyadh (GMT+3) - Asia/Riyadh</option>
											<option value="Asia/Dubai">UAE / Dubai (GMT+4) - Asia/Dubai</option>
											<option value="Asia/Kuwait">Kuwait (GMT+3) - Asia/Kuwait</option>
											<option value="Asia/Qatar">Qatar (GMT+3) - Asia/Qatar</option>
											<option value="Asia/Muscat">Oman / Muscat (GMT+4) - Asia/Muscat</option>
											<option value="Asia/Baghdad">Iraq / Baghdad (GMT+3) - Asia/Baghdad</option>
											<option value="Asia/Amman">Jordan / Amman (GMT+3) - Asia/Amman</option>
											<option value="Asia/Beirut">Lebanon / Beirut (GMT+2) - Asia/Beirut</option>
											<option value="Asia/Jerusalem">Palestine / Jerusalem (GMT+2) - Asia/Jerusalem</option>
										</optgroup>
										<optgroup label=${ __( 'International Zones', 'workpress' ) }>
											<option value="Europe/Paris">Europe / Paris (GMT+1) - Europe/Paris</option>
											<option value="Europe/London">UK / London (GMT+0) - Europe/London</option>
											<option value="UTC">Coordinated Universal Time (UTC) - UTC</option>
										</optgroup>
									</select>
								</div>
							</div>
							<p className="help has-text-grey is-size-7">${ __( 'All audit logs, timeline streams, and deadlines are computed according to this timezone.', 'workpress' ) }</p>
						</div>

						<!-- Month Naming System -->
						<div className="field mb-5">
							<label className="label is-small">${ __( 'Month Naming System', 'workpress' ) }</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${monthNaming} 
										onChange=${(e) => setMonthNaming(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<option value="maghrebi">${ __( 'Maghrebi Arabic Months (Janvier, Fevrier, Mars...) - Recommended', 'workpress' ) }</option>
										<option value="mashriqi">${ __( 'Mashriqi Arabic Months (Yanayer, Febrayer, Mars...)', 'workpress' ) }</option>
										<option value="syriac">${ __( 'Syriac / Levantine Months (Kanoon, Shabat, Adar...)', 'workpress' ) }</option>
									</select>
								</div>
							</div>
						</div>

						<!-- Date Format -->
						<div className="field mb-5">
							<label className="label is-small">${ __( 'Calendar Date Display Format', 'workpress' ) }</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${dateFormat} 
										onChange=${(e) => setDateFormat(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<option value="D MMMM YYYY">${ __( 'Day, Month Name & Year (e.g. 18 August 2026)', 'workpress' ) }</option>
										<option value="DD/MM/YYYY">${ __( 'Standard Slash Separated (e.g. 18/08/2026)', 'workpress' ) }</option>
										<option value="YYYY-MM-DD">${ __( 'ISO Standard (e.g. 2026-08-18)', 'workpress' ) }</option>
									</select>
								</div>
							</div>
						</div>

						<!-- Relative Time Checkbox -->
						<div className="field mb-4">
							<label className="checkbox is-size-7 has-text-weight-bold">
								<input 
									type="checkbox" 
									checked=${relativeTime} 
									onChange=${(e) => setRelativeTime(e.target.checked)}
									style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}
								/>
								${ __( 'Enable smart relative time (e.g., "Just now", "5m ago", "2h ago", "Yesterday") in activity feeds.', 'workpress' ) }
							</label>
						</div>
					</div>

					<!-- Live Preview Column -->
					<div className="column is-5">
						<div className="box p-4 wp-settings-preview-box">
							<div className="is-flex is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #cbd5e1' }}>
								<span className="icon has-text-primary mr-2" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '6px' }}><i className="dashicons dashicons-visibility"></i></span>
								<h4 className="title is-6 mb-0 has-text-weight-bold">${ __( 'Live Preview', 'workpress' ) }</h4>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">${ __( 'Date & Month:', 'workpress' ) }</p>
								<p className="has-text-weight-bold is-size-6 has-text-primary">
									${formatDate(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
								</p>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">${ __( 'Full Date & Time:', 'workpress' ) }</p>
								<p className="is-size-7 has-text-dark font-weight-bold">
									${formatDateTime(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
								</p>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">${ __( 'Relative Time Sample:', 'workpress' ) }</p>
								<div className="tags are-small mb-0">
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>${ __( 'Just now', 'workpress' ) }</span>
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>${ __( '15m ago', 'workpress' ) }</span>
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>${ __( '3h ago', 'workpress' ) }</span>
								</div>
							</div>

							<div className="mb-2">
								<p className="heading has-text-grey is-size-7 mb-1">${ __( 'Universal Numerals & Percentages:', 'workpress' ) }</p>
								<p className="is-size-7 has-text-dark">
									<span>${ sprintf( __( 'Completed %s contributions with %s success rate', 'workpress' ), formatNumber(1250), formatPercent(88) ) }</span>
								</p>
							</div>

							<div className="mt-3 p-2 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
								<p className="is-size-7 has-text-grey" style=${{ fontSize: '0.72rem', lineHeight: '1.4' }}>
									<i className=${`dashicons dashicons-yes-alt has-text-success ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
									${ __( 'Universal numerals (1, 2, 3...) are enforced system-wide for institutional clarity.', 'workpress' ) }
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	return null;
}
