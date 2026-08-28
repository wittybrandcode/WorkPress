import { html, useState, useEffect } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import { tasksApi, projectsApi } from '../../api/client.js';
import WpEditor from '../ui/WpEditor.js';
import ImagePicker from '../ui/ImagePicker.js';
import CustomSelect from '../ui/CustomSelect.js';
import { toast } from '../../utils/toast.js';

export default function TaskModal( { isActive, onClose, onSave, task = null, defaultProjectId = null } ) {
	const [ title, setTitle ] = useState( '' );
	const [ content, setContent ] = useState( '' );
	const [ projectId, setProjectId ] = useState( defaultProjectId || '' );
	const [ priority, setPriority ] = useState( 'medium' );
	const [ estimatedHours, setEstimatedHours ] = useState( '' );
	const [ featuredImage, setFeaturedImage ] = useState( null );
	const [ featuredImageUrl, setFeaturedImageUrl ] = useState( '' );
	
	const [ projects, setProjects ] = useState( [] );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const priorityOptions = [
		{ value: 'low', label: 'Ù…Ù†Ø®ÙØ¶Ø©' },
		{ value: 'medium', label: 'Ù…ØªÙˆØ³Ø·Ø©' },
		{ value: 'high', label: 'Ø¹Ø§Ù„ÙŠØ© (Ø­Ø±Ø¬Ø©)' }
	];

	useEffect( () => {
		projectsApi.list().then( setProjects ).catch( console.error );
	}, [] );

	useEffect( () => {
		if ( task && isActive ) {
			setTitle( task.title || '' );
			setContent( task.content || '' );
			setProjectId( task.project_id || '' );
			setPriority( task.priority || 'medium' );
			setEstimatedHours( task.estimated_hours !== undefined ? task.estimated_hours : '' );
			setFeaturedImage( task.cover_id || null );
			setFeaturedImageUrl( task.cover_url || '' );
		} else if ( isActive ) {
			setTitle( '' );
			setContent( '' );
			setProjectId( defaultProjectId || '' );
			setPriority( 'medium' );
			setEstimatedHours( '' );
			setFeaturedImage( null );
			setFeaturedImageUrl( '' );
		}
		setError( '' );
	}, [ task, isActive, defaultProjectId ] );

	const handleSubmit = () => {
		setError( '' );
		if ( !title || title.trim() === '' ) {
			setError( 'Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‡Ù…Ø© Ù…Ø·Ù„ÙˆØ¨' );
			return;
		}
		if ( !projectId ) {
			setError( 'Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù…Ø·Ù„ÙˆØ¨' );
			return;
		}

		setIsSaving( true );
		
		const data = {
			title: title,
			content: content,
			project_id: projectId,
			priority: priority,
			estimated_hours: parseFloat( estimatedHours ) || 0,
			cover_id: featuredImage
		};

		const request = task && task.id
			? tasksApi.update( task.id, data )
			: tasksApi.create( data );
			
		request.then( () => {
			toast( task && task.id ? 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­' : 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù…Ø© Ø¨Ù†Ø¬Ø§Ø­', 'success' );
			onSave();
			onClose();
		} ).catch( err => {
			console.error( 'Error saving task:', err );
			toast( 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ù…Ù‡Ù…Ø©', 'danger' );
		} ).finally( () => setIsSaving( false ) );
	};

	const projectOptions = [
		{ value: '', label: '-- Ø§Ø®ØªØ± Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ --' },
		...projects.map( p => ( { value: p.id, label: p.name } ) )
	];

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div className="has-text-danger is-size-7">${ error }</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>Ø¥Ù„ØºØ§Ø¡</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${ isSaving ? 'is-loading' : '' }` }
					onClick=${ handleSubmit }
					disabled=${ isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ task ? 'Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª' : 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù‡Ù…Ø©' }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ task ? 'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù‡Ù…Ø©' : 'Ù…Ø³ØªÙ†Ø¯ Ù…Ù‡Ù…Ø© Ø¬Ø¯ÙŠØ¯Ø©' }
			footer=${ footer }
			size="wp-mega-modal"
		>
			<div className="p-2">
				<!-- Fixed Sticky Top Container (Title + Metadata Toolbar) -->
				<div className="wp-modal-sticky-header">
					<!-- Row 1: Title Input + Compact ImagePicker -->
					<div className="is-flex is-align-items-center mb-3" style=${{ gap: '10px' }}>
						<input 
							className="input wp-title-input" 
							type="text" 
							placeholder="Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ù‡Ù…Ø©..." 
							value=${ title }
							onChange=${ (e) => setTitle( e.target.value ) }
							style=${{ 
								direction: 'rtl', 
								textAlign: 'right', 
								borderRadius: 0, 
								border: '1px solid #e2e8f0', 
								boxShadow: 'none',
								outline: 'none',
								flex: 1,
								marginBottom: 0
							}}
							onFocus=${(e) => e.target.style.borderColor = '#cbd5e1'}
							onBlur=${(e) => e.target.style.borderColor = '#e2e8f0'}
							required
							autoFocus
						/>
						<${ImagePicker}
							compact=${ true }
							value=${ featuredImageUrl }
							onChange=${ ( id, url ) => {
								setFeaturedImage( id );
								setFeaturedImageUrl( url );
							} }
						/>
					</div>

					<!-- Row 2: Metadata Toolbar (CustomSelect for Project and Priority) -->
					<div className="wp-metadata-toolbar">
						<!-- Project CustomSelect -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ø§Ù„Ù…Ø´Ø±ÙˆØ¹:</span>
							<${CustomSelect}
								value=${ projectId }
								onChange=${ setProjectId }
								options=${ projectOptions }
								placeholder="-- Ø§Ø®ØªØ± Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ --"
							/>
						</div>

						<!-- Priority CustomSelect -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ø§Ù„Ø£ÙˆÙ„ÙˆÙŠØ©:</span>
							<${CustomSelect}
								value=${ priority }
								onChange=${ setPriority }
								options=${ priorityOptions }
							/>
						</div>

						<!-- Estimated Hours Input -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ø§Ù„Ø³Ø§Ø¹Ø§Øª Ø§Ù„Ù…Ù‚Ø¯Ø±Ø©:</span>
							<input 
								type="number"
								step="0.5"
								min="0"
								className="input is-small"
								placeholder="0"
								value=${ estimatedHours }
								onChange=${ ( e ) => setEstimatedHours( e.target.value ) }
								style=${{ width: '80px', borderRadius: 0, border: '1px solid #e2e8f0', height: '32px', textAlign: 'center', fontWeight: '700' }}
							/>
						</div>
					</div>
				</div>

				<!-- Description Editor (Scrollable) -->
				<div>
					<${WpEditor}
						id="task-content-editor"
						value=${ content }
						onChange=${ setContent }
						placeholder="Ø§ÙƒØªØ¨ ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù‡Ù…Ø© Ù‡Ù†Ø§..."
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
