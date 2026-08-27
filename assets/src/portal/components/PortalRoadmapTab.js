/**
 * WorkPress Client Portal Roadmap Tab Component
 * 
 * Displays milestones, project phases, and progress timeline.
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html } from '../utils/html.js';
import { formatDate } from '../utils/portalHelpers.js';

export default function PortalRoadmapTab({ milestones = [] }) {
    return html`
        <div class="portal-tab-content">
            <div style=${{ marginBottom: '1.25rem' }}>
                <h3 style=${{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wp-text-main)', margin: '0 0 0.25rem 0' }}>
                    مراحل وخطة الإنجاز التنفيذية:
                </h3>
                <span style=${{ fontSize: '0.8rem', color: 'var(--wp-text-muted)' }}>
                    متابعة حية لتطور مراحل المشروع والمهام المنجزة
                </span>
            </div>

            ${milestones.length === 0 ? html`
                <div class="wp-portal-card" style=${{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <i class="dashicons dashicons-clipboard" style=${{ fontSize: '38px', height: '38px', width: '38px', color: 'var(--wp-text-muted)', marginBottom: '0.75rem', display: 'inline-block' }}></i>
                    <p style=${{ color: 'var(--wp-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        يقوم مدير المشروع حالياً بهيكلة المراحل وتوزيع المهام على الفريق الفني.
                    </p>
                </div>
            ` : html`
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    ${milestones.map((m, idx) => {
                        const isDone = m.status === 'completed' || m.status === 'closed';
                        const inProg = m.status === 'in_progress' || m.status === 'assigned';

                        return html`
                            <div 
                                key=${m.id || idx} 
                                class="wp-portal-card" 
                                style=${{ borderRight: `4px solid ${isDone ? 'var(--wp-primary)' : (inProg ? 'var(--wp-warning)' : 'var(--wp-border)')}` }}
                            >
                                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span class="portal-badge portal-badge-subtle">
                                            مرحلة ${idx + 1}
                                        </span>
                                        <h4 style=${{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--wp-text-main)' }}>
                                            ${m.title || m.name}
                                        </h4>
                                    </div>

                                    <span class=${`portal-badge ${isDone ? 'portal-badge-success' : (inProg ? 'portal-badge-warning' : 'portal-badge-subtle')}`}>
                                        <i class=${`dashicons ${isDone ? 'dashicons-yes' : (inProg ? 'dashicons-update' : 'dashicons-clock')}`}></i>
                                        <span>${isDone ? 'منجزة بالكامل' : (inProg ? 'قيد التنفيذ' : 'مجدولة')}</span>
                                    </span>
                                </div>

                                <p style=${{ fontSize: '0.85rem', color: 'var(--wp-text-secondary)', margin: '0.4rem 0' }}>
                                    ${m.description || 'تنفيذ المهام والمخرجات الفنية المقررة للمرحلة.'}
                                </p>

                                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--wp-text-muted)', borderTop: '1px solid var(--wp-border-subtle)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                                    <span>الموعد المحدد: ${m.due_date ? formatDate(m.due_date) : 'وفق الخطة'}</span>
                                    <span>المهام المكتملة: ${m.completed_tasks || 0} / ${m.total_tasks || 0}</span>
                                </div>
                            </div>
                        `;
                    })}
                </div>
            `}
        </div>
    `;
}
