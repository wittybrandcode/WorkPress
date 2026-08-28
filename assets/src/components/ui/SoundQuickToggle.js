import { html, useState, useEffect } from '../../utils/html.js';
import { hooks } from '../../utils/hooks.js';
import sound from '../../utils/sound.js';
import { toast } from '../../utils/toast.js';

/**
 * SoundQuickToggle Component
 *
 * Fast one-click mute/unmute control in the executive Plaza header.
 */
export default function SoundQuickToggle() {
	const [enabled, setEnabled] = useState(sound.isEnabled());

	useEffect(() => {
		const handler = (e) => {
			if (e && e.detail) {
				setEnabled(e.detail.enabled);
			} else {
				setEnabled(sound.isEnabled());
			}
		};
		window.addEventListener('workpress_sound_state_changed', handler);
		return () => window.removeEventListener('workpress_sound_state_changed', handler);
	}, []);

	const handleToggle = () => {
		const nextState = sound.toggle();
		setEnabled(nextState);
		toast(nextState ? 'ØªÙ… ØªÙØ¹ÙŠÙ„ Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ© ' : 'ØªÙ… ÙƒØªÙ… Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ© ', 'info', 1500);
	};

	return html`
		<button 
			className=${`button wp-header-btn ${enabled ? 'is-active' : ''}`}
			onClick=${handleToggle}
			title=${enabled ? 'ÙƒØªÙ… Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ© (Mute)' : 'ØªØ´ØºÙŠÙ„ Ø§Ù„Ù…Ø¤Ø«Ø±Ø§Øª Ø§Ù„ØµÙˆØªÙŠØ© (Unmute)'}
			style=${{ 
				width: '32px', 
				height: '32px', 
				padding: 0, 
				display: 'inline-flex', 
				alignItems: 'center', 
				justifyContent: 'center',
				position: 'relative'
			}}
		>
			<span className="icon is-small">
				<i 
					className=${`dashicons ${enabled ? 'dashicons-controls-volumeon' : 'dashicons-controls-volumeoff'}`} 
					style=${{ fontSize: '18px', color: enabled ? '#6366f1' : '#94a3b8' }}
				></i>
			</span>
		</button>
	`;
}

// Auto register in header brand actions
hooks.addFilter('workpress_header_brand_actions', 'workpress/sound-toggle', (components) => {
	return [...components, SoundQuickToggle];
});
