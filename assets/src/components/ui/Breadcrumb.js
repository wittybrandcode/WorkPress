import { html, useState, useEffect, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * WorkPress Hierarchical Executive Breadcrumb Component
 *
 * Replaces flat 2-level breadcrumb with full tree-aware navigation,
 * smart back navigation, and live entity title integration.
 *
 * @package WorkPress
 * @subpackage UI
 * @version 2.3.0
 */
export default function Breadcrumb( { route = '#/' } ) {
	const [ dynamicTitle, setDynamicTitle ] = useState( '' );
	const rtl = isRtl();

	// Listen for live page/entity titles dispatched by detail views
	useEffect( () => {
		const handleTitleUpdate = ( event ) => {
			if ( event && event.detail && typeof event.detail.title === 'string' ) {
				setDynamicTitle( event.detail.title );
			}
		};

		window.addEventListener( 'workpress_page_title', handleTitleUpdate );
		return () => window.removeEventListener( 'workpress_page_title', handleTitleUpdate );
	}, [] );

	// Reset dynamic title whenever route changes
	useEffect( () => {
		setDynamicTitle( '' );
	}, [ route ] );

	// Map settings tab keys to localized names
	const getSettingsTabLabel = ( tabKey ) => {
		const tabLabels = {
			about: __( 'About WorkPress', 'workpress' ),
			intake_forms: __( 'Intake Forms Builder', 'workpress' ),
			webhooks: __( 'Webhooks & Integrations', 'workpress' ),
			roles_permissions: __( 'Permissions Matrix', 'workpress' ),
			role_management: __( 'Role Management & Aliases', 'workpress' ),
			contribution_types: __( 'Contribution Types', 'workpress' ),
			members: __( 'Staff Directory', 'workpress' ),
			clients: __( 'Clients & Requesters', 'workpress' ),
			localization_time: __( 'Time & Localization', 'workpress' ),
			general: __( 'System Settings', 'workpress' ),
			notifications: __( 'Notifications & Alerts', 'workpress' ),
			sound_effects: __( 'Sound Effects', 'workpress' ),
			export: __( 'Export & Archive', 'workpress' ),
		};
		return tabLabels[ tabKey ] || __( 'Settings', 'workpress' );
	};

	// Parse route hierarchy
	const computeItems = () => {
		const items = [];
		const homeItem = { label: 'CoWorkPress', href: '#/' };

		if ( ! route || route === '#/' ) {
			items.push( { ...homeItem, isActive: true } );
			return items;
		}

		items.push( homeItem );

		if ( route === '#/projects' ) {
			items.push( { label: __( 'Projects', 'workpress' ), href: '#/projects', isActive: true } );
		} else if ( route.startsWith( '#/projects/' ) ) {
			const projId = route.replace( '#/projects/', '' ).split( '?' )[ 0 ];
			items.push( { label: __( 'Projects', 'workpress' ), href: '#/projects' } );
			items.push( {
				label: dynamicTitle || sprintf( __( 'Project #%s', 'workpress' ), projId ),
				href: route,
				isActive: true
			} );
		} else if ( route === '#/kanban' ) {
			items.push( { label: __( 'Tasks', 'workpress' ), href: '#/kanban', isActive: true } );
		} else if ( route.startsWith( '#/tasks/' ) ) {
			const taskId = route.replace( '#/tasks/', '' ).split( '?' )[ 0 ];
			items.push( { label: __( 'Tasks', 'workpress' ), href: '#/kanban' } );
			items.push( {
				label: dynamicTitle || sprintf( __( 'Task #%s', 'workpress' ), taskId ),
				href: route,
				isActive: true
			} );
		} else if ( route === '#/requests' || ( route.startsWith( '#/requests' ) && ! route.includes( '/forms' ) ) ) {
			items.push( { label: __( 'Requests', 'workpress' ), href: '#/requests', isActive: true } );
		} else if ( route === '#/forms' || route.startsWith( '#/forms' ) || route === '#/intake-forms' || route.startsWith( '#/intake-forms' ) ) {
			// Intake Forms are an extension of Requests
			items.push( { label: __( 'Requests', 'workpress' ), href: '#/requests' } );
			items.push( { label: __( 'Intake Forms', 'workpress' ), href: '#/forms', isActive: true } );
		} else if ( route === '#/contributions' || route.startsWith( '#/contributions' ) ) {
			items.push( { label: __( 'Contributions', 'workpress' ), href: '#/contributions', isActive: true } );
		} else if ( route === '#/knowledge' || route.startsWith( '#/knowledge' ) ) {
			items.push( { label: __( 'Knowledge Base', 'workpress' ), href: '#/knowledge', isActive: true } );
		} else if ( route === '#/gantt' || route.startsWith( '#/gantt' ) ) {
			items.push( { label: __( 'Gantt Chart', 'workpress' ), href: '#/gantt', isActive: true } );
		} else if ( route === '#/reports' || route.startsWith( '#/reports' ) ) {
			items.push( { label: __( 'Reports', 'workpress' ), href: '#/reports', isActive: true } );
		} else if ( route === '#/broadcasts' || route.startsWith( '#/broadcasts' ) ) {
			items.push( { label: __( 'Broadcasts & Alerts Hub', 'workpress' ), href: '#/broadcasts', isActive: true } );
		} else if ( route.startsWith( '#/settings' ) ) {
			const urlParams = new URLSearchParams( route.includes( '?' ) ? route.split( '?' )[ 1 ] : '' );
			const activeTab = urlParams.get( 'tab' );
			if ( activeTab ) {
				items.push( { label: __( 'Settings', 'workpress' ), href: '#/settings' } );
				items.push( { label: getSettingsTabLabel( activeTab ), href: route, isActive: true } );
			} else {
				items.push( { label: __( 'Settings', 'workpress' ), href: '#/settings', isActive: true } );
			}
		} else {
			// Fallback generic route
			items.push( { label: __( 'Current View', 'workpress' ), href: route, isActive: true } );
		}

		return items;
	};

	const items = computeItems();
	const isRoot = items.length <= 1;

	const handleBack = () => {
		sound.play( 'button' );
		if ( window.history.length > 1 ) {
			window.history.back();
		} else {
			const parentHref = items.length > 1 ? items[ items.length - 2 ].href : '#/';
			window.location.hash = parentHref;
		}
	};

	return html`
		<nav className="breadcrumb wp-breadcrumb mb-0" aria-label="breadcrumbs" style=${{ display: 'inline-flex', alignItems: 'center', minWidth: 0, flexWrap: 'nowrap' }}>
			${ ! isRoot && html`
				<button
					type="button"
					onClick=${ handleBack }
					className="button wp-btn wp-breadcrumb-back-btn"
					title=${ __( 'Back to previous view', 'workpress' ) }
					style=${{
						height: '24px',
						width: '24px',
						padding: 0,
						marginInlineEnd: '8px',
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						borderRadius: 0,
						border: '1px solid #cbd5e1',
						backgroundColor: '#ffffff',
						cursor: 'pointer',
						flexShrink: 0
					}}
				>
					<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-right-alt' : 'dashicons-arrow-left-alt' }` } style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
				</button>
			` }

			<ul style=${{ margin: 0, padding: 0, display: 'inline-flex', alignItems: 'center', listStyle: 'none', minWidth: 0, flexWrap: 'nowrap' }}>
				${ items.map( ( item, index ) => {
					const isLast = index === items.length - 1;
					return html`
						<li key=${ index } className=${ isLast ? 'is-active' : '' } style=${{ display: 'inline-flex', alignItems: 'center' }}>
							${ index > 0 && html`
								<span className="wp-breadcrumb-separator" style=${{ margin: '0 6px', color: '#94a3b8', fontSize: '11px', userSelect: 'none' }}>
									/
								</span>
							` }
							${ isLast ? html`
								<span
									className="has-text-weight-bold wp-breadcrumb-current"
									aria-current="page"
									style=${{
										color: '#0f172a',
										fontSize: '0.82rem',
										maxWidth: '240px',
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										display: 'inline-block'
									}}
									title=${ item.label }
								>
									${ item.label }
								</span>
							` : html`
								<a
									href=${ item.href }
									className="wp-breadcrumb-link"
									style=${{
										color: '#64748b',
										fontSize: '0.82rem',
										textDecoration: 'none',
										transition: 'color 0.15s ease'
									}}
								>
									${ item.label }
								</a>
							` }
						</li>
					`;
				} ) }
			</ul>
		</nav>
	`;
}
