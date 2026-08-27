import { html } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * Gantt Task Row & Colored Bar Component
 */
export default function GanttTaskRow({
	task,
	metrics,
	styles,
	progressPct = 0,
	isHovered = false,
	setHoveredTaskId,
	setTooltipTargetRect,
	rescheduleTaskId,
	setRescheduleTaskId,
	setRescheduleMenuPos,
	onTaskClick
}) {
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
				className=${ `wp-gantt-bar-wrapper ${ isHovered ? 'is-hovered' : '' }` }
				style=${{ 
					right: `${ Math.max( 2, metrics.rightOffset - 28 ) }px`
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
					className="wp-gantt-bar-inner"
					style=${{ 
						width: `${ metrics.width }px`, 
						backgroundColor: styles.bg, 
						border: `1px solid ${ styles.border }`, 
						color: styles.text
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
}
