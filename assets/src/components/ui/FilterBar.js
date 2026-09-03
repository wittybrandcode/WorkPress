import { html, createPortal, __, sprintf, isRtl } from '../../utils/html.js';
import CustomSelect from './CustomSelect.js';
import MemberSelect from './MemberSelect.js';
import { formatNumber } from '../../utils/datetime.js';

/**
 * Unified Contextual Compact FilterBar Component
 *
 * Provides a streamlined single-row toolbar for searching, filtering, and resetting views.
 *
 * @param {Object} props
 * @param {Object} [props.search] - { value, onChange, placeholder }
 * @param {Array} [props.filters] - Array of { key, label, icon, value, onChange, options, placeholder, isCustomSelect, isMemberSelect, width, users }
 * @param {number} [props.totalCount] - Current filtered items count
 * @param {number} [props.totalUnfiltered] - Total unfiltered items count
 * @param {string} [props.counterLabel] - Label for counter (e.g. "مهمة", "مشروع", "حل")
 * @param {boolean} [props.isFilterActive] - Whether any filter is active
 * @param {Function} [props.onReset] - Callback to reset all filters
 * @param {any} [props.extraActions] - Optional extra components on the left
 * @param {any} [props.children] - Custom children elements
 */
export default function FilterBar({
	search,
	filters = [],
	totalCount = null,
	totalUnfiltered = null,
	counterLabel = null,
	isFilterActive = false,
	onReset = null,
	extraActions = null,
	children = null,
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;
	const label = counterLabel || __( 'Item', 'workpress' );
	const rtl = isRtl();

	const content = html`
		<div className="wp-filter-toolbar">
			${ children ? children : html`
				<div className="wp-filter-group">
					
					<!-- Instant Search Input -->
					${ search && html`
						<div className="wp-filter-search-box">
							<span className="wp-filter-search-icon">
								<i className="dashicons dashicons-search"></i>
							</span>
							<input 
								type="text"
								className="input wp-filter-input"
								placeholder=${ search.placeholder || __( 'Quick search...', 'workpress' ) }
								value=${ search.value || '' }
								onInput=${ (e) => search.onChange( e.target.value ) }
							/>
							${ search.value && html`
								<button 
									type="button" 
									className="wp-filter-search-clear" 
									title=${ __( 'Clear search', 'workpress' ) }
									onClick=${ () => search.onChange('') }
								>
									<i className="dashicons dashicons-no-alt"></i>
								</button>
							` }
						</div>
					` }

					<!-- Select Filters -->
					${ filters.map( ( filter ) => {
						const filterWidth = filter.width || '150px';

						if ( filter.isMemberSelect ) {
							return html`
								<${MemberSelect}
									key=${ filter.key }
									value=${ filter.value }
									onChange=${ filter.onChange }
									users=${ filter.users || filter.options || filter.members || [] }
									placeholder=${ filter.placeholder || filter.label }
									width=${ filterWidth }
									size="small"
								/>
							`;
						}

						return html`
							<${CustomSelect}
								key=${ filter.key }
								value=${ filter.value }
								onChange=${ filter.onChange }
								options=${ filter.options || [] }
								placeholder=${ filter.placeholder || filter.label }
								icon=${ filter.icon }
								width=${ filterWidth }
							/>
						`;
					} ) }
				</div>

				<!-- Actions & Counters -->
				<div className="wp-filter-actions">
					${ isFilterActive && onReset && html`
						<button 
							type="button" 
							className="wp-filter-reset-btn" 
							onClick=${ onReset }
							title=${ __( 'Reset Filters', 'workpress' ) }
						>
							<i className="dashicons dashicons-undo" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
							<span>${ __( 'Reset', 'workpress' ) }</span>
						</button>
					` }

					${ ( totalCount !== null || totalUnfiltered !== null ) && html`
						<span className="wp-filter-counter">
							<i className="dashicons dashicons-filter" style=${{ fontSize: '12px', width: '12px', height: '12px' }}></i>
							${ ( totalUnfiltered !== null && totalCount !== null && totalCount !== totalUnfiltered )
								? sprintf( __( 'Showing %s of %s %s', 'workpress' ), formatNumber( totalCount ), formatNumber( totalUnfiltered ), label )
								: `${ formatNumber( totalCount !== null ? totalCount : totalUnfiltered ) } ${ label }`
							}
						</span>
					` }

					${ extraActions }
				</div>
			` }
		</div>
	`;

	if ( portalRoot ) {
		return createPortal( content, portalRoot );
	}

	return content;
}
