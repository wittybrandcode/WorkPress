/**
 * WorkPress Client Portal Helpers
 * 
 * @package WorkPress
 * @subpackage Portal/Utils
 */

import { html } from './html.js';

export function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return dateString.substring(0, 10);
    }
}

export function formatDateTime(dateString) {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return dateString;
    }
}

export function getStatusBadge(status) {
    switch (status) {
        case 'active':
        case 'in_progress':
            return html`<span class="portal-badge portal-badge-warning"><i class="dashicons dashicons-update"></i> <span>قيد الإنجاز والتنفيذ</span></span>`;
        case 'completed':
        case 'signed_off':
        case 'delivered':
            return html`<span class="portal-badge portal-badge-success"><i class="dashicons dashicons-yes-alt"></i> <span>مكتمل ومعتمد رسمياً</span></span>`;
        case 'pending':
            return html`<span class="portal-badge portal-badge-info"><i class="dashicons dashicons-clock"></i> <span>بانتظار المراجعة والاعتماد</span></span>`;
        case 'archived':
            return html`<span class="portal-badge portal-badge-dark"><i class="dashicons dashicons-archive"></i> <span>مؤرشف</span></span>`;
        default:
            return html`<span class="portal-badge portal-badge-info"><span>${status}</span></span>`;
    }
}

export function getPriorityBadge(priority) {
    switch (priority) {
        case 'urgent':
            return html`<span class="portal-badge portal-badge-danger"><span>عاجل جداً</span></span>`;
        case 'high':
            return html`<span class="portal-badge portal-badge-warning"><span>أولوية عالية</span></span>`;
        case 'normal':
            return html`<span class="portal-badge portal-badge-info"><span>أولوية عادية</span></span>`;
        default:
            return html`<span class="portal-badge portal-badge-subtle"><span>منخفضة</span></span>`;
    }
}
