import { html } from '../../utils/html.js';

/**
 * Request Technical Evaluation & Rejection Modals Component
 */
export default function RequestEvaluationModal({
	reviewingProject,
	setReviewingProject,
	reviewNotes = '',
	setReviewNotes,
	isReviewing = false,
	handleConfirmReview,
	rejectingProject,
	setRejectingProject,
	rejectionReason = '',
	setRejectionReason,
	isRejecting = false,
	handleConfirmReject
}) {
	return html`
		<div>
			<!-- Under Review Modal -->
			${ reviewingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setReviewingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#0369a1' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								وضع الطلب قيد الدراسة والتدقيق الفني
							</p>
							<button className="delete" aria-label="close" onClick=${() => setReviewingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-info is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>طلب المشروع:</strong> ${reviewingProject.name} (${reviewingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									سيتم تغيير حالة الطلب إلى <strong>قيد الدراسة (Under Review)</strong> وإرسال إشعار وتنبيه فوري للعميل مع الملاحظات المدخلة أدناه.
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">سبب وملاحظات دراسة الطلب (تفسير للإدارة يظهر للعميل):</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${reviewNotes}
										onInput=${e => setReviewNotes( e.target.value )}
										placeholder="مثال: الطلب يحتوي على متطلبات فنية معقدة ونقوم حالياً بدراسة الجدوى الهندسية وجدولة المهام مع الفريق المتخصص قبل الاعتماد..."
									></textarea>
								</div>
								<p className="help has-text-grey">هذا التبرير سيظهر مباشرة للعميل في بوابته كصندوق توضيحي وفي إشعاراته.</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setReviewingProject( null )} disabled=${isReviewing}>
								إلغاء
							</button>
							<button 
								className=${`button is-info wp-sharp-button has-text-weight-bold ${isReviewing ? 'is-loading' : ''}`}
								onClick=${handleConfirmReview}
								disabled=${isReviewing}
								style=${{ backgroundColor: '#0284c7', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-search"></i></span>
								<span>تأكيد الإحالة للدراسة وإشعار العميل</span>
							</button>
						</footer>
					</div>
				</div>
			` }

			<!-- Reject Request Modal -->
			${ rejectingProject && html`
				<div className="modal is-active">
					<div className="modal-background" onClick=${() => setRejectingProject( null )}></div>
					<div className="modal-card" style=${{ maxWidth: '560px' }}>
						<header className="modal-card-head" style=${{ backgroundColor: '#991b1b' }}>
							<p className="modal-card-title has-text-white is-size-6 has-text-weight-bold">
								عدم اعتماد / رفض طلب المشروع مع ذكر المبررات
							</p>
							<button className="delete" aria-label="close" onClick=${() => setRejectingProject( null )}></button>
						</header>

						<section className="modal-card-body p-5">
							<div className="notification is-danger is-light p-3 mb-4" style=${{ fontSize: '0.88rem' }}>
								<strong>طلب المشروع:</strong> ${rejectingProject.name} (${rejectingProject.prefix})
								<br />
								<span className="is-size-7 has-text-grey">
									سيتم تسجيل الطلب كـ <strong>غير معتمد (Rejected)</strong> وإرسال تنبيه وإشعار فوري للعميل مع بيان الأسباب.
								</span>
							</div>

							<div className="field mb-3">
								<label className="label is-small">مبررات عدم الاعتماد (تفسير الرفض للعميل):</label>
								<div className="control">
									<textarea
										className="textarea is-small wp-sharp-input"
										rows="4"
										value=${rejectionReason}
										onInput=${e => setRejectionReason( e.target.value )}
										placeholder="مثال: نعتذر لعدم إمكانية اعتماد الطلب نظراً لكون المتطلبات خارج النطاق التقني المتاح حالياً، أو لعدم توفر السعة التشغيلية في الموعد المطلوب..."
									></textarea>
								</div>
								<p className="help has-text-danger">تأكد من صياغة سبب الرفض بلباقة، حيث سيظهر للعميل في بوابته وإشعاره.</p>
							</div>
						</section>

						<footer className="modal-card-foot is-justify-content-space-between p-4">
							<button className="button is-light wp-sharp-button" onClick=${() => setRejectingProject( null )} disabled=${isRejecting}>
								إلغاء
							</button>
							<button 
								className=${`button is-danger wp-sharp-button has-text-weight-bold ${isRejecting ? 'is-loading' : ''}`}
								onClick=${handleConfirmReject}
								disabled=${isRejecting}
								style=${{ backgroundColor: '#ef4444', color: '#fff' }}
							>
								<span className="icon is-small"><i className="dashicons dashicons-dismiss"></i></span>
								<span>تأكيد عدم الاعتماد وإشعار العميل</span>
							</button>
						</footer>
					</div>
				</div>
			` }
		</div>
	`;
}
