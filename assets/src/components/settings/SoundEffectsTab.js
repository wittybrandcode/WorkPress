import { html } from '../../utils/html.js';
import sound, { SOUND_EVENTS, AVAILABLE_SOUNDS } from '../../utils/sound.js';

/**
 * Interactive Sound Engine Settings Tab (SND01-03 + Granular Events Matrix)
 */
export default function SoundEffectsTab({
	soundEnabled = true,
	setSoundEnabled,
	soundVolume = 0.7,
	setSoundVolume,
	soundKit = '01',
	setSoundKit,
	eventsConfig = {},
	handleEventToggle,
	handleEventSoundChange,
	handleSaveSoundSettings,
	isSettingsSaving = false
}) {
	return html`
		<div className="wp-card p-5 mb-5">
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-4 pb-3" style=${{ borderBottom: '1px solid #ededed' }}>
				<div>
					<h3 className="title is-5 mb-1 is-flex is-align-items-center" style=${{ gap: '8px' }}>
						<span className="icon has-text-primary"><i className="dashicons dashicons-format-audio"></i></span>
						<span>الأصوات والتأثيرات التفاعلية (SND Sound Engine)</span>
					</h3>
					<p className="is-size-7 has-text-grey">
						إدارة وتخصيص المؤثرات الصوتية لكافة العمليات التفاعلية، إشعارات العملاء، وإغلاق المهام مع تحكم كامل بتفعيل وتعطيل كل حدث على حدة.
					</p>
				</div>
				<div className="field mb-0">
					<button 
						className=${`button ${ soundEnabled ? 'is-success' : 'is-dark is-outlined' } wp-sharp-button is-flex is-align-items-center`}
						onClick=${() => {
							const next = !soundEnabled;
							setSoundEnabled(next);
							sound.setEnabled(next);
							if (next) sound.play('button');
						}}
					>
						<span className="icon"><i className=${`dashicons ${ soundEnabled ? 'dashicons-controls-volumeon' : 'dashicons-controls-volumeoff' }`}></i></span>
						<span>${ soundEnabled ? 'الأصوات العامة مفعلة' : 'الأصوات العامة مكتومة' }</span>
					</button>
				</div>
			</div>

			<!-- Volume Slider & Active Kit Selection -->
			<div className="columns is-multiline mb-4">
				<div className="column is-6">
					<div className="field">
						<label className="label is-size-7 is-flex is-justify-content-space-between">
							<span>مستوى الصوت العام (Master Volume):</span>
							<strong className="has-text-primary">${ Math.round(soundVolume * 100) }%</strong>
						</label>
						<div className="control is-flex is-align-items-center" style=${{ gap: '10px' }}>
							<span className="icon is-small has-text-grey"><i className="dashicons dashicons-controls-volumeoff"></i></span>
							<input 
								type="range" 
								min="0" 
								max="1" 
								step="0.05" 
								value=${soundVolume} 
								onInput=${(e) => {
									const v = parseFloat(e.target.value);
									setSoundVolume(v);
									sound.setVolume(v);
								}}
								className="wp-sound-range-slider"
							/>
							<span className="icon is-small has-text-primary"><i className="dashicons dashicons-controls-volumeon"></i></span>
						</div>
					</div>
				</div>

				<div className="column is-6">
					<div className="field">
						<label className="label is-size-7">حزمة النغمات الأساسية (Sound Theme Kit):</label>
						<div className="control">
							<div className="select is-fullwidth" style=${{ borderRadius: 0 }}>
								<select 
									value=${soundKit} 
									onChange=${(e) => {
										const newKit = e.target.value;
										setSoundKit(newKit);
										sound.setKit(newKit);
										sound.preview('button', newKit);
									}}
									style=${{ borderRadius: 0, fontWeight: '600' }}
								>
									<option value="01">SND01 — Sine (الموجة العصرية النقية — Modern SaaS)</option>
									<option value="02">SND02 — Piano (بيانو شتاينواي الفاخر — Acoustic Grand)</option>
									<option value="03">SND03 — Industrial (الميكانيكية الملموسة — Tactile ASMR)</option>
								</select>
							</div>
						</div>
						<p className="help is-size-7 has-text-grey mt-1">
							${ soundKit === '01' ? 'نغمات إلكترونية فائقة النقاء والخفة تناسب بيئات العمل السريعة.' : ( soundKit === '02' ? 'نغمات مسجلة على بيانو كلاسيكي تمنح شعوراً بالدفء والفخامة.' : 'أصوات تكتكة ميكانيكية حية تمنح شعوراً ملموساً بكل نقرة.' ) }
						</p>
					</div>
				</div>
			</div>

			<!-- Granular Sound Events Matrix -->
			<div className="is-flex is-justify-content-space-between is-align-items-center mb-3">
				<h4 className="title is-6 mb-0 has-text-dark is-flex is-align-items-center" style=${{ gap: '6px' }}>
					<i className="dashicons dashicons-list-view has-text-info"></i>
					<span>مصفوفة أماكن وأصوات النظام التفاعلية:</span>
				</h4>
				<span className="is-size-7 has-text-grey">يمكنك تفعيل أو تعطيل وتغيير صوت أي حدث تفاعلي بشكل مستقل</span>
			</div>

			<div className="table-container mb-4">
				<table className="table is-fullwidth is-hoverable is-striped" style=${{ border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>
					<thead>
						<tr style=${{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
							<th style=${{ width: '7%', textAlign: 'center' }}>الحالة</th>
							<th style=${{ width: '25%' }}>الحدث التفاعلي</th>
							<th style=${{ width: '36%' }}>موضع وقوع الصوت في النظام</th>
							<th style=${{ width: '22%' }}>النغمة المخصصة</th>
							<th style=${{ width: '10%', textAlign: 'center' }}>معاينة</th>
						</tr>
					</thead>
					<tbody>
						${SOUND_EVENTS.map(ev => {
							const conf = eventsConfig[ev.key] || { enabled: ev.defaultEnabled, sound: ev.defaultSound };
							return html`
								<tr key=${ev.key} style=${{ opacity: conf.enabled ? 1 : 0.55, transition: 'opacity 0.2s ease' }}>
									<td className="has-text-centered" style=${{ verticalAlign: 'middle' }}>
										<button 
											className=${`button is-small ${ conf.enabled ? 'is-success' : 'is-light has-text-grey' } wp-sharp-button`}
											onClick=${() => handleEventToggle(ev.key)}
											title=${conf.enabled ? 'تعطيل هذا الصوت' : 'تفعيل هذا الصوت'}
											style=${{ padding: '2px 8px', height: '26px' }}
										>
											<span className="icon is-small">
												<i className=${`dashicons ${ conf.enabled ? 'dashicons-yes' : 'dashicons-no' }`}></i>
											</span>
										</button>
									</td>
									<td style=${{ verticalAlign: 'middle' }}>
										<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
											<span className="icon is-small has-text-primary"><i className=${`dashicons ${ev.icon}`}></i></span>
											<strong className="has-text-dark">${ev.label}</strong>
										</div>
									</td>
									<td style=${{ verticalAlign: 'middle' }}>
										<span className="tag is-light is-info" style=${{ borderRadius: 0, fontSize: '0.75rem', whiteSpace: 'normal', textAlign: 'right', display: 'inline-block', lineHeight: '1.4' }}>
											${ev.location}
										</span>
									</td>
									<td style=${{ verticalAlign: 'middle' }}>
										<div className="select is-small is-fullwidth" style=${{ borderRadius: 0 }}>
											<select 
												value=${conf.sound} 
												onChange=${e => handleEventSoundChange(ev.key, e.target.value)} 
												disabled=${!conf.enabled}
												style=${{ borderRadius: 0, fontWeight: '600' }}
											>
												${AVAILABLE_SOUNDS.map(s => html`
													<option key=${s.value} value=${s.value}>${s.label}</option>
												`)}
											</select>
										</div>
									</td>
									<td className="has-text-centered" style=${{ verticalAlign: 'middle' }}>
										<button 
											className="button is-small is-primary is-outlined wp-sharp-button"
											onClick=${() => sound.preview(conf.sound || ev.defaultSound, soundKit)}
											title="استماع للنغمة"
											style=${{ padding: '2px 10px', height: '26px' }}
										>
											<span className="icon is-small"><i className="dashicons dashicons-controls-play"></i></span>
											<span>استماع</span>
										</button>
									</td>
								</tr>
							`;
						})}
					</tbody>
				</table>
			</div>

			<div className="is-flex is-justify-content-space-between is-align-items-center pt-3" style=${{ borderTop: '1px solid #ededed' }}>
				<p className="is-size-7 has-text-grey">
					<i className="dashicons dashicons-saved ml-1 has-text-success"></i>
					المؤثرات الصوتية تعمل تلقائياً مع كافة الأجهزة والمتصفحات الحديثة دون أي تنزيلات إضافية.
				</p>
				<button 
					className=${`button is-primary wp-sharp-button ${ isSettingsSaving ? 'is-loading' : '' }`}
					onClick=${handleSaveSoundSettings}
					disabled=${isSettingsSaving}
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>حفظ إعدادات وتخصيصات الأصوات </span>
				</button>
			</div>
		</div>
	`;
}
