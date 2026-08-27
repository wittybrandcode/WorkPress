/**
 * WorkPress Client Portal SPA Application (Modular Clean Architecture)
 *
 * Implements WorkPress Official Brand Identity:
 * - Native ES Module imports and component-driven architecture
 * - Strict sharp edges (0px border-radius) and Cairo typography
 * - High-clarity Deliverables Vault, Milestones Roadmap & Request Studio
 * - Zero-build Preact + HTM Single Page Application
 *
 * @package WorkPress
 * @subpackage Portal
 * @version 2.2.1
 */

import { html, render, useState, useEffect, useCallback } from './utils/html.js';
import portalApi, { getPortalConfig } from './api/portalApi.js';
import { playPortalSound } from './utils/portalSound.js';

// Subcomponents
import PortalHeader from './components/PortalHeader.js';
import PortalAuthView from './components/PortalAuthView.js';
import PortalOverviewTab from './components/PortalOverviewTab.js';
import PortalDeliverablesTab from './components/PortalDeliverablesTab.js';
import PortalRoadmapTab from './components/PortalRoadmapTab.js';
import PortalCommunicationTab from './components/PortalCommunicationTab.js';

// Modals
import ProjectRequestModal from './components/modals/ProjectRequestModal.js';
import DeliverablePreviewModal from './components/modals/DeliverablePreviewModal.js';
import DeliverableSignoffModal from './components/modals/DeliverableSignoffModal.js';
import OfficialReportModal from './components/modals/OfficialReportModal.js';

function PortalApp() {
    const config = getPortalConfig();
    const [isLoggedIn, setIsLoggedIn] = useState(!!config.isLoggedIn);
    const [currentUser, setCurrentUser] = useState(config.currentUser || null);
    
    // Core State
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [deliverables, setDeliverables] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Notifications & Profile UI
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Modals & Sub-Flows
    const [requestModalOpen, setRequestModalOpen] = useState(false);
    const [intakeForms, setIntakeForms] = useState([]);
    const [selectedFormId, setSelectedFormId] = useState(null);
    const [reqSubmitting, setReqSubmitting] = useState(false);
    const [reqSuccess, setReqSuccess] = useState('');
    const [reqError, setReqError] = useState('');

    // Preview & Signoff Modals
    const [previewDeliverable, setPreviewDeliverable] = useState(null);
    const [signoffDeliverable, setSignoffDeliverable] = useState(null);
    const [signoffSubmitting, setSignoffSubmitting] = useState(false);

    // Official Report Modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportModalData, setReportModalData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Communication Feedback
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState('');
    const [feedbackError, setFeedbackError] = useState('');

    // Auth Form State
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Fetch initial projects & session
    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            const projectsRes = await portalApi.fetchMyProjects();
            const projectList = Array.isArray(projectsRes) ? projectsRes : (projectsRes.projects || []);
            setProjects(projectList);

            if (projectList.length > 0) {
                const firstId = projectList[0].id;
                setSelectedProjectId(firstId);
                await loadProjectDetails(firstId);
            }
            
            // Load intake forms schema
            const formsRes = await portalApi.fetchIntakeForms();
            const formList = Array.isArray(formsRes) ? formsRes : (formsRes.forms || []);
            setIntakeForms(formList);
            if (formList.length > 0) setSelectedFormId(formList[0].id);

        } catch (err) {
            console.error('WorkPress Portal: Failed to load projects', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadProjectDetails = async (projectId) => {
        try {
            const [pDetails, pMilestones, pDeliverables] = await Promise.all([
                portalApi.fetchProjectDetails(projectId),
                portalApi.fetchProjectMilestones(projectId),
                portalApi.fetchProjectDeliverables(projectId)
            ]);
            setProjectData(pDetails);
            setMilestones(Array.isArray(pMilestones) ? pMilestones : (pMilestones.milestones || []));
            setDeliverables(Array.isArray(pDeliverables) ? pDeliverables : (pDeliverables.deliverables || []));
        } catch (err) {
            console.error('WorkPress Portal: Failed to load project details', err);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            loadProjects();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, loadProjects]);

    // Handle Project Selection Change
    const handleSelectProject = (projectId) => {
        setSelectedProjectId(projectId);
        loadProjectDetails(projectId);
        if (soundEnabled) playPortalSound('navigation');
    };

    // Handle Tab Navigation
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (soundEnabled) playPortalSound('button');
    };

    // Handle Login
    const handleLogin = async (username, password) => {
        setLoginLoading(true);
        setLoginError('');
        try {
            const res = await portalApi.login(username, password);
            if (res && res.success) {
                setIsLoggedIn(true);
                setCurrentUser(res.user);
                if (soundEnabled) playPortalSound('success');
                await loadProjects();
            } else {
                setLoginError(res.message || 'بيانات الدخول غير صحيحة.');
                if (soundEnabled) playPortalSound('error');
            }
        } catch (err) {
            setLoginError(err.message || 'فشل تسجيل الدخول، يرجى التحقق من الاتصال.');
            if (soundEnabled) playPortalSound('error');
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle Project Request Submit
    const handleSubmitProjectRequest = async (payload) => {
        setReqSubmitting(true);
        setReqError('');
        setReqSuccess('');
        try {
            const res = await portalApi.submitProjectRequest(payload);
            setReqSuccess(res.message || 'تم توثيق وتقديم طلب المشروع بنجاح!');
            if (soundEnabled) playPortalSound('success');
            await loadProjects();
        } catch (err) {
            setReqError(err.message || 'فشل تقديم الطلب.');
            if (soundEnabled) playPortalSound('error');
        } finally {
            setReqSubmitting(false);
        }
    };

    // Handle Digital Signoff
    const handleSubmitSignoff = async (payload) => {
        setSignoffSubmitting(true);
        try {
            await portalApi.submitFeedback(selectedProjectId, 'deliverable_signoff', `تم اعتماد المخرج ${payload.deliverableId} رقمياً بواسطة ${payload.signerName}`);
            setSignoffDeliverable(null);
            if (soundEnabled) playPortalSound('success');
            await loadProjectDetails(selectedProjectId);
        } catch (err) {
            console.error('WorkPress Portal: Signoff failed', err);
            if (soundEnabled) playPortalSound('error');
        } finally {
            setSignoffSubmitting(false);
        }
    };

    // Handle Feedback Submit
    const handleSubmitFeedback = async (message) => {
        setFeedbackSubmitting(true);
        setFeedbackSuccess('');
        setFeedbackError('');
        try {
            await portalApi.submitFeedback(selectedProjectId, 'client_query', message);
            setFeedbackSuccess('تم إرسال ملاحظتك لقائد المشروع بنجاح.');
            if (soundEnabled) playPortalSound('success');
        } catch (err) {
            setFeedbackError(err.message || 'فشل إرسال الملاحظة.');
            if (soundEnabled) playPortalSound('error');
            throw err;
        } finally {
            setFeedbackSubmitting(false);
        }
    };

    // Handle Official Report Modal Open
    const handleOpenReport = async () => {
        if (!selectedProjectId) return;
        setReportModalOpen(true);
        setReportLoading(true);
        try {
            const data = await portalApi.fetchProjectReport(selectedProjectId);
            setReportModalData(data);
        } catch (err) {
            console.error('WorkPress Portal: Failed to fetch report', err);
        } finally {
            setReportLoading(false);
        }
    };

    // Close overlays on outside click
    const handleGlobalClick = () => {
        if (isNotificationsOpen || isProfileMenuOpen) {
            setIsNotificationsOpen(false);
            setIsProfileMenuOpen(false);
        }
    };

    if (!isLoggedIn) {
        return html`
            <${PortalAuthView} 
                onLogin=${handleLogin} 
                loginLoading=${loginLoading} 
                loginError=${loginError} 
            />
        `;
    }

    return html`
        <div class="portal-app-wrapper" onClick=${handleGlobalClick}>
            <!-- Two-Tier Institutional Header -->
            <${PortalHeader}
                config=${config}
                currentUser=${currentUser}
                projects=${projects}
                selectedProjectId=${selectedProjectId}
                onSelectProject=${handleSelectProject}
                activeTab=${activeTab}
                onTabChange=${handleTabChange}
                onOpenRequestModal=${() => setRequestModalOpen(true)}
                unreadNotificationsCount=${unreadCount}
                notifications=${notifications}
                isNotificationsOpen=${isNotificationsOpen}
                onToggleNotifications=${() => setIsNotificationsOpen(!isNotificationsOpen)}
                onMarkAllRead=${() => portalApi.markAllNotificationsRead()}
                onNotificationClick=${(n) => {}}
                isProfileMenuOpen=${isProfileMenuOpen}
                onToggleProfileMenu=${() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                soundEnabled=${soundEnabled}
                onToggleSound=${() => setSoundEnabled(!soundEnabled)}
            />

            <!-- Main Canvas Container -->
            <main class="portal-container">
                ${loading ? html`
                    <div class="portal-initial-loader" style=${{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div class="portal-spinner"></div>
                        <p style=${{ marginTop: '1rem', color: 'var(--wp-text-secondary)', fontWeight: 700 }}>جاري استرجاع بيانات المشاريع المعتمدة...</p>
                    </div>
                ` : html`
                    ${activeTab === 'overview' && html`
                        <${PortalOverviewTab} 
                            projectData=${projectData} 
                            onOpenReport=${handleOpenReport} 
                        />
                    `}

                    ${activeTab === 'deliverables' && html`
                        <${PortalDeliverablesTab} 
                            deliverables=${deliverables} 
                            onOpenDeliverablePreview=${(d) => setPreviewDeliverable(d)}
                            onOpenSignoffModal=${(d) => setSignoffDeliverable(d)}
                            onOpenReport=${handleOpenReport}
                        />
                    `}

                    ${activeTab === 'roadmap' && html`
                        <${PortalRoadmapTab} 
                            milestones=${milestones} 
                        />
                    `}

                    ${activeTab === 'communication' && html`
                        <${PortalCommunicationTab} 
                            projectData=${projectData}
                            onSubmitFeedback=${handleSubmitFeedback}
                            feedbackSubmitting=${feedbackSubmitting}
                            feedbackSuccess=${feedbackSuccess}
                            feedbackError=${feedbackError}
                        />
                    `}
                `}
            </main>

            <!-- Modals -->
            <${ProjectRequestModal}
                isOpen=${requestModalOpen}
                onClose=${() => setRequestModalOpen(false)}
                intakeForms=${intakeForms}
                selectedFormId=${selectedFormId}
                onSelectForm=${(id) => setSelectedFormId(id)}
                onSubmitRequest=${handleSubmitProjectRequest}
                submitting=${reqSubmitting}
                successMessage=${reqSuccess}
                errorMessage=${reqError}
            />

            <${DeliverablePreviewModal}
                isOpen=${!!previewDeliverable}
                onClose=${() => setPreviewDeliverable(null)}
                deliverable=${previewDeliverable}
                onOpenSignoff=${(d) => setSignoffDeliverable(d)}
            />

            <${DeliverableSignoffModal}
                isOpen=${!!signoffDeliverable}
                onClose=${() => setSignoffDeliverable(null)}
                deliverable=${signoffDeliverable}
                currentUser=${currentUser}
                onSubmitSignoff=${handleSubmitSignoff}
                submitting=${signoffSubmitting}
            />

            <${OfficialReportModal}
                isOpen=${reportModalOpen}
                onClose=${() => setReportModalOpen(false)}
                reportData=${reportModalData}
                loading=${reportLoading}
            />
        </div>
    `;
}

// Mount Preact Application
const rootEl = document.getElementById('workpress-portal-root');
if (rootEl) {
    rootEl.innerHTML = '';
    render(html`<${PortalApp} />`, rootEl);
}
