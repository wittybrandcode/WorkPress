import { html, useState } from '../../utils/html.js';
import { tasksApi } from '../../api/client.js';
import { toast } from '../../utils/toast.js';
import sound from '../../utils/sound.js';
import MultiFilePicker from '../ui/MultiFilePicker.js';

/**
 * TaskDocuments Component
 *
 * Manages task-level documents, files, and multi-attachments.
 * Adheres to 0px sharp geometry, full React 18 style compliance, and zero emojis.
 */
export default function TaskDocuments( { taskId, attachments = [], onUpdate } ) {
	const [ isUploading, setIsUploading ] = useState( false );

	const handleAttachmentsChange = async ( newAttachmentsList ) => {
		// Detect newly added items vs removed items
		const existingIds = new Set( attachments.map( a => typeof a === 'object' ? a.id : a ) );
		const newIds = new Set( newAttachmentsList.map( a => typeof a === 'object' ? a.id : a ) );

		// Check added
		for ( const item of newAttachmentsList ) {
			const itemId = typeof item === 'object' ? item.id : item;
			if ( ! existingIds.has( itemId ) ) {
				try {
					setIsUploading( true );
					const res = await tasksApi.attachments.add( taskId, itemId );
					if ( res && res.task && onUpdate ) {
						onUpdate( res.task );
					}
					toast( 'تم إرفاق المستند بنجاح', 'success' );
				} catch ( err ) {
					toast( err.message || 'تعذر إرفاق الملف', 'error' );
				} finally {
					setIsUploading( false );
				}
			}
		}

		// Check removed
		for ( const item of attachments ) {
			const itemId = typeof item === 'object' ? item.id : item;
			if ( ! newIds.has( itemId ) ) {
				try {
					const res = await tasksApi.attachments.delete( taskId, itemId );
					if ( res && res.task && onUpdate ) {
						onUpdate( res.task );
					}
					toast( 'تم حذف المرفق من المهمة', 'info' );
				} catch ( err ) {
					toast( err.message || 'تعذر حذف المرفق', 'error' );
				}
			}
		}
	};

	return html`
		<div className="workpress-task-documents box" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, padding: '1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem' }}>
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
				<h4 className="title is-6" style=${{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '700' }}>
					<i className="dashicons dashicons-media-document" style=${{ color: '#3b82f6' }}></i>
					<span>المستندات والمرفقات الرسمية للمهمة</span>
					${ attachments.length > 0 ? html`
						<span style=${{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginRight: '0.25rem' }}>
							(${ attachments.length })
						</span>
					` : null }
				</h4>
			</div>

			<${MultiFilePicker} 
				attachments=${ attachments } 
				onChange=${ handleAttachmentsChange } 
				buttonText="إرفاق وثائق / ملفات للمهمة (PDF, ZIP, DOCX, صور)"
			/>
		</div>
	`;
}
