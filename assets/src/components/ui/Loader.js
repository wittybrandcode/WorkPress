import { html, __ } from '../../utils/html.js';

/**
 * WorkPress Square Snake Loader Component
 *
 * A modern 3x3 grid wave loader based on pure, zero-dependency, GPU-accelerated
 * CSS animations in WorkPress Emerald Green (#10b981).
 *
 * @param {Object} props
 * @param {number|'small'|'medium'|'large'} [props.size='medium'] - Size in pixels or preset
 * @param {string} [props.color='#10b981'] - Square block color
 * @param {string} [props.label=''] - Optional text label under the loader
 * @param {boolean} [props.center=false] - If true, wraps in centered container with padding
 * @param {string} [props.className=''] - Extra classes
 * @param {Object} [props.style={}] - Extra inline styles
 */
export default function Loader({
	size = 'medium',
	color = '#10b981',
	label = '',
	center = false,
	className = '',
	style = {}
}) {
	let pxSize = 32;
	if (size === 'small') pxSize = 20;
	else if (size === 'medium') pxSize = 32;
	else if (size === 'large') pxSize = 44;
	else if (typeof size === 'number') pxSize = size;

	const gap = Math.max(2, Math.round(pxSize / 12));

	const gridCoords = [
		[0, 0], [1, 0], [2, 0],
		[0, 1], [1, 1], [2, 1],
		[0, 2], [1, 2], [2, 2]
	];

	const loaderNode = html`
		<div 
			className=${`wp-square-snake-loader ${className}`}
			style=${{
				display: 'inline-grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gap: `${gap}px`,
				width: `${pxSize}px`,
				height: `${pxSize}px`,
				...style
			}}
			role="status"
			aria-label=${ __( 'Loading...', 'workpress' ) }
		>
			${gridCoords.map(([x, y], i) => html`
				<div
					key=${i}
					className="wp-square-cell"
					style=${{
						backgroundColor: color,
						borderRadius: '0px',
						width: '100%',
						height: '100%',
						animation: 'wpSquareSnake 1.5s infinite ease-in-out',
						animationDelay: `${(x + y) * 0.15}s`
					}}
				/>
			`)}
		</div>
	`;

	if (center || label) {
		return html`
			<div className="wp-loader-container has-text-centered py-5 is-flex is-flex-direction-column is-align-items-center is-justify-content-center">
				${loaderNode}
				${label ? html`<p className="is-size-7 has-text-grey mt-3 mb-0 has-text-weight-medium">${label}</p>` : null}
			</div>
		`;
	}

	return loaderNode;
}

/**
 * WorkPress Animated Skeleton Card Component
 * Shimmer placeholder to prevent Cumulative Layout Shift (CLS)
 */
export function SkeletonCard({ height = '120px', className = '', count = 1 }) {
	const items = Array.from({ length: count });

	return html`
		<div className="wp-skeleton-wrapper is-flex is-flex-direction-column" style=${{ gap: '12px' }}>
			${items.map((_, i) => html`
				<div
					key=${i}
					className=${`box wp-card p-4 ${className}`}
					style=${{
						height,
						backgroundColor: '#f1f5f9',
						border: '1px solid #e2e8f0',
						position: 'relative',
						overflow: 'hidden',
						animation: 'wpShimmer 1.5s infinite linear',
						backgroundImage: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
						backgroundSize: '200% 100%'
					}}
				>
					<div style=${{ width: '40%', height: '14px', backgroundColor: '#cbd5e1', marginBottom: '10px' }}></div>
					<div style=${{ width: '75%', height: '10px', backgroundColor: '#e2e8f0', marginBottom: '8px' }}></div>
					<div style=${{ width: '55%', height: '10px', backgroundColor: '#e2e8f0' }}></div>
				</div>
			`)}
		</div>
	`;
}

export { Loader as SquareSnake };
