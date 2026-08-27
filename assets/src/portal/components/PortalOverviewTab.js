/**
 * WorkPress Client Portal Overview Tab Component
 * 
 * Displays project cover, hero info, and KPI radar cards.
 * 
 * @package WorkPress
 * @subpackage Portal/Components
 */

import { html } from '../utils/html.js';
import { formatDate } from '../utils/portalHelpers.js';

export default function PortalOverviewTab({ projectData, onOpenReport }) {
    if (!projectData) return null;

    return html`
        <div class="portal-tab-content">
            <!-- Project Cover (If present) -->
            ${projectData.cover_url ? html`
                <div class="portal-cover-wrapper">
                    <img src="${projectData.cover_url}" alt="${projectData.name}" class="portal-cover-image" />
                </div>
            ` : null}

            <!-- Project Hero Card -->
            <div class="portal-project-hero">
                <div class="portal-project-info">
                    <div style=${{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                        <span class="portal-prefix-tag">${projectData.prefix || 'PRJ'}</span>
                        <h1 style=${{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--wp-text-main)' }}>${projectData.name}</h1>
                    </div>
                    <p style=${{ color: 'var(--wp-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        ${projectData.description || 'مساحة المتابعة التنفيذية واستلام المخرجات المعتمدة'}
                    </p>
                </div>
            </div>

            <!-- KPI Radar Cards -->
            <div class="portal-kpi-grid">
                <div class="portal-kpi-card">
                    <span class="portal-kpi-label">حالة المشروع</span>
                    <span class="portal-kpi-value" style=${{ color: 'var(--wp-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i class="dashicons dashicons-yes-alt"></i>
                        <span>${projectData.status === 'completed' ? 'مكتمل ومسلّم' : (projectData.status === 'frozen' ? 'مجمد في الثلاجة' : 'نشط وفق الخطة')}</span>
                    </span>
                </div>

                <div class="portal-kpi-card">
                    <span class="portal-kpi-label">قائد المشروع المكلف</span>
                    <span class="portal-kpi-value" style=${{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i class="dashicons dashicons-admin-users" style=${{ color: 'var(--wp-indigo)' }}></i>
                        <span>${projectData.lead ? projectData.lead.name : 'فريق العمل'}</span>
                    </span>
                </div>

                <div class="portal-kpi-card">
                    <span class="portal-kpi-label">الموعد المستهدف للتسليم</span>
                    <span class="portal-kpi-value" style=${{ fontSize: '1.05rem', color: 'var(--wp-warning-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i class="dashicons dashicons-calendar-alt"></i>
                        <span>${projectData.due_at ? formatDate(projectData.due_at) : 'قيد التحديد'}</span>
                    </span>
                </div>

                <div class="portal-kpi-card">
                    <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span class="portal-kpi-label">نسبة الإنجاز</span>
                        <span style=${{ fontWeight: 800, color: 'var(--wp-primary)' }}>${projectData.progress || 0}%</span>
                    </div>
                    <div class="portal-progress-track">
                        <div class="portal-progress-fill" style=${{ width: `${projectData.progress || 0}%` }}></div>
                    </div>
                </div>
            </div>

            <!-- Official Report Quick Action Banner -->
            <div class="portal-report-banner">
                <div>
                    <div style=${{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '1.05rem', color: '#065f46', marginBottom: '0.25rem' }}>
                        <i class="dashicons dashicons-awards" style=${{ fontSize: '22px' }}></i>
                        <span>وثيقة وتقرير الاستلام الرسمي للمشروع</span>
                    </div>
                    <p style=${{ fontSize: '0.85rem', color: 'var(--wp-text-secondary)', margin: 0 }}>
                        تتضمن وثيقة الاستلام الشاملة حصر كافة الحلول المعتمدة، مؤشرات الإنجاز، وبيانات التوقيع والاستلام الرسمي.
                    </p>
                </div>
                <button 
                    type="button" 
                    class="btn-portal btn-portal-primary btn-portal-sm"
                    onClick=${onOpenReport}
                >
                    <i class="dashicons dashicons-printer"></i>
                    <span>استعراض وطباعة التقرير (PDF)</span>
                </button>
            </div>
        </div>
    `;
}
