/**
 * WorkPress Client Portal Authentication View
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html, useState } from '../utils/html.js';
import WorkPressLogo from '../../components/WorkPressLogo.js';

export default function PortalAuthView({ onLogin, loginLoading, loginError }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username && password) {
            onLogin(username, password);
        }
    };

    return html`
        <div class="portal-auth-container">
            <div class="portal-auth-card">
                <div style=${{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <${WorkPressLogo} height=${38} />
                </div>

                <h1 style=${{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--wp-text-main)', marginBottom: '0.25rem' }}>
                    تسجيل الدخول إلى فضاء المستفيد
                </h1>
                <p style=${{ fontSize: '0.85rem', color: 'var(--wp-text-muted)', marginBottom: '1.75rem' }}>
                    مرحباً بك، يرجى إدخال بيانات الدخول المعتمدة للمتابعة
                </p>

                ${loginError && html`
                    <div style=${{ background: 'var(--wp-danger-light)', border: '1px solid var(--wp-danger-border)', color: 'var(--wp-danger-text)', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', textAlign: 'right' }}>
                        ${loginError}
                    </div>
                `}

                <form onSubmit=${handleSubmit} style=${{ textAlign: 'right' }}>
                    <div class="portal-form-group">
                        <label class="portal-label">اسم المستخدم أو البريد الإلكتروني</label>
                        <input 
                            type="text" 
                            class="portal-input" 
                            value=${username} 
                            onInput=${e => setUsername(e.target.value)} 
                            placeholder="اسم الحساب أو email@domain.com"
                            required 
                        />
                    </div>

                    <div class="portal-form-group">
                        <label class="portal-label">كلمة المرور</label>
                        <input 
                            type="password" 
                            class="portal-input" 
                            value=${password} 
                            onInput=${e => setPassword(e.target.value)} 
                            placeholder="••••••••"
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        class="btn-portal btn-portal-primary" 
                        style=${{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', justifyContent: 'center' }} 
                        disabled=${loginLoading}
                    >
                        <i class="dashicons dashicons-lock" style=${{ marginLeft: '6px' }}></i>
                        <span>${loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                    </button>
                </form>
            </div>
        </div>
    `;
}
