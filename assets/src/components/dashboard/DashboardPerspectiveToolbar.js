import { html, createPortal } from '../../utils/html.js';

/**
 * Dashboard Perspective Selector & Global Metrics Toolbar
 */
export default function DashboardPerspectiveToolbar({
	isSuperAdmin = false,
	userRoles = [],
	myLedProjects = [],
	perspective = 'admin',
	setPerspective,
	totalProjectsCount = 0,
	globalProgress = 0,
	completedTasksCount = 0,
	totalTasksCount = 0
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const toolbarContent = html`
		<div className="wp-filter-toolbar">
			<!-- Perspective Switcher Tabs -->
			<div className="wp-filter-group is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<span className="wp-filter-label is-flex is-align-items-center" style=${{ color: '#64748b', fontSize: '0.8rem' }}>
					<i className="dashicons dashicons-networking ml-1" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
					<span>المنظور:</span>
				</span>

				<div className="buttons are-small mb-0" style=${{ gap: '4px' }}>
					${ isSuperAdmin && html`
						<button 
							type="button"
							className=${ `button wp-header-btn ${ perspective === 'admin' ? 'is-active' : '' }` }
							onClick=${ () => setPerspective( 'admin' ) }
							style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
						>
							<span className="icon is-small"><i className="dashicons dashicons-admin-generic"></i></span>
							<span className="has-text-weight-bold">الإدارة العليا</span>
						</button>
					` }
					${ ( isSuperAdmin || userRoles.includes('editor') || myLedProjects.length > 0 ) && html`
						<button 
							type="button"
							className=${ `button wp-header-btn ${ perspective === 'lead' ? 'is-active' : '' }` }
							onClick=${ () => setPerspective( 'lead' ) }
							style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
						>
							<span className="icon is-small"><i className="dashicons dashicons-businessman"></i></span>
							<span className="has-text-weight-bold">قيادة المشاريع</span>
						</button>
					` }
					<button 
						type="button"
						className=${ `button wp-header-btn ${ perspective === 'member' ? 'is-active' : '' }` }
						onClick=${ () => setPerspective( 'member' ) }
						style=${{ height: '28px', padding: '0 10px', fontSize: '0.8rem' }}
					>
						<span className="icon is-small"><i className="dashicons dashicons-edit"></i></span>
						<span className="has-text-weight-bold">مهامي وتنفيذي</span>
					</button>
				</div>
			</div>

			<!-- Lean Metrics on Left -->
			<div className="wp-filter-actions is-flex is-align-items-center">
				<span className="wp-filter-counter">
					<i className="dashicons dashicons-chart-pie" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
					${ totalProjectsCount } مشاريع • ${ globalProgress }% إنجاز (${ completedTasksCount }/${ totalTasksCount } مهمة)
				</span>
			</div>
		</div>
	`;

	return portalRoot ? createPortal( toolbarContent, portalRoot ) : toolbarContent;
}
