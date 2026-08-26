import { html, useState, useEffect, useRef } from '../utils/html.js';
import { contributionsApi, projectsApi, tasksApi } from '../api/client.js';
import { hooks } from '../utils/hooks.js';
import { toast } from '../utils/toast.js';
import { formatDate, formatDateTime, formatRelativeTime } from '../utils/datetime.js';
import CustomSelect from '../components/CustomSelect.js';
import FilterBar from '../components/FilterBar.js';
import ContributionDetailModal from '../components/ContributionDetailModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
import Loader from '../components/Loader.js';

function ContributionCard( { contribution, onRefresh, onPreview, onAccept, onRevoke, onTrashRequest, onRestore, onHardDelete } ) {
	const [ isMenuOpen, setIsMenuOpen ] = useState( false );
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const cleanContent = contribution.content ? contribution.content.replace( /<[^>]*>?/gm, '' ) : 'لا يوجد تفاصيل للمساهمة.';
	
	const descriptionStyle = {
		display: '-webkit-box',
		WebkitLineClamp: '2',
		WebkitBoxOrient: 'vertical',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		lineHeight: '1.5',
		minHeight: '3em',
		maxHeight: '3em'
	};

	const toggleMenu = ( e ) => {
		e.stopPropagation();
		setIsMenuOpen( ! isMenuOpen );
	};

	return html`
		<div className="box wp-card wp-project-card p-0 h-100 is-flex is-flex-direction-column" style=${{ position: 'relative', cursor: 'pointer' }} onClick=${ (e) => { if (contribution.is_pending_trash) { e.preventDefault(); return; } if (onPreview) onPreview(contribution); } }>
			${ contribution.is_pending_trash ? html`
				<div style=${{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 56, 96, 0.15)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(3px)' }} onClick=${(e) => e.stopPropagation()}>
					<div className="box has-text-centered p-4" style=${{ width: '100%', backgroundColor: '#ff3860', color: 'white', border: '1px solid #ff1f4b', boxShadow: '0 8px 24px rgba(255,56,96,0.3)', borderRadius: 0 }}>
						<span className="icon is-large mb-1"><i className="dashicons dashicons-warning" style=${{ fontSize: '36px', width: '36px', height: '36px' }}></i></span>
						<h4 className="title is-6 has-text-white mb-2">طلب حذف مساهمة</h4>
						<p className="is-size-7 mb-4" style=${{ opacity: 0.9 }}>
							<strong>السبب:</strong> ${ contribution.trash_reason || 'غير محدد' }
						</p>
						<div className="buttons is-centered">
							<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onRestore && onRestore(contribution); } }>
								<span className="icon"><i className="dashicons dashicons-undo"></i></span>
								<span>رفض واستعادة</span>
							</button>
							<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onHardDelete && onHardDelete(contribution); } }>
								<span className="icon"><i className="dashicons dashicons-trash"></i></span>
								<span>حذف نهائي</span>
							</button>
						</div>
					</div>
				</div>
			` : null }
			
			${ contribution.cover_url ? html`
				<figure className="image is-2by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
					<img src=${ contribution.cover_url } alt=${ contribution.task_title } style=${{ objectFit: 'cover' }} />
				</figure>
			` : html`
				<figure className="image is-2by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
					<div className="has-ratio has-background-dark is-flex is-align-items-center is-justify-content-center">
						<span className="icon is-large has-text-white-ter">
							<i className="dashicons dashicons-admin-comments" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
						</span>
					</div>
				</figure>
			` }
			
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column">
				<!-- Badges Row -->
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
					<span className=${`tag ${contribution.is_accepted ? 'is-success' : 'is-light'}`} style=${{ borderRadius: '0', fontWeight: 'bold' }}>
						${ contribution.is_accepted ? html`<i className="dashicons dashicons-yes-alt ml-1"></i> معتمد كحل` : ( contribution.type_label || 'مساهمة' ) }
					</span>
					<span className="is-size-7 has-text-grey" title=${ formatDateTime( contribution.created_at ) } style=${{ cursor: 'help' }}>
						${ formatDate( contribution.created_at, { hideYear: true } ) }
					</span>
				</div>

				${ contribution.project_name ? html`<span className="is-size-7 has-text-grey wp-text-truncate is-block mb-1">${ contribution.project_name }</span>` : '' }
				<h3 className="title is-5 mb-2">
					<a href=${`#/tasks/${contribution.task_id}`} className="has-text-dark">${ contribution.task_title }</a>
				</h3>
				
				<p className="subtitle is-6 has-text-grey mb-4" style=${descriptionStyle}>
					${ cleanContent }
				</p>

				${ contribution.attachments && contribution.attachments.length > 0 ? html`
					<div className="tags mb-3">
						<span className="tag is-info is-light is-small" style=${{ borderRadius: '0' }}>
							<span className="icon is-small ml-1"><i className="dashicons dashicons-paperclip"></i></span>
							<span>${ contribution.attachments.length } مرفقات</span>
						</span>
					</div>
				` : '' }
			</div>
			
			<!-- Combined Footer Bar -->
			<div className="p-3 is-flex is-justify-content-space-between is-align-items-center has-background-light mt-auto" style=${{ borderTop: '1px solid #ededed' }}>
				
				<!-- Right side: Author -->
				<div className="is-flex is-align-items-center">
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" style=${{ gap: '4px' }}>
						<span className="icon is-small ml-1"><i className=${`dashicons ${contribution.is_client ? 'dashicons-star-filled has-text-warning' : 'dashicons-admin-users'}`}></i></span> 
						<span>${ contribution.author_name || 'النظام' }</span>
						${ contribution.is_client ? html`
							<span className="tag is-warning is-light" style=${{ borderRadius: 0, fontWeight: '800', border: '1px solid #f59e0b', color: '#b45309', background: '#fffbeb', fontSize: '0.65rem', padding: '1px 5px', height: 'auto', marginRight: '4px' }}>
								مستفيد
							</span>
						` : null }
					</span>
				</div>

				<!-- Left side: Actions Dropdown -->
				<div className="is-flex is-align-items-center">
					<button className="button is-small wp-icon-button mr-1" onClick=${ (e) => { e.stopPropagation(); onPreview && onPreview(contribution); } } title="معاينة سريعة">
						<span className="icon"><i className="dashicons dashicons-visibility"></i></span>
					</button>
					<div ref=${dropdownRef} className=${`dropdown is-up ${isMenuOpen ? 'is-active' : ''}`} style=${{ zIndex: isMenuOpen ? 100 : 1 }}>
						<div className="dropdown-trigger">
							<button className="button is-small wp-icon-button" aria-haspopup="true" aria-controls="dropdown-menu" onClick=${toggleMenu} title="خيارات المساهمة">
								<span className="icon"><i className="dashicons dashicons-admin-generic"></i></span>
							</button>
						</div>
						<div className="dropdown-menu" id="dropdown-menu" role="menu">
							<div className="dropdown-content p-0" style=${{borderRadius: '0', border: '1px solid #ededed', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
								<a href=${`#/tasks/${contribution.task_id}`} className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" onClick=${ (e) => { e.stopPropagation(); setIsMenuOpen(false); } }>
									<span className="icon ml-2"><i className="dashicons dashicons-external"></i></span> <span>الانتقال للمهمة</span>
								</a>
							${ contribution.can_accept ? html`
								<hr className="dropdown-divider m-0" />
								${ contribution.is_accepted ? html`
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-warning" onClick=${ (e) => { e.stopPropagation(); setIsMenuOpen(false); onRevoke && onRevoke(contribution); } }>
										<span className="icon ml-2"><i className="dashicons dashicons-dismiss"></i></span> <span>إلغاء الاعتماد</span>
									</a>
								` : html`
									<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-success" onClick=${ (e) => { e.stopPropagation(); setIsMenuOpen(false); onAccept && onAccept(contribution); } }>
										<span className="icon ml-2"><i className="dashicons dashicons-yes-alt"></i></span> <span>اعتماد كحل واكتمال المهمة</span>
									</a>
								` }
							` : null }
							${ ! contribution.is_accepted ? html`
								<hr className="dropdown-divider m-0" />
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-danger" onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false); onTrashRequest && onTrashRequest(contribution); } }>
									<span className="icon ml-2"><i className="dashicons dashicons-trash"></i></span> <span>حذف المساهمة</span>
								</a>
							` : null }
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	`;
}

export default function ContributionsPage({ refreshKey }) {
	const [ contributions, setContributions ] = useState( [] );
	const [ projects, setProjects ] = useState( [] );
	const [ tasks, setTasks ] = useState( [] );
	const [ availableTypes, setAvailableTypes ] = useState( [] );
	const [ users, setUsers ] = useState( [] );
	
	// Filters State
	const [ selectedProject, setSelectedProject ] = useState( '' );
	const [ selectedTask, setSelectedTask ] = useState( '' );
	const [ selectedType, setSelectedType ] = useState( 'all' ); // 'all' | 'work' | type_slug
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' ); // 'all' | 'accepted' | 'pending'
	const [ selectedAuthor, setSelectedAuthor ] = useState( '' );
	const [ searchQuery, setSearchQuery ] = useState( '' );

	const [ isLoading, setIsLoading ] = useState( true );
	const [ isPreviewModalOpen, setIsPreviewModalOpen ] = useState( false );
	const [ previewContribution, setPreviewContribution ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );
	
	// Fetch Projects, Tasks, Types, and Users on mount
	useEffect( () => {
		projectsApi.list().then( data => {
			setProjects( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		tasksApi.list().then( data => {
			setTasks( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		contributionsApi.types.list().then( data => {
			setAvailableTypes( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );

		window.wp.apiFetch( { path: '/wp/v2/users?per_page=100' } ).then( data => {
			setUsers( Array.isArray( data ) ? data : [] );
		} ).catch( console.error );
	}, [] );

	const fetchContributions = () => {
		setIsLoading( true );
		
		const filters = {};
		if ( selectedProject ) {
			filters.project_id = selectedProject;
		}
		if ( selectedTask ) {
			filters.task_id = selectedTask;
		}
		if ( selectedAuthor ) {
			filters.user_id = selectedAuthor;
		}
		if ( searchQuery.trim() ) {
			filters.search = searchQuery.trim();
		}

		if ( selectedStatus === 'accepted' ) {
			filters.is_accepted = '1';
		} else if ( selectedStatus === 'pending' ) {
			filters.is_accepted = '0';
		}

		if ( selectedType === 'work' ) {
			filters.type_not_in = 'state_change,assignment,trash_request';
		} else if ( selectedType === 'system' ) {
			filters.type_in = 'state_change,assignment,trash_request';
		} else if ( selectedType !== 'all' ) {
			filters.type_in = selectedType;
		}

		contributionsApi.list( filters ).then( data => {
			setContributions( Array.isArray( data ) ? data : [] );
			setIsLoading( false );
		} ).catch( err => {
			console.error( err );
			setIsLoading( false );
		} );
	};

	useEffect( () => {
		const timer = setTimeout( () => {
			fetchContributions();
		}, searchQuery ? 300 : 0 );
		return () => clearTimeout( timer );
	}, [ selectedProject, selectedTask, selectedType, selectedStatus, selectedAuthor, searchQuery, refreshKey ] );

	const handleAccept = ( contribution ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'اعتماد المساهمة كحل رسمي للمهمة',
			message: `هل أنت متأكد من اعتماد هذه المساهمة كحل رسمي للمهمة "${contribution.task_title}"؟ سيؤدي ذلك تلقائياً إلى اكتمال وإغلاق المهمة وإضافتها لمكتبة المعرفة.`,
			confirmText: 'اعتماد واكتمال المهمة',
			confirmColor: 'is-success',
			isDangerous: false,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				contributionsApi.accept( contribution.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم اعتماد الحل واكتمال المهمة بنجاح', 'success' );
						fetchContributions();
						hooks.doAction('workpress_refresh_notifications');
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء اعتماد المساهمة', 'danger' );
					} );
			}
		});
	};

	const handleRevoke = ( contribution ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'إلغاء اعتماد الحل',
			message: `هل أنت متأكد من إلغاء اعتماد هذا الحل؟ ستتم إعادة فتح المهمة "${contribution.task_title}" للمراجعة وسحب المساهمة من مكتبة المعرفة.`,
			confirmText: 'إلغاء الاعتماد وإعادة الفتح',
			confirmColor: 'is-warning',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				contributionsApi.revoke( contribution.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم إلغاء اعتماد الحل وإعادة فتح المهمة للمراجعة', 'info' );
						fetchContributions();
						hooks.doAction('workpress_refresh_notifications');
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'danger' );
					} );
			}
		});
	};

	const handleTrashRequest = ( contribution ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'طلب حذف مساهمة',
			message: `هل أنت متأكد من رغبتك في طلب حذف هذه المساهمة التابعة لمهمة "${contribution.task_title}"؟`,
			confirmText: 'إرسال الطلب',
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: 'سبب حذف المساهمة',
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				contributionsApi.trashRequest( contribution.id, reason )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم إرسال طلب حذف المساهمة بنجاح', 'info' );
						fetchContributions();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء طلب الحذف', 'danger' );
					} );
			}
		});
	};

	const handleRestore = ( contribution ) => {
		// Optimistic update
		setContributions( prev => prev.map( c => c.id === contribution.id ? { ...c, is_pending_trash: false } : c ) );
		contributionsApi.update( contribution.id, { is_pending_trash: false } )
			.then( () => {
				toast( 'تمت استعادة المساهمة بنجاح', 'success' );
				fetchContributions();
			} )
			.catch( err => {
				toast( err.message || 'حدث خطأ أثناء استعادة المساهمة', 'danger' );
				fetchContributions();
			} );
	};

	const handleHardDelete = ( contribution ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'تأكيد الحذف النهائي للمساهمة',
			message: `هل أنت متأكد من حذف هذه المساهمة ونقلها لسلة المهملات؟`,
			confirmText: 'حذف',
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				// Optimistic update
				setContributions( prev => prev.filter( c => c.id !== contribution.id ) );
				contributionsApi.delete( contribution.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم حذف المساهمة بنجاح', 'success' );
						fetchContributions();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء الحذف', 'danger' );
						fetchContributions();
					} );
			}
		});
	};

	// Options for Dropdowns
	const projectOptions = [
		{ value: '', label: '-- جميع المشاريع --' },
		...projects.map( p => ({ value: p.id, label: p.name }) )
	];

	const filteredTasks = selectedProject
		? tasks.filter( t => String(t.project_id) === String(selectedProject) )
		: tasks;

	const taskOptions = [
		{ value: '', label: '-- جميع المهام --' },
		...filteredTasks.map( t => ({ value: t.id, label: t.title }) )
	];

	const authorOptions = [
		{ value: '', label: '-- جميع الأعضاء --' },
		...users.map( u => ({ value: u.id, label: u.name }) )
	];

	const statusOptions = [
		{ value: 'all', label: 'جميع الحالات' },
		{ value: 'accepted', label: 'معتمد كحل ومعرفة' },
		{ value: 'pending', label: 'قيد المراجعة والنقاش' }
	];

	const typeOptions = [
		{ value: 'all', label: 'جميع المساهمات والأنشطة' },
		{ value: 'work', label: 'أعمال الفريق (استبعاد النظام)' },
		...availableTypes.map( t => ({
			value: t.key,
			label: `${t.label}${t.is_system ? ' (نظام)' : ''}`
		}) )
	];

	const isFilterActive = selectedProject || selectedTask || selectedType !== 'all' || selectedStatus !== 'all' || selectedAuthor || searchQuery;

	const handleResetFilters = () => {
		setSelectedProject('');
		setSelectedTask('');
		setSelectedType('all');
		setSelectedStatus('all');
		setSelectedAuthor('');
		setSearchQuery('');
	};

	return html`
		<div>
			<${FilterBar}
				search=${{
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: 'بحث في تفاصيل ونصوص المساهمات...',
				}}
				filters=${[
					{
						key: 'project',
						label: 'المشروع',
						icon: 'dashicons-category',
						value: selectedProject,
						onChange: (val) => { setSelectedProject(val); setSelectedTask(''); },
						options: projectOptions,
						isCustomSelect: true,
						width: '160px',
					},
					{
						key: 'task',
						label: 'المهمة',
						icon: 'dashicons-clipboard',
						value: selectedTask,
						onChange: setSelectedTask,
						options: taskOptions,
						isCustomSelect: true,
						width: '160px',
					},
					{
						key: 'type',
						label: 'النوع',
						icon: 'dashicons-filter',
						value: selectedType,
						onChange: setSelectedType,
						options: typeOptions,
						isCustomSelect: true,
						width: '160px',
					},
					{
						key: 'status',
						label: 'الحالة',
						icon: 'dashicons-yes-alt',
						value: selectedStatus,
						onChange: setSelectedStatus,
						options: statusOptions,
						isCustomSelect: true,
						width: '150px',
					},
					{
						key: 'author',
						label: 'الكاتب',
						icon: 'dashicons-admin-users',
						value: selectedAuthor,
						onChange: setSelectedAuthor,
						options: authorOptions,
						isCustomSelect: true,
						width: '150px',
					}
				]}
				totalCount=${ contributions.length }
				counterLabel="مساهمة"
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			<!-- Contributions Cards Grid -->
			${ isLoading ? html`
				<div className="py-6 mt-4">
					<${Loader} center=${true} label="جاري تحميل سجل المساهمات..." size="large" />
				</div>
			` : html`
				<div className="columns is-multiline">
					${ contributions.map( item => html`
						<div key=${ item.id } className="column is-4">
							<${ContributionCard} 
								contribution=${ item } 
								onRefresh=${ fetchContributions } 
								onPreview=${ (c) => { setPreviewContribution(c); setIsPreviewModalOpen(true); } }
								onAccept=${ handleAccept }
								onRevoke=${ handleRevoke }
								onTrashRequest=${ handleTrashRequest }
								onRestore=${ handleRestore }
								onHardDelete=${ handleHardDelete }
							/>
						</div>
					` ) }
					
					${ contributions.length === 0 && html`
						<div className="column is-12">
							<div className="box has-text-centered p-6 wp-card" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
								<div className="mb-3" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
									<i className="dashicons dashicons-share-alt2 has-text-info" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
								</div>
								<h3 className="title is-5 mb-2 has-text-weight-bold has-text-dark">
									${ isFilterActive ? 'لا توجد مساهمات مطابقة للفلاتر المحددة' : 'سجل المساهمات فارغ حالياً' }
								</h3>
								<p className="has-text-grey is-size-6 mb-5" style=${{ maxWidth: '480px', margin: '0 auto' }}>
									${ isFilterActive 
										? 'جرّب تعديل الفلاتر أو البحث للوصول إلى المساهمات المستهدفة.' 
										: 'المساهمات هي الأدلة الفنية وحلول المشكلات التي يقدمها أعضاء الفريق للمهام المشتركة.' }
								</p>
								${ isFilterActive && html`
									<button className="button is-light wp-sharp-button" onClick=${ handleResetFilters }>
										<span className="icon"><i className="dashicons dashicons-image-rotate"></i></span>
										<span>إعادة ضبط الفلاتر</span>
									</button>
								` }
							</div>
						</div>
					` }
				</div>
			` }
			
			<${ContributionDetailModal}
				isActive=${ isPreviewModalOpen }
				onClose=${ () => { setIsPreviewModalOpen(false); setPreviewContribution(null); } }
				contribution=${ previewContribution }
				onStatusChange=${ fetchContributions }
			/>

			<${ConfirmModal}
				isActive=${ confirmModalConfig.isActive }
				title=${ confirmModalConfig.title }
				message=${ confirmModalConfig.message }
				confirmText=${ confirmModalConfig.confirmText }
				confirmColor=${ confirmModalConfig.confirmColor }
				isDangerous=${ confirmModalConfig.isDangerous }
				requiresReason=${ confirmModalConfig.requiresReason }
				reasonLabel=${ confirmModalConfig.reasonLabel }
				isSubmitting=${ confirmModalConfig.isSubmitting }
				onConfirm=${ confirmModalConfig.onConfirm }
				onCancel=${ () => setConfirmModalConfig({ isActive: false }) }
			/>
		</div>
	`;
}
