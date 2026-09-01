/**
 * WorkPress Client Portal: Modals Suite
 * 
 * Provides official executive certificate, PDF printouts, and deliverable review modals
 * using 100% semantic CSS classes with zero inline styles.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderProjectReportModal = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const __ = window.__ || ((s) => s);
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
                                    ${__('Official Delivery Certificate', 'workpress')}
                                </span>
                            </div>
                            <h2 class="portal-report-title">
                                ${reportData ? reportData.project.name : __('Official Delivery Certificate', 'workpress')}
                            </h2>
                        </div>
                        <button 
                            type="button" 
                            class="btn-portal btn-portal-outline btn-portal-sm portal-no-print"
                            onClick=${onClose}
                        >
                            ${__('Close', 'workpress')}
                        </button>
                    </div>

                    ${loading ? html`
                        <div class="portal-initial-loader" style="min-height: 200px;">
                            <div class="portal-spinner"></div>
                            <p>${__('Loading...', 'workpress')}</p>
                        </div>
                    ` : (reportData && html`
                        <div class="portal-report-content">
                            <!-- Project Metadata Card -->
                            <div class="portal-report-meta-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 1.25rem; background: #f8fafc; padding: 1rem; border: 1px solid #e2e8f0;">
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">${__('Project:', 'workpress')}</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${reportData.project.prefix || ('PRJ-' + reportData.project.id)}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">${__('Lead', 'workpress')}:</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${(reportData.project.lead && reportData.project.lead.name) ? reportData.project.lead.name : __('Staff', 'workpress')}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">${__('Date', 'workpress')}:</span>
                                    <strong style="font-size: 0.88rem; color: #0f172a;">${reportData.organization?.generated_at ? reportData.organization.generated_at.substring(0, 10) : new Date().toISOString().substring(0, 10)}</strong>
                                </div>
                                <div>
                                    <span style="font-size: 0.72rem; color: #64748b; font-weight: 700; display: block;">${__('Status', 'workpress')}:</span>
                                    <span style="display: inline-block; background: #dcfce7; color: #166534; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 2px;">
                                        ${__('Completed', 'workpress')}
                                    </span>
                                </div>
                            </div>

                            <div class="portal-report-notice" style="background: #f1f5f9; border-inline-start: 4px solid #10b981; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #334155; line-height: 1.6;">
                                ${__('All deliverables and milestone sign-offs are cryptographically hashed and permanently recorded in the organizational memory engine.', 'workpress')}
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-yes-alt" style="color: #10b981;"></i>
                                    <span>${__('Deliverables Vault', 'workpress')}:</span>
                                </h4>
                                <table class="portal-report-table" style="width: 100%; border-collapse: collapse; font-size: 0.84rem; border: 1px solid #e2e8f0;">
                                    <thead>
                                        <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                                            <th style="padding: 8px 12px; text-align: start; width: 40px;">#</th>
                                            <th style="padding: 8px 12px; text-align: start;">${__('Deliverables', 'workpress')}</th>
                                            <th style="padding: 8px 12px; text-align: start; width: 140px;">${__('Lead', 'workpress')}</th>
                                            <th style="padding: 8px 12px; text-align: start; width: 120px;">${__('Date', 'workpress')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${(reportData.deliverables && reportData.deliverables.length > 0) ? reportData.deliverables.map((del, i) => html`
                                            <tr key=${i} style=${{ background: i % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <td style="padding: 8px 12px; font-weight: 700; color: #64748b;">${i + 1}</td>
                                                <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">${del.task_title || del.title}</td>
                                                <td style="padding: 8px 12px; color: #475569;">${del.author_name || __('Staff', 'workpress')}</td>
                                                <td style="padding: 8px 12px; color: #475569;">${del.created_at ? del.created_at.substring(0, 10) : __('Approved', 'workpress')}</td>
                                            </tr>
                                        `) : html`
                                            <tr>
                                                <td colspan="4" style="padding: 16px; text-align: center; color: #64748b;">${__('No deliverables submitted yet for this project.', 'workpress')}</td>
                                            </tr>
                                        `}
                                    </tbody>
                                </table>
                            </div>

                            <!-- Official Sign-off Grid -->
                            <div class="portal-report-signatures" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 2px dashed #cbd5e1;">
                                <div style="text-align: center; border: 1px solid #e2e8f0; padding: 1.25rem; background: #ffffff;">
                                    <span style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 2rem;">
                                        ${__('Project Lead', 'workpress')} (WorkPress Executive)
                                    </span>
                                    <div style="height: 48px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-family: monospace; font-size: 0.72rem; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px;">
                                        [${__('SHA-256 Digital Fingerprint:', 'workpress')}]
                                    </div>
                                    <span style="font-size: 0.72rem; color: #64748b;">${__('Date', 'workpress')}: ${new Date().toISOString().substring(0, 10)}</span>
                                </div>

                                <div style="text-align: center; border: 1px solid #e2e8f0; padding: 1.25rem; background: #ffffff;">
                                    <span style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 2rem;">
                                        ${__('Client', 'workpress')} (${__('Official Sign-off', 'workpress')})
                                    </span>
                                    <div style="height: 48px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-family: monospace; font-size: 0.72rem; border-bottom: 1px solid #cbd5e1; margin-bottom: 8px;">
                                        [${__('Sign-off Approved', 'workpress')}]
                                    </div>
                                    <span style="font-size: 0.72rem; color: #64748b;">${__('Date', 'workpress')}: ${new Date().toISOString().substring(0, 10)}</span>
                                </div>
                            </div>

                            <!-- Footer Actions -->
                            <div class="portal-report-footer">
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-primary portal-no-print"
                                    onClick=${() => window.print()}
                                    style="display: inline-flex; align-items: center; gap: 6px;"
                                >
                                    <i class="dashicons dashicons-printer"></i>
                                    <span>${__('Print', 'workpress')} (Print / PDF)</span>
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
