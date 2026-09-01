import { html, __, isRtl } from '../../utils/html.js';
import { getCoreServices } from './aboutData.js';

export default function ServicesSection() {
	const coreServices = getCoreServices();
	const rtl = isRtl();

	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}><i className="dashicons dashicons-rest-api has-text-primary"></i></span>
				<span>${ __( 'The 17 Architectural Services in Core (Core Services Layer)', 'workpress' ) }</span>
			</h3>

			<div className="columns is-multiline">
				${coreServices.map(svc => html`
					<div className="column is-4" key=${svc.name}>
						<div className="wp-card p-3 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
							<div className="is-flex is-align-items-center mb-1">
								<span className="icon is-small" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '6px' }}><i className="dashicons dashicons-admin-generic has-text-primary"></i></span>
								<strong className="is-size-7 has-text-dark font-monospace">${svc.name}</strong>
							</div>
							<p className="is-size-7 has-text-grey" style=${{ lineHeight: 1.5 }}>${svc.role}</p>
						</div>
					</div>
				`)}
			</div>
		</div>
	`;
}
