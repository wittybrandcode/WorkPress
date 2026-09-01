import { html, __, sprintf, isRtl } from '../../utils/html.js';
import WpEditor from '../ui/WpEditor.js';
import ImagePicker from '../ui/ImagePicker.js';
import MultiFilePicker from '../ui/MultiFilePicker.js';
import ContributionComments from '../contributions/ContributionComments.js';
import { contributionsApi, tasksApi } from '../../api/client.js';
import { formatDateTime, formatRelativeTime } from '../../utils/datetime.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

/**
 * Task Contributions Timeline Stream & Submission Form
 */
export default function TaskContributionsStream({
	taskId,
	task,
	contributions = [],
	setContributions,
	fetchTaskData,
	setSelectedContribution,
	setIsContributionModalOpen,
	setConfirmConfig,
	handleStateChange,
	expandedCommentThreads = {},
	setExpandedCommentThreads,
	newContribution = '',
	setNewContribution,
	contributionType = 'comment',
	setContributionType,
	visibilityScope = 'client_review',
	setVisibilityScope,
	featuredImage = null,
	setFeaturedImage,
	featuredImageUrl = '',
	setFeaturedImageUrl,
	contributionAttachments = [],
	setContributionAttachments,
	isSubmitting = false,
	handleAddContribution
}) {
	const isClosed = task.status === 'closed' || task.status === 'completed';
	const rtl = isRtl();

	return html`
		<div className="task-contributions-stream">
			<h2 className="title is-4 mb-4" style=${{ borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', display: 'inline-block' }}>
				${ __( 'Contributions & Activity Log', 'workpress' ) }
			</h2>

			<div className="timeline mb-6">
				${ contributions.length === 0 ? html`
					<div className="wp-card wp-task-timeline-empty p-5">
						<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
							<i className="dashicons dashicons-admin-comments has-text-grey" style=${{ fontSize: '22px' }}></i>
						</div>
						<p className="has-text-grey-dark has-text-weight-bold mb-1">${ __( 'No contributions recorded for this task yet', 'workpress' ) }</p>
						<p className="is-size-7 has-text-grey">${ __( 'Add a technical report, comment, or propose an official solution from the form below to start collaborating.', 'workpress' ) }</p>
					</div>
				` : contributions.map( ( c ) => html`
					<div 
						key=${ c.id } 
						className="box wp-card wp-task-contribution-card p-4 mb-3" 
						onClick=${(e) => { 
							if (c.is_pending_trash) { e.preventDefault(); return; } 
							setSelectedContribution(c); 
							setIsContributionModalOpen(true); 
						}}
					>
						${ c.is_pending_trash ? html`
							<div className="wp-task-trash-overlay" onClick=${(e) => e.stopPropagation()}>
								<div className="box has-text-centered p-3" style=${{ width: '100%', backgroundColor: '#ff3860', color: 'white', border: '1px solid #ff1f4b', boxShadow: '0 8px 24px rgba(255,56,96,0.3)', borderRadius: 0 }}>
									<h4 className="title is-6 has-text-white mb-1">${ __( 'Trash / Archive Request', 'workpress' ) }</h4>
									<p className="is-size-7 mb-2" style=${{ opacity: 0.9 }}>
										<strong>${ __( 'Reason:', 'workpress' ) }</strong> ${ c.trash_reason || __( 'No reason specified', 'workpress' ) }
									</p>
									<div className="buttons is-centered mb-0">
										<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => {
											e.stopPropagation();
											contributionsApi.update( c.id, { is_pending_trash: false } ).then( () => {
												tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
											} );
										} }>
											<span className="icon"><i className="dashicons dashicons-undo"></i></span>
											<span>${ __( 'Restore & Reject', 'workpress' ) }</span>
										</button>
										<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => {
											e.stopPropagation();
											contributionsApi.delete( c.id ).then( () => {
												tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
											} );
										} }>
											<span className="icon"><i className="dashicons dashicons-trash"></i></span>
											<span>${ __( 'Delete Permanently', 'workpress' ) }</span>
										</button>
									</div>
								</div>
							</div>
						` : null }

						<div className="is-flex is-align-items-center mb-2" style=${{ gap: '10px' }}>
							<figure className="image is-32x32 m-0" style=${{ position: 'relative' }}>
								<img src=${ c.author_avatar || '' } alt=${ c.author_name } style=${{ borderRadius: 0, border: c.is_client ? '2px solid #f59e0b' : '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
							</figure>
							<div>
								<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<p className="has-text-weight-bold mb-0">${ c.author_name }</p>
									${ c.is_client ? html`
										<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
											${ __( 'Client', 'workpress' ) }
										</span>
									` : null }
								</div>
								<p className="is-size-7 has-text-grey" title=${ formatDateTime(c.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(c.created_at) }</p>
							</div>
						</div>
						
						${ c.payload && c.payload.cover_url ? html`
							<div className="mb-3 p-1" style=${{ border: '1px solid #ededed', display: 'inline-block' }}>
								<figure className="image is-128x128 m-0">
									<img src=${ c.payload.cover_url } alt=${ __( 'Attachment', 'workpress' ) } style=${{ objectFit: 'cover' }} />
								</figure>
							</div>
						` : null }
						
						<div className="content has-text-dark" dangerouslySetInnerHTML=${{ __html: c.content ? (c.content.substring(0, 150) + (c.content.length > 150 ? '...' : '')) : '' }}></div>
						
						${ c.attachments && c.attachments.length > 0 ? html`
							<div className="mb-3" onClick=${ ( e ) => e.stopPropagation() }>
								<${MultiFilePicker} attachments=${ c.attachments } readOnly=${ true } />
							</div>
						` : null }
						
						<div className="is-flex is-justify-content-space-between is-align-items-center mt-3 pt-3" style=${{ borderTop: '1px dashed #cbd5e1' }}>
							<div className="is-flex is-align-items-center">
								<span className=${`tag is-light ${ c.is_accepted ? 'is-success' : 'is-dark' }`} style=${{ borderRadius: 0, fontWeight: 'bold' }}>
									<i className=${`dashicons ${ c.is_accepted ? 'dashicons-yes-alt' : 'dashicons-tag' } ${ rtl ? 'ml-1' : 'mr-1' }`}></i>
									${ c.is_accepted ? __( 'Approved as official solution', 'workpress' ) : ( c.type_label || __( 'Contribution', 'workpress' ) ) }
								</span>
								<button 
									className=${`button is-small ${ expandedCommentThreads[c.id] ? 'is-info is-light has-text-weight-bold' : 'is-light' } wp-sharp-button is-flex is-align-items-center ${ rtl ? 'mr-2' : 'ml-2' }`}
									onClick=${ (e) => {
										e.stopPropagation();
										setExpandedCommentThreads(prev => ({ ...prev, [c.id]: !prev[c.id] }));
									} }
									title=${ __( 'View and add technical discussion notes', 'workpress' ) }
								>
									<span className="icon is-small" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.25rem' }}><i className="dashicons dashicons-admin-comments"></i></span>
									<span>${ sprintf( __( 'Discussion (%d)', 'workpress' ), c.comments_count !== undefined ? c.comments_count : (c.comments ? c.comments.length : 0) ) }</span>
								</button>
							</div>
							<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
								${ c.can_accept ? html`
									${ c.is_accepted ? html`
										<button 
											className="button is-small is-warning is-light wp-sharp-button"
											onClick=${ (e) => {
												e.stopPropagation();
												setConfirmConfig({
													title: __( 'Revoke Solution Approval', 'workpress' ),
													message: __( 'Are you sure you want to revoke this solution? The task will be reopened for review and removed from knowledge base.', 'workpress' ),
													confirmText: __( 'Revoke Approval', 'workpress' ),
													isDanger: true,
													onConfirm: () => {
														contributionsApi.revoke(c.id)
															.then( () => {
																toast( __( 'Solution revoked and task reopened', 'workpress' ), 'info' );
																sound.play('caution');
																fetchTaskData();
															} )
															.catch( err => toast( err.message || __( 'An error occurred while revoking approval', 'workpress' ), 'danger') );
													}
												});
											} }
										>
											<span className="icon"><i className="dashicons dashicons-undo"></i></span>
											<span>${ __( 'Revoke Approval', 'workpress' ) }</span>
										</button>
									` : html`
										<button 
											className="button is-small is-success wp-sharp-button"
											onClick=${ (e) => {
												e.stopPropagation();
												setConfirmConfig({
													title: __( 'Approve Solution & Complete Task', 'workpress' ),
													message: __( 'Are you sure you want to accept this contribution as official resolution? The task will be closed and archived in knowledge base.', 'workpress' ),
													confirmText: __( 'Approve & Complete', 'workpress' ),
													isDanger: false,
													onConfirm: () => {
														contributionsApi.accept(c.id)
															.then( () => {
																toast( __( 'Solution approved and task completed successfully', 'workpress' ), 'success' );
																sound.play('celebration');
																fetchTaskData();
															} )
															.catch( err => toast( err.message || __( 'An error occurred while approving solution', 'workpress' ), 'danger') );
													}
												});
											} }
										>
											<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
											<span>${ __( 'Approve Solution', 'workpress' ) }</span>
										</button>
									` }
								` : null }
								${ ! c.is_accepted ? html`
									<button 
										className="button is-small is-danger is-outlined wp-sharp-button"
										onClick=${ (e) => {
											e.stopPropagation();
											setConfirmConfig({
												title: __( 'Trash / Archive Request', 'workpress' ),
												message: __( 'Are you sure you want to request deletion of this contribution?', 'workpress' ),
												confirmText: __( 'Send Request', 'workpress' ),
												isDanger: true,
												requiresReason: true,
												reasonLabel: __( 'Reason for deletion', 'workpress' ),
												onConfirm: ( reason ) => {
													contributionsApi.trashRequest( c.id, reason ).then( () => {
														toast( __( 'Deletion request submitted', 'workpress' ), 'info' );
														tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
													} ).catch( err => toast( err.message || __( 'Failed to send request', 'workpress' ), 'danger' ) );
												}
											});
										} }
									>
										<span className="icon"><i className="dashicons dashicons-trash"></i></span>
									</button>
								` : null }
							</div>
						</div>

						${ expandedCommentThreads[c.id] ? html`
							<div onClick=${ (e) => e.stopPropagation() }>
								<${ContributionComments}
									contributionId=${ c.id }
									initialComments=${ c.comments || [] }
									commentsCount=${ c.comments_count || 0 }
									onCommentAdded=${ (contribId, newComment) => {
										setContributions(prev => prev.map(item => {
											if (item.id === contribId) {
												const existing = item.comments || [];
												return {
													...item,
													comments: [...existing, newComment],
													comments_count: (item.comments_count || existing.length) + 1,
												};
											}
											return item;
										}));
									} }
									onCommentDeleted=${ (contribId, commentId) => {
										setContributions(prev => prev.map(item => {
											if (item.id === contribId) {
												const existing = item.comments || [];
												return {
													...item,
													comments: existing.filter(cm => cm.id !== commentId),
													comments_count: Math.max(0, (item.comments_count || existing.length) - 1),
												};
											}
											return item;
										}));
									} }
								/>
							</div>
						` : null }
					</div>
				` ) }
			</div>

			<!-- Closed Task Banner or New Contribution Form -->
			${ isClosed ? html`
				<div className="wp-card p-5 has-text-centered" style=${{ border: '1.5px solid #10b981', backgroundColor: '#f0fdf4', borderRadius: 0 }}>
					<span className="icon has-text-success is-large mb-1"><i className="dashicons dashicons-yes-alt" style=${{ fontSize: '36px' }}></i></span>
					<h4 className="title is-6 has-text-success-dark mb-1">${ __( 'Task Completed & Closed', 'workpress' ) }</h4>
					<p className="is-size-7 has-text-grey mb-3">${ __( 'The solution has been approved and the task is closed. To add new contributions or resume work, it can be reopened.', 'workpress' ) }</p>
					
					<button
						className="button is-small is-warning is-light wp-sharp-button"
						style=${{ fontWeight: '800' }}
						onClick=${ () => {
							setConfirmConfig({
								title: __( 'Reopen Task', 'workpress' ),
								message: __( 'Are you sure you want to reopen this task? It will return to active status to resume work and add contributions.', 'workpress' ),
								confirmText: __( 'Reopen Task', 'workpress' ),
								isDanger: false,
								onConfirm: () => {
									handleStateChange('open');
									toast( __( 'Task reopened successfully', 'workpress' ), 'success' );
									sound.play('button');
								}
							});
						} }
					>
						<span className="icon"><i className="dashicons dashicons-update"></i></span>
						<span>${ __( 'Reopen Task', 'workpress' ) }</span>
					</button>
				</div>
			` : html`
				<div className="wp-card has-background-light p-4" style=${{ borderRadius: 0 }}>
					<h3 className="title is-6 mb-3">${ __( 'Add New Contribution', 'workpress' ) }</h3>
					<form onSubmit=${ handleAddContribution }>
						<div className="mb-3">
							<${WpEditor}
								id="new-contribution-editor"
								value=${ newContribution }
								onChange=${ setNewContribution }
								placeholder=${ __( 'Write contribution details...', 'workpress' ) }
							/>
						</div>
						
						<div className="mb-3">
							<${MultiFilePicker} 
								attachments=${ contributionAttachments } 
								onChange=${ setContributionAttachments } 
								buttonText=${ __( 'Attach files and documents (PDF, ZIP, DOCX, Images)', 'workpress' ) }
							/>
						</div>

						<div className="columns is-multiline is-vcentered">
							<div className="column is-3">
								<div className="select is-fullwidth wp-sharp-input">
									<select value=${ contributionType } onChange=${ (e) => setContributionType(e.target.value) } style=${{ border: '2px solid #0f172a' }}>
										<option value="comment">${ __( 'Comment & Note', 'workpress' ) }</option>
										<option value="solution">${ __( 'Propose Solution', 'workpress' ) }</option>
										<option value="implementation">${ __( 'Technical Implementation', 'workpress' ) }</option>
									</select>
								</div>
							</div>
							<div className="column is-3">
								<div className="select is-fullwidth wp-sharp-input">
									<select value=${ visibilityScope } onChange=${ (e) => setVisibilityScope(e.target.value) } style=${{ border: '2px solid #0f172a' }}>
										<option value="client_review">${ __( 'Client Review', 'workpress' ) }</option>
										<option value="internal">${ __( 'Internal Team Only', 'workpress' ) }</option>
									</select>
								</div>
							</div>
							<div className="column is-3">
								<${ImagePicker}
									value=${ featuredImageUrl }
									onChange=${ ( id, url ) => {
										setFeaturedImage( id );
										setFeaturedImageUrl( url );
									} }
								/>
							</div>
							<div className="column is-3">
								<button 
									type="submit" 
									className=${ `button is-primary is-fullwidth wp-sharp-button has-text-weight-bold ${ isSubmitting ? 'is-loading' : '' }` }
									disabled=${ ! newContribution.trim() && ! featuredImage && contributionAttachments.length === 0 }
								>
									<span>${ __( 'Submit', 'workpress' ) }</span>
								</button>
							</div>
						</div>
					</form>
				</div>
			` }
		</div>
	`;
}
