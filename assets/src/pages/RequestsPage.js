import { html, useState, useEffect } from '../utils/html.js';
import { projectsApi, usersApi } from '../api/client.js';
import Loader from '../components/ui/Loader.js';
import { isStaffUser } from '../utils/userScope.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';
import RequestFilterBar from '../components/requests/RequestFilterBar.js';
import RequestCardsView from '../components/requests/RequestCardsView.js';
import RequestTriageBoard from '../components/requests/RequestTriageBoard.js';
import RequestTableView from '../components/requests/RequestTableView.js';
import RequestConversionModal from '../components/requests/RequestConversionModal.js';
import RequestEvaluationModal from '../components/requests/RequestEvaluationModal.js';

/**
 * WorkPress Request Studio & Triage Page (Lean Controller)
 *
 * @package WorkPress
 * @subpackage Pages/Requests
 * @version 2.2.3
 */
export default function RequestsPage({ refreshKey }) {
	const [ projects, setProjects ] = useState( null );
	const [ users, setUsers ] = useState( [] );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ selectedStatus, setSelectedStatus ] = useState( 'all' );
	const [ selectedFormFilter, setSelectedFormFilter ] = useState( 'all' );
	const [ selectedSort, setSelectedSort ] = useState( 'newest' );
	const [ viewMode, setViewMode ] = useState( 'cards' ); // 'cards' | 'kanban' | 'table'

	// Approval & Conversion Modal State
	const [ approvingProject, setApprovingProject ] = useState( null );
	const [ selectedLeadId, setSelectedLeadId ] = useState( '' );
	const [ approvedBudget, setApprovedBudget ] = useState( '' );
	const [ approvedDueDate, setApprovedDueDate ] = useState( '' );
	const [ isApproving, setIsApproving ] = useState( false );

	// Under Review Evaluation Modal State
	const [ reviewingProject, setReviewingProject ] = useState( null );
	const [ reviewNotes, setReviewNotes ] = useState( '' );
	const [ isReviewing, setIsReviewing ] = useState( false );

	// Rejection Modal State
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
		return b.id - a.id;
	} );

	return html`
		<div>
			<!-- Filter & Triage Header Bar -->
			<${RequestFilterBar}
				totalRequests=${totalRequests}
				pendingRequestsCount=${pendingRequests.length}
				underReviewRequestsCount=${underReviewRequests.length}
				activeRequestsCount=${activeRequests.length}
				rejectedRequestsCount=${rejectedRequests.length}
				viewMode=${viewMode}
				setViewMode=${setViewMode}
				searchQuery=${searchQuery}
				setSearchQuery=${setSearchQuery}
				uniqueForms=${uniqueForms}
				selectedFormFilter=${selectedFormFilter}
				setSelectedFormFilter=${setSelectedFormFilter}
				selectedSort=${selectedSort}
				setSelectedSort=${setSelectedSort}
				selectedStatus=${selectedStatus}
				setSelectedStatus=${setSelectedStatus}
			/>

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
				<${RequestCardsView}
					filteredRequests=${filteredRequests}
					handleOpenApproveModal=${handleOpenApproveModal}
					handleOpenReviewModal=${handleOpenReviewModal}
					handleOpenRejectModal=${handleOpenRejectModal}
				/>
			`}

			<!-- VIEW 2: TRIAGE KANBAN BOARD -->
			${ viewMode === 'kanban' && filteredRequests.length > 0 && html`
				<${RequestTriageBoard}
					pendingRequests=${pendingRequests}
					underReviewRequests=${underReviewRequests}
					activeRequests=${activeRequests}
					rejectedRequests=${rejectedRequests}
					completedRequests=${completedRequests}
					handleOpenApproveModal=${handleOpenApproveModal}
					handleOpenReviewModal=${handleOpenReviewModal}
					handleOpenRejectModal=${handleOpenRejectModal}
					handleQuickStateChange=${handleQuickStateChange}
				/>
			`}

			<!-- VIEW 3: TRIAGE QUICK TABLE -->
			${ viewMode === 'table' && filteredRequests.length > 0 && html`
				<${RequestTableView}
					filteredRequests=${filteredRequests}
					handleOpenApproveModal=${handleOpenApproveModal}
					handleOpenReviewModal=${handleOpenReviewModal}
					handleOpenRejectModal=${handleOpenRejectModal}
				/>
			`}

			<!-- MODAL 1: Quick Approval Modal -->
			<${RequestConversionModal}
				approvingProject=${approvingProject}
				setApprovingProject=${setApprovingProject}
				users=${users}
				selectedLeadId=${selectedLeadId}
				setSelectedLeadId=${setSelectedLeadId}
				approvedBudget=${approvedBudget}
				setApprovedBudget=${setApprovedBudget}
				approvedDueDate=${approvedDueDate}
				setApprovedDueDate=${setApprovedDueDate}
				isApproving=${isApproving}
				handleConfirmApprove=${handleConfirmApprove}
			/>

			<!-- MODAL 2 & 3: Under Review & Reject Modals -->
			<${RequestEvaluationModal}
				reviewingProject=${reviewingProject}
				setReviewingProject=${setReviewingProject}
				reviewNotes=${reviewNotes}
				setReviewNotes=${setReviewNotes}
				isReviewing=${isReviewing}
				handleConfirmReview=${handleConfirmReview}
				rejectingProject=${rejectingProject}
				setRejectingProject=${setRejectingProject}
				rejectionReason=${rejectionReason}
				setRejectionReason=${setRejectionReason}
				isRejecting=${isRejecting}
				handleConfirmReject=${handleConfirmReject}
			/>
		</div>
	`;
}
