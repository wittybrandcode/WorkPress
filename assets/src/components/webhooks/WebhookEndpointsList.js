import { html } from '../../utils/html.js';

export function getPresetBadge(preset) {
	switch (preset) {
		case 'discord':
			return html`<span className="tag" style=${{ background: '#5865F2', color: '#fff', fontWeight: 'bold', borderRadius: 0 }}>Discord</span>`;
		case 'slack':
			return html`<span className="tag" style=${{ background: '#4A154B', color: '#fff', fontWeight: 'bold', borderRadius: 0 }}>Slack</span>`;
		case 'teams':
			return html`<span className="tag" style=${{ background: '#464EB8', color: '#fff', fontWeight: 'bold', borderRadius: 0 }}>MS Teams</span>`;
		default:
			return html`<span className="tag is-dark" style=${{ fontWeight: 'bold', borderRadius: 0 }}>Generic JSON</span>`;
	}
}

/**
 * Webhook Endpoints Data Table & Zero State Component
 */
export default function WebhookEndpointsList({
	webhooks = [],
	isLoading = false,
	loadWebhooks,
	handleToggleActive,
	handleQuickTest,
	handleOpenEdit,
	handleDelete,
	handleOpenCreate,
	testingId = null
}) {
	return html`
		<div className="card wp-webhook-table-card">
			<div className="is-flex is-justify-content-space-between is-align-items-center p-4 has-background-white-ter" style=${{ borderBottom: '1px solid #f1f5f9' }}>
				<div>
					<h3 style=${{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
						قائمة خطافات الويب وقنوات الاستماع الخارجية
					</h3>
					<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>يتم إرسال الأحداث بشكل فوري غير معطل للواجهة مع مهلة زمنية مضبوطة</span>
				</div>
				<button 
					type="button"
					className="button is-small is-light wp-sharp-button" 
					onClick=${loadWebhooks} 
					disabled=${isLoading}
				>
					<span className="icon is-small"><i className="dashicons dashicons-update"></i></span>
					<span>تحديث القائمة</span>
				</button>
			</div>

			${isLoading ? html`
				<div style=${{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
					<div className="loader" style=${{ margin: '0 auto 16px' }}></div>
					<p>جاري جلب إعدادات وسجلات الخطافات...</p>
				</div>
			` : webhooks.length === 0 ? html`
				<!-- ZERO STATE -->
				<div style=${{ padding: '60px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
					<div className="icon is-large has-text-grey mb-3" style=${{ fontSize: '40px', height: '40px' }}>
						<i className="dashicons dashicons-admin-links"></i>
					</div>
					<h4 style=${{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
						لم يتم تسجيل أي خطافات ويب بعد
					</h4>
					<p style=${{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
						يمكنك إضافة رابط استماع خارجي لتصلك إشعارات فورية على هاتفك أو حاسوبك عبر Discord أو Slack بمجرد اعتماد حل أو تقديم طلب مشروع جديد!
					</p>
					<div style=${{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
						<button type="button" className="button wp-sharp-button" onClick=${() => handleOpenCreate('discord')} style=${{ background: '#5865F2', color: '#fff', fontWeight: 'bold' }}>
							<span>إنشاء تكامل Discord</span>
						</button>
						<button type="button" className="button wp-sharp-button" onClick=${() => handleOpenCreate('slack')} style=${{ background: '#4A154B', color: '#fff', fontWeight: 'bold' }}>
							<span>إنشاء تكامل Slack</span>
						</button>
						<button type="button" className="button is-dark wp-sharp-button" onClick=${() => handleOpenCreate('generic')} style=${{ fontWeight: 'bold' }}>
							<span>رابط مخصص (Custom JSON)</span>
						</button>
					</div>
				</div>
			` : html`
				<div style=${{ overflowX: 'auto' }}>
					<table className="table is-fullwidth is-hoverable" style=${{ margin: 0, fontSize: '0.88rem' }}>
						<thead>
							<tr style=${{ background: '#f8fafc', color: '#475569' }}>
								<th style=${{ padding: '14px 20px', width: '70px', textAlign: 'center' }}>الحالة</th>
								<th style=${{ padding: '14px 20px' }}>اسم الخطاف والنوع</th>
								<th style=${{ padding: '14px 20px' }}>رابط النهاية (Endpoint URL)</th>
								<th style=${{ padding: '14px 20px' }}>الأحداث المشترك بها</th>
								<th style=${{ padding: '14px 20px' }}>آخر إرسال</th>
								<th style=${{ padding: '14px 20px', textAlign: 'center', width: '220px' }}>الإجراءات</th>
							</tr>
						</thead>
						<tbody>
							${webhooks.map(item => html`
								<tr key=${item.id} style=${{ opacity: item.active ? 1 : 0.6, transition: 'opacity 0.2s' }}>
									<!-- STATUS TOGGLE -->
									<td style=${{ verticalAlign: 'middle', textAlign: 'center' }}>
										<button 
											type="button"
											className="wp-webhook-switch-btn"
											onClick=${() => handleToggleActive(item)}
											title=${item.active ? 'انقر للتعطيل' : 'انقر للتفعيل'}
											style=${{ background: item.active ? '#10b981' : '#cbd5e1' }}
										>
											<span 
												className="wp-webhook-switch-indicator"
												style=${{ left: item.active ? '15px' : '3px' }}
											></span>
										</button>
									</td>

									<!-- NAME & PRESET -->
									<td style=${{ verticalAlign: 'middle' }}>
										<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
											${getPresetBadge(item.preset)}
											<span style=${{ fontWeight: 'bold', color: '#0f172a' }}>${item.name}</span>
										</div>
									</td>

									<!-- URL -->
									<td style=${{ verticalAlign: 'middle' }}>
										<div style=${{ 
											fontFamily: 'monospace', 
											fontSize: '0.8rem', 
											background: '#f1f5f9', 
											padding: '4px 8px', 
											borderRadius: 0, 
											maxWidth: '280px', 
											overflow: 'hidden', 
											textOverflow: 'ellipsis', 
											whiteSpace: 'nowrap',
											direction: 'ltr',
											textAlign: 'left'
										}}>
											${item.url}
										</div>
									</td>

									<!-- EVENTS -->
									<td style=${{ verticalAlign: 'middle' }}>
										<div style=${{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
											${(item.events || []).map(ev => html`
												<span key=${ev} className="tag is-light" style=${{ fontSize: '0.75rem', borderRadius: 0 }}>
													${ev.replace('workpress.', '')}
												</span>
											`)}
										</div>
									</td>

									<!-- LAST STATUS / LATENCY -->
									<td style=${{ verticalAlign: 'middle' }}>
										${item.last_status ? html`
											<div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
												<span className=${`tag is-small ${item.last_status >= 200 && item.last_status < 300 ? 'is-success' : 'is-danger'}`} style=${{ fontWeight: 'bold', borderRadius: 0 }}>
													HTTP ${item.last_status}
												</span>
												${item.last_latency_ms ? html`
													<span style=${{ fontSize: '0.75rem', color: '#64748b' }}>${item.last_latency_ms}ms</span>
												` : null}
											</div>
										` : html`
											<span style=${{ fontSize: '0.8rem', color: '#94a3b8' }}>— لم يُرسل بعد —</span>
										`}
									</td>

									<!-- ACTIONS -->
									<td style=${{ verticalAlign: 'middle', textAlign: 'center' }}>
										<div style=${{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
											<button 
												type="button"
												className=${`button is-small is-light wp-sharp-button ${testingId === item.id ? 'is-loading' : ''}`}
												onClick=${() => handleQuickTest(item)}
												title="إرسال فحص تجريبي لحظي"
												style=${{ fontWeight: 'bold', color: '#3b82f6' }}
											>
												<span>اختبار</span>
											</button>
											<button 
												type="button"
												className="button is-small is-light wp-sharp-button"
												onClick=${() => handleOpenEdit(item)}
												title="تعديل الخطاف"
											>
												<span className="icon is-small"><i className="dashicons dashicons-edit"></i></span>
											</button>
											<button 
												type="button"
												className="button is-small is-light is-danger wp-sharp-button"
												onClick=${() => handleDelete(item.id, item.name)}
												title="حذف الخطاف"
											>
												<span className="icon is-small"><i className="dashicons dashicons-trash"></i></span>
											</button>
										</div>
									</td>
								</tr>
							`)}
						</tbody>
					</table>
				</div>
			`}
		</div>
	`;
}
