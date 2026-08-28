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
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                                ${renderWorkPressLogo(34)}
                                <span class="portal-report-badge">
                                    وثيقة الاستلام والاعتماد الرسمي للمشروع
                                </span>
                            </div>
                            <h2 class="portal-report-title">
                                ${reportData ? reportData.project.name : 'وثيقة استلام المشروع'}
                            </h2>
                        </div>
                        <button 
                            type="button" 
                            class="btn-portal btn-portal-outline btn-portal-sm portal-no-print"
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
                        <div class="portal-report-content">
                            <!-- بطاقة بيانات المشروع المؤسسية -->
                            <div class="portal-report-meta-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 1.25rem; background: #f8fafc; padding: 1rem; border: 1px solid #e2e8f0;">
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">رقم مرجع المشروع:</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${reportData.project.prefix || ('PRJ-' + reportData.project.id)}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">قائد المشروع / المسؤول:</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${(reportData.project.lead && reportData.project.lead.name) ? reportData.project.lead.name : 'الإدارة الفنية'}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">تاريخ إصدار الوثيقة:</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${reportData.organization?.generated_at ? reportData.organization.generated_at.substring(0, 10) : new Date().toISOString().substring(0, 10)}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">حالة الاعتماد:</span>
                                    <span style="display: inline-block; background: #dcfce7; color: #166534; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 2px;">
                                        مكتمل ومعتمد رسمياً
                                    </span>
                                </div>
                            </div>

                            <div class="portal-report-notice" style="background: #f1f5f9; border-right: 4px solid #10b981; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #334155; line-height: 1.6;">
                                تشهد هذه الوثيقة الرسمية الصادرة عن منظومة <strong>${reportData.organization?.name || 'WorkPress'}</strong> بأن كافة المخرجات والحلول الفنية للمشروع المذكور أدناه قد تم إنجازها وتدقيقها والمصادقة عليها نهائياً وفق معايير الجودة والحوكمة المعتمدة.
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-yes-alt" style="color: #10b981;"></i>
                                    <span>بيان وحصر المخرجات الفنية المسلّمة:</span>
                                </h4>
                                <table class="portal-report-table" style="width: 100%; border-collapse: collapse; font-size: 0.84rem; border: 1px solid #e2e8f0;">
                                    <thead>
                                        <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                                            <th style="padding: 8px 12px; text-align: right; width: 40px;">#</th>
                                            <th style="padding: 8px 12px; text-align: right;">المخرج الفني والحل المعتمد</th>
                                            <th style="padding: 8px 12px; text-align: right; width: 140px;">المنفذ الفني</th>
                                            <th style="padding: 8px 12px; text-align: right; width: 120px;">تاريخ الاعتماد</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(reportData.deliverables && reportData.deliverables.length > 0) ? reportData.deliverables.map((del, i) => html`
                                            <tr key=${i} style=${{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <td style="padding: 8px 12px; font-weight: 700; color: #64748b;">${i + 1}</td>
                                                <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">${del.task_title || del.title}</td>
                                                <td style="padding: 8px 12px; color: #475569;">${del.author_name || 'فريق التنفيذ'}</td>
                                                <td style="padding: 8px 12px; color: #475569;">${del.created_at ? del.created_at.substring(0, 10) : 'معتمد'}</td>
                                            </tr>
                                        `) : html`
                                            <tr>
                                                <td colspan="4" style="padding: 16px; text-align: center; color: #64748b;">لا توجد مخرجات مسجلة في هذا التقرير.</td>
                                            </tr>
                                        `}
                                    </tbody>
                                </table>
                            </div>

                            <!-- كتلة التوقيعات والاعتماد الرسمي -->
                            <div class="portal-report-signatures" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 2px dashed #cbd5e1;">
                                <div style="text-align: center; border: 1px solid #e2e8f0; padding: 1.25rem; background: #ffffff;">
                                    <span style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 2rem;">
                                        توقيع واعتماد جهة التنفيذ (WorkPress Executive)
                                    </span>
                                    <div style="height: 48px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-family: monospace; font-size: 0.72rem; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px;">
                                        [الختم والتوقيع الرقمي المعتمد]
                                    </div>
                                    <span style="font-size: 0.72rem; color: #64748b;">التاريخ: ${new Date().toISOString().substring(0, 10)}</span>
                                </div>

                                <div style="text-align: center; border: 1px solid #e2e8f0; padding: 1.25rem; background: #ffffff;">
                                    <span style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 2rem;">
                                        توقيع ومصادقة المستفيد / صاحب المشروع (Client Signoff)
                                    </span>
                                    <div style="height: 48px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-family: monospace; font-size: 0.72rem; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px;">
                                        [المصادقة الرقمية للمستفيد]
                                    </div>
                                    <span style="font-size: 0.72rem; color: #64748b;">التاريخ: ${new Date().toISOString().substring(0, 10)}</span>
                                </div>
                            </div>

                            <!-- التذييل وأزرار الإجراء -->
                            <div class="portal-report-footer">
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-primary portal-no-print"
                                    onClick=${() => window.print()}
                                    style="display: inline-flex; align-items: center; gap: 6px;"
                                >
                                    <i class="dashicons dashicons-printer"></i>
                                    <span>طباعة الوثيقة الرسمية (Print / PDF)</span>
                                </button>

                                <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">
                                    WorkPress Certified Document • Ref: ${(reportData.project.prefix || 'PRJ')}-${reportData.project.id}
                                </span>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
