import { html, useState, Fragment } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import ConfirmModal from '../modals/ConfirmModal.js';
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
			title: 'اعتماد المساهمة كحل رسمي',
			message: 'هل أنت متأكد من اعتماد هذه المساهمة كحل رسمي للمهمة؟ سيؤدي ذلك تلقائياً إلى إغلاق واكتمال المهمة، وإضافتها إلى قاعدة المعرفة.',
			confirmText: 'اعتماد واكتمال المهمة',
			confirmColor: 'is-success',
			isDanger: false,
			onConfirm: () => {
				contributionsApi.accept(contribution.id)
					.then( () => {
						toast('تم اعتماد الحل واكتمال المهمة بنجاح', 'success');
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || 'حدث خطأ أثناء اعتماد الحل', 'danger') );
			}
		});
	};

	const handleRevoke = () => {
		setConfirmConfig({
			title: 'إلغاء اعتماد الحل',
			message: 'هل أنت متأكد من إلغاء اعتماد هذا الحل؟ ستتم إعادة فتح المهمة للمراجعة وسحب المساهمة من قاعدة المعرفة.',
			confirmText: 'إلغاء الاعتماد وإعادة الفتح',
			confirmColor: 'is-warning',
			isDanger: true,
			onConfirm: () => {
				contributionsApi.revoke(contribution.id)
					.then( () => {
						toast('تم إلغاء اعتماد الحل وإعادة فتح المهمة للمراجعة', 'info');
						if (onStatusChange) onStatusChange();
						onClose();
					} )
					.catch( err => toast(err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'danger') );
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
							<span>إلغاء الاعتماد المعرفي</span>
						</button>
					` : html`
						<button className="button is-success wp-sharp-button is-flex is-align-items-center" onClick=${handleAccept}>
							<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
							<span>اعتماد كحل واكتمال المهمة</span>
						</button>
					` }
				` : null }
				<a href=${`#/tasks/${contribution.task_id}`} className="button is-light wp-sharp-button is-flex is-align-items-center" onClick=${onClose}>
					<span className="icon"><i className="dashicons dashicons-external"></i></span>
					<span>الانتقال للمهمة</span>
				</a>
			</div>
			<button className="button is-light wp-sharp-button" onClick=${onClose}>
				إغلاق
			</button>
		</div>
	`;

	return html`
		<${Fragment}>
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title="تفاصيل المساهمة المعرفية" 
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
							<strong className="has-text-success-dark">هذه المساهمة معتمدة رسمياً كحل معتمد للمهمة</strong>
							<p className="is-size-7 has-text-grey-dark mt-1">
								أدى الاعتماد إلى إغلاق المهمة وإدراج الحل في مكتبة المعرفة الدائمة.
								${ contribution.accepted_at ? html` (بتاريخ: ${ formatDate(contribution.accepted_at) })` : '' }
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
							<span style=${{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#f59e0b', color: '#fff', fontSize: '11px', padding: '1px 4px', fontWeight: '900', lineHeight: 1 }}>⭐</span>
						` : null }
					</figure>
					<div className="is-flex-grow-1">
						<div className="is-flex is-justify-content-space-between is-align-items-center">
							<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
								<h3 className="title is-6 mb-1">${ contribution.author_name || 'مساهم' }</h3>
								${ contribution.is_client ? html`
									<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
										 عميل
									</span>
								` : null }
							</div>
							<span className="is-size-7 has-text-grey" title=${ formatDateTime(contribution.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(contribution.created_at) }</span>
						</div>
						<div className="tags mb-0">
							<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>
								${ contribution.type_label || 'مساهمة' }
							</span>
							${ isAccepted ? html`
								<span className="tag is-success" style=${{ borderRadius: 0, fontWeight: 'bold' }}>
									<i className="dashicons dashicons-yes-alt ml-1"></i> معتمد كحل
								</span>
							` : null }
						</div>
					</div>
				</div>

				${ (contribution.cover_url || (contribution.payload && contribution.payload.cover_url)) ? html`
					<div className="mb-4 box p-1 wp-border">
						<figure className="image is-2by1 m-0">
							<img src=${ contribution.cover_url || contribution.payload.cover_url } alt="المرفق" className="has-background-light" style=${{ objectFit: 'contain' }} />
						</figure>
					</div>
				` : null }

				<div className="content has-text-dark is-size-6 mb-4" dangerouslySetInnerHTML=${{ __html: contribution.content }}></div>

				${ contribution.attachments && contribution.attachments.length > 0 ? html`
					<div className="mt-4 pt-3 wp-border-top">
						<h4 className="title is-6 mb-2">المرفقات والوثائق (${ contribution.attachments.length })</h4>
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
				cancelText="إلغاء"
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
