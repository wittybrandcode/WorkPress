/**
 * WorkPress Client Portal: Deliverable Preview & Evidence Modal
 * 
 * @package WorkPress
 * @subpackage Portal/Components/Modals
 */

import { html } from '../../utils/html.js';
import { formatDate } from '../../utils/portalHelpers.js';

export default function DeliverablePreviewModal({
    isOpen,
    onClose,
    deliverable,
    onOpenSignoff
}) {
    if (!isOpen || !deliverable) return null;

    return html`
        <div class="portal-modal-overlay" onClick=${onClose}>
            <div class="portal-modal-canvas" style=${{ maxWidth: '720px' }} onClick=${e => e.stopPropagation()}>
                
                <div class="portal-modal-header">
                    <div>
                        <span class="portal-badge portal-badge-success mb-1">
                            <i class="dashicons dashicons-yes"></i>
                            <span>مخرج فني معتمد</span>
                        </span>
                        <h2 style=${{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--wp-text-main)' }}>
                            ${deliverable.title || deliverable.task_title || 'تفاصيل المخرج المعتمد'}
                        </h2>
                    </div>
                    <button type="button" class="btn-portal btn-portal-outline btn-portal-sm" onClick=${onClose}>
                        <i class="dashicons dashicons-no-alt"></i>
                    </button>
                </div>

                <div class="portal-modal-body">
                    <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--wp-bg-subtle)', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                        <span>المكلف بالحل: <strong>${deliverable.author_name || 'فريق العمل'}</strong></span>
                        <span>تاريخ الاعتماد: <strong>${formatDate(deliverable.created_at)}</strong></span>
                    </div>

                    <div class="portal-evidence-content" style=${{ background: '#ffffff', border: '1px solid var(--wp-border)', padding: '1.25rem', minHeight: '160px', maxHeight: '400px', overflowY: 'auto', lineHeight: 1.6 }} dangerouslySetInnerHTML=${{ __html: deliverable.content || deliverable.payload || '' }}>
                    </div>

                    ${deliverable.file_url ? html`
                        <div style=${{ marginTop: '1rem', padding: '0.75rem', background: 'var(--wp-bg-subtle)', border: '1px solid var(--wp-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style=${{ fontSize: '0.82rem', fontWeight: 700 }}>الملف المرفق مع المخرج:</span>
                            <a href="${deliverable.file_url}" target="_blank" download class="btn-portal btn-portal-primary btn-portal-sm">
                                <i class="dashicons dashicons-download"></i>
                                <span>تنزيل الملف المرفق</span>
                            </a>
                        </div>
                    ` : null}

                    <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--wp-border)', paddingTop: '1rem' }}>
                        <button type="button" class="btn-portal btn-portal-outline" onClick=${onClose}>
                            إغلاق المعاينة
                        </button>

                        <button 
                            type="button" 
                            class="btn-portal btn-portal-primary"
                            onClick=${() => {
                                onClose();
                                onOpenSignoff(deliverable);
                            }}
                        >
                            <i class="dashicons dashicons-edit"></i>
                            <span>الانتقال للتوقيع الرقمي والاستلام</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
