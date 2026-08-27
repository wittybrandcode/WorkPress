/**
 * WorkPress Client Portal: Smart Welcome Gateway View
 * 
 * Provides interactive onboarding, user identity confirmation, and automatic countdown redirect.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.1
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderSmartGatewayCard = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const config = window.workpressPortalConfig || {};
        const renderWorkPressLogo = exports.renderWorkPressLogo || (() => '');

        const { user, gatewayCountdown, executiveType, roleLabel, onClientEnter } = ctx;
        const userName = (user && (user.display_name || user.name)) || 'عضو المنظومة';
        const userEmail = (user && user.email) || '';
        const userAvatar = (user && user.avatar_url) || '';
        const roleName = (user && (user.role_name || user.role_label)) || roleLabel || 'مشترك';
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        // Dynamic Context per Role
        let roleMsg = 'مرحباً بك! جاري تحويلك تلقائياً إلى الصفحة الرئيسية للموقع...';
        let actionText = 'العودة للموقع';
        let actionIcon = 'dashicons-admin-home';
        let actionUrl = config.siteUrl || '/';
        let onActionClick = () => { window.location.href = actionUrl; };

        if (executiveType === 'admin' || executiveType === 'lead' || executiveType === 'member') {
            roleMsg = 'مرحباً بك! جاري تهيئة غرفة العمليات والرادار الإداري...';
            actionText = 'دخول غرفة العمليات';
            actionIcon = 'dashicons-dashboard';
            actionUrl = config.adminUrl || '/wp-admin/admin.php?page=workpress#/';
            onActionClick = () => { window.location.href = actionUrl; };
        } else if (executiveType === 'client') {
            roleMsg = 'مرحباً بك! جاري نقلك إلى مساحة مشاريعك ومخرجاتك المعتمدة...';
            actionText = 'دخول مساحة المشاريع';
            actionIcon = 'dashicons-portfolio';
            actionUrl = '#/';
            onActionClick = (e) => {
                if (e) e.preventDefault();
                if (onClientEnter) onClientEnter();
            };
        }

        return html`
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--wp-bg-page); padding: 2rem;">
                <div class="portal-gatekeeper-card" style="max-width: 440px; width: 100%; text-align: center;">
                    
                    <!-- 1. WorkPress Brand Logo -->
                    <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
                        ${renderWorkPressLogo(38)}
                    </div>

                    <!-- 2. Real Avatar & Identity Section -->
                    <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem;">
                        <div style="margin-bottom: 0.75rem;">
                            ${userAvatar ? html`
                                <img 
                                    src="${userAvatar}" 
                                    alt="${userName}" 
                                    style="width: 76px; height: 76px; object-fit: cover; border: 2px solid var(--wp-primary); display: block;" 
                                    onError=${e => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <div style="width: 76px; height: 76px; background: var(--wp-primary); color: #ffffff; display: none; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border: 2px solid var(--wp-primary);">
                                    ${initials}
                                </div>
                            ` : html`
                                <div style="width: 76px; height: 76px; background: var(--wp-primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border: 2px solid var(--wp-primary);">
                                    ${initials}
                                </div>
                            `}
                        </div>

                        <h2 style="color: var(--wp-text-main); font-size: 1.35rem; font-weight: 800; margin-bottom: 0.35rem;">
                            ${userName}
                        </h2>

                        <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border); color: var(--wp-text-secondary); font-size: 0.82rem; font-weight: 700; padding: 4px 14px; margin-bottom: 0.35rem;">
                            <i class="dashicons dashicons-businessman"></i>
                            <span>${roleName}</span>
                        </div>

                        ${userEmail ? html`
                            <div style="font-size: 0.82rem; color: var(--wp-text-muted);">
                                ${userEmail}
                            </div>
                        ` : null}
                    </div>

                    <!-- 3. Active Real Countdown in Green Container -->
                    <div style="background: var(--wp-primary); color: #ffffff; padding: 0.85rem 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 14px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);">
                        <i class="dashicons dashicons-clock" style="font-size: 26px; width: 26px; height: 26px; line-height: 26px;"></i>
                        <span style="font-size: 2.2rem; font-weight: 900; line-height: 1; font-family: 'Cairo', monospace, sans-serif;">
                            ${gatewayCountdown !== null ? gatewayCountdown : 0}
                        </span>
                    </div>

                    <!-- 4. Welcoming Notification Text under Countdown -->
                    <div style="font-size: 0.9rem; color: var(--wp-text-secondary); font-weight: 700; line-height: 1.6; margin-bottom: 1.25rem;">
                        ${roleMsg}
                    </div>

                    <!-- 5. Direct Action Buttons -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <a href="${actionUrl}" onClick=${onActionClick} class="btn-portal btn-portal-primary" style="justify-content: center; font-size: 0.92rem; padding: 0.85rem;">
                            <i class="dashicons ${actionIcon}"></i>
                            <span>${actionText}</span>
                        </a>

                        <a 
                            href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                            class="btn-portal btn-portal-outline" 
                            style="justify-content: center; font-size: 0.92rem; padding: 0.85rem;"
                        >
                            <i class="dashicons dashicons-migrate"></i>
                            <span>تسجيل الخروج</span>
                        </a>
                    </div>

                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
