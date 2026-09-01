import { html, useState, useEffect, Fragment, __, isRtl } from '../../utils/html.js';
import { contributionsApi } from '../../api/client.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../../utils/datetime.js';
import { toast } from '../../utils/toast.js';
import ConfirmModal from '../modals/ConfirmModal.js';
import Loader from '../ui/Loader.js';

export default function ContributionComments({ contributionId, initialComments = [], commentsCount = 0, onCommentAdded, onCommentDeleted }) {
	const [comments, setComments] = useState( initialComments || [] );
	const [newComment, setNewComment] = useState( '' );
	const [isSubmitting, setIsSubmitting] = useState( false );
	const [isLoading, setIsLoading] = useState( false );
	const [confirmDelete, setConfirmDelete] = useState( null );
	const rtl = isRtl();

	useEffect( () => {
		if ( Array.isArray( initialComments ) && initialComments.length > 0 ) {
			setComments( initialComments );
		} else if ( commentsCount > 0 ) {
			// Fetch if count > 0 but no comments array passed
			setIsLoading( true );
			contributionsApi.comments.list( contributionId )
				.then( ( data ) => {
					setComments( Array.isArray( data ) ? data : [] );
				} )
				.catch( ( err ) => console.error( 'Error fetching comments:', err ) )
				.finally( () => setIsLoading( false ) );
		}
	}, [ contributionId, initialComments, commentsCount ] );

	const handleSubmit = ( e ) => {
		if ( e ) e.preventDefault();
		const trimmed = newComment.trim();
		if ( ! trimmed ) return;

		setIsSubmitting( true );
		contributionsApi.comments.create( contributionId, { content: trimmed } )
			.then( ( createdComment ) => {
				const updated = [ ...comments, createdComment ];
				setComments( updated );
				setNewComment( '' );
				toast( __( 'Comment added successfully', 'workpress' ), 'success' );
				if ( onCommentAdded ) {
					onCommentAdded( contributionId, createdComment );
				}
			} )
			.catch( ( err ) => {
				toast( err.message || __( 'Failed to post comment', 'workpress' ), 'danger' );
			} )
			.finally( () => setIsSubmitting( false ) );
	};

	const handleDelete = ( commentId ) => {
		contributionsApi.comments.delete( contributionId, commentId )
			.then( () => {
				const updated = comments.filter( c => c.id !== commentId );
				setComments( updated );
				toast( __( 'Comment deleted', 'workpress' ), 'info' );
				if ( onCommentDeleted ) {
					onCommentDeleted( contributionId, commentId );
				}
			} )
			.catch( ( err ) => {
				toast( err.message || __( 'Failed to delete comment', 'workpress' ), 'danger' );
			} );
	};

	return html`
		<div className="contribution-comments-thread mt-3 pt-3" style=${{ borderTop: '1px solid #e2e8f0' }}>
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
				<h5 className="is-size-7 has-text-weight-bold has-text-grey-dark m-0 is-flex is-align-items-center" style=${{ gap: '4px' }}>
					<i className="dashicons dashicons-admin-comments has-text-info"></i>
					<span>${ __( 'Technical Discussion & Review', 'workpress' ) }</span>
					<span className="tag is-rounded is-small is-light is-info ml-1" style=${{ height: '1.5em', padding: '0 0.5em' }}>
						${ comments.length }
					</span>
				</h5>
			</div>

			${ isLoading ? html`
				<${Loader} center=${true} size="small" label=${ __( 'Loading comments...', 'workpress' ) } />
			` : null }

			${ ! isLoading && comments.length === 0 ? html`
				<div className="p-2 mb-3 has-text-centered is-size-7 has-text-grey" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
					<span>${ __( 'No comments yet. Be the first to leave feedback.', 'workpress' ) }</span>
				</div>
			` : null }

			${ comments.length > 0 ? html`
				<div className="comments-list mb-3" style=${{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					${ comments.map( ( c ) => html`
						<div key=${ c.id } className="comment-item p-2" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-1">
								<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<figure className="image is-24x24 m-0" style=${{ position: 'relative' }}>
										<img src=${ c.author_avatar || '' } alt=${ c.author_name } style=${{ borderRadius: 0, border: c.is_client ? '1.5px solid #f59e0b' : '1px solid #cbd5e1', backgroundColor: '#cbd5e1' }} />
									</figure>
									<span className="has-text-weight-bold is-size-7 has-text-dark">${ c.author_name }</span>
									${ c.is_client ? html`
										<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.65rem', padding: '1px 4px', height: 'auto' }}>
											${ __( 'Client', 'workpress' ) }
										</span>
									` : null }
									<span className="is-size-7 has-text-grey" style=${{ fontSize: '0.75rem', cursor: 'help' }} title=${ formatDateTime( c.created_at ) }>• ${ formatRelativeTime( c.created_at ) }</span>
								</div>
								${ c.can_delete ? html`
									<button 
										className="button is-small is-ghost has-text-danger p-0" 
										style=${{ height: 'auto', border: 'none' }}
										title=${ __( 'Delete comment', 'workpress' ) }
										onClick=${ ( e ) => {
											e.stopPropagation();
											setConfirmDelete( c.id );
										} }
									>
										<span className="icon is-small"><i className="dashicons dashicons-trash" style=${{ fontSize: '14px' }}></i></span>
									</button>
								` : null }
							</div>
							<div className="is-size-7 has-text-dark" style=${{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', paddingInlineStart: '1.25rem', paddingInlineEnd: '0.25rem' }}>
								${ c.content }
							</div>
						</div>
					` ) }
				</div>
			` : null }

			<!-- Add Comment Form -->
			<form onSubmit=${ handleSubmit } className="comment-form mt-2">
				<div className="field mb-2">
					<div className="control">
						<textarea
							className="textarea is-small"
							rows="2"
							placeholder=${ __( 'Write a note, guidance, or review on this contribution...', 'workpress' ) }
							value=${ newComment }
							onInput=${ ( e ) => setNewComment( e.target.value ) }
							style=${{ borderRadius: '4px', resize: 'vertical' }}
							disabled=${ isSubmitting }
						></textarea>
					</div>
				</div>
				<div className="is-flex is-justify-content-flex-end">
					<button
						type="submit"
						className=${ `button is-small is-primary wp-sharp-button is-flex is-align-items-center ${ isSubmitting ? 'is-loading' : '' }` }
						disabled=${ ! newComment.trim() || isSubmitting }
					>
						<span className="icon is-small"><i className=${ rtl ? 'dashicons dashicons-arrow-left-alt2' : 'dashicons dashicons-arrow-right-alt2' }></i></span>
						<span>${ __( 'Post Comment', 'workpress' ) }</span>
					</button>
				</div>
			</form>

			${ confirmDelete && html`
				<${ConfirmModal}
					isActive=${ true }
					title=${ __( 'Delete comment', 'workpress' ) }
					message=${ __( 'Are you sure you want to permanently delete this comment?', 'workpress' ) }
					confirmText=${ __( 'Delete', 'workpress' ) }
					confirmColor="is-danger"
					cancelText=${ __( 'Cancel', 'workpress' ) }
					isDangerous=${ true }
					onConfirm=${ () => {
						handleDelete( confirmDelete );
						setConfirmDelete( null );
					} }
					onCancel=${ () => setConfirmDelete( null ) }
				/>
			` }
		</div>
	`;
}
