import { html, useState, useEffect, __, sprintf } from '../../utils/html.js';
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
			toast( __( 'Failed to load webhooks settings.', 'workpress' ), 'danger' );
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
			name: preset === 'discord' ? __( 'Discord Work Alerts', 'workpress' ) : (preset === 'slack' ? __( 'Slack Projects Channel', 'workpress' ) : __( 'Enterprise Webhook', 'workpress' )),
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
		toast( __( 'Generated new secret key.', 'workpress' ), 'info' );
	};

	const handleSave = () => {
		if (!editingItem.name || !editingItem.url) {
			toast( __( 'Please enter webhook name and endpoint URL.', 'workpress' ), 'warning' );
			return;
		}

		setIsSaving(true);
		webhooksApi.save(editingItem).then(res => {
			setIsSaving(false);
			setIsModalOpen(false);
			toast(res.message || __( 'Webhook saved successfully.', 'workpress' ), 'success');
			try { sound.play('solution'); } catch (e) {}
			loadWebhooks();
		}).catch(err => {
			setIsSaving(false);
			console.error(err);
			toast(err.message || __( 'An error occurred while saving webhook.', 'workpress' ), 'danger');
		});
	};

	const handleDelete = (id, name) => {
		if (!window.confirm( sprintf( __( 'Are you sure you want to permanently delete webhook "%s"?', 'workpress' ), name ) )) {
			return;
		}

		webhooksApi.delete(id).then(() => {
			toast( __( 'Webhook deleted successfully.', 'workpress' ), 'success' );
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast( __( 'Failed to delete webhook.', 'workpress' ), 'danger' );
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
				toast( sprintf( __( 'Connection succeeded! Status: HTTP %s (%sms)', 'workpress' ), res.status_code, res.latency_ms ), 'success' );
				try { sound.play('task_done'); } catch (e) {}
			} else {
				toast( sprintf( __( 'Connection failed: %s', 'workpress' ), res.error_message || res.status_code ), 'danger' );
			}
			loadWebhooks();
		}).catch(err => {
			setTestingId(null);
			console.error(err);
			toast( __( 'Failed to dispatch test ping.', 'workpress' ), 'danger' );
		});
	};

	const handleModalTest = () => {
		if (!editingItem.url) {
			toast( __( 'Please enter endpoint URL first.', 'workpress' ), 'warning' );
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
				error_message: err.message || __( 'Network error or unreachable host.', 'workpress' )
			});
		});
	};

	const handleToggleActive = (item) => {
		const updated = { ...item, active: !item.active };
		webhooksApi.save(updated).then(() => {
			toast( updated.active ? __( 'Webhook activated.', 'workpress' ) : __( 'Webhook deactivated.', 'workpress' ), 'info' );
			loadWebhooks();
		}).catch(err => {
			console.error(err);
			toast( __( 'Failed to update webhook status.', 'workpress' ), 'danger' );
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
