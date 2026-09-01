import { __ } from '../../utils/html.js';

/**
 * Registry of Abstract Generic Field Primitives.
 * Designed for pure domain-agnostic flexibility & future extensibility.
 * 
 * @package WorkPress
 * @subpackage Components/Forms
 */
export const getFieldPrimitives = () => ({
	smart_title: {
		type: 'smart_title',
		label: __( 'Smart Title Field', 'workpress' ),
		icon: 'dashicons-tag',
		badge: __( 'Core', 'workpress' ),
		defaultLabel: __( 'Request Title / Project Name:', 'workpress' ),
		defaultPlaceholder: __( 'Enter request title or project name...', 'workpress' ),
		description: __( 'Preset quick suggestions list with always-available free text input.', 'workpress' )
	},
	scope_description: {
		type: 'scope_description',
		label: __( 'Scope & Details Description', 'workpress' ),
		icon: 'dashicons-editor-paragraph',
		badge: __( 'Core', 'workpress' ),
		defaultLabel: __( 'Project Scope & Details:', 'workpress' ),
		defaultPlaceholder: __( 'Describe in detail what is required from the team, target deliverables, and requirements...', 'workpress' ),
		description: __( 'Expanded text area for project scope and specifications.', 'workpress' )
	},
	select_custom: {
		type: 'select_custom',
		label: __( 'Single Select Dropdown (Single Select)', 'workpress' ),
		icon: 'dashicons-arrow-down-alt2',
		badge: __( 'Select', 'workpress' ),
		defaultLabel: __( 'Service Type / Classification:', 'workpress' ),
		defaultOptions: [ __( 'Standard Option', 'workpress' ), __( 'Advanced Option', 'workpress' ) ],
		description: __( 'Predefined single-choice dropdown with custom write-in capability.', 'workpress' )
	},
	pills: {
		type: 'pills',
		label: __( 'Multiple Tags & Categories (Multi-select)', 'workpress' ),
		icon: 'dashicons-tagcloud',
		badge: __( 'Multi', 'workpress' ),
		defaultLabel: __( 'Specifications & Requirements:', 'workpress' ),
		defaultOptions: [ __( 'Fast delivery', 'workpress' ), __( 'Official documentation', 'workpress' ), __( 'Support & follow-up', 'workpress' ) ],
		description: __( 'Selectable pill badges where client can pick multiple tags.', 'workpress' )
	},
	short_text: {
		type: 'short_text',
		label: __( 'Short Text (Short Text)', 'workpress' ),
		icon: 'dashicons-editor-textcolor',
		badge: __( 'Text', 'workpress' ),
		defaultLabel: __( 'Additional Note or Reference:', 'workpress' ),
		defaultPlaceholder: __( 'Type here...', 'workpress' ),
		description: __( 'Brief single-line text input for URLs, references, or IDs.', 'workpress' )
	},
	textarea: {
		type: 'textarea',
		label: __( 'Detailed Textarea (Detailed Textarea)', 'workpress' ),
		icon: 'dashicons-align-right',
		badge: __( 'Text', 'workpress' ),
		defaultLabel: __( 'Special Notes or Conditions:', 'workpress' ),
		defaultPlaceholder: __( 'Enter any detailed conditions...', 'workpress' ),
		description: __( 'Multi-line text area for instructions or stipulations.', 'workpress' )
	},
	numeric: {
		type: 'numeric',
		label: __( 'Numeric / Budget / Quantity (Numeric)', 'workpress' ),
		icon: 'dashicons-money-alt',
		badge: __( 'Number', 'workpress' ),
		defaultLabel: __( 'Estimated Budget or Quantity:', 'workpress' ),
		defaultPlaceholder: '5,000',
		description: __( 'Number field for amounts, hours, or financial estimations.', 'workpress' )
	},
	date: {
		type: 'date',
		label: __( 'Target Delivery Date (Target Date)', 'workpress' ),
		icon: 'dashicons-calendar-alt',
		badge: __( 'Date', 'workpress' ),
		defaultLabel: __( 'Required Completion Date:', 'workpress' ),
		description: __( 'Date picker for target deadline or start date.', 'workpress' )
	},
	upload: {
		type: 'upload',
		label: __( 'File Upload & Attachments (Attachments)', 'workpress' ),
		icon: 'dashicons-upload',
		badge: __( 'Files', 'workpress' ),
		defaultLabel: __( 'Supporting Documents & Reference Files:', 'workpress' ),
		description: __( 'Upload zone for documents, designs, ZIP files, and briefs.', 'workpress' )
	}
});

export const FIELD_PRIMITIVES = getFieldPrimitives();

export const getDefaultUniversalForm = () => ({
	id: 'standard_request',
	name: __( 'Standard Work / Service Intake Form', 'workpress' ),
	title_label: __( 'Request Title / Project Name:', 'workpress' ),
	title_placeholder: __( 'Enter request title or project name...', 'workpress' ),
	title_suggestions: [
		__( 'New Project & Complete Service Delivery', 'workpress' ),
		__( 'Modification & Enhancement on Existing Work', 'workpress' ),
		__( 'Technical Consultation & Requirements Audit', 'workpress' ),
		__( 'Periodic Maintenance & Executive Oversight', 'workpress' )
	],
	desc_label: __( 'Project Scope & Details:', 'workpress' ),
	desc_placeholder: __( 'Describe in detail what is required from the team, target deliverables, and requirements...', 'workpress' ),
	specs: [
		{
			id: 'service_tier',
			type: 'select_custom',
			label: __( 'Service Classification / Tier:', 'workpress' ),
			options: [ __( 'Standard Tier', 'workpress' ), __( 'Comprehensive Tier', 'workpress' ), __( 'Custom Agreed Package', 'workpress' ) ],
			required: true
		},
		{
			id: 'deliverables_options',
			type: 'pills',
			label: __( 'Options & Deliverables:', 'workpress' ),
			options: [ __( 'Fast delivery', 'workpress' ), __( 'Detailed documentation', 'workpress' ), __( 'Official sign-off', 'workpress' ), __( 'Continuous support', 'workpress' ) ],
			required: false
		},
		{
			id: 'budget_est',
			type: 'numeric',
			label: __( 'Estimated Budget / Quantity (Optional):', 'workpress' ),
			placeholder: '5,000',
			required: false
		},
		{
			id: 'target_date',
			type: 'date',
			label: __( 'Target Completion Deadline:', 'workpress' ),
			required: false
		},
		{
			id: 'attachments',
			type: 'upload',
			label: __( 'Supporting Documents & Attachments:', 'workpress' ),
			required: false
		}
	]
});

export const DEFAULT_UNIVERSAL_FORM = getDefaultUniversalForm();
