import { html, __, sprintf } from '../../utils/html.js';

/**
 * Webhooks Studio Hero Banner & Stats Row Component
 */
export default function WebhooksHeroBanner({
	totalCount = 0,
	activeCount = 0,
	handleOpenCreate
}) {
	return html`
		<div className="webhooks-hero-section" style=${{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<!-- HEADER HERO BANNER -->
			<div className="card wp-webhooks-hero">
				<div style=${{ maxWidth: '700px' }}>
					<div style=${{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
						<span className="icon" style=${{ fontSize: '20px' }}><i className="dashicons dashicons-admin-links"></i></span>
						<h2 style=${{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0 }}>
							${ __( 'Enterprise Webhooks Studio', 'workpress' ) }
						</h2>
						<span className="tag is-info is-light" style=${{ fontWeight: 'bold', fontSize: '0.75rem', borderRadius: 0 }}>v1.5.0 Enterprise</span>
					</div>
					<p style=${{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
						${ __( 'Stream live WorkPress events (solution approvals, client requests, completed milestones) to Discord, Slack, Microsoft Teams, and Zapier with HMAC-SHA256 signatures.', 'workpress' ) }
					</p>
				</div>
				<div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
					<button 
						type="button"
						className="button is-primary wp-sharp-button" 
						onClick=${() => handleOpenCreate('generic')}
						style=${{ fontWeight: 'bold', padding: '0 18px', background: '#3b82f6', borderColor: '#3b82f6' }}
					>
						<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
						<span>${ __( 'Add Webhook', 'workpress' ) }</span>
					</button>
				</div>
			</div>

			<!-- STATS & QUICK PRESETS ROW -->
			<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
				<div className="card wp-webhook-stat-card">
					<div className="wp-webhook-stat-icon" style=${{ background: '#eff6ff', color: '#3b82f6' }}>
						<i className="dashicons dashicons-rss"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>${ __( 'Registered Webhooks', 'workpress' ) }</div>
						<div style=${{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>${totalCount}</div>
					</div>
				</div>

				<div className="card wp-webhook-stat-card">
					<div className="wp-webhook-stat-icon" style=${{ background: '#ecfdf5', color: '#10b981' }}>
						<i className="dashicons dashicons-yes-alt"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>${ __( 'Active Live Endpoints', 'workpress' ) }</div>
						<div style=${{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981' }}>${activeCount}</div>
					</div>
				</div>

				<div className="card wp-webhook-stat-card">
					<div className="wp-webhook-stat-icon" style=${{ background: '#f5f3ff', color: '#8b5cf6' }}>
						<i className="dashicons dashicons-lock"></i>
					</div>
					<div>
						<div style=${{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>${ __( 'Payload Signature Security', 'workpress' ) }</div>
						<div style=${{ fontSize: '0.9rem', fontWeight: 'bold', color: '#8b5cf6' }}>${ __( 'HMAC-SHA256 Active', 'workpress' ) }</div>
					</div>
				</div>
			</div>
		</div>
	`;
}
