import { html, Component, __ } from '../../utils/html.js';

/**
 * WorkPress UI Error Boundary.
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole SPA.
 */
export default class ErrorBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError( error ) {
		return { hasError: true, error };
	}

	componentDidCatch( error, errorInfo ) {
		console.error( '[WorkPress SPA ErrorBoundary]', error, errorInfo );
	}

	render() {
		if ( this.state.hasError ) {
			return html`
				<div className="box wp-card p-6 my-6 has-text-centered has-background-white wp-border">
					<span className="icon is-large has-text-danger mb-3">
						<i className="dashicons dashicons-warning" style=${{ fontSize: '48px', width: '48px', height: '48px' }}></i>
					</span>
					<h2 className="title is-4 has-text-danger mb-2">${ __( 'Sorry, an unexpected error occurred in the view', 'workpress' ) }</h2>
					<p className="subtitle is-6 has-text-grey mt-2 mb-4">
						${ this.state.error && this.state.error.message ? this.state.error.message : __( 'Failed to render component properly.', 'workpress' ) }
					</p>
					<div className="buttons is-centered">
						<button 
							className="button is-primary wp-sharp-button" 
							onClick=${ () => {
								this.setState( { hasError: false, error: null } );
								window.location.hash = '#/';
							} }
						>
							<span className="icon"><i className="dashicons dashicons-dashboard"></i></span>
							<span>${ __( 'Back to CoWorkPress Plaza', 'workpress' ) }</span>
						</button>
						<button 
							className="button is-white wp-border wp-sharp-button" 
							onClick=${ () => window.location.reload() }
						>
							<span className="icon"><i className="dashicons dashicons-update"></i></span>
							<span>${ __( 'Reload Page', 'workpress' ) }</span>
						</button>
					</div>
				</div>
			`;
		}

		return this.props.children;
	}
}
