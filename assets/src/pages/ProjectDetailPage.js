import { html, useState, useEffect } from '../utils/html.js';
import { projectsApi, tasksApi } from '../api/client.js';
import { formatDate } from '../utils/datetime.js';
import FilterBar from '../components/ui/FilterBar.js';
import Loader from '../components/ui/Loader.js';
import ReportModal from '../components/modals/Modal.js';
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
			toast( 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¬Ù„Ø¨ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø´Ø±ÙˆØ¹', 'danger' );
		}).finally( () => setIsLoading( false ) );
	};

	useEffect( () => {
		fetchProjectData();
	}, [ projectId, refreshKey ] );

	if ( isLoading ) {
		return html`
			<div className="py-6 mt-4">
				<${Loader} center=${true} label="Ø¬Ø§Ø±ÙŠ Ø§Ø³ØªØ¹Ø±Ø§Ø¶ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹..." size="large" />
			</div>
		`;
	}

	if ( ! project ) {
		return html`<div className="has-text-centered py-6"><p className="has-text-danger">Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯ Ø£Ùˆ Ù„ÙŠØ³ Ù„Ø¯ÙŠÙƒ ØµÙ„Ø§Ø­ÙŠØ© Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„ÙŠÙ‡.</p></div>`;
	}

	// Calculate stats
	const totalTasks = tasks.length;
	const completedTasks = tasks.filter( t => t.status === 'completed' || t.status === 'closed' ).length;
	const completionRate = totalTasks > 0 ? Math.round( (completedTasks / totalTasks) * 100 ) : 0;
	const isProjectCompleted = project.is_completed || project.status === 'completed' || (totalTasks > 0 && completedTasks === totalTasks);
	
	const openTasks = tasks.filter( t => t.status === 'open' ).length;
	const inProgressTasks = tasks.filter( t => t.status === 'in_progress' || t.status === 'in_review' ).length;

	const taskStatusOptions = [
		{ value: 'all', label: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª' },
		{ value: 'open', label: 'Ù…ÙØªÙˆØ­Ø© / Ø¬Ø¯ÙŠØ¯Ø©' },
		{ value: 'assigned', label: 'Ù…Ø³Ù†Ø¯Ø©' },
		{ value: 'in_progress', label: 'Ù‚ÙŠØ¯ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø²' },
		{ value: 'completed', label: 'Ù…ÙƒØªÙ…Ù„Ø©' }
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
			toast('ØªÙ… Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªØ£Ø³ÙŠØ³ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ù†Ø¬Ø§Ø­! Ø£ØµØ¨Ø­ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù†Ø´Ø·Ø§Ù‹ Ø§Ù„Ø¢Ù†', 'success');
			sound.play('celebration');
			fetchProjectData();
		}).catch(err => {
			setIsApproving(false);
			console.error(err);
			toast(err.message || 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ø¹ØªÙ…Ø§Ø¯ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹', 'danger');
			sound.play('caution');
		});
	};

	return html`
		<div className="mt-4">
			<div className="mb-4 is-flex is-justify-content-space-between is-align-items-center">
				<div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
					<a href="#/projects" className="button is-small is-light wp-icon-button" style=${{ borderRadius: 0, border: '2px solid #0f172a' }} title="Ø§Ù„Ø¹ÙˆØ¯Ø© Ù„Ù„Ù…Ø´Ø§Ø±ÙŠØ¹">
						<span className="icon"><i className="dashicons dashicons-arrow-right-alt2"></i></span>
					</a>

					<button
						className="button is-small is-dark wp-sharp-button"
						onClick=${ () => { setIsReportModalOpen( true ); sound.play( 'pop' ); } }
						style=${{ fontWeight: '700', backgroundColor: '#0f172a', borderColor: '#0f172a' }}
						title="Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ Ø§Ù„Ø±Ø³Ù…ÙŠ ÙˆÙƒØªØ§Ø¨ Ø§Ù„Ù…Ø¹Ø±ÙØ©"
					>
						<span className="icon"><i className="dashicons dashicons-media-document"></i></span>
						<span>Ø§Ù„ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ ÙˆÙƒØªØ§Ø¨ Ø§Ù„Ù…Ø¹Ø±ÙØ©</span>
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
						<span>Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØªØ£Ø³ÙŠØ³ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø±Ø³Ù…ÙŠØ§Ù‹</span>
					</button>
				` : null }
			</div>
			
			<div className="columns is-variable is-6">
				<!-- Ø¹Ù…ÙˆØ¯ Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© -->
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
										Ø·Ù„Ø¨ Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø¹Ù…ÙŠÙ„
									</span>
								` : null }

								${ isProjectCompleted ? html`
									<span className="tag is-success has-text-weight-bold" style=${{ borderRadius: 0 }}>
										<i className="dashicons dashicons-awards ml-1"></i> Ù…ÙƒØªÙ…Ù„ (${ project.progress || 100 }%)
									</span>
								` : null }
							</div>
							
							<div className="content has-text-grey-dark" dangerouslySetInnerHTML=${{ __html: project.description || 'Ù„Ø§ ÙŠÙˆØ¬Ø¯ ÙˆØµÙ Ù…ØªØ§Ø­.' }}></div>
							
							<div className="is-flex is-flex-wrap-wrap mt-5 pt-4" style=${{ borderTop: '1px solid #ededed', gap: '2rem' }}>
								<div>
									<span className="heading has-text-grey mb-1">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø¡</span>
									<span className="has-text-weight-bold">${ project.start_at ? formatDate(project.start_at) : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' }</span>
								</div>
								<div>
									<span className="heading has-text-grey mb-1">ØªØ§Ø±ÙŠØ® Ø§Ù„ØªØ³Ù„ÙŠÙ…</span>
									<span className="has-text-weight-bold">${ project.due_at ? formatDate(project.due_at) : (project.requested_due_date ? formatDate(project.requested_due_date) : 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯') }</span>
								</div>
								${ project.requested_budget ? html`
									<div>
										<span className="heading has-text-grey mb-1">Ø§Ù„Ù…ÙŠØ²Ø§Ù†ÙŠØ© Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø©</span>
										<span className="has-text-weight-bold has-text-success">${ project.requested_budget }</span>
									</div>
								` : null }
								<div>
									<span className="heading has-text-grey mb-1">Ø§Ù„Ø­Ø§Ù„Ø©</span>
									<span className=${`tag ${ isProjectCompleted ? 'is-success' : (project.status === 'active' ? 'is-info' : (project.status === 'pending' ? 'is-warning' : (project.status === 'archived' ? 'is-dark' : project.status))) }`} style=${{ borderRadius: 0 }}>
										${ isProjectCompleted ? 'Ù…ÙƒØªÙ…Ù„' : (project.status === 'active' ? 'Ù†Ø´Ø·' : (project.status === 'pending' ? 'Ø·Ù„Ø¨ Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©' : (project.status === 'archived' ? 'Ù…Ø¤Ø±Ø´Ù' : project.status))) }
									</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ù…ÙˆØ§ØµÙØ§Øª ÙˆØ§Ù„Ù…ØªØ·Ù„Ø¨Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© Ù„Ù„Ø·Ù„Ø¨ (Client Specifications Vault) -->
					${ (project.is_client_request && ((project.request_specs && Object.keys(project.request_specs).length > 0) || (project.request_attachments && project.request_attachments.length > 0))) ? html`
						<div className="box wp-card p-5 mb-5" style=${{ border: '1.5px solid #6366f1', backgroundColor: '#f8fafc', boxShadow: '0 4px 12px rgba(99,102,241,0.06)' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #e2e8f0' }}>
								<h3 className="title is-5 mb-0 has-text-primary is-flex is-align-items-center" style=${{ gap: '8px' }}>
									<span className="icon is-small"><i className="dashicons dashicons-portfolio"></i></span>
									<span>Ø®Ø²ÙŠÙ†Ø© Ø§Ù„Ù…ÙˆØ§ØµÙØ§Øª ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„Ù…Ø³ØªÙ„Ù…Ø© Ù…Ù† Ø§Ù„Ø¹Ù…ÙŠÙ„ (Client Specs Vault)</span>
								</h3>
								<span className="tag is-primary is-light" style=${{ fontWeight: '800' }}>
									${ project.request_form_id ? `Ù‚Ø§Ù„Ø¨: ${project.request_form_id}` : 'Ø·Ù„Ø¨ Ù…Ù‡ÙŠÙƒÙ„' }
								</span>
							</div>

							${ (project.request_specs && Object.keys(project.request_specs).length > 0) ? html`
								<div className="columns is-multiline mb-3">
									${ Object.entries(project.request_specs).map(([specKey, specVal]) => {
										let displayVal = specVal;
										if (Array.isArray(specVal)) {
											displayVal = specVal.join(' ØŒ ');
										}
										return html`
											<div key=${specKey} className="column is-6">
												<div className="p-3" style=${{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', height: '100%' }}>
													<span className="is-size-7 has-text-grey has-text-weight-bold display-block mb-1" style=${{ display: 'block' }}>
														${specKey}
													</span>
													<span className="is-size-6 has-text-weight-bold has-text-dark" style=${{ wordBreak: 'break-word' }}>
														${displayVal || 'â€”'}
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
										<span>Ø§Ù„Ù…Ù„ÙØ§Øª ÙˆØ§Ù„Ù…Ø±ÙÙ‚Ø§Øª Ø§Ù„ÙÙ†ÙŠØ© Ø§Ù„Ù…Ø±ÙÙˆØ¹Ø© Ù…Ù† Ø§Ù„Ø¹Ù…ÙŠÙ„:</span>
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
												<span>${att.name || `Ù…Ø±ÙÙ‚ #${idx + 1}`}</span>
												${ att.size ? html`<span className="is-size-7 has-text-grey">(${att.size})</span>` : null }
											</a>
										`) }
									</div>
								</div>
							` : null }
						</div>
					` : null }

					<!-- Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„ØªØ§Ø¨Ø¹Ø© Ù„Ù„Ù…Ø´Ø±ÙˆØ¹ -->
					<div className="box wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
							<h3 className="title is-4 mb-0">Ù…Ù‡Ø§Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</h3>
							<a href="#/kanban" className="button is-small is-primary wp-card">
								<span className="icon"><i className="dashicons dashicons-columns"></i></span>
								<span>Ø§Ù„ÙƒØ§Ù†Ø¨Ø§Ù†</span>
							</a>
						</div>

						<${FilterBar}
							search=${{
								value: taskSearch,
								onChange: setTaskSearch,
								placeholder: 'Ø¨Ø­Ø« ÙÙŠ Ù…Ù‡Ø§Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹...',
							}}
							filters=${[
								{
									key: 'status',
									label: 'Ø§Ù„Ø­Ø§Ù„Ø©',
									icon: 'dashicons-tag',
									value: taskStatus,
									onChange: setTaskStatus,
									options: taskStatusOptions,
									width: '130px',
								}
							]}
							totalCount=${ filteredProjectTasks.length }
							totalUnfiltered=${ tasks.length }
							counterLabel="Ù…Ù‡Ù…Ø©"
							isFilterActive=${ isTaskFilterActive }
							onReset=${ () => { setTaskSearch(''); setTaskStatus('all'); } }
						/>
						
						${ filteredProjectTasks.length === 0 ? html`
							<div className="has-text-centered p-5 has-background-light" style=${{ border: '1px dashed #cbd5e1', borderRadius: 0 }}>
								<div className="mb-2" style=${{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
									<i className="dashicons dashicons-clipboard has-text-grey" style=${{ fontSize: '24px' }}></i>
								</div>
								<p className="has-text-grey-dark has-text-weight-bold mb-1">${ isTaskFilterActive ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„ÙÙ„ØªØ± Ø§Ù„Ù…Ø­Ø¯Ø¯' : 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… Ù…Ø³Ø¬Ù„Ø© ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ø¹Ø¯' }</p>
								<p className="is-size-7 has-text-grey mb-3">${ isTaskFilterActive ? 'Ø¬Ø±Ø¨ ØªØ¹Ø¯ÙŠÙ„ Ø´Ø±ÙˆØ· Ø§Ù„Ø¨Ø­Ø« Ø£Ùˆ Ø§Ù„ÙÙ„Ø§ØªØ±' : 'ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¨Ø¯Ø¡ Ø¨Ø¥Ø¶Ø§ÙØ© Ù…Ù‡Ø§Ù… Ù„ØªÙˆØ²ÙŠØ¹ Ø§Ù„Ø¹Ù…Ù„ Ø¹Ù„Ù‰ Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„ÙØ±ÙŠÙ‚' }</p>
								<a href="#/kanban" className="button is-small is-primary wp-sharp-button">
									<span className="icon is-small"><i className="dashicons dashicons-plus"></i></span>
									<span>Ø¥Ø¯Ø§Ø±Ø© Ù…Ù‡Ø§Ù… Ø§Ù„ÙƒØ§Ù†Ø¨Ø§Ù†</span>
								</a>
							</div>
						` : html`
							<table className="table is-fullwidth is-hoverable wp-table" style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}>
								<thead>
									<tr style=${{ backgroundColor: '#f8fafc' }}>
										<th>Ø§Ù„Ù…Ø±Ø¬Ø¹</th>
										<th>Ø§Ù„Ù…Ù‡Ù…Ø©</th>
										<th>Ø§Ù„Ø­Ø§Ù„Ø©</th>
										<th>Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©</th>
									</tr>
								</thead>
								<tbody>
									${ filteredProjectTasks.map( task => html`
										<tr key=${task.id} style=${{ cursor: 'pointer' }} onClick=${() => window.location.hash = '#/tasks/' + task.id}>
											<td className="has-text-grey has-text-weight-bold">${ task.ref_key }</td>
											<td className="has-text-weight-bold">${ task.title }</td>
											<td>
												<span className=${`tag is-light ${ task.status === 'completed' || task.status === 'closed' ? 'is-success' : (task.status === 'open' ? 'is-info' : 'is-warning') }`} style=${{ borderRadius: 0 }}>
													${ task.status === 'completed' || task.status === 'closed' ? 'Ù…ÙƒØªÙ…Ù„Ø©' : task.status === 'open' ? 'Ù…ÙØªÙˆØ­Ø©' : 'Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ°' }
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
				
				<!-- Ø§Ù„Ø¹Ù…ÙˆØ¯ Ø§Ù„Ø¬Ø§Ù†Ø¨ÙŠ -->
				<div className="column is-4">
					<!-- Ø¥Ø­ØµØ§Ø¦ÙŠØ§Øª Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² -->
					<div className="box wp-card p-5 mb-5">
						<h3 className="title is-5 mb-4 has-text-weight-bold">ØªÙ‚Ø¯Ù… Ø§Ù„Ø¹Ù…Ù„</h3>
						
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
							<span className="has-text-weight-bold is-size-3 has-text-primary">${ completionRate }%</span>
							<span className="has-text-grey">Ù…ÙƒØªÙ…Ù„</span>
						</div>
						
						<progress className="progress is-primary mb-5" value=${ completionRate } max="100" style=${{ borderRadius: 0, height: '8px' }}>${ completionRate }%</progress>
						
						<div className="columns is-mobile is-multiline">
							<div className="column is-6">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">Ø§Ù„Ù…Ù‡Ø§Ù… Ø§Ù„ÙƒÙ„ÙŠØ©</p>
									<p className="title is-4 mb-0">${ totalTasks }</p>
								</div>
							</div>
							<div className="column is-6">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">Ù…ÙØªÙˆØ­Ø©</p>
									<p className="title is-4 mb-0">${ openTasks }</p>
								</div>
							</div>
							<div className="column is-12">
								<div className="has-background-light p-3" style=${{ border: '1px solid #e2e8f0' }}>
									<p className="heading has-text-grey mb-1">Ù‚ÙŠØ¯ Ø§Ù„ØªÙ†ÙÙŠØ° ÙˆØ§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©</p>
									<p className="title is-4 mb-0">${ inProgressTasks }</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Ø¨Ø·Ø§Ù‚Ø© Ø§Ù„Ø¹Ù…ÙŠÙ„ ØµØ§Ø­Ø¨ Ø§Ù„Ø·Ù„Ø¨ (Client Profile Card) -->
					${ (project.is_client_request || project.client) ? html`
						<div className="box wp-card p-5 mb-5" style=${{ border: '1.5px solid #f59e0b', backgroundColor: '#fffbeb', boxShadow: '0 4px 12px rgba(245,158,11,0.08)' }}>
							<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
								<h3 className="title is-6 mb-0 has-text-warning-dark has-text-weight-bold is-flex is-align-items-center" style=${{ gap: '6px' }}>
									<i class="dashicons dashicons-businessman"></i>
									<span>ØµØ§Ø­Ø¨ Ø§Ù„Ø·Ù„Ø¨ / Ø§Ù„Ø¹Ù…ÙŠÙ„ Ø§Ù„Ù…Ø¹ØªÙ…Ø¯</span>
								</h3>
								<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0, fontSize: '0.72rem' }}>
									â­ Ø¹Ù…ÙŠÙ„
								</span>
							</div>

							<div className="is-flex is-align-items-center p-3" style=${{ backgroundColor: '#ffffff', border: '1px solid #fde68a', gap: '12px' }}>
								<figure className="image is-40x40 m-0">
									<img
										src=${ (project.client && project.client.avatar) || '' }
										alt=${ (project.client && project.client.display_name) || 'Ø§Ù„Ø¹Ù…ÙŠÙ„' }
										style=${{ borderRadius: 0, border: '2px solid #f59e0b', backgroundColor: '#fef3c7' }}
									/>
								</figure>
								<div style=${{ overflow: 'hidden' }}>
									<p className="has-text-weight-bold is-size-6 mb-0" style=${{ lineHeight: '1.3' }}>
										${ (project.client && project.client.display_name) || 'Ø¹Ù…ÙŠÙ„ Ù…Ø³Ø¬Ù„' }
									</p>
									<p className="has-text-grey is-size-7 mb-0" style=${{ wordBreak: 'break-all' }}>
										${ (project.client && project.client.email) || '' }
									</p>
								</div>
							</div>
						</div>
					` : null }

					<!-- ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ -->
					<div className="box wp-card p-5">
						<div className="is-flex is-justify-content-space-between is-align-items-center mb-4">
							<h3 className="title is-5 mb-0 has-text-weight-bold">Ø£Ø¹Ø¶Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹</h3>
							<span className="tag is-dark" style=${{ borderRadius: 0 }}>${ members.length }</span>
						</div>
						
						${ members.length === 0 ? html`
							<p className="has-text-grey is-size-7">Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£Ø¹Ø¶Ø§Ø¡ Ù…Ø¶Ø§ÙÙŠÙ† Ù„Ù‡Ø°Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹.</p>
						` : html`
							<div className="is-flex is-flex-direction-column" style=${{ gap: '12px' }}>
								${ members.map( member => html`
									<div key=${member.id} className="is-flex is-align-items-center p-2 has-background-light" style=${{ borderRight: '3px solid #10b981', gap: '10px' }}>
										<figure className="image is-32x32 m-0">
											<img src=${ member.avatar_url || (member.avatar_urls && member.avatar_urls['48']) || '' } alt=${ member.display_name || member.name } style=${{ borderRadius: 0, border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }} />
										</figure>
										<div>
											<p className="has-text-weight-bold is-size-6 mb-0" style=${{ lineHeight: '1.2' }}>${ member.display_name || member.name }</p>
											<p className="has-text-grey is-size-7 mb-0">${ (member.role === 'manager' || member.project_role === 'manager') ? 'Ù…Ø¯ÙŠØ±' : ((member.role === 'lead' || member.project_role === 'lead') ? 'Ù‚Ø§Ø¦Ø¯' : ((member.role === 'viewer' || member.project_role === 'viewer' || member.project_role === 'client') ? 'Ù…ØªØ§Ø¨Ø¹/Ø¹Ù…ÙŠÙ„' : 'Ø¹Ø¶Ùˆ Ù…Ù†ÙØ°')) }</p>
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
