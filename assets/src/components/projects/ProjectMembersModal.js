import { html, useState, useEffect, Fragment } from '../../utils/html.js';
import { projectsApi, usersApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import ConfirmModal from '../modals/Modal.js';
import Loader from '../ui/Loader.js';
import MemberSelect from '../ui/MemberSelect.js';
import { isStaffUser } from '../../utils/userScope.js';
import { toast } from '../../utils/toast.js';

export default function ProjectMembersModal( { isActive, onClose, project } ) {
	const [ members, setMembers ] = useState( [] );
	const [ availableUsers, setAvailableUsers ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ selectedUserId, setSelectedUserId ] = useState( '' );
	const [ selectedRole, setSelectedRole ] = useState( 'member' );
	const [ confirmConfig, setConfirmConfig ] = useState( null );

	useEffect( () => {
		if ( isActive && project ) {
			fetchMembers();
			fetchAvailableUsers();
		}
	}, [ isActive, project ] );

	const fetchMembers = () => {
		setIsLoading( true );
		projectsApi.members.list( project.id )
			.then( setMembers )
			.catch( console.error )
			.finally( () => setIsLoading( false ) );
	};

	const fetchAvailableUsers = () => {
		usersApi.list( { roles: 'administrator,editor,author,contributor' } )
			.then( ( data ) => {
				const usersList = Array.isArray( data ) ? data : ( data.users || [] );
				const staff = usersList.filter( isStaffUser );
				setAvailableUsers( staff );
			} )
			.catch( console.error );
	};

	const handleAddMember = () => {
		if ( ! selectedUserId ) return;

		setIsLoading( true );
		projectsApi.members.add( project.id, selectedUserId, selectedRole )
			.then( ( updatedMembers ) => {
				setMembers( updatedMembers );
				setSelectedUserId( '' );
				toast( 'ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø¹Ø¶Ùˆ Ø¨Ù†Ø¬Ø§Ø­', 'success' );
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'ÙØ´Ù„ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ø¹Ø¶Ùˆ', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	};

	const handleRoleChange = ( userId, newRole ) => {
		setIsLoading( true );
		projectsApi.members.updateRole( project.id, userId, newRole )
			.then( ( updatedMembers ) => {
				setMembers( updatedMembers );
				toast( 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø¯ÙˆØ± Ø§Ù„Ø¹Ø¶Ùˆ Ø¨Ù†Ø¬Ø§Ø­', 'success' );
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'ÙØ´Ù„ ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø¯ÙˆØ±', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	};

	const handleRemoveMember = ( userId ) => {
		setConfirmConfig( {
			title: 'Ø¥Ø²Ø§Ù„Ø© Ø¹Ø¶Ùˆ',
			message: 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø¥Ø²Ø§Ù„Ø© Ù‡Ø°Ø§ Ø§Ù„Ø¹Ø¶Ùˆ Ù…Ù† Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ØŸ',
			confirmText: 'Ù†Ø¹Ù…ØŒ Ø¥Ø²Ø§Ù„Ø©',
			isDanger: true,
			onConfirm: () => {
				setIsLoading( true );
				projectsApi.members.remove( project.id, userId )
					.then( () => {
						setMembers( members.filter( ( m ) => parseInt( m.id ) !== parseInt( userId ) ) );
						toast( 'ØªÙ…Øª Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø¹Ø¶Ùˆ Ø¨Ù†Ø¬Ø§Ø­', 'success' );
					} )
					.catch( ( err ) => {
						console.error( err );
						toast( 'ÙØ´Ù„ Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø¹Ø¶Ùˆ', 'danger' );
					} )
					.finally( () => {
						setIsLoading( false );
						setConfirmConfig( null );
					} );
			}
		} );
	};

	return html`
		<${Fragment}>
			<${Modal} 
				isActive=${ isActive } 
				onClose=${ onClose } 
				title=${ project ? `Ø¥Ø¯Ø§Ø±Ø© Ø£Ø¹Ø¶Ø§Ø¡ Ù…Ø´Ø±ÙˆØ¹: ${ project.name }` : 'Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡' }
				size="wp-mega-modal"
				footer=${html`
					<button className="button is-text is-small" onClick=${onClose}>Ø¥ØºÙ„Ø§Ù‚</button>
				`}
			>
				<div className="p-4" style=${{ minHeight: '400px' }}>
					
					<!-- Add New Member Form -->
					<div className="box mb-5 has-background-light wp-border" style=${{ boxShadow: 'none', borderRadius: 0, border: '1px solid #e2e8f0', padding: '16px' }}>
						<h4 className="title is-6 mb-3 has-text-weight-bold">Ø¥Ø¶Ø§ÙØ© Ø¹Ø¶Ùˆ Ø¬Ø¯ÙŠØ¯ Ù„Ù„Ù…Ø´Ø±ÙˆØ¹</h4>
						<div className="is-flex is-align-items-flex-end wp-gap-sm" style=${{ gap: '10px' }}>
							<div className="field flex-grow-1 mb-0" style=${{ flex: 2 }}>
								<label className="label is-small">Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ù…Ù†ÙØ°</label>
								<div className="control">
									<${MemberSelect}
										users=${availableUsers.filter( u => !members.find( m => parseInt(m.id) === parseInt(u.id) ) )}
										value=${selectedUserId}
										onChange=${(uid) => setSelectedUserId(uid)}
										placeholder="-- Ø§Ø®ØªØ± Ø¹Ø¶ÙˆØ§Ù‹ Ù…Ù† Ø§Ù„ÙØ±ÙŠÙ‚ Ø§Ù„ÙÙ†ÙŠ --"
										disabled=${isLoading}
										size="small"
									/>
								</div>
							</div>
							
							<div className="field flex-grow-1 mb-0" style=${{ flex: 1 }}>
								<label className="label is-small">Ø§Ù„Ø¯ÙˆØ± ÙÙŠ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</label>
								<div className="control">
									<div className="select is-fullwidth is-small" style=${{ borderRadius: 0 }}>
										<select 
											value=${ selectedRole } 
											onChange=${ e => setSelectedRole( e.target.value ) }
											disabled=${ isLoading }
											style=${{ borderRadius: 0 }}
										>
											<option value="member">Ø¹Ø¶Ùˆ ÙØ±ÙŠÙ‚</option>
											<option value="manager">Ù…Ø¯ÙŠØ± Ù…Ø´Ø±ÙˆØ¹</option>
										</select>
									</div>
								</div>
							</div>
							
							<div className="field mb-0">
								<div className="control">
									<button 
										className=${ `button wp-btn is-primary is-small wp-sharp-button ${ isLoading ? 'is-loading' : '' }` } 
										onClick=${ handleAddMember }
										disabled=${ !selectedUserId || isLoading }
									>
										<span className="icon is-small"><i className="dashicons dashicons-plus"></i></span>
										<span>Ø¥Ø¶Ø§ÙØ© Ø¹Ø¶Ùˆ</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Members List -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
						<h4 className="title is-6 mb-0 has-text-weight-bold">Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ø­Ø§Ù„ÙŠÙŠÙ† (${ members.length })</h4>
					</div>

					${ isLoading && members.length === 0 ? html`
						<div className="py-5">
							<${Loader} center=${true} size="medium" label="Ø¬Ø§Ø±ÙŠ Ø¬Ù„Ø¨ Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ø£Ø¹Ø¶Ø§Ø¡..." />
						</div>
					` : html`
						<table className="table is-fullwidth is-hoverable wp-table" style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<thead>
								<tr style=${{ backgroundColor: '#f8fafc' }}>
									<th>Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…</th>
									<th>Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ</th>
									<th>Ø§Ù„Ø¯ÙˆØ± ÙÙŠ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</th>
									<th style=${{ width: '80px', textAlign: 'center' }}>Ø¥Ø¬Ø±Ø§Ø¡</th>
								</tr>
							</thead>
							<tbody>
								${ members.length === 0 ? html`
									<tr><td colSpan="4" className="has-text-centered has-text-grey p-5">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø¹Ø¶Ø§Ø¡ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ø¹Ø¯.</td></tr>
								` : members.map( m => html`
									<tr key=${ m.id }>
										<td className="is-vcentered has-text-weight-bold">
											<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
												<figure className="image is-28x28 m-0">
													<img src=${ m.avatar_url || '' } alt=${ m.name } style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }} />
												</figure>
												<span>${ m.name }</span>
											</div>
										</td>
										<td className="is-vcentered has-text-grey is-size-7">${ m.email }</td>
										<td className="is-vcentered">
											<div className="select is-small" style=${{ borderRadius: 0 }}>
												<select 
													value=${ m.project_role } 
													onChange=${ e => handleUpdateRole( m.id, e.target.value ) }
													disabled=${ isLoading }
													className="has-text-weight-bold"
													style=${{ 
														borderRadius: 0,
														borderColor: '#e2e8f0',
														color: m.project_role === 'manager' ? '#10b981' : '#0f172a'
													}}
												>
													<option value="manager">Ù…Ø¯ÙŠØ± Ù…Ø´Ø±ÙˆØ¹</option>
													<option value="member">Ø¹Ø¶Ùˆ ÙØ±ÙŠÙ‚</option>
												</select>
											</div>
										</td>
										<td className="is-vcentered" style=${{ textAlign: 'center' }}>
											<button 
												className="button is-small is-danger is-light wp-sharp-button" 
												onClick=${ () => handleRemoveMember( m.id ) }
												disabled=${ isLoading }
												title="Ø¥Ø²Ø§Ù„Ø© Ù…Ù† Ø§Ù„Ù…Ø´Ø±ÙˆØ¹"
											>
												<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
											</button>
										</td>
									</tr>
							` ) }
						</tbody>
					</table>
				`}
			</div>
		</${Modal}>
		
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
		</${Fragment}>
	`;
}
