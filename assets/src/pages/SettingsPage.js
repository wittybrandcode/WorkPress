import { html, useState, useEffect } from '../utils/html.js';
import { hooks } from '../utils/hooks.js';
import { usersApi, rolesApi, contributionsApi, settingsApi, devApi, exportApi } from '../api/client.js';
import { isStaffUser, isStakeholderUser, isStandardSubscriber, CANONICAL_ROLE_LABELS, getUserRoleLabel } from '../utils/userScope.js';
import { formatDate, formatDateTime, formatRelativeTime, formatNumber, formatPercent, MONTH_NAMES } from '../utils/datetime.js';
import ConfirmModal from '../components/ConfirmModal.js';
import AboutWorkPressTab from '../components/AboutWorkPressTab.js';
import IntakeFormsBuilderTab from '../components/IntakeFormsBuilderTab.js';
import WebhooksSettingsTab from '../components/WebhooksSettingsTab.js';
import { toast } from '../utils/toast.js';
import sound, { SOUND_EVENTS, AVAILABLE_SOUNDS } from '../utils/sound.js';

function RoleDropdown({ currentRole, onRoleChange, roleLabels = CANONICAL_ROLE_LABELS }) {
	const [isOpen, setIsOpen] = useState(false);

	return html`
		<div className="dropdown is-fullwidth" style=${{ width: '100%', position: 'relative' }}>
			<div 
				onClick=${() => setIsOpen(!isOpen)}
				style=${{
					width: '100%',
					padding: '6px 12px',
					fontSize: '0.85rem',
					fontWeight: '600',
					color: '#0f172a',
					backgroundColor: '#fff',
					border: '1px solid #cbd5e1',
					cursor: 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					userSelect: 'none'
				}}
			>
				<span>${roleLabels[currentRole] || currentRole}</span>
				<span className="icon is-small" style=${{ marginRight: '8px' }}>
					<i className="dashicons dashicons-arrow-down-alt2" style=${{ fontSize: '14px', height: '14px', lineHeight: '14px' }}></i>
				</span>
			</div>
			${isOpen ? html`
				<div 
					style=${{
						position: 'absolute',
						top: '100%',
						right: 0,
						left: 0,
						zIndex: 100,
						backgroundColor: '#fff',
						border: '1px solid #0f172a',
						boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
						marginTop: '2px'
					}}
				>
					${Object.entries(roleLabels).map(([roleKey, roleLabel]) => html`
						<div
							key=${roleKey}
							onClick=${() => {
								onRoleChange(roleKey);
								setIsOpen(false);
							}}
							style=${{
								padding: '8px 12px',
								fontSize: '0.85rem',
								color: '#0f172a',
								fontWeight: roleKey === currentRole ? 'bold' : '500',
								backgroundColor: roleKey === currentRole ? '#f1f5f9' : '#fff',
								cursor: 'pointer',
								borderBottom: '1px solid #f1f5f9'
							}}
							onMouseEnter=${(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
							onMouseLeave=${(e) => e.currentTarget.style.backgroundColor = roleKey === currentRole ? '#f1f5f9' : '#fff'}
						>
							${roleLabel}
						</div>
					`)}
				</div>
			` : null}
		</div>
	`;
}

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

	// T7: Capability-based tab filtering (Atomic Audit T7)
	const wpSettings = window.workpressSettings || {};
	const isAdmin = !!wpSettings.isAdmin;

	// General settings state (bound to real WordPress configuration)
	const [siteName, setSiteName] = useState(wpSettings.siteName || 'WorkPress Workspace');
	const [defaultPriority, setDefaultPriority] = useState(wpSettings.defaultPriority || 'medium');
	const [emailNotifs, setEmailNotifs] = useState(wpSettings.emailNotifications !== undefined ? wpSettings.emailNotifications : true);

	// Time & Localization Settings State
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
		settingsApi.update({
			timezone,
			monthNaming,
			dateFormat,
			relativeTime
		}).then(() => {
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
			emailNotifications: emailNotifs
		}).then(() => {
			setIsSettingsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.siteName = siteName;
				window.workpressSettings.defaultPriority = defaultPriority;
				window.workpressSettings.emailNotifications = emailNotifs;
			}
			toast('تم حفظ إعدادات النظام بنجاح.', 'success');
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
		if (!curr.enabled) {
			sound.preview(curr.sound || key, soundKit);
		}
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

	// Dev Data Seeder State & Handlers
	const [isSeeding, setIsSeeding] = useState(false);
	const [isPurging, setIsPurging] = useState(false);

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

	// Export Full JSON State & Handler
	const [isExporting, setIsExporting] = useState(false);

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

	// State for Contribution Types
	const [contributionTypes, setContributionTypes] = useState([]);
	const [isTypesLoading, setIsTypesLoading] = useState(false);
	const [newType, setNewType] = useState({ key: '', label: '', icon: 'dashicons-admin-comments' });

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
			// Optimistically update users in state
			setUsers(prev => prev.map(u => {
				if (u.id === userId) {
					return {
						...u,
						roles: [newRole],
						role: newRole
					};
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

	const [rolesData, setRolesData] = useState(null);
	const [isRolesLoading, setIsRolesLoading] = useState(false);
	const [rolesUpdates, setRolesUpdates] = useState({});
	const [selectedMatrixRole, setSelectedMatrixRole] = useState('');
	const [clientSubFilter, setClientSubFilter] = useState('all'); // 'all' | 'stakeholders' | 'subscribers'
	
	// State for Aliases and New Role
	const [aliasesUpdates, setAliasesUpdates] = useState({});
	const [newRole, setNewRole] = useState({ id: '', display_name: '', clone_from: 'editor' });

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
				[roleName]: {
					...roleUpdates,
					[capKey]: !currentVal
				}
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
	// --------------------------

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
					<div className="is-flex is-flex-direction-column" style=${{ gap: '6px' }}>
						${tabs.map(tab => {
							const isActive = activeTab === tab.id;
							return html`
								<button
									key=${tab.id}
									onClick=${() => {
										setActiveTab(tab.id);
										window.location.hash = '#/settings?tab=' + tab.id;
									}}
									className=${`button wp-header-btn is-fullwidth ${isActive ? 'is-active' : ''}`}
									style=${{
										justifyContent: 'flex-start',
										textAlign: 'right',
										borderRadius: '0',
										fontWeight: isActive ? '700' : '600',
										fontSize: '0.85rem',
										paddingLeft: '0.75rem',
										paddingRight: '0.75rem'
									}}
								>
									<span className="icon is-small ml-2" style=${{ marginLeft: '8px' }}>
										<i className=${`dashicons ${tab.icon}`}></i>
									</span>
									<span>${tab.label}</span>
								</button>
							`;
						})}
					</div>
				</div>
			</div>

			<!-- محتوى الإعدادات (Settings Content) -->
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

				${activeTab === 'roles_permissions' ? html`
					<div className="wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">مصفوفة الصلاحيات (Capability Matrix)</h3>
								<p className="has-text-grey is-size-7">تحكم في الصلاحيات المخصصة لكل دور في النظام. هذه الصلاحيات ديناميكية وتطبق فوراً.</p>
							</div>
							<button 
								className=${`button wp-btn ${Object.keys(rolesUpdates).length > 0 ? 'is-primary' : 'is-light'}`}
								disabled=${Object.keys(rolesUpdates).length === 0 || isRolesLoading}
								onClick=${saveRoleUpdates}
							>
								${isRolesLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
							</button>
						</div>
						
						${!rolesData ? html`
							<div className="has-text-centered py-6">
								<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
							</div>
						` : html`
							<div className="mt-4">
							<div className="field mb-4">
								<label className="label is-size-7">اختر الدور لتعديل صلاحياته:</label>
								<div className="control" style=${{ maxWidth: '360px' }}>
									<${RoleDropdown} 
										currentRole=${selectedMatrixRole || (rolesData.roles.length > 0 ? rolesData.roles[0].name : '')} 
										onRoleChange=${(roleName) => setSelectedMatrixRole(roleName)}
										roleLabels=${dynamicRoleLabels}
									/>
								</div>
							</div>
								
								<div className="table-container">
									<table className="table is-fullwidth is-bordered is-hoverable mb-0" style=${{ tableLayout: 'fixed', borderColor: '#e2e8f0' }}>
										<thead style=${{ backgroundColor: '#f8fafc' }}>
											<tr>
												<th style=${{ width: '70%', textAlign: 'right', verticalAlign: 'middle', borderBottom: '2px solid #cbd5e1' }}>القدرة (Capability)</th>
												<th style=${{ width: '30%', textAlign: 'center', verticalAlign: 'middle', borderBottom: '2px solid #cbd5e1' }}>
													<div className="has-text-weight-bold has-text-dark">ممنوحة؟</div>
												</th>
											</tr>
										</thead>
										<tbody>
											${(() => {
												const activeRoleName = selectedMatrixRole || (rolesData.roles.length > 0 ? rolesData.roles[0].name : '');
												const activeRoleObj = rolesData.roles.find(r => r.name === activeRoleName);
												if (!activeRoleObj) return null;
												
												return Object.entries(rolesData.groups || {}).map(([groupKey, group]) => html`
													<tr key=${'header_' + groupKey} style=${{ backgroundColor: '#f8fafc' }}>
														<td colSpan="2" style=${{ textAlign: 'right', fontWeight: 'bold', color: '#334155', borderRight: 'none', borderLeft: 'none', borderBottom: '2px solid #e2e8f0', paddingTop: '1rem' }}>
															${group.label}
														</td>
													</tr>
													${Object.entries(group.caps).map(([capKey, capLabel]) => html`
														<tr key=${capKey}>
															<td style=${{ textAlign: 'right', verticalAlign: 'middle', borderRight: 'none', borderLeft: 'none' }}>
																<strong className="is-size-6 has-text-dark">${capLabel}</strong>
																<div className="is-size-7 has-text-grey mt-1" style=${{ fontFamily: 'monospace' }}>${capKey}</div>
															</td>
															<td style=${{ textAlign: 'center', verticalAlign: 'middle', borderRight: 'none', borderLeft: 'none' }}>
																<label className="checkbox" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
																	<input 
																		type="checkbox" 
																		checked=${activeRoleObj.capabilities[capKey] || false} 
																		onChange=${() => handleCapToggle(activeRoleObj.name, capKey)}
																		style=${{ transform: 'scale(1.2)', cursor: 'pointer' }}
																	/>
																</label>
															</td>
														</tr>
													`)}
												`);
											})()}
										</tbody>
									</table>
								</div>
							</div>
						`}
					</div>
				` : null}
				
				${activeTab === 'role_management' ? html`
					<div className="wp-card p-4 mb-4">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">الأسماء المخصصة للأدوار (Aliases)</h3>
								<p className="has-text-grey is-size-7">قم بتخصيص المسميات الظاهرية للأدوار الأساسية في ووردبريس لتناسب طبيعة ومصطلحات عمل مؤسستك.</p>
							</div>
							<button 
								className="button wp-btn is-primary"
								onClick=${saveAliases}
								disabled=${isRolesLoading}
							>
								${isRolesLoading ? 'جاري الحفظ...' : 'حفظ الأسماء المخصصة'}
							</button>
						</div>
						
						${!rolesData ? html`
							<div className="has-text-centered py-6">
								<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
							</div>
						` : html`
							<table className="table is-fullwidth is-bordered is-hoverable mb-0" style=${{ borderColor: '#e2e8f0' }}>
								<thead style=${{ backgroundColor: '#f8fafc' }}>
									<tr>
										<th style=${{ width: '25%', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>الدور في ووردبريس</th>
										<th style=${{ width: '20%', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>المعرف البرمجي (Slug)</th>
										<th style=${{ width: '40%', textAlign: 'right', borderBottom: '2px solid #cbd5e1' }}>المسمى المعروض في مساحة العمل (Alias)</th>
										<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #cbd5e1' }}>النوع</th>
									</tr>
								</thead>
								<tbody>
									${rolesData.roles.map(role => html`
										<tr key=${role.name}>
											<td className="is-vcentered has-text-weight-bold" style=${{ textAlign: 'right' }}>
												<span className="has-text-dark">${role.display_name}</span>
											</td>
											<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: 'right', fontFamily: 'monospace' }}>
												<span className="tag is-family-monospace is-light is-small">${role.name}</span>
											</td>
											<td className="is-vcentered" style=${{ textAlign: 'right' }}>
												<input 
													type="text" 
													className="input wp-input is-small" 
													value=${aliasesUpdates[role.name] !== undefined ? aliasesUpdates[role.name] : (role.alias !== role.display_name ? role.alias : '')}
													onChange=${(e) => setAliasesUpdates(prev => ({ ...prev, [role.name]: e.target.value }))}
													placeholder=${role.display_name}
												/>
											</td>
											<td className="is-vcentered has-text-centered" style=${{ textAlign: 'center' }}>
												${role.is_custom ? html`
													<div className="is-flex is-align-items-center is-justify-content-center" style=${{ gap: '6px' }}>
														<span className="tag is-info is-light is-small">مخصص</span>
														<button 
															className="button is-small is-danger is-outlined wp-sharp-button" 
															onClick=${() => handleDeleteCustomRole(role.name)}
															title="حذف هذا الدور"
														>
															<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
														</button>
													</div>
												` : html`
													<span className="tag is-dark is-light is-small" title="دور نظامي أصيل في ووردبريس">
														<i className="dashicons dashicons-lock ml-1 is-size-7"></i>
														نظامي
													</span>
												`}
											</td>
										</tr>
									`)}
								</tbody>
							</table>
						`}
					</div>

					<div className="wp-card p-4">
						<h3 className="title is-5 mb-1 has-text-weight-bold">إضافة دور جديد مخصص</h3>
						<p className="has-text-grey is-size-7 mb-4">قم بإنشاء أدوار جديدة واستنساخ صلاحياتها من أدوار موجودة مسبقاً.</p>
						<form onSubmit=${handleCreateCustomRole}>
							<div className="columns">
								<div className="column is-4">
									<div className="field">
										<label className="label is-size-7">معرّف الدور (إنجليزي فقط)</label>
										<div className="control">
											<input 
												type="text" 
												className="input wp-input" 
												value=${newRole.id}
												onChange=${(e) => setNewRole(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
												placeholder="مثال: project_manager"
												required
											/>
										</div>
									</div>
								</div>
								<div className="column is-4">
									<div className="field">
										<label className="label is-size-7">الاسم الظاهر للدور</label>
										<div className="control">
											<input 
												type="text" 
												className="input wp-input" 
												value=${newRole.display_name}
												onChange=${(e) => setNewRole(prev => ({ ...prev, display_name: e.target.value }))}
												placeholder="مثال: مدير مشاريع تقنية"
												required
											/>
										</div>
									</div>
								</div>
								<div className="column is-4">
									<div className="field">
										<label className="label is-size-7">استنساخ الصلاحيات من</label>
										<div className="control">
											<div className="select is-fullwidth wp-input">
												<select 
													value=${newRole.clone_from}
													onChange=${(e) => setNewRole(prev => ({ ...prev, clone_from: e.target.value }))}
												>
													${rolesData ? rolesData.roles.map(role => html`
														<option key=${role.name} value=${role.name}>${role.alias || role.display_name} (${role.name})</option>
													`) : null}
												</select>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="control mt-2">
								<button type="submit" className="button wp-btn is-dark" disabled=${isRolesLoading}>
									إضافة الدور الجديد
								</button>
							</div>
						</form>
					</div>
				` : null}
				${activeTab === 'contribution_types' ? html`
					<div className="wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">إدارة أنواع المساهمات (Contribution Types)</h3>
								<p className="has-text-grey is-size-7">خصص أنواع وتسميات المساهمات لتناسب طبيعة عمل مؤسستك وفق المبدأ 19 (حيادية النواة وتعدد المجالات).</p>
							</div>
							<button 
								className="button wp-btn is-primary"
								disabled=${isTypesLoading}
								onClick=${handleSaveContributionTypes}
							>
								${isTypesLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
							</button>
						</div>

						${isTypesLoading && contributionTypes.length === 0 ? html`
							<div className="has-text-centered py-6">
								<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
							</div>
						` : html`
							<div className="table-container mb-5">
								<table className="table is-fullwidth is-hoverable wp-table">
									<thead>
										<tr>
											<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>الأيقونة (Dashicon)</th>
											<th style=${{ width: '25%', textAlign: 'right', borderBottom: '2px solid #0f172a' }}>المعرّف (Slug)</th>
											<th style=${{ width: '30%', textAlign: 'right', borderBottom: '2px solid #0f172a' }}>التسمية بالعربية</th>
											<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>النوع</th>
											<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>إجراءات</th>
										</tr>
									</thead>
									<tbody>
										${contributionTypes.map((typeItem, index) => html`
											<tr key=${typeItem.key}>
												<td className="is-vcentered has-text-centered">
													<span className="icon is-medium has-text-primary" title=${typeItem.icon || 'dashicons-admin-comments'}>
														<i className=${'dashicons ' + (typeItem.icon || 'dashicons-admin-comments')} style=${{ fontSize: '22px' }}></i>
													</span>
												</td>
												<td className="is-vcentered has-text-right">
													<span className="tag is-family-monospace is-light is-small">${typeItem.key}</span>
												</td>
												<td className="is-vcentered has-text-right">
													<input 
														type="text" 
														className="input is-small" 
														value=${typeItem.label} 
														style=${{ borderRadius: 0 }}
														onChange=${(e) => {
															const updated = [...contributionTypes];
															updated[index].label = e.target.value;
															setContributionTypes(updated);
														}}
													/>
												</td>
												<td className="is-vcentered has-text-centered">
													${typeItem.is_system ? html`
														<span className="tag is-warning is-light is-small" style=${{ borderRadius: 0 }}>نظام محمي</span>
													` : html`
														<span className="tag is-info is-light is-small" style=${{ borderRadius: 0 }}>مخصص</span>
													`}
												</td>
												<td className="is-vcentered has-text-centered">
													${!typeItem.is_system ? html`
														<button 
															className="button is-small is-danger is-outlined wp-sharp-button"
															onClick=${() => handleDeleteCustomType(typeItem.key)}
															title="حذف هذا النوع"
														>
															<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
														</button>
													` : html`
														<span className="icon is-small has-text-grey-light" title="لا يمكن حذف أنواع النظام"><i className="dashicons dashicons-lock"></i></span>
													`}
												</td>
											</tr>
										`)}
									</tbody>
								</table>
							</div>

							<!-- إنشاء نوع مساهمة جديد -->
							<div className="box p-4" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
								<h4 className="title is-6 mb-3 has-text-weight-bold">إضافة نوع مساهمة جديد مخصص</h4>
								<form onSubmit=${handleAddCustomType}>
									<div className="columns is-variable is-2 is-vcentered">
										<div className="column is-3">
											<label className="label is-size-7">الأيقونة (Dashicon):</label>
											<div className="select is-small is-fullwidth">
												<select 
													value=${newType.icon} 
													onChange=${(e) => setNewType({ ...newType, icon: e.target.value })}
													style=${{ borderRadius: 0 }}
												>
													<option value="dashicons-admin-comments">تعليقات (Comments)</option>
													<option value="dashicons-hammer">تنفيذ فني (Hammer)</option>
													<option value="dashicons-star-filled">نجمة حل (Star)</option>
													<option value="dashicons-search">تدقيق ومراجعة (Search)</option>
													<option value="dashicons-yes-alt">قرار وتوجيه (Check)</option>
													<option value="dashicons-format-aside">مذكرة جانبية (Aside)</option>
													<option value="dashicons-tag">تصنيف (Tag)</option>
													<option value="dashicons-portfolio">حقيبة (Portfolio)</option>
												</select>
											</div>
										</div>
										<div className="column is-4">
											<label className="label is-size-7">المعرّف بالإنجليزية (Slug):</label>
											<input 
												type="text" 
												className="input is-small" 
												placeholder="مثال: legal_brief أو marketing_post" 
												value=${newType.key} 
												onChange=${(e) => setNewType({ ...newType, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
												style=${{ borderRadius: 0, fontFamily: 'monospace' }}
												required
											/>
										</div>
										<div className="column is-3">
											<label className="label is-size-7">التسمية بالعربية (Label):</label>
											<input 
												type="text" 
												className="input is-small" 
												placeholder="مثال: صياغة مذكرة قانونية" 
												value=${newType.label} 
												onChange=${(e) => setNewType({ ...newType, label: e.target.value })}
												style=${{ borderRadius: 0 }}
												required
											/>
										</div>
										<div className="column is-2 is-flex is-align-items-flex-end">
											<button 
												type="submit" 
												className="button is-small wp-btn is-dark is-fullwidth mt-4"
												disabled=${isTypesLoading}
											>
												إضافة النوع
											</button>
										</div>
									</div>
								</form>
							</div>
						`}
					</div>
				` : null}
				${activeTab === 'members' ? html`
					<div className="wp-card p-4">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-2" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">دليل أعضاء الفريق والمنفذين (Specialists & Staff Directory)</h3>
								<p className="has-text-grey is-size-7">إدارة الكوادر والمشرفين الفنيين المكلفين بإنجاز المهام والمشاريع داخل غرفة عمليات CoWorkPress.</p>
							</div>
						</div>

						${isLoading ? html`
							<div className="has-text-centered py-6">
								<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
							</div>
						` : html`
							${(() => {
								const teamUsers = users.filter(isStaffUser);
								if (teamUsers.length === 0) {
									return html`
										<div className="has-text-centered py-6 has-text-grey">
											<span className="is-size-3"></span>
											<p className="mt-2">لا يوجد أعضاء فريق مسجلون حالياً في هذه الصفحة.</p>
										</div>
									`;
								}
								return html`
									<table className="table is-fullwidth is-hoverable wp-table mb-0">
										<thead>
											<tr>
 												<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>العضو / المنفذ</th>
 												<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>البريد الإلكتروني</th>
 												<th style=${{ textAlign: 'right', width: '30%', borderBottom: '2px solid #0f172a' }}>الصلاحية (الدور)</th>
											</tr>
										</thead>
										<tbody>
											${teamUsers.map(u => {
												const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : 'author';
												return html`
													<tr key=${u.id}>
														<td className="is-vcentered" style=${{ textAlign: 'right' }}>
															<div className="is-flex is-align-items-center">
																<figure className="image is-24x24 mr-2" style=${{ marginLeft: '8px' }}>
																	<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: 0 }} />
																</figure>
																<span className="has-text-weight-bold is-size-7">${u.name}</span>
															</div>
														</td>
														<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: 'right' }}>
															${u.email || '-'}
														</td>
														<td className="is-vcentered" style=${{ textAlign: 'right' }}>
															<${RoleDropdown} 
																currentRole=${currentRole} 
																onRoleChange=${(newRole) => handleRoleChange(u.id, newRole)}
																roleLabels=${dynamicRoleLabels}
															/>
														</td>
													</tr>
												`;
											})}
										</tbody>
									</table>
								`;
							})()}

							<!-- أزرار الترقيم Pagination Controls -->
							<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
								<span className="is-size-7 has-text-grey font-weight-bold">
									الصفحة ${page} من ${totalPages}
								</span>
								<div className="buttons mb-0">
									<button 
										className="button is-small wp-header-btn" 
										onClick=${() => setPage(p => Math.max(1, p - 1))}
										disabled=${page <= 1}
										style=${{ borderRadius: 0 }}
									>
										السابق
									</button>
									<button 
										className="button is-small wp-header-btn" 
										onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
										disabled=${page >= totalPages}
										style=${{ borderRadius: 0 }}
									>
										التالي
									</button>
								</div>
							</div>
						`}
					</div>
				` : null}

				${activeTab === 'clients' ? html`
					<div className="wp-card p-4">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">سجل المستفيدين وأصحاب الطلبات (Stakeholders & Subscribers Directory)</h3>
								<p className="has-text-grey is-size-7">إدارة حسابات المستفيدين الموسومين وأعضاء الموقع العاديين. يمكن ترقية أي مشترك عادي ليصبح مشتركاً مستفيداً يملك صلاحية البوابة.</p>
							</div>
							<div className="buttons mb-0">
								<a href="#/requests" className="button is-small wp-header-btn is-primary">
									<span>استوديو فرز الطلبات ↗</span>
								</a>
							</div>
						</div>

						<!-- شريط الفرز والتقسيم السريع -->
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 p-2" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
							<div className="buttons has-addons mb-0">
								<button 
									className=${`button is-small ${clientSubFilter === 'all' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
									onClick=${() => setClientSubFilter('all')}
									style=${{ borderRadius: 0 }}
								>
									الكل (${users.length})
								</button>
								<button 
									className=${`button is-small ${clientSubFilter === 'stakeholders' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
									onClick=${() => setClientSubFilter('stakeholders')}
									style=${{ borderRadius: 0 }}
								>
									 المستفيدون (${users.filter(isStakeholderUser).length})
								</button>
								<button 
									className=${`button is-small ${clientSubFilter === 'subscribers' ? 'is-dark is-selected has-text-weight-bold' : 'is-white'}`}
									onClick=${() => setClientSubFilter('subscribers')}
									style=${{ borderRadius: 0 }}
								>
									 المشتركون (${users.filter(isStandardSubscriber).length})
								</button>
							</div>
							<span className="is-size-7 has-text-grey">
								إجمالي المسجلين في هذه الصفحة: <strong>${users.length}</strong>
							</span>
						</div>

						${isLoading ? html`
							<div className="has-text-centered py-6">
								<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
							</div>
						` : html`
							${(() => {
								const displayedUsers = users.filter(u => {
									const isStakeholder = isStakeholderUser(u);
									const isSub = isStandardSubscriber(u);
									if (clientSubFilter === 'stakeholders') return isStakeholder;
									if (clientSubFilter === 'subscribers') return isSub;
									return isStakeholder || isSub;
								});

								if (displayedUsers.length === 0) {
									return html`
										<div className="has-text-centered py-6 has-text-grey">
											<span className="is-size-2">${clientSubFilter === 'stakeholders' ? '' : ''}</span>
											<p className="has-text-weight-bold mt-2">
												${clientSubFilter === 'stakeholders' 
													? 'لا يوجد مستفيدون معتمدون حالياً في هذه الصفحة.' 
													: 'لا يوجد أعضاء مطابقون في هذه الصفحة.'}
											</p>
											<p className="is-size-7 mt-1">
												${clientSubFilter === 'stakeholders' 
													? 'يمكنك ترقية أي عضو مشترك إلى مستفيد باستخدام زر «تعيين كمستفيد » من تبويب (المشتركون).' 
													: 'يتم إضافة الأعضاء تلقائياً عند تسجيلهم في ووردبريس أو تقديم طلبات جديدة.'}
											</p>
										</div>
									`;
								}
								return html`
									<table className="table is-fullwidth is-hoverable wp-table mb-0">
										<thead>
											<tr>
												<th style=${{ textAlign: 'right', width: '35%', borderBottom: '2px solid #0f172a' }}>العضو / المستفيد</th>
												<th style=${{ textAlign: 'right', width: '25%', borderBottom: '2px solid #0f172a' }}>البريد الإلكتروني</th>
												<th style=${{ textAlign: 'right', width: '22%', borderBottom: '2px solid #0f172a' }}>الصلاحية (الدور)</th>
												<th style=${{ textAlign: 'center', width: '18%', borderBottom: '2px solid #0f172a' }}>الإجراء والوصول</th>
											</tr>
										</thead>
										<tbody>
											${displayedUsers.map(u => {
												const isStakeholder = isStakeholderUser(u);
												const currentRole = (u.roles && u.roles.length > 0) ? u.roles[0] : (isStakeholder ? 'workpress_client' : 'subscriber');
												return html`
													<tr key=${u.id}>
														<td className="is-vcentered" style=${{ textAlign: 'right' }}>
															<div className="is-flex is-align-items-center">
																<figure className="image is-28x28 mr-2" style=${{ marginLeft: '8px' }}>
																	<img src=${u.avatar_urls && u.avatar_urls['48'] ? u.avatar_urls['48'] : ''} alt=${u.name} style=${{ borderRadius: '50%' }} />
																</figure>
																<div>
																	<span className="has-text-weight-bold is-size-7">${u.name}</span>
																	${isStakeholder ? html`
																		<span className="tag is-success is-light is-small ml-2" style=${{ fontSize: '0.68rem', fontWeight: 'bold' }}>
																			 مستفيد
																		</span>
																	` : html`
																		<span className="tag is-light is-small ml-2" style=${{ fontSize: '0.68rem', color: '#64748b' }}>
																			 مشترك
																		</span>
																	`}
																</div>
															</div>
														</td>
														<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: 'right' }}>
															${u.email || '-'}
														</td>
														<td className="is-vcentered" style=${{ textAlign: 'right' }}>
															<${RoleDropdown} 
																currentRole=${currentRole} 
																onRoleChange=${(newRole) => handleRoleChange(u.id, newRole)}
																roleLabels=${dynamicRoleLabels}
															/>
														</td>
														<td className="is-vcentered has-text-centered">
															${isStakeholder ? html`
																<a href="#/requests" className="button is-small is-light wp-sharp-button" style=${{ fontSize: '0.75rem' }} title="استعراض وارد الطلبات">
																	<span>وارد الطلبات ↗</span>
																</a>
															` : html`
																<button 
																	className="button is-small is-primary is-light wp-sharp-button" 
																	style=${{ fontSize: '0.75rem', fontWeight: 'bold' }} 
																	onClick=${() => handleRoleChange(u.id, 'workpress_client')}
																	title="ترقية العضو إلى مستفيد لتمكينه من دخول البوابة وطلب مشاريع"
																>
																	<span>تعيين كمستفيد </span>
																</button>
															`}
														</td>
													</tr>
												`;
											})}
										</tbody>
									</table>
								`;
							})()}

							<!-- أزرار الترقيم Pagination Controls -->
							<div className="is-flex is-justify-content-space-between is-align-items-center mt-4 pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
								<span className="is-size-7 has-text-grey font-weight-bold">
									الصفحة ${page} من ${totalPages}
								</span>
								<div className="buttons mb-0">
									<button 
										className="button is-small wp-header-btn" 
										onClick=${() => setPage(p => Math.max(1, p - 1))}
										disabled=${page <= 1}
										style=${{ borderRadius: 0 }}
									>
										السابق
									</button>
									<button 
										className="button is-small wp-header-btn" 
										onClick=${() => setPage(p => Math.min(totalPages, p + 1))}
										disabled=${page >= totalPages}
										style=${{ borderRadius: 0 }}
									>
										التالي
									</button>
								</div>
							</div>
						`}
					</div>
				` : null}

				${activeTab === 'localization_time' ? html`
					<div className="wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">الوقت والمنطقة الزمنية واللغة</h3>
								<p className="has-text-grey is-size-7">إدارة توقيت بيئة العمل، تسمية الشهور المغاربية/المشرقية، وفرض الأرقام المعيارية عالمياً.</p>
							</div>
							<button 
								className="button wp-btn is-primary"
								disabled=${isSettingsSaving}
								onClick=${handleSaveLocalizationSettings}
							>
								${isSettingsSaving ? 'جاري الحفظ...' : 'حفظ إعدادات الوقت'}
							</button>
						</div>

						<div className="columns is-variable is-5">
							<div className="column is-7">
								<!-- اختيار المنطقة الزمنية -->
								<div className="field mb-5">
									<label className="label is-small">المنطقة الزمنية للمنظومة (Timezone)</label>
									<div className="control">
										<div className="select is-fullwidth wp-input">
											<select 
												value=${timezone} 
												onChange=${(e) => setTimezone(e.target.value)}
												style=${{ borderRadius: 0 }}
											>
												<optgroup label="المنطقة المغاربية والشمال أفريقي">
													<option value="Africa/Algiers">الجزائر (GMT+1) - Africa/Algiers</option>
													<option value="Africa/Casablanca">المغرب / الدار البيضاء (GMT+1) - Africa/Casablanca</option>
													<option value="Africa/Tunis">تونس (GMT+1) - Africa/Tunis</option>
													<option value="Africa/Tripoli">ليبيا / طرابلس (GMT+2) - Africa/Tripoli</option>
													<option value="Africa/Cairo">مصر / القاهرة (GMT+2) - Africa/Cairo</option>
												</optgroup>
												<optgroup label="الخليج العربي والشرق الأوسط">
													<option value="Asia/Riyadh">السعودية / الرياض (GMT+3) - Asia/Riyadh</option>
													<option value="Asia/Dubai">الإمارات / دبي (GMT+4) - Asia/Dubai</option>
													<option value="Asia/Kuwait">الكويت (GMT+3) - Asia/Kuwait</option>
													<option value="Asia/Qatar">قطر (GMT+3) - Asia/Qatar</option>
													<option value="Asia/Muscat">عُمان / مسقط (GMT+4) - Asia/Muscat</option>
													<option value="Asia/Baghdad">العراق / بغداد (GMT+3) - Asia/Baghdad</option>
													<option value="Asia/Amman">الأردن / عمّان (GMT+3) - Asia/Amman</option>
													<option value="Asia/Beirut">لبنان / بيروت (GMT+2) - Asia/Beirut</option>
													<option value="Asia/Jerusalem">فلسطين / القدس (GMT+2) - Asia/Jerusalem</option>
												</optgroup>
												<optgroup label="نطاقات دولية">
													<option value="Europe/Paris">أوروبا / باريس (GMT+1) - Europe/Paris</option>
													<option value="Europe/London">بريطانيا / لندن (GMT+0) - Europe/London</option>
													<option value="UTC">التوقيت العالمي المنسق (UTC) - UTC</option>
												</optgroup>
											</select>
										</div>
									</div>
									<p className="help has-text-grey is-size-7">تُحسب كافة سجلات التعديل وخيوط الزمن والمساهمات بناءً على هذا النطاق الزمني.</p>
								</div>

								<!-- نظام تسمية الشهور -->
								<div className="field mb-5">
									<label className="label is-small">نظام تسمية الشهور (Month Naming System)</label>
									<div className="control">
										<div className="select is-fullwidth wp-input">
											<select 
												value=${monthNaming} 
												onChange=${(e) => setMonthNaming(e.target.value)}
												style=${{ borderRadius: 0 }}
											>
												<option value="maghrebi">الشهور المغاربية الرسمية (جانفي، فيفري، مارس، أفريل، ماي، جوان، جويلية، أوت، سبتمبر، أكتوبر، نوفمبر، ديسمبر) - موصى به</option>
												<option value="mashriqi">الشهور المشرقية (يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر)</option>
												<option value="syriac">الشهور السريانية والشامية (كانون الثاني، شباط، آذار، نيسان، أيار، حزيران، تموز، آب، أيلول، تشرين الأول، تشرين الثاني، كانون الأول)</option>
											</select>
										</div>
									</div>
								</div>

								<!-- صيغة عرض التاريخ القياسي -->
								<div className="field mb-5">
									<label className="label is-small">صيغة عرض التاريخ التقويمي (Date Format)</label>
									<div className="control">
										<div className="select is-fullwidth wp-input">
											<select 
												value=${dateFormat} 
												onChange=${(e) => setDateFormat(e.target.value)}
												style=${{ borderRadius: 0 }}
											>
												<option value="D MMMM YYYY">اليوم واسم الشهر والسنة (مثال: 18 أوت 2026)</option>
												<option value="DD/MM/YYYY">أرقام قياسية مفصولة بشرطة مائلة (مثال: 18/08/2026)</option>
												<option value="YYYY-MM-DD">التاريخ الدولي القياسي (مثال: 2026-08-18)</option>
											</select>
										</div>
									</div>
								</div>

								<!-- التوقيت النسبي الذكي -->
								<div className="field mb-4">
									<label className="checkbox is-size-7 has-text-weight-bold">
										<input 
											type="checkbox" 
											checked=${relativeTime} 
											onChange=${(e) => setRelativeTime(e.target.checked)}
											style=${{ marginLeft: '8px' }}
										/>
										تفعيل التوقيت النسبي الذكي (مثل: "الآن"، "منذ 5 دقائق"، "منذ ساعتين"، "أمس") في خيوط الزمن والإشعارات
									</label>
								</div>
							</div>

							<!-- عمود المعاينة الحية الفورية -->
							<div className="column is-5">
								<div className="box p-4" style=${{ backgroundColor: '#f8fafc', border: '2px solid #0f172a', borderRadius: 0 }}>
									<div className="is-flex is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #cbd5e1' }}>
										<span className="icon has-text-primary mr-2" style=${{ marginLeft: '6px' }}><i className="dashicons dashicons-visibility"></i></span>
										<h4 className="title is-6 mb-0 has-text-weight-bold">معاينة حية ومباشرة (Live Preview)</h4>
									</div>

									<div className="mb-3">
										<p className="heading has-text-grey is-size-7 mb-1">تاريخ اليوم والشهور:</p>
										<p className="has-text-weight-bold is-size-6 has-text-primary">
											${formatDate(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
										</p>
									</div>

									<div className="mb-3">
										<p className="heading has-text-grey is-size-7 mb-1">التاريخ والوقت الكامل:</p>
										<p className="is-size-7 has-text-dark font-weight-bold">
											${formatDateTime(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
										</p>
									</div>

									<div className="mb-3">
										<p className="heading has-text-grey is-size-7 mb-1">عينة من التوقيت النسبي (في المساهمات):</p>
										<div className="tags are-small mb-0">
											<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>الآن</span>
											<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>منذ 15 دقيقة</span>
											<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>منذ 3 ساعات</span>
										</div>
									</div>

									<div className="mb-2">
										<p className="heading has-text-grey is-size-7 mb-1">الأرقام القياسية والنسب المئوية:</p>
										<p className="is-size-7 has-text-dark">
											<span>تم إنجاز <strong>${formatNumber(1250)}</strong> مساهمة بنسبة نجاح <strong>${formatPercent(88)}</strong></span>
										</p>
									</div>

									<div className="mt-3 p-2 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
										<p className="is-size-7 has-text-grey" style=${{ fontSize: '0.72rem', lineHeight: '1.4' }}>
											<i className="dashicons dashicons-yes-alt has-text-success ml-1"></i>
											يتم فرض الأرقام العالمية (1, 2, 3...) تلقائياً ومنع الأرقام المشرقية/الهندية لضمان بيئة عمل احترافية.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				` : null}

				${activeTab === 'sound_effects' ? html`
					<div className="wp-card p-5 mb-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 is-flex is-align-items-center" style=${{ gap: '8px' }}>
									<span className="icon has-text-primary"><i className="dashicons dashicons-format-audio"></i></span>
									<span>الأصوات والتأثيرات التفاعلية (SND Sound Engine)</span>
								</h3>
								<p className="is-size-7 has-text-grey">
									إدارة وتخصيص المؤثرات الصوتية لكافة العمليات التفاعلية، إشعارات العملاء، وإغلاق المهام مع تحكم كامل بتفعيل وتعطيل كل حدث على حدة.
								</p>
							</div>
							<div className="field mb-0">
								<button 
									className=${`button ${ soundEnabled ? 'is-success' : 'is-dark is-outlined' } wp-sharp-button is-flex is-align-items-center`}
									onClick=${() => {
										const next = !soundEnabled;
										setSoundEnabled(next);
										sound.setEnabled(next);
										if (next) sound.play('button');
									}}
								>
									<span className="icon"><i className=${`dashicons ${ soundEnabled ? 'dashicons-controls-volumeon' : 'dashicons-controls-volumeoff' }`}></i></span>
									<span>${ soundEnabled ? 'الأصوات العامة مفعلة' : 'الأصوات العامة مكتومة' }</span>
								</button>
							</div>
						</div>

						<!-- Volume Slider & Active Kit Selection -->
						<div className="columns is-multiline mb-4">
							<div className="column is-6">
								<div className="field">
									<label className="label is-size-7 is-flex is-justify-content-space-between">
										<span>مستوى الصوت العام (Master Volume):</span>
										<strong className="has-text-primary">${ Math.round(soundVolume * 100) }%</strong>
									</label>
									<div className="control is-flex is-align-items-center" style=${{ gap: '10px' }}>
										<span className="icon is-small has-text-grey"><i className="dashicons dashicons-controls-volumeoff"></i></span>
										<input 
											type="range" 
											min="0" 
											max="1" 
											step="0.05" 
											value=${soundVolume} 
											onInput=${(e) => {
												const v = parseFloat(e.target.value);
												setSoundVolume(v);
												sound.setVolume(v);
											}}
											style=${{ flexGrow: 1, accentColor: '#6366f1', cursor: 'pointer' }}
										/>
										<span className="icon is-small has-text-primary"><i className="dashicons dashicons-controls-volumeon"></i></span>
									</div>
								</div>
							</div>

							<div className="column is-6">
								<div className="field">
									<label className="label is-size-7">حزمة النغمات الأساسية (Sound Theme Kit):</label>
									<div className="control">
										<div className="select is-fullwidth" style=${{ borderRadius: 0 }}>
											<select 
												value=${soundKit} 
												onChange=${(e) => {
													const newKit = e.target.value;
													setSoundKit(newKit);
													sound.setKit(newKit);
													sound.preview('button', newKit);
												}}
												style=${{ borderRadius: 0, fontWeight: '600' }}
											>
												<option value="01">SND01 — Sine (الموجة العصرية النقية — Modern SaaS)</option>
												<option value="02">SND02 — Piano (بيانو شتاينواي الفاخر — Acoustic Grand)</option>
												<option value="03">SND03 — Industrial (الميكانيكية الملموسة — Tactile ASMR)</option>
											</select>
										</div>
									</div>
									<p className="help is-size-7 has-text-grey mt-1">
										${ soundKit === '01' ? 'نغمات إلكترونية فائقة النقاء والخفة تناسب بيئات العمل السريعة.' : ( soundKit === '02' ? 'نغمات مسجلة على بيانو كلاسيكي تمنح شعوراً بالدفء والفخامة.' : 'أصوات تكتكة ميكانيكية حية تمنح شعوراً ملموساً بكل نقرة.' ) }
									</p>
								</div>
							</div>
						</div>

						<!-- Granular Sound Events Matrix -->
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
							<h4 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center" style=${{ gap: '6px' }}>
								<i className="dashicons dashicons-list-view has-text-info"></i>
								<span>مصفوفة أماكن وأصوات النظام التفاعلية:</span>
							</h4>
							<span className="is-size-7 has-text-grey">يمكنك تفعيل أو تعطيل وتغيير صوت أي حدث تفاعلي بشكل مستقل</span>
						</div>

						<div className="table-container mb-4">
							<table className="table is-fullwidth is-hoverable is-striped" style=${{ border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
								<thead>
									<tr style=${{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
										<th style=${{ width: '7%', textAlign: 'center' }}>الحالة</th>
										<th style=${{ width: '25%' }}>الحدث التفاعلي</th>
										<th style=${{ width: '36%' }}>موضع وقوع الصوت في النظام</th>
										<th style=${{ width: '22%' }}>النغمة المخصصة</th>
										<th style=${{ width: '10%', textAlign: 'center' }}>معاينة</th>
									</tr>
								</thead>
								<tbody>
									${SOUND_EVENTS.map(ev => {
										const conf = eventsConfig[ev.key] || { enabled: ev.defaultEnabled, sound: ev.defaultSound };
										return html`
											<tr key=${ev.key} style=${{ opacity: conf.enabled ? 1 : 0.55, transition: 'opacity 0.2s ease' }}>
												<td className="has-text-centered" style=${{ verticalAlign: 'middle' }}>
													<button 
														className=${`button is-small ${ conf.enabled ? 'is-success' : 'is-light has-text-grey' } wp-sharp-button`}
														onClick=${() => handleEventToggle(ev.key)}
														title=${conf.enabled ? 'تعطيل هذا الصوت' : 'تفعيل هذا الصوت'}
														style=${{ padding: '2px 8px', height: '26px' }}
													>
														<span className="icon is-small">
															<i className=${`dashicons ${ conf.enabled ? 'dashicons-yes' : 'dashicons-no' }`}></i>
														</span>
													</button>
												</td>
												<td style=${{ verticalAlign: 'middle' }}>
													<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
														<span className="icon is-small has-text-primary"><i className=${`dashicons ${ev.icon}`}></i></span>
														<strong className="has-text-dark">${ev.label}</strong>
													</div>
												</td>
												<td style=${{ verticalAlign: 'middle' }}>
													<span className="tag is-light is-info" style=${{ borderRadius: 0, fontSize: '0.75rem', whiteSpace: 'normal', textAlign: 'right', display: 'inline-block', lineHeight: '1.4' }}>
														${ev.location}
													</span>
												</td>
												<td style=${{ verticalAlign: 'middle' }}>
													<div className="select is-small is-fullwidth" style=${{ borderRadius: 0 }}>
														<select 
															value=${conf.sound} 
															onChange=${e => handleEventSoundChange(ev.key, e.target.value)} 
															disabled=${!conf.enabled}
															style=${{ borderRadius: 0, fontWeight: '600' }}
														>
															${AVAILABLE_SOUNDS.map(s => html`
																<option key=${s.value} value=${s.value}>${s.label}</option>
															`)}
														</select>
													</div>
												</td>
												<td className="has-text-centered" style=${{ verticalAlign: 'middle' }}>
													<button 
														className="button is-small is-primary is-outlined wp-sharp-button"
														onClick=${() => sound.preview(conf.sound || ev.defaultSound, soundKit)}
														title="استماع للنغمة"
														style=${{ padding: '2px 10px', height: '26px' }}
													>
														<span className="icon is-small"><i className="dashicons dashicons-controls-play"></i></span>
														<span>استماع</span>
													</button>
												</td>
											</tr>
										`;
									})}
								</tbody>
							</table>
						</div>

						<div className="is-flex is-justify-content-space-between is-align-items-center pt-3" style=${{ borderTop: '1px solid #ededed' }}>
							<p className="is-size-7 has-text-grey">
								<i className="dashicons dashicons-saved ml-1 has-text-success"></i>
								المؤثرات الصوتية تعمل تلقائياً مع كافة الأجهزة والمتصفحات الحديثة دون أي تنزيلات إضافية.
							</p>
							<button 
								className=${`button is-primary wp-sharp-button ${ isSettingsSaving ? 'is-loading' : '' }`}
								onClick=${handleSaveSoundSettings}
								disabled=${isSettingsSaving}
							>
								<span className="icon"><i className="dashicons dashicons-saved"></i></span>
								<span>حفظ إعدادات وتخصيصات الأصوات </span>
							</button>
						</div>
					</div>
				` : null}

				${activeTab === 'general' ? html`
					<div className="wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">إعدادات النظام العامة</h3>
								<p className="has-text-grey is-size-7">ضبط وتخصيص بيئة العمل العامة وسلوك النظام.</p>
							</div>
							<button 
								className="button wp-btn is-primary"
								disabled=${isSettingsSaving}
								onClick=${handleSaveGeneralSettings}
							>
								${isSettingsSaving ? 'جاري الحفظ...' : 'حفظ إعدادات النظام'}
							</button>
						</div>

						<div className="field mb-4">
							<label className="label is-small">اسم بيئة العمل (Workspace Name)</label>
							<div className="control">
								<input 
									className="input is-small" 
									type="text" 
									value=${siteName} 
									onInput=${(e) => setSiteName(e.target.value)}
									style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
								/>
							</div>
						</div>

						<div className="field mb-4">
							<label className="label is-small">الأولوية الافتراضية للمهام الجديدة</label>
							<div className="control">
								<div className="select is-small is-fullwidth">
									<select 
										value=${defaultPriority} 
										onChange=${(e) => setDefaultPriority(e.target.value)}
										style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
									>
										<option value="low">منخفضة</option>
										<option value="medium">متوسطة</option>
										<option value="high">عالية</option>
									</select>
								</div>
							</div>
						</div>
					</div>
				` : null}

				${activeTab === 'notifications' ? html`
					<div className="wp-card p-5 mb-5">
						<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>إعدادات الإشعارات والتنبيهات</h3>
						
						<div className="field mb-5">
							<label className="checkbox is-size-7 has-text-weight-bold">
								<input 
									type="checkbox" 
									checked=${emailNotifs} 
									onChange=${(e) => setEmailNotifs(e.target.checked)}
									style=${{ marginLeft: '8px' }}
								/>
								إرسال إشعارات البريد الإلكتروني عند تعيين مهمة جديدة
							</label>
						</div>

						<div className="notification is-light p-4 mb-4" style=${{ border: '1px solid #6366f1', backgroundColor: '#f5f3ff', borderRadius: 0 }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center">
								<div>
									<h4 className="title is-6 mb-1 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
										<span></span>
										<span>المؤثرات والنغمات الصوتية التفاعلية (UI Sounds & Audio Cues)</span>
									</h4>
									<p className="is-size-7 has-text-grey">
										تم دمج مكتبة الأصوات SND محلياً بالكامل؛ يمكنك تخصيص نغمة كل إشعار، اعتماد حل، استفسار عميل، أو تعطيل/تفعيل أي حدث على حدة مع تحديد موضعه في النظام.
									</p>
								</div>
								<button 
									className="button is-small is-primary wp-sharp-button is-flex is-align-items-center" 
									style=${{ flexShrink: 0, marginRight: '1rem' }}
									onClick=${() => {
										window.location.hash = '#/settings';
										setActiveTab('sound_effects');
									}}
								>
									<span className="icon"><i className="dashicons dashicons-format-audio"></i></span>
									<span>تخصيص أصوات وأماكن النظام </span>
								</button>
							</div>
						</div>

						<button className="button is-primary wp-btn mt-3" onClick=${() => toast('تم حفظ تفضيلات الإشعارات.', 'success')}>
							حفظ التفضيلات
						</button>
					</div>
				` : null}

				${activeTab === 'export' ? html`
					<div className="wp-card p-5 mb-5">
						<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>التصدير والأرشفة</h3>
						<p className="is-size-7 has-text-grey mb-4">يمكنك تصدير بيانات المشاريع والمهام بصيغة JSON لاستخدامها كنسخة احتياطية.</p>
						
						<div className="buttons">
							<button 
								className=${`button is-primary wp-sharp-button ${ isExporting ? 'is-loading' : '' }`} 
								onClick=${handleExportJson}
								disabled=${isExporting}
							>
								<span className="icon"><i className="dashicons dashicons-download"></i></span>
								<span>تصدير كل البيانات وتحميل JSON</span>
							</button>
						</div>
					</div>

					<!-- Dev Data Seeder & Environment Management Card -->
					<div className="wp-card p-5" style=${{ border: '1px solid #cbd5e1' }}>
						<div className="is-flex is-align-items-center mb-3">
							<span className="icon has-text-success ml-2"><i className="dashicons dashicons-database-import" style=${{ fontSize: '24px' }}></i></span>
							<div>
								<h3 className="title is-5 mb-1 has-text-weight-bold">محرك البيانات التجريبية (Dev Data Seeder Engine)</h3>
								<p className="has-text-grey is-size-7">توليد بيئة عمل واقعية تحاكي منشأة حقيقية (مشاريع، مهام كانبان، مساهمات، وحلول معرفية معتمدة) لاختبار وتجربة كافة وظائف النظام بنقرة واحدة.</p>
							</div>
						</div>

						<div className="notification is-light p-3 mb-4" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
							<p className="is-size-7 has-text-dark">
								<i className="dashicons dashicons-info ml-1 has-text-info"></i>
								<strong>ملاحظة أمان:</strong> كافة العناصر المولدة بواسطة هذا المحرك موسومة برمجياً ولا تمس أو تغير أي محتوى أو منشورات أصلية لموقع ووردبريس، ويمكن تطهيرها وحذفها بالكامل في أي وقت.
							</p>
						</div>

						<div className="buttons">
							<button 
								className=${`button is-success wp-sharp-button ${ isSeeding ? 'is-loading' : '' }`}
								onClick=${handleSeedData}
								disabled=${isSeeding || isPurging}
							>
								<span className="icon"><i className="dashicons dashicons-plus-alt"></i></span>
								<span>توليد بيانات بيئة العمل التجريبية</span>
							</button>

							<button 
								className=${`button is-danger is-outlined wp-sharp-button ${ isPurging ? 'is-loading' : '' }`}
								onClick=${handlePurgeData}
								disabled=${isSeeding || isPurging}
							>
								<span className="icon"><i className="dashicons dashicons-trash"></i></span>
								<span>تطهير وحذف البيانات التجريبية</span>
							</button>
						</div>
					</div>
				` : null}

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
