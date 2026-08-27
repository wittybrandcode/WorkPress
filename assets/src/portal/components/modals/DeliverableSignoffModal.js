/**
 * WorkPress Client Portal: Deliverable Digital Signoff Modal
 * 
 * Cryptographic sign-off and formal deliverable acceptance.
 * 
 * @package WorkPress
 * @subpackage Portal/Components/Modals
 */

import { html, useState } from '../../utils/html.js';

export default function DeliverableSignoffModal({
    isOpen,
    onClose,
    deliverable,
    currentUser,
    onSubmitSignoff,
    submitting
}) {
    if (!isOpen || !deliverable) return null;

    const [signerName, setSignerName] = useState(currentUser?.display_name || '');
    const [notes, setNotes] = useState('');
    const [agreementChecked, setAgreementChecked] = useState(false);

    const handleSignSubmit = (e) => {
        e.preventDefault();
        if (agreementChecked && signerName) {
            onSubmitSignoff({
                deliverableId: deliverable.id,
                signerName,
                notes,
                timestamp: new Date().toISOString()
            });
        }
    };

    return html`
        <div class="portal-modal-overlay" onClick=${onClose}>
            <div class="portal-modal-canvas" style=${{ maxWidth: '640px' }} onClick=${e => e.stopPropagation()}>
                
                <div class="portal-modal-header">
                    <div>
                        <span class="portal-badge portal-badge-success mb-1">
                            <i class="dashicons dashicons-shield"></i>
                            <span>التوقيع والاستلام الرقمي الرسمي</span>
                        </span>
                        <h2 style=${{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--wp-text-main)' }}>
                            اعتماد واستلام: ${deliverable.title || deliverable.task_title}
                        </h2>
                    </div>
                    <button type="button" class="btn-portal btn-portal-outline btn-portal-sm" onClick=${onClose}>
                        <i class="dashicons dashicons-no-alt"></i>
                    </button>
                </div>

                <div class="portal-modal-body">
                    <div style=${{ background: 'var(--wp-bg-subtle)', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        أقر أنا الموقع أدناه باستلام ومعاينة المخرج الفني ومطابقته لكافة المعايير والشروط المتفق عليها في المشروع.
                    </div>

                    <form onSubmit=${handleSignSubmit}>
                        <div class="portal-form-group">
                            <label class="portal-label">الاسم الكامل للمفوّض بالاستلام والتوقيع:</label>
                            <input 
                                type="text" 
                                class="portal-input" 
                                value=${signerName} 
                                onInput=${e => setSignerName(e.target.value)} 
                                required 
                            />
                        </div>

                        <div class="portal-form-group">
                            <label class="portal-label">ملاحظات أو تعليق الاعتماد (اختياري):</label>
                            <textarea 
                                class="portal-textarea" 
                                rows="3" 
                                value=${notes} 
                                onInput=${e => setNotes(e.target.value)} 
                                placeholder="أي ملاحظات ختامية حول جودة المخرج واستلامه..."
                            ></textarea>
                        </div>

                        <div style=${{ margin: '1.25rem 0', padding: '0.75rem', background: '#f8fafc', border: '1px solid var(--wp-border)' }}>
                            <label style=${{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--wp-text-main)' }}>
                                <input 
                                    type="checkbox" 
                                    checked=${agreementChecked} 
                                    onChange=${e => setAgreementChecked(e.target.checked)} 
                                    required 
                                />
                                <span>أوافق على الاعتماد النهائي وأؤكد اكتمال واستلام المخرج رسمياً.</span>
                            </label>
                        </div>

                        <div style=${{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--wp-border)', paddingTop: '1rem' }}>
                            <button type="button" class="btn-portal btn-portal-outline" onClick=${onClose}>
                                إلغاء
                            </button>
                            <button 
                                type="submit" 
                                class="btn-portal btn-portal-primary" 
                                disabled=${submitting || !agreementChecked || !signerName}
                            >
                                <i class="dashicons dashicons-yes-alt"></i>
                                <span>${submitting ? 'جاري توثيق التوقيع...' : 'تثبيت التوقيع الرقمي والاعتماد'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}
