/**
 * WorkPress Client Portal: Smart Welcome Gateway View
 * 
 * Provides interactive onboarding, user identity confirmation, and automatic countdown redirect
 * using 100% semantic CSS classes with zero inline styles.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderSmartGatewayCard = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const __ = window.__ || ((s) => s);
        const config = window.workpressPortalConfig || {};
        const renderWorkPressLogo = exports.renderWorkPressLogo || (() => '');

        const { user, gatewayCountdown, executiveType, roleLabel, onClientEnter } = ctx;
        const userName = (user && (user.display_name || user.name)) || __('Client', 'workpress');
        const userEmail = (user && user.email) || '';
        const userAvatar = (user && user.avatar_url) || '';
        const roleName = (user && (user.role_name || user.role_label)) || roleLabel || __('Subscriber', 'workpress');
        const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        // Dynamic Context per Role
        let roleMsg = __('Welcome! Redirecting you to the main site...', 'workpress');
        let actionText = __('Back to Main Site', 'workpress');
        let actionIcon = 'dashicons-admin-home';
        let actionUrl = config.siteUrl || '/';
        let onActionClick = () => { window.location.href = actionUrl; };

        if (executiveType === 'admin' || executiveType === 'lead' || executiveType === 'member') {
            roleMsg = __('Welcome! Initializing CoWorkPress operations plaza...', 'workpress');
            actionText = 'CoWorkPress Plaza';
            actionIcon = 'dashicons-dashboard';
            actionUrl = config.adminUrl || '/wp-admin/admin.php?page=workpress#/';
            onActionClick = () => { window.location.href = actionUrl; };
        } else if (executiveType === 'client') {
            roleMsg = __('Welcome! Entering your authorized project workspace...', 'workpress');
            actionText = __('Open Workspace', 'workpress');
            actionIcon = 'dashicons-portfolio';
            actionUrl = '#/';
            onActionClick = (e) => {
                if (e) e.preventDefault();
                if (onClientEnter) onClientEnter();
            };
        }

        return html`
            <div class="portal-gateway-canvas">
                <div class="portal-gateway-card">
                    
                    <!-- 1. WorkPress Brand Logo -->
                    <div class="portal-login-brand">
                        ${renderWorkPressLogo(38)}
                    </div>

                    <!-- 2. Real Avatar & Identity Section -->
                    <div class="portal-gateway-identity">
                        <div>
                            ${userAvatar ? html`
                                <img 
                                    src="${userAvatar}" 
                                    alt="${userName}" 
                                    class="portal-gateway-avatar-img" 
                                    onError=${e => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <div class="portal-gateway-avatar-placeholder" style="display: none;">
                                    ${initials}
                                </div>
                            ` : html`
                                <div class="portal-gateway-avatar-placeholder">
                                    ${initials}
                                </div>
                            `}
                        </div>

                        <h2 class="portal-gateway-name">
                            ${userName}
                        </h2>

                        <div class="portal-gateway-role-tag">
                            <i class="dashicons dashicons-businessman"></i>
                            <span>${roleName}</span>
                        </div>

                        ${userEmail ? html`
                            <div class="portal-gateway-email">
                                ${userEmail}
                            </div>
                        ` : null}
                    </div>

                    <!-- 3. Active Real Countdown in Container -->
                    <div class="portal-gateway-timer">
                        <i class="dashicons dashicons-clock portal-gateway-timer-icon"></i>
                        <span class="portal-gateway-timer-num">
                            ${gatewayCountdown !== null ? gatewayCountdown : 0}
                        </span>
                    </div>

                    <!-- 4. Welcoming Notification Text under Countdown -->
                    <div class="portal-gateway-msg">
                        ${roleMsg}
                    </div>

                    <!-- 5. Direct Action Buttons -->
                    <div class="portal-gateway-actions">
                        <a href="${actionUrl}" onClick=${onActionClick} class="btn-portal btn-portal-primary portal-gateway-btn">
                            <i class="dashicons ${actionIcon}"></i>
                            <span>${actionText}</span>
                        </a>

                        <a 
                            href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                            class="btn-portal btn-portal-outline portal-gateway-btn"
                        >
                            <i class="dashicons dashicons-migrate"></i>
                            <span>${__('Logout', 'workpress')}</span>
                        </a>
                    </div>

                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
