import { html } from '../../utils/html.js';
import { formatDate, formatDateTime, formatNumber, formatPercent } from '../../utils/datetime.js';

/**
 * General Settings & Localization/Time Management Tab
 */
export default function GeneralLocalizationTab({
	activeTab,
	timezone = 'Africa/Algiers',
	setTimezone,
	monthNaming = 'maghrebi',
	setMonthNaming,
	dateFormat = 'D MMMM YYYY',
	setDateFormat,
	relativeTime = true,
	setRelativeTime,
	siteName = 'WorkPress Workspace',
	setSiteName,
	defaultPriority = 'medium',
	setDefaultPriority,
	isSettingsSaving = false,
	handleSaveLocalizationSettings,
	handleSaveGeneralSettings
}) {
	if (activeTab === 'general') {
		return html`
			<div className="wp-card p-5">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">إعدادات النظام العامة</h3>
						<p className="has-text-grey is-size-7">ضبط وتخصيص بيئة العمل العامة وسلوك النظام.</p>
					</div>
					<button 
						className="button wp-btn is-primary"
						disabled=${isSettingsSaving}
						onClick=${handleSaveGeneralSettings}
					>
						${isSettingsSaving ? 'جاري الحفظ...' : 'حفظ إعدادات النظام'}
					</button>
				</div>

				<div className="field mb-4">
					<label className="label is-small">اسم بيئة العمل (Workspace Name)</label>
					<div className="control">
						<input 
							className="input is-small" 
							type="text" 
							value=${siteName} 
							onInput=${(e) => setSiteName(e.target.value)}
							style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
						/>
					</div>
				</div>

				<div className="field mb-4">
					<label className="label is-small">الأولوية الافتراضية للمهام الجديدة</label>
					<div className="control">
						<div className="select is-small is-fullwidth">
							<select 
								value=${defaultPriority} 
								onChange=${(e) => setDefaultPriority(e.target.value)}
								style=${{ borderRadius: 0, border: '1px solid #cbd5e1' }}
							>
								<option value="low">منخفضة</option>
								<option value="medium">متوسطة</option>
								<option value="high">عالية</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	if (activeTab === 'localization_time') {
		return html`
			<div className="wp-card p-5">
				<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
					<div>
						<h3 className="title is-5 mb-1 has-text-weight-bold">الوقت والمنطقة الزمنية واللغة</h3>
						<p className="has-text-grey is-size-7">إدارة توقيت بيئة العمل، تسمية الشهور المغاربية/المشرقية، وفرض الأرقام المعيارية عالمياً.</p>
					</div>
					<button 
						className="button wp-btn is-primary"
						disabled=${isSettingsSaving}
						onClick=${handleSaveLocalizationSettings}
					>
						${isSettingsSaving ? 'جاري الحفظ...' : 'حفظ إعدادات الوقت'}
					</button>
				</div>

				<div className="columns is-variable is-5">
					<div className="column is-7">
						<!-- اختيار المنطقة الزمنية -->
						<div className="field mb-5">
							<label className="label is-small">المنطقة الزمنية للمنظومة (Timezone)</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${timezone} 
										onChange=${(e) => setTimezone(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<optgroup label="المنطقة المغاربية والشمال أفريقي">
											<option value="Africa/Algiers">الجزائر (GMT+1) - Africa/Algiers</option>
											<option value="Africa/Casablanca">المغرب / الدار البيضاء (GMT+1) - Africa/Casablanca</option>
											<option value="Africa/Tunis">تونس (GMT+1) - Africa/Tunis</option>
											<option value="Africa/Tripoli">ليبيا / طرابلس (GMT+2) - Africa/Tripoli</option>
											<option value="Africa/Cairo">مصر / القاهرة (GMT+2) - Africa/Cairo</option>
										</optgroup>
										<optgroup label="الخليج العربي والشرق الأوسط">
											<option value="Asia/Riyadh">السعودية / الرياض (GMT+3) - Asia/Riyadh</option>
											<option value="Asia/Dubai">الإمارات / دبي (GMT+4) - Asia/Dubai</option>
											<option value="Asia/Kuwait">الكويت (GMT+3) - Asia/Kuwait</option>
											<option value="Asia/Qatar">قطر (GMT+3) - Asia/Qatar</option>
											<option value="Asia/Muscat">عُمان / مسقط (GMT+4) - Asia/Muscat</option>
											<option value="Asia/Baghdad">العراق / بغداد (GMT+3) - Asia/Baghdad</option>
											<option value="Asia/Amman">الأردن / عمّان (GMT+3) - Asia/Amman</option>
											<option value="Asia/Beirut">لبنان / بيروت (GMT+2) - Asia/Beirut</option>
											<option value="Asia/Jerusalem">فلسطين / القدس (GMT+2) - Asia/Jerusalem</option>
										</optgroup>
										<optgroup label="نطاقات دولية">
											<option value="Europe/Paris">أوروبا / باريس (GMT+1) - Europe/Paris</option>
											<option value="Europe/London">بريطانيا / لندن (GMT+0) - Europe/London</option>
											<option value="UTC">التوقيت العالمي المنسق (UTC) - UTC</option>
										</optgroup>
									</select>
								</div>
							</div>
							<p className="help has-text-grey is-size-7">تُحسب كافة سجلات التعديل وخيوط الزمن والمساهمات بناءً على هذا النطاق الزمني.</p>
						</div>

						<!-- نظام تسمية الشهور -->
						<div className="field mb-5">
							<label className="label is-small">نظام تسمية الشهور (Month Naming System)</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${monthNaming} 
										onChange=${(e) => setMonthNaming(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<option value="maghrebi">الشهور المغاربية الرسمية (جانفي، فيفري، مارس، أفريل، ماي، جوان، جويلية، أوت، سبتمبر، أكتوبر، نوفمبر، ديسمبر) - موصى به</option>
										<option value="mashriqi">الشهور المشرقية (يناير، فبراير، مارس، أبريل، مايو، يونيو، يوليو، أغسطس، سبتمبر، أكتوبر، نوفمبر، ديسمبر)</option>
										<option value="syriac">الشهور السريانية والشامية (كانون الثاني، شباط، آذار، نيسان، أيار، حزيران، تموز، آب، أيلول، تشرين الأول، تشرين الثاني، كانون الأول)</option>
									</select>
								</div>
							</div>
						</div>

						<!-- صيغة عرض التاريخ القياسي -->
						<div className="field mb-5">
							<label className="label is-small">صيغة عرض التاريخ التقويمي (Date Format)</label>
							<div className="control">
								<div className="select is-fullwidth wp-input">
									<select 
										value=${dateFormat} 
										onChange=${(e) => setDateFormat(e.target.value)}
										style=${{ borderRadius: 0 }}
									>
										<option value="D MMMM YYYY">اليوم واسم الشهر والسنة (مثال: 18 أوت 2026)</option>
										<option value="DD/MM/YYYY">أرقام قياسية مفصولة بشرطة مائلة (مثال: 18/08/2026)</option>
										<option value="YYYY-MM-DD">التاريخ الدولي القياسي (مثال: 2026-08-18)</option>
									</select>
								</div>
							</div>
						</div>

						<!-- التوقيت النسبي الذكي -->
						<div className="field mb-4">
							<label className="checkbox is-size-7 has-text-weight-bold">
								<input 
									type="checkbox" 
									checked=${relativeTime} 
									onChange=${(e) => setRelativeTime(e.target.checked)}
									style=${{ marginLeft: '8px' }}
								/>
								تفعيل التوقيت النسبي الذكي (مثل: "الآن"، "منذ 5 دقائق"، "منذ ساعتين"، "أمس") في خيوط الزمن والإشعارات
							</label>
						</div>
					</div>

					<!-- عمود المعاينة الحية الفورية -->
					<div className="column is-5">
						<div className="box p-4 wp-settings-preview-box">
							<div className="is-flex is-align-items-center mb-3 pb-2" style=${{ borderBottom: '1px solid #cbd5e1' }}>
								<span className="icon has-text-primary mr-2" style=${{ marginLeft: '6px' }}><i className="dashicons dashicons-visibility"></i></span>
								<h4 className="title is-6 mb-0 has-text-weight-bold">معاينة حية ومباشرة (Live Preview)</h4>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">تاريخ اليوم والشهور:</p>
								<p className="has-text-weight-bold is-size-6 has-text-primary">
									${formatDate(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
								</p>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">التاريخ والوقت الكامل:</p>
								<p className="is-size-7 has-text-dark font-weight-bold">
									${formatDateTime(new Date(), { monthNaming, short: dateFormat === 'DD/MM/YYYY' })}
								</p>
							</div>

							<div className="mb-3">
								<p className="heading has-text-grey is-size-7 mb-1">عينة من التوقيت النسبي (في المساهمات):</p>
								<div className="tags are-small mb-0">
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>الآن</span>
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>منذ 15 دقيقة</span>
									<span className="tag is-light is-info" style=${{ borderRadius: 0 }}>منذ 3 ساعات</span>
								</div>
							</div>

							<div className="mb-2">
								<p className="heading has-text-grey is-size-7 mb-1">الأرقام القياسية والنسب المئوية:</p>
								<p className="is-size-7 has-text-dark">
									<span>تم إنجاز <strong>${formatNumber(1250)}</strong> مساهمة بنسبة نجاح <strong>${formatPercent(88)}</strong></span>
								</p>
							</div>

							<div className="mt-3 p-2 has-background-white" style=${{ border: '1px solid #e2e8f0' }}>
								<p className="is-size-7 has-text-grey" style=${{ fontSize: '0.72rem', lineHeight: '1.4' }}>
									<i className="dashicons dashicons-yes-alt has-text-success ml-1"></i>
									يتم فرض الأرقام العالمية (1, 2, 3...) تلقائياً ومنع الأرقام المشرقية/الهندية لضمان بيئة عمل احترافية.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	return null;
}
