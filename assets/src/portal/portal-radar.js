/**
 * WorkPress Client Portal: Executive Intelligence Radar View
 * 
 * Provides real-time metrics, stream feeds, and operations radar for Administrators, Leads, and Staff.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.1
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderExecutiveRadar = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const config = window.workpressPortalConfig || {};
        const renderWorkPressLogo = exports.renderWorkPressLogo || (() => '');
        const playPortalSound = exports.playPortalSound || (() => {});

        const {
            user, executiveType, roleLabel, adminUrl, radarData, radarLoading,
            isProfileMenuOpen, onToggleProfileMenu, onPreviewAsClient, onRefreshRadar
        } = ctx;

        const counters = (radarData && radarData.counters) || {
            pendingRequests: 0,
            recentFeedbacks: 0,
            activeProjects: 0,
            totalClients: 0
        };
        const recentRequests = (radarData && radarData.recentRequests) || [];
        const recentFeedbacks = (radarData && radarData.recentFeedbacks) || [];

        return html`
            <div class="portal-app-wrapper" onClick=${() => { if (isProfileMenuOpen && onToggleProfileMenu) onToggleProfileMenu(false); }}>
                <!-- Top Institutional Header -->
                <div class="portal-header-wrapper">
                    <div class="portal-top-bar">
                        <div class="portal-brand-area">
                            <a href="#/" style="text-decoration: none;">
                                ${renderWorkPressLogo(32)}
                            </a>
                            <span class="portal-site-badge">
                                <i class="dashicons dashicons-shield"></i>
                                <span>رادار القيادة التنفيذية</span>
                            </span>
                        </div>

                        <div class="portal-user-controls">
                            <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="btn-portal btn-portal-primary btn-portal-sm">
                                <i class="dashicons dashicons-dashboard"></i>
                                <span>غرفة عمليات CoWorkPress</span>
                            </a>

                            <button 
                                type="button" 
                                class="btn-portal btn-portal-outline btn-portal-sm"
                                onClick=${() => {
                                    if (onPreviewAsClient) onPreviewAsClient();
                                    playPortalSound('button');
                                }}
                            >
                                <i class="dashicons dashicons-visibility"></i>
                                <span>معاينة كزبون</span>
                            </button>

                            <!-- User Profile Trigger & Dropdown Menu -->
                            <div style="position: relative;">
                                <button 
                                    type="button" 
                                    class="portal-profile-trigger ${isProfileMenuOpen ? 'is-active' : ''}" 
                                    onClick=${(e) => {
                                        e.stopPropagation();
                                        if (onToggleProfileMenu) onToggleProfileMenu(!isProfileMenuOpen);
                                        playPortalSound('button');
                                    }}
                                    title="الملف الشخصي والخيارات"
                                >
                                    ${user?.avatar_url ? html`
                                        <img src="${user.avatar_url}" alt="${user.display_name}" class="portal-avatar-img" />
                                    ` : html`
                                        <div style="width: 28px; height: 28px; background: var(--wp-bg-subtle); display: flex; align-items: center; justify-content: center;">
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
                                                ${user?.avatar_url ? html`
                                                    <img src="${user.avatar_url}" alt="${user.display_name}" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid var(--wp-border);" />
                                                ` : html`
                                                    <div style="width: 36px; height: 36px; background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); display: flex; align-items: center; justify-content: center; color: var(--wp-primary);">
                                                        <i class="dashicons dashicons-admin-users" style="font-size: 20px;"></i>
                                                    </div>
                                                `}
                                                <div>
                                                    <div style="display: flex; align-items: center; gap: 6px;">
                                                        <span style="font-weight: 800; font-size: 0.92rem; color: var(--wp-text-main);">
                                                            ${user?.display_name}
                                                        </span>
                                                        <span style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #047857; font-size: 0.72rem; font-weight: 800; padding: 1px 6px;">
                                                            ${roleLabel}
                                                        </span>
                                                    </div>
                                                    ${user?.email ? html`
                                                        <div style="font-size: 0.78rem; color: var(--wp-text-muted); margin-top: 1px;">
                                                            ${user.email}
                                                        </div>
                                                    ` : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div style="padding: 0.35rem 0;">
                                            <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="portal-profile-item">
                                                <i class="dashicons dashicons-dashboard" style="color: var(--wp-indigo);"></i>
                                                <span>غرفة عمليات CoWorkPress</span>
                                            </a>

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
                </div>

                <div class="portal-container">
                    <!-- Hero Banner -->
                    <div class="wp-portal-card" style="background: linear-gradient(135deg, #ffffff, var(--wp-bg-subtle)); border-right: 4px solid var(--wp-primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <span style="font-size: 0.8rem; font-weight: 800; color: #047857; background: var(--wp-primary-light); padding: 3px 10px;">
                                    ${roleLabel} — رادار العمليات والنبض اللحظي
                                </span>
                                <h1 style="font-size: 1.5rem; font-weight: 900; color: var(--wp-text-main); margin-top: 0.5rem; margin-bottom: 0.25rem;">
                                    مرحباً بك، ${user?.display_name || 'القائد'}
                                </h1>
                                <p style="font-size: 0.9rem; color: var(--wp-text-secondary); max-width: 680px;">
                                    شاشة استعلامية متقدمة تمنحك إحاطة فورية بنشاط الزبائن والطلبات والملاحظات الواردة، مع روابط فورية لإدارتها داخل منظومة WorkPress.
                                </p>
                            </div>

                            <button 
                                class="btn-portal btn-portal-outline" 
                                onClick=${onRefreshRadar}
                                disabled=${radarLoading}
                            >
                                <i class="dashicons dashicons-update" style=${{ animation: radarLoading ? 'portalSpin 0.75s linear infinite' : 'none' }}></i>
                                <span>${radarLoading ? 'جاري التحديث...' : 'تحديث الرادار اللحظي'}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Live Pulse Counters Grid -->
                    <div class="portal-kpi-grid">
                        <a href="${adminUrl}requests" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-warning);">
                            <span class="portal-kpi-label">طلبات بانتظار الفرز والاعتماد</span>
                            <div class="portal-kpi-value" style="color: var(--wp-warning-text); font-size: 1.8rem;">
                                ${counters.pendingRequests}
                            </div>
                            <span style="font-size: 0.78rem; color: var(--wp-warning-text); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                <span>استوديو فرز الطلبات</span>
                                <i class="dashicons dashicons-arrow-left-alt"></i>
                            </span>
                        </a>

                        <a href="${adminUrl}kanban" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-indigo);">
                            <span class="portal-kpi-label">استفسارات وملاحظات الزبائن</span>
                            <div class="portal-kpi-value" style="color: var(--wp-indigo); font-size: 1.8rem;">
                                ${counters.recentFeedbacks}
                            </div>
                            <span style="font-size: 0.78rem; color: var(--wp-indigo); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                <span>متابعة الكانبان والردود</span>
                                <i class="dashicons dashicons-arrow-left-alt"></i>
                            </span>
                        </a>

                        <a href="${adminUrl}projects" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-primary);">
                            <span class="portal-kpi-label">مشاريع نشطة قيد التنفيذ</span>
                            <div class="portal-kpi-value" style="color: var(--wp-primary); font-size: 1.8rem;">
                                ${counters.activeProjects}
                            </div>
                            <span style="font-size: 0.78rem; color: var(--wp-primary); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                <span>شبكة المشاريع</span>
                                <i class="dashicons dashicons-arrow-left-alt"></i>
                            </span>
                        </a>

                        <div class="portal-kpi-card" style="border-top: 3px solid var(--wp-text-muted);">
                            <span class="portal-kpi-label">عملاء ومستفيدون مسجلون</span>
                            <div class="portal-kpi-value" style="font-size: 1.8rem;">
                                ${counters.totalClients}
                            </div>
                            <span style="font-size: 0.78rem; color: var(--wp-text-muted); display: block; margin-top: 4px;">
                                إجمالي حسابات المستفيدين المعتمدة
                            </span>
                        </div>
                    </div>

                    <!-- Feeds Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 1.5rem;">
                        <!-- Stream 1: Requests -->
                        <div class="wp-portal-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--wp-border);">
                                <div style="font-weight: 800; font-size: 1rem; color: var(--wp-text-main); display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-email-alt" style="color: var(--wp-warning);"></i>
                                    <span>آخر طلبات المشاريع الواردة</span>
                                </div>
                                <a href="${adminUrl}requests" style="font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                    <span>عرض الكل</span>
                                    <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
                                </a>
                            </div>

                            ${recentRequests.length === 0 ? html`
                                <div style="padding: 2rem; text-align: center; color: var(--wp-text-muted); font-size: 0.88rem;">
                                    لا توجد طلبات جديدة معلقة حالياً
                                </div>
                            ` : html`
                                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                    ${recentRequests.map(r => html`
                                        <div key=${r.id} style="padding: 0.75rem; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border); display: flex; justify-content: space-between; align-items: center;">
                                            <div>
                                                <div style="font-weight: 700; font-size: 0.88rem; color: var(--wp-text-main);">${r.name}</div>
                                                <div style="font-size: 0.78rem; color: var(--wp-text-muted);">بواسطة: ${r.client_name || 'عميل'} — ${r.created_at ? r.created_at.substring(0, 10) : ''}</div>
                                            </div>
                                            <a href="${adminUrl}requests" class="btn-portal btn-portal-outline btn-portal-sm">فرز</a>
                                        </div>
                                    `)}
                                </div>
                            `}
                        </div>

                        <!-- Stream 2: Feedback -->
                        <div class="wp-portal-card">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--wp-border);">
                                <div style="font-weight: 800; font-size: 1rem; color: var(--wp-text-main); display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-format-chat" style="color: var(--wp-indigo);"></i>
                                    <span>آخر استفسارات وملاحظات العملاء</span>
                                </div>
                                <a href="${adminUrl}kanban" style="font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                    <span>عرض الكانبان</span>
                                    <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
                                </a>
                            </div>

                            ${recentFeedbacks.length === 0 ? html`
                                <div style="padding: 2rem; text-align: center; color: var(--wp-text-muted); font-size: 0.88rem;">
                                    لا توجد استفسارات جديدة
                                </div>
                            ` : html`
                                <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                    ${recentFeedbacks.map(f => html`
                                        <div key=${f.id} style="padding: 0.75rem; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border);">
                                            <div style="font-size: 0.85rem; color: var(--wp-text-main); margin-bottom: 0.35rem;" dangerouslySetInnerHTML=${{ __html: f.content }}></div>
                                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--wp-text-muted);">
                                                <span>المهمة: <strong>${f.task_title || 'مهمة'}</strong></span>
                                                <span>${f.created_at ? f.created_at.substring(0, 16) : ''}</span>
                                            </div>
                                        </div>
                                    `)}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
