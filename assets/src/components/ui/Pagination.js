import { html, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * WorkPress Central Unified Pagination Component
 *
 * Provides a standardized, accessible pagination control for cards and tables
 * with automatic page range calculation, ellipsis, and RTL-aware arrows.
 *
 * @package WorkPress
 * @subpackage Components/UI
 *
 * @param {Object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {number} props.totalItems
 * @param {number} props.itemsPerPage
 * @param {Function} props.onPageChange
 * @param {string} [props.itemLabel] - e.g. 'contributions', 'items', 'tasks'
 */
export default function Pagination({
	currentPage = 1,
	totalPages = 1,
	totalItems = 0,
	itemsPerPage = 12,
	onPageChange,
	itemLabel
}) {
	if (totalItems <= 0) return null;

	const rtl = isRtl();
	const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
	const startIndex = (validCurrentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

	const getPageNumbers = (current, total) => {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}
		if (current <= 4) {
			return [1, 2, 3, 4, 5, '...', total];
		}
		if (current >= total - 3) {
			return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
		}
		return [1, '...', current - 1, current, current + 1, '...', total];
	};

	const label = itemLabel || __('items', 'workpress');

	return html`
		<div className="wp-reports-pagination-container">
			<!-- Results counter chip -->
			<div className="is-size-7 has-text-grey has-text-weight-semibold">
				${sprintf(__('Showing %d - %d of %d %s', 'workpress'), startIndex + 1, endIndex, totalItems, label)}
			</div>

			<!-- Page navigation controls -->
			${totalPages > 1 && html`
				<div className="wp-pagination-controls">
					<!-- Previous Page Button -->
					<button
						type="button"
						className="wp-pagination-btn"
						disabled=${validCurrentPage <= 1}
						onClick=${() => {
							if (validCurrentPage > 1 && onPageChange) {
								onPageChange(validCurrentPage - 1);
								sound.play('click');
							}
						}}
						title=${__('Previous Page', 'workpress')}
					>
						<i className=${`dashicons ${rtl ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2'}`}></i>
					</button>

					<!-- Page Number Buttons -->
					${getPageNumbers(validCurrentPage, totalPages).map((p, idx) => {
						if (p === '...') {
							return html`<span key=${`el_${idx}`} className="wp-pagination-ellipsis">…</span>`;
						}
						return html`
							<button
								key=${`p_${p}`}
								type="button"
								className=${`wp-pagination-num-btn ${p === validCurrentPage ? 'is-active' : ''}`}
								onClick=${() => {
									if (p !== validCurrentPage && onPageChange) {
										onPageChange(p);
										sound.play('click');
									}
								}}
							>
								${p}
							</button>
						`;
					})}

					<!-- Next Page Button -->
					<button
						type="button"
						className="wp-pagination-btn"
						disabled=${validCurrentPage >= totalPages}
						onClick=${() => {
							if (validCurrentPage < totalPages && onPageChange) {
								onPageChange(validCurrentPage + 1);
								sound.play('click');
							}
						}}
						title=${__('Next Page', 'workpress')}
					>
						<i className=${`dashicons ${rtl ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-right-alt2'}`}></i>
					</button>
				</div>
			`}
		</div>
	`;
}
