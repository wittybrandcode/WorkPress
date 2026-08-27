/**
 * WorkPress Client Portal: Official Project Report Modal (Print & PDF Canvas)
 * 
 * @package WorkPress
 * @subpackage Portal/Components/Modals
 */

import { html } from '../../utils/html.js';
import WorkPressLogo from '../../../components/WorkPressLogo.js';
import { formatDate } from '../../utils/portalHelpers.js';

export default function OfficialReportModal({
    isOpen,
    onClose,
    reportData,
    loading
}) {
    if (!isOpen) return null;

    const version = window.workpressPortalConfig?.version || '2.2.1';

    return html`
        <div class="portal-modal-overlay" onClick=${onClose}>
            <div class="portal-modal-canvas" style=${{ maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }} onClick=${e => e.stopPropagation()}>
                
                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--wp-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                    <div>
                        <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <${WorkPressLogo} height=${32} />
                            <span style=${{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--wp-text-muted)', borderRight: '1px solid var(--wp-border)', paddingRight: '8px', marginRight: '8px' }}>
                                تقرير الاستلام الرسمي
                            </span>
                        </div>
                        <h2 style=${{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--wp-text-main)', marginTop: '0.5rem' }}>
                            ${reportData ? reportData.project.name : 'وثيقة استلام المشروع'}
                        </h2>
                    </div>
                    <button 
                        type="button" 
                        class="btn-portal btn-portal-outline btn-portal-sm"
                        onClick=${onClose}
                    >
                        إغلاق
                    </button>
                </div>

                ${loading ? html`
                    <div class="portal-initial-loader" style=${{ minHeight: '200px' }}>
                        <div class="portal-spinner"></div>
                        <p>جاري تحضير وثيقة الاستلام الرسمية...</p>
                    </div>
                ` : (reportData && html`
                    <div>
                        <div style=${{ background: 'var(--wp-bg-subtle)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--wp-text-secondary)' }}>
                            تشهد هذه الوثيقة باعتماد الحلول والمخرجات الفنية للمشروع وفق معايير الجودة والحوكمة المعتمدة في WorkPress.
                        </div>

                        <div style=${{ marginBottom: '1.5rem' }}>
                            <h4 style=${{ fontSize: '1rem', fontWeight: 800, color: 'var(--wp-text-main)', marginBottom: '0.6rem' }}>حصر المخرجات المعتمدة:</h4>
                            <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style=${{ background: 'var(--wp-bg-subtle)', borderBottom: '2px solid var(--wp-border)', textAlign: 'right' }}>
                                        <th style=${{ padding: '0.6rem' }}>#</th>
                                        <th style=${{ padding: '0.6rem' }}>المخرج الفني</th>
                                        <th style=${{ padding: '0.6rem' }}>المكلف</th>
                                        <th style=${{ padding: '0.6rem' }}>تاريخ الاعتماد</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(reportData.deliverables || []).map((del, i) => html`
                                        <tr key=${i} style=${{ borderBottom: '1px solid var(--wp-border)' }}>
                                            <td style=${{ padding: '0.6rem' }}>${i + 1}</td>
                                            <td style=${{ padding: '0.6rem', fontWeight: 700 }}>${del.task_title || del.title}</td>
                                            <td style=${{ padding: '0.6rem' }}>${del.author_name || 'فريق العمل'}</td>
                                            <td style=${{ padding: '0.6rem' }}>${formatDate(del.created_at)}</td>
                                        </tr>
                                    `)}
                                </tbody>
                            </table>
                        </div>

                        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--wp-border)', paddingTop: '1.25rem', marginTop: '2rem' }}>
                            <button 
                                type="button" 
                                class="btn-portal btn-portal-primary"
                                onClick=${() => window.print()}
                            >
                                <i class="dashicons dashicons-printer"></i>
                                <span>طباعة الوثيقة الرسمية (Print/PDF)</span>
                            </button>

                            <span style=${{ fontSize: '0.78rem', color: 'var(--wp-text-muted)' }}>
                                WorkPress Organizational Memory Engine v${version}
                            </span>
                        </div>
                    </div>
                `)}
            </div>
        </div>
    `;
}
