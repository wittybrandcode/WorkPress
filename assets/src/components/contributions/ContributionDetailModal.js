import { html, useState, Fragment } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import ConfirmModal from '../modals/Modal.js';
import ContributionComments from './ContributionComments.js';
import MultiFilePicker from '../ui/MultiFilePicker.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/datetime.js';
import { toast } from '../../utils/toast.js';
import { contributionsApi } from '../../api/client.js';

export default function ContributionDetailModal({ isActive, onClose, contribution, onStatusChange }) {
	const [confirmConfig, setConfirmConfig] = useState(null);
	
	if (!contribution) return null;

	const isAccepted = contribution.is_accepted === true || contribution.is_accepted === '1' || contribution.is_accepted === 1;

	const handleAccept = () => {
		setConfirmConfig({
			title: 'Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© ÙƒØ­Ù„ Ø±Ø³Ù…ÙŠ',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© ÙƒØ­Ù„ Ø±Ø³Ù…ÙŠ Ù„Ù„Ù…Ù‡Ù…Ø©ØŸ Ø³ÙŠØ¤Ø¯ÙŠ Ø°Ù„Ùƒ ØªÙ„Ù‚Ø§Ø¦ÙŠØ§Ù‹ Ø¥Ù„Ù‰ Ø¥ØºÙ„Ø§Ù‚ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø©ØŒ ÙˆØ¥Ø¶Ø§ÙØªÙ‡Ø§ Ø¥Ù„Ù‰ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©.',
			confirmText: 'Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø©',
			confirmColor: 'is-success',
			isDanger: false,
			onConfirm: () => {
				contributionsApi.accept(contribution.id)
					.then( () => {
						toast('ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success');
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„', 'danger') );
			}
		});
	};

	const handleRevoke = () => {
		setConfirmConfig({
			title: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ø§ Ø§Ù„Ø­Ù„ØŸ Ø³ØªØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ³Ø­Ø¨ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ù…Ù† Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©.',
			confirmText: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ¥Ø¹Ø§Ø¯Ø© Ø§Ù„ÙØªØ­',
			confirmColor: 'is-warning',
			isDanger: true,
			onConfirm: () => {
				contributionsApi.revoke(contribution.id)
					.then( () => {
						toast('ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©', 'info');
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯', 'danger') );
			}
		});
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
				${ contribution.can_accept ? html`
					${ isAccepted ? html`
						<button className="button is-warning is-light wp-sharp-button is-flex is-align-items-center" onClick=${handleRevoke}>
							<span className="icon"><i className="dashicons dashicons-undo"></i></span>
							<span>Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø¹Ø±ÙÙŠ</span>
						</button>
					` : html`
						<button className="button is-success wp-sharp-button is-flex is-align-items-center" onClick=${handleAccept}>
							<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
							<span>Ø§Ø¹ØªÙ…Ø§Ø¯ ÙƒØ­Ù„ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø©</span>
						</button>
					` }
				` : null }
				<a href=${`#/tasks/${contribution.task_id}`} className="button is-light wp-sharp-button is-flex is-align-items-center" onClick=${onClose}>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„Ù„Ù…Ù‡Ù…Ø©</span>
				</a>
			</div>
			<button className="button is-light wp-sharp-button" onClick=${onClose}>
				Ø¥ØºÙ„Ø§Ù‚
			</button>
		</div>
	`;

	return html`
		<${Fragment}>
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title="ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø§Ù„Ù…Ø¹Ø±ÙÙŠØ©" 
			footer=${ footer }
			size="wp-mega-modal"
		>
			<div className="p-4">
				${ isAccepted ? html`
					<div className="notification is-success is-light p-3 mb-4 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #10b981' }}>
						<span className="icon is-medium has-text-success mr-2">
							<i className="dashicons dashicons-yes-alt" style=${{ fontSize: '24px' }}></i>
						</span>
						<div>
							<strong className="has-text-success-dark">Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ù…Ø¹ØªÙ…Ø¯Ø© Ø±Ø³Ù…ÙŠØ§Ù‹ ÙƒØ­Ù„ Ù…Ø¹ØªÙ…Ø¯ Ù„Ù„Ù…Ù‡Ù…Ø©</strong>
							<p className="is-size-7 has-text-grey-dark mt-1">
								Ø£Ø¯Ù‰ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¥Ù„Ù‰ Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…Ù‡Ù…Ø© ÙˆØ¥Ø¯Ø±Ø§Ø¬ Ø§Ù„Ø­Ù„ ÙÙŠ Ù…ÙƒØªØ¨Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø§Ù„Ø¯Ø§Ø¦Ù…Ø©.
								${ contribution.accepted_at ? html` (Ø¨ØªØ§Ø±ÙŠØ®: ${ formatDate(contribution.accepted_at) })` : '' }
							</p>
						</div>
					</div>
				` : null }

				<div className="mb-4 pb-3 wp-border-bottom">
					${ contribution.project_name ? html`<span className="tag is-dark is-light mb-1" style=${{ borderRadius: 0 }}>${ contribution.project_name }</span>` : '' }
					<h2 className="title is-4 mb-1">
						<a href=${`#/tasks/${contribution.task_id}`} className="has-text-dark" onClick=${onClose}>${ contribution.task_title }</a>
					</h2>
				</div>

				<div className="is-flex is-align-items-center mb-4 pb-3 wp-border-bottom">
					<figure className="image is-48x48 m-0 mr-3" style=${{ position: 'relative' }}>
						<img src=${ contribution.author_avatar || '' } alt=${ contribution.author_name } style=${{ borderRadius: 0, border: contribution.is_client ? '2px solid #f59e0b' : '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
						${ contribution.is_client ? html`
							<span style=${{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#f59e0b', color: '#fff', fontSize: '11px', padding: '1px 4px', fontWeight: '900', lineHeight: 1 }}>â­</span>
						` : null }
					</figure>
					<div className="is-flex-grow-1">
						<div className="is-flex is-justify-content-space-between is-align-items-center">
							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<h3 className="title is-6 mb-1">${ contribution.author_name || 'Ù…Ø³Ø§Ù‡Ù…' }</h3>
								${ contribution.is_client ? html`
									<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
										 Ø¹Ù…ÙŠÙ„
									</span>
								` : null }
							</div>
							<span className="is-size-7 has-text-grey" title=${ formatDateTime(contribution.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(contribution.created_at) }</span>
						</div>
						<div className="tags mb-0">
							<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>
								${ contribution.type_label || 'Ù…Ø³Ø§Ù‡Ù…Ø©' }
							</span>
							${ isAccepted ? html`
								<span className="tag is-success" style=${{ borderRadius: 0, fontWeight: 'bold' }}>
									<i className="dashicons dashicons-yes-alt ml-1"></i> Ù…Ø¹ØªÙ…Ø¯ ÙƒØ­Ù„
								</span>
							` : null }
						</div>
					</div>
				</div>

				${ (contribution.cover_url || (contribution.payload && contribution.payload.cover_url)) ? html`
					<div className="mb-4 box p-1 wp-border">
						<figure className="image is-2by1 m-0">
							<img src=${ contribution.cover_url || contribution.payload.cover_url } alt="Ø§Ù„Ù…Ø±ÙÙ‚" className="has-background-light" style=${{ objectFit: 'contain' }} />
						</figure>
					</div>
				` : null }

				<div className="content has-text-dark is-size-6 mb-4" dangerouslySetInnerHTML=${{ __html: contribution.content }}></div>

				${ contribution.attachments && contribution.attachments.length > 0 ? html`
					<div className="mt-4 pt-3 wp-border-top">
						<h4 className="title is-6 mb-2">Ø§Ù„Ù…Ø±ÙÙ‚Ø§Øª ÙˆØ§Ù„ÙˆØ«Ø§Ø¦Ù‚ (${ contribution.attachments.length })</h4>
						<${MultiFilePicker} attachments=${ contribution.attachments } readOnly=${ true } />
					</div>
				` : null }

				<div className="mt-4 pt-3 wp-border-top">
					<${ContributionComments}
						contributionId=${ contribution.id }
						initialComments=${ contribution.comments || [] }
						commentsCount=${ contribution.comments_count || 0 }
					/>
				</div>
			</div>
		</${Modal}>
		
		${ confirmConfig && html`
			<${ConfirmModal}
				isActive=${ true }
				title=${ confirmConfig.title }
				message=${ confirmConfig.message }
				confirmText=${ confirmConfig.confirmText }
				confirmColor=${ confirmConfig.confirmColor }
				cancelText="Ø¥Ù„ØºØ§Ø¡"
				isDangerous=${ confirmConfig.isDanger }
				onConfirm=${ () => {
					confirmConfig.onConfirm();
					setConfirmConfig(null);
				} }
				onCancel=${ () => setConfirmConfig(null) }
			/>
		` }
		</${Fragment}>
	`;
}
