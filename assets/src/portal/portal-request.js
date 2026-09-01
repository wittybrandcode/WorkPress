/**
 * WorkPress Client Portal: Request Studio View
 * 
 * Provides interactive client intake form, dynamic specifications builder, and file uploads.
 * 
 * @package WorkPress
 * @subpackage Portal
 * @version 2.3.0
 */

window.WorkPressPortal = window.WorkPressPortal || {};

(function(exports) {
    'use strict';

    exports.renderRequestStudio = function(ctx) {
        if (!window.preact || !window.htm) return null;
        const { h } = window.preact;
        const html = window.htm.bind(h);
        const __ = window.__ || ((s) => s);
        const isRtl = window.WorkPressPortalI18n ? window.WorkPressPortalI18n.isRTL() : (document.dir === 'rtl');

        const {
            projects = [], activeForm, intakeForms = [], selectedFormId,
            reqCustomTitle, reqDesc, reqSpecs, uploadingSpecs,
            reqSubmitting, reqSuccess, reqError,
            onNavigateToTab, onFormTypeChange, onTitleChange, onDescChange,
            onSpecChange, onToggleSpecPill, onFileUpload, onRemoveUploadedFile,
            onSubmit, onResetSuccess
        } = ctx;

        const formTitle = (activeForm && activeForm.name) || __('Submit New Request', 'workpress');

        return html`
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                    <button 
                        type="button" 
                        class="btn-portal btn-portal-ghost btn-portal-sm"
                        onClick=${() => onNavigateToTab('deliverables')}
                    >
                        <i class="dashicons ${isRtl ? 'dashicons-arrow-right-alt' : 'dashicons-arrow-left-alt'}"></i>
                        <span>${projects.length > 0 ? __('Active Projects', 'workpress') : __('Main Overview', 'workpress')}</span>
                    </button>

                    <span style="font-size: 0.82rem; color: var(--wp-text-muted);">
                        ${__('WorkPress Certified Request Gateway', 'workpress')}
                    </span>
                </div>

                <div class="wp-portal-card" style="padding: 2rem;">
                    <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--wp-border); padding-bottom: 1.25rem;">
                        <div style="display: inline-flex; align-items: center; gap: 5px; padding: 0.25rem 0.75rem; background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; font-size: 0.8rem; font-weight: 800; margin-bottom: 0.6rem;">
                            <i class="dashicons dashicons-plus-alt2"></i>
                            <span>${__('Submit Project Request', 'workpress')}</span>
                        </div>
                        <h2 style="font-size: 1.35rem; font-weight: 900; color: var(--wp-text-main); margin-bottom: 0.35rem;">
                            ${formTitle}
                        </h2>
                        <p style="font-size: 0.88rem; color: var(--wp-text-secondary);">
                            ${__('Our technical leads will review your request and get back to you shortly.', 'workpress')}
                        </p>
                    </div>

                    ${reqSuccess && html`
                        <div style="background: var(--wp-primary-light); border: 1px solid var(--wp-primary-border); color: #065f46; padding: 1.25rem; margin-bottom: 1.5rem;">
                            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1rem; margin-bottom: 0.35rem;">
                                <i class="dashicons dashicons-yes-alt" style="font-size: 22px;"></i>
                                <span>${__('Request Submitted Successfully!', 'workpress')}</span>
                            </div>
                            <p style="font-size: 0.88rem; margin-bottom: 1rem;">
                                ${reqSuccess}
                            </p>
                            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                ${projects.length > 0 ? html`
                                    <button 
                                        type="button" 
                                        class="btn-portal btn-portal-primary btn-portal-sm"
                                        onClick=${() => {
                                            if (onResetSuccess) onResetSuccess();
                                            onNavigateToTab('deliverables');
                                        }}
                                    >
                                        <span>${__('Active Projects', 'workpress')}</span>
                                    </button>
                                ` : null}
                                <button 
                                    type="button" 
                                    class="btn-portal btn-portal-outline btn-portal-sm"
                                    onClick=${onResetSuccess}
                                >
                                    <span>${__('Submit New Request', 'workpress')}</span>
                                </button>
                            </div>
                        </div>
                    `}

                    ${reqError && html`
                        <div style="background: var(--wp-danger-light); border: 1px solid var(--wp-danger-border); color: var(--wp-danger-text); padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.88rem; font-weight: 700;">
                            ${reqError}
                        </div>
                    `}

                    <!-- Form Schema Switcher (If multiple intake forms exist) -->
                    ${intakeForms.length > 1 && html`
                        <div style="margin-bottom: 1.5rem;">
                            <label class="portal-label">${__('Filter', 'workpress')}:</label>
                            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                                ${intakeForms.map(f => html`
                                    <button 
                                        key=${f.id} 
                                        type="button" 
                                        class="btn-portal ${selectedFormId === f.id ? 'btn-portal-primary' : 'btn-portal-outline'} btn-portal-sm"
                                        onClick=${() => onFormTypeChange(f.id)}
                                    >
                                        ${f.name}
                                    </button>
                                `)}
                            </div>
                        </div>
                    `}

                    <form onSubmit=${onSubmit}>
                        <div class="portal-form-group">
                            <label class="portal-label">${(activeForm && activeForm.title_label) || __('Project Title', 'workpress')}</label>
                            <input 
                                type="text" 
                                class="portal-input" 
                                value=${reqCustomTitle} 
                                onInput=${e => onTitleChange(e.target.value)} 
                                placeholder="${(activeForm && activeForm.title_placeholder) || __('Project Title', 'workpress')}" 
                                required 
                            />
                        </div>

                        <div class="portal-form-group">
                            <label class="portal-label">${(activeForm && activeForm.desc_label) || __('Detailed Specifications', 'workpress')}</label>
                            <textarea 
                                class="portal-textarea" 
                                rows="5" 
                                value=${reqDesc} 
                                onInput=${e => onDescChange(e.target.value)} 
                                placeholder="${(activeForm && activeForm.desc_placeholder) || __('Detailed Specifications', 'workpress')}" 
                                required
                            ></textarea>
                        </div>

                        <!-- Dynamic Specifications Generator -->
                        ${activeForm && Array.isArray(activeForm.specs) && activeForm.specs.length > 0 ? html`
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--wp-border);">
                                ${activeForm.specs.map((spec, idx) => {
                                    const specKey = spec.name || `spec_${idx}`;
                                    const currentVal = reqSpecs[specKey] || '';

                                    if (spec.type === 'file') {
                                        const uploadedList = Array.isArray(reqSpecs[specKey]) ? reqSpecs[specKey] : [];
                                        const isUp = uploadingSpecs[specKey] || false;

                                        return html`
                                            <div key=${idx} class="portal-form-group" style="grid-column: 1 / -1;">
                                                <label class="portal-label">${spec.label || spec.name}</label>
                                                <div style="border: 2px dashed var(--wp-border); background: var(--wp-bg-subtle); padding: 1.25rem; text-align: center;">
                                                    <i class="dashicons dashicons-upload" style="font-size: 28px; color: var(--wp-text-muted); margin-bottom: 0.35rem;"></i>
                                                    <div style="font-size: 0.85rem; color: var(--wp-text-secondary); margin-bottom: 0.5rem;">${__('Attachments & Files', 'workpress')}</div>
                                                    <input 
                                                        type="file" 
                                                        onChange=${e => onFileUpload(specKey, e)} 
                                                        disabled=${isUp} 
                                                        style="font-size: 0.82rem;"
                                                    />
                                                    ${isUp && html`<span style="font-size: 0.78rem; color: var(--wp-primary); margin-right: 6px;">${__('Loading...', 'workpress')}</span>`}
                                                </div>

                                                ${uploadedList.length > 0 && html`
                                                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem;">
                                                        ${uploadedList.map((f, fIdx) => html`
                                                            <span key=${fIdx} style="display: inline-flex; align-items: center; gap: 6px; background: #ffffff; border: 1px solid var(--wp-border); padding: 3px 10px; font-size: 0.8rem;">
                                                                <i class="dashicons dashicons-media-default"></i>
                                                                <span>${f.name}</span>
                                                                <button type="button" onClick=${() => onRemoveUploadedFile(specKey, fIdx)} style="background: none; border: none; color: var(--wp-danger); cursor: pointer; display: inline-flex; align-items: center;">
                                                                    <i class="dashicons dashicons-no-alt" style="font-size: 14px;"></i>
                                                                </button>
                                                            </span>
                                                        `)}
                                                    </div>
                                                `}
                                            </div>
                                        `;
                                    }

                                    if (spec.type === 'pills' || spec.type === 'multiple') {
                                        const selectedList = Array.isArray(reqSpecs[specKey]) ? reqSpecs[specKey] : [];
                                        const pills = Array.isArray(spec.options) ? spec.options : [];

                                        return html`
                                            <div key=${idx} class="portal-form-group" style="grid-column: 1 / -1;">
                                                <label class="portal-label">${spec.label || spec.name}</label>
                                                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                                                    ${pills.map((pill, pIdx) => {
                                                        const isSel = selectedList.includes(pill);
                                                        return html`
                                                            <button 
                                                                key=${pIdx} 
                                                                type="button" 
                                                                class="portal-pill ${isSel ? 'is-selected' : ''}"
                                                                onClick=${() => onToggleSpecPill(specKey, pill)}
                                                            >
                                                                ${isSel ? html`<i class="dashicons dashicons-yes" style="font-size: 14px; margin-left: 2px;"></i>` : ''}
                                                                <span>${pill}</span>
                                                            </button>
                                                        `;
                                                    })}
                                                </div>
                                            </div>
                                        `;
                                    }

                                    return html`
                                        <div key=${idx} class="portal-form-group">
                                            <label class="portal-label">${spec.label || spec.name}</label>
                                            <input 
                                                type="text" 
                                                class="portal-input" 
                                                value=${currentVal} 
                                                onInput=${e => onSpecChange(specKey, e.target.value)} 
                                                placeholder="${spec.placeholder || ''}" 
                                            />
                                        </div>
                                    `;
                                })}
                            </div>
                        ` : null}

                        <button 
                            type="submit" 
                            class="btn-portal btn-portal-primary" 
                            style="width: 100%; margin-top: 1.5rem; padding: 0.85rem; font-size: 1rem;" 
                            disabled=${reqSubmitting}
                        >
                            <i class="dashicons dashicons-yes-alt"></i>
                            <span>${reqSubmitting ? __('Loading...', 'workpress') : __('Submit Project Request', 'workpress')}</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    };

})(window.WorkPressPortal);
