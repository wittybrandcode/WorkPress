import { html, __, isRtl } from '../../utils/html.js';
import sound from '../../utils/sound.js';

/**
 * MultiFilePicker Component
 *
 * Supports selecting multiple files via WordPress Media Library or file chips display.
 * Fully compliant with React 18 DOM, 0px sharp aesthetics, and zero emojis.
 */
export default function MultiFilePicker( { 
	attachments = [], 
	onChange, 
	buttonText = null,
	readOnly = false 
} ) {
	const defaultButtonText = buttonText || __( 'Attach files / documents', 'workpress' );
	const rtl = isRtl();

	const handleOpenMedia = () => {
		if ( readOnly ) return;

		if ( typeof window.wp !== 'undefined' && window.wp.media ) {
			const frame = window.wp.media( {
				title: __( 'Select or upload attachment files', 'workpress' ),
				button: {
					text: __( 'Attach selected files', 'workpress' ),
				},
				multiple: true,
			} );

			frame.on( 'select', () => {
				const selection = frame.state().get( 'selection' );
				const newItems = [];

				selection.each( ( attachment ) => {
					const att = attachment.toJSON();
					newItems.push( {
						id: att.id,
						name: att.filename || att.title || __( 'Attachment', 'workpress' ),
						url: att.url,
						mime_type: att.mime || '',
						size: att.filesizeHumanReadable || '',
						is_image: att.type === 'image',
					} );
				} );

				// Merge unique by ID
				const existingIds = new Set( attachments.map( a => typeof a === 'object' ? a.id : a ) );
				const merged = [ ...attachments ];
				newItems.forEach( item => {
					if ( ! existingIds.has( item.id ) ) {
						merged.push( item );
					}
				} );

				if ( onChange ) {
					onChange( merged );
				}
				sound.play( 'click' );
			} );

			frame.open();
		} else {
			alert( __( 'WordPress Media Library is not available.', 'workpress' ) );
		}
	};

	const handleRemove = ( fileId ) => {
		if ( readOnly ) return;
		const filtered = attachments.filter( a => ( typeof a === 'object' ? a.id : a ) !== fileId );
		if ( onChange ) {
			onChange( filtered );
		}
		sound.play( 'trash' );
	};

	const getFileIcon = ( file ) => {
		const mime = file.mime_type || '';
		const name = ( file.name || file.url || '' ).toLowerCase();

		if ( file.is_image || mime.startsWith( 'image/' ) ) {
			return html`<i className="dashicons dashicons-format-image" style=${{ color: '#10b981', fontSize: '18px' }}></i>`;
		}
		if ( mime.includes( 'pdf' ) || name.endsWith( '.pdf' ) ) {
			return html`<i className="dashicons dashicons-pdf" style=${{ color: '#ef4444', fontSize: '18px' }}></i>`;
		}
		if ( mime.includes( 'zip' ) || mime.includes( 'archive' ) || name.endsWith( '.zip' ) || name.endsWith( '.rar' ) || name.endsWith( '.tar' ) || name.endsWith( '.gz' ) ) {
			return html`<i className="dashicons dashicons-media-archive" style=${{ color: '#8b5cf6', fontSize: '18px' }}></i>`;
		}
		if ( mime.includes( 'word' ) || mime.includes( 'document' ) || name.endsWith( '.doc' ) || name.endsWith( '.docx' ) ) {
			return html`<i className="dashicons dashicons-media-document" style=${{ color: '#3b82f6', fontSize: '18px' }}></i>`;
		}
		if ( mime.includes( 'excel' ) || mime.includes( 'spreadsheet' ) || name.endsWith( '.xls' ) || name.endsWith( '.xlsx' ) || name.endsWith( '.csv' ) ) {
			return html`<i className="dashicons dashicons-media-spreadsheet" style=${{ color: '#059669', fontSize: '18px' }}></i>`;
		}
		return html`<i className="dashicons dashicons-media-default" style=${{ color: '#64748b', fontSize: '18px' }}></i>`;
	};

	return html`
		<div className="workpress-multi-file-picker" style=${{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
			${ ! readOnly ? html`
				<div style=${{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: attachments.length > 0 ? '0.5rem' : 0 }}>
					<button 
						type="button" 
						className="button is-small is-light" 
						onClick=${ handleOpenMedia }
						style=${{ borderRadius: 0, border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '0.8rem', height: '30px' }}
					>
						<i className="dashicons dashicons-paperclip" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '0.25rem' }}></i>
						<span>${ defaultButtonText }</span>
					</button>
					${ attachments.length > 0 ? html`
						<span style=${{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>
							(${ attachments.length } ${ __( 'Attachments', 'workpress' ) })
						</span>
					` : null }
				</div>
			` : null }

			${ attachments.length > 0 ? html`
				<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem' }}>
					${ attachments.map( ( file ) => {
						const fileId = typeof file === 'object' ? file.id : file;
						const fileName = typeof file === 'object' ? ( file.name || __( 'Attachment', 'workpress' ) ) : `${ __( 'Attachment', 'workpress' ) } #${ fileId }`;
						const fileUrl = typeof file === 'object' ? file.url : '';
						const fileSize = typeof file === 'object' ? file.size : '';

						return html`
							<div 
								key=${ fileId }
								style=${{ 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'space-between', 
									padding: '0.4rem 0.6rem', 
									backgroundColor: '#ffffff', 
									border: '1px solid #cbd5e1', 
									borderRadius: 0,
									fontSize: '0.82rem'
								}}
							>
								<div style=${{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 0 }}>
									${ getFileIcon( file ) }
									<div style=${{ flex: 1, minWidth: 0 }}>
										<a 
											href=${ fileUrl || '#' } 
											target="_blank" 
											rel="noopener noreferrer"
											style=${{ 
												fontWeight: '700', 
												color: '#0f172a', 
												textDecoration: 'none', 
												whiteSpace: 'nowrap', 
												overflow: 'hidden', 
												textOverflow: 'ellipsis', 
												display: 'block' 
											}}
											title=${ __( 'Open or download file', 'workpress' ) }
										>
											${ fileName }
										</a>
										${ fileSize ? html`
											<div style=${{ fontSize: '0.7rem', color: '#64748b' }}>${ fileSize }</div>
										` : null }
									</div>
								</div>

								${ ! readOnly ? html`
									<button 
										type="button" 
										className="button is-small is-ghost" 
										onClick=${ () => handleRemove( fileId ) }
										style=${{ height: '22px', padding: '0 2px', color: '#94a3b8', border: 'none' }}
										title=${ __( 'Remove this attachment', 'workpress' ) }
									>
										<i className="dashicons dashicons-no-alt" style=${{ fontSize: '15px' }}></i>
									</button>
								` : null }
							</div>
						`;
					} ) }
				</div>
			` : null }
		</div>
	`;
}
