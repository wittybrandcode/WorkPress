import { html } from '../../utils/html.js';

/**
 * Assignee & Focus Workbench Perspective View
 */
export default function MemberPerspectiveView({
	myAwaitingFirstActionTasks = [],
	setTargetTaskForContribution,
	setIsContributionModalOpen,
	myInProgressTasks = [],
	filteredKnowledge = [],
	knowledgeSearch = '',
	setKnowledgeSearch
}) {
	return html`
		<div className="member-perspective-view">
			<!-- My Action Workbench: Tasks Assigned to Me -->
			<div className="columns mb-5">
				
				<!-- Tasks Awaiting My First Action -->
				<div className="column is-6">
					<div className="box wp-card p-0 wp-dashboard-action-box">
						<div className="p-3 has-background-info-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
							<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
								<span className="icon ml-1 has-text-info"><i className="dashicons dashicons-edit"></i></span>
								<span>مهام مسندة إليك بانتظار مساهمتك الأولى</span>
							</h3>
							<span className="tag is-info has-text-weight-bold" style=${{ borderRadius: 0 }}>${ myAwaitingFirstActionTasks.length } مهمة</span>
						</div>
						<div className="p-4">
							${ myAwaitingFirstActionTasks.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-yes-alt is-size-3"></i></span>
									<p className="is-size-7">رائع! لقد بدأت العمل في كافة المهام المسندة إليك.</p>
								</div>
							` : myAwaitingFirstActionTasks.map( t => html`
								<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '65%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || 'مشروع' }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
										<span className="tag is-info is-light is-small mt-1" style=${{ borderRadius: 0 }}>مسندة</span>
									</div>
									<button 
										className="button is-small is-info wp-sharp-button"
										onClick=${ () => { setTargetTaskForContribution( t ); setIsContributionModalOpen( true ); } }
									>
										<span className="icon"><i className="dashicons dashicons-plus-alt2"></i></span>
										<span>بدء المساهمة</span>
									</button>
								</div>
							` ) }
						</div>
					</div>
				</div>

				<!-- My In-Progress Tasks Under Review -->
				<div className="column is-6">
					<div className="box wp-card p-0 wp-dashboard-action-box">
						<div className="p-3 has-background-warning-light is-flex is-justify-content-space-between is-align-items-center wp-border-bottom">
							<h3 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center">
								<span className="icon ml-1 has-text-warning"><i className="dashicons dashicons-hammer"></i></span>
								<span>مهامي الجارية قيد العمل والتنفيذ</span>
							</h3>
							<span className="tag is-warning has-text-weight-bold" style=${{ borderRadius: 0 }}>${ myInProgressTasks.length } مهمة</span>
						</div>
						<div className="p-4">
							${ myInProgressTasks.length === 0 ? html`
								<div className="has-text-centered py-4 has-text-grey">
									<span className="icon is-large mb-1"><i className="dashicons dashicons-clipboard is-size-3"></i></span>
									<p className="is-size-7">لا توجد مهام جارية حالياً.</p>
								</div>
							` : myInProgressTasks.map( t => html`
								<div key=${ t.id } className="p-3 mb-2 wp-border has-background-white is-flex is-justify-content-space-between is-align-items-center">
									<div className="wp-text-truncate" style=${{ maxWidth: '70%' }}>
										<span className="is-size-7 has-text-grey is-block mb-1">${ t.project_name || 'مشروع' }</span>
										<strong className="is-block is-size-6 wp-text-truncate">${ t.title }</strong>
										<span className="tag is-warning is-light is-small mt-1" style=${{ borderRadius: 0 }}>قيد الإنجاز</span>
									</div>
									<a href=${ `#/tasks/${ t.id }` } className="button is-small is-white wp-border is-flex is-align-items-center">
										<span>متابعة المهمة</span>
										<span className="icon is-small mr-1"><i className="dashicons dashicons-arrow-left-alt2"></i></span>
									</a>
								</div>
							` ) }
						</div>
					</div>
				</div>

			</div>

			<!-- Knowledge Explorer for Specialists -->
			<div className="box wp-card p-0 mb-5 wp-border">
				<div className="p-3 is-flex is-justify-content-space-between is-align-items-center wp-border-bottom has-background-light">
					<div className="is-flex is-align-items-center">
						<span className="icon ml-2 has-text-success"><i className="dashicons dashicons-book"></i></span>
						<h3 className="title is-6 mb-0 has-text-dark has-text-weight-bold">مستكشف المعرفة والحلول الملهمة (Knowledge Explorer)</h3>
					</div>
					<div className="field mb-0">
						<p className="control has-icons-right">
							<input 
								className="input is-small wp-sharp-input" 
								type="text" 
								placeholder="بحث في المعرفة والحلول المعتمدة..." 
								value=${ knowledgeSearch }
								onInput=${ (e) => setKnowledgeSearch( e.target.value ) }
								style=${{ width: '260px' }}
							/>
							<span className="icon is-small is-right"><i className="dashicons dashicons-search"></i></span>
						</p>
					</div>
				</div>
				<div className="p-4">
					<div className="columns is-multiline">
						${ filteredKnowledge.length === 0 ? html`
							<div className="column is-12 has-text-centered py-4 has-text-grey">
								لا توجد نتائج مطابقة لبحثك في المعرفة المعتمدة.
							</div>
						` : filteredKnowledge.slice( 0, 6 ).map( k => html`
							<div key=${ k.id } className="column is-4">
								<div className="box wp-card p-3 wp-border is-flex is-flex-direction-column h-100 has-background-white" style=${{ borderRadius: 0 }}>
									<div className="is-flex is-justify-content-space-between is-align-items-center mb-1">
										<span className="tag is-success is-light is-small" style=${{ borderRadius: 0 }}><i className="dashicons dashicons-yes-alt ml-1"></i> حل معتمد</span>
										<span className="is-size-7 has-text-grey">${ k.project_name || 'عام' }</span>
									</div>
									<h5 className="title is-6 mb-2 wp-text-truncate">${ k.task_title || k.title || 'معرفة موثقة' }</h5>
									<div className="is-size-7 has-text-grey wp-text-truncate mb-2" dangerouslySetInnerHTML=${{ __html: k.content || '' }}></div>
									<div className="mt-auto pt-2 wp-border-top is-flex is-justify-content-space-between is-align-items-center is-size-7">
										<span className="has-text-grey">بواسطة: ${ k.author_name || 'فريق العمل' }</span>
										<a href="#/knowledge" className="has-text-success has-text-weight-bold is-flex is-align-items-center">
											<span>عرض كامل</span>
											<span className="icon is-small mr-1"><i className="dashicons dashicons-arrow-left-alt2"></i></span>
										</a>
									</div>
								</div>
							</div>
						` ) }
					</div>
				</div>
			</div>
		</div>
	`;
}
