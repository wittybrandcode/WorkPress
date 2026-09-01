import { html, useState, useEffect, __ } from '../../utils/html.js';
import { projectsApi } from '../../api/client.js';
import { formatDate } from '../../utils/datetime.js';
import Modal from '../modals/Modal.js';
import Loader from '../ui/Loader.js';

export default function ProjectQuickPreviewModal({ isActive, onClose, projectId }) {
	const [ project, setProject ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );

	useEffect( () => {
		if ( isActive && projectId ) {
			setIsLoading( true );
			projectsApi.get( projectId )
				.then( setProject )
				.catch( console.error )
				.finally( () => setIsLoading( false ) );
		} else {
			setProject( null );
		}
	}, [ isActive, projectId ] );

	const footer = html`
		<div className="is-flex is-justify-content-flex-end" style=${{ width: '100%' }}>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose }>${ __( 'Close', 'workpress' ) }</button>
				<button className="button is-primary wp-sharp-button" onClick=${ () => { onClose(); window.location.hash = '#/projects/' + project?.id; } }>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>${ __( 'Open Workspace', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	if ( isLoading || !project ) {
		return html`
			<${Modal} isActive=${ isActive } onClose=${ onClose } title=${ __( 'Quick Preview', 'workpress' ) } size="wp-mega-modal">
				<div className="py-6">
					<${Loader} center=${true} size="medium" label=${ __( 'Loading...', 'workpress' ) } />
				</div>
			</${Modal}>
		`;
	}

	return html`
		<${Modal} isActive=${ isActive } onClose=${ onClose } title=${ __( 'Quick Preview', 'workpress' ) } footer=${ footer } size="wp-mega-modal">
			<div className="p-2">
				<div className="mb-4">
					<h2 className="title is-4 mb-2">${ project.name }</h2>
					<div className="is-flex is-align-items-center has-text-grey is-size-7" style=${{ gap: '15px' }}>
						<span>
							<span className="icon is-small"><i className="dashicons dashicons-calendar-alt"></i></span> 
							${ formatDate(project.created_at) }
						</span>
						<span>
							<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
							${ project.total_tasks || 0 } ${ __( 'Tasks', 'workpress' ) }
						</span>
					</div>
				</div>

				${ project.cover_url && html`
					<figure className="image is-2by1 mb-4" style=${{ border: '2px solid #0f172a' }}>
						<img src=${ project.cover_url } alt=${ project.name } style=${{ objectFit: 'cover' }} />
					</figure>
				` }

				<div className="wp-card p-4 mb-4 has-background-light">
					<div className="content is-size-6" dangerouslySetInnerHTML=${{ __html: project.description || __( 'No additional details provided.', 'workpress' ) }}></div>
				</div>
			</div>
		</${Modal}>
	`;
}
