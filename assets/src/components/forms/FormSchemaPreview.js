import { html } from '../../utils/html.js';

/**
 * Client Portal Live Form Simulation Modal
 */
export default function FormSchemaPreview({
	show = false,
	onClose,
	form
}) {
	if (!show || !form) return null;

	return html`
		<div className="modal is-active">
			<div className="modal-background" onClick=${onClose}></div>
			<div className="modal-card" style=${{ maxWidth: '780px', width: '90%' }}>
				<header className="modal-card-head" style=${{ backgroundColor: '#0f172a', color: '#ffffff' }}>
					<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
						معاينة فورية: كيف يظهر هذا النموذج للزبون في بوابة العميل (/portal/#/new-request)
					</p>
					<button className="delete" aria-label="close" onClick=${onClose}></button>
				</header>
				<section className="modal-card-body" style=${{ backgroundColor: '#0a0e17', color: '#f8fafc', padding: '2rem' }}>
					<div style=${{ border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', backgroundColor: 'rgba(15,23,42,0.8)' }}>
						<h3 style=${{ fontSize: '1.2rem', fontWeight: '900', color: '#fff', marginBottom: '0.4rem' }}>
							${form.name || 'طلب مشروع جديد'}
						</h3>
						<p style=${{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
							حدد متطلباتك وسيصل طلبك مباشرة للإدارة العامة كمشروع رسمي للمراجعة والتسعير والاعتماد.
						</p>

						<!-- Smart Title Preview -->
						<div className="mb-4">
							<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
								${form.title_label}
							</label>
							<select style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 0 }}>
								${(form.title_suggestions || []).map((s, i) => html`<option key=${i}>${s}</option>`)}
								<option>أخرى: كتابة عنوان مخصص...</option>
							</select>
						</div>

						<!-- Scope Desc Preview -->
						<div className="mb-4">
							<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
								${form.desc_label}
							</label>
							<textarea rows="3" style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 0 }} placeholder="${form.desc_placeholder}"></textarea>
						</div>

						<!-- Specs Preview -->
						${(form.specs || []).map((spec, si) => html`
							<div key=${si} className="mb-3">
								<label style=${{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#e2e8f0', marginBottom: '0.4rem' }}>
									${spec.label} ${spec.required ? '*' : ''}
								</label>
								${spec.type === 'pills' ? html`
									<div style=${{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
										${(spec.options || []).map((opt, oi) => html`
											<span key=${oi} style=${{ padding: '0.3rem 0.75rem', backgroundColor: oi === 0 ? '#6366f1' : '#1e293b', color: '#fff', borderRadius: 0, fontSize: '0.8rem', fontWeight: '600' }}>
												${opt}
											</span>
										`)}
									</div>
								` : (spec.type === 'select_custom' ? html`
									<select style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 0 }}>
										${(spec.options || []).map((opt, oi) => html`<option key=${oi}>${opt}</option>`)}
									</select>
								` : html`
									<input type="text" placeholder="${spec.placeholder || ''}" style=${{ width: '100%', padding: '0.65rem 0.85rem', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 0 }} />
								`)}
							</div>
						`)}

						<button type="button" style=${{ width: '100%', padding: '0.85rem', marginTop: '1.5rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: 0, fontWeight: '800', cursor: 'pointer' }}>
							إرسال طلب المشروع واعتماد البيانات
						</button>
					</div>
				</section>
				<footer className="modal-card-foot is-justify-content-flex-end">
					<button className="button is-primary wp-sharp-button" onClick=${onClose}>إغلاق المعاينة</button>
				</footer>
			</div>
		</div>
	`;
}
