import { html, createPortal } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * Request Studio Filter Bar & Sticky Header Toolbar
 */
export default function RequestFilterBar({
	totalRequests = 0,
	pendingRequestsCount = 0,
	underReviewRequestsCount = 0,
	activeRequestsCount = 0,
	rejectedRequestsCount = 0,
	viewMode = 'cards',
	setViewMode,
	searchQuery = '',
	setSearchQuery,
	uniqueForms = [],
	selectedFormFilter = 'all',
	setSelectedFormFilter,
	selectedSort = 'newest',
	setSelectedSort,
	selectedStatus = 'all',
	setSelectedStatus
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const topToolbarContent = html`
		<div className="wp-filter-toolbar is-flex is-justify-content-space-between is-align-items-center" style=${{ flexWrap: 'wrap', gap: '10px' }}>
			<div className="wp-filter-group is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<span className="wp-filter-label" style=${{ fontSize: '1rem', fontWeight: '800' }}>
					<i className="dashicons dashicons-forms mr-1"></i>
					استوديو فرز وإدارة الطلبات:
				</span>

				<div className="tags are-small mb-0" style=${{ display: 'inline-flex', gap: '4px' }}>
					<span className="tag is-dark has-text-weight-bold">
						إجمالي: ${totalRequests}
					</span>
					<span className="tag is-warning has-text-weight-bold" style=${{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
						بانتظار الفرز: ${pendingRequestsCount}
					</span>
					<span className="tag is-info has-text-weight-bold" style=${{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
						قيد الدراسة: ${underReviewRequestsCount}
					</span>
					<span className="tag is-success has-text-weight-bold" style=${{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
						معتمدة: ${activeRequestsCount}
					</span>
					<span className="tag is-danger has-text-weight-bold" style=${{ backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
						مرفوضة: ${rejectedRequestsCount}
					</span>
				</div>
			</div>

			<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
				<!-- View Mode Switcher -->
				<div className="buttons has-addons are-small mb-0">
					<button
						className=${`button ${viewMode === 'cards' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'cards' ); sound.play( 'button' ); }}
						title="عرض البطاقات والمواصفات"
					>
						<span className="icon is-small"><i className="dashicons dashicons-grid-view"></i></span>
						<span>بطاقات</span>
					</button>
					<button
						className=${`button ${viewMode === 'kanban' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'kanban' ); sound.play( 'button' ); }}
						title="لوحة كانبان الفرز"
					>
						<span className="icon is-small"><i className="dashicons dashicons-columns"></i></span>
						<span>كانبان</span>
					</button>
					<button
						className=${`button ${viewMode === 'table' ? 'is-primary is-selected has-text-weight-bold' : 'is-light'}`}
						onClick=${() => { setViewMode( 'table' ); sound.play( 'button' ); }}
						title="جدول الفرز السريع"
					>
						<span className="icon is-small"><i className="dashicons dashicons-list-view"></i></span>
						<span>جدول</span>
					</button>
				</div>

				<div className="buttons are-small mb-0" style=${{ gap: '6px' }}>
					<a href="#/projects" className="button is-light wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-category"></i></span>
						<span>المشاريع</span>
					</a>
					<a href="#/forms" className="button is-primary is-outlined wp-sharp-button" style=${{ fontWeight: '700' }}>
						<span className="icon"><i className="dashicons dashicons-forms"></i></span>
						<span>نماذج الاستقبال</span>
					</a>
				</div>
			</div>
		</div>
	`;

	return html`
		<div>
			${ portalRoot && createPortal( topToolbarContent, portalRoot ) }

			<!-- Filter & Triage Bar -->
			<div className="box wp-card wp-requests-filter-card">
				<div className="columns is-vcentered">
					<!-- Search Input -->
					<div className="column is-3">
						<div className="field">
							<div className="control has-icons-right">
								<input
									type="text"
									className="input is-small wp-sharp-input"
									value=${searchQuery}
									onInput=${e => setSearchQuery( e.target.value )}
									placeholder="بحث في الطلبات (الاسم، العميل، البريد، التفاصيل)..."
									style=${{ height: '36px', fontSize: '0.88rem' }}
								/>
								<span className="icon is-right is-small"><i className="dashicons dashicons-search"></i></span>
							</div>
						</div>
					</div>

					<!-- Form Template Filter -->
					<div className="column is-2">
						<div className="field">
							<div className="control">
								<div className="select is-small is-fullwidth wp-sharp-input">
									<select value=${selectedFormFilter} onChange=${e => { setSelectedFormFilter( e.target.value ); sound.play( 'button' ); }}>
										<option value="all">كافة القوالب (${totalRequests})</option>
										${ uniqueForms.map( fId => html`
											<option key=${fId} value=${fId}>${fId}</option>
										` ) }
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- Sort Selector -->
					<div className="column is-2">
						<div className="field">
							<div className="control">
								<div className="select is-small is-fullwidth wp-sharp-input">
									<select value=${selectedSort} onChange=${e => { setSelectedSort( e.target.value ); sound.play( 'button' ); }}>
										<option value="newest">الأحدث وصولاً</option>
										<option value="oldest">الأقدم أولاً</option>
										<option value="deadline">الأقرب موعداً</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<!-- Status Filter Tabs -->
					<div className="column is-5 is-flex is-justify-content-flex-end" style=${{ gap: '4px', flexWrap: 'wrap' }}>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'all' ? 'is-dark' : 'is-light'}`}
							onClick=${() => { setSelectedStatus( 'all' ); sound.play( 'button' ); }}
						>
							الكل (${totalRequests})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'pending' ? 'is-warning' : 'is-light'}`}
							style=${selectedStatus === 'pending' ? { backgroundColor: '#f59e0b', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'pending' ); sound.play( 'button' ); }}
						>
							وارد (${pendingRequestsCount})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'under_review' ? 'is-info' : 'is-light'}`}
							style=${selectedStatus === 'under_review' ? { backgroundColor: '#0284c7', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'under_review' ); sound.play( 'button' ); }}
						>
							دراسة (${underReviewRequestsCount})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'active' ? 'is-success' : 'is-light'}`}
							style=${selectedStatus === 'active' ? { backgroundColor: '#10b981', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'active' ); sound.play( 'button' ); }}
						>
							معتمد (${activeRequestsCount})
						</button>
						<button
							className=${`button is-small wp-sharp-button ${selectedStatus === 'rejected' ? 'is-danger' : 'is-light'}`}
							style=${selectedStatus === 'rejected' ? { backgroundColor: '#ef4444', color: '#fff', fontWeight: '800' } : {}}
							onClick=${() => { setSelectedStatus( 'rejected' ); sound.play( 'button' ); }}
						>
							مرفوض (${rejectedRequestsCount})
						</button>
					</div>
				</div>
			</div>
		</div>
	`;
}
