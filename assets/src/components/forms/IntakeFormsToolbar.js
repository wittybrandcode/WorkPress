import { html, createPortal, __, sprintf } from '../../utils/html.js';
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
					${ __( 'Available Templates:', 'workpress' ) }
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
							<span>${f.name || sprintf( __( 'Form %d', 'workpress' ), i + 1 )}</span>
						</button>
					`)}

					<button
						type="button"
						className="button is-small is-success is-outlined wp-sharp-button"
						onClick=${handleAddFormTemplate}
						title=${ __( 'Add new form template', 'workpress' ) }
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>${ __( 'New Template', 'workpress' ) }</span>
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
					<span>${ __( 'Preview Client Portal', 'workpress' ) }</span>
				</button>

				<button
					type="button"
					className=${`button is-small is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
					onClick=${handleSaveAll}
					disabled=${isSaving}
					style=${{ fontWeight: '800', minWidth: '140px' }}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ __( 'Save & Sync Forms', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	return portalRoot ? createPortal( toolbarContent, portalRoot ) : toolbarContent;
}
