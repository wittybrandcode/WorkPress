import { html, useState, useEffect, useRef, createPortal } from '../utils/html.js';
import { projectsApi, usersApi } from '../api/client.js';
import Loader from '../components/Loader.js';
import MemberSelect from '../components/MemberSelect.js';
import { isStaffUser } from '../utils/userScope.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function RequestsPage({ refreshKey }) {
	const [ projects, setProjects ] = useState( null );
	const [ users, setUsers ] = useState( [] );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' );
	const [ selectedFormFilter, setSelectedFormFilter ] = useState( 'all' );
	const [ selectedSort, setSelectedSort ] = useState( 'newest' );
	const [ viewMode, setViewMode ] = useState( 'cards' ); // 'cards' | 'kanban' | 'table'
	const [ approvingProject, setApprovingProject ] = useState( null );
	const [ selectedLeadId, setSelectedLeadId ] = useState( '' );
	const [ approvedBudget, setApprovedBudget ] = useState( '' );
	const [ approvedDueDate, setApprovedDueDate ] = useState( '' );
	const [ isApproving, setIsApproving ] = useState( false );

	const [ reviewingProject, setReviewingProject ] = useState( null );
	const [ reviewNotes, setReviewNotes ] = useState( '' );
	const [ isReviewing, setIsReviewing ] = useState( false );

	const [ rejectingProject, setRejectingProject ] = useState( null );
	const [ rejectionReason, setRejectionReason ] = useState( '' );
	const [ isRejecting, setIsRejecting ] = useState( false );

	const fetchProjects = async () => {
		try {
			const res = await projectsApi.list();
			const all = Array.isArray( res ) ? res : ( res.items || [] );
			// Filter to client requests only
			const clientRequests = all.filter( p => p.is_client_request || p.request_form_id || ( p.request_specs && Object.keys( p.request_specs ).length > 0 ) );
			setProjects( clientRequests );
		} catch ( err ) {
			console.error( 'Fetch requests error:', err );
			setProjects( [] );
		}
	};

	const fetchUsers = async () => {
		try {
			const uList = await usersApi.list( { roles: 'administrator,editor,author,contributor' } );
			const allUsers = Array.isArray( uList ) ? uList : [];
			// Strictly isolate and exclude clients from technical project leads/members
			const teamUsers = allUsers.filter( isStaffUser );
			setUsers( teamUsers );
		} catch ( err ) {
			console.error( 'Fetch users error:', err );
			setUsers( [] );
		}
	};

	useEffect( () => {
		fetchProjects();
		fetchUsers();
	}, [ refreshKey ] );

	// Smart background polling
	useEffect( () => {
		const interval = setInterval( () => {
			if ( ! approvingProject && ! reviewingProject && ! rejectingProject ) {
				fetchProjects();
			}
		}, 10000 );
		return () => clearInterval( interval );
	}, [ approvingProject, reviewingProject, rejectingProject ] );

	const handleOpenApproveModal = ( project ) => {
		setApprovingProject( project );
		setSelectedLeadId( project.lead_id || '' );
		setApprovedBudget( project.requested_budget || '' );
		setApprovedDueDate( project.requested_due_date || project.due_at || '' );
		sound.play( 'button' );
	};

	const handleConfirmApprove = async () => {
		if ( ! approvingProject ) return;
		setIsApproving( true );

		try {
			await projectsApi.update( approvingProject.id, {
				status: 'active',
				lead_id: selectedLeadId ? parseInt( selectedLeadId, 10 ) : undefined,
				due_at: approvedDueDate || undefined,
			} );

			sound.play( 'celebration' );
			toast( `تم اعتماد وتأسيس المشروع «${approvingProject.name}» بنجاح`, 'success' );
			setApprovingProject( null );
			setIsApproving( false );
			fetchProjects();
		} catch ( err ) {
			sound.play( 'caution' );
			toast( err.message || 'فشل اعتماد المشروع، يرجى المحاولة ثانية.', 'danger' );
			setIsApproving( false );
		}
	};

	const handleOpenReviewModal = ( project ) => {
		setReviewingProject( project );
		setReviewNotes( project.review_notes || '' );
		sound.play( 'button' );
	};

	const handleConfirmReview = async () => {
		if ( ! reviewingProject ) return;
		setIsReviewing( true );
		try {
			await projectsApi.update( reviewingProject.id, {
				status: 'under_review',
				review_notes: reviewNotes,
			} );
			sound.play( 'button' );
			toast( `تم تحويل الطلب «${reviewingProject.name}» إلى قيد الدراسة وإشعار العميل مع التبرير`, 'info' );
			setReviewingProject( null );
			setIsReviewing( false );
			fetchProjects();
		} catch ( err ) {
			sound.play( 'caution' );
			toast( err.message || 'فشل تحديث حالة الطلب', 'danger' );
			setIsReviewing( false );
		}
	};

	const handleOpenRejectModal = ( project ) => {
		setRejectingProject( project );
		setRejectionReason( project.rejection_reason || '' );
		sound.play( 'caution' );
	};

	const handleConfirmReject = async () => {
		if ( ! rejectingProject ) return;
		setIsRejecting( true );
		try {
			await projectsApi.update( rejectingProject.id, {
				status: 'rejected',
				rejection_reason: rejectionReason,
			} );
			sound.play( 'caution' );
			toast( `تم رفض الطلب «${rejectingProject.name}» وتسجيل المبررات وإشعار العميل`, 'warning' );
			setRejectingProject( null );
			setIsRejecting( false );
			fetchProjects();
		} catch ( err ) {
			sound.play( 'caution' );
			toast( err.message || 'فشل تسجيل رفض الطلب', 'danger' );
			setIsRejecting( false );
		}
	};

	const handleQuickStateChange = async ( projectId, newStatus ) => {
		try {
			await projectsApi.update( projectId, { status: newStatus } );
			sound.play( newStatus === 'active' ? 'celebration' : 'button' );
			toast( `تم تحديث حالة الطلب إلى: ${newStatus === 'active' ? 'معتمد ونشط' : (newStatus === 'under_review' ? 'قيد الدراسة' : (newStatus === 'rejected' ? 'مرفوض' : 'قيد المراجعة'))}`, 'success' );
			fetchProjects();
		} catch ( err ) {
			sound.play( 'caution' );
			toast( err.message || 'فشل تحديث الحالة', 'danger' );
		}
	};

	if ( projects === null ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="جاري تحميل محرك فرز طلبات العملاء..." size="large" />
			</div>
		`;
	}

	const totalRequests = projects.length;
	const pendingRequests = projects.filter( p => p.status === 'pending' || p.status === 'draft' );
	const underReviewRequests = projects.filter( p => p.status === 'under_review' );
	const activeRequests = projects.filter( p => p.status === 'active' );
	const completedRequests = projects.filter( p => p.status === 'completed' );
	const rejectedRequests = projects.filter( p => p.status === 'rejected' );

	// Distinct Form IDs for Filtering
	const uniqueForms = Array.from( new Set( projects.map( p => p.request_form_id ).filter( Boolean ) ) );

	const filteredRequests = projects.filter( p => {
		if ( searchQuery ) {
			const q = searchQuery.toLowerCase();
			const matchName = p.name && p.name.toLowerCase().includes( q );
			const matchClient = p.client && p.client.display_name && p.client.display_name.toLowerCase().includes( q );
			const matchEmail = p.client && p.client.email && p.client.email.toLowerCase().includes( q );
			const matchDesc = p.description && p.description.toLowerCase().includes( q );
			const matchPrefix = p.prefix && p.prefix.toLowerCase().includes( q );
			if ( ! matchName && ! matchClient && ! matchEmail && ! matchDesc && ! matchPrefix ) return false;
		}
		if ( selectedStatus === 'pending' ) {
			if ( p.status !== 'pending' && p.status !== 'draft' ) return false;
		} else if ( selectedStatus === 'under_review' ) {
			if ( p.status !== 'under_review' ) return false;
		} else if ( selectedStatus === 'active' ) {
			if ( p.status !== 'active' ) return false;
		} else if ( selectedStatus === 'completed' ) {
			if ( p.status !== 'completed' ) return false;
		} else if ( selectedStatus === 'rejected' ) {
			if ( p.status !== 'rejected' ) return false;
		}

		if ( selectedFormFilter !== 'all' ) {
			if ( p.request_form_id !== selectedFormFilter ) return false;
		}

		return true;
	} );

	// Sorting logic
	filteredRequests.sort( ( a, b ) => {
		if ( selectedSort === 'oldest' ) return a.id - b.id;
		if ( selectedSort === 'deadline' ) {
			const da = a.requested_due_date || a.due_at || '9999';
			const db = b.requested_due_date || b.due_at || '9999';
			return da.localeCompare( db );
		}
		// default newest
		return b.id - a.id;
	} );

	// Portal root for sticky top filter toolbar
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const topToolbarContent = html`
		<div className="wp-filter-toolbar is-flex is-justify-content-space-between is-align-items-center" style=${{ flexWrap: 'wrap', gap: '10px' }}>
			<div className="wp-filter-group is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<span className="wp-filter-label" style=${{ fontSize: '1rem', fontWeight: '800' }}>
					<i className="dashicons dashicons-forms mr-1"></i>
					استوديو فرز وإدارة الطلبات:
				</span>

				<div className="tags are-small mb-0" style=${{ display: 'inline-flex', gap: '4px' }}>
					<span className="tag is-dark has-text-weight-bold">
						إجمالي: ${totalRequests}
					</span>
					<span className="tag is-warning has-text-weight-bold" style=${{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
						بانتظار الفرز: ${pendingRequests.length}
					</span>
					<span className="tag is-info has-text-weight-bold" style=${{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
						قيد الدراسة: ${underReviewRequests.length}
					</span>
					<span className="tag is-success has-text-weight-bold" style=${{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
						معتمدة: ${activeRequests.length}
					</span>
					<span className="tag is-danger has-text-weight-bold" style=${{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
						مرفوضة: ${rejectedRequests.length}
					</span>
				</div>
			</div>

			<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<!-- View Mode Switcher -->
				<div className="buttons has-addons are-small mb-0">
					<button
						className=${`button ${viewMode === 'cards' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'cards' ); sound.play( 'button' ); }}
						title="عرض البطاقات والمواصفات"
					>
						<span className="icon is-small"><i className="dashicons dashicons-grid-view"></i></span>
						<span>بطاقات</span>
					</button>
					<button
						className=${`button ${viewMode === 'kanban' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'kanban' ); sound.play( 'button' ); }}
						title="لوحة كانبان الفرز"
					>
						<span className="icon is-small"><i className="dashicons dashicons-columns"></i></span>
						<span>كانبان</span>
					</button>
					<button
						className=${`button ${viewMode === 'table' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'table' ); sound.play( 'button' ); }}
						title="جدول الفرز السريع"
					>
						<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
						<span>جدول</span>
					</button>
				</div>

				<div className="buttons are-small mb-0" style=${{ gap: '6px' }}>
					<a href="#/projects" className="button is-light wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-category"></i></span>
						<span>المشاريع</span>
					</a>
					<a href="#/forms" className="button is-primary is-outlined wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-forms"></i></span>
						<span>نماذج الاستقبال</span>
					</a>
				</div>
			</div>
		</div>
	`;

	return html`
		<div>
			${ portalRoot && createPortal( topToolbarContent, portalRoot ) }

			<!-- Filter & Triage Bar -->
			<div className="box wp-card p-4 mb-5" style=${{ borderTop: '3px solid #6366f1', backgroundColor: '#ffffff' }}>
				<div className="columns is-vcentered">
					<!-- Search Input -->
					<div className="column is-3">
						<div className="field">
							<div className="control has-icons-right">
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${searchQuery}
									onInput=${e => setSearchQuery( e.target.value )}
									placeholder="بحث في الطلبات (الاسم، العميل، البريد، التفاصيل)..."
									style=${{ height: '36px', fontSize: '0.88rem' }}
								/>
								<span className="icon is-right is-small"><i className="dashicons dashicons-search"></i></span>
							</div>
						</div>
					</div>

					<!-- Form Template Filter -->
					<div className="column is-2">
						<div className="field">
							<div className="control">
								<div className="select is-small is-fullwidth wp-sharp-input">
									<select value=${selectedFormFilter} onChange=${e => { setSelectedFormFilter( e.target.value ); sound.play( 'button' ); }}>
										<option value="all">كافة القوالب (${totalRequests})</option>
										${ uniqueForms.map( fId => html`
											<option key=${fId} value=${fId}>${fId}</option>
										` ) }
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- Sort Selector -->
					<div className="column is-2">
						<div className="field">
							<div className="control">
								<div className="select is-small is-fullwidth wp-sharp-input">
									<select value=${selectedSort} onChange=${e => { setSelectedSort( e.target.value ); sound.play( 'button' ); }}>
										<option value="newest">الأحدث وصولاً</option>
										<option value="oldest">الأقدم أولاً</option>
										<option value="deadline">الأقرب موعداً</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- Status Filter Tabs -->
					<div className="column is-5 is-flex is-justify-content-flex-end" style=${{ gap: '4px', flexWrap: 'wrap' }}>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'all' ? 'is-dark' : 'is-light'}`}
							onClick=${() => { setSelectedStatus( 'all' ); sound.play( 'button' ); }}
						>
							الكل (${totalRequests})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'pending' ? 'is-warning' : 'is-light'}`}
							style=${selectedStatus === 'pending' ? { backgroundColor: '#f59e0b', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'pending' ); sound.play( 'button' ); }}
						>
							وارد (${pendingRequests.length})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'under_review' ? 'is-info' : 'is-light'}`}
							style=${selectedStatus === 'under_review' ? { backgroundColor: '#0284c7', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'under_review' ); sound.play( 'button' ); }}
						>
							دراسة (${underReviewRequests.length})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'active' ? 'is-success' : 'is-light'}`}
							style=${selectedStatus === 'active' ? { backgroundColor: '#10b981', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'active' ); sound.play( 'button' ); }}
						>
							معتمد (${activeRequests.length})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'rejected' ? 'is-danger' : 'is-light'}`}
							style=${selectedStatus === 'rejected' ? { backgroundColor: '#ef4444', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'rejected' ); sound.play( 'button' ); }}
						>
							مرفوض (${rejectedRequests.length})
						</button>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			${ filteredRequests.length === 0 && html`
				<div className="box wp-card has-text-centered py-6" style=${{ backgroundColor: '#ffffff' }}>
					<span className="icon is-large has-text-grey-light mb-3" style=${{ fontSize: '48px', height: '48px' }}>
						<i className="dashicons dashicons-email-alt"></i>
					</span>
					<h3 className="title is-4 has-text-grey-dark">لا توجد طلبات عملاء مطابقة للفرز حالياً</h3>
					<p className="subtitle is-6 has-text-grey mt-2">
						${totalRequests === 0 
							? 'لم يتم تقديم أي طلبات مشاريع جديدة من بوابة العملاء حتى اللحظة.' 
							: 'لا توجد طلبات تطابق معايير الفرز أو البحث المحددة.'
						}
					</p>
					<div className="mt-4 is-flex is-justify-content-center" style=${{ gap: '10px' }}>
						<a 
							href="/portal/#/new-request" 
							target="_blank" 
							className="button is-primary wp-sharp-button"
							style=${{ fontWeight: '700' }}
						>
							<span className="icon"><i className="dashicons dashicons-external"></i></span>
							<span>فتح استوديو طلبات العملاء للتجربة</span>
						</a>
						<a 
							href="#/forms" 
							className="button is-light wp-sharp-button"
							style=${{ fontWeight: '700' }}
						>
							<span className="icon"><i className="dashicons dashicons-admin-generic"></i></span>
							<span>تخصيص نماذج الاستقبال</span>
						</a>
					</div>
				</div>
			`}

			<!-- VIEW 1: CARDS MATRIX VIEW -->
			${ viewMode === 'cards' && filteredRequests.length > 0 && html`
				<div className="columns is-multiline">
					${ filteredRequests.map( p => {
						const isPending = p.status === 'pending' || p.status === 'draft';
						const isUnderReview = p.status === 'under_review';
						const isRejected = p.status === 'rejected';
						const isCompleted = p.status === 'completed';
						const specs = p.request_specs || {};
						const specsEntries = Object.entries( specs );

						return html`
							<div key=${p.id} className="column is-12 mb-3">
								<div 
									className="box wp-card p-0" 
									style=${{ 
										border: isPending ? '2px solid #f59e0b' : (isUnderReview ? '2px solid #0284c7' : (isRejected ? '2px solid #ef4444' : '1px solid #e2e8f0')),
										borderRight: isPending ? '6px solid #f59e0b' : (isUnderReview ? '6px solid #0284c7' : (isRejected ? '6px solid #ef4444' : '6px solid #6366f1')),
										backgroundColor: '#ffffff',
										boxShadow: isPending ? '0 4px 14px rgba(245,158,11,0.12)' : '0 2px 6px rgba(0,0,0,0.03)'
									}}
								>
									<!-- Card Top Bar: Client Info & Status Badge -->
									<div className="p-4 is-flex is-justify-content-space-between is-align-items-center" style=${{ borderBottom: '1px solid #f1f5f9', backgroundColor: isPending ? '#fffbeb' : (isUnderReview ? '#f0f9ff' : (isRejected ? '#fef2f2' : '#f8fafc')) }}>
										<div className="is-flex is-align-items-center" style=${{ gap: '12px' }}>
											${ p.client && p.client.avatar ? html`
												<figure className="image is-40x40 m-0">
													<img src=${p.client.avatar} alt=${p.client.display_name} className="is-rounded" style=${{ border: '2px solid #fff' }} />
												</figure>
											` : html`
												<div className="is-flex is-align-items-center is-justify-content-center has-background-primary-light" style=${{ width: '40px', height: '40px', borderRadius: '50%', color: '#6366f1', fontWeight: '800' }}>
													<span className="icon"><i className="dashicons dashicons-admin-users"></i></span>
												</div>
											`}

											<div>
												<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
													<span className="has-text-weight-bold has-text-dark" style=${{ fontSize: '0.98rem' }}>
														${ p.client ? p.client.display_name : 'عميل مسجل' }
													</span>
													${ p.client && p.client.email ? html`
														<span className="is-size-7 has-text-grey">(${p.client.email})</span>
													` : null }
												</div>
												<span className="is-size-7 has-text-grey">
													قالب النموذج: <strong>${p.request_form_id || 'نموذج قياسي'}</strong>
												</span>
											</div>
										</div>

										<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
											${ isPending ? html`
												<span className="tag is-warning has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
													بانتظار الفرز
												</span>
											` : ( isUnderReview ? html`
												<span className="tag is-info has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
													قيد الدراسة الفنية
												</span>
											` : ( isRejected ? html`
												<span className="tag is-danger has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
													غير معتمد (مرفوض)
												</span>
											` : ( isCompleted ? html`
												<span className="tag is-success has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem' }}>
													مكتمل ومسلّم
												</span>
											` : html`
												<span className="tag is-success is-light has-text-weight-bold" style=${{ padding: '0.4rem 0.85rem', border: '1px solid #a7f3d0' }}>
													معتمد وقيد التنفيذ
												</span>
											` ) ) ) }
										</div>
									</div>

									<!-- Card Content Body -->
									<div className="p-5">
										${ isUnderReview && p.review_notes ? html`
											<div className="notification is-info is-light p-3 mb-4" style=${{ borderRadius: '6px', fontSize: '0.88rem', borderRight: '4px solid #0284c7' }}>
												<strong>توضيح وملاحظات دراسة الطلب (مرئي للعميل في بوابته):</strong>
												<p className="mt-1" style=${{ whiteSpace: 'pre-wrap' }}>${p.review_notes}</p>
											</div>
										` : null }

										${ isRejected && p.rejection_reason ? html`
											<div className="notification is-danger is-light p-3 mb-4" style=${{ borderRadius: '6px', fontSize: '0.88rem', borderRight: '4px solid #ef4444' }}>
												<strong>سبب ومبررات عدم الاعتماد (مرئي للعميل في بوابته):</strong>
												<p className="mt-1" style=${{ whiteSpace: 'pre-wrap' }}>${p.rejection_reason}</p>
											</div>
										` : null }

										<div className="columns">
											<!-- Column 1: Title & Scope -->
											<div className="column is-7">
												<div className="is-flex is-align-items-center mb-2" style=${{ gap: '8px' }}>
													<a href=${`#/projects/${p.id}`} className="title is-4 mb-0 has-text-dark" style=${{ textDecoration: 'none' }}>
														${p.name}
													</a>
													<span className="tag is-light is-small" style=${{ fontWeight: '700' }}>${p.prefix}</span>
												</div>

												<div className="content has-text-grey-dark mb-4" style=${{ fontSize: '0.92rem', lineHeight: '1.6' }}>
													${ p.description || 'لم يقم العميل بكتابة تفاصيل إضافية في حقل الشرح.' }
												</div>

												<!-- Key Project Badges -->
												<div className="is-flex is-flex-wrap-wrap" style=${{ gap: '1rem' }}>
													${ p.requested_budget ? html`
														<div className="is-flex is-align-items-center" style=${{ gap: '4px', fontSize: '0.85rem' }}>
															<span className="has-text-grey">الميزانية المقترحة:</span>
															<strong className="has-text-success">${p.requested_budget}</strong>
														</div>
													` : null }

													${ ( p.requested_due_date || p.due_at ) ? html`
														<div className="is-flex is-align-items-center" style=${{ gap: '4px', fontSize: '0.85rem' }}>
															<span className="has-text-grey">الموعد النهائي:</span>
															<strong className="has-text-warning-dark">${( p.requested_due_date || p.due_at ).substring( 0, 10 )}</strong>
														</div>
													` : null }
												</div>
											</div>

											<!-- Column 2: Client Specifications Vault Summary -->
											<div className="column is-5">
												<div className="p-3" style=${{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
													<div className="is-flex is-justify-content-space-between is-align-items-center mb-2 pb-1" style=${{ borderBottom: '1px solid #e2e8f0' }}>
														<span className="is-size-7 has-text-weight-bold has-text-primary is-flex is-align-items-center" style=${{ gap: '4px' }}>
															<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
															<span>المواصفات المستلمة (${specsEntries.length})</span>
														</span>
														<span className="tag is-white is-small has-text-grey">Client Specs</span>
													</div>

													${ specsEntries.length === 0 ? html`
														<p className="is-size-7 has-text-grey-light">لا توجد مواصفات تفصيلية مسجلة.</p>
													` : html`
														<div style=${{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
															${ specsEntries.map( ([sKey, sVal]) => {
																let displayVal = sVal;
																if ( Array.isArray( sVal ) ) {
																	displayVal = sVal.map( (v, vi) => {
																		if ( typeof v === 'object' && v !== null && v.url ) {
																			return html`
																				<a key=${vi} href=${v.url} target="_blank" download className="button is-small is-light p-1 ml-1" style=${{ height: '22px', fontSize: '0.75rem' }}>
																					<span className="icon is-small"><i className="dashicons dashicons-paperclip"></i></span>
																					<span>${v.name || 'ملف'}</span>
																				</a>
																			`;
																		}
																		return html`<span key=${vi} className="tag is-info is-light is-small ml-1">${v}</span>`;
																	} );
																}

																return html`
																	<div key=${sKey} className="is-flex is-justify-content-space-between is-align-items-center is-size-7" style=${{ borderBottom: '1px dashed #f1f5f9', paddingBottom: '3px' }}>
																		<span className="has-text-grey">${sKey}:</span>
																		<strong className="has-text-dark">${displayVal || '—'}</strong>
																	</div>
																`;
															} ) }
														</div>
													` }
												</div>
											</div>
										</div>
									</div>

									<!-- Card Actions Footer -->
									<div className="p-4 is-flex is-justify-content-space-between is-align-items-center" style=${{ borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
										<div>
											<a href=${`#/projects/${p.id}`} className="button is-small wp-sharp-button is-light" style=${{ fontWeight: '700' }}>
												<span className="icon"><i className="dashicons dashicons-portfolio"></i></span>
												<span>فتح مساحة المشروع</span>
											</a>
										</div>

										<div className="buttons mb-0" style=${{ gap: '8px' }}>
											${ ( isPending || isUnderReview || isRejected ) ? html`
												<button
													className="button is-small is-success wp-sharp-button has-text-weight-bold"
													onClick=${() => handleOpenApproveModal( p )}
													style=${{ backgroundColor: '#10b981', color: '#ffffff', boxShadow: '0 2px 8px rgba(16,185,129,0.2)' }}
													title="اعتماد وتأسيس المشروع"
												>
													<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
													<span>اعتماد</span>
												</button>

												${ ! isUnderReview ? html`
													<button
														className="button is-small is-info is-light wp-sharp-button has-text-weight-bold"
														onClick=${() => handleOpenReviewModal( p )}
														style=${{ color: '#0369a1', borderColor: '#bae6fd' }}
														title="وضع الطلب قيد الدراسة مع تبرير للعميل"
													>
														<span className="icon"><i className="dashicons dashicons-search"></i></span>
														<span>قيد الدراسة</span>
													</button>
												` : null }

												${ ! isRejected ? html`
													<button
														className="button is-small is-danger is-light wp-sharp-button has-text-weight-bold"
														onClick=${() => handleOpenRejectModal( p )}
														style=${{ color: '#dc2626', borderColor: '#fca5a5' }}
														title="رفض الطلب مع ذكر التبرير للعميل"
													>
														<span className="icon"><i className="dashicons dashicons-dismiss"></i></span>
														<span>رفض</span>
													</button>
												` : null }
											` : html`
												<a href=${`#/projects/${p.id}`} className="button is-small is-primary is-outlined wp-sharp-button" style=${{ fontWeight: '700' }}>
													<span className="icon"><i className="dashicons dashicons-admin-tools"></i></span>
													<span>إدارة المهام والمراحل</span>
												</a>
											` }
										</div>
									</div>
								</div>
							</div>
						`;
					} ) }
				</div>
			`}

			<!-- VIEW 2: TRIAGE KANBAN BOARD -->
			${ viewMode === 'kanban' && filteredRequests.length > 0 && html`
				<div className="columns is-variable is-3 mb-5" style=${{ minHeight: '600px' }}>
					<!-- Column 1: Incoming / Pending -->
					<div className="column is-3">
						<div className="p-3" style=${{ backgroundColor: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '8px', minHeight: '100%' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #fcd34d' }}>
								<h3 className="title is-6 mb-0 has-text-warning-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-clock"></i></span>
									<span>وارد بانتظار الفرز (${pendingRequests.length})</span>
								</h3>
							</div>

							<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								${ pendingRequests.map( p => html`
									<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
										<span className="tag is-warning is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
										<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
											<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
										</h4>
										<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : 'عميل'}</p>
										${p.requested_budget ? html`<p className="is-size-7 has-text-success has-text-weight-bold mb-2">${p.requested_budget}</p>` : null}
										
										<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9', gap: '4px' }}>
											<button 
												className="button is-small is-success wp-sharp-button has-text-weight-bold"
												style=${{ flex: 1 }}
												onClick=${() => handleOpenApproveModal( p )}
											>
												<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
												<span>اعتماد</span>
											</button>
											<button 
												className="button is-small is-info is-light wp-sharp-button"
												onClick=${() => handleOpenReviewModal( p )}
												title="قيد الدراسة"
											>
												<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
											</button>
											<button 
												className="button is-small is-danger is-light wp-sharp-button"
												onClick=${() => handleOpenRejectModal( p )}
												title="رفض"
											>
												<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
											</button>
										</div>
									</div>
								` ) }
								${ pendingRequests.length === 0 && html`
									<p className="is-size-7 has-text-grey has-text-centered py-4">لا توجد طلبات واردة جديدة</p>
								` }
							</div>
						</div>
					</div>

					<!-- Column 2: Under Review -->
					<div className="column is-3">
						<div className="p-3" style=${{ backgroundColor: '#e0f2fe', border: '1.5px solid #bae6fd', borderRadius: '8px', minHeight: '100%' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #7dd3fc' }}>
								<h3 className="title is-6 mb-0 has-text-info-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
									<span>قيد الدراسة الفنية (${underReviewRequests.length})</span>
								</h3>
							</div>

							<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								${ underReviewRequests.map( p => html`
									<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
										<span className="tag is-info is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
										<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
											<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
										</h4>
										<p className="is-size-7 has-text-grey mb-1">${p.client ? p.client.display_name : 'عميل'}</p>
										${ p.review_notes ? html`
											<p className="is-size-7 has-text-grey-dark mb-2" style=${{ backgroundColor: '#f0f9ff', padding: '4px 6px', borderRadius: '4px' }}>
												${p.review_notes}
											</p>
										` : null }
										
										<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9', gap: '4px' }}>
											<button 
												className="button is-small is-success is-fullwidth wp-sharp-button has-text-weight-bold"
												onClick=${() => handleOpenApproveModal( p )}
											>
												<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
												<span>اعتماد الآن</span>
											</button>
											<button 
												className="button is-small is-danger is-light wp-sharp-button"
												onClick=${() => handleOpenRejectModal( p )}
												title="رفض"
											>
												<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
											</button>
										</div>
									</div>
								` ) }
								${ underReviewRequests.length === 0 && html`
									<p className="is-size-7 has-text-grey has-text-centered py-4">لا توجد طلبات قيد الدراسة</p>
								` }
							</div>
						</div>
					</div>

					<!-- Column 3: Approved & Active -->
					<div className="column is-3">
						<div className="p-3" style=${{ backgroundColor: '#d1fae5', border: '1.5px solid #a7f3d0', borderRadius: '8px', minHeight: '100%' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #6ee7b7' }}>
								<h3 className="title is-6 mb-0 has-text-success-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-yes"></i></span>
									<span>معتمد وقيد التنفيذ (${activeRequests.length})</span>
								</h3>
							</div>

							<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								${ activeRequests.map( p => html`
									<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
										<span className="tag is-success is-light is-small has-text-weight-bold mb-1">${p.prefix}</span>
										<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
											<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
										</h4>
										<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : 'عميل'}</p>
										
										<div className="is-flex is-justify-content-space-between pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
											<a href=${`#/projects/${p.id}`} className="button is-small is-primary is-outlined wp-sharp-button" style=${{ width: '48%' }}>
												<span>المساحة</span>
											</a>
											<button 
												className="button is-small is-info is-light wp-sharp-button" 
												style=${{ width: '48%' }}
												onClick=${() => handleQuickStateChange( p.id, 'completed' )}
											>
												<span>إكمال</span>
											</button>
										</div>
									</div>
								` ) }
								${ activeRequests.length === 0 && html`
									<p className="is-size-7 has-text-grey has-text-centered py-4">لا توجد طلبات نشطة</p>
								` }
							</div>
						</div>
					</div>

					<!-- Column 4: Rejected / Completed -->
					<div className="column is-3">
						<div className="p-3" style=${{ backgroundColor: '#f1f5f9', border: '1.5px solid #cbd5e1', borderRadius: '8px', minHeight: '100%' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1.5px solid #94a3b8' }}>
								<h3 className="title is-6 mb-0 has-text-grey-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-portfolio"></i></span>
									<span>مرفوضة / مكتملة (${rejectedRequests.length + completedRequests.length})</span>
								</h3>
							</div>

							<div style=${{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
								${ rejectedRequests.map( p => html`
									<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #fecaca' }}>
										<span className="tag is-danger is-light is-small has-text-weight-bold mb-1">${p.prefix} (مرفوض)</span>
										<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
											<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
										</h4>
										<p className="is-size-7 has-text-grey mb-1">${p.client ? p.client.display_name : 'عميل'}</p>
										${ p.rejection_reason ? html`
											<p className="is-size-7 has-text-danger mb-2" style=${{ backgroundColor: '#fef2f2', padding: '4px 6px', borderRadius: '4px' }}>
												${p.rejection_reason}
											</p>
										` : null }
										<div className="pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
											<button 
												className="button is-small is-light is-fullwidth wp-sharp-button"
												onClick=${() => handleOpenReviewModal( p )}
											>
												<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
												<span>إعادة دراسة</span>
											</button>
										</div>
									</div>
								` ) }

								${ completedRequests.map( p => html`
									<div key=${p.id} className="box wp-card p-3" style=${{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
										<span className="tag is-success is-light is-small has-text-weight-bold mb-1">${p.prefix} (مكتمل)</span>
										<h4 className="has-text-weight-bold mb-1" style=${{ fontSize: '0.95rem' }}>
											<a href=${`#/projects/${p.id}`} className="has-text-dark">${p.name}</a>
										</h4>
										<p className="is-size-7 has-text-grey mb-2">${p.client ? p.client.display_name : 'عميل'}</p>
										<div className="pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
											<a href=${`#/projects/${p.id}`} className="button is-small is-light is-fullwidth wp-sharp-button">
												<span className="icon is-small"><i className="dashicons dashicons-archive"></i></span>
												<span>مراجعة المخرجات</span>
											</a>
										</div>
									</div>
								` ) }

								${ rejectedRequests.length === 0 && completedRequests.length === 0 && html`
									<p className="is-size-7 has-text-grey has-text-centered py-4">لا توجد طلبات في هذا العمود</p>
								` }
							</div>
						</div>
					</div>
				</div>
			`}

			<!-- VIEW 3: TRIAGE QUICK TABLE -->
			${ viewMode === 'table' && filteredRequests.length > 0 && html`
				<div className="box wp-card p-0 mb-5" style=${{ backgroundColor: '#fff' }}>
					<table className="table is-fullwidth is-hoverable mb-0" style=${{ fontSize: '0.88rem' }}>
						<thead>
							<tr style=${{ backgroundColor: '#f8fafc' }}>
								<th>الرمز</th>
								<th>اسم الطلب / المشروع</th>
								<th>العميل</th>
								<th>قالب النموذج</th>
								<th>الميزانية</th>
								<th>تاريخ التسليم</th>
								<th>الحالة</th>
								<th className="has-text-centered">الإجراءات</th>
							</tr>
						</thead>
						<tbody>
							${ filteredRequests.map( p => {
								const isPending = p.status === 'pending' || p.status === 'draft';
								const isUnderReview = p.status === 'under_review';
								const isRejected = p.status === 'rejected';

								return html`
									<tr key=${p.id}>
										<td><strong>${p.prefix}</strong></td>
										<td>
											<a href=${`#/projects/${p.id}`} className="has-text-dark has-text-weight-bold">${p.name}</a>
										</td>
										<td>${p.client ? p.client.display_name : '—'}</td>
										<td><span className="tag is-light is-small">${p.request_form_id || 'قياسي'}</span></td>
										<td><strong className="has-text-success">${p.requested_budget || '—'}</strong></td>
										<td>${p.requested_due_date ? p.requested_due_date.substring( 0, 10 ) : '—'}</td>
										<td>
											<span className=${`tag is-small ${isPending ? 'is-warning' : (isUnderReview ? 'is-info' : (isRejected ? 'is-danger' : (p.status === 'active' ? 'is-success' : 'is-light')))}`}>
												${isPending ? 'وارد' : (isUnderReview ? 'دراسة' : (isRejected ? 'مرفوض' : (p.status === 'active' ? 'معتمد' : 'مكتمل')))}
											</span>
										</td>
										<td className="has-text-centered">
											<div className="buttons is-centered are-small mb-0" style=${{ gap: '4px' }}>
												${ ( isPending || isUnderReview || isRejected ) ? html`
													<button className="button is-small is-success is-outlined wp-sharp-button" onClick=${() => handleOpenApproveModal( p )} title="اعتماد">
														<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
													</button>
													${ ! isUnderReview ? html`
														<button className="button is-small is-info is-light wp-sharp-button" onClick=${() => handleOpenReviewModal( p )} title="قيد الدراسة">
															<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
														</button>
													` : null }
													${ ! isRejected ? html`
														<button className="button is-small is-danger is-light wp-sharp-button" onClick=${() => handleOpenRejectModal( p )} title="رفض">
															<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
														</button>
													` : null }
												` : html`
													<a href=${`#/projects/${p.id}`} className="button is-small is-light wp-sharp-button" title="عرض">
														<span className="icon is-small"><i className="dashicons dashicons-visibility"></i></span>
													</a>
												` }
											</div>
										</td>
									</tr>
								`;
							} ) }
						</tbody>
					</table>
				</div>
			`}

			<!-- MODAL 1: Quick Approval Modal -->
			${ approvingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setApprovingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#1e293b' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								اعتماد وتأسيس المشروع رسميًا في المنظومة
							</p>
							<button className="delete" aria-label="close" onClick=${() => setApprovingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-success is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>المشروع المطلوب اعتماده:</strong> ${approvingProject.name} (${approvingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									سيتم تحويل حالة المشروع إلى <strong>نشط (Active)</strong> وتدشينه وإشعار العميل فوراً في بوابته.
								</span>
							</div>

							<div className="field mb-4">
								<label className="label is-small">تعيين مدير / قائد للمشروع (Project Lead):</label>
								<div className="control">
									<${MemberSelect}
										users=${users}
										value=${selectedLeadId}
										onChange=${(uid) => setSelectedLeadId(uid)}
										placeholder="-- اختر قائد المشروع من الفريق الفني --"
									/>
								</div>
							</div>

							<div className="columns">
								<div className="column is-6">
									<div className="field">
										<label className="label is-small">الميزانية المعتمدة:</label>
										<div className="control">
											<input
												type="text"
												className="input is-small wp-sharp-input"
												value=${approvedBudget}
												onInput=${e => setApprovedBudget( e.target.value )}
												placeholder="الميزانية المتفق عليها..."
											/>
										</div>
									</div>
								</div>

								<div className="column is-6">
									<div className="field">
										<label className="label is-small">تاريخ التسليم المستهدف:</label>
										<div className="control">
											<input
												type="date"
												className="input is-small wp-sharp-input"
												value=${approvedDueDate ? approvedDueDate.substring( 0, 10 ) : ''}
												onInput=${e => setApprovedDueDate( e.target.value )}
											/>
										</div>
									</div>
								</div>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setApprovingProject( null )} disabled=${isApproving}>
								إلغاء
							</button>
							<button 
								className=${`button is-success wp-sharp-button has-text-weight-bold ${isApproving ? 'is-loading' : ''}`}
								onClick=${handleConfirmApprove}
								disabled=${isApproving}
								style=${{ backgroundColor: '#10b981', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-yes-alt"></i></span>
								<span>تأكيد الاعتماد وبدء التنفيذ</span>
							</button>
						</footer>
					</div>
				</div>
			` }

			<!-- MODAL 2: Under Review -->
			${ reviewingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setReviewingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#0369a1' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								وضع الطلب قيد الدراسة والتدقيق الفني
							</p>
							<button className="delete" aria-label="close" onClick=${() => setReviewingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-info is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>طلب المشروع:</strong> ${reviewingProject.name} (${reviewingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									سيتم تغيير حالة الطلب إلى <strong>قيد الدراسة (Under Review)</strong> وإرسال إشعار وتنبيه فوري للعميل مع الملاحظات المدخلة أدناه.
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">سبب وملاحظات دراسة الطلب (تفسير للإدارة يظهر للعميل):</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${reviewNotes}
										onInput=${e => setReviewNotes( e.target.value )}
										placeholder="مثال: الطلب يحتوي على متطلبات فنية معقدة ونقوم حالياً بدراسة الجدوى الهندسية وجدولة المهام مع الفريق المتخصص قبل الاعتماد..."
									></textarea>
								</div>
								<p className="help has-text-grey">هذا التبرير سيظهر مباشرة للعميل في بوابته كصندوق توضيحي وفي إشعاراته.</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setReviewingProject( null )} disabled=${isReviewing}>
								إلغاء
							</button>
							<button 
								className=${`button is-info wp-sharp-button has-text-weight-bold ${isReviewing ? 'is-loading' : ''}`}
								onClick=${handleConfirmReview}
								disabled=${isReviewing}
								style=${{ backgroundColor: '#0284c7', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
								<span>تأكيد الإحالة للدراسة وإشعار العميل</span>
							</button>
						</footer>
					</div>
				</div>
			` }

			<!-- MODAL 3: Reject Request -->
			${ rejectingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setRejectingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#991b1b' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								عدم اعتماد / رفض طلب المشروع مع ذكر المبررات
							</p>
							<button className="delete" aria-label="close" onClick=${() => setRejectingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-danger is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>طلب المشروع:</strong> ${rejectingProject.name} (${rejectingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									سيتم تسجيل الطلب كـ <strong>غير معتمد (Rejected)</strong> وإرسال تنبيه وإشعار فوري للعميل مع بيان الأسباب.
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">مبررات عدم الاعتماد (تفسير الرفض للعميل):</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${rejectionReason}
										onInput=${e => setRejectionReason( e.target.value )}
										placeholder="مثال: نعتذر لعدم إمكانية اعتماد الطلب نظراً لكون المتطلبات خارج النطاق التقني المتاح حالياً، أو لعدم توفر السعة التشغيلية في الموعد المطلوب..."
									></textarea>
								</div>
								<p className="help has-text-danger">تأكد من صياغة سبب الرفض بلباقة، حيث سيظهر للعميل في بوابته وإشعاره.</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setRejectingProject( null )} disabled=${isRejecting}>
								إلغاء
							</button>
							<button 
								className=${`button is-danger wp-sharp-button has-text-weight-bold ${isRejecting ? 'is-loading' : ''}`}
								onClick=${handleConfirmReject}
								disabled=${isRejecting}
								style=${{ backgroundColor: '#ef4444', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
								<span>تأكيد عدم الاعتماد وإشعار العميل</span>
							</button>
						</footer>
					</div>
				</div>
			` }
		</div>
	`;
}
