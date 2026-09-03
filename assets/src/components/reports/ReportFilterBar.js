import { html, __, sprintf, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';

/**
 * Reports Studio Unified Toolbar Component
 *
 * Built on the master UnifiedToolbar component.
 * - Section 1: Multi-domain Switcher (Projects, Tasks, Team) + Domain-specific KPI chips (Icons & Numbers Only).
 * - Section 2: Quick Search, Sort Controls, View Switcher (Cards / Table), Print/Export, Reset.
 */
export default function ReportFilterBar({
	activeDomain = 'projects',
	setActiveDomain,
	totalProjects = 0,
	activeProjectsCount = 0,
	completedProjectsCount = 0,
	atRiskProjectsCount = 0,
	totalSolutions = 0,
	completionRate = 0,
	taskStats = { total: 0, inProgress: 0, review: 0, completed: 0, overdue: 0 },
	teamStats = { totalMembers: 0, activeTasks: 0, verifiedSolutions: 0, highLoadMembers: 0 },
	searchQuery = '',
	setSearchQuery,
	statusFilter = 'all',
	setStatusFilter,
	sortBy = 'newest',
	setSortBy,
	viewMode = 'cards',
	setViewMode,
	onExport = null
}) {
	const rtl = isRtl();

	const handleReset = () => {
		setStatusFilter( 'all' );
		setSearchQuery( '' );
		setSortBy( 'newest' );
		sound.play( 'pop' );
	};

	const isFiltered = statusFilter !== 'all' || searchQuery !== '' || sortBy !== 'newest';

	const sectionStart = html`
		<!-- 1. محول المجالات التحليلية الثلاثية (Projects / Tasks / Team) -->
		<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ activeDomain === 'projects' ? 'is-active' : '' }` }
				onClick=${ () => { setActiveDomain( 'projects' ); setStatusFilter( 'all' ); sound.play( 'click' ); } }
				title=${ __( 'Projects Analytics Domain', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-portfolio" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ activeDomain === 'tasks' ? 'is-active' : '' }` }
				onClick=${ () => { setActiveDomain( 'tasks' ); setStatusFilter( 'all' ); sound.play( 'click' ); } }
				title=${ __( 'Task Velocity & Bottlenecks Domain', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-clipboard" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ activeDomain === 'team' ? 'is-active' : '' }` }
				onClick=${ () => { setActiveDomain( 'team' ); setStatusFilter( 'all' ); sound.play( 'click' ); } }
				title=${ __( 'Team Workload & Balancer Domain', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-admin-users" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		</div>

		<span className="wp-toolbar-divider"></span>

		<!-- 2. المؤشرات الإحصائية المحددة حسب المجال المختار (أيقونات وأرقام فقط) -->
		${ activeDomain === 'projects' ? html`
			<!-- إجمالي المشاريع -->
			<button
				type="button"
				className=${ `wp-stat-chip is-total ${ statusFilter === 'all' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'all' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'All Projects: %d', 'workpress' ), totalProjects ) }
			>
				<i className="dashicons dashicons-category"></i>
				<b>${ totalProjects }</b>
			</button>

			<!-- قيد التنفيذ -->
			<button
				type="button"
				className=${ `wp-stat-chip is-active-progress ${ statusFilter === 'active' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'active' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'In Progress: %d', 'workpress' ), activeProjectsCount ) }
			>
				<i className="dashicons dashicons-controls-play"></i>
				<b>${ activeProjectsCount }</b>
			</button>

			<!-- المكتملة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-approved ${ statusFilter === 'completed' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'completed' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Completed Projects: %d', 'workpress' ), completedProjectsCount ) }
			>
				<i className="dashicons dashicons-yes-alt"></i>
				<b>${ completedProjectsCount }</b>
			</button>

			<!-- في خطر / متأخرة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-danger-chip ${ statusFilter === 'at_risk' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'at_risk' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'At Risk Projects: %d', 'workpress' ), atRiskProjectsCount ) }
			>
				<i className="dashicons dashicons-warning"></i>
				<b>${ atRiskProjectsCount }</b>
			</button>

			<span className="wp-toolbar-divider"></span>

			<!-- أصول المعرفة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-kpi-knowledge ${ statusFilter === 'has_solutions' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'has_solutions' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Verified Knowledge Assets: %d', 'workpress' ), totalSolutions ) }
			>
				<i className="dashicons dashicons-star-filled"></i>
				<b>${ totalSolutions }</b>
			</button>

			<!-- متوسط الإنجاز العام -->
			<div
				className="wp-stat-chip is-progress-kpi"
				title=${ sprintf( __( 'Average Workspace Completion: %d%%', 'workpress' ), completionRate ) }
			>
				<i className="dashicons dashicons-chart-pie"></i>
				<b>${ completionRate }%</b>
			</div>
		` : activeDomain === 'tasks' ? html`
			<!-- إجمالي المهام -->
			<button
				type="button"
				className=${ `wp-stat-chip is-total ${ statusFilter === 'all' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'all' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Total Workspace Tasks: %d', 'workpress' ), taskStats.total ) }
			>
				<i className="dashicons dashicons-clipboard"></i>
				<b>${ taskStats.total }</b>
			</button>

			<!-- مهام قيد التنفيذ -->
			<button
				type="button"
				className=${ `wp-stat-chip is-active-progress ${ statusFilter === 'in_progress' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'in_progress' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'In Progress Tasks: %d', 'workpress' ), taskStats.inProgress ) }
			>
				<i className="dashicons dashicons-controls-play"></i>
				<b>${ taskStats.inProgress }</b>
			</button>

			<!-- مهام في المراجعة / عنق زجاجة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-pending ${ statusFilter === 'review' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'review' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Under Review / QA: %d', 'workpress' ), taskStats.review ) }
			>
				<i className="dashicons dashicons-visibility"></i>
				<b>${ taskStats.review }</b>
			</button>

			<!-- مهام منجزة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-approved ${ statusFilter === 'completed' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'completed' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Completed Tasks: %d', 'workpress' ), taskStats.completed ) }
			>
				<i className="dashicons dashicons-yes-alt"></i>
				<b>${ taskStats.completed }</b>
			</button>

			<!-- مهام متأخرة -->
			<button
				type="button"
				className=${ `wp-stat-chip is-danger-chip ${ statusFilter === 'overdue' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'overdue' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Overdue Tasks: %d', 'workpress' ), taskStats.overdue ) }
			>
				<i className="dashicons dashicons-warning"></i>
				<b>${ taskStats.overdue }</b>
			</button>
		` : html`
			<!-- أعضاء الفريق النشطون -->
			<button
				type="button"
				className=${ `wp-stat-chip is-total ${ statusFilter === 'all' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'all' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'Total Team Members: %d', 'workpress' ), teamStats.totalMembers ) }
			>
				<i className="dashicons dashicons-admin-users"></i>
				<b>${ teamStats.totalMembers }</b>
			</button>

			<!-- مهام نشطة قيد التوزيع -->
			<div
				className="wp-stat-chip is-active-progress"
				title=${ sprintf( __( 'Active Assigned Tasks: %d', 'workpress' ), teamStats.activeTasks ) }
			>
				<i className="dashicons dashicons-clipboard"></i>
				<b>${ teamStats.activeTasks }</b>
			</div>

			<!-- حلول معتمدة من الفريق -->
			<div
				className="wp-stat-chip is-approved"
				title=${ sprintf( __( 'Team Verified Solutions: %d', 'workpress' ), teamStats.verifiedSolutions ) }
			>
				<i className="dashicons dashicons-star-filled"></i>
				<b>${ teamStats.verifiedSolutions }</b>
			</div>

			<!-- أعضاء بضغط عمل مرتفع -->
			<button
				type="button"
				className=${ `wp-stat-chip is-danger-chip ${ statusFilter === 'high_load' ? 'is-active' : '' }` }
				onClick=${ () => { setStatusFilter( 'high_load' ); sound.play( 'button' ); } }
				title=${ sprintf( __( 'High Workload Members: %d', 'workpress' ), teamStats.highLoadMembers ) }
			>
				<i className="dashicons dashicons-warning"></i>
				<b>${ teamStats.highLoadMembers }</b>
			</button>
		` }
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
				onInput=${ ( e ) => setSearchQuery( e.target.value ) }
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

		<!-- مجموعة أيقونات الفرز والترتيب (Sort Group) -->
		<div className="wp-icon-btn-group" style=${{ height: '32px' }}>
			<button
				type="button"
				className=${ `wp-view-icon-btn ${ sortBy === 'progress_desc' ? 'is-active' : '' }` }
				onClick=${ () => { setSortBy( 'progress_desc' ); sound.play( 'click' ); } }
				title=${ __( 'Sort by Progress / Activity', 'workpress' ) }
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

		<!-- زر الطباعة / التصدير التنفيذي -->
		${ onExport && html`
			<button
				type="button"
				className="wp-icon-action-btn"
				onClick=${ onExport }
				title=${ __( 'Print / Export Executive Summary', 'workpress' ) }
				style=${{ width: '32px', height: '32px' }}
			>
				<i className="dashicons dashicons-printer" style=${{ fontSize: '15px', width: '15px', height: '15px' }}></i>
			</button>
		` }

		<!-- زر إعادة ضبط الفلاتر عند التنشيط -->
		${ isFiltered && html`
			<button
				type="button"
				className="wp-icon-action-btn"
				onClick=${ handleReset }
				title=${ __( 'Reset all filters', 'workpress' ) }
				style=${{ height: '32px', width: '32px', color: '#ef4444' }}
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
