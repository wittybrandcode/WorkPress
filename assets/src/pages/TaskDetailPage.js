import { html, useState, useEffect } from '../utils/html.js';
import { hooks } from '../utils/hooks.js';
import { tasksApi, contributionsApi, projectsApi, usersApi } from '../api/client.js';
import WpEditor from '../components/WpEditor.js';
import ImagePicker from '../components/ImagePicker.js';
import ContributionDetailModal from '../components/ContributionDetailModal.js';
import ContributionComments from '../components/ContributionComments.js';
import TaskModal from '../components/TaskModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
import PriorityBadge from '../components/PriorityBadge.js';
import Loader from '../components/Loader.js';
import MemberSelect from '../components/MemberSelect.js';
import TaskChecklist from '../components/TaskChecklist.js';
import TaskTimeTracker from '../components/TaskTimeTracker.js';
import TaskDocuments from '../components/TaskDocuments.js';
import MultiFilePicker from '../components/MultiFilePicker.js';
import { isStaffUser } from '../utils/userScope.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/datetime.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function TaskDetailPage( { taskId: propTaskId, refreshKey } ) {
	const [ task, setTask ] = useState( null );
	const [ contributions, setContributions ] = useState( [] );
	const [ newContribution, setNewContribution ] = useState( '' );
	const [ contributionType, setContributionType ] = useState( 'comment' );
	const [ visibilityScope, setVisibilityScope ] = useState( 'client_review' );
	const [ featuredImage, setFeaturedImage ] = useState( null );
	const [ featuredImageUrl, setFeaturedImageUrl ] = useState( '' );
	const [ contributionAttachments, setContributionAttachments ] = useState( [] );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ assignees, setAssignees ] = useState( [] );
	const [ availableUsers, setAvailableUsers ] = useState( [] );
	const [ selectedAssigneeId, setSelectedAssigneeId ] = useState( '' );
	const [ selectedContribution, setSelectedContribution ] = useState( null );
	const [ isContributionModalOpen, setIsContributionModalOpen ] = useState( false );
	const [ isTaskModalOpen, setIsTaskModalOpen ] = useState( false );
	const [ confirmConfig, setConfirmConfig ] = useState( null );
	const [ expandedCommentThreads, setExpandedCommentThreads ] = useState( {} );
	const [ isNotFound, setIsNotFound ] = useState( false );
	
	const taskId = propTaskId || window.location.hash.split('/')[2];

	const fetchTaskData = () => {
		if ( ! taskId || isNotFound ) return;
		tasksApi.get( taskId ).then( ( taskData ) => {
			setTask( taskData );
			setIsNotFound( false );
			if ( taskData && taskData.project_id ) {
				projectsApi.members.list( taskData.project_id )
					.then( ( members ) => {
						const assignable = ( Array.isArray( members ) ? members : [] )
							.filter( m => m.role !== 'viewer' && m.project_role !== 'viewer' && isStaffUser( m ) );
						if ( assignable.length > 0 ) {
							setAvailableUsers( assignable );
						} else {
							usersApi.list( { roles: 'administrator,editor,author,contributor' } ).then( uList => {
								setAvailableUsers( ( uList || [] ).filter( isStaffUser ) );
							} ).catch( () => {} );
						}
					} )
					.catch( () => {
						usersApi.list( { roles: 'administrator,editor,author,contributor' } ).then( uList => {
							setAvailableUsers( ( uList || [] ).filter( isStaffUser ) );
						} ).catch( () => {} );
					} );
			} else {
				usersApi.list( { roles: 'administrator,editor,author,contributor' } ).then( uList => {
					setAvailableUsers( ( uList || [] ).filter( isStaffUser ) );
				} ).catch( () => {} );
			}

			tasksApi.contributions.list( taskId ).then( setContributions ).catch( () => {} );
			tasksApi.assignment.get( taskId ).then( setAssignees ).catch( () => {} );
		} ).catch( ( err ) => {
			if ( err && ( err.code === 'not_found' || err.status === 404 ) ) {
				setIsNotFound( true );
			}
		} );
	};

	useEffect( () => {
		fetchTaskData();

		// Smart Live Polling every 4 seconds for instant real-time timeline stream (only if task exists)
		const pollInterval = setInterval( () => {
			if ( taskId && ! isNotFound ) {
				tasksApi.contributions.list( taskId ).then( ( latestContribs ) => {
					setContributions( prev => {
						if ( Array.isArray( latestContribs ) && ( latestContribs.length !== prev.length || JSON.stringify( latestContribs.map( x => x.id ) ) !== JSON.stringify( prev.map( x => x.id ) ) ) ) {
							return latestContribs;
						}
						return prev;
					} );
				} ).catch( () => {} );
			}
		}, 4000 );

		return () => clearInterval( pollInterval );
	}, [ taskId, refreshKey, isNotFound ] );

	const handleAddContribution = ( e ) => {
		e.preventDefault();
		if ( ! newContribution.trim() && ! featuredImage && contributionAttachments.length === 0 ) return;
		
		setIsSubmitting( true );
		
		const data = { 
			content: newContribution,
			type: contributionType,
			attachments: contributionAttachments.map( a => typeof a === 'object' ? a.id : a ),
			payload: {
				cover_id: featuredImage,
				visibility_scope: visibilityScope
			}
		};
		
		tasksApi.contributions.create( taskId, data ).then( () => {
			setNewContribution( '' );
			setFeaturedImage( null );
			setFeaturedImageUrl( '' );
			setContributionAttachments( [] );
			toast( 'تمت إضافة المساهمة بنجاح', 'success' );
			sound.play( 'button' );
			fetchTaskData();
		} ).catch( err => {
			console.error( err );
			toast( err.message || 'فشل إضافة المساهمة', 'danger' );
			sound.play( 'caution' );
		} ).finally( () => setIsSubmitting( false ) );
	};

	const handleStateChange = ( newState ) => {
		tasksApi.updateState( taskId, newState ).then( () => {
			fetchTaskData();
		} ).catch( console.error );
	};

	const handleAssign = () => {
		if ( ! selectedAssigneeId ) return;
		const currentIds = assignees.map(a => a.id);
		if ( currentIds.includes(parseInt(selectedAssigneeId)) ) return;
		
		const newIds = [...currentIds, parseInt(selectedAssigneeId)];
		tasksApi.assignment.update( taskId, newIds ).then( () => {
			tasksApi.assignment.get( taskId ).then( setAssignees );
			setSelectedAssigneeId('');
		}).catch( console.error );
	};
	
	const handleUnassign = ( uid ) => {
		setConfirmConfig({
			title: 'إلغاء التكليف',
			message: 'هل أنت متأكد من إلغاء تكليف هذا العضو؟',
			isDanger: true,
			confirmText: 'إلغاء التكليف',
			onConfirm: () => {
				const newIds = assignees.filter(a => a.id !== uid).map(a => a.id);
				tasksApi.assignment.update( taskId, newIds ).then( () => {
					tasksApi.assignment.get( taskId ).then( setAssignees );
				}).catch( console.error );
			}
		});
	};

	if ( isNotFound ) {
		return html`
			<div className="box wp-card has-text-centered py-6 mt-4" style=${{ backgroundColor: '#ffffff' }}>
				<span className="icon is-large has-text-warning mb-3" style=${{ fontSize: '48px', height: '48px' }}>
					<i className="dashicons dashicons-warning"></i>
				</span>
				<h2 className="title is-4 has-text-grey-dark">المهمة غير موجودة أو تم حذفها</h2>
				<p className="subtitle is-6 has-text-grey mt-2">
					المعرف المطلوب (#${taskId}) غير موجود حالياً في المنظومة.
				</p>
				<div className="buttons is-centered mt-4">
					<a href="#/kanban" className="button is-primary wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-columns"></i></span>
						<span>العودة للكانبان</span>
					</a>
					<a href="#/requests" className="button is-light wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
						<span>وارد الطلبات</span>
					</a>
				</div>
			</div>
		`;
	}

	if ( ! task ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="جاري تحميل تفاصيل المهمة..." size="large" />
			</div>
		`;
	}

	return html`
		<div className="mt-4">
			<!-- Sticky Action & Title Bar -->
			<div style=${{ position: 'sticky', top: '76px', zIndex: 35, backgroundColor: 'rgba(248, 250, 252, 0.95)', backdropFilter: 'blur(4px)', padding: '0.6rem 0', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
				<div className="is-flex is-justify-content-space-between is-align-items-center">
					<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
						<a href="#/kanban" className="button is-small is-light" style=${{ borderRadius: 0, border: '1px solid #cbd5e1', fontWeight: '800' }} title="العودة للوحة المهام">
							<i className="dashicons dashicons-arrow-right-alt2"></i>
							<span style=${{ marginRight: '4px' }}>الكانبان</span>
						</a>
						<span className="tag is-dark" style=${{ borderRadius: 0, fontWeight: '800' }}>${ task.ref_key }</span>
						<h1 className="title is-4 mb-0" style=${{ color: '#0f172a', fontWeight: '900' }}>${ task.title }</h1>
					</div>

					<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
						${ task.project_name ? html`
							<span className="wp-dense-chip" style=${{ fontWeight: '700', borderColor: '#cbd5e1' }}>
								<i className="dashicons dashicons-portfolio" style=${{ color: '#3b82f6', fontSize: '13px' }}></i>
								<span>${ task.project_name }</span>
							</span>
						` : null }
						<button className="button is-small wp-sharp-button is-primary" onClick=${ () => setIsTaskModalOpen(true) }>
							<span className="icon"><i className="dashicons dashicons-edit"></i></span>
							<span>تعديل المهمة</span>
						</button>
					</div>
				</div>
			</div>
			
			<div className="columns is-variable is-6">
				<!-- Main Workspace -->
				<div className="column is-8">

					${ task.cover_url && html`
						<figure className="image is-2by1 mb-5" style=${{ border: '2px solid #0f172a' }}>
							<img src=${ task.cover_url } alt=${ task.title } style=${{ objectFit: 'cover' }} />
						</figure>
					` }
					
					<div className="wp-card p-5 mb-4">
						<div className="content" dangerouslySetInnerHTML=${{ __html: task.content || '' }}></div>
					</div>

					<${TaskChecklist} 
						taskId=${ taskId } 
						checklists=${ task.checklists || [] } 
						onUpdate=${ ( newChecklists, updatedTask ) => {
							if ( updatedTask ) {
								setTask( updatedTask );
							} else {
								setTask( prev => ( { ...prev, checklists: newChecklists } ) );
							}
						} } 
					/>

					<${TaskTimeTracker} 
						taskId=${ taskId } 
						task=${ task } 
						onUpdate=${ ( updatedTask ) => setTask( updatedTask ) } 
					/>

					<${TaskDocuments} 
						taskId=${ taskId } 
						attachments=${ task.attachments || [] } 
						onUpdate=${ ( updatedTask ) => setTask( updatedTask ) } 
					/>
					
					<h2 className="title is-4 mb-4" style=${{ borderBottom: '2px solid #0f172a', paddingBottom: '0.5rem', display: 'inline-block' }}>سجل المساهمات والنشاط</h2>
					
					<div className="timeline mb-6">
						${ contributions.length === 0 ? html`
							<div className="wp-card has-text-centered p-5" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1', backgroundColor: '#f8fafc' }}>
								<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
									<i className="dashicons dashicons-admin-comments has-text-grey" style=${{ fontSize: '22px' }}></i>
								</div>
								<p className="has-text-grey-dark has-text-weight-bold mb-1">لا توجد مساهمات مسجلة على هذه المهمة بعد</p>
								<p className="is-size-7 has-text-grey">أضف تقريراً فنياً، تعليقاً، أو اقترح حلاً رسمياً من النموذج أدناه لبدء التعاون.</p>
							</div>
						` : contributions.map( ( c ) => html`
							<div key=${ c.id } className="box wp-card p-4 mb-3" style=${{ cursor: 'pointer', position: 'relative' }} onClick=${(e) => { if (c.is_pending_trash) { e.preventDefault(); return; } setSelectedContribution(c); setIsContributionModalOpen(true); }}>
								${ c.is_pending_trash ? html`
									<div style=${{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 56, 96, 0.15)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(3px)' }} onClick=${(e) => e.stopPropagation()}>
										<div className="box has-text-centered p-3" style=${{ width: '100%', backgroundColor: '#ff3860', color: 'white', border: '1px solid #ff1f4b', boxShadow: '0 8px 24px rgba(255,56,96,0.3)', borderRadius: 0 }}>
											<h4 className="title is-6 has-text-white mb-1">طلب حذف مساهمة</h4>
											<p className="is-size-7 mb-2" style=${{ opacity: 0.9 }}>
												<strong>السبب:</strong> ${ c.trash_reason || 'غير محدد' }
											</p>
											<div className="buttons is-centered mb-0">
												<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => {
													e.stopPropagation();
													contributionsApi.update( c.id, { is_pending_trash: false } ).then( () => {
														tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
													} );
												} }>
													<span className="icon"><i className="dashicons dashicons-undo"></i></span>
													<span>رفض واستعادة</span>
												</button>
												<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => {
													e.stopPropagation();
													contributionsApi.delete( c.id ).then( () => {
														tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
													} );
												} }>
													<span className="icon"><i className="dashicons dashicons-trash"></i></span>
													<span>حذف نهائي</span>
												</button>
											</div>
										</div>
									</div>
								` : null }
								<div className="is-flex is-align-items-center mb-2" style=${{ gap: '10px' }}>
									<figure className="image is-32x32 m-0" style=${{ position: 'relative' }}>
										<img src=${ c.author_avatar || '' } alt=${ c.author_name } style=${{ borderRadius: 0, border: c.is_client ? '2px solid #f59e0b' : '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
										${ c.is_client ? html`
											<span style=${{ position: 'absolute', bottom: '-4px', left: '-4px', background: '#f59e0b', color: '#fff', fontSize: '9px', padding: '1px 3px', fontWeight: '900', lineHeight: 1 }}>⭐</span>
										` : null }
									</figure>
									<div>
										<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
											<p className="has-text-weight-bold mb-0">${ c.author_name }</p>
											${ c.is_client ? html`
												<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.72rem', padding: '1px 6px', height: 'auto' }}>
													مستفيد
												</span>
											` : null }
										</div>
										<p className="is-size-7 has-text-grey" title=${ formatDateTime(c.created_at) } style=${{ cursor: 'help' }}>${ formatRelativeTime(c.created_at) }</p>
									</div>
								</div>
								
								${ c.payload && c.payload.cover_url ? html`
									<div className="mb-3 p-1" style=${{ border: '1px solid #ededed', display: 'inline-block' }}>
										<figure className="image is-128x128 m-0">
											<img src=${ c.payload.cover_url } alt="مرفق" style=${{ objectFit: 'cover' }} />
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
											${ c.is_accepted ? 'معتمدة كحل واكتملت المهمة' : ( c.type_label || 'مساهمة' ) }
										</span>
										<button 
											className=${`button is-small ${ expandedCommentThreads[c.id] ? 'is-info is-light has-text-weight-bold' : 'is-light' } wp-sharp-button is-flex is-align-items-center mr-2`}
											onClick=${ (e) => {
												e.stopPropagation();
												setExpandedCommentThreads(prev => ({ ...prev, [c.id]: !prev[c.id] }));
											} }
											title="عرض وإضافة الملاحظات والمناقشات الفنية"
										>
											<span className="icon is-small ml-1"><i className="dashicons dashicons-admin-comments"></i></span>
											<span>المناقشة (${ c.comments_count !== undefined ? c.comments_count : (c.comments ? c.comments.length : 0) })</span>
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
															title: 'إلغاء اعتماد الحل',
															message: 'هل أنت متأكد من إلغاء اعتماد هذا الحل؟ ستتم إعادة فتح المهمة للمراجعة وسحب المساهمة من المعرفة.',
															confirmText: 'إلغاء الاعتماد',
															isDanger: true,
															onConfirm: () => {
																contributionsApi.revoke(c.id)
																	.then( () => {
																		toast('تم إلغاء اعتماد الحل وإعادة فتح المهمة', 'info');
																		sound.play('caution');
																		fetchTaskData();
																	} )
																	.catch( err => toast( err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'danger') );
															}
														});
													} }
												>
													<span className="icon"><i className="dashicons dashicons-undo"></i></span>
													<span>إلغاء الاعتماد</span>
												</button>
											` : html`
												<button 
													className="button is-small is-success wp-sharp-button"
													onClick=${ (e) => {
														e.stopPropagation();
														setConfirmConfig({
															title: 'اعتماد الحل واكتمال المهمة',
															message: 'هل أنت متأكد من اعتماد هذه المساهمة كحل؟ سيتم إغلاق المهمة فورياً ونقلها لقاعدة المعرفة.',
															confirmText: 'اعتماد واكتمال المهمة',
															isDanger: false,
															onConfirm: () => {
																contributionsApi.accept(c.id)
																	.then( () => {
																		toast('تم اعتماد الحل واكتمال المهمة بنجاح', 'success');
																		sound.play('celebration');
																		fetchTaskData();
																	} )
																	.catch( err => toast( err.message || 'حدث خطأ أثناء الاعتماد', 'danger') );
															}
														});
													} }
												>
													<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
													<span>اعتماد كحل</span>
												</button>
											` }
										` : null }
										${ ! c.is_accepted ? html`
											<button 
												className="button is-small is-danger is-outlined wp-sharp-button"
												onClick=${ (e) => {
													e.stopPropagation();
													setConfirmConfig({
														title: 'طلب حذف مساهمة',
														message: 'هل أنت متأكد من رغبتك في طلب حذف هذه المساهمة؟',
														confirmText: 'إرسال الطلب',
														isDanger: true,
														requiresReason: true,
														reasonLabel: 'سبب الحذف',
														onConfirm: ( reason ) => {
															contributionsApi.trashRequest( c.id, reason ).then( () => {
																toast('تم إرسال طلب حذف المساهمة', 'info');
																tasksApi.contributions.list( taskId ).then( setContributions ).catch( console.error );
															} ).catch( err => toast( err.message || 'فشل إرسال الطلب', 'danger' ) );
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

					${ ( task.status === 'closed' || task.status === 'completed' ) ? html`
						<div className="wp-card p-5 has-text-centered" style=${{ border: '1.5px solid #10b981', backgroundColor: '#f0fdf4' }}>
							<span className="icon has-text-success is-large mb-1"><i className="dashicons dashicons-yes-alt" style=${{ fontSize: '36px' }}></i></span>
							<h4 className="title is-6 has-text-success-dark mb-1">هذه المهمة مكتملة ومغلقة</h4>
							<p className="is-size-7 has-text-grey mb-3">تم اعتماد الحل وإغلاق المهمة. لإضافة مساهمات جديدة أو متابعة العمل، يمكن إعادة فتحها.</p>
							
							<button
								className="button is-small is-warning is-light wp-sharp-button"
								style=${{ fontWeight: '800' }}
								onClick=${ () => {
									setConfirmConfig({
										title: 'إعادة فتح المهمة',
										message: 'هل أنت متأكد من رغبتك في إعادة فتح هذه المهمة؟ ستعود المهمة لحالة نشطة ومفتوحة لإتاحة استئناف العمل وإضافة مساهمات.',
										confirmText: 'إعادة فتح المهمة',
										isDanger: false,
										onConfirm: () => {
											handleStateChange('open');
											toast('تمت إعادة فتح المهمة بنجاح', 'success');
											sound.play('button');
										}
									});
								} }
							>
								<span className="icon"><i className="dashicons dashicons-update"></i></span>
								<span>إعادة فتح المهمة للعمل</span>
							</button>
						</div>
					` : html`
						<div className="wp-card has-background-light p-4">
							<h3 className="title is-6 mb-3">إضافة مساهمة جديدة</h3>
							<form onSubmit=${ handleAddContribution }>
								<div className="mb-3">
									<${WpEditor}
										id="new-contribution-editor"
										value=${ newContribution }
										onChange=${ setNewContribution }
										placeholder="اكتب مساهمتك..."
									/>
								</div>
								
								<div className="mb-3">
									<${MultiFilePicker} 
										attachments=${ contributionAttachments } 
										onChange=${ setContributionAttachments } 
										buttonText="إرفاق ملفات ومستندات للمساهمة (PDF, ZIP, DOCX, صور)"
									/>
								</div>

								<div className="columns is-multiline is-vcentered">
									<div className="column is-3">
										<div className="select is-fullwidth">
											<select value=${ contributionType } onChange=${ (e) => setContributionType(e.target.value) } style=${{ borderRadius: 0, border: '2px solid #0f172a' }}>
												<option value="comment">تعليق وملاحظة</option>
												<option value="solution">اقتراح حل</option>
												<option value="implementation">تنفيذ فني</option>
											</select>
										</div>
									</div>
									<div className="column is-3">
										<div className="select is-fullwidth">
											<select value=${ visibilityScope } onChange=${ (e) => setVisibilityScope(e.target.value) } style=${{ borderRadius: 0, border: '2px solid #0f172a' }}>
												<option value="client_review">متاح للعميل </option>
												<option value="internal">داخلي للفريق </option>
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
											className=${ `button is-primary is-fullwidth has-text-weight-bold ${ isSubmitting ? 'is-loading' : '' }` }
											disabled=${ ! newContribution.trim() && ! featuredImage && contributionAttachments.length === 0 }
											style=${{ borderRadius: 0 }}
										>
											<span>إرسال</span>
										</button>
									</div>
								</div>
							</form>
						</div>
					` }
				</div>

				<!-- Sidebar Actions -->
				<div className="column is-4">
					<div className="wp-card p-4 mb-4" style=${{ position: 'sticky', top: '50px' }}>
						<h3 className="title is-6 mb-4 has-text-grey">إدارة المهمة</h3>
						
						<div className="field mb-4">
							<label className="label is-small">حالة المهمة (الحالة المشتقة حياً)</label>
							<div className="p-3 wp-border" style=${{ backgroundColor: '#f8fafc' }}>
								<div className="mb-2">
									${ (task.status === 'completed' || task.status === 'closed') && html`
										<span className="tag is-success is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
											<i className="dashicons dashicons-yes-alt ml-1"></i> مكتملة ومعتمدة
										</span>
									` }
									${ (task.status === 'in_progress' || task.status === 'in_review') && html`
										<span className="tag is-warning is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
											<i className="dashicons dashicons-hammer ml-1"></i> قيد الإنجاز والتعاون
										</span>
									` }
									${ task.status === 'assigned' && html`
										<span className="tag is-info is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
											<i className="dashicons dashicons-admin-users ml-1"></i> مسندة ومخصصة
										</span>
									` }
									${ (task.status === 'new' || task.status === 'open' || !task.status) && html`
										<span className="tag is-dark is-light is-medium is-fullwidth has-text-weight-bold" style=${{ borderRadius: 0 }}>
											<i className="dashicons dashicons-tag ml-1"></i> جديدة وغير مسندة
										</span>
									` }
								</div>
								<p className="is-size-7 has-text-grey">
									<i className="dashicons dashicons-update is-size-7 ml-1"></i>
									تتدرج الحالة أوتوماتيكياً: (تخصيص عضو ← إضافة مساهمة ← اعتماد الحل).
								</p>
							</div>
						</div>
						
						<div className="field mb-4">
							<label className="label is-small">مستوى الأولوية</label>
							<div className="p-1" style=${{ border: '1px solid #ededed', backgroundColor: '#f8fafc' }}>
								<${PriorityBadge} priority=${ task.priority } />
							</div>
						</div>
						
						<hr style=${{ backgroundColor: '#0f172a', height: '2px' }} />
						
						<div className="field mb-4">
							<label className="label is-small">المكلَّفون بالمهمة</label>
							<div className="mb-2">
								${ assignees.length === 0 ? html`
									<p className="has-text-grey is-size-7">لا يوجد أعضاء مكلفين بهذه المهمة.</p>
								` : assignees.map( a => html`
									<div key=${a.id} className="is-flex is-align-items-center is-justify-content-space-between p-2 mb-1" style=${{ border: '1px solid #ededed', backgroundColor: '#fff' }}>
										<div className="is-flex is-align-items-center">
											<figure className="image is-24x24 mr-2" style=${{ marginLeft: '8px' }}>
												<img src=${a.avatar} alt=${a.display_name} style=${{ borderRadius: 0 }} />
											</figure>
											<span className="is-size-7 has-text-weight-bold">${a.display_name}</span>
										</div>
										<button className="delete is-small" onClick=${() => handleUnassign(a.id)} title="إلغاء التكليف"></button>
									</div>
								`)}
							</div>
							
							<div className="field">
								<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
									<div style=${{ flex: 1 }}>
										<${MemberSelect}
											users=${availableUsers.filter( u => !assignees.find( a => parseInt(a.id) === parseInt(u.id) ) )}
											value=${selectedAssigneeId}
											onChange=${(uid) => setSelectedAssigneeId(uid)}
											placeholder="-- اختر عضواً للتكليف --"
											size="small"
										/>
									</div>
									<button 
										className="button is-primary is-small wp-sharp-button" 
										onClick=${handleAssign} 
										disabled=${!selectedAssigneeId}
										style=${{ height: '32px' }}
									>
										تكليف
									</button>
								</div>
							</div>
						</div>
						
						<hr style=${{ backgroundColor: '#0f172a', height: '2px' }} />
						
						<div className="field mb-2">
							<button className="button is-fullwidth wp-sidebar-action" onClick=${ () => window.location.hash = '#/kanban' } style=${{ justifyContent: 'flex-start' }}>
								<span className="icon"><i className="dashicons dashicons-columns"></i></span>
								<span>العودة للكانبان</span>
							</button>
						</div>

						<!-- Custom Task Sidebar Actions Hook -->
						${ hooks.applyFilters('workpress_task_sidebar_actions', [], task).map((ActionComp, i) => html`<${ActionComp} key=${i} task=${task} />`) }
						<!-- Custom Task Meta Details Hook -->
						${ hooks.applyFilters('workpress_task_meta_details', [], task).map((MetaComp, i) => html`<${MetaComp} key=${i} task=${task} />`) }
					</div>
				</div>
			</div>
			<${ContributionDetailModal}
				isActive=${ isContributionModalOpen }
				onClose=${ () => { setIsContributionModalOpen(false); setSelectedContribution(null); } }
				contribution=${ selectedContribution }
				onStatusChange=${ fetchTaskData }
			/>
			<${TaskModal} 
				isActive=${ isTaskModalOpen } 
				onClose=${ () => setIsTaskModalOpen(false) } 
				task=${ task }
				onSave=${ fetchTaskData }
			/>
			
			${ confirmConfig && html`
				<${ConfirmModal}
					isActive=${ true }
					title=${ confirmConfig.title }
					message=${ confirmConfig.message }
					confirmText=${ confirmConfig.confirmText }
					cancelText="إلغاء"
					isDanger=${ confirmConfig.isDanger }
					onConfirm=${ () => {
						confirmConfig.onConfirm();
						setConfirmConfig(null);
					} }
					onCancel=${ () => setConfirmConfig(null) }
				/>
			` }
		</div>
	`;
}
