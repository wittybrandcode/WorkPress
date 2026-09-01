import { html, __, isRtl } from '../../utils/html.js';
import RoleDropdown from './RoleDropdown.js';

/**
 * Roles & Capability Matrix + Custom Roles Management Tab
 */
export default function RolesPermissionsTab({
	activeTab,
	rolesData,
	isRolesLoading,
	rolesUpdates,
	selectedMatrixRole,
	setSelectedMatrixRole,
	handleCapToggle,
	saveRoleUpdates,
	dynamicRoleLabels,
	aliasesUpdates,
	setAliasesUpdates,
	saveAliases,
	newRole,
	setNewRole,
	handleCreateCustomRole,
	handleDeleteCustomRole
}) {
	const rtl = isRtl();

	if (activeTab === 'roles_permissions') {
		return html`
			<div className="wp-card p-5">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Capability Matrix', 'workpress' ) }</h3>
						<p className="has-text-grey is-size-7">${ __( 'Configure capabilities assigned to each role. Changes take effect dynamically and immediately.', 'workpress' ) }</p>
					</div>
					<button 
						className=${`button wp-btn ${Object.keys(rolesUpdates).length > 0 ? 'is-primary' : 'is-light'}`}
						disabled=${Object.keys(rolesUpdates).length === 0 || isRolesLoading}
						onClick=${saveRoleUpdates}
					>
						${isRolesLoading ? __( 'Saving...', 'workpress' ) : __( 'Save Changes', 'workpress' )}
					</button>
				</div>
				
				${!rolesData ? html`
					<div className="has-text-centered py-6">
						<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
					</div>
				` : html`
					<div className="mt-4">
						<div className="field mb-4">
							<label className="label is-size-7">${ __( 'Select role to configure capabilities:', 'workpress' ) }</label>
							<div className="control" style=${{ maxWidth: '360px' }}>
								<${RoleDropdown} 
									currentRole=${selectedMatrixRole || (rolesData.roles.length > 0 ? rolesData.roles[0].name : '')} 
									onRoleChange=${(roleName) => setSelectedMatrixRole(roleName)}
									roleLabels=${dynamicRoleLabels}
								/>
							</div>
						</div>
						
						<div className="table-container">
							<table className="table is-fullwidth is-bordered is-hoverable mb-0" style=${{ tableLayout: 'fixed', borderColor: '#e2e8f0' }}>
								<thead style=${{ backgroundColor: '#f8fafc' }}>
									<tr>
										<th style=${{ width: '70%', textAlign: rtl ? 'right' : 'left', verticalAlign: 'middle', borderBottom: '2px solid #cbd5e1' }}>${ __( 'Capability', 'workpress' ) }</th>
										<th style=${{ width: '30%', textAlign: 'center', verticalAlign: 'middle', borderBottom: '2px solid #cbd5e1' }}>
											<div className="has-text-weight-bold has-text-dark">${ __( 'Granted?', 'workpress' ) }</div>
										</th>
									</tr>
								</thead>
								<tbody>
									${(() => {
										const activeRoleName = selectedMatrixRole || (rolesData.roles.length > 0 ? rolesData.roles[0].name : '');
										const activeRoleObj = rolesData.roles.find(r => r.name === activeRoleName);
										if (!activeRoleObj) return null;
										
										return Object.entries(rolesData.groups || {}).map(([groupKey, group]) => html`
											<tr key=${'header_' + groupKey} style=${{ backgroundColor: '#f8fafc' }}>
												<td colSpan="2" style=${{ textAlign: rtl ? 'right' : 'left', fontWeight: 'bold', color: '#334155', borderRight: 'none', borderLeft: 'none', borderBottom: '2px solid #e2e8f0', paddingTop: '1rem' }}>
													${group.label}
												</td>
											</tr>
											${Object.entries(group.caps).map(([capKey, capLabel]) => html`
												<tr key=${capKey}>
													<td style=${{ textAlign: rtl ? 'right' : 'left', verticalAlign: 'middle', borderRight: 'none', borderLeft: 'none' }}>
														<strong className="is-size-6 has-text-dark">${capLabel}</strong>
														<div className="is-size-7 has-text-grey mt-1" style=${{ fontFamily: 'monospace' }}>${capKey}</div>
													</td>
													<td style=${{ textAlign: 'center', verticalAlign: 'middle', borderRight: 'none', borderLeft: 'none' }}>
														<label className="checkbox" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
															<input 
																type="checkbox" 
																checked=${activeRoleObj.capabilities[capKey] || false} 
																onChange=${() => handleCapToggle(activeRoleObj.name, capKey)}
																style=${{ transform: 'scale(1.2)', cursor: 'pointer' }}
															/>
														</label>
													</td>
												</tr>
											`)}
										`);
									})()}
								</tbody>
							</table>
						</div>
					</div>
				`}
			</div>
		`;
	}

	if (activeTab === 'role_management') {
		return html`
			<div>
				<div className="wp-card p-4 mb-4">
					<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
						<div>
							<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Role Display Aliases', 'workpress' ) }</h3>
							<p className="has-text-grey is-size-7">${ __( 'Customize outward display labels for standard WordPress roles to match organizational terminology.', 'workpress' ) }</p>
						</div>
						<button 
							className="button wp-btn is-primary"
							onClick=${saveAliases}
							disabled=${isRolesLoading}
						>
							${isRolesLoading ? __( 'Saving...', 'workpress' ) : __( 'Save Role Aliases', 'workpress' )}
						</button>
					</div>
					
					${!rolesData ? html`
						<div className="has-text-centered py-6">
							<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
						</div>
					` : html`
						<table className="table is-fullwidth is-bordered is-hoverable mb-0" style=${{ borderColor: '#e2e8f0' }}>
							<thead style=${{ backgroundColor: '#f8fafc' }}>
								<tr>
									<th style=${{ width: '25%', textAlign: rtl ? 'right' : 'left', borderBottom: '2px solid #cbd5e1' }}>${ __( 'WordPress Core Role', 'workpress' ) }</th>
									<th style=${{ width: '20%', textAlign: rtl ? 'right' : 'left', borderBottom: '2px solid #cbd5e1' }}>${ __( 'Slug', 'workpress' ) }</th>
									<th style=${{ width: '40%', textAlign: rtl ? 'right' : 'left', borderBottom: '2px solid #cbd5e1' }}>${ __( 'Workspace Display Alias', 'workpress' ) }</th>
									<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #cbd5e1' }}>${ __( 'Type', 'workpress' ) }</th>
								</tr>
							</thead>
							<tbody>
								${rolesData.roles.map(role => html`
									<tr key=${role.name}>
										<td className="is-vcentered has-text-weight-bold" style=${{ textAlign: rtl ? 'right' : 'left' }}>
											<span className="has-text-dark">${role.display_name}</span>
										</td>
										<td className="is-vcentered has-text-grey is-size-7" style=${{ textAlign: rtl ? 'right' : 'left', fontFamily: 'monospace' }}>
											<span className="tag is-family-monospace is-light is-small">${role.name}</span>
										</td>
										<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
											<input 
												type="text" 
												className="input wp-input is-small" 
												value=${aliasesUpdates[role.name] !== undefined ? aliasesUpdates[role.name] : (role.alias !== role.display_name ? role.alias : '')}
												onChange=${(e) => setAliasesUpdates(prev => ({ ...prev, [role.name]: e.target.value }))}
												placeholder=${role.display_name}
											/>
										</td>
										<td className="is-vcentered has-text-centered" style=${{ textAlign: 'center' }}>
											${role.is_custom ? html`
												<div className="is-flex is-align-items-center is-justify-content-center" style=${{ gap: '6px' }}>
													<span className="tag is-info is-light is-small">${ __( 'Custom', 'workpress' ) }</span>
													<button 
														className="button is-small is-danger is-outlined wp-sharp-button" 
														onClick=${() => handleDeleteCustomRole(role.name)}
														title=${ __( 'Delete this role', 'workpress' ) }
													>
														<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
													</button>
												</div>
											` : html`
												<span className="tag is-dark is-light is-small" title=${ __( 'Core standard WordPress role', 'workpress' ) }>
													<i className=${`dashicons dashicons-lock ${ rtl ? 'ml-1' : 'mr-1' } is-size-7`}></i>
													${ __( 'System', 'workpress' ) }
												</span>
											`}
										</td>
									</tr>
								`)}
							</tbody>
						</table>
					`}
				</div>

				<div className="wp-card p-4">
					<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Add New Custom Role', 'workpress' ) }</h3>
					<p className="has-text-grey is-size-7 mb-4">${ __( 'Create custom roles and clone capabilities from existing templates.', 'workpress' ) }</p>
					<form onSubmit=${handleCreateCustomRole}>
						<div className="columns">
							<div className="column is-4">
								<div className="field">
									<label className="label is-size-7">${ __( 'Role Slug (English alphanumeric):', 'workpress' ) }</label>
									<div className="control">
										<input 
											type="text" 
											className="input wp-input" 
											value=${newRole.id}
											onChange=${(e) => setNewRole(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
											placeholder="project_manager"
											required
										/>
									</div>
								</div>
							</div>
							<div className="column is-4">
								<div className="field">
									<label className="label is-size-7">${ __( 'Display Name:', 'workpress' ) }</label>
									<div className="control">
										<input 
											type="text" 
											className="input wp-input" 
											value=${newRole.display_name}
											onChange=${(e) => setNewRole(prev => ({ ...prev, display_name: e.target.value }))}
											placeholder=${ __( 'Technical Project Manager', 'workpress' ) }
											required
										/>
									</div>
								</div>
							</div>
							<div className="column is-4">
								<div className="field">
									<label className="label is-size-7">${ __( 'Clone Capabilities From:', 'workpress' ) }</label>
									<div className="control">
										<div className="select is-fullwidth wp-input">
											<select 
												value=${newRole.clone_from}
												onChange=${(e) => setNewRole(prev => ({ ...prev, clone_from: e.target.value }))}
											>
												${rolesData ? rolesData.roles.map(role => html`
													<option key=${role.name} value=${role.name}>${role.alias || role.display_name} (${role.name})</option>
												`) : null}
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="control mt-2">
							<button type="submit" className="button wp-btn is-dark" disabled=${isRolesLoading}>
								${ __( 'Add Custom Role', 'workpress' ) }
							</button>
						</div>
					</form>
				</div>
			</div>
		`;
	}

	return null;
}
