import { html, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';
import SnowflakeIcon from '../ui/SnowflakeIcon.js';

/**
 * Projects Master Unified Toolbar Component
 *
 * Built on UnifiedToolbar.
 * - Section 1: KPI Stats & Status Chips (Total, Active, Completed, Pending Requests, Frozen, Archived) - Icons & Numbers ONLY.
 * - Section 2: Search input, Sort Group, View Switcher (Cards/Table), "+ New Project" Button, Reset.
 */
export default function ProjectFilterBar({
	totalCount = 0,
	activeCount = 0,
	completedCount = 0,
	pendingCount = 0,
	frozenCount = 0,
	archivedCount = 0,
	selectedStatus = 'all',
	setSelectedStatus,
	searchQuery = '',
	setSearchQuery,
	sortBy = 'newest',
	setSortBy,
	viewMode = 'cards',
	setViewMode,
	onNewProject,
	onReset
}) {
	const rtl = isRtl();

	const isTotalActive = selectedStatus === 'all';
	const isActiveActive = selectedStatus === 'active';
	const isCompletedActive = selectedStatus === 'completed';
	const isPendingActive = selectedStatus === 'pending';
	const isFrozenActive = selectedStatus === 'frozen';
	const isArchivedActive = selectedStatus === 'archived';

	const isFilterActive = selectedStatus !== 'all' || Boolean( searchQuery.trim() ) || sortBy !== 'newest';

	const sectionStart = html`
		<!-- 1. إجمالي المشاريع -->
		<button
			type="button"
			className=${ `wp-stat-chip is-total ${ isTotalActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'All Projects: %d', 'workpress' ), totalCount ) }
		>
			<i className="dashicons dashicons-category"></i>
			<b>${ totalCount }</b>
		</button>

		<!-- 2. المشاريع النشطة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-active-progress ${ isActiveActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'active' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Active Projects: %d', 'workpress' ), activeCount ) }
		>
			<i className="dashicons dashicons-controls-play"></i>
			<b>${ activeCount }</b>
		</button>

		<!-- 3. المشاريع المكتملة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-approved ${ isCompletedActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'completed' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Completed Projects: %d', 'workpress' ), completedCount ) }
		>
			<i className="dashicons dashicons-yes-alt"></i>
			<b>${ completedCount }</b>
		</button>

		<!-- 4. طلبات ومقترحات واردة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-pending ${ isPendingActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'pending' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Incoming Requests & Pending: %d', 'workpress' ), pendingCount ) }
		>
			<i className="dashicons dashicons-email-alt"></i>
			<b>${ pendingCount }</b>
		</button>

		<!-- 5. المشاريع المجمدة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-system-chip ${ isFrozenActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'frozen' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Frozen / Paused Projects: %d', 'workpress' ), frozenCount ) }
		>
			<${SnowflakeIcon} size=${ 14 } />
			<b>${ frozenCount }</b>
		</button>

		<!-- 6. المؤرشفة وسلة المهملات -->
		${ archivedCount > 0 && html`
			<button
				type="button"
				className=${ `wp-stat-chip is-danger-chip ${ isArchivedActive ? 'is-active' : '' }` }
				onClick=${ () => { setSelectedStatus( 'archived' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Archived & Pending Trash: %d', 'workpress' ), archivedCount ) }
			>
				<i className="dashicons dashicons-trash"></i>
				<b>${ archivedCount }</b>
			</button>
		` }
	`;

	const sectionEnd = html`
		<!-- مربع البحث السريع -->
		<div className="wp-filter-search-box" style=${{ width: '170px', minWidth: '130px' }}>
			<span className="wp-filter-search-icon">
				<i className="dashicons dashicons-search"></i>
			</span>
			<input
				type="text"
				className="input wp-filter-input"
				value=${ searchQuery }
				onInput=${ e => setSearchQuery( e.target.value ) }
				placeholder=${ __( 'Search projects...', 'workpress' ) }
			/>
			${ searchQuery && html`
				<button 
					type="button"
					onClick=${ () => setSearchQuery( '' ) }
					style=${{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 6px', color: '#94a3b8' }}
					title=${ __( 'Clear search', 'workpress' ) }
				>
					<i className="dashicons dashicons-no-alt" style=${{ fontSize: '14px' }}></i>
				</button>
			` }
		</div>

		<!-- مجموعة أيقونات الفرز والترتيب (Sort Group) -->
		<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ sortBy === 'progress_desc' ? 'is-active' : '' }` }
				onClick=${ () => { setSortBy( 'progress_desc' ); sound.play( 'click' ); } }
				title=${ __( 'Sort by Completion Progress', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-chart-line" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ sortBy === 'name' ? 'is-active' : '' }` }
				onClick=${ () => { setSortBy( 'name' ); sound.play( 'click' ); } }
				title=${ __( 'Sort Alphabetically', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-sort" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ sortBy === 'newest' ? 'is-active' : '' }` }
				onClick=${ () => { setSortBy( 'newest' ); sound.play( 'click' ); } }
				title=${ __( 'Sort by Newest', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		</div>

		<!-- مجموعة أيقونات نمط العرض (Cards vs Table View) -->
		<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'cards' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'cards' ); sound.play( 'click' ); } }
				title=${ __( 'Grid Cards View (3 per row)', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-grid-view" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'table' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'table' ); sound.play( 'click' ); } }
				title=${ __( 'Executive Table View', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-list-view" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		</div>

		<!-- زر إعادة ضبط الفلاتر عند التنشيط -->
		${ isFilterActive && html`
			<button
				type="button"
				className="wp-icon-action-btn"
				onClick=${ () => { onReset && onReset(); sound.play( 'pop' ); } }
				title=${ __( 'Reset all filters', 'workpress' ) }
				style=${{ height: '32px', width: '32px' }}
			>
				<i className="dashicons dashicons-image-rotate" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		` }
	`;

	return html`
		<${UnifiedToolbar}
			sectionStart=${ sectionStart }
			sectionEnd=${ sectionEnd }
		/>
	`;
}
