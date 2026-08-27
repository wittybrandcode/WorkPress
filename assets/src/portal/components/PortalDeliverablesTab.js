/**
 * WorkPress Client Portal Deliverables Tab Component
 * 
 * Displays the vault of officially approved deliverables & signoff actions.
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html } from '../utils/html.js';
import { formatDate } from '../utils/portalHelpers.js';

export default function PortalDeliverablesTab({
    deliverables = [],
    onOpenDeliverablePreview,
    onOpenSignoffModal,
    onOpenReport
}) {
    return html`
        <div class="portal-tab-content">
            <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h3 style=${{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wp-text-main)', margin: '0 0 0.25rem 0' }}>
                        المخرجات والحلول المعتمدة رسمياً الجاهزة للاستلام:
                    </h3>
                    <span style=${{ fontSize: '0.8rem', color: 'var(--wp-text-muted)' }}>
                        مفلترة ومطهرة من مسودات النقاش الفني الداخلي وموثقة في الذاكرة المؤسسية
                    </span>
                </div>

                <button 
                    type="button" 
                    class="btn-portal btn-portal-outline btn-portal-sm"
                    onClick=${onOpenReport}
                >
                    <i class="dashicons dashicons-printer"></i>
                    <span>وثيقة التسليم الشاملة (PDF)</span>
                </button>
            </div>

            ${deliverables.length === 0 ? html`
                <div class="wp-portal-card" style=${{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <i class="dashicons dashicons-portfolio" style=${{ fontSize: '38px', height: '38px', width: '38px', color: 'var(--wp-text-muted)', marginBottom: '0.75rem', display: 'inline-block' }}></i>
                    <h3 style=${{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wp-text-main)', margin: '0 0 0.5rem 0' }}>لا توجد مخرجات معتمدة نهائياً حتى اللحظة</h3>
                    <p style=${{ color: 'var(--wp-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        يعمل الفريق الفني على تنفيذ المهام، وستظهر الحلول المعتمدة هنا فور اعتمادها رسمياً من قبل مدير المشروع.
                    </p>
                </div>
            ` : html`
                <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    ${deliverables.map(d => html`
                        <div key=${d.id} class="wp-portal-card" style=${{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                                    <span class="portal-badge portal-badge-success">
                                        <i class="dashicons dashicons-yes"></i>
                                        <span>مخرج معتمد</span>
                                    </span>
                                    <span style=${{ fontSize: '0.75rem', color: 'var(--wp-text-muted)' }}>${formatDate(d.created_at)}</span>
                                </div>

                                <h4 style=${{ fontSize: '1rem', fontWeight: 800, color: 'var(--wp-text-main)', marginBottom: '0.4rem' }}>
                                    ${d.title || d.task_title || 'مخرج فني معتمد'}
                                </h4>

                                <div class="portal-deliverable-snippet" dangerouslySetInnerHTML=${{ __html: d.content || d.payload || '' }}></div>
                            </div>

                            <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--wp-border)', paddingTop: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
                                <span style=${{ fontSize: '0.78rem', color: 'var(--wp-text-muted)' }}>
                                    بواسطة: ${d.author_name || 'فريق العمل'}
                                </span>

                                <div style=${{ display: 'flex', gap: '6px' }}>
                                    ${d.file_url ? html`
                                        <a href="${d.file_url}" target="_blank" download class="btn-portal btn-portal-outline btn-portal-sm">
                                            <i class="dashicons dashicons-download"></i>
                                            <span>تحميل</span>
                                        </a>
                                    ` : null}

                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-primary btn-portal-sm"
                                        onClick=${() => onOpenDeliverablePreview(d)}
                                    >
                                        <i class="dashicons dashicons-visibility"></i>
                                        <span>معاينة وتوقيع</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        </div>
    `;
}
