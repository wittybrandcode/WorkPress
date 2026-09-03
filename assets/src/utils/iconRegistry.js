/**
 * Semantic Icon Registry (دستور وسجل الأيقونات الدلالي الموحد)
 *
 * Provides single-source-of-truth semantic icon assignments for all entities,
 * temporal timeline pins, status badges, and quick-action triggers in WorkPress.
 * Strictly complies with the Universal Monochrome Icon Law (Black #0f172a in default state).
 */

export const ICONS = {
	// Core System Entities
	PROJECT: 'dashicons-portfolio',
	TASK: 'dashicons-clipboard',
	SUBTASK: 'dashicons-editor-ul',
	CONTRIBUTION: 'dashicons-share-alt2',
	APPROVED_SOLUTION: 'dashicons-awards',
	REQUEST: 'dashicons-email-alt',
	KNOWLEDGE: 'dashicons-book',
	FORM: 'dashicons-forms',
	REPORT: 'dashicons-analytics',
	KANBAN: 'dashicons-columns',
	GANTT: 'dashicons-calendar-alt',

	// Status States
	STATUS_ACTIVE: 'dashicons-controls-play',
	STATUS_COMPLETED: 'dashicons-yes-alt',
	STATUS_PENDING: 'dashicons-clock',
	STATUS_FROZEN: 'wp-snowflake-icon', // Uses dedicated SnowflakeIcon component
	STATUS_ARCHIVED: 'dashicons-trash',

	// Temporal Timeline Horizon Pins
	START_DATE: 'dashicons-calendar-alt',
	ELAPSED_TIME: 'dashicons-backup',
	DUE_DATE: 'dashicons-clock',
	OVERDUE_ALERT: 'dashicons-warning',

	// Action Controls
	ACTION_ADD: 'dashicons-plus-alt2',
	ACTION_EDIT: 'dashicons-edit',
	ACTION_DELETE: 'dashicons-trash',
	ACTION_SEARCH: 'dashicons-search',
	ACTION_RESET: 'dashicons-image-rotate',
	ACTION_VIEW_CARDS: 'dashicons-grid-view',
	ACTION_VIEW_TABLE: 'dashicons-list-view',
	ACTION_ATTACHMENT: 'dashicons-paperclip',
	ACTION_CLIENT: 'dashicons-businessman',
	ACTION_MEMBER: 'dashicons-admin-users'
};

/**
 * Returns the standardized Dashicon class for an entity or status.
 *
 * @param {string} key Semantic identifier
 * @param {string} [fallback] Fallback class
 * @return {string} Standardized icon class name
 */
export function getSemanticIcon( key, fallback = 'dashicons-marker' ) {
	if ( ! key ) return fallback;
	const upper = String( key ).toUpperCase();
	return ICONS[ upper ] || fallback;
}

export default ICONS;
