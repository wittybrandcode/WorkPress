import { html, __, sprintf, isRtl } from '../../utils/html.js';

/**
 * Contribution Bulk Actions Floating Bar
 *
 * Appears at the bottom when one or more contributions are selected,
 * offering quick bulk verification and bulk deletion requests.
 *
 * @package WorkPress
 * @subpackage Components/Contributions
 *
 * @param {Object} props
 * @param {Array<number>} props.selectedIds
 * @param {Function} props.onBulkAccept
 * @param {Function} props.onBulkTrash
 * @param {Function} props.onClearSelection
 */
export default function ContributionBulkBar({
	selectedIds = [],
	onBulkAccept,
	onBulkTrash,
	onClearSelection
}) {
	if (!selectedIds || selectedIds.length === 0) return null;

	const rtl = isRtl();

	return html`
		<div className="wp-bulk-actions-floating-bar">
			<div className="wp-bulk-actions-content">
				<!-- Selected counter and label -->
				<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
					<span className="tag is-primary is-rounded has-text-weight-bold" style=${{ padding: '2px 8px', fontSize: '0.75rem', height: '22px' }}>
						${sprintf(__('%d Selected', 'workpress'), selectedIds.length)}
					</span>
					<span className="is-size-7 has-text-white" style=${{ opacity: 0.9 }}>
						${__('Actions for selected items:', 'workpress')}
					</span>
				</div>

				<!-- Bulk buttons -->
				<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
					<!-- Bulk Approve Button -->
					<button
						type="button"
						className="button is-success is-small wp-btn has-text-weight-bold"
						onClick=${onBulkAccept}
						style=${{ height: '28px', fontSize: '0.75rem' }}
					>
						<i className="dashicons dashicons-yes-alt" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
						<span>${__('Bulk Verify & Complete', 'workpress')}</span>
					</button>

					<!-- Bulk Trash Button -->
					<button
						type="button"
						className="button is-danger is-small wp-btn has-text-weight-bold"
						onClick=${onBulkTrash}
						style=${{ height: '28px', fontSize: '0.75rem' }}
					>
						<i className="dashicons dashicons-trash" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
						<span>${__('Bulk Delete', 'workpress')}</span>
					</button>

					<!-- Clear Selection Button -->
					<button
						type="button"
						className="button is-white is-outlined is-small wp-btn"
						onClick=${onClearSelection}
						title=${__('Cancel selection', 'workpress')}
						style=${{ height: '28px', width: '28px', padding: 0 }}
					>
						<i className="dashicons dashicons-no-alt" style=${{ fontSize: '14px' }}></i>
					</button>
				</div>
			</div>
		</div>
	`;
}
