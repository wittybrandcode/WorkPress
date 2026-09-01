import { __ } from '../../utils/html.js';

/**
 * WorkPress Encyclopedia Structured Data (SSOT)
 * 
 * Separates encyclopedic content from presentation templates.
 * 
 * @package WorkPress
 * @subpackage Components/About
 */

export const getSections = () => [
	{ id: 'all', label: __( 'Comprehensive Encyclopedia (All)', 'workpress' ), icon: 'dashicons-book-alt' },
	{ id: 'philosophy', label: __( 'Philosophy & The 6 Pillars', 'workpress' ), icon: 'dashicons-lightbulb' },
	{ id: 'roles_spaces', label: __( 'Roles & The 3 Workspaces', 'workpress' ), icon: 'dashicons-groups' },
	{ id: 'capabilities', label: __( '8-Domain Capability Matrix', 'workpress' ), icon: 'dashicons-shield' },
	{ id: 'tripartite', label: __( 'Authorization Formula & Security', 'workpress' ), icon: 'dashicons-lock' },
	{ id: 'lifecycle', label: __( 'Comprehensive Work Lifecycle', 'workpress' ), icon: 'dashicons-randomize' },
	{ id: 'services', label: __( 'The 17 Architectural Services', 'workpress' ), icon: 'dashicons-rest-api' },
	{ id: 'database', label: __( 'Data Layer & Infrastructure', 'workpress' ), icon: 'dashicons-database' },
	{ id: 'engines', label: __( 'Integrated Productivity Engines', 'workpress' ), icon: 'dashicons-performance' },
];

export const getPillars = () => [
	{
		title: __( 'Native WordPress Ontology', 'workpress' ),
		subtitle: 'Native WordPress Ontology',
		icon: 'dashicons-wordpress-alt',
		color: '#008478',
		desc: __( 'Leverages native WordPress tables (wp_terms for projects, wp_posts for tasks, wp_comments for contributions) without custom SQL tables, ensuring permanence and caching speed.', 'workpress' )
	},
	{
		title: __( 'Work First & Artifact Protection', 'workpress' ),
		subtitle: 'Just Work Philosophy',
		icon: 'dashicons-hammer',
		color: '#0284c7',
		desc: __( 'Specialists focus on delivering solutions and evidence, while the system automates task completions, progress updates, and institutional archiving.', 'workpress' )
	},
	{
		title: __( 'Citizenship Hierarchy & Portal Isolation', 'workpress' ),
		subtitle: '4-Tier Citizenship & Standalone Portal',
		icon: 'dashicons-shield-alt',
		color: '#7c3aed',
		desc: __( 'Total visual and operational separation between technical specialists and clients, with an isolated /portal/ environment.', 'workpress' )
	},
	{
		title: __( 'Tri-Partite Authorization Formula', 'workpress' ),
		subtitle: 'Tri-Partite Authorization Formula',
		icon: 'dashicons-lock',
		color: '#d97706',
		desc: __( 'Rigorous 3-layer authorization checks: Global Capability + Project Membership + Entity Relationship to eliminate sensitive data leakage.', 'workpress' )
	},
	{
		title: __( 'Living Institutional Memory', 'workpress' ),
		subtitle: 'Living Institutional Memory',
		icon: 'dashicons-book',
		color: '#059669',
		desc: __( 'Formally approved solutions instantly become living knowledge records, exportable as printable Markdown documentation books.', 'workpress' )
	},
	{
		title: __( 'Live Outbound Webhooks & Automation', 'workpress' ),
		subtitle: 'Outbound Webhooks & Integrations',
		icon: 'dashicons-rest-api',
		color: '#e11d48',
		desc: __( 'Instant event broadcasting to Discord, Slack, Microsoft Teams, and Zapier signed with HMAC-SHA256.', 'workpress' )
	}
];

export const getCoreServices = () => [
	{ name: 'WorkPress_Project_Service', file: 'class-workpress-project-service.php', role: __( 'Project management, progress metrics, and project leadership validation.', 'workpress' ) },
	{ name: 'WorkPress_Task_Service', file: 'class-workpress-task-service.php', role: __( 'Task governance, status validation, and interactive checklist tracking.', 'workpress' ) },
	{ name: 'WorkPress_Assignment_Service', file: 'class-workpress-assignment-service.php', role: __( 'Specialist assignment governance and stakeholder assignment protection.', 'workpress' ) },
	{ name: 'WorkPress_Contribution_Service', file: 'class-workpress-contribution-service.php', role: __( 'Contribution audit log, evidence attachments, and solution approvals.', 'workpress' ) },
	{ name: 'WorkPress_Portal_Service', file: 'class-workpress-portal-service.php', role: __( 'Client portal standalone workspace management and authentication.', 'workpress' ) },
	{ name: 'WorkPress_Knowledge_Service', file: 'class-workpress-knowledge-service.php', role: __( 'Knowledge bank aggregation and Markdown document exporter.', 'workpress' ) },
	{ name: 'WorkPress_Webhook_Service', file: 'class-workpress-webhook-service.php', role: __( 'Event dispatcher with Discord, Slack, and Teams payload formatters.', 'workpress' ) },
	{ name: 'WorkPress_Security_Service', file: 'class-workpress-security-service.php', role: __( 'Soft trash vault and unauthorized deletion prevention.', 'workpress' ) },
	{ name: 'WorkPress_Membership_Service', file: 'class-workpress-membership-service.php', role: __( 'Project membership registry and role tier matching.', 'workpress' ) },
	{ name: 'WorkPress_Hibernation_Service', file: 'class-workpress-hibernation-service.php', role: __( 'Automatic project hibernation and thaw on role changes.', 'workpress' ) },
	{ name: 'WorkPress_Time_Service', file: 'class-workpress-time-service.php', role: __( 'Time tracking, estimate burn rates, and execution hours.', 'workpress' ) },
	{ name: 'WorkPress_Report_Service', file: 'class-workpress-report-service.php', role: __( 'Executive report compilation and KPI metrics aggregation.', 'workpress' ) },
	{ name: 'WorkPress_Intake_Service', file: 'class-workpress-intake-service.php', role: __( 'Dynamic intake schema manager and triage studio engine.', 'workpress' ) },
	{ name: 'WorkPress_Activity_Service', file: 'class-workpress-activity-service.php', role: __( 'Immutable audit log and activity stream coordinator.', 'workpress' ) },
	{ name: 'WorkPress_Capabilities_Registry', file: 'class-workpress-capabilities-registry.php', role: __( 'Registration and mapping of all 34 atomic capabilities.', 'workpress' ) },
	{ name: 'WorkPress_Roles_Service', file: 'class-workpress-roles-service.php', role: __( 'WordPress role customization, aliases, and permission cloning.', 'workpress' ) },
	{ name: 'WorkPress_Settings_Service', file: 'class-workpress-settings-service.php', role: __( 'System settings management, audio kits, and localization configs.', 'workpress' ) }
];

export const SECTIONS = getSections();
export const PILLARS = getPillars();
export const CORE_SERVICES = getCoreServices();
