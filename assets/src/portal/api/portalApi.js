/**
 * WorkPress Client Portal API Client
 * 
 * Handles all REST endpoints for the client portal with automatic nonce recovery.
 * 
 * @package WorkPress
 * @subpackage Portal/API
 */

export const getPortalConfig = () => window.workpressPortalConfig || {};

/**
 * Low-level API request helper with automatic nonce recovery.
 */
export async function apiFetch(endpoint, method = 'GET', body = null, isRetry = false) {
    const config = getPortalConfig();
    const url = `${config.apiUrl}/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'X-WP-Nonce': config.restNonce || ''
    };

    const options = { method, headers };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const json = await res.json();
    
    // Handle expired nonce seamlessly
    if (!res.ok) {
        if ((res.status === 403 || json.code === 'rest_cookie_invalid_nonce') && !isRetry && endpoint !== 'refresh-nonce') {
            try {
                const refreshRes = await fetch(`${config.apiUrl}/refresh-nonce`);
                const refreshJson = await refreshRes.json();
                if (refreshJson && refreshJson.nonce) {
                    config.restNonce = refreshJson.nonce;
                    return await apiFetch(endpoint, method, body, true);
                }
            } catch (retryErr) {
                console.warn('WorkPress Portal: Nonce refresh failed', retryErr);
            }
        }
        throw new Error(json.message || 'حدث خطأ أثناء معالجة الطلب');
    }
    return json;
}

export const portalApi = {
    fetchSession: () => apiFetch('refresh-nonce'),
    fetchMyProjects: () => apiFetch('my-projects'),
    fetchProjectDetails: (projectId) => apiFetch(`projects/${projectId}`),
    fetchProjectMilestones: (projectId) => apiFetch(`projects/${projectId}/milestones`),
    fetchProjectDeliverables: (projectId) => apiFetch(`projects/${projectId}/deliverables`),
    fetchProjectReport: (projectId) => apiFetch(`projects/${projectId}/report`),
    fetchPulse: () => apiFetch('pulse'),
    fetchRadar: () => apiFetch('radar'),
    fetchIntakeForms: () => apiFetch('intake-forms'),
    
    login: (username, password) => apiFetch('login', 'POST', { username, password }),
    
    submitFeedback: (projectId, feedback, message) => apiFetch('feedback', 'POST', {
        project_id: projectId,
        feedback,
        message
    }),
    
    submitProjectRequest: (payload) => apiFetch('request', 'POST', payload),
    
    markNotificationRead: (notificationId) => apiFetch(`notifications/${notificationId}/read`, 'POST'),
    markAllNotificationsRead: () => apiFetch('notifications/read-all', 'POST')
};

export default portalApi;
