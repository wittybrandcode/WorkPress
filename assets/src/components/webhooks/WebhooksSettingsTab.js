import { html, useState, useEffect } from '../../utils/html.js';
import { webhooksApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';
import WebhooksHeroBanner from './WebhooksHeroBanner.js';
import WebhookEndpointsList from './WebhookEndpointsList.js';
import WebhookDeliveryLogs from './WebhookDeliveryLogs.js';
import WebhookModal from '../modals/Modal.js';

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
			toast('ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Ø®Ø·Ø§ÙØ§Øª Ø§Ù„ÙˆÙŠØ¨.', 'danger');
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
			name: preset === 'discord' ? 'Ù‚Ù†Ø§Ø© Ø¯ÙŠØ³ÙƒÙˆØ±Ø¯ Ù„ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø¹Ù…Ù„' : (preset === 'slack' ? 'Ù‚Ù†Ø§Ø© Ø³Ù„Ø§Ùƒ Ù„Ù„Ù…Ø´Ø§Ø±ÙŠØ¹' : 'Ø®Ø·Ø§Ù ÙˆÙŠØ¨ Ù…Ø¤Ø³Ø³ÙŠ'),
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
		toast('ØªÙ… ØªÙˆÙ„ÙŠØ¯ Ù…ÙØªØ§Ø­ Ø³Ø±ÙŠ Ø¹Ø´ÙˆØ§Ø¦ÙŠ Ø¬Ø¯ÙŠØ¯.', 'info');
	};

	const handleSave = () => {
		if (!editingItem.name || !editingItem.url) {
			toast('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ø³Ù… Ø§Ù„Ø®Ø·Ø§Ù ÙˆØ±Ø§Ø¨Ø· Ø§Ù„Ù†Ù‡Ø§ÙŠØ© (URL).', 'warning');
			return;
		}

		setIsSaving(true);
		webhooksApi.save(editingItem).then(res => {
			setIsSaving(false);
			setIsModalOpen(false);
			toast(res.message || 'ØªÙ… Ø­ÙØ¸ Ø§Ù„Ø®Ø·Ø§Ù Ø¨Ù†Ø¬Ø§Ø­.', 'success');
			try { sound.play('solution'); } catch (e) {}
			loadWebhooks();
		}).catch(err => {
			setIsSaving(false);
			console.error(err);
			toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ø®Ø·Ø§Ù.', 'danger');
		});
	};

	const handleDelete = (id, name) => {
		if (!window.confirm(`Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ø§Ù„Ø®Ø·Ø§Ù "${name}" Ù†Ù‡Ø§Ø¦ÙŠØ§Ù‹ØŸ`)) {
			return;
		}

		webhooksApi.delete(id).then(() => {
			toast('ØªÙ… Ø­Ø°Ù Ø§Ù„Ø®Ø·Ø§Ù Ø¨Ù†Ø¬Ø§Ø­.', 'success');
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast('ØªØ¹Ø°Ø± Ø­Ø°Ù Ø§Ù„Ø®Ø·Ø§Ù.', 'danger');
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
				toast(`Ù†Ø¬Ø­ Ø§Ù„Ø§ØªØµØ§Ù„! ÙƒÙˆØ¯ Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©: HTTP ${res.status_code} (${res.latency_ms}ms)`, 'success');
				try { sound.play('task_done'); } catch (e) {}
			} else {
				toast(`ÙØ´Ù„ Ø§Ù„Ø§ØªØµØ§Ù„: ${res.error_message || 'Ø±Ù…Ø² Ø§Ù„Ø§Ø³ØªØ¬Ø§Ø¨Ø©: ' + res.status_code}`, 'danger');
			}
			loadWebhooks();
		}).catch(err => {
			setTestingId(null);
			console.error(err);
			toast('ØªØ¹Ø°Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„ÙØ­Øµ Ø§Ù„ØªØ¬Ø±ÙŠØ¨ÙŠ.', 'danger');
		});
	};

	const handleModalTest = () => {
		if (!editingItem.url) {
			toast('ÙŠØ±Ø¬Ù‰ Ø¥Ø¯Ø®Ø§Ù„ Ø§Ù„Ø±Ø§Ø¨Ø· Ø£ÙˆÙ„Ø§Ù‹ Ù„Ø§Ø®ØªØ¨Ø§Ø± Ø§Ù„Ø§ØªØµØ§Ù„.', 'warning');
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
				error_message: err.message || 'Ø®Ø·Ø£ ÙÙŠ Ø§Ù„Ø´Ø¨ÙƒØ© Ø£Ùˆ ØªØ¹Ø°Ø± Ø§Ù„Ø§ØªØµØ§Ù„.'
			});
		});
	};

	const handleToggleActive = (item) => {
		const updated = { ...item, active: !item.active };
		webhooksApi.save(updated).then(() => {
			toast(`ØªÙ… ${updated.active ? 'ØªÙØ¹ÙŠÙ„' : 'ØªØ¹Ø·ÙŠÙ„'} Ø§Ù„Ø®Ø·Ø§Ù Ø¨Ù†Ø¬Ø§Ø­.`, 'info');
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast('ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø­Ø§Ù„Ø© Ø§Ù„Ø®Ø·Ø§Ù.', 'danger');
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
