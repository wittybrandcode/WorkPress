/**
 * WorkPress UI Sound Engine (SND Integration)
 *
 * High-performance Web Audio API sound sprite player with granular per-event controls.
 * 100% self-hosted, offline-ready, zero-delay UI sound cues.
 *
 * @package WorkPress
 * @subpackage Utils
 * @version 1.3.0
 */

export const AVAILABLE_SOUNDS = [
	{ value: 'notification', label: 'نغمة التنبيه الناعمة (Notification)' },
	{ value: 'ringtone_loop', label: 'رنين متعدد النغمات (Ringtone)' },
	{ value: 'celebration', label: 'نغمة الاحتفال والانتصار (Celebration)' },
	{ value: 'button', label: 'نقرة زر وظيفي مؤكد (Button Click)' },
	{ value: 'tap', label: 'نقرة لمسية خفيفة ناعمة (Tap)' },
	{ value: 'swipe', label: 'سحب هوائي سريع (Swipe)' },
	{ value: 'select', label: 'اختيار وتحديد دقيق (Select)' },
	{ value: 'transition_up', label: 'انتقال طبقي تصاعدي (Transition Up)' },
	{ value: 'transition_down', label: 'انتقال طبقي تنازلي (Transition Down)' },
	{ value: 'toggle_on', label: 'مفتاح تفعيل (Toggle On)' },
	{ value: 'toggle_off', label: 'مفتاح إيقاف (Toggle Off)' },
	{ value: 'caution', label: 'نغمة الحذر والتحذير (Caution)' },
	{ value: 'disabled', label: 'نغمة المنع والتعطيل (Disabled)' },
	{ value: 'progress_loop', label: 'نغمة المعالجة والتقدم (Progress)' }
];

export const SOUND_EVENTS = [
	{
		key: 'notification',
		label: 'وصول إشعار جديد في الجرس',
		location: 'الهيدر العلوي عند ورود إشعار لحظي أو رسالة نظام',
		icon: 'dashicons-bell',
		defaultSound: 'notification',
		defaultEnabled: true
	},
	{
		key: 'client_feedback',
		label: 'استفسار أو تعليق جديد من العميل',
		location: 'خط زمن المهمة وتنبيهات الإدارة عند تفاعل العميل من البوابة',
		icon: 'dashicons-businessman',
		defaultSound: 'notification',
		defaultEnabled: true
	},
	{
		key: 'celebration',
		label: 'اعتماد حل واكتمال المهمة',
		location: 'عند الضغط على "اعتماد كحل" في المهمة أو خط المراحل',
		icon: 'dashicons-awards',
		defaultSound: 'celebration',
		defaultEnabled: true
	},
	{
		key: 'button',
		label: 'إرسال المساهمات والردود والنماذج',
		location: 'عند إضافة تعليق، حفظ مهمة، أو تقديم طلب مشروع',
		icon: 'dashicons-external',
		defaultSound: 'button',
		defaultEnabled: true
	},
	{
		key: 'modal_open',
		label: 'فتح النوافذ المنبثقة (Modals & Drawers)',
		location: 'عند فتح نافذة إنشاء مهمة، مشروع، أو معاينة المساهمات',
		icon: 'dashicons-visibility',
		defaultSound: 'transition_up',
		defaultEnabled: true
	},
	{
		key: 'modal_close',
		label: 'إغلاق النوافذ المنبثقة',
		location: 'عند إغلاق النافذة المنبثقة أو الضغط على زر إلغاء',
		icon: 'dashicons-no-alt',
		defaultSound: 'transition_down',
		defaultEnabled: true
	},
	{
		key: 'tab_switch',
		label: 'التبديل بين التبويبات والفلاتر',
		location: 'عند الضغط على ألسنة التبويب في المشاريع، الإعدادات، أو البوابة',
		icon: 'dashicons-category',
		defaultSound: 'tap',
		defaultEnabled: true
	},
	{
		key: 'kanban_drop',
		label: 'سحب ونقل بطاقات الكانبان',
		location: 'عند إفلات بطاقة المهمة في عمود حالة جديد في الكانبان',
		icon: 'dashicons-columns',
		defaultSound: 'swipe',
		defaultEnabled: true
	},
	{
		key: 'caution',
		label: 'التحذيرات وأخطاء التحقق وتأكيد الحذف',
		location: 'عند ظهور رسائل الخطأ أو نافذة تأكيد الحذف',
		icon: 'dashicons-warning',
		defaultSound: 'caution',
		defaultEnabled: true
	},
	{
		key: 'disabled_click',
		label: 'الأزرار المعطلة أو الإجراءات غير المتاحة',
		location: 'عند النقر على زر معطل أو غير مصرح للمستخدم',
		icon: 'dashicons-ban',
		defaultSound: 'disabled',
		defaultEnabled: true
	}
];

class SoundEngine {
	constructor() {
		this.ctx = null;
		this.buffers = {};
		this.spritemaps = {};
		this.loadingKits = {};
		
		const wpSettings = window.workpressSettings || {};
		
		const storedEnabled = localStorage.getItem('workpress_sound_enabled');
		this.enabled = storedEnabled !== null 
			? storedEnabled === 'true' 
			: (wpSettings.sound_enabled !== undefined ? !!wpSettings.sound_enabled : true);

		const storedVolume = localStorage.getItem('workpress_sound_volume');
		this.volume = storedVolume !== null 
			? parseFloat(storedVolume) 
			: (wpSettings.sound_volume !== undefined ? parseFloat(wpSettings.sound_volume) : 0.7);

		const storedKit = localStorage.getItem('workpress_sound_kit');
		this.kit = storedKit || wpSettings.sound_kit || '01';

		this.baseUrl = (wpSettings.pluginUrl || '/wp-content/plugins/WorkPress/').replace(/\/$/, '');

		// Per-event configuration
		this.eventsConfig = this.loadEventsConfig(wpSettings.sound_events_config);

		// Auto unlock WebAudio on first user gesture
		this.initUnlockListener();
	}

	loadEventsConfig(backendConfig) {
		let stored = null;
		try {
			const raw = localStorage.getItem('workpress_sound_events_config');
			if (raw) stored = JSON.parse(raw);
		} catch (e) {}

		if (!stored && backendConfig && typeof backendConfig === 'object') {
			stored = backendConfig;
		}

		const finalConfig = {};
		SOUND_EVENTS.forEach(ev => {
			if (stored && stored[ev.key]) {
				finalConfig[ev.key] = {
					enabled: stored[ev.key].enabled !== undefined ? !!stored[ev.key].enabled : ev.defaultEnabled,
					sound: stored[ev.key].sound || ev.defaultSound
				};
			} else {
				finalConfig[ev.key] = {
					enabled: ev.defaultEnabled,
					sound: ev.defaultSound
				};
			}
		});
		return finalConfig;
	}

	saveEventsConfig(newConfig) {
		this.eventsConfig = { ...this.eventsConfig, ...newConfig };
		try {
			localStorage.setItem('workpress_sound_events_config', JSON.stringify(this.eventsConfig));
		} catch (e) {}
	}

	getEventConfig(eventKey) {
		return this.eventsConfig[eventKey] || { enabled: true, sound: eventKey };
	}

	getAllEventsConfig() {
		return this.eventsConfig;
	}

	getAudioContext() {
		if ( ! this.ctx && ( window.AudioContext || window.webkitAudioContext ) ) {
			const AudioCtx = window.AudioContext || window.webkitAudioContext;
			this.ctx = new AudioCtx();
		}
		if ( this.ctx && this.ctx.state === 'suspended' && this.unlocked ) {
			this.ctx.resume().catch( () => {} );
		}
		return this.ctx;
	}

	initUnlockListener() {
		const unlock = () => {
			this.unlocked = true;
			const ctx = this.getAudioContext();
			if ( ctx && ctx.state === 'suspended' ) {
				ctx.resume().catch( () => {} );
			}
			window.removeEventListener( 'pointerdown', unlock );
			window.removeEventListener( 'keydown', unlock );
		};
		window.addEventListener( 'pointerdown', unlock, { once: true, passive: true } );
		window.addEventListener( 'keydown', unlock, { once: true, passive: true } );
	}

	async loadKit( kitId = '01' ) {
		const kitKey = String( kitId ).padStart( 2, '0' );

		if ( this.buffers[kitKey] && this.spritemaps[kitKey] ) {
			return { buffer: this.buffers[kitKey], map: this.spritemaps[kitKey] };
		}

		if ( this.loadingKits[kitKey] ) {
			return this.loadingKits[kitKey];
		}

		this.loadingKits[kitKey] = ( async () => {
			const jsonUrl = `${this.baseUrl}/assets/sounds/sprite/${kitKey}/audioSprite.json`;
			const mp3Url  = `${this.baseUrl}/assets/sounds/sprite/${kitKey}/audioSprite.mp3`;

			try {
				const [ jsonRes, audioRes ] = await Promise.all([
					fetch( jsonUrl ).then( r => r.json() ),
					fetch( mp3Url ).then( r => r.arrayBuffer() )
				]);

				const ctx = this.getAudioContext();
				if ( ! ctx ) {
					throw new Error( 'Web Audio API not supported' );
				}

				const audioBuffer = await ctx.decodeAudioData( audioRes );
				this.buffers[kitKey] = audioBuffer;
				this.spritemaps[kitKey] = jsonRes.spritemap || {};

				delete this.loadingKits[kitKey];
				return { buffer: audioBuffer, map: this.spritemaps[kitKey] };
			} catch ( err ) {
				delete this.loadingKits[kitKey];
				console.warn( `WorkPress Sound: Failed to load kit ${kitKey}`, err );
				throw err;
			}
		} )();

		return this.loadingKits[kitKey];
	}

	/**
	 * Play sound for a given event key or sound name
	 */
	async play( eventKeyOrSound, customKit = null ) {
		if ( ! this.enabled && ! customKit ) {
			return;
		}

		// Check per-event config if mapped
		const eventConf = this.eventsConfig[eventKeyOrSound];
		if ( eventConf ) {
			if ( ! eventConf.enabled && ! customKit ) {
				return; // Event is individually disabled
			}
			eventKeyOrSound = eventConf.sound || eventKeyOrSound;
		}

		const kitKey = customKit ? String( customKit ).padStart( 2, '0' ) : String( this.kit ).padStart( 2, '0' );

		// Randomizers for realistic acoustic variations
		let targetKey = eventKeyOrSound;
		if ( eventKeyOrSound === 'tap' ) {
			const rand = Math.floor( Math.random() * 5 ) + 1;
			targetKey = `tap_0${rand}`;
		} else if ( eventKeyOrSound === 'swipe' ) {
			const rand = Math.floor( Math.random() * 5 ) + 1;
			targetKey = `swipe_0${rand}`;
		} else if ( eventKeyOrSound === 'type' ) {
			const rand = Math.floor( Math.random() * 5 ) + 1;
			targetKey = `type_0${rand}`;
		}

		try {
			const { buffer, map } = await this.loadKit( kitKey );
			const sprite = map[targetKey] || map[eventKeyOrSound];
			if ( ! sprite ) {
				return;
			}

			const ctx = this.getAudioContext();
			if ( ! ctx ) return;

			const source = ctx.createBufferSource();
			source.buffer = buffer;

			const gainNode = ctx.createGain();
			const vol = customKit ? 0.8 : this.volume;
			gainNode.gain.setValueAtTime( Math.max( 0, Math.min( 1, vol ) ), ctx.currentTime );

			source.connect( gainNode );
			gainNode.connect( ctx.destination );

			const offset = sprite.start;
			const duration = Math.max( 0.05, sprite.end - sprite.start );

			source.start( 0, offset, duration );
		} catch ( e ) {
			// Fail silently without crashing UI
		}
	}

	preview( soundName, kitId = null ) {
		const kit = kitId || this.kit;
		return this.play( soundName, kit );
	}

	isEnabled() {
		return this.enabled;
	}

	setEnabled( val ) {
		this.enabled = !!val;
		localStorage.setItem( 'workpress_sound_enabled', String( this.enabled ) );
		window.dispatchEvent( new CustomEvent( 'workpress_sound_state_changed', { detail: { enabled: this.enabled } } ) );
	}

	toggle() {
		this.setEnabled( ! this.enabled );
		if ( this.enabled ) {
			this.play( 'button' );
		}
		return this.enabled;
	}

	getVolume() {
		return this.volume;
	}

	setVolume( val ) {
		this.volume = Math.max( 0, Math.min( 1, parseFloat( val ) || 0.7 ) );
		localStorage.setItem( 'workpress_sound_volume', String( this.volume ) );
	}

	getKit() {
		return this.kit;
	}

	setKit( kitId ) {
		this.kit = String( kitId ).padStart( 2, '0' );
		localStorage.setItem( 'workpress_sound_kit', this.kit );
		this.loadKit( this.kit ).catch( () => {} );
	}
}

// Global Singleton Instance
export const sound = new SoundEngine();
export default sound;
