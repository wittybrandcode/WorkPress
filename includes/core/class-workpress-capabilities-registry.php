<?php
/**
 * WorkPress Capabilities Registry.
 *
 * @package WorkPress
 */

if (!defined('ABSPATH')) {
	exit;
}

class WorkPress_Capabilities_Registry {

	/**
	 * Get all registered capability groups and their capabilities.
	 *
	 * @return array
	 */
	public static function get_registered_capabilities() {
		$groups = array(
			'access' => array(
				'label' => __( 'Access & Perimeter', 'workpress' ),
				'caps'  => array(
					'access_workpress_admin'  => __( 'Access CoWorkPress Operations Room', 'workpress' ),
					'access_workpress_portal' => __( 'Access Standalone Portal and Deliverables Space', 'workpress' ),
				),
			),
			'projects' => array(
				'label' => __( 'Projects & Work Contexts', 'workpress' ),
				'caps'  => array(
					'read_workpress_projects'   => __( 'View authorized projects', 'workpress' ),
					'create_workpress_projects' => __( 'Create and establish new projects', 'workpress' ),
					'edit_workpress_projects'   => __( 'Edit project data and schedules', 'workpress' ),
					'delete_workpress_projects' => __( 'Delete and archive projects', 'workpress' ),
					'manage_project_members'    => __( 'Manage and assign project members', 'workpress' ),
				),
			),
			'tasks' => array(
				'label' => __( 'Tasks & Workflow', 'workpress' ),
				'caps'  => array(
					'read_workpress_tasks'        => __( 'View and read tasks', 'workpress' ),
					'create_workpress_tasks'      => __( 'Create new tasks', 'workpress' ),
					'edit_assigned_tasks'         => __( 'Edit tasks assigned to user', 'workpress' ),
					'edit_others_workpress_tasks' => __( 'Edit all project tasks', 'workpress' ),
					'change_task_status'          => __( 'Change task statuses and move in Kanban', 'workpress' ),
					'assign_tasks'                => __( 'Assign tasks and distribute responsibilities', 'workpress' ),
					'delete_workpress_tasks'      => __( 'Delete tasks', 'workpress' ),
				),
			),
			'contributions' => array(
				'label' => __( 'Contributions & Technical Evidence', 'workpress' ),
				'caps'  => array(
					'read_contributions'   => __( 'Read task contributions and evidence', 'workpress' ),
					'add_contributions'    => __( 'Add comment or technical contribution', 'workpress' ),
					'edit_contributions'   => __( 'Edit own contributions', 'workpress' ),
					'delete_contributions' => __( 'Delete own contributions', 'workpress' ),
					'accept_solutions'     => __( 'Approve contribution as final solution', 'workpress' ),
					'revoke_solutions'     => __( 'Revoke solution approval and reopen', 'workpress' ),
				),
			),
			'requests' => array(
				'label' => __( 'Requests & Triage Governance', 'workpress' ),
				'caps'  => array(
					'submit_work_requests'   => __( 'Submit new project requests', 'workpress' ),
					'view_incoming_requests' => __( 'Browse incoming requests', 'workpress' ),
					'triage_requests'        => __( 'Triage and set requests under review with justification', 'workpress' ),
					'approve_requests'       => __( 'Approve request and officially establish project', 'workpress' ),
					'reject_requests'        => __( 'Reject request with formal justification for stakeholder', 'workpress' ),
				),
			),
			'knowledge_reports' => array(
				'label' => __( 'Knowledge & Executive Reports', 'workpress' ),
				'caps'  => array(
					'read_knowledge_base'        => __( 'Access extracted knowledge base', 'workpress' ),
					'generate_executive_reports' => __( 'Generate official executive reports (A4)', 'workpress' ),
					'export_knowledge_book'      => __( 'Export compiled knowledge book (Markdown)', 'workpress' ),
				),
			),
			'system_tools' => array(
				'label' => __( 'System Administration', 'workpress' ),
				'caps'  => array(
					'manage_workpress_settings'   => __( 'Manage system settings and matrix customizations', 'workpress' ),
					'manage_workpress_broadcasts' => __( 'Manage managerial broadcasts and operational alert rules', 'workpress' ),
					'manage_intake_forms'         => __( 'Design and build intake form templates', 'workpress' ),
					'manage_webhooks'             => __( 'Manage webhooks and external integrations', 'workpress' ),
				),
			),
			'portal_features' => array(
				'label' => __( 'Portal Stakeholder Suite', 'workpress' ),
				'caps'  => array(
					'view_own_deliverables'        => __( 'Browse and download approved deliverables and solutions', 'workpress' ),
					'submit_client_feedback'       => __( 'Send feedback and inquiries on deliverables', 'workpress' ),
					'signoff_project_deliverables' => __( 'Digital signature and delivery report generation', 'workpress' ),
				),
			),
		);

		return apply_filters( 'workpress_registered_capabilities', $groups );
	}

	/**
	 * Get a flat list of all capability keys.
	 *
	 * @return array Array of capability keys.
	 */
	public static function get_all_capability_keys() {
		$keys = array();
		foreach ( self::get_registered_capabilities() as $group ) {
			foreach ( $group['caps'] as $key => $label ) {
				$keys[] = $key;
			}
		}
		return $keys;
	}
}
