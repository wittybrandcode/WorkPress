/**
 * WorkPress Native Authentication Gateway Client Application
 *
 * Provides smooth SPA-like login and password recovery with
 * instant feedback, sound effects, and role-based redirection.
 *
 * @package WorkPress
 * @subpackage Assets/JS
 * @version 2.1.0
 */

(function() {
    'use strict';

    if (!window.preact || !window.htm) {
        console.error('WorkPress Auth: Preact or HTM not loaded.');
        return;
    }

    const { h, render, Component } = window.preact;
    const html = window.htm.bind(h);
    const config = window.workpressAuthConfig || {};

    /**
     * Official WorkPress Brand Vector Logo (SVG)
     */
    function renderWorkPressLogo(height = 36) {
        const pressFill = '#00192f';
        const workFill = '#10b981';

        return html`
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1293 192.25"
                style=${{ height: `${height}px`, width: 'auto', display: 'block' }}
                title="WorkPress — where work becomes memory"
            >
                <polygon fill="${workFill}" points="179.23 135.75 146.25 3 106.25 3 73.27 135.75 42 3 0 3 48.75 189.25 93.75 189.25 126.25 64.25 158.75 189.25 203.75 189.25 252.5 3 210.5 3 179.23 135.75"/>
                <path fill="${workFill}" d="m366,59c-11-6.16-23.25-9.25-36.75-9.25s-25.79,3.09-36.88,9.25c-11.09,6.17-19.92,14.59-26.5,25.25-6.59,10.67-9.88,22.92-9.88,36.75s3.29,25.88,9.88,36.62c6.58,10.75,15.41,19.21,26.5,25.38,11.08,6.17,23.38,9.25,36.88,9.25s25.75-3.08,36.75-9.25c11-6.16,19.79-14.62,26.38-25.38,6.58-10.75,9.88-22.96,9.88-36.62s-3.29-26.08-9.88-36.75c-6.59-10.66-15.38-19.08-26.38-25.25Zm-6.88,81.5c-2.92,5.67-6.92,10.09-12,13.25-5.09,3.17-11.04,4.75-17.88,4.75s-12.84-1.58-18-4.75c-5.17-3.16-9.21-7.58-12.12-13.25-2.92-5.66-4.38-12.16-4.38-19.5s1.46-13.79,4.38-19.38c2.91-5.58,6.96-10,12.12-13.25,5.16-3.25,11.16-4.88,18-4.88s12.79,1.62,17.88,4.88c5.08,3.25,9.08,7.67,12,13.25,2.91,5.59,4.38,12.04,4.38,19.38s-1.46,13.84-4.38,19.5Z"/>
                <path fill="${workFill}" d="m471.62,57.38c-5.26,3.11-9.38,8.36-12.38,15.75v-20.37h-35v136.5h37.5v-73.5c0-10.16,2.83-18.04,8.5-23.62,5.66-5.58,13.08-8.38,22.25-8.38h11.75v-32.5h-8c-9.5,0-17.71,2.04-24.62,6.12Z"/>
                <polygon fill="${workFill}" points="604.5 52.75 558.25 101.88 558.25 0 520.75 0 520.75 189.25 558.25 189.25 558.25 147.47 573.32 131.04 608 189.25 650.5 189.25 601.25 107.75 650.75 52.75 604.5 52.75"/>
                <path fill="${pressFill}" d="m770.75,10c-9-4.66-19.5-7-31.5-7h-62.25v186.25h16v-73.75h46.25c12,0,22.5-2.38,31.5-7.12s16-11.33,21-19.75c5-8.41,7.5-18.21,7.5-29.38s-2.5-21-7.5-29.5-12-15.08-21-19.75Zm7,70.88c-3.67,6.25-8.75,11.09-15.25,14.5-6.5,3.42-14.09,5.12-22.75,5.12h-46.75V18h46.75c8.66,0,16.25,1.71,22.75,5.12,6.5,3.42,11.58,8.17,15.25,14.25,3.66,6.09,5.5,13.29,5.5,21.62s-1.84,15.62-5.5,21.88Z"/>
                <path fill="${pressFill}" d="m862,61.38c-5.12,3.11-9.11,7.14-12,12.07v-16.95h-14.75v132.75h14.75v-81.25c0-11.5,3.12-20.75,9.38-27.75s14.79-10.5,25.62-10.5h10v-14.75h-8.25c-9.5,0-17.75,2.12-24.75,6.38Z"/>
                <path fill="${pressFill}" d="m1022.5,72.5c-5.34-5.83-11.71-10.46-19.12-13.88-7.42-3.41-15.71-5.12-24.88-5.12-12,0-22.84,3-32.5,9-9.67,6-17.34,14.21-23,24.62-5.67,10.42-8.5,22.29-8.5,35.62s2.91,25,8.75,35.5c5.83,10.5,13.75,18.79,23.75,24.88,10,6.09,21.25,9.12,33.75,9.12,8.5,0,16.38-1.38,23.62-4.12s13.62-6.58,19.12-11.5c5.5-4.91,9.66-10.46,12.5-16.62l-12.5-6.75c-4.5,7.5-10.34,13.54-17.5,18.12-7.17,4.59-15.59,6.88-25.25,6.88s-18.17-2.33-26-7c-7.84-4.66-14.04-11.21-18.62-19.62-3.9-7.16-5.96-15.21-6.17-24.12h108.55c.33-2,.58-3.88.75-5.62.16-1.75.25-3.46.25-5.12,0-8.5-1.5-16.54-4.5-24.12-3-7.58-7.17-14.29-12.5-20.12Zm-69,2.12c7.5-4.75,15.83-7.12,25-7.12s17.04,2.29,24.12,6.88c7.08,4.59,12.54,10.75,16.38,18.5,3.1,6.27,4.59,13.24,4.53,20.88h-93.34c.63-7.19,2.47-13.74,5.56-19.62,4.33-8.25,10.25-14.75,17.75-19.5Z"/>
                <path fill="${pressFill}" d="m1132,117.5l-22-6.25c-3.67-1-7.09-2.38-10.25-4.12-3.17-1.75-5.75-4.04-7.75-6.88-2-2.83-3-6.25-3-10.25,0-6.66,2.5-12.12,7.5-16.38s11.41-6.38,19.25-6.38,14.88,2.12,21.12,6.38,11.21,10.12,14.88,17.62l13.25-6.25c-3.5-9.66-9.75-17.33-18.75-23-9-5.66-19-8.5-30-8.5-8,0-15.21,1.54-21.62,4.62-6.42,3.09-11.54,7.46-15.38,13.12-3.84,5.67-5.75,12.17-5.75,19.5,0,8.34,2.71,15.59,8.12,21.75,5.41,6.17,13.88,10.84,25.38,14l20.5,5.75c4,1,7.75,2.5,11.25,4.5s6.38,4.46,8.62,7.38c2.25,2.92,3.38,6.54,3.38,10.88,0,7-2.96,12.67-8.88,17-5.92,4.34-13.29,6.5-22.12,6.5s-16.25-2.38-23.25-7.12-12.5-11.29-16.5-19.62l-13,6.25c4.33,10.67,11.16,19.04,20.5,25.12,9.33,6.09,20.08,9.12,32.25,9.12,9,0,16.96-1.59,23.88-4.75,6.91-3.16,12.41-7.62,16.5-13.38,4.08-5.75,6.12-12.21,6.12-19.38,0-8.83-3-16.46-9-22.88-6-6.41-14.42-11.21-25.25-14.38Z"/>
                <path fill="${pressFill}" d="m1284,131.88c-6-6.41-14.42-11.21-25.25-14.38l-22-6.25c-3.67-1-7.09-2.38-10.25-4.12-3.17-1.75-5.75-4.04-7.75-6.88-2-2.83-3-6.25-3-10.25,0-6.66,2.5-12.12,7.5-16.38s11.41-6.38,19.25-6.38,14.88,2.12,21.12,6.38,11.21,10.12,14.88,17.62l13.25-6.25c-3.5-9.66-9.75-17.33-18.75-23-9-5.66-19-8.5-30-8.5-8,0-15.21,1.54-21.62,4.62-6.42,3.09-11.54,7.46-15.38,13.12-3.84,5.67-5.75,12.17-5.75,19.5,0,8.34,2.71,15.59,8.12,21.75,5.41,6.17,13.88,10.84,25.38,14l20.5,5.75c4,1,7.75,2.5,11.25,4.5s6.38,4.46,8.62,7.38c2.25,2.92,3.38,6.54,3.38,10.88,0,7-2.96,12.67-8.88,17-5.92,4.34-13.29,6.5-22.12,6.5s-16.25-2.38-23.25-7.12-12.5-11.29-16.5-19.62l-13,6.25c4.33,10.67,11.16,19.04,20.5,25.12,9.33,6.09,20.08,9.12,32.25,9.12,9,0,16.96-1.59,23.88-4.75,6.91-3.16,12.41-7.62,16.5-13.38,4.08-5.75,6.12-12.21,6.12-19.38,0-8.83-3-16.46-9-22.88Z"/>
            </svg>
        `;
    }

    /**
     * Auth App Component
     */
    class AuthApp extends Component {
        constructor(props) {
            super(props);

            const initialView = config.initialView === 'lostpassword' ? 'lostpassword' : 'login';

            this.state = {
                activeTab: initialView,
                username: '',
                password: '',
                remember: true,
                showPassword: false,
                lostUser: '',
                loading: false,
                errorMessage: config.errorMessage || '',
                successMessage: config.loggedOutMessage ? 'تم تسجيل خروجك بنجاح وأمان.' : ''
            };
        }

        async handleLoginSubmit(e) {
            e.preventDefault();
            const { username, password, remember } = this.state;
            if (!username || !password) return;

            this.setState({ loading: true, errorMessage: '', successMessage: '' });

            try {
                const res = await fetch(`${config.apiUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': config.restNonce || ''
                    },
                    body: JSON.stringify({
                        username: username.trim(),
                        password: password,
                        remember: remember
                    })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    this.setState({
                        loading: false,
                        successMessage: 'تم التحقق بنجاح! جاري التوجيه إلى مساحة العمل...'
                    });

                    // Resolve smart landing target or fallback
                    let destination = config.redirectTo || '';
                    if (!destination || destination.includes('workpress-login') || destination.includes('wp-login')) {
                        const portalBase = (config.portalUrl || '/portal/').replace(/\/+$/, '');
                        destination = `${portalBase}/?welcome=1`;
                    }

                    setTimeout(() => {
                        window.location.href = destination;
                    }, 400);
                } else {
                    this.setState({
                        loading: false,
                        errorMessage: data.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة ثانية.'
                    });
                }
            } catch (err) {
                this.setState({
                    loading: false,
                    errorMessage: 'تعذر الاتصال بالخادم، يرجى التأكد من اتصالك والمحاولة ثانية.'
                });
            }
        }

        async handleLostPasswordSubmit(e) {
            e.preventDefault();
            const { lostUser } = this.state;
            if (!lostUser.trim()) return;

            this.setState({ loading: true, errorMessage: '', successMessage: '' });

            try {
                const formData = new FormData();
                formData.append('user_login', lostUser.trim());

                const res = await fetch(`${config.siteUrl}wp-login.php?action=lostpassword`, {
                    method: 'POST',
                    body: formData
                });

                // Standard WP LostPassword always responds with status
                this.setState({
                    loading: false,
                    successMessage: 'إذا كان البريد أو اسم المستخدم مسجلاً، فقد تم إرسال رابط تأكيد الاستعادة إلى بريدك الإلكتروني.'
                });
            } catch (err) {
                this.setState({
                    loading: false,
                    errorMessage: 'فشل إرسال طلب الاستعادة، يرجى التواصل مع إدارة الموقع.'
                });
            }
        }

        render() {
            const { activeTab, username, password, remember, showPassword, lostUser, loading, errorMessage, successMessage } = this.state;

            return html`
                <div class="wp-auth-container">
                    <div class="wp-auth-card">
                        
                        <!-- Header Area -->
                        <div class="wp-auth-header">
                            <div class="wp-auth-logo">
                                <a href="${config.siteUrl || '/'}" style="text-decoration: none;">
                                    ${renderWorkPressLogo(36)}
                                </a>
                            </div>
                            <h1 class="wp-auth-title">
                                ${activeTab === 'login' ? 'تسجيل الدخول' : 'استعادة كلمة المرور'}
                            </h1>
                            <p class="wp-auth-subtitle">
                                ${activeTab === 'login' ? 'مرحباً بك، يرجى إدخال بيانات الدخول للمتابعة' : 'أدخل بريدك الإلكتروني أو اسم المستخدم لإعادة تعيين كلمة المرور'}
                            </p>
                        </div>

                        <!-- Tab Switcher -->
                        <div class="wp-auth-tabs">
                            <button 
                                type="button" 
                                class="wp-auth-tab ${activeTab === 'login' ? 'is-active' : ''}"
                                onClick=${() => this.setState({ activeTab: 'login', errorMessage: '', successMessage: '' })}
                            >
                                <i class="dashicons dashicons-lock" style="font-size: 16px; margin-left: 4px;"></i>
                                <span>تسجيل الدخول</span>
                            </button>
                            <button 
                                type="button" 
                                class="wp-auth-tab ${activeTab === 'lostpassword' ? 'is-active' : ''}"
                                onClick=${() => this.setState({ activeTab: 'lostpassword', errorMessage: '', successMessage: '' })}
                            >
                                <i class="dashicons dashicons-unlock" style="font-size: 16px; margin-left: 4px;"></i>
                                <span>نسيت كلمة المرور؟</span>
                            </button>
                        </div>

                        <!-- Alert Notifications -->
                        ${errorMessage && html`
                            <div class="wp-auth-alert wp-auth-alert-danger">
                                <i class="dashicons dashicons-dismiss" style="font-size: 18px; color: var(--wp-danger);"></i>
                                <div>${errorMessage}</div>
                            </div>
                        `}

                        ${successMessage && html`
                            <div class="wp-auth-alert wp-auth-alert-success">
                                <i class="dashicons dashicons-yes-alt" style="font-size: 18px; color: var(--wp-primary);"></i>
                                <div>${successMessage}</div>
                            </div>
                        `}

                        <!-- VIEW 1: LOGIN FORM -->
                        ${activeTab === 'login' && html`
                            <form onSubmit=${this.handleLoginSubmit.bind(this)}>
                                <div class="wp-auth-group">
                                    <label class="wp-auth-label">اسم المستخدم أو البريد الإلكتروني</label>
                                    <div class="wp-auth-input-wrapper">
                                        <input 
                                            type="text" 
                                            class="wp-auth-input" 
                                            value=${username} 
                                            onInput=${e => this.setState({ username: e.target.value })} 
                                            placeholder="اسم الحساب أو email@domain.com"
                                            required 
                                            autoFocus 
                                            disabled=${loading}
                                        />
                                    </div>
                                </div>

                                <div class="wp-auth-group">
                                    <label class="wp-auth-label">كلمة المرور</label>
                                    <div class="wp-auth-input-wrapper">
                                        <input 
                                            type="${showPassword ? 'text' : 'password'}" 
                                            class="wp-auth-input" 
                                            value=${password} 
                                            onInput=${e => this.setState({ password: e.target.value })} 
                                            placeholder="••••••••"
                                            required 
                                            disabled=${loading}
                                        />
                                        <button 
                                            type="button" 
                                            class="wp-auth-toggle-pass"
                                            onClick=${() => this.setState({ showPassword: !showPassword })}
                                            title="${showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}"
                                        >
                                            <i class="dashicons ${showPassword ? 'dashicons-hidden' : 'dashicons-visibility'}" style="font-size: 18px;"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="wp-auth-row">
                                    <label class="wp-auth-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            class="wp-auth-checkbox" 
                                            checked=${remember} 
                                            onChange=${e => this.setState({ remember: e.target.checked })} 
                                        />
                                        <span>تذكر بيانات دخولي</span>
                                    </label>

                                    <button 
                                        type="button" 
                                        style="background: none; border: none; color: var(--wp-primary); font-size: 0.82rem; font-weight: 700; cursor: pointer;"
                                        onClick=${() => this.setState({ activeTab: 'lostpassword', errorMessage: '', successMessage: '' })}
                                    >
                                        فقدت كلمة المرور؟
                                    </button>
                                </div>

                                <button 
                                    type="submit" 
                                    class="wp-auth-btn" 
                                    disabled=${loading}
                                >
                                    ${loading ? html`
                                        <div class="wp-auth-spinner"></div>
                                        <span>جاري التحقق والمصادقة...</span>
                                    ` : html`
                                        <i class="dashicons dashicons-yes-alt"></i>
                                        <span>دخول مساحة العمل</span>
                                    `}
                                </button>
                            </form>
                        `}

                        <!-- VIEW 2: LOST PASSWORD FORM -->
                        ${activeTab === 'lostpassword' && html`
                            <form onSubmit=${this.handleLostPasswordSubmit.bind(this)}>
                                <div class="wp-auth-group">
                                    <label class="wp-auth-label">البريد الإلكتروني أو اسم المستخدم</label>
                                    <div class="wp-auth-input-wrapper">
                                        <input 
                                            type="text" 
                                            class="wp-auth-input" 
                                            value=${lostUser} 
                                            onInput=${e => this.setState({ lostUser: e.target.value })} 
                                            placeholder="أدخل بريدك الإلكتروني المسجل"
                                            required 
                                            autoFocus 
                                            disabled=${loading}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    class="wp-auth-btn" 
                                    disabled=${loading}
                                    style="margin-top: 1rem;"
                                >
                                    ${loading ? html`
                                        <div class="wp-auth-spinner"></div>
                                        <span>جاري إرسال الطلب...</span>
                                    ` : html`
                                        <i class="dashicons dashicons-email-alt"></i>
                                        <span>إرسال رابط استعادة كلمة المرور</span>
                                    `}
                                </button>
                            </form>
                        `}

                        <!-- Footer Links -->
                        <div class="wp-auth-footer">
                            <a href="${config.siteUrl || '/'}" class="wp-auth-back-link">
                                <i class="dashicons dashicons-arrow-right-alt"></i>
                                <span>العودة للموقع الرئيسي</span>
                            </a>

                            <span>WorkPress Engine v2.0</span>
                        </div>

                    </div>
                </div>
            `;
        }
    }

    // Mount Auth Application
    const rootEl = document.getElementById('workpress-auth-root');
    if (rootEl) {
        rootEl.innerHTML = '';
        render(html`<${AuthApp} />`, rootEl);
    }
})();
