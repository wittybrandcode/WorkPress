import { html, createPortal } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * Sticky Toolbar for Intake Forms Studio
 */
export default function IntakeFormsToolbar({
	forms = [],
	activeIdx = 0,
	setActiveIdx,
	handleAddFormTemplate,
	setShowPreviewModal,
	handleSaveAll,
	isSaving = false
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const toolbarContent = html`
		<div className="wp-filter-toolbar">
			<div className="wp-filter-group">
				<span className="wp-filter-label">
					<i className="dashicons dashicons-forms"></i>
					النماذج المتاحة:
				</span>

				<div className="buttons are-small mb-0" style=${{ gap: '6px', flexWrap: 'wrap' }}>
					${forms.map((f, i) => html`
						<button
							key=${f.id || i}
							type="button"
							className=${`button is-small wp-sharp-button ${activeIdx === i ? 'is-primary' : 'is-light'}`}
							onClick=${() => {
								setActiveIdx(i);
								sound.play('button');
							}}
							style=${{ fontWeight: '700' }}
						>
							<span>${f.name || `نموذج ${i + 1}`}</span>
						</button>
					`)}

					<button
						type="button"
						className="button is-small is-success is-outlined wp-sharp-button"
						onClick=${handleAddFormTemplate}
						title="إضافة قالب نموذج طلب جديد"
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>نموذج جديد</span>
					</button>
				</div>
			</div>

			<div className="wp-filter-actions">
				<button
					type="button"
					className="button is-small is-info is-outlined wp-sharp-button"
					onClick=${() => setShowPreviewModal(true)}
				>
					<span className="icon"><i className="dashicons dashicons-visibility"></i></span>
					<span>معاينة واجهة العميل</span>
				</button>

				<button
					type="button"
					className=${`button is-small is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSaveAll}
					disabled=${isSaving}
					style=${{ fontWeight: '800', minWidth: '140px' }}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ واعتماد النماذج</span>
				</button>
			</div>
		</div>
	`;

	return portalRoot ? createPortal( toolbarContent, portalRoot ) : toolbarContent;
}
