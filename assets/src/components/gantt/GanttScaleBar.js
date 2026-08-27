import { html } from '../../utils/html.js';
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
						<option value="">جميع المشاريع (${ projects.length })</option>
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
						<option value="">جميع الحالات</option>
						<option value="in_progress">قيد التنفيذ والمراجعة</option>
						<option value="open">مفتوحة ومسندة</option>
						<option value="completed">مكتملة ومعتمدة</option>
					</select>
				</div>

				<div style=${{ position: 'relative' }}>
					<input 
						type="text" 
						className="input is-small" 
						placeholder="بحث في أسماء المهام والمكلفين..." 
						value=${ searchQuery }
						onInput=${ ( e ) => setSearchQuery( e.target.value ) }
						style=${{ borderRadius: 0, border: '1px solid #cbd5e1', paddingRight: '26px', width: '220px' }}
					/>
					<i className="dashicons dashicons-search" style=${{ position: 'absolute', right: '6px', top: '6px', color: '#94a3b8', fontSize: '15px' }}></i>
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
							onClick=${ handleNextDay }
							title="اليوم السابق (يمين)"
							style=${{ height: '26px', border: 'none' }}
						>
							<i className="dashicons dashicons-arrow-right-alt2" style=${{ fontSize: '18px' }}></i>
						</button>

						<span style=${{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', padding: '0 4px' }}>
							${ selectedDayOfWeek } (${ formatDate( selectedDay, { short: true } ) })
						</span>

						<button 
							type="button" 
							className="button is-small is-white p-1" 
							onClick=${ handlePrevDay }
							title="اليوم التالي (يسار)"
							style=${{ height: '26px', border: 'none' }}
						>
							<i className="dashicons dashicons-arrow-left-alt2" style=${{ fontSize: '18px' }}></i>
						</button>

						<button 
							type="button" 
							className="button is-small is-light" 
							onClick=${ handleTodayDay }
							style=${{ height: '24px', borderRadius: 0, fontSize: '11px', fontWeight: '800' }}
						>
							اليوم
						</button>
					</div>
				` : html`
					<button 
						type="button" 
						className="button is-small is-danger is-light" 
						onClick=${ handleJumpToToday }
						style=${{ borderRadius: 0, border: '1px solid #fca5a5', fontWeight: '800', color: '#dc2626' }}
						title="التركيز والتمرير الفوري لتاريخ اليوم"
					>
						<i className="dashicons dashicons-location" style=${{ marginLeft: '4px' }}></i>
						<span>اليوم (${ formatDate( today, { short: true } ) })</span>
					</button>
				` }

				<!-- High-Density Scale Filter Switcher -->
				<div className="wp-btn-group-tight mb-0">
					<button 
						type="button" 
						className=${ `button ${ scale === 'day_hours' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'day_hours' ) }
						title="عرض مفصل لـ 24 ساعة لليوم المحدد"
					>
						24س
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'days' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'days' ) }
						title="عرض الأيام بأسمائها الكاملة"
					>
						أيام
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'weeks' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'weeks' ) }
						title="عرض مقسم بالأسابيع"
					>
						أسابيع
					</button>
					<button 
						type="button" 
						className=${ `button ${ scale === 'months' ? 'is-active' : '' }` }
						onClick=${ () => setScale( 'months' ) }
						title="عرض سنوي مقسم بالشهور"
					>
						شهور
					</button>
				</div>
			</div>
		</div>
	`;
}
