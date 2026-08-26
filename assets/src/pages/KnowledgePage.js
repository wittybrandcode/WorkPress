import { html, useState, useEffect, useRef } from '../utils/html.js';
import { knowledgeApi, contributionsApi, projectsApi } from '../api/client.js';
import ContributionDetailModal from '../components/ContributionDetailModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
import FilterBar from '../components/FilterBar.js';
import Loader from '../components/Loader.js';
import { toast } from '../utils/toast.js';
import { hooks } from '../utils/hooks.js';

function KnowledgeCard( { item, onPreview, onRevoke, onRestore, onHardDelete, onTrashRequest } ) {
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

	const cleanContent = item.content ? item.content.replace( /<[^>]*>?/gm, '' ) : 'لا يوجد محتوى معرفة.';
	
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

	const copyLink = ( e ) => {
		e.preventDefault();
		setIsMenuOpen( false );
		const url = `${window.location.origin}${window.location.pathname}#/tasks/${item.task_id}`;
		navigator.clipboard.writeText( url ).then( () => {
			toast( 'تم نسخ رابط الحل المعرفي بنجاح!', 'success' );
		} );
	};

	return html`
		<div className="box wp-card wp-project-card p-0 h-100 is-flex is-flex-direction-column" style=${{ position: 'relative', cursor: 'pointer' }} onClick=${ (e) => { if (item.is_pending_trash) { e.preventDefault(); return; } if (onPreview) onPreview(item); } }>
			${ item.is_pending_trash ? html`
				<div style=${{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 56, 96, 0.15)', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', backdropFilter: 'blur(3px)' }} onClick=${(e) => e.stopPropagation()}>
					<div className="box has-text-centered p-4" style=${{ width: '100%', backgroundColor: '#ff3860', color: 'white', border: '1px solid #ff1f4b', boxShadow: '0 8px 24px rgba(255,56,96,0.3)', borderRadius: 0 }}>
						<span className="icon is-large mb-1"><i className="dashicons dashicons-warning" style=${{ fontSize: '36px', width: '36px', height: '36px' }}></i></span>
						<h4 className="title is-6 has-text-white mb-2">طلب حذف معرفة</h4>
						<p className="is-size-7 mb-4" style=${{ opacity: 0.9 }}>
							<strong>السبب:</strong> ${ item.trash_reason || 'غير محدد' }
						</p>
						<div className="buttons is-centered">
							<button className="button is-small is-white is-outlined wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onRestore && onRestore(item); } }>
								<span className="icon"><i className="dashicons dashicons-undo"></i></span>
								<span>رفض واستعادة</span>
							</button>
							<button className="button is-small is-white has-text-danger has-text-weight-bold wp-sharp-button" onClick=${ (e) => { e.stopPropagation(); onHardDelete && onHardDelete(item); } }>
								<span className="icon"><i className="dashicons dashicons-trash"></i></span>
								<span>حذف نهائي</span>
							</button>
						</div>
					</div>
				</div>
			` : null }
			${ item.cover_url ? html`
				<figure className="image is-2by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
					<img src=${ item.cover_url } alt=${ item.task_title } style=${{ objectFit: 'cover' }} />
				</figure>
			` : html`
				<figure className="image is-2by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
					<div className="has-ratio has-background-dark is-flex is-align-items-center is-justify-content-center">
						<span className="icon is-large has-text-white-ter">
							<i className="dashicons dashicons-book" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
						</span>
					</div>
				</figure>
			`}
			
			<div className="p-4 is-flex-grow-1 is-flex is-flex-direction-column">
				<!-- Badges Row -->
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
					<span className="tag is-success" style=${{ borderRadius: '0', fontWeight: 'bold' }}>
						<i className="dashicons dashicons-yes-alt ml-1"></i> معرفة معتمدة
					</span>
					<span className="tag is-light" style=${{ borderRadius: '0', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 'bold' }}>
						${ item.type_label || 'حل معتمد' }
					</span>
				</div>

				${ item.project_name ? html`<span className="is-size-7 has-text-grey wp-text-truncate is-block mb-1">${ item.project_name }</span>` : '' }
				<h3 className="title is-4 mb-2">
					<a href=${`#/tasks/${item.task_id}`} className="has-text-dark">${ item.task_title }</a>
				</h3>
				
				<p className="subtitle is-6 has-text-grey mb-4" style=${descriptionStyle}>
					${ cleanContent }
				</p>
			</div>
			
			<!-- Combined Footer Bar -->
			<div className="p-3 is-flex is-justify-content-space-between is-align-items-center has-background-light mt-auto" style=${{ borderTop: '1px solid #ededed' }}>
				
				<!-- Right side: Stats & Author -->
				<div className="is-flex is-align-items-center" style=${{ gap: '16px' }}>
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" title="صاحب الحل">
						<span className="icon is-small ml-1"><i className="dashicons dashicons-admin-users"></i></span> 
						<span>${ item.author_name || 'النظام' }</span>
					</span>
					<span className="is-size-7 has-text-weight-bold has-text-grey is-flex is-align-items-center" title="الحالة">
						<span className="icon is-small ml-1"><i className="dashicons dashicons-awards"></i></span> 
						<span>معتمد</span>
					</span>
				</div>

				<!-- Left side: Actions Dropdown -->
				<div className="is-flex is-align-items-center">
					<button className="button is-small wp-icon-button mr-1" onClick=${ (e) => { e.stopPropagation(); onPreview && onPreview(item); } } title="معاينة سريعة">
						<span className="icon"><i className="dashicons dashicons-visibility"></i></span>
					</button>
					<div ref=${dropdownRef} className=${`dropdown is-up ${isMenuOpen ? 'is-active' : ''}`} style=${{ zIndex: isMenuOpen ? 100 : 1 }}>
						<div className="dropdown-trigger">
							<button className="button is-small wp-icon-button" aria-haspopup="true" aria-controls="dropdown-menu" onClick=${toggleMenu} title="خيارات المعرفة">
								<span className="icon"><i className="dashicons dashicons-admin-generic"></i></span>
							</button>
						</div>
						<div className="dropdown-menu" id="dropdown-menu" role="menu">
							<div className="dropdown-content p-0" style=${{borderRadius: '0', border: '1px solid #ededed', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
								<a href=${`#/tasks/${item.task_id}`} className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" onClick=${ (e) => { e.stopPropagation(); setIsMenuOpen(false); } }>
									<span className="icon ml-2"><i className="dashicons dashicons-external"></i></span> <span>عرض الحل بالمهمة</span>
								</a>
							<hr className="dropdown-divider m-0" />
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7" onClick=${ (e) => { e.stopPropagation(); copyLink(e); } }>
									<span className="icon ml-2"><i className="dashicons dashicons-admin-links"></i></span> <span>نسخ رابط الحل</span>
								</a>
							${ item.can_accept ? html`
								<hr className="dropdown-divider m-0" />
								<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-warning" onClick=${ (e) => { e.stopPropagation(); setIsMenuOpen(false); onRevoke && onRevoke(item); } }>
									<span className="icon ml-2"><i className="dashicons dashicons-undo"></i></span> <span>إلغاء الاعتماد المعرفي</span>
								</a>
							` : null }
							<hr className="dropdown-divider m-0" />
							<a className="dropdown-item wp-dropdown-item is-flex is-align-items-center py-2 is-size-7 has-text-danger" onClick=${ (e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(false); onTrashRequest && onTrashRequest(item); } }>
								<span className="icon ml-2"><i className="dashicons dashicons-trash"></i></span> <span>حذف المعرفة (المساهمة)</span>
							</a>
						</div>
					</div>
				</div>
			</div>
			</div>
		</div>
	`;
}

export default function KnowledgePage({ refreshKey }) {
	const [ knowledgeItems, setKnowledgeItems ] = useState( [] );
	const [ projects, setProjects ] = useState( [] );
	const [ availableTypes, setAvailableTypes ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isPreviewModalOpen, setIsPreviewModalOpen ] = useState( false );
	const [ previewItem, setPreviewItem ] = useState( null );
	const [ confirmModalConfig, setConfirmModalConfig ] = useState( { isActive: false } );
	
	// Filter States
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ selectedProject, setSelectedProject ] = useState( '' );
	const [ selectedType, setSelectedType ] = useState( 'all' );

	useEffect( () => {
		projectsApi.list().then( data => {
			setProjects( Array.isArray( data ) ? data : ( data.items || [] ) );
		} ).catch( () => {} );

		contributionsApi.types.list().then( data => {
			setAvailableTypes( Array.isArray( data ) ? data : [] );
		} ).catch( () => {} );
	}, [] );

	const fetchKnowledge = () => {
		setIsLoading( true );
		knowledgeApi.list().then( data => {
			setKnowledgeItems( Array.isArray( data ) ? data : [] );
			setIsLoading( false );
		} ).catch( err => {
			console.error( err );
			setIsLoading( false );
		} );
	};

	useEffect( () => {
		fetchKnowledge();
	}, [refreshKey] );

	const handleRevoke = ( item ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'إلغاء اعتماد الحل وسحبه من المعرفة',
			message: `هل أنت متأكد من إلغاء اعتماد هذا الحل التابع للمهمة "${item.task_title}"؟ ستتم إعادة فتح المهمة للمراجعة وسحب المساهمة من مكتبة المعرفة.`,
			confirmText: 'إلغاء الاعتماد وإعادة الفتح',
			confirmColor: 'is-warning',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				contributionsApi.revoke( item.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم إلغاء الاعتماد وسحب الحل من المعرفة بنجاح', 'info' );
						fetchKnowledge();
						hooks.doAction('workpress_refresh_notifications');
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء إلغاء الاعتماد', 'danger' );
					} );
			}
		});
	};

	const handleTrashRequest = ( item ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'طلب حذف معرفة معتمدة',
			message: `هل أنت متأكد من رغبتك في طلب حذف المعرفة الخاصة بمهمة "${item.task_title}"؟`,
			confirmText: 'إرسال الطلب',
			confirmColor: 'is-warning',
			isDangerous: false,
			requiresReason: true,
			reasonLabel: 'سبب حذف المعرفة',
			isSubmitting: false,
			onConfirm: ( reason ) => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				contributionsApi.trashRequest( item.id, reason )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم إرسال طلب حذف المعرفة بنجاح', 'info' );
						fetchKnowledge();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء طلب الحذف', 'danger' );
					} );
			}
		});
	};

	const handleRestore = ( item ) => {
		// Optimistic update
		setKnowledgeItems( prev => prev.map( k => k.id === item.id ? { ...k, is_pending_trash: false } : k ) );
		contributionsApi.update( item.id, { is_pending_trash: false } )
			.then( () => {
				toast( 'تمت استعادة المعرفة بنجاح', 'success' );
				fetchKnowledge();
			} )
			.catch( err => {
				toast( err.message || 'حدث خطأ أثناء استعادة المعرفة', 'danger' );
				fetchKnowledge();
			} );
	};

	const handleHardDelete = ( item ) => {
		setConfirmModalConfig({
			isActive: true,
			title: 'تأكيد الحذف النهائي للمعرفة',
			message: `هل أنت متأكد من حذف هذه المعرفة ونقلها لسلة المهملات؟`,
			confirmText: 'حذف',
			confirmColor: 'is-danger',
			isDangerous: true,
			requiresReason: false,
			isSubmitting: false,
			onConfirm: () => {
				setConfirmModalConfig( prev => ({ ...prev, isSubmitting: true }) );
				// Optimistic update
				setKnowledgeItems( prev => prev.filter( k => k.id !== item.id ) );
				contributionsApi.delete( item.id )
					.then( () => {
						setConfirmModalConfig({ isActive: false });
						toast( 'تم حذف المعرفة بنجاح', 'success' );
						fetchKnowledge();
					} )
					.catch( err => {
						setConfirmModalConfig( prev => ({ ...prev, isSubmitting: false }) );
						toast( err.message || 'حدث خطأ أثناء الحذف', 'danger' );
						fetchKnowledge();
					} );
			}
		});
	};

	const projectOptions = [
		{ value: '', label: '-- جميع المشاريع --' },
		...projects.map( p => ({ value: p.id, label: p.name }) )
	];

	const typeOptions = [
		{ value: 'all', label: '-- جميع الأنواع --' },
		...availableTypes.map( t => ({ value: t.key, label: t.label }) )
	];

	const isFilterActive = Boolean( searchQuery || selectedProject || selectedType !== 'all' );

	const handleResetFilters = () => {
		setSearchQuery( '' );
		setSelectedProject( '' );
		setSelectedType( 'all' );
	};

	const filteredKnowledgeItems = knowledgeItems.filter( item => {
		if ( searchQuery ) {
			const q = searchQuery.toLowerCase();
			const matchTitle = ( item.task_title || '' ).toLowerCase().includes( q );
			const matchContent = ( item.content || '' ).toLowerCase().includes( q );
			const matchAuthor = ( item.author_name || '' ).toLowerCase().includes( q );
			const matchProject = ( item.project_name || '' ).toLowerCase().includes( q );
			if ( ! matchTitle && ! matchContent && ! matchAuthor && ! matchProject ) return false;
		}
		if ( selectedProject ) {
			if ( String( item.project_id ) !== String( selectedProject ) ) return false;
		}
		if ( selectedType !== 'all' ) {
			if ( item.type !== selectedType ) return false;
		}
		return true;
	} );

	return html`
		<div>
			<${FilterBar}
				search=${{
					value: searchQuery,
					onChange: setSearchQuery,
					placeholder: 'بحث في قواعد المعرفة والحلول المعتمدة...',
				}}
				filters=${[
					{
						key: 'project',
						label: 'المشروع',
						icon: 'dashicons-category',
						value: selectedProject,
						onChange: setSelectedProject,
						options: projectOptions,
						isCustomSelect: true,
						width: '180px',
					},
					{
						key: 'type',
						label: 'نوع الحل',
						icon: 'dashicons-star-filled',
						value: selectedType,
						onChange: setSelectedType,
						options: typeOptions,
						width: '150px',
					}
				]}
				totalCount=${ filteredKnowledgeItems.length }
				totalUnfiltered=${ knowledgeItems.length }
				counterLabel="حل معتمد"
				isFilterActive=${ isFilterActive }
				onReset=${ handleResetFilters }
			/>

			${ isLoading ? html`
				<div className="py-6 mt-4">
					<${Loader} center=${true} label="جاري تحميل مكتبة المعرفة..." size="large" />
				</div>
			` : html`
				<div className="columns is-multiline">
					${ filteredKnowledgeItems.map( item => html`
						<div key=${ item.id } className="column is-4">
							<${KnowledgeCard} 
								item=${ item } 
								onPreview=${ (k) => { setPreviewItem(k); setIsPreviewModalOpen(true); } }
								onRevoke=${ handleRevoke }
								onTrashRequest=${ handleTrashRequest }
								onRestore=${ handleRestore }
								onHardDelete=${ handleHardDelete }
							/>
						</div>
					` ) }
					
					${ filteredKnowledgeItems.length === 0 && html`
						<div className="column is-12">
							<div className="box has-text-centered p-6 wp-card" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
								<div className="mb-3" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
									<i className="dashicons dashicons-book has-text-success" style=${{ fontSize: '32px', width: '32px', height: '32px' }}></i>
								</div>
								<h3 className="title is-5 mb-2 has-text-weight-bold has-text-dark">
									${ isFilterActive ? 'لا توجد حلول معرفية مطابقة لمعايير البحث' : 'مكتبة المعرفة المؤسسية خالية حالياً' }
								</h3>
								<p className="has-text-grey is-size-6 mb-5" style=${{ maxWidth: '480px', margin: '0 auto' }}>
									${ isFilterActive 
										? 'جرّب تغيير كلمات البحث أو إعادة ضبط الفلاتر للعثور على الحلول المعرفية.' 
										: 'يتم بناء الذاكرة المعرفية تلقائياً عندما يعتمد قائد المشروع حلاً مقدماً لأي مهمة، ليصبح مرجعاً دائماً لكافة أعضاء الفريق.' }
								</p>
								${ isFilterActive ? html`
									<button className="button is-light wp-sharp-button" onClick=${ handleResetFilters }>
										<span className="icon"><i className="dashicons dashicons-image-rotate"></i></span>
										<span>إعادة ضبط الفلاتر</span>
									</button>
								` : html`
									<a href="#/tasks" className="button is-primary wp-sharp-button">
										<span className="icon"><i className="dashicons dashicons-clipboard"></i></span>
										<span>استعراض المهام المفتوحة للمساهمة</span>
									</a>
								` }
							</div>
						</div>
					` }
				</div>
			` }
			
			<${ContributionDetailModal}
				isActive=${ isPreviewModalOpen }
				onClose=${ () => { setIsPreviewModalOpen(false); setPreviewItem(null); } }
				contribution=${ previewItem }
				onStatusChange=${ fetchKnowledge }
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
