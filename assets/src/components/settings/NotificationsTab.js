import { html, __, isRtl } from '../../utils/html.js';
import { toast } from '../../utils/toast.js';

/**
 * Notifications & Alert Channels Settings Tab
 */
export default function NotificationsTab({
	emailNotifs = true,
	setEmailNotifs,
	setActiveTab
}) {
	const rtl = isRtl();

	return html`
		<div className="wp-card p-5 mb-5">
			<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>${ __( 'Notification & Alert Settings', 'workpress' ) }</h3>
			
			<div className="field mb-5">
				<label className="checkbox is-size-7 has-text-weight-bold">
					<input 
						type="checkbox" 
						checked=${emailNotifs} 
						onChange=${(e) => setEmailNotifs(e.target.checked)}
						style=${{ [rtl ? 'marginLeft' : 'marginRight']: '8px' }}
					/>
					${ __( 'Send email notifications when tasks are assigned', 'workpress' ) }
				</label>
			</div>

			<div className="notification is-light p-4 mb-4" style=${{ border: '1px solid #6366f1', backgroundColor: '#f5f3ff', borderRadius: 0 }}>
				<div className="is-flex is-justify-content-space-between is-align-items-center">
					<div>
						<h4 className="title is-6 mb-1 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span>${ __( 'Interactive Audio Cues (UI Sounds & Audio Cues)', 'workpress' ) }</span>
						</h4>
						<p className="is-size-7 has-text-grey">
							${ __( 'Integrated SND audio engine; customize audio tones for solution approvals, notifications, or mute specific events.', 'workpress' ) }
						</p>
					</div>
					<button 
						className="button is-small is-primary wp-sharp-button is-flex is-align-items-center" 
						style=${{ flexShrink: 0, [rtl ? 'marginRight' : 'marginLeft']: '1rem' }}
						onClick=${() => {
							window.location.hash = '#/settings?tab=sound_effects';
							if (setActiveTab) setActiveTab('sound_effects');
						}}
					>
						<span className="icon"><i className="dashicons dashicons-format-audio"></i></span>
						<span>${ __( 'Customize Sound Effects', 'workpress' ) }</span>
					</button>
				</div>
			</div>

			<button className="button is-primary wp-btn mt-3" onClick=${() => toast( __( 'Notification preferences saved.', 'workpress' ), 'success' )}>
				${ __( 'Save Preferences', 'workpress' ) }
			</button>
		</div>
	`;
}
