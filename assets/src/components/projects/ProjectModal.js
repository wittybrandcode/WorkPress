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
		{ value: 'active', label: 'نشط (Active)' },
		{ value: 'on-hold', label: 'قيد الانتظار (On Hold)' },
		{ value: 'completed', label: 'مكتمل (Completed)' },
		{ value: 'cancelled', label: 'ملغى (Cancelled)' }
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
			toast( project && project.id ? 'تم تحديث المشروع بنجاح' : 'تم إنشاء المشروع بنجاح', 'success' );
			onSave();
			onClose();
		} ).catch( err => {
			console.error( 'Error saving project:', err );
			toast( 'حدث خطأ أثناء حفظ المشروع', 'danger' );
		} ).finally( () => setIsSaving( false ) );
	};

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div>
				${ !name.trim() && html`<span className="has-text-grey is-size-7">اسم المشروع مطلوب للمتابعة</span>` }
			</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					إلغاء
				</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}` } 
					onClick=${ handleSubmit }
					disabled=${ !name.trim() || isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>${ project ? 'حفظ التعديلات' : 'إنشاء المشروع' }</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title=${ project ? 'تعديل المشروع' : 'مستند مشروع جديد' }
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
							placeholder="عنوان المشروع..."
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
							<span className="wp-metadata-label">البادئة:</span>
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
							<span className="wp-metadata-label">الحالة:</span>
							<${CustomSelect}
								value=${ status }
								onChange=${ setStatus }
								options=${ statusOptions }
							/>
						</div>

						<!-- Start Date -->
						<div className="wp-metadata-item">
							<span className="wp-metadata-label">تاريخ البدء:</span>
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
							<span className="wp-metadata-label">موعد التسليم:</span>
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
						placeholder="ابدأ بكتابة تفاصيل المشروع..."
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
