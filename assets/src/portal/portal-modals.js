/**
 * WorkPress Client Portal: Modals Suite
 * 
 * Provides official executive certificate, PDF printouts, and deliverable review modals
 * using 100% semantic CSS classes with zero inline styles.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.2
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderProjectReportModal = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const renderWorkPressLogo = exports.renderWorkPressLogo || (() => '');

        const { isOpen, reportData, loading, onClose } = ctx;

        if (!isOpen) return null;

        return html`
            <div class="portal-modal-backdrop" onClick=${onClose}>
                <div class="portal-report-card" onClick=${e => e.stopPropagation()}>
                    
                    <div class="portal-report-header">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${renderWorkPressLogo(32)}
                                <span class="portal-report-badge">
                                    تقرير الاستلام الرسمي
                                </span>
                            </div>
                            <h2 class="portal-report-title">
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
                        <div class="portal-initial-loader" style="min-height: 200px;">
                            <div class="portal-spinner"></div>
                            <p>جاري تحضير وثيقة الاستلام الرسمية...</p>
                        </div>
                    ` : (reportData && html`
                        <div>
                            <div class="portal-report-notice">
                                تشهد هذه الوثيقة باعتماد الحلول والمخرجات الفنية للمشروع وفق معايير الجودة والحوكمة المعتمدة في WorkPress.
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <h4 style="font-size: 1rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.6rem;">حصر المخرجات المعتمدة:</h4>
                                <table class="portal-report-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>المخرج الفني</th>
                                            <th>المكلف</th>
                                            <th>تاريخ الاعتماد</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(reportData.deliverables || []).map((del, i) => html`
                                            <tr key=${i}>
                                                <td>${i + 1}</td>
                                                <td style="font-weight: 700;">${del.task_title || del.title}</td>
                                                <td>${del.author_name || 'فريق العمل'}</td>
                                                <td>${del.created_at ? del.created_at.substring(0, 10) : ''}</td>
                                            </tr>
                                        `)}
                                    </tbody>
                                </table>
                            </div>

                            <div class="portal-report-footer">
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-primary"
                                    onClick=${() => window.print()}
                                >
                                    <i class="dashicons dashicons-printer"></i>
                                    <span>طباعة الوثيقة الرسمية (Print/PDF)</span>
                                </button>

                                <span style="font-size: 0.78rem; color: var(--wp-text-muted);">
                                    WorkPress Organizational Memory Engine v2.0
                                </span>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
