/**
 * WorkPress Client Portal: Two-Tier Institutional Header & Navigation Component
 *
 * Provides:
 * - Real-Time Floating Approval Toast Notification
 * - Executive Preview Mode Banner
 * - Top Tier: Vector Brand Area, Dashicons, Live Notifications Drawer & User Profile Dropdown
 * - Second Tier: Primary Action CTA & Project Switcher Dropdown
 * - Third Tier: Navigation Tabs Bar (Deliverables, Milestones, Feedback, My Requests)
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.2
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    /**
     * Render Two-Tier Institutional Header & Navigation
     *
     * @param {Object} ctx
     * @return {Object|null}
     */
    exports.renderPortalHeader = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);

        const {
            activeToastAlert,
            onCloseToastAlert,
            executiveType,
            isPreviewAsClient,
            onReturnToRadar,
            config = {},
            renderWorkPressLogo,
            notifications = [],
            unreadNotificationsCount = 0,
            isNotificationsOpen = false,
            onToggleNotifications,
            onMarkNotificationRead,
            onMarkAllNotificationsRead,
            onSelectNotificationProject,
            user = {},
            roleLabel = 'مستفيد',
            adminUrl,
            isProfileMenuOpen = false,
            onToggleProfileMenu,
            projects = [],
            selectedProjectId,
            onProjectChange,
            activeTab = 'deliverables',
            onNavigateToTab,
            deliverablesCount = 0,
            milestonesCount = 0,
            myRequestsCount = 0,
            playPortalSound = () => {}
        } = ctx;

        const logoRenderer = renderWorkPressLogo || exports.renderWorkPressLogo || (() => null);

        return html`
            <div>
                <!-- 1. Real-Time Floating Approval Toast Notification -->
                ${activeToastAlert && html`
                    <div class="portal-toast-alert" onClick=${e => e.stopPropagation()}>
                        <div class="portal-toast-body">
                            <i class="dashicons dashicons-yes-alt portal-toast-icon"></i>
                            <div>
                                <div class="portal-toast-title" dangerouslySetInnerHTML=${{ __html: activeToastAlert.message }}></div>
                                <div class="portal-toast-subtitle">تم تحديث حالة طلبكم رسمياً.</div>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            class="btn-portal btn-portal-outline btn-portal-sm"
                            onClick=${onCloseToastAlert}
                        >
                            إغلاق
                        </button>
                    </div>
                `}

                <!-- 2. Preview Mode Banner (for Executives) -->
                ${(executiveType !== 'client' && isPreviewAsClient) && html`
                    <div class="portal-preview-banner">
                        <div style="display: flex; align-items: center; gap: 6px; color: var(--wp-text-secondary); font-weight: 700; font-size: 0.82rem;">
                            <i class="dashicons dashicons-visibility" style="color: var(--wp-indigo);"></i>
                            <span>وضع المعاينة التجريبية كزبون — استعراض البوابة كما يراها العميل تماماً.</span>
                        </div>

                        <button 
                            class="btn-portal btn-portal-indigo btn-portal-sm"
                            onClick=${onReturnToRadar}
                        >
                            <span>العودة للرادار التنفيذي</span>
                        </button>
                    </div>
                `}

                <!-- 3. TWO-TIER WORKPRESS INSTITUTIONAL HEADER -->
                <div class="portal-header-wrapper">
                    
                    <!-- Top Tier -->
                    <div class="portal-top-bar">
                        <div class="portal-brand-area">
                            <a href="#/" style="text-decoration: none;">
                                ${logoRenderer(32)}
                            </a>
                            <span class="portal-site-badge">
                                <i class="dashicons dashicons-portfolio"></i>
                                <span>مساحة المستفيد</span>
                            </span>
                            <a href="${config.siteUrl || '/'}" class="portal-back-link">
                                <span>العودة للموقع الرئيسي</span>
                                <i class="dashicons dashicons-external"></i>
                            </a>
                        </div>

                        <div class="portal-user-controls">
                            <!-- Notification Bell Button & Drawer Popover -->
                            <div style="position: relative;">
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-outline btn-portal-sm" 
                                    style="position: relative; padding: 0.4rem 0.65rem;"
                                    onClick=${onToggleNotifications}
                                    title="التنبيهات والإشعارات"
                                >
                                    <i class="dashicons dashicons-bell" style="font-size: 18px; color: ${unreadNotificationsCount > 0 ? 'var(--wp-warning)' : 'inherit'};"></i>
                                    ${unreadNotificationsCount > 0 ? html`
                                        <span class="portal-notification-badge">
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
                                            <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.88rem; color: var(--wp-text-main);">
                                                <i class="dashicons dashicons-bell"></i>
                                                <span>التنبيهات المباشرة</span>
                                            </div>
                                            ${unreadNotificationsCount > 0 ? html`
                                                <button 
                                                    type="button" 
                                                    style="background: none; border: none; color: var(--wp-indigo); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: underline;"
                                                    onClick=${onMarkAllNotificationsRead}
                                                >
                                                    تحديد الكل كمقروء
                                                </button>
                                            ` : null}
                                        </div>

                                        <div style="max-height: 340px; overflow-y: auto; padding: 0.5rem;">
                                            ${notifications.length === 0 ? html`
                                                <div style="padding: 2rem 1rem; text-align: center; color: var(--wp-text-muted); font-size: 0.85rem;">
                                                    <i class="dashicons dashicons-inbox" style="font-size: 32px; height: 32px; width: 32px; display: block; margin: 0 auto 0.5rem;"></i>
                                                    <p>لا توجد تنبيهات جديدة</p>
                                                </div>
                                            ` : html`
                                                <div class="portal-notification-list">
                                                    ${notifications.map(n => html`
                                                        <div 
                                                            key=${n.id}
                                                            class="portal-notification-item ${n.is_read ? 'is-read' : 'is-unread'}"
                                                            onClick=${() => {
                                                                if (!n.is_read) onMarkNotificationRead(n.id);
                                                                if (n.project_id) onSelectNotificationProject(n.project_id);
                                                            }}
                                                        >
                                                            <div class="portal-notification-msg" dangerouslySetInnerHTML=${{ __html: n.message }}></div>
                                                            <div class="portal-notification-meta">
                                                                <span>${n.created_at ? n.created_at.substring(0, 16) : ''}</span>
                                                                ${n.project_id ? html`
                                                                    <span style="color: var(--wp-primary); font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                                                                        <span>عرض المشروع</span>
                                                                        <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
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

                            <!-- User Profile Trigger & Dropdown Menu -->
                            <div style="position: relative;">
                                <button 
                                    type="button" 
                                    class="portal-profile-trigger ${isProfileMenuOpen ? 'is-active' : ''}" 
                                    onClick=${onToggleProfileMenu}
                                    title="الملف الشخصي والخيارات"
                                >
                                    ${user.avatar_url ? html`
                                        <img src="${user.avatar_url}" alt="${user.display_name}" class="portal-avatar-img" />
                                    ` : html`
                                        <div class="portal-avatar-box">
                                            <i class="dashicons dashicons-admin-users" style="font-size: 18px; color: var(--wp-text-secondary);"></i>
                                        </div>
                                    `}
                                    <i class="dashicons dashicons-arrow-down-alt2" style="font-size: 14px; color: var(--wp-text-muted);"></i>
                                </button>

                                <!-- Profile Dropdown Popover -->
                                ${isProfileMenuOpen && html`
                                    <div 
                                        class="portal-profile-dropdown"
                                        onClick=${e => e.stopPropagation()}
                                    >
                                        <div class="portal-profile-header">
                                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.35rem;">
                                                ${user.avatar_url ? html`
                                                    <img src="${user.avatar_url}" alt="${user.display_name}" class="portal-avatar-lg" />
                                                ` : html`
                                                    <div class="portal-avatar-placeholder-lg">
                                                        <i class="dashicons dashicons-admin-users" style="font-size: 20px;"></i>
                                                    </div>
                                                `}
                                                <div>
                                                    <div style="display: flex; align-items: center; gap: 6px;">
                                                        <span style="font-weight: 800; font-size: 0.92rem; color: var(--wp-text-main);">
                                                            ${user.display_name}
                                                        </span>
                                                        <span class="portal-role-badge">
                                                            ${roleLabel || 'مستفيد'}
                                                        </span>
                                                    </div>
                                                    ${user.email ? html`
                                                        <div style="font-size: 0.78rem; color: var(--wp-text-muted); margin-top: 1px;">
                                                            ${user.email}
                                                        </div>
                                                    ` : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div style="padding: 0.35rem 0;">
                                            ${(executiveType !== 'client') && html`
                                                <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="portal-profile-item">
                                                    <i class="dashicons dashicons-dashboard" style="color: var(--wp-indigo);"></i>
                                                    <span>غرفة عمليات CoWorkPress</span>
                                                </a>
                                            `}

                                            <a href="${config.siteUrl || '/'}" class="portal-profile-item">
                                                <i class="dashicons dashicons-admin-home" style="color: var(--wp-text-muted);"></i>
                                                <span>الموقع الرئيسي</span>
                                            </a>

                                            <a 
                                                href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                                                class="portal-profile-item is-logout"
                                            >
                                                <i class="dashicons dashicons-migrate"></i>
                                                <span>تسجيل الخروج</span>
                                            </a>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Second Tier: Primary Action CTA & Project Switcher Dropdown -->
                    <div class="portal-action-bar">
                        <div class="portal-action-right" style="display: flex; align-items: center; gap: 8px;">
                            <button 
                                class="btn-portal btn-portal-primary btn-portal-sm" 
                                style="font-weight: 800;"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onNavigateToTab('new-request');
                                }}
                            >
                                <i class="dashicons dashicons-plus-alt2"></i>
                                <span>طلب خدمة / مشروع جديد</span>
                            </button>

                            ${selectedProjectId ? html`
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-outline btn-portal-sm"
                                    onClick=${() => {
                                        playPortalSound('transition');
                                        onNavigateToTab('dashboard');
                                    }}
                                    title="العودة للرئيسية ولوحة القيادة"
                                >
                                    <i class="dashicons dashicons-arrow-right-alt"></i>
                                    <span>الرئيسية</span>
                                </button>
                            ` : null}
                        </div>

                        ${projects.length > 0 ? html`
                            <div class="portal-action-left" style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.85rem; font-weight: 700; color: var(--wp-text-secondary); display: inline-flex; align-items: center; gap: 4px;">
                                    <i class="dashicons dashicons-portfolio" style="color: var(--wp-text-muted);"></i>
                                    <span>المشروع النشط:</span>
                                </span>
                                <select 
                                    class="portal-switcher-select" 
                                    value=${selectedProjectId || ''} 
                                    onChange=${onProjectChange}
                                >
                                    <option value="">🏢 لوحة القيادة المركزية (كافة المشاريع)</option>
                                    ${projects.map(p => html`
                                        <option key=${p.id} value=${p.id}>📁 ${p.name} (${p.prefix})</option>
                                    `)}
                                </select>
                            </div>
                        ` : null}
                    </div>

                    <!-- Third Tier: Navigation Tabs Bar -->
                    <div class="portal-tabs-bar">
                        <button 
                            type="button"
                            class="portal-tab-pill ${(!selectedProjectId && activeTab !== 'new-request' && activeTab !== 'my-requests') || activeTab === 'dashboard' ? 'is-active' : ''}"
                            onClick=${() => {
                                playPortalSound('transition');
                                onNavigateToTab('dashboard');
                            }}
                        >
                            <i class="dashicons dashicons-admin-home"></i>
                            <span>الرئيسية / لوحة القيادة</span>
                        </button>

                        ${selectedProjectId ? html`
                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'deliverables' ? 'is-active' : ''}"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onNavigateToTab('deliverables');
                                }}
                            >
                                <i class="dashicons dashicons-portfolio"></i>
                                <span>المخرجات المعتمدة (${deliverablesCount})</span>
                            </button>

                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'milestones' ? 'is-active' : ''}"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onNavigateToTab('milestones');
                                }}
                            >
                                <i class="dashicons dashicons-clipboard"></i>
                                <span>المراحل والمهام (${milestonesCount})</span>
                            </button>

                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'feedback' ? 'is-active' : ''}"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onNavigateToTab('feedback');
                                }}
                            >
                                <i class="dashicons dashicons-format-chat"></i>
                                <span>الاستفسارات والملاحظات</span>
                            </button>
                        ` : null}

                        <button 
                            type="button"
                            class="portal-tab-pill ${activeTab === 'my-requests' ? 'is-active' : ''}"
                            onClick=${() => {
                                playPortalSound('button');
                                onNavigateToTab('my-requests');
                            }}
                        >
                            <i class="dashicons dashicons-email-alt"></i>
                            <span>سجل طلباتي (${myRequestsCount})</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
