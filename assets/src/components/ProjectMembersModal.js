import { html, useState, useEffect, Fragment } from '../utils/html.js';
import { projectsApi, usersApi } from '../api/client.js';
import Modal from './Modal.js';
import ConfirmModal from './ConfirmModal.js';
import Loader from './Loader.js';
import MemberSelect from './MemberSelect.js';
import { isStaffUser } from '../utils/userScope.js';
import { toast } from '../utils/toast.js';

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
				toast( 'تمت إضافة العضو بنجاح', 'success' );
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'فشل إضافة العضو', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	};

	const handleRoleChange = ( userId, newRole ) => {
		setIsLoading( true );
		projectsApi.members.updateRole( project.id, userId, newRole )
			.then( ( updatedMembers ) => {
				setMembers( updatedMembers );
				toast( 'تم تحديث دور العضو بنجاح', 'success' );
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'فشل تحديث الدور', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	};

	const handleRemoveMember = ( userId ) => {
		setConfirmConfig( {
			title: 'إزالة عضو',
			message: 'هل أنت متأكد من إزالة هذا العضو من المشروع؟',
			confirmText: 'نعم، إزالة',
			isDanger: true,
			onConfirm: () => {
				setIsLoading( true );
				projectsApi.members.remove( project.id, userId )
					.then( () => {
						setMembers( members.filter( ( m ) => parseInt( m.id ) !== parseInt( userId ) ) );
						toast( 'تمت إزالة العضو بنجاح', 'success' );
					} )
					.catch( ( err ) => {
						console.error( err );
						toast( 'فشل إزالة العضو', 'danger' );
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
				title=${ project ? `إدارة أعضاء مشروع: ${ project.name }` : 'إدارة الأعضاء' }
				size="wp-mega-modal"
				footer=${html`
					<button className="button is-text is-small" onClick=${onClose}>إغلاق</button>
				`}
			>
				<div className="p-4" style=${{ minHeight: '400px' }}>
					
					<!-- Add New Member Form -->
					<div className="box mb-5 has-background-light wp-border" style=${{ boxShadow: 'none', borderRadius: 0, border: '1px solid #e2e8f0', padding: '16px' }}>
						<h4 className="title is-6 mb-3 has-text-weight-bold">إضافة عضو جديد للمشروع</h4>
						<div className="is-flex is-align-items-flex-end wp-gap-sm" style=${{ gap: '10px' }}>
							<div className="field flex-grow-1 mb-0" style=${{ flex: 2 }}>
								<label className="label is-small">المستخدم المنفذ</label>
								<div className="control">
									<${MemberSelect}
										users=${availableUsers.filter( u => !members.find( m => parseInt(m.id) === parseInt(u.id) ) )}
										value=${selectedUserId}
										onChange=${(uid) => setSelectedUserId(uid)}
										placeholder="-- اختر عضواً من الفريق الفني --"
										disabled=${isLoading}
										size="small"
									/>
								</div>
							</div>
							
							<div className="field flex-grow-1 mb-0" style=${{ flex: 1 }}>
								<label className="label is-small">الدور في المشروع</label>
								<div className="control">
									<div className="select is-fullwidth is-small" style=${{ borderRadius: 0 }}>
										<select 
											value=${ selectedRole } 
											onChange=${ e => setSelectedRole( e.target.value ) }
											disabled=${ isLoading }
											style=${{ borderRadius: 0 }}
										>
											<option value="member">عضو فريق</option>
											<option value="manager">مدير مشروع</option>
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
										<span>إضافة عضو</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Members List -->
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
						<h4 className="title is-6 mb-0 has-text-weight-bold">أعضاء المشروع الحاليين (${ members.length })</h4>
					</div>

					${ isLoading && members.length === 0 ? html`
						<div className="py-5">
							<${Loader} center=${true} size="medium" label="جاري جلب قائمة الأعضاء..." />
						</div>
					` : html`
						<table className="table is-fullwidth is-hoverable wp-table" style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<thead>
								<tr style=${{ backgroundColor: '#f8fafc' }}>
									<th>المستخدم</th>
									<th>البريد الإلكتروني</th>
									<th>الدور في المشروع</th>
									<th style=${{ width: '80px', textAlign: 'center' }}>إجراء</th>
								</tr>
							</thead>
							<tbody>
								${ members.length === 0 ? html`
									<tr><td colSpan="4" className="has-text-centered has-text-grey p-5">لا يوجد أعضاء في هذا المشروع بعد.</td></tr>
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
													<option value="manager">مدير مشروع</option>
													<option value="member">عضو فريق</option>
												</select>
											</div>
										</td>
										<td className="is-vcentered" style=${{ textAlign: 'center' }}>
											<button 
												className="button is-small is-danger is-light wp-sharp-button" 
												onClick=${ () => handleRemoveMember( m.id ) }
												disabled=${ isLoading }
												title="إزالة من المشروع"
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
				cancelText="إلغاء"
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
