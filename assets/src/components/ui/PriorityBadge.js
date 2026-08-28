import { html } from '../../utils/html.js';

export default function PriorityBadge( { priority } ) {
	let level = 1;
	let label = priority;
	let color = '#3b82f6';
	let tooltipText = 'Ø£ÙˆÙ„ÙˆÙŠØ© Ø§Ù„Ù…Ù‡Ù…Ø©';

	switch ( priority ) {
		case 'critical':
			level = 3;
			label = 'Ø­Ø±Ø¬Ø©';
			color = '#dc2626';
			tooltipText = 'Ø£ÙˆÙ„ÙˆÙŠØ© Ø­Ø±Ø¬Ø© â€” ØªØªØ·Ù„Ø¨ ØªØ¯Ø®Ù„Ø§Ù‹ ÙÙˆØ±ÙŠØ§Ù‹';
			break;
		case 'high':
			level = 3;
			label = 'Ø¹Ø§Ù„ÙŠØ©';
			color = '#ef4444';
			tooltipText = 'Ø£ÙˆÙ„ÙˆÙŠØ© Ø¹Ø§Ù„ÙŠØ© â€” ÙŠØ¬Ø¨ Ø§Ù„Ø¥Ù†Ø¬Ø§Ø² ÙÙŠ Ø£Ù‚Ø±Ø¨ ÙˆÙ‚Øª';
			break;
		case 'medium':
			level = 2;
			label = 'Ù…ØªÙˆØ³Ø·Ø©';
			color = '#f59e0b';
			tooltipText = 'Ø£ÙˆÙ„ÙˆÙŠØ© Ù…ØªÙˆØ³Ø·Ø© â€” ÙˆÙÙ‚ Ø§Ù„Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ø²Ù…Ù†ÙŠ';
			break;
		case 'low':
			level = 1;
			label = 'Ù…Ù†Ø®ÙØ¶Ø©';
			color = '#3b82f6';
			tooltipText = 'Ø£ÙˆÙ„ÙˆÙŠØ© Ù…Ù†Ø®ÙØ¶Ø© â€” Ø¹Ù†Ø¯ ØªÙˆÙØ± Ø§Ù„ÙˆÙ‚Øª';
			break;
	}

	// Â§2.6 Constitution: High-Density Compact UI â€” use wp-dense-chip
	// Â§2.4 Constitution: Zero Emojis â€” use dashicons-flag
	// Â§2.1 Constitution: 0px Sharp Geometry â€” borderRadius: 0 enforced by wp-dense-chip
	// Â§2.5 Constitution: High-Contrast Institutional Palette â€” colored icon

	// Build network signal bars (3 bars, ascending height)
	const bars = [1, 2, 3].map( i => {
		const isActive = i <= level;
		const height = i === 1 ? '6px' : ( i === 2 ? '10px' : '14px' );
		return html`
			<div style=${{ 
				width: '4px', 
				height: height, 
				backgroundColor: isActive ? color : '#e2e8f0',
				display: 'inline-block',
				marginRight: '1px',
				borderRadius: '0'
			}}></div>
		`;
	});

	return html`
		<div 
			className="wp-dense-chip" 
			title=${ tooltipText }
			style=${{ gap: '4px', borderColor: '#cbd5e1' }}
		>
			<i className="dashicons dashicons-flag" style=${{ color: color }}></i>
			<div className="is-flex is-align-items-flex-end" style=${{ height: '14px', gap: '1px' }}>
				${ bars }
			</div>
			<span style=${{ color: '#0f172a', fontWeight: '800' }}>${ label }</span>
		</div>
	`;
}

