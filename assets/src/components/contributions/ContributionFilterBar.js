import { html, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';
import CustomSelect from '../ui/CustomSelect.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';

/**
 * Contributions Unified Toolbar Component
 *
 * Built on the master UnifiedToolbar component.
 * - Height: 44px with 0 1.5rem padding.
 * - Section 1: Stats & Filter Chips (Total, Approved, Pending, Work Notes, System Logs) - Icons & Numbers ONLY.
 * - Section 2: Search, Advanced Filters (Project, Task, Member), View Switcher (Cards / Table), Reset.
 */
export default function ContributionFilterBar({
	totalCount = 0,
	acceptedCount = 0,
	pendingCount = 0,
	workCount = 0,
	systemCount = 0,
	searchQuery = '',
	setSearchQuery,
	selectedStatus = 'all',
	setSelectedStatus,
	selectedType = 'all',
	setSelectedType,
	selectedProject = '',
	onProjectChange,
	projectOptions = [],
	selectedTask = '',
	setSelectedTask,
	taskOptions = [],
	selectedAuthor = '',
	setSelectedAuthor,
	authorOptions = [],
	viewMode = 'cards',
	setViewMode,
	isFilterActive = false,
	onReset
}) {
	const rtl = isRtl();

	const isTotalActive = selectedStatus === 'all' && selectedType === 'all';
	const isAcceptedActive = selectedStatus === 'accepted';
	const isPendingActive = selectedStatus === 'pending';
	const isWorkActive = selectedType === 'work';
	const isSystemActive = selectedType === 'system';

	const sectionStart = html`
		<!-- 1. إجمالي المساهمات -->
		<button
			type="button"
			className=${ `wp-stat-chip is-total ${ isTotalActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'all' ); setSelectedType( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'All Contributions: %d', 'workpress' ), totalCount ) }
		>
			<i className="dashicons dashicons-category"></i>
			<b>${ totalCount }</b>
		</button>

		<!-- 2. الحلول المعتمدة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-approved ${ isAcceptedActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'accepted' ); setSelectedType( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Approved Solutions: %d', 'workpress' ), acceptedCount ) }
		>
			<i className="dashicons dashicons-star-filled"></i>
			<b>${ acceptedCount }</b>
		</button>

		<!-- 3. قيد المراجعة / معلقة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-pending ${ isPendingActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'pending' ); setSelectedType( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Pending Review: %d', 'workpress' ), pendingCount ) }
		>
			<i className="dashicons dashicons-clock"></i>
			<b>${ pendingCount }</b>
		</button>

		<span className="wp-toolbar-divider"></span>

		<!-- 4. مساهمات العمل والملاحظات -->
		<button
			type="button"
			className=${ `wp-stat-chip is-active-progress ${ isWorkActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedType( 'work' ); setSelectedStatus( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Team Work & Technical Solutions: %d', 'workpress' ), workCount ) }
		>
			<i className="dashicons dashicons-admin-comments"></i>
			<b>${ workCount }</b>
		</button>

		<!-- 5. سجلات النظام والتحديثات -->
		<button
			type="button"
			className=${ `wp-stat-chip is-system-chip ${ isSystemActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedType( 'system' ); setSelectedStatus( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'System Logs & State Changes: %d', 'workpress' ), systemCount ) }
		>
			<i className="dashicons dashicons-admin-generic"></i>
			<b>${ systemCount }</b>
		</button>
	`;

	const sectionEnd = html`
		<!-- مربع البحث السريع -->
		<div className="wp-filter-search-box" style=${{ width: '160px', minWidth: '120px' }}>
			<span className="wp-filter-search-icon">
				<i className="dashicons dashicons-search"></i>
			</span>
			<input
				type="text"
				className="input wp-filter-input"
				value=${ searchQuery }
				onInput=${ e => setSearchQuery( e.target.value ) }
				placeholder=${ __( 'Search...', 'workpress' ) }
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

		<!-- فلتر المشروع المركزي (CustomSelect) -->
		${ projectOptions && projectOptions.length > 1 && html`
			<${CustomSelect}
				value=${ selectedProject }
				onChange=${ onProjectChange }
				options=${ projectOptions }
				placeholder=${ __( 'All Projects', 'workpress' ) }
				icon="dashicons-portfolio"
				width="140px"
			/>
		` }

		<!-- فلتر المهمة التابع (Task CustomSelect) -->
		${ taskOptions && taskOptions.length > 1 && html`
			<${CustomSelect}
				value=${ selectedTask }
				onChange=${ ( val ) => { setSelectedTask( val ); sound.play( 'click' ); } }
				options=${ taskOptions }
				placeholder=${ __( 'All Tasks', 'workpress' ) }
				icon="dashicons-clipboard"
				width="140px"
			/>
		` }

		<!-- فلتر العضو / صاحب المساهمة (Author CustomSelect) -->
		${ authorOptions && authorOptions.length > 1 && html`
			<${CustomSelect}
				value=${ selectedAuthor }
				onChange=${ ( val ) => { setSelectedAuthor( val ); sound.play( 'click' ); } }
				options=${ authorOptions }
				placeholder=${ __( 'All Members', 'workpress' ) }
				icon="dashicons-admin-users"
				width="135px"
			/>
		` }

		<!-- مجموعة أيقونات نمط العرض (Cards vs Table) -->
		<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ viewMode === 'cards' ? 'is-active' : '' }` }
				onClick=${ () => { setViewMode( 'cards' ); sound.play( 'click' ); } }
				title=${ __( 'Grid Cards View', 'workpress' ) }
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
