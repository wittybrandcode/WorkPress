import { html, useState, useEffect } from '../../utils/html.js';
import { tasksApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import PriorityBadge from '../ui/PriorityBadge.js';
import AvatarStack from '../ui/AvatarStack.js';
import Loader from '../ui/Loader.js';

export default function TaskQuickPreviewModal({ isActive, onClose, taskId }) {
	const [ task, setTask ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( false );

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
				<button className="button is-light wp-sharp-button" onClick=${ onClose }>Ø¥ØºÙ„Ø§Ù‚</button>
				<button className="button is-primary wp-sharp-button" onClick=${ () => { onClose(); window.location.hash = '#/tasks/' + task.id; } }>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>Ù…Ø¹Ø§ÙŠÙ†Ø© Ø¯Ù‚ÙŠÙ‚Ø© Ù„Ù„Ù…Ù‡Ù…Ø©</span>
				</button>
			</div>
		</div>
	`;

	if ( isLoading || !task ) {
		return html`
			<${Modal} isActive=${ isActive } onClose=${ onClose } title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„Ù…Ù‡Ù…Ø©" size="wp-mega-modal">
				<div className="py-6">
					<${Loader} center=${true} size="medium" label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ù‡Ù…Ø©..." />
				</div>
			</${Modal}>
		`;
	}

	return html`
		<${Modal} isActive=${ isActive } onClose=${ onClose } title="Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø© Ù„Ù„Ù…Ù‡Ù…Ø©" footer=${ footer } size="wp-mega-modal">
			<div className="p-2">
				<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
					<div>
						${ task.project_name ? html`<p className="is-size-7 has-text-grey mb-1">${ task.project_name }</p>` : '' }
						<div className="is-flex is-align-items-center mb-2">
							<span className="tag is-dark mr-2" style=${{ borderRadius: 0 }}>${ task.ref_key }</span>
							<h2 className="title is-4 mb-0">${ task.title }</h2>
						</div>
						<p className="has-text-grey is-size-7">Ø¨ÙˆØ§Ø³Ø·Ø©: <strong>${ task.author_name || 'Ù…Ø¬Ù‡ÙˆÙ„' }</strong></p>
					</div>
					<${PriorityBadge} priority=${ task.priority } />
				</div>

				${ (task.status === 'closed' || task.status === 'completed') ? html`
					<div className="notification is-success is-light p-3 mb-4 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #10b981' }}>
						<span className="icon is-medium has-text-success mr-2"><i className="dashicons dashicons-yes-alt" style=${{ fontSize: '24px' }}></i></span>
						<div>
							<strong className="has-text-success-dark">Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø© Ù…ÙƒØªÙ…Ù„Ø© ÙˆÙ…ØºÙ„Ù‚Ø©</strong>
							<p className="is-size-7 has-text-grey-dark">ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ Ø§Ù„Ø±Ø³Ù…ÙŠ ÙˆØ¥Ø¯Ø±Ø§Ø¬ Ø§Ù„Ù…Ù‡Ù…Ø© ÙÙŠ Ø£Ø±Ø´ÙŠÙ Ø§Ù„Ù…Ø¹Ø±ÙØ©.</p>
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
						<span className="has-text-weight-bold ml-2">Ø§Ù„Ù…ÙƒÙ„ÙÙˆÙ†:</span>
						${ task.assignees && task.assignees.length > 0 
							? html`<${AvatarStack} users=${ task.assignees } max=${5} />` 
							: html`<span className="has-text-grey is-size-7">ØºÙŠØ± Ù…Ø³Ù†Ø¯Ø© Ù„Ø£Ø­Ø¯</span>` 
						}
					</div>
					<div>
						<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>
							<span className="icon is-small ml-1"><i className="dashicons dashicons-admin-comments"></i></span>
							${ task.comment_count || 0 } Ù…Ø³Ø§Ù‡Ù…Ø©
						</span>
					</div>
				</div>
			</div>
		</${Modal}>
	`;
}
