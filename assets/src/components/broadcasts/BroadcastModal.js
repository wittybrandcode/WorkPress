import { html, useState, useEffect, __, isRtl } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import { broadcastsApi } from '../../api/client.js';

/**
 * Broadcast Directives Creation and Editing Modal Component
 *
 * Enables managers and project leaders to compose, schedule, and publish
 * managerial directives and workspace-wide announcements.
 *
 * @package WorkPress
 * @subpackage Components/Broadcasts
 * @version 2.5.0
 */
export default function BroadcastModal( { isActive, onClose, broadcast = null, onSaved } ) {
	const [ title, setTitle ] = useState( '' );
	const [ content, setContent ] = useState( '' );
	const [ priority, setPriority ] = useState( 'info' );
	const [ actionUrl, setActionUrl ] = useState( '' );
	const [ startAt, setStartAt ] = useState( '' );
	const [ expiresAt, setExpiresAt ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const rtl = isRtl();

	useEffect( () => {
		if ( broadcast ) {
			setTitle( broadcast.title || '' );
			setContent( broadcast.content || '' );
			setPriority( broadcast.priority || 'info' );
			setActionUrl( broadcast.action_url || '' );
			setStartAt( broadcast.start_at ? broadcast.start_at.replace( ' ', 'T' ).slice( 0, 16 ) : '' );
			setExpiresAt( broadcast.expires_at ? broadcast.expires_at.replace( ' ', 'T' ).slice( 0, 16 ) : '' );
		} else {
			setTitle( '' );
			setContent( '' );
			setPriority( 'info' );
			setActionUrl( '' );
			setStartAt( '' );
			setExpiresAt( '' );
		}
		setErrorMessage( '' );
		setIsSubmitting( false );
	}, [ broadcast, isActive ] );

	const handleSubmit = async ( e ) => {
		if ( e ) e.preventDefault();
		if ( ! title.trim() && ! content.trim() ) {
			setErrorMessage( __( 'Please provide a title or content for the managerial directive.', 'workpress' ) );
			return;
		}

		setIsSubmitting( true );
		setErrorMessage( '' );

		try {
			const payload = {
				title: title.trim(),
				content: content.trim(),
				priority,
				action_url: actionUrl.trim(),
				start_at: startAt ? startAt.replace( 'T', ' ' ) + ':00' : '',
				expires_at: expiresAt ? expiresAt.replace( 'T', ' ' ) + ':00' : '',
			};

			let result;
			if ( broadcast && broadcast.id ) {
				result = await broadcastsApi.update( broadcast.id, payload );
			} else {
				result = await broadcastsApi.create( payload );
			}

			// Fire global event to notify any live listeners
			window.dispatchEvent( new CustomEvent( 'workpress_broadcast_stream_updated' ) );

			if ( onSaved ) onSaved( result );
			if ( onClose ) onClose();
		} catch ( err ) {
			setErrorMessage( err.message || __( 'An error occurred while saving the managerial directive.', 'workpress' ) );
		} finally {
			setIsSubmitting( false );
		}
	};

	const modalTitle = broadcast && broadcast.id
		? __( 'Edit Managerial Directive', 'workpress' )
		: __( 'Publish New Managerial Directive', 'workpress' );

	const modalFooter = html`
		<div className="is-flex is-justify-content-flex-end" style=${{ gap: '8px', width: '100%' }}>
			<button
				type="button"
				className="button is-light is-small"
				onClick=${ onClose }
				disabled=${ isSubmitting }
				style=${{ borderRadius: 0 }}
			>
				${ __( 'Cancel', 'workpress' ) }
			</button>
			<button
				type="button"
				className=${ `button is-primary is-small ${ isSubmitting ? 'is-loading' : '' }` }
				onClick=${ handleSubmit }
				disabled=${ isSubmitting }
				style=${{ borderRadius: 0, fontWeight: 700 }}
			>
				<span className="icon"><i className="dashicons dashicons-saved"></i></span>
				<span>${ broadcast && broadcast.id ? __( 'Save Changes', 'workpress' ) : __( 'Publish Directive Now', 'workpress' ) }</span>
			</button>
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
			<form onSubmit=${ handleSubmit } style=${{ textAlign: rtl ? 'right' : 'left' }}>
				${ errorMessage && html`
					<div className="notification is-danger is-light p-3 mb-4" style=${{ borderRadius: 0, fontSize: '0.85rem' }}>
						${ errorMessage }
					</div>
				` }

				<!-- Directive Title -->
				<div className="field mb-3">
					<label className="label is-small">${ __( 'Directive Title or Announcement', 'workpress' ) } <span className="has-text-danger">*</span></label>
					<div className="control">
						<input
							type="text"
							className="input is-small"
							value=${ title }
							onInput=${ ( e ) => setTitle( e.target.value ) }
							placeholder=${ __( 'e.g. Beta release deadline for project', 'workpress' ) }
							style=${{ borderRadius: 0 }}
							required
						/>
					</div>
				</div>

				<!-- Directive Content -->
				<div className="field mb-3">
					<label className="label is-small">${ __( 'Operational Directive Text & Details', 'workpress' ) } <span className="has-text-danger">*</span></label>
					<div className="control">
						<textarea
							className="textarea is-small"
							rows="4"
							value=${ content }
							onInput=${ ( e ) => setContent( e.target.value ) }
							placeholder=${ __( 'Write operational directive details here for clear visibility across teams...', 'workpress' ) }
							style=${{ borderRadius: 0 }}
							required
						></textarea>
					</div>
				</div>

				<!-- Priority & Action URL -->
				<div className="columns mb-2">
					<div className="column is-6 py-1">
						<div className="field">
							<label className="label is-small">${ __( 'Priority & Visibility Level', 'workpress' ) }</label>
							<div className="control">
								<div className="select is-small is-fullwidth" style=${{ borderRadius: 0 }}>
									<select
										value=${ priority }
										onChange=${ ( e ) => setPriority( e.target.value ) }
										style=${{ borderRadius: 0 }}
									>
										<option value="info">${ __( 'General Info & Notice (Blue)', 'workpress' ) }</option>
										<option value="warning">${ __( 'Important Executive Alert (Orange)', 'workpress' ) }</option>
										<option value="urgent">${ __( 'Urgent & Immediate Directive (Red)', 'workpress' ) }</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div className="column is-6 py-1">
						<div className="field">
							<label className="label is-small">${ __( 'Quick Action Link (Optional)', 'workpress' ) }</label>
							<div className="control">
								<input
									type="text"
									className="input is-small"
									value=${ actionUrl }
									onInput=${ ( e ) => setActionUrl( e.target.value ) }
									placeholder=${ __( '#/kanban or https://...', 'workpress' ) }
									style=${{ borderRadius: 0 }}
								/>
							</div>
						</div>
					</div>
				</div>

				<!-- Scheduling -->
				<div className="columns mb-2">
					<div className="column is-6 py-1">
						<div className="field">
							<label className="label is-small">${ __( 'Start Schedule Date & Time (Optional)', 'workpress' ) }</label>
							<div className="control">
								<input
									type="datetime-local"
									className="input is-small"
									value=${ startAt }
									onInput=${ ( e ) => setStartAt( e.target.value ) }
									style=${{ borderRadius: 0 }}
								/>
							</div>
							<p className="help is-size-7">${ __( 'Leave empty for immediate publication', 'workpress' ) }</p>
						</div>
					</div>

					<div className="column is-6 py-1">
						<div className="field">
							<label className="label is-small">${ __( 'Expiration Date & Time (Optional)', 'workpress' ) }</label>
							<div className="control">
								<input
									type="datetime-local"
									className="input is-small"
									value=${ expiresAt }
									onInput=${ ( e ) => setExpiresAt( e.target.value ) }
									style=${{ borderRadius: 0 }}
								/>
							</div>
							<p className="help is-size-7">${ __( 'Leave empty to remain permanently active', 'workpress' ) }</p>
						</div>
					</div>
				</div>
			</form>
		<//>
	`;
}
