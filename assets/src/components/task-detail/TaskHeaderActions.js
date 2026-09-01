import { html, __, isRtl } from '../../utils/html.js';

/**
 * Task Detail Sticky Top Action Bar
 */
export default function TaskHeaderActions({
	task,
	setIsTaskModalOpen
}) {
	if (!task) return null;
	const rtl = isRtl();

	return html`
		<div className="wp-task-sticky-header">
			<div className="is-flex is-justify-content-space-between is-align-items-center">
				<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
					<a href="#/kanban" className="button is-small is-light wp-sharp-button" style=${{ border: '1px solid #cbd5e1', fontWeight: '800' }} title=${ __( 'Back to Kanban', 'workpress' ) }>
						<i className=${ rtl ? 'dashicons dashicons-arrow-right-alt2' : 'dashicons dashicons-arrow-left-alt2' }></i>
						<span style=${{ [rtl ? 'marginRight' : 'marginLeft']: '4px' }}>${ __( 'Kanban', 'workpress' ) }</span>
					</a>
					<span className="tag is-dark" style=${{ borderRadius: 0, fontWeight: '800' }}>${ task.ref_key }</span>
					<h1 className="title is-4 mb-0" style=${{ color: '#0f172a', fontWeight: '900' }}>${ task.title }</h1>
				</div>

				<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
					${ task.project_name ? html`
						<span className="wp-dense-chip" style=${{ fontWeight: '700', borderColor: '#cbd5e1' }}>
							<i className="dashicons dashicons-portfolio" style=${{ color: '#3b82f6', fontSize: '13px' }}></i>
							<span>${ task.project_name }</span>
						</span>
					` : null }
					<button className="button is-small wp-sharp-button is-primary" onClick=${ () => setIsTaskModalOpen(true) }>
						<span className="icon"><i className="dashicons dashicons-edit"></i></span>
						<span>${ __( 'Edit Task', 'workpress' ) }</span>
					</button>
				</div>
			</div>
		</div>
	`;
}
