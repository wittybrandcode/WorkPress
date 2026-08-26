import { html, useState, useEffect } from '../utils/html.js';
import { projectsApi, tasksApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import FilterBar from '../components/FilterBar.js';
import Loader from '../components/Loader.js';
import ReportModal from '../components/ReportModal.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function ProjectDetailPage( { projectId: propProjectId, refreshKey } ) {
	const [ project, setProject ] = useState( null );
	const [ members, setMembers ] = useState( [] );
	const [ tasks, setTasks ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );

	// Tasks Filtering
	const [ taskSearch, setTaskSearch ] = useState( '' );
	const [ taskStatus, setTaskStatus ] = useState( 'all' );
	const [ taskPriority, setTaskPriority ] = useState( '' );
	const [ isApproving, setIsApproving ] = useState( false );
	const [ isReportModalOpen, setIsReportModalOpen ] = useState( false );

	// Get ID from props or URL hash
	const projectId = propProjectId || window.location.hash.split('/')[2];

	const fetchProjectData = () => {
		if ( ! projectId ) return;
		setIsLoading( true );
		
		Promise.all([
			projectsApi.get( projectId ),
			projectsApi.members.list( projectId ),
			tasksApi.list( { project_id: projectId, number: -1 } ) // Get all tasks for this project
		]).then( ([ projData, membersData, tasksData ]) => {
			setProject( projData );
			setMembers( membersData );
			setTasks( tasksData );
		}).catch( err => {
			console.error( err );
			toast( 'حدث خطأ أثناء جلب بيانات المشروع', 'danger' );
		}).finally( () => setIsLoading( false ) );
	};

	useEffect( () => {
		fetchProjectData();
	}, [ projectId, refreshKey ] );

	if ( isLoading ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="جاري استعراض تفاصيل المشروع..." size="large" />
			</div>
		`;
	}

	if ( ! project ) {
		return html`<div className="has-text-centered py-6"><p className="has-text-danger">المشروع غير موجود أو ليس لديك صلاحية للوصول إليه.</p></div>`;
	}

	// Calculate stats
	const totalTasks = tasks.length;
	const completedTasks = tasks.filter( t => t.status === 'completed' || t.status === 'closed' ).length;
	const completionRate = totalTasks > 0 ? Math.round( (completedTasks / totalTasks) * 100 ) : 0;
	const isProjectCompleted = project.is_completed || project.status === 'completed' || (totalTasks > 0 && completedTasks === totalTasks);
	
	const openTasks = tasks.filter( t => t.status === 'open' ).length;
	const inProgressTasks = tasks.filter( t => t.status === 'in_progress' || t.status === 'in_review' ).length;

	const taskStatusOptions = [
		{ value: 'all', label: 'جميع الحالات' },
		{ value: 'open', label: 'مفتوحة / جديدة' },
		{ value: 'assigned', label: 'مسندة' },
		{ value: 'in_progress', label: 'قيد الإنجاز' },
		{ value: 'completed', label: 'مكتملة' }
	];

	const isTaskFilterActive = Boolean( taskSearch || taskStatus !== 'all' );

	const filteredProjectTasks = tasks.filter( t => {
		if ( taskSearch ) {
			const q = taskSearch.toLowerCase();
			const matchTitle = ( t.title || '' ).toLowerCase().includes( q );
			const matchRef = ( t.ref_key || '' ).toLowerCase().includes( q );
			if ( ! matchTitle && ! matchRef ) return false;
		}
		if ( taskStatus !== 'all' ) {
			if ( taskStatus === 'open' ) {
				if ( t.status !== 'open' && t.status !== 'new' ) return false;
			} else if ( taskStatus === 'completed' ) {
				if ( t.status !== 'completed' && t.status !== 'closed' ) return false;
			} else {
				if ( t.status !== taskStatus ) return false;
			}
		}
		return true;
	} );

	const handleApproveProject = () => {
		setIsApproving(true);
		projectsApi.update(project.id, { status: 'active' }).then(() => {
			setIsApproving(false);
			toast('تم اعتماد وتأسيس المشروع بنجاح! أصبح المشروع نشطاً الآن', 'success');
			sound.play('celebration');
			fetchProjectData();
		}).catch(err => {
			setIsApproving(false);
			console.error(err);
			toast(err.message || 'حدث خطأ أثناء اعتماد المشروع', 'danger');
			sound.play('caution');
		});
	};

	return html`
		<div className="mt-4">
			<div className="mb-4 is-flex is-justify-content-space-between is-align-items-center">
				<div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					<a href="#/projects" className="button is-small is-light wp-icon-button" style=${{ borderRadius: 0, border: '2px solid #0f172a' }} title="العودة للمشاريع">
						<span className="icon"><i className="dashicons dashicons-arrow-right-alt2"></i></span>
					</a>

					<button
						className="button is-small is-dark wp-sharp-button"
						onClick=${ () => { setIsReportModalOpen( true ); sound.play( 'pop' ); } }
						style=${{ fontWeight: '700', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
						title="استخراج التقرير التنفيذي الرسمي وكتاب المعرفة"
					>
						<span className="icon"><i className="dashicons dashicons-media-document"></i></span>
						<span>التقرير التنفيذي وكتاب المعرفة</span>
					</button>
				</div>

				${ (project.is_client_request && (project.status === 'pending' || project.status === 'draft')) ? html`
					<button
						className=${`button is-success wp-sharp-button ${isApproving ? 'is-loading' : ''}`}
						onClick=${handleApproveProject}
						disabled=${isApproving}
						style=${{ fontWeight: '800' }}
					>
						<span className="icon"><i className="dashicons dashicons-yes-alt"></i></span>
						<span>اعتماد وتأسيس المشروع رسمياً</span>
					</button>
				` : null }
			</div>
			
			<div className="columns is-variable is-6">
				<!-- عمود التفاصيل الرئيسية -->
				<div className="column is-8">
					<div className="box wp-card p-0 mb-5">
						${ project.cover_url ? html`
							<figure className="image is-3by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
								<img src=${ project.cover_url } alt=${ project.name } style=${{ objectFit: 'cover' }} />
							</figure>
						` : html`
							<figure className="image is-3by1 m-0" style=${{ borderBottom: '1px solid #ededed' }}>
								<div className="has-ratio has-background-dark is-flex is-align-items-center is-justify-content-center">
									<span className="icon is-large has-text-white-ter"><i className="dashicons dashicons-portfolio" style=${{ fontSize: '64px', width: '64px', height: '64px' }}></i></span>
								</div>
							</figure>
						`}
						
						<div className="p-5">
							<div className="is-flex is-align-items-center is-flex-wrap-wrap mb-3" style=${{ gap: '8px' }}>
								<h1 className="title is-3 mb-0">${ project.name }</h1>
								<span className="tag is-info is-light" style=${{ borderRadius: 0 }}>${ project.prefix }</span>
								
								${ project.is_client_request ? html`
									<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
										طلب جديد من عميل
									</span>
								` : null }

								${ isProjectCompleted ? html`
									<span className="tag is-success has-text-weight-bold" style=${{ borderRadius: 0 }}>
										<i className="dashicons dashicons-awards ml-1"></i> مكتمل (${ project.progress || 100 }%)
									</span>
								` : null }
							</div>
							
							<div className="content has-text-grey-dark" dangerouslySetInnerHTML=${{ __html: project.description || 'لا يوجد وصف متاح.' }}></div>
							
							<div className="is-flex is-flex-wrap-wrap mt-5 pt-4" style=${{ borderTop: '1px solid #ededed', gap: '2rem' }}>
								<div>
									<span className="heading has-text-grey mb-1">تاريخ البدء</span>
									<span className="has-text-weight-bold">${ project.start_at ? formatDate(project.start_at) : 'غير محدد' }</span>
								</div>
								<div>
									<span className="heading has-text-grey mb-1">تاريخ التسليم</span>
									<span className="has-text-weight-bold">${ project.due_at ? formatDate(project.due_at) : (project.requested_due_date ? formatDate(project.requested_due_date) : 'غير محدد') }</span>
								</div>
								${ project.requested_budget ? html`
									<div>
										<span className="heading has-text-grey mb-1">الميزانية المقترحة</span>
										<span className="has-text-weight-bold has-text-success">${ project.requested_budget }</span>
									</div>
								` : null }
								<div>
									<span className="heading has-text-grey mb-1">الحالة</span>
									<span className=${`tag ${ isProjectCompleted ? 'is-success' : (project.status === 'active' ? 'is-info' : (project.status === 'pending' ? 'is-warning' : (project.status === 'archived' ? 'is-dark' : project.status))) }`} style=${{ borderRadius: 0 }}>
										${ isProjectCompleted ? 'مكتمل' : (project.status === 'active' ? 'نشط' : (project.status === 'pending' ? 'طلب قيد المراجعة' : (project.status === 'archived' ? 'مؤرشف' : project.status))) }
									</span>
								</div>
							</div>
						</div>
					</div>

					<!-- بطاقة المواصفات والمتطلبات الفنية للطلب (Client Specifications Vault) -->
					${ (project.is_client_request && ((project.request_specs && Object.keys(project.request_specs).length > 0) || (project.request_attachments && project.request_attachments.length > 0))) ? html`
						<div className="box wp-card p-5 mb-5" style=${{ border: '1.5px solid #6366f1', backgroundColor: '#f8fafc', boxShadow: '0 4px 12px rgba(99,102,241,0.06)' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #e2e8f0' }}>
								<h3 className="title is-5 mb-0 has-text-primary is-flex is-align-items-center" style=${{ gap: '8px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-portfolio"></i></span>
									<span>خزينة المواصفات والمرفقات المستلمة من العميل (Client Specs Vault)</span>
								</h3>
								<span className="tag is-primary is-light" style=${{ fontWeight: '800' }}>
									${ project.request_form_id ? `قالب: ${project.request_form_id}` : 'طلب مهيكل' }
								</span>
							</div>

							${ (project.request_specs && Object.keys(project.request_specs).length > 0) ? html`
								<div className="columns is-multiline mb-3">
									${ Object.entries(project.request_specs).map(([specKey, specVal]) => {
										let displayVal = specVal;
										if (Array.isArray(specVal)) {
											displayVal = specVal.join(' ، ');
										}
										return html`
											<div key=${specKey} className="column is-6">
												<div className="p-3" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', height: '100%' }}>
													<span className="is-size-7 has-text-grey has-text-weight-bold display-block mb-1" style=${{ display: 'block' }}>
														${specKey}
													</span>
													<span className="is-size-6 has-text-weight-bold has-text-dark" style=${{ wordBreak: 'break-word' }}>
														${displayVal || '—'}
													</span>
												</div>
											</div>
										`;
									}) }
								</div>
							` : null }

							${ (project.request_attachments && project.request_attachments.length > 0) ? html`
								<div className="mt-3 pt-3" style=${{ borderTop: '1px dashed #cbd5e1' }}>
									<h4 className="is-size-7 has-text-weight-bold has-text-grey mb-2 is-flex is-align-items-center" style=${{ gap: '6px' }}>
										<span className="icon is-small"><i className="dashicons dashicons-paperclip"></i></span>
										<span>الملفات والمرفقات الفنية المرفوعة من العميل:</span>
									</h4>
									<div className="is-flex is-flex-wrap-wrap" style=${{ gap: '8px' }}>
										${ project.request_attachments.map((att, idx) => html`
											<a
												key=${att.id || idx}
												href=${att.url}
												target="_blank"
												rel="noopener noreferrer"
												className="button is-small is-light wp-sharp-button is-flex is-align-items-center"
												style=${{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', gap: '6px', fontWeight: '700', color: '#1e293b' }}
												download
											>
												<span className="icon is-small has-text-info"><i className="dashicons dashicons-media-default"></i></span>
												<span>${att.name || `مرفق #${idx + 1}`}</span>
												${ att.size ? html`<span className="is-size-7 has-text-grey">(${att.size})</span>` : null }
											</a>
										`) }
									</div>
								</div>
							` : null }
						</div>
					` : null }

					<!-- المهام التابعة للمشروع -->
					<div className="box wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
							<h3 className="title is-4 mb-0">مهام المشروع</h3>
							<a href="#/kanban" className="button is-small is-primary wp-card">
								<span className="icon"><i className="dashicons dashicons-columns"></i></span>
								<span>الكانبان</span>
							</a>
						</div>

						<${FilterBar}
							search=${{
								value: taskSearch,
								onChange: setTaskSearch,
								placeholder: 'بحث في مهام المشروع...',
							}}
							filters=${[
								{
									key: 'status',
									label: 'الحالة',
									icon: 'dashicons-tag',
									value: taskStatus,
									onChange: setTaskStatus,
									options: taskStatusOptions,
									width: '130px',
								}
							]}
							totalCount=${ filteredProjectTasks.length }
							totalUnfiltered=${ tasks.length }
							counterLabel="مهمة"
							isFilterActive=${ isTaskFilterActive }
							onReset=${ () => { setTaskSearch(''); setTaskStatus('all'); } }
						/>
						
						${ filteredProjectTasks.length === 0 ? html`
							<div className="has-text-centered p-5 has-background-light" style=${{ border: '1px dashed #cbd5e1', borderRadius: 0 }}>
								<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<i className="dashicons dashicons-clipboard has-text-grey" style=${{ fontSize: '24px' }}></i>
								</div>
								<p className="has-text-grey-dark has-text-weight-bold mb-1">${ isTaskFilterActive ? 'لا توجد مهام مطابقة للفلتر المحدد' : 'لا توجد مهام مسجلة في هذا المشروع بعد' }</p>
								<p className="is-size-7 has-text-grey mb-3">${ isTaskFilterActive ? 'جرب تعديل شروط البحث أو الفلاتر' : 'يمكنك البدء بإضافة مهام لتوزيع العمل على أعضاء الفريق' }</p>
								<a href="#/kanban" className="button is-small is-primary wp-sharp-button">
									<span className="icon is-small"><i className="dashicons dashicons-plus"></i></span>
									<span>إدارة مهام الكانبان</span>
								</a>
							</div>
						` : html`
							<table className="table is-fullwidth is-hoverable wp-table" style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}>
								<thead>
									<tr style=${{ backgroundColor: '#f8fafc' }}>
										<th>المرجع</th>
										<th>المهمة</th>
										<th>الحالة</th>
										<th>الأولوية</th>
									</tr>
								</thead>
								<tbody>
									${ filteredProjectTasks.map( task => html`
										<tr key=${task.id} style=${{ cursor: 'pointer' }} onClick=${() => window.location.hash = '#/tasks/' + task.id}>
											<td className="has-text-grey has-text-weight-bold">${ task.ref_key }</td>
											<td className="has-text-weight-bold">${ task.title }</td>
											<td>
												<span className=${`tag is-light ${ task.status === 'completed' || task.status === 'closed' ? 'is-success' : (task.status === 'open' ? 'is-info' : 'is-warning') }`} style=${{ borderRadius: 0 }}>
													${ task.status === 'completed' || task.status === 'closed' ? 'مكتملة' : task.status === 'open' ? 'مفتوحة' : 'قيد التنفيذ' }
												</span>
											</td>
											<td>
												<span className="tag is-white" style=${{ border: '1px solid #ededed', borderRadius: 0 }}>
													${ task.priority }
												</span>
											</td>
										</tr>
									`)}
								</tbody>
							</table>
						`}
					</div>
				</div>
				
				<!-- العمود الجانبي -->
				<div className="column is-4">
					<!-- إحصائيات الإنجاز -->
					<div className="box wp-card p-5 mb-5">
						<h3 className="title is-5 mb-4 has-text-weight-bold">تقدم العمل</h3>
						
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
							<span className="has-text-weight-bold is-size-3 has-text-primary">${ completionRate }%</span>
							<span className="has-text-grey">مكتمل</span>
						</div>
						
						<progress className="progress is-primary mb-5" value=${ completionRate } max="100" style=${{ borderRadius: 0, height: '8px' }}>${ completionRate }%</progress>
						
						<div className="columns is-mobile is-multiline">
							<div className="column is-6">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">المهام الكلية</p>
									<p className="title is-4 mb-0">${ totalTasks }</p>
								</div>
							</div>
							<div className="column is-6">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">مفتوحة</p>
									<p className="title is-4 mb-0">${ openTasks }</p>
								</div>
							</div>
							<div className="column is-12">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">قيد التنفيذ والمراجعة</p>
									<p className="title is-4 mb-0">${ inProgressTasks }</p>
								</div>
							</div>
						</div>
					</div>

					<!-- بطاقة العميل صاحب الطلب (Client Profile Card) -->
					${ (project.is_client_request || project.client) ? html`
						<div className="box wp-card p-5 mb-5" style=${{ border: '1.5px solid #f59e0b', backgroundColor: '#fffbeb', boxShadow: '0 4px 12px rgba(245,158,11,0.08)' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
								<h3 className="title is-6 mb-0 has-text-warning-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<i class="dashicons dashicons-businessman"></i>
									<span>صاحب الطلب / العميل المعتمد</span>
								</h3>
								<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0, fontSize: '0.72rem' }}>
									⭐ عميل
								</span>
							</div>

							<div className="is-flex is-align-items-center p-3" style=${{ backgroundColor: '#ffffff', border: '1px solid #fde68a', gap: '12px' }}>
								<figure className="image is-40x40 m-0">
									<img
										src=${ (project.client && project.client.avatar) || '' }
										alt=${ (project.client && project.client.display_name) || 'العميل' }
										style=${{ borderRadius: 0, border: '2px solid #f59e0b', backgroundColor: '#fef3c7' }}
									/>
								</figure>
								<div style=${{ overflow: 'hidden' }}>
									<p className="has-text-weight-bold is-size-6 mb-0" style=${{ lineHeight: '1.3' }}>
										${ (project.client && project.client.display_name) || 'عميل مسجل' }
									</p>
									<p className="has-text-grey is-size-7 mb-0" style=${{ wordBreak: 'break-all' }}>
										${ (project.client && project.client.email) || '' }
									</p>
								</div>
							</div>
						</div>
					` : null }

					<!-- فريق العمل -->
					<div className="box wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
							<h3 className="title is-5 mb-0 has-text-weight-bold">أعضاء المشروع</h3>
							<span className="tag is-dark" style=${{ borderRadius: 0 }}>${ members.length }</span>
						</div>
						
						${ members.length === 0 ? html`
							<p className="has-text-grey is-size-7">لا يوجد أعضاء مضافين لهذا المشروع.</p>
						` : html`
							<div className="is-flex is-flex-direction-column" style=${{ gap: '12px' }}>
								${ members.map( member => html`
									<div key=${member.id} className="is-flex is-align-items-center p-2 has-background-light" style=${{ borderRight: '3px solid #10b981', gap: '10px' }}>
										<figure className="image is-32x32 m-0">
											<img src=${ member.avatar_url || (member.avatar_urls && member.avatar_urls['48']) || '' } alt=${ member.display_name || member.name } style=${{ borderRadius: 0, border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
										</figure>
										<div>
											<p className="has-text-weight-bold is-size-6 mb-0" style=${{ lineHeight: '1.2' }}>${ member.display_name || member.name }</p>
											<p className="has-text-grey is-size-7 mb-0">${ (member.role === 'manager' || member.project_role === 'manager') ? 'مدير' : ((member.role === 'lead' || member.project_role === 'lead') ? 'قائد' : ((member.role === 'viewer' || member.project_role === 'viewer' || member.project_role === 'client') ? 'متابع/عميل' : 'عضو منفذ')) }</p>
										</div>
									</div>
								`)}
							</div>
						`}
					</div>
				</div>
			</div>

			<${ReportModal}
				isActive=${ isReportModalOpen }
				onClose=${ () => setIsReportModalOpen( false ) }
				projectId=${ project.id }
				projectName=${ project.name }
			/>
		</div>
	`;
}
