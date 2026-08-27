import { html } from '../../utils/html.js';

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
	return html`
		<div>
			<div className="wp-card p-5 mb-5">
				<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>التصدير والأرشفة</h3>
				<p className="is-size-7 has-text-grey mb-4">يمكنك تصدير بيانات المشاريع والمهام بصيغة JSON لاستخدامها كنسخة احتياطية.</p>
				
				<div className="buttons">
					<button 
						className=${`button is-primary wp-sharp-button ${ isExporting ? 'is-loading' : '' }`} 
						onClick=${handleExportJson}
						disabled=${isExporting}
					>
						<span className="icon"><i className="dashicons dashicons-download"></i></span>
						<span>تصدير كل البيانات وتحميل JSON</span>
					</button>
				</div>
			</div>

			<!-- Dev Data Seeder & Environment Management Card -->
			<div className="wp-card p-5" style=${{ border: '1px solid #cbd5e1' }}>
				<div className="is-flex is-align-items-center mb-3">
					<span className="icon has-text-success ml-2"><i className="dashicons dashicons-database-import" style=${{ fontSize: '24px' }}></i></span>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">محرك البيانات التجريبية (Dev Data Seeder Engine)</h3>
						<p className="has-text-grey is-size-7">توليد بيئة عمل واقعية تحاكي منشأة حقيقية (مشاريع، مهام كانبان، مساهمات، وحلول معرفية معتمدة) لاختبار وتجربة كافة وظائف النظام بنقرة واحدة.</p>
					</div>
				</div>

				<div className="notification is-light p-3 mb-4" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
					<p className="is-size-7 has-text-dark">
						<i className="dashicons dashicons-info ml-1 has-text-info"></i>
						<strong>ملاحظة أمان:</strong> كافة العناصر المولدة بواسطة هذا المحرك موسومة برمجياً ولا تمس أو تغير أي محتوى أو منشورات أصلية لموقع ووردبريس، ويمكن تطهيرها وحذفها بالكامل في أي وقت.
					</p>
				</div>

				<div className="buttons">
					<button 
						className=${`button is-success wp-sharp-button ${ isSeeding ? 'is-loading' : '' }`}
						onClick=${handleSeedData}
						disabled=${isSeeding || isPurging}
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt"></i></span>
						<span>توليد بيانات بيئة العمل التجريبية</span>
					</button>

					<button 
						className=${`button is-danger is-outlined wp-sharp-button ${ isPurging ? 'is-loading' : '' }`}
						onClick=${handlePurgeData}
						disabled=${isSeeding || isPurging}
					>
						<span className="icon"><i className="dashicons dashicons-trash"></i></span>
						<span>تطهير وحذف البيانات التجريبية</span>
					</button>
				</div>
			</div>
		</div>
	`;
}
