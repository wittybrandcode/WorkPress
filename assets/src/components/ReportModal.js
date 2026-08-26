import { html, useState, useEffect } from '../utils/html.js';
import { reportsApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import Loader from './Loader.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function ReportModal( { isActive, onClose, projectId, projectName } ) {
	const [ activeTab, setActiveTab ] = useState( 'report' ); // 'report' | 'knowledge_book'
	const [ isLoading, setIsLoading ] = useState( true );
	const [ reportData, setReportData ] = useState( null );
	const [ markdownData, setMarkdownData ] = useState( '' );
	const [ filename, setFilename ] = useState( 'knowledge-book.md' );
	const [ isCopied, setIsCopied ] = useState( false );

	useEffect( () => {
		if ( ! isActive || ! projectId ) return;
		setIsLoading( true );

		Promise.all( [
			reportsApi.getProjectReport( projectId ),
			reportsApi.getKnowledgeBook( projectId ),
		] )
			.then( ( [ reportRes, kbRes ] ) => {
				setReportData( reportRes );
				if ( kbRes ) {
					setMarkdownData( kbRes.markdown || '' );
					if ( kbRes.filename ) setFilename( kbRes.filename );
				}
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'تعذر جلب بيانات التقرير التنفيذي', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	}, [ isActive, projectId ] );

	if ( ! isActive ) return null;

	const handlePrint = () => {
		sound.play( 'click' );
		window.print();
	};

	const handleDownloadMarkdown = () => {
		sound.play( 'success' );
		const blob = new Blob( [ markdownData ], { type: 'text/markdown;charset=utf-8' } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = filename;
		document.body.appendChild( a );
		a.click();
		document.body.removeChild( a );
		URL.revokeObjectURL( url );
		toast( 'تم تنزيل كتيب المعرفة بنجاح', 'success' );
	};

	const handleCopyMarkdown = () => {
		if ( ! navigator.clipboard ) return;
		navigator.clipboard.writeText( markdownData ).then( () => {
			setIsCopied( true );
			toast( 'تم نسخ كتيب المعرفة إلى الحافظة بنجاح', 'success' );
			setTimeout( () => setIsCopied( false ), 2500 );
		} );
	};

	return html`
		<div className="modal is-active wp-report-modal" style=${{ zIndex: 100000 }}>
			<div className="modal-background" onClick=${ onClose } style=${{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}></div>
			<div className="modal-card" style=${{ 
				borderRadius: 0, 
				backgroundColor: '#f8fafc', 
				border: '1px solid #cbd5e1', 
				boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
				maxHeight: '92vh',
				display: 'flex',
				flexDirection: 'column'
			}} onClick=${ ( e ) => e.stopPropagation() }>
				
				<!-- Header with Action Tabs & Buttons -->
				<header className="modal-card-head wp-report-no-print" style=${{ 
					borderRadius: 0, 
					backgroundColor: '#ffffff', 
					borderBottom: '1px solid #e2e8f0', 
					padding: '12px 20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexShrink: 0
				}}>
					<div style=${{ display: 'flex', alignItems: 'center', gap: '16px' }}>
						<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<i className="dashicons dashicons-chart-bar" style=${{ fontSize: '1.4rem' }}></i>
							<div>
								<h3 className="has-text-weight-bold is-size-6 mb-0" style=${{ color: '#0f172a' }}>
									التقرير التنفيذي وكتاب المعرفة
								</h3>
								<p className="is-size-7 has-text-grey mb-0">${ projectName || 'المشروع' }</p>
							</div>
						</div>

						<!-- Tab Switches -->
						<div className="buttons has-addons mb-0 mr-4">
							<button 
								className=${ `button is-small ${ activeTab === 'report' ? 'is-dark has-text-weight-bold' : 'is-light' }` }
								onClick=${ () => { setActiveTab( 'report' ); sound.play( 'click' ); } }
								style=${{ borderRadius: 0 }}
							>
								التقرير التنفيذي (PDF/Print)
							</button>
							<button 
								className=${ `button is-small ${ activeTab === 'knowledge_book' ? 'is-dark has-text-weight-bold' : 'is-light' }` }
								onClick=${ () => { setActiveTab( 'knowledge_book' ); sound.play( 'click' ); } }
								style=${{ borderRadius: 0 }}
							>
								كتاب المعرفة (.md)
							</button>
						</div>
					</div>

					<!-- Quick Actions -->
					<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
						${ activeTab === 'report' && html`
							<button 
								className="button is-small is-primary has-text-weight-bold" 
								onClick=${ handlePrint }
								style=${{ borderRadius: 0, backgroundColor: '#0f172a', borderColor: '#0f172a' }}
								title="طباعة أو تصدير كملف PDF"
							>
								<span className="dashicons dashicons-printer is-size-6 ml-1"></span>
								طباعة / حفظ PDF
							</button>
						` }

						${ activeTab === 'knowledge_book' && html`
							<button 
								className="button is-small is-primary has-text-weight-bold" 
								onClick=${ handleDownloadMarkdown }
								style=${{ borderRadius: 0, backgroundColor: '#10b981', borderColor: '#10b981' }}
								title="تنزيل كملف Markdown"
							>
								<span className="dashicons dashicons-download is-size-6 ml-1"></span>
								تنزيل (.md)
							</button>
							<button 
								className="button is-small is-light" 
								onClick=${ handleCopyMarkdown }
								style=${{ borderRadius: 0 }}
								title="نسخ إلى الحافظة"
							>
								<span className=${ `dashicons ${ isCopied ? 'dashicons-yes' : 'dashicons-admin-page' } is-size-6 ml-1` }></span>
								${ isCopied ? 'تم النسخ!' : 'نسخ النص' }
							</button>
						` }

						<button 
							className="delete mr-2" 
							aria-label="close" 
							onClick=${ onClose } 
							style=${{ backgroundColor: '#475569' }}
						></button>
					</div>
				</header>

				<!-- Modal Body Content -->
				<section className="modal-card-body p-4" style=${{ overflowY: 'auto', backgroundColor: '#f1f5f9' }}>
					${ isLoading && html`
						<div className="py-6 has-text-centered">
							<${Loader} center=${true} label="جاري استخراج وتجميع التقرير التنفيذي وكتاب المعرفة..." size="large" />
						</div>
					` }

					${ ! isLoading && ! reportData && html`
						<div className="notification is-danger is-light p-5 has-text-centered" style=${{ borderRadius: 0 }}>
							تعذر استعراض التقرير. يرجى التأكد من صلاحياتك وحالة المشروع.
						</div>
					` }

					${ ! isLoading && reportData && activeTab === 'report' && html`
						<div className="wp-report-canvas">
							<!-- 1. Formal Executive Header -->
							<div className="wp-report-header">
								<div>
									<div className="wp-report-brand-title">
										${ reportData.organization?.name || 'منظومة WorkPress' }
									</div>
									<div style=${{ fontSize: '0.85rem', color: '#64748b' }}>
										${ reportData.organization?.description || 'تقرير استلام واعتماد المشروع المكتمل' }
									</div>
									<div className="mt-2" style=${{ fontSize: '0.78rem', color: '#94a3b8' }}>
										تاريخ إصدار الوثيقة: <strong>${ formatDate( reportData.organization?.generated_at ) }</strong>
									</div>
								</div>

								<div style=${{ textAlign: 'left' }}>
									<span className="wp-report-badge">
										<span>المشروع:</span>
										<strong>${ reportData.project?.prefix || '#' + reportData.project?.id }</strong>
									</span>
									<div className="mt-2" style=${{ fontSize: '0.8rem', fontWeight: 800, color: reportData.metrics?.completion_rate === 100 ? '#10b981' : '#3b82f6' }}>
										${ reportData.metrics?.completion_rate === 100 ? 'مشروع مكتمل ومعتمد 100%' : `قيد التنفيذ (${reportData.metrics?.completion_rate}%)` }
									</div>
								</div>
							</div>

							<!-- Project Title & Scope -->
							<div className="mb-4">
								<h2 style=${{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
									${ reportData.project?.name }
								</h2>
								<p style=${{ fontSize: '0.9rem', color: '#334155' }}>
									${ reportData.project?.description || 'لا يوجد وصف تفصيلي إضافي مدون.' }
								</p>
							</div>

							<!-- 2. Executive Metrics Ribbon -->
							<div className="wp-report-metrics-grid">
								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-primary">
										${ reportData.metrics?.completion_rate }%
									</div>
									<div className="wp-report-metric-lbl">نسبة الإنجاز الكلية</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val">
										${ reportData.metrics?.completed_tasks } / ${ reportData.metrics?.total_tasks }
									</div>
									<div className="wp-report-metric-lbl">المهام المنجزة</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-success">
										${ reportData.metrics?.deliverables_count }
									</div>
									<div className="wp-report-metric-lbl">الحلول المعتمدة</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-info">
										${ reportData.kpis?.avg_cycle_time_days || 0 } يوم
									</div>
									<div className="wp-report-metric-lbl">متوسط سرعة الحل</div>
								</div>
							</div>

							<!-- 3. Client Specifications Vault (if available) -->
							${ reportData.project?.specs && Object.keys( reportData.project.specs ).length > 0 && html`
								<div>
									<h4 className="wp-report-section-title">مواصفات ومتطلبات الطلب المعتمدة</h4>
									<table className="wp-report-table">
										<thead>
											<tr>
												<th style=${{ width: '35%' }}>البند / الخاصية</th>
												<th>المواصفة المحددة</th>
											</tr>
										</thead>
										<tbody>
											${ Object.entries( reportData.project.specs ).map( ( [ label, val ] ) => html`
												<tr key=${ label }>
													<td><strong>${ label }</strong></td>
													<td>${ Array.isArray( val ) ? val.join( '، ' ) : String( val ) }</td>
												</tr>
											` ) }
										</tbody>
									</table>
								</div>
							` }

							<!-- 4. Verified Solutions & Deliverables Catalog -->
							<div>
								<h4 className="wp-report-section-title">⭐ خزينة الحلول والمخرجات الفنية المعتمدة</h4>
								
								${ ( ! reportData.deliverables || reportData.deliverables.length === 0 ) && html`
									<div className="p-4 has-text-centered has-text-grey" style=${{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
										لا توجد حلول معتمدة مدونة رسمياً في هذا المشروع حتى تاريخ إصدار التقرير.
									</div>
								` }

								${ reportData.deliverables && reportData.deliverables.map( ( deliv, idx ) => html`
									<div className="wp-deliverable-item" key=${ deliv.id || idx }>
										<div className="wp-deliverable-item-header">
											<div>
												<span className="tag is-dark ml-2" style=${{ borderRadius: 0 }}>${ deliv.task_ref }</span>
												<span>${ deliv.task_title }</span>
											</div>
											<span style=${{ fontSize: '0.78rem', color: '#64748b' }}>
												تاريخ الاعتماد: ${ formatDate( deliv.accepted_at ) }
											</span>
										</div>

										<div className="wp-deliverable-content mb-2">
											${ deliv.content }
										</div>

										<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569' }}>
											<div>
												<span>المنفذ: <strong>${ deliv.author_name }</strong></span>
												<span className="mr-3">المعتمد: <strong>${ deliv.accepted_by_name }</strong></span>
											</div>
											${ deliv.attachments && deliv.attachments.length > 0 && html`
												<span className="has-text-weight-bold">
													${ deliv.attachments.length } مرفق فني
												</span>
											` }
										</div>
									</div>
								` ) }
							</div>

							<!-- 5. Executive Tasks Audit Table -->
							<div className="mt-5">
								<h4 className="wp-report-section-title">سجل وجدول مهام المشروع</h4>
								<table className="wp-report-table">
									<thead>
										<tr>
											<th style=${{ width: '12%' }}>الرمز</th>
											<th>عنوان المهمة</th>
											<th style=${{ width: '18%' }}>المسند إليه</th>
											<th style=${{ width: '15%' }}>الحالة</th>
											<th style=${{ width: '18%' }}>تاريخ الإنشاء</th>
										</tr>
									</thead>
									<tbody>
										${ reportData.tasks && reportData.tasks.map( ( t ) => html`
											<tr key=${ t.id }>
												<td><code>${ t.ref_key }</code></td>
												<td><strong>${ t.title }</strong></td>
												<td>${ t.assignee }</td>
												<td>
													<span style=${{ 
														fontWeight: 700,
														color: t.status === 'completed' || t.status === 'closed' ? '#10b981' : ( t.status === 'in_progress' ? '#3b82f6' : '#64748b' )
													}}>
														${ t.status === 'completed' || t.status === 'closed' ? 'مكتملة' : ( t.status === 'in_progress' ? 'قيد التنفيذ' : 'مفتوحة' ) }
													</span>
												</td>
												<td>${ formatDate( t.created_at ) }</td>
											</tr>
										` ) }
									</tbody>
								</table>
							</div>

							<!-- 6. Official Sign-off Box -->
							<div className="wp-signoff-grid">
								<div className="wp-signoff-box">
									<div className="wp-signoff-role">قائد وموجه المشروع</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.project?.leader?.display_name || 'قائد المشروع' }
									</div>
									<div className="wp-signoff-line">التوقيع والختم الرسمي</div>
								</div>

								<div className="wp-signoff-box">
									<div className="wp-signoff-role">ممثل العميل / المستفيد</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.project?.client_author?.display_name || 'العميل المعتمد' }
									</div>
									<div className="wp-signoff-line">التوقيع واستلام المخرجات</div>
								</div>

								<div className="wp-signoff-box">
									<div className="wp-signoff-role">المدير العام / الإدارة التنفيذية</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.organization?.name || 'الإدارة العليا' }
									</div>
									<div className="wp-signoff-line">الاعتماد النهائي والأرشفة</div>
								</div>
							</div>
						</div>
					` }

					${ ! isLoading && activeTab === 'knowledge_book' && html`
						<div style=${{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '24px' }}>
							<div className="mb-3" style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span className="tag is-dark is-medium" style=${{ borderRadius: 0, fontFamily: 'monospace' }}>
									${ filename }
								</span>
								<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>
									صيغة Markdown القياسية المجهزة للتوثيق الداخلي و GitHub Wiki
								</span>
							</div>
							<textarea 
								className="textarea" 
								readOnly 
								value=${ markdownData }
								rows=${ 22 }
								style=${{ 
									borderRadius: 0, 
									fontFamily: 'Consolas, Monaco, "Courier New", monospace', 
									fontSize: '0.85rem',
									backgroundColor: '#f8fafc',
									color: '#0f172a',
									lineHeight: 1.6
								}}
							></textarea>
						</div>
					` }
				</section>
			</div>
		</div>
	`;
}
