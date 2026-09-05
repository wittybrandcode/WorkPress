import { html, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';
import CustomSelect from '../ui/CustomSelect.js';
import MemberSelect from '../ui/MemberSelect.js';

/**
 * TaskFilterBar Component
 *
 * Master Unified Toolbar for Kanban and Task views, strictly adhering
 * to WorkPress Constitution §2.7:
 * - Mounted via Portal into #wp-filterbar-portal-root with 44px fixed height.
 * - Section 1 (Start): KPI Status Chips (Icons & Numbers ONLY).
 * - Section 2 (End): Quick search, Project filter, Assignee filter, Priority filter, Load More, Reset.
 */
export default function TaskFilterBar({
	totalCount = 0,
	newCount = 0,
	assignedCount = 0,
	inProgressCount = 0,
	completedCount = 0,
	selectedStatus = 'all',
	setSelectedStatus,
	searchQuery = '',
	setSearchQuery,
	selectedProject = '',
	setSelectedProject,
	projectOptions = [],
	selectedAssignee = '',
	setSelectedAssignee,
	users = [],
	selectedPriority = '',
	setSelectedPriority,
	priorityOptions = [],
	isFilterActive = false,
	onReset
}) {
	const rtl = isRtl();

	const isTotalActive = selectedStatus === 'all';
	const isNewActive = selectedStatus === 'new';
	const isAssignedActive = selectedStatus === 'assigned';
	const isInProgressActive = selectedStatus === 'in_progress';
	const isCompletedActive = selectedStatus === 'completed';

	// =========================================================================
	// SECTION START: KPI Stats Chips (أيقونات وأرقام فقط)
	// =========================================================================
	const sectionStart = html`
		<!-- 1. إجمالي المهام -->
		<button
			type="button"
			className=${ `wp-stat-chip is-total ${ isTotalActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( 'all' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'All Tasks: %d', 'workpress' ), totalCount ) }
		>
			<i className="dashicons dashicons-clipboard"></i>
			<b>${ totalCount }</b>
		</button>

		<!-- 2. جديدة وغير معينة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-pending ${ isNewActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( isNewActive ? 'all' : 'new' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'New / Unassigned Tasks: %d', 'workpress' ), newCount ) }
		>
			<i className="dashicons dashicons-tag"></i>
			<b>${ newCount }</b>
		</button>

		<!-- 3. معينة للموظفين -->
		<button
			type="button"
			className=${ `wp-stat-chip is-active-progress ${ isAssignedActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( isAssignedActive ? 'all' : 'assigned' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Assigned Tasks: %d', 'workpress' ), assignedCount ) }
		>
			<i className="dashicons dashicons-admin-users"></i>
			<b>${ assignedCount }</b>
		</button>

		<!-- 4. قيد التنفيذ والتعاون -->
		<button
			type="button"
			className=${ `wp-stat-chip is-system-chip ${ isInProgressActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( isInProgressActive ? 'all' : 'in_progress' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'In Progress Tasks: %d', 'workpress' ), inProgressCount ) }
		>
			<i className="dashicons dashicons-hammer"></i>
			<b>${ inProgressCount }</b>
		</button>

		<!-- 5. مكتملة ومعتمدة -->
		<button
			type="button"
			className=${ `wp-stat-chip is-approved ${ isCompletedActive ? 'is-active' : '' }` }
			onClick=${ () => { setSelectedStatus( isCompletedActive ? 'all' : 'completed' ); sound.play( 'button' ); } }
			title=${ sprintf( __( 'Completed Tasks: %d', 'workpress' ), completedCount ) }
		>
			<i className="dashicons dashicons-yes-alt"></i>
			<b>${ completedCount }</b>
		</button>
	`;

	// =========================================================================
	// SECTION END: الفلترة والبحث والإجراءات التنفيذية
	// =========================================================================
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
				placeholder=${ __( 'Search tasks...', 'workpress' ) }
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

		<!-- قائمة المشاريع المنسدلة الموحدة -->
		<${CustomSelect}
			value=${ selectedProject }
			onChange=${ setSelectedProject }
			options=${ projectOptions }
			placeholder=${ __( 'Project', 'workpress' ) }
			icon="dashicons-portfolio"
			width="140px"
		/>

		<!-- قائمة المكلفين المركزية الموحدة -->
		<${MemberSelect}
			value=${ selectedAssignee }
			onChange=${ setSelectedAssignee }
			users=${ users }
			placeholder=${ __( 'Assignees', 'workpress' ) }
			width="140px"
			size="small"
		/>

		<!-- قائمة الأولويات الموحدة -->
		<${CustomSelect}
			value=${ selectedPriority }
			onChange=${ setSelectedPriority }
			options=${ priorityOptions }
			placeholder=${ __( 'Priority', 'workpress' ) }
			icon="dashicons-flag"
			width="115px"
		/>

		<!-- زر إعادة الضبط عند تنشيط أي فلتر -->
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
