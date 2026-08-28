import { html, useState, useEffect } from './utils/html.js';
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
import ProjectModal from './components/modals/Modal.js';
import TaskModal from './components/modals/Modal.js';
import ContributionModal from './components/modals/Modal.js';
import ErrorBoundary from './components/ui/ErrorBoundary.js';
import sound from './utils/sound.js';

export default function App() {
	const [ route, setRoute ] = useState( window.location.hash || '#/' );
	const [ refreshKey, setRefreshKey ] = useState( 0 );
	const [ isProjectModalOpen, setIsProjectModalOpen ] = useState( false );
	const [ isTaskModalOpen, setIsTaskModalOpen ] = useState( false );
	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );

	// T1+T2: Capability-based UI guards (Atomic Audit T1, T2)
	const settings = window.workpressSettings || {};
	const isAdmin = !!settings.isAdmin;
	const userCaps = settings.userCaps || {};

	useEffect( () => {
		const handleHashChange = () => setRoute( window.location.hash || '#/' );
		window.addEventListener( 'hashchange', handleHashChange );

		// Universal Session Keep-Alive (Refresh nonce on tab visibility & every 15 mins)
		const refreshNonce = async () => {
			try {
				const baseUrl = settings.apiUrl || '/wp-json/workpress/v1/';
				const currentNonce = settings.restNonce || ( window.wpApiSettings && window.wpApiSettings.nonce );
				const res = await fetch( baseUrl + 'portal/refresh-nonce', {
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
			document.removeEventListener( 'visibilitychange', handleVisibilityChange );
			clearInterval( keepAliveInterval );
		};
	}, [] );

	let PageComponent = DashboardPage;
	let params = {};
	let currentViewName = 'CoWorkPress';

	if ( route === '#/projects' ) {
		PageComponent = ProjectsPage;
		currentViewName = 'Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹';
	} else if ( route === '#/requests' || route.startsWith( '#/requests' ) ) {
		PageComponent = RequestsPage;
		currentViewName = 'ÙˆØ§Ø±Ø¯ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡';
	} else if ( route.startsWith( '#/projects/' ) ) {
		PageComponent = ProjectDetailPage;
		params.projectId = route.replace( '#/projects/', '' );
		currentViewName = 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹';
	} else if ( route === '#/forms' || route.startsWith( '#/forms' ) || route === '#/intake-forms' || route.startsWith( '#/intake-forms' ) ) {
		PageComponent = IntakeFormsPage;
		currentViewName = 'Ù…Ù†Ø´Ø¦ Ù†Ù…Ø§Ø°Ø¬ Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª ÙˆØ§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹';
	} else if ( route === '#/kanban' ) {
		PageComponent = KanbanPage;
		currentViewName = 'Ø§Ù„ÙƒØ§Ù†Ø¨Ø§Ù†';
	} else if ( route === '#/gantt' || route.startsWith( '#/gantt' ) ) {
		PageComponent = GanttPage;
		currentViewName = 'Ù…Ø®Ø·Ø· Ø¬Ø§Ù†Øª ÙˆØ§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ';
	} else if ( route.startsWith( '#/tasks/' ) ) {
		PageComponent = TaskDetailPage;
		params.taskId = route.replace( '#/tasks/', '' );
		currentViewName = 'ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù‡Ù…Ø©';
	} else if ( route === '#/knowledge' ) {
		PageComponent = KnowledgePage;
		currentViewName = 'Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©';
	} else if ( route === '#/contributions' ) {
		PageComponent = ContributionsPage;
		currentViewName = 'Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª';
	} else if ( route === '#/reports' || route.startsWith( '#/reports' ) ) {
		PageComponent = ReportsPage;
		currentViewName = 'Ù…Ø±ÙƒØ² Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± ÙˆØ§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ©';
	} else if ( route.startsWith( '#/settings' ) ) {
		// T1: Settings route protected â€” admin only
		if ( isAdmin ) {
			PageComponent = SettingsPage;
			currentViewName = 'Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª';
		} else {
			PageComponent = () => html`
				<div className="has-text-centered py-6">
					<span className="icon is-large has-text-danger mb-3"><i className="dashicons dashicons-lock" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i></span>
					<h2 className="title is-4 has-text-grey">ØµÙ„Ø§Ø­ÙŠØ© ØºÙŠØ± ÙƒØ§ÙÙŠØ©</h2>
					<p className="subtitle is-6 has-text-grey-light mt-2">Ù„Ø§ ØªÙ…Ù„Ùƒ ØµÙ„Ø§Ø­ÙŠØ© Ø§Ù„ÙˆØµÙˆÙ„ Ù„ØµÙØ­Ø© Ø§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª.</p>
					<a href="#/" className="button is-primary mt-4 wp-card">Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a>
				</div>
			`;
			currentViewName = 'ØµÙ„Ø§Ø­ÙŠØ© ØºÙŠØ± ÙƒØ§ÙÙŠØ©';
		}
	} else if ( route !== '#/' ) {
		PageComponent = () => html`
			<div className="has-text-centered py-6">
				<h2 className="title is-3 has-text-grey">404 - Ø§Ù„ØµÙØ­Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©</h2>
				<p className="subtitle is-5 has-text-grey-light mt-2">Ø§Ù„Ù…Ø³Ø§Ø± Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ ÙÙŠ Ù…Ø³Ø§Ø­Ø© Ø§Ù„Ø¹Ù…Ù„.</p>
				<a href="#/" className="button is-primary mt-4 wp-card">Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ø±Ø¦ÙŠØ³ÙŠØ©</a>
			</div>
		`;
		currentViewName = 'Ø®Ø·Ø£ 404';
	}

	return html`
		<div dir="rtl" className="workpress-spa has-background-light" style=${{ minHeight: '100vh', paddingBottom: '2rem' }}>
			
			<div className="workpress-header-wrapper mb-4 has-background-white" style=${{ 
				boxShadow: '0 2px 6px rgba(0,0,0,0.03)', 
				borderBottom: '1px solid #e2e8f0',
				position: 'sticky', 
				top: '32px', /* Accounts for standard WordPress Admin Bar */
				zIndex: 40
			}}>
				<!-- Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø£ÙˆÙ„: Ø§Ù„Ù‡ÙˆÙŠØ© ÙˆØ§Ù„Ø±ÙˆØ§Ø¨Ø· -->
				<div className="is-flex is-justify-content-space-between is-align-items-center p-3" style=${{ borderBottom: '1px solid #f0f0f0' }}>
					<!-- Ø§Ù„Ù‡ÙˆÙŠØ©: Ø§Ù„Ø´Ø¹Ø§Ø± Ø§Ù„Ø±Ø³Ù…ÙŠ SVG Ø¨Ø­Ø¬Ù… ÙƒØ¨ÙŠØ± ÙˆÙˆØ§Ø¶Ø­ -->
					<div className="is-flex is-align-items-center">
						<a href="#/" className="is-flex is-align-items-center" title="WorkPress â€” just work" style=${{ textDecoration: 'none', outline: 'none', boxShadow: 'none', padding: '2px 0' }}>
							<${WorkPressLogo} height=${36} />
						</a>
					</div>
					
					<!-- Ø§Ù„Ø±ÙˆØ§Ø¨Ø· ÙˆØ£ÙŠÙ‚ÙˆÙ†Ø§Øª Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª (Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙˆØ§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ÙÙŠ Ø¢Ø®Ø± Ø§Ù„Ù‡ÙŠØ¯Ø± Ø¨Ø¹Ø¯ Ø§Ù„Ø£Ø²Ø±Ø§Ø±) -->
					<div className="is-flex is-align-items-center" style=${{ gap: '12px' }}>
						<!-- Ø£Ø²Ø±Ø§Ø± Ø§Ù„ØªØ¨ÙˆÙŠØ¨Ø§Øª Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© -->
						<div className="buttons mb-0" style=${{ gap: '4px' }}>
							<a href="#/" className=${`button wp-header-btn ${route === '#/' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-dashboard"></i></span>
								<span className="has-text-weight-bold">CoWorkPress</span>
							</a>
							<a href="#/projects" className=${`button wp-header-btn ${route === '#/projects' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-category"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹</span>
							</a>
							<a href="#/requests" className=${`button wp-header-btn ${route.startsWith('#/requests') ? 'is-active' : ''}`} title="ÙˆØ§Ø±Ø¯ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¹Ù…Ù„Ø§Ø¡">
								<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„Ø·Ù„Ø¨Ø§Øª</span>
							</a>
							<a href="#/forms" className=${`button wp-header-btn ${route.startsWith('#/forms') || route.startsWith('#/intake-forms') ? 'is-active' : ''}`} title="Ù…Ù†Ø´Ø¦ Ù†Ù…Ø§Ø°Ø¬ Ø§Ø³ØªÙ‚Ø¨Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨Ø§Øª">
								<span className="icon"><i className="dashicons dashicons-forms"></i></span>
								<span className="has-text-weight-bold">Ù†Ù…Ø§Ø°Ø¬ Ø§Ù„Ø·Ù„Ø¨Ø§Øª</span>
							</a>
							<a href="#/kanban" className=${`button wp-header-btn ${route === '#/kanban' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-columns"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„ÙƒØ§Ù†Ø¨Ø§Ù†</span>
							</a>
							<a href="#/gantt" className=${`button wp-header-btn ${route.startsWith('#/gantt') ? 'is-active' : ''}`} title="Ù…Ø®Ø·Ø· Ø¬Ø§Ù†Øª ÙˆØ§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ">
								<span className="icon"><i className="dashicons dashicons-calendar-alt"></i></span>
								<span className="has-text-weight-bold">Ù…Ø®Ø·Ø· Ø¬Ø§Ù†Øª</span>
							</a>
							<a href="#/knowledge" className=${`button wp-header-btn ${route === '#/knowledge' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-book"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„Ù…Ø¹Ø±ÙØ©</span>
							</a>
							<a href="#/contributions" className=${`button wp-header-btn ${route === '#/contributions' ? 'is-active' : ''}`}>
								<span className="icon"><i className="dashicons dashicons-share-alt2"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª</span>
							</a>
							<a href="#/reports" className=${`button wp-header-btn ${route.startsWith('#/reports') ? 'is-active' : ''}`} title="Ù…Ø±ÙƒØ² Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± ÙˆØ§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ©">
								<span className="icon"><i className="dashicons dashicons-analytics"></i></span>
								<span className="has-text-weight-bold">Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±</span>
							</a>
						</div>

						<!-- Ø§Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª ÙˆØ§Ù„Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª ÙÙŠ Ø¢Ø®Ø± Ø§Ù„Ù‡ÙŠØ¯Ø± Ø¨Ø¹Ø¯ Ø§Ù„Ø£Ø²Ø±Ø§Ø± - Ù…ØªØ·Ø§Ø¨Ù‚Ø© ÙÙŠ Ø§Ù„Ø­Ø¬Ù… 32x32px ØªÙ…Ø§Ù…Ø§Ù‹ -->
						<div className="is-flex is-align-items-center pr-2" style=${{ borderRight: '1px solid #e2e8f0', gap: '6px', paddingRight: '8px' }}>
							${ hooks.applyFilters('workpress_header_brand_actions', []).map((Component, i) => html`<${Component} key=${i} />`) }
							${ isAdmin && html`<${SettingsQuickMenu} route=${route} />` }
						</div>
					</div>
				</div>

				<!-- Ø§Ù„Ø´Ø±ÙŠØ· Ø§Ù„Ø«Ø§Ù†ÙŠ Ø§Ù„Ù…Ø¯Ù…Ø¬ (Compact) -->
				<div className="px-4 py-2 is-flex is-justify-content-space-between is-align-items-center has-background-white-ter" style=${{ fontSize: '0.85rem' }}>
					<!-- Ù…Ø³Ø§Ø± Ø§Ù„ØªØµÙØ­ Breadcrumb -->
					<nav className="breadcrumb has-succeeds-separator mb-0" aria-label="breadcrumbs">
						<ul style=${{ margin: 0 }}>
							<li><a href="#/" className="has-text-grey">WorkPress</a></li>
							<li className="is-active"><a href="#" aria-current="page" className="has-text-weight-bold has-text-dark">${currentViewName}</a></li>
						</ul>
					</nav>

					<!-- Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹Ø© -->
					<!-- Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹Ø© -->
					<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
						${ (isAdmin || userCaps.canManageProjects) && html`
							<button className="button wp-header-btn" onClick=${() => setIsProjectModalOpen(true)}>
								<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
								<span className="has-text-weight-bold">Ù…Ø´Ø±ÙˆØ¹</span>
							</button>
						` }
						
						${ (isAdmin || userCaps.canCreateTasks) && html`
							<button className="button is-primary wp-header-btn" onClick=${ () => setIsTaskModalOpen( true ) }>
								<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
								<span className="has-text-weight-bold">Ù…Ù‡Ù…Ø©</span>
							</button>
						` }
						
						<button className="button wp-header-btn" onClick=${() => setIsContributionModalOpen(true)}>
							<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
							<span className="has-text-weight-bold">Ù…Ø³Ø§Ù‡Ù…Ø©</span>
						</button>

						${ hooks.applyFilters('workpress_header_actions', []).map((Component, i) => html`<${Component} key=${i} />`) }
					</div>
				</div>

				<!-- Ø´Ø±ÙŠØ· Ø§Ù„ÙÙ„ØªØ±Ø© ÙˆØ§Ù„Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ù…ÙˆØ­Ø¯ Ø§Ù„Ù…Ø¯Ù…Ø¬ Ø¨Ø§Ù„Ù‡ÙŠØ¯Ø± (Ø«Ø§Ø¨Øª 100% Ù„Ø§ ÙŠØªØ­Ø±Ùƒ) -->
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
