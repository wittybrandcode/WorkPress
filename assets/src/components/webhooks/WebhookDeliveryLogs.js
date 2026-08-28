import { html } from '../../utils/html.js';
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
						دليل التجربة والاختبار المحلي الفوري على Laragon / Localhost
					</h4>
					<p style=${{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>
						نظراً لأن نظام WorkPress يرسل طلبات صادرة (Outbound)، يمكنك اختباره محلياً في ثوانٍ عبر أحد الخيارات التالية:
					</p>
					<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
						<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#5865F2', marginBottom: '4px' }}>1. عبر قناة Discord مجانية (الأسهل والأجمل):</strong>
							<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>أنشئ سيرفر Discord -> إعدادات القناة -> Integrations -> Webhooks، والصق الرابط هنا لرؤية البطاقات الفاخرة!</span>
						</div>

						<div style=${{ background: '#fff', padding: '12px 14px', borderRadius: 0, border: '1px solid #e2e8f0' }}>
							<strong style=${{ display: 'block', fontSize: '0.85rem', color: '#059669', marginBottom: '4px' }}>2. عبر موقع Webhook.site (فوري بدون تسجيل):</strong>
							<span style=${{ fontSize: '0.8rem', color: '#64748b' }}>افتح موقع <a href="https://webhook.site" target="_blank" rel="noreferrer" style=${{ textDecoration: 'underline' }}>webhook.site</a>، وانسخ رابطك الفريد والصقه هنا لمعاينة الـ JSON لحظياً.</span>
						</div>
					</div>

					${mockReceiverUrl ? html`
						<div style=${{ marginTop: '12px', background: '#fff', padding: '10px 14px', borderRadius: 0, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
							<div>
								<span style=${{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0f172a' }}>المستقبل المحلي المدمج (Local Mock Loopback):</span>
								<span style=${{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>يمكنك وضع هذا الرابط لتجربة الإرسال محلياً دون أي اتصال بالإنترنت</span>
							</div>
							<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<code style=${{ fontSize: '0.75rem', direction: 'ltr', background: '#f1f5f9', padding: '4px 8px', borderRadius: 0 }}>${mockReceiverUrl}</code>
								<button 
									type="button"
									className="button is-small is-light wp-sharp-button" 
									onClick=${() => {
										navigator.clipboard.writeText(mockReceiverUrl);
										toast('تم نسخ رابط المستقبل المحلي.', 'info');
									}}
								>
									نسخ
								</button>
							</div>
						</div>
					` : null}
				</div>
			</div>
		</div>
	`;
}
