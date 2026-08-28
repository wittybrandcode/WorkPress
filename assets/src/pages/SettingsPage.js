import { html, useState, useEffect } from '../utils/html.js';
import { hooks } from '../utils/hooks.js';
import { usersApi, rolesApi, contributionsApi, settingsApi, devApi, exportApi } from '../api/client.js';
import { CANONICAL_ROLE_LABELS, getUserRoleLabel } from '../utils/userScope.js';
import ConfirmModal from '../components/modals/Modal.js';
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
 * @version 2.2.3
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
			setActiveTab(tab);
		};
		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
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
	const [isSettingsSaving, setIsSettingsSaving] = useState(false);

	// Sound Effects Settings State
	const [soundEnabled, setSoundEnabled] = useState(wpSettings.sound_enabled !== undefined ? wpSettings.sound_enabled : true);
	const [soundVolume, setSoundVolume] = useState(wpSettings.sound_volume !== undefined ? parseFloat(wpSettings.sound_volume) : 0.7);
	const [soundKit, setSoundKit] = useState(wpSettings.sound_kit || '01');
	const [eventsConfig, setEventsConfig] = useState(sound.getAllEventsConfig());

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
	];

	const allTabs = hooks.applyFilters('workpress_settings_tabs', defaultTabs);
	const tabs = allTabs.filter( t => !t.adminOnly || isAdmin );

	const handleSaveLocalizationSettings = () => {
		setIsSettingsSaving(true);
		settingsApi.update({ timezone, monthNaming, dateFormat, relativeTime }).then(() => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.timezone = timezone;
				window.workpressSettings.monthNaming = monthNaming;
				window.workpressSettings.dateFormat = dateFormat;
				window.workpressSettings.relativeTime = relativeTime;
			}
			toast('ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„ÙˆÙ‚Øª ÙˆØ§Ù„Ù…Ù†Ø·Ù‚Ø© Ø§Ù„Ø²Ù…Ù†ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­.', 'success');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.', 'danger');
		});
	};

	const handleSaveGeneralSettings = () => {
		setIsSettingsSaving(true);
		settingsApi.update({ siteName, defaultPriority, emailNotifications: emailNotifs }).then(() => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.siteName = siteName;
				window.workpressSettings.defaultPriority = defaultPriority;
				window.workpressSettings.emailNotifications = emailNotifs;
			}
			toast('ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ù†Ø¸Ø§Ù… Ø¨Ù†Ø¬Ø§Ø­.', 'success');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.', 'danger');
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
			toast('ØªÙ… Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø£ØµÙˆØ§Øª ÙˆØªØ®ØµÙŠØµ Ø§Ù„Ø£Ø­Ø¯Ø§Ø« Ø¨Ù†Ø¬Ø§Ø­ ', 'success');
			sound.play('celebration');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø§Ù„Ø£ØµÙˆØ§Øª.', 'danger');
		});
	};

	const handleSeedData = () => {
		setIsSeeding(true);
		devApi.seed().then((res) => {
			setIsSeeding(false);
			toast(res.message || 'ØªÙ… ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­!', 'success');
		}).catch((err) => {
			setIsSeeding(false);
			toast(err.message || 'ÙØ´Ù„ ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©', 'danger');
		});
	};

	const handlePurgeData = () => {
		setConfirmConfig({
			title: 'ØªØ·Ù‡ÙŠØ± ÙˆØ­Ø°Ù Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ©',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø­Ø°Ù ÙˆØªØ·Ù‡ÙŠØ± ÙƒØ§ÙØ© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ ÙˆØ§Ù„Ù…Ù‡Ø§Ù… ÙˆØ§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø§Ù„Ù…ÙˆÙ„Ø¯Ø©ØŸ',
			confirmText: 'ØªØ·Ù‡ÙŠØ± Ø´Ø§Ù…Ù„',
			isDanger: true,
			onConfirm: () => {
				setIsPurging(true);
				devApi.purge().then((res) => {
					setIsPurging(false);
					toast(res.message || 'ØªÙ… ØªØ·Ù‡ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠØ© Ø¨Ù†Ø¬Ø§Ø­!', 'info');
				}).catch((err) => {
					setIsPurging(false);
					toast(err.message || 'ÙØ´Ù„ ØªØ·Ù‡ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', 'danger');
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
			toast('ØªÙ… ØªØµØ¯ÙŠØ± ÙˆØªØ­Ù…ÙŠÙ„ Ù†Ø³Ø®Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ÙƒØ§Ù…Ù„Ø© Ø¨Ù†Ø¬Ø§Ø­!', 'success');
		}).catch((err) => {
			setIsExporting(false);
			console.error(err);
			toast(err.message || 'ÙØ´Ù„ ØªØµØ¯ÙŠØ± Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª', 'danger');
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
			toast('ØªÙ… Ø­ÙØ¸ ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ø¨Ù†Ø¬Ø§Ø­!', 'success');
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø£Ù†ÙˆØ§Ø¹ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª.', 'danger');
			setIsTypesLoading(false);
		});
	};

	const handleAddCustomType = (e) => {
		e.preventDefault();
		if (!newType.key.trim() || !newType.label.trim()) {
			toast('ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø§Ù„Ù…Ø¹Ø±Ù‘Ù ÙˆØ§Ù„ØªØ³Ù…ÙŠØ© Ù„Ù„Ù†ÙˆØ¹ Ø§Ù„Ø¬Ø¯ÙŠØ¯.', 'warning');
			return;
		}
		setIsTypesLoading(true);
		contributionsApi.types.createCustom(newType).then(res => {
			toast('ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ù†ÙˆØ¹ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø§Ù„Ø¬Ø¯ÙŠØ¯ Ø¨Ù†Ø¬Ø§Ø­!', 'success');
			setNewType({ key: '', label: '', icon: 'dashicons-admin-comments' });
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù†ÙˆØ¹ Ø§Ù„Ø¬Ø¯ÙŠØ¯.', 'danger');
			setIsTypesLoading(false);
		});
	};

	const handleDeleteCustomType = (typeKey) => {
		setConfirmConfig({
			title: 'Ø­Ø°Ù Ù†ÙˆØ¹ Ù…Ø³Ø§Ù‡Ù…Ø©',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ù†ÙˆØ¹ Ø§Ù„Ù…Ø®ØµØµØŸ',
			confirmText: 'Ø­Ø°Ù',
			isDanger: true,
			onConfirm: () => {
				setIsTypesLoading(true);
				contributionsApi.types.deleteCustom(typeKey).then(res => {
					toast('ØªÙ… Ø­Ø°Ù Ù†ÙˆØ¹ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­.', 'success');
					setContributionTypes(res.types || []);
					setIsTypesLoading(false);
				}).catch(err => {
					console.error(err);
					toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­Ø°Ù Ø§Ù„Ù†ÙˆØ¹.', 'danger');
					setIsTypesLoading(false);
				});
			}
		});
	};

	const handleRoleChange = async (userId, newRole) => {
		try {
			setIsLoading(true);
			await usersApi.updateRole(userId, [newRole]);
			toast(`ØªÙ… ØªØºÙŠÙŠØ± Ø¯ÙˆØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù†Ø¬Ø§Ø­ Ø¥Ù„Ù‰: ${getUserRoleLabel(newRole)}`, 'success');
			setUsers(prev => prev.map(u => {
				if (u.id === userId) {
					return { ...u, roles: [newRole], role: newRole };
				}
				return u;
			}));
			setIsLoading(false);
		} catch (err) {
			console.error('Role update error:', err);
			toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØºÙŠÙŠØ± Ø¯ÙˆØ± Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù….', 'danger');
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
			toast('ØªÙ… Ø­ÙØ¸ Ù…ØµÙÙˆÙØ© Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø¨Ù†Ø¬Ø§Ø­!', 'success');
			setRolesUpdates({});
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø­ÙØ¸. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù†Ùƒ ØªÙ…Ù„Ùƒ Ø§Ù„ØµÙ„Ø§Ø­ÙŠØ§Øª Ø§Ù„ÙƒØ§ÙÙŠØ©.', 'danger');
			setIsRolesLoading(false);
		});
	};

	const saveAliases = () => {
		setIsRolesLoading(true);
		rolesApi.updateAliases(aliasesUpdates).then(() => {
			toast('ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø£Ø³Ù…Ø§Ø¡ Ø§Ù„Ù…Ø®ØµØµØ© Ø¨Ù†Ø¬Ø§Ø­!', 'success');
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ù…Ø³Ù…ÙŠØ§Øª.', 'danger');
			setIsRolesLoading(false);
		});
	};

	const handleCreateCustomRole = (e) => {
		e.preventDefault();
		if (!newRole.id || !newRole.display_name) {
			toast('ÙŠØ±Ø¬Ù‰ Ù…Ù„Ø¡ Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ„ Ø§Ù„Ù…Ø·Ù„ÙˆØ¨Ø©.', 'warning');
			return;
		}
		setIsRolesLoading(true);
		rolesApi.createCustom({
			role_id: newRole.id,
			display_name: newRole.display_name,
			clone_from: newRole.clone_from
		}).then(() => {
			toast('ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ù…Ø®ØµØµ Ø¨Ù†Ø¬Ø§Ø­!', 'success');
			setNewRole({ id: '', display_name: '', clone_from: 'editor' });
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø¯ÙˆØ±. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù† Ø§Ù„Ù…Ø¹Ø±Ù‘Ù ØºÙŠØ± Ù…Ø³ØªØ®Ø¯Ù… Ù…Ø³Ø¨Ù‚Ø§Ù‹ (Ø­Ø±ÙˆÙ Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© ÙÙ‚Ø·).', 'danger');
			setIsRolesLoading(false);
		});
	};

	const handleDeleteCustomRole = (roleId) => {
		setConfirmConfig({
			title: 'Ø­Ø°Ù Ø¯ÙˆØ± Ù…Ø®ØµØµ',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ù…Ø®ØµØµØŸ Ù‡Ø°Ø§ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ù„Ø§ ÙŠÙ…ÙƒÙ† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù†Ù‡.',
			confirmText: 'Ø­Ø°Ù',
			isDanger: true,
			onConfirm: () => {
				setIsRolesLoading(true);
				rolesApi.deleteCustom(roleId).then(() => {
					toast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø¯ÙˆØ± Ø§Ù„Ù…Ø®ØµØµ Ø¨Ù†Ø¬Ø§Ø­.', 'success');
					fetchRoles();
				}).catch(err => {
					console.error(err);
					toast('Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­Ø°Ù Ø§Ù„Ø¯ÙˆØ±.', 'danger');
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
		<div className="columns is-variable is-5 mt-4">
			<!-- Ø§Ù„Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠØ© Ù„Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª (Settings Sidebar) -->
			<div className="column is-2">
				<div className="wp-card p-3">
					<h2 className="title is-6 mb-3 has-text-weight-bold" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem', color: '#64748b' }}>Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª</h2>
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

			<!-- Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª (Settings Content Delegation) -->
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
						siteName=${siteName}
						setSiteName=${setSiteName}
						defaultPriority=${defaultPriority}
						setDefaultPriority=${setDefaultPriority}
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
					cancelText="Ø¥Ù„ØºØ§Ø¡"
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
