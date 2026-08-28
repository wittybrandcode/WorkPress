import { html, useState, useEffect } from '../../utils/html.js';
import { reportsApi } from '../../api/client.js';
import { formatDate } from '../../utils/datetime.js';
import Loader from '../ui/Loader.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

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
				toast( 'ØªØ¹Ø°Ø± Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ', 'danger' );
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
		toast( 'ØªÙ… ØªÙ†Ø²ÙŠÙ„ ÙƒØªÙŠØ¨ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
	};

	const handleCopyMarkdown = () => {
		if ( ! navigator.clipboard ) return;
		navigator.clipboard.writeText( markdownData ).then( () => {
			setIsCopied( true );
			toast( 'ØªÙ… Ù†Ø³Ø® ÙƒØªÙŠØ¨ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø¥Ù„Ù‰ Ø§Ù„Ø­Ø§ÙØ¸Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
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
									Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ ÙˆÙƒØªØ§Ø¨ Ø§Ù„Ù…Ø¹Ø±ÙØ©
								</h3>
								<p className="is-size-7 has-text-grey mb-0">${ projectName || 'Ø§Ù„Ù…Ø´Ø±ÙˆØ¹' }</p>
							</div>
						</div>

						<!-- Tab Switches -->
						<div className="buttons has-addons mb-0 mr-4">
							<button 
								className=${ `button is-small ${ activeTab === 'report' ? 'is-dark has-text-weight-bold' : 'is-light' }` }
								onClick=${ () => { setActiveTab( 'report' ); sound.play( 'click' ); } }
								style=${{ borderRadius: 0 }}
							>
								Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ (PDF/Print)
							</button>
							<button 
								className=${ `button is-small ${ activeTab === 'knowledge_book' ? 'is-dark has-text-weight-bold' : 'is-light' }` }
								onClick=${ () => { setActiveTab( 'knowledge_book' ); sound.play( 'click' ); } }
								style=${{ borderRadius: 0 }}
							>
								ÙƒØªØ§Ø¨ Ø§Ù„Ù…Ø¹Ø±ÙØ© (.md)
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
								title="Ø·Ø¨Ø§Ø¹Ø© Ø£Ùˆ ØªØµØ¯ÙŠØ± ÙƒÙ…Ù„Ù PDF"
							>
								<span className="dashicons dashicons-printer is-size-6 ml-1"></span>
								Ø·Ø¨Ø§Ø¹Ø© / Ø­ÙØ¸ PDF
							</button>
						` }

						${ activeTab === 'knowledge_book' && html`
							<button 
								className="button is-small is-primary has-text-weight-bold" 
								onClick=${ handleDownloadMarkdown }
								style=${{ borderRadius: 0, backgroundColor: '#10b981', borderColor: '#10b981' }}
								title="ØªÙ†Ø²ÙŠÙ„ ÙƒÙ…Ù„Ù Markdown"
							>
								<span className="dashicons dashicons-download is-size-6 ml-1"></span>
								ØªÙ†Ø²ÙŠÙ„ (.md)
							</button>
							<button 
								className="button is-small is-light" 
								onClick=${ handleCopyMarkdown }
								style=${{ borderRadius: 0 }}
								title="Ù†Ø³Ø® Ø¥Ù„Ù‰ Ø§Ù„Ø­Ø§ÙØ¸Ø©"
							>
								<span className=${ `dashicons ${ isCopied ? 'dashicons-yes' : 'dashicons-admin-page' } is-size-6 ml-1` }></span>
								${ isCopied ? 'ØªÙ… Ø§Ù„Ù†Ø³Ø®!' : 'Ù†Ø³Ø® Ø§Ù„Ù†Øµ' }
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
							<${Loader} center=${true} label="Ø¬Ø§Ø±ÙŠ Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙˆØªØ¬Ù…ÙŠØ¹ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ ÙˆÙƒØªØ§Ø¨ Ø§Ù„Ù…Ø¹Ø±ÙØ©..." size="large" />
						</div>
					` }

					${ ! isLoading && ! reportData && html`
						<div className="notification is-danger is-light p-5 has-text-centered" style=${{ borderRadius: 0 }}>
							ØªØ¹Ø°Ø± Ø§Ø³ØªØ¹Ø±Ø§Ø¶ Ø§Ù„ØªÙ‚Ø±ÙŠØ±. ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ£ÙƒØ¯ Ù…Ù† ØµÙ„Ø§Ø­ÙŠØ§ØªÙƒ ÙˆØ­Ø§Ù„Ø© Ø§Ù„Ù…Ø´Ø±ÙˆØ¹.
						</div>
					` }

					${ ! isLoading && reportData && activeTab === 'report' && html`
						<div className="wp-report-canvas">
							<!-- 1. Formal Executive Header -->
							<div className="wp-report-header">
								<div>
									<div className="wp-report-brand-title">
										${ reportData.organization?.name || 'Ù…Ù†Ø¸ÙˆÙ…Ø© WorkPress' }
									</div>
									<div style=${{ fontSize: '0.85rem', color: '#64748b' }}>
										${ reportData.organization?.description || 'ØªÙ‚Ø±ÙŠØ± Ø§Ø³ØªÙ„Ø§Ù… ÙˆØ§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø§Ù„Ù…ÙƒØªÙ…Ù„' }
									</div>
									<div className="mt-2" style=${{ fontSize: '0.78rem', color: '#94a3b8' }}>
										ØªØ§Ø±ÙŠØ® Ø¥ØµØ¯Ø§Ø± Ø§Ù„ÙˆØ«ÙŠÙ‚Ø©: <strong>${ formatDate( reportData.organization?.generated_at ) }</strong>
									</div>
								</div>

								<div style=${{ textAlign: 'left' }}>
									<span className="wp-report-badge">
										<span>Ø§Ù„Ù…Ø´Ø±ÙˆØ¹:</span>
										<strong>${ reportData.project?.prefix || '#' + reportData.project?.id }</strong>
									</span>
									<div className="mt-2" style=${{ fontSize: '0.8rem', fontWeight: 800, color: reportData.metrics?.completion_rate === 100 ? '#10b981' : '#3b82f6' }}>
										${ reportData.metrics?.completion_rate === 100 ? 'Ù…Ø´Ø±ÙˆØ¹ Ù…ÙƒØªÙ…Ù„ ÙˆÙ…Ø¹ØªÙ…Ø¯ 100%' : `Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ° (${reportData.metrics?.completion_rate}%)` }
									</div>
								</div>
							</div>

							<!-- Project Title & Scope -->
							<div className="mb-4">
								<h2 style=${{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
									${ reportData.project?.name }
								</h2>
								<p style=${{ fontSize: '0.9rem', color: '#334155' }}>
									${ reportData.project?.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ ØªÙØµÙŠÙ„ÙŠ Ø¥Ø¶Ø§ÙÙŠ Ù…Ø¯ÙˆÙ†.' }
								</p>
							</div>

							<!-- 2. Executive Metrics Ribbon -->
							<div className="wp-report-metrics-grid">
								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-primary">
										${ reportData.metrics?.completion_rate }%
									</div>
									<div className="wp-report-metric-lbl">Ù†Ø³Ø¨Ø© Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„ÙƒÙ„ÙŠØ©</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val">
										${ reportData.metrics?.completed_tasks } / ${ reportData.metrics?.total_tasks }
									</div>
									<div className="wp-report-metric-lbl">Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„Ù…Ù†Ø¬Ø²Ø©</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-success">
										${ reportData.metrics?.deliverables_count }
									</div>
									<div className="wp-report-metric-lbl">Ø§Ù„Ø­Ù„ÙˆÙ„ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©</div>
								</div>

								<div className="wp-report-metric-card">
									<div className="wp-report-metric-val has-text-info">
										${ reportData.kpis?.avg_cycle_time_days || 0 } ÙŠÙˆÙ…
									</div>
									<div className="wp-report-metric-lbl">Ù…ØªÙˆØ³Ø· Ø³Ø±Ø¹Ø© Ø§Ù„Ø­Ù„</div>
								</div>
							</div>

							<!-- 3. Client Specifications Vault (if available) -->
							${ reportData.project?.specs && Object.keys( reportData.project.specs ).length > 0 && html`
								<div>
									<h4 className="wp-report-section-title">Ù…ÙˆØ§ØµÙØ§Øª ÙˆÙ…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©</h4>
									<table className="wp-report-table">
										<thead>
											<tr>
												<th style=${{ width: '35%' }}>Ø§Ù„Ø¨Ù†Ø¯ / Ø§Ù„Ø®Ø§ØµÙŠØ©</th>
												<th>Ø§Ù„Ù…ÙˆØ§ØµÙØ© Ø§Ù„Ù…Ø­Ø¯Ø¯Ø©</th>
											</tr>
										</thead>
										<tbody>
											${ Object.entries( reportData.project.specs ).map( ( [ label, val ] ) => html`
												<tr key=${ label }>
													<td><strong>${ label }</strong></td>
													<td>${ Array.isArray( val ) ? val.join( 'ØŒ ' ) : String( val ) }</td>
												</tr>
											` ) }
										</tbody>
									</table>
								</div>
							` }

							<!-- 4. Verified Solutions & Deliverables Catalog -->
							<div>
								<h4 className="wp-report-section-title">â­ Ø®Ø²ÙŠÙ†Ø© Ø§Ù„Ø­Ù„ÙˆÙ„ ÙˆØ§Ù„Ù…Ø®Ø±Ø¬Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ù…Ø¹ØªÙ…Ø¯Ø©</h4>
								
								${ ( ! reportData.deliverables || reportData.deliverables.length === 0 ) && html`
									<div className="p-4 has-text-centered has-text-grey" style=${{ background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
										Ù„Ø§ ØªÙˆØ¬Ø¯ Ø­Ù„ÙˆÙ„ Ù…Ø¹ØªÙ…Ø¯Ø© Ù…Ø¯ÙˆÙ†Ø© Ø±Ø³Ù…ÙŠØ§Ù‹ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø­ØªÙ‰ ØªØ§Ø±ÙŠØ® Ø¥ØµØ¯Ø§Ø± Ø§Ù„ØªÙ‚Ø±ÙŠØ±.
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
												ØªØ§Ø±ÙŠØ® Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯: ${ formatDate( deliv.accepted_at ) }
											</span>
										</div>

										<div className="wp-deliverable-content mb-2">
											${ deliv.content }
										</div>

										<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569' }}>
											<div>
												<span>Ø§Ù„Ù…Ù†ÙØ°: <strong>${ deliv.author_name }</strong></span>
												<span className="mr-3">Ø§Ù„Ù…Ø¹ØªÙ…Ø¯: <strong>${ deliv.accepted_by_name }</strong></span>
											</div>
											${ deliv.attachments && deliv.attachments.length > 0 && html`
												<span className="has-text-weight-bold">
													${ deliv.attachments.length } Ù…Ø±ÙÙ‚ ÙÙ†ÙŠ
												</span>
											` }
										</div>
									</div>
								` ) }
							</div>

							<!-- 5. Executive Tasks Audit Table -->
							<div className="mt-5">
								<h4 className="wp-report-section-title">Ø³Ø¬Ù„ ÙˆØ¬Ø¯ÙˆÙ„ Ù…Ù‡Ø§Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</h4>
								<table className="wp-report-table">
									<thead>
										<tr>
											<th style=${{ width: '12%' }}>Ø§Ù„Ø±Ù…Ø²</th>
											<th>Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‡Ù…Ø©</th>
											<th style=${{ width: '18%' }}>Ø§Ù„Ù…Ø³Ù†Ø¯ Ø¥Ù„ÙŠÙ‡</th>
											<th style=${{ width: '15%' }}>Ø§Ù„Ø­Ø§Ù„Ø©</th>
											<th style=${{ width: '18%' }}>ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡</th>
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
														${ t.status === 'completed' || t.status === 'closed' ? 'Ù…ÙƒØªÙ…Ù„Ø©' : ( t.status === 'in_progress' ? 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°' : 'Ù…ÙØªÙˆØ­Ø©' ) }
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
									<div className="wp-signoff-role">Ù‚Ø§Ø¦Ø¯ ÙˆÙ…ÙˆØ¬Ù‡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.project?.leader?.display_name || 'Ù‚Ø§Ø¦Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹' }
									</div>
									<div className="wp-signoff-line">Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ ÙˆØ§Ù„Ø®ØªÙ… Ø§Ù„Ø±Ø³Ù…ÙŠ</div>
								</div>

								<div className="wp-signoff-box">
									<div className="wp-signoff-role">Ù…Ù…Ø«Ù„ Ø§Ù„Ø¹Ù…ÙŠÙ„ / Ø§Ù„Ù…Ø³ØªÙÙŠØ¯</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.project?.client_author?.display_name || 'Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯' }
									</div>
									<div className="wp-signoff-line">Ø§Ù„ØªÙˆÙ‚ÙŠØ¹ ÙˆØ§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ù…Ø®Ø±Ø¬Ø§Øª</div>
								</div>

								<div className="wp-signoff-box">
									<div className="wp-signoff-role">Ø§Ù„Ù…Ø¯ÙŠØ± Ø§Ù„Ø¹Ø§Ù… / Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠØ©</div>
									<div style=${{ fontSize: '0.8rem', color: '#475569' }}>
										${ reportData.organization?.name || 'Ø§Ù„Ø¥Ø¯Ø§Ø±Ø© Ø§Ù„Ø¹Ù„ÙŠØ§' }
									</div>
									<div className="wp-signoff-line">Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù†Ù‡Ø§Ø¦ÙŠ ÙˆØ§Ù„Ø£Ø±Ø´ÙØ©</div>
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
									ØµÙŠØºØ© Markdown Ø§Ù„Ù‚ÙŠØ§Ø³ÙŠØ© Ø§Ù„Ù…Ø¬Ù‡Ø²Ø© Ù„Ù„ØªÙˆØ«ÙŠÙ‚ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ Ùˆ GitHub Wiki
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
