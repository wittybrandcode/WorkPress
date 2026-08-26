<?php
/**
 * WorkPress Keys Registry
 *
 * Central Single Source of Truth for all Post Types, Taxonomies,
 * Meta Keys, Option Keys, Table Names, Statuses, and Capabilities.
 * 
 * Eradicates "Magic Strings" across the entire codebase.
 *
 * @package WorkPress
 * @subpackage Core
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class WorkPress_Keys {

	// =========================================================================
	// 1. Custom Post Types (CPT)
	// =========================================================================
	const CPT_WORK_ITEM = 'work_item';
	const CPT_PROJECT   = 'wp_project';
	const CPT_TASK      = 'wp_task';
	const CPT_TEMPLATE  = 'wp_template';

	// =========================================================================
	// 2. Taxonomies & Comments
	// =========================================================================
	const TAX_PROJECT          = 'workpress_project';
	const TAX_PROJECT_CATEGORY = 'wp_project_category';
	const COMMENT_CONTRIBUTION = 'wp_contribution';

	// =========================================================================
	// 3. Meta Keys — Project
	// =========================================================================
	const META_PROJECT_PREFIX   = '_workpress_prefix';
	const META_PROJECT_STATUS   = '_workpress_status';
	const META_PROJECT_PROGRESS = '_workpress_progress';
	const META_PROJECT_LEAD_ID  = '_workpress_lead_id';
	const META_PROJECT_COVER_ID = '_workpress_cover_id';
	const META_PROJECT_START_AT = '_workpress_start_at';
	const META_PROJECT_DUE_AT   = '_workpress_due_at';
	const META_PROJECT_ARCHIVED = '_workpress_archived';
	const META_PROJECT_MEMBERS  = '_workpress_project_members';

	// Short aliases
	const META_PREFIX       = '_workpress_prefix';
	const META_STATUS       = '_workpress_status';
	const META_PROGRESS     = '_workpress_progress';
	const META_LEAD_ID      = '_workpress_lead_id';
	const META_COVER_ID     = '_workpress_cover_id';
	const META_START_AT          = '_workpress_start_at';
	const META_DUE_AT            = '_workpress_due_at';
	const META_IS_COMPLETED      = '_workpress_is_completed';
	const META_REVIEW_NOTES      = '_workpress_review_notes';
	const META_REJECTION_REASON  = '_workpress_rejection_reason';

	// =========================================================================
	// 4. Meta Keys — Task
	// =========================================================================
	const META_TASK_STATUS           = '_workpress_status';
	const META_TASK_PRIORITY         = '_workpress_priority';
	const META_TASK_ASSIGNEES        = '_workpress_assignees';
	const META_TASK_ASSIGNEE_IDS     = '_workpress_assignee_ids';
	const META_TASK_REF_KEY          = '_workpress_ref_key';
	const META_TASK_COVER_ID         = '_workpress_cover_id';
	const META_IS_PENDING_TRASH      = '_workpress_is_pending_trash';
	const META_TRASH_REASON          = '_workpress_trash_reason';
	const META_ACCEPTED_SOLUTION_ID  = '_workpress_accepted_solution_id';

	// Short aliases
	const META_PRIORITY  = '_workpress_priority';
	const META_ASSIGNEES = '_workpress_assignee_ids';
	const META_REF_KEY   = '_workpress_ref_key';

	// =========================================================================
	// 5. Meta Keys — Contribution / Comment
	// =========================================================================
	const META_CONTRIBUTION_TYPE    = '_workpress_type';
	const META_CONTRIBUTION_PAYLOAD = '_workpress_payload';
	const META_IS_ACCEPTED          = '_workpress_is_accepted';
	const META_ACCEPTED_AT          = '_workpress_accepted_at';
	const META_ACCEPTED_BY          = '_workpress_accepted_by';
	const META_VISIBILITY_SCOPE     = '_workpress_visibility_scope';

	const VISIBILITY_INTERNAL = 'internal';
	const VISIBILITY_CLIENT   = 'client_review';

	// =========================================================================
	// 6. Meta Keys — Template
	// =========================================================================
	const META_TEMPLATE_TYPE   = '_workpress_template_type';
	const META_TEMPLATE_SCHEMA = '_workpress_template_schema';

	// =========================================================================
	// 7. WordPress Options
	// =========================================================================
	const OPT_DB_VERSION          = 'workpress_db_version';
	const OPT_CUSTOM_ROLES        = 'workpress_custom_roles';
	const OPT_CAPABILITIES        = 'workpress_custom_capabilities';
	const OPT_CONTRIBUTION_TYPES  = 'workpress_contribution_types';
	const OPT_WORKSPACE_NAME      = 'workpress_workspace_name';
	const OPT_DEFAULT_PRIORITY    = 'workpress_default_priority';
	const OPT_TIMEZONE            = 'workpress_timezone';
	const OPT_MONTH_NAMING        = 'workpress_month_naming';
	const OPT_DATE_FORMAT         = 'workpress_date_format';
	const OPT_RELATIVE_TIME       = 'workpress_relative_time';
	const OPT_EMAIL_NOTIFICATIONS = 'workpress_email_notifications';
	const OPT_META_MIGRATED       = 'workpress_meta_migrated';

	// =========================================================================
	// 8. Custom Database Tables (without prefix)
	// =========================================================================
	const TABLE_NOTIFICATIONS = 'workpress_notifications';

	// =========================================================================
	// 9. Project Statuses
	// =========================================================================
	const PROJECT_STATUS_PENDING      = 'pending';
	const PROJECT_STATUS_UNDER_REVIEW = 'under_review';
	const PROJECT_STATUS_ACTIVE       = 'active';
	const PROJECT_STATUS_REJECTED     = 'rejected';
	const PROJECT_STATUS_ON_HOLD      = 'on-hold';
	const PROJECT_STATUS_COMPLETED    = 'completed';
	const PROJECT_STATUS_CANCELLED    = 'cancelled';
	const PROJECT_STATUS_ARCHIVED     = 'archived';

	// =========================================================================
	// 10. Derived Task Statuses
	// =========================================================================
	const TASK_STATUS_OPEN        = 'open';
	const TASK_STATUS_NEW         = 'new';
	const TASK_STATUS_ASSIGNED    = 'assigned';
	const TASK_STATUS_IN_PROGRESS = 'in_progress';
	const TASK_STATUS_IN_REVIEW   = 'in_review';
	const TASK_STATUS_COMPLETED   = 'completed';
	const TASK_STATUS_CLOSED      = 'closed';

	// =========================================================================
	// 11. Task Priorities
	// =========================================================================
	const PRIORITY_LOW    = 'low';
	const PRIORITY_MEDIUM = 'medium';
	const PRIORITY_HIGH   = 'high';

	// =========================================================================
	// 12. Standard Contribution Types
	// =========================================================================
	const CONTRIB_TYPE_COMMENT        = 'comment';
	const CONTRIB_TYPE_SOLUTION       = 'solution';
	const CONTRIB_TYPE_IMPLEMENTATION = 'implementation';
	const CONTRIB_TYPE_REVIEW         = 'review';
	const CONTRIB_TYPE_DECISION       = 'decision';
	const CONTRIB_TYPE_ASIDE          = 'aside';
	const CONTRIB_TYPE_GENERAL        = 'general';

	// =========================================================================
	// 13. System Capabilities
	// =========================================================================
	const CAP_MANAGE_WORKPRESS        = 'manage_workpress';
	const CAP_CREATE_PROJECTS         = 'create_workpress_projects';
	const CAP_EDIT_PROJECTS           = 'edit_workpress_projects';
	const CAP_DELETE_PROJECTS         = 'delete_workpress_projects';
	const CAP_MANAGE_PROJECT_MEMBERS  = 'manage_project_members';
	const CAP_CREATE_TASKS            = 'create_workpress_tasks';
	const CAP_EDIT_TASKS              = 'edit_workpress_tasks';
	const CAP_DELETE_TASKS            = 'delete_workpress_tasks';
	const CAP_ASSIGN_TASKS            = 'assign_tasks';
	const CAP_CREATE_CONTRIBUTIONS    = 'add_contributions';
	const CAP_EDIT_CONTRIBUTIONS      = 'edit_contributions';
	const CAP_DELETE_CONTRIBUTIONS    = 'delete_contributions';
	const CAP_ACCEPT_SOLUTIONS        = 'accept_solutions';
	const CAP_REVOKE_SOLUTIONS        = 'revoke_solutions';
	const CAP_VIEW_KNOWLEDGE          = 'read_knowledge_base';
	const CAP_MANAGE_SETTINGS         = 'manage_workpress_settings';
	const CAP_ACCESS_PORTAL           = 'access_workpress_client_portal';
	const ROLE_CLIENT                 = 'workpress_client';

	/**
	 * Helper to get the full table name with WordPress prefix.
	 *
	 * @param string $table_constant Self table constant (e.g. TABLE_NOTIFICATIONS).
	 * @return string Full prefixed table name.
	 */
	public static function get_table_name( $table_constant ) {
		global $wpdb;
		return $wpdb->prefix . $table_constant;
	}

	/**
	 * Private constructor to prevent instantiation.
	 */
	private function __construct() {}
}
