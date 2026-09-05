import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../../utils/html.js';
import { formatDateTimeSegments, calculateTimelineInsights } from '../../utils/datetime.js';
import sound from '../../utils/sound.js';
import SnowflakeIcon from '../ui/SnowflakeIcon.js';

/**
 * Modern High-Density Institutional Project Card
 *
 * Implemented strictly according to User Wireframe & Temporal Horizon Blueprint:
 * 1. Top Section: Full-bleed Hero Cover Image or Pure Symbolic Icon Container (No Text).
 * 2. Middle Body:
 *    - Right (RTL): Project Title + Project Description (full breathing room).
 *    - Left (RTL): Status Badge + Prefix/Code Badge.
 * 3. Timeline Horizon Strip (Single Unified Row right above progress bar):
 *    - Right (RTL): Start Pin [ 📅 اليوم | الشهر | السنة | الساعة ]
 *    - Center: Temporal Insights Badge (Elapsed Time | Remaining / Overdue / Gantt Extension)
 *    - Left (RTL): Due Pin [ ⏰ اليوم | الشهر | السنة | الساعة ]
 * 4. Progress Bar: Full-width green line across the card.
 * 5. Bottom Footer Bar:
 *    - Right (RTL): 4 Info Chips (Icon + Number ONLY).
 *    - Left (RTL): 4 Functional Action Buttons (Square Icons).
 */
export default function ProjectCard( { project, onEdit, onManageMembers, onDelete, onRestore, onAddTask, onQuickPreview } ) {
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const dropdownRef = useRef( null );
	const rtl = isRtl();

	useEffect( () => {
		const handleClickOutside = ( event ) => {
			if ( dropdownRef.current && ! dropdownRef.current.contains( event.target ) ) {
				setIsMenuOpen( false );
			}
		};
		document.addEventListener( 'mousedown', handleClickOutside );
		return () => document.removeEventListener( 'mousedown', handleClickOutside );
	}, [] );

	const isCompleted = project.is_completed || project.progress === 100 || project.status === 'completed';
	const isFrozen = project.is_frozen || project.status === 'frozen';
	const isPendingTrash = Boolean( project.is_pending_trash );

	const progress = Math.min( 100, Math.max( 0, Number( project.progress ) || 0 ) );
	const totalTasks = Number( project.count || project.total_tasks || 0 );
	const completedTasks = Number( project.completed_count || 0 );
	const membersCount = Number( project.members_count || ( project.members && project.members.length ) || ( project.lead_id ? 1 : 0 ) );

	const cleanDescription = project.description
		? project.description.replace( /<[^>]*>?/gm, '' )
		: __( 'No description provided for this project.', 'workpress' );

	const startDate = project.start_at || project.start_date || project.created_at || project.date;
	const dueDate = project.due_at || project.requested_due_date || project.end_date;
	const originalDueDate = project.original_due_at || project.initial_due_date || null;

	const startParts = formatDateTimeSegments( startDate );
	const dueParts = formatDateTimeSegments( dueDate );

	const insights = calculateTimelineInsights( {
		startDate,
		dueDate,
		isCompleted,
		completedAt: project.completed_at || null,
		originalDueDate,
	} );

	return html`
		<div
			className="wp-card wp-project-card"
			style=${{
				backgroundColor: '#ffffff',
				border: '1px solid #e2e8f0',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: 0,
				borderRadius: 0,
				position: 'relative',
				boxSizing: 'border-box',
				overflow: 'hidden'
			}}
		>
			<!-- Pending Trash Overlay Alert if applicable -->
			${ isPendingTrash ? html`
				<div
					style=${{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(239, 68, 68, 0.94)',
						zIndex: 10,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						padding: '1.2rem',
						color: '#ffffff',
						textAlign: 'center'
					}}
					onClick=${ ( e ) => e.stopPropagation() }
				>
					<i className="dashicons dashicons-warning mb-2" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
					<h4 className="title is-6 has-text-white mb-1">${ __( 'Trash Request Pending', 'workpress' ) }</h4>
					<p className="is-size-7 mb-3" style=${{ opacity: 0.9 }}>
						${ project.trash_reason || __( 'Requested for archiving', 'workpress' ) }
					</p>
					<div className="buttons is-centered mb-0" style=${{ gap: '6px' }}>
						<button
							type="button"
							className="button is-small is-white is-outlined wp-btn"
							onClick=${ ( e ) => { e.stopPropagation(); onRestore && onRestore( project ); } }
						>
							${ __( 'Restore & Reject', 'workpress' ) }
						</button>
						<button
							type="button"
							className="button is-small is-white has-text-danger has-text-weight-bold wp-btn"
							onClick=${ ( e ) => { e.stopPropagation(); onDelete && onDelete( project ); } }
						>
							${ __( 'Delete Permanently', 'workpress' ) }
						</button>
					</div>
				</div>
			` : null }

			<!-- 1. Top Section: Full-Bleed Cover Image or Pure Symbolic Icon Container (No Text) -->
			${ project.cover_url ? html`
				<figure className="image is-3by1 m-0" style=${{ overflow: 'hidden', borderBottom: '1px solid #e2e8f0', width: '100%', height: '110px' }}>
					<img src=${ project.cover_url } alt=${ project.name } style=${{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
				</figure>
			` : html`
				<div
					className="m-0 is-flex is-align-items-center is-justify-content-center"
					style=${{
						backgroundColor: '#f8fafc',
						borderBottom: '1px solid #e2e8f0',
						width: '100%',
						height: '110px',
						boxSizing: 'border-box'
					}}
				>
					<span className="icon is-large">
						<i className=${ `dashicons ${ project.icon || 'dashicons-portfolio' }` } style=${{ fontSize: '42px', width: '42px', height: '42px', color: '#0f172a' }}></i>
					</span>
				</div>
			` }

			<!-- 2. Middle Body Section (Title & Scope) -->
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column is-justify-content-space-between">
				<div>
					<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-3" style=${{ gap: '12px' }}>
						<!-- Right Column: Project Title & Description -->
						<div style=${{ flex: 1, minWidth: 0 }}>
							<h3 className="title is-6 mb-1" style=${{ lineHeight: '1.4' }}>
								<a
									href=${ `#/projects/${ project.id }` }
									className="has-text-dark wp-hover-primary"
									style=${{ fontWeight: '800' }}
								>
									${ project.name }
								</a>
							</h3>
							<p
								className="is-size-7 has-text-grey mb-0"
								style=${{
									display: '-webkit-box',
									WebkitLineClamp: '2',
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
									lineHeight: '1.45',
									minHeight: '2.9em'
								}}
							>
								${ cleanDescription }
							</p>
						</div>

						<!-- Left Column: Status Badge + Prefix Code Badge -->
						<div
							className="is-flex is-align-items-center"
							style=${{ flexShrink: 0, gap: '6px' }}
						>
							<!-- البادئة -->
							<span
								className="tag is-light is-small has-text-weight-bold"
								style=${{
									border: '1px solid #cbd5e1',
									borderRadius: 0,
									backgroundColor: '#f1f5f9',
									color: '#0f172a',
									fontFamily: 'monospace',
									fontSize: '0.72rem',
									padding: '2px 8px',
									height: '24px'
								}}
								title=${ __( 'Project Prefix / Code', 'workpress' ) }
							>
								${ project.prefix || project.code || `PRJ-${ project.id }` }
							</span>

							<!-- شارة الحالة المونوكرومية الموحدة -->
							${ isCompleted ? html`
								<span className="tag is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '13px', color: '#0f172a', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${ __( 'Completed', 'workpress' ) }
								</span>
							` : isFrozen ? html`
								<span className="tag is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}>
									<${SnowflakeIcon} size=${ 12 } style=${{ [rtl ? 'marginLeft' : 'marginRight']: '3px', color: '#0f172a' }} />
									${ __( 'Frozen', 'workpress' ) }
								</span>
							` : html`
								<span className="tag is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}>
									${ __( 'Active', 'workpress' ) }
								</span>
							` }
						</div>
					</div>
				</div>

				<div>
					<!-- 3. سطر حاويات الوقت الموحد في سطر واحد مباشرة فوق المؤشر الأخضر -->
					<div
						className="wp-timeline-horizon-strip is-flex is-align-items-center mb-2"
						style=${{
							gap: '5px',
							width: '100%',
							overflowX: 'auto',
							whiteSpace: 'nowrap',
							scrollbarWidth: 'none',
							fontSize: '0.71rem',
							lineHeight: 1.3
						}}
					>
						<!-- 1. حاوية تاريخ البدء -->
						${ startParts.isValid ? html`
							<div
								className="is-flex is-align-items-center"
								style=${{
									gap: '4px',
									color: '#334155',
									backgroundColor: '#f8fafc',
									padding: '4px 8px',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									flexShrink: 0
								}}
								title=${ sprintf( __( 'Start: %s %s %s %s', 'workpress' ), startParts.day, startParts.month, startParts.year, startParts.time ) }
							>
								<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>${ startParts.day }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#334155' }}>${ startParts.month }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#64748b' }}>${ startParts.year }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a', fontFamily: 'monospace' }}>${ startParts.time }</span>
							</div>
						` : null }

						<!-- 2. Time Elapsed Container -->
						${ startDate ? html`
							<div
								className="is-flex is-align-items-center"
								style=${{
									gap: '5px',
									color: '#0f172a',
									backgroundColor: '#f8fafc',
									padding: '4px 8px',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									flexShrink: 0
								}}
								title=${ `${ __( 'Time Elapsed:', 'workpress' ) } ${ insights.elapsedDetailed }` }
							>
								<i className="dashicons dashicons-backup" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span>${ __( 'Work took', 'workpress' ) } <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${ insights.elapsedDetailed }</strong></span>
							</div>
						` : null }

						<!-- 3. Remaining or Overdue Container -->
						${ dueParts.isValid ? html`
							<div
								className="is-flex is-align-items-center"
								style=${{
									gap: '5px',
									color: '#0f172a',
									backgroundColor: '#f8fafc',
									padding: '4px 8px',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									flexShrink: 0
								}}
							>
								<i
									className=${ `dashicons ${ isCompleted ? 'dashicons-yes-alt' : ( insights.isOverdue ? 'dashicons-warning' : 'dashicons-hourglass' ) }` }
									style=${{
										fontSize: '14px',
										width: '14px',
										height: '14px',
										color: '#0f172a'
									}}
								></i>
								<span>
									${ isCompleted
										? html`<span>${ __( 'Completed in', 'workpress' ) } <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${ insights.elapsedDetailed }</strong></span>`
										: insights.isOverdue
											? html`<span>${ __( 'Overdue', 'workpress' ) } <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${ insights.remainingDetailed }</strong></span>`
											: html`<span>${ __( 'Remaining time', 'workpress' ) } <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${ insights.remainingDetailed }</strong></span>` }
									${ insights.extensionDays > 0 ? html`<span className="has-text-weight-bold" style=${{ [rtl ? 'marginRight' : 'marginLeft']: '4px', color: '#0f172a' }}>(${ sprintf( __( '+%d d ext', 'workpress' ), insights.extensionDays ) })</span>` : null }
								</span>
							</div>
						` : null }

						<!-- 4. حاوية موعد التسليم -->
						${ dueParts.isValid ? html`
							<div
								className="is-flex is-align-items-center"
								style=${{
									gap: '4px',
									color: '#0f172a',
									backgroundColor: '#f8fafc',
									padding: '4px 8px',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									flexShrink: 0
								}}
								title=${ sprintf( __( 'Due: %s %s %s %s', 'workpress' ), dueParts.day, dueParts.month, dueParts.year, dueParts.time ) }
							>
								<i className="dashicons dashicons-clock" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>${ dueParts.day }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#334155' }}>${ dueParts.month }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#64748b' }}>${ dueParts.year }</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a', fontFamily: 'monospace' }}>${ dueParts.time }</span>
							</div>
						` : null }
					</div>

					<!-- 4. Progress Bar (Green line across the card) -->
					<div className="mb-3">
						<div
							style=${{
								height: '5px',
								backgroundColor: '#e2e8f0',
								borderRadius: 0,
								overflow: 'hidden',
								width: '100%'
							}}
							title=${ `${ __( 'Completion Progress', 'workpress' ) }: ${ progress }%` }
						>
							<div
								style=${{
									height: '100%',
									width: `${ progress }%`,
									backgroundColor: isCompleted ? '#10b981' : ( insights.isOverdue ? '#ef4444' : '#10b981' ),
									transition: 'width 0.3s ease'
								}}
							></div>
						</div>
					</div>

					<!-- 5. Bottom Footer Bar -->
					<div
						className="is-flex is-justify-content-space-between is-align-items-center pt-2 wp-border-top"
						style=${{ gap: '8px' }}
					>
						<!-- Right Group: أزرار المعلومات فقط أيقونة ورقم (Icon + Number ONLY) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '5px' }}>
							<!-- 1. إجمالي المهام -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Total Tasks: %d', 'workpress' ), totalTasks ) }
							>
								<i className="dashicons dashicons-clipboard" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ totalTasks }</span>
							</div>

							<!-- 2. المهام المنجزة -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Completed Tasks: %d', 'workpress' ), completedTasks ) }
							>
								<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ completedTasks }</span>
							</div>

							<!-- 3. أعضاء الفريق -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Team Members: %d', 'workpress' ), membersCount ) }
							>
								<i className="dashicons dashicons-admin-users" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ membersCount }</span>
							</div>

							<!-- 4. نسبة الإنجاز -->
							<div
								className="is-flex is-align-items-center is-justify-content-center"
								style=${{
									height: '28px',
									padding: '0 6px',
									backgroundColor: '#f8fafc',
									border: '1px solid #e2e8f0',
									borderRadius: 0,
									gap: '4px',
									cursor: 'default'
								}}
								title=${ sprintf( __( 'Progress: %d%%', 'workpress' ), progress ) }
							>
								<i className="dashicons dashicons-chart-line" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${ progress }%</span>
							</div>
						</div>

						<!-- Left Group: أيقونات وظيفية (Functional Action Icons) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '4px' }}>
							<!-- 1. Workspace / مساحة العمل -->
							<a
								href=${ `#/projects/${ project.id }` }
								className="button is-small wp-btn"
								title=${ __( 'Open Workspace', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-portfolio" style=${{ fontSize: '14px' }}></i>
							</a>

							<!-- 2. Quick Preview / معاينة سريعة -->
							<button
								type="button"
								className="button is-small wp-btn"
								onClick=${ () => onQuickPreview && onQuickPreview( project ) }
								title=${ __( 'Quick Preview', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-visibility" style=${{ fontSize: '14px' }}></i>
							</button>

							<!-- 3. Add Task / إضافة مهمة -->
							<button
								type="button"
								className="button is-small wp-btn"
								onClick=${ () => onAddTask && onAddTask( project ) }
								title=${ __( 'Add Task', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-plus-alt2" style=${{ fontSize: '14px' }}></i>
							</button>

							<!-- 4. Edit Project / تعديل المشروع -->
							<button
								type="button"
								className="button is-small wp-btn"
								onClick=${ () => onEdit && onEdit( project ) }
								title=${ __( 'Edit Project', 'workpress' ) }
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-edit" style=${{ fontSize: '14px' }}></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}
