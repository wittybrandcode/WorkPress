import { html, useState, useEffect } from '../utils/html.js';
import { webhooksApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function WebhooksSettingsTab() {
	const [webhooks, setWebhooks] = useState([]);
	const [supportedEvents, setSupportedEvents] = useState({});
	const [mockReceiverUrl, setMockReceiverUrl] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	
	// Modal / Editing state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	// Test Ping state
	const [testingId, setTestingId] = useState(null);
	const [modalTestLoading, setModalTestLoading] = useState(false);
	const [modalTestResult, setModalTestResult] = useState(null);

	const defaultItem = {
		id: '',
		name: '',
		url: '',
		preset: 'generic',
		events: ['workpress.solution_accepted', 'workpress.request_submitted', 'workpress.project_completed'],
		secret: '',
		active: true
	};

	const loadWebhooks = () => {
		setIsLoading(true);
		webhooksApi.list().then(res => {
			setWebhooks(res.webhooks || []);
			setSupportedEvents(res.supported_events || {});
			setMockReceiverUrl(res.mock_receiver || '');
			setIsLoading(false);
		}).catch(err => {
			console.error(err);
			toast('تعذر جلب إعدادات خطافات الويب.', 'danger');
			setIsLoading(false);
		});
	};

	useEffect(() => {
		loadWebhooks();
	}, []);

	const handleOpenCreate = (preset = 'generic') => {
		const newItem = {
			...defaultItem,
			preset,
			name: preset === 'discord' ? 'قناة ديسكورد لتنبيهات العمل' : (preset === 'slack' ? 'قناة سلاك للمشاريع' : 'خطاف ويب مؤسسي'),
			secret: 'whsec_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
		};
		setEditingItem(newItem);
		setModalTestResult(null);
		setIsModalOpen(true);
	};

	const handleOpenEdit = (item) => {
		setEditingItem({ ...item });
		setModalTestResult(null);
		setIsModalOpen(true);
	};

	const handleToggleEvent = (eventKey) => {
		if (!editingItem) return;
		const currentEvents = editingItem.events || [];
		let nextEvents = [];
		if (currentEvents.includes(eventKey)) {
			nextEvents = currentEvents.filter(e => e !== eventKey);
		} else {
			nextEvents = [...currentEvents, eventKey];
		}
		setEditingItem({ ...editingItem, events: nextEvents });
	};

	const handleGenerateSecret = () => {
		const newSecret = 'whsec_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
		setEditingItem({ ...editingItem, secret: newSecret });
		toast('تم توليد مفتاح سري عشوائي جديد.', 'info');
	};

	const handleSave = () => {
		if (!editingItem.name || !editingItem.url) {
			toast('يرجى إدخال اسم الخطاف ورابط النهاية (URL).', 'warning');
			return;
		}

		setIsSaving(true);
		webhooksApi.save(editingItem).then(res => {
			setIsSaving(false);
			setIsModalOpen(false);
			toast(res.message || 'تم حفظ الخطاف بنجاح.', 'success');
			try { sound.play('solution'); } catch (e) {}
			loadWebhooks();
		}).catch(err => {
			setIsSaving(false);
			console.error(err);
			toast(err.message || 'حدث خطأ أثناء حفظ الخطاف.', 'danger');
		});
	};

	const handleDelete = (id, name) => {
		if (!window.confirm(`هل أنت متأكد من حذف الخطاف "${name}" نهائياً؟`)) {
			return;
		}

		webhooksApi.delete(id).then(() => {
			toast('تم حذف الخطاف بنجاح.', 'success');
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast('تعذر حذف الخطاف.', 'danger');
		});
	};

	const handleQuickTest = (item) => {
		setTestingId(item.id);
		webhooksApi.test({
			url: item.url,
			secret: item.secret,
			preset: item.preset
		}).then(res => {
			setTestingId(null);
			if (res.success) {
				toast(`نجح الاتصال! كود الاستجابة: HTTP ${res.status_code} (${res.latency_ms}ms)`, 'success');
				try { sound.play('task_done'); } catch (e) {}
			} else {
				toast(`فشل الاتصال: ${res.error_message || 'رمز الاستجابة: ' + res.status_code}`, 'danger');
			}
			loadWebhooks();
		}).catch(err => {
			setTestingId(null);
			console.error(err);
			toast('تعذر إرسال الفحص التجريبي.', 'danger');
		});
	};

	const handleModalTest = () => {
		if (!editingItem.url) {
			toast('يرجى إدخال الرابط أولاً لاختبار الاتصال.', 'warning');
			return;
		}

		setModalTestLoading(true);
		setModalTestResult(null);

		webhooksApi.test({
			url: editingItem.url,
			secret: editingItem.secret,
			preset: editingItem.preset
		}).then(res => {
			setModalTestLoading(false);
			setModalTestResult(res);
			if (res.success) {
				try { sound.play('task_done'); } catch (e) {}
			}
		}).catch(err => {
			setModalTestLoading(false);
			setModalTestResult({
				success: false,
				status_code: 0,
				latency_ms: 0,
				error_message: err.message || 'خطأ في الشبكة أو تعذر الاتصال.'
			});
		});
	};

	const handleToggleActive = (item) => {
		const updated = { ...item, active: !item.active };
		webhooksApi.save(updated).then(() => {
			toast(`تم ${updated.active ? 'تفعيل' : 'تعطيل'} الخطاف بنجاح.`, 'info');
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast('تعذر تحديث حالة الخطاف.', 'danger');
		});
	};

	const getPresetBadge = (preset) => {
		switch (preset) {
			case 'discord':
				return html`<span className="tag" style=${{ background: '#5865F2', color: '#fff', fontWeight: 'bold' }}>Discord</span>`;
			case 'slack':
				return html`<span className="tag" style=${{ background: '#4A154B', color: '#fff', fontWeight: 'bold' }}>Slack</span>`;
			case 'teams':
				return html`<span className="tag" style=${{ background: '#464EB8', color: '#fff', fontWeight: 'bold' }}>MS Teams</span>`;
			default:
				return html`<span className="tag is-dark" style=${{ fontWeight: 'bold' }}>Generic JSON</span>`;
		}
	};

	return html`
		<div className="webhooks-settings-tab" style=${{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			
			<!-- HEADER HERO BANNER -->
			<div className="card" style=${{
				background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
				color: '#fff',
				borderRadius: '12px',
				padding: '24px 28px',
				boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				flexWrap: 'wrap',
				gap: '16px'
			}}>
				<div style=${{ maxWidth: '700px' }}>
					<div style=${{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
						<span className="icon" style=${{ fontSize: '20px' }}><i className="dashicons dashicons-admin-links"></i></span>
						<h2 style=${{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>
							منظومة خطافات الويب والتكامل المؤسسي (Webhooks Studio)
						</h2>
						<span className="tag is-info is-light" style=${{ fontWeight: 'bold', fontSize: '0.75rem' }}>v1.5.0 Enterprise</span>
					</div>
					<p style=${{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
						ربط أحداث WorkPress الحية (اعتماد الحلول، طلبات العملاء، اكتمال المشاريع) بقنوات العمل الخارجية مثل <strong>Discord و Slack و Microsoft Teams و Zapier</strong> فور وقوعها مع التوقيع الأمني المشفر HMAC-SHA256.
					</p>
				</div>
				<div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
					<button 
						className="button is-primary" 
						onClick=${() => handleOpenCreate('generic')}
						style=${{ fontWeight: 'bold', borderRadius: '8px', padding: '0 18px', background: '#3b82f6', borderColor: '#3b82f6' }}
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>إضافة خطاف جديد</span>
					</button>
				</div>
			</div>

			<!-- STATS & QUICK PRESETS ROW -->
			<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
				<div className="card" style=${{ padding: '16px 20px', borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
					<div style=${{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
						<i className="dashicons dashicons-rss"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>إجمالي الخطافات المسجلة</div>
						<div style=${{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>${webhooks.length}</div>
					</div>
				</div>

				<div className="card" style=${{ padding: '16px 20px', borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
					<div style=${{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
						<i className="dashicons dashicons-yes-alt"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>الخطافات النشطة الحية</div>
						<div style=${{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>${webhooks.filter(w => w.active).length}</div>
					</div>
				</div>

				<div className="card" style=${{ padding: '16px 20px', borderRadius: '10px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
					<div style=${{ width: '44px', height: '44px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
						<i className="dashicons dashicons-lock"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>حماية التوقيع الأمني</div>
						<div style=${{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b5cf6' }}>HMAC-SHA256 نشط</div>
					</div>
				</div>
			</div>

			<!-- WEBHOOKS LIST SECTION -->
			<div className="card" style=${{ borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
				<div style=${{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
					<div>
						<h3 style=${{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
							قائمة خطافات الويب وقنوات الاستماع الخارجية
						</h3>
						<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>يتم إرسال الأحداث بشكل فوري غير معطل للواجهة مع مهلة زمنية مضبوطة</span>
					</div>
					<button 
						className="button is-small is-light" 
						onClick=${loadWebhooks} 
						disabled=${isLoading}
						style=${{ borderRadius: '6px' }}
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
							<button className="button" onClick=${() => handleOpenCreate('discord')} style=${{ background: '#5865F2', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}>
								<span>إنشاء تكامل Discord</span>
							</button>
							<button className="button" onClick=${() => handleOpenCreate('slack')} style=${{ background: '#4A154B', color: '#fff', fontWeight: 'bold', borderRadius: '8px' }}>
								<span>إنشاء تكامل Slack</span>
							</button>
							<button className="button is-dark" onClick=${() => handleOpenCreate('generic')} style=${{ fontWeight: 'bold', borderRadius: '8px' }}>
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
												onClick=${() => handleToggleActive(item)}
												title=${item.active ? 'انقر للتعطيل' : 'انقر للتفعيل'}
												style=${{
													border: 'none',
													background: item.active ? '#10b981' : '#cbd5e1',
													color: '#fff',
													width: '32px',
													height: '20px',
													borderRadius: '20px',
													cursor: 'pointer',
													position: 'relative',
													padding: 0,
													transition: 'background 0.2s'
												}}
											>
												<span style=${{
													display: 'block',
													width: '14px',
													height: '14px',
													borderRadius: '50%',
													background: '#fff',
													position: 'absolute',
													top: '3px',
													left: item.active ? '15px' : '3px',
													transition: 'left 0.2s'
												}}></span>
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
												borderRadius: '6px', 
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
													<span key=${ev} className="tag is-light" style=${{ fontSize: '0.75rem', borderRadius: '4px' }}>
														${ev.replace('workpress.', '')}
													</span>
												`)}
											</div>
										</td>

										<!-- LAST STATUS / LATENCY -->
										<td style=${{ verticalAlign: 'middle' }}>
											${item.last_status ? html`
												<div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
													<span className=${`tag is-small ${item.last_status >= 200 && item.last_status < 300 ? 'is-success' : 'is-danger'}`} style=${{ fontWeight: 'bold' }}>
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
													className=${`button is-small is-light ${testingId === item.id ? 'is-loading' : ''}`}
													onClick=${() => handleQuickTest(item)}
													title="إرسال فحص تجريبي لحظي"
													style=${{ borderRadius: '6px', fontWeight: 'bold', color: '#3b82f6' }}
												>
													<span>اختبار</span>
												</button>
												<button 
													className="button is-small is-light"
													onClick=${() => handleOpenEdit(item)}
													title="تعديل الخطاف"
													style=${{ borderRadius: '6px' }}
												>
													<span className="icon is-small"><i className="dashicons dashicons-edit"></i></span>
												</button>
												<button 
													className="button is-small is-light is-danger"
													onClick=${() => handleDelete(item.id, item.name)}
													title="حذف الخطاف"
													style=${{ borderRadius: '6px' }}
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

			<!-- LOCAL TESTING HELPER & MOCK RECEIVER BOX -->
			<div className="card" style=${{ borderRadius: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '20px 24px' }}>
				<div style=${{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
					<span className="icon is-medium has-text-warning"><i className="dashicons dashicons-lightbulb"></i></span>
					<div style=${{ flex: 1 }}>
						<h4 style=${{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
							دليل التجربة والاختبار المحلي الفوري على Laragon / Localhost
						</h4>
						<p style=${{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>
							نظراً لأن نظام WorkPress يرسل طلبات صادرة (Outbound)، يمكنك اختباره محلياً في ثوانٍ عبر أحد الخيارات التالية:
						</p>
						<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
							<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
								<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#5865F2', marginBottom: '4px' }}>1. عبر قناة Discord مجانية (الأسهل والأجمل):</strong>
								<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>أنشئ سيرفر Discord -> إعدادات القناة -> Integrations -> Webhooks، والصق الرابط هنا لرؤية البطاقات الفاخرة!</span>
							</div>

							<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
								<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#059669', marginBottom: '4px' }}>2. عبر موقع Webhook.site (فوري بدون تسجيل):</strong>
								<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>افتح موقع <a href="https://webhook.site" target="_blank" rel="noreferrer" style=${{ textDecoration: 'underline' }}>webhook.site</a>، وانسخ رابطك الفريد والصقه هنا لمعاينة الـ JSON لحظياً.</span>
							</div>
						</div>

						${mockReceiverUrl ? html`
							<div style=${{ marginTop: '12px', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
								<div>
									<span style=${{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0f172a' }}>المستقبل المحلي المدمج (Local Mock Loopback):</span>
									<span style=${{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>يمكنك وضع هذا الرابط لتجربة الإرسال محلياً دون أي اتصال بالإنترنت</span>
								</div>
								<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
									<code style=${{ fontSize: '0.75rem', direction: 'ltr', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>${mockReceiverUrl}</code>
									<button 
										className="button is-small is-light" 
										onClick=${() => {
											navigator.clipboard.writeText(mockReceiverUrl);
											toast('تم نسخ رابط المستقبل المحلي.', 'info');
										}}
									>
										نسخ
									</button>
								</div>
							</div>
						` : null}
					</div>
				</div>
			</div>

			<!-- MODAL: ADD / EDIT WEBHOOK -->
			${isModalOpen && editingItem ? html`
				<div className="modal is-active" style=${{ zIndex: 1000 }}>
					<div className="modal-background" onClick=${() => setIsModalOpen(false)} style=${{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}></div>
					<div className="modal-card" style=${{ maxWidth: '640px', width: '90%', borderRadius: '12px', overflow: 'hidden' }}>
						
						<!-- MODAL HEADER -->
						<header className="modal-card-head" style=${{ background: '#0f172a', borderBottom: 'none', padding: '18px 24px' }}>
							<p className="modal-card-title" style=${{ color: '#fff', fontSize: '1.1rem', fontWeight: '800' }}>
								${editingItem.id ? 'تعديل إعدادات خطاف الويب' : 'إنشاء خطاف ويب جديد'}
							</p>
							<button className="delete" aria-label="close" onClick=${() => setIsModalOpen(false)}></button>
						</header>

						<!-- MODAL BODY -->
						<section className="modal-card-body" style=${{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
							
							<!-- PRESET SELECTOR -->
							<div className="field" style=${{ marginBottom: '20px' }}>
								<label className="label" style=${{ fontSize: '0.85rem', fontWeight: 'bold' }}>نوع قالب الإرسال والمنصة المستهدفة (Preset):</label>
								<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
									<button 
										type="button" 
										className=${`button ${editingItem.preset === 'generic' ? 'is-dark' : 'is-light'}`}
										onClick=${() => setEditingItem({ ...editingItem, preset: 'generic' })}
										style=${{ fontWeight: 'bold', borderRadius: '8px' }}
									>
										<span>Generic REST JSON</span>
									</button>

									<button 
										type="button" 
										className=${`button ${editingItem.preset === 'discord' ? 'is-info' : 'is-light'}`}
										onClick=${() => setEditingItem({ ...editingItem, preset: 'discord' })}
										style=${{ fontWeight: 'bold', borderRadius: '8px', background: editingItem.preset === 'discord' ? '#5865F2' : '', color: editingItem.preset === 'discord' ? '#fff' : '' }}
									>
										<span>Discord Rich Embed</span>
									</button>

									<button 
										type="button" 
										className=${`button ${editingItem.preset === 'slack' ? 'is-primary' : 'is-light'}`}
										onClick=${() => setEditingItem({ ...editingItem, preset: 'slack' })}
										style=${{ fontWeight: 'bold', borderRadius: '8px', background: editingItem.preset === 'slack' ? '#4A154B' : '', color: editingItem.preset === 'slack' ? '#fff' : '' }}
									>
										<span>Slack BlockKit</span>
									</button>

									<button 
										type="button" 
										className=${`button ${editingItem.preset === 'teams' ? 'is-link' : 'is-light'}`}
										onClick=${() => setEditingItem({ ...editingItem, preset: 'teams' })}
										style=${{ fontWeight: 'bold', borderRadius: '8px', background: editingItem.preset === 'teams' ? '#464EB8' : '', color: editingItem.preset === 'teams' ? '#fff' : '' }}
									>
										<span>Microsoft Teams</span>
									</button>
								</div>
							</div>

							<!-- NAME -->
							<div className="field" style=${{ marginBottom: '16px' }}>
								<label className="label" style=${{ fontSize: '0.85rem', fontWeight: 'bold' }}>اسم الخطاف / القناة:</label>
								<div className="control">
									<input 
										className="input" 
										type="text" 
										value=${editingItem.name} 
										onInput=${(e) => setEditingItem({ ...editingItem, name: e.target.value })}
										placeholder="مثال: تنبيهات ديسكورد للإدارة العامة"
										style=${{ borderRadius: '8px' }}
									/>
								</div>
							</div>

							<!-- URL -->
							<div className="field" style=${{ marginBottom: '16px' }}>
								<label className="label" style=${{ fontSize: '0.85rem', fontWeight: 'bold' }}>رابط الاستماع الخارجي (Webhook Endpoint URL):</label>
								<div className="control">
									<input 
										className="input" 
										type="url" 
										value=${editingItem.url} 
										onInput=${(e) => setEditingItem({ ...editingItem, url: e.target.value })}
										placeholder="https://discord.com/api/webhooks/... أو https://hooks.slack.com/..."
										style=${{ borderRadius: '8px', direction: 'ltr', fontFamily: 'monospace', fontSize: '0.85rem' }}
									/>
								</div>
							</div>

							<!-- SECRET -->
							<div className="field" style=${{ marginBottom: '20px' }}>
								<label className="label" style=${{ fontSize: '0.85rem', fontWeight: 'bold' }}>المفتاح السري للتوقيع المشفر (Secret Key for HMAC):</label>
								<div className="field has-addons" style=${{ direction: 'ltr' }}>
									<div className="control is-expanded">
										<input 
											className="input" 
											type="text" 
											value=${editingItem.secret} 
											onInput=${(e) => setEditingItem({ ...editingItem, secret: e.target.value })}
											placeholder="whsec_..."
											style=${{ borderRadius: '8px 0 0 8px', fontFamily: 'monospace', fontSize: '0.85rem' }}
										/>
									</div>
									<div className="control">
										<button 
											type="button" 
											className="button is-light" 
											onClick=${handleGenerateSecret}
											style=${{ borderRadius: '0 8px 8px 0', fontWeight: 'bold' }}
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
								<label className="label" style=${{ fontSize: '0.85rem', fontWeight: 'bold' }}>الأحداث المراد الاشتراك بها وإرسالها:</label>
								<div style=${{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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
							<div style=${{ background: '#eff6ff', padding: '14px 18px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
								<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
									<div>
										<strong style=${{ fontSize: '0.85rem', color: '#1e40af' }}>اختبار الاتصال اللحظي (Test Ping)</strong>
										<div style=${{ fontSize: '0.75rem', color: '#3b82f6' }}>أرسل حزمة تجريبية الآن وتأكد من عمل الرابط قبل الحفظ</div>
									</div>
									<button 
										type="button" 
										className=${`button is-small is-info ${modalTestLoading ? 'is-loading' : ''}`}
										onClick=${handleModalTest}
										style=${{ fontWeight: 'bold', borderRadius: '6px' }}
									>
										<span>إرسال فحص تجريبي</span>
									</button>
								</div>

								${modalTestResult ? html`
									<div style=${{ 
										marginTop: '10px', 
										padding: '10px 14px', 
										borderRadius: '6px', 
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
						<footer className="modal-card-foot" style=${{ justifyContent: 'flex-end', gap: '10px', background: '#f8fafc', padding: '14px 24px' }}>
							<button className="button" onClick=${() => setIsModalOpen(false)} style=${{ borderRadius: '8px' }}>
								إلغاء
							</button>
							<button 
								className=${`button is-primary ${isSaving ? 'is-loading' : ''}`}
								onClick=${handleSave}
								style=${{ borderRadius: '8px', fontWeight: 'bold', background: '#0f172a', borderColor: '#0f172a' }}
							>
								<span className="icon"><i className="dashicons dashicons-saved"></i></span>
								<span>حفظ إعدادات الخطاف</span>
							</button>
						</footer>

					</div>
				</div>
			` : null}

		</div>
	`;
}
