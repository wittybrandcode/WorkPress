import { html, useState, useEffect, __, sprintf, isRtl } from '../../utils/html.js';
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
	const rtl = isRtl();

	useEffect( () => {
		if ( isActive && task ) {
			fetchMembers();
			setCurrentAssignees( task.assignees ? task.assignees.map(a => a.id) : [] );
		}
	}, [ isActive, task ] );

	const fetchMembers = () => {
		setIsLoading( true );
		// Ensure task has a project
		const projectId = task.project_id;
		if ( !projectId ) {
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
				toast( __( 'Task assignments updated successfully', 'workpress' ), 'success' );
				onClose();
			} )
			.catch( err => {
				console.error( err );
				toast( __( 'An error occurred while updating assignments.', 'workpress' ), 'danger' );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<span className="has-text-grey is-size-7">${ sprintf( __( '%d assignees selected', 'workpress' ), currentAssignees.length ) }</span>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					${ __( 'Cancel', 'workpress' ) }
				</button>
				<button 
					className=${ `button wp-btn is-primary wp-sharp-button ${ isSaving ? 'is-loading' : '' }` } 
					onClick=${ handleSave }
					disabled=${ isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ __( 'Save Assignment', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ task ? sprintf( __( 'Assign Task: %s', 'workpress' ), task.title ) : __( 'Assign Task', 'workpress' ) }
			size="wp-mega-modal"
			footer=${ footer }
		>
			<div className="p-2" style=${{ minHeight: '300px' }}>
				<p className="has-text-grey is-size-7 mb-4">${ __( 'Select members to assign to this task (only approved project members are shown):', 'workpress' ) }</p>
				
				${ isLoading ? html`
					<div className="py-5">
						<${Loader} center=${true} size="medium" label=${ __( 'Loading members list...', 'workpress' ) } />
					</div>
				` : projectMembers.length === 0 ? html`
					<div className="has-text-centered py-5 has-text-grey">
						${ __( 'No members added to this project yet.', 'workpress' ) }
					</div>
				` : html`
					<div className="columns is-multiline">
						${ projectMembers.map( member => {
							const isAssigned = currentAssignees.includes( member.id );
							const initial = (member.name || '?').charAt(0).toUpperCase();
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
											<div style=${{ [rtl ? 'marginLeft' : 'marginRight']: '12px', flexShrink: 0 }}>
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
														${ member.project_role === 'manager' ? __( 'Project Manager', 'workpress' ) : __( 'Team Member', 'workpress' ) }
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
