import { html, useState } from '../../utils/html.js';
import { tasksApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';

/**
 * TaskTimeTracker Component
 *
 * Interactive time tracking, estimation, and worklog manager.
 * Fully compliant with React 18 DOM, 0px sharp geometry, and zero emojis.
 */
export default function TaskTimeTracker( { taskId, task = {}, onUpdate } ) {
	const [ hours, setHours ] = useState( '' );
	const [ note, setNote ] = useState( '' );
	const [ date, setDate ] = useState( new Date().toISOString().substring( 0, 10 ) );
	const [ isLogging, setIsLogging ] = useState( false );

	const [ isEditingEstimate, setIsEditingEstimate ] = useState( false );
	const [ editEstimateValue, setEditEstimateValue ] = useState( task.estimated_hours || 0 );
	const [ isSavingEstimate, setIsSavingEstimate ] = useState( false );

	const estimatedHours = parseFloat( task.estimated_hours || 0 );
	const loggedHours = parseFloat( task.logged_hours || 0 );
	const remainingHours = Math.max( 0, Math.round( ( estimatedHours - loggedHours ) * 100 ) / 100 );
	const isOverBudget = estimatedHours > 0 && loggedHours > estimatedHours;
	const overBudgetHours = isOverBudget ? Math.round( ( loggedHours - estimatedHours ) * 100 ) / 100 : 0;
	const progressPct = estimatedHours > 0 ? Math.min( 100, Math.round( ( loggedHours / estimatedHours ) * 100 ) ) : ( loggedHours > 0 ? 100 : 0 );

	const worklogs = task.worklogs || [];

	const handleAddWorklog = async ( e ) => {
		if ( e ) e.preventDefault();
		const numHours = parseFloat( hours );
		if ( ! numHours || numHours <= 0 || isLogging ) return;

		setIsLogging( true );
		try {
			const res = await tasksApi.worklogs.add( taskId, {
				hours: numHours,
				note: note.trim(),
				date: date
			} );
			setHours( '' );
			setNote( '' );
			if ( res && res.task ) {
				onUpdate( res.task );
			}
			sound.play( 'click' );
			toast( 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ ÙˆÙ‚Øª Ø§Ù„Ø¹Ù…Ù„ Ø¨Ù†Ø¬Ø§Ø­', 'success' );
		} catch ( err ) {
			toast( err.message || 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ ÙˆÙ‚Øª Ø§Ù„Ø¹Ù…Ù„', 'error' );
		} finally {
			setIsLogging( false );
		}
	};

	const handleDeleteWorklog = async ( logId ) => {
		try {
			const res = await tasksApi.worklogs.delete( taskId, logId );
			if ( res && res.task ) {
				onUpdate( res.task );
			}
			sound.play( 'trash' );
			toast( 'ØªÙ… Ø­Ø°Ù Ø³Ø¬Ù„ Ø§Ù„Ø¹Ù…Ù„', 'info' );
		} catch ( err ) {
			toast( err.message || 'ØªØ¹Ø°Ø± Ø­Ø°Ù Ø³Ø¬Ù„ Ø§Ù„Ø¹Ù…Ù„', 'error' );
		}
	};

	const handleSaveEstimate = async () => {
		const numEst = parseFloat( editEstimateValue );
		if ( isNaN( numEst ) || numEst < 0 ) return;

		setIsSavingEstimate( true );
		try {
			const updatedTask = await tasksApi.estimate( taskId, numEst );
			setIsEditingEstimate( false );
			if ( updatedTask ) {
				onUpdate( updatedTask );
			}
			sound.play( 'button' );
			toast( 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø© Ù„Ù„Ù…Ù‡Ù…Ø©', 'success' );
		} catch ( err ) {
			toast( err.message || 'ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ« Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©', 'error' );
		} finally {
			setIsSavingEstimate( false );
		}
	};

	return html`
		<div className="workpress-time-tracker box" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, padding: '1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem' }}>
			<!-- Header -->
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
				<h4 className="title is-6" style=${{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '700' }}>
					<i className="dashicons dashicons-clock" style=${{ color: '#3b82f6' }}></i>
					<span>ØªØªØ¨Ø¹ ÙˆØªÙ‚Ø¯ÙŠØ± Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ø¹Ù…Ù„</span>
				</h4>
				
				${ isOverBudget ? html`
					<span style=${{ fontSize: '0.78rem', fontWeight: '700', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 8px', border: '1px solid #fecaca' }}>
						ØªØ¬Ø§ÙˆØ² Ø§Ù„ØªÙ‚Ø¯ÙŠØ± Ø¨Ù€ ${ overBudgetHours } Ø³Ø§Ø¹Ø©
					</span>
				` : null }
			</div>

			<!-- Summary Cards Grid -->
			<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
				<!-- Estimated Card -->
				<div style=${{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
					<div style=${{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span>Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©</span>
						<button 
							type="button" 
							className="button is-small is-ghost" 
							style=${{ height: '18px', padding: 0, color: '#3b82f6' }}
							onClick=${ () => { setIsEditingEstimate( ! isEditingEstimate ); setEditEstimateValue( estimatedHours ); } }
							title="ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©"
						>
							<i className="dashicons dashicons-edit" style=${{ fontSize: '14px' }}></i>
						</button>
					</div>

					${ isEditingEstimate ? html`
						<div style=${{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
							<input 
								type="number" 
								step="0.5" 
								min="0"
								className="input is-small" 
								value=${ editEstimateValue }
								onInput=${ ( e ) => setEditEstimateValue( e.target.value ) }
								style=${{ borderRadius: 0, height: '26px', padding: '2px 6px' }}
								autoFocus
							/>
							<button 
								type="button" 
								className="button is-small is-primary" 
								style=${{ borderRadius: 0, height: '26px', padding: '0 6px' }}
								onClick=${ handleSaveEstimate }
								disabled=${ isSavingEstimate }
							>
								<i className="dashicons dashicons-yes"></i>
							</button>
						</div>
					` : html`
						<div style=${{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
							${ estimatedHours } <span style=${{ fontSize: '0.8rem', fontWeight: '500', color: '#64748b' }}>Ø³Ø§Ø¹Ø©</span>
						</div>
					` }
				</div>

				<!-- Logged Card -->
				<div style=${{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
					<div style=${{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>
						Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ø³Ø¬Ù„Ø©
					</div>
					<div style=${{ fontSize: '1.25rem', fontWeight: '800', color: isOverBudget ? '#dc2626' : '#10b981' }}>
						${ loggedHours } <span style=${{ fontSize: '0.8rem', fontWeight: '500', color: '#64748b' }}>Ø³Ø§Ø¹Ø©</span>
					</div>
				</div>

				<!-- Remaining / Budget Card -->
				<div style=${{ padding: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
					<div style=${{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', marginBottom: '0.25rem' }}>
						${ isOverBudget ? 'Ø§Ù„Ø²ÙŠØ§Ø¯Ø© Ø¹Ù† Ø§Ù„Ø®Ø·Ø©' : 'Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…ØªØ¨Ù‚ÙŠØ©' }
					</div>
					<div style=${{ fontSize: '1.25rem', fontWeight: '800', color: isOverBudget ? '#dc2626' : '#3b82f6' }}>
						${ isOverBudget ? `+${ overBudgetHours }` : remainingHours } <span style=${{ fontSize: '0.8rem', fontWeight: '500', color: '#64748b' }}>Ø³Ø§Ø¹Ø©</span>
					</div>
				</div>
			</div>

			<!-- Progress Bar -->
			${ estimatedHours > 0 ? html`
				<div style=${{ marginBottom: '1.25rem' }}>
					<div style=${{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '600', color: '#64748b', marginBottom: '0.3rem' }}>
						<span>Ù†Ø³Ø¨Ø© Ø§Ø³ØªÙ‡Ù„Ø§Ùƒ Ø§Ù„ÙˆÙ‚Øª Ø§Ù„Ù…Ù‚Ø¯Ø±</span>
						<span style=${{ color: isOverBudget ? '#dc2626' : ( progressPct === 100 ? '#10b981' : '#3b82f6' ) }}>
							${ progressPct }%
						</span>
					</div>
					<div style=${{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: 0, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
						<div 
							style=${{ 
								height: '100%', 
								width: `${ Math.min( 100, progressPct ) }%`, 
								backgroundColor: isOverBudget ? '#dc2626' : ( progressPct === 100 ? '#10b981' : '#3b82f6' ), 
								transition: 'width 0.3s ease' 
							}}
						></div>
					</div>
				</div>
			` : null }

			<!-- Add Worklog Form -->
			<form onSubmit=${ handleAddWorklog } style=${{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginBottom: '1rem' }}>
				<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '6px' }}>
					<div style=${{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
						ØªØ³Ø¬ÙŠÙ„ Ø¬Ù„Ø³Ø© / ÙˆÙ‚Øª Ø¹Ù…Ù„ Ø¬Ø¯ÙŠØ¯
					</div>

					<!-- Quick Preset Increment Chips -->
					<div style=${{ display: 'flex', alignItems: 'center', gap: '4px' }}>
						<span style=${{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>Ø¥Ø¶Ø§ÙØ© Ø³Ø±ÙŠØ¹Ø©:</span>
						${ [
							{ label: '+15Ø¯', val: 0.25 },
							{ label: '+30Ø¯', val: 0.5 },
							{ label: '+1Ø³', val: 1.0 },
							{ label: '+2Ø³', val: 2.0 },
							{ label: '+4Ø³', val: 4.0 },
						].map( preset => html`
							<button
								key=${ preset.label }
								type="button"
								className="wp-dense-chip"
								onClick=${ () => {
									const current = parseFloat( hours ) || 0;
									setHours( String( Math.round( ( current + preset.val ) * 100 ) / 100 ) );
									sound.play( 'click' );
								}}
								style=${{ cursor: 'pointer', borderColor: '#cbd5e1', backgroundColor: '#f8fafc', fontWeight: '800' }}
								title=${ `Ø¥Ø¶Ø§ÙØ© ${ preset.val } Ø³Ø§Ø¹Ø© Ø¥Ù„Ù‰ Ø­Ù‚Ù„ Ø§Ù„Ø³Ø§Ø¹Ø§Øª` }
							>
								${ preset.label }
							</button>
						` ) }
					</div>
				</div>
				<div style=${{ display: 'grid', gridTemplateColumns: '100px 140px 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
					<div>
						<input 
							type="number"
							step="0.25"
							min="0.25"
							className="input is-small"
							placeholder="Ø§Ù„Ø³Ø§Ø¹Ø§Øª (Ù…Ø«Ø§Ù„: 1.5)"
							value=${ hours }
							onInput=${ ( e ) => setHours( e.target.value ) }
							disabled=${ isLogging }
							style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
							required
						/>
					</div>
					<div>
						<input 
							type="date"
							className="input is-small"
							value=${ date }
							onInput=${ ( e ) => setDate( e.target.value ) }
							disabled=${ isLogging }
							style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
						/>
					</div>
					<div>
						<input 
							type="text"
							className="input is-small"
							placeholder="Ø¨ÙŠØ§Ù† ÙˆÙ…Ù„Ø§Ø­Ø¸Ø© Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…Ù†Ø¬Ø²..."
							value=${ note }
							onInput=${ ( e ) => setNote( e.target.value ) }
							disabled=${ isLogging }
							style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
						/>
					</div>
					<div>
						<button 
							type="submit"
							className="button is-small is-primary"
							disabled=${ ! hours || isLogging }
							style=${{ borderRadius: 0, fontWeight: '700', whiteSpace: 'nowrap' }}
						>
							<i className="dashicons dashicons-plus" style=${{ marginLeft: '0.25rem' }}></i>
							<span>ØªØ³Ø¬ÙŠÙ„</span>
						</button>
					</div>
				</div>
			</form>

			<!-- Worklogs Stream -->
			${ worklogs.length > 0 ? html`
				<div style=${{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
					<div style=${{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem' }}>
						Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ø³Ø§Ø¨Ù‚Ø© (${ worklogs.length })
					</div>
					<div style=${{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '220px', overflowY: 'auto' }}>
						${ worklogs.map( ( log ) => html`
							<div 
								key=${ log.id }
								style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.65rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
							>
								<div style=${{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
									<img 
										src=${ log.user_avatar } 
										alt=${ log.user_name } 
										style=${{ width: '22px', height: '22px', borderRadius: 0, border: '1px solid #cbd5e1' }}
									/>
									<span style=${{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap' }}>
										${ log.user_name }
									</span>
									<span style=${{ color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
										${ log.date }
									</span>
									<span style=${{ color: '#334155', wordBreak: 'break-word', flex: 1, marginRight: '0.5rem' }}>
										${ log.note || 'Ø¹Ù…Ù„ Ø¨Ø¯ÙˆÙ† Ù…Ù„Ø§Ø­Ø¸Ø©' }
									</span>
								</div>

								<div style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
									<span style=${{ fontWeight: '800', color: '#10b981', backgroundColor: '#ecfdf5', padding: '1px 6px', border: '1px solid #a7f3d0', fontSize: '0.8rem' }}>
										${ log.hours } Ø³
									</span>
									<button 
										type="button"
										className="button is-small is-ghost"
										style=${{ height: '20px', padding: '0 2px', color: '#94a3b8', border: 'none' }}
										onClick=${ () => handleDeleteWorklog( log.id ) }
										title="Ø­Ø°Ù Ø³Ø¬Ù„ Ø§Ù„Ø¹Ù…Ù„"
									>
										<i className="dashicons dashicons-trash" style=${{ fontSize: '15px' }}></i>
									</button>
								</div>
							</div>
						` ) }
					</div>
				</div>
			` : null }
		</div>
	`;
}
