import { html, useState, useEffect } from '../utils/html.js';
import { projectsApi, reportsApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import Loader from '../components/ui/Loader.js';
import ReportModal from '../components/modals/Modal.js';
import FilterBar from '../components/ui/FilterBar.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

export default function ReportsPage( { refreshKey } ) {
	const [ projects, setProjects ] = useState( [] );
	const [ analytics, setAnalytics ] = useState( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ statusFilter, setStatusFilter ] = useState( 'all' ); // 'all' | 'completed' | 'active'

	// Report Modal state
	const [ selectedProject, setSelectedProject ] = useState( null );
	const [ modalInitialTab, setModalInitialTab ] = useState( 'report' );

	useEffect( () => {
		setIsLoading( true );
		Promise.all( [
			projectsApi.list( { number: 100 } ),
			reportsApi.getWorkspaceAnalytics().catch( () => null ),
		] )
			.then( ( [ projectsRes, analyticsRes ] ) => {
				const projectItems = projectsRes && projectsRes.items ? projectsRes.items : ( Array.isArray( projectsRes ) ? projectsRes : [] );
				setProjects( projectItems );
				if ( analyticsRes ) {
					setAnalytics( analyticsRes );
				}
			} )
			.catch( ( err ) => {
				console.error( err );
				toast( 'ØªØ¹Ø°Ø± ØªØ­Ù…ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±', 'danger' );
			} )
			.finally( () => setIsLoading( false ) );
	}, [ refreshKey ] );

	const openReport = ( project, tab = 'report' ) => {
		setSelectedProject( project );
		setModalInitialTab( tab );
		sound.play( 'pop' );
	};

	const filteredProjects = projects.filter( ( p ) => {
		const matchesSearch = ! searchQuery ||
			( p.name && p.name.toLowerCase().includes( searchQuery.toLowerCase() ) ) ||
			( p.prefix && p.prefix.toLowerCase().includes( searchQuery.toLowerCase() ) );

		const isCompleted = p.is_completed || p.status === 'completed' || ( p.tasks_count > 0 && p.completed_tasks_count === p.tasks_count );
		
		if ( statusFilter === 'completed' ) return matchesSearch && isCompleted;
		if ( statusFilter === 'active' ) return matchesSearch && ! isCompleted;
		return matchesSearch;
	} );

	return html`
		<div className="reports-page pb-6">
			<!-- Ø´Ø±ÙŠØ· Ø§Ù„ÙÙ„ØªØ±Ø© ÙˆØ§Ù„Ø£Ø¯ÙˆØ§Øª Ø§Ù„Ø¹Ù„ÙˆÙŠ -->
			<${FilterBar}>
				<div className="is-flex is-align-items-center is-flex-wrap-wrap" style=${{ gap: '12px', width: '100%' }}>
					<div className="control has-icons-right is-expanded" style=${{ minWidth: '220px' }}>
						<input
							className="input is-small is-rounded"
							type="text"
							placeholder="Ø¨Ø­Ø« ÙÙŠ ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹..."
							value=${ searchQuery }
							onInput=${ ( e ) => setSearchQuery( e.target.value ) }
						/>
						<span className="icon is-small is-right has-text-grey-light">
							<i className="dashicons dashicons-search"></i>
						</span>
					</div>

					<div className="buttons has-addons mb-0">
						<button
							className=${ `button is-small ${ statusFilter === 'all' ? 'is-primary is-selected' : '' }` }
							onClick=${ () => { setStatusFilter( 'all' ); sound.play( 'select' ); } }
						>
							ÙƒØ§ÙØ© Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ (${ projects.length })
						</button>
						<button
							className=${ `button is-small ${ statusFilter === 'completed' ? 'is-primary is-selected' : '' }` }
							onClick=${ () => { setStatusFilter( 'completed' ); sound.play( 'select' ); } }
						>
							Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© 100%
						</button>
						<button
							className=${ `button is-small ${ statusFilter === 'active' ? 'is-primary is-selected' : '' }` }
							onClick=${ () => { setStatusFilter( 'active' ); sound.play( 'select' ); } }
						>
							Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°
						</button>
					</div>
				</div>
			<//>

			<!-- ØªØ±ÙˆÙŠØ³Ø© Ø§Ù„ØµÙØ­Ø© Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠØ© -->
			<div className="box wp-card mb-5 mt-2" style=${{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff', border: 'none', borderRadius: '16px', padding: '24px 28px' }}>
				<div className="columns is-vcentered">
					<div className="column is-7">
						<div className="is-flex is-align-items-center mb-2" style=${{ gap: '10px' }}>
							<span className="tag is-primary is-light has-text-weight-bold">WorkPress Analytics & Reporting</span>
							<span className="tag is-dark has-text-weight-bold" style=${{ background: '#334155' }}>v1.4.0</span>
						</div>
						<h1 className="title is-3 has-text-white mb-2" style=${{ fontWeight: 800 }}>
							Ù…Ø±ÙƒØ² Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠØ© ÙˆØ§Ù„ØªØ­Ù„ÙŠÙ„Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙÙŠØ©
						</h1>
						<p className="subtitle is-6 has-text-grey-light mb-0" style=${{ lineHeight: '1.6' }}>
							Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙˆØ«Ø§Ø¦Ù‚ Ø§Ù„ØªØ³Ù„ÙŠÙ… ÙˆØ§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ø±Ø³Ù…ÙŠ Ù„Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø© (Executive Sign-off PDF)ØŒ ÙˆØªØµØ¯ÙŠØ± ÙƒØªÙŠØ¨Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø§Ù„Ù…Ø¤Ø³Ø³ÙŠØ© Ø§Ù„Ù…Ø¬Ù…Ù‘Ø¹Ø© (.md)ØŒ ÙˆØªØ­Ù„ÙŠÙ„ ÙƒÙØ§Ø¡Ø© Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² ÙˆØ¬ÙˆØ¯Ø© Ø§Ù„Ù…Ø®Ø±Ø¬Ø§Øª.
						</p>
					</div>
					<div className="column is-5">
						<div className="columns is-mobile is-multiline has-text-centered">
							<div className="column is-6">
								<div className="p-3" style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
									<div className="has-text-grey-light is-size-7 mb-1">Ø¥Ø¬Ù…Ø§Ù„ÙŠ Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹</div>
									<div className="title is-4 has-text-white mb-0" style=${{ fontWeight: 800 }}>
										${ analytics ? analytics.total_projects : projects.length }
									</div>
								</div>
							</div>
							<div className="column is-6">
								<div className="p-3" style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
									<div className="has-text-grey-light is-size-7 mb-1">Ù†Ø³Ø¨Ø© Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² Ø§Ù„ÙƒÙ„ÙŠØ©</div>
									<div className="title is-4 has-text-success mb-0" style=${{ fontWeight: 800 }}>
										${ analytics ? analytics.completion_rate : 0 }%
									</div>
								</div>
							</div>
							<div className="column is-6">
								<div className="p-3" style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
									<div className="has-text-grey-light is-size-7 mb-1">Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ Ø§Ù„Ù…ÙƒØªÙ…Ù„Ø©</div>
									<div className="title is-4 has-text-info mb-0" style=${{ fontWeight: 800 }}>
										${ analytics ? analytics.completed_projects : 0 }
									</div>
								</div>
							</div>
							<div className="column is-6">
								<div className="p-3" style=${{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
									<div className="has-text-grey-light is-size-7 mb-1">Ø­Ù„ÙˆÙ„ Ù…Ø¹Ø±ÙÙŠØ© Ù…Ø¹ØªÙ…Ø¯Ø©</div>
									<div className="title is-4 has-text-warning mb-0" style=${{ fontWeight: 800 }}>
										${ analytics ? analytics.total_solutions : 0 } â­
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Ù‚Ø§Ø¦Ù…Ø© ØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹ -->
			${ isLoading ? html`
				<div className="py-6 has-text-centered">
					<${Loader} text="Ø¬Ø§Ø±ÙŠ Ø¥Ø¹Ø¯Ø§Ø¯ ÙˆØªØ­Ù…ÙŠÙ„ Ø³Ø¬Ù„Ø§Øª ÙˆØªÙ‚Ø§Ø±ÙŠØ± Ø§Ù„Ù…Ø´Ø§Ø±ÙŠØ¹..." />
				</div>
			` : filteredProjects.length === 0 ? html`
				<div className="box wp-card has-text-centered py-6">
					<span className="icon is-large has-text-grey-light mb-3">
						<i className="dashicons dashicons-analytics" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h3 className="title is-5 has-text-grey mb-1">Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø´Ø§Ø±ÙŠØ¹ Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ø¨Ø­Ø«</h3>
					<p className="subtitle is-6 has-text-grey-light">Ø¬Ø±Ø¨ ØªØºÙŠÙŠØ± Ø´Ø±ÙˆØ· Ø§Ù„ÙÙ„ØªØ±Ø© Ø£Ùˆ Ø§Ù„Ø¨Ø­Ø« Ø¹Ù† Ù…Ø´Ø±ÙˆØ¹ Ø¢Ø®Ø±.</p>
				</div>
			` : html`
				<div className="columns is-multiline">
					${ filteredProjects.map( ( project ) => {
						const isComplete = project.is_completed || project.status === 'completed';
						const completionRate = project.completion_rate || ( project.tasks_count > 0 ? Math.round( ( ( project.completed_tasks_count || 0 ) / project.tasks_count ) * 100 ) : 0 );

						return html`
							<div className="column is-6" key=${ project.id }>
								<div className="box wp-card h-100 is-flex is-flex-direction-column is-justify-content-space-between p-5" style=${{ borderTop: isComplete ? '4px solid #10b981' : '4px solid #3b82f6' }}>
									<div>
										<div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-3">
											<div>
												<span className="tag is-dark is-rounded is-small has-text-weight-bold ml-2">
													${ project.prefix || 'PRJ' }
												</span>
												${ isComplete ? html`
													<span className="tag is-success is-light is-rounded is-small has-text-weight-bold">
														Ù…ÙƒØªÙ…Ù„ ÙˆØ¬Ø§Ù‡Ø² Ù„Ù„ØªØ³Ù„ÙŠÙ…
													</span>
												` : html`
													<span className="tag is-info is-light is-rounded is-small has-text-weight-bold">
														Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ° (${ completionRate }%)
													</span>
												` }
											</div>
											<span className="is-size-7 has-text-grey">
												ID: #${ project.id }
											</span>
										</div>

										<h3 className="title is-5 mb-2" style=${{ fontWeight: 700 }}>
											<a href=${ `#/projects/${ project.id }` } className="has-text-dark wp-hover-primary">
												${ project.name }
											</a>
										</h3>

										<p className="is-size-7 has-text-grey mb-4" style=${{ lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
											${ project.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ Ù…Ø¯ÙˆÙ† Ù„Ù„Ù…Ø´Ø±ÙˆØ¹.' }
										</p>

										<!-- Ø´Ø±ÙŠØ· Ø§Ù„ØªÙ‚Ø¯Ù… ÙˆØ§Ù„Ù…Ø¤Ø´Ø±Ø§Øª Ø§Ù„Ø³Ø±ÙŠØ¹Ø© -->
										<div className="mb-4">
											<div className="is-flex is-justify-content-space-between is-size-7 mb-1">
												<span className="has-text-weight-semibold">Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²</span>
												<span className="has-text-weight-bold has-text-dark">${ completionRate }%</span>
											</div>
											<progress
												className=${ `progress is-small ${ isComplete ? 'is-success' : 'is-info' }` }
												value=${ completionRate }
												max="100"
												style=${{ height: '6px' }}
											>
												${ completionRate }%
											</progress>
										</div>

										<div className="columns is-mobile is-multiline is-variable is-1 is-size-7 has-text-grey mb-3">
											<div className="column is-6">
												<span>Ù‚Ø§Ø¦Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹: </span>
												<strong className="has-text-dark">${ project.lead ? project.lead.display_name : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' }</strong>
											</div>
											<div className="column is-6">
												<span>Ø§Ù„Ù…Ù‡Ø§Ù…: </span>
												<strong className="has-text-dark">${ project.completed_tasks_count || 0 } / ${ project.tasks_count || 0 }</strong>
											</div>
										</div>
									</div>

									<!-- Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡Ø§Øª ÙˆØ§Ù„ØªÙ‚Ø§Ø±ÙŠØ± -->
									<div className="pt-3" style=${{ borderTop: '1px solid #f1f5f9' }}>
										<div className="buttons is-flex is-align-items-center is-justify-content-space-between mb-0">
											<div className="is-flex" style=${{ gap: '6px' }}>
												<button
													className="button is-primary is-small wp-btn"
													onClick=${ () => openReport( project, 'report' ) }
													title="Ø§Ø³ØªØ¹Ø±Ø§Ø¶ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ ÙˆØ·Ø¨Ø§Ø¹Ø© PDF"
												>
													<span className="icon is-small"><i className="dashicons dashicons-media-document"></i></span>
													<span className="has-text-weight-bold">Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ (A4)</span>
												</button>

												<button
													className="button is-dark is-small wp-btn"
													onClick=${ () => openReport( project, 'knowledge_book' ) }
													title="ØªØµØ¯ÙŠØ± ÙƒØªÙŠØ¨ Ø§Ù„Ù…Ø¹Ø±ÙØ© Ø§Ù„Ù…Ø¬Ù…Ø¹ Ø¨ØªÙ†Ø³ÙŠÙ‚ Markdown"
												>
													<span className="icon is-small"><i className="dashicons dashicons-book"></i></span>
													<span>ÙƒØªÙŠØ¨ Ø§Ù„Ù…Ø¹Ø±ÙØ© (.md)</span>
												</button>
											</div>

											<a
												href=${ `#/projects/${ project.id }` }
												className="button is-light is-small"
												title="Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù„ØºØ±ÙØ© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹"
											>
												<span className="icon is-small"><i className="dashicons dashicons-arrow-left-alt"></i></span>
											</a>
										</div>
									</div>
								</div>
							</div>
						`;
					} ) }
				</div>
			` }

			<!-- Ù†Ø§ÙØ°Ø© Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ Ø§Ù„Ø´Ø§Ù…Ù„Ø© -->
			<${ReportModal}
				isActive=${ Boolean( selectedProject ) }
				onClose=${ () => setSelectedProject( null ) }
				projectId=${ selectedProject ? selectedProject.id : null }
				projectName=${ selectedProject ? selectedProject.name : '' }
			/>
		</div>
	`;
}
