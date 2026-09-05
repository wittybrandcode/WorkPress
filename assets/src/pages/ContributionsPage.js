import { html, useState, useEffect, __, isRtl } from '../utils/html.js';
import { contributionsApi, projectsApi, tasksApi } from '../api/client.js';
import { hooks } from '../utils/hooks.js';
import { toast } from '../utils/toast.js';
import ContributionFilterBar from '../components/contributions/ContributionFilterBar.js';
import ContributionCard from '../components/contributions/ContributionCard.js';
import ContributionTableView from '../components/contributions/ContributionTableView.js';
import ContributionBulkBar from '../components/contributions/ContributionBulkBar.js';
import ContributionDetailModal from '../components/contributions/ContributionDetailModal.js';
import ConfirmModal from '../components/modals/ConfirmModal.js';
import Pagination from '../components/ui/Pagination.js';
import Loader from '../components/ui/Loader.js';
import sound from '../utils/sound.js';

/**
 * WorkPress Contributions Page (Lean Controller)
 *
 * High-performance coordinator for team solution submissions and work evidence stream.
 * Fully decoupled following the WorkPress Divider Lean Controller specification.
 *
 * @package WorkPress
 * @subpackage Pages
 * @version 2.4.0
 */
export default function ContributionsPage({ refreshKey }) {
	const [contributions, setContributions] = useState([]);
	const [projects, setProjects] = useState([]);
	const [tasks, setTasks] = useState([]);
	const [availableTypes, setAvailableTypes] = useState([]);
	const [users, setUsers] = useState([]);

	// Global baseline stats for toolbar chips
	const [stats, setStats] = useState({
		total: 0,
		accepted: 0,
		pending: 0,
		work: 0,
		system: 0
	});

	// Filter & Navigation State
	const [selectedProject, setSelectedProject] = useState('');
	const [selectedTask, setSelectedTask] = useState('');
	const [selectedAuthor, setSelectedAuthor] = useState('');
	const [selectedType, setSelectedType] = useState('all'); // 'all' | 'work' | 'system' | type_slug
	const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'accepted' | 'pending'
	const [searchQuery, setSearchQuery] = useState('');
	const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedIds, setSelectedIds] = useState([]); // Bulk selection IDs
	const itemsPerPage = 12; // 3 columns x 4 rows
	const rtl = isRtl();

	const [isLoading, setIsLoading] = useState(true);
	const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
	const [previewContribution, setPreviewContribution] = useState(null);
	const [confirmModalConfig, setConfirmModalConfig] = useState({ isActive: false });

	// Reset page and clear bulk selections whenever any filter or search changes
	useEffect(() => {
		setCurrentPage(1);
		setSelectedIds([]);
	}, [selectedProject, selectedTask, selectedAuthor, selectedType, selectedStatus, searchQuery]);

	// Initial data loading
	useEffect(() => {
		projectsApi.list().then(data => {
			setProjects(Array.isArray(data) ? data : []);
		}).catch(console.error);

		tasksApi.list().then(data => {
			setTasks(Array.isArray(data) ? data : []);
		}).catch(console.error);

		contributionsApi.types.list().then(data => {
			setAvailableTypes(Array.isArray(data) ? data : []);
		}).catch(console.error);

		window.wp.apiFetch({ path: '/wp/v2/users?per_page=100' }).then(data => {
			setUsers(Array.isArray(data) ? data : []);
		}).catch(console.error);

		fetchBaselineStats();
	}, []);

	const fetchBaselineStats = () => {
		contributionsApi.list({ number: 200 }).then(list => {
			if (Array.isArray(list)) {
				const accepted = list.filter(c => c.is_accepted).length;
				const work = list.filter(c => !['state_change', 'assignment', 'trash_request'].includes(c.type)).length;
				const system = list.filter(c => ['state_change', 'assignment', 'trash_request'].includes(c.type)).length;
				const pending = list.filter(c => !c.is_accepted && !['state_change', 'assignment', 'trash_request'].includes(c.type)).length;
				setStats({
					total: list.length,
					accepted,
					pending,
					work,
					system
				});
			}
		}).catch(console.error);
	};

	const fetchContributions = () => {
		setIsLoading(true);

		const filters = { number: 150 };
		if (selectedProject) filters.project_id = selectedProject;
		if (selectedTask) filters.task_id = selectedTask;
		if (selectedAuthor) filters.user_id = selectedAuthor;
		if (searchQuery.trim()) filters.search = searchQuery.trim();

		if (selectedStatus === 'accepted') {
			filters.is_accepted = '1';
		} else if (selectedStatus === 'pending') {
			filters.is_accepted = '0';
		}

		if (selectedType === 'work') {
			filters.type_not_in = 'state_change,assignment,trash_request';
		} else if (selectedType === 'system') {
			filters.type_in = 'state_change,assignment,trash_request';
		} else if (selectedType !== 'all') {
			filters.type_in = selectedType;
		}

		contributionsApi.list(filters).then(data => {
			setContributions(Array.isArray(data) ? data : []);
			setIsLoading(false);
		}).catch(err => {
			console.error(err);
			setIsLoading(false);
		});
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchContributions();
		}, searchQuery ? 300 : 0);
		return () => clearTimeout(timer);
	}, [selectedProject, selectedTask, selectedAuthor, selectedType, selectedStatus, searchQuery, refreshKey]);

	// --- Actions Handlers ---
	const handleAccept = (contribution) => {
		setConfirmModalConfig({
			isActive: true,
			title: __('Accept Contribution as Verified Solution', 'workpress'),
			message: `${__('Are you sure you want to accept this contribution as verified solution for task', 'workpress')} "${contribution.task_title}"?`,
			confirmText: __('Accept Solution & Complete Task', 'workpress'),
			confirmColor: 'is-success',
			isDangerous: false,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				contributionsApi.accept(contribution.id)
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						toast(__('Solution accepted and task completed successfully', 'workpress'), 'success');
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction('workpress_refresh_notifications');
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('An error occurred during accept', 'workpress'), 'danger');
					});
			}
		});
	};

	const handleRevoke = (contribution) => {
		setConfirmModalConfig({
			isActive: true,
			title: __('Revoke Approval', 'workpress'),
			message: `${__('Are you sure you want to revoke approval for solution in task', 'workpress')} "${contribution.task_title}"?`,
			confirmText: __('Revoke & Reopen', 'workpress'),
			confirmColor: 'is-warning',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				contributionsApi.revoke(contribution.id)
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						toast(__('Approval revoked and task reopened successfully', 'workpress'), 'info');
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction('workpress_refresh_notifications');
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('An error occurred during revoke', 'workpress'), 'danger');
					});
			}
		});
	};

	const handleTrashRequest = (contribution) => {
		setConfirmModalConfig({
			isActive: true,
			title: __('Trash Contribution Request', 'workpress'),
			message: `${__('Are you sure you want to request trashing contribution for task', 'workpress')} "${contribution.task_title}"?`,
			confirmText: __('Submit Request', 'workpress'),
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: __('Reason for deletion', 'workpress'),
			isSubmitting: false,
			onConfirm: (reason) => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				contributionsApi.trashRequest(contribution.id, reason)
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						toast(__('Trash request sent successfully.', 'workpress'), 'info');
						fetchContributions();
						fetchBaselineStats();
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('Failed to send feedback, please try again.', 'workpress'), 'danger');
					});
			}
		});
	};

	const handleRestore = (contribution) => {
		setContributions(prev => prev.map(c => c.id === contribution.id ? { ...c, is_pending_trash: false } : c));
		contributionsApi.update(contribution.id, { is_pending_trash: false })
			.then(() => {
				toast(__('Contribution restored successfully', 'workpress'), 'success');
				fetchContributions();
				fetchBaselineStats();
			})
			.catch(err => {
				toast(err.message || __('An error occurred during restore', 'workpress'), 'danger');
				fetchContributions();
			});
	};

	const handleHardDelete = (contribution) => {
		setConfirmModalConfig({
			isActive: true,
			title: __('Confirm Permanent Deletion', 'workpress'),
			message: __('Are you sure you want to permanently delete this item? This action cannot be undone.', 'workpress'),
			confirmText: __('Delete Permanently', 'workpress'),
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				setContributions(prev => prev.filter(c => c.id !== contribution.id));
				contributionsApi.delete(contribution.id)
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						toast(__('Contribution permanently deleted', 'workpress'), 'success');
						fetchContributions();
						fetchBaselineStats();
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('An error occurred during deletion', 'workpress'), 'danger');
						fetchContributions();
					});
			}
		});
	};

	// --- Bulk Selection & Operations ---
	const handleToggleSelect = (id) => {
		setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
	};

	const handleSelectAll = () => {
		const pageIds = paginatedContributions.map(c => c.id);
		const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
		if (allSelected) {
			setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
		} else {
			setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
		}
	};

	const handleBulkAccept = () => {
		const pendingSelected = contributions.filter(c => selectedIds.includes(c.id) && !c.is_accepted);
		if (pendingSelected.length === 0) {
			toast(__('No pending contributions among selected items', 'workpress'), 'warning');
			return;
		}
		setConfirmModalConfig({
			isActive: true,
			title: __('Bulk Approve Solutions', 'workpress'),
			message: __('Are you sure you want to approve selected contributions as official verified solutions and complete their respective tasks?', 'workpress'),
			confirmText: __('Approve All Selected', 'workpress'),
			confirmColor: 'is-success',
			isDangerous: false,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				Promise.all(pendingSelected.map(c => contributionsApi.accept(c.id)))
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						setSelectedIds([]);
						toast(__('Selected solutions approved successfully', 'workpress'), 'success');
						fetchContributions();
						fetchBaselineStats();
						hooks.doAction('workpress_refresh_notifications');
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('An error occurred during bulk approve', 'workpress'), 'danger');
						fetchContributions();
					});
			}
		});
	};

	const handleBulkTrash = () => {
		setConfirmModalConfig({
			isActive: true,
			title: __('Bulk Delete Contributions', 'workpress'),
			message: __('Are you sure you want to request deletion for selected contributions?', 'workpress'),
			confirmText: __('Delete Selected', 'workpress'),
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: true,
			reasonLabel: __('Reason for deletion', 'workpress'),
			isSubmitting: false,
			onConfirm: (reason) => {
				setConfirmModalConfig(prev => ({ ...prev, isSubmitting: true }));
				Promise.all(selectedIds.map(id => contributionsApi.trashRequest(id, reason)))
					.then(() => {
						setConfirmModalConfig({ isActive: false });
						setSelectedIds([]);
						toast(__('Deletion requests submitted successfully', 'workpress'), 'info');
						fetchContributions();
						fetchBaselineStats();
					})
					.catch(err => {
						setConfirmModalConfig(prev => ({ ...prev, isSubmitting: false }));
						toast(err.message || __('An error occurred during bulk delete', 'workpress'), 'danger');
						fetchContributions();
					});
			}
		});
	};

	const handleProjectChange = (val) => {
		setSelectedProject(val);
		setSelectedTask('');
		sound.play('click');
	};

	const projectOptions = [
		{ value: '', label: __('All Projects', 'workpress') },
		...projects.map(p => ({ value: String(p.id), label: p.name }))
	];

	const filteredTasks = selectedProject
		? tasks.filter(t => String(t.project_id) === String(selectedProject))
		: tasks;

	const taskOptions = [
		{ value: '', label: __('All Tasks', 'workpress') },
		...filteredTasks.map(t => ({ value: String(t.id), label: t.title || `#${t.id}` }))
	];

	const authorOptions = [
		{ value: '', label: __('All Members', 'workpress') },
		...users.map(u => ({ value: String(u.id), label: u.name || u.display_name || u.username }))
	];

	const isFilterActive = Boolean(selectedProject || selectedTask || selectedAuthor || selectedType !== 'all' || selectedStatus !== 'all' || searchQuery);

	const handleResetFilters = () => {
		setSelectedProject('');
		setSelectedTask('');
		setSelectedAuthor('');
		setSelectedType('all');
		setSelectedStatus('all');
		setSearchQuery('');
	};

	// Pagination calculations
	const totalItems = contributions.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
	const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
	const startIndex = (validCurrentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
	const paginatedContributions = contributions.slice(startIndex, endIndex);

	return html`
		<div className="contributions-page pb-6">
			<!-- 1. شريط الأدوات والفلترة العلوي الموحد -->
			<${ContributionFilterBar}
				totalCount=${stats.total || contributions.length}
				acceptedCount=${stats.accepted}
				pendingCount=${stats.pending}
				workCount=${stats.work}
				systemCount=${stats.system}
				searchQuery=${searchQuery}
				setSearchQuery=${setSearchQuery}
				selectedStatus=${selectedStatus}
				setSelectedStatus=${setSelectedStatus}
				selectedType=${selectedType}
				setSelectedType=${setSelectedType}
				selectedProject=${selectedProject}
				onProjectChange=${handleProjectChange}
				projectOptions=${projectOptions}
				selectedTask=${selectedTask}
				setSelectedTask=${setSelectedTask}
				taskOptions=${taskOptions}
				selectedAuthor=${selectedAuthor}
				setSelectedAuthor=${setSelectedAuthor}
				authorOptions=${authorOptions}
				viewMode=${viewMode}
				setViewMode=${setViewMode}
				isFilterActive=${isFilterActive}
				onReset=${handleResetFilters}
			/>

			<!-- 2. محتوى المساهمات (تحميل / حالة فارغة / جدول / شبكة بطاقات) -->
			${isLoading ? html`
				<div className="py-6 mt-4 has-text-centered">
					<${Loader} center=${true} label=${__('Loading contributions...', 'workpress')} size="large" />
				</div>
			` : totalItems === 0 ? html`
				<div className="box wp-card has-text-centered py-6 mt-4" style=${{ borderRadius: 0 }}>
					<span className="icon is-large has-text-grey-light mb-3">
						<i className="dashicons dashicons-admin-comments" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h3 className="title is-5 mb-2 has-text-dark">${isFilterActive ? __('No contributions matching selected filters', 'workpress') : __('Contributions stream is currently empty', 'workpress')}</h3>
					<p className="subtitle is-6 has-text-grey-light mb-4">${isFilterActive ? __('Try adjusting search terms or active filters to find what you are looking for.', 'workpress') : __('Contributions represent technical solutions and work evidence submitted by team members.', 'workpress')}</p>
					${isFilterActive && html`
						<button className="button is-light wp-btn" onClick=${handleResetFilters}>
							<i className="dashicons dashicons-image-rotate" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '4px' }}></i>
							<span>${__('Reset Filters', 'workpress')}</span>
						</button>
					`}
				</div>
			` : viewMode === 'table' ? html`
				<${ContributionTableView}
					contributions=${paginatedContributions}
					selectedIds=${selectedIds}
					onToggleSelect=${handleToggleSelect}
					onSelectAll=${handleSelectAll}
					onPreview=${(item) => { setPreviewContribution(item); setIsPreviewModalOpen(true); }}
					onAccept=${handleAccept}
				/>
			` : html`
				<div className="columns is-multiline mt-4">
					${paginatedContributions.map(item => html`
						<div key=${item.id} className="column is-4-desktop is-6-tablet is-12-mobile">
							<${ContributionCard}
								contribution=${item}
								isSelected=${selectedIds.includes(item.id)}
								onToggleSelect=${() => handleToggleSelect(item.id)}
								onRefresh=${fetchContributions}
								onPreview=${(c) => { setPreviewContribution(c); setIsPreviewModalOpen(true); }}
								onAccept=${handleAccept}
								onRevoke=${handleRevoke}
								onTrashRequest=${handleTrashRequest}
								onRestore=${handleRestore}
								onHardDelete=${handleHardDelete}
							/>
						</div>
					`)}
				</div>
			`}

			<!-- 3. شريط الإجراءات الجماعية العائم المستقل -->
			<${ContributionBulkBar}
				selectedIds=${selectedIds}
				onBulkAccept=${handleBulkAccept}
				onBulkTrash=${handleBulkTrash}
				onClearSelection=${() => setSelectedIds([])}
			/>

			<!-- 4. مكون الترقيم المركزي الموحد -->
			${!isLoading && totalItems > 0 && html`
				<${Pagination}
					currentPage=${validCurrentPage}
					totalPages=${totalPages}
					totalItems=${totalItems}
					itemsPerPage=${itemsPerPage}
					onPageChange=${(p) => { setCurrentPage(p); sound.play('click'); }}
					itemLabel=${__('contributions', 'workpress')}
				/>
			`}

			<!-- 5. نافذة تفاصيل المساهمة الكاملة -->
			<${ContributionDetailModal}
				isActive=${isPreviewModalOpen}
				onClose=${() => { setIsPreviewModalOpen(false); setPreviewContribution(null); }}
				contribution=${previewContribution}
				onStatusChange=${() => { fetchContributions(); fetchBaselineStats(); }}
			/>

			<!-- 6. نافذة تأكيد الإجراءات الموحدة -->
			<${ConfirmModal}
				isActive=${confirmModalConfig.isActive}
				title=${confirmModalConfig.title}
				message=${confirmModalConfig.message}
				confirmText=${confirmModalConfig.confirmText}
				confirmColor=${confirmModalConfig.confirmColor}
				isDangerous=${confirmModalConfig.isDangerous}
				requiresReason=${confirmModalConfig.requiresReason}
				reasonLabel=${confirmModalConfig.reasonLabel}
				isSubmitting=${confirmModalConfig.isSubmitting}
				onConfirm=${confirmModalConfig.onConfirm}
				onCancel=${() => setConfirmModalConfig({ isActive: false })}
			/>
		</div>
	`;
}
