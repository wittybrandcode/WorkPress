import { html, useState, useEffect, useRef } from '../utils/html.js';
import AvatarStack from './AvatarStack.js';
import DatePicker from './DatePicker.js';
import { getMonthName, DAY_NAMES, formatDate, parseDate, formatNumber, formatPercent } from '../utils/datetime.js';
import { tasksApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

/**
 * WorkPress Detailed Master Gantt & Timeline Engine (World-Class Institutional Standard)
 *
 * Fully compliant with WorkPress Constitution:
 * - 0px sharp geometry, zero emojis
 * - React 18 style compliance
 * - Professional non-intrusive tooltips with smart viewport positioning
 * - High-contrast, elegant white-card reschedule popover with projected dates
 */
export default function GanttChart( { 
	tasks = [], 
	projects = [], 
	onTaskClick,
	onTaskUpdated,
	defaultScale = 'days' 
} ) {
	const [ scale, setScale ] = useState( defaultScale ); // 'day_hours' | 'days' | 'weeks' | 'months'
	const [ selectedDay, setSelectedDay ] = useState( new Date() );
	const [ collapsedProjects, setCollapsedProjects ] = useState( {} );
	const [ hoveredTaskId, setHoveredTaskId ] = useState( null );
	const [ tooltipTargetRect, setTooltipTargetRect ] = useState( null );
	const [ selectedProjectFilter, setSelectedProjectFilter ] = useState( '' );
	const [ selectedStatusFilter, setSelectedStatusFilter ] = useState( '' );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	
	// Single Reschedule Menu Popover State
	const [ rescheduleTaskId, setRescheduleTaskId ] = useState( null );
	const [ rescheduleMenuPos, setRescheduleMenuPos ] = useState( { x: 0, y: 0 } );
	const [ customDueDate, setCustomDueDate ] = useState( '' );
	const [ customDueTime, setCustomDueTime ] = useState( '18:00' );

	const timelineContainerRef = useRef( null );
	const isMouseDownRef = useRef( false );
	const startXRef = useRef( 0 );
	const scrollLeftRef = useRef( 0 );

	// Filter tasks based on controls
	const filteredTasks = tasks.filter( task => {
		if ( selectedProjectFilter && String( task.project_id ) !== String( selectedProjectFilter ) ) {
			return false;
		}
		if ( selectedStatusFilter ) {
			if ( selectedStatusFilter === 'completed' && ! [ 'completed', 'closed' ].includes( task.status ) ) return false;
			if ( selectedStatusFilter === 'in_progress' && ! [ 'in_progress', 'in_review' ].includes( task.status ) ) return false;
			if ( selectedStatusFilter === 'open' && ! [ 'open', 'assigned' ].includes( task.status ) ) return false;
		}
		if ( searchQuery ) {
			const q = searchQuery.toLowerCase();
			const matchTitle = ( task.title || '' ).toLowerCase().includes( q );
			const matchAuthor = ( task.author_name || '' ).toLowerCase().includes( q );
			const matchRef = ( task.ref_key || '' ).toLowerCase().includes( q );
			if ( ! matchTitle && ! matchAuthor && ! matchRef ) return false;
		}
		return true;
	} );

	// Group filtered tasks by project
	const projectGroups = {};
	filteredTasks.forEach( task => {
		const pId = task.project_id || 0;
		const pName = task.project_name || 'مهام عامة بدون مشروع';
		if ( ! projectGroups[ pId ] ) {
			projectGroups[ pId ] = {
				id: pId,
				name: pName,
				tasks: [],
			};
		}
		projectGroups[ pId ].tasks.push( task );
	} );

	if ( ! searchQuery && ! selectedStatusFilter && ! selectedProjectFilter ) {
		projects.forEach( p => {
			if ( ! projectGroups[ p.id ] ) {
				projectGroups[ p.id ] = {
					id: p.id,
					name: p.name,
					tasks: [],
				};
			}
		} );
	}

	const today = new Date();
	today.setHours( 0, 0, 0, 0 );

	const toggleProjectCollapse = ( projectId ) => {
		setCollapsedProjects( prev => ( {
			...prev,
			[ projectId ]: ! prev[ projectId ],
		} ) );
		sound.play( 'click' );
	};

	const collapseAllProjects = () => {
		const newCollapsed = {};
		Object.values( projectGroups ).forEach( g => {
			newCollapsed[ g.id ] = true;
		} );
		setCollapsedProjects( newCollapsed );
		sound.play( 'click' );
	};

	const expandAllProjects = () => {
		setCollapsedProjects( {} );
		sound.play( 'click' );
	};

	// Navigation for Day View ('day_hours')
	const handlePrevDay = () => {
		const next = new Date( selectedDay );
		next.setDate( next.getDate() - 1 );
		setSelectedDay( next );
		sound.play( 'click' );
	};

	const handleNextDay = () => {
		const next = new Date( selectedDay );
		next.setDate( next.getDate() + 1 );
		setSelectedDay( next );
		sound.play( 'click' );
	};

	const handleTodayDay = () => {
		setSelectedDay( new Date() );
		sound.play( 'click' );
	};

	// -------------------------------------------------------------
	// 1. Calculations for 'day_hours' scale (24 Hours for Selected Day)
	// -------------------------------------------------------------
	const hourCellWidth = 72;
	const totalDayHoursWidth = 24 * hourCellWidth;
	const hoursList = [];
	for ( let h = 0; h < 24; h++ ) {
		const label = `${ String( h ).padStart( 2, '0' ) }:00`;
		hoursList.push( {
			hour: h,
			label,
			isWorkHour: h >= 8 && h <= 18,
		} );
	}

	// -------------------------------------------------------------
	// 2. Calculations for 'days', 'weeks', 'months' scales
	// -------------------------------------------------------------
	let minDate = new Date( today );
	minDate.setDate( minDate.getDate() - 7 );

	let maxDate = new Date( today );
	maxDate.setDate( maxDate.getDate() + 28 );

	filteredTasks.forEach( task => {
		if ( task.created_at ) {
			const cDate = parseDate( task.created_at );
			if ( cDate && cDate < minDate ) {
				minDate = new Date( cDate );
				minDate.setDate( minDate.getDate() - 3 );
			}
		}
		if ( task.due_at ) {
			const dDate = parseDate( task.due_at );
			if ( dDate && dDate > maxDate ) {
				maxDate = new Date( dDate );
				maxDate.setDate( maxDate.getDate() + 7 );
			}
		}
	} );

	minDate.setHours( 0, 0, 0, 0 );
	maxDate.setHours( 0, 0, 0, 0 );

	const totalDays = Math.max( 20, Math.ceil( ( maxDate - minDate ) / ( 1000 * 60 * 60 * 24 ) ) + 1 );

	// Days Units with FULL Arabic Day Names
	const dayUnits = [];
	for ( let i = 0; i < totalDays; i++ ) {
		const d = new Date( minDate );
		d.setDate( d.getDate() + i );
		const isToday = d.getTime() === today.getTime();
		const dayOfWeek = d.getDay();
		const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday & Saturday
		const fullDayName = DAY_NAMES[ dayOfWeek ] || '';

		dayUnits.push( {
			date: d,
			dateStr: d.toISOString().substring( 0, 10 ),
			dayNum: d.getDate(),
			monthIndex: d.getMonth(),
			monthName: getMonthName( d.getMonth() ),
			year: d.getFullYear(),
			fullDayName,
			isToday,
			isWeekend,
			index: i,
		} );
	}

	// Month header spans
	const monthHeaders = [];
	let currentMonth = null;
	dayUnits.forEach( ( du, idx ) => {
		const key = `${ du.year }-${ du.monthIndex }`;
		if ( ! currentMonth || currentMonth.key !== key ) {
			if ( currentMonth ) {
				monthHeaders.push( currentMonth );
			}
			currentMonth = {
				key,
				title: `${ du.monthName } ${ du.year }`,
				startIndex: idx,
				span: 1,
			};
		} else {
			currentMonth.span++;
		}
	} );
	if ( currentMonth ) {
		monthHeaders.push( currentMonth );
	}

	// Weeks list (for 'weeks' scale)
	const totalWeeks = Math.ceil( totalDays / 7 );
	const weekUnits = [];
	for ( let w = 0; w < totalWeeks; w++ ) {
		const wStart = new Date( minDate );
		wStart.setDate( wStart.getDate() + ( w * 7 ) );
		const wEnd = new Date( wStart );
		wEnd.setDate( wEnd.getDate() + 6 );
		weekUnits.push( {
			index: w,
			title: `أسبوع ${ w + 1 }`,
			dateRange: `${ formatDate( wStart, { short: true } ) } - ${ formatDate( wEnd, { short: true } ) }`,
		} );
	}

	// Months list (for 'months' scale)
	const monthsList = [];
	monthHeaders.forEach( ( mh, idx ) => {
		monthsList.push( {
			index: idx,
			title: mh.title,
			span: mh.span,
		} );
	} );

	// Cell Width & Total Width Calculation
	let cellWidth = 130; // Generous default for full day names
	let totalTimelineWidth = totalDays * cellWidth;

	if ( scale === 'day_hours' ) {
		cellWidth = hourCellWidth;
		totalTimelineWidth = totalDayHoursWidth;
	} else if ( scale === 'weeks' ) {
		cellWidth = 180;
		totalTimelineWidth = totalWeeks * cellWidth;
	} else if ( scale === 'months' ) {
		cellWidth = 220;
		totalTimelineWidth = monthsList.length * cellWidth;
	}

	// Today's offset from the right
	const todayIndex = dayUnits.findIndex( d => d.isToday );
	const todayPixelRight = ( scale === 'days' && todayIndex >= 0 )
		? ( todayIndex * cellWidth ) + ( cellWidth / 2 )
		: null;

	// Current Hour offset in 'day_hours' scale (Live Time Needle)
	const now = new Date();
	const isTodaySelected = selectedDay.toDateString() === now.toDateString();
	const currentHourDecimal = now.getHours() + ( now.getMinutes() / 60 );
	const currentHourPixelRight = ( scale === 'day_hours' && isTodaySelected )
		? ( currentHourDecimal * hourCellWidth )
		: null;

	const handleJumpToToday = () => {
		if ( timelineContainerRef.current ) {
			const container = timelineContainerRef.current;
			const maxScroll = container.scrollWidth - container.clientWidth;
			const pivot = scale === 'day_hours' ? currentHourPixelRight : todayPixelRight;
			if ( pivot !== null && pivot !== undefined ) {
				const target = Math.max( 0, Math.min( maxScroll, pivot - ( container.clientWidth / 2 ) ) );
				container.scrollTo( { left: target, behavior: 'smooth' } );
				sound.play( 'click' );
			}
		}
	};

	useEffect( () => {
		handleJumpToToday();
	}, [ scale, filteredTasks.length ] );

	// Mouse drag-to-scroll
	const handleMouseDown = ( e ) => {
		if ( rescheduleTaskId ) return; // Don't drag while popover is open
		if ( ! timelineContainerRef.current ) return;
		isMouseDownRef.current = true;
		startXRef.current = e.pageX - timelineContainerRef.current.offsetLeft;
		scrollLeftRef.current = timelineContainerRef.current.scrollLeft;
	};

	const handleMouseLeaveOrUp = () => {
		isMouseDownRef.current = false;
	};

	const handleMouseMove = ( e ) => {
		if ( ! isMouseDownRef.current || ! timelineContainerRef.current ) return;
		e.preventDefault();
		const x = e.pageX - timelineContainerRef.current.offsetLeft;
		const walk = ( x - startXRef.current ) * 1.5;
		timelineContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
	};

	// Metric calculations for task bar in each scale
	const getBarMetrics = ( task ) => {
		const createdDate = task.created_at ? parseDate( task.created_at ) : new Date( today );
		createdDate.setHours( 0, 0, 0, 0 );

		let dueDate = task.due_at ? parseDate( task.due_at ) : new Date( createdDate );
		if ( ! dueDate || isNaN( dueDate.getTime() ) || dueDate < createdDate ) {
			dueDate = new Date( createdDate );
			dueDate.setDate( dueDate.getDate() + 3 );
		}
		dueDate.setHours( 0, 0, 0, 0 );

		const durationDays = Math.max( 1, Math.ceil( ( dueDate - createdDate ) / ( 1000 * 60 * 60 * 24 ) ) + 1 );

		if ( scale === 'day_hours' ) {
			const selDateZero = new Date( selectedDay );
			selDateZero.setHours( 0, 0, 0, 0 );
			const isTaskActiveThisDay = ( createdDate <= selDateZero && dueDate >= selDateZero );

			const startHour = 9;
			const endHour = 17;
			const rightOffset = startHour * hourCellWidth;
			const width = Math.max( 80, ( endHour - startHour ) * hourCellWidth - 8 );

			return { rightOffset, width, createdDate, dueDate, durationDays, isVisible: isTaskActiveThisDay };
		}

		if ( scale === 'weeks' ) {
			const startDiffWeeks = Math.max( 0, ( createdDate - minDate ) / ( 1000 * 60 * 60 * 24 * 7 ) );
			const durationWeeks = Math.max( 0.4, ( dueDate - createdDate ) / ( 1000 * 60 * 60 * 24 * 7 ) );
			const rightOffset = startDiffWeeks * 180;
			const width = Math.max( 60, ( durationWeeks * 180 ) - 8 );
			return { rightOffset, width, createdDate, dueDate, durationDays, isVisible: true };
		}

		if ( scale === 'months' ) {
			const startDiffMonths = Math.max( 0, ( createdDate.getFullYear() - minDate.getFullYear() ) * 12 + ( createdDate.getMonth() - minDate.getMonth() ) );
			const durationMonths = Math.max( 0.5, ( ( dueDate.getFullYear() - createdDate.getFullYear() ) * 12 + ( dueDate.getMonth() - createdDate.getMonth() ) ) + 0.5 );
			const rightOffset = startDiffMonths * 220;
			const width = Math.max( 80, ( durationMonths * 220 ) - 10 );
			return { rightOffset, width, createdDate, dueDate, durationDays, isVisible: true };
		}

		// Standard 'days' scale (cellWidth = 130px)
		const startDiffDays = Math.max( 0, Math.floor( ( createdDate - minDate ) / ( 1000 * 60 * 60 * 24 ) ) );
		const rightOffset = startDiffDays * cellWidth;
		const width = Math.max( 60, ( durationDays * cellWidth ) - 10 );

		return { rightOffset, width, createdDate, dueDate, durationDays, isVisible: true };
	};

	// Execute Reschedule with Date and Time
	const handleExecuteReschedule = async ( taskId, daysToAdd, directDateStr = null, directTimeStr = null ) => {
		const task = tasks.find( t => t.id === taskId );
		if ( ! task ) return;

		let newDueStr = directDateStr;
		if ( ! newDueStr ) {
			const currentDue = task.due_at ? parseDate( task.due_at ) : new Date();
			const newDate = new Date( currentDue );
			newDate.setDate( newDate.getDate() + daysToAdd );
			newDueStr = newDate.toISOString().substring( 0, 10 );
		}

		const timePart = directTimeStr || customDueTime || '18:00';
		const fullDateTimeStr = `${ newDueStr } ${ timePart }:00`;

		try {
			await tasksApi.update( taskId, { due_at: fullDateTimeStr } );
			toast( `تم تعديل موعد المهمة وتوقيتها إلى: ${ formatDate( parseDate( newDueStr ) ) } في تمام ${ timePart }`, 'success' );
			sound.play( 'button' );
			setRescheduleTaskId( null );
			setCustomDueDate( '' );
			if ( onTaskUpdated ) onTaskUpdated();
		} catch ( err ) {
			toast( err.message || 'تعذر تعديل الموعد', 'error' );
		}
	};

	// Compute projected date for reschedule options
	const getProjectedDateLabel = ( task, daysToAdd ) => {
		if ( ! task ) return '';
		const currentDue = task.due_at ? parseDate( task.due_at ) : new Date();
		const target = new Date( currentDue );
		target.setDate( target.getDate() + daysToAdd );
		return formatDate( target, { short: true } );
	};

	// Bar Colors
	const getBarStyles = ( task ) => {
		const isCompleted = [ 'completed', 'closed' ].includes( task.status );
		const isInProgress = [ 'in_progress', 'in_review' ].includes( task.status );

		if ( isCompleted ) {
			return {
				bg: '#10b981',
				border: '#059669',
				text: '#ffffff',
				progressBg: '#047857',
				statusLabel: 'مكتملة'
			};
		}
		if ( isInProgress ) {
			return {
				bg: '#f59e0b',
				border: '#d97706',
				text: '#ffffff',
				progressBg: '#b45309',
				statusLabel: 'قيد الإنجاز'
			};
		}
		return {
			bg: '#3b82f6',
			border: '#2563eb',
			text: '#ffffff',
			progressBg: '#1d4ed8',
			statusLabel: 'مفتوحة'
		};
	};

	const selectedDayOfWeek = DAY_NAMES[ selectedDay.getDay() ] || '';
	const activeRescheduleTask = rescheduleTaskId ? tasks.find( t => t.id === rescheduleTaskId ) : null;

	return html`
		<div dir="rtl" className="workpress-gantt-root" style=${{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', minHeight: '640px' }}>
			
			<!-- Controls Header Bar -->
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', flexWrap: 'wrap', gap: '0.75rem' }}>
				
				<!-- Left Filters: Project & Status & Search -->
				<div style=${{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
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
				<div style=${{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
					
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

			<!-- Main Gantt Split Layout (Right Tree Table: 380px | Left Scrollable Canvas) -->
			<div style=${{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
				
				<!-- Right Master Table (380px) -->
				<div style=${{ width: '380px', minWidth: '380px', borderLeft: '2px solid #cbd5e1', backgroundColor: '#ffffff', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
					
					<!-- Table Header (Height 58px) -->
					<div style=${{ height: '58px', padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', fontWeight: '800', fontSize: '0.82rem', color: '#0f172a' }}>
						<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<span>المشروع والمهمة</span>
							<div className="wp-btn-group-tight" style=${{ height: '22px' }}>
								<button 
									type="button" 
									className="button is-small" 
									onClick=${ expandAllProjects }
									title="توسيع كافة شجرة المشاريع"
									style=${{ height: '22px', fontSize: '10px', padding: '0 5px', fontWeight: '800' }}
								>
									توسيع
								</button>
								<button 
									type="button" 
									className="button is-small" 
									onClick=${ collapseAllProjects }
									title="طي كافة شجرة المشاريع"
									style=${{ height: '22px', fontSize: '10px', padding: '0 5px', fontWeight: '800' }}
								>
									طي
								</button>
							</div>
						</div>
						<span style=${{ fontSize: '0.72rem', color: '#64748b' }}>المدة والإسناد</span>
					</div>

					<!-- Table Rows List -->
					<div style=${{ display: 'flex', flexDirection: 'column' }}>
						${ Object.values( projectGroups ).map( group => {
							const isCollapsed = !!collapsedProjects[ group.id ];
							const groupTasksCount = group.tasks.length;
							const completedGroupTasks = group.tasks.filter( t => [ 'completed', 'closed' ].includes( t.status ) ).length;
							const groupProgress = groupTasksCount > 0 ? Math.round( ( completedGroupTasks / groupTasksCount ) * 100 ) : 0;

							return html`
								<div key=${ `p_${ group.id }` } style=${{ display: 'flex', flexDirection: 'column' }}>
									
									<!-- Project Header Row (Height 34px) -->
									<div 
										style=${{ height: '34px', padding: '0 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}
										onClick=${ () => toggleProjectCollapse( group.id ) }
									>
										<div style=${{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
											<i className=${ `dashicons ${ isCollapsed ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-down-alt2' }` } style=${{ fontSize: '14px', color: '#64748b' }}></i>
											<span style=${{ fontWeight: '800', fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
												${ group.name }
											</span>
											<span className="wp-dense-chip" style=${{ height: '18px', padding: '0 4px', fontSize: '0.65rem' }}>
												${ groupTasksCount }
											</span>
										</div>

										<div style=${{ fontSize: '0.72rem', fontWeight: '800', color: groupProgress === 100 ? '#10b981' : '#3b82f6' }}>
											${ groupProgress }%
										</div>
									</div>

									<!-- Task Rows under this project (Height 38px) -->
									${ ! isCollapsed ? group.tasks.map( task => {
										const metrics = getBarMetrics( task );
										const isHovered = hoveredTaskId === task.id;
										const isOverdue = [ 'open', 'assigned', 'in_progress' ].includes( task.status ) && metrics.dueDate < today;

										return html`
											<div 
												key=${ `task_row_${ task.id }` }
												style=${{ 
													height: '38px', 
													padding: '0 0.75rem 0 1rem', 
													display: 'flex', 
													alignItems: 'center', 
													justifyContent: 'space-between', 
													borderBottom: '1px solid #f1f5f9', 
													fontSize: '0.8rem', 
													backgroundColor: isHovered ? '#f1f5f9' : '#ffffff', 
													transition: 'background-color 0.15s ease' 
												}}
												onMouseEnter=${ ( e ) => {
													const rect = e.currentTarget.getBoundingClientRect();
													setTooltipTargetRect( { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, isTable: true } );
													setHoveredTaskId( task.id );
												} }
												onMouseLeave=${ () => {
													setHoveredTaskId( null );
													setTooltipTargetRect( null );
												} }
											>
												<div 
													style=${{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0, cursor: 'pointer' }}
													onClick=${ () => onTaskClick && onTaskClick( task.id ) }
													title="انقر لفتح تفاصيل المهمة والمعاينة السريعة"
												>
													<span style=${{ width: '6px', height: '6px', flexShrink: 0, backgroundColor: [ 'completed', 'closed' ].includes( task.status ) ? '#10b981' : ( [ 'in_progress', 'in_review' ].includes( task.status ) ? '#f59e0b' : '#3b82f6' ) }}></span>
													<div style=${{ flex: 1, minWidth: 0 }}>
														<div style=${{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.78rem' }}>
															${ task.title }
														</div>
														<div style=${{ fontSize: '0.67rem', color: isOverdue ? '#dc2626' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
															<span>${ formatDate( metrics.createdDate, { short: true } ) } - ${ formatDate( metrics.dueDate, { short: true } ) }</span>
															<span>(${ metrics.durationDays } يوم)</span>
															${ isOverdue ? html`<span style=${{ fontWeight: '800', color: '#dc2626' }}>[متأخرة]</span>` : null }
														</div>
													</div>
												</div>

												<div style=${{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
													${ task.assignees && task.assignees.length > 0 ? html`
														<${AvatarStack} users=${ task.assignees } max=${ 1 } size=${ 18 } />
													` : html`
														<span style=${{ fontSize: '0.7rem', color: '#94a3b8' }}>-</span>
													` }
												</div>
											</div>
										`;
									} ) : null }
								</div>
							`;
						} ) }
					</div>
				</div>

				<!-- Left Scrollable Timeline Canvas (RTL Flow) -->
				<div 
					ref=${ timelineContainerRef }
					style=${{ flex: 1, overflowX: 'auto', overflowY: 'hidden', position: 'relative', cursor: isMouseDownRef.current ? 'grabbing' : 'default' }}
					onMouseDown=${ handleMouseDown }
					onMouseLeave=${ handleMouseLeaveOrUp }
					onMouseUp=${ handleMouseLeaveOrUp }
					onMouseMove=${ handleMouseMove }
				>
					<div style=${{ width: `${ totalTimelineWidth }px`, minWidth: '100%', position: 'relative' }}>
						
						<!-- Timeline Header (Height 58px) -->
						<div style=${{ height: '58px', display: 'flex', flexDirection: 'column', borderBottom: '2px solid #cbd5e1', backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 5, userSelect: 'none' }}>
							
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
						<div style=${{ position: 'absolute', top: '58px', bottom: 0, right: 0, left: 0, display: 'flex', pointerEvents: 'none', zIndex: 1 }}>
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
									style=${{ 
										position: 'absolute', 
										top: 0, 
										bottom: 0, 
										right: `${ todayPixelRight }px`, 
										width: '2px', 
										backgroundColor: '#ef4444', 
										zIndex: 4,
										boxShadow: '0 0 8px rgba(239, 68, 68, 0.45)'
									}}
								>
									<div style=${{ position: 'absolute', top: '-18px', right: '-14px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: '800', padding: '1px 4px', borderRadius: 0 }}>
										اليوم
									</div>
								</div>
							` : null }

							<!-- Live Current Time Needle (in 24h day_hours view) -->
							${ ( scale === 'day_hours' && currentHourPixelRight !== null ) ? html`
								<div 
									style=${{ 
										position: 'absolute', 
										top: 0, 
										bottom: 0, 
										right: `${ currentHourPixelRight }px`, 
										width: '2px', 
										backgroundColor: '#ef4444', 
										zIndex: 5,
										boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
									}}
								>
									<div style=${{ position: 'absolute', top: '-20px', right: '-18px', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: 0, whiteSpace: 'nowrap' }}>
										الآن (${ String( now.getHours() ).padStart( 2, '0' ) }:${ String( now.getMinutes() ).padStart( 2, '0' ) })
									</div>
								</div>
							` : null }
						</div>

						<!-- Timeline Rows Content (Height 38px matching table) -->
						<div style=${{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
							${ Object.values( projectGroups ).map( group => {
								const isCollapsed = !!collapsedProjects[ group.id ];

								return html`
									<div key=${ `tg_${ group.id }` } style=${{ display: 'flex', flexDirection: 'column' }}>
										
										<!-- Project Row Spacer (Height 34px matching table) -->
										<div style=${{ height: '34px', borderBottom: '1px solid #e2e8f0', backgroundColor: 'rgba(248, 250, 252, 0.65)' }}></div>

										<!-- Task Rows with Rich Gantt Bars (Height 38px matching table) -->
										${ ! isCollapsed ? group.tasks.map( task => {
											const metrics = getBarMetrics( task );
											const styles = getBarStyles( task );
											const isHovered = hoveredTaskId === task.id;
											const progressPct = task.checklists_progress !== undefined ? task.checklists_progress : ( [ 'completed', 'closed' ].includes( task.status ) ? 100 : 0 );

											if ( ! metrics.isVisible ) {
												return html`
													<div key=${ `bar_row_${ task.id }` } style=${{ height: '38px', borderBottom: '1px solid #f1f5f9' }}></div>
												`;
											}

											return html`
												<div 
													key=${ `bar_row_${ task.id }` }
													style=${{ 
														height: '38px', 
														borderBottom: '1px solid #f1f5f9', 
														position: 'relative', 
														display: 'flex', 
														alignItems: 'center',
														backgroundColor: isHovered ? 'rgba(241, 245, 249, 0.5)' : 'transparent'
													}}
												>
													<!-- Unified Task Bar & Action Button Wrapper -->
													<div 
														style=${{ 
															position: 'absolute', 
															right: `${ Math.max( 2, metrics.rightOffset - 28 ) }px`, 
															display: 'flex', 
															alignItems: 'center', 
															gap: '3px',
															zIndex: isHovered ? 10 : 3
														}}
														onMouseEnter=${ ( e ) => {
															const rect = e.currentTarget.getBoundingClientRect();
															setTooltipTargetRect( { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, isBar: true } );
															setHoveredTaskId( task.id );
														} }
														onMouseLeave=${ () => {
															setHoveredTaskId( null );
															setTooltipTargetRect( null );
														} }
													>
														<!-- Single Reschedule Action Trigger Button -->
														<div style=${{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s ease' }}>
															<button 
																type="button" 
																className="wp-icon-btn is-dense is-dark" 
																onClick=${ ( e ) => {
																	e.stopPropagation();
																	const rect = e.currentTarget.getBoundingClientRect();
																	setRescheduleMenuPos( { x: rect.left, y: rect.bottom + 4 } );
																	setRescheduleTaskId( rescheduleTaskId === task.id ? null : task.id );
																	sound.play( 'click' );
																} }
																title="إعادة جدولة وتمديد الموعد بالتقويم التفاعلي"
															>
																<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '13px', color: '#38bdf8' }}></i>
															</button>
														</div>

														<!-- Interactive Gantt Task Bar (24px Height) -->
														<div 
															style=${{ 
																width: `${ metrics.width }px`, 
																height: '24px', 
																backgroundColor: styles.bg, 
																border: `1px solid ${ styles.border }`, 
																borderRadius: 0, 
																cursor: 'pointer', 
																overflow: 'hidden', 
																display: 'flex', 
																alignItems: 'center', 
																justifyContent: 'space-between',
																padding: '0 6px',
																color: styles.text,
																boxShadow: isHovered ? '0 3px 10px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.06)',
																transform: isHovered ? 'translateY(-1px)' : 'none',
																transition: 'all 0.15s ease',
																position: 'relative'
															}}
															onClick=${ () => onTaskClick && onTaskClick( task.id ) }
														>
															<!-- Inner Progress Fill -->
															${ progressPct > 0 ? html`
																<div 
																	style=${{ 
																		position: 'absolute', 
																		right: 0, 
																		top: 0, 
																		bottom: 0, 
																		width: `${ progressPct }%`, 
																		backgroundColor: styles.progressBg, 
																		opacity: 0.45,
																		zIndex: 1
																	}}
																></div>
															` : null }

															<!-- Bar Inner Label -->
															<div style=${{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
																<span style=${{ fontSize: '0.78rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
																	${ task.title }
																</span>
															</div>

															<div style=${{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
																<span style=${{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.9 }}>
																	${ metrics.durationDays }ي
																</span>
															</div>
														</div>
													</div>
												</div>
											`;
										} ) : null }
									</div>
								`;
							} ) }
						</div>
					</div>
				</div>
			</div>

			<!-- Sleek Non-Intrusive Floating Tooltip (Strict Zero-Overlap - Positioned Directly Beside the Task Bar) -->
			${ ( hoveredTaskId && ! rescheduleTaskId && tooltipTargetRect ) ? ( () => {
				const activeTask = tasks.find( t => t.id === hoveredTaskId );
				if ( ! activeTask ) return null;
				const metrics = getBarMetrics( activeTask );
				const styles = getBarStyles( activeTask );

				const tooltipWidth = 350;
				const tooltipHeight = 220;
				const gap = 12;

				let leftPos = 20;
				let topPos = 20;

				if ( tooltipTargetRect.isTable ) {
					// Master table row: Place tooltip strictly to the LEFT of the table
					leftPos = Math.max( 20, tooltipTargetRect.left - tooltipWidth - gap );
					topPos = Math.max( 20, Math.min( window.innerHeight - tooltipHeight - 20, tooltipTargetRect.top - 20 ) );
				} else {
					// Task Bar on Canvas: Place DIRECTLY BESIDE the colored bar on its LEFT side!
					if ( tooltipTargetRect.left >= ( tooltipWidth + gap + 20 ) ) {
						leftPos = tooltipTargetRect.left - tooltipWidth - gap;
					} else {
						// Fallback to right side if on far left edge
						leftPos = Math.min( window.innerWidth - tooltipWidth - 20, tooltipTargetRect.right + gap );
					}

					// Vertically: Align directly with the task bar
					topPos = Math.max( 20, Math.min( window.innerHeight - tooltipHeight - 20, tooltipTargetRect.top - 20 ) );
				}

				return html`
					<div 
						style=${{ 
							position: 'fixed', 
							left: `${ leftPos }px`, 
							top: `${ topPos }px`, 
							width: `${ tooltipWidth }px`, 
							backgroundColor: '#0f172a', 
							color: '#ffffff', 
							padding: '0.85rem 1rem', 
							borderRadius: 0, 
							boxShadow: '0 16px 36px rgba(15,23,42,0.45)', 
							zIndex: 9999, 
							pointerEvents: 'none',
							border: '1px solid #334155',
							fontSize: '0.82rem',
							lineHeight: 1.4
						}}
					>
						<!-- Title & Status Badge (Full Text, No Truncation) -->
						<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.4rem' }}>
							<div style=${{ fontWeight: '900', color: '#ffffff', fontSize: '0.92rem', flex: 1, wordBreak: 'break-word' }}>
								${ activeTask.title }
							</div>
							<span style=${{ fontSize: '0.7rem', fontWeight: '800', color: '#ffffff', backgroundColor: styles.bg, padding: '2px 6px', flexShrink: 0 }}>
								${ styles.statusLabel }
							</span>
						</div>

						<!-- Project Name -->
						<div style=${{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', marginBottom: '0.6rem' }}>
							${ activeTask.project_name || 'بدون مشروع' }
						</div>

						<!-- Dates & Time Grid -->
						<div style=${{ backgroundColor: '#1e293b', padding: '0.5rem 0.6rem', border: '1px solid #334155', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
							<div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
								<span style=${{ color: '#94a3b8' }}>تاريخ البداية:</span>
								<strong style=${{ color: '#ffffff' }}>${ formatDate( metrics.createdDate ) }</strong>
							</div>
							<div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
								<span style=${{ color: '#94a3b8' }}>الموعد المستهدف:</span>
								<strong style=${{ color: '#38bdf8' }}>${ formatDate( metrics.dueDate ) }</strong>
							</div>
							<div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
								<span style=${{ color: '#94a3b8' }}>المدة الزمنية:</span>
								<strong style=${{ color: '#facc15' }}>${ metrics.durationDays } يوم</strong>
							</div>
						</div>

						<!-- Extra Rich Details: Checklists, Logged Hours & Assignees -->
						<div style=${{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem' }}>
							${ activeTask.checklists_count > 0 ? html`
								<div style=${{ display: 'flex', justifyContent: 'space-between', color: '#67e8f9' }}>
									<span>قوائم الفحص:</span>
									<strong>${ activeTask.checklists_completed_count || 0 }/${ activeTask.checklists_count } مكتملة (${ activeTask.checklists_progress || 0 }%)</strong>
								</div>
							` : null }

							${ ( activeTask.estimated_hours > 0 || activeTask.logged_hours > 0 ) ? html`
								<div style=${{ display: 'flex', justifyContent: 'space-between', color: '#a7f3d0' }}>
									<span>ساعات العمل:</span>
									<strong>${ activeTask.logged_hours || 0 }س مسجلة / ${ activeTask.estimated_hours || 0 }س مقدرة</strong>
								</div>
							` : null }

							${ ( activeTask.assignees && activeTask.assignees.length > 0 ) ? html`
								<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#e2e8f0', marginTop: '2px' }}>
									<span>المكلفين:</span>
									<span style=${{ fontWeight: '700' }}>${ activeTask.assignees.map( a => a.name || a.display_name ).join( '، ' ) }</span>
								</div>
							` : null }
						</div>
					</div>
				`;
			} )() : null }

			<!-- Institutional Custom DatePicker & Reschedule Popover -->
			${ activeRescheduleTask ? html`
				<div 
					style=${{ 
						position: 'fixed', 
						left: `${ Math.min( window.innerWidth - 340, Math.max( 20, rescheduleMenuPos.x - 240 ) ) }px`, 
						top: `${ Math.min( window.innerHeight - 440, Math.max( 40, rescheduleMenuPos.y ) ) }px`, 
						zIndex: 99999
					}}
					onClick=${ ( e ) => e.stopPropagation() }
				>
					<${DatePicker}
						initialDate=${ activeRescheduleTask.due_at }
						showTime=${ true }
						onClose=${ () => setRescheduleTaskId( null ) }
						onSelect=${ ( res ) => handleExecuteReschedule( activeRescheduleTask.id, 0, res.dateStr, res.timeStr ) }
					/>
				</div>
			` : null }
		</div>
	`;
}
