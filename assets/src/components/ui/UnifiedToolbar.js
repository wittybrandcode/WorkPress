import { html, createPortal } from '../../utils/html.js';

/**
 * UnifiedToolbar Component
 *
 * Master architectural layout for all WorkPress contextual toolbars.
 * Renders into #wp-filterbar-portal-root with standard 44px height,
 * 0 1.5rem padding, and split two-section flex layout.
 *
 * @param {Object} props
 * @param {any} props.sectionStart - First section (Stats chips, domain switchers, metrics)
 * @param {any} props.sectionEnd - Second section (Search, custom selects, view switchers, actions)
 * @param {string} [props.className] - Optional extra class names
 * @param {Object} [props.style] - Optional inline style overrides
 * @param {any} [props.children] - Raw children if sections not used
 */
export default function UnifiedToolbar({
	sectionStart = null,
	sectionEnd = null,
	className = '',
	style = {},
	children = null
}) {
	const portalRoot = typeof document !== 'undefined' ? document.getElementById( 'wp-filterbar-portal-root' ) : null;

	const toolbarContent = html`
		<div className=${ `wp-unified-filter-toolbar ${ className }` } style=${ style }>
			${ children ? children : html`
				<!-- القسم الأول: المؤشرات والأرقام الإحصائية ومبدلات النطاق -->
				<div className="wp-toolbar-section wp-toolbar-start">
					${ sectionStart }
				</div>

				<!-- القسم الثاني: الفلترة والبحث والإجراءات التنفيذية -->
				<div className="wp-toolbar-section wp-toolbar-end">
					${ sectionEnd }
				</div>
			` }
		</div>
	`;

	if ( portalRoot ) {
		return createPortal( toolbarContent, portalRoot );
	}

	return toolbarContent;
}
