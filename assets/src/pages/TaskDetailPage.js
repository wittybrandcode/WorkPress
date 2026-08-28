import { html, useState, useEffect } from '../utils/html.js';
import { tasksApi, contributionsApi, projectsApi, usersApi } from '../api/client.js';
import ContributionDetailModal from '../components/modals/Modal.js';
import TaskModal from '../components/modals/Modal.js';
import ConfirmModal from '../components/modals/Modal.js';
import Loader from '../components/ui/Loader.js';
import TaskChecklist from '../components/tasks/TaskChecklist.js';
import TaskTimeTracker from '../components/tasks/TaskTimeTracker.js';
import TaskDocuments from '../components/tasks/TaskDocuments.js';
import TaskHeaderActions from '../components/task-detail/TaskHeaderActions.js';
import TaskContributionsStream from '../components/task-detail/TaskContributionsStream.js';
import TaskMetaSidebar from '../components/task-detail/TaskMetaSidebar.js';
import { isStaffUser } from '../utils/userScope.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

/**
 * WorkPress Task Detail & Collaboration Hub (Lean Coordinator)
 *
 * @package WorkPress
 * @subpackage Pages/TaskDetail
 * @version 2.2.3
 */
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

		// Smart Live Polling every 4 seconds for instant real-time timeline stream
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
			toast( 'ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
			sound.play( 'button' );
			fetchTaskData();
		} ).catch( err => {
			console.error( err );
			toast( err.message || 'ÙØ´Ù„ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©', 'danger' );
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
			title: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ØªÙƒÙ„ÙŠÙ',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ù„ØºØ§Ø¡ ØªÙƒÙ„ÙŠÙ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø¶ÙˆØŸ',
			isDanger: true,
			confirmText: 'Ø¥Ù„ØºØ§Ø¡ Ø§Ù„ØªÙƒÙ„ÙŠÙ',
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
				<h2 className="title is-4 has-text-grey-dark">Ø§Ù„Ù…Ù‡Ù…Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø© Ø£Ùˆ ØªÙ… Ø­Ø°ÙÙ‡Ø§</h2>
				<p className="subtitle is-6 has-text-grey mt-2">
					Ø§Ù„Ù…Ø¹Ø±Ù Ø§Ù„Ù…Ø·Ù„ÙˆØ¨ (#${taskId}) ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ Ø­Ø§Ù„ÙŠØ§Ù‹ ÙÙŠ Ø§Ù„Ù…Ù†Ø¸ÙˆÙ…Ø©.
				</p>
				<div className="buttons is-centered mt-4">
					<a href="#/kanban" className="button is-primary wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-columns"></i></span>
						<span>Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„ÙƒØ§Ù†Ø¨Ø§Ù†</span>
					</a>
					<a href="#/requests" className="button is-light wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-email-alt"></i></span>
						<span>ÙˆØ§Ø±Ø¯ Ø§Ù„Ø·Ù„Ø¨Ø§Øª</span>
					</a>
				</div>
			</div>
		`;
	}

	if ( ! task ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="Ø¬Ø§Ø±ÙŠ ØªØ­Ù…ÙŠÙ„ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù‡Ù…Ø©..." size="large" />
			</div>
		`;
	}

	return html`
		<div className="mt-4">
			<!-- Sticky Action & Title Bar -->
			<${TaskHeaderActions}
				task=${task}
				setIsTaskModalOpen=${setIsTaskModalOpen}
			/>
			
			<div className="columns is-variable is-6">
				<!-- Main Workspace -->
				<div className="column is-8">
					${ task.cover_url && html`
						<figure className="image is-2by1 mb-5 wp-task-cover-frame">
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
					
					<!-- Contributions Timeline & Submission Form -->
					<${TaskContributionsStream}
						taskId=${taskId}
						task=${task}
						contributions=${contributions}
						setContributions=${setContributions}
						fetchTaskData=${fetchTaskData}
						setSelectedContribution=${setSelectedContribution}
						setIsContributionModalOpen=${setIsContributionModalOpen}
						setConfirmConfig=${setConfirmConfig}
						handleStateChange=${handleStateChange}
						expandedCommentThreads=${expandedCommentThreads}
						setExpandedCommentThreads=${setExpandedCommentThreads}
						newContribution=${newContribution}
						setNewContribution=${setNewContribution}
						contributionType=${contributionType}
						setContributionType=${setContributionType}
						visibilityScope=${visibilityScope}
						setVisibilityScope=${setVisibilityScope}
						featuredImage=${featuredImage}
						setFeaturedImage=${setFeaturedImage}
						featuredImageUrl=${featuredImageUrl}
						setFeaturedImageUrl=${setFeaturedImageUrl}
						contributionAttachments=${contributionAttachments}
						setContributionAttachments=${setContributionAttachments}
						isSubmitting=${isSubmitting}
						handleAddContribution=${handleAddContribution}
					/>
				</div>

				<!-- Sidebar Actions -->
				<div className="column is-4">
					<${TaskMetaSidebar}
						task=${task}
						assignees=${assignees}
						availableUsers=${availableUsers}
						selectedAssigneeId=${selectedAssigneeId}
						setSelectedAssigneeId=${setSelectedAssigneeId}
						handleAssign=${handleAssign}
						handleUnassign=${handleUnassign}
					/>
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
					cancelText="Ø¥Ù„ØºØ§Ø¡"
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
