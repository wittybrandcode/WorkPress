import { html, useState, useEffect } from '../../utils/html.js';
import { webhooksApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';
import WebhooksHeroBanner from './WebhooksHeroBanner.js';
import WebhookEndpointsList from './WebhookEndpointsList.js';
import WebhookDeliveryLogs from './WebhookDeliveryLogs.js';
import WebhookModal from './WebhookModal.js';

/**
 * Webhooks Settings Tab (Lean Coordinator)
 * 
 * @package WorkPress
 * @subpackage Components/Settings
 * @version 2.2.3
 */
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

	return html`
		<div className="webhooks-settings-tab" style=${{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
			<!-- HERO & STATS BANNER -->
			<${WebhooksHeroBanner}
				totalCount=${webhooks.length}
				activeCount=${webhooks.filter(w => w.active).length}
				handleOpenCreate=${handleOpenCreate}
			/>

			<!-- WEBHOOKS LIST SECTION -->
			<${WebhookEndpointsList}
				webhooks=${webhooks}
				isLoading=${isLoading}
				loadWebhooks=${loadWebhooks}
				handleToggleActive=${handleToggleActive}
				handleQuickTest=${handleQuickTest}
				handleOpenEdit=${handleOpenEdit}
				handleDelete=${handleDelete}
				handleOpenCreate=${handleOpenCreate}
				testingId=${testingId}
			/>

			<!-- LOCAL TESTING HELPER & MOCK RECEIVER BOX -->
			<${WebhookDeliveryLogs}
				mockReceiverUrl=${mockReceiverUrl}
			/>

			<!-- MODAL: ADD / EDIT WEBHOOK -->
			<${WebhookModal}
				isOpen=${isModalOpen}
				onClose=${() => setIsModalOpen(false)}
				editingItem=${editingItem}
				setEditingItem=${setEditingItem}
				supportedEvents=${supportedEvents}
				handleToggleEvent=${handleToggleEvent}
				handleGenerateSecret=${handleGenerateSecret}
				handleModalTest=${handleModalTest}
				modalTestLoading=${modalTestLoading}
				modalTestResult=${modalTestResult}
				handleSave=${handleSave}
				isSaving=${isSaving}
			/>
		</div>
	`;
}
