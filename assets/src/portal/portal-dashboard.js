/**
 * WorkPress Client Portal: Executive Dashboard & Hub Component
 *
 * Provides a unified, 5-zone executive home view for clients:
 * - Zone 1: Executive Welcome Banner, Key Metrics & New Request Primary Action
 * - Zone 2: Action Required Matrix (Unreviewed deliverables, pending signoffs)
 * - Zone 3: Active Projects Portfolio Grid (Progress, Lead, Due Dates, Direct Workspace Access)
 * - Zone 4: Client Requests Stream Pipeline (Status tracking of intake requests)
 * - Zone 5: Unified Activity Pulse across all projects
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    /**
     * Render reusable pagination bar
     */
    function renderPaginationBar(currentPage, totalPages, onPageChange) {
        if (totalPages <= 1) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const pages = [];
        for (let i = 1; i <= totalPages; i++) pages.push(i);

        return html`
            <div class="portal-pagination-bar">
                <button 
                    type="button" 
                    class="portal-page-btn is-nav" 
                    disabled=${currentPage <= 1}
                    onClick=${() => onPageChange(currentPage - 1)}
                >
                    <i class="dashicons dashicons-arrow-right-alt2"></i>
                    <span>السابق</span>
                </button>

                <div class="portal-page-numbers">
                    ${pages.map(p => html`
                        <button 
                            key=${p}
                            type="button" 
                            class="portal-page-num ${p === currentPage ? 'is-active' : ''}"
                            onClick=${() => onPageChange(p)}
                        >
                            ${p}
                        </button>
                    `)}
                </div>

                <button 
                    type="button" 
                    class="portal-page-btn is-nav" 
                    disabled=${currentPage >= totalPages}
                    onClick=${() => onPageChange(currentPage + 1)}
                >
                    <span>التالي</span>
                    <i class="dashicons dashicons-arrow-left-alt2"></i>
                </button>
            </div>
        `;
    }

    /**
     * Portal Executive Dashboard Preact Functional Component
     */
    function PortalDashboard(props) {
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const { useState } = window.preactHooks || {};

        const {
            user = {},
            roleLabel = 'مستفيد',
            projects = [],
            requests = [],
            pulse = {},
            notifications = [],
            onSelectProject,
            onOpenRequestModal,
            onOpenDeliverableReview,
            onOpenProjectReport,
            playPortalSound = () => {}
        } = props;

        const renderCover = window.WorkPressPortal?.renderCardCover || (() => null);

        // Pagination states
        const [prjPage, setPrjPage] = useState ? useState(1) : [1, () => {}];
        const [notifPage, setNotifPage] = useState ? useState(1) : [1, () => {}];

        // Calculate Overall Portfolio Metrics
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'archived');
        const completedProjects = projects.filter(p => p.status === 'completed');
        
        let totalDeliverablesCount = 0;
        let totalProgressSum = 0;
        projects.forEach(p => {
            totalProgressSum += (parseInt(p.progress, 10) || 0);
            totalDeliverablesCount += (parseInt(p.deliverables_count, 10) || 0);
        });
        const averageProgress = totalProjects > 0 ? Math.round(totalProgressSum / totalProjects) : 0;

        // Pending Decisions (Action Required)
        const pendingCandidates = pulse.candidates || [];

        // Pagination slices (Maximized for full-width screens)
        const PRJ_PER_PAGE = 8;
        const totalPrjPages = Math.ceil(projects.length / PRJ_PER_PAGE);
        const paginatedProjects = projects.slice((prjPage - 1) * PRJ_PER_PAGE, prjPage * PRJ_PER_PAGE);

        const NOTIF_PER_PAGE = 8;
        const totalNotifPages = Math.ceil(notifications.length / NOTIF_PER_PAGE);
        const paginatedNotifs = notifications.slice((notifPage - 1) * NOTIF_PER_PAGE, notifPage * NOTIF_PER_PAGE);

        return html`
            <div class="portal-dashboard-wrapper">
                
                <!-- ZONE 1: EXECUTIVE WELCOME BANNER & STATS -->
                <div class="portal-dash-welcome-card mb-5">
                    <div class="portal-dash-welcome-top">
                        <div class="portal-dash-user-intro">
                            <div class="portal-dash-avatar-wrapper">
                                ${user.avatar ? html`
                                    <img src=${user.avatar} alt=${user.display_name} class="portal-dash-avatar" />
                                ` : html`
                                    <div class="portal-dash-avatar-placeholder">
                                        <i class="dashicons dashicons-admin-users"></i>
                                    </div>
                                `}
                            </div>
                            <div>
                                <div class="portal-dash-greeting">
                                    <span>مرحباً بك، </span>
                                    <strong>${user.display_name || 'سعادة المستفيد'}</strong>
                                    <span class="portal-dash-role-badge">${roleLabel}</span>
                                </div>
                                <p class="portal-dash-subtitle">
                                    أهلاً بك في مساحة متابعة المشاريع والمخرجات الفنية لمنظومة WorkPress.
                                </p>
                            </div>
                        </div>

                        <div class="portal-dash-actions">
                            <button 
                                type="button" 
                                class="btn-portal btn-portal-primary portal-dash-cta-btn"
                                onClick=${() => {
                                    playPortalSound('button');
                                    onOpenRequestModal();
                                }}
                            >
                                <i class="dashicons dashicons-plus-alt2"></i>
                                <span>طلب مشروع / خدمة جديدة</span>
                            </button>
                        </div>
                    </div>

                    <!-- Top KPI Badges Ribbon -->
                    <div class="portal-dash-kpi-ribbon">
                        <div class="portal-dash-kpi-item">
                            <div class="portal-dash-kpi-icon-box is-indigo">
                                <i class="dashicons dashicons-portfolio"></i>
                            </div>
                            <div>
                                <span class="portal-dash-kpi-num">${activeProjects.length}</span>
                                <span class="portal-dash-kpi-lbl">مشاريع جارية</span>
                            </div>
                        </div>

                        <div class="portal-dash-kpi-item">
                            <div class="portal-dash-kpi-icon-box is-emerald">
                                <i class="dashicons dashicons-yes-alt"></i>
                            </div>
                            <div>
                                <span class="portal-dash-kpi-num">${totalDeliverablesCount}</span>
                                <span class="portal-dash-kpi-lbl">مخرجات مستلمة</span>
                            </div>
                        </div>

                        <div class="portal-dash-kpi-item">
                            <div class="portal-dash-kpi-icon-box is-amber">
                                <i class="dashicons dashicons-chart-area"></i>
                            </div>
                            <div>
                                <span class="portal-dash-kpi-num">${averageProgress}%</span>
                                <span class="portal-dash-kpi-lbl">متوسط الإنجاز الكلي</span>
                            </div>
                        </div>

                        <div class="portal-dash-kpi-item">
                            <div class="portal-dash-kpi-icon-box is-sky">
                                <i class="dashicons dashicons-forms"></i>
                            </div>
                            <div>
                                <span class="portal-dash-kpi-num">${requests.length}</span>
                                <span class="portal-dash-kpi-lbl">إجمالي الطلبات</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ZONE 2: ACTION REQUIRED (الأهم فالمهم) -->
                ${pendingCandidates.length > 0 && html`
                    <div class="portal-dash-action-box mb-5">
                        <div class="portal-dash-action-header">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="dashicons dashicons-warning" style="color: #f59e0b; font-size: 20px;"></i>
                                <h3 class="portal-dash-action-title">مخرجات فنية تتطلب مراجعتك وقرارك الفوري</h3>
                            </div>
                            <span class="portal-badge portal-badge-amber">
                                ${pendingCandidates.length} بانتظار الاعتماد
                            </span>
                        </div>

                        <div class="portal-dash-candidates-list">
                            ${pendingCandidates.map((candidate, idx) => html`
                                <div key=${idx} class="portal-dash-candidate-row">
                                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                                        <span class="portal-dash-candidate-num">${idx + 1}</span>
                                        <div class="portal-dash-row-thumb">
                                            ${renderCover(candidate, 'deliverable', '40px')}
                                        </div>
                                        <div>
                                            <strong class="portal-dash-candidate-title">${candidate.task_title || candidate.title}</strong>
                                            <div class="portal-dash-candidate-meta">
                                                <span>المشروع: <strong>${candidate.project_name || 'مشروع نشط'}</strong></span>
                                                <span>• المنفذ: ${candidate.author_name || 'فريق العمل'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="portal-dash-candidate-actions">
                                        <button 
                                            type="button" 
                                            class="btn-portal btn-portal-primary btn-portal-sm"
                                            onClick=${() => {
                                                playPortalSound('button');
                                                onOpenDeliverableReview(candidate);
                                            }}
                                        >
                                            <i class="dashicons dashicons-visibility"></i>
                                            <span>معاينة واعتماد المخرج</span>
                                        </button>
                                    </div>
                                </div>
                            `)}
                        </div>
                    </div>
                `}

                <!-- MAIN DASHBOARD CONTENT GRID (2 COLUMNS) -->
                <div class="portal-dash-grid-layout">
                    
                    <!-- LEFT COLUMN: ACTIVE PROJECTS PORTFOLIO (70% Width) -->
                    <div class="portal-dash-main-col">
                        <div class="portal-dash-section-header mb-4">
                            <div>
                                <h3 class="portal-dash-section-title">
                                    <i class="dashicons dashicons-category ml-1" style="color: var(--wp-emerald);"></i>
                                    محفظة المشاريع النشطة
                                </h3>
                                <p class="portal-dash-section-desc">متابعة دقيقة لمسار تنفيذ وتسليم المشاريع المخصصة لك.</p>
                            </div>
                        </div>

                        ${projects.length === 0 ? html`
                            <div class="portal-empty-card p-5 has-text-centered" style="background: #ffffff; border: 1px dashed #cbd5e1;">
                                <i class="dashicons dashicons-portfolio has-text-grey" style="font-size: 36px; height: 36px; width: 36px;"></i>
                                <h4 class="title is-6 has-text-grey mt-2">لا توجد مشاريع مسندة حالياً</h4>
                                <p class="is-size-7 has-text-grey-light mb-4">يمكنك بدء مشروعك الأول فوراً بتقديم طلب خدمة عبر منشئ النماذج.</p>
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-primary btn-portal-sm"
                                    onClick=${() => onOpenRequestModal()}
                                >
                                    <i class="dashicons dashicons-plus-alt2"></i>
                                    <span>تقديم أول طلب مشروع</span>
                                </button>
                            </div>
                        ` : html`
                            <div>
                                <div class="portal-dash-portfolio-grid">
                                    ${paginatedProjects.map((proj) => {
                                        const progressVal = parseInt(proj.progress, 10) || 0;
                                        const isDone = proj.status === 'completed';

                                        return html`
                                            <div key=${proj.id} class="portal-dash-project-card ${isDone ? 'is-completed' : ''}">
                                                <!-- Top Project Cover Image or Smart Vector Default -->
                                                ${renderCover(proj, 'project', '135px')}

                                                <div class="portal-dash-project-card-body">
                                                    <div>
                                                        <div class="portal-dash-prj-top">
                                                            <div>
                                                                <span class="portal-dash-prj-badge">${proj.prefix || ('PRJ-' + proj.id)}</span>
                                                                <h4 class="portal-dash-prj-name">${proj.name}</h4>
                                                            </div>
                                                            <span class="portal-badge ${isDone ? 'portal-badge-emerald' : 'portal-badge-indigo'}">
                                                                ${isDone ? 'مكتمل' : 'قيد التنفيذ'}
                                                            </span>
                                                        </div>

                                                        <!-- Compact Metadata Pills -->
                                                        <div class="portal-dash-meta-pills">
                                                            <span class="portal-dash-meta-pill" title="المسؤول الفني">
                                                                <i class="dashicons dashicons-admin-users"></i>
                                                                <span>${(proj.lead && proj.lead.name) ? proj.lead.name : 'فريق العمل'}</span>
                                                            </span>
                                                            <span class="portal-dash-meta-pill" title="تاريخ التسليم المستهدف">
                                                                <i class="dashicons dashicons-calendar-alt"></i>
                                                                <span>${proj.due_at ? proj.due_at.substring(0, 10) : 'مرن'}</span>
                                                            </span>
                                                            <span class="portal-dash-meta-pill" title="المخرجات الفنية">
                                                                <i class="dashicons dashicons-portfolio"></i>
                                                                <span>${proj.deliverables_count || 0} مخرج</span>
                                                            </span>
                                                        </div>

                                                        <!-- Progress Bar & Percentage -->
                                                        <div class="portal-dash-progress-box">
                                                            <div class="portal-dash-progress-labels">
                                                                <span>نسبة الإنجاز الفني</span>
                                                                <strong>${progressVal}%</strong>
                                                            </div>
                                                            <div class="portal-dash-progress-track">
                                                                <div 
                                                                    class="portal-dash-progress-fill" 
                                                                    style=${{ width: `${progressVal}%`, backgroundColor: isDone ? '#10b981' : '#6366f1' }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <!-- Compact Card Actions Footer with Clean Icon-Only Buttons -->
                                                    <div class="portal-dash-prj-footer">
                                                        <span style="font-size: 0.76rem; color: var(--wp-text-muted); font-weight: 700; font-family: monospace;">
                                                            #${proj.id}
                                                        </span>

                                                        <div class="portal-dash-prj-footer-actions">
                                                            ${isDone && html`
                                                                <button 
                                                                    type="button" 
                                                                    class="btn-portal-icon btn-portal-emerald"
                                                                    title="استعراض وطباعة وثيقة الاستلام الرسمية"
                                                                    onClick=${(e) => {
                                                                        e.stopPropagation();
                                                                        playPortalSound('button');
                                                                        onOpenProjectReport(proj.id);
                                                                    }}
                                                                >
                                                                    <i class="dashicons dashicons-media-document"></i>
                                                                </button>
                                                            `}

                                                            <button 
                                                                type="button" 
                                                                class="btn-portal-icon btn-portal-primary"
                                                                title="دخول مساحة العمل والتفاصيل الكاملة للمشروع"
                                                                onClick=${() => {
                                                                    playPortalSound('transition');
                                                                    onSelectProject(proj.id);
                                                                }}
                                                            >
                                                                <i class="dashicons dashicons-arrow-left-alt2"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    })}
                                </div>
                                ${renderPaginationBar(prjPage, totalPrjPages, setPrjPage)}
                            </div>
                        `}
                    </div>

                    <!-- RIGHT COLUMN: ACTIVITY STREAM & NOTIFICATIONS (30% Width) -->
                    <div class="portal-dash-side-col">
                        <div class="portal-dash-side-box">
                            <h4 class="portal-dash-side-title">
                                <i class="dashicons dashicons-bell ml-1" style="color: var(--wp-amber);"></i>
                                <span>نبض المستجدات والنشاط الأخير</span>
                            </h4>

                            ${notifications.length === 0 ? html`
                                <div class="p-4 has-text-centered">
                                    <i class="dashicons dashicons-yes-alt has-text-success" style="font-size: 24px;"></i>
                                    <p class="is-size-7 has-text-grey mt-1">أنت مطلع على كافة المستجدات حتى الآن.</p>
                                </div>
                            ` : html`
                                <div>
                                    <div class="portal-dash-timeline">
                                        ${paginatedNotifs.map((notif, idx) => html`
                                            <div key=${idx} class="portal-dash-timeline-item">
                                                <div class="portal-dash-timeline-dot"></div>
                                                <div class="portal-dash-timeline-body">
                                                    <strong class="portal-dash-timeline-title">${notif.title || 'إشعار جديد'}</strong>
                                                    <p class="portal-dash-timeline-msg">${notif.message || ''}</p>
                                                    <span class="portal-dash-timeline-time">${notif.time || 'الآن'}</span>
                                                </div>
                                            </div>
                                        `)}
                                    </div>
                                    ${renderPaginationBar(notifPage, totalNotifPages, setNotifPage)}
                                </div>
                            `}
                        </div>

                        <!-- System Security & Trust Guarantee Box -->
                        <div class="portal-dash-trust-box mt-4">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                                <i class="dashicons dashicons-shield-alt" style="color: var(--wp-emerald); font-size: 20px;"></i>
                                <strong style="font-size: 0.85rem; color: #0f172a;">حوكمة وضمان الجودة</strong>
                            </div>
                            <p style="font-size: 0.75rem; color: #64748b; line-height: 1.5;">
                                كافة العمليات والمخرجات موثقة ومؤرشفة في محرك الذاكرة المؤسسية وفق أرقى معايير الحماية والاستقلالية.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }

    /**
     * Render the Client Portal Executive Dashboard
     */
    exports.renderPortalDashboard = function(ctx) {
        if (!window.preact || !window.htm) return null;
        return window.preact.h(PortalDashboard, ctx);
    };

})(window.WorkPressPortal);
