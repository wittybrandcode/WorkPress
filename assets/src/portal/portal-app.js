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
 * @version 2.1.0
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

    /**
     * API Request Helper with Auto Nonce Recovery
     */
    async function apiFetch(endpoint, method = 'GET', body = null, isRetry = false) {
        const url = `${config.apiUrl}/${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'X-WP-Nonce': config.restNonce || ''
        };

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const res = await fetch(url, options);
        const json = await res.json();
        
        // Handle expired nonce seamlessly
        if (!res.ok) {
            if ((res.status === 403 || json.code === 'rest_cookie_invalid_nonce') && !isRetry && endpoint !== 'refresh-nonce') {
                try {
                    const refreshRes = await fetch(`${config.apiUrl}/refresh-nonce`);
                    const refreshJson = await refreshRes.json();
                    if (refreshJson && refreshJson.nonce) {
                        config.restNonce = refreshJson.nonce;
                        return await apiFetch(endpoint, method, body, true);
                    }
                } catch (retryErr) {
                    console.warn('WorkPress Portal: Nonce refresh failed', retryErr);
                }
            }
            throw new Error(json.message || 'حدث خطأ أثناء معالجة الطلب');
        }
        return json;
    }

    /**
     * Lightweight Portal Sound Player (SND Engine)
     */
    let portalAudioCtx = null;
    let portalAudioBuffer = null;
    let portalSpriteMap = null;

    async function playPortalSound(soundName) {
        try {
            if (!portalAudioCtx && (window.AudioContext || window.webkitAudioContext)) {
                portalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (portalAudioCtx && portalAudioCtx.state === 'suspended') {
                await portalAudioCtx.resume();
            }
            if (!portalAudioBuffer) {
                const baseUrl = (config.pluginUrl || '/wp-content/plugins/WorkPress/').replace(/\/$/, '');
                const [jsonRes, audioRes] = await Promise.all([
                    fetch(`${baseUrl}/assets/sounds/sprite/01/audioSprite.json`).then(r => r.json()),
                    fetch(`${baseUrl}/assets/sounds/sprite/01/audioSprite.mp3`).then(r => r.arrayBuffer())
                ]);
                portalSpriteMap = jsonRes.spritemap || {};
                portalAudioBuffer = await portalAudioCtx.decodeAudioData(audioRes);
            }
            const sprite = portalSpriteMap[soundName];
            if (!sprite || !portalAudioCtx || !portalAudioBuffer) return;

            const source = portalAudioCtx.createBufferSource();
            source.buffer = portalAudioBuffer;
            const gain = portalAudioCtx.createGain();
            gain.gain.setValueAtTime(0.5, portalAudioCtx.currentTime);
            source.connect(gain);
            gain.connect(portalAudioCtx.destination);
            source.start(0, sprite.start, Math.max(0.05, sprite.end - sprite.start));
        } catch (e) {
            // Fail silently
        }
    }

    /**
     * Synthesized Clock Tick Audio Engine (Web Audio API)
     */
    function playClockTick() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!portalAudioCtx) {
                portalAudioCtx = new AudioCtx();
            }
            if (portalAudioCtx && portalAudioCtx.state === 'suspended') {
                portalAudioCtx.resume().catch(() => {});
            }
            if (portalAudioCtx && portalAudioCtx.state === 'running') {
                const now = portalAudioCtx.currentTime;
                const osc = portalAudioCtx.createOscillator();
                const gain = portalAudioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
                osc.connect(gain);
                gain.connect(portalAudioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.04);
            }
        } catch (e) {
            // Fail silently
        }
    }

    /**
     * Official WorkPress Brand Vector Logo (SVG)
     */
    function renderWorkPressLogo(height = 32, dark = false) {
        const pressFill = dark ? '#ffffff' : '#00192f';
        const workFill = '#10b981';

        return html`
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1293 192.25"
                style=${{ height: `${height}px`, width: 'auto', display: 'block' }}
                title="WorkPress — where work becomes memory"
            >
                <polygon fill="${workFill}" points="179.23 135.75 146.25 3 106.25 3 73.27 135.75 42 3 0 3 48.75 189.25 93.75 189.25 126.25 64.25 158.75 189.25 203.75 189.25 252.5 3 210.5 3 179.23 135.75"/>
                <path fill="${workFill}" d="m366,59c-11-6.16-23.25-9.25-36.75-9.25s-25.79,3.09-36.88,9.25c-11.09,6.17-19.92,14.59-26.5,25.25-6.59,10.67-9.88,22.92-9.88,36.75s3.29,25.88,9.88,36.62c6.58,10.75,15.41,19.21,26.5,25.38,11.08,6.17,23.38,9.25,36.88,9.25s25.75-3.08,36.75-9.25c11-6.16,19.79-14.62,26.38-25.38,6.58-10.75,9.88-22.96,9.88-36.62s-3.29-26.08-9.88-36.75c-6.59-10.66-15.38-19.08-26.38-25.25Zm-6.88,81.5c-2.92,5.67-6.92,10.09-12,13.25-5.09,3.17-11.04,4.75-17.88,4.75s-12.84-1.58-18-4.75c-5.17-3.16-9.21-7.58-12.12-13.25-2.92-5.66-4.38-12.16-4.38-19.5s1.46-13.79,4.38-19.38c2.91-5.58,6.96-10,12.12-13.25,5.16-3.25,11.16-4.88,18-4.88s12.79,1.62,17.88,4.88c5.08,3.25,9.08,7.67,12,13.25,2.91,5.59,4.38,12.04,4.38,19.38s-1.46,13.84-4.38,19.5Z"/>
                <path fill="${workFill}" d="m471.62,57.38c-5.26,3.11-9.38,8.36-12.38,15.75v-20.37h-35v136.5h37.5v-73.5c0-10.16,2.83-18.04,8.5-23.62,5.66-5.58,13.08-8.38,22.25-8.38h11.75v-32.5h-8c-9.5,0-17.71,2.04-24.62,6.12Z"/>
                <polygon fill="${workFill}" points="604.5 52.75 558.25 101.88 558.25 0 520.75 0 520.75 189.25 558.25 189.25 558.25 147.47 573.32 131.04 608 189.25 650.5 189.25 601.25 107.75 650.75 52.75 604.5 52.75"/>
                <path fill="${pressFill}" d="m770.75,10c-9-4.66-19.5-7-31.5-7h-62.25v186.25h16v-73.75h46.25c12,0,22.5-2.38,31.5-7.12s16-11.33,21-19.75c5-8.41,7.5-18.21,7.5-29.38s-2.5-21-7.5-29.5-12-15.08-21-19.75Zm7,70.88c-3.67,6.25-8.75,11.09-15.25,14.5-6.5,3.42-14.09,5.12-22.75,5.12h-46.75V18h46.75c8.66,0,16.25,1.71,22.75,5.12,6.5,3.42,11.58,8.17,15.25,14.25,3.66,6.09,5.5,13.29,5.5,21.62s-1.84,15.62-5.5,21.88Z"/>
                <path fill="${pressFill}" d="m862,61.38c-5.12,3.11-9.11,7.14-12,12.07v-16.95h-14.75v132.75h14.75v-81.25c0-11.5,3.12-20.75,9.38-27.75s14.79-10.5,25.62-10.5h10v-14.75h-8.25c-9.5,0-17.75,2.12-24.75,6.38Z"/>
                <path fill="${pressFill}" d="m1022.5,72.5c-5.34-5.83-11.71-10.46-19.12-13.88-7.42-3.41-15.71-5.12-24.88-5.12-12,0-22.84,3-32.5,9-9.67,6-17.34,14.21-23,24.62-5.67,10.42-8.5,22.29-8.5,35.62s2.91,25,8.75,35.5c5.83,10.5,13.75,18.79,23.75,24.88,10,6.09,21.25,9.12,33.75,9.12,8.5,0,16.38-1.38,23.62-4.12s13.62-6.58,19.12-11.5c5.5-4.91,9.66-10.46,12.5-16.62l-12.5-6.75c-4.5,7.5-10.34,13.54-17.5,18.12-7.17,4.59-15.59,6.88-25.25,6.88s-18.17-2.33-26-7c-7.84-4.66-14.04-11.21-18.62-19.62-3.9-7.16-5.96-15.21-6.17-24.12h108.55c.33-2,.58-3.88.75-5.62.16-1.75.25-3.46.25-5.12,0-8.5-1.5-16.54-4.5-24.12-3-7.58-7.17-14.29-12.5-20.12Zm-69,2.12c7.5-4.75,15.83-7.12,25-7.12s17.04,2.29,24.12,6.88c7.08,4.59,12.54,10.75,16.38,18.5,3.1,6.27,4.59,13.24,4.53,20.88h-93.34c.63-7.19,2.47-13.74,5.56-19.62,4.33-8.25,10.25-14.75,17.75-19.5Z"/>
                <path fill="${pressFill}" d="m1132,117.5l-22-6.25c-3.67-1-7.09-2.38-10.25-4.12-3.17-1.75-5.75-4.04-7.75-6.88-2-2.83-3-6.25-3-10.25,0-6.66,2.5-12.12,7.5-16.38s11.41-6.38,19.25-6.38,14.88,2.12,21.12,6.38,11.21,10.12,14.88,17.62l13.25-6.25c-3.5-9.66-9.75-17.33-18.75-23-9-5.66-19-8.5-30-8.5-8,0-15.21,1.54-21.62,4.62-6.42,3.09-11.54,7.46-15.38,13.12-3.84,5.67-5.75,12.17-5.75,19.5,0,8.34,2.71,15.59,8.12,21.75,5.41,6.17,13.88,10.84,25.38,14l20.5,5.75c4,1,7.75,2.5,11.25,4.5s6.38,4.46,8.62,7.38c2.25,2.92,3.38,6.54,3.38,10.88,0,7-2.96,12.67-8.88,17-5.92,4.34-13.29,6.5-22.12,6.5s-16.25-2.38-23.25-7.12-12.5-11.29-16.5-19.62l-13,6.25c4.33,10.67,11.16,19.04,20.5,25.12,9.33,6.09,20.08,9.12,32.25,9.12,9,0,16.96-1.59,23.88-4.75,6.91-3.16,12.41-7.62,16.5-13.38,4.08-5.75,6.12-12.21,6.12-19.38,0-8.83-3-16.46-9-22.88-6-6.41-14.42-11.21-25.25-14.38Z"/>
                <path fill="${pressFill}" d="m1284,131.88c-6-6.41-14.42-11.21-25.25-14.38l-22-6.25c-3.67-1-7.09-2.38-10.25-4.12-3.17-1.75-5.75-4.04-7.75-6.88-2-2.83-3-6.25-3-10.25,0-6.66,2.5-12.12,7.5-16.38s11.41-6.38,19.25-6.38,14.88,2.12,21.12,6.38,11.21,10.12,14.88,17.62l13.25-6.25c-3.5-9.66-9.75-17.33-18.75-23-9-5.66-19-8.5-30-8.5-8,0-15.21,1.54-21.62,4.62-6.42,3.09-11.54,7.46-15.38,13.12-3.84,5.67-5.75,12.17-5.75,19.5,0,8.34,2.71,15.59,8.12,21.75,5.41,6.17,13.88,10.84,25.38,14l20.5,5.75c4,1,7.75,2.5,11.25,4.5s6.38,4.46,8.62,7.38c2.25,2.92,3.38,6.54,3.38,10.88,0,7-2.96,12.67-8.88,17-5.92,4.34-13.29,6.5-22.12,6.5s-16.25-2.38-23.25-7.12-12.5-11.29-16.5-19.62l-13,6.25c4.33,10.67,11.16,19.04,20.5,25.12,9.33,6.09,20.08,9.12,32.25,9.12,9,0,16.96-1.59,23.88-4.75,6.91-3.16,12.41-7.62,16.5-13.38,4.08-5.75,6.12-12.21,6.12-19.38,0-8.83-3-16.46-9-22.88Z"/>
            </svg>
        `;
    }

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
                    reqSubmitting: false,
                    reqError: ''
                });

                // Refresh projects list in background
                this.fetchProjects();
            } catch (err) {
                this.setState({
                    reqError: err.message || 'فشل تقديم الطلب، يرجى المحاولة ثانية.',
                    reqSubmitting: false
                });
            }
        }

        renderSmartGatewayCard() {
            const { user, gatewayCountdown, executiveType, roleLabel } = this.state;
            const userName = (user && (user.display_name || user.name)) || 'عضو المنظومة';
            const userEmail = (user && user.email) || '';
            const userAvatar = (user && user.avatar_url) || '';
            const roleName = (user && (user.role_name || user.role_label)) || roleLabel || 'مشترك';
            const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            // Dynamic Context per Role
            let roleMsg = 'مرحباً بك! جاري تحويلك تلقائياً إلى الصفحة الرئيسية للموقع...';
            let actionText = 'العودة للموقع';
            let actionIcon = 'dashicons-admin-home';
            let actionUrl = config.siteUrl || '/';
            let onActionClick = () => { window.location.href = actionUrl; };

            if (executiveType === 'admin' || executiveType === 'lead' || executiveType === 'member') {
                roleMsg = 'مرحباً بك! جاري تهيئة غرفة العمليات والرادار الإداري...';
                actionText = 'دخول غرفة العمليات';
                actionIcon = 'dashicons-dashboard';
                actionUrl = config.adminUrl || '/wp-admin/admin.php?page=workpress#/';
                onActionClick = () => { window.location.href = actionUrl; };
            } else if (executiveType === 'client') {
                roleMsg = 'مرحباً بك! جاري نقلك إلى مساحة مشاريعك ومخرجاتك المعتمدة...';
                actionText = 'دخول مساحة المشاريع';
                actionIcon = 'dashicons-portfolio';
                actionUrl = '#/';
                onActionClick = (e) => {
                    if (e) e.preventDefault();
                    if (this.gatewayTimer) {
                        clearInterval(this.gatewayTimer);
                        this.gatewayTimer = null;
                    }
                    this.setState({ inGatewayTransition: false, loading: false });
                    this.fetchProjects();
                    this.fetchIntakeForms();
                    this.fetchPulseAndNotifications();
                };
            }

            return html`
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--wp-bg-page); padding: 2rem;">
                    <div class="portal-gatekeeper-card" style="max-width: 440px; width: 100%; text-align: center;">
                        
                        <!-- 1. WorkPress Brand Logo -->
                        <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
                            ${renderWorkPressLogo(38)}
                        </div>

                        <!-- 2. Real Avatar & Identity Section -->
                        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem;">
                            <div style="margin-bottom: 0.75rem;">
                                ${userAvatar ? html`
                                    <img 
                                        src="${userAvatar}" 
                                        alt="${userName}" 
                                        style="width: 76px; height: 76px; object-fit: cover; border: 2px solid var(--wp-primary); display: block;" 
                                        onError=${e => {
                                            e.target.style.display = 'none';
                                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div style="width: 76px; height: 76px; background: var(--wp-primary); color: #ffffff; display: none; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border: 2px solid var(--wp-primary);">
                                        ${initials}
                                    </div>
                                ` : html`
                                    <div style="width: 76px; height: 76px; background: var(--wp-primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; border: 2px solid var(--wp-primary);">
                                        ${initials}
                                    </div>
                                `}
                            </div>

                            <h2 style="color: var(--wp-text-main); font-size: 1.35rem; font-weight: 800; margin-bottom: 0.35rem;">
                                ${userName}
                            </h2>

                            <div style="display: inline-flex; align-items: center; gap: 6px; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border); color: var(--wp-text-secondary); font-size: 0.82rem; font-weight: 700; padding: 4px 14px; margin-bottom: 0.35rem;">
                                <i class="dashicons dashicons-businessman"></i>
                                <span>${roleName}</span>
                            </div>

                            ${userEmail ? html`
                                <div style="font-size: 0.82rem; color: var(--wp-text-muted);">
                                    ${userEmail}
                                </div>
                            ` : null}
                        </div>

                        <!-- 3. Active Real Countdown in Green Container (No Text, with Clock Icon) -->
                        <div style="background: var(--wp-primary); color: #ffffff; padding: 0.85rem 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 14px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);">
                            <i class="dashicons dashicons-clock" style="font-size: 26px; width: 26px; height: 26px; line-height: 26px;"></i>
                            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1; font-family: 'Cairo', monospace, sans-serif;">
                                ${gatewayCountdown !== null ? gatewayCountdown : 0}
                            </span>
                        </div>

                        <!-- 4. Welcoming Notification Text under Countdown -->
                        <div style="font-size: 0.9rem; color: var(--wp-text-secondary); font-weight: 700; line-height: 1.6; margin-bottom: 1.25rem;">
                            ${roleMsg}
                        </div>

                        <!-- 5. Direct Action Buttons (Role Primary Action & Logout) -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <a href="${actionUrl}" onClick=${onActionClick} class="btn-portal btn-portal-primary" style="justify-content: center; font-size: 0.92rem; padding: 0.85rem;">
                                <i class="dashicons ${actionIcon}"></i>
                                <span>${actionText}</span>
                            </a>

                            <a 
                                href="${config.logoutUrl || (config.siteUrl + 'wp-login.php?action=logout')}" 
                                class="btn-portal btn-portal-outline" 
                                style="justify-content: center; font-size: 0.92rem; padding: 0.85rem;"
                            >
                                <i class="dashicons dashicons-migrate"></i>
                                <span>تسجيل الخروج</span>
                            </a>
                        </div>

                    </div>
                </div>
            `;
        }

        renderExecutiveRadar() {
            const { user, executiveType, roleLabel, adminUrl, radarData, radarLoading, isProfileMenuOpen } = this.state;
            const counters = (radarData && radarData.counters) || {
                pendingRequests: 0,
                recentFeedbacks: 0,
                activeProjects: 0,
                totalClients: 0
            };
            const recentRequests = (radarData && radarData.recentRequests) || [];
            const recentFeedbacks = (radarData && radarData.recentFeedbacks) || [];

            return html`
                <div class="portal-app-wrapper" onClick=${() => { if (isProfileMenuOpen) this.setState({ isProfileMenuOpen: false }); }}>
                    <!-- Top Institutional Header -->
                    <div class="portal-header-wrapper">
                        <div class="portal-top-bar">
                            <div class="portal-brand-area">
                                <a href="#/" style="text-decoration: none;">
                                    ${renderWorkPressLogo(32)}
                                </a>
                                <span class="portal-site-badge">
                                    <i class="dashicons dashicons-shield"></i>
                                    <span>رادار القيادة التنفيذية</span>
                                </span>
                            </div>

                            <div class="portal-user-controls">
                                <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="btn-portal btn-portal-primary btn-portal-sm">
                                    <i class="dashicons dashicons-dashboard"></i>
                                    <span>غرفة عمليات CoWorkPress</span>
                                </a>

                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-outline btn-portal-sm"
                                    onClick=${() => {
                                        this.setState({ isPreviewAsClient: true });
                                        playPortalSound('button');
                                    }}
                                >
                                    <i class="dashicons dashicons-visibility"></i>
                                    <span>معاينة كزبون</span>
                                </button>

                                <!-- User Profile Trigger & Dropdown Menu -->
                                <div style="position: relative;">
                                    <button 
                                        type="button" 
                                        class="portal-profile-trigger ${isProfileMenuOpen ? 'is-active' : ''}" 
                                        onClick=${(e) => {
                                            e.stopPropagation();
                                            this.setState(prevState => ({ isProfileMenuOpen: !prevState.isProfileMenuOpen }));
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
                                                            <span style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #047857; font-size: 0.72rem; font-weight: 800; padding: 1px 6px;">
                                                                ${roleLabel}
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
                                                <a href="${adminUrl || '/wp-admin/admin.php?page=workpress#/'}" class="portal-profile-item">
                                                    <i class="dashicons dashicons-dashboard" style="color: var(--wp-indigo);"></i>
                                                    <span>غرفة عمليات CoWorkPress</span>
                                                </a>

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
                    </div>

                    <div class="portal-container">
                        <!-- Hero Banner -->
                        <div class="wp-portal-card" style="background: linear-gradient(135deg, #ffffff, var(--wp-bg-subtle)); border-right: 4px solid var(--wp-primary);">
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <span style="font-size: 0.8rem; font-weight: 800; color: #047857; background: var(--wp-primary-light); padding: 3px 10px;">
                                        ${roleLabel} — رادار العمليات والنبض اللحظي
                                    </span>
                                    <h1 style="font-size: 1.5rem; font-weight: 900; color: var(--wp-text-main); margin-top: 0.5rem; margin-bottom: 0.25rem;">
                                        مرحباً بك، ${user.display_name || 'القائد'}
                                    </h1>
                                    <p style="font-size: 0.9rem; color: var(--wp-text-secondary); max-width: 680px;">
                                        شاشة استعلامية متقدمة تمنحك إحاطة فورية بنشاط الزبائن والطلبات والملاحظات الواردة، مع روابط فورية لإدارتها داخل منظومة WorkPress.
                                    </p>
                                </div>

                                <button 
                                    class="btn-portal btn-portal-outline" 
                                    onClick=${() => this.fetchRadarIntelligence()}
                                    disabled=${radarLoading}
                                >
                                    <i class="dashicons dashicons-update" style=${{ animation: radarLoading ? 'portalSpin 0.75s linear infinite' : 'none' }}></i>
                                    <span>${radarLoading ? 'جاري التحديث...' : 'تحديث الرادار اللحظي'}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Live Pulse Counters Grid -->
                        <div class="portal-kpi-grid">
                            <a href="${adminUrl}requests" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-warning);">
                                <span class="portal-kpi-label">طلبات بانتظار الفرز والاعتماد</span>
                                <div class="portal-kpi-value" style="color: var(--wp-warning-text); font-size: 1.8rem;">
                                    ${counters.pendingRequests}
                                </div>
                                <span style="font-size: 0.78rem; color: var(--wp-warning-text); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                    <span>استوديو فرز الطلبات</span>
                                    <i class="dashicons dashicons-arrow-left-alt"></i>
                                </span>
                            </a>

                            <a href="${adminUrl}kanban" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-indigo);">
                                <span class="portal-kpi-label">استفسارات وملاحظات الزبائن</span>
                                <div class="portal-kpi-value" style="color: var(--wp-indigo); font-size: 1.8rem;">
                                    ${counters.recentFeedbacks}
                                </div>
                                <span style="font-size: 0.78rem; color: var(--wp-indigo); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                    <span>متابعة الكانبان والردود</span>
                                    <i class="dashicons dashicons-arrow-left-alt"></i>
                                </span>
                            </a>

                            <a href="${adminUrl}projects" class="portal-kpi-card" style="text-decoration: none; border-top: 3px solid var(--wp-primary);">
                                <span class="portal-kpi-label">مشاريع نشطة قيد التنفيذ</span>
                                <div class="portal-kpi-value" style="color: var(--wp-primary); font-size: 1.8rem;">
                                    ${counters.activeProjects}
                                </div>
                                <span style="font-size: 0.78rem; color: var(--wp-primary); font-weight: 700; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                                    <span>شبكة المشاريع</span>
                                    <i class="dashicons dashicons-arrow-left-alt"></i>
                                </span>
                            </a>

                            <div class="portal-kpi-card" style="border-top: 3px solid var(--wp-text-muted);">
                                <span class="portal-kpi-label">عملاء ومستفيدون مسجلون</span>
                                <div class="portal-kpi-value" style="font-size: 1.8rem;">
                                    ${counters.totalClients}
                                </div>
                                <span style="font-size: 0.78rem; color: var(--wp-text-muted); display: block; margin-top: 4px;">
                                    إجمالي حسابات المستفيدين المعتمدة
                                </span>
                            </div>
                        </div>

                        <!-- Feeds Grid -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(460px, 1fr)); gap: 1.5rem;">
                            <!-- Stream 1: Requests -->
                            <div class="wp-portal-card">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--wp-border);">
                                    <div style="font-weight: 800; font-size: 1rem; color: var(--wp-text-main); display: flex; align-items: center; gap: 6px;">
                                        <i class="dashicons dashicons-email-alt" style="color: var(--wp-warning);"></i>
                                        <span>آخر طلبات المشاريع الواردة</span>
                                    </div>
                                    <a href="${adminUrl}requests" style="font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                        <span>عرض الكل</span>
                                        <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
                                    </a>
                                </div>

                                ${recentRequests.length === 0 ? html`
                                    <div style="padding: 2rem; text-align: center; color: var(--wp-text-muted); font-size: 0.88rem;">
                                        لا توجد طلبات جديدة معلقة حالياً
                                    </div>
                                ` : html`
                                    <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                        ${recentRequests.map(r => html`
                                            <div key=${r.id} style="padding: 0.75rem; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border); display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--wp-text-main);">${r.name}</div>
                                                    <div style="font-size: 0.78rem; color: var(--wp-text-muted);">بواسطة: ${r.client_name || 'عميل'} — ${r.created_at ? r.created_at.substring(0, 10) : ''}</div>
                                                </div>
                                                <a href="${adminUrl}requests" class="btn-portal btn-portal-outline btn-portal-sm">فرز</a>
                                            </div>
                                        `)}
                                    </div>
                                `}
                            </div>

                            <!-- Stream 2: Feedback -->
                            <div class="wp-portal-card">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--wp-border);">
                                    <div style="font-weight: 800; font-size: 1rem; color: var(--wp-text-main); display: flex; align-items: center; gap: 6px;">
                                        <i class="dashicons dashicons-format-chat" style="color: var(--wp-indigo);"></i>
                                        <span>آخر استفسارات وملاحظات العملاء</span>
                                    </div>
                                    <a href="${adminUrl}kanban" style="font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                                        <span>عرض الكانبان</span>
                                        <i class="dashicons dashicons-arrow-left-alt" style="font-size: 14px;"></i>
                                    </a>
                                </div>

                                ${recentFeedbacks.length === 0 ? html`
                                    <div style="padding: 2rem; text-align: center; color: var(--wp-text-muted); font-size: 0.88rem;">
                                        لا توجد استفسارات جديدة
                                    </div>
                                ` : html`
                                    <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                                        ${recentFeedbacks.map(f => html`
                                            <div key=${f.id} style="padding: 0.75rem; background: var(--wp-bg-subtle); border: 1px solid var(--wp-border);">
                                                <div style="font-size: 0.85rem; color: var(--wp-text-main); margin-bottom: 0.35rem;" dangerouslySetInnerHTML=${{ __html: f.content }}></div>
                                                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--wp-text-muted);">
                                                    <span>المهمة: <strong>${f.task_title || 'مهمة'}</strong></span>
                                                    <span>${f.created_at ? f.created_at.substring(0, 16) : ''}</span>
                                                </div>
                                            </div>
                                        `)}
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
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
                        ${!loading && activeTab === 'new-request' && html`
                            <div style="max-width: 900px; margin: 0 auto;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-ghost btn-portal-sm"
                                        onClick=${() => this.navigateToTab('deliverables')}
                                    >
                                        <i class="dashicons dashicons-arrow-right-alt"></i>
                                        <span>${projects.length > 0 ? 'العودة للمشاريع' : 'الرئيسية'}</span>
                                    </button>

                                    <span style="font-size: 0.82rem; color: var(--wp-text-muted);">
                                        بوابة تقديم الطلبات الرسمية المعتمدة
                                    </span>
                                </div>

                                <div class="wp-portal-card" style="padding: 2rem;">
                                    <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--wp-border); padding-bottom: 1.25rem;">
                                        <div style="display: inline-flex; align-items: center; gap: 5px; padding: 0.25rem 0.75rem; background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; font-size: 0.8rem; font-weight: 800; margin-bottom: 0.6rem;">
                                            <i class="dashicons dashicons-plus-alt2"></i>
                                            <span>استوديو طلب مشروع / خدمة جديدة</span>
                                        </div>
                                        <h2 style="font-size: 1.35rem; font-weight: 900; color: var(--wp-text-main); margin-bottom: 0.35rem;">
                                            ${activeForm.name || 'طلب مشروع جديد'}
                                        </h2>
                                        <p style="font-size: 0.88rem; color: var(--wp-text-secondary);">
                                            حدد متطلباتك ومواصفات طلبك وسيصل مباشرة للإدارة العامة كمشروع رسمي للمراجعة والتسعير والاعتماد الفوري.
                                        </p>
                                    </div>

                                    ${reqSuccess && html`
                                        <div style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; padding: 1.25rem; margin-bottom: 1.5rem;">
                                            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1rem; margin-bottom: 0.35rem;">
                                                <i class="dashicons dashicons-yes-alt" style="font-size: 22px;"></i>
                                                <span>تم استلام وتوثيق طلبكم بنجاح!</span>
                                            </div>
                                            <p style="font-size: 0.88rem; margin-bottom: 1rem;">
                                                ${reqSuccess}
                                            </p>
                                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                                ${projects.length > 0 ? html`
                                                    <button 
                                                        type="button" 
                                                        class="btn-portal btn-portal-primary btn-portal-sm"
                                                        onClick=${() => {
                                                            this.fetchProjects();
                                                            this.navigateToTab('deliverables');
                                                        }}
                                                    >
                                                        <span>الانتقال إلى قائمة المشاريع</span>
                                                    </button>
                                                ` : null}
                                                <button 
                                                    type="button" 
                                                    class="btn-portal btn-portal-outline btn-portal-sm"
                                                    onClick=${() => this.setState({ reqSuccess: '', reqCustomTitle: '', reqDesc: '', reqSpecs: {} })}
                                                >
                                                    <span>تقديم طلب خدمة آخر</span>
                                                </button>
                                            </div>
                                        </div>
                                    `}

                                    ${reqError && html`
                                        <div style="background: var(--wp-danger-light); border: 1px solid var(--wp-danger-border); color: var(--wp-danger-text); padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.88rem; font-weight: 700;">
                                            ${reqError}
                                        </div>
                                    `}

                                    <!-- Form Schema Switcher (If multiple intake forms exist) -->
                                    ${intakeForms.length > 1 && html`
                                        <div style="margin-bottom: 1.5rem;">
                                            <label class="portal-label">اختر نوع النموذج أو الخدمة المطلوبة:</label>
                                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                                ${intakeForms.map(f => html`
                                                    <button 
                                                        key=${f.id} 
                                                        type="button" 
                                                        class="btn-portal ${selectedFormId === f.id ? 'btn-portal-primary' : 'btn-portal-outline'} btn-portal-sm"
                                                        onClick=${() => this.handleFormTypeChange(f.id)}
                                                    >
                                                        ${f.name}
                                                    </button>
                                                `)}
                                            </div>
                                        </div>
                                    `}

                                    <form onSubmit=${this.handleRequestSubmit.bind(this)}>
                                        <div class="portal-form-group">
                                            <label class="portal-label">${activeForm.title_label || 'عنوان الطلب / اسم المشروع:'}</label>
                                            <input 
                                                type="text" 
                                                class="portal-input" 
                                                value=${reqCustomTitle} 
                                                onInput=${e => this.setState({ reqCustomTitle: e.target.value })} 
                                                placeholder="${activeForm.title_placeholder || 'اكتب اسم أو عنوان طلبك...'}" 
                                                required 
                                            />
                                        </div>

                                        <div class="portal-form-group">
                                            <label class="portal-label">${activeForm.desc_label || 'بيان وشرح تفاصيل الطلب:'}</label>
                                            <textarea 
                                                class="portal-textarea" 
                                                rows="5" 
                                                value=${reqDesc} 
                                                onInput=${e => this.setState({ reqDesc: e.target.value })} 
                                                placeholder="${activeForm.desc_placeholder || 'وضح بالتفصيل ما تريده من فريق العمل...'}" 
                                                required
                                            ></textarea>
                                        </div>

                                        <!-- Dynamic Specifications Generator -->
                                        ${Array.isArray(activeForm.specs) && activeForm.specs.length > 0 ? html`
                                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--wp-border);">
                                                ${activeForm.specs.map((spec, idx) => {
                                                    const specKey = spec.name || `spec_${idx}`;
                                                    const currentVal = reqSpecs[specKey] || '';

                                                    if (spec.type === 'file') {
                                                        const uploadedList = Array.isArray(reqSpecs[specKey]) ? reqSpecs[specKey] : [];
                                                        const isUp = uploadingSpecs[specKey] || false;

                                                        return html`
                                                            <div key=${idx} class="portal-form-group" style="grid-column: 1 / -1;">
                                                                <label class="portal-label">${spec.label || spec.name}</label>
                                                                <div style="border: 2px dashed var(--wp-border); background: var(--wp-bg-subtle); padding: 1.25rem; text-align: center;">
                                                                    <i class="dashicons dashicons-upload" style="font-size: 28px; color: var(--wp-text-muted); margin-bottom: 0.35rem;"></i>
                                                                    <div style="font-size: 0.85rem; color: var(--wp-text-secondary); margin-bottom: 0.5rem;">اسحب الملفات هنا أو اضغط للاختيار</div>
                                                                    <input 
                                                                        type="file" 
                                                                        onChange=${e => this.handleFileUpload(specKey, e)} 
                                                                        disabled=${isUp} 
                                                                        style="font-size: 0.82rem;"
                                                                    />
                                                                    ${isUp && html`<span style="font-size: 0.78rem; color: var(--wp-primary); margin-right: 6px;">جاري الرفع...</span>`}
                                                                </div>

                                                                ${uploadedList.length > 0 && html`
                                                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem;">
                                                                        ${uploadedList.map((f, fIdx) => html`
                                                                            <span key=${fIdx} style="display: inline-flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid var(--wp-border); padding: 3px 10px; font-size: 0.8rem;">
                                                                                <i class="dashicons dashicons-media-default"></i>
                                                                                <span>${f.name}</span>
                                                                                <button type="button" onClick=${() => this.removeUploadedFile(specKey, fIdx)} style="background: none; border: none; color: var(--wp-danger); cursor: pointer; display: inline-flex; align-items: center;">
                                                                                    <i class="dashicons dashicons-no-alt" style="font-size: 14px;"></i>
                                                                                </button>
                                                                            </span>
                                                                        `)}
                                                                    </div>
                                                                `}
                                                            </div>
                                                        `;
                                                    }

                                                    if (spec.type === 'pills' || spec.type === 'multiple') {
                                                        const selectedList = Array.isArray(reqSpecs[specKey]) ? reqSpecs[specKey] : [];
                                                        const pills = Array.isArray(spec.options) ? spec.options : [];

                                                        return html`
                                                            <div key=${idx} class="portal-form-group" style="grid-column: 1 / -1;">
                                                                <label class="portal-label">${spec.label || spec.name}</label>
                                                                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                                                                    ${pills.map((pill, pIdx) => {
                                                                        const isSel = selectedList.includes(pill);
                                                                        return html`
                                                                            <button 
                                                                                key=${pIdx} 
                                                                                type="button" 
                                                                                class="portal-pill ${isSel ? 'is-selected' : ''}"
                                                                                onClick=${() => this.toggleSpecPill(specKey, pill)}
                                                                            >
                                                                                ${isSel ? html`<i class="dashicons dashicons-yes" style="font-size: 14px; margin-left: 2px;"></i>` : ''}
                                                                                <span>${pill}</span>
                                                                            </button>
                                                                        `;
                                                                    })}
                                                                </div>
                                                            </div>
                                                        `;
                                                    }

                                                    return html`
                                                        <div key=${idx} class="portal-form-group">
                                                            <label class="portal-label">${spec.label || spec.name}</label>
                                                            <input 
                                                                type="text" 
                                                                class="portal-input" 
                                                                value=${currentVal} 
                                                                onInput=${e => this.handleSpecChange(specKey, e.target.value)} 
                                                                placeholder="${spec.placeholder || ''}" 
                                                            />
                                                        </div>
                                                    `;
                                                })}
                                            </div>
                                        ` : null}

                                        <button 
                                            type="submit" 
                                            class="btn-portal btn-portal-primary" 
                                            style="width: 100%; margin-top: 1.5rem; padding: 0.85rem; font-size: 1rem;" 
                                            disabled=${reqSubmitting}
                                        >
                                            <i class="dashicons dashicons-yes-alt"></i>
                                            <span>${reqSubmitting ? 'جاري توثيق الطلب...' : 'إرسال وتوثيق طلب المشروع'}</span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        `}

                        <!-- VIEW 2: ONBOARDING GATE (When user has 0 projects) -->
                        ${!loading && activeTab !== 'new-request' && projects.length === 0 && html`
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
                                    onClick=${() => this.navigateToTab('new-request')}
                                >
                                    <i class="dashicons dashicons-plus-alt2"></i>
                                    <span>تقديم طلب مشروع جديد</span>
                                </button>
                            </div>
                        `}

                        <!-- VIEW 3: ACTIVE PROJECT DASHBOARD -->
                        ${!loading && activeTab !== 'new-request' && projects.length > 0 && projectData && html`
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
                                                onClick=${() => this.openProjectReport(selectedProjectId)}
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

                                            <form onSubmit=${this.handleFeedbackSubmit.bind(this)}>
                                                <div class="portal-form-group">
                                                    <label class="portal-label">اختر المرحلة أو المهمة المراد الاستفسار عنها:</label>
                                                    <select class="portal-select" value=${feedbackTask} onChange=${e => this.setState({ feedbackTask: e.target.value })}>
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
                                                            onClick=${() => this.setState({ feedbackActionType: 'client_feedback' })}
                                                        >
                                                            استفسار وملاحظة
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            class="portal-pill ${feedbackActionType === 'client_revision_request' ? 'is-selected' : ''}"
                                                            onClick=${() => this.setState({ feedbackActionType: 'client_revision_request' })}
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
                                                        onInput=${e => this.setState({ feedbackMsg: e.target.value })} 
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
                                                onClick=${() => this.navigateToTab('new-request')}
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
                                                    onClick=${() => this.navigateToTab('new-request')}
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
                    </main>

                    <!-- Official Project PDF Report Modal -->
                    ${reportModalOpen && html`
                        <div style=${{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick=${this.closeProjectReport.bind(this)}>
                            <div class="wp-portal-card" style=${{ maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', boxShadow: 'var(--wp-shadow-modal)', borderRadius: 0 }} onClick=${e => e.stopPropagation()}>
                                
                                <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--wp-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            ${renderWorkPressLogo(32)}
                                            <span style=${{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--wp-text-muted)', borderRight: '1px solid var(--wp-border)', paddingRight: '8px', marginRight: '8px' }}>
                                                تقرير الاستلام الرسمي
                                            </span>
                                        </div>
                                        <h2 style=${{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--wp-text-main)', marginTop: '0.5rem' }}>
                                            ${reportModalData ? reportModalData.project.name : 'وثيقة استلام المشروع'}
                                        </h2>
                                    </div>
                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-outline btn-portal-sm"
                                        onClick=${this.closeProjectReport.bind(this)}
                                    >
                                        إغلاق
                                    </button>
                                </div>

                                ${reportLoading ? html`
                                    <div class="portal-initial-loader" style=${{ minHeight: '200px' }}>
                                        <div class="portal-spinner"></div>
                                        <p>جاري تحضير وثيقة الاستلام الرسمية...</p>
                                    </div>
                                ` : (reportModalData && html`
                                    <div>
                                        <div style=${{ background: 'var(--wp-bg-subtle)', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: 'var(--wp-text-secondary)' }}>
                                            تشهد هذه الوثيقة باعتماد الحلول والمخرجات الفنية للمشروع وفق معايير الجودة والحوكمة المعتمدة في WorkPress.
                                        </div>

                                        <div style=${{ marginBottom: '1.5rem' }}>
                                            <h4 style=${{ fontSize: '1rem', fontWeight: '800', color: 'var(--wp-text-main)', marginBottom: '0.6rem' }}>حصر المخرجات المعتمدة:</h4>
                                            <table style=${{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                                <thead>
                                                    <tr style=${{ background: 'var(--wp-bg-subtle)', borderBottom: '2px solid var(--wp-border)', textAlign: 'right' }}>
                                                        <th style=${{ padding: '0.6rem' }}>#</th>
                                                        <th style=${{ padding: '0.6rem' }}>المخرج الفني</th>
                                                        <th style=${{ padding: '0.6rem' }}>المكلف</th>
                                                        <th style=${{ padding: '0.6rem' }}>تاريخ الاعتماد</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${(reportModalData.deliverables || []).map((del, i) => html`
                                                        <tr key=${i} style=${{ borderBottom: '1px solid var(--wp-border)' }}>
                                                            <td style=${{ padding: '0.6rem' }}>${i + 1}</td>
                                                            <td style=${{ padding: '0.6rem', fontWeight: '700' }}>${del.task_title || del.title}</td>
                                                            <td style=${{ padding: '0.6rem' }}>${del.author_name || 'فريق العمل'}</td>
                                                            <td style=${{ padding: '0.6rem' }}>${del.created_at ? del.created_at.substring(0, 10) : ''}</td>
                                                        </tr>
                                                    `)}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--wp-border)', paddingTop: '1.25rem', marginTop: '2rem' }}>
                                            <button 
                                                type="button" 
                                                class="btn-portal btn-portal-primary"
                                                onClick=${() => window.print()}
                                            >
                                                <i class="dashicons dashicons-printer"></i>
                                                <span>طباعة الوثيقة الرسمية (Print/PDF)</span>
                                            </button>

                                            <span style=${{ fontSize: '0.78rem', color: 'var(--wp-text-muted)' }}>
                                                WorkPress Organizational Memory Engine v2.0
                                            </span>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                    `}
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
