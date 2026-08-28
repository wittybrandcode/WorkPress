import { html, createPortal } from '../../utils/html.js';
import CustomSelect from './CustomSelect.js';
import MemberSelect from './MemberSelect.js';
import { formatNumber } from '../../utils/datetime.js';

/**
 * Unified Contextual Fixed FilterBar Component
 *
 * @param {Object} props
 * @param {Object} [props.search] - { value, onChange, placeholder }
 * @param {Array} [props.filters] - Array of { key, label, icon, value, onChange, options, placeholder, isCustomSelect, width }
 * @param {number} [props.totalCount] - Current filtered items count
 * @param {number} [props.totalUnfiltered] - Total unfiltered items count
 * @param {string} [props.counterLabel] - Label for counter (e.g. "Ù…Ù‡Ù…Ø©", "Ù…Ø´Ø±ÙˆØ¹", "Ø­Ù„")
 * @param {boolean} [props.isFilterActive] - Whether any filter is active
 * @param {Function} [props.onReset] - Callback to reset all filters
 * @param {any} [props.extraActions] - Optional extra components on the left
 */
export default function FilterBar({
	search,
	filters = [],
	totalCount = null,
	totalUnfiltered = null,
	counterLabel = 'Ø¹Ù†ØµØ±',
	isFilterActive = false,
	onReset = null,
	extraActions = null,
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const content = html`
		<div className="wp-filter-toolbar">
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
							placeholder=${ search.placeholder || 'Ø¨Ø­Ø« Ø³Ø±ÙŠØ¹...' }
							value=${ search.value || '' }
							onInput=${ (e) => search.onChange( e.target.value ) }
						/>
						${ search.value && html`
							<button 
								type="button" 
								className="wp-filter-search-clear" 
								title="Ù…Ø³Ø­ Ø§Ù„Ø¨Ø­Ø«"
								onClick=${ () => search.onChange('') }
							>
								<i className="dashicons dashicons-no-alt"></i>
							</button>
						` }
					</div>
				` }

				<!-- Contextual Filters -->
				${ filters.map( ( f ) => {
					if ( ! f ) return null;
					return html`
						<div key=${ f.key } className="wp-filter-item">
							${ f.label && html`
								<span className="wp-filter-label">
									${ f.icon && html`<i className=${`dashicons ${f.icon}`}></i>` }
									${ f.label }:
								</span>
							` }
							
							<div style=${{ minWidth: f.width || '150px' }}>
								${ f.isMemberSelect ? html`
									<${MemberSelect}
										value=${ f.value }
										onChange=${ f.onChange }
										users=${ f.users || [] }
										placeholder=${ f.placeholder || '-- ÙƒÙ„ Ø§Ù„Ù…ÙƒÙ„ÙÙŠÙ† --' }
										size="small"
									/>
								` : f.isCustomSelect ? html`
									<${CustomSelect}
										value=${ f.value }
										onChange=${ f.onChange }
										options=${ f.options || [] }
										placeholder=${ f.placeholder || '-- Ø§Ù„ÙƒÙ„ --' }
									/>
								` : html`
									<div className="select is-small" style=${{ width: '100%' }}>
										<select 
											className="wp-filter-input"
											style=${{ width: '100%' }}
											value=${ f.value }
											onChange=${ (e) => f.onChange( e.target.value ) }
										>
											${ ( f.options || [] ).map( ( opt ) => html`
												<option key=${ opt.value } value=${ opt.value }>
													${ opt.label }
												</option>
											` ) }
										</select>
									</div>
								` }
							</div>
						</div>
					`;
				} ) }
			</div>

			<!-- Actions & Counters -->
			<div className="wp-filter-actions">
				${ ( totalCount !== null || totalUnfiltered !== null ) && html`
					<span className="wp-filter-counter">
						<i className="dashicons dashicons-filter" style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
						${ ( totalUnfiltered !== null && totalCount !== null && totalCount !== totalUnfiltered )
							? `Ø¹Ø±Ø¶ ${ formatNumber( totalCount ) } Ù…Ù† ${ formatNumber( totalUnfiltered ) } ${ counterLabel }`
							: `${ formatNumber( totalCount !== null ? totalCount : totalUnfiltered ) } ${ counterLabel }`
						}
					</span>
				` }

				${ isFilterActive && onReset && html`
					<button 
						type="button" 
						className="wp-icon-btn is-dense is-danger ml-2" 
						onClick=${ onReset }
						title="Ø¥Ø¹Ø§Ø¯Ø© ØªØ¹ÙŠÙŠÙ† ÙƒØ§ÙØ© Ø§Ù„ÙÙ„Ø§ØªØ± ÙˆØ§Ù„Ø¨Ø­Ø«"
					>
						<i className="dashicons dashicons-undo"></i>
					</button>
				` }

				${ extraActions }
			</div>
		</div>
	`;

	if ( portalRoot ) {
		return createPortal( content, portalRoot );
	}

	return content;
}
