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
			{ value: 'implementation', label: 'تنفيذ فني' },
			{ value: 'solution', label: 'حل مقترح' },
			{ value: 'review', label: 'مراجعة وتدقيق' },
			{ value: 'comment', label: 'تعليق وملاحظة' }
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
				toast( 'تمت إضافة المساهمة بنجاح', 'success' );
				onSave();
				onClose();
			} )
			.catch( err => {
				console.error( 'Error creating contribution:', err );
				toast( 'حدث خطأ أثناء إضافة المساهمة', 'danger' );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const taskOptions = [
		{ value: '', label: '-- اختر المهمة المستهدفة --' },
		...tasks.map( t => ( { value: t.id, label: t.title } ) )
	];

	const scopeOptions = [
		{ value: 'client_review', label: 'متاح للعميل ' },
		{ value: 'internal', label: 'داخلي للفريق ' }
	];

	const footer = html`
		<div className="is-flex is-justify-content-space-between is-align-items-center" style=${{ width: '100%' }}>
			<div>
				${ (!taskId || !content.trim()) && html`<span className="has-text-grey is-size-7">يرجى اختيار المهمة وكتابة محتوى المساهمة</span>` }
			</div>
			<div className="buttons mb-0" style=${{ gap: '8px' }}>
				<button className="button is-light wp-sharp-button" onClick=${ onClose } disabled=${ isSaving }>
					إلغاء
				</button>
				<button 
					className=${ `button is-primary wp-sharp-button ${isSaving ? 'is-loading' : ''}` } 
					onClick=${ handleSubmit }
					disabled=${ !taskId || !content.trim() || isSaving }
				>
					<span className="icon"><i className="dashicons dashicons-saved"></i></span>
					<span>إضافة المساهمة</span>
				</button>
			</div>
		</div>
	`;

	return html`
		<${Modal} 
			isActive=${ isActive } 
			onClose=${ onClose } 
			title="إضافة مساهمة جديدة" 
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
								<span className="wp-metadata-label">المهمة:</span>
								<${CustomSelect}
									value=${ taskId }
									onChange=${ setTaskId }
									options=${ taskOptions }
									placeholder="-- اختر المهمة --"
								/>
							</div>

							<!-- Contribution Type Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">النوع:</span>
								<${CustomSelect}
									value=${ type }
									onChange=${ setType }
									options=${ typeOptions }
								/>
							</div>

							<!-- Visibility Scope Select -->
							<div className="wp-metadata-item">
								<span className="wp-metadata-label">النطاق:</span>
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
						placeholder="اكتب تفاصيل المساهمة أو الكود أو الحل الفني هنا..."
					/>
				</div>
			</div>
		</${Modal}>
	`;
}
