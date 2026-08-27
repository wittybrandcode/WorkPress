import { html } from '../../utils/html.js';
import { CORE_SERVICES } from './aboutData.js';

export default function ServicesSection() {
	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon ml-2" style=${{ marginLeft: '8px' }}><i className="dashicons dashicons-rest-api has-text-primary"></i></span>
				<span>الخدمات المعمارية الـ 17 في النواة (Core Services Layer)</span>
			</h3>

			<div className="columns is-multiline">
				${CORE_SERVICES.map(svc => html`
					<div className="column is-4" key=${svc.name}>
						<div className="wp-card p-3 h-100" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
							<div className="is-flex is-align-items-center mb-1">
								<span className="icon is-small ml-1" style=${{ marginLeft: '6px' }}><i className="dashicons dashicons-admin-generic has-text-primary"></i></span>
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
