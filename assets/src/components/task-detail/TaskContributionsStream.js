import { html } from '../../utils/html.js';
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

	return html`
		<div className="task-contributions-stream">
			<h2 className="title is-4 mb-4" style=${{ borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', display: 'inline-block' }}>
				Ø³Ø¬Ù„ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø§Øª ÙˆØ§Ù„Ù†Ø´Ø§Ø·
			</h2>

			<div className="timeline mb-6">
				${ contributions.length === 0 ? html`
					<div className="wp-card wp-task-timeline-empty p-5">
						<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
							<i className="dashicons dashicons-admin-comments has-text-grey" style=${{ fontSize: '22px' }}></i>
						</div>
						<p className="has-text-grey-dark has-text-weight-bold mb-1">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ù…Ø³Ø¬Ù„Ø© Ø¹Ù„Ù‰ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ø¹Ø¯</p>
						<p className="is-size-7 has-text-grey">Ø£Ø¶Ù ØªÙ‚Ø±ÙŠØ±Ø§Ù‹ ÙÙ†ÙŠØ§Ù‹ØŒ ØªØ¹Ù„ÙŠÙ‚Ø§Ù‹ØŒ Ø£Ùˆ Ø§Ù‚ØªØ±Ø­ Ø­Ù„Ø§Ù‹ Ø±Ø³Ù…ÙŠØ§Ù‹ Ù…Ù† Ø§Ù„Ù†Ù…ÙˆØ°Ø¬ Ø£Ø¯Ù†Ø§Ù‡ Ù„Ø¨Ø¯Ø¡ Ø§Ù„ØªØ¹Ø§ÙˆÙ†.</p>
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
									<h4 className="title is-6 has-text-white mb-1">Ø·Ù„Ø¨ Ø­Ø°Ù Ù…Ø³Ø§Ù‡Ù…Ø©</h4>
									<p className="is-size-7 mb-2" style=${{ opacity: 0.9 }}>
										<strong>Ø§Ù„Ø³Ø¨Ø¨:</strong> ${ c.trash_reason || 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' }
									</p>
									<div className="buttons is-centered mb-0">
										<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => {
											e.stopPropagation();
											contributionsApi.update( c.id, { is_pending_trash: false } ).then( () => {
												tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
											} );
										} }>
											<span className="icon"><i className="dashicons dashicons-undo"></i></span>
											<span>Ø±ÙØ¶ ÙˆØ§Ø³ØªØ¹Ø§Ø¯Ø©</span>
										</button>
										<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => {
											e.stopPropagation();
											contributionsApi.delete( c.id ).then( () => {
												tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
											} );
										} }>
											<span className="icon"><i className="dashicons dashicons-trash"></i></span>
											<span>Ø­Ø°Ù Ù†Ù‡Ø§Ø¦ÙŠ</span>
										</button>
									</div>
								</div>
							</div>
						` : null }

						<div className="is-flex is-align-items-center mb-2" style=${{ gap: '10px' }}>
							<figure className="image is-32x32 m-0" style=${{ position: 'relative' }}>
								<img src=${ c.author_avatar || '' } alt=${ c.author_name } style=${{ borderRadius: 0, border: c.is_client ? '2px solid #f59e0b' : '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
								${ c.is_client ? html`
									<span style=${{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#f59e0b', color: '#fff', fontSize: '9px', padding: '1px 3px', fontWeight: '900', lineHeight: 1 }}>â­</span>
								` : null }
							</figure>
							<div>
								<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<p className="has-text-weight-bold mb-0">${ c.author_name }</p>
									${ c.is_client ? html`
										<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
											Ù…Ø³ØªÙÙŠØ¯
										</span>
									` : null }
								</div>
								<p className="is-size-7 has-text-grey" title=${ formatDateTime(c.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(c.created_at) }</p>
							</div>
						</div>
						
						${ c.payload && c.payload.cover_url ? html`
							<div className="mb-3 p-1" style=${{ border: '1px solid #ededed', display: 'inline-block' }}>
								<figure className="image is-128x128 m-0">
									<img src=${ c.payload.cover_url } alt="Ù…Ø±ÙÙ‚" style=${{ objectFit: 'cover' }} />
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
									<i className=${`dashicons ${ c.is_accepted ? 'dashicons-yes-alt' : 'dashicons-tag' } ml-1`}></i>
									${ c.is_accepted ? 'Ù…Ø¹ØªÙ…Ø¯Ø© ÙƒØ­Ù„ ÙˆØ§ÙƒØªÙ…Ù„Øª Ø§Ù„Ù…Ù‡Ù…Ø©' : ( c.type_label || 'Ù…Ø³Ø§Ù‡Ù…Ø©' ) }
								</span>
								<button 
									className=${`button is-small ${ expandedCommentThreads[c.id] ? 'is-info is-light has-text-weight-bold' : 'is-light' } wp-sharp-button is-flex is-align-items-center mr-2`}
									onClick=${ (e) => {
										e.stopPropagation();
										setExpandedCommentThreads(prev => ({ ...prev, [c.id]: !prev[c.id] }));
									} }
									title="Ø¹Ø±Ø¶ ÙˆØ¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆØ§Ù„Ù…Ù†Ø§Ù‚Ø´Ø§Øª Ø§Ù„ÙÙ†ÙŠØ©"
								>
									<span className="icon is-small ml-1"><i className="dashicons dashicons-admin-comments"></i></span>
									<span>Ø§Ù„Ù…Ù†Ø§Ù‚Ø´Ø© (${ c.comments_count !== undefined ? c.comments_count : (c.comments ? c.comments.length : 0) })</span>
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
													title: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„',
													message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ø§ Ø§Ù„Ø­Ù„ØŸ Ø³ØªØªÙ… Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø© Ù„Ù„Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØ³Ø­Ø¨ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ù…Ù† Ø§Ù„Ù…Ø¹Ø±ÙØ©.',
													confirmText: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯',
													isDanger: true,
													onConfirm: () => {
														contributionsApi.revoke(c.id)
															.then( () => {
																toast('ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø©', 'info');
																sound.play('caution');
																fetchTaskData();
															} )
															.catch( err => toast( err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯', 'danger') );
													}
												});
											} }
										>
											<span className="icon"><i className="dashicons dashicons-undo"></i></span>
											<span>Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯</span>
										</button>
									` : html`
										<button 
											className="button is-small is-success wp-sharp-button"
											onClick=${ (e) => {
												e.stopPropagation();
												setConfirmConfig({
													title: 'Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø©',
													message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ø¹ØªÙ…Ø§Ø¯ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© ÙƒØ­Ù„ØŸ Ø³ÙŠØªÙ… Ø¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…Ù‡Ù…Ø© ÙÙˆØ±ÙŠØ§Ù‹ ÙˆÙ†Ù‚Ù„Ù‡Ø§ Ù„Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ù…Ø¹Ø±ÙØ©.',
													confirmText: 'Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø©',
													isDanger: false,
													onConfirm: () => {
														contributionsApi.accept(c.id)
															.then( () => {
																toast('ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ§ÙƒØªÙ…Ø§Ù„ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success');
																sound.play('celebration');
																fetchTaskData();
															} )
															.catch( err => toast( err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯', 'danger') );
													}
												});
											} }
										>
											<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
											<span>Ø§Ø¹ØªÙ…Ø§Ø¯ ÙƒØ­Ù„</span>
										</button>
									` }
								` : null }
								${ ! c.is_accepted ? html`
									<button 
										className="button is-small is-danger is-outlined wp-sharp-button"
										onClick=${ (e) => {
											e.stopPropagation();
											setConfirmConfig({
												title: 'Ø·Ù„Ø¨ Ø­Ø°Ù Ù…Ø³Ø§Ù‡Ù…Ø©',
												message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø·Ù„Ø¨ Ø­Ø°Ù Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©ØŸ',
												confirmText: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨',
												isDanger: true,
												requiresReason: true,
												reasonLabel: 'Ø³Ø¨Ø¨ Ø§Ù„Ø­Ø°Ù',
												onConfirm: ( reason ) => {
													contributionsApi.trashRequest( c.id, reason ).then( () => {
														toast('ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø·Ù„Ø¨ Ø­Ø°Ù Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©', 'info');
														tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
													} ).catch( err => toast( err.message || 'ÙØ´Ù„ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø·Ù„Ø¨', 'danger' ) );
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
					<h4 className="title is-6 has-text-success-dark mb-1">Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø© Ù…ÙƒØªÙ…Ù„Ø© ÙˆÙ…ØºÙ„Ù‚Ø©</h4>
					<p className="is-size-7 has-text-grey mb-3">ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø­Ù„ ÙˆØ¥ØºÙ„Ø§Ù‚ Ø§Ù„Ù…Ù‡Ù…Ø©. Ù„Ø¥Ø¶Ø§ÙØ© Ù…Ø³Ø§Ù‡Ù…Ø§Øª Ø¬Ø¯ÙŠØ¯Ø© Ø£Ùˆ Ù…ØªØ§Ø¨Ø¹Ø© Ø§Ù„Ø¹Ù…Ù„ØŒ ÙŠÙ…ÙƒÙ† Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­Ù‡Ø§.</p>
					
					<button
						className="button is-small is-warning is-light wp-sharp-button"
						style=${{ fontWeight: '800' }}
						onClick=${ () => {
							setConfirmConfig({
								title: 'Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø©',
								message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø±ØºØ¨ØªÙƒ ÙÙŠ Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø©ØŸ Ø³ØªØ¹ÙˆØ¯ Ø§Ù„Ù…Ù‡Ù…Ø© Ù„Ø­Ø§Ù„Ø© Ù†Ø´Ø·Ø© ÙˆÙ…ÙØªÙˆØ­Ø© Ù„Ø¥ØªØ§Ø­Ø© Ø§Ø³ØªØ¦Ù†Ø§Ù Ø§Ù„Ø¹Ù…Ù„ ÙˆØ¥Ø¶Ø§ÙØ© Ù…Ø³Ø§Ù‡Ù…Ø§Øª.',
								confirmText: 'Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø©',
								isDanger: false,
								onConfirm: () => {
									handleStateChange('open');
									toast('ØªÙ…Øª Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success');
									sound.play('button');
								}
							});
						} }
					>
						<span className="icon"><i className="dashicons dashicons-update"></i></span>
						<span>Ø¥Ø¹Ø§Ø¯Ø© ÙØªØ­ Ø§Ù„Ù…Ù‡Ù…Ø© Ù„Ù„Ø¹Ù…Ù„</span>
					</button>
				</div>
			` : html`
				<div className="wp-card has-background-light p-4" style=${{ borderRadius: 0 }}>
					<h3 className="title is-6 mb-3">Ø¥Ø¶Ø§ÙØ© Ù…Ø³Ø§Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø©</h3>
					<form onSubmit=${ handleAddContribution }>
						<div className="mb-3">
							<${WpEditor}
								id="new-contribution-editor"
								value=${ newContribution }
								onChange=${ setNewContribution }
								placeholder="Ø§ÙƒØªØ¨ Ù…Ø³Ø§Ù‡Ù…ØªÙƒ..."
							/>
						</div>
						
						<div className="mb-3">
							<${MultiFilePicker} 
								attachments=${ contributionAttachments } 
								onChange=${ setContributionAttachments } 
								buttonText="Ø¥Ø±ÙØ§Ù‚ Ù…Ù„ÙØ§Øª ÙˆÙ…Ø³ØªÙ†Ø¯Ø§Øª Ù„Ù„Ù…Ø³Ø§Ù‡Ù…Ø© (PDF, ZIP, DOCX, ØµÙˆØ±)"
							/>
						</div>

						<div className="columns is-multiline is-vcentered">
							<div className="column is-3">
								<div className="select is-fullwidth wp-sharp-input">
									<select value=${ contributionType } onChange=${ (e) => setContributionType(e.target.value) } style=${{ border: '2px solid #0f172a' }}>
										<option value="comment">ØªØ¹Ù„ÙŠÙ‚ ÙˆÙ…Ù„Ø§Ø­Ø¸Ø©</option>
										<option value="solution">Ø§Ù‚ØªØ±Ø§Ø­ Ø­Ù„</option>
										<option value="implementation">ØªÙ†ÙÙŠØ° ÙÙ†ÙŠ</option>
									</select>
								</div>
							</div>
							<div className="column is-3">
								<div className="select is-fullwidth wp-sharp-input">
									<select value=${ visibilityScope } onChange=${ (e) => setVisibilityScope(e.target.value) } style=${{ border: '2px solid #0f172a' }}>
										<option value="client_review">Ù…ØªØ§Ø­ Ù„Ù„Ø¹Ù…ÙŠÙ„ </option>
										<option value="internal">Ø¯Ø§Ø®Ù„ÙŠ Ù„Ù„ÙØ±ÙŠÙ‚ </option>
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
									<span>Ø¥Ø±Ø³Ø§Ù„</span>
								</button>
							</div>
						</div>
					</form>
				</div>
			` }
		</div>
	`;
}
