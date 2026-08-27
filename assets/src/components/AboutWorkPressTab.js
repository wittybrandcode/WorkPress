import { html, useState } from '../utils/html.js';
import WorkPressLogo from './WorkPressLogo.js';
import { SECTIONS } from './about/aboutData.js';
import PhilosophySection from './about/PhilosophySection.js';
import CitizenshipSection from './about/CitizenshipSection.js';
import CapabilitiesSection from './about/CapabilitiesSection.js';
import ServicesSection from './about/ServicesSection.js';

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
					الموسوعة الهندسية والمعمارية الشاملة لمنظومة إدارة وتوثيق العمل الأصلية في ووردبريس
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
				${SECTIONS.map(sec => html`
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
					<span className="icon is-small ml-1" style=${{ marginLeft: '6px' }}><i className="dashicons dashicons-yes-alt has-text-success"></i></span>
					<span>منظومة إدارة وتوثيق العمل والذاكرة المؤسسية الأصلية في ووردبريس</span>
				</div>
				<div>
					<strong className="has-text-dark">WorkPress Engine v${version} Stable — Production Certified</strong>
				</div>
			</div>

		</div>
	`;
}
