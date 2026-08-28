import { html, useState, useEffect } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import { tasksApi, contributionsApi } from '../../api/client.js';
import WpEditor from '../ui/WpEditor.js';
import ImagePicker from '../ui/ImagePicker.js';
import CustomSelect from '../ui/CustomSelect.js';
import { toast } from '../../utils/toast.js';

export default function ContributionModal({ isActive, onClose, onSave, defaultTaskId = null }) {
	const [ taskId, setTaskId ] = useState( defaultTaskId || '' );
	const [ content, setContent ] = useState( '' );
	const [ type, setType ] = useState( 'implementation' );
	const [ visibilityScope, setVisibilityScope ] = useState( 'client_review' );
	const [ coverId, setCoverId ] = useState( null );
	const [ coverUrl, setCoverUrl ] = useState( '' );
	
	const [ tasks, setTasks ] = useState( [] );
	const [ availableTypes, setAvailableTypes ] = useState( [] );
	const [ isSaving, setIsSaving ] = useState( false );

	useEffect( () => {
		if ( isActive ) {
			tasksApi.list().then( data => {
				setTasks( Array.isArray( data ) ? data : [] );
			} ).catch( console.error );

			contributionsApi.types.list().then( data => {
				const userTypes = Array.isArray( data ) ? data.filter( t => !t.is_system || t.key === 'general' ) : [];
				setAvailableTypes( userTypes );
				if ( userTypes.length > 0 ) {
					setType( userTypes[0].key );
				}
			} ).catch( console.error );
		}
	}, [ isActive ] );

	useEffect( () => {
		if ( isActive ) {
			setTaskId( defaultTaskId || '' );
			setContent( '' );
			setCoverId( null );
			setCoverUrl( '' );
		}
	}, [ isActive, defaultTaskId ] );

	const typeOptions = availableTypes.length > 0
		? availableTypes.map( t => ({ value: t.key, label: t.label }) )
		: [
			{ value: 'implementation', label: 'ØªÙ†ÙÙŠØ° ÙÙ†ÙŠ' },
			{ value: 'solution', label: 'Ø­Ù„ Ù…Ù‚ØªØ±Ø­' },
			{ value: 'review', label: 'Ù…Ø±Ø§Ø¬Ø¹Ø© ÙˆØªØ¯Ù‚ÙŠÙ‚' },
			{ value: 'comment', label: 'ØªØ¹Ù„ÙŠÙ‚ ÙˆÙ…Ù„Ø§Ø­Ø¸Ø©' }
		];

	const handleSubmit = () => {
		if ( ! taskId || ! content.trim() ) return;

		setIsSaving( true );
		
		const data = {
			content: content,
			type: type,
			payload: {
				cover_id: coverId,
				visibility_scope: visibilityScope
			},
			attachments: coverId ? [ coverId ] : []
		};

		tasksApi.contributions.create( taskId, data )
			.then( () => {
				toast( 'ØªÙ…Øª Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
				onSave();
				onClose();
			} )
			.catch( err => {
				console.error( 'Error creating contribution:', err );
				toast( 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©', 'danger' );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const taskOptions = [
		{ value: '', label: '-- Ø§Ø®ØªØ± Ø§Ù„Ù…Ù‡Ù…Ø© Ø§Ù„Ù…Ø³ØªÙ‡Ø¯ÙØ© --' },
		...tasks.map( t => ( { value: t.id, label: t.title } ) )
	];

	const scopeOptions = [
		{ value: 'client_review', label: 'Ù…ØªØ§Ø­ Ù„Ù„Ø¹Ù…ÙŠÙ„ ' },
		{ value: 'internal', label: 'Ø¯Ø§Ø®Ù„ÙŠ Ù„Ù„ÙØ±ÙŠÙ‚ ' }
	];

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div>
				${ (!taskId || !content.trim()) && html`<span className="has-text-grey is-size-7">ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ù‡Ù…Ø© ÙˆÙƒØªØ§Ø¨Ø© Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©</span>` }
			</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					Ø¥Ù„ØºØ§Ø¡
				</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}` } 
					onClick=${ handleSubmit }
					disabled=${ !taskId || !content.trim() || isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>Ø¥Ø¶Ø§ÙØ© Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø©</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title="Ø¥Ø¶Ø§ÙØ© Ù…Ø³Ø§Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø©" 
			footer=${ footer }
			size="wp-mega-modal"
		>
			<div className="p-2">
				<!-- Fixed Sticky Top Container (Metadata Toolbar + ImagePicker) -->
				<div className="wp-modal-sticky-header">
					<div className="is-flex is-align-items-center mb-0" style=${{ gap: '10px', width: '100%' }}>
						<!-- Row 1: Metadata Toolbar (Equal distribution across width) -->
						<div className="wp-metadata-toolbar mb-0 is-flex-grow-1">
							<!-- Target Task Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">Ø§Ù„Ù…Ù‡Ù…Ø©:</span>
								<${CustomSelect}
									value=${ taskId }
									onChange=${ setTaskId }
									options=${ taskOptions }
									placeholder="-- Ø§Ø®ØªØ± Ø§Ù„Ù…Ù‡Ù…Ø© --"
								/>
							</div>

							<!-- Contribution Type Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">Ø§Ù„Ù†ÙˆØ¹:</span>
								<${CustomSelect}
									value=${ type }
									onChange=${ setType }
									options=${ typeOptions }
								/>
							</div>

							<!-- Visibility Scope Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">Ø§Ù„Ù†Ø·Ø§Ù‚:</span>
								<${CustomSelect}
									value=${ visibilityScope }
									onChange=${ setVisibilityScope }
									options=${ scopeOptions }
								/>
							</div>
						</div>

						<!-- ImagePicker for Contribution Cover -->
						<${ImagePicker}
							compact=${ true }
							value=${ coverUrl }
							onChange=${ ( id, url ) => {
								setCoverId( id );
								setCoverUrl( url );
							} }
						/>
					</div>
				</div>

				<!-- Contribution Details Editor (Scrollable) -->
				<div>
					<${WpEditor}
						id="contribution-content-editor"
						value=${ content }
						onChange=${ setContent }
						placeholder="Ø§ÙƒØªØ¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø³Ø§Ù‡Ù…Ø© Ø£Ùˆ Ø§Ù„ÙƒÙˆØ¯ Ø£Ùˆ Ø§Ù„Ø­Ù„ Ø§Ù„ÙÙ†ÙŠ Ù‡Ù†Ø§..."
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
