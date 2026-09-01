import { html, useState, Fragment, __, sprintf, isRtl } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import ConfirmModal from '../modals/ConfirmModal.js';
import ContributionComments from './ContributionComments.js';
import MultiFilePicker from '../ui/MultiFilePicker.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/datetime.js';
import { toast } from '../../utils/toast.js';
import { contributionsApi } from '../../api/client.js';

export default function ContributionDetailModal({ isActive, onClose, contribution, onStatusChange }) {
	const [confirmConfig, setConfirmConfig] = useState(null);
	const rtl = isRtl();
	
	if (!contribution) return null;

	const isAccepted = contribution.is_accepted === true || contribution.is_accepted === '1' || contribution.is_accepted === 1;

	const handleAccept = () => {
		setConfirmConfig({
			title: __( 'Approve Contribution as Official Resolution', 'workpress' ),
			message: __( 'Are you sure you want to approve this contribution as official resolution? This will automatically close and complete the task, archiving it into knowledge base.', 'workpress' ),
			confirmText: __( 'Approve & Complete', 'workpress' ),
			confirmColor: 'is-success',
			isDanger: false,
			onConfirm: () => {
				contributionsApi.accept(contribution.id)
					.then( () => {
						toast( __( 'Solution approved and task completed successfully', 'workpress' ), 'success' );
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || __( 'An error occurred while approving solution', 'workpress' ), 'danger') );
			}
		});
	};

	const handleRevoke = () => {
		setConfirmConfig({
			title: __( 'Revoke Solution Approval', 'workpress' ),
			message: __( 'Are you sure you want to revoke this solution? The task will be reopened for review and removed from knowledge base.', 'workpress' ),
			confirmText: __( 'Revoke Approval', 'workpress' ),
			confirmColor: 'is-warning',
			isDanger: true,
			onConfirm: () => {
				contributionsApi.revoke(contribution.id)
					.then( () => {
						toast( __( 'Solution revoked and task reopened', 'workpress' ), 'info' );
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || __( 'An error occurred while revoking approval', 'workpress' ), 'danger') );
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
							<span>${ __( 'Revoke Approval', 'workpress' ) }</span>
						</button>
					` : html`
						<button className="button is-success wp-sharp-button is-flex is-align-items-center" onClick=${handleAccept}>
							<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
							<span>${ __( 'Approve Solution', 'workpress' ) }</span>
						</button>
					` }
				` : null }
				<a href=${`#/tasks/${contribution.task_id}`} className="button is-light wp-sharp-button is-flex is-align-items-center" onClick=${onClose}>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>${ __( 'Open Workspace', 'workpress' ) }</span>
				</a>
			</div>
			<button className="button is-light wp-sharp-button" onClick=${onClose}>
				${ __( 'Close', 'workpress' ) }
			</button>
		</div>
	`;

	return html`
		<${Fragment}>
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ __( 'Contribution Details', 'workpress' ) } 
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
							<strong className="has-text-success-dark">${ __( 'Official resolution approved and archived in knowledge base.', 'workpress' ) }</strong>
							<p className="is-size-7 has-text-grey-dark mt-1">
								${ contribution.accepted_at ? sprintf( __( 'Approved date: %s', 'workpress' ), formatDate(contribution.accepted_at) ) : '' }
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
					</figure>
					<div className="is-flex-grow-1">
						<div className="is-flex is-justify-content-space-between is-align-items-center">
							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<h3 className="title is-6 mb-1">${ contribution.author_name || __( 'Contributor', 'workpress' ) }</h3>
								${ contribution.is_client ? html`
									<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
										${ __( 'Client', 'workpress' ) }
									</span>
								` : null }
							</div>
							<span className="is-size-7 has-text-grey" title=${ formatDateTime(contribution.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(contribution.created_at) }</span>
						</div>
						<div className="tags mb-0">
							<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>
								${ contribution.type_label || __( 'Contribution', 'workpress' ) }
							</span>
							${ isAccepted ? html`
								<span className="tag is-success" style=${{ borderRadius: 0, fontWeight: 'bold' }}>
									<i className=${`dashicons dashicons-yes-alt ${ rtl ? 'ml-1' : 'mr-1' }`}></i> ${ __( 'Approved as official solution', 'workpress' ) }
								</span>
							` : null }
						</div>
					</div>
				</div>

				${ (contribution.cover_url || (contribution.payload && contribution.payload.cover_url)) ? html`
					<div className="mb-4 box p-1 wp-border">
						<figure className="image is-2by1 m-0">
							<img src=${ contribution.cover_url || contribution.payload.cover_url } alt=${ __( 'Attachment', 'workpress' ) } className="has-background-light" style=${{ objectFit: 'contain' }} />
						</figure>
					</div>
				` : null }

				<div className="content has-text-dark is-size-6 mb-4" dangerouslySetInnerHTML=${{ __html: contribution.content }}></div>

				${ contribution.attachments && contribution.attachments.length > 0 ? html`
					<div className="mt-4 pt-3 wp-border-top">
						<h4 className="title is-6 mb-2">${ sprintf( __( 'Attachments (%d)', 'workpress' ), contribution.attachments.length ) }</h4>
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
				cancelText=${ __( 'Cancel', 'workpress' ) }
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
