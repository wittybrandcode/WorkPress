/**
 * WorkPress Client Portal SPA Application (Modern SaaS Controller)
 *
 * Implements WorkPress Official Brand Architecture:
 * - Lean State Controller & Reactive Router (Preact + HTM)
 * - Zero-build modular presentation layer
 * - 100% semantic BEM CSS classes with strict sharp edges (0px radius)
 * - Reactive Internationalization (i18n) and instant language switching
 *
 * @package WorkPress
 * @subpackage Assets/JS
 * @version 2.3.0
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
    const __ = window.__ || ((s) => s);

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
            const roleLabel = config.roleLabel || (config.user && config.user.is_admin ? __('Administrator', 'workpress') : __('Client', 'workpress'));

            const urlParams = new URLSearchParams(window.location.search);
            const isWelcomeParam = urlParams.get('welcome') === '1';
            const isPreviewSub = urlParams.get('preview') === 'subscriber';
            const isPreviewStaff = urlParams.get('preview') === 'staff';
            const isPreviewClient = urlParams.get('preview') === 'client';

            let forcedExecType = executiveType;
            let forcedRoleLabel = roleLabel;
            if (isPreviewSub) {
                forcedExecType = 'subscriber';
                forcedRoleLabel = __('Subscriber', 'workpress');
            } else if (isPreviewStaff) {
                forcedExecType = 'admin';
                forcedRoleLabel = __('Administrator', 'workpress');
            } else if (isPreviewClient) {
                forcedExecType = 'client';
                forcedRoleLabel = __('Client', 'workpress');
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
                requests: [],
                selectedProjectId: null,
                projectData: null,
                deliverables: [],
                milestones: [],
                activeTab: isRequestRoute ? 'new-request' : 'dashboard',
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
                isLanguageMenuOpen: false,
                activeToastAlert: null,
                prevUnreadCount: null
            };
        }

        componentDidMount() {
            // Subscribe to reactive language changes
            if (window.WorkPressPortalI18n && typeof window.WorkPressPortalI18n.onLanguageChange === 'function') {
                this.unsubscribeLang = window.WorkPressPortalI18n.onLanguageChange(() => {
                    this.forceUpdate();
                });
            }

            if (this.state.isLoggedIn) {
                if (this.state.inGatewayTransition || config.canAccessPortal === false || this.state.executiveType === 'subscriber') {
                    this.setState({ loading: false });
                    this.startGatewayCountdown();
                    return;
                }

                if (this.state.executiveType !== 'client' && this.state.executiveType !== 'subscriber') {
                    this.fetchRadarIntelligence();
                }
                this.fetchProjects();
                this.fetchClientRequests();
                this.fetchIntakeForms();
                this.fetchPulseAndNotifications();
                
                this.pulseTimer = setInterval(() => {
                    this.fetchPulseAndNotifications();
                }, 6000);

                document.addEventListener('visibilitychange', this.handleVisibilityChange);
                window.addEventListener('hashchange', this.handleHashChange);
            } else {
                this.setState({ loading: false });
            }
        }

        componentWillUnmount() {
            if (this.pulseTimer) clearInterval(this.pulseTimer);
            if (this.gatewayTimer) clearInterval(this.gatewayTimer);
            if (this.unsubscribeLang) this.unsubscribeLang();
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('hashchange', this.handleHashChange);
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
            } catch (err) {}
        }

        async markNotificationAsRead(notificationId) {
            try {
                await apiFetch(`notifications/${notificationId}/read`, 'POST');
                this.setState(prevState => ({
                    notifications: prevState.notifications.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n),
                    unreadNotificationsCount: Math.max(0, prevState.unreadNotificationsCount - 1)
                }));
            } catch (err) {}
        }

        async markAllNotificationsAsRead() {
            try {
                await apiFetch('notifications/read-all', 'POST');
                this.setState(prevState => ({
                    notifications: prevState.notifications.map(n => ({ ...n, is_read: 1 })),
                    unreadNotificationsCount: 0
                }));
                playPortalSound('button');
            } catch (err) {}
        }

        async fetchRadarIntelligence() {
            this.setState({ radarLoading: true });
            try {
                const res = await apiFetch('radar');
                if (res.success && res.data) {
                    this.setState({ radarData: res.data, radarLoading: false });
                }
            } catch (err) {
                this.setState({ radarLoading: false });
            }
        }

        handleHashChange = () => {
            const hash = window.location.hash || '#/';
            if (hash.startsWith('#/new-request') || hash.startsWith('#/request')) {
                this.setState({ activeTab: 'new-request' });
            } else if (hash.startsWith('#/my-requests')) {
                this.setState({ activeTab: 'my-requests' });
            } else if (hash.startsWith('#/projects')) {
                const targetId = this.state.selectedProjectId || (this.state.projects.length > 0 ? this.state.projects[0].id : null);
                if (targetId) {
                    this.setState({ selectedProjectId: targetId, activeTab: 'deliverables' });
                    this.loadProjectDetails(targetId);
                } else {
                    this.setState({ activeTab: 'projects' });
                }
            } else if (hash.startsWith('#/project/')) {
                const parts = hash.replace('#/project/', '').split('/');
                const pid = parseInt(parts[0], 10);
                const subtab = parts[1] || 'deliverables';
                if (pid && pid !== this.state.selectedProjectId) {
                    this.setState({ selectedProjectId: pid, activeTab: subtab });
                    this.loadProjectDetails(pid);
                } else {
                    this.setState({ activeTab: subtab });
                }
            } else if (hash.startsWith('#/milestones') || hash.startsWith('#/roadmap')) {
                this.setState({ activeTab: 'milestones' });
            } else if (hash.startsWith('#/feedback') || hash.startsWith('#/messages')) {
                this.setState({ activeTab: 'feedback' });
            } else {
                this.setState({ activeTab: 'dashboard', selectedProjectId: null });
            }
        };

        navigateToTab(tabName) {
            playPortalSound('button');
            this.setState({ activeTab: tabName });
            if (tabName === 'dashboard') {
                this.setState({ selectedProjectId: null, activeTab: 'dashboard' });
                window.location.hash = '#/';
            } else if (tabName === 'new-request') {
                window.location.hash = '#/new-request';
            } else if (tabName === 'my-requests') {
                window.location.hash = '#/my-requests';
            } else if (tabName === 'projects') {
                const targetId = this.state.selectedProjectId || (this.state.projects.length > 0 ? this.state.projects[0].id : null);
                if (targetId) {
                    this.setState({ selectedProjectId: targetId, activeTab: 'deliverables' });
                    this.loadProjectDetails(targetId);
                    window.location.hash = '#/project/' + targetId + '/deliverables';
                } else {
                    this.setState({ activeTab: 'projects' });
                    window.location.hash = '#/projects';
                }
            } else if (this.state.selectedProjectId) {
                window.location.hash = '#/project/' + this.state.selectedProjectId + '/' + tabName;
            } else {
                window.location.hash = '#/' + tabName;
            }
        }

        async fetchClientRequests() {
            try {
                const res = await apiFetch('my-requests');
                if (res && res.success && res.data) {
                    this.setState({ requests: res.data });
                }
            } catch (err) {}
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
            } catch (err) {}
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

        handleSpecChange(specKey, val) {
            this.setState(prevState => ({
                reqSpecs: {
                    ...prevState.reqSpecs,
                    [specKey]: val
                }
            }));
        }

        toggleSpecPill(specKey, pillVal) {
            this.setState(prevState => {
                const curList = Array.isArray(prevState.reqSpecs[specKey]) ? [...prevState.reqSpecs[specKey]] : [];
                const idx = curList.indexOf(pillVal);
                if (idx > -1) {
                    curList.splice(idx, 1);
                } else {
                    curList.push(pillVal);
                }
                return {
                    reqSpecs: {
                        ...prevState.reqSpecs,
                        [specKey]: curList
                    }
                };
            });
            playPortalSound('button');
        }

        async handleFileUpload(specKey, event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;

            this.setState(prevState => ({
                uploadingSpecs: { ...prevState.uploadingSpecs, [specKey]: true }
            }));

            try {
                const uploadedFiles = [];
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);

                    const res = await fetch(`${config.apiUrl}/upload`, {
                        method: 'POST',
                        headers: {
                            'X-WP-Nonce': config.restNonce || ''
                        },
                        body: formData
                    });
                    const data = await res.json();
                    if (data && data.url) {
                        uploadedFiles.push({ name: file.name, url: data.url, id: data.id });
                    }
                }

                this.setState(prevState => {
                    const curList = Array.isArray(prevState.reqSpecs[specKey]) ? [...prevState.reqSpecs[specKey]] : [];
                    return {
                        reqSpecs: {
                            ...prevState.reqSpecs,
                            [specKey]: curList.concat(uploadedFiles)
                        },
                        uploadingSpecs: { ...prevState.uploadingSpecs, [specKey]: false }
                    };
                });
                playPortalSound('button');
            } catch (err) {
                this.setState(prevState => ({
                    uploadingSpecs: { ...prevState.uploadingSpecs, [specKey]: false }
                }));
                alert(__('An error occurred while uploading file.', 'workpress'));
            }
        }

        removeUploadedFile(specKey, fIdx) {
            this.setState(prevState => {
                const curList = Array.isArray(prevState.reqSpecs[specKey]) ? [...prevState.reqSpecs[specKey]] : [];
                curList.splice(fIdx, 1);
                return {
                    reqSpecs: {
                        ...prevState.reqSpecs,
                        [specKey]: curList
                    }
                };
            });
            playPortalSound('button');
        }

        async fetchProjects() {
            try {
                const res = await apiFetch('my-projects');
                if (res.success && Array.isArray(res.data)) {
                    const projects = res.data;
                    const initialProjectId = projects.length > 0 ? projects[0].id : null;
                    
                    this.setState({
                        projects,
                        loading: false
                    });

                    if (this.state.selectedProjectId) {
                        this.loadProjectDetails(this.state.selectedProjectId);
                    }
                } else {
                    this.setState({ loading: false });
                }
            } catch (err) {
                this.setState({ loading: false });
            }
        }

        async loadProjectDetails(projectId) {
            if (!projectId) return;
            try {
                const [projectRes, deliverablesRes, milestonesRes] = await Promise.all([
                    apiFetch(`projects/${projectId}`),
                    apiFetch(`projects/${projectId}/deliverables`),
                    apiFetch(`projects/${projectId}/milestones`)
                ]);

                const projectData = projectRes.success ? projectRes.data : null;
                const deliverables = deliverablesRes.success ? deliverablesRes.data : [];
                const milestones = milestonesRes.success ? milestonesRes.data : [];

                const firstMilestoneId = milestones.length > 0 ? milestones[0].id : '';

                this.setState({
                    projectData,
                    deliverables,
                    milestones,
                    feedbackTask: this.state.feedbackTask || firstMilestoneId
                });
            } catch (err) {}
        }

        handleProjectChange(e) {
            const val = e.target.value;
            if (!val) {
                this.setState({ selectedProjectId: null, activeTab: 'dashboard' });
                window.location.hash = '#/';
            } else {
                const newId = parseInt(val, 10);
                this.setState({ selectedProjectId: newId, activeTab: 'deliverables' });
                this.loadProjectDetails(newId);
                window.location.hash = '#/project/' + newId;
            }
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
                    config.roleLabel = res.user.role_label || __('Subscriber', 'workpress');
                    if (res.nonce) config.restNonce = res.nonce;

                    playPortalSound('celebration');

                    this.setState({
                        isLoggedIn: true,
                        user: res.user,
                        executiveType: res.user.executive_type || 'subscriber',
                        roleLabel: res.user.role_label || __('Subscriber', 'workpress'),
                        inGatewayTransition: true,
                        gatewayCountdown: 10,
                        loginLoading: false
                    }, () => {
                        this.startGatewayCountdown();
                    });
                } else {
                    this.setState({ loginError: res.message || __('Invalid credentials.', 'workpress'), loginLoading: false });
                }
            } catch (err) {
                this.setState({ loginError: err.message || __('Connection failed, please try again.', 'workpress'), loginLoading: false });
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
                    feedbackSuccess: res.message || __('Your feedback has been sent successfully.', 'workpress'),
                    feedbackMsg: '',
                    feedbackSubmitting: false,
                    feedbackError: ''
                });

                setTimeout(() => {
                    this.setState({ feedbackSuccess: '' });
                }, 5000);
            } catch (err) {
                this.setState({
                    feedbackError: err.message || __('Failed to send feedback, please try again.', 'workpress'),
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
                this.setState({ reqError: __('Please enter a title for the project request.', 'workpress') });
                return;
            }

            this.setState({ reqSubmitting: true, reqSuccess: '', reqError: '' });
            try {
                const res = await apiFetch('request', 'POST', {
                    title: finalTitle,
                    description: reqDesc,
                    form_id: activeForm.id || 'standard_request',
                    specs: reqSpecs,
                    budget: reqSpecs.budget_est || '',
                    due_date: reqSpecs.target_date || ''
                });

                playPortalSound('celebration');
                this.setState({
                    reqSuccess: __('Request Submitted Successfully!', 'workpress'),
                    reqCreatedProjectId: res.project_id || null,
                    reqCustomTitle: '',
                    reqDesc: '',
                    reqSpecs: {},
                    reqSubmitting: false
                });
                this.fetchProjects();
            } catch (err) {
                this.setState({
                    reqError: err.message || __('An error occurred while submitting request.', 'workpress'),
                    reqSubmitting: false
                });
            }
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
                    throw new Error(res.message || __('Unable to load executive report.', 'workpress'));
                }
            } catch (err) {
                this.setState({ reportLoading: false, reportModalOpen: false });
                alert(err.message || __('An error occurred while loading report.', 'workpress'));
            }
        }

        closeProjectReport() {
            this.setState({ reportModalOpen: false, reportModalData: null });
        }

        render() {
            const { 
                isLoggedIn, loading, user, projects, selectedProjectId, projectData, 
                deliverables, milestones, activeTab, reqSubmitting, reqSuccess, reqError,
                feedbackTask, feedbackMsg, feedbackActionType, feedbackSuccess, feedbackError, feedbackSubmitting,
                intakeForms, selectedFormId, reqCustomTitle, reqDesc, reqSpecs, uploadingSpecs,
                loginUsername, loginPassword, loginLoading, loginError,
                executiveType, roleLabel, isPreviewAsClient, reportModalOpen, reportModalData, reportLoading,
                notifications, unreadNotificationsCount, isNotificationsOpen, isProfileMenuOpen, isLanguageMenuOpen, activeToastAlert,
                inGatewayTransition
            } = this.state;

            // 1. Standalone Login Canvas (When not logged in)
            if (!isLoggedIn) {
                return window.WorkPressPortal?.renderLoginCanvas ? window.WorkPressPortal.renderLoginCanvas({
                    loginUsername,
                    loginPassword,
                    loginLoading,
                    loginError,
                    onUsernameChange: (val) => this.setState({ loginUsername: val }),
                    onPasswordChange: (val) => this.setState({ loginPassword: val }),
                    onLoginSubmit: this.handleLogin.bind(this),
                    renderWorkPressLogo
                }) : null;
            }

            // 2. Universal Smart Welcome Gateway
            if (isLoggedIn && (inGatewayTransition || executiveType === 'subscriber' || config.canAccessPortal === false)) {
                return window.WorkPressPortal?.renderSmartGatewayCard ? window.WorkPressPortal.renderSmartGatewayCard({
                    user,
                    gatewayCountdown: this.state.gatewayCountdown,
                    executiveType,
                    roleLabel,
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
                }) : null;
            }

            // 3. Executive Intelligence Radar View (For Staff)
            if (executiveType !== 'client' && !isPreviewAsClient) {
                return window.WorkPressPortal?.renderExecutiveRadar ? window.WorkPressPortal.renderExecutiveRadar({
                    user,
                    executiveType,
                    roleLabel,
                    adminUrl: this.state.adminUrl,
                    radarData: this.state.radarData,
                    radarLoading: this.state.radarLoading,
                    isProfileMenuOpen,
                    onToggleProfileMenu: (isOpen) => this.setState({ isProfileMenuOpen: isOpen }),
                    onPreviewAsClient: () => this.setState({ isPreviewAsClient: true }),
                    onRefreshRadar: () => this.fetchRadarIntelligence()
                }) : null;
            }

            const activeForm = (intakeForms && intakeForms.find(f => f.id === selectedFormId)) || (intakeForms && intakeForms[0]) || {};
            const myRequestsCount = projects.filter(p => p.is_client_request).length;

            // 4. Authenticated Client Workspace
            return html`
                <div class="portal-app-wrapper" onClick=${() => { if (isNotificationsOpen || isProfileMenuOpen || isLanguageMenuOpen) this.setState({ isNotificationsOpen: false, isProfileMenuOpen: false, isLanguageMenuOpen: false }); }}>
                    
                    <!-- Institutional Header & Navigation -->
                    ${window.WorkPressPortal?.renderPortalHeader && window.WorkPressPortal.renderPortalHeader({
                        activeToastAlert,
                        onCloseToastAlert: () => this.setState({ activeToastAlert: null }),
                        executiveType,
                        isPreviewAsClient,
                        onReturnToRadar: () => {
                            this.setState({ isPreviewAsClient: false });
                            playPortalSound('button');
                        },
                        config,
                        renderWorkPressLogo,
                        notifications,
                        unreadNotificationsCount,
                        isNotificationsOpen,
                        onToggleNotifications: (e) => {
                            e.stopPropagation();
                            this.setState(prevState => ({ isNotificationsOpen: !prevState.isNotificationsOpen, isProfileMenuOpen: false, isLanguageMenuOpen: false }));
                            playPortalSound('button');
                        },
                        onMarkNotificationRead: (id) => this.markNotificationAsRead(id),
                        onMarkAllNotificationsRead: () => this.markAllNotificationsAsRead(),
                        onSelectNotificationProject: (pid) => {
                            this.setState({ selectedProjectId: pid, isNotificationsOpen: false });
                            this.loadProjectDetails(pid);
                            this.navigateToTab('deliverables');
                        },
                        isLanguageMenuOpen,
                        onToggleLanguageMenu: (e) => {
                            if (e) e.stopPropagation();
                            this.setState(prevState => ({ isLanguageMenuOpen: !prevState.isLanguageMenuOpen, isNotificationsOpen: false, isProfileMenuOpen: false }));
                            playPortalSound('button');
                        },
                        user,
                        roleLabel,
                        adminUrl: this.state.adminUrl,
                        isProfileMenuOpen,
                        onToggleProfileMenu: (e) => {
                            e.stopPropagation();
                            this.setState(prevState => ({ isProfileMenuOpen: !prevState.isProfileMenuOpen, isNotificationsOpen: false, isLanguageMenuOpen: false }));
                            playPortalSound('button');
                        },
                        projects,
                        selectedProjectId,
                        onProjectChange: this.handleProjectChange.bind(this),
                        activeTab,
                        onNavigateToTab: (tab) => this.navigateToTab(tab),
                        deliverablesCount: deliverables.length,
                        milestonesCount: milestones.length,
                        myRequestsCount,
                        playPortalSound
                    })}

                    <main class="portal-container">
                        ${loading && html`
                            <div class="portal-initial-loader">
                                <div class="portal-spinner"></div>
                                <p>${__('Loading...', 'workpress')}</p>
                            </div>
                        `}

                        <!-- VIEW 1: EXECUTIVE CLIENT DASHBOARD (HOME HUB) -->
                        ${!loading && activeTab === 'dashboard' && window.WorkPressPortal?.renderPortalDashboard && window.WorkPressPortal.renderPortalDashboard({
                            user,
                            roleLabel,
                            projects,
                            requests: this.state.requests,
                            pulse: this.state.radarData || {},
                            notifications,
                            onSelectProject: (pid) => {
                                this.setState({ selectedProjectId: pid, activeTab: 'deliverables' });
                                this.loadProjectDetails(pid);
                                window.location.hash = '#/project/' + pid + '/deliverables';
                            },
                            onOpenRequestModal: () => this.navigateToTab('new-request'),
                            onOpenDeliverableReview: (candidate) => {
                                if (candidate && candidate.project_id) {
                                    this.setState({ selectedProjectId: candidate.project_id, activeTab: 'deliverables' });
                                    this.loadProjectDetails(candidate.project_id);
                                    window.location.hash = '#/project/' + candidate.project_id + '/deliverables';
                                }
                            },
                            onOpenProjectReport: (id) => this.openProjectReport(id),
                            playPortalSound
                        })}

                        <!-- VIEW 2: REQUEST STUDIO -->
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

                        <!-- VIEW 3: ACTIVE PROJECT WORKSPACE -->
                        ${!loading && (selectedProjectId || activeTab === 'my-requests') && activeTab !== 'new-request' && activeTab !== 'dashboard' && window.WorkPressPortal?.renderWorkspace && window.WorkPressPortal.renderWorkspace({
                            projects,
                            projectData,
                            selectedProjectId,
                            activeTab,
                            deliverables,
                            milestones,
                            requests: this.state.requests,
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
