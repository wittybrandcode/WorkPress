const { render } = window.wp.element;
import { html } from './utils/html.js';
import App from './App.js?v=72';

document.addEventListener( 'DOMContentLoaded', () => {
	const container = document.getElementById( 'workpress-app' );
	if ( container ) {
		render( html`<${App} />`, container );
	}
} );
