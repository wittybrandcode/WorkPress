import { html, useEffect } from '../../utils/html.js';

/**
 * Universal Modal Shell Component
 * 
 * Enforces WorkPress Sharp Design System:
 * - 0px border radius
 * - Strict escape key listener
 * - Sticky header & footer with independent scrollable body
 * - Accessible focus and contrast
 */
export default function Modal( { isActive, onClose, title, children, footer, size = 'is-medium' } ) {
	useEffect( () => {
		if ( ! isActive ) return;

		const handleKeyDown = ( event ) => {
			if ( event.key === 'Escape' || event.key === 'Esc' ) {
				event.preventDefault();
				if ( onClose ) onClose();
			}
		};

		document.addEventListener( 'keydown', handleKeyDown );
		return () => document.removeEventListener( 'keydown', handleKeyDown );
	}, [ isActive, onClose ] );

	if ( ! isActive ) return null;

	return html`
		<div className="modal is-active" style=${{ zIndex: 100000 }}>
			<div className="modal-background" onClick=${ onClose } style=${{ backgroundColor: 'rgba(0, 25, 47, 0.65)' }}></div>
			<div className=${ `modal-card ${size}` } style=${{ 
				borderRadius: 0, 
				border: '1px solid #cbd5e1', 
				boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)', 
				animation: 'wpModalZoomIn 0.2s ease-out forwards',
				backgroundColor: '#ffffff',
				maxHeight: '90vh',
				display: 'flex',
				flexDirection: 'column'
			}} onClick=${ ( e ) => e.stopPropagation() }>
				<header className="modal-card-head" style=${{ 
					borderRadius: 0, 
					backgroundColor: '#ffffff', 
					borderBottom: '1px solid #e2e8f0', 
					padding: '16px 20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					flexShrink: 0
				}}>
					<p className="modal-card-title has-text-weight-bold is-size-5 mb-0" style=${{ color: '#0f172a', textAlign: 'right' }}>${ title }</p>
					<button 
						className="delete" 
						aria-label="close" 
						onClick=${ onClose } 
						style=${{ 
							backgroundColor: '#0f172a',
							width: '28px',
							height: '28px',
							minWidth: '28px',
							minHeight: '28px',
							borderRadius: 0
						}}
					></button>
				</header>
				<section className="modal-card-body" style=${{ 
					borderRadius: 0, 
					padding: '24px', 
					backgroundColor: '#ffffff',
					overflowY: 'auto',
					flexGrow: 1
				}}>
					${ children }
				</section>
				${ footer && html`
					<footer className="modal-card-foot is-justify-content-flex-end" style=${{ 
						borderRadius: 0, 
						backgroundColor: '#f8fafc', 
						borderTop: '1px solid #e2e8f0', 
						padding: '14px 20px',
						flexShrink: 0
					}}>
						${ footer }
					</footer>
				` }
			</div>
		</div>
	`;
}

