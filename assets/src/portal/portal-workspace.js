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
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.1
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderWorkspace = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);

        const {
            projects, projectData, selectedProjectId, activeTab,
            deliverables, milestones,
            feedbackTask, feedbackActionType, feedbackMsg, feedbackSuccess, feedbackError, feedbackSubmitting,
            onNavigateToTab, onOpenProjectReport,
            onFeedbackTaskChange, onFeedbackActionTypeChange, onFeedbackMsgChange, onFeedbackSubmit
        } = ctx;

        return html`
            <div>
                <!-- 1. ONBOARDING GATE (When user has 0 projects) -->
                ${activeTab !== 'new-request' && projects.length === 0 && html`
                    <div class="portal-gatekeeper-card">
                        <div class="portal-gatekeeper-icon">
                            <i class="dashicons dashicons-portfolio"></i>
                        </div>
                        <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.5rem;">
                            مرحباً بك في مساحة المشاريع والخدمات
                        </h2>
                        <p style="color: var(--wp-text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem;">
                            حسابك مسجل بنجاح في المنظومة. يمكنك البدء الآن بتقديم طلب مشروع أو خدمة جديدة لتصل مباشرة للإدارة العامة للمراجعة والاعتماد.
                        </p>
                        <button 
                            class="btn-portal btn-portal-primary" 
                            style="padding: 0.75rem 2rem; font-size: 1rem;"
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
                            <div style="margin-bottom: 1.5rem; overflow: hidden; max-height: 240px; border: 1px solid var(--wp-border);">
                                <img src="${projectData.cover_url}" alt="${projectData.name}" style="width: 100%; height: 240px; object-fit: cover; display: block;" />
                            </div>
                        ` : null}

                        <!-- Project Hero Bar -->
                        <div class="portal-project-hero">
                            <div class="portal-project-info">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 0.25rem;">
                                    <span style="background: var(--wp-indigo-light); border: 1px solid var(--wp-indigo-border); color: #4338ca; font-size: 0.78rem; font-weight: 800; padding: 2px 8px;">
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
                                <span class="portal-kpi-value" style="color: var(--wp-primary); display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-yes-alt"></i>
                                    <span>${projectData.status === 'completed' ? 'مكتمل ومسلّم' : (projectData.status === 'frozen' ? 'مجمد في الثلاجة' : 'نشط وفق الخطة')}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <span class="portal-kpi-label">قائد المشروع المكلف</span>
                                <span class="portal-kpi-value" style="font-size: 1.05rem; display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-admin-users" style="color: var(--wp-indigo);"></i>
                                    <span>${projectData.lead ? projectData.lead.name : 'فريق العمل'}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <span class="portal-kpi-label">الموعد المستهدف للتسليم</span>
                                <span class="portal-kpi-value" style="font-size: 1.05rem; color: var(--wp-warning-text); display: flex; align-items: center; gap: 6px;">
                                    <i class="dashicons dashicons-calendar-alt"></i>
                                    <span>${projectData.due_at ? projectData.due_at.substring(0, 10) : 'قيد التحديد'}</span>
                                </span>
                            </div>
                            <div class="portal-kpi-card">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="portal-kpi-label">نسبة الإنجاز</span>
                                    <span style="font-weight: 800; color: var(--wp-primary);">${projectData.progress}%</span>
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
                                <div style="background: linear-gradient(135deg, var(--wp-primary-light), #ffffff); border: 1.5px solid var(--wp-primary-border); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                                    <div>
                                        <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #065f46; margin-bottom: 0.25rem;">
                                            <i class="dashicons dashicons-awards" style="font-size: 22px;"></i>
                                            <span>وثيقة وتقرير الاستلام الرسمي للمشروع</span>
                                        </div>
                                        <p style="font-size: 0.85rem; color: var(--wp-text-secondary); margin: 0;">
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
                                        المخرجات والحلول المعتمدة رسمياً الجاهزة للاستلام:
                                    </h3>
                                    <span style="font-size: 0.8rem; color: var(--wp-text-muted);">
                                        مفلترة ومطهرة من مسودات النقاش الفني الداخلي
                                    </span>
                                </div>

                                ${deliverables.length === 0 ? html`
                                    <div class="wp-portal-card" style="text-align: center; padding: 3rem;">
                                        <i class="dashicons dashicons-portfolio" style="font-size: 38px; color: var(--wp-text-muted); margin-bottom: 0.75rem;"></i>
                                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--wp-text-main);">لا توجد مخرجات معتمدة نهائياً حتى اللحظة</h3>
                                        <p style="color: var(--wp-text-secondary); font-size: 0.9rem; margin-top: 0.4rem;">
                                            يعمل الفريق على تنفيذ المهام، وستظهر الحلول المعتمدة هنا فور اعتمادها رسمياً من قبل مدير المشروع.
                                        </p>
                                    </div>
                                ` : html`
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                                        ${deliverables.map(d => html`
                                            <div key=${d.id} class="wp-portal-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                                                <div>
                                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
                                                        <span style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
                                                            <i class="dashicons dashicons-yes" style="font-size: 14px;"></i>
                                                            <span>مخرج معتمد</span>
                                                        </span>
                                                        <span style="font-size: 0.75rem; color: var(--wp-text-muted);">${d.created_at ? d.created_at.substring(0, 10) : ''}</span>
                                                    </div>
                                                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.4rem;">
                                                        ${d.title || d.task_title || 'مخرج فني معتمد'}
                                                    </h4>
                                                    <div style="font-size: 0.85rem; color: var(--wp-text-secondary); line-height: 1.5; margin-bottom: 1rem;" dangerouslySetInnerHTML=${{ __html: d.content || d.payload || '' }}></div>
                                                </div>

                                                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--wp-border); padding-top: 0.75rem; margin-top: 0.75rem;">
                                                    <span style="font-size: 0.78rem; color: var(--wp-text-muted);">
                                                        بواسطة: ${d.author_name || 'فريق العمل'}
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
                                    <div class="wp-portal-card" style="text-align: center; padding: 3rem;">
                                        <i class="dashicons dashicons-clipboard" style="font-size: 38px; color: var(--wp-text-muted); margin-bottom: 0.75rem;"></i>
                                        <p style="color: var(--wp-text-secondary); font-size: 0.9rem;">يقوم مدير المشروع حالياً بهيكلة المراحل وتوزيع المهام على الفريق الفني.</p>
                                    </div>
                                ` : html`
                                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                                        ${milestones.map((m, idx) => {
                                            const isDone = m.status === 'completed' || m.status === 'closed';
                                            const inProg = m.status === 'in_progress' || m.status === 'assigned';

                                            return html`
                                                <div key=${m.id} class="wp-portal-card" style="border-right: 4px solid ${isDone ? 'var(--wp-primary)' : (inProg ? 'var(--wp-warning)' : 'var(--wp-border)')};">
                                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;">
                                                        <div style="display: flex; align-items: center; gap: 8px;">
                                                            <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: ${isDone ? 'var(--wp-primary-light)' : 'var(--wp-bg-subtle)'}; color: ${isDone ? '#065f46' : 'var(--wp-text-muted)'}; font-size: 0.78rem; font-weight: 800;">
                                                                ${isDone ? html`<i class="dashicons dashicons-yes" style="font-size: 14px;"></i>` : (idx + 1)}
                                                            </span>
                                                            <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--wp-text-main); margin: 0;">
                                                                ${m.title}
                                                            </h4>
                                                        </div>
                                                        
                                                        <span style="font-size: 0.78rem; font-weight: 800; padding: 2px 8px; background: ${isDone ? 'var(--wp-primary-light)' : (inProg ? 'var(--wp-warning-light)' : 'var(--wp-bg-subtle)')}; color: ${isDone ? '#065f46' : (inProg ? 'var(--wp-warning-text)' : 'var(--wp-text-muted)')}; border: 1px solid ${isDone ? 'var(--wp-primary-border)' : (inProg ? 'var(--wp-warning-border)' : 'var(--wp-border)')};">
                                                            ${isDone ? 'مكتملة ومعتمدة' : (inProg ? 'قيد التنفيذ' : 'قيد الجدولة')}
                                                        </span>
                                                    </div>

                                                    ${m.description ? html`
                                                        <div style="font-size: 0.88rem; color: var(--wp-text-secondary); line-height: 1.6; margin: 0.6rem 0;" dangerouslySetInnerHTML=${{ __html: m.description }}></div>
                                                    ` : null}

                                                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--wp-text-muted); border-top: 1px dashed var(--wp-border); padding-top: 0.6rem; margin-top: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
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

                        <!-- Tab 4: My Submitted Requests -->
                        ${activeTab === 'my-requests' && html`
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                                    <div>
                                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.2rem;">
                                            سجل طلبات المشاريع والخدمات المقدمة:
                                        </h3>
                                        <p style="font-size: 0.82rem; color: var(--wp-text-muted);">
                                            متابعة حالة مراجعة واعتماد طلباتك من قبل الإدارة الفنية للمنظومة
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

                                ${projects.filter(p => p.is_client_request).length === 0 ? html`
                                    <div class="wp-portal-card" style="text-align: center; padding: 3rem;">
                                        <i class="dashicons dashicons-inbox" style="font-size: 38px; color: var(--wp-text-muted); margin-bottom: 0.75rem;"></i>
                                        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--wp-text-main);">لا توجد طلبات سابقة مسجلة</h3>
                                        <p style="color: var(--wp-text-secondary); font-size: 0.9rem; margin-top: 0.4rem; margin-bottom: 1.5rem;">
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
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem;">
                                        ${projects.filter(p => p.is_client_request).map(r => html`
                                            <div key=${r.id} class="wp-portal-card">
                                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
                                                    <span style="background: var(--wp-warning-light); border: 1px solid var(--wp-warning-border); color: var(--wp-warning-text); font-size: 0.75rem; font-weight: 800; padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px;">
                                                        <i class="dashicons dashicons-clock" style="font-size: 14px;"></i>
                                                        <span>طلب قيد المراجعة</span>
                                                    </span>
                                                    <span style="font-size: 0.75rem; color: var(--wp-text-muted);">${r.created_at ? r.created_at.substring(0, 10) : ''}</span>
                                                </div>
                                                <h4 style="font-size: 1rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.4rem;">${r.name}</h4>
                                                <p style="font-size: 0.85rem; color: var(--wp-text-secondary); line-height: 1.5; margin-bottom: 1rem;">${r.description || 'لا يوجد بيان إضافي.'}</p>
                                            </div>
                                        `)}
                                    </div>
                                `}
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    };

})(window.WorkPressPortal);
