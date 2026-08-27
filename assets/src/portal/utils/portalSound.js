/**
 * WorkPress Portal Audio Engine
 * 
 * @package WorkPress
 * @subpackage Portal/Utils
 */

import { getPortalConfig } from '../api/portalApi.js';

let portalAudioCtx = null;
let portalAudioBuffer = null;
let portalSpriteMap = null;

export async function playPortalSound(soundName) {
    try {
        const config = getPortalConfig();
        if (!portalAudioCtx && (window.AudioContext || window.webkitAudioContext)) {
            portalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (portalAudioCtx && portalAudioCtx.state === 'suspended') {
            await portalAudioCtx.resume();
        }
        if (!portalAudioBuffer) {
            const baseUrl = (config.pluginUrl || '/wp-content/plugins/WorkPress/').replace(/\/$/, '');
            const [jsonRes, audioRes] = await Promise.all([
                fetch(`${baseUrl}/assets/sounds/sprite/01/audioSprite.json`).then(r => r.json()),
                fetch(`${baseUrl}/assets/sounds/sprite/01/audioSprite.mp3`).then(r => r.arrayBuffer())
            ]);
            portalSpriteMap = jsonRes.spritemap || {};
            portalAudioBuffer = await portalAudioCtx.decodeAudioData(audioRes);
        }
        const sprite = portalSpriteMap[soundName];
        if (!sprite || !portalAudioCtx || !portalAudioBuffer) return;

        const source = portalAudioCtx.createBufferSource();
        source.buffer = portalAudioBuffer;
        const gain = portalAudioCtx.createGain();
        gain.gain.setValueAtTime(0.5, portalAudioCtx.currentTime);
        source.connect(gain);
        gain.connect(portalAudioCtx.destination);
        source.start(0, sprite.start, Math.max(0.05, sprite.end - sprite.start));
    } catch (e) {
        // Fail silently
    }
}

export function playClockTick() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!portalAudioCtx) {
            portalAudioCtx = new AudioCtx();
        }
        if (portalAudioCtx && portalAudioCtx.state === 'suspended') {
            portalAudioCtx.resume().catch(() => {});
        }
        if (portalAudioCtx && portalAudioCtx.state === 'running') {
            const now = portalAudioCtx.currentTime;
            const osc = portalAudioCtx.createOscillator();
            const gain = portalAudioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            osc.connect(gain);
            gain.connect(portalAudioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        }
    } catch (e) {
        // Fail silently
    }
}
