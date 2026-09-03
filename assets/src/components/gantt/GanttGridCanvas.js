import { html, __, sprintf, isRtl } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Timeline Header Component (Sticky Vertically, Moves Horizontally)
 *
 * Minimalist design matching WorkPress FilterBar:
 * - Clean Cairo typography
 * - Icon-driven hierarchy with #008478 primary accents
 * - Sleek micro-badge for current day (Today)
 */
export function GanttTimelineHeader({
	scale = 'days',
	selectedDay = new Date(),
	selectedDayOfWeek = '',
	hoursList = [],
	hourCellWidth = 72,
	monthHeaders = [],
	dayUnits = [],
	weekUnits = [],
	monthsList = [],
	cellWidth = 130
}) {
	const rtl = isRtl();
	const borderSide = rtl ? 'borderRight' : 'borderLeft';

	return html`
		<div className="wp-gantt-sticky-header">
			<!-- ================= SCALE: DAY_HOURS (24 Hours) ================= -->
			${ scale === 'day_hours' ? html`
				<!-- Top Row: Full Day Title Banner -->
				<div style=${{ height: '28px', display: 'flex', alignItems: 'center', padding: '0 0.85rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#0f172a' }}>
					<i className="dashicons dashicons-clock" style=${{ fontSize: '14px', width: '14px', height: '14px', [rtl ? 'marginLeft' : 'marginRight']: '6px', color: '#008478' }}></i>
					<span>${ sprintf( __( 'Schedule for %s (%s) — 24h', 'workpress' ), selectedDayOfWeek, formatDate( selectedDay ) ) }</span>
				</div>

				<!-- Bottom Row: 24 Hours Columns -->
				<div style=${{ height: '30px', display: 'flex', backgroundColor: '#ffffff' }}>
					${ hoursList.map( h => html`
						<div 
							key=${ h.hour }
							style=${{ 
								width: `${ hourCellWidth }px`, 
								minWidth: `${ hourCellWidth }px`, 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center', 
								fontSize: '0.72rem', 
								fontWeight: '700', 
								color: h.isWorkHour ? '#0f172a' : '#94a3b8',
								backgroundColor: h.isWorkHour ? '#ffffff' : 'rgba(248, 250, 252, 0.7)',
								[borderSide]: '1px solid #e2e8f0'
							}}
						>
							${ h.label }
						</div>
					` ) }
				</div>
			` : null }

			<!-- ================= SCALE: DAYS (Full Names + 130px Cells) ================= -->
			${ scale === 'days' ? html`
				<!-- Top Row: Months Banner -->
				<div style=${{ height: '28px', display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
					${ monthHeaders.map( m => html`
						<div 
							key=${ m.key }
							style=${{ 
								width: `${ m.span * cellWidth }px`, 
								minWidth: `${ m.span * cellWidth }px`, 
								padding: '0 0.85rem', 
								display: 'flex', 
								alignItems: 'center', 
								fontWeight: '800', 
								fontSize: '0.78rem', 
								color: '#0f172a',
								[borderSide]: '1px solid #cbd5e1',
								backgroundColor: '#f8fafc'
							}}
						>
							<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '13px', width: '13px', height: '13px', [rtl ? 'marginLeft' : 'marginRight']: '6px', color: '#008478' }}></i>
							<span>${ m.title }</span>
						</div>
					` ) }
				</div>

				<!-- Bottom Row: Day Name + Number Badge -->
				<div style=${{ height: '30px', display: 'flex', backgroundColor: '#ffffff' }}>
					${ dayUnits.map( du => html`
						<div 
							key=${ du.index }
							style=${{ 
								width: `${ cellWidth }px`, 
								minWidth: `${ cellWidth }px`, 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center', 
								fontSize: '0.74rem', 
								fontWeight: du.isToday ? '900' : '700', 
								color: du.isToday ? '#dc2626' : ( du.isWeekend ? '#94a3b8' : '#334155' ),
								backgroundColor: du.isToday ? '#fef2f2' : ( du.isWeekend ? 'rgba(248, 250, 252, 0.7)' : '#ffffff' ),
								[borderSide]: '1px solid #e2e8f0',
								borderTop: du.isToday ? '2px solid #ef4444' : 'none',
								gap: '5px'
							}}
							title=${ `${ du.fullDayName } ${ du.dayNum } ${ du.monthName } ${ du.year }` }
						>
							<span style=${{ fontWeight: '700', fontSize: '0.72rem' }}>${ du.fullDayName }</span>
							<span style=${{ 
								fontWeight: '900', 
								padding: du.isToday ? '1px 6px' : '0 2px', 
								borderRadius: du.isToday ? '3px' : '0',
								backgroundColor: du.isToday ? '#ef4444' : 'transparent',
								color: du.isToday ? '#ffffff' : 'inherit',
								fontSize: du.isToday ? '0.75rem' : '0.74rem'
							}}>
								${ du.dayNum }
							</span>
						</div>
					` ) }
				</div>
			` : null }

			<!-- ================= SCALE: WEEKS ================= -->
			${ scale === 'weeks' ? html`
				<div style=${{ height: '28px', display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
					${ monthHeaders.map( m => html`
						<div 
							key=${ m.key }
							style=${{ 
								width: `${ m.span * 180 }px`, 
								minWidth: `${ m.span * 180 }px`, 
								padding: '0 0.85rem', 
								display: 'flex', 
								alignItems: 'center', 
								fontWeight: '800', 
								fontSize: '0.78rem', 
								color: '#0f172a',
								[borderSide]: '1px solid #cbd5e1',
								backgroundColor: '#f8fafc'
							}}
						>
							<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '13px', width: '13px', height: '13px', [rtl ? 'marginLeft' : 'marginRight']: '6px', color: '#008478' }}></i>
							<span>${ m.title }</span>
						</div>
					` ) }
				</div>

				<div style=${{ height: '30px', display: 'flex', backgroundColor: '#ffffff' }}>
					${ weekUnits.map( wu => html`
						<div 
							key=${ wu.index }
							style=${{ 
								width: '180px', 
								minWidth: '180px', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center', 
								fontSize: '0.74rem', 
								fontWeight: '700', 
								color: '#0f172a',
								[borderSide]: '1px solid #e2e8f0',
								gap: '6px'
							}}
						>
							<span style=${{ fontWeight: '800' }}>${ wu.title }</span>
							<span style=${{ fontSize: '0.68rem', color: '#64748b' }}>(${ wu.dateRange })</span>
						</div>
					` ) }
				</div>
			` : null }

			<!-- ================= SCALE: MONTHS ================= -->
			${ scale === 'months' ? html`
				<div style=${{ height: '58px', display: 'flex', backgroundColor: '#ffffff' }}>
					${ monthsList.map( ml => html`
						<div 
							key=${ ml.index }
							style=${{ 
								width: '220px', 
								minWidth: '220px', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center', 
								[borderSide]: '1px solid #e2e8f0',
								backgroundColor: '#ffffff',
								fontSize: '0.85rem',
								fontWeight: '900',
								color: '#0f172a'
							}}
						>
							<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '15px', width: '15px', height: '15px', [rtl ? 'marginLeft' : 'marginRight']: '6px', color: '#008478' }}></i>
							<span>${ ml.title }</span>
						</div>
					` ) }
				</div>
			` : null }
		</div>
	`;
}

/**
 * Background Grid Overlay Component (inside timeline canvas)
 */
export default function GanttGridCanvas({
	scale = 'days',
	hoursList = [],
	hourCellWidth = 72,
	dayUnits = [],
	weekUnits = [],
	monthsList = [],
	cellWidth = 130,
	todayPixelRight = null,
	currentHourPixelRight = null
}) {
	const rtl = isRtl();

	return html`
		<div className="wp-gantt-grid-overlay">
			${ scale === 'day_hours' ? hoursList.map( h => html`
				<div 
					key=${ `grid_h_${ h.hour }` }
					style=${{ 
						width: `${ hourCellWidth }px`, 
						minWidth: `${ hourCellWidth }px`, 
						borderLeft: '1px solid #f1f5f9',
						backgroundColor: h.isWorkHour ? 'transparent' : 'rgba(241, 245, 249, 0.4)'
					}}
				></div>
			` ) : null }

			${ scale === 'days' ? dayUnits.map( du => html`
				<div 
					key=${ `grid_d_${ du.index }` }
					style=${{ 
						width: `${ cellWidth }px`, 
						minWidth: `${ cellWidth }px`, 
						borderLeft: '1px solid #f1f5f9',
						backgroundColor: du.isWeekend ? 'rgba(226, 232, 240, 0.35)' : 'transparent'
					}}
				></div>
			` ) : null }

			${ scale === 'weeks' ? weekUnits.map( wu => html`
				<div 
					key=${ `grid_w_${ wu.index }` }
					style=${{ 
						width: '180px', 
						minWidth: '180px', 
						borderLeft: '1px solid #f1f5f9' 
					}}
				></div>
			` ) : null }

			${ scale === 'months' ? monthsList.map( ml => html`
				<div 
					key=${ `grid_m_${ ml.index }` }
					style=${{ 
						width: '220px', 
						minWidth: '220px', 
						borderLeft: '1px solid #f1f5f9' 
					}}
				></div>
			` ) : null }

			<!-- Live Current Day Needle (in days scale) -->
			${ scale === 'days' && todayPixelRight !== null && html`
				<div 
					className="wp-gantt-needle-today"
					style=${{ [rtl ? 'right' : 'left']: `${ todayPixelRight }px` }}
				>
					<span className="wp-gantt-needle-today-flag">${ __( 'TODAY', 'workpress' ) }</span>
				</div>
			` }

			<!-- Live Current Time Needle (in 24h day_hours view) -->
			${ scale === 'day_hours' && currentHourPixelRight !== null && html`
				<div 
					className="wp-gantt-needle-now"
					style=${{ [rtl ? 'right' : 'left']: `${ currentHourPixelRight }px` }}
				>
					<span className="wp-gantt-needle-now-flag">${ __( 'NOW', 'workpress' ) }</span>
				</div>
			` }
		</div>
	`;
}
