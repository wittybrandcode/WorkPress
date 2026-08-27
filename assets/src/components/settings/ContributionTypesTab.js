import { html } from '../../utils/html.js';

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
	return html`
		<div className="wp-card p-5">
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
				<div>
					<h3 className="title is-5 mb-1 has-text-weight-bold">إدارة أنواع المساهمات (Contribution Types)</h3>
					<p className="has-text-grey is-size-7">خصص أنواع وتسميات المساهمات لتناسب طبيعة عمل مؤسستك وفق المبدأ 19 (حيادية النواة وتعدد المجالات).</p>
				</div>
				<button 
					className="button wp-btn is-primary"
					disabled=${isTypesLoading}
					onClick=${handleSaveContributionTypes}
				>
					${isTypesLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>الأيقونة (Dashicon)</th>
								<th style=${{ width: '25%', textAlign: 'right', borderBottom: '2px solid #0f172a' }}>المعرّف (Slug)</th>
								<th style=${{ width: '30%', textAlign: 'right', borderBottom: '2px solid #0f172a' }}>التسمية بالعربية</th>
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>النوع</th>
								<th style=${{ width: '15%', textAlign: 'center', borderBottom: '2px solid #0f172a' }}>إجراءات</th>
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
									<td className="is-vcentered has-text-right">
										<span className="tag is-family-monospace is-light is-small">${typeItem.key}</span>
									</td>
									<td className="is-vcentered has-text-right">
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
											<span className="tag is-warning is-light is-small" style=${{ borderRadius: 0 }}>نظام محمي</span>
										` : html`
											<span className="tag is-info is-light is-small" style=${{ borderRadius: 0 }}>مخصص</span>
										`}
									</td>
									<td className="is-vcentered has-text-centered">
										${!typeItem.is_system ? html`
											<button 
												className="button is-small is-danger is-outlined wp-sharp-button"
												onClick=${() => handleDeleteCustomType(typeItem.key)}
												title="حذف هذا النوع"
											>
												<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
											</button>
										` : html`
											<span className="icon is-small has-text-grey-light" title="لا يمكن حذف أنواع النظام"><i className="dashicons dashicons-lock"></i></span>
										`}
									</td>
								</tr>
							`)}
						</tbody>
					</table>
				</div>

				<!-- إنشاء نوع مساهمة جديد -->
				<div className="box p-4" style=${{ backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 0 }}>
					<h4 className="title is-6 mb-3 has-text-weight-bold">إضافة نوع مساهمة جديد مخصص</h4>
					<form onSubmit=${handleAddCustomType}>
						<div className="columns is-variable is-2 is-vcentered">
							<div className="column is-3">
								<label className="label is-size-7">الأيقونة (Dashicon):</label>
								<div className="select is-small is-fullwidth">
									<select 
										value=${newType.icon} 
										onChange=${(e) => setNewType({ ...newType, icon: e.target.value })}
										style=${{ borderRadius: 0 }}
									>
										<option value="dashicons-admin-comments">تعليقات (Comments)</option>
										<option value="dashicons-hammer">تنفيذ فني (Hammer)</option>
										<option value="dashicons-star-filled">نجمة حل (Star)</option>
										<option value="dashicons-search">تدقيق ومراجعة (Search)</option>
										<option value="dashicons-yes-alt">قرار وتوجيه (Check)</option>
										<option value="dashicons-format-aside">مذكرة جانبية (Aside)</option>
										<option value="dashicons-tag">تصنيف (Tag)</option>
										<option value="dashicons-portfolio">حقيبة (Portfolio)</option>
									</select>
								</div>
							</div>
							<div className="column is-4">
								<label className="label is-size-7">المعرّف بالإنجليزية (Slug):</label>
								<input 
									type="text" 
									className="input is-small" 
									placeholder="مثال: legal_brief أو marketing_post" 
									value=${newType.key} 
									onChange=${(e) => setNewType({ ...newType, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') })}
									style=${{ borderRadius: 0, fontFamily: 'monospace' }}
									required
								/>
							</div>
							<div className="column is-3">
								<label className="label is-size-7">التسمية بالعربية (Label):</label>
								<input 
									type="text" 
									className="input is-small" 
									placeholder="مثال: صياغة مذكرة قانونية" 
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
									إضافة النوع
								</button>
							</div>
						</div>
					</form>
				</div>
			`}
		</div>
	`;
}
