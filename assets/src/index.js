const { render } = window.wp.element;
import { html } from './utils/html.js';

// Automated runtime cache buster from WordPress settings
const appVersion = window.workpressSettings?.version || Date.now();

import( `./App.js?v=${ appVersion }` )
	.then( ( { default: App } ) => {
		const initApp = () => {
			const container = document.getElementById( 'workpress-app' );
			if ( container ) {
				render( html`<${App} />`, container );
			}
		};

		if ( document.readyState === 'loading' ) {
			document.addEventListener( 'DOMContentLoaded', initApp );
		} else {
			initApp();
		}
	} )
	.catch( ( err ) => {
		console.error( '[WorkPress] Critical error loading App.js:', err );
		const container = document.getElementById( 'workpress-app' );
		if ( container ) {
			container.innerHTML = '<div class="notice notice-error" style="padding:15px;margin:20px 0;"><p><strong>WorkPress Initialization Error:</strong> Failed to load application modules. Please refresh the page.</p></div>';
		}
	} );
