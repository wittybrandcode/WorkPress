import { html } from '../../utils/html.js';

export default function AvatarStack( { users, max = 3 } ) {
	if ( ! users || users.length === 0 ) return null;

	const displayUsers = users.slice( 0, max );
	const overflow = users.length - max;

	return html`
		<div className="is-flex is-align-items-center" style=${{ gap: '-8px' }}>
			${ displayUsers.map( ( user, index ) => html`
				<figure 
					key=${ user.id || index } 
					className="image is-24x24 wp-card" 
					style=${{ 
						border: '2px solid white', 
						borderRadius: '0', 
						zIndex: max - index,
						marginLeft: '-8px',
						backgroundColor: '#ffffff'
					}}
					title=${ user.display_name || user.name }
				>
					<img src=${ user.avatar_url || user.avatar } alt="Avatar" style=${{ borderRadius: '0', objectFit: 'cover' }} />
				</figure>
			` ) }
			${ overflow > 0 && html`
				<div 
					className="wp-card is-flex is-justify-content-center is-align-items-center has-background-light has-text-weight-bold is-size-7" 
					style=${{ 
						width: '24px', 
						height: '24px', 
						marginLeft: '-8px', 
						zIndex: 0, 
						border: '2px solid white', 
						borderRadius: '0' 
					}}
				>
					+${ overflow }
				</div>
			` }
		</div>
	`;
}
