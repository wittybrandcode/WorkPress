import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../../utils/html.js';
import DatePicker from '../ui/DatePicker.js';
import GanttScaleBar from './GanttScaleBar.js';
import GanttTableSidebar, { GanttTableHeader } from './GanttTableSidebar.js';
import GanttGridCanvas, { GanttTimelineHeader } from './GanttGridCanvas.js';
import GanttTaskRow from './GanttTaskRow.js';
import GanttTooltip from './GanttTooltip.js';
import { getMonthName, DAY_NAMES, formatDate, parseDate } from '../../utils/datetime.js';
import { tasksApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

/**
 * WorkPress Master Gantt & Timeline Engine (Lean Coordinator)
 *
 * Fully compliant with WorkPress Constitution:
 * - 0px sharp geometry, institutional BEM architecture
 * - Multi-scale support (24h, Days, Weeks, Months)
 * - Decoupled sub-components & lean coordination
 *
 * @package WorkPress
 * @subpackage Components/Gantt
 * @version 2.2.3
 */
export default function GanttChart({ 
	tasks = [], 
	projects = [], 
	onTaskClick,
	onTaskUpdated,
	defaultScale = 'days' 
}) {
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
	const [ customDueTime ] = useState( '18:00' );
	const rtl = isRtl();

	const timelineContainerRef = useRef( null );
	const headerScrollRef = useRef( null );
	const isMouseDownRef = useRef( false );
	const startXRef = useRef( 0 );
	const scrollLeftRef = useRef( 0 );

	const handleTimelineScroll = ( e ) => {
		if ( headerScrollRef.current ) {
			headerScrollRef.current.scrollLeft = e.target.scrollLeft;
		}
	};

	// Dynamically compute sticky top offset below WorkPress sticky header
	useEffect( () => {
		const updateStickyOffset = () => {
			const headerWrapper = document.querySelector( '.workpress-header-wrapper' );
			const wpAdminBar = document.getElementById( 'wpadminbar' );
			const adminBarHeight = wpAdminBar ? wpAdminBar.offsetHeight : 32;
			const headerHeight = headerWrapper ? headerWrapper.offsetHeight : 128;
			const totalOffset = adminBarHeight + headerHeight;
			document.documentElement.style.setProperty( '--wp-gantt-sticky-top', `${ totalOffset }px` );
		};

		updateStickyOffset();
		window.addEventListener( 'resize', updateStickyOffset );
		window.addEventListener( 'scroll', updateStickyOffset, { passive: true } );
		return () => {
			window.removeEventListener( 'resize', updateStickyOffset );
			window.removeEventListener( 'scroll', updateStickyOffset );
		};
	}, [] );

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
		const pName = task.project_name || __( 'General tasks without project', 'workpress' );
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

	const projectGroupKeys = Object.keys( projectGroups );
	const areAllCollapsed = projectGroupKeys.length > 0 && projectGroupKeys.every( id => !!collapsedProjects[ id ] );

	const toggleAllProjects = () => {
		if ( areAllCollapsed ) {
			expandAllProjects();
		} else {
			collapseAllProjects();
		}
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

	// Days Units
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
			title: sprintf( __( 'Week %d', 'workpress' ), w + 1 ),
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
	let cellWidth = 130;
	let totalTimelineWidth = totalDays * cellWidth;

	if ( scale === 'day_hours' ) {
		cellWidth = hourCellWidth;
		totalDayHoursWidth;
	} else if ( scale === 'weeks' ) {
		cellWidth = 180;
		totalTimelineWidth = totalWeeks * cellWidth;
	} else if ( scale === 'months' ) {
		cellWidth = 220;
		totalTimelineWidth = monthsList.length * cellWidth;
	}

	// Today's offset from the origin
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
				if ( headerScrollRef.current ) {
					headerScrollRef.current.scrollTo( { left: target, behavior: 'smooth' } );
				}
				sound.play( 'click' );
			}
		}
	};

	useEffect( () => {
		handleJumpToToday();
	}, [ scale, filteredTasks.length ] );

	// Mouse drag-to-scroll
	const handleMouseDown = ( e ) => {
		if ( rescheduleTaskId ) return;
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
		if ( headerScrollRef.current ) {
			headerScrollRef.current.scrollLeft = timelineContainerRef.current.scrollLeft;
		}
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
			toast( sprintf( __( 'Task rescheduled to: %s at %s', 'workpress' ), formatDate( parseDate( newDueStr ) ), timePart ), 'success' );
			sound.play( 'button' );
			setRescheduleTaskId( null );
			if ( onTaskUpdated ) onTaskUpdated();
		} catch ( err ) {
			toast( err.message || __( 'Failed to reschedule task', 'workpress' ), 'error' );
		}
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
				statusLabel: __( 'Completed', 'workpress' )
			};
		}
		if ( isInProgress ) {
			return {
				bg: '#f59e0b',
				border: '#d97706',
				text: '#ffffff',
				progressBg: '#b45309',
				statusLabel: __( 'In Progress', 'workpress' )
			};
		}
		return {
			bg: '#3b82f6',
			border: '#2563eb',
			text: '#ffffff',
			progressBg: '#1d4ed8',
			statusLabel: __( 'Open', 'workpress' )
		};
	};

	const selectedDayOfWeek = DAY_NAMES[ selectedDay.getDay() ] || '';
	const activeRescheduleTask = rescheduleTaskId ? tasks.find( t => t.id === rescheduleTaskId ) : null;

	return html`
		<div dir=${ rtl ? 'rtl' : 'ltr' } className="wp-gantt-root">
			<!-- Controls Header Bar -->
			<${GanttScaleBar}
				projects=${projects}
				selectedProjectFilter=${selectedProjectFilter}
				setSelectedProjectFilter=${setSelectedProjectFilter}
				selectedStatusFilter=${selectedStatusFilter}
				setSelectedStatusFilter=${setSelectedStatusFilter}
				searchQuery=${searchQuery}
				setSearchQuery=${setSearchQuery}
				scale=${scale}
				setScale=${setScale}
				selectedDay=${selectedDay}
				selectedDayOfWeek=${selectedDayOfWeek}
				handleNextDay=${handleNextDay}
				handlePrevDay=${handlePrevDay}
				handleTodayDay=${handleTodayDay}
				handleJumpToToday=${handleJumpToToday}
				today=${today}
			/>

			<!-- Sticky Gantt Header Row (Locks to window scroll under FilterBar!) -->
			<div className="wp-gantt-header-row">
				<!-- Right: Table Header (380px) -->
				<${GanttTableHeader}
					areAllCollapsed=${ areAllCollapsed }
					toggleAllProjects=${ toggleAllProjects }
				/>

				<!-- Left: Date Scale Header (Moves Horizontally with Canvas) -->
				<div 
					ref=${ headerScrollRef }
					className="wp-gantt-header-scroll-container"
				>
					<div style=${{ width: `${ totalTimelineWidth }px`, minWidth: '100%' }}>
						<${GanttTimelineHeader}
							scale=${scale}
							selectedDay=${selectedDay}
							selectedDayOfWeek=${selectedDayOfWeek}
							hoursList=${hoursList}
							hourCellWidth=${hourCellWidth}
							monthHeaders=${monthHeaders}
							dayUnits=${dayUnits}
							weekUnits=${weekUnits}
							monthsList=${monthsList}
							cellWidth=${cellWidth}
						/>
					</div>
				</div>
			</div>

			<!-- Main Gantt Body Rows (Right Table: 380px | Left Scrollable Canvas) -->
			<div className="wp-gantt-split-layout">
				<!-- Master Table Rows (380px) -->
				<${GanttTableSidebar}
					hideHeader=${ true }
					projectGroups=${projectGroups}
					collapsedProjects=${collapsedProjects}
					toggleProjectCollapse=${toggleProjectCollapse}
					getBarMetrics=${getBarMetrics}
					today=${today}
					hoveredTaskId=${hoveredTaskId}
					setHoveredTaskId=${setHoveredTaskId}
					setTooltipTargetRect=${setTooltipTargetRect}
					onTaskClick=${onTaskClick}
				/>

				<!-- Scrollable Timeline Canvas -->
				<div 
					ref=${ timelineContainerRef }
					className="wp-gantt-canvas-container"
					style=${{ cursor: isMouseDownRef.current ? 'grabbing' : 'default' }}
					onScroll=${ handleTimelineScroll }
					onMouseDown=${ handleMouseDown }
					onMouseLeave=${ handleMouseLeaveOrUp }
					onMouseUp=${ handleMouseLeaveOrUp }
					onMouseMove=${ handleMouseMove }
				>
					<div style=${{ width: `${ totalTimelineWidth }px`, minWidth: '100%', position: 'relative' }}>
						<!-- Background Grid Overlay & Live Needles -->
						<${GanttGridCanvas}
							scale=${scale}
							hoursList=${hoursList}
							hourCellWidth=${hourCellWidth}
							dayUnits=${dayUnits}
							weekUnits=${weekUnits}
							monthsList=${monthsList}
							cellWidth=${cellWidth}
							todayPixelRight=${todayPixelRight}
							currentHourPixelRight=${currentHourPixelRight}
						/>

						<!-- Timeline Rows Content (Matching table rows) -->
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

											return html`
												<${GanttTaskRow}
													key=${ `bar_row_${ task.id }` }
													task=${task}
													metrics=${metrics}
													styles=${styles}
													progressPct=${progressPct}
													isHovered=${isHovered}
													setHoveredTaskId=${setHoveredTaskId}
													setTooltipTargetRect=${setTooltipTargetRect}
													rescheduleTaskId=${rescheduleTaskId}
													setRescheduleTaskId=${setRescheduleTaskId}
													setRescheduleMenuPos=${setRescheduleMenuPos}
													onTaskClick=${onTaskClick}
												/>
											`;
										} ) : null }
									</div>
								`;
							} ) }
						</div>
					</div>
				</div>
			</div>

			<!-- Sleek Non-Intrusive Floating Tooltip -->
			<${GanttTooltip}
				hoveredTaskId=${hoveredTaskId}
				rescheduleTaskId=${rescheduleTaskId}
				tooltipTargetRect=${tooltipTargetRect}
				tasks=${tasks}
				getBarMetrics=${getBarMetrics}
				getBarStyles=${getBarStyles}
			/>

			<!-- Institutional Custom DatePicker & Reschedule Popover -->
			${ activeRescheduleTask ? html`
				<div 
					className="wp-gantt-popover-fixed"
					style=${{ 
						left: `${ Math.min( window.innerWidth - 340, Math.max( 20, rescheduleMenuPos.x - 240 ) ) }px`, 
						top: `${ Math.min( window.innerHeight - 440, Math.max( 40, rescheduleMenuPos.y ) ) }px`
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
