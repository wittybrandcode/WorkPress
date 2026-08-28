import { html, useState, useEffect } from '../../utils/html.js';
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
				<button className="button is-light wp-sharp-button" onClick=${ onClose }>Ø¥ØºÙ„Ø§Ù‚</button>
				<button className="button is-primary wp-sharp-button" onClick=${ () => { onClose(); window.location.hash = '#/projects/' + project?.id; } }>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>Ù…Ø¹Ø§ÙŠÙ†Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ù…Ø´Ø±ÙˆØ¹</span>
				</button>
			</div>
		</div>
	`;

	if ( isLoading || !project ) {
		return html`
			<${Modal} isActive=${ isActive } onClose=${ onClose } title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„Ù…Ø´Ø±ÙˆØ¹" size="wp-mega-modal">
				<div className="py-6">
					<${Loader} center=${true} size="medium" label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹..." />
				</div>
			</${Modal}>
		`;
	}

	return html`
		<${Modal} isActive=${ isActive } onClose=${ onClose } title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„Ù…Ø´Ø±ÙˆØ¹" footer=${ footer } size="wp-mega-modal">
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
							${ project.total_tasks || 0 } Ù…Ù‡Ø§Ù…
						</span>
					</div>
				</div>

				${ project.cover_url && html`
					<figure className="image is-2by1 mb-4" style=${{ border: '2px solid #0f172a' }}>
						<img src=${ project.cover_url } alt=${ project.name } style=${{ objectFit: 'cover' }} />
					</figure>
				` }

				<div className="wp-card p-4 mb-4 has-background-light">
					<div className="content is-size-6" dangerouslySetInnerHTML=${{ __html: project.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ Ù„Ù„Ù…Ø´Ø±ÙˆØ¹.' }}></div>
				</div>
			</div>
		</${Modal}>
	`;
}
