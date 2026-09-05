import { html, __, isRtl } from '../../utils/html.js';
import Modal from '../modals/Modal.js';

/**
 * Broadcast & Operational Alert Detail Modal Component
 *
 * Displays the complete content of an announcement or automated alert,
 * complete with category badges, timestamps, contextual action links,
 * and direct navigation to the Live Broadcasts & Alerts Hub.
 *
 * @package WorkPress
 * @subpackage Components/Broadcasts
 * @version 2.5.0
 */
export default function BroadcastDetailModal( { isActive, onClose, broadcast } ) {
	if ( ! isActive || ! broadcast ) {
		return null;
	}

	const rtl = isRtl();

	// Priority visual configuration
	const priorityConfig = {
		urgent: {
			badgeClass: 'is-urgent',
			label: __( 'Urgent & Critical', 'workpress' ),
			icon: 'dashicons-warning',
			color: '#ef4444',
		},
		warning: {
			badgeClass: 'is-warning',
			label: __( 'Executive Alert', 'workpress' ),
			icon: 'dashicons-clock',
			color: '#f59e0b',
		},
		info: {
			badgeClass: 'is-info',
			label: __( 'Administrative Notice', 'workpress' ),
			icon: 'dashicons-info',
			color: '#3b82f6',
		},
		celebration: {
			badgeClass: 'is-celebration',
			label: __( 'Celebration & Milestone', 'workpress' ),
			icon: 'dashicons-star-filled',
			color: '#10b981',
		},
	};

	const currentPriority = broadcast.category === 'celebration'
		? priorityConfig.celebration
		: ( priorityConfig[ broadcast.priority ] || priorityConfig.info );

	// Category configuration
	const getCategoryLabel = () => {
		switch ( broadcast.category ) {
			case 'overdue':
				return __( 'Overdue task', 'workpress' );
			case 'deadline':
				return __( 'Upcoming deadline', 'workpress' );
			case 'triage':
				return __( 'New client request awaiting triage', 'workpress' );
			case 'celebration':
				return __( 'Project completed', 'workpress' );
			case 'unassigned':
				return __( 'Unassigned task', 'workpress' );
			case 'directive':
			default:
				return __( 'Managerial Directive / Broadcast', 'workpress' );
		}
	};

	const navigateToHub = () => {
		if ( onClose ) onClose();
		window.location.hash = '#/broadcasts';
	};

	const handleActionClick = () => {
		if ( broadcast.action_url ) {
			if ( onClose ) onClose();
			if ( broadcast.action_url.startsWith( '#' ) ) {
				window.location.hash = broadcast.action_url;
			} else {
				window.open( broadcast.action_url, '_blank' );
			}
		}
	};

	const modalTitle = html`
		<div className="is-flex is-align-items-center" style=${{ gap: '10px' }}>
			<span className=${ `wp-broadcast-badge ${ currentPriority.badgeClass }` }>
				<i className=${ `dashicons ${ currentPriority.icon }` } style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
				<span>${ currentPriority.label }</span>
			</span>
			<span className="is-size-7 has-text-grey">${ getCategoryLabel() }</span>
		</div>
	`;

	const modalFooter = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%', gap: '12px' }}>
			<!-- Direct access button to Hub -->
			<button
				type="button"
				className="button is-primary is-small"
				onClick=${ navigateToHub }
				style=${{ borderRadius: 0, fontWeight: 700 }}
			>
				<span className="icon"><i className="dashicons dashicons-megaphone"></i></span>
				<span>${ __( 'Enter Broadcasts & Alerts Hub', 'workpress' ) }</span>
			</button>

			<div className="is-flex is-align-items-center" style=${{ gap: '8px' }}>
				${ broadcast.action_url && html`
					<button
						type="button"
						className="button is-link is-light is-small"
						onClick=${ handleActionClick }
						style=${{ borderRadius: 0, fontWeight: 600 }}
					>
						<span className="icon"><i className="dashicons dashicons-external"></i></span>
						<span>${ __( 'Go to target item', 'workpress' ) }</span>
					</button>
				` }
				<button
					type="button"
					className="button is-light is-small"
					onClick=${ onClose }
					style=${{ borderRadius: 0 }}
				>
					${ __( 'Close', 'workpress' ) }
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal}
			isActive=${ isActive }
			onClose=${ onClose }
			title=${ modalTitle }
			footer=${ modalFooter }
			size="is-medium"
		>
			<div className="wp-broadcast-detail-body" style=${{ textAlign: rtl ? 'right' : 'left' }}>
				<h3 className="title is-5 mb-3" style=${{ color: '#0f172a', lineHeight: 1.4 }}>
					${ broadcast.title }
				</h3>

				<div
					className="box mb-4"
					style=${{
						borderRadius: 0,
						border: '1px solid #e2e8f0',
						backgroundColor: '#f8fafc',
						padding: '16px 20px',
						fontSize: '0.95rem',
						lineHeight: 1.7,
						color: '#334155',
						whiteSpace: 'pre-wrap',
					}}
				>
					${ broadcast.content }
				</div>

				<div className="is-flex is-align-items-center is-justify-content-space-between is-size-7 has-text-grey px-1">
					<div className="is-flex is-align-items-center" style=${{ gap: '16px' }}>
						${ broadcast.author_name && html`
							<span>
								<i className="dashicons dashicons-admin-users" style=${{ fontSize: '14px', verticalAlign: 'text-bottom' }}></i>
								<strong className="ms-1">${ __( 'Sender:', 'workpress' ) }</strong> ${ broadcast.author_name }
							</span>
						` }
						${ broadcast.start_at && html`
							<span>
								<i className="dashicons dashicons-calendar-alt" style=${{ fontSize: '14px', verticalAlign: 'text-bottom' }}></i>
								<strong className="ms-1">${ __( 'Date:', 'workpress' ) }</strong> ${ broadcast.start_at }
							</span>
						` }
					</div>
					${ broadcast.expires_at && html`
						<span className="has-text-grey-dark">
							<i className="dashicons dashicons-clock" style=${{ fontSize: '14px', verticalAlign: 'text-bottom' }}></i>
							<strong className="ms-1">${ __( 'Expires at:', 'workpress' ) }</strong> ${ broadcast.expires_at }
						</span>
					` }
				</div>
			</div>
		<//>
	`;
}
