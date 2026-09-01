import { html, __ } from '../../utils/html.js';

export default function PriorityBadge( { priority } ) {
	let level = 1;
	let label = priority;
	let color = '#3b82f6';
	let tooltipText = __( 'Task Priority', 'workpress' );

	switch ( priority ) {
		case 'critical':
		case 'urgent':
			level = 3;
			label = __( 'Critical', 'workpress' );
			color = '#dc2626';
			tooltipText = __( 'Critical Priority — requires immediate action', 'workpress' );
			break;
		case 'high':
			level = 3;
			label = __( 'High', 'workpress' );
			color = '#ef4444';
			tooltipText = __( 'High Priority — complete as soon as possible', 'workpress' );
			break;
		case 'medium':
			level = 2;
			label = __( 'Medium', 'workpress' );
			color = '#f59e0b';
			tooltipText = __( 'Medium Priority — according to timeline', 'workpress' );
			break;
		case 'low':
			level = 1;
			label = __( 'Low', 'workpress' );
			color = '#3b82f6';
			tooltipText = __( 'Low Priority — when time allows', 'workpress' );
			break;
	}

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
