import { html, useState, useEffect, useRef } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/datetime.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

const apiFetch = window.wp.apiFetch;

const NOTIFICATION_ICONS = {
	task_assigned:         'dashicons-businessman',
	task_unassigned:       'dashicons-dismiss',
	task_state_changed:    'dashicons-update',
	task_closed:           'dashicons-lock',
	task_reopened:         'dashicons-unlock',
	contribution_created:  'dashicons-format-chat',
	contribution_accepted: 'dashicons-yes-alt',
	contribution_revoked:  'dashicons-no',
	member_added:          'dashicons-groups',
	member_removed:        'dashicons-minus',
	project_permanently_deleted: 'dashicons-warning',
	deletion_requested:    'dashicons-trash',
	info:                  'dashicons-bell',
};

const NOTIFICATION_COLORS = {
	task_assigned:         '#2563eb', // Royal Blue
	task_unassigned:       '#ef4444', // Red
	task_state_changed:    '#f59e0b', // Amber
	task_closed:           '#0f172a', // Deep Slate
	task_reopened:         '#10b981', // Emerald
	contribution_created:  '#0284c7', // Sky Blue
	contribution_accepted: '#10b981', // Emerald
	contribution_revoked:  '#ef4444', // Red
	member_added:          '#10b981', // Emerald
	member_removed:        '#ef4444', // Red
	project_permanently_deleted: '#ef4444', // Red
	deletion_requested:    '#ea580c', // Orange
	info:                  '#64748b', // Slate
};

function NotificationBell() {
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState('all'); // all, tasks, contributions, projects
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const fetchNotifications = () => {
		apiFetch({ path: `/workpress/v1/notifications/user?t=${Date.now()}` })
			.then(data => {
				const newItems = data.items || [];
				setNotifications(prev => {
					// Check for new notifications to show toast
					if (prev.length > 0 && newItems.length > 0) {
						const prevLatestId = prev[0]?.id;
						const currentLatestId = newItems[0]?.id;
						
						// If the first item in the new list is different from the previous, and it's unread
						if (currentLatestId && currentLatestId !== prevLatestId && newItems[0].is_read === '0') {
							const msg = newItems[0].message;
							toast(msg, 'info');
							sound.play('notification');
						}
					}
					return newItems;
				});
				setUnreadCount(data.unread_count || 0);
			})
			.catch(console.error);
	};

	useEffect(() => {
		fetchNotifications();
		
		// Event Bus: listen for local actions that should force a refresh
		hooks.addAction('workpress_refresh_notifications', 'workpress/notifications', fetchNotifications);
		
		// Smart Adaptive Polling: stops 100% when tab is hidden, wakes up immediately on tab active
		let interval = null;

		const startPolling = () => {
			if ( ! interval ) {
				interval = setInterval(() => {
					if ( document.visibilityState === 'visible' ) {
						fetchNotifications();
					}
				}, 6000);
			}
		};

		const stopPolling = () => {
			if ( interval ) {
				clearInterval(interval);
				interval = null;
			}
		};

		const handleVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				fetchNotifications(); // Instant wakeup refresh
				startPolling();
			} else {
				stopPolling();
			}
		};

		startPolling();
		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			stopPolling();
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			hooks.removeAction('workpress_refresh_notifications', 'workpress/notifications');
		};
	}, []);

	const markAsRead = (id) => {
		apiFetch({ path: `/workpress/v1/notifications/${id}/read`, method: 'PUT' })
			.then(() => {
				setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: '1' } : n));
				setUnreadCount(prev => Math.max(0, prev - 1));
			})
			.catch(console.error);
	};

	const markAllRead = () => {
		apiFetch({ path: '/workpress/v1/notifications/read-all', method: 'PUT' })
			.then(() => {
				setNotifications(prev => prev.map(n => ({ ...n, is_read: '1' })));
				setUnreadCount(0);
			})
			.catch(console.error);
	};

	const toggleDropdown = () => setIsOpen(!isOpen);

	const filteredNotifications = notifications.filter(n => {
		if (activeTab === 'all') return true;
		if (activeTab === 'tasks') return ['task_assigned', 'task_unassigned', 'task_state_changed', 'task_closed', 'task_reopened'].includes(n.type);
		if (activeTab === 'contributions') return ['contribution_created', 'contribution_accepted', 'contribution_revoked'].includes(n.type);
		if (activeTab === 'projects') return ['member_added', 'member_removed'].includes(n.type);
		return true;
	});

	return html`
		<div ref=${dropdownRef} className=${`dropdown ${isOpen ? 'is-active' : ''}`} style=${{ margin: 0, zIndex: isOpen ? 100 : 1, display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
			<div className="dropdown-trigger">
				<button 
					className=${`button wp-header-btn ${isOpen ? 'is-active' : ''}`} 
					aria-haspopup="true" 
					aria-controls="dropdown-menu" 
					onClick=${toggleDropdown} 
					title="التنبيهات والإشعارات"
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
						<i className="dashicons dashicons-bell" style=${{ fontSize: '18px', width: '18px', height: '18px', lineHeight: '18px' }}></i>
					</span>
					${unreadCount > 0 && html`
						<span className="tag is-danger" style=${{ 
							borderRadius: 0, 
							position: 'absolute', 
							top: '-3px', 
							right: '-3px', 
							fontSize: '0.65rem', 
							padding: '1px 4px', 
							height: 'auto',
							minHeight: '14px',
							lineHeight: '12px'
						}}>
							${unreadCount}
						</span>
					`}
				</button>
			</div>
			<div className="dropdown-menu" id="dropdown-menu" role="menu" style=${{ minWidth: '380px', maxWidth: '92vw', left: 0, right: 'auto', top: '100%', paddingTop: '6px' }}>
				<div className="dropdown-content wp-card p-0" style=${{ borderRadius: 0, border: '1px solid #ededed', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
					${unreadCount > 0 ? html`
						<div className="p-2 is-flex is-justify-content-space-between is-align-items-center" style=${{ borderBottom: '1px solid #ededed', backgroundColor: '#f8fafc' }}>
							<span className="is-size-7 has-text-weight-bold has-text-grey-dark pr-2">
								لديك ${unreadCount} إشعار جديد
							</span>
							<button className="button is-small is-light wp-sharp-button" onClick=${markAllRead} style=${{ border: '1px solid #cbd5e1' }}>
								<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
								<span>تحديد الكل كمقروء</span>
							</button>
						</div>
					` : null}
					
					<div className="tabs is-small is-fullwidth m-0" style=${{ borderBottom: '1px solid #ededed', backgroundColor: '#f8fafc' }}>
						<ul style=${{ margin: 0, padding: 0 }}>
							<li className=${activeTab === 'all' ? 'is-active' : ''}><a onClick=${() => setActiveTab('all')} style=${{ borderRadius: 0, borderBottomWidth: '2px', gap: '5px' }}>
								<i className="dashicons dashicons-bell" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
								<span>الكل</span>
							</a></li>
							<li className=${activeTab === 'tasks' ? 'is-active' : ''}><a onClick=${() => setActiveTab('tasks')} style=${{ borderRadius: 0, borderBottomWidth: '2px', gap: '5px' }}>
								<i className="dashicons dashicons-clipboard" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
								<span>المهام</span>
							</a></li>
							<li className=${activeTab === 'contributions' ? 'is-active' : ''}><a onClick=${() => setActiveTab('contributions')} style=${{ borderRadius: 0, borderBottomWidth: '2px', gap: '5px' }}>
								<i className="dashicons dashicons-format-chat" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
								<span>المساهمات</span>
							</a></li>
							<li className=${activeTab === 'projects' ? 'is-active' : ''}><a onClick=${() => setActiveTab('projects')} style=${{ borderRadius: 0, borderBottomWidth: '2px', gap: '5px' }}>
								<i className="dashicons dashicons-portfolio" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
								<span>المشاريع</span>
							</a></li>
						</ul>
					</div>
					
					<div style=${{ maxHeight: '420px', overflowY: 'auto' }}>
						${filteredNotifications.length === 0 ? html`
							<div className="dropdown-item p-5 has-text-centered has-text-grey">
								<span className="icon is-medium has-text-grey-light mb-1"><i className="dashicons dashicons-bell" style=${{ fontSize: '24px' }}></i></span>
								<p className="is-size-7 mb-0">لا توجد إشعارات جديدة.</p>
							</div>
						` : filteredNotifications.map(n => {
							const typeColor = NOTIFICATION_COLORS[n.type] || '#64748b';
							const typeIcon = NOTIFICATION_ICONS[n.type] || 'dashicons-bell';
							return html`
								<a key=${n.id} 
								   href=${n.type === 'project_request' ? '#/requests' : (n.task_id > 0 ? `#/tasks/${n.task_id}` : (n.project_id > 0 ? `#/projects/${n.project_id}` : '#'))} 
								   className="dropdown-item p-3 is-flex is-align-items-flex-start" 
								   style=${{ 
									   borderBottom: '1px solid #f1f5f9', 
									   backgroundColor: n.is_read == '0' ? '#f0f9ff' : '#ffffff', 
									   whiteSpace: 'normal', 
									   gap: '10px',
									   transition: 'background-color 0.15s ease'
								   }}
								   onClick=${() => { if(n.is_read == '0') markAsRead(n.id); setIsOpen(false); }}
								>
									<!-- 1. البروفايل النقي بدون حجب + 2. الأيقونة المستقلة الملونة بجانبه -->
									<div className="is-flex is-align-items-center" style=${{ gap: '6px', flexShrink: 0 }}>
										<!-- Clean Avatar (100% visible) -->
										<div style=${{ flexShrink: 0 }}>
											${n.actor_avatar ? html`
												<img src=${n.actor_avatar} style=${{ width: '32px', height: '32px', borderRadius: 0, border: '1px solid #cbd5e1', display: 'block' }} />
											` : html`
												<div style=${{ width: '32px', height: '32px', borderRadius: 0, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
													<i className="dashicons dashicons-admin-users has-text-grey"></i>
												</div>
											`}
										</div>
										
										<!-- Distinct Type Icon -->
										<div 
											style=${{ 
												width: '26px', 
												height: '26px', 
												display: 'flex', 
												alignItems: 'center', 
												justifyContent: 'center', 
												backgroundColor: typeColor + '18', 
												color: typeColor,
												border: `1px solid ${typeColor}40`,
												borderRadius: 0,
												flexShrink: 0
											}}
											title="نوع الحدث"
										>
											<i className=${`dashicons ${typeIcon}`} style=${{ fontSize: '15px', width: '15px', height: '15px', lineHeight: '15px' }}></i>
										</div>
									</div>
									
									<!-- 3. محتوى التنبيه + سطر الوقت مع مساحة الإجراءات السريعة (Actions Hook Slot) -->
									<div style=${{ flexGrow: 1, minWidth: 0 }}>
										<div className="is-size-7 mb-1" style=${{ color: '#0f172a', lineHeight: '1.4' }} dangerouslySetInnerHTML=${{ __html: n.message }}></div>
										
										<!-- سطر التاريخ والوقت المدمج مع مساحة الإجراءات السريعة -->
										<div className="is-flex is-justify-content-space-between is-align-items-center mt-2 pt-1" style=${{ borderTop: '1px dashed #f1f5f9' }}>
											<!-- Time & Actor Info -->
											<div className="has-text-grey is-size-7 is-flex is-align-items-center" style=${{ fontSize: '0.7rem', gap: '6px' }}>
												<i className="dashicons dashicons-clock" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#94a3b8' }}></i>
												<span title=${formatDateTime(n.created_at)} style=${{ cursor: 'help' }}>${formatRelativeTime(n.created_at)}</span>
												${n.actor_name && html`
													<span style=${{ marginRight: '4px', paddingRight: '6px', borderRight: '1px solid #e2e8f0', color: '#64748b', fontWeight: '500' }}>
														${n.actor_name}
													</span>
												`}
											</div>

											<!-- Quick Actions Hook Slot (مساحة مخصصة للإجراءات السريعة) -->
											<div 
												className="wp-notification-actions is-flex is-align-items-center" 
												style=${{ gap: '4px' }}
												onClick=${(e) => e.stopPropagation()}
											>
												${ n.type === 'deletion_requested' && html`
													<button 
														className="button is-small p-1" 
														style=${{ height: '22px', width: '22px', borderRadius: 0, border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626' }}
														title="مراجعة طلب الحذف في سلة المهملات"
														onClick=${(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(false); window.location.hash = '#/settings?tab=export'; }}
													>
														<i className="dashicons dashicons-trash" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
													</button>
												` }

												${ n.is_read === '0' ? html`
													<button 
														className="button is-small p-1" 
														style=${{ height: '22px', width: '22px', borderRadius: 0, border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#3b82f6' }}
														title="تحديد كمقروء"
														onClick=${(e) => { e.preventDefault(); e.stopPropagation(); markAsRead(n.id); }}
													>
														<i className="dashicons dashicons-yes" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
													</button>
												` : null }

												<!-- خطاف الإجراءات الإضافية القابلة للامتداد -->
												${ hooks.applyFilters('workpress_notification_item_actions', [], n).map((ActionComp, idx) => html`<${ActionComp} key=${idx} notification=${n} />`) }
											</div>
										</div>
									</div>
								</a>
							`;
						})}
					</div>
				</div>
			</div>
		</div>
	`;
}

// Register the component via hooks
hooks.addFilter('workpress_header_brand_actions', 'workpress-notifications/bell', (components) => {
	return [...components, NotificationBell];
});
