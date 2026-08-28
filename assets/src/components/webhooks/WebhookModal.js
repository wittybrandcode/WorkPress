import { html } from '../../utils/html.js';

/**
 * Webhook Add/Edit Modal Dialog Component
 */
export default function WebhookModal({
	isOpen = false,
	onClose,
	editingItem,
	setEditingItem,
	supportedEvents = {},
	handleToggleEvent,
	handleGenerateSecret,
	handleModalTest,
	modalTestLoading = false,
	modalTestResult = null,
	handleSave,
	isSaving = false
}) {
	if (!isOpen || !editingItem) return null;

	return html`
		<div className="modal is-active" style=${{ zIndex: 1000 }}>
			<div className="modal-background" onClick=${onClose} style=${{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}></div>
			<div className="modal-card wp-webhook-modal-card">
				
				<!-- MODAL HEADER -->
				<header className="modal-card-head" style=${{ background: '#0f172a', borderBottom: 'none', padding: '18px 24px', borderRadius: 0 }}>
					<p className="modal-card-title" style=${{ color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>
						${editingItem.id ? 'تعديل إعدادات خطاف الويب' : 'إنشاء خطاف ويب جديد'}
					</p>
					<button className="delete" aria-label="close" onClick=${onClose}></button>
				</header>

				<!-- MODAL BODY -->
				<section className="modal-card-body" style=${{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
					
					<!-- PRESET SELECTOR -->
					<div className="field" style=${{ marginBottom: '20px' }}>
						<label className="label is-size-7 has-text-weight-bold">نوع قالب الإرسال والمنصة المستهدفة (Preset):</label>
						<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
							<button 
								type="button" 
								className=${`button wp-sharp-button ${editingItem.preset === 'generic' ? 'is-dark' : 'is-light'}`}
								onClick=${() => setEditingItem({ ...editingItem, preset: 'generic' })}
								style=${{ fontWeight: 'bold' }}
							>
								<span>Generic REST JSON</span>
							</button>

							<button 
								type="button" 
								className=${`button wp-sharp-button ${editingItem.preset === 'discord' ? 'is-info' : 'is-light'}`}
								onClick=${() => setEditingItem({ ...editingItem, preset: 'discord' })}
								style=${{ fontWeight: 'bold', background: editingItem.preset === 'discord' ? '#5865F2' : '', color: editingItem.preset === 'discord' ? '#fff' : '' }}
							>
								<span>Discord Rich Embed</span>
							</button>

							<button 
								type="button" 
								className=${`button wp-sharp-button ${editingItem.preset === 'slack' ? 'is-primary' : 'is-light'}`}
								onClick=${() => setEditingItem({ ...editingItem, preset: 'slack' })}
								style=${{ fontWeight: 'bold', background: editingItem.preset === 'slack' ? '#4A154B' : '', color: editingItem.preset === 'slack' ? '#fff' : '' }}
							>
								<span>Slack BlockKit</span>
							</button>

							<button 
								type="button" 
								className=${`button wp-sharp-button ${editingItem.preset === 'teams' ? 'is-link' : 'is-light'}`}
								onClick=${() => setEditingItem({ ...editingItem, preset: 'teams' })}
								style=${{ fontWeight: 'bold', background: editingItem.preset === 'teams' ? '#464EB8' : '', color: editingItem.preset === 'teams' ? '#fff' : '' }}
							>
								<span>Microsoft Teams</span>
							</button>
						</div>
					</div>

					<!-- NAME -->
					<div className="field" style=${{ marginBottom: '16px' }}>
						<label className="label is-size-7 has-text-weight-bold">اسم الخطاف / القناة:</label>
						<div className="control">
							<input 
								className="input wp-sharp-input" 
								type="text" 
								value=${editingItem.name} 
								onInput=${(e) => setEditingItem({ ...editingItem, name: e.target.value })}
								placeholder="مثال: تنبيهات ديسكورد للإدارة العامة"
							/>
						</div>
					</div>

					<!-- URL -->
					<div className="field" style=${{ marginBottom: '16px' }}>
						<label className="label is-size-7 has-text-weight-bold">رابط الاستماع الخارجي (Webhook Endpoint URL):</label>
						<div className="control">
							<input 
								className="input wp-sharp-input" 
								type="url" 
								value=${editingItem.url} 
								onInput=${(e) => setEditingItem({ ...editingItem, url: e.target.value })}
								placeholder="https://discord.com/api/webhooks/... أو https://hooks.slack.com/..."
								style=${{ direction: 'ltr', fontFamily: 'monospace', fontSize: '0.85rem' }}
							/>
						</div>
					</div>

					<!-- SECRET -->
					<div className="field" style=${{ marginBottom: '20px' }}>
						<label className="label is-size-7 has-text-weight-bold">المفتاح السري للتوقيع المشفر (Secret Key for HMAC):</label>
						<div className="field has-addons" style=${{ direction: 'ltr' }}>
							<div className="control is-expanded">
								<input 
									className="input wp-sharp-input" 
									type="text" 
									value=${editingItem.secret} 
									onInput=${(e) => setEditingItem({ ...editingItem, secret: e.target.value })}
									placeholder="whsec_..."
									style=${{ fontFamily: 'monospace', fontSize: '0.85rem' }}
								/>
							</div>
							<div className="control">
								<button 
									type="button" 
									className="button is-light wp-sharp-button" 
									onClick=${handleGenerateSecret}
									style=${{ fontWeight: 'bold' }}
									title="توليد مفتاح عشوائي"
								>
									<span className="icon is-small"><i className="dashicons dashicons-randomize"></i></span>
									<span>توليد</span>
								</button>
							</div>
						</div>
						<p className="help" style=${{ color: '#64748b' }}>يتم استخدام هذا المفتاح لتوقيع الحزم عبر رأس X-WorkPress-Signature لمنع التلاعب.</p>
					</div>

					<!-- EVENTS CHECKLIST -->
					<div className="field" style=${{ marginBottom: '20px' }}>
						<label className="label is-size-7 has-text-weight-bold">الأحداث المراد الاشتراك بها وإرسالها:</label>
						<div style=${{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: 0, border: '1px solid #e2e8f0' }}>
							${Object.entries(supportedEvents).map(([key, ev]) => html`
								<label key=${key} style=${{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
									<input 
										type="checkbox" 
										checked=${(editingItem.events || []).includes(key)} 
										onChange=${() => handleToggleEvent(key)}
										style=${{ marginTop: '3px', cursor: 'pointer' }}
									/>
									<div>
										<div style=${{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>
											${ev.label}
										</div>
										<div style=${{ fontSize: '0.75rem', color: '#64748b' }}>
											${ev.description}
										</div>
									</div>
								</label>
							`)}
						</div>
					</div>

					<!-- LIVE TEST PING SECTION -->
					<div style=${{ background: '#eff6ff', padding: '14px 18px', borderRadius: 0, border: '1px solid #bfdbfe', marginBottom: '16px' }}>
						<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
							<div>
								<strong style=${{ fontSize: '0.85rem', color: '#1e40af' }}>اختبار الاتصال اللحظي (Test Ping)</strong>
								<div style=${{ fontSize: '0.75rem', color: '#3b82f6' }}>أرسل حزمة تجريبية الآن وتأكد من عمل الرابط قبل الحفظ</div>
							</div>
							<button 
								type="button" 
								className=${`button is-small is-info wp-sharp-button ${modalTestLoading ? 'is-loading' : ''}`}
								onClick=${handleModalTest}
								style=${{ fontWeight: 'bold' }}
							>
								<span>إرسال فحص تجريبي</span>
							</button>
						</div>

						${modalTestResult ? html`
							<div style=${{ 
								marginTop: '10px', 
								padding: '10px 14px', 
								borderRadius: 0, 
								fontSize: '0.8rem',
								background: modalTestResult.success ? '#ecfdf5' : '#fef2f2',
								color: modalTestResult.success ? '#065f46' : '#991b1b',
								border: `1px solid ${modalTestResult.success ? '#a7f3d0' : '#fecaca'}`
							}}>
								${modalTestResult.success ? html`
									<div>
										<strong>تم الاتصال بنجاح!</strong> كود الاستجابة: HTTP ${modalTestResult.status_code} — سرعة الوصول: ${modalTestResult.latency_ms}ms
									</div>
								` : html`
									<div>
										<strong>تعذر الاتصال:</strong> ${modalTestResult.error_message || 'رمز الخطأ: ' + modalTestResult.status_code}
									</div>
								`}
							</div>
						` : null}
					</div>

				</section>

				<!-- MODAL FOOTER -->
				<footer className="modal-card-foot" style=${{ justifyContent: 'flex-end', gap: '10px', background: '#f8fafc', padding: '14px 24px', borderRadius: 0 }}>
					<button type="button" className="button wp-sharp-button" onClick=${onClose}>
						إلغاء
					</button>
					<button 
						type="button"
						className=${`button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}`}
						onClick=${handleSave}
						style=${{ fontWeight: 'bold', background: '#0f172a', borderColor: '#0f172a' }}
					>
						<span className="icon"><i className="dashicons dashicons-saved"></i></span>
						<span>حفظ إعدادات الخطاف</span>
					</button>
				</footer>

			</div>
		</div>
	`;
}
