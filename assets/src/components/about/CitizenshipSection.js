import { html } from '../../utils/html.js';

export default function CitizenshipSection() {
	return html`
		<div className="mb-6">
			<h3 className="title is-5 mb-4 has-text-weight-bold has-text-dark is-flex is-align-items-center">
				<span className="icon ml-2" style=${{ marginLeft: '8px' }}><i className="dashicons dashicons-groups has-text-info"></i></span>
				<span>هرم المواطنة الرباعي والمساحات الثلاث</span>
			</h3>

			<div className="columns is-multiline mb-4">
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ borderTop: '3px solid #0f172a' }}>
						<span className="tag is-dark mb-2">الطبقة 1: الإدارة العليا</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">المدير العام (Administrator)</h4>
						<p className="is-size-7 has-text-grey">صلاحية شاملة على كافة المشاريع، الإعدادات، استوديو الفرز، والتحكم المطلق.</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ borderTop: '3px solid #008478' }}>
						<span className="tag is-primary mb-2">الطبقة 2: قيادة المشاريع</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">قائد المشروع (Project Lead)</h4>
						<p className="is-size-7 has-text-grey">إدارة مهام المشروع، اعتماد المساهمات والحلول، وتعيين المنفذين داخل سياق مشروعه.</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ borderTop: '3px solid #0284c7' }}>
						<span className="tag is-info is-light mb-2">الطبقة 3: الكادر الفني</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">المتخصص والمنفذ (Specialist)</h4>
						<p className="is-size-7 has-text-grey">تنفيذ المهام الموكلة، إيداع الحلول والأدلة، تسجيل الساعات، وقوائم الفحص.</p>
					</div>
				</div>
				<div className="column is-3">
					<div className="wp-card p-4 h-100" style=${{ borderTop: '3px solid #d97706' }}>
						<span className="tag is-warning is-light mb-2">الطبقة 4: المستفيد الخارجي</span>
						<h4 className="title is-6 mb-1 has-text-weight-bold">العميل (WorkPress Client)</h4>
						<p className="is-size-7 has-text-grey">فضاء البوابة المستقلة فقط <code>/portal/</code>، تقديم الطلبات، مراجعة المخرجات، والتوقيع الرقمي.</p>
					</div>
				</div>
			</div>
		</div>
	`;
}
