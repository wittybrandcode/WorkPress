import { html } from '../../utils/html.js';
import { PILLARS } from './aboutData.js';

export default function PhilosophySection({ version }) {
	return html`
		<div className="mb-6">
			<div className="wp-card p-5 mb-5" style=${{ backgroundColor: '#f8fafc' }}>
				<h2 className="title is-4 mb-2 has-text-weight-bold has-text-dark">
					فلسفة المنظومة: التركيز على العمل نفسه (Just Work)
				</h2>
				<p className="has-text-grey" style=${{ lineHeight: 1.8 }}>
					<strong>WorkPress</strong> ليست مجرد أداة لإدارة المهام؛ بل هي <strong>بنية تحتية سيادية للذاكرة المؤسسية</strong> داخل ووردبريس.
					يقوم المنفذ بعمله الفعلي، يرفع الدليل والحل المعتمد، وتتولى المنظومة بقية السلسلة تلقائياً دون الحاجة لتحديث يدوي مجهد.
				</p>
			</div>

			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon ml-2" style=${{ marginLeft: '8px' }}><i className="dashicons dashicons-grid-view has-text-success"></i></span>
				<span>الركائز الهندسية الست لمنظومة WorkPress v${version}</span>
			</h3>

			<div className="columns is-multiline">
				${PILLARS.map(pillar => html`
					<div className="column is-4" key=${pillar.title}>
						<div className="wp-pillar-card">
							<div className="is-flex is-align-items-center mb-3">
								<span className="icon is-medium ml-2" style=${{ color: pillar.color, marginLeft: '8px' }}>
									<i className=${`dashicons ${pillar.icon}`} style=${{ fontSize: '24px' }}></i>
								</span>
								<div>
									<h4 className="title is-6 mb-0 has-text-weight-bold has-text-dark">${pillar.title}</h4>
									<span className="is-size-7 has-text-grey">${pillar.subtitle}</span>
								</div>
							</div>
							<p className="is-size-7 has-text-grey" style=${{ lineHeight: 1.6 }}>${pillar.desc}</p>
						</div>
					</div>
				`)}
			</div>
		</div>
	`;
}
