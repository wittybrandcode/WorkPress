import { html, __, sprintf, isRtl } from '../../utils/html.js';
import CustomSelect from '../ui/CustomSelect.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';
import sound from '../../utils/sound.js';

/**
 * Request Studio Unified Fixed Toolbar Component
 *
 * Built on UnifiedToolbar and mounted via Portal to the exact header horizon.
 */
export default function RequestFilterBar({
	totalRequests = 0,
	pendingRequestsCount = 0,
	underReviewRequestsCount = 0,
	activeRequestsCount = 0,
	rejectedRequestsCount = 0,
	viewMode = 'cards',
	setViewMode,
	searchQuery = '',
	setSearchQuery,
	uniqueForms = [],
	selectedFormFilter = 'all',
	setSelectedFormFilter,
	selectedSort = 'newest',
	setSelectedSort,
	selectedStatus = 'all',
	setSelectedStatus
}) {
	const rtl = isRtl();

	// Form template filter options
	const formOptions = [
		{ value: 'all', label: sprintf( __( 'All Forms (%d)', 'workpress' ), totalRequests ) },
		...uniqueForms.map( fId => ({ value: fId, label: fId }) )
	];

	// Sorting options
	const sortOptions = [
		{ value: 'newest', label: __( 'Newest', 'workpress' ) },
		{ value: 'oldest', label: __( 'Oldest', 'workpress' ) },
		{ value: 'deadline', label: __( 'Deadline', 'workpress' ) },
	];

	const sectionStart = html`
		<!-- 1. All Requests -->
		<button
			type="button"
			className=${ `wp-stat-chip is-total ${ selectedStatus === 'all' ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'All Requests: %d', 'workpress' ), totalRequests ) }
		>
			<i className="dashicons dashicons-email-alt"></i>
			<b>${ totalRequests }</b>
		</button>

		<!-- 2. Pending / Inbox -->
		<button
			type="button"
			className=${ `wp-stat-chip is-pending ${ selectedStatus === 'pending' ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'pending' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Inbox / Pending: %d', 'workpress' ), pendingRequestsCount ) }
		>
			<i className="dashicons dashicons-clock"></i>
			<b>${ pendingRequestsCount }</b>
		</button>

		<!-- 3. Under Review -->
		<button
			type="button"
			className=${ `wp-stat-chip is-review ${ selectedStatus === 'under_review' ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'under_review' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Under Review: %d', 'workpress' ), underReviewRequestsCount ) }
		>
			<i className="dashicons dashicons-search"></i>
			<b>${ underReviewRequestsCount }</b>
		</button>

		<!-- 4. Approved -->
		<button
			type="button"
			className=${ `wp-stat-chip is-approved ${ selectedStatus === 'active' ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'active' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Approved: %d', 'workpress' ), activeRequestsCount ) }
		>
			<i className="dashicons dashicons-yes-alt"></i>
			<b>${ activeRequestsCount }</b>
		</button>

		<!-- 5. Rejected -->
		<button
			type="button"
			className=${ `wp-stat-chip is-rejected ${ selectedStatus === 'rejected' ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'rejected' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Rejected: %d', 'workpress' ), rejectedRequestsCount ) }
		>
			<i className="dashicons dashicons-dismiss"></i>
			<b>${ rejectedRequestsCount }</b>
		</button>
	`;

	const sectionEnd = html`
		<!-- Quick Search Input -->
		<div className="wp-filter-search-box" style=${{ width: '170px', minWidth: '130px' }}>
			<span className="wp-filter-search-icon">
				<i className="dashicons dashicons-search"></i>
			</span>
			<input
				type="text"
				className="input wp-filter-input"
				value=${ searchQuery }
				onInput=${ e => setSearchQuery( e.target.value ) }
				placeholder=${ __( 'Search requests...', 'workpress' ) }
			/>
			${ searchQuery && html`
				<button
					type="button"
					className="wp-filter-search-clear"
					title=${ __( 'Clear search', 'workpress' ) }
					onClick=${ () => setSearchQuery('') }
				>
					<i className="dashicons dashicons-no-alt"></i>
				</button>
			` }
		</div>

		<!-- Form Templates Dropdown -->
		<${CustomSelect}
			value=${ selectedFormFilter }
			onChange=${ (val) => { setSelectedFormFilter(val); sound.play('button'); } }
			options=${ formOptions }
			placeholder=${ __( 'Form Template', 'workpress' ) }
			icon="dashicons-forms"
			width="135px"
		/>

		<!-- Sort Dropdown -->
		<${CustomSelect}
			value=${ selectedSort }
			onChange=${ (val) => { setSelectedSort(val); sound.play('button'); } }
			options=${ sortOptions }
			placeholder=${ __( 'Sort', 'workpress' ) }
			icon="dashicons-sort"
			width="115px"
		/>

		<!-- View Mode Switcher -->
		<div className="wp-icon-btn-group">
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'cards' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'cards' ); sound.play( 'button' ); } }
				title=${ __( 'Cards & Specs View', 'workpress' ) }
			>
				<i className="dashicons dashicons-grid-view" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'kanban' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'kanban' ); sound.play( 'button' ); } }
				title=${ __( 'Triage Kanban Board', 'workpress' ) }
			>
				<i className="dashicons dashicons-columns" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'table' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'table' ); sound.play( 'button' ); } }
				title=${ __( 'Quick Triage Table', 'workpress' ) }
			>
				<i className="dashicons dashicons-list-view" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		</div>
	`;

	return html`
		<${UnifiedToolbar}
			sectionStart=${ sectionStart }
			sectionEnd=${ sectionEnd }
		/>
	`;
}
