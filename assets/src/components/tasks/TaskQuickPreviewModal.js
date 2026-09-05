import { html, useState, useEffect, __, sprintf, isRtl } from '../../utils/html.js';
import { tasksApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import PriorityBadge from '../ui/PriorityBadge.js';
import AvatarStack from '../ui/AvatarStack.js';
import Loader from '../ui/Loader.js';

export default function TaskQuickPreviewModal({ isActive, onClose, taskId }) {
	const [ task, setTask ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );
	const rtl = isRtl();

	useEffect( () => {
		if ( isActive && taskId ) {
			setIsLoading( true );
			tasksApi.get( taskId )
				.then( setTask )
				.catch( console.error )
				.finally( () => setIsLoading( false ) );
		} else {
			setTask( null );
		}
	}, [ isActive, taskId ] );

	const footer = html`
		<div className="is-flex is-justify-content-flex-end" style=${{ width: '100%' }}>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose }>${ __( 'Close', 'workpress' ) }</button>
				<button className="button is-primary wp-sharp-button" onClick=${ () => { onClose(); window.location.hash = '#/tasks/' + task.id; } }>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>${ __( 'Open Workspace', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	if ( isLoading || !task ) {
		return html`
			<${Modal} isActive=${ isActive } onClose=${ onClose } title=${ __( 'Quick Preview', 'workpress' ) } size="is-medium">
				<div className="py-6">
					<${Loader} center=${true} size="medium" label=${ __( 'Loading task details...', 'workpress' ) } />
				</div>
			</${Modal}>
		`;
	}

	return html`
		<${Modal} isActive=${ isActive } onClose=${ onClose } title=${ __( 'Quick Preview', 'workpress' ) } footer=${ footer } size="is-medium">
			<div className="p-2">
				<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
					<div>
						${ task.project_name ? html`<p className="is-size-7 has-text-grey mb-1">${ task.project_name }</p>` : '' }
						<div className="is-flex is-align-items-center mb-2">
							<span className="tag is-dark mr-2" style=${{ borderRadius: 0 }}>${ task.ref_key }</span>
							<h2 className="title is-4 mb-0">${ task.title }</h2>
						</div>
						<p className="has-text-grey is-size-7">${ sprintf( __( 'By: %s', 'workpress' ), task.author_name || __( 'Author', 'workpress' ) ) }</p>
					</div>
					<${PriorityBadge} priority=${ task.priority } />
				</div>

				${ (task.status === 'closed' || task.status === 'completed') ? html`
					<div className="notification is-success is-light p-3 mb-4 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #10b981' }}>
						<span className="icon is-medium has-text-success mr-2"><i className="dashicons dashicons-yes-alt" style=${{ fontSize: '24px' }}></i></span>
						<div>
							<strong className="has-text-success-dark">${ __( 'Completed', 'workpress' ) }</strong>
							<p className="is-size-7 has-text-grey-dark">${ __( 'Official resolution approved and archived in knowledge base.', 'workpress' ) }</p>
						</div>
					</div>
				` : null }

				${ task.cover_url && html`
					<figure className="image is-2by1 mb-4" style=${{ border: '2px solid #0f172a' }}>
						<img src=${ task.cover_url } alt=${ task.title } style=${{ objectFit: 'cover' }} />
					</figure>
				` }

				<div className="wp-card p-4 mb-4 has-background-light">
					<div className="content is-size-6" dangerouslySetInnerHTML=${{ __html: task.content || '' }}></div>
				</div>

				<div className="is-flex is-align-items-center is-justify-content-space-between">
					<div className="is-flex is-align-items-center">
						<span className="has-text-weight-bold" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.5rem' }}>${ __( 'Assignees:', 'workpress' ) }</span>
						${ task.assignees && task.assignees.length > 0 
							? html`<${AvatarStack} users=${ task.assignees } max=${5} />` 
							: html`<span className="has-text-grey is-size-7">${ __( 'Unassigned', 'workpress' ) }</span>` 
						}
					</div>
					<div>
						<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>
							<span className="icon is-small" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.25rem' }}><i className="dashicons dashicons-admin-comments"></i></span>
							${ sprintf( __( '%d contributions & comments', 'workpress' ), task.comment_count || 0 ) }
						</span>
					</div>
				</div>
			</div>
		</${Modal}>
	`;
}
