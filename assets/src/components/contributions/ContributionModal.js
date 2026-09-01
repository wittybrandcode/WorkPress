import { html, useState, useEffect, __ } from '../../utils/html.js';
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
			{ value: 'implementation', label: __( 'Technical Implementation', 'workpress' ) },
			{ value: 'solution', label: __( 'Propose Solution', 'workpress' ) },
			{ value: 'review', label: __( 'Review & Audit', 'workpress' ) },
			{ value: 'comment', label: __( 'Comment & Note', 'workpress' ) }
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
				toast( __( 'Contribution added successfully', 'workpress' ), 'success' );
				onSave();
				onClose();
			} )
			.catch( err => {
				console.error( 'Error creating contribution:', err );
				toast( __( 'An error occurred while adding contribution.', 'workpress' ), 'danger' );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const taskOptions = [
		{ value: '', label: `-- ${ __( 'Select Target Task', 'workpress' ) } --` },
		...tasks.map( t => ( { value: t.id, label: t.title } ) )
	];

	const scopeOptions = [
		{ value: 'client_review', label: __( 'Client Review', 'workpress' ) },
		{ value: 'internal', label: __( 'Internal Team Only', 'workpress' ) }
	];

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div>
				${ (!taskId || !content.trim()) && html`<span className="has-text-grey is-size-7">${ __( 'Please select a task and write contribution content', 'workpress' ) }</span>` }
			</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					${ __( 'Cancel', 'workpress' ) }
				</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}` } 
					onClick=${ handleSubmit }
					disabled=${ !taskId || !content.trim() || isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ __( 'Add Contribution', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ __( 'Add New Contribution', 'workpress' ) } 
			footer=${ footer }
			size="wp-mega-modal"
		>
			<div className="p-2">
				<!-- Fixed Sticky Top Container (Metadata Toolbar + ImagePicker) -->
				<div className="wp-modal-sticky-header">
					<div className="is-flex is-align-items-center mb-0" style=${{ gap: '10px', width: '100%' }}>
						<!-- Row 1: Metadata Toolbar -->
						<div className="wp-metadata-toolbar mb-0 is-flex-grow-1">
							<!-- Target Task Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">${ __( 'Task:', 'workpress' ) }</span>
								<${CustomSelect}
									value=${ taskId }
									onChange=${ setTaskId }
									options=${ taskOptions }
									placeholder=${ `-- ${ __( 'Select Task', 'workpress' ) } --` }
								/>
							</div>

							<!-- Contribution Type Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">${ __( 'Type:', 'workpress' ) }</span>
								<${CustomSelect}
									value=${ type }
									onChange=${ setType }
									options=${ typeOptions }
								/>
							</div>

							<!-- Visibility Scope Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">${ __( 'Scope:', 'workpress' ) }</span>
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
						placeholder=${ __( 'Write contribution details, technical solution, or notes...', 'workpress' ) }
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
