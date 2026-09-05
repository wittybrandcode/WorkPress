import { html, useState, useEffect, useRef, __, sprintf, isRtl } from '../../utils/html.js';
import { formatDateTimeSegments, formatDetailedDuration } from '../../utils/datetime.js';

/**
 * Modern High-Density Contribution Card
 *
 * Displays rich project & task identity, content excerpt,
 * 2x2 micro-stats grid (Author, Task ID, Files, Governance), and sleek actions.
 *
 * @package WorkPress
 * @subpackage Components/Contributions
 *
 * @param {Object} props
 * @param {Object} props.contribution
 * @param {boolean} [props.isSelected=false]
 * @param {Function} [props.onToggleSelect]
 * @param {Function} [props.onRefresh]
 * @param {Function} [props.onPreview]
 * @param {Function} [props.onAccept]
 * @param {Function} [props.onRevoke]
 * @param {Function} [props.onTrashRequest]
 * @param {Function} [props.onRestore]
 * @param {Function} [props.onHardDelete]
 */
export default function ContributionCard({
	contribution,
	isSelected = false,
	onToggleSelect,
	onRefresh,
	onPreview,
	onAccept,
	onRevoke,
	onTrashRequest,
	onRestore,
	onHardDelete
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const dropdownRef = useRef(null);
	const rtl = isRtl();

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const isAccepted = Boolean(contribution.is_accepted);
	const isTrash = Boolean(contribution.is_pending_trash);
	const isSystem = ['state_change', 'assignment', 'trash_request'].includes(contribution.type);

	const cleanContent = contribution.content
		? contribution.content.replace(/<[^>]*>?/gm, '')
		: __('No additional details provided.', 'workpress');

	const toggleMenu = (e) => {
		e.stopPropagation();
		setIsMenuOpen(!isMenuOpen);
	};

	const createdParts = formatDateTimeSegments(contribution.created_at);
	const elapsedDetailed = formatDetailedDuration(contribution.created_at, new Date());
	const attachmentCount = (contribution.attachments && contribution.attachments.length) || 0;

	return html`
		<div
			className="wp-card wp-contribution-card"
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
				overflow: 'hidden',
				cursor: 'pointer'
			}}
			onClick=${(e) => {
				if (isTrash) return;
				if (onPreview) onPreview(contribution);
			}}
		>
			<!-- Pending Trash Overlay Alert if applicable -->
			${isTrash ? html`
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
					onClick=${(e) => e.stopPropagation()}
				>
					<i className="dashicons dashicons-warning mb-2" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
					<h4 className="title is-6 has-text-white mb-1">${__('Trash Request Pending', 'workpress')}</h4>
					<p className="is-size-7 mb-3" style=${{ opacity: 0.9 }}>
						${contribution.trash_reason || __('Requested by author', 'workpress')}
					</p>
					<div className="buttons is-centered mb-0" style=${{ gap: '6px' }}>
						<button
							type="button"
							className="button is-small is-white is-outlined wp-btn"
							onClick=${(e) => { e.stopPropagation(); onRestore && onRestore(contribution); }}
						>
							${__('Restore', 'workpress')}
						</button>
						<button
							type="button"
							className="button is-small is-white has-text-danger has-text-weight-bold wp-btn"
							onClick=${(e) => { e.stopPropagation(); onHardDelete && onHardDelete(contribution); }}
						>
							${__('Delete Permanently', 'workpress')}
						</button>
					</div>
				</div>
			` : null}

			<!-- 1. Top Section: Full-Bleed Cover Image or Pure Symbolic Icon Container -->
			${contribution.cover_url ? html`
				<figure className="image is-3by1 m-0" style=${{ overflow: 'hidden', borderBottom: '1px solid #e2e8f0', width: '100%', height: '110px' }}>
					<img src=${contribution.cover_url} alt=${contribution.task_title} style=${{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
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
					<span className="icon is-large has-text-grey-light">
						<i
							className=${`dashicons ${isAccepted ? 'dashicons-awards' : (isSystem ? 'dashicons-admin-generic' : 'dashicons-format-chat')}`}
							style=${{ fontSize: '42px', width: '42px', height: '42px', color: isAccepted ? '#10b981' : '#94a3b8' }}
						></i>
					</span>
				</div>
			`}

			<!-- 2. Middle Body Section (Title & Scope) -->
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column is-justify-content-space-between">
				<div>
					<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-3" style=${{ gap: '12px' }}>
						<!-- Right Column: Project Context, Task Title & Excerpt -->
						<div style=${{ flex: 1, minWidth: 0 }}>
							<!-- Project Context Badge/Label -->
							<div className="is-size-7 has-text-grey mb-1 is-flex is-align-items-center" style=${{ gap: '4px' }}>
								<i className="dashicons dashicons-portfolio has-text-grey-light" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
								<span className="has-text-weight-bold has-text-grey-dark wp-text-truncate" style=${{ maxWidth: '240px' }}>
									${contribution.project_name || __('Project', 'workpress')}
								</span>
							</div>

							<!-- Task Title Link -->
							<h3 className="title is-6 mb-1" style=${{ lineHeight: '1.4' }}>
								<a
									href=${`#/tasks/${contribution.task_id}`}
									onClick=${(e) => e.stopPropagation()}
									className="has-text-dark wp-hover-primary"
									style=${{ fontWeight: '800' }}
								>
									${contribution.task_title || `${__('Task #', 'workpress')}${contribution.task_id}`}
								</a>
							</h3>

							<!-- Content Excerpt -->
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
								${cleanContent}
							</p>
						</div>

						<!-- Left Column: Checkbox + Status Tag -->
						<div className="is-flex is-align-items-center" style=${{ flexShrink: 0, gap: '6px' }}>
							<input
								type="checkbox"
								checked=${isSelected}
								onChange=${onToggleSelect}
								onClick=${(e) => e.stopPropagation()}
								title=${__('Select for bulk action', 'workpress')}
								style=${{ cursor: 'pointer', accentColor: '#10b981', width: '15px', height: '15px', margin: 0 }}
							/>

							${isAccepted ? html`
								<span className="tag is-success is-light is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${__('Approved Solution', 'workpress')}
								</span>
							` : isSystem ? html`
								<span className="tag is-light is-small has-text-weight-bold has-text-grey" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-admin-generic" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${contribution.type_label || __('System Log', 'workpress')}
								</span>
							` : html`
								<span className="tag is-info is-light is-small has-text-weight-bold" style=${{ borderRadius: 0, height: '24px' }}>
									<i className="dashicons dashicons-format-chat" style=${{ fontSize: '13px', [rtl ? 'marginLeft' : 'marginRight']: '3px' }}></i>
									${contribution.type_label || __('Contribution', 'workpress')}
								</span>
							`}
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
						<!-- 1. حاوية تاريخ ووقت التقديم -->
						${createdParts.isValid ? html`
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
								title=${sprintf(__('Submitted: %s %s %s %s', 'workpress'), createdParts.day, createdParts.month, createdParts.year, createdParts.time)}
							>
								<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>${createdParts.day}</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#334155' }}>${createdParts.month}</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span style=${{ color: '#64748b' }}>${createdParts.year}</span>
								<span style=${{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
								<span className="has-text-weight-bold" style=${{ color: '#0f172a', fontFamily: 'monospace' }}>${createdParts.time}</span>
							</div>
						` : null}

						<!-- 2. Elapsed Duration Container -->
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
							title=${`${__('Elapsed since submission:', 'workpress')} ${elapsedDetailed}`}
						>
							<i className="dashicons dashicons-backup" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
							<span>${__('Elapsed since submission', 'workpress')} <strong style=${{ fontFamily: 'monospace', color: '#0f172a' }}>${elapsedDetailed}</strong></span>
						</div>

						<!-- 3. Verification & Approval Status Container -->
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
								className=${`dashicons ${isAccepted ? 'dashicons-yes-alt' : 'dashicons-hourglass'}`}
								style=${{
									fontSize: '14px',
									width: '14px',
									height: '14px',
									color: '#0f172a'
								}}
							></i>
							<span className="has-text-weight-bold" style=${{ color: '#0f172a' }}>
								${isAccepted ? __('Approved official solution', 'workpress') : __('Under review and audit', 'workpress')}
							</span>
						</div>
					</div>

					<!-- 4. Progress Bar (Status Line across the card) -->
					<div className="mb-3">
						<div
							style=${{
								height: '5px',
								backgroundColor: '#e2e8f0',
								borderRadius: 0,
								overflow: 'hidden',
								width: '100%'
							}}
							title=${isAccepted ? __('Approved Solution', 'workpress') : __('Under Review', 'workpress')}
						>
							<div
								style=${{
									height: '100%',
									width: '100%',
									backgroundColor: '#10b981',
									transition: 'background-color 0.3s ease'
								}}
							></div>
						</div>
					</div>

					<!-- 5. Bottom Footer Bar -->
					<div
						className="is-flex is-justify-content-space-between is-align-items-center pt-2 wp-border-top"
						style=${{ gap: '8px' }}
						onClick=${(e) => e.stopPropagation()}
					>
						<!-- Right Group: أزرار المعلومات فقط أيقونة ورقم/اسم (Info Chips) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '5px' }}>
							<!-- 1. الكاتب -->
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
								title=${sprintf(__('Author: %s', 'workpress'), contribution.author_name || __('Staff', 'workpress'))}
							>
								<i className=${`dashicons ${contribution.is_client ? 'dashicons-star-filled' : 'dashicons-admin-users'}`} style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${contribution.author_name || __('Staff', 'workpress')}</span>
							</div>

							<!-- 2. رقم المهمة -->
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
								title=${sprintf(__('Task ID: #%s', 'workpress'), contribution.task_id)}
							>
								<i className="dashicons dashicons-clipboard" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>#${contribution.task_id}</span>
							</div>

							<!-- 3. عدد الملفات المرفقة -->
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
								title=${sprintf(__('Attachments: %d', 'workpress'), attachmentCount)}
							>
								<i className="dashicons dashicons-paperclip" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>${attachmentCount}</span>
							</div>

							<!-- 4. وسام الحل المعتمد -->
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
								title=${isAccepted ? __('Verified Solution', 'workpress') : __('Under Review', 'workpress')}
							>
								<i className="dashicons dashicons-awards" style=${{ fontSize: '14px', width: '14px', height: '14px', color: '#0f172a' }}></i>
								<span style=${{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a' }}>
									${isAccepted ? __('Approved', 'workpress') : __('Review', 'workpress')}
								</span>
							</div>
						</div>

						<!-- Left Group: أيقونات وظيفية مربعة (28px) -->
						<div className="is-flex is-align-items-center" style=${{ gap: '4px' }}>
							<!-- 1. Preview / المعاينة -->
							<button
								type="button"
								className="button is-small wp-btn"
								onClick=${() => onPreview && onPreview(contribution)}
								title=${__('Preview full details', 'workpress')}
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-visibility" style=${{ fontSize: '14px' }}></i>
							</button>

							<!-- 2. Go to Task / الذهاب للمهمة -->
							<a
								href=${`#/tasks/${contribution.task_id}`}
								className="button is-small wp-btn"
								title=${__('Go to Task', 'workpress')}
								style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<i className="dashicons dashicons-external" style=${{ fontSize: '14px' }}></i>
							</a>

							<!-- 3. Quick Accept / Quick Revoke Button -->
							${(contribution.can_accept && !isAccepted) ? html`
								<button
									type="button"
									className="button is-small wp-btn"
									onClick=${() => onAccept && onAccept(contribution)}
									title=${__('Accept Solution & Complete Task', 'workpress')}
									style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #cbd5e1' }}
								>
									<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '14px' }}></i>
								</button>
							` : (isAccepted && contribution.can_revoke) ? html`
								<button
									type="button"
									className="button is-small wp-btn is-active"
									onClick=${() => onRevoke && onRevoke(contribution)}
									title=${__('Revoke Approval', 'workpress')}
									style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #10b981' }}
								>
									<i className="dashicons dashicons-undo" style=${{ fontSize: '14px' }}></i>
								</button>
							` : null}

							<!-- 4. Actions Menu Dropdown -->
							<div ref=${dropdownRef} className=${`dropdown is-up ${rtl ? 'is-left' : 'is-right'} ${isMenuOpen ? 'is-active' : ''}`}>
								<div className="dropdown-trigger">
									<button
										type="button"
										className="button is-small wp-btn is-light"
										onClick=${toggleMenu}
										title=${__('More Options', 'workpress')}
										style=${{ width: '28px', height: '28px', padding: 0, borderRadius: 0, border: '1px solid #e2e8f0' }}
									>
										<i className="dashicons dashicons-ellipsis" style=${{ fontSize: '14px', color: '#475569' }}></i>
									</button>
								</div>
								<div className="dropdown-menu" role="menu">
									<div className="dropdown-content p-0" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
										<a
											href=${`#/tasks/${contribution.task_id}`}
											className="dropdown-item py-2 is-size-7 is-flex is-align-items-center"
											style=${{ gap: '6px' }}
										>
											<i className="dashicons dashicons-external"></i>
											<span>${__('Go to Task', 'workpress')}</span>
										</a>

										${isAccepted && contribution.can_revoke ? html`
											<a
												className="dropdown-item py-2 is-size-7 has-text-warning is-flex is-align-items-center"
												style=${{ gap: '6px' }}
												onClick=${() => { setIsMenuOpen(false); onRevoke && onRevoke(contribution); }}
											>
												<i className="dashicons dashicons-undo"></i>
												<span>${__('Revoke Approval', 'workpress')}</span>
											</a>
										` : null}

										${!isAccepted ? html`
											<a
												className="dropdown-item py-2 is-size-7 has-text-danger is-flex is-align-items-center"
												style=${{ gap: '6px' }}
												onClick=${() => { setIsMenuOpen(false); onTrashRequest && onTrashRequest(contribution); }}
											>
												<i className="dashicons dashicons-trash"></i>
												<span>${__('Delete Contribution', 'workpress')}</span>
											</a>
										` : null}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
}
