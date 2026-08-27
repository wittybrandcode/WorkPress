/**
 * WorkPress Client Portal SPA Application (Modern SaaS Design System)
 *
 * Implements WorkPress Official Brand Identity:
 * - Two-tier institutional header with official vector SVG WorkPressLogo
 * - Native WordPress Dashicons integration (Zero Unicode Emojis)
 * - Strict sharp edges (0px border-radius across all elements)
 * - Modern SaaS Clean Card and Grid layout with Cairo & Plus Jakarta Sans typography
 * - High-clarity Deliverables Vault, Milestones Roadmap, Request Studio & Executive Radar
 * - Zero-build Preact + HTM Single Page Application
 *
 * @package WorkPress
 * @subpackage Assets/JS
 * @version 2.2.1
 */

(function() {
    'use strict';

    if (!window.preact || !window.htm) {
        console.error('WorkPress Portal: Preact or HTM not loaded.');
        return;
    }

    const { h, render, Component } = window.preact;
    const html = window.htm.bind(h);
    const config = window.workpressPortalConfig || {};
    const { apiFetch, playPortalSound, playClockTick, renderWorkPressLogo } = window.WorkPressPortal || {};

    /**
     * Portal Application Root Component
     */
    class PortalApp extends Component {
        constructor(props) {
            super(props);

            const initialForms = Array.isArray(config.intakeForms) && config.intakeForms.length > 0 ? config.intakeForms : [];
            const firstForm = initialForms[0] || null;

            // Detect initial route from hash
            const currentHash = window.location.hash || '#/';
            const isRequestRoute = currentHash.startsWith('#/new-request') || currentHash.startsWith('#/request');

            const executiveType = config.executiveType || (config.user && config.user.is_admin ? 'admin' : 'client');
            const roleLabel = config.roleLabel || (config.user && config.user.is_admin ? 'مدير عام' : 'مستفيد');

            const urlParams = new URLSearchParams(window.location.search);
            const isWelcomeParam = urlParams.get('welcome') === '1';
            const isPreviewSub = urlParams.get('preview') === 'subscriber';
            const isPreviewStaff = urlParams.get('preview') === 'staff';
            const isPreviewClient = urlParams.get('preview') === 'client';

            let forcedExecType = executiveType;
            let forcedRoleLabel = roleLabel;
            if (isPreviewSub) {
                forcedExecType = 'subscriber';
                forcedRoleLabel = 'مشترك';
            } else if (isPreviewStaff) {
                forcedExecType = 'admin';
                forcedRoleLabel = 'مدير عام';
            } else if (isPreviewClient) {
                forcedExecType = 'client';
                forcedRoleLabel = 'مستفيد';
            }

            const inGatewayTransition = isWelcomeParam || isPreviewSub || isPreviewStaff || isPreviewClient || (forcedExecType === 'subscriber') || (config.canAccessPortal === false);

            this.state = {
                isLoggedIn: !!config.isLoggedIn || isPreviewSub || isPreviewStaff || isPreviewClient,
                user: config.user || {},
                executiveType: forcedExecType,
                roleLabel: forcedRoleLabel,
                adminUrl: config.adminUrl || '/wp-admin/admin.php?page=workpress#/',
                inGatewayTransition: inGatewayTransition,
                gatewayCountdown: 10,
                radarData: null,
                radarLoading: false,
                isPreviewAsClient: false,
                projects: [],
                selectedProjectId: null,
                projectData: null,
                deliverables: [],
                milestones: [],
                activeTab: isRequestRoute ? 'new-request' : 'deliverables',
                loading: true,
                feedbackTask: '',
                feedbackMsg: '',
                feedbackActionType: 'client_feedback',
                feedbackSuccess: '',
                feedbackError: '',
                feedbackSubmitting: false,
                intakeForms: initialForms,
                selectedFormId: firstForm ? firstForm.id : '',
                reqCustomTitle: '',
                reqDesc: '',
                reqSpecs: {},
                uploadingSpecs: {},
                reqSubmitting: false,
                reqSuccess: '',
                reqCreatedProjectId: null,
                reqError: '',
                loginUsername: '',
                loginPassword: '',
                loginLoading: false,
                loginError: '',
                reportModalOpen: false,
                reportModalData: null,
                reportLoading: false,
                notifications: [],
                unreadNotificationsCount: 0,
                isNotificationsOpen: false,
                isProfileMenuOpen: false,
                activeToastAlert: null,
                prevUnreadCount: null
            };
        }

        async openProjectReport(projectId) {
            if (!projectId) return;
            playPortalSound('button');
            this.setState({ reportLoading: true, reportModalOpen: true });
            try {
                const res = await apiFetch(`projects/${projectId}/report`);
                if (res.success && res.data) {
                    this.setState({ reportModalData: res.data, reportLoading: false });
                    playPortalSound('celebration');
                } else {
                    throw new Error(res.message || 'تعذر جلب التقرير التنفيذي');
                }
            } catch (err) {
                console.error(err);
                this.setState({ reportLoading: false, reportModalOpen: false });
                alert(err.message || 'حدث خطأ أثناء تحميل التقرير');
            }
        }

        closeProjectReport() {
            this.setState({ reportModalOpen: false, reportModalData: null });
        }

        startGatewayCountdown() {
            if (this.gatewayTimer) {
                clearInterval(this.gatewayTimer);
                this.gatewayTimer = null;
            }
            this.gatewayTimer = setInterval(() => {
                try {
                    playClockTick();
                } catch (e) {}

                this.setState(prevState => {
                    const count = prevState.gatewayCountdown;
                    if (count === null || count === undefined) return { gatewayCountdown: 9 };
                    
                    if (count <= 1) {
                        if (this.gatewayTimer) {
                            clearInterval(this.gatewayTimer);
                            this.gatewayTimer = null;
                        }

                        const { executiveType } = this.state;
                        if (executiveType === 'admin' || executiveType === 'lead' || executiveType === 'member') {
                            window.location.href = config.adminUrl || '/wp-admin/admin.php?page=workpress#/';
                        } else if (executiveType === 'client') {
                            this.setState({ inGatewayTransition: false, gatewayCountdown: 0, loading: false });
                            this.fetchProjects();
                            this.fetchIntakeForms();
                            this.fetchPulseAndNotifications();
                        } else {
                            window.location.href = config.siteUrl || '/';
                        }
                        return { gatewayCountdown: 0 };
                    }
                    return { gatewayCountdown: count - 1 };
                });
            }, 1000);
        }

        componentDidMount() {
            if (this.state.isLoggedIn) {
                // If in gateway transition or standard subscriber, start auto-redirect timer with audio tick
                if (this.state.inGatewayTransition || config.canAccessPortal === false || this.state.executiveType === 'subscriber') {
                    this.setState({ loading: false });
                    this.startGatewayCountdown();
                    return;
                }

                if (this.state.executiveType !== 'client' && this.state.executiveType !== 'subscriber') {
                    this.fetchRadarIntelligence();
                }
                this.fetchProjects();
                this.fetchIntakeForms();
                this.fetchPulseAndNotifications();
                
                // Live Pulse Polling every 6 seconds
                this.pulseTimer = setInterval(() => {
                    this.fetchPulseAndNotifications();
                }, 6000);

                // Session Keep-Alive & Routing Listeners
                document.addEventListener('visibilitychange', this.handleVisibilityChange);
                window.addEventListener('hashchange', this.handleHashChange);
            } else {
                this.setState({ loading: false });
            }
        }

        componentWillUnmount() {
            if (this.pulseTimer) clearInterval(this.pulseTimer);
            if (this.gatewayTimer) clearInterval(this.gatewayTimer);
            if (this.subscriberTimer) clearInterval(this.subscriberTimer);
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('hashchange', this.handleHashChange);
        }

        async fetchPulseAndNotifications() {
            if (!this.state.isLoggedIn) return;
            try {
                const res = await apiFetch('pulse');
                if (res && res.success && res.pulse) {
                    const pulse = res.pulse;
                    const newUnread = pulse.unread_notifications || 0;
                    const notes = pulse.notifications || [];

                    if (this.state.prevUnreadCount !== null && newUnread > this.state.prevUnreadCount) {
                        const latestNote = notes[0];
                        if (latestNote) {
                            playPortalSound('celebration');
                            this.setState({
                                activeToastAlert: {
                                    id: latestNote.id,
                                    message: latestNote.message,
                                    projectId: latestNote.project_id || null
                                }
                            });
                            setTimeout(() => {
                                this.setState({ activeToastAlert: null });
                            }, 8000);
                        }
                    }

                    this.setState({
                        notifications: notes,
                        unreadNotificationsCount: newUnread,
                        prevUnreadCount: newUnread
                    });
                }
            } catch (err) {
                // Fail silently
            }
        }

        async markNotificationAsRead(notificationId) {
            try {
                await apiFetch(`notifications/${notificationId}/read`, 'POST');
                this.setState(prevState => ({
                    notifications: prevState.notifications.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n),
                    unreadNotificationsCount: Math.max(0, prevState.unreadNotificationsCount - 1)
                }));
            } catch (err) {
                // Fail silently
            }
        }

        async markAllNotificationsAsRead() {
            try {
                await apiFetch('notifications/read-all', 'POST');
                this.setState(prevState => ({
                    notifications: prevState.notifications.map(n => ({ ...n, is_read: 1 })),
                    unreadNotificationsCount: 0
                }));
                playPortalSound('button');
            } catch (err) {
                // Fail silently
            }
        }

        async fetchRadarIntelligence() {
            this.setState({ radarLoading: true });
            try {
                const res = await apiFetch('radar');
                if (res.success && res.data) {
                    this.setState({ radarData: res.data, radarLoading: false });
                }
            } catch (err) {
                console.error('Radar Intelligence error:', err);
                this.setState({ radarLoading: false });
            }
        }

        handleHashChange = () => {
            const hash = window.location.hash || '#/';
            if (hash.startsWith('#/new-request') || hash.startsWith('#/request')) {
                this.setState({ activeTab: 'new-request' });
            } else if (hash.startsWith('#/milestones') || hash.startsWith('#/roadmap')) {
                this.setState({ activeTab: 'milestones' });
            } else if (hash.startsWith('#/feedback') || hash.startsWith('#/messages')) {
                this.setState({ activeTab: 'feedback' });
            } else if (hash.startsWith('#/my-requests')) {
                this.setState({ activeTab: 'my-requests' });
            } else {
                this.setState({ activeTab: 'deliverables' });
            }
        };

        navigateToTab(tabName) {
            playPortalSound('button');
            this.setState({ activeTab: tabName });
            if (tabName === 'new-request') {
                window.location.hash = '#/new-request';
            } else if (tabName === 'my-requests') {
                window.location.hash = '#/my-requests';
            } else if (tabName === 'milestones') {
                window.location.hash = '#/milestones';
            } else if (tabName === 'feedback') {
                window.location.hash = '#/feedback';
            } else {
                window.location.hash = '#/';
            }
        }

        async fetchIntakeForms() {
            try {
                const res = await apiFetch('intake-forms');
                if (res && res.forms && Array.isArray(res.forms) && res.forms.length > 0) {
                    const currentSelected = this.state.selectedFormId;
                    const exists = res.forms.find(f => f.id === currentSelected);
                    const active = exists || res.forms[0];

                    this.setState({
                        intakeForms: res.forms,
                        selectedFormId: active.id
                    });
                }
            } catch (err) {
                console.error('Fetch intake forms error:', err);
            }
        }

        handleFormTypeChange(formId) {
            this.setState({
                selectedFormId: formId,
                reqCustomTitle: '',
                reqSpecs: {},
                reqSuccess: '',
                reqError: ''
            });
            playPortalSound('button');
        }

        handleSpecChange(key, value) {
            this.setState(prevState => ({
                reqSpecs: {
                    ...prevState.reqSpecs,
                    [key]: value
                }
            }));
        }

        toggleSpecPill(key, pillValue) {
            this.setState(prevState => {
                const current = Array.isArray(prevState.reqSpecs[key]) ? [...prevState.reqSpecs[key]] : [];
                const idx = current.indexOf(pillValue);
                if (idx > -1) {
                    current.splice(idx, 1);
                } else {
                    current.push(pillValue);
                }
                return {
                    reqSpecs: {
                        ...prevState.reqSpecs,
                        [key]: current
                    }
                };
            });
            playPortalSound('button');
        }

        async handleFileUpload(specKey, event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            const blockedExtensions = ['php', 'phtml', 'exe', 'sh', 'bat', 'cmd', 'js', 'py', 'cgi', 'pl', 'asp', 'aspx'];

            this.setState(prevState => ({
                uploadingSpecs: {
                    ...prevState.uploadingSpecs,
                    [specKey]: true
                }
            }));

            try {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const ext = file.name.split('.').pop().toLowerCase();
                    if (blockedExtensions.includes(ext)) {
                        throw new Error(`نوع الملف (${ext}) غير مسموح به لأسباب أمنية.`);
                    }

                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch(`${config.apiUrl}/upload-file`, {
                        method: 'POST',
                        headers: {
                            'X-WP-Nonce': config.restNonce || ''
                        },
                        body: formData
                    });

                    const json = await res.json();
                    if (res.ok && json.success) {
                        this.setState(prevState => {
                            const currentFiles = Array.isArray(prevState.reqSpecs[specKey]) ? [...prevState.reqSpecs[specKey]] : [];
                            currentFiles.push({
                                id: json.id,
                                name: json.name || file.name,
                                url: json.url,
                                size: json.size || ''
                            });
                            return {
                                reqSpecs: {
                                    ...prevState.reqSpecs,
                                    [specKey]: currentFiles
                                }
                            };
                        });
                        playPortalSound('button');
                    } else {
                        throw new Error(json.message || 'فشل رفع الملف.');
                    }
                }
            } catch (uploadErr) {
                console.error('File upload error:', uploadErr);
                alert(uploadErr.message || 'تعذر رفع الملف، يرجى المحاولة ثانية.');
            } finally {
                this.setState(prevState => ({
                    uploadingSpecs: {
                        ...prevState.uploadingSpecs,
                        [specKey]: false
                    }
                }));
            }
        }

        removeUploadedFile(specKey, fileIdx) {
            this.setState(prevState => {
                const currentFiles = Array.isArray(prevState.reqSpecs[specKey]) ? [...prevState.reqSpecs[specKey]] : [];
                currentFiles.splice(fileIdx, 1);
                return {
                    reqSpecs: {
                        ...prevState.reqSpecs,
                        [specKey]: currentFiles
                    }
                };
            });
            playPortalSound('button');
        }

        handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && this.state.isLoggedIn) {
                try {
                    const res = await apiFetch('refresh-nonce');
                    if (res && res.nonce) {
                        config.restNonce = res.nonce;
                    }
                } catch (e) {
                    // Fail silently
                }
            }
        };

        async fetchProjects() {
            this.setState({ loading: true });
            try {
                const res = await apiFetch('my-projects');
                const projs = res.data || [];
                this.setState({ projects: projs });
                if (projs.length > 0) {
                    const defaultId = this.state.selectedProjectId || projs[0].id;
                    this.setState({ selectedProjectId: defaultId });
                    this.loadProjectDetails(defaultId);
                } else {
                    this.setState({ loading: false });
                }
            } catch (err) {
                console.error('Fetch projects error:', err);
                this.setState({ loading: false });
            }
        }

        async loadProjectDetails(projectId) {
            this.setState({ loading: true });
            try {
                const [pRes, mRes, dRes] = await Promise.all([
                    apiFetch(`projects/${projectId}`),
                    apiFetch(`projects/${projectId}/milestones`),
                    apiFetch(`projects/${projectId}/deliverables`)
                ]);

                const milestones = mRes.data || [];
                this.setState({
                    projectData: pRes.data,
                    milestones: milestones,
                    deliverables: dRes.data || [],
                    feedbackTask: milestones.length > 0 ? milestones[0].id : ''
                });
            } catch (err) {
                console.error('Load project details error:', err);
            } finally {
                this.setState({ loading: false });
            }
        }

        handleProjectChange(e) {
            const newId = parseInt(e.target.value, 10);
            this.setState({ selectedProjectId: newId });
            this.loadProjectDetails(newId);
            playPortalSound('button');
        }

        async handleLogin(e) {
            e.preventDefault();
            const { loginUsername, loginPassword } = this.state;
            if (!loginUsername || !loginPassword) return;

            this.setState({ loginLoading: true, loginError: '' });
            try {
                const res = await apiFetch('login', 'POST', { username: loginUsername, password: loginPassword });
                if (res.success && res.user) {
                    config.isLoggedIn = true;
                    config.user = res.user;
                    config.canAccessPortal = res.user.can_access !== false;
                    config.executiveType = res.user.executive_type || 'subscriber';
                    config.roleLabel = res.user.role_label || 'مشترك';
                    if (res.nonce) config.restNonce = res.nonce;

                    playPortalSound('celebration');

                    // Show Universal Smart Gateway for all users upon authenticating
                    this.setState({
                        isLoggedIn: true,
                        user: res.user,
                        executiveType: res.user.executive_type || 'subscriber',
                        roleLabel: res.user.role_label || 'مشترك',
                        inGatewayTransition: true,
                        gatewayCountdown: 10,
                        loginLoading: false
                    }, () => {
                        this.startGatewayCountdown();
                    });
                } else {
                    this.setState({ loginError: res.message || 'بيانات الدخول غير صحيحة.', loginLoading: false });
                }
            } catch (err) {
                this.setState({ loginError: err.message || 'تعذر الاتصال بالخادم، يرجى المحاولة ثانية.', loginLoading: false });
            }
        }

        async handleFeedbackSubmit(e) {
            e.preventDefault();
            const { feedbackTask, feedbackMsg, feedbackActionType, feedbackSubmitting } = this.state;
            const actionType = feedbackActionType || 'client_feedback';
            if (!feedbackMsg.trim() && actionType !== 'client_signoff') return;
            if (feedbackSubmitting) return;

            this.setState({ feedbackSubmitting: true, feedbackSuccess: '', feedbackError: '' });
            try {
                const res = await apiFetch('feedback', 'POST', {
                    task_id: feedbackTask,
                    message: feedbackMsg,
                    action_type: actionType
                });
                playPortalSound(actionType === 'client_signoff' ? 'celebration' : 'button');
                this.setState({
                    feedbackSuccess: res.message || 'تم إرسال ملاحظتكم واستفساركم بنجاح إلى فريق العمل.',
                    feedbackMsg: '',
                    feedbackSubmitting: false,
                    feedbackError: ''
                });

                // Auto clear banner
                setTimeout(() => {
                    this.setState({ feedbackSuccess: '' });
                }, 5000);
            } catch (err) {
                this.setState({
                    feedbackError: err.message || 'فشل إرسال الملاحظة، يرجى المحاولة ثانية.',
                    feedbackSubmitting: false
                });
            }
        }

        async handleRequestSubmit(e) {
            e.preventDefault();
            const { intakeForms, selectedFormId, reqCustomTitle, reqDesc, reqSpecs, reqSubmitting } = this.state;
            if (reqSubmitting) return;

            const activeForm = intakeForms.find(f => f.id === selectedFormId) || intakeForms[0] || {};
            const finalTitle = (reqCustomTitle || '').trim();

            if (!finalTitle) {
                this.setState({ reqError: 'يرجى كتابة عنوان أو اسم لطلب المشروع.' });
                return;
            }

            this.setState({ reqSubmitting: true, reqSuccess: '', reqError: '' });
            try {
                const res = await apiFetch('request', 'POST', {
                    title: finalTitle,
                    description: reqDesc,
                    form_id: activeForm.id || 'standard_request',
                    specs: reqSpecs,
                    budget: reqSpecs.budget_est || reqSpecs['الميزانية أو الكمية التقديرية (اختياري):'] || '',
                    due_date: reqSpecs.target_date || reqSpecs['تاريخ الإنجاز المطلوب (Target Deadline):'] || ''
                });

                playPortalSound('celebration');
                this.setState({
                    reqSuccess: 'تم تقديم طلب المشروع بنجاح وسيصل إشعار فوري للإدارة لمراجعته واعتماده.',
                    reqCreatedProjectId: res.project_id || null,
                    reqCustomTitle: '',
                    reqDesc: '',
                    reqSpecs: {},
                    reqSubmitting: false
                });
                this.fetchProjects();
            } catch (err) {
                this.setState({
                    reqError: err.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة ثانية.',
                    reqSubmitting: false
                });
            }
        }

        renderSmartGatewayCard() {
            const { renderSmartGatewayCard } = window.WorkPressPortal || {};
            if (typeof renderSmartGatewayCard === 'function') {
                return renderSmartGatewayCard({
                    user: this.state.user,
                    gatewayCountdown: this.state.gatewayCountdown,
                    executiveType: this.state.executiveType,
                    roleLabel: this.state.roleLabel,
                    onClientEnter: () => {
                        if (this.gatewayTimer) {
                            clearInterval(this.gatewayTimer);
                            this.gatewayTimer = null;
                        }
                        this.setState({ inGatewayTransition: false, loading: false });
                        this.fetchProjects();
                        this.fetchIntakeForms();
                        this.fetchPulseAndNotifications();
                    }
                });
            }
            return null;
        }

        renderExecutiveRadar() {
            const { renderExecutiveRadar } = window.WorkPressPortal || {};
            if (typeof renderExecutiveRadar === 'function') {
                return renderExecutiveRadar({
                    user: this.state.user,
                    executiveType: this.state.executiveType,
                    roleLabel: this.state.roleLabel,
                    adminUrl: this.state.adminUrl,
                    radarData: this.state.radarData,
                    radarLoading: this.state.radarLoading,
                    isProfileMenuOpen: this.state.isProfileMenuOpen,
                    onToggleProfileMenu: (isOpen) => this.setState({ isProfileMenuOpen: isOpen }),
                    onPreviewAsClient: () => this.setState({ isPreviewAsClient: true }),
                    onRefreshRadar: () => this.fetchRadarIntelligence()
                });
            }
            return null;
        }

        render() {
            const { 
                isLoggedIn, loading, user, projects, selectedProjectId, projectData, 
                deliverables, milestones, activeTab, reqSubmitting, reqSuccess, reqError,
                feedbackTask, feedbackMsg, feedbackActionType, feedbackSuccess, feedbackError, feedbackSubmitting,
                intakeForms, selectedFormId, reqCustomTitle, reqDesc, reqSpecs, uploadingSpecs,
                loginUsername, loginPassword, loginLoading, loginError,
                executiveType, roleLabel, isPreviewAsClient, reportModalOpen, reportModalData, reportLoading,
                notifications, unreadNotificationsCount, isNotificationsOpen, isProfileMenuOpen, activeToastAlert,
                inGatewayTransition
            } = this.state;

            // 1. Standalone Login Canvas (When not logged in)
            if (!isLoggedIn) {
                return html`
                    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--wp-bg-page); padding: 2rem;">
                        <div class="wp-portal-card" style="max-width: 440px; width: 100%; padding: 2.5rem 2rem; box-shadow: var(--wp-shadow-md); text-align: center;">
                            
                            <!-- Official Vector Brand Logo -->
                            <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
                                ${renderWorkPressLogo(38)}
                            </div>

                            <h1 style="font-size: 1.35rem; font-weight: 800; color: var(--wp-text-main); margin-bottom: 0.25rem;">
                                تسجيل الدخول
                            </h1>
                            <p style="font-size: 0.85rem; color: var(--wp-text-muted); margin-bottom: 1.75rem;">
                                مرحباً بك، يرجى إدخال بيانات الدخول للمتابعة
                            </p>

                            ${loginError && html`
                                <div style="background: var(--wp-danger-light); border: 1px solid var(--wp-danger-border); color: var(--wp-danger-text); padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 700; margin-bottom: 1.25rem; text-align: right;">
                                    ${loginError}
                                </div>
                            `}

                            <form onSubmit=${this.handleLogin.bind(this)} style="text-align: right;">
                                <div class="portal-form-group">
                                    <label class="portal-label">اسم المستخدم أو البريد الإلكتروني</label>
                                    <input 
                                        type="text" 
                                        class="portal-input" 
                                        value=${loginUsername} 
                                        onInput=${e => this.setState({ loginUsername: e.target.value })} 
                                        placeholder="اسم الحساب أو email@domain.com"
                                        required 
                                    />
                                </div>

                                <div class="portal-form-group">
                                    <label class="portal-label">كلمة المرور</label>
                                    <input 
                                        type="password" 
                                        class="portal-input" 
                                        value=${loginPassword} 
                                        onInput=${e => this.setState({ loginPassword: e.target.value })} 
                                        placeholder="••••••••"
                                        required 
                                    />
                                </div>

                                <button type="submit" class="btn-portal btn-portal-primary" style="width: 100%; margin-top: 1.25rem; padding: 0.75rem; justify-content: center;" disabled=${loginLoading}>
                                    <i class="dashicons dashicons-lock" style="margin-left: 4px;"></i>
                                    <span>${loginLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                `;
            }

            // 2. Universal Smart Welcome Gateway (For all logged in users during transition or for subscribers)
            if (isLoggedIn && (inGatewayTransition || executiveType === 'subscriber' || config.canAccessPortal === false)) {
                return this.renderSmartGatewayCard();
            }

            // 3. Executive Intelligence Radar View (For Admins, Project Leads, and Members)
            if (executiveType !== 'client' && !isPreviewAsClient) {
                return this.renderExecutiveRadar();
            }

            // Active Intake Form Schema
            const activeForm = (intakeForms && intakeForms.find(f => f.id === selectedFormId)) || (intakeForms && intakeForms[0]) || {
                name: 'طلب مشروع جديد',
                title_label: 'عنوان الطلب / اسم المشروع:',
                title_placeholder: 'اكتب اسم أو عنوان طلبك...',
                desc_label: 'بيان وشرح تفاصيل الطلب:',
                desc_placeholder: 'وضح بالتفصيل ما تريده من فريق العمل...',
                title_suggestions: [],
                specs: []
            };

            const myRequestsCount = projects.filter(p => p.is_client_request).length;

            // 4. Authenticated Client Workspace
            return html`
                <div class="portal-app-wrapper" onClick=${() => { if (isNotificationsOpen || isProfileMenuOpen) this.setState({ isNotificationsOpen: false, isProfileMenuOpen: false }); }}>
                    
                    <!-- Real-Time Floating Approval Toast Notification -->
                    ${activeToastAlert && html`
                        <div 
                            style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 999999; max-width: 540px; width: 92%; background: #ffffff; border: 2px solid var(--wp-primary); padding: 1rem 1.25rem; box-shadow: var(--wp-shadow-modal); display: flex; align-items: center; justify-content: space-between; gap: 1rem;"
                            onClick=${e => e.stopPropagation()}
                        >
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <i class="dashicons dashicons-yes-alt" style="color: var(--wp-primary); font-size: 24px;"></i>
                                <div>
                                    <div style="color: var(--wp-text-main); font-weight: 800; font-size: 0.9rem;" dangerouslySetInnerHTML=${{ __html: activeToastAlert.message }}></div>
                                    <div style="color: var(--wp-text-muted); font-size: 0.78rem;">تم تحديث حالة طلبكم رسمياً.</div>
                                </div>
                            </div>

                            <button 
                                type="button" 
                                class="btn-portal btn-portal-outline btn-portal-sm"
                                onClick=${() => this.setState({ activeToastAlert: null })}
                            >
                                إغلاق
                            </button>
                        </div>
                    `}

                    <!-- Preview Mode Banner (for Executives) -->
                    ${(executiveType !== 'client' && isPreviewAsClient) && html`
                        <div style="background: var(--wp-bg-subtle); border-bottom: 2px solid var(--wp-indigo); padding: 0.5rem 1.5rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 1000;">
                            <div style="display: flex; align-items: center; gap: 6px; color: var(--wp-text-secondary); font-weight: 700; font-size: 0.82rem;">
                                <i class="dashicons dashicons-visibility" style="color: var(--wp-indigo);"></i>
                                <span>وضع المعاينة التجريبية كزبون — استعراض البوابة كما يراها العميل تماماً.</span>
                            </div>

                            <button 
                                class="btn-portal btn-portal-indigo btn-portal-sm"
                                onClick=${() => {
                                    this.setState({ isPreviewAsClient: false });
                                    playPortalSound('button');
                                }}
                            >
                                <span>العودة للرادار التنفيذي</span>
                            </button>
                        </div>
                    `}

                    <!-- TWO-TIER WORKPRESS INSTITUTIONAL HEADER -->
                    <div class="portal-header-wrapper">
                        
                        <!-- Top Tier -->
                        <div class="portal-top-bar">
                            <div class="portal-brand-area">
                                <a href="#/" style="text-decoration: none;">
                                    ${renderWorkPressLogo(32)}
                                </a>
                                <span class="portal-site-badge">
                                    <i class="dashicons dashicons-portfolio"></i>
                                    <span>مساحة المستفيد</span>
                                </span>
                                <a href="${config.siteUrl}" class="portal-back-link">
                                    <span>العودة للموقع الرئيسي</span>
                                    <i class="dashicons dashicons-external"></i>
                                </a>
                            </div>

                            <div class="portal-user-controls">
                                <!-- Notification Bell Button & Drawer Popover -->
                                <div style="position: relative;">
                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-outline btn-portal-sm" 
                                        style="position: relative; padding: 0.4rem 0.65rem;"
                                        onClick=${(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ isNotificationsOpen: !prevState.isNotificationsOpen, isProfileMenuOpen: false }));
                                            playPortalSound('button');
                                        }}
                                        title="التنبيهات والإشعارات"
                                    >
                                        <i class="dashicons dashicons-bell" style="font-size: 18px; color: ${unreadNotificationsCount > 0 ? 'var(--wp-warning)' : 'inherit'};"></i>
                                        ${unreadNotificationsCount > 0 ? html`
                                            <span style="background: var(--wp-danger); color: #fff; font-size: 0.7rem; font-weight: 900; padding: 1px 5px; margin-right: 4px;">
                                                ${unreadNotificationsCount}
                                            </span>
                                        ` : null}
                                    </button>

                                    <!-- Notification Popover Drawer -->
                                    ${isNotificationsOpen && html`
                                        <div 
                                            class="portal-popover-drawer"
                                            onClick=${e => e.stopPropagation()}
                                        >
                                            <div class="portal-popover-header">
                                                <div style="display: flex; align-items: center; gap: 6px; font-weight: 800; font-size: 0.88rem; color: var(--wp-text-main);">
                                                    <i class="dashicons dashicons-bell"></i>
                                                    <span>التنبيهات المباشرة</span>
                                                </div>
                                                ${unreadNotificationsCount > 0 ? html`
                                                    <button 
                                                        type="button" 
                                                        style="background: none; border: none; color: var(--wp-indigo); font-size: 0.75rem; font-weight: 700; cursor: pointer; text-decoration: underline;"
                                                        onClick=${() => this.markAllNotificationsAsRead()}
                                                    >
                                                        تحديد الكل كمقروء
                                                    </button>
                                                ` : null}
                                            </div>

                                            <div style="max-height: 340px; overflow-y: auto; padding: 0.5rem;">
                                                ${notifications.length === 0 ? html`
                                                    <div style="padding: 2rem 1rem; text-align: center; color: var(--wp-text-muted); font-size: 0.85rem;">
                                                        <i class="dashicons dashicons-inbox" style="font-size: 32px; height: 32px; width: 32px; display: block; margin: 0 auto 0.5rem;"></i>
                                                        <p>لا توجد تنبيهات جديدة</p>
                                                    </div>
                                                ` : html`
                                                    <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                                                        ${notifications.map(n => html`
                                                            <div 
                                                                key=${n.id}
                                                                style="background: ${n.is_read ? 'var(--wp-bg-subtle)' : 'var(--wp-primary-light)'}; border: 1px solid ${n.is_read ? 'var(--wp-border)' : 'var(--wp-primary-border)'}; padding: 0.65rem; cursor: pointer;"
                                                                onClick=${() => {
                                                                    if (!n.is_read) this.markNotificationAsRead(n.id);
                                                                    if (n.project_id) {
                                                                        this.setState({ selectedProjectId: n.project_id, isNotificationsOpen: false });
                                                                        this.loadProjectDetails(n.project_id);
                                                                        this.navigateToTab('deliverables');
                                                                    }
                                                                }}
                                                            >
                                                                <div style="font-size: 0.82rem; color: var(--wp-text-main); line-height: 1.4; font-weight: ${n.is_read ? '500' : '700'};" dangerouslySetInnerHTML=${{ __html: n.message }}></div>
                                                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--wp-text-muted); margin-top: 4px;">
                                                                    <span>${n.created_at ? n.created_at.substring(0, 16) : ''}</span>
                                                                    ${n.project_id ? html`
                                                                        <span style="color: var(--wp-primary); font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">
                                                                            <span>عرض المشروع</span>
                                                                            <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
                                                                        </span>
                                                                    ` : null}
                                                                </div>
                                                            </div>
                                                        `)}
                                                    </div>
                                                `}
                                            </div>
                                        </div>
                                    `}
                                </div>

                                <!-- User Profile Trigger & Dropdown Menu -->
                                <div style="position: relative;">
                                    <button 
                                        type="button" 
                                        class="portal-profile-trigger ${isProfileMenuOpen ? 'is-active' : ''}" 
                                        onClick=${(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ isProfileMenuOpen: !prevState.isProfileMenuOpen, isNotificationsOpen: false }));
                                            playPortalSound('button');
                                        }}
                                        title="الملف الشخصي والخيارات"
                                    >
                                        ${user.avatar_url ? html`
                                            <img src="${user.avatar_url}" alt="${user.display_name}" class="portal-avatar-img" />
                                        ` : html`
                                            <div style="width: 28px; height: 28px; background: var(--wp-bg-subtle); display: flex; align-items: center; justify-content: center;">
                                                <i class="dashicons dashicons-admin-users" style="font-size: 18px; color: var(--wp-text-secondary);"></i>
                                            </div>
                                        `}
                                        <i class="dashicons dashicons-arrow-down-alt2" style="font-size: 14px; color: var(--wp-text-muted);"></i>
                                    </button>

                                    <!-- Profile Dropdown Popover -->
                                    ${isProfileMenuOpen && html`
                                        <div 
                                            class="portal-profile-dropdown"
                                            onClick=${e => e.stopPropagation()}
                                        >
                                            <div class="portal-profile-header">
                                                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 0.35rem;">
                                                    ${user.avatar_url ? html`
                                                        <img src="${user.avatar_url}" alt="${user.display_name}" style="width: 36px; height: 36px; object-fit: cover; border: 1px solid var(--wp-border);" />
                                                    ` : html`
                                                        <div style="width: 36px; height: 36px; background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); display: flex; align-items: center; justify-content: center; color: var(--wp-primary);">
                                                            <i class="dashicons dashicons-admin-users" style="font-size: 20px;"></i>
                                                        </div>
                                                    `}
                                                    <div>
                                                        <div style="display: flex; align-items: center; gap: 6px;">
                                                            <span style="font-weight: 800; font-size: 0.92rem; color: var(--wp-text-main);">
                                                                ${user.display_name}
                                                            </span>
                                                            <span style="background: var(--wp-warning-light); border: 1px solid var(--wp-warning-border); color: var(--wp-warning-text); font-size: 0.72rem; font-weight: 800; padding: 1px 6px;">
                                                                ${roleLabel || 'مستفيد'}
                                                            </span>
                                                        </div>
                                                        ${user.email ? html`
                                                            <div style="font-size: 0.78rem; color: var(--wp-text-muted); margin-top: 1px;">
                                                                ${user.email}
                                                            </div>
                                                        ` : null}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style="padding: 0.35rem 0;">
                                                ${(executiveType !== 'client') && html`
                                                    <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="portal-profile-item">
                                                        <i class="dashicons dashicons-dashboard" style="color: var(--wp-indigo);"></i>
                                                        <span>غرفة عمليات CoWorkPress</span>
                                                    </a>
                                                `}

                                                <a href="${config.siteUrl || '/'}" class="portal-profile-item">
                                                    <i class="dashicons dashicons-admin-home" style="color: var(--wp-text-muted);"></i>
                                                    <span>الموقع الرئيسي</span>
                                                </a>

                                                <a 
                                                    href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                                                    class="portal-profile-item is-logout"
                                                >
                                                    <i class="dashicons dashicons-migrate"></i>
                                                    <span>تسجيل الخروج</span>
                                                </a>
                                            </div>
                                        </div>
                                    `}
                                </div>
                            </div>
                        </div>

                        <!-- Second Tier: Primary Action CTA & Project Switcher Dropdown -->
                        <div class="portal-action-bar">
                            <div class="portal-action-right">
                                <button 
                                    class="btn-portal btn-portal-primary btn-portal-sm" 
                                    style="font-weight: 800;"
                                    onClick=${() => this.navigateToTab('new-request')}
                                >
                                    <i class="dashicons dashicons-plus-alt2"></i>
                                    <span>طلب خدمة / مشروع جديد</span>
                                </button>
                            </div>

                            ${projects.length > 0 ? html`
                                <div class="portal-action-left" style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--wp-text-secondary); display: inline-flex; align-items: center; gap: 4px;">
                                        <i class="dashicons dashicons-portfolio" style="color: var(--wp-text-muted);"></i>
                                        <span>المشروع النشط:</span>
                                    </span>
                                    <select class="portal-switcher-select" value=${selectedProjectId} onChange=${this.handleProjectChange.bind(this)}>
                                        ${projects.map(p => html`
                                            <option key=${p.id} value=${p.id}>${p.name} (${p.prefix})</option>
                                        `)}
                                    </select>
                                </div>
                            ` : null}
                        </div>

                        <!-- Third Tier: Navigation Tabs Bar -->
                        <div class="portal-tabs-bar">
                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'deliverables' ? 'is-active' : ''}"
                                onClick=${() => this.navigateToTab('deliverables')}
                            >
                                <i class="dashicons dashicons-portfolio"></i>
                                <span>المخرجات المعتمدة (${deliverables.length})</span>
                            </button>

                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'milestones' ? 'is-active' : ''}"
                                onClick=${() => this.navigateToTab('milestones')}
                            >
                                <i class="dashicons dashicons-clipboard"></i>
                                <span>المراحل والمهام (${milestones.length})</span>
                            </button>

                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'feedback' ? 'is-active' : ''}"
                                onClick=${() => this.navigateToTab('feedback')}
                            >
                                <i class="dashicons dashicons-format-chat"></i>
                                <span>الاستفسارات والملاحظات</span>
                            </button>

                            <button 
                                type="button"
                                class="portal-tab-pill ${activeTab === 'my-requests' ? 'is-active' : ''}"
                                onClick=${() => this.navigateToTab('my-requests')}
                            >
                                <i class="dashicons dashicons-email-alt"></i>
                                <span>سجل طلباتي (${myRequestsCount})</span>
                            </button>
                        </div>
                    </div>

                    <main class="portal-container">
                        ${loading && html`
                            <div class="portal-initial-loader">
                                <div class="portal-spinner"></div>
                                <p>جاري تحميل بيانات المشاريع والمخرجات...</p>
                            </div>
                        `}

                        <!-- VIEW 1: REQUEST STUDIO -->
                        ${!loading && activeTab === 'new-request' && window.WorkPressPortal?.renderRequestStudio && window.WorkPressPortal.renderRequestStudio({
                            projects,
                            activeForm,
                            intakeForms,
                            selectedFormId,
                            reqCustomTitle,
                            reqDesc,
                            reqSpecs,
                            uploadingSpecs,
                            reqSubmitting,
                            reqSuccess,
                            reqError,
                            onNavigateToTab: (tab) => this.navigateToTab(tab),
                            onFormTypeChange: (formId) => this.handleFormTypeChange(formId),
                            onTitleChange: (val) => this.setState({ reqCustomTitle: val }),
                            onDescChange: (val) => this.setState({ reqDesc: val }),
                            onSpecChange: (key, val) => this.handleSpecChange(key, val),
                            onToggleSpecPill: (key, pill) => this.toggleSpecPill(key, pill),
                            onFileUpload: (key, e) => this.handleFileUpload(key, e),
                            onRemoveUploadedFile: (key, idx) => this.removeUploadedFile(key, idx),
                            onSubmit: this.handleRequestSubmit.bind(this),
                            onResetSuccess: () => this.setState({ reqSuccess: '', reqCustomTitle: '', reqDesc: '', reqSpecs: {} })
                        })}

                        <!-- VIEW 2 & 3: WORKSPACE & ACTIVE PROJECT DASHBOARD -->
                        ${!loading && window.WorkPressPortal?.renderWorkspace && window.WorkPressPortal.renderWorkspace({
                            projects,
                            projectData,
                            selectedProjectId,
                            activeTab,
                            deliverables,
                            milestones,
                            feedbackTask,
                            feedbackActionType,
                            feedbackMsg,
                            feedbackSuccess,
                            feedbackError,
                            feedbackSubmitting,
                            onNavigateToTab: (tab) => this.navigateToTab(tab),
                            onOpenProjectReport: (id) => this.openProjectReport(id),
                            onFeedbackTaskChange: (val) => this.setState({ feedbackTask: val }),
                            onFeedbackActionTypeChange: (val) => this.setState({ feedbackActionType: val }),
                            onFeedbackMsgChange: (val) => this.setState({ feedbackMsg: val }),
                            onFeedbackSubmit: this.handleFeedbackSubmit.bind(this)
                        })}
                    </main>

                    <!-- Official Project PDF Report Modal -->
                    ${window.WorkPressPortal?.renderProjectReportModal && window.WorkPressPortal.renderProjectReportModal({
                        isOpen: reportModalOpen,
                        reportData: reportModalData,
                        loading: reportLoading,
                        onClose: this.closeProjectReport.bind(this)
                    })}
                </div>
            `;
        }
    }

    // Mount Preact Application
    const rootEl = document.getElementById('workpress-portal-root');
    if (rootEl) {
        rootEl.innerHTML = '';
        render(html`<${PortalApp} />`, rootEl);
    }
})();
