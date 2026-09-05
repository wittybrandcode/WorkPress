import { html, __, isRtl } from '../../utils/html.js';
import { formatDate } from '../../utils/datetime.js';

/**
 * Contribution Table View Component
 *
 * Renders an executive tabular view of contributions with bulk selection checkboxes,
 * task link, clean excerpts, author, and quick action buttons.
 *
 * @package WorkPress
 * @subpackage Components/Contributions
 *
 * @param {Object} props
 * @param {Array} props.contributions
 * @param {Array<number>} props.selectedIds
 * @param {Function} props.onToggleSelect
 * @param {Function} props.onSelectAll
 * @param {Function} props.onPreview
 * @param {Function} props.onAccept
 */
export default function ContributionTableView({
	contributions = [],
	selectedIds = [],
	onToggleSelect,
	onSelectAll,
	onPreview,
	onAccept
}) {
	const rtl = isRtl();
	const allSelected = contributions.length > 0 && contributions.every(c => selectedIds.includes(c.id));

	return html`
		<div className="wp-contributions-table-container mt-4">
			<table className="wp-contributions-table">
				<thead>
					<tr>
						<th style=${{ width: '38px', textAlign: 'center' }}>
							<input
								type="checkbox"
								checked=${allSelected}
								onChange=${onSelectAll}
								title=${__('Select all on this page', 'workpress')}
								style=${{ cursor: 'pointer', accentColor: '#10b981' }}
							/>
						</th>
						<th style=${{ width: '150px' }}>${__('Project', 'workpress')}</th>
						<th>${__('Task & Content', 'workpress')}</th>
						<th style=${{ width: '130px' }}>${__('Type', 'workpress')}</th>
						<th style=${{ width: '120px' }}>${__('Author', 'workpress')}</th>
						<th style=${{ width: '110px' }}>${__('Date', 'workpress')}</th>
						<th style=${{ width: '100px', textAlign: rtl ? 'left' : 'right' }}>${__('Actions', 'workpress')}</th>
					</tr>
				</thead>
				<tbody>
					${contributions.map(item => {
						const isAccepted = Boolean(item.is_accepted);
						const clean = item.content ? item.content.replace(/<[^>]*>?/gm, '') : '';
						const isRowSelected = selectedIds.includes(item.id);

						return html`
							<tr key=${`tr_${item.id}`} style=${{ backgroundColor: isRowSelected ? '#f0fdf4' : 'transparent' }}>
								<td style=${{ textAlign: 'center' }} onClick=${e => e.stopPropagation()}>
									<input
										type="checkbox"
										checked=${isRowSelected}
										onChange=${() => onToggleSelect && onToggleSelect(item.id)}
										style=${{ cursor: 'pointer', accentColor: '#10b981' }}
									/>
								</td>
								<td>
									<span className="tag is-dark is-rounded is-small has-text-weight-bold wp-text-truncate" style=${{ maxWidth: '140px' }}>
										${item.project_name || __('PRJ', 'workpress')}
									</span>
								</td>
								<td>
									<a href=${`#/tasks/${item.task_id}`} className="has-text-dark has-text-weight-bold wp-hover-primary is-block mb-1">
										${item.task_title || `#${item.task_id}`}
									</a>
									<span className="is-size-7 has-text-grey wp-text-truncate is-block" style=${{ maxWidth: '380px' }}>
										${clean}
									</span>
								</td>
								<td>
									${isAccepted ? html`
										<span className="tag is-success is-light is-rounded is-small has-text-weight-bold">
											${__('Approved Solution', 'workpress')}
										</span>
									` : html`
										<span className="tag is-info is-light is-rounded is-small has-text-weight-bold">
											${item.type_label || __('Work', 'workpress')}
										</span>
									`}
								</td>
								<td>
									<span className="is-size-7 has-text-weight-bold has-text-dark">
										${item.author_name || __('Staff', 'workpress')}
									</span>
								</td>
								<td>
									<span className="is-size-7 has-text-grey">
										${formatDate(item.created_at, { hideYear: true })}
									</span>
								</td>
								<td style=${{ textAlign: rtl ? 'left' : 'right' }}>
									<div className="is-inline-flex" style=${{ gap: '4px' }}>
										<button
											type="button"
											className="button is-light is-small wp-btn"
											onClick=${() => onPreview && onPreview(item)}
											title=${__('Preview details', 'workpress')}
											style=${{ height: '28px', padding: '0 8px' }}
										>
											<i className="dashicons dashicons-visibility"></i>
										</button>
										${(item.can_accept && !isAccepted) ? html`
											<button
												type="button"
												className="button is-success is-small wp-btn"
												onClick=${() => onAccept && onAccept(item)}
												title=${__('Accept Solution', 'workpress')}
												style=${{ height: '28px', padding: '0 8px' }}
											>
												<i className="dashicons dashicons-yes-alt"></i>
											</button>
										` : null}
									</div>
								</td>
							</tr>
						`;
					})}
				</tbody>
			</table>
		</div>
	`;
}
