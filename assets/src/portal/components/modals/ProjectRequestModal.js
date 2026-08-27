/**
 * WorkPress Client Portal: Project & Service Request Studio Modal
 * 
 * @package WorkPress
 * @subpackage Portal/Components/Modals
 */

import { html, useState } from '../../utils/html.js';

export default function ProjectRequestModal({
    isOpen,
    onClose,
    intakeForms = [],
    selectedFormId,
    onSelectForm,
    onSubmitRequest,
    submitting,
    successMessage,
    errorMessage
}) {
    if (!isOpen) return null;

    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [specs, setSpecs] = useState({});

    const activeForm = (intakeForms && intakeForms.find(f => f.id === selectedFormId)) || (intakeForms && intakeForms[0]) || {
        name: 'طلب مشروع جديد',
        title_label: 'عنوان الطلب / اسم المشروع:',
        title_placeholder: 'اكتب اسم أو عنوان طلبك...',
        desc_label: 'بيان وشرح تفاصيل الطلب:',
        desc_placeholder: 'وضح بالتفصيل ما تريده من فريق العمل...',
        specs: []
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmitRequest({
            title,
            description: desc,
            form_id: selectedFormId,
            specs
        });
    };

    const handleSpecChange = (key, value) => {
        setSpecs(prev => ({ ...prev, [key]: value }));
    };

    return html`
        <div class="portal-modal-overlay" onClick=${onClose}>
            <div class="portal-modal-canvas" style=${{ maxWidth: '780px' }} onClick=${e => e.stopPropagation()}>
                
                <!-- Modal Header -->
                <div class="portal-modal-header">
                    <div>
                        <span class="portal-badge portal-badge-success mb-1">
                            <i class="dashicons dashicons-plus-alt2"></i>
                            <span>استوديو تقديم الطلبات</span>
                        </span>
                        <h2 style=${{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--wp-text-main)' }}>
                            ${activeForm.name || 'طلب خدمة أو مشروع جديد'}
                        </h2>
                    </div>
                    <button type="button" class="btn-portal btn-portal-outline btn-portal-sm" onClick=${onClose}>
                        <i class="dashicons dashicons-no-alt"></i>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="portal-modal-body">
                    ${successMessage && html`
                        <div style=${{ background: 'var(--wp-primary-light)', border: '1px solid var(--wp-primary-border)', color: '#065f46', padding: '1rem', marginBottom: '1.25rem' }}>
                            <div style=${{ fontWeight: 800, marginBottom: '0.25rem' }}>تم استلام وتوثيق طلبكم بنجاح!</div>
                            <div style=${{ fontSize: '0.85rem' }}>${successMessage}</div>
                        </div>
                    `}

                    ${errorMessage && html`
                        <div style=${{ background: 'var(--wp-danger-light)', border: '1px solid var(--wp-danger-border)', color: 'var(--wp-danger-text)', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 700 }}>
                            ${errorMessage}
                        </div>
                    `}

                    <!-- Schema Switcher (If multiple intake forms exist) -->
                    ${intakeForms.length > 1 && html`
                        <div style=${{ marginBottom: '1.25rem' }}>
                            <label class="portal-label">اختر نوع النموذج أو الخدمة المطلوبة:</label>
                            <div style=${{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                ${intakeForms.map(f => html`
                                    <button 
                                        key=${f.id} 
                                        type="button" 
                                        class=${`btn-portal ${selectedFormId === f.id ? 'btn-portal-primary' : 'btn-portal-outline'} btn-portal-sm`}
                                        onClick=${() => onSelectForm(f.id)}
                                    >
                                        ${f.name}
                                    </button>
                                `)}
                            </div>
                        </div>
                    `}

                    <form onSubmit=${handleFormSubmit}>
                        <div class="portal-form-group">
                            <label class="portal-label">${activeForm.title_label || 'عنوان الطلب / اسم المشروع:'}</label>
                            <input 
                                type="text" 
                                class="portal-input" 
                                value=${title} 
                                onInput=${e => setTitle(e.target.value)} 
                                placeholder=${activeForm.title_placeholder || 'اكتب اسم أو عنوان طلبك...'} 
                                required 
                            />
                        </div>

                        <div class="portal-form-group">
                            <label class="portal-label">${activeForm.desc_label || 'بيان وشرح تفاصيل الطلب:'}</label>
                            <textarea 
                                class="portal-textarea" 
                                rows="4" 
                                value=${desc} 
                                onInput=${e => setDesc(e.target.value)} 
                                placeholder=${activeForm.desc_placeholder || 'وضح بالتفصيل ما تريده من فريق العمل...'} 
                                required
                            ></textarea>
                        </div>

                        <!-- Dynamic Specifications -->
                        ${Array.isArray(activeForm.specs) && activeForm.specs.length > 0 && html`
                            <div style=${{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--wp-border)' }}>
                                ${activeForm.specs.map((spec, idx) => {
                                    const specKey = spec.name || `spec_${idx}`;
                                    const currentVal = specs[specKey] || '';

                                    return html`
                                        <div key=${idx} class="portal-form-group">
                                            <label class="portal-label">${spec.label || spec.name}</label>
                                            <input 
                                                type="text" 
                                                class="portal-input" 
                                                value=${currentVal} 
                                                onInput=${e => handleSpecChange(specKey, e.target.value)} 
                                                placeholder=${spec.placeholder || ''} 
                                            />
                                        </div>
                                    `;
                                })}
                            </div>
                        `}

                        <div style=${{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--wp-border)', paddingTop: '1rem' }}>
                            <button type="button" class="btn-portal btn-portal-outline" onClick=${onClose}>
                                إلغاء
                            </button>
                            <button type="submit" class="btn-portal btn-portal-primary" disabled=${submitting || !title.trim()}>
                                <i class="dashicons dashicons-yes-alt"></i>
                                <span>${submitting ? 'جاري التوثيق...' : 'إرسال وتوثيق الطلب'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}
