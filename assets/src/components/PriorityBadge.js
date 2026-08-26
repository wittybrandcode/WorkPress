import { html } from '../utils/html.js';

export default function PriorityBadge( { priority } ) {
	let level = 1;
	let label = priority;
	let color = '#3b82f6';
	let tooltipText = 'أولوية المهمة';

	switch ( priority ) {
		case 'critical':
			level = 3;
			label = 'حرجة';
			color = '#dc2626';
			tooltipText = 'أولوية حرجة — تتطلب تدخلاً فورياً';
			break;
		case 'high':
			level = 3;
			label = 'عالية';
			color = '#ef4444';
			tooltipText = 'أولوية عالية — يجب الإنجاز في أقرب وقت';
			break;
		case 'medium':
			level = 2;
			label = 'متوسطة';
			color = '#f59e0b';
			tooltipText = 'أولوية متوسطة — وفق الجدول الزمني';
			break;
		case 'low':
			level = 1;
			label = 'منخفضة';
			color = '#3b82f6';
			tooltipText = 'أولوية منخفضة — عند توفر الوقت';
			break;
	}

	// §2.6 Constitution: High-Density Compact UI — use wp-dense-chip
	// §2.4 Constitution: Zero Emojis — use dashicons-flag
	// §2.1 Constitution: 0px Sharp Geometry — borderRadius: 0 enforced by wp-dense-chip
	// §2.5 Constitution: High-Contrast Institutional Palette — colored icon

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

