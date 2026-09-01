import { html, __, isRtl } from '../../utils/html.js';

/**
 * Data Export, Archiving & Dev Environment Seeder/Purge Tab
 */
export default function ExportDiagnosticsTab({
	isExporting = false,
	handleExportJson,
	isSeeding = false,
	isPurging = false,
	handleSeedData,
	handlePurgeData
}) {
	const rtl = isRtl();

	return html`
		<div>
			<div className="wp-card p-5 mb-5">
				<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>${ __( 'Data Export & Archiving', 'workpress' ) }</h3>
				<p className="is-size-7 has-text-grey mb-4">${ __( 'Export project and task records in structured JSON format for backups and data migration.', 'workpress' ) }</p>
				
				<div className="buttons">
					<button 
						className=${`button is-primary wp-sharp-button ${ isExporting ? 'is-loading' : '' }`} 
						onClick=${handleExportJson}
						disabled=${isExporting}
					>
						<span className="icon"><i className="dashicons dashicons-download"></i></span>
						<span>${ __( 'Export Full Workspace JSON', 'workpress' ) }</span>
					</button>
				</div>
			</div>

			<!-- Dev Data Seeder & Environment Management Card -->
			<div className="wp-card p-5" style=${{ border: '1px solid #cbd5e1' }}>
				<div className="is-flex is-align-items-center mb-3">
					<span className="icon has-text-success" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.5rem' }}><i className="dashicons dashicons-database-import" style=${{ fontSize: '24px' }}></i></span>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Development Data Seeder Engine', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Generate realistic demo records (projects, kanban tasks, contributions, verified solutions) to explore all platform features in one click.', 'workpress' ) }</p>
					</div>
				</div>

				<div className="notification is-light p-3 mb-4" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
					<p className="is-size-7 has-text-dark">
						<i className=${`dashicons dashicons-info ${ rtl ? 'ml-1' : 'mr-1' } has-text-info`}></i>
						<strong>${ __( 'Safety Notice:', 'workpress' ) }</strong> ${ __( 'All generated demo entities are tagged and completely isolated from standard WordPress posts, and can be purged at any time.', 'workpress' ) }
					</p>
				</div>

				<div className="buttons">
					<button 
						className=${`button is-success wp-sharp-button ${ isSeeding ? 'is-loading' : '' }`}
						onClick=${handleSeedData}
						disabled=${isSeeding || isPurging}
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt"></i></span>
						<span>${ __( 'Seed Demo Workspace Data', 'workpress' ) }</span>
					</button>

					<button 
						className=${`button is-danger is-outlined wp-sharp-button ${ isPurging ? 'is-loading' : '' }`}
						onClick=${handlePurgeData}
						disabled=${isSeeding || isPurging}
					>
						<span className="icon"><i className="dashicons dashicons-trash"></i></span>
						<span>${ __( 'Purge Demo Data', 'workpress' ) }</span>
					</button>
				</div>
			</div>
		</div>
	`;
}
