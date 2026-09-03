import { html, __, sprintf, isRtl } from '../../utils/html.js';
import CustomSelect from '../ui/CustomSelect.js';
import UnifiedToolbar from '../ui/UnifiedToolbar.js';
import sound from '../../utils/sound.js';

/**
 * Knowledge Base Master Unified Toolbar Component
 *
 * Mounts directly into the top portal horizon under the breadcrumb.
 */
export default function KnowledgeFilterBar({
	totalCount = 0,
	filteredCount = 0,
	searchQuery = '',
	setSearchQuery,
	selectedProject = '',
	setSelectedProject,
	projectOptions = [],
	selectedType = 'all',
	setSelectedType,
	typeOptions = [],
	isFilterActive = false,
	onReset
}) {
	const rtl = isRtl();

	const sectionStart = html`
		<!-- 1. Total Approved Solutions Chip -->
		<button
			type="button"
			className="wp-stat-chip is-total is-active"
			title=${ sprintf( __( 'Approved Knowledge Assets: %d', 'workpress' ), totalCount ) }
			style=${{ cursor: 'default' }}
		>
			<i className="dashicons dashicons-book"></i>
			<b>${ isFilterActive ? `${filteredCount} / ${totalCount}` : totalCount }</b>
		</button>
	`;

	const sectionEnd = html`
		<!-- Search Input -->
		<div className="wp-filter-search-box" style=${{ width: '220px', minWidth: '150px' }}>
			<span className="wp-filter-search-icon">
				<i className="dashicons dashicons-search"></i>
			</span>
			<input
				type="text"
				className="input wp-filter-input"
				value=${ searchQuery }
				onInput=${ e => setSearchQuery( e.target.value ) }
				placeholder=${ __( 'Search knowledge assets...', 'workpress' ) }
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

		<!-- Project Selector -->
		<${CustomSelect}
			value=${ selectedProject }
			onChange=${ (val) => { setSelectedProject(val); sound.play('button'); } }
			options=${ projectOptions }
			placeholder=${ __( 'Filter by Project', 'workpress' ) }
			icon="dashicons-portfolio"
			width="170px"
		/>

		<!-- Solution Type Selector -->
		<${CustomSelect}
			value=${ selectedType }
			onChange=${ (val) => { setSelectedType(val); sound.play('button'); } }
			options=${ typeOptions }
			placeholder=${ __( 'Solution Type', 'workpress' ) }
			icon="dashicons-share-alt2"
			width="140px"
		/>

		<!-- Reset Button -->
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
