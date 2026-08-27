/**
 * WorkPress Client Portal Header Component
 * 
 * Two-tier institutional header layout with official brand identity,
 * project switcher, notifications drawer, profile controls, and tabs.
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html } from '../utils/html.js';
import WorkPressLogo from '../../components/WorkPressLogo.js';

export default function PortalHeader({
    config,
    currentUser,
    projects = [],
    selectedProjectId,
    onSelectProject,
    activeTab,
    onTabChange,
    onOpenRequestModal,
    unreadNotificationsCount = 0,
    notifications = [],
    isNotificationsOpen,
    onToggleNotifications,
    onMarkAllRead,
    onNotificationClick,
    isProfileMenuOpen,
    onToggleProfileMenu,
    soundEnabled,
    onToggleSound
}) {
    const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    return html`
        <div class="portal-header-wrapper">
            <!-- Top Tier: Brand, Global Navigation, Alerts & Profile -->
            <div class="portal-top-bar">
                <div class="portal-brand-area">
                    <a href="#/" style=${{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                        <${WorkPressLogo} height=${32} />
                    </a>
                    <span class="portal-site-badge">
                        <i class="dashicons dashicons-portfolio"></i>
                        <span>مساحة المستفيد</span>
                    </span>
                    ${config.siteUrl && html`
                        <a href="${config.siteUrl}" class="portal-back-link">
                            <span>العودة للموقع الرئيسي</span>
                            <i class="dashicons dashicons-external"></i>
                        </a>
                    `}
                </div>

                <div class="portal-user-controls">
                    <!-- Notification Bell & Drawer -->
                    <div style=${{ position: 'relative' }}>
                        <button 
                            type="button" 
                            class="btn-portal btn-portal-outline btn-portal-sm" 
                            style=${{ position: 'relative', padding: '0.4rem 0.65rem' }}
                            onClick=${(e) => {
                                e.stopPropagation();
                                onToggleNotifications();
                            }}
                            title="التنبيهات والإشعارات"
                        >
                            <i class="dashicons dashicons-bell" style=${{ fontSize: '18px', color: unreadNotificationsCount > 0 ? 'var(--wp-warning)' : 'inherit' }}></i>
                            ${unreadNotificationsCount > 0 ? html`
                                <span style=${{ background: 'var(--wp-danger)', color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '1px 5px', marginRight: '4px' }}>
                                    ${unreadNotificationsCount}
                                </span>
                            ` : null}
                        </button>

                        <!-- Notification Popover Drawer -->
                        ${isNotificationsOpen && html`
                            <div 
                                class="portal-popover-drawer"
                                onClick=${e => e.stopPropagation()}
                            >
                                <div class="portal-popover-header">
                                    <div style=${{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.88rem', color: 'var(--wp-text-main)' }}>
                                        <i class="dashicons dashicons-bell"></i>
                                        <span>التنبيهات المباشرة</span>
                                    </div>
                                    ${unreadNotificationsCount > 0 ? html`
                                        <button 
                                            type="button" 
                                            style=${{ background: 'none', border: 'none', color: 'var(--wp-indigo)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                                            onClick=${onMarkAllRead}
                                        >
                                            تحديد الكل كمقروء
                                        </button>
                                    ` : null}
                                </div>

                                <div style=${{ maxHeight: '340px', overflowY: 'auto', padding: '0.5rem' }}>
                                    ${notifications.length === 0 ? html`
                                        <div style=${{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--wp-text-muted)', fontSize: '0.85rem' }}>
                                            <i class="dashicons dashicons-inbox" style=${{ fontSize: '32px', height: '32px', width: '32px', display: 'block', margin: '0 auto 0.5rem' }}></i>
                                            <p>لا توجد تنبيهات جديدة</p>
                                        </div>
                                    ` : html`
                                        <div style=${{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                            ${notifications.map(n => html`
                                                <div 
                                                    key=${n.id}
                                                    style=${{
                                                        background: n.is_read ? 'var(--wp-bg-subtle)' : 'var(--wp-primary-light)',
                                                        border: `1px solid ${n.is_read ? 'var(--wp-border)' : 'var(--wp-primary-border)'}`,
                                                        padding: '0.65rem',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick=${() => onNotificationClick(n)}
                                                >
                                                    <div style=${{ fontSize: '0.82rem', color: 'var(--wp-text-main)', lineHeight: 1.4, fontWeight: n.is_read ? '500' : '700' }} dangerouslySetInnerHTML=${{ __html: n.message }}></div>
                                                    <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--wp-text-muted)', marginTop: '4px' }}>
                                                        <span>${n.created_at ? n.created_at.substring(0, 16) : ''}</span>
                                                        ${n.project_id ? html`
                                                            <span style=${{ color: 'var(--wp-primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                                <span>عرض المشروع</span>
                                                                <i class="dashicons dashicons-arrow-left-alt" style=${{ fontSize: '14px' }}></i>
                                                            </span>
                                                        ` : null}
                                                    </div>
                                                </div>
                                            `)}
                                        </div>
                                    `}
                                </div>
                            </div>
                        `}
                    </div>

                    <!-- Sound Toggle Button -->
                    <button 
                        type="button" 
                        class="btn-portal btn-portal-outline btn-portal-sm"
                        onClick=${onToggleSound}
                        title=${soundEnabled ? 'كتم المؤثرات الصوتية' : 'تفعيل المؤثرات الصوتية'}
                    >
                        <i class=${`dashicons ${soundEnabled ? 'dashicons-controls-volumeon' : 'dashicons-controls-volumeoff'}`}></i>
                    </button>

                    <!-- User Profile & Menu -->
                    <div style=${{ position: 'relative' }}>
                        <button 
                            type="button" 
                            class="portal-user-profile-btn"
                            onClick=${(e) => {
                                e.stopPropagation();
                                onToggleProfileMenu();
                            }}
                        >
                            <div class="portal-avatar-box">
                                ${currentUser?.avatar_url ? html`<img src="${currentUser.avatar_url}" alt="Avatar" />` : html`<i class="dashicons dashicons-admin-users"></i>`}
                            </div>
                            <div class="portal-user-info-text">
                                <span class="portal-user-name">${currentUser?.display_name || 'حساب المستفيد'}</span>
                                <span class="portal-user-role">${currentUser?.role_label || 'مستفيد رسمي'}</span>
                            </div>
                            <i class="dashicons dashicons-arrow-down-alt2" style=${{ fontSize: '12px', color: 'var(--wp-text-muted)' }}></i>
                        </button>

                        ${isProfileMenuOpen && html`
                            <div 
                                class="portal-popover-drawer" 
                                style=${{ left: 0, right: 'auto', width: '220px' }}
                                onClick=${e => e.stopPropagation()}
                            >
                                <div style=${{ padding: '0.75rem', borderBottom: '1px solid var(--wp-border)' }}>
                                    <div style=${{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--wp-text-main)' }}>${currentUser?.display_name}</div>
                                    <div style=${{ fontSize: '0.75rem', color: 'var(--wp-text-muted)' }}>${currentUser?.user_email}</div>
                                </div>
                                <div style=${{ padding: '0.5rem' }}>
                                    ${config.logoutUrl && html`
                                        <a href="${config.logoutUrl}" class="portal-menu-link" style=${{ color: 'var(--wp-danger)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700 }}>
                                            <i class="dashicons dashicons-external"></i>
                                            <span>تسجيل الخروج</span>
                                        </a>
                                    `}
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Bottom Tier: Project Switcher, Action Button & Tabs -->
            <div class="portal-bottom-bar">
                <div class="portal-project-selector-area">
                    <span class="portal-selector-label">المشروع النشط:</span>
                    <div class="portal-custom-select-wrapper">
                        <select 
                            class="portal-project-select"
                            value=${selectedProjectId}
                            onChange=${(e) => onSelectProject(Number(e.target.value))}
                        >
                            ${projects.map(p => html`
                                <option key=${p.id} value=${p.id}>
                                    ${p.name} (${p.prefix || 'PRJ'})
                                </option>
                            `)}
                        </select>
                    </div>

                    ${selectedProject && html`
                        <span class="portal-badge portal-badge-sm portal-badge-active">
                            <i class="dashicons dashicons-yes"></i>
                            <span>${selectedProject.status_label || 'نشط'}</span>
                        </span>
                    `}
                </div>

                <div class="portal-actions-and-tabs">
                    <!-- Project Request Studio CTA -->
                    <button 
                        type="button" 
                        class="btn-portal btn-portal-primary btn-portal-sm"
                        onClick=${onOpenRequestModal}
                    >
                        <i class="dashicons dashicons-plus"></i>
                        <span>طلب خدمة / مشروع جديد</span>
                    </button>

                    <!-- Main Navigation Tabs -->
                    <div class="portal-nav-tabs">
                        <button 
                            type="button" 
                            class=${`portal-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
                            onClick=${() => onTabChange('overview')}
                        >
                            <i class="dashicons dashicons-dashboard"></i>
                            <span>نظرة عامة</span>
                        </button>
                        <button 
                            type="button" 
                            class=${`portal-tab-btn ${activeTab === 'deliverables' ? 'is-active' : ''}`}
                            onClick=${() => onTabChange('deliverables')}
                        >
                            <i class="dashicons dashicons-media-document"></i>
                            <span>المخرجات والتسليمات</span>
                        </button>
                        <button 
                            type="button" 
                            class=${`portal-tab-btn ${activeTab === 'roadmap' ? 'is-active' : ''}`}
                            onClick=${() => onTabChange('roadmap')}
                        >
                            <i class="dashicons dashicons-calendar-alt"></i>
                            <span>خارطة الإنجاز</span>
                        </button>
                        <button 
                            type="button" 
                            class=${`portal-tab-btn ${activeTab === 'communication' ? 'is-active' : ''}`}
                            onClick=${() => onTabChange('communication')}
                        >
                            <i class="dashicons dashicons-admin-comments"></i>
                            <span>الملاحظات والاستفسارات</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
