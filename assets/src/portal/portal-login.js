/**
 * WorkPress Client Portal: Standalone Login Canvas Component
 *
 * Provides a clean, institutional authentication screen with
 * official vector WorkPress logo, high-clarity error feedback,
 * and zero inline CSS styles.
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    /**
     * Render the Standalone Login Canvas
     *
     * @param {Object} ctx
     * @return {Object|null}
     */
    exports.renderLoginCanvas = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const __ = window.__ || ((s) => s);

        const {
            loginUsername,
            loginPassword,
            loginLoading,
            loginError,
            onUsernameChange,
            onPasswordChange,
            onLoginSubmit,
            renderWorkPressLogo
        } = ctx;

        const i18n = window.WorkPressPortalI18n || { getLanguage: () => 'ar', isRTL: () => true, setLanguage: () => {}, getAvailableLanguages: () => [] };
        const currentLang = i18n.getLanguage();
        const availableLangs = i18n.getAvailableLanguages();
        const logoRenderer = renderWorkPressLogo || exports.renderWorkPressLogo || (() => null);

        return html`
            <div class="portal-login-canvas">
                <div class="portal-login-card">
                    <!-- Language Selection Bar -->
                    <div class="portal-login-lang-bar" style="display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 1rem;">
                        ${availableLangs.map(lang => html`
                            <button
                                key=${lang.code}
                                type="button"
                                class="portal-login-lang-btn ${currentLang.startsWith(lang.code) ? 'is-active' : ''}"
                                style="background: ${currentLang.startsWith(lang.code) ? 'var(--wp-primary, #0f172a)' : 'transparent'}; color: ${currentLang.startsWith(lang.code) ? '#ffffff' : 'var(--wp-text-secondary, #64748b)'}; border: 1px solid ${currentLang.startsWith(lang.code) ? 'var(--wp-primary, #0f172a)' : 'var(--wp-border, #e2e8f0)'}; padding: 3px 8px; font-size: 0.76rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; border-radius: 0px; transition: all 0.15s ease;"
                                onClick=${() => i18n.setLanguage(lang.code)}
                                title=${lang.label}
                            >
                                <span>${lang.flag}</span>
                                <span>${lang.code.toUpperCase()}</span>
                            </button>
                        `)}
                    </div>

                    <!-- Official Vector Brand Logo -->
                    <div class="portal-login-brand">
                        ${logoRenderer(38)}
                    </div>

                    <h1 class="portal-login-title">
                        ${__('Sign In', 'workpress')}
                    </h1>
                    <p class="portal-login-subtitle">
                        ${__('Please sign in with your authorized client credentials to access your workspace.', 'workpress')}
                    </p>

                    ${loginError && html`
                        <div class="portal-login-alert">
                            ${loginError}
                        </div>
                    `}

                    <form class="portal-login-form" onSubmit=${onLoginSubmit}>
                        <div class="portal-form-group">
                            <label class="portal-label">${__('Username or Email', 'workpress')}</label>
                            <input 
                                type="text" 
                                class="portal-input" 
                                value=${loginUsername} 
                                onInput=${e => onUsernameChange(e.target.value)} 
                                placeholder="name@domain.com"
                                required 
                            />
                        </div>

                        <div class="portal-form-group">
                            <label class="portal-label">${__('Password', 'workpress')}</label>
                            <input 
                                type="password" 
                                class="portal-input" 
                                value=${loginPassword} 
                                onInput=${e => onPasswordChange(e.target.value)} 
                                placeholder="••••••••"
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            class="btn-portal btn-portal-primary portal-login-btn" 
                            disabled=${loginLoading}
                        >
                            <i class="dashicons dashicons-lock" style="margin-inline-end: 4px;"></i>
                            <span>${loginLoading ? __('Entering Workspace...', 'workpress') : __('Sign In', 'workpress')}</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
