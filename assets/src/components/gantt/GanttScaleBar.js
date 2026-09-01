import { html, __, sprintf, isRtl } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Controls & Scale Selector Bar
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
	const rtl = isRtl();

	return html`
		<div className="wp-gantt-controls-bar">
			<!-- Left Filters: Project & Status & Search -->
			<div className="wp-gantt-filter-group">
				<div className="select is-small">
					<select 
						value=${ selectedProjectFilter } 
						onChange=${ ( e ) => setSelectedProjectFilter( e.target.value ) }
						style=${{ borderRadius: 0, border: '1px solid #cbd5e1', fontWeight: '700', minWidth: '180px' }}
					>
						<option value="">${ sprintf( __( 'All Projects (%d)', 'workpress' ), projects.length ) }</option>
						${ projects.map( p => html`
							<option key=${ p.id } value=${ p.id }>${ p.name }</option>
						` ) }
					</select>
				</div>

				<div className="select is-small">
					<select 
						value=${ selectedStatusFilter } 
						onChange=${ ( e ) => setSelectedStatusFilter( e.target.value ) }
						style=${{ borderRadius: 0, border: '1px solid #cbd5e1', fontWeight: '700' }}
					>
						<option value="">${ __( 'All Statuses', 'workpress' ) }</option>
						<option value="in_progress">${ __( 'In Progress', 'workpress' ) }</option>
						<option value="open">${ __( 'Open / Assigned', 'workpress' ) }</option>
						<option value="completed">${ __( 'Completed', 'workpress' ) }</option>
					</select>
				</div>

				<div style=${{ position: 'relative' }}>
					<input 
						type="text" 
						className="input is-small" 
						placeholder=${ __( 'Search tasks & assignees...', 'workpress' ) } 
						value=${ searchQuery }
						onInput=${ ( e ) => setSearchQuery( e.target.value ) }
						style=${{ borderRadius: 0, border: '1px solid #cbd5e1', [rtl ? 'paddingRight' : 'paddingLeft']: '26px', width: '220px' }}
					/>
					<i className="dashicons dashicons-search" style=${{ position: 'absolute', [rtl ? 'right' : 'left']: '6px', top: '6px', color: '#94a3b8', fontSize: '15px' }}></i>
				</div>
			</div>

			<!-- Right Scale Selectors -->
			<div className="wp-gantt-scale-group">
				<!-- Day Hopping Arrows for 'day_hours' scale -->
				${ scale === 'day_hours' ? html`
					<div style=${{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: 0 }}>
						<button 
							type="button" 
							className="button is-small is-white p-1" 
							onClick=${ rtl ? handleNextDay : handlePrevDay }
							title=${ __( 'Previous Day', 'workpress' ) }
							style=${{ height: '26px', border: 'none' }}
						>
							<i className=${ rtl ? 'dashicons dashicons-arrow-right-alt2' : 'dashicons dashicons-arrow-left-alt2' } style=${{ fontSize: '18px' }}></i>
						</button>

						<span style=${{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', padding: '0 4px' }}>
							${ selectedDayOfWeek } (${ formatDate( selectedDay, { short: true } ) })
						</span>

						<button 
							type="button" 
							className="button is-small is-white p-1" 
							onClick=${ rtl ? handlePrevDay : handleNextDay }
							title=${ __( 'Next Day', 'workpress' ) }
							style=${{ height: '26px', border: 'none' }}
						>
							<i className=${ rtl ? 'dashicons dashicons-arrow-left-alt2' : 'dashicons dashicons-arrow-right-alt2' } style=${{ fontSize: '18px' }}></i>
						</button>

						<button 
							type="button" 
							className="button is-small is-light" 
							onClick=${ handleTodayDay }
							style=${{ height: '24px', borderRadius: 0, fontSize: '11px', fontWeight: '800' }}
						>
							${ __( 'Today', 'workpress' ) }
						</button>
					</div>
				` : html`
					<button 
						type="button" 
						className="button is-small is-danger is-light" 
						onClick=${ handleJumpToToday }
						style=${{ borderRadius: 0, border: '1px solid #fca5a5', fontWeight: '800', color: '#dc2626' }}
						title=${ __( 'Jump to Today', 'workpress' ) }
					>
						<i className="dashicons dashicons-location" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
						<span>${ sprintf( __( 'Today (%s)', 'workpress' ), formatDate( today, { short: true } ) ) }</span>
					</button>
				` }

				<!-- High-Density Scale Filter Switcher -->
				<div className="wp-btn-group-tight mb-0">
					<button 
						type="button" 
						className=${ `button ${ scale === 'day_hours' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'day_hours' ) }
						title=${ __( '24 Hours detailed view', 'workpress' ) }
					>
						${ __( '24h', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'days' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'days' ) }
						title=${ __( 'Days view', 'workpress' ) }
					>
						${ __( 'Days', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'weeks' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'weeks' ) }
						title=${ __( 'Weeks view', 'workpress' ) }
					>
						${ __( 'Weeks', 'workpress' ) }
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'months' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'months' ) }
						title=${ __( 'Months view', 'workpress' ) }
					>
						${ __( 'Months', 'workpress' ) }
					</button>
				</div>
			</div>
		</div>
	`;
}
