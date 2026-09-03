import { html } from '../../utils/html.js';

/**
 * SnowflakeIcon Component
 *
 * Universal ice / freeze icon used for frozen status and filter chips.
 */
export default function SnowflakeIcon({ size = 14, style = {}, className = '' }) {
	return html`
		<svg
			viewBox="0 0 24 24"
			width=${ size }
			height=${ size }
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className=${ `wp-snowflake-icon ${ className }` }
			style=${{
				display: 'inline-block',
				verticalAlign: '-1px',
				flexShrink: 0,
				...style
			}}
		>
			<line x1="12" y1="2" x2="12" y2="22"></line>
			<line x1="2" y1="12" x2="22" y2="12"></line>
			<line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
			<line x1="19.07" y1="4.93" x2="4.93" y2="19.07"></line>
			<polyline points="9 4 12 7 15 4"></polyline>
			<polyline points="9 20 12 17 15 20"></polyline>
			<polyline points="4 9 7 12 4 15"></polyline>
			<polyline points="20 9 17 12 20 15"></polyline>
		</svg>
	`;
}
