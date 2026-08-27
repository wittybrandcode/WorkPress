/**
 * WorkPress Client Portal Communication Tab Component
 * 
 * Direct notes & queries channel between the Client and Project Lead.
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html, useState } from '../utils/html.js';
import { formatDateTime } from '../utils/portalHelpers.js';

export default function PortalCommunicationTab({
    projectData,
    onSubmitFeedback,
    feedbackSubmitting,
    feedbackSuccess,
    feedbackError
}) {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSubmitFeedback(message.trim()).then(() => {
                setMessage('');
            });
        }
    };

    return html`
        <div class="portal-tab-content">
            <div style=${{ marginBottom: '1.25rem' }}>
                <h3 style=${{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wp-text-main)', margin: '0 0 0.25rem 0' }}>
                    الملاحظات والاستفسارات المباشرة لمدير المشروع:
                </h3>
                <span style=${{ fontSize: '0.8rem', color: 'var(--wp-text-muted)' }}>
                    تصل رسالتك فوراً لقائد المشروع والفريق الفني وتُسجل رسمياً في خط زمن المشروع
                </span>
            </div>

            <!-- New Note Submission Form -->
            <div class="wp-portal-card" style=${{ marginBottom: '1.5rem' }}>
                <h4 style=${{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--wp-text-main)', marginBottom: '0.75rem' }}>
                    إرسال استفسار أو ملاحظة حول المشروع (${projectData?.name || ''})
                </h4>

                ${feedbackSuccess && html`
                    <div style=${{ background: 'var(--wp-primary-light)', border: '1px solid var(--wp-primary-border)', color: '#065f46', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                        ${feedbackSuccess}
                    </div>
                `}

                ${feedbackError && html`
                    <div style=${{ background: 'var(--wp-danger-light)', border: '1px solid var(--wp-danger-border)', color: 'var(--wp-danger-text)', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                        ${feedbackError}
                    </div>
                `}

                <form onSubmit=${handleSubmit}>
                    <div class="portal-form-group">
                        <textarea 
                            class="portal-textarea" 
                            rows="4" 
                            value=${message}
                            onInput=${e => setMessage(e.target.value)}
                            placeholder="اكتب استفسارك أو ملاحظتك الفنية بالتفصيل هنا..."
                            required
                        ></textarea>
                    </div>

                    <div style=${{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                        <button 
                            type="submit" 
                            class="btn-portal btn-portal-primary"
                            disabled=${feedbackSubmitting || !message.trim()}
                        >
                            <i class="dashicons dashicons-admin-comments"></i>
                            <span>${feedbackSubmitting ? 'جاري الإرسال والتسجيل...' : 'إرسال الملاحظة لمدير المشروع'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
