import { html, __ } from '../../utils/html.js';
import { toast } from '../../utils/toast.js';

/**
 * Webhooks Local Testing Helper & Mock Loopback Guide Component
 */
export default function WebhookDeliveryLogs({
	mockReceiverUrl = ''
}) {
	return html`
		<div className="card wp-webhook-guide-card">
			<div style=${{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
				<span className="icon is-medium has-text-warning"><i className="dashicons dashicons-lightbulb"></i></span>
				<div style=${{ flex: 1 }}>
					<h4 style=${{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
						${ __( 'Local Testing & Mock Loopback Guide (Laragon / Localhost)', 'workpress' ) }
					</h4>
					<p style=${{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>
						${ __( 'Because WorkPress sends outbound HTTP webhook payloads, you can test locally in seconds via:', 'workpress' ) }
					</p>
					<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
						<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#5865F2', marginBottom: '4px' }}>${ __( '1. Free Discord Channel Webhook:', 'workpress' ) }</strong>
							<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>${ __( 'Create Discord server -> Channel Settings -> Integrations -> Webhooks, and paste URL here to preview embeds.', 'workpress' ) }</span>
						</div>

						<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#059669', marginBottom: '4px' }}>${ __( '2. Via Webhook.site (Instant without registration):', 'workpress' ) }</strong>
							<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>${ __( 'Open webhook.site, copy your unique URL, and paste here to inspect JSON payloads live.', 'workpress' ) }</span>
						</div>
					</div>

					${mockReceiverUrl ? html`
						<div style=${{ marginTop: '12px', background: '#fff', padding: '10px 14px', borderRadius: 0, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
							<div>
								<span style=${{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0f172a' }}>${ __( 'Local Mock Loopback Receiver:', 'workpress' ) }</span>
								<span style=${{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>${ __( 'Use this endpoint URL to test deliveries without internet connectivity.', 'workpress' ) }</span>
							</div>
							<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<code style=${{ fontSize: '0.75rem', direction: 'ltr', background: '#f1f5f9', padding: '4px 8px', borderRadius: 0 }}>${mockReceiverUrl}</code>
								<button 
									type="button"
									className="button is-small is-light wp-sharp-button" 
									onClick=${() => {
										navigator.clipboard.writeText(mockReceiverUrl);
										toast( __( 'Copied local receiver URL.', 'workpress' ), 'info' );
									}}
								>
									${ __( 'Copy', 'workpress' ) }
								</button>
							</div>
						</div>
					` : null}
				</div>
			</div>
		</div>
	`;
}
