import { html, useState, useEffect } from '../utils/html.js';
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
	const [logoUrl, setLogoUrl] = useState(wpSettings.customLogoUrl || '');
	const [logoId, setLogoId] = useState(wpSettings.customLogoId || 0);
	const [faviconUrl, setFaviconUrl] = useState(wpSettings.customFaviconUrl || '');
	const [faviconId, setFaviconId] = useState(wpSettings.customFaviconId || 0);
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
		{ id: 'about', label: 'عن WorkPress والفلسفة', icon: 'dashicons-info' },
		{ id: 'intake_forms', label: 'نماذج استقبال الطلبات', icon: 'dashicons-forms', adminOnly: true },
		{ id: 'webhooks', label: 'خطافات الويب والتكامل الخارجي', icon: 'dashicons-rest-api', adminOnly: true },
		{ id: 'roles_permissions', label: 'مصفوفة الصلاحيات', icon: 'dashicons-shield', adminOnly: true },
		{ id: 'role_management', label: 'إدارة الأدوار والمسميات', icon: 'dashicons-id', adminOnly: true },
		{ id: 'contribution_types', label: 'أنواع المساهمات', icon: 'dashicons-share-alt2', adminOnly: true },
		{ id: 'members', label: 'دليل الأعضاء والمنفذين', icon: 'dashicons-groups' },
		{ id: 'clients', label: 'المستفيدون وأصحاب الطلبات', icon: 'dashicons-id-alt' },
		{ id: 'localization_time', label: 'الوقت والمنطقة الزمنية', icon: 'dashicons-clock', adminOnly: true },
		{ id: 'general', label: 'إعدادات النظام', icon: 'dashicons-admin-generic', adminOnly: true },
		{ id: 'notifications', label: 'الإشعارات والتنبيهات', icon: 'dashicons-bell' },
		{ id: 'sound_effects', label: 'الأصوات والتأثيرات التفاعلية', icon: 'dashicons-format-audio' },
		{ id: 'export', label: 'التصدير والأرشفة', icon: 'dashicons-database-export', adminOnly: true },
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
			toast('تم حفظ إعدادات الوقت والمنطقة الزمنية بنجاح.', 'success');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ الإعدادات.', 'danger');
		});
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

			toast('تم حفظ إعدادات النظام والشعار بنجاح.', 'success');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ الإعدادات.', 'danger');
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
			toast('تم حفظ إعدادات الأصوات وتخصيص الأحداث بنجاح ', 'success');
			sound.play('celebration');
		}).catch(err => {
			setIsSettingsSaving(false);
			console.error(err);
			toast('حدث خطأ أثناء حفظ إعدادات الأصوات.', 'danger');
		});
	};

	const handleSeedData = () => {
		setIsSeeding(true);
		devApi.seed().then((res) => {
			setIsSeeding(false);
			toast(res.message || 'تم توليد البيانات التجريبية بنجاح!', 'success');
		}).catch((err) => {
			setIsSeeding(false);
			toast(err.message || 'فشل توليد البيانات التجريبية', 'danger');
		});
	};

	const handlePurgeData = () => {
		setConfirmConfig({
			title: 'تطهير وحذف البيانات التجريبية',
			message: 'هل أنت متأكد من رغبتك في حذف وتطهير كافة المشاريع والمهام والمساهمات التجريبية المولدة؟',
			confirmText: 'تطهير شامل',
			isDanger: true,
			onConfirm: () => {
				setIsPurging(true);
				devApi.purge().then((res) => {
					setIsPurging(false);
					toast(res.message || 'تم تطهير البيانات التجريبية بنجاح!', 'info');
				}).catch((err) => {
					setIsPurging(false);
					toast(err.message || 'فشل تطهير البيانات', 'danger');
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
			toast('تم تصدير وتحميل نسخة البيانات الكاملة بنجاح!', 'success');
		}).catch((err) => {
			setIsExporting(false);
			console.error(err);
			toast(err.message || 'فشل تصدير البيانات', 'danger');
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
			toast('تم حفظ تعديلات أنواع المساهمات بنجاح!', 'success');
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast('حدث خطأ أثناء حفظ أنواع المساهمات.', 'danger');
			setIsTypesLoading(false);
		});
	};

	const handleAddCustomType = (e) => {
		e.preventDefault();
		if (!newType.key.trim() || !newType.label.trim()) {
			toast('يرجى ملء المعرّف والتسمية للنوع الجديد.', 'warning');
			return;
		}
		setIsTypesLoading(true);
		contributionsApi.types.createCustom(newType).then(res => {
			toast('تمت إضافة نوع المساهمة الجديد بنجاح!', 'success');
			setNewType({ key: '', label: '', icon: 'dashicons-admin-comments' });
			setContributionTypes(Array.isArray(res) ? res : []);
			setIsTypesLoading(false);
		}).catch(err => {
			console.error(err);
			toast(err.message || 'حدث خطأ أثناء إضافة النوع الجديد.', 'danger');
			setIsTypesLoading(false);
		});
	};

	const handleDeleteCustomType = (typeKey) => {
		setConfirmConfig({
			title: 'حذف نوع مساهمة',
			message: 'هل أنت متأكد من رغبتك في حذف هذا النوع المخصص؟',
			confirmText: 'حذف',
			isDanger: true,
			onConfirm: () => {
				setIsTypesLoading(true);
				contributionsApi.types.deleteCustom(typeKey).then(res => {
					toast('تم حذف نوع المساهمة بنجاح.', 'success');
					setContributionTypes(res.types || []);
					setIsTypesLoading(false);
				}).catch(err => {
					console.error(err);
					toast(err.message || 'حدث خطأ أثناء حذف النوع.', 'danger');
					setIsTypesLoading(false);
				});
			}
		});
	};

	const handleRoleChange = async (userId, newRole) => {
		try {
			setIsLoading(true);
			await usersApi.updateRole(userId, [newRole]);
			toast(`تم تغيير دور المستخدم بنجاح إلى: ${getUserRoleLabel(newRole)}`, 'success');
			setUsers(prev => prev.map(u => {
				if (u.id === userId) {
					return { ...u, roles: [newRole], role: newRole };
				}
				return u;
			}));
			setIsLoading(false);
		} catch (err) {
			console.error('Role update error:', err);
			toast(err.message || 'حدث خطأ أثناء تغيير دور المستخدم.', 'danger');
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
			toast('تم حفظ مصفوفة الصلاحيات بنجاح!', 'success');
			setRolesUpdates({});
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('حدث خطأ أثناء الحفظ. تأكد من أنك تملك الصلاحيات الكافية.', 'danger');
			setIsRolesLoading(false);
		});
	};

	const saveAliases = () => {
		setIsRolesLoading(true);
		rolesApi.updateAliases(aliasesUpdates).then(() => {
			toast('تم حفظ الأسماء المخصصة بنجاح!', 'success');
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('حدث خطأ أثناء حفظ المسميات.', 'danger');
			setIsRolesLoading(false);
		});
	};

	const handleCreateCustomRole = (e) => {
		e.preventDefault();
		if (!newRole.id || !newRole.display_name) {
			toast('يرجى ملء جميع الحقول المطلوبة.', 'warning');
			return;
		}
		setIsRolesLoading(true);
		rolesApi.createCustom({
			role_id: newRole.id,
			display_name: newRole.display_name,
			clone_from: newRole.clone_from
		}).then(() => {
			toast('تم إنشاء الدور المخصص بنجاح!', 'success');
			setNewRole({ id: '', display_name: '', clone_from: 'editor' });
			fetchRoles();
		}).catch(err => {
			console.error(err);
			toast('حدث خطأ أثناء إنشاء الدور. تأكد من أن المعرّف غير مستخدم مسبقاً (حروف إنجليزية فقط).', 'danger');
			setIsRolesLoading(false);
		});
	};

	const handleDeleteCustomRole = (roleId) => {
		setConfirmConfig({
			title: 'حذف دور مخصص',
			message: 'هل أنت متأكد من رغبتك في حذف هذا الدور المخصص؟ هذا الإجراء لا يمكن التراجع عنه.',
			confirmText: 'حذف',
			isDanger: true,
			onConfirm: () => {
				setIsRolesLoading(true);
				rolesApi.deleteCustom(roleId).then(() => {
					toast('تم حذف الدور المخصص بنجاح.', 'success');
					fetchRoles();
				}).catch(err => {
					console.error(err);
					toast('حدث خطأ أثناء حذف الدور.', 'danger');
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
			<!-- القائمة الجانبية للإعدادات (Settings Sidebar) -->
			<div className="column is-2">
				<div className="wp-card p-3">
					<h2 className="title is-6 mb-3 has-text-weight-bold" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem', color: '#64748b' }}>الإعدادات</h2>
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
					cancelText="إلغاء"
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
