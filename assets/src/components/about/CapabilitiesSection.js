import { html, __, isRtl } from '../../utils/html.js';

export default function CapabilitiesSection() {
	const rtl = isRtl();

	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}><i className="dashicons dashicons-shield has-text-warning"></i></span>
				<span>${ __( '8-Domain Capability Matrix (34 Atomic Capabilities)', 'workpress' ) }</span>
			</h3>

			<div className="columns is-multiline">
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">1. ${ __( 'Projects Package (Projects)', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey font-monospace">
							<code>create_workpress_projects</code>, <code>edit_workpress_projects</code>, <code>delete_workpress_projects</code>, <code>archive_workpress_projects</code>, <code>read_workpress_projects</code>
						</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">2. ${ __( 'Kanban & Tasks Package (Tasks)', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey font-monospace">
							<code>create_workpress_tasks</code>, <code>edit_workpress_tasks</code>, <code>delete_workpress_tasks</code>, <code>move_workpress_tasks</code>, <code>assign_workpress_tasks</code>
						</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">3. ${ __( 'Contributions & Solutions Package (Contributions)', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey font-monospace">
							<code>add_contributions</code>, <code>accept_solutions</code>, <code>revoke_solutions</code>, <code>delete_contributions</code>, <code>view_internal_discussions</code>
						</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">4. ${ __( 'Portal & Webhooks Package (Integrations)', 'workpress' ) }</h4>
						<p className="is-size-7 has-text-grey font-monospace">
							<code>access_workpress_portal</code>, <code>submit_project_requests</code>, <code>signoff_deliverables</code>, <code>manage_webhooks</code>, <code>manage_settings</code>
						</p>
					</div>
				</div>
			</div>
		</div>
	`;
}
