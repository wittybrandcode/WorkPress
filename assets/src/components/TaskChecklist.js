import { html, useState } from '../utils/html.js';
import { tasksApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';

/**
 * TaskChecklist Component
 *
 * Interactive, zero-build checklist & subtasks manager with live progress calculation.
 * Adheres to 0px sharp aesthetics, full React DOM style object compliance, and zero emojis.
 */
export default function TaskChecklist( { taskId, checklists = [], onUpdate } ) {
	const [ newTitle, setNewTitle ] = useState( '' );
	const [ isAdding, setIsAdding ] = useState( false );
	const [ editingItemId, setEditingItemId ] = useState( null );
	const [ editingTitle, setEditingTitle ] = useState( '' );

	const totalItems = checklists.length;
	const completedItems = checklists.filter( item => item.is_completed ).length;
	const progressPct = totalItems > 0 ? Math.round( ( completedItems / totalItems ) * 100 ) : 0;

	const handleAdd = async ( e ) => {
		if ( e ) e.preventDefault();
		const title = newTitle.trim();
		if ( ! title || isAdding ) return;

		setIsAdding( true );
		try {
			const res = await tasksApi.checklists.add( taskId, title );
			setNewTitle( '' );
			if ( res && res.checklists ) {
				onUpdate( res.checklists, res.task );
			}
			sound.play( 'click' );
		} catch ( err ) {
			toast( err.message || 'تعذر إضافة عنصر قائمة الفحص', 'error' );
		} finally {
			setIsAdding( false );
		}
	};

	const handleToggle = async ( itemId ) => {
		try {
			// Optimistic local update
			const optimistic = checklists.map( item => {
				if ( item.id === itemId ) {
					return { ...item, is_completed: ! item.is_completed };
				}
				return item;
			} );
			onUpdate( optimistic );

			const res = await tasksApi.checklists.toggle( taskId, itemId );
			if ( res && res.checklists ) {
				onUpdate( res.checklists, res.task );
			}
			sound.play( 'toggle' );
		} catch ( err ) {
			toast( err.message || 'تعذر تغيير حالة العنصر', 'error' );
		}
	};

	const handleDelete = async ( itemId ) => {
		try {
			const optimistic = checklists.filter( item => item.id !== itemId );
			onUpdate( optimistic );

			const res = await tasksApi.checklists.delete( taskId, itemId );
			if ( res && res.checklists ) {
				onUpdate( res.checklists, res.task );
			}
			sound.play( 'trash' );
		} catch ( err ) {
			toast( err.message || 'تعذر حذف العنصر', 'error' );
		}
	};

	const handleSaveEdit = async ( itemId ) => {
		const title = editingTitle.trim();
		if ( ! title ) {
			setEditingItemId( null );
			return;
		}

		try {
			const res = await tasksApi.checklists.update( taskId, itemId, title );
			setEditingItemId( null );
			if ( res && res.checklists ) {
				onUpdate( res.checklists, res.task );
			}
			sound.play( 'click' );
		} catch ( err ) {
			toast( err.message || 'تعذر تحديث العنصر', 'error' );
		}
	};

	return html`
		<div className="workpress-checklist-card box" style=${{ border: '1px solid #e2e8f0', borderRadius: 0, padding: '1.25rem', backgroundColor: '#ffffff', marginBottom: '1.5rem' }}>
			<!-- Header -->
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
				<h4 className="title is-6" style=${{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '700' }}>
					<i className="dashicons dashicons-editor-ul" style=${{ color: '#3b82f6' }}></i>
					<span>قائمة الفحص والخطوات الإجرائية</span>
					${ totalItems > 0 ? html`
						<span style=${{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b', marginRight: '0.25rem' }}>
							(${ completedItems }/${ totalItems })
						</span>
					` : '' }
				</h4>
				${ totalItems > 0 ? html`
					<span style=${{ fontSize: '0.85rem', fontWeight: '700', color: progressPct === 100 ? '#10b981' : '#3b82f6' }}>
						${ progressPct }%
					</span>
				` : '' }
			</div>

			<!-- Progress Bar -->
			${ totalItems > 0 ? html`
				<div style=${{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: 0, marginBottom: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
					<div 
						style=${{ height: '100%', width: `${ progressPct }%`, backgroundColor: progressPct === 100 ? '#10b981' : '#3b82f6', transition: 'width 0.3s ease' }}
					></div>
				</div>
			` : '' }

			<!-- Items List -->
			<div className="checklist-items-list" style=${{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
				${ checklists.map( ( item ) => {
					const isEditing = editingItemId === item.id;
					return html`
						<div 
							key=${ item.id }
							className="checklist-item-row"
							style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: item.is_completed ? '#f8fafc' : '#ffffff', border: '1px solid #e2e8f0', borderRadius: 0, transition: 'background 0.15s ease' }}
						>
							<div style=${{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
								<input 
									type="checkbox"
									checked=${ item.is_completed }
									onChange=${ () => handleToggle( item.id ) }
									style=${{ width: '18px', height: '18px', borderRadius: 0, cursor: 'pointer', accentColor: '#10b981' }}
								/>
								
								${ isEditing ? html`
									<input 
										type="text"
										className="input is-small"
										value=${ editingTitle }
										onInput=${ ( e ) => setEditingTitle( e.target.value ) }
										onKeyDown=${ ( e ) => {
											if ( e.key === 'Enter' ) handleSaveEdit( item.id );
											if ( e.key === 'Escape' ) setEditingItemId( null );
										} }
										style=${{ borderRadius: 0, flex: 1 }}
										autoFocus
									/>
								` : html`
									<span 
										style=${{ fontSize: '0.9rem', color: item.is_completed ? '#94a3b8' : '#1e293b', textDecoration: item.is_completed ? 'line-through' : 'none', wordBreak: 'break-word', flex: 1, cursor: 'pointer' }}
										onClick=${ () => {
											setEditingItemId( item.id );
											setEditingTitle( item.title );
										} }
										title="انقر لتعديل نص العنصر"
									>
										${ item.title }
									</span>
								` }
							</div>

							<div style=${{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.5rem' }}>
								${ isEditing ? html`
									<button 
										type="button"
										className="button is-small is-primary is-light"
										style=${{ borderRadius: 0, padding: '0 0.5rem', height: '24px' }}
										onClick=${ () => handleSaveEdit( item.id ) }
										title="حفظ التعديل"
									>
										<i className="dashicons dashicons-yes"></i>
									</button>
									<button 
										type="button"
										className="button is-small is-light"
										style=${{ borderRadius: 0, padding: '0 0.5rem', height: '24px' }}
										onClick=${ () => setEditingItemId( null ) }
										title="إلغاء"
									>
										<i className="dashicons dashicons-no-alt"></i>
									</button>
								` : html`
									<button 
										type="button"
										className="button is-small is-ghost"
										style=${{ padding: '0 0.25rem', height: '24px', color: '#94a3b8', border: 'none' }}
										onClick=${ () => handleDelete( item.id ) }
										title="حذف هذا العنصر"
									>
										<i className="dashicons dashicons-trash" style=${{ fontSize: '16px' }}></i>
									</button>
								` }
							</div>
						</div>
					`;
				} ) }
			</div>

			<!-- Add New Item Form -->
			<form onSubmit=${ handleAdd } style=${{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
				<input 
					type="text"
					className="input is-small"
					placeholder="أضف خطوة فحص إجرائية جديدة... (اضغط Enter للإضافة)"
					value=${ newTitle }
					onInput=${ ( e ) => setNewTitle( e.target.value ) }
					disabled=${ isAdding }
					style=${{ borderRadius: 0, border: '1px solid #cbd5e1', flex: 1 }}
				/>
				<button 
					type="submit"
					className="button is-small is-primary"
					disabled=${ ! newTitle.trim() || isAdding }
					style=${{ borderRadius: 0, fontWeight: '600', whiteSpace: 'nowrap' }}
				>
					<i className="dashicons dashicons-plus" style=${{ marginLeft: '0.25rem' }}></i>
					<span>إضافة</span>
				</button>
			</form>
		</div>
	`;
}
