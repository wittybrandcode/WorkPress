/**
 * WorkPress Client Portal: Standalone Login Canvas Component
 *
 * Provides a clean, institutional authentication screen with
 * official vector WorkPress logo, high-clarity error feedback,
 * and zero inline CSS styles.
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.2
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

        const logoRenderer = renderWorkPressLogo || exports.renderWorkPressLogo || (() => null);

        return html`
            <div class="portal-login-canvas">
                <div class="portal-login-card">
                    <!-- Official Vector Brand Logo -->
                    <div class="portal-login-brand">
                        ${logoRenderer(38)}
                    </div>

                    <h1 class="portal-login-title">
                        تسجيل الدخول
                    </h1>
                    <p class="portal-login-subtitle">
                        مرحباً بك، يرجى إدخال بيانات الدخول للمتابعة
                    </p>

                    ${loginError && html`
                        <div class="portal-login-alert">
                            ${loginError}
                        </div>
                    `}

                    <form class="portal-login-form" onSubmit=${onLoginSubmit}>
                        <div class="portal-form-group">
                            <label class="portal-label">اسم المستخدم أو البريد الإلكتروني</label>
                            <input 
                                type="text" 
                                class="portal-input" 
                                value=${loginUsername} 
                                onInput=${e => onUsernameChange(e.target.value)} 
                                placeholder="اسم الحساب أو email@domain.com"
                                required 
                            />
                        </div>

                        <div class="portal-form-group">
                            <label class="portal-label">كلمة المرور</label>
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
                            <i class="dashicons dashicons-lock" style="margin-left: 4px;"></i>
                            <span>${loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
