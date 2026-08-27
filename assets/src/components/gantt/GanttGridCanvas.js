import { html } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Timeline Header & Background Grid Canvas Component
 */
export default function GanttGridCanvas({
	scale = 'days',
	selectedDay = new Date(),
	selectedDayOfWeek = '',
	hoursList = [],
	hourCellWidth = 72,
	monthHeaders = [],
	dayUnits = [],
	weekUnits = [],
	monthsList = [],
	cellWidth = 130,
	todayPixelRight = null,
	currentHourPixelRight = null,
	now = new Date()
}) {
	return html`
		<div>
			<!-- Timeline Header (Height 58px) -->
			<div className="wp-gantt-sticky-header">
				<!-- ================= SCALE: DAY_HOURS (24 Hours) ================= -->
				${ scale === 'day_hours' ? html`
					<!-- Top Row: Full Day Title Banner -->
					<div style=${{ height: '28px', display: 'flex', alignItems: 'center', padding: '0 0.75rem', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', fontWeight: '800', fontSize: '0.78rem', color: '#0f172a' }}>
						<span>الجدول الزمني ليوم ${ selectedDayOfWeek } (${ formatDate( selectedDay ) }) — تقسيم 24 ساعة</span>
					</div>

					<!-- Bottom Row: 24 Hours Columns -->
					<div style=${{ height: '30px', display: 'flex' }}>
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
									color: h.isWorkHour ? '#0f172a' : '#64748b',
									backgroundColor: h.isWorkHour ? 'transparent' : '#f1f5f9',
									borderLeft: '1px solid #e2e8f0'
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
					<div style=${{ height: '28px', display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
						${ monthHeaders.map( m => html`
							<div 
								key=${ m.key }
								style=${{ 
									width: `${ m.span * cellWidth }px`, 
									minWidth: `${ m.span * cellWidth }px`, 
									padding: '0 0.75rem', 
									display: 'flex', 
									alignItems: 'center', 
									fontWeight: '800', 
									fontSize: '0.78rem', 
									color: '#0f172a',
									borderLeft: '1px solid #e2e8f0',
									backgroundColor: '#f1f5f9'
								}}
							>
								${ m.title }
							</div>
						` ) }
					</div>

					<!-- Bottom Row: Full Arabic Day Name + Number -->
					<div style=${{ height: '30px', display: 'flex' }}>
						${ dayUnits.map( du => html`
							<div 
								key=${ du.index }
								style=${{ 
									width: `${ cellWidth }px`, 
									minWidth: `${ cellWidth }px`, 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center', 
									fontSize: '0.72rem', 
									fontWeight: du.isToday ? '900' : '700', 
									color: du.isToday ? '#dc2626' : ( du.isWeekend ? '#64748b' : '#0f172a' ),
									backgroundColor: du.isToday ? '#fee2e2' : ( du.isWeekend ? '#f1f5f9' : 'transparent' ),
									borderLeft: '1px solid #e2e8f0',
									gap: '4px'
								}}
								title=${ `${ du.fullDayName } ${ du.dayNum } ${ du.monthName } ${ du.year }` }
							>
								<span style=${{ fontWeight: '800' }}>${ du.fullDayName }</span>
								<span style=${{ fontWeight: '900', opacity: 0.9 }}>${ du.dayNum }</span>
							</div>
						` ) }
					</div>
				` : null }

				<!-- ================= SCALE: WEEKS ================= -->
				${ scale === 'weeks' ? html`
					<div style=${{ height: '28px', display: 'flex', borderBottom: '1px solid #e2e8f0' }}>
						${ monthHeaders.map( m => html`
							<div 
								key=${ m.key }
								style=${{ 
									width: `${ m.span * 180 }px`, 
									minWidth: `${ m.span * 180 }px`, 
									padding: '0 0.75rem', 
									display: 'flex', 
									alignItems: 'center', 
									fontWeight: '800', 
									fontSize: '0.78rem', 
									color: '#0f172a',
									borderLeft: '1px solid #e2e8f0',
									backgroundColor: '#f1f5f9'
								}}
							>
								${ m.title }
							</div>
						` ) }
					</div>

					<div style=${{ height: '30px', display: 'flex' }}>
						${ weekUnits.map( wu => html`
							<div 
								key=${ wu.index }
								style=${{ 
									width: '180px', 
									minWidth: '180px', 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center', 
									fontSize: '0.72rem', 
									fontWeight: '700', 
									color: '#0f172a',
									borderLeft: '1px solid #e2e8f0',
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
					<div style=${{ height: '58px', display: 'flex' }}>
						${ monthsList.map( ml => html`
							<div 
								key=${ ml.index }
								style=${{ 
									width: '220px', 
									minWidth: '220px', 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center', 
									borderLeft: '1px solid #e2e8f0',
									backgroundColor: '#f1f5f9',
									fontSize: '0.85rem',
									fontWeight: '900',
									color: '#0f172a'
								}}
							>
								<span>${ ml.title }</span>
							</div>
						` ) }
					</div>
				` : null }
			</div>

			<!-- Background Grid Overlay -->
			<div className="wp-gantt-grid-overlay">
				${ scale === 'day_hours' ? hoursList.map( h => html`
					<div 
						key=${ `grid_h_${ h.hour }` }
						style=${{ 
							width: `${ hourCellWidth }px`, 
							minWidth: `${ hourCellWidth }px`, 
							height: '100%', 
							borderLeft: '1px solid #f1f5f9',
							backgroundColor: h.isWorkHour ? 'transparent' : 'rgba(241, 245, 249, 0.4)'
						}}
					></div>
				` ) : ( scale === 'days' ? dayUnits.map( du => html`
					<div 
						key=${ `grid_${ du.index }` }
						style=${{ 
							width: `${ cellWidth }px`, 
							minWidth: `${ cellWidth }px`, 
							height: '100%', 
							borderLeft: '1px solid #f1f5f9',
							backgroundColor: du.isWeekend ? 'rgba(226, 232, 240, 0.35)' : 'transparent'
						}}
					></div>
				` ) : ( scale === 'weeks' ? weekUnits.map( wu => html`
					<div 
						key=${ `grid_w_${ wu.index }` }
						style=${{ 
							width: '180px', 
							minWidth: '180px', 
							height: '100%', 
							borderLeft: '1px solid #f1f5f9'
						}}
					></div>
				` ) : monthsList.map( ml => html`
					<div 
						key=${ `grid_m_${ ml.index }` }
						style=${{ 
							width: '220px', 
							minWidth: '220px', 
							height: '100%', 
							borderLeft: '1px solid #f1f5f9'
						}}
					></div>
				` ) ) ) }

				<!-- Today Red Vertical Line Indicator (in Days view) -->
				${ ( scale === 'days' && todayPixelRight !== null ) ? html`
					<div 
						className="wp-gantt-needle-today"
						style=${{ right: `${ todayPixelRight }px` }}
					>
						<div className="wp-gantt-needle-today-flag">
							اليوم
						</div>
					</div>
				` : null }

				<!-- Live Current Time Needle (in 24h day_hours view) -->
				${ ( scale === 'day_hours' && currentHourPixelRight !== null ) ? html`
					<div 
						className="wp-gantt-needle-now"
						style=${{ right: `${ currentHourPixelRight }px` }}
					>
						<div className="wp-gantt-needle-now-flag">
							الآن (${ String( now.getHours() ).padStart( 2, '0' ) }:${ String( now.getMinutes() ).padStart( 2, '0' ) })
						</div>
					</div>
				` : null }
			</div>
		</div>
	`;
}
