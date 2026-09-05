import { html, useState, useEffect, __, isRtl } from '../utils/html.js';
import { broadcastsApi } from '../api/client.js';
import BroadcastDetailModal from '../components/broadcasts/BroadcastDetailModal.js';
import BroadcastModal from '../components/broadcasts/BroadcastModal.js';

/**
 * Broadcasts & Operational Alerts Hub Page Component
 *
 * Route: #/broadcasts
 * Executive command center displaying all live stream alerts,
 * managerial directives management, and automated triggers engine rules.
 *
 * @package WorkPress
 * @subpackage Pages
 * @version 2.5.0
 */
export default function BroadcastsPage() {
	const [ activeTab, setActiveTab ] = useState( 'stream' ); // 'stream' | 'directives' | 'rules'
	const [ streamItems, setStreamItems ] = useState( [] );
	const [ directives, setDirectives ] = useState( [] );
	const [ rules, setRules ] = useState( {
		deadlines_enabled: true,
		deadlines_threshold_hours: 48,
		overdue_enabled: true,
		celebrations_enabled: true,
		triage_pending_enabled: true,
		unassigned_enabled: true,
		slide_interval_seconds: 7,
	} );

	const [ streamFilter, setStreamFilter ] = useState( 'all' ); // 'all' | 'urgent' | 'directive' | 'overdue' | 'deadline' | 'celebration'
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isSavingRules, setIsSavingRules ] = useState( false );
	const [ rulesFeedback, setRulesFeedback ] = useState( '' );

	// Modals state
	const [ selectedBroadcast, setSelectedBroadcast ] = useState( null );
	const [ isDetailModalOpen, setIsDetailModalOpen ] = useState( false );
	const [ editingBroadcast, setEditingBroadcast ] = useState( null );
	const [ isEditModalOpen, setIsEditModalOpen ] = useState( false );

	const rtl = isRtl();

	// Load live stream
	const loadStream = async () => {
		try {
			const data = await broadcastsApi.getStream();
			setStreamItems( Array.isArray( data ) ? data : [] );
		} catch ( err ) {
			console.error( 'Error fetching stream:', err );
		}
	};

	// Load directives
	const loadDirectives = async () => {
		try {
			const res = await broadcastsApi.list( { status: 'all' } );
			setDirectives( res && Array.isArray( res.items ) ? res.items : [] );
		} catch ( err ) {
			console.error( 'Error fetching directives:', err );
		}
	};

	// Load rules
	const loadRules = async () => {
		try {
			const data = await broadcastsApi.getRules();
			if ( data ) setRules( data );
		} catch ( err ) {
			console.error( 'Error fetching rules:', err );
		}
	};

	const refreshAll = async () => {
		setIsLoading( true );
		await Promise.all( [ loadStream(), loadDirectives(), loadRules() ] );
		setIsLoading( false );
	};

	useEffect( () => {
		refreshAll();
	}, [] );

	// Save automated engine rules
	const handleSaveRules = async ( e ) => {
		if ( e ) e.preventDefault();
		setIsSavingRules( true );
		setRulesFeedback( '' );
		try {
			const updated = await broadcastsApi.updateRules( rules );
			setRules( updated );
			setRulesFeedback( __( 'Broadcast engine rules saved and applied successfully.', 'workpress' ) );
			// Refresh stream to reflect new rule state
			await loadStream();
			window.dispatchEvent( new CustomEvent( 'workpress_broadcast_stream_updated' ) );
			setTimeout( () => setRulesFeedback( '' ), 4000 );
		} catch ( err ) {
			setRulesFeedback( err.message || __( 'An error occurred while saving settings.', 'workpress' ) );
		} finally {
			setIsSavingRules( false );
		}
	};

	// Delete directive
	const handleDeleteDirective = async ( id ) => {
		if ( ! window.confirm( __( 'Are you sure you want to permanently delete this managerial directive?', 'workpress' ) ) ) {
			return;
		}
		try {
			await broadcastsApi.delete( id );
			await Promise.all( [ loadDirectives(), loadStream() ] );
			window.dispatchEvent( new CustomEvent( 'workpress_broadcast_stream_updated' ) );
		} catch ( err ) {
			alert( err.message || __( 'Failed to delete directive.', 'workpress' ) );
		}
	};

	// Filtered stream items
	const filteredStream = streamItems.filter( ( item ) => {
		if ( streamFilter === 'all' ) return true;
		if ( streamFilter === 'urgent' ) return item.priority === 'urgent';
		if ( streamFilter === 'directive' ) return item.type === 'directive' || item.category === 'directive';
		return item.category === streamFilter;
	} );

	// Counts
	const urgentCount = streamItems.filter( ( item ) => item.priority === 'urgent' ).length;
	const activeDirectivesCount = directives.filter( ( d ) => d.status === 'active' ).length;

	return html`
		<div className="wp-broadcasts-page py-4" style=${{ textAlign: rtl ? 'right' : 'left' }}>
			<!-- Page Executive Header -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-5 is-flex-wrap-wrap" style=${{ gap: '16px' }}>
				<div>
					<div className="is-flex is-align-items-center mb-1" style=${{ gap: '10px' }}>
						<span className="icon is-medium has-text-primary">
							<i className="dashicons dashicons-megaphone" style=${{ fontSize: '26px', width: '26px', height: '26px' }}></i>
						</span>
						<h1 className="title is-4 mb-0" style=${{ color: '#0f172a', fontWeight: 800 }}>
							${ __( 'Broadcasts & Operational Alerts Hub', 'workpress' ) }
						</h1>
					</div>
					<p className="subtitle is-6 has-text-grey mb-0">
						${ __( 'Live operational horizon for managerial directives, upcoming milestones, and preemptive task alerts.', 'workpress' ) }
					</p>
				</div>

				<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
					<button
						type="button"
						className="button is-light is-small"
						onClick=${ refreshAll }
						disabled=${ isLoading }
						style=${{ borderRadius: 0 }}
					>
						<span className=${ `icon ${ isLoading ? 'is-loading' : '' }` }><i className="dashicons dashicons-update"></i></span>
						<span>${ __( 'Refresh Data', 'workpress' ) }</span>
					</button>

					<button
						type="button"
						className="button is-primary is-small"
						onClick=${ () => { setEditingBroadcast( null ); setIsEditModalOpen( true ); } }
						style=${{ borderRadius: 0, fontWeight: 700 }}
					>
						<span className="icon"><i className="dashicons dashicons-plus"></i></span>
						<span>${ __( 'Publish New Managerial Directive', 'workpress' ) }</span>
					</button>
				</div>
			</div>

			<!-- Quick KPI Cards -->
			<div className="columns mb-4">
				<div className="column is-4">
					<div className="box p-3 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', gap: '14px' }}>
						<div
							className="is-flex is-align-items-center is-justify-content-center"
							style=${{ width: '42px', height: '42px', backgroundColor: '#e0f2fe', color: '#0369a1' }}
						>
							<i className="dashicons dashicons-rss" style=${{ fontSize: '22px', width: '22px', height: '22px' }}></i>
						</div>
						<div>
							<div className="is-size-7 has-text-grey">${ __( 'Total Live Horizon Alerts', 'workpress' ) }</div>
							<div className="title is-5 mb-0" style=${{ color: '#0f172a', fontWeight: 800 }}>
								${ streamItems.length }
							</div>
						</div>
					</div>
				</div>

				<div className="column is-4">
					<div className="box p-3 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', gap: '14px' }}>
						<div
							className="is-flex is-align-items-center is-justify-content-center"
							style=${{ width: '42px', height: '42px', backgroundColor: '#fee2e2', color: '#b91c1c' }}
						>
							<i className="dashicons dashicons-warning" style=${{ fontSize: '22px', width: '22px', height: '22px' }}></i>
						</div>
						<div>
							<div className="is-size-7 has-text-grey">${ __( 'Urgent & Critical Alerts', 'workpress' ) }</div>
							<div className="title is-5 mb-0" style=${{ color: '#b91c1c', fontWeight: 800 }}>
								${ urgentCount }
							</div>
						</div>
					</div>
				</div>

				<div className="column is-4">
					<div className="box p-3 is-flex is-align-items-center" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', gap: '14px' }}>
						<div
							className="is-flex is-align-items-center is-justify-content-center"
							style=${{ width: '42px', height: '42px', backgroundColor: '#ede9fe', color: '#6d28d9' }}
						>
							<i className="dashicons dashicons-megaphone" style=${{ fontSize: '22px', width: '22px', height: '22px' }}></i>
						</div>
						<div>
							<div className="is-size-7 has-text-grey">${ __( 'Active Managerial Directives', 'workpress' ) }</div>
							<div className="title is-5 mb-0" style=${{ color: '#6d28d9', fontWeight: 800 }}>
								${ activeDirectivesCount }
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Executive Sharp Navigation Tabs -->
			<div className="tabs is-boxed mb-4" style=${{ borderBottom: '2px solid #0f172a' }}>
				<ul style=${{ margin: 0 }}>
					<li className=${ activeTab === 'stream' ? 'is-active' : '' }>
						<a
							onClick=${ () => setActiveTab( 'stream' ) }
							style=${{
								borderRadius: 0,
								fontWeight: activeTab === 'stream' ? 700 : 500,
								color: activeTab === 'stream' ? '#0f172a' : '#64748b',
							}}
						>
							<span className="icon is-small"><i className="dashicons dashicons-visibility"></i></span>
							<span>${ __( 'Live Horizon Stream', 'workpress' ) }</span>
							<span className="tag is-rounded is-small ms-2" style=${{ borderRadius: 0, backgroundColor: '#e2e8f0' }}>${ streamItems.length }</span>
						</a>
					</li>
					<li className=${ activeTab === 'directives' ? 'is-active' : '' }>
						<a
							onClick=${ () => setActiveTab( 'directives' ) }
							style=${{
								borderRadius: 0,
								fontWeight: activeTab === 'directives' ? 700 : 500,
								color: activeTab === 'directives' ? '#0f172a' : '#64748b',
							}}
						>
							<span className="icon is-small"><i className="dashicons dashicons-admin-post"></i></span>
							<span>${ __( 'Manage Managerial Directives', 'workpress' ) }</span>
							<span className="tag is-rounded is-small ms-2" style=${{ borderRadius: 0, backgroundColor: '#e2e8f0' }}>${ directives.length }</span>
						</a>
					</li>
					<li className=${ activeTab === 'rules' ? 'is-active' : '' }>
						<a
							onClick=${ () => setActiveTab( 'rules' ) }
							style=${{
								borderRadius: 0,
								fontWeight: activeTab === 'rules' ? 700 : 500,
								color: activeTab === 'rules' ? '#0f172a' : '#64748b',
							}}
						>
							<span className="icon is-small"><i className="dashicons dashicons-admin-generic"></i></span>
							<span>${ __( 'Automated Alert Rules & Triggers', 'workpress' ) }</span>
						</a>
					</li>
				</ul>
			</div>

			<!-- Tab 1 Content: Live Horizon Stream -->
			${ activeTab === 'stream' && html`
				<div>
					<!-- Stream Category Filter -->
					<div className="is-flex is-align-items-center mb-4 is-flex-wrap-wrap" style=${{ gap: '8px' }}>
						<span className="is-size-7 has-text-weight-bold has-text-grey" style=${{ marginInlineEnd: '4px' }}>
							${ __( 'Filter Horizon:', 'workpress' ) }
						</span>
						${ [
							{ key: 'all', label: __( 'All', 'workpress' ) },
							{ key: 'urgent', label: __( 'Urgent & Critical', 'workpress' ) },
							{ key: 'directive', label: __( 'Managerial Directives', 'workpress' ) },
							{ key: 'overdue', label: __( 'Overdue Tasks', 'workpress' ) },
							{ key: 'deadline', label: __( 'Upcoming Deadlines', 'workpress' ) },
							{ key: 'celebration', label: __( 'Celebrations & Milestones', 'workpress' ) },
							{ key: 'triage', label: __( 'Client Requests Pending Triage', 'workpress' ) },
						].map( ( f ) => html`
							<button
								type="button"
								key=${ f.key }
								className=${ `button is-small ${ streamFilter === f.key ? 'is-dark has-text-weight-bold' : 'is-white' }` }
								onClick=${ () => setStreamFilter( f.key ) }
								style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								${ f.label }
							</button>
						` ) }
					</div>

					${ filteredStream.length === 0 ? html`
						<div className="box has-text-centered py-6" style=${{ borderRadius: 0, border: '1px dashed #cbd5e1' }}>
							<i className="dashicons dashicons-yes-alt has-text-success" style=${{ fontSize: '36px', width: '36px', height: '36px' }}></i>
							<h4 className="title is-6 has-text-grey mt-2 mb-1">${ __( 'No active alerts matching the selected filter.', 'workpress' ) }</h4>
							<p className="is-size-7 has-text-grey-light">${ __( 'All project deliverables and milestones are operating smoothly with zero critical bottlenecks.', 'workpress' ) }</p>
						</div>
					` : html`
						<div className="columns is-multiline">
							${ filteredStream.map( ( item, index ) => html`
								<div key=${ item.id || index } className="column is-6 is-4-widescreen">
									<div className=${ `wp-broadcast-card is-priority-${ item.category === 'celebration' ? 'celebration' : ( item.priority || 'info' ) } p-4` }>
										<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
											<div className="is-flex is-align-items-center" style=${{ gap: '6px' }}>
												<span className=${ `wp-broadcast-pulse ${ item.priority === 'urgent' ? 'is-urgent' : 'is-active' }` }></span>
												<span className=${ `wp-broadcast-badge ${ item.category === 'celebration' ? 'is-celebration' : ( item.priority === 'urgent' ? 'is-urgent' : ( item.priority === 'warning' ? 'is-warning' : ( item.type === 'directive' ? 'is-directive' : 'is-info' ) ) ) }` }>
													${ item.category === 'celebration' ? __( 'Celebration', 'workpress' ) : ( item.priority === 'urgent' ? __( 'Urgent', 'workpress' ) : ( item.priority === 'warning' ? __( 'Warning', 'workpress' ) : ( item.type === 'directive' ? __( 'Directive', 'workpress' ) : __( 'Notice', 'workpress' ) ) ) ) }
												</span>
											</div>
											<span className="is-size-7 has-text-grey">${ item.start_at ? item.start_at.slice( 0, 16 ) : '' }</span>
										</div>

										<h4
											className="title is-6 mb-2"
											style=${{ color: '#0f172a', fontWeight: 700, cursor: 'pointer' }}
											onClick=${ () => { setSelectedBroadcast( item ); setIsDetailModalOpen( true ); } }
										>
											${ item.title }
										</h4>

										<p
											className="is-size-7 mb-4"
											style=${{
												color: '#475569',
												lineHeight: 1.6,
												flexGrow: 1,
												display: '-webkit-box',
												WebkitLineClamp: 3,
												WebkitBoxOrient: 'vertical',
												overflow: 'hidden',
											}}
										>
											${ item.content }
										</p>

										<div className="is-flex is-justify-content-space-between is-align-items-center pt-2" style=${{ borderTop: '1px solid #f1f5f9' }}>
											<button
												type="button"
												className="button is-text is-small p-0"
												onClick=${ () => { setSelectedBroadcast( item ); setIsDetailModalOpen( true ); } }
												style=${{ textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}
											>
												<span>${ __( 'View Full Details', 'workpress' ) }</span>
												<span className="icon"><i className=${ `dashicons ${ rtl ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-right-alt2' }` }></i></span>
											</button>

											${ item.action_url && html`
												<a
													href=${ item.action_url }
													className="button is-light is-small"
													style=${{ borderRadius: 0, fontSize: '0.72rem', height: '26px' }}
												>
													<span className="icon"><i className="dashicons dashicons-external"></i></span>
													<span>${ __( 'Navigate', 'workpress' ) }</span>
												</a>
											` }
										</div>
									</div>
								</div>
							` ) }
						</div>
					` }
				</div>
			` }

			<!-- Tab 2 Content: Manage Managerial Directives -->
			${ activeTab === 'directives' && html`
				<div>
					<div className="box p-0 mb-4" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
						<div className="p-3 has-background-white-ter is-flex is-justify-content-space-between is-align-items-center" style=${{ borderBottom: '1px solid #e2e8f0' }}>
							<span className="has-text-weight-bold is-size-7 has-text-dark">
								${ __( 'Published Managerial Directives & Announcements', 'workpress' ) }
							</span>
							<button
								type="button"
								className="button is-primary is-small"
								onClick=${ () => { setEditingBroadcast( null ); setIsEditModalOpen( true ); } }
								style=${{ borderRadius: 0, fontWeight: 700 }}
							>
								<span className="icon"><i className="dashicons dashicons-plus"></i></span>
								<span>${ __( 'Add Directive', 'workpress' ) }</span>
							</button>
						</div>

						<div className="table-container mb-0">
							<table className="table is-fullwidth is-hoverable is-striped mb-0" style=${{ fontSize: '0.85rem' }}>
								<thead>
									<tr style=${{ backgroundColor: '#f8fafc' }}>
										<th>${ __( 'Title & Content', 'workpress' ) }</th>
										<th style=${{ width: '110px' }}>${ __( 'Priority', 'workpress' ) }</th>
										<th style=${{ width: '100px' }}>${ __( 'Status', 'workpress' ) }</th>
										<th style=${{ width: '140px' }}>${ __( 'Publisher & Date', 'workpress' ) }</th>
										<th style=${{ width: '130px' }}>${ __( 'Validity', 'workpress' ) }</th>
										<th style=${{ width: '120px', textAlign: 'center' }}>${ __( 'Actions', 'workpress' ) }</th>
									</tr>
								</thead>
								<tbody>
									${ directives.length === 0 ? html`
										<tr>
											<td colSpan="6" className="has-text-centered py-5 has-text-grey">
												${ __( 'No managerial directives published yet. Click Add Directive to get started.', 'workpress' ) }
											</td>
										</tr>
									` : directives.map( ( dir ) => html`
										<tr key=${ dir.id }>
											<td>
												<div
													className="has-text-weight-bold has-text-dark mb-1"
													style=${{ cursor: 'pointer' }}
													onClick=${ () => { setSelectedBroadcast( dir ); setIsDetailModalOpen( true ); } }
												>
													${ dir.title }
												</div>
												<div className="is-size-7 has-text-grey" style=${{ maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
													${ dir.content }
												</div>
											</td>
											<td>
												<span className=${ `wp-broadcast-badge ${ dir.priority === 'urgent' ? 'is-urgent' : ( dir.priority === 'warning' ? 'is-warning' : 'is-info' ) }` }>
													${ dir.priority === 'urgent' ? __( 'Urgent', 'workpress' ) : ( dir.priority === 'warning' ? __( 'Warning', 'workpress' ) : __( 'Notice', 'workpress' ) ) }
												</span>
											</td>
											<td>
												<span className=${ `tag is-small ${ dir.status === 'active' ? 'is-success' : ( dir.status === 'scheduled' ? 'is-info' : 'is-light' ) }` } style=${{ borderRadius: 0 }}>
													${ dir.status === 'active' ? __( 'Active', 'workpress' ) : ( dir.status === 'scheduled' ? __( 'Scheduled', 'workpress' ) : ( dir.status === 'expired' ? __( 'Expired', 'workpress' ) : __( 'Archived', 'workpress' ) ) ) }
												</span>
											</td>
											<td>
												<div className="is-size-7 has-text-dark">${ dir.author_name || '—' }</div>
												<div className="is-size-7 has-text-grey">${ dir.created_at ? dir.created_at.slice( 0, 10 ) : '' }</div>
											</td>
											<td className="is-size-7 has-text-grey">
												${ dir.expires_at ? dir.expires_at.slice( 0, 16 ) : __( 'Permanent (No expiry)', 'workpress' ) }
											</td>
											<td style=${{ textAlign: 'center' }}>
												<div className="buttons is-centered is-small are-small mb-0" style=${{ flexWrap: 'nowrap' }}>
													<button
														type="button"
														className="button is-light"
														onClick=${ () => { setEditingBroadcast( dir ); setIsEditModalOpen( true ); } }
														title=${ __( 'Edit', 'workpress' ) }
														style=${{ borderRadius: 0 }}
													>
														<i className="dashicons dashicons-edit"></i>
													</button>
													<button
														type="button"
														className="button is-danger is-light"
														onClick=${ () => handleDeleteDirective( dir.id ) }
														title=${ __( 'Delete', 'workpress' ) }
														style=${{ borderRadius: 0 }}
													>
														<i className="dashicons dashicons-trash"></i>
													</button>
												</div>
											</td>
										</tr>
									` ) }
								</tbody>
							</table>
						</div>
					</div>
				</div>
			` }

			<!-- Tab 3 Content: Automated Engine Rules -->
			${ activeTab === 'rules' && html`
				<div className="box p-5" style=${{ borderRadius: 0, border: '1px solid #e2e8f0', maxWidth: '850px' }}>
					<h3 className="title is-5 mb-2" style=${{ color: '#0f172a' }}>
						${ __( 'Smart Alerts Engine Rules & Automation', 'workpress' ) }
					</h3>
					<p className="subtitle is-6 has-text-grey mb-5">
						${ __( 'Configure automated algorithmic triggers that monitor project milestones and broadcast urgent status.', 'workpress' ) }
					</p>

					${ rulesFeedback && html`
						<div className="notification is-success is-light p-3 mb-4" style=${{ borderRadius: 0, fontSize: '0.85rem' }}>
							${ rulesFeedback }
						</div>
					` }

					<form onSubmit=${ handleSaveRules }>
						<!-- Overdue Tasks -->
						<div className="field mb-4 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="checkbox has-text-weight-bold" style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<input
									type="checkbox"
									checked=${ rules.overdue_enabled }
									onChange=${ ( e ) => setRules( { ...rules, overdue_enabled: e.target.checked } ) }
								/>
								<span>${ __( 'Enable overdue task alerts (Overdue Tasks Alert)', 'workpress' ) }</span>
							</label>
							<p className="help is-size-7 has-text-grey mt-1 ms-4">
								${ __( 'The system detects tasks whose deadline has passed without completion and broadcasts them as urgent warnings.', 'workpress' ) }
							</p>
						</div>

						<!-- Upcoming Deadlines -->
						<div className="field mb-4 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="checkbox has-text-weight-bold" style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<input
									type="checkbox"
									checked=${ rules.deadlines_enabled }
									onChange=${ ( e ) => setRules( { ...rules, deadlines_enabled: e.target.checked } ) }
								/>
								<span>${ __( 'Enable upcoming deadline alerts (Upcoming Deadlines Alert)', 'workpress' ) }</span>
							</label>
							<div className="mt-2 ms-4 is-flex is-align-items-center" style=${{ gap: '10px' }}>
								<span className="is-size-7 has-text-dark">${ __( 'Trigger alert before deadline by:', 'workpress' ) }</span>
								<input
									type="number"
									min="1"
									max="168"
									className="input is-small"
									style=${{ width: '80px', borderRadius: 0 }}
									value=${ rules.deadlines_threshold_hours }
									onChange=${ ( e ) => setRules( { ...rules, deadlines_threshold_hours: parseInt( e.target.value, 10 ) || 24 } ) }
								/>
								<span className="is-size-7 has-text-grey">${ __( 'hours', 'workpress' ) }</span>
							</div>
						</div>

						<!-- Celebration Broadcasts -->
						<div className="field mb-4 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="checkbox has-text-weight-bold" style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<input
									type="checkbox"
									checked=${ rules.celebrations_enabled }
									onChange=${ ( e ) => setRules( { ...rules, celebrations_enabled: e.target.checked } ) }
								/>
								<span>${ __( 'Enable project celebration broadcasts (Celebration Broadcasts)', 'workpress' ) }</span>
							</label>
							<p className="help is-size-7 has-text-grey mt-1 ms-4">
								${ __( 'Broadcasts automated congratulations to team members upon 100% project completion.', 'workpress' ) }
							</p>
						</div>

						<!-- Triage Pending -->
						<div className="field mb-4 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="checkbox has-text-weight-bold" style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<input
									type="checkbox"
									checked=${ rules.triage_pending_enabled }
									onChange=${ ( e ) => setRules( { ...rules, triage_pending_enabled: e.target.checked } ) }
								/>
								<span>${ __( 'Enable client requests triage alerts (Triage Alert)', 'workpress' ) }</span>
							</label>
						</div>

						<!-- Unassigned Tasks -->
						<div className="field mb-4 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="checkbox has-text-weight-bold" style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<input
									type="checkbox"
									checked=${ rules.unassigned_enabled }
									onChange=${ ( e ) => setRules( { ...rules, unassigned_enabled: e.target.checked } ) }
								/>
								<span>${ __( 'Enable unassigned active task alerts (Unassigned Tasks Alert)', 'workpress' ) }</span>
							</label>
						</div>

						<!-- Rotation Interval -->
						<div className="field mb-5 p-3 has-background-white-ter" style=${{ border: '1px solid #e2e8f0' }}>
							<label className="label is-small mb-1">${ __( 'Alert rotation display duration in ticker (seconds):', 'workpress' ) }</label>
							<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
								<input
									type="number"
									min="3"
									max="30"
									className="input is-small"
									style=${{ width: '80px', borderRadius: 0 }}
									value=${ rules.slide_interval_seconds }
									onChange=${ ( e ) => setRules( { ...rules, slide_interval_seconds: parseInt( e.target.value, 10 ) || 7 } ) }
								/>
								<span className="is-size-7 has-text-grey">${ __( 'seconds (automatically pauses on hover)', 'workpress' ) }</span>
							</div>
						</div>

						<div className="field">
							<button
								type="submit"
								className=${ `button is-primary ${ isSavingRules ? 'is-loading' : '' }` }
								disabled=${ isSavingRules }
								style=${{ borderRadius: 0, fontWeight: 700 }}
							>
								<span className="icon"><i className="dashicons dashicons-saved"></i></span>
								<span>${ __( 'Save & Update Broadcast Rules', 'workpress' ) }</span>
							</button>
						</div>
					</form>
				</div>
			` }

			<!-- Embedded Modals -->
			<${BroadcastDetailModal}
				isActive=${ isDetailModalOpen }
				onClose=${ () => setIsDetailModalOpen( false ) }
				broadcast=${ selectedBroadcast }
			/>

			<${BroadcastModal}
				isActive=${ isEditModalOpen }
				onClose=${ () => setIsEditModalOpen( false ) }
				broadcast=${ editingBroadcast }
				onSaved=${ async () => {
					await Promise.all( [ loadDirectives(), loadStream() ] );
				} }
			/>
		</div>
	`;
}
