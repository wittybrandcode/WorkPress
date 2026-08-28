import { html, useState, useEffect } from '../../utils/html.js';
import { projectsApi } from '../../api/client.js';
import Modal from '../modals/Modal.js';
import WpEditor from '../ui/WpEditor.js';
import ImagePicker from '../ui/ImagePicker.js';
import CustomSelect from '../ui/CustomSelect.js';
import { toast } from '../../utils/toast.js';

export default function ProjectModal( { isActive, onClose, onSave, project = null } ) {
	const [ name, setName ] = useState( '' );
	const [ description, setDescription ] = useState( '' );
	const [ prefix, setPrefix ] = useState( '' );
	const [ status, setStatus ] = useState( 'active' );
	const [ startAt, setStartAt ] = useState( '' );
	const [ dueAt, setDueAt ] = useState( '' );
	const [ featuredImage, setFeaturedImage ] = useState( null );
	const [ featuredImageUrl, setFeaturedImageUrl ] = useState( '' );
	
	const [ isSaving, setIsSaving ] = useState( false );

	const statusOptions = [
		{ value: 'active', label: 'Ù†Ø´Ø· (Active)' },
		{ value: 'on-hold', label: 'Ù‚ÙŠØ¯ Ø§Ù„Ø§Ù†ØªØ¸Ø§Ø± (On Hold)' },
		{ value: 'completed', label: 'Ù…ÙƒØªÙ…Ù„ (Completed)' },
		{ value: 'cancelled', label: 'Ù…Ù„ØºÙ‰ (Cancelled)' }
	];

	useEffect( () => {
		if ( project && isActive ) {
			setName( project.name || '' );
			setDescription( project.description || '' );
			setPrefix( project.prefix || '' );
			setStatus( project.status || 'active' );
			setStartAt( project.start_at ? project.start_at.split( ' ' )[0] : '' );
			setDueAt( project.due_at ? project.due_at.split( ' ' )[0] : '' );
			setFeaturedImage( project.cover_id || null );
			setFeaturedImageUrl( project.cover_url || '' );
		} else if ( isActive ) {
			setName( '' );
			setDescription( '' );
			setPrefix( '' );
			setStatus( 'active' );
			setStartAt( '' );
			setDueAt( '' );
			setFeaturedImage( null );
			setFeaturedImageUrl( '' );
		}
	}, [ project, isActive ] );

	const handleSubmit = () => {
		setIsSaving( true );
		
		const data = {
			name: name,
			description: description,
			prefix: prefix,
			status: status,
			start_at: startAt,
			due_at: dueAt,
			cover_id: featuredImage
		};

		const request = project && project.id
			? projectsApi.update( project.id, data )
			: projectsApi.create( data );
			
		request.then( () => {
			toast( project && project.id ? 'ØªÙ… ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ù†Ø¬Ø§Ø­' : 'ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ø¨Ù†Ø¬Ø§Ø­', 'success' );
			onSave();
			onClose();
		} ).catch( err => {
			console.error( 'Error saving project:', err );
			toast( 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø­ÙØ¸ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹', 'danger' );
		} ).finally( () => setIsSaving( false ) );
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div>
				${ !name.trim() && html`<span className="has-text-grey is-size-7">Ø§Ø³Ù… Ø§Ù„Ù…Ø´Ø±ÙˆØ¹ Ù…Ø·Ù„ÙˆØ¨ Ù„Ù„Ù…ØªØ§Ø¨Ø¹Ø©</span>` }
			</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					Ø¥Ù„ØºØ§Ø¡
				</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}` } 
					onClick=${ handleSubmit }
					disabled=${ !name.trim() || isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ project ? 'Ø­ÙØ¸ Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª' : 'Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹' }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ project ? 'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹' : 'Ù…Ø³ØªÙ†Ø¯ Ù…Ø´Ø±ÙˆØ¹ Ø¬Ø¯ÙŠØ¯' }
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
							placeholder="Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ù…Ø´Ø±ÙˆØ¹..."
							value=${ name }
							onChange=${ (e) => setName( e.target.value ) }
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

					<!-- Row 2: Metadata Toolbar (Equal distribution across 100% width) -->
					<div className="wp-metadata-toolbar">
						<!-- Prefix Field -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ø§Ù„Ø¨Ø§Ø¯Ø¦Ø©:</span>
							<input 
								className="input" 
								type="text" 
								placeholder="CRM"
								value=${ prefix }
								onChange=${ (e) => setPrefix( e.target.value.toUpperCase() ) }
								maxLength="5"
								style=${{ 
									textTransform: 'uppercase', 
									borderRadius: 0, 
									border: '1px solid #e2e8f0', 
									textAlign: 'center'
								}}
							/>
						</div>

						<!-- Custom Status Dropdown -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ø§Ù„Ø­Ø§Ù„Ø©:</span>
							<${CustomSelect}
								value=${ status }
								onChange=${ setStatus }
								options=${ statusOptions }
							/>
						</div>

						<!-- Start Date -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø¯Ø¡:</span>
							<input 
								className="input" 
								type="date" 
								value=${ startAt }
								onChange=${ (e) => setStartAt( e.target.value ) }
								style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}
							/>
						</div>

						<!-- Due Date -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">Ù…ÙˆØ¹Ø¯ Ø§Ù„ØªØ³Ù„ÙŠÙ…:</span>
							<input 
								className="input" 
								type="date" 
								value=${ dueAt }
								onChange=${ (e) => setDueAt( e.target.value ) }
								style=${{ borderRadius: 0, border: '1px solid #e2e8f0' }}
							/>
						</div>
					</div>
				</div>

				<!-- Description Editor (Scrollable) -->
				<div>
					<${WpEditor}
						id="project-description-editor"
						value=${ description }
						onChange=${ setDescription }
						placeholder="Ø§Ø¨Ø¯Ø£ Ø¨ÙƒØªØ§Ø¨Ø© ØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹..."
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
