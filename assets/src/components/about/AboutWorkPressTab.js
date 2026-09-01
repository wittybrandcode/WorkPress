import { html, useState, __, isRtl } from '../../utils/html.js';
import WorkPressLogo from '../ui/WorkPressLogo.js';
import { getSections } from './aboutData.js';
import PhilosophySection from './PhilosophySection.js';
import CitizenshipSection from './CitizenshipSection.js';
import CapabilitiesSection from './CapabilitiesSection.js';
import ServicesSection from './ServicesSection.js';

/**
 * AboutWorkPressTab Component
 * 
 * Master Architectural Encyclopedia & Institutional Guide for WorkPress.
 * Reads version dynamically from central configuration (SSOT).
 * 
 * @package WorkPress
 * @subpackage Components
 */
export default function AboutWorkPressTab() {
	const [activeSection, setActiveSection] = useState('all');
	const sections = getSections();
	const rtl = isRtl();

	// Dynamic Version Binding from Server Config (SSOT)
	const version = window.workpressSettings?.version || '2.2.1';

	return html`
		<div className="wp-about-page">
			
			<!-- Logo & Dynamic Version Showcase Banner -->
			<div className="wp-about-banner">
				<div className="is-flex is-justify-content-center is-align-items-center mb-3">
					<div style=${{ maxWidth: '520px', width: '100%', display: 'flex', justifyContent: 'center' }}>
						<${WorkPressLogo} height=${58} />
					</div>
				</div>

				<p className="is-size-6 has-text-grey mb-3 has-text-weight-semibold">
					${ __( 'Master Architectural Encyclopedia & Institutional Operating Guide for WorkPress', 'workpress' ) }
				</p>

				<div className="is-flex is-justify-content-center is-align-items-center" style=${{ gap: '10px', flexWrap: 'wrap' }}>
					<span className="tag wp-about-tag-version">
						WorkPress v${version} — Stable Release
					</span>
					<span className="tag wp-about-tag-engine">
						Zero-Table Native Engine
					</span>
					<span className="tag wp-about-tag-identity">
						Sovereign Memory
					</span>
				</div>
			</div>

			<!-- Dynamic Navigation Chips Bar -->
			<div className="wp-about-nav-menu">
				${sections.map(sec => html`
					<button
						key=${sec.id}
						className=${`button wp-about-nav-btn ${activeSection === sec.id ? 'is-active' : ''}`}
						onClick=${() => setActiveSection(sec.id)}
					>
						<span className="icon"><i className=${`dashicons ${sec.icon}`}></i></span>
						<span>${sec.label}</span>
					</button>
				`)}
			</div>

			<!-- Dynamic Content Panels -->
			<div className="wp-about-content">
				${(activeSection === 'all' || activeSection === 'philosophy') && html`<${PhilosophySection} version=${version} />`}
				${(activeSection === 'all' || activeSection === 'roles_spaces') && html`<${CitizenshipSection} />`}
				${(activeSection === 'all' || activeSection === 'capabilities') && html`<${CapabilitiesSection} />`}
				${(activeSection === 'all' || activeSection === 'services') && html`<${ServicesSection} />`}
			</div>

			<!-- Footer Meta -->
			<div className="wp-about-footer mt-5">
				<div className="is-flex is-align-items-center">
					<span className="icon is-small" style=${{ [rtl ? 'marginLeft' : 'marginRight']: '6px' }}><i className="dashicons dashicons-yes-alt has-text-success"></i></span>
					<span>${ __( 'Native WordPress Work & Institutional Memory Operating System', 'workpress' ) }</span>
				</div>
				<div>
					<strong className="has-text-dark">WorkPress Engine v${version} Stable — Production Certified</strong>
				</div>
			</div>

		</div>
	`;
}
