import { html, useState, __, sprintf } from '../utils/html.js';
import { settingsApi } from '../api/client.js';
import { toast } from '../utils/toast.js';
import sound from '../utils/sound.js';
import { FIELD_PRIMITIVES, DEFAULT_UNIVERSAL_FORM } from '../components/forms/FormFieldPrimitives.js';
import IntakeFormsToolbar from '../components/forms/IntakeFormsToolbar.js';
import FormCanvasBuilder from '../components/forms/FormCanvasBuilder.js';
import FormSchemaPreview from '../components/forms/FormSchemaPreview.js';

export { FIELD_PRIMITIVES };

/**
 * WorkPress Intake Forms Studio Page (Lean Coordinator)
 *
 * @package WorkPress
 * @subpackage Pages/Forms
 * @version 2.3.0
 */
export default function IntakeFormsPage() {
	const wpSettings = window.workpressSettings || {};
	const [forms, setForms] = useState(
		Array.isArray(wpSettings.intake_forms_schema) && wpSettings.intake_forms_schema.length > 0
			? wpSettings.intake_forms_schema
			: [DEFAULT_UNIVERSAL_FORM]
	);

	const [activeIdx, setActiveIdx] = useState(0);
	const [isSaving, setIsSaving] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [newSuggestionInput, setNewSuggestionInput] = useState('');
	const [newOptionInputs, setNewOptionInputs] = useState({});

	const currentForm = forms[activeIdx] || forms[0] || DEFAULT_UNIVERSAL_FORM;

	// Form template management
	const handleAddFormTemplate = () => {
		const newForm = {
			...DEFAULT_UNIVERSAL_FORM,
			id: 'form_' + Date.now(),
			name: `${ __( 'New Request Form Template', 'workpress' ) } (${forms.length + 1})`,
			specs: [
				{
					id: 'spec_' + Date.now(),
					type: 'select_custom',
					label: __( 'Service or Request Type:', 'workpress' ),
					options: [ __( 'Standard Option 1', 'workpress' ), __( 'Advanced Option 2', 'workpress' ) ],
					required: true
				}
			]
		};
		const updated = [...forms, newForm];
		setForms(updated);
		setActiveIdx(updated.length - 1);
		sound.play('button');
		toast( __( 'New form template created.', 'workpress' ), 'info' );
	};

	const handleDeleteFormTemplate = (idxToDelete) => {
		if (forms.length <= 1) {
			toast( __( 'At least one intake form template must remain.', 'workpress' ), 'warning' );
			sound.play('caution');
			return;
		}
		const updated = forms.filter((_, i) => i !== idxToDelete);
		setForms(updated);
		setActiveIdx(Math.max(0, activeIdx - 1));
		sound.play('button');
		toast( __( 'Template deleted.', 'workpress' ), 'info' );
	};

	const updateCurrentForm = (key, val) => {
		const updated = [...forms];
		updated[activeIdx] = {
			...updated[activeIdx],
			[key]: val
		};
		setForms(updated);
	};

	// Add element into canvas
	const handleAddPrimitive = (primitiveType) => {
		const prim = FIELD_PRIMITIVES[primitiveType];
		if (!prim) return;

		const specs = Array.isArray(currentForm.specs) ? [...currentForm.specs] : [];
		const newSpec = {
			id: 'spec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
			type: primitiveType,
			label: prim.defaultLabel,
			placeholder: prim.defaultPlaceholder || '',
			options: prim.defaultOptions ? [...prim.defaultOptions] : [],
			required: false
		};

		specs.push(newSpec);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast( sprintf( __( 'Added field: %s', 'workpress' ), prim.label.split('(')[0] ), 'success' );
	};

	// Move element up/down on canvas
	const handleMoveSpec = (sIdx, direction) => {
		const specs = [...currentForm.specs];
		const targetIdx = sIdx + direction;
		if (targetIdx < 0 || targetIdx >= specs.length) return;

		const temp = specs[sIdx];
		specs[sIdx] = specs[targetIdx];
		specs[targetIdx] = temp;

		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	const handleDeleteSpec = (sIdx) => {
		const specs = currentForm.specs.filter((_, i) => i !== sIdx);
		updateCurrentForm('specs', specs);
		sound.play('button');
		toast( __( 'Field removed from template.', 'workpress' ), 'info' );
	};

	const handleUpdateSpec = (sIdx, key, val) => {
		const specs = [...currentForm.specs];
		specs[sIdx] = {
			...specs[sIdx],
			[key]: val
		};
		updateCurrentForm('specs', specs);
	};

	// Option Tag Handlers
	const handleAddOptionToSpec = (sIdx) => {
		const text = (newOptionInputs[sIdx] || '').trim();
		if (!text) return;
		const specs = [...currentForm.specs];
		const options = Array.isArray(specs[sIdx].options) ? [...specs[sIdx].options] : [];
		options.push(text);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		setNewOptionInputs({ ...newOptionInputs, [sIdx]: '' });
		sound.play('button');
	};

	const handleRemoveOptionFromSpec = (sIdx, optIdx) => {
		const specs = [...currentForm.specs];
		const options = specs[sIdx].options.filter((_, i) => i !== optIdx);
		specs[sIdx] = { ...specs[sIdx], options };
		updateCurrentForm('specs', specs);
		sound.play('button');
	};

	// Suggestions
	const handleAddSuggestion = () => {
		if (!newSuggestionInput.trim()) return;
		const suggestions = Array.isArray(currentForm.title_suggestions) ? [...currentForm.title_suggestions] : [];
		suggestions.push(newSuggestionInput.trim());
		updateCurrentForm('title_suggestions', suggestions);
		setNewSuggestionInput('');
		sound.play('button');
	};

	const handleRemoveSuggestion = (sIdx) => {
		const suggestions = currentForm.title_suggestions.filter((_, i) => i !== sIdx);
		updateCurrentForm('title_suggestions', suggestions);
		sound.play('button');
	};

	// Save All Forms
	const handleSaveAll = () => {
		setIsSaving(true);
		settingsApi.update({
			intake_forms_schema: forms
		}).then(() => {
			setIsSaving(false);
			if (window.workpressSettings) {
				window.workpressSettings.intake_forms_schema = forms;
			}
			toast( __( 'All intake forms saved and published successfully', 'workpress' ), 'success' );
			sound.play('celebration');
		}).catch((err) => {
			setIsSaving(false);
			console.error(err);
			toast( __( 'An error occurred while saving forms.', 'workpress' ), 'danger' );
			sound.play('caution');
		});
	};

	return html`
		<div className="workpress-form-builder-page" style=${{ width: '100%' }}>
			<!-- Sticky FilterBar Toolbar -->
			<${IntakeFormsToolbar}
				forms=${forms}
				activeIdx=${activeIdx}
				setActiveIdx=${setActiveIdx}
				handleAddFormTemplate=${handleAddFormTemplate}
				setShowPreviewModal=${setShowPreviewModal}
				handleSaveAll=${handleSaveAll}
				isSaving=${isSaving}
			/>

			<!-- Visual 2-Column Canvas Builder -->
			<${FormCanvasBuilder}
				forms=${forms}
				activeIdx=${activeIdx}
				currentForm=${currentForm}
				FIELD_PRIMITIVES=${FIELD_PRIMITIVES}
				updateCurrentForm=${updateCurrentForm}
				handleAddPrimitive=${handleAddPrimitive}
				handleDeleteFormTemplate=${handleDeleteFormTemplate}
				handleMoveSpec=${handleMoveSpec}
				handleDeleteSpec=${handleDeleteSpec}
				handleUpdateSpec=${handleUpdateSpec}
				newOptionInputs=${newOptionInputs}
				setNewOptionInputs=${setNewOptionInputs}
				handleAddOptionToSpec=${handleAddOptionToSpec}
				handleRemoveOptionFromSpec=${handleRemoveOptionFromSpec}
				newSuggestionInput=${newSuggestionInput}
				setNewSuggestionInput=${setNewSuggestionInput}
				handleAddSuggestion=${handleAddSuggestion}
				handleRemoveSuggestion=${handleRemoveSuggestion}
				handleSaveAll=${handleSaveAll}
				isSaving=${isSaving}
			/>

			<!-- Live Client Portal Preview Modal -->
			<${FormSchemaPreview}
				show=${showPreviewModal}
				onClose=${() => setShowPreviewModal(false)}
				form=${currentForm}
			/>
		</div>
	`;
}
