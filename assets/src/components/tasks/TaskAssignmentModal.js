import { html, useState, useEffect } from '../../utils/html.js';
import { projectsApi, tasksApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import Loader from '../ui/Loader.js';
import { isStaffUser } from '../../utils/userScope.js';
import { toast } from '../../utils/toast.js';

export default function TaskAssignmentModal( { isActive, onClose, task } ) {
	const [ projectMembers, setProjectMembers ] = useState( [] );
	const [ currentAssignees, setCurrentAssignees ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );

	useEffect( () => {
		if ( isActive && task ) {
			fetchMembers();
			setCurrentAssignees( task.assignees ? task.assignees.map(a => a.id) : [] );
		}
	}, [ isActive, task ] );

	const fetchMembers = () => {
		setIsLoading( true );
		// Ensure task has a project
		const projectId = task.project_id; // Assume task has project_id
		if ( !projectId ) {
			// fallback if we need to fetch project id from task
			tasksApi.get( task.id ).then( fullTask => {
				const pid = fullTask.project_id || (fullTask.projects && fullTask.projects[0] ? fullTask.projects[0].id : null);
				if ( pid ) {
					projectsApi.members.list( pid ).then( list => {
						const assignable = ( Array.isArray( list ) ? list : [] ).filter( m => 
							m.role !== 'viewer' && 
							m.project_role !== 'viewer' && 
							isStaffUser( m )
						);
						setProjectMembers( assignable );
					} ).catch( console.error );
				}
			} ).finally( () => setIsLoading( false ) );
			return;
		}

		projectsApi.members.list( projectId )
			.then( list => {
				const assignable = ( Array.isArray( list ) ? list : [] ).filter( m => 
					m.role !== 'viewer' && 
					m.project_role !== 'viewer' && 
					isStaffUser( m )
				);
				setProjectMembers( assignable );
			} )
			.catch( console.error )
			.finally( () => setIsLoading( false ) );
	};

	const toggleAssignee = ( userId ) => {
		if ( currentAssignees.includes( userId ) ) {
			setCurrentAssignees( currentAssignees.filter( id => id !== userId ) );
		} else {
			setCurrentAssignees( [ ...currentAssignees, userId ] );
		}
	};

	const handleSave = () => {
		setIsSaving( true );
		tasksApi.assignment.update( task.id, currentAssignees )
			.then( () => {
				toast( 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„ØªÙƒÙ„ÙŠÙØ§Øª Ø¨Ù†Ø¬Ø§Ø­', 'success' );
				onClose(); // Parent should refresh tasks
			} )
			.catch( err => {
				console.error( err );
				toast( 'Ø­Ø¯Ø« Ø®Ø·Ø£. ØªØ£ÙƒØ¯ Ù…Ù† Ø£Ù†Ùƒ ØªÙ…Ù„Ùƒ ØµÙ„Ø§Ø­ÙŠØ© ØªØ¹Ø¯ÙŠÙ„ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø©.', 'danger' );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<span className="has-text-grey is-size-7">ØªÙ… ØªØ­Ø¯ÙŠØ¯ ${ currentAssignees.length } Ù…ÙƒÙ„Ù</span>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					Ø¥Ù„ØºØ§Ø¡
				</button>
				<button 
					className=${ `button wp-btn is-primary wp-sharp-button ${ isSaving ? 'is-loading' : '' }` } 
					onClick=${ handleSave }
					disabled=${ isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>Ø­ÙØ¸ Ø§Ù„Ø¥Ø³Ù†Ø§Ø¯</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ task ? `Ø¥Ø³Ù†Ø§Ø¯ Ø§Ù„Ù…Ù‡Ù…Ø©: ${ task.title }` : 'Ø¥Ø³Ù†Ø§Ø¯ Ø§Ù„Ù…Ù‡Ù…Ø©' }
			size="wp-mega-modal"
			footer=${ footer }
		>
			<div className="p-2" style=${{ minHeight: '300px' }}>
				<p className="has-text-grey is-size-7 mb-4">Ø§Ø®ØªØ± Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡ Ù„Ø¥Ø³Ù†Ø§Ø¯ Ù‡Ø°Ù‡ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¥Ù„ÙŠÙ‡Ù… (ÙŠØ¸Ù‡Ø± Ù‡Ù†Ø§ ÙÙ‚Ø· Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ÙŠÙ†):</p>
				
				${ isLoading ? html`
					<div className="py-5">
						<${Loader} center=${true} size="medium" label="Ø¬Ø§Ø±ÙŠ Ø¬Ù„Ø¨ Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹..." />
					</div>
				` : projectMembers.length === 0 ? html`
					<div className="has-text-centered py-5 has-text-grey">
						Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø¹Ø¶Ø§Ø¡ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹.
					</div>
				` : html`
					<div className="columns is-multiline">
						${ projectMembers.map( member => {
							const isAssigned = currentAssignees.includes( member.id );
							const initial = (member.name || 'ØŸ').charAt(0).toUpperCase();
							const avatarUrl = member.avatar_url || (member.avatar_urls && member.avatar_urls['48']) || member.avatar || '';

							return html`
								<div key=${ member.id } className="column is-6">
									<div 
										className="box wp-card is-flex is-align-items-center is-justify-content-space-between p-3"
										style=${{ 
											cursor: 'pointer', 
											borderRadius: '8px',
											border: isAssigned ? '2px solid #6366f1' : '1px solid #e2e8f0',
											backgroundColor: isAssigned ? 'rgba(99, 102, 241, 0.06)' : '#fff',
											boxShadow: isAssigned ? '0 4px 12px rgba(99, 102, 241, 0.1)' : '0 1px 3px rgba(0,0,0,0.02)',
											transition: 'all 0.15s ease'
										}}
										onClick=${ () => toggleAssignee( member.id ) }
									>
										<div className="is-flex is-align-items-center">
											<div style=${{ marginLeft: '12px', flexShrink: 0 }}>
												${avatarUrl ? html`
													<img 
														src=${ avatarUrl } 
														alt=${ member.name } 
														style=${{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #cbd5e1', objectFit: 'cover' }} 
													/>
												` : html`
													<div style=${{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
														${initial}
													</div>
												`}
											</div>
											<div>
												<div className="has-text-weight-bold has-text-dark is-size-6">${ member.name }</div>
												<div className="is-flex is-align-items-center" style=${{ gap: '6px', marginTop: '2px' }}>
													<span className="tag is-small" style=${{ fontSize: '0.68rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px' }}>
														${ member.project_role === 'manager' ? 'Ù…Ø¯ÙŠØ± Ù…Ø´Ø±ÙˆØ¹' : 'Ø¹Ø¶Ùˆ ÙØ±ÙŠÙ‚' }
													</span>
													${member.email && html`
														<span className="has-text-grey is-size-7">${member.email}</span>
													`}
												</div>
											</div>
										</div>
										<label className="checkbox" style=${{ pointerEvents: 'none' }}>
											<input type="checkbox" checked=${ isAssigned } style=${{ transform: 'scale(1.25)', accentColor: '#6366f1' }} readOnly />
										</label>
									</div>
								</div>
							`;
						} ) }
					</div>
				`}
			</div>
		</${Modal}>
	`;
}
