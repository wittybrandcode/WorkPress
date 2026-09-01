import { html, useState, useEffect, __, isRtl, getLocale, onLocaleChange } from './utils/html.js';
import { hooks } from './utils/hooks.js';
import WorkPressLogo from './components/ui/WorkPressLogo.js';
import DashboardPage from './pages/DashboardPage.js';
import ProjectsPage from './pages/ProjectsPage.js';
import RequestsPage from './pages/RequestsPage.js';
import KanbanPage from './pages/KanbanPage.js';
import GanttPage from './pages/GanttPage.js';
import ProjectDetailPage from './pages/ProjectDetailPage.js';
import TaskDetailPage from './pages/TaskDetailPage.js';
import KnowledgePage from './pages/KnowledgePage.js';
import ContributionsPage from './pages/ContributionsPage.js';
import ReportsPage from './pages/ReportsPage.js';
import IntakeFormsPage from './pages/IntakeFormsPage.js?v=2';
import SettingsPage from './pages/SettingsPage.js';
import SettingsQuickMenu from './components/settings/SettingsQuickMenu.js';
import SoundQuickToggle from './components/ui/SoundQuickToggle.js';
import LanguageQuickMenu from './components/ui/LanguageQuickMenu.js';
import ProjectModal from './components/projects/ProjectModal.js';
import TaskModal from './components/tasks/TaskModal.js';
import ContributionModal from './components/contributions/ContributionModal.js';
import ErrorBoundary from './components/ui/ErrorBoundary.js';
import sound from './utils/sound.js';

export default function App() {
	const [ route, setRoute ] = useState( window.location.hash || '#/' );
	const [ locale, setLocaleState ] = useState( getLocale() );
	const [ refreshKey, setRefreshKey ] = useState( 0 );
	const [ isProjectModalOpen, setIsProjectModalOpen ] = useState( false );
	const [ isTaskModalOpen, setIsTaskModalOpen ] = useState( false );
	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );

	// T1+T2: Capability-based UI guards (Atomic Audit T1, T2)
	const settings = window.workpressSettings || {};
	const isAdmin = !!settings.isAdmin;
	const userCaps = settings.userCaps || {};

	// Live brand and theme reactivity
	const [brandRevision, setBrandRevision] = useState(0);

	useEffect( () => {
		const handleHashChange = () => setRoute( window.location.hash || '#/' );
		const handleBrandUpdate = () => setBrandRevision( ( prev ) => prev + 1 );
		const handleLocaleUpdate = ( newLoc ) => {
			setLocaleState( newLoc );
			setRefreshKey( ( prev ) => prev + 1 );
		};

		window.addEventListener( 'hashchange', handleHashChange );
		window.addEventListener( 'workpress_brand_updated', handleBrandUpdate );
		const unsubscribeLocale = onLocaleChange( handleLocaleUpdate );

		// Universal Session Keep-Alive (Refresh nonce on tab visibility & every 15 mins)
		const refreshNonce = async () => {
			try {
				if ( window.wp && window.wp.apiFetch ) {
					const data = await window.wp.apiFetch( { path: '/workpress/v1/portal/refresh-nonce' } );
					if ( data && data.nonce ) {
						if ( window.workpressSettings ) window.workpressSettings.restNonce = data.nonce;
						if ( window.wpApiSettings ) window.wpApiSettings.nonce = data.nonce;
					}
				} else {
					const baseUrl = ( settings.restUrl || '/wp-json/workpress/v1/' ).replace( /\/+$/, '' );
					const currentNonce = settings.restNonce || ( window.wpApiSettings && window.wpApiSettings.nonce );
					const res = await fetch( baseUrl + '/portal/refresh-nonce', {
						method: 'GET',
						headers: { 'X-WP-Nonce': currentNonce }
					} );
					if ( res.ok ) {
						const data = await res.json();
						if ( data && data.nonce ) {
							if ( window.workpressSettings ) window.workpressSettings.restNonce = data.nonce;
							if ( window.wpApiSettings ) window.wpApiSettings.nonce = data.nonce;
						}
					}
				}
			} catch ( e ) {
				// Ignore transient network blips
			}
		};

		const handleVisibilityChange = () => {
			if ( document.visibilityState === 'visible' ) {
				refreshNonce();
			}
		};

		document.addEventListener( 'visibilitychange', handleVisibilityChange );
		const keepAliveInterval = setInterval( refreshNonce, 15 * 60 * 1000 );

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
			window.removeEventListener( 'workpress_brand_updated', handleBrandUpdate );
			document.removeEventListener( 'visibilitychange', handleVisibilityChange );
			if ( typeof unsubscribeLocale === 'function' ) unsubscribeLocale();
			clearInterval( keepAliveInterval );
		};
	}, [] );

	let PageComponent = DashboardPage;
	let params = {};
	let currentViewName = 'CoWorkPress';

	if ( route === '#/projects' ) {
		PageComponent = ProjectsPage;
		currentViewName = __( 'Projects', 'workpress' );
	} else if ( route === '#/requests' || route.startsWith( '#/requests' ) ) {
		PageComponent = RequestsPage;
		currentViewName = __( 'Requests', 'workpress' );
	} else if ( route.startsWith( '#/projects/' ) ) {
		PageComponent = ProjectDetailPage;
		params.projectId = route.replace( '#/projects/', '' );
		currentViewName = __( 'Project Details', 'workpress' );
	} else if ( route === '#/forms' || route.startsWith( '#/forms' ) || route === '#/intake-forms' || route.startsWith( '#/intake-forms' ) ) {
		PageComponent = IntakeFormsPage;
		currentViewName = __( 'Intake Forms Builder', 'workpress' );
	} else if ( route === '#/kanban' ) {
		PageComponent = KanbanPage;
		currentViewName = __( 'Kanban', 'workpress' );
	} else if ( route === '#/gantt' || route.startsWith( '#/gantt' ) ) {
		PageComponent = GanttPage;
		currentViewName = __( 'Gantt Chart', 'workpress' );
	} else if ( route.startsWith( '#/tasks/' ) ) {
		PageComponent = TaskDetailPage;
		params.taskId = route.replace( '#/tasks/', '' );
		currentViewName = __( 'Task Details', 'workpress' );
	} else if ( route === '#/knowledge' ) {
		PageComponent = KnowledgePage;
		currentViewName = __( 'Knowledge Base', 'workpress' );
	} else if ( route === '#/contributions' ) {
		PageComponent = ContributionsPage;
		currentViewName = __( 'Contributions', 'workpress' );
	} else if ( route === '#/reports' || route.startsWith( '#/reports' ) ) {
		PageComponent = ReportsPage;
		currentViewName = __( 'Reports', 'workpress' );
	} else if ( route.startsWith( '#/settings' ) ) {
		// T1: Settings route protected — admin only
		if ( isAdmin ) {
			PageComponent = SettingsPage;
			currentViewName = __( 'Settings', 'workpress' );
		} else {
			PageComponent = () => html`
				<div className="has-text-centered py-6">
					<span className="icon is-large has-text-danger mb-3"><i className="dashicons dashicons-lock" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i></span>
					<h2 className="title is-4 has-text-grey">${ __( 'Insufficient Permissions', 'workpress' ) }</h2>
					<p className="subtitle is-6 has-text-grey-light mt-2">${ __( 'You do not have permission to access the settings page.', 'workpress' ) }</p>
					<a href="#/" className="button is-primary mt-4 wp-card">${ __( 'Back to Main Site', 'workpress' ) }</a>
				</div>
			`;
			currentViewName = __( 'Insufficient Permissions', 'workpress' );
		}
	} else if ( route !== '#/' ) {
		PageComponent = () => html`
			<div className="has-text-centered py-6">
				<h2 className="title is-3 has-text-grey">${ __( '404 - Page Not Found', 'workpress' ) }</h2>
				<p className="subtitle is-5 has-text-grey-light mt-2">${ __( 'The requested path does not exist in workspace.', 'workpress' ) }</p>
				<a href="#/" className="button is-primary mt-4 wp-card">${ __( 'Back to Main Site', 'workpress' ) }</a>
			</div>
		`;
		currentViewName = __( '404 - Page Not Found', 'workpress' );
	}

	const rtl = isRtl();

	return html`
		<div dir=${ rtl ? 'rtl' : 'ltr' } className="workpress-spa has-background-light" style=${{ minHeight: '100vh', paddingBottom: '2rem' }}>
			
			<div className="workpress-header-wrapper mb-4 has-background-white" style=${{ 
				boxShadow: '0 2px 6px rgba(0,0,0,0.03)', 
				borderBottom: '1px solid #e2e8f0',
				position: 'sticky', 
				top: '32px', /* Accounts for standard WordPress Admin Bar */
				zIndex: 40
			}}>
				<!-- الشريط الأول: الهوية والروابط -->
				<div className="is-flex is-justify-content-space-between is-align-items-center p-3" style=${{ borderBottom: '1px solid #f0f0f0' }}>
					<!-- الهوية: الشعار الرسمي SVG بحجم كبير وواضح -->
					<div className="is-flex is-align-items-center">
						<a href="#/" className="is-flex is-align-items-center" title="WorkPress — where work becomes memory" style=${{ textDecoration: 'none', outline: 'none', boxShadow: 'none', padding: '2px 0' }}>
							<${WorkPressLogo} height=${36} key=${brandRevision} />
						</a>
					</div>
					
					<!-- الروابط وأيقونات الإجراءات (التنبيهات والإعدادات في آخر الهيدر بعد الأزرار) -->
					<div className="is-flex is-align-items-center" style=${{ gap: '12px' }}>
						<!-- أزرار التبويبات الرئيسية -->
						<div className="buttons mb-0" style=${{ gap: '4px' }}>
							<a href="#/" className=${`button wp-header-btn ${route === '#/' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-dashboard"></i></span>
								<span className="has-text-weight-bold">CoWorkPress</span>
							</a>
							<a href="#/projects" className=${`button wp-header-btn ${route === '#/projects' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-category"></i></span>
								<span className="has-text-weight-bold">${ __( 'Projects', 'workpress' ) }</span>
							</a>
							<a href="#/requests" className=${`button wp-header-btn ${route.startsWith('#/requests') ? 'is-active' : ''}`} title=${ __( 'Project Requests', 'workpress' ) }>
								<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
								<span className="has-text-weight-bold">${ __( 'Requests', 'workpress' ) }</span>
							</a>
							<a href="#/forms" className=${`button wp-header-btn ${route.startsWith('#/forms') || route.startsWith('#/intake-forms') ? 'is-active' : ''}`} title=${ __( 'Intake Forms Builder', 'workpress' ) }>
								<span className="icon"><i className="dashicons dashicons-forms"></i></span>
								<span className="has-text-weight-bold">${ __( 'Intake Forms', 'workpress' ) }</span>
							</a>
							<a href="#/kanban" className=${`button wp-header-btn ${route === '#/kanban' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-columns"></i></span>
								<span className="has-text-weight-bold">${ __( 'Kanban', 'workpress' ) }</span>
							</a>
							<a href="#/gantt" className=${`button wp-header-btn ${route.startsWith('#/gantt') ? 'is-active' : ''}`} title=${ __( 'Gantt Chart', 'workpress' ) }>
								<span className="icon"><i className="dashicons dashicons-calendar-alt"></i></span>
								<span className="has-text-weight-bold">${ __( 'Gantt Chart', 'workpress' ) }</span>
							</a>
							<a href="#/knowledge" className=${`button wp-header-btn ${route === '#/knowledge' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-book"></i></span>
								<span className="has-text-weight-bold">${ __( 'Knowledge Base', 'workpress' ) }</span>
							</a>
							<a href="#/contributions" className=${`button wp-header-btn ${route === '#/contributions' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-share-alt2"></i></span>
								<span className="has-text-weight-bold">${ __( 'Contributions', 'workpress' ) }</span>
							</a>
							<a href="#/reports" className=${`button wp-header-btn ${route.startsWith('#/reports') ? 'is-active' : ''}`} title=${ __( 'Reports', 'workpress' ) }>
								<span className="icon"><i className="dashicons dashicons-analytics"></i></span>
								<span className="has-text-weight-bold">${ __( 'Reports', 'workpress' ) }</span>
							</a>
						</div>

						<!-- التنبيهات والإعدادات في آخر الهيدر بعد الأزرار -->
						<div className="is-flex is-align-items-center" style=${{ [rtl ? 'borderRight' : 'borderLeft']: '1px solid #e2e8f0', gap: '6px', [rtl ? 'paddingRight' : 'paddingLeft']: '8px' }}>
							${ hooks.applyFilters('workpress_header_brand_actions', []).map((Component, i) => html`<${Component} key=${i} />`) }
							${ isAdmin && html`<${SettingsQuickMenu} route=${route} />` }
						</div>
					</div>
				</div>

				<!-- الشريط الثاني المدمج (Compact) -->
				<div className="px-4 py-2 is-flex is-justify-content-space-between is-align-items-center has-background-white-ter" style=${{ fontSize: '0.85rem' }}>
					<!-- مسار التصفح Breadcrumb -->
					<nav className="breadcrumb has-succeeds-separator mb-0" aria-label="breadcrumbs">
						<ul style=${{ margin: 0 }}>
							<li><a href="#/" className="has-text-grey">WorkPress</a></li>
							<li className="is-active"><a href="#" aria-current="page" className="has-text-weight-bold has-text-dark">${currentViewName}</a></li>
						</ul>
					</nav>

					<!-- أزرار الإجراءات السريعة -->
					<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
						${ (isAdmin || userCaps.canManageProjects) && html`
							<button className="button wp-header-btn" onClick=${() => setIsProjectModalOpen(true)}>
								<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
								<span className="has-text-weight-bold">${ __( 'Project', 'workpress' ) }</span>
							</button>
						` }
						
						${ (isAdmin || userCaps.canCreateTasks) && html`
							<button className="button is-primary wp-header-btn" onClick=${ () => setIsTaskModalOpen( true ) }>
								<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
								<span className="has-text-weight-bold">${ __( 'Task', 'workpress' ) }</span>
							</button>
						` }
						
						<button className="button wp-header-btn" onClick=${() => setIsContributionModalOpen(true)}>
							<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
							<span className="has-text-weight-bold">${ __( 'Contribution', 'workpress' ) }</span>
						</button>

						${ hooks.applyFilters('workpress_header_actions', []).map((Component, i) => html`<${Component} key=${i} />`) }
					</div>
				</div>

				<!-- شريط الفلترة والأدوات الموحد المدمج بالهيدر -->
				<div id="wp-filterbar-portal-root"></div>
			</div>
			
			<div className="container is-fluid px-5">
				<${ErrorBoundary}>
					<${PageComponent} ...${params} refreshKey=${refreshKey} />
				</${ErrorBoundary}>
			</div>

			<${ProjectModal} 
				isActive=${ isProjectModalOpen } 
				onClose=${ () => setIsProjectModalOpen( false ) } 
				onSave=${ () => { setIsProjectModalOpen(false); setRefreshKey(prev => prev + 1); } } 
			/>
			
			<${TaskModal} 
				isActive=${ isTaskModalOpen } 
				onClose=${ () => setIsTaskModalOpen( false ) } 
				onSave=${ () => { setIsTaskModalOpen(false); setRefreshKey(prev => prev + 1); } } 
			/>

			<${ContributionModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => setIsContributionModalOpen( false ) }
				onSave=${ () => { setIsContributionModalOpen(false); setRefreshKey(prev => prev + 1); } }
			/>
		</div>
	`;
}
