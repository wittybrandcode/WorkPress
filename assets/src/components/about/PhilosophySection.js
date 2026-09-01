import { html, __, sprintf, isRtl } from '../../utils/html.js';
import { getPillars } from './aboutData.js';

export default function PhilosophySection({ version }) {
	const pillars = getPillars();
	const rtl = isRtl();

	return html`
		<div className="mb-6">
			<div className="wp-card p-5 mb-5" style=${{ backgroundColor: '#f8fafc' }}>
				<h2 className="title is-4 mb-2 has-text-weight-bold has-text-dark">
					${ __( 'System Philosophy: Focus on Pure Execution (Just Work)', 'workpress' ) }
				</h2>
				<p className="has-text-grey" style=${{ lineHeight: 1.8 }}>
					<strong>WorkPress</strong> ${ __( 'is not merely a task tracker; it is a sovereign institutional memory infrastructure within native WordPress. Specialists focus on actual execution, providing tangible evidence and solutions, while the platform coordinates workflow lifecycles automatically.', 'workpress' ) }
				</p>
			</div>

			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}><i className="dashicons dashicons-grid-view has-text-success"></i></span>
				<span>${ sprintf( __( 'The 6 Architectural Pillars of WorkPress v%s', 'workpress' ), version ) }</span>
			</h3>

			<div className="columns is-multiline">
				${pillars.map(pillar => html`
					<div className="column is-4" key=${pillar.title}>
						<div className="wp-pillar-card">
							<div className="is-flex is-align-items-center mb-3">
								<span className="icon is-medium" style=${{ color: pillar.color, [rtl ? 'marginLeft' : 'marginRight']: '8px' }}>
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
