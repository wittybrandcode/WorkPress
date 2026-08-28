/**
 * WorkPress Client Portal: Workspace & Project Dashboard Views
 * 
 * Provides:
 * - Onboarding Gate (for 0 projects)
 * - Active Project Dashboard & Radar Cards
 * - Deliverables Vault & Downloads
 * - Milestones Roadmap & Task Hierarchy
 * - Discussion, Inquiries & Revision Requests Stream
 * - My Submitted Requests Archive
 * 
 * Uses 100% semantic CSS classes with zero inline styles.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.2
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    function renderWorkspaceContent(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);

        const {
            projects = [], projectData = {}, selectedProjectId, activeTab,
            deliverables = [], milestones = [], requests = [],
            reqPage = 1, setReqPage = () => {},
            feedbackTask, feedbackActionType, feedbackMsg, feedbackSuccess, feedbackError, feedbackSubmitting,
            onNavigateToTab, onOpenProjectReport,
            onFeedbackTaskChange, onFeedbackActionTypeChange, onFeedbackMsgChange, onFeedbackSubmit
        } = ctx;

        // Dedicated View for "My Requests" tab
        if (activeTab === 'my-requests') {
            const allReqs = (requests && requests.length > 0) ? requests : projects.filter(p => p.is_client_request);
            const REQS_PER_PAGE = 6;
            const totalReqPages = Math.ceil(allReqs.length / REQS_PER_PAGE);
            const paginatedReqs = allReqs.slice((reqPage - 1) * REQS_PER_PAGE, reqPage * REQS_PER_PAGE);

            return html`
                <div class="portal-workspace-wrapper">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.25rem;">
                                سجل طلبات المشاريع والخدمات المقدمة
                            </h2>
                            <p style="font-size: 0.85rem; color: var(--wp-text-muted);">
                                متابعة فورية لحالة دراسة واعتماد وتحويل طلباتك الفنية إلى مشاريع قيد التنفيذ
                            </p>
                        </div>

                        <button 
                            class="btn-portal btn-portal-primary btn-portal-sm"
                            onClick=${() => onNavigateToTab('new-request')}
                        >
                            <i class="dashicons dashicons-plus-alt2"></i>
                            <span>تقديم طلب جديد</span>
                        </button>
                    </div>

                    ${allReqs.length === 0 ? html`
                        <div class="wp-portal-card portal-empty-state">
                            <i class="dashicons dashicons-inbox portal-empty-icon"></i>
                            <h3 class="portal-empty-title">لا توجد طلبات سابقة مسجلة</h3>
                            <p class="portal-empty-desc">
                                يمكنك تقديم طلب مشروع أو خدمة جديدة في أي وقت وسيقوم الفريق الفني بمراجعته واعتماده فوراً.
                            </p>
                            <button 
                                class="btn-portal btn-portal-primary"
                                onClick=${() => onNavigateToTab('new-request')}
                            >
                                <span>تقديم أول طلب الآن</span>
                            </button>
                        </div>
                    ` : html`
                        <div>
                            <div class="portal-vault-grid">
                                ${paginatedReqs.map(r => {
                                    let statusLabel = 'طلب قيد المراجعة والدراسة';
                                    let badgeClass = 'var(--wp-warning-light)';
                                    let borderClass = 'var(--wp-warning-border)';
                                    let textClass = 'var(--wp-warning-text)';

                                    if (r.status === 'approved') {
                                        statusLabel = 'معتمد ومحول لمشروع';
                                        badgeClass = 'var(--wp-primary-light)';
                                        borderClass = 'var(--wp-primary-border)';
                                        textClass = '#065f46';
                                    } else if (r.status === 'rejected') {
                                        statusLabel = 'معتذر عنه';
                                        badgeClass = '#fef2f2';
                                        borderClass = '#fecaca';
                                        textClass = '#dc2626';
                                    }

                                    return html`
                                        <div key=${r.id} class="wp-portal-card">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
                                                <span style="background: ${badgeClass}; border: 1px solid ${borderClass}; color: ${textClass}; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
                                                    <i class="dashicons dashicons-clock" style="font-size: 14px;"></i>
                                                    <span>${statusLabel}</span>
                                                </span>
                                                <span style="font-size: 0.75rem; color: var(--wp-text-muted);">${r.created_at ? r.created_at.substring(0, 10) : ''}</span>
                                            </div>
                                            <h4 style="font-size: 1rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.4rem;">${r.title || r.name}</h4>
                                            <p style="font-size: 0.85rem; color: var(--wp-text-secondary); line-height: 1.5; margin-bottom: 1rem;">${r.description || 'لا يوجد بيان إضافي.'}</p>
                                        </div>
                                    `;
                                })}
                            </div>

                            ${totalReqPages > 1 ? html`
                                <div class="portal-pagination-bar">
                                    <button 
                                        type="button" 
                                        class="portal-page-btn is-nav" 
                                        disabled=${reqPage <= 1}
                                        onClick=${() => setReqPage(reqPage - 1)}
                                    >
                                        <i class="dashicons dashicons-arrow-right-alt2"></i>
                                        <span>السابق</span>
                                    </button>

                                    <div class="portal-page-numbers">
                                        ${Array.from({ length: totalReqPages }, (_, i) => i + 1).map(p => html`
                                            <button 
                                                key=${p}
                                                type="button" 
                                                class="portal-page-num ${p === reqPage ? 'is-active' : ''}"
                                                onClick=${() => setReqPage(p)}
                                            >
                                                ${p}
                                            </button>
                                        `)}
                                    </div>

                                    <button 
                                        type="button" 
                                        class="portal-page-btn is-nav" 
                                        disabled=${reqPage >= totalReqPages}
                                        onClick=${() => setReqPage(reqPage + 1)}
                                    >
                                        <span>التالي</span>
                                        <i class="dashicons dashicons-arrow-left-alt2"></i>
                                    </button>
                                </div>
                            ` : null}
                        </div>
                    `}
                </div>
            `;
        }

        return html`
            <div>
                <!-- 1. ONBOARDING GATE (When user has 0 projects) -->
                ${activeTab !== 'new-request' && projects.length === 0 && html`
                    <div class="portal-gatekeeper-card">
                        <div class="portal-gatekeeper-icon">
                            <i class="dashicons dashicons-portfolio"></i>
                        </div>
                        <h2 class="portal-gate-title">
                            مرحباً بك في مساحة المشاريع والخدمات
                        </h2>
                        <p class="portal-gate-desc">
                            حسابك مسجل بنجاح في المنظومة. يمكنك البدء الآن بتقديم طلب مشروع أو خدمة جديدة لتصل مباشرة للإدارة العامة للمراجعة والاعتماد.
                        </p>
                        <button 
                            class="btn-portal btn-portal-primary portal-gate-btn" 
                            onClick=${() => onNavigateToTab('new-request')}
                        >
                            <i class="dashicons dashicons-plus-alt2"></i>
                            <span>تقديم طلب مشروع جديد</span>
                        </button>
                    </div>
                `}

                <!-- 2. ACTIVE PROJECT DASHBOARD -->
                ${activeTab !== 'new-request' && projects.length > 0 && projectData && html`
                    <div>
                        <!-- Project Cover Image (If available) -->
                        ${projectData.cover_url ? html`
                            <div class="portal-project-cover-box">
                                <img src="${projectData.cover_url}" alt="${projectData.name}" class="portal-project-cover-img" />
                            </div>
                        ` : null}

                        <!-- Project Hero Bar -->
                        <div class="portal-project-hero">
                            <div class="portal-project-info">
                                <div class="portal-project-title-row">
                                    <span class="portal-project-prefix-badge">
                                        ${projectData.prefix}
                                    </span>
                                    <h1 style="margin: 0;">${projectData.name}</h1>
                                </div>
                                <p>${projectData.description || 'مساحة المتابعة التنفيذية واستلام المخرجات المعتمدة'}</p>
                            </div>
                        </div>

                        <!-- KPI Radar Cards -->
                        <div class="portal-kpi-grid">
                            <div class="portal-kpi-card">
                                <span class="portal-kpi-label">حالة المشروع</span>
                                <span class="portal-kpi-value portal-kpi-status-val">
                                    <i class="dashicons dashicons-yes-alt"></i>
                                    <span>${projectData.status === 'completed' ? 'مكتمل ومسلّم' : (projectData.status === 'frozen' ? 'مجمد في الثلاجة' : 'نشط وفق الخطة')}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <span class="portal-kpi-label">قائد المشروع المكلف</span>
                                <span class="portal-kpi-value portal-kpi-lead-val">
                                    <i class="dashicons dashicons-admin-users" style="color: var(--wp-indigo);"></i>
                                    <span>${projectData.lead ? projectData.lead.name : 'فريق العمل'}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <span class="portal-kpi-label">الموعد المستهدف للتسليم</span>
                                <span class="portal-kpi-value portal-kpi-due-val">
                                    <i class="dashicons dashicons-calendar-alt"></i>
                                    <span>${projectData.due_at ? projectData.due_at.substring(0, 10) : 'قيد التحديد'}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <div class="portal-kpi-progress-row">
                                    <span class="portal-kpi-label">نسبة الإنجاز</span>
                                    <span class="portal-kpi-progress-text">${projectData.progress}%</span>
                                </div>
                                <div class="portal-progress-track">
                                    <div class="portal-progress-fill" style="width: ${projectData.progress}%;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Tab 1: Deliverables Vault -->
                        ${activeTab === 'deliverables' && html`
                            <div>
                                <!-- Official Project Sign-off & Certificate Banner -->
                                <div class="portal-signoff-banner">
                                    <div>
                                        <div class="portal-signoff-title">
                                            <i class="dashicons dashicons-awards" style="font-size: 22px;"></i>
                                            <span>وثيقة وتقرير الاستلام الرسمي للمشروع</span>
                                        </div>
                                        <p class="portal-signoff-desc">
                                            تتضمن وثيقة الاستلام الشاملة حصر كافة الحلول المعتمدة، مؤشرات الإنجاز، وبيانات التوقيع والاستلام الرسمي.
                                        </p>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-primary btn-portal-sm"
                                        onClick=${() => onOpenProjectReport(selectedProjectId)}
                                    >
                                        <i class="dashicons dashicons-printer"></i>
                                        <span>استعراض وطباعة التقرير (PDF)</span>
                                    </button>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                                    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--wp-text-main);">
                                        المخرجات والحلول الفنية المعتمدة:
                                    </h3>
                                    <span style="font-size: 0.8rem; color: var(--wp-text-muted);">
                                        ${deliverables.length} مخرج معتمد
                                    </span>
                                </div>

                                ${deliverables.length === 0 ? html`
                                    <div class="wp-portal-card portal-empty-state">
                                        <i class="dashicons dashicons-portfolio portal-empty-icon"></i>
                                        <h3 class="portal-empty-title">لا توجد مخرجات معتمدة نهائياً حتى اللحظة</h3>
                                        <p class="portal-empty-desc">
                                            عندما يقوم الفريق الفني برفع الحلول واعتمادها من قبل مدير المشروع، ستظهر ملفاتها وروابطها هنا مباشرة للتحميل والمصادقة.
                                        </p>
                                    </div>
                                ` : html`
                                    <div class="portal-vault-grid">
                                        ${deliverables.map(d => html`
                                            <div key=${d.id} class="wp-portal-card portal-vault-card">
                                                <div>
                                                    <div class="portal-vault-header">
                                                        <span class="portal-vault-approved-tag">
                                                            <i class="dashicons dashicons-yes" style="font-size: 14px;"></i>
                                                            <span>حل معتمد رسمي</span>
                                                        </span>
                                                        <span style="font-size: 0.75rem; color: var(--wp-text-muted);">${d.created_at ? d.created_at.substring(0, 10) : ''}</span>
                                                    </div>
                                                    <h4 class="portal-vault-title">
                                                        ${d.task_title || 'مخرج فني'}
                                                    </h4>
                                                    <div class="portal-vault-body" dangerouslySetInnerHTML=${{ __html: d.content || d.payload || '' }}></div>
                                                </div>

                                                <div class="portal-vault-footer">
                                                    <span style="font-size: 0.78rem; color: var(--wp-text-muted);">
                                                        بواسطة: <strong>${d.author_name || 'الفريق الفني'}</strong>
                                                    </span>

                                                    ${d.file_url ? html`
                                                        <a href="${d.file_url}" target="_blank" download class="btn-portal btn-portal-primary btn-portal-sm">
                                                            <i class="dashicons dashicons-download"></i>
                                                            <span>تنزيل الملف</span>
                                                        </a>
                                                    ` : null}
                                                </div>
                                            </div>
                                        `)}
                                    </div>
                                `}
                            </div>
                        `}

                        <!-- Tab 2: Milestones Roadmap -->
                        ${activeTab === 'milestones' && html`
                            <div>
                                <div style="margin-bottom: 1.25rem;">
                                    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--wp-text-main);">
                                        مراحل وخطة الإنجاز:
                                    </h3>
                                </div>

                                ${milestones.length === 0 ? html`
                                    <div class="wp-portal-card portal-empty-state">
                                        <i class="dashicons dashicons-clipboard portal-empty-icon"></i>
                                        <p style="color: var(--wp-text-secondary); font-size: 0.9rem;">يقوم مدير المشروع حالياً بهيكلة المراحل وتوزيع المهام على الفريق الفني.</p>
                                    </div>
                                ` : html`
                                    <div class="portal-milestones-list">
                                        ${milestones.map((m, idx) => {
                                            const isDone = m.status === 'completed' || m.status === 'closed';
                                            const inProg = m.status === 'in_progress' || m.status === 'assigned';

                                            return html`
                                                <div key=${m.id} class="wp-portal-card portal-milestone-card ${isDone ? 'is-done' : (inProg ? 'is-progress' : '')}">
                                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
                                                        <div style="display: flex; align-items: center; gap: 8px;">
                                                            <span class="portal-milestone-num ${isDone ? 'is-done' : ''}">
                                                                ${isDone ? html`<i class="dashicons dashicons-yes" style="font-size: 14px;"></i>` : (idx + 1)}
                                                            </span>
                                                            <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--wp-text-main); margin: 0;">
                                                                ${m.title}
                                                            </h4>
                                                        </div>
                                                        
                                                        <span class="portal-milestone-badge ${isDone ? 'is-done' : (inProg ? 'is-progress' : 'is-pending')}">
                                                            ${isDone ? 'مكتملة ومعتمدة' : (inProg ? 'قيد التنفيذ' : 'قيد الجدولة')}
                                                        </span>
                                                    </div>

                                                    ${m.description ? html`
                                                        <div class="portal-milestone-desc" dangerouslySetInnerHTML=${{ __html: m.description }}></div>
                                                    ` : null}

                                                    <div class="portal-milestone-meta">
                                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                                            ${m.due_at ? html`
                                                                <span style="color: var(--wp-warning-text); font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                                                    <i class="dashicons dashicons-calendar-alt"></i>
                                                                    <span>الموعد: ${m.due_at.substring(0, 10)}</span>
                                                                </span>
                                                            ` : null}
                                                            ${m.priority ? html`
                                                                <span>الأولوية: <strong>${m.priority === 'high' ? 'عالية' : 'عادية'}</strong></span>
                                                            ` : null}
                                                        </div>

                                                        ${m.assignees && m.assignees.length > 0 ? html`
                                                            <div style="display: flex; align-items: center; gap: 6px;">
                                                                <span style="font-size: 0.75rem;">المكلفون:</span>
                                                                ${m.assignees.map(a => html`
                                                                    <span key=${a.id} style="font-size: 0.78rem; font-weight: 700; color: var(--wp-text-secondary); background: var(--wp-bg-subtle); padding: 2px 8px;">
                                                                        ${a.name}
                                                                    </span>
                                                                `)}
                                                            </div>
                                                        ` : null}
                                                    </div>
                                                </div>
                                            `;
                                        })}
                                    </div>
                                `}
                            </div>
                        `}

                        <!-- Tab 3: Discussion & Feedback Stream -->
                        ${activeTab === 'feedback' && html`
                            <div style="max-width: 800px; margin: 0 auto;">
                                <div class="wp-portal-card" style="padding: 1.75rem;">
                                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.4rem;">
                                        إرسال استفسار أو ملاحظة حول المشروع
                                    </h3>
                                    <p style="font-size: 0.85rem; color: var(--wp-text-secondary); margin-bottom: 1.25rem;">
                                        ستصل ملاحظتك فوراً لمدير المشروع والفريق الفني وتُسجل كـ Evidence رسمي في خط زمن المهمة.
                                    </p>

                                    ${feedbackSuccess && html`
                                        <div style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; padding: 0.85rem 1rem; font-size: 0.88rem; font-weight: 700; margin-bottom: 1.25rem;">
                                            ${feedbackSuccess}
                                        </div>
                                    `}

                                    ${feedbackError && html`
                                        <div style="background: var(--wp-danger-light); border: 1px solid var(--wp-danger-border); color: var(--wp-danger-text); padding: 0.85rem 1rem; font-size: 0.88rem; font-weight: 700; margin-bottom: 1.25rem;">
                                            ${feedbackError}
                                        </div>
                                    `}

                                    <form onSubmit=${onFeedbackSubmit}>
                                        <div class="portal-form-group">
                                            <label class="portal-label">اختر المرحلة أو المهمة المراد الاستفسار عنها:</label>
                                            <select class="portal-select" value=${feedbackTask} onChange=${e => onFeedbackTaskChange(e.target.value)}>
                                                ${milestones.map(m => html`
                                                    <option key=${m.id} value=${m.id}>${m.title}</option>
                                                `)}
                                            </select>
                                        </div>

                                        <div class="portal-form-group">
                                            <label class="portal-label">نوع التفاعل:</label>
                                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                                <button 
                                                    type="button" 
                                                    class="portal-pill ${feedbackActionType === 'client_feedback' ? 'is-selected' : ''}"
                                                    onClick=${() => onFeedbackActionTypeChange('client_feedback')}
                                                >
                                                    استفسار وملاحظة
                                                </button>
                                                <button 
                                                    type="button" 
                                                    class="portal-pill ${feedbackActionType === 'client_revision_request' ? 'is-selected' : ''}"
                                                    onClick=${() => onFeedbackActionTypeChange('client_revision_request')}
                                                >
                                                    طلب تعديل واستدراك
                                                </button>
                                            </div>
                                        </div>

                                        <div class="portal-form-group">
                                            <label class="portal-label">نص الاستفسار أو الملاحظة:</label>
                                            <textarea 
                                                class="portal-textarea" 
                                                rows="4" 
                                                value=${feedbackMsg} 
                                                onInput=${e => onFeedbackMsgChange(e.target.value)} 
                                                placeholder="اكتب ملاحظتك أو طلب التوضيح هنا..."
                                                required
                                            ></textarea>
                                        </div>

                                        <button type="submit" class="btn-portal btn-portal-primary" disabled=${feedbackSubmitting}>
                                            <i class="dashicons dashicons-format-chat"></i>
                                            <span>${feedbackSubmitting ? 'جاري الإرسال...' : 'إرسال الملاحظة لمدير المشروع'}</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    }

    /**
     * Preact Component for Workspace
     */
    function PortalWorkspace(props) {
        const { useState } = window.preactHooks || {};
        const [reqPage, setReqPage] = useState ? useState(1) : [1, () => {}];
        return renderWorkspaceContent({ ...props, reqPage, setReqPage });
    }

    exports.renderWorkspace = function(ctx) {
        if (!window.preact || !window.htm) return null;
        return window.preact.h(PortalWorkspace, ctx);
    };

})(window.WorkPressPortal);
