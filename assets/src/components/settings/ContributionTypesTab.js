import { html, __, isRtl } from '../../utils/html.js';

/**
 * Contribution Types Management Tab
 */
export default function ContributionTypesTab({
	contributionTypes = [],
	setContributionTypes,
	isTypesLoading = false,
	newType = { key: '', label: '', icon: 'dashicons-admin-comments' },
	setNewType,
	handleSaveContributionTypes,
	handleAddCustomType,
	handleDeleteCustomType
}) {
	const rtl = isRtl();

	return html`
		<div className="wp-card p-5">
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
				<div>
					<h3 className="title is-5 mb-1 has-text-weight-bold">${ __( 'Contribution Types Management', 'workpress' ) }</h3>
					<p className="has-text-grey is-size-7">${ __( 'Customize contribution types to suit your organization workflow (Core Neutrality & Multi-domain).', 'workpress' ) }</p>
				</div>
				<button 
					className="button wp-btn is-primary"
					disabled=${isTypesLoading}
					onClick=${handleSaveContributionTypes}
				>
					${isTypesLoading ? __( 'Saving...', 'workpress' ) : __( 'Save Changes', 'workpress' )}
				</button>
			</div>

			${isTypesLoading && contributionTypes.length === 0 ? html`
				<div className="has-text-centered py-6">
					<span className="button is-loading is-white is-large" style=${{ border: 'none' }}></span>
				</div>
			` : html`
				<div className="table-container mb-5">
					<table className="table is-fullwidth is-hoverable wp-table">
						<thead>
							<tr>
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>${ __( 'Icon (Dashicon)', 'workpress' ) }</th>
								<th style=${{ width: '25%', textAlign: rtl ? 'right' : 'left', borderBottom: '2px solid #0f172a' }}>${ __( 'Slug', 'workpress' ) }</th>
								<th style=${{ width: '30%', textAlign: rtl ? 'right' : 'left', borderBottom: '2px solid #0f172a' }}>${ __( 'Label', 'workpress' ) }</th>
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>${ __( 'Type', 'workpress' ) }</th>
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>${ __( 'Actions', 'workpress' ) }</th>
							</tr>
						</thead>
						<tbody>
							${contributionTypes.map((typeItem, index) => html`
								<tr key=${typeItem.key}>
									<td className="is-vcentered has-text-centered">
										<span className="icon is-medium has-text-primary" title=${typeItem.icon || 'dashicons-admin-comments'}>
											<i className=${'dashicons ' + (typeItem.icon || 'dashicons-admin-comments')} style=${{ fontSize: '22px' }}></i>
										</span>
									</td>
									<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
										<span className="tag is-family-monospace is-light is-small">${typeItem.key}</span>
									</td>
									<td className="is-vcentered" style=${{ textAlign: rtl ? 'right' : 'left' }}>
										<input 
											type="text" 
											className="input is-small" 
											value=${typeItem.label} 
											style=${{ borderRadius: 0 }}
											onChange=${(e) => {
												const updated = [...contributionTypes];
												updated[index].label = e.target.value;
												setContributionTypes(updated);
											}}
										/>
									</td>
									<td className="is-vcentered has-text-centered">
										${typeItem.is_system ? html`
											<span className="tag is-warning is-light is-small" style=${{ borderRadius: 0 }}>${ __( 'System Protected', 'workpress' ) }</span>
										` : html`
											<span className="tag is-info is-light is-small" style=${{ borderRadius: 0 }}>${ __( 'Custom', 'workpress' ) }</span>
										`}
									</td>
									<td className="is-vcentered has-text-centered">
										${!typeItem.is_system ? html`
											<button 
												className="button is-small is-danger is-outlined wp-sharp-button"
												onClick=${() => handleDeleteCustomType(typeItem.key)}
												title=${ __( 'Delete this type', 'workpress' ) }
											>
												<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
											</button>
										` : html`
											<span className="icon is-small has-text-grey-light" title=${ __( 'System types cannot be deleted', 'workpress' ) }><i className="dashicons dashicons-lock"></i></span>
										`}
									</td>
								</tr>
							`)}
						</tbody>
					</table>
				</div>

				<!-- New Custom Contribution Type Form -->
				<div className="box p-4" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
					<h4 className="title is-6 mb-3 has-text-weight-bold">${ __( 'Add New Custom Contribution Type', 'workpress' ) }</h4>
					<form onSubmit=${handleAddCustomType}>
						<div className="columns is-variable is-2 is-vcentered">
							<div className="column is-3">
								<label className="label is-size-7">${ __( 'Icon (Dashicon):', 'workpress' ) }</label>
								<div className="select is-small is-fullwidth">
									<select 
										value=${newType.icon} 
										onChange=${(e) => setNewType({ ...newType, icon: e.target.value })}
										style=${{ borderRadius: 0 }}
									>
										<option value="dashicons-admin-comments">${ __( 'Comments (Comments)', 'workpress' ) }</option>
										<option value="dashicons-hammer">${ __( 'Technical Implementation (Hammer)', 'workpress' ) }</option>
										<option value="dashicons-star-filled">${ __( 'Solution Star (Star)', 'workpress' ) }</option>
										<option value="dashicons-search">${ __( 'Review & Audit (Search)', 'workpress' ) }</option>
										<option value="dashicons-yes-alt">${ __( 'Decision & Guidance (Check)', 'workpress' ) }</option>
										<option value="dashicons-format-aside">${ __( 'Side Note (Aside)', 'workpress' ) }</option>
										<option value="dashicons-tag">${ __( 'Tag (Tag)', 'workpress' ) }</option>
										<option value="dashicons-portfolio">${ __( 'Portfolio (Portfolio)', 'workpress' ) }</option>
									</select>
								</div>
							</div>
							<div className="column is-4">
								<label className="label is-size-7">${ __( 'Slug (English Identifier):', 'workpress' ) }</label>
								<input 
									type="text" 
									className="input is-small" 
									placeholder="legal_brief / marketing_post" 
									value=${newType.key} 
									onChange=${(e) => setNewType({ ...newType, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
									style=${{ borderRadius: 0, fontFamily: 'monospace' }}
									required
								/>
							</div>
							<div className="column is-3">
								<label className="label is-size-7">${ __( 'Display Label:', 'workpress' ) }</label>
								<input 
									type="text" 
									className="input is-small" 
									placeholder=${ __( 'e.g., Legal Brief Draft', 'workpress' ) } 
									value=${newType.label} 
									onChange=${(e) => setNewType({ ...newType, label: e.target.value })}
									style=${{ borderRadius: 0 }}
									required
								/>
							</div>
							<div className="column is-2 is-flex is-align-items-flex-end">
								<button 
									type="submit" 
									className="button is-small wp-btn is-dark is-fullwidth mt-4"
									disabled=${isTypesLoading}
								>
									${ __( 'Add Type', 'workpress' ) }
								</button>
							</div>
						</div>
					</form>
				</div>
			`}
		</div>
	`;
}
