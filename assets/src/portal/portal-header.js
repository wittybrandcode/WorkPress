/**
 * WorkPress Client Portal: Two-Tier Institutional Header & Navigation Component
 *
 * Provides:
 * - Real-Time Floating Approval Toast Notification
 * - Executive Preview Mode Banner
 * - Top Tier: Vector Brand Area, Live Notifications, Language Switcher & Profile Dropdown
 * - Second Tier: Primary Action CTA & Project Switcher Dropdown
 * - Third Tier: Navigation Tabs Bar (Deliverables, Milestones, Feedback, My Requests)
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
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
        const __ = window.__ || ((s) => s);
        const i18n = window.WorkPressPortalI18n || { getLanguage: () => 'ar', isRTL: () => true, setLanguage: () => {}, getAvailableLanguages: () => [] };
        const isRtl = i18n.isRTL();
        const currentLang = i18n.getLanguage();

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
            isLanguageMenuOpen = false,
            onToggleLanguageMenu = () => {},
            user = {},
            roleLabel = __('Client', 'workpress'),
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
            <header class="portal-header-wrapper">
                <!-- 1. Real-Time Floating Approval Toast Notification -->
                ${activeToastAlert && html`
                    <div class="portal-toast-alert" onClick=${e => e.stopPropagation()}>
                        <div class="portal-toast-body">
                            <i class="dashicons dashicons-yes-alt portal-toast-icon"></i>
                            <div>
                                <div class="portal-toast-title" dangerouslySetInnerHTML=${{ __html: activeToastAlert.message }}></div>
                                <div class="portal-toast-subtitle">${__('Your request status has been officially updated.', 'workpress')}</div>
                            </div>
                        </div>

                        <button 
                            type="button" 
                            class="btn-portal btn-portal-outline btn-portal-sm"
                            onClick=${onCloseToastAlert}
                        >
                            ${__('Close', 'workpress')}
                        </button>
                    </div>
                `}

                <!-- 2. Preview Mode Banner (for Executives) -->
                ${(executiveType !== 'client' && isPreviewAsClient) && html`
                    <div class="portal-preview-banner">
                        <div style="display: flex; align-items: center; gap: 6px; color: var(--wp-text-secondary); font-weight: 700; font-size: 0.82rem;">
                            <i class="dashicons dashicons-visibility" style="color: var(--wp-indigo);"></i>
                            <span>${__('Client Preview Mode — Viewing the portal exactly as seen by the authorized client.', 'workpress')}</span>
                        </div>

                        <button 
                            class="btn-portal btn-portal-indigo btn-portal-sm"
                            onClick=${onReturnToRadar}
                        >
                            <span>${__('Return to Executive Radar', 'workpress')}</span>
                        </button>
                    </div>
                `}

                <!-- Top Tier -->
                <div class="portal-top-bar">
                        <div class="portal-brand-area">
                            <a href="#/" style="text-decoration: none;">
                                ${logoRenderer(32)}
                            </a>
                            <span class="portal-site-badge">
                                <i class="dashicons dashicons-portfolio"></i>
                                <span>${__('Client Portal', 'workpress')}</span>
                            </span>
                            <a href="${config.siteUrl || '/'}" class="portal-back-link">
                                <span>${__('Back to Main Site', 'workpress')}</span>
                                <i class="dashicons dashicons-external"></i>
                            </a>
                        </div>

                        <div class="portal-user-controls">
                            <!-- Quick + Request Service Button -->
                            <button 
                                type="button" 
                                class="portal-top-action-btn"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onNavigateToTab('new-request');
                                }}
                                title=${__('Submit New Request', 'workpress')}
                            >
                                <i class="dashicons dashicons-plus"></i>
                            </button>

                            <!-- Language Selector Trigger & Popover Dropdown -->
                            <div style="position: relative;">
                                <button 
                                    type="button" 
                                    class="portal-top-action-btn portal-lang-btn ${isLanguageMenuOpen ? 'is-active' : ''}"
                                    onClick=${onToggleLanguageMenu}
                                    title=${__('Language', 'workpress')}
                                >
                                    <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase;">
                                        ${currentLang.substring(0, 2)}
                                    </span>
                                </button>

                                ${isLanguageMenuOpen && html`
                                    <div class="portal-lang-dropdown" onClick=${e => e.stopPropagation()}>
                                        <div class="portal-lang-header">
                                            <i class="dashicons dashicons-translation"></i>
                                            <span>${__('Language', 'workpress')}</span>
                                        </div>
                                        <div class="portal-lang-list">
                                            ${i18n.getAvailableLanguages().map(lang => html`
                                                <button 
                                                    key=${lang.code}
                                                    type="button"
                                                    class="portal-lang-item ${currentLang.startsWith(lang.code) ? 'is-active' : ''}"
                                                    onClick=${() => {
                                                        playPortalSound('tab');
                                                        i18n.setLanguage(lang.code);
                                                        onToggleLanguageMenu();
                                                    }}
                                                >
                                                    <span class="portal-lang-flag">${lang.flag}</span>
                                                    <span class="portal-lang-label">${lang.label}</span>
                                                    ${currentLang.startsWith(lang.code) ? html`<i class="dashicons dashicons-yes"></i>` : null}
                                                </button>
                                            `)}
                                        </div>
                                    </div>
                                `}
                            </div>

                            <!-- Notification Bell Button with Red Disk & Drawer Popover -->
                            <div style="position: relative;">
                                <button 
                                    type="button" 
                                    class="portal-top-icon-btn ${unreadNotificationsCount > 0 ? 'has-unread' : ''}" 
                                    onClick=${onToggleNotifications}
                                    title=${__('Notifications', 'workpress')}
                                >
                                    <i class="dashicons dashicons-bell"></i>
                                    ${unreadNotificationsCount > 0 ? html`
                                        <span class="portal-notification-disk">
                                            ${unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
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
                                                <span>${__('Notifications', 'workpress')}</span>
                                            </div>
                                            ${unreadNotificationsCount > 0 ? html`
                                                <button 
                                                    type="button" 
                                                    style="background: none; border: none; color: var(--wp-indigo); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: underline;"
                                                    onClick=${onMarkAllNotificationsRead}
                                                >
                                                    ${__('Mark all as read', 'workpress')}
                                                </button>
                                            ` : null}
                                        </div>

                                        <div style="max-height: 340px; overflow-y: auto; padding: 0.5rem;">
                                            ${notifications.length === 0 ? html`
                                                <div style="padding: 2rem 1rem; text-align: center; color: var(--wp-text-muted); font-size: 0.85rem;">
                                                    <i class="dashicons dashicons-inbox" style="font-size: 32px; height: 32px; width: 32px; display: block; margin: 0 auto 0.5rem;"></i>
                                                    <p>${__('No new notifications', 'workpress')}</p>
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
                                                                        <span>${__('View', 'workpress')}</span>
                                                                        <i class="dashicons ${isRtl ? 'dashicons-arrow-left-alt' : 'dashicons-arrow-right-alt'}" style="font-size: 14px;"></i>
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
                                    title=${__('Main Overview', 'workpress')}
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
                                                            ${user.display_name || __('Client', 'workpress')}
                                                        </span>
                                                        <span class="portal-role-badge">
                                                            ${roleLabel}
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
                                                    <span>CoWorkPress Plaza</span>
                                                </a>
                                            `}

                                            <a href="${config.siteUrl || '/'}" class="portal-profile-item">
                                                <i class="dashicons dashicons-admin-home" style="color: var(--wp-text-muted);"></i>
                                                <span>${__('Back to Main Site', 'workpress')}</span>
                                            </a>

                                            <a 
                                                href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                                                class="portal-profile-item is-logout"
                                            >
                                                <i class="dashicons dashicons-migrate"></i>
                                                <span>${__('Logout', 'workpress')}</span>
                                            </a>
                                        </div>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Second Tier: Global Portal Main Navigation Bar -->
                    ${(() => {
                        const isProjectsContext = (activeTab === 'projects' || activeTab === 'deliverables' || activeTab === 'milestones' || activeTab === 'feedback' || (!!selectedProjectId && activeTab !== 'dashboard' && activeTab !== 'new-request' && activeTab !== 'my-requests'));
                        
                        return html`
                            <div class="portal-main-nav-bar">
                                <button 
                                    type="button"
                                    class="portal-nav-link ${(!isProjectsContext && activeTab !== 'my-requests' && activeTab !== 'new-request') || activeTab === 'dashboard' ? 'is-active' : ''}"
                                    onClick=${() => {
                                        playPortalSound('transition');
                                        onNavigateToTab('dashboard');
                                    }}
                                >
                                    <i class="dashicons dashicons-admin-home"></i>
                                    <span>${__('Main Overview', 'workpress')}</span>
                                </button>

                                <button 
                                    type="button"
                                    class="portal-nav-link ${isProjectsContext ? 'is-active' : ''}"
                                    onClick=${() => {
                                        playPortalSound('transition');
                                        onNavigateToTab('projects');
                                    }}
                                >
                                    <i class="dashicons dashicons-portfolio"></i>
                                    <span>${__('Active Projects', 'workpress')}</span>
                                    ${projects.length > 0 ? html`<span class="portal-nav-count">(${projects.length})</span>` : null}
                                </button>

                                <button 
                                    type="button"
                                    class="portal-nav-link ${activeTab === 'my-requests' ? 'is-active' : ''}"
                                    onClick=${() => {
                                        playPortalSound('transition');
                                        onNavigateToTab('my-requests');
                                    }}
                                >
                                    <i class="dashicons dashicons-email-alt"></i>
                                    <span>${__('Project Requests', 'workpress')}</span>
                                    ${myRequestsCount > 0 ? html`<span class="portal-nav-count">(${myRequestsCount})</span>` : null}
                                </button>
                            </div>

                            <!-- Third Tier: Contextual Project Workspace Action Bar (Appears ONLY in Projects context) -->
                            ${isProjectsContext ? html`
                                <div class="portal-contextual-bar">
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
                                            <span>${__('Submit New Request', 'workpress')}</span>
                                        </button>

                                        <button 
                                            type="button" 
                                            class="btn-portal btn-portal-outline btn-portal-sm"
                                            onClick=${() => {
                                                playPortalSound('transition');
                                                onNavigateToTab('dashboard');
                                            }}
                                            title=${__('Main Overview', 'workpress')}
                                        >
                                            <i class="dashicons ${isRtl ? 'dashicons-arrow-right-alt' : 'dashicons-arrow-left-alt'}"></i>
                                            <span>${__('Main Overview', 'workpress')}</span>
                                        </button>
                                    </div>

                                    ${projects.length > 0 ? html`
                                        <div class="portal-action-center" style="display: flex; align-items: center; gap: 6px;">
                                            <span style="font-size: 0.82rem; font-weight: 700; color: var(--wp-text-secondary); display: inline-flex; align-items: center; gap: 4px;">
                                                <i class="dashicons dashicons-portfolio" style="color: var(--wp-text-muted);"></i>
                                                <span>${__('Active Project:', 'workpress')}</span>
                                            </span>
                                            <select 
                                                class="portal-switcher-select" 
                                                value=${selectedProjectId || ''} 
                                                onChange=${onProjectChange}
                                            >
                                                <option value="">${__('Select a project...', 'workpress')}</option>
                                                ${projects.map(p => html`
                                                    <option key=${p.id} value=${p.id}>${p.name} (${p.prefix || ('PRJ-' + p.id)})</option>
                                                `)}
                                            </select>
                                        </div>
                                    ` : null}

                                    ${selectedProjectId ? html`
                                        <div class="portal-action-tabs">
                                            <button 
                                                type="button"
                                                class="portal-tab-pill ${activeTab === 'deliverables' || activeTab === 'projects' ? 'is-active' : ''}"
                                                onClick=${() => {
                                                    playPortalSound('button');
                                                    onNavigateToTab('deliverables');
                                                }}
                                            >
                                                <i class="dashicons dashicons-portfolio"></i>
                                                <span>${__('Deliverables Vault', 'workpress')} (${deliverablesCount})</span>
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
                                                <span>${__('Milestones & Roadmap', 'workpress')} (${milestonesCount})</span>
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
                                                <span>${__('Submit Feedback', 'workpress')}</span>
                                            </button>
                                        </div>
                                    ` : null}
                                </div>
                            ` : null}
                        `;
                    })()}
            </header>
        `;
    };

})(window.WorkPressPortal);
