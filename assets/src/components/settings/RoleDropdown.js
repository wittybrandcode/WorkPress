import { html, useState } from '../../utils/html.js';
import { CANONICAL_ROLE_LABELS } from '../../utils/userScope.js';

/**
 * Reusable Role Dropdown Selector
 */
export default function RoleDropdown({ currentRole, onRoleChange, roleLabels = CANONICAL_ROLE_LABELS }) {
	const [isOpen, setIsOpen] = useState(false);

	return html`
		<div className="wp-role-dropdown-container">
			<div 
				className="wp-role-dropdown-trigger"
				onClick=${() => setIsOpen(!isOpen)}
			>
				<span>${roleLabels[currentRole] || currentRole}</span>
				<span className="icon is-small">
					<i className="dashicons dashicons-arrow-down-alt2"></i>
				</span>
			</div>
			${isOpen ? html`
				<div className="wp-role-dropdown-menu">
					${Object.entries(roleLabels).map(([roleKey, roleLabel]) => html`
						<div
							key=${roleKey}
							className=${`wp-role-dropdown-item ${roleKey === currentRole ? 'is-active' : ''}`}
							onClick=${() => {
								onRoleChange(roleKey);
								setIsOpen(false);
							}}
						>
							${roleLabel}
						</div>
					`)}
				</div>
			` : null}
		</div>
	`;
}
