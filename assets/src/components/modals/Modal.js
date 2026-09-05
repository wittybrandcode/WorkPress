import { html, useEffect, isRtl, __ } from '../../utils/html.js';

/**
 * Universal Modal Shell Component
 * 
 * Enforces WorkPress Sharp Design System:
 * - 0px border radius
 * - Strict close via 'X' icon button only (backdrop clicking disabled to protect user edits)
 * - Sticky header & footer with independent scrollable body
 * - 100% Multilingual and Bi-directional (RTL/LTR) alignment
 */
export default function Modal( { isActive, onClose, title, children, footer, size = 'is-medium' } ) {
	if ( ! isActive ) return null;

	const rtl = isRtl();

	return html`
		<div className="modal is-active">
			<!-- Non-clickable backdrop strictly preventing accidental loss of user work -->
			<div className="modal-background"></div>
			
			<div className=${ `modal-card ${size}` } onClick=${ ( e ) => e.stopPropagation() }>
				<header className="modal-card-head">
					<p className="modal-card-title has-text-weight-bold" style=${{ textAlign: rtl ? 'right' : 'left' }}>
						${ title }
					</p>
					
					<!-- Executive Sharp 0px Close Button (Exclusive Dismissal Target) -->
					<button 
						type="button"
						className="wp-modal-close-btn" 
						aria-label=${ __( 'Close', 'workpress' ) } 
						title=${ __( 'Close', 'workpress' ) } 
						onClick=${ onClose }
					>
						<svg viewBox="0 0 24 24" width="16" height="16">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</header>
				
				<section className="modal-card-body">
					${ children }
				</section>
				
				${ footer && html`
					<footer className="modal-card-foot">
						${ footer }
					</footer>
				` }
			</div>
		</div>
	`;
}

