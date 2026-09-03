import { html, useState, useEffect, __, isRtl } from '../../utils/html.js';
import Modal from '../modals/Modal.js';
import { tasksApi, projectsApi } from '../../api/client.js';
import WpEditor from '../ui/WpEditor.js';
import ImagePicker from '../ui/ImagePicker.js';
import CustomSelect from '../ui/CustomSelect.js';
import { toast } from '../../utils/toast.js';

export default function TaskModal( { isActive, onClose, onSave, onSaved, task = null, defaultProjectId = null, projectId: passedProjectId = null } ) {
	const [ title, setTitle ] = useState( '' );
	const [ content, setContent ] = useState( '' );
	const [ projectId, setProjectId ] = useState( defaultProjectId || passedProjectId || '' );
	const [ priority, setPriority ] = useState( 'medium' );
	const [ estimatedHours, setEstimatedHours ] = useState( '' );
	const [ featuredImage, setFeaturedImage ] = useState( null );
	const [ featuredImageUrl, setFeaturedImageUrl ] = useState( '' );
	const rtl = isRtl();
	
	const [ projects, setProjects ] = useState( [] );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );

	const priorityOptions = [
		{ value: 'low', label: __( 'Low', 'workpress' ) },
		{ value: 'medium', label: __( 'Medium', 'workpress' ) },
		{ value: 'high', label: __( 'High', 'workpress' ) }
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
			setProjectId( defaultProjectId || passedProjectId || '' );
			setPriority( 'medium' );
			setEstimatedHours( '' );
			setFeaturedImage( null );
			setFeaturedImageUrl( '' );
		}
		setError( '' );
	}, [ task, isActive, defaultProjectId, passedProjectId ] );

	const handleSubmit = () => {
		setError( '' );
		if ( !title || title.trim() === '' ) {
			setError( __( 'Task title is required', 'workpress' ) );
			return;
		}
		if ( !projectId ) {
			setError( __( 'Project is required', 'workpress' ) );
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
			toast( task && task.id ? __( 'Task updated successfully', 'workpress' ) : __( 'Task created successfully', 'workpress' ), 'success' );
			const saveCallback = onSave || onSaved;
			if ( typeof saveCallback === 'function' ) {
				saveCallback();
			}
			if ( typeof onClose === 'function' ) {
				onClose();
			}
		} ).catch( err => {
			console.error( 'Error saving task:', err );
			toast( __( 'An error occurred while saving task', 'workpress' ), 'danger' );
		} ).finally( () => setIsSaving( false ) );
	};

	const projectOptions = [
		{ value: '', label: `-- ${ __( 'Select Project', 'workpress' ) } --` },
		...projects.map( p => ( { value: p.id, label: p.name } ) )
	];

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div className="has-text-danger is-size-7">${ error }</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>${ __( 'Cancel', 'workpress' ) }</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${ isSaving ? 'is-loading' : '' }` }
					onClick=${ handleSubmit }
					disabled=${ isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ task ? __( 'Save Changes', 'workpress' ) : __( 'Create Task', 'workpress' ) }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ task ? __( 'Edit Task', 'workpress' ) : __( 'Add Work Item', 'workpress' ) }
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
							placeholder=${ __( 'Task Title...', 'workpress' ) }
							value=${ title }
							onChange=${ (e) => setTitle( e.target.value ) }
							style=${{ 
								direction: rtl ? 'rtl' : 'ltr', 
								textAlign: rtl ? 'right' : 'left', 
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
							<span className="wp-metadata-label">${ __( 'Project:', 'workpress' ) }</span>
							<${CustomSelect}
								value=${ projectId }
								onChange=${ setProjectId }
								options=${ projectOptions }
								placeholder=${ `-- ${ __( 'Select Project', 'workpress' ) } --` }
							/>
						</div>

						<!-- Priority CustomSelect -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">${ __( 'Priority:', 'workpress' ) }</span>
							<${CustomSelect}
								value=${ priority }
								onChange=${ setPriority }
								options=${ priorityOptions }
							/>
						</div>

						<!-- Estimated Hours Input -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">${ __( 'Estimated Hours:', 'workpress' ) }</span>
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
						placeholder=${ __( 'Write task details here...', 'workpress' ) }
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
