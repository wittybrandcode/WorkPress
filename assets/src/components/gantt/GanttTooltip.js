import { html } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Gantt Floating Institutional Tooltip Component
 */
export default function GanttTooltip({
	hoveredTaskId,
	rescheduleTaskId,
	tooltipTargetRect,
	tasks = [],
	getBarMetrics,
	getBarStyles
}) {
	if ( ! hoveredTaskId || rescheduleTaskId || ! tooltipTargetRect ) return null;

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
		// Task Bar on Canvas: Place DIRECTLY BESIDE the colored bar on its LEFT side
		if ( tooltipTargetRect.left >= ( tooltipWidth + gap + 20 ) ) {
			leftPos = tooltipTargetRect.left - tooltipWidth - gap;
		} else {
			leftPos = Math.min( window.innerWidth - tooltipWidth - 20, tooltipTargetRect.right + gap );
		}
		topPos = Math.max( 20, Math.min( window.innerHeight - tooltipHeight - 20, tooltipTargetRect.top - 20 ) );
	}

	return html`
		<div 
			className="wp-gantt-tooltip-fixed"
			style=${{ 
				left: `${ leftPos }px`, 
				top: `${ topPos }px`
			}}
		>
			<!-- Title & Status Badge -->
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
}
