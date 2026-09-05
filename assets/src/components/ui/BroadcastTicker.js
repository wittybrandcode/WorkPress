import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';
import { broadcastsApi } from '../../api/client.js';
import BroadcastDetailModal from '../broadcasts/BroadcastDetailModal.js';

/**
 * WorkPress Bounded Vertical Broadcast & Alerts Ticker
 *
 * Replaces old horizontal marquee crawl with an executive vertical emergence
 * inside a bounded slot. Text naturally fills the available width and truncates
 * with ellipsis (...). Clicking any item opens its comprehensive detail modal,
 * which includes a dedicated entry button to the Live Broadcasts Hub.
 *
 * Features:
 * - Strict vertical emergence from bottom to center (0 horizontal translation)
 * - Automatic rotation paused on mouse hover
 * - Real-time sync with backend stream API and window broadcast events
 * - 0px sharp executive design language
 *
 * @package WorkPress
 * @subpackage UI
 * @version 2.5.0
 */
export default function BroadcastTicker() {
	const defaultNotice = {
		id: 'default',
		type: 'directive',
		category: 'directive',
		priority: 'info',
		title: __( 'WorkPress System', 'workpress' ),
		content: __( 'Welcome to WorkPress — please document your achievements via contributions and keep tasks updated.', 'workpress' ),
	};

	const [ items, setItems ] = useState( [ defaultNotice ] );
	const [ currentIndex, setCurrentIndex ] = useState( 0 );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ selectedBroadcast, setSelectedBroadcast ] = useState( null );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ animKey, setAnimKey ] = useState( 0 );

	const intervalRef = useRef( null );
	const rtl = isRtl();

	// Fetch live stream from backend API
	const fetchStream = async () => {
		try {
			const data = await broadcastsApi.getStream();
			if ( Array.isArray( data ) && data.length > 0 ) {
				setItems( data );
			} else {
				// Fallback to saved local notice if any
				const saved = window.workpressSettings?.broadcastNotice;
				if ( saved && saved.text && saved.enabled !== false ) {
					setItems( [ {
						id: 'legacy',
						type: 'directive',
						category: 'directive',
						priority: 'info',
						title: __( 'Management Directives', 'workpress' ),
						content: saved.text,
					} ] );
				} else {
					setItems( [ defaultNotice ] );
				}
			}
		} catch ( err ) {
			// Fail gracefully with fallback
		}
	};

	useEffect( () => {
		fetchStream();

		// Listen for real-time updates dispatched across the app
		const handleStreamUpdate = () => fetchStream();
		window.addEventListener( 'workpress_broadcast_stream_updated', handleStreamUpdate );
		window.addEventListener( 'workpress_broadcast_updated', handleStreamUpdate );

		// Periodically refresh stream every 90 seconds
		const pollInterval = setInterval( fetchStream, 90 * 1000 );

		return () => {
			window.removeEventListener( 'workpress_broadcast_stream_updated', handleStreamUpdate );
			window.removeEventListener( 'workpress_broadcast_updated', handleStreamUpdate );
			clearInterval( pollInterval );
		};
	}, [] );

	// Automatic vertical rotation timer (advances index when not hovered)
	useEffect( () => {
		if ( intervalRef.current ) {
			clearInterval( intervalRef.current );
		}

		if ( items.length <= 1 || isHovered ) {
			return;
		}

		intervalRef.current = setInterval( () => {
			setCurrentIndex( ( prev ) => {
				const next = ( prev + 1 ) % items.length;
				setAnimKey( Date.now() );
				return next;
			} );
		}, 7000 ); // 7 seconds per item for readable executive comprehension

		return () => {
			if ( intervalRef.current ) {
				clearInterval( intervalRef.current );
			}
		};
	}, [ items.length, isHovered ] );

	// Safe current active item
	const activeItem = items[ currentIndex ] || items[ 0 ] || defaultNotice;

	// Badge and style definitions based on priority & category
	const getPriorityBadge = ( item ) => {
		if ( item.category === 'celebration' ) {
			return html`
				<span className="wp-broadcast-badge is-celebration ms-2" style=${{ marginInlineEnd: '8px' }}>
					<i className="dashicons dashicons-star-filled" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#ffffff' }}></i>
					<span style=${{ color: '#ffffff', fontWeight: 800 }}>${ __( 'Celebration', 'workpress' ) }</span>
				</span>
			`;
		}
		if ( item.priority === 'urgent' ) {
			return html`
				<span className="wp-broadcast-badge is-urgent ms-2" style=${{ marginInlineEnd: '8px' }}>
					<i className="dashicons dashicons-warning" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#ffffff' }}></i>
					<span style=${{ color: '#ffffff', fontWeight: 800 }}>${ __( 'Urgent', 'workpress' ) }</span>
				</span>
			`;
		}
		if ( item.priority === 'warning' ) {
			return html`
				<span className="wp-broadcast-badge is-warning ms-2" style=${{ marginInlineEnd: '8px' }}>
					<i className="dashicons dashicons-clock" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#ffffff' }}></i>
					<span style=${{ color: '#ffffff', fontWeight: 800 }}>${ __( 'Warning', 'workpress' ) }</span>
				</span>
			`;
		}
		if ( item.type === 'directive' ) {
			return html`
				<span className="wp-broadcast-badge is-directive ms-2" style=${{ marginInlineEnd: '8px' }}>
					<i className="dashicons dashicons-megaphone" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#ffffff' }}></i>
					<span style=${{ color: '#ffffff', fontWeight: 800 }}>${ __( 'Notice', 'workpress' ) }</span>
				</span>
			`;
		}
		if ( item.priority === 'info' || item.category === 'info' ) {
			return html`
				<span className="wp-broadcast-badge is-info ms-2" style=${{ marginInlineEnd: '8px' }}>
					<i className="dashicons dashicons-info" style=${{ fontSize: '13px', width: '13px', height: '13px', color: '#ffffff' }}></i>
					<span style=${{ color: '#ffffff', fontWeight: 800 }}>${ __( 'Notice', 'workpress' ) }</span>
				</span>
			`;
		}
		return null;
	};

	const handleItemClick = ( e ) => {
		if ( e ) e.preventDefault();
		setSelectedBroadcast( activeItem );
		setIsModalOpen( true );
	};

	const handleNext = ( e ) => {
		if ( e ) e.stopPropagation();
		setCurrentIndex( ( prev ) => ( prev + 1 ) % items.length );
		setAnimKey( Date.now() );
	};

	const handlePrev = ( e ) => {
		if ( e ) e.stopPropagation();
		setCurrentIndex( ( prev ) => ( prev - 1 + items.length ) % items.length );
		setAnimKey( Date.now() );
	};

	return html`
		<div
			className="wp-broadcast-ticker is-flex is-align-items-center"
			onMouseEnter=${ () => setIsHovered( true ) }
			onMouseLeave=${ () => setIsHovered( false ) }
			style=${{
				height: '30px',
				flex: '1 1 auto',
				minWidth: 0,
				margin: rtl ? '0 0 0 16px' : '0 16px 0 0',
				backgroundColor: 'transparent',
				border: 'none',
				overflow: 'hidden',
				fontSize: '0.85rem',
				position: 'relative',
			}}
		>
			<!-- Hub Icon & Status Pulse -->
			<div
				className="is-flex is-align-items-center"
				title=${ __( 'Broadcasts & Operational Alerts Hub', 'workpress' ) }
				style=${{ flexShrink: 0, marginInlineEnd: '8px', cursor: 'pointer' }}
				onClick=${ () => { window.location.hash = '#/broadcasts'; } }
			>
				<span
					className=${ `wp-broadcast-pulse ${ activeItem.priority === 'urgent' ? 'is-urgent' : 'is-active' }` }
					style=${{ marginInlineEnd: '6px' }}
				></span>
				<i
					className="dashicons dashicons-megaphone"
					style=${{
						fontSize: '16px',
						width: '16px',
						height: '16px',
						color: '#0f172a',
					}}
				></i>
			</div>

			<!-- Slot with ellipsis overflow -->
			<div
				className="wp-broadcast-slot"
				style=${{
					flex: 1,
					minWidth: 0,
					height: '30px',
					overflow: 'hidden',
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<div
					key=${ animKey }
					className="wp-broadcast-slide-enter is-flex is-align-items-center"
					style=${{
						width: '100%',
						minWidth: 0,
						whiteSpace: 'nowrap',
						overflow: 'hidden',
					}}
				>
					${ getPriorityBadge( activeItem ) }

					<!-- Clickable Text (Bold and larger size) -->
					<div
						className="wp-broadcast-clickable-text"
						onClick=${ handleItemClick }
						title=${ `${ activeItem.title }: ${ activeItem.content }` }
						style=${{
							flex: 1,
							minWidth: 0,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							fontSize: '0.94rem',
							fontWeight: '700',
							textDecoration: 'none',
						}}
					>
						<strong style=${{ fontWeight: '800', marginInlineEnd: '8px' }}>
							${ activeItem.title }
						</strong>
						<span style=${{ fontWeight: '700' }}>
							— ${ activeItem.content }
						</span>
					</div>
				</div>
			</div>

			<!-- Controls & Counter (Exact 30px height matching Quick Add button) -->
			${ items.length > 1 && html`
				<div
					className="wp-broadcast-controls is-flex is-align-items-center"
					style=${{ flexShrink: 0, marginInlineStart: '10px' }}
				>
					<button
						type="button"
						className="wp-broadcast-ctrl-btn"
						onClick=${ handlePrev }
						title=${ __( 'Previous', 'workpress' ) }
						aria-label=${ __( 'Previous', 'workpress' ) }
					>
						<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` }></i>
					</button>
					<span className="wp-broadcast-ctrl-counter">
						${ currentIndex + 1 }/${ items.length }
					</span>
					<button
						type="button"
						className="wp-broadcast-ctrl-btn"
						onClick=${ handleNext }
						title=${ __( 'Next', 'workpress' ) }
						aria-label=${ __( 'Next', 'workpress' ) }
					>
						<i className=${ `dashicons ${ rtl ? 'dashicons-arrow-left-alt2' : 'dashicons-arrow-right-alt2' }` }></i>
					</button>
				</div>
			` }

			<!-- مودال التفاصيل الكاملة مع زر الانتقال لصفحة الإعلانات والتنبيهات -->
			<${BroadcastDetailModal}
				isActive=${ isModalOpen }
				onClose=${ () => setIsModalOpen( false ) }
				broadcast=${ selectedBroadcast }
			/>
		</div>
	`;
}
