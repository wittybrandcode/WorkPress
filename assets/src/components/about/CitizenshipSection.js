import { html, __, isRtl } from '../../utils/html.js';

export default function CitizenshipSection() {
	const rtl = isRtl();

	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}><i className="dashicons dashicons-groups has-text-info"></i></span>
				<span>${ __( '4-Tier Citizenship Hierarchy & The 3 Workspaces', 'workpress' ) }</span>
			</h3>

			<div className="columns is-multiline mb-4">
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
						<span className="tag is-dark mb-2">${ __( 'Tier 1: Executive', 'workpress' ) }</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">${ __( 'Administrator', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey">${ __( 'Full sovereign governance across all projects, triage studio, and system settings.', 'workpress' ) }</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
						<span className="tag is-primary mb-2">${ __( 'Tier 2: Leadership', 'workpress' ) }</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">${ __( 'Project Lead', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey">${ __( 'Project task coordinator, solution approver, and specialist assigner within their project scope.', 'workpress' ) }</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
						<span className="tag is-info is-light mb-2">${ __( 'Tier 3: Operations', 'workpress' ) }</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">${ __( 'Specialist', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey">${ __( 'Task implementer, solution contributor, evidence provider, and time tracker.', 'workpress' ) }</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ border: '1px solid #e2e8f0', borderRadius: 0 }}>
						<span className="tag is-warning is-light mb-2">${ __( 'Tier 4: Stakeholders', 'workpress' ) }</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">${ __( 'WorkPress Client', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey">${ __( 'Access strictly bounded to /portal/, request submissions, spec reviews, and digital signoffs.', 'workpress' ) }</p>
					</div>
				</div>
			</div>
		</div>
	`;
}
