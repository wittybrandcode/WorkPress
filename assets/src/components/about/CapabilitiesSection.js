import { html } from '../../utils/html.js';

export default function CapabilitiesSection() {
	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon ml-2" style=${{ marginLeft: '8px' }}><i className="dashicons dashicons-shield has-text-warning"></i></span>
				<span>مصفوفة الصلاحيات الذرية الـ 8 (34 Atomic Capabilities)</span>
			</h3>

			<div className="columns is-multiline">
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">1. إدارة المشاريع (Projects Package)</h4>
						<p className="is-size-7 has-text-grey">`create_workpress_projects`, `edit_workpress_projects`, `delete_workpress_projects`, `archive_workpress_projects`, `read_workpress_projects`</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">2. الكانبان والمهام (Tasks Package)</h4>
						<p className="is-size-7 has-text-grey">`create_workpress_tasks`, `edit_workpress_tasks`, `delete_workpress_tasks`, `move_workpress_tasks`, `assign_workpress_tasks`</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">3. المساهمات والحلول (Contributions Package)</h4>
						<p className="is-size-7 has-text-grey">`add_contributions`, `accept_solutions`, `revoke_solutions`, `delete_contributions`, `view_internal_discussions`</p>
					</div>
				</div>
				<div className="column is-6">
					<div className="wp-card p-4 h-100">
						<h4 className="title is-6 mb-2 has-text-weight-bold">4. البوابة والتكامل (Portal & Webhooks Package)</h4>
						<p className="is-size-7 has-text-grey">`access_workpress_portal`, `submit_project_requests`, `signoff_deliverables`, `manage_webhooks`, `manage_settings`</p>
					</div>
				</div>
			</div>
		</div>
	`;
}
