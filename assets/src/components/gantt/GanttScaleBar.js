import { html, createPortal, __, sprintf, isRtl } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';
import CustomSelect from '../ui/CustomSelect.js';
import sound from '../../utils/sound.js';

/**
 * Gantt Unified Fixed Toolbar Component
 *
 * Consolidates project filtering, status filtering, instant search,
 * day navigation, scale switching, and view switching into a SINGLE fixed horizontal bar under the breadcrumb.
 */
export default function GanttScaleBar({
	projects = [],
	selectedProjectFilter = '',
	setSelectedProjectFilter,
	selectedStatusFilter = '',
	setSelectedStatusFilter,
	searchQuery = '',
	setSearchQuery,
	scale = 'days',
	setScale,
	selectedDay = new Date(),
	selectedDayOfWeek = '',
	handleNextDay,
	handlePrevDay,
	handleTodayDay,
	handleJumpToToday,
	today = new Date()
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;
	const rtl = isRtl();

	// Projects options for CustomSelect
	const projectOptions = [
		{ value: '', label: sprintf( __( 'All Projects (%d)', 'workpress' ), projects.length ) },
		...projects.map( p => ({ value: String( p.id ), label: p.name }) )
	];

	// Status options for CustomSelect
	const statusOptions = [
		{ value: '', label: __( 'All Statuses', 'workpress' ) },
		{ value: 'in_progress', label: __( 'In Progress', 'workpress' ) },
		{ value: 'open', label: __( 'Open / Assigned', 'workpress' ) },
		{ value: 'completed', label: __( 'Completed', 'workpress' ) },
	];

	const toolbarContent = html`
		<div className="wp-filter-toolbar wp-gantt-unified-toolbar">
			<!-- Section 1: Filters & Search -->
			<div className="wp-toolbar-section">
				<!-- Project Filter -->
				<${CustomSelect}
					value=${ selectedProjectFilter }
					onChange=${ ( val ) => { setSelectedProjectFilter( val ); sound.play( 'button' ); } }
					options=${ projectOptions }
					placeholder=${ __( 'Project', 'workpress' ) }
					icon="dashicons-category"
					width="160px"
				/>

				<!-- Status Filter -->
				<${CustomSelect}
					value=${ selectedStatusFilter }
					onChange=${ ( val ) => { setSelectedStatusFilter( val ); sound.play( 'button' ); } }
					options=${ statusOptions }
					placeholder=${ __( 'Status', 'workpress' ) }
					icon="dashicons-flag"
					width="130px"
				/>

				<!-- Instant Search -->
				<div className="wp-filter-search-box" style=${{ width: '180px', minWidth: '130px' }}>
					<span className="wp-filter-search-icon">
						<i className="dashicons dashicons-search"></i>
					</span>
					<input 
						type="text" 
						className="input wp-filter-input" 
						placeholder=${ __( 'Search tasks...', 'workpress' ) } 
						value=${ searchQuery }
						onInput=${ ( e ) => setSearchQuery( e.target.value ) }
					/>
					${ searchQuery && html`
						<button 
							type="button" 
							className="wp-filter-search-clear" 
							title=${ __( 'Clear search', 'workpress' ) }
							onClick=${ () => setSearchQuery('') }
						>
							<i className="dashicons dashicons-no-alt"></i>
						</button>
					` }
				</div>
			</div>

			<!-- Section 2: Scale & Time Controls -->
			<div className="wp-toolbar-section" style=${{ marginInlineStart: 'auto' }}>
				<!-- Day Hopping Arrows for 'day_hours' scale -->
				${ scale === 'day_hours' ? html`
					<div className="is-flex is-align-items-center" style=${{ gap: '3px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0 4px', height: '32px', borderRadius: '3px' }}>
						<button 
							type="button" 
							className="wp-icon-btn is-small" 
							onClick=${ () => { ( rtl ? handleNextDay : handlePrevDay )(); sound.play( 'button' ); } }
							title=${ __( 'Previous Day', 'workpress' ) }
							style=${{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
						>
							<i className=${ rtl ? 'dashicons dashicons-arrow-right-alt2' : 'dashicons dashicons-arrow-left-alt2' } style=${{ fontSize: '15px' }}></i>
						</button>

						<span style=${{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a', padding: '0 4px', whiteSpace: 'nowrap' }}>
							${ selectedDayOfWeek } (${ formatDate( selectedDay, { short: true } ) })
						</span>

						<button 
							type="button" 
							className="wp-icon-btn is-small" 
							onClick=${ () => { ( rtl ? handlePrevDay : handleNextDay )(); sound.play( 'button' ); } }
							title=${ __( 'Next Day', 'workpress' ) }
							style=${{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
						>
							<i className=${ rtl ? 'dashicons dashicons-arrow-left-alt2' : 'dashicons dashicons-arrow-right-alt2' } style=${{ fontSize: '15px' }}></i>
						</button>

						<button 
							type="button" 
							className="button is-small is-light px-2" 
							onClick=${ () => { handleTodayDay(); sound.play( 'button' ); } }
							style=${{ height: '24px', borderRadius: '2px', fontSize: '11px', fontWeight: '800', border: '1px solid #cbd5e1' }}
						>
							${ __( 'Today', 'workpress' ) }
						</button>
					</div>
				` : html`
					<button 
						type="button" 
						className="button is-small is-danger is-light" 
						onClick=${ () => { handleJumpToToday(); sound.play( 'button' ); } }
						style=${{ height: '32px', borderRadius: '3px', border: '1px solid #fca5a5', fontWeight: '800', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
						title=${ __( 'Jump to Today', 'workpress' ) }
					>
						<i className="dashicons dashicons-location" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
						<span>${ sprintf( __( 'Today (%s)', 'workpress' ), formatDate( today, { short: true } ) ) }</span>
					</button>
				` }

				<!-- Scale Selector Segmented Switcher (32px height) -->
				<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
					<button 
						type="button" 
						className=${ `wp-scale-btn ${ scale === 'day_hours' ? 'is-active' : '' }` }
						onClick=${ () => { setScale( 'day_hours' ); sound.play( 'button' ); } }
						title=${ __( '24 Hours detailed view', 'workpress' ) }
					>
						${ __( '24h', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `wp-scale-btn ${ scale === 'days' ? 'is-active' : '' }` }
						onClick=${ () => { setScale( 'days' ); sound.play( 'button' ); } }
						title=${ __( 'Days view', 'workpress' ) }
					>
						${ __( 'Days', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `wp-scale-btn ${ scale === 'weeks' ? 'is-active' : '' }` }
						onClick=${ () => { setScale( 'weeks' ); sound.play( 'button' ); } }
						title=${ __( 'Weeks view', 'workpress' ) }
					>
						${ __( 'Weeks', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `wp-scale-btn ${ scale === 'months' ? 'is-active' : '' }` }
						onClick=${ () => { setScale( 'months' ); sound.play( 'button' ); } }
						title=${ __( 'Months view', 'workpress' ) }
					>
						${ __( 'Months', 'workpress' ) }
					</button>
				</div>

				<!-- Switch to Kanban Icon Button -->
				<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
					<a
						href="#/kanban"
						className="wp-view-icon-btn"
						title=${ __( 'Switch to Kanban Board', 'workpress' ) }
					>
						<i className="dashicons dashicons-columns" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
					</a>
				</div>
			</div>
		</div>
	`;

	if ( portalRoot ) {
		return createPortal( toolbarContent, portalRoot );
	}

	return toolbarContent;
}
