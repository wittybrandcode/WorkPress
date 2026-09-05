import { html, useState, useEffect, __, sprintf, isSyncWithWp, getLocale, setLocale, getWpLocale } from '../utils/html.js';
import { hooks } from '../utils/hooks.js';
import { usersApi, rolesApi, contributionsApi, settingsApi, devApi, exportApi } from '../api/client.js';
import { CANONICAL_ROLE_LABELS, getUserRoleLabel } from '../utils/userScope.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import AboutWorkPressTab from '../components/about/AboutWorkPressTab.js';
import IntakeFormsBuilderTab from '../components/forms/IntakeFormsBuilderTab.js';
import WebhooksSettingsTab from '../components/webhooks/WebhooksSettingsTab.js';
import RolesPermissionsTab from '../components/settings/RolesPermissionsTab.js';
import UserDirectoryTab from '../components/settings/UserDirectoryTab.js';
import ContributionTypesTab from '../components/settings/ContributionTypesTab.js';
import GeneralLocalizationTab from '../components/settings/GeneralLocalizationTab.js';
import SoundEffectsTab from '../components/settings/SoundEffectsTab.js';
import NotificationsTab from '../components/settings/NotificationsTab.js';
import ExportDiagnosticsTab from '../components/settings/ExportDiagnosticsTab.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

/**
 * WorkPress Settings Page (Lean Tab Controller & Coordinator)
 *
 * @package WorkPress
 * @subpackage Pages
 * @version 2.3.0
 */
export default function SettingsPage() {
	const parseTabFromHash = () => {
		const hash = window.location.hash || '';
		if (hash.includes('tab=')) {
			const param = hash.split('tab=')[1]?.split('&')[0];
			if (param) return param;
		}
		return 'about';
	};

	const [activeTab, setActiveTab] = useState(parseTabFromHash);

	useEffect(() => {
		const handleHashChange = () => {
			const tab = parseTabFromHash();
			if (tab !== activeTab) {
				setActiveTab(tab);
			}
		};
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, [activeTab]);

	// Shared State
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [userSearch, setUserSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [confirmConfig, setConfirmConfig] = useState(null);

	const wpSettings = window.workpressSettings || {};
	const isAdmin = !!wpSettings.isAdmin;

	// General & Localization settings state
	const [siteName, setSiteName] = useState(wpSettings.siteName || 'WorkPress Workspace');
	const [defaultPriority, setDefaultPriority] = useState(wpSettings.defaultPriority || 'medium');
	const [emailNotifs, setEmailNotifs] = useState(wpSettings.emailNotifications !== undefined ? wpSettings.emailNotifications : true);
	const [timezone, setTimezone] = useState(wpSettings.timezone || 'Africa/Algiers');
	const [monthNaming, setMonthNaming] = useState(wpSettings.monthNaming || 'maghrebi');
	const [dateFormat, setDateFormat] = useState(wpSettings.dateFormat || 'D MMMM YYYY');
	const [relativeTime, setRelativeTime] = useState(wpSettings.relativeTime !== undefined ? wpSettings.relativeTime : true);
	const [syncWpLocale, setSyncWpLocale] = useState(isSyncWithWp);
	const [selectedLocale, setSelectedLocale] = useState(getLocale);
	const [logoUrl, setLogoUrl] = useState(wpSettings.customLogoUrl || '');
	const [logoId, setLogoId] = useState(wpSettings.customLogoId || 0);
	const [faviconUrl, setFaviconUrl] = useState(wpSettings.customFaviconUrl || '');
	const [faviconId, setFaviconId] = useState(wpSettings.customFaviconId || 0);
	const [broadcastEnabled, setBroadcastEnabled] = useState(wpSettings.broadcastNotice?.enabled !== false);
	const [broadcastText, setBroadcastText] = useState(wpSettings.broadcastNotice?.text || '');
	const [isSettingsSaving, setIsSettingsSaving] = useState(false);

	useEffect(() => {
		const handleLocaleChange = () => {
			setSyncWpLocale(isSyncWithWp());
			setSelectedLocale(getLocale());
		};
		window.addEventListener('workpress_locale_changed', handleLocaleChange);
		return () => window.removeEventListener('workpress_locale_changed', handleLocaleChange);
	}, []);

	// Sound Effects Settings State
	const [soundEnabled, setSoundEnabled] = useState(wpSettings.sound_enabled !== undefined ? wpSettings.sound_enabled : true);
	const [soundVolume, setSoundVolume] = useState(wpSettings.sound_volume !== undefined ? parseFloat(wpSettings.sound_volume) : 0.7);
	const [soundKit, setSoundKit] = useState(wpSettings.sound_kit || '01');
	const [eventsConfig, setEventsConfig] = useState(sound.getAllEventsConfig());

	// Exact Zero-Movement Sticky Top Positioning (تجميد كلي دون أدنى حركة)
	const [stickyTop, setStickyTop] = useState(() => {
		if (typeof document === 'undefined') return 165;
		const adminBar = document.getElementById('wpadminbar');
		const header = document.querySelector('.workpress-header-wrapper');
		const aH = adminBar ? adminBar.getBoundingClientRect().height : 32;
		const hH = header ? header.getBoundingClientRect().height : 108;
		return Math.round(aH + hH + 24);
	});

	useEffect(() => {
		const calculateStickyTop = () => {
			const adminBar = document.getElementById('wpadminbar');
			const header = document.querySelector('.workpress-header-wrapper');
			const aH = adminBar ? adminBar.getBoundingClientRect().height : 32;
			const hH = header ? header.getBoundingClientRect().height : 108;
			setStickyTop(Math.round(aH + hH + 24));
		};

		calculateStickyTop();
		window.addEventListener('resize', calculateStickyTop);
		return () => window.removeEventListener('resize', calculateStickyTop);
	}, []);

	// Intake Forms Schema State
	const [intakeForms, setIntakeForms] = useState(wpSettings.intake_forms_schema || []);

	// Dev Data Seeder & Export State
	const [isSeeding, setIsSeeding] = useState(false);
	const [isPurging, setIsPurging] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	// Contribution Types State
	const [contributionTypes, setContributionTypes] = useState([]);
	const [isTypesLoading, setIsTypesLoading] = useState(false);
	const [newType, setNewType] = useState({ key: '', label: '', icon: 'dashicons-admin-comments' });

	// Roles & Permissions State
	const [rolesData, setRolesData] = useState(null);
	const [isRolesLoading, setIsRolesLoading] = useState(false);
	const [rolesUpdates, setRolesUpdates] = useState({});
	const [selectedMatrixRole, setSelectedMatrixRole] = useState('');
	const [clientSubFilter, setClientSubFilter] = useState('all');
	const [aliasesUpdates, setAliasesUpdates] = useState({});
	const [newRole, setNewRole] = useState({ id: '', display_name: '', clone_from: 'editor' });

	const defaultTabs = [
		{ id: 'about', label: __( 'About WorkPress & Philosophy', 'workpress' ), icon: 'dashicons-info' },
		{ id: 'intake_forms', label: __( 'Intake Forms Builder', 'workpress' ), icon: 'dashicons-forms', adminOnly: true },
		{ id: 'webhooks', label: __( 'Webhooks & External Integrations', 'workpress' ), icon: 'dashicons-rest-api', adminOnly: true },
		{ id: 'roles_permissions', label: __( 'Permissions Matrix', 'workpress' ), icon: 'dashicons-shield', adminOnly: true },
		{ id: 'role_management', label: __( 'Role Management & Aliases', 'workpress' ), icon: 'dashicons-id', adminOnly: true },
		{ id: 'contribution_types', label: __( 'Contribution Types', 'workpress' ), icon: 'dashicons-share-alt2', adminOnly: true },
		{ id: 'members', label: __( 'Members & Staff Directory', 'workpress' ), icon: 'dashicons-groups' },
		{ id: 'clients', label: __( 'Clients & Requesters', 'workpress' ), icon: 'dashicons-id-alt' },
		{ id: 'localization_time', label: __( 'Time & Localization', 'workpress' ), icon: 'dashicons-clock', adminOnly: true },
		{ id: 'general', label: __( 'System Settings', 'workpress' ), icon: 'dashicons-admin-generic', adminOnly: true },
		{ id: 'notifications', label: __( 'Notifications & Alerts', 'workpress' ), icon: 'dashicons-bell' },
		{ id: 'sound_effects', label: __( 'Sound Effects & Audio Feedback', 'workpress' ), icon: 'dashicons-format-audio' },
		{ id: 'export', label: __( 'Export & Archive', 'workpress' ), icon: 'dashicons-database-export', adminOnly: true },
	];

	const allTabs = hooks.applyFilters('workpress_settings_tabs', defaultTabs);
	const tabs = allTabs.filter( t => !t.adminOnly || isAdmin );

	const handleSaveLocalizationSettings = () => {
		setIsSettingsSaving(true);
		Promise.all([
			settingsApi.update({ timezone, monthNaming, dateFormat, relativeTime }),
			settingsApi.updateLocale(selectedLocale, syncWpLocale)
		]).then(() => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.timezone = timezone;
				window.workpressSettings.monthNaming = monthNaming;
				window.workpressSettings.dateFormat = dateFormat;
				window.workpressSettings.relativeTime = relativeTime;
			}
			setLocale(syncWpLocale ? 'auto' : selectedLocale, syncWpLocale);
			toast( __( 'Timezone and localization settings saved successfully.', 'workpress' ), 'success' );
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
		});
	};

	const handleResetToWordPressLocale = () => {
		setSyncWpLocale(true);
		const wpLoc = getWpLocale();
		setSelectedLocale(wpLoc);
		setLocale('auto', true);
		settingsApi.updateLocale('auto', true).then(() => {
			toast( __( 'Language reset to match WordPress default.', 'workpress' ), 'success' );
		}).catch(() => {});
	};

	const handleSaveGeneralSettings = () => {
		setIsSettingsSaving(true);
		settingsApi.update({
			siteName,
			defaultPriority,
			emailNotifications: emailNotifs,
			logo_id: logoId,
			logo_url: logoUrl,
			favicon_id: faviconId,
			favicon_url: faviconUrl,
			broadcast_notice: {
				enabled: broadcastEnabled,
				text: broadcastText
			}
		}).then((res) => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.siteName = siteName;
				window.workpressSettings.defaultPriority = defaultPriority;
				window.workpressSettings.emailNotifications = emailNotifs;
				window.workpressSettings.customLogoUrl = logoUrl;
				window.workpressSettings.customLogoId = logoId;
				window.workpressSettings.customFaviconUrl = faviconUrl;
				window.workpressSettings.customFaviconId = faviconId;
				window.workpressSettings.broadcastNotice = { enabled: broadcastEnabled, text: broadcastText };
				window.workpressSettings.logoUrl = (res && res.logo_effective_url) ? res.logo_effective_url : (logoUrl || (wpSettings.defaultLogoUrl || (wpSettings.pluginUrl + 'assets/brand/workpress.svg')));
				window.workpressSettings.faviconUrl = (res && res.favicon_effective_url) ? res.favicon_effective_url : (faviconUrl || (wpSettings.defaultFaviconUrl || (wpSettings.pluginUrl + 'assets/brand/favicon.svg')));
			}

			// Dynamically update browser tab favicon in active DOM
			const effectiveFavicon = (res && res.favicon_effective_url) ? res.favicon_effective_url : (faviconUrl || (wpSettings.defaultFaviconUrl || '/wp-content/plugins/WorkPress/assets/brand/favicon.svg'));
			let favLink = document.querySelector("link[rel*='icon']");
			if (favLink) {
				favLink.href = effectiveFavicon;
			}

			// Fire global event for live header logo re-render
			window.dispatchEvent(new CustomEvent('workpress_brand_updated', { detail: { logoUrl, faviconUrl } }));

			// Fire global event for live broadcast ticker update
			window.dispatchEvent(new CustomEvent('workpress_broadcast_updated', { detail: { enabled: broadcastEnabled, text: broadcastText } }));

			toast( __( 'System and branding settings saved successfully.', 'workpress' ), 'success' );
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
		});
	};

	const handleEventToggle = (key) => {
		const curr = eventsConfig[key] || { enabled: true, sound: key };
		const next = { ...eventsConfig, [key]: { ...curr, enabled: !curr.enabled } };
		setEventsConfig(next);
		sound.saveEventsConfig(next);
		if (!curr.enabled) sound.preview(curr.sound || key, soundKit);
	};

	const handleEventSoundChange = (key, newSound) => {
		const curr = eventsConfig[key] || { enabled: true, sound: key };
		const next = { ...eventsConfig, [key]: { ...curr, sound: newSound } };
		setEventsConfig(next);
		sound.saveEventsConfig(next);
		sound.preview(newSound, soundKit);
	};

	const handleSaveSoundSettings = () => {
		setIsSettingsSaving(true);
		settingsApi.update({
			sound_enabled: soundEnabled,
			sound_volume: soundVolume,
			sound_kit: soundKit,
			sound_events_config: eventsConfig
		}).then(() => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.sound_enabled = soundEnabled;
				window.workpressSettings.sound_volume = soundVolume;
				window.workpressSettings.sound_kit = soundKit;
				window.workpressSettings.sound_events_config = eventsConfig;
			}
			sound.setEnabled(soundEnabled);
			sound.setVolume(soundVolume);
			sound.setKit(soundKit);
			sound.saveEventsConfig(eventsConfig);
			toast( __( 'Sound effects and events settings saved successfully.', 'workpress' ), 'success' );
			sound.play('celebration');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
		});
	};

	const handleSeedData = () => {
		setIsSeeding(true);
		devApi.seed().then((res) => {
			setIsSeeding(false);
			toast(res.message || __( 'Demo data generated successfully!', 'workpress' ), 'success');
		}).catch((err) => {
			setIsSeeding(false);
			toast(err.message || __( 'Failed to generate demo data', 'workpress' ), 'danger');
		});
	};

	const handlePurgeData = () => {
		setConfirmConfig({
			title: __( 'Purge Demo Data', 'workpress' ),
			message: __( 'Are you sure you want to purge all generated demo projects and tasks?', 'workpress' ),
			confirmText: __( 'Purge All', 'workpress' ),
			isDanger: true,
			onConfirm: () => {
				setIsPurging(true);
				devApi.purge().then((res) => {
					setIsPurging(false);
					toast(res.message || __( 'Demo data purged successfully!', 'workpress' ), 'info');
				}).catch((err) => {
					setIsPurging(false);
					toast(err.message || __( 'Failed to purge demo data', 'workpress' ), 'danger');
				});
			}
		});
	};

	const handleExportJson = () => {
		setIsExporting(true);
		exportApi.getAll().then((data) => {
			setIsExporting(false);
			const jsonString = JSON.stringify(data, null, 2);
			const blob = new Blob([jsonString], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			const dateStr = new Date().toISOString().split('T')[0];
			link.href = url;
			link.download = `workpress-export-${dateStr}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			toast( __( 'Complete workspace JSON exported successfully!', 'workpress' ), 'success' );
		}).catch((err) => {
			setIsExporting(false);
			console.error(err);
			toast(err.message || __( 'Failed to export data', 'workpress' ), 'danger');
		});
	};

	const fetchContributionTypes = () => {
		setIsTypesLoading(true);
		contributionsApi.types.list().then(data => {
			setContributionTypes(Array.isArray(data) ? data : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			setIsTypesLoading(false);
		});
	};

	useEffect(() => {
		if (activeTab === 'contribution_types' && contributionTypes.length === 0) {
			fetchContributionTypes();
		}
	}, [activeTab]);

	const handleSaveContributionTypes = () => {
		setIsTypesLoading(true);
		contributionsApi.types.update(contributionTypes).then(res => {
			toast( __( 'Contribution types saved successfully!', 'workpress' ), 'success' );
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
			setIsTypesLoading(false);
		});
	};

	const handleAddCustomType = (e) => {
		e.preventDefault();
		if (!newType.key.trim() || !newType.label.trim()) {
			toast( __( 'Please fill all required fields.', 'workpress' ), 'warning' );
			return;
		}
		setIsTypesLoading(true);
		contributionsApi.types.createCustom(newType).then(res => {
			toast( __( 'New contribution type added successfully!', 'workpress' ), 'success' );
			setNewType({ key: '', label: '', icon: 'dashicons-admin-comments' });
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast(err.message || __( 'An error occurred while processing the request.', 'workpress' ), 'danger');
			setIsTypesLoading(false);
		});
	};

	const handleDeleteCustomType = (typeKey) => {
		setConfirmConfig({
			title: __( 'Delete Contribution Type', 'workpress' ),
			message: __( 'Are you sure you want to delete this custom contribution type?', 'workpress' ),
			confirmText: __( 'Delete', 'workpress' ),
			isDanger: true,
			onConfirm: () => {
				setIsTypesLoading(true);
				contributionsApi.types.deleteCustom(typeKey).then(res => {
					toast( __( 'Contribution type deleted successfully.', 'workpress' ), 'success' );
					setContributionTypes(res.types || []);
					setIsTypesLoading(false);
				}).catch(err => {
					console.error(err);
					toast(err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger');
					setIsTypesLoading(false);
				});
			}
		});
	};

	const handleRoleChange = async (userId, newRole) => {
		try {
			setIsLoading(true);
			await usersApi.updateRole(userId, [newRole]);
			toast( sprintf( __( 'User role changed successfully to: %s', 'workpress' ), getUserRoleLabel(newRole) ), 'success' );
			setUsers(prev => prev.map(u => {
				if (u.id === userId) {
					return { ...u, roles: [newRole], role: newRole };
				}
				return u;
			}));
			setIsLoading(false);
		} catch (err) {
			console.error('Role update error:', err);
			toast(err.message || __( 'An error occurred while updating user role.', 'workpress' ), 'danger');
			setIsLoading(false);
		}
	};

	const fetchUsers = (pageNum = 1, currentTab = activeTab) => {
		setIsLoading(true);
		const rolesParam = currentTab === 'clients' 
			? 'subscriber,workpress_client,workpress_portal_user' 
			: 'administrator,editor,author,contributor';

		window.wp.apiFetch({ path: `/wp/v2/users?context=edit&roles=${rolesParam}&per_page=15&page=${pageNum}`, parse: false })
			.then(res => {
				const total = res.headers.get('X-WP-TotalPages');
				setTotalPages(total ? parseInt(total, 10) : 1);
				return res.json();
			})
			.then(data => {
				setUsers(Array.isArray(data) ? data : []);
				setIsLoading(false);
			})
			.catch(err => {
				console.error(err);
				setUsers([]);
				setIsLoading(false);
			});
	};

	useEffect(() => {
		if (activeTab === 'members' || activeTab === 'clients') {
			setPage(1);
			fetchUsers(1, activeTab);
		}
	}, [activeTab]);

	useEffect(() => {
		if (page > 1 && (activeTab === 'members' || activeTab === 'clients')) {
			fetchUsers(page, activeTab);
		}
	}, [page]);

	const fetchRoles = () => {
		setIsRolesLoading(true);
		rolesApi.list().then(data => {
			setRolesData(data);
			setAliasesUpdates(data.aliases || {});
			setIsRolesLoading(false);
		}).catch(err => {
			console.error(err);
			setIsRolesLoading(false);
		});
	};

	useEffect(() => {
		if ((activeTab === 'roles_permissions' || activeTab === 'role_management' || activeTab === 'members') && !rolesData) {
			fetchRoles();
		}
	}, [activeTab]);

	const handleCapToggle = (roleName, capKey) => {
		setRolesData(prev => {
			const newRoles = prev.roles.map(r => {
				if (r.name === roleName) {
					return {
						...r,
						capabilities: {
							...r.capabilities,
							[capKey]: !r.capabilities[capKey]
						}
					};
				}
				return r;
			});
			return { ...prev, roles: newRoles };
		});

		setRolesUpdates(prev => {
			const roleUpdates = prev[roleName] || {};
			const currentVal = rolesData.roles.find(r => r.name === roleName).capabilities[capKey];
			return {
				...prev,
				[roleName]: { ...roleUpdates, [capKey]: !currentVal }
			};
		});
	};

	const saveRoleUpdates = () => {
		if (Object.keys(rolesUpdates).length === 0) return;
		setIsRolesLoading(true);
		rolesApi.update(rolesUpdates).then(() => {
			toast( __( 'Permissions matrix saved successfully!', 'workpress' ), 'success' );
			setRolesUpdates({});
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
			setIsRolesLoading(false);
		});
	};

	const saveAliases = () => {
		setIsRolesLoading(true);
		rolesApi.updateAliases(aliasesUpdates).then(() => {
			toast( __( 'Role aliases saved successfully!', 'workpress' ), 'success' );
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast( __( 'An error occurred while saving settings.', 'workpress' ), 'danger' );
			setIsRolesLoading(false);
		});
	};

	const handleCreateCustomRole = (e) => {
		e.preventDefault();
		if (!newRole.id || !newRole.display_name) {
			toast( __( 'Please fill all required fields.', 'workpress' ), 'warning' );
			return;
		}
		setIsRolesLoading(true);
		rolesApi.createCustom({
			role_id: newRole.id,
			display_name: newRole.display_name,
			clone_from: newRole.clone_from
		}).then(() => {
			toast( __( 'Custom role created successfully!', 'workpress' ), 'success' );
			setNewRole({ id: '', display_name: '', clone_from: 'editor' });
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast(err.message || __( 'An error occurred while creating custom role.', 'workpress' ), 'danger');
			setIsRolesLoading(false);
		});
	};

	const handleDeleteCustomRole = (roleId) => {
		setConfirmConfig({
			title: __( 'Delete Custom Role', 'workpress' ),
			message: __( 'Are you sure you want to delete this custom role? This action cannot be undone.', 'workpress' ),
			confirmText: __( 'Delete', 'workpress' ),
			isDanger: true,
			onConfirm: () => {
				setIsRolesLoading(true);
				rolesApi.deleteCustom(roleId).then(() => {
					toast( __( 'Custom role deleted successfully.', 'workpress' ), 'success' );
					fetchRoles();
				}).catch(err => {
					console.error(err);
					toast(err.message || __( 'An error occurred during deletion', 'workpress' ), 'danger');
					setIsRolesLoading(false);
				});
			}
		});
	};

	const dynamicRoleLabels = { ...CANONICAL_ROLE_LABELS };
	if (rolesData && rolesData.roles) {
		rolesData.roles.forEach(r => {
			if (r.alias && r.alias !== r.display_name) {
				dynamicRoleLabels[r.name] = r.alias;
			} else if (r.display_name) {
				dynamicRoleLabels[r.name] = r.display_name;
			}
		});
	}

	return html`
		<div className="columns is-variable is-5 mt-0">
			<!-- القائمة الجانبية للإعدادات (Settings Sidebar) -->
			<div className="column is-2">
				<div 
					className="wp-card p-3 wp-settings-sidebar-sticky"
					style=${{ top: `${stickyTop}px`, maxHeight: `calc(100vh - ${stickyTop + 20}px)` }}
				>
					<h2 className="title is-6 mb-3 has-text-weight-bold" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem', color: '#64748b' }}>${ __( 'Settings', 'workpress' ) }</h2>
					<div className="is-flex is-flex-direction-column" style=${{ gap: '4px' }}>
						${tabs.map(tab => {
							const isActive = activeTab === tab.id;
							return html`
								<button
									key=${tab.id}
									onClick=${() => {
										setActiveTab(tab.id);
										window.location.hash = '#/settings?tab=' + tab.id;
									}}
									className=${`button wp-settings-tab-btn ${isActive ? 'is-active' : ''}`}
								>
									<span className="icon">
										<i className=${`dashicons ${tab.icon}`}></i>
									</span>
									<span>${tab.label}</span>
								</button>
							`;
						})}
					</div>
				</div>
			</div>

			<!-- محتوى الإعدادات (Settings Content Delegation) -->
			<div className="column is-10">
				${activeTab === 'about' && html`
					<${AboutWorkPressTab} />
				`}

				${activeTab === 'intake_forms' && html`
					<${IntakeFormsBuilderTab}
						initialForms=${intakeForms}
						onSaved=${(newForms) => setIntakeForms(newForms)}
					/>
				`}

				${activeTab === 'webhooks' && html`
					<${WebhooksSettingsTab} />
				`}

				${(activeTab === 'roles_permissions' || activeTab === 'role_management') && html`
					<${RolesPermissionsTab}
						activeTab=${activeTab}
						rolesData=${rolesData}
						isRolesLoading=${isRolesLoading}
						rolesUpdates=${rolesUpdates}
						selectedMatrixRole=${selectedMatrixRole}
						setSelectedMatrixRole=${setSelectedMatrixRole}
						handleCapToggle=${handleCapToggle}
						saveRoleUpdates=${saveRoleUpdates}
						dynamicRoleLabels=${dynamicRoleLabels}
						aliasesUpdates=${aliasesUpdates}
						setAliasesUpdates=${setAliasesUpdates}
						saveAliases=${saveAliases}
						newRole=${newRole}
						setNewRole=${setNewRole}
						handleCreateCustomRole=${handleCreateCustomRole}
						handleDeleteCustomRole=${handleDeleteCustomRole}
					/>
				`}

				${(activeTab === 'members' || activeTab === 'clients') && html`
					<${UserDirectoryTab}
						activeTab=${activeTab}
						users=${users}
						isLoading=${isLoading}
						page=${page}
						totalPages=${totalPages}
						setPage=${setPage}
						dynamicRoleLabels=${dynamicRoleLabels}
						handleRoleChange=${handleRoleChange}
						clientSubFilter=${clientSubFilter}
						setClientSubFilter=${setClientSubFilter}
					/>
				`}

				${activeTab === 'contribution_types' && html`
					<${ContributionTypesTab}
						contributionTypes=${contributionTypes}
						setContributionTypes=${setContributionTypes}
						isTypesLoading=${isTypesLoading}
						newType=${newType}
						setNewType=${setNewType}
						handleSaveContributionTypes=${handleSaveContributionTypes}
						handleAddCustomType=${handleAddCustomType}
						handleDeleteCustomType=${handleDeleteCustomType}
					/>
				`}

				${(activeTab === 'localization_time' || activeTab === 'general') && html`
					<${GeneralLocalizationTab}
						activeTab=${activeTab}
						timezone=${timezone}
						setTimezone=${setTimezone}
						monthNaming=${monthNaming}
						setMonthNaming=${setMonthNaming}
						dateFormat=${dateFormat}
						setDateFormat=${setDateFormat}
						relativeTime=${relativeTime}
						setRelativeTime=${setRelativeTime}
						syncWpLocale=${syncWpLocale}
						setSyncWpLocale=${setSyncWpLocale}
						selectedLocale=${selectedLocale}
						setSelectedLocale=${setSelectedLocale}
						handleResetToWordPressLocale=${handleResetToWordPressLocale}
						siteName=${siteName}
						setSiteName=${setSiteName}
						defaultPriority=${defaultPriority}
						setDefaultPriority=${setDefaultPriority}
						logoUrl=${logoUrl}
						setLogoUrl=${setLogoUrl}
						logoId=${logoId}
						setLogoId=${setLogoId}
						faviconUrl=${faviconUrl}
						setFaviconUrl=${setFaviconUrl}
						faviconId=${faviconId}
						setFaviconId=${setFaviconId}
						defaultLogoUrl=${wpSettings.defaultLogoUrl || (wpSettings.pluginUrl + 'assets/brand/workpress.svg')}
						defaultFaviconUrl=${wpSettings.defaultFaviconUrl || (wpSettings.pluginUrl + 'assets/brand/favicon.svg')}
						broadcastEnabled=${broadcastEnabled}
						setBroadcastEnabled=${setBroadcastEnabled}
						broadcastText=${broadcastText}
						setBroadcastText=${setBroadcastText}
						isSettingsSaving=${isSettingsSaving}
						handleSaveLocalizationSettings=${handleSaveLocalizationSettings}
						handleSaveGeneralSettings=${handleSaveGeneralSettings}
					/>
				`}

				${activeTab === 'sound_effects' && html`
					<${SoundEffectsTab}
						soundEnabled=${soundEnabled}
						setSoundEnabled=${setSoundEnabled}
						soundVolume=${soundVolume}
						setSoundVolume=${setSoundVolume}
						soundKit=${soundKit}
						setSoundKit=${setSoundKit}
						eventsConfig=${eventsConfig}
						handleEventToggle=${handleEventToggle}
						handleEventSoundChange=${handleEventSoundChange}
						handleSaveSoundSettings=${handleSaveSoundSettings}
						isSettingsSaving=${isSettingsSaving}
					/>
				`}

				${activeTab === 'notifications' && html`
					<${NotificationsTab}
						emailNotifs=${emailNotifs}
						setEmailNotifs=${setEmailNotifs}
						setActiveTab=${setActiveTab}
					/>
				`}

				${activeTab === 'export' && html`
					<${ExportDiagnosticsTab}
						isExporting=${isExporting}
						handleExportJson=${handleExportJson}
						isSeeding=${isSeeding}
						isPurging=${isPurging}
						handleSeedData=${handleSeedData}
						handlePurgeData=${handlePurgeData}
					/>
				`}

				<!-- Render Custom Settings Tab Content from Plugins -->
				${ hooks.applyFilters('workpress_settings_tab_content', null, activeTab) }
			</div>
			
			${ confirmConfig && html`
				<${ConfirmModal}
					isActive=${ true }
					title=${ confirmConfig.title }
					message=${ confirmConfig.message }
					confirmText=${ confirmConfig.confirmText }
					cancelText=${ __( 'Cancel', 'workpress' ) }
					isDanger=${ confirmConfig.isDanger }
					onConfirm=${ () => {
						confirmConfig.onConfirm();
						setConfirmConfig(null);
					} }
					onCancel=${ () => setConfirmConfig(null) }
				/>
			` }
		</div>
	`;
}
