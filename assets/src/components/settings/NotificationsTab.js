import { html } from '../../utils/html.js';
import { toast } from '../../utils/toast.js';

/**
 * Notifications & Alert Channels Settings Tab
 */
export default function NotificationsTab({
	emailNotifs = true,
	setEmailNotifs,
	setActiveTab
}) {
	return html`
		<div className="wp-card p-5 mb-5">
			<h3 className="title is-5 mb-4" style=${{ borderBottom: '1px solid #ededed', paddingBottom: '0.5rem' }}>إعدادات الإشعارات والتنبيهات</h3>
			
			<div className="field mb-5">
				<label className="checkbox is-size-7 has-text-weight-bold">
					<input 
						type="checkbox" 
						checked=${emailNotifs} 
						onChange=${(e) => setEmailNotifs(e.target.checked)}
						style=${{ marginLeft: '8px' }}
					/>
					إرسال إشعارات البريد الإلكتروني عند تعيين مهمة جديدة
				</label>
			</div>

			<div className="notification is-light p-4 mb-4" style=${{ border: '1px solid #6366f1', backgroundColor: '#f5f3ff', borderRadius: 0 }}>
				<div className="is-flex is-justify-content-space-between is-align-items-center">
					<div>
						<h4 className="title is-6 mb-1 has-text-primary is-flex is-align-items-center" style=${{ gap: '6px' }}>
							<span>المؤثرات والنغمات الصوتية التفاعلية (UI Sounds & Audio Cues)</span>
						</h4>
						<p className="is-size-7 has-text-grey">
							تم دمج مكتبة الأصوات SND محلياً بالكامل؛ يمكنك تخصيص نغمة كل إشعار، اعتماد حل، استفسار عميل، أو تعطيل/تفعيل أي حدث على حدة مع تحديد موضعه في النظام.
						</p>
					</div>
					<button 
						className="button is-small is-primary wp-sharp-button is-flex is-align-items-center" 
						style=${{ flexShrink: 0, marginRight: '1rem' }}
						onClick=${() => {
							window.location.hash = '#/settings?tab=sound_effects';
							if (setActiveTab) setActiveTab('sound_effects');
						}}
					>
						<span className="icon"><i className="dashicons dashicons-format-audio"></i></span>
						<span>تخصيص أصوات وأماكن النظام </span>
					</button>
				</div>
			</div>

			<button className="button is-primary wp-btn mt-3" onClick=${() => toast('تم حفظ تفضيلات الإشعارات.', 'success')}>
				حفظ التفضيلات
			</button>
		</div>
	`;
}
