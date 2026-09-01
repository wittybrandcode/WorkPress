import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';
import { getUserRoleBadgeInfo, getUserRoleLabel } from '../../utils/userScope.js';

/**
 * MemberSelect Component
 * 
 * High-end, searchable, avatar-rich dropdown component for selecting team members & specialists.
 * Replaces ugly native HTML <select> with modern SaaS visuals.
 * 
 * @param {Array} users List of user objects
 * @param {string|number} value Selected user ID
 * @param {Function} onChange Callback function (userId) => ...
 * @param {string} placeholder Placeholder text
 * @param {boolean} disabled Whether disabled
 * @param {boolean} allowClear Whether to allow clearing the selection
 * @param {string} size Size variant: 'small' | 'normal'
 */
export default function MemberSelect({
	users = [],
	value = '',
	onChange = () => {},
	placeholder = null,
	disabled = false,
	allowClear = true,
	size = 'normal'
}) {
	const defaultPlaceholder = placeholder || __( 'Select a team member...', 'workpress' );
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const containerRef = useRef(null);
	const searchInputRef = useRef(null);
	const rtl = isRtl();

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		if (isOpen && searchInputRef.current) {
			setTimeout(() => {
				searchInputRef.current.focus();
			}, 50);
		} else {
			setSearchQuery('');
		}
	}, [isOpen]);

	// Extract avatar URL
	const getAvatarUrl = (user) => {
		if (!user) return '';
		if (user.avatar) return user.avatar;
		if (user.avatar_url) return user.avatar_url;
		if (user.avatar_urls) {
			return user.avatar_urls['48'] || user.avatar_urls['96'] || user.avatar_urls['24'] || '';
		}
		return '';
	};

	// Format role label & color theme
	const getRoleInfo = (user) => {
		if (!user) return { label: __( 'Member', 'workpress' ), bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

		// Explicit role label if provided
		if (user.role_label) {
			return { label: user.role_label, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
		}

		return getUserRoleBadgeInfo(user);
	};

	const getRoleLabel = (user) => {
		if (user && user.role_label) return user.role_label;
		return getUserRoleLabel(user);
	};

	// Safe name extractor
	const getUserName = (user) => {
		if (!user) return '';
		return user.display_name || user.name || user.user_login || __( 'User', 'workpress' );
	};

	// Fallback initials avatar
	const renderAvatar = (user, avatarSize = 26) => {
		const url = getAvatarUrl(user);
		const name = getUserName(user);
		const initial = name.charAt(0).toUpperCase() || '?';

		if (url) {
			return html`
				<img 
					src=${url} 
					alt=${name} 
					style=${{
						width: `${avatarSize}px`,
						height: `${avatarSize}px`,
						borderRadius: '50%',
						objectFit: 'cover',
						border: '1px solid rgba(0,0,0,0.08)',
						flexShrink: 0
					}} 
				/>
			`;
		}

		return html`
			<div 
				style=${{
					width: `${avatarSize}px`,
					height: `${avatarSize}px`,
					borderRadius: '50%',
					backgroundColor: '#6366f1',
					color: '#ffffff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontWeight: '800',
					fontSize: `${Math.max(10, avatarSize * 0.42)}px`,
					flexShrink: 0,
					userSelect: 'none'
				}}
			>
				${initial}
			</div>
		`;
	};

	// Find current selected user
	const selectedUser = users.find(u => String(u.id) === String(value));

	// Filter users by search
	const filteredUsers = users.filter(u => {
		if (!searchQuery.trim()) return true;
		const query = searchQuery.toLowerCase().trim();
		const name = getUserName(u).toLowerCase();
		const email = (u.email || '').toLowerCase();
		const role = getRoleLabel(u).toLowerCase();
		return name.includes(query) || email.includes(query) || role.includes(query);
	});

	const handleSelect = (u) => {
		onChange(u.id);
		setIsOpen(false);
	};

	const handleClear = (e) => {
		e.stopPropagation();
		onChange('');
		setIsOpen(false);
	};

	const isSmall = size === 'small';

	return html`
		<div 
			ref=${containerRef} 
			className="member-select-container"
			style=${{ 
				position: 'relative', 
				width: '100%', 
				userSelect: 'none',
				fontFamily: 'inherit'
			}}
		>
			<!-- Trigger Button -->
			<div 
				role="button"
				tabIndex="0"
				onClick=${() => !disabled && setIsOpen(!isOpen)}
				style=${{
					width: '100%',
					minHeight: isSmall ? '32px' : '38px',
					padding: isSmall ? '3px 8px' : '4px 10px',
					backgroundColor: disabled ? '#f8fafc' : '#ffffff',
					border: isOpen ? '1.5px solid #6366f1' : '1px solid #cbd5e1',
					borderRadius: '6px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '8px',
					cursor: disabled ? 'not-allowed' : 'pointer',
					boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.12)' : 'none',
					transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
				}}
			>
				<div style=${{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
					${selectedUser ? (() => {
						const roleInfo = getRoleInfo(selectedUser);
						return html`
							${renderAvatar(selectedUser, isSmall ? 22 : 26)}
							<span 
								style=${{ 
									fontWeight: '700', 
									fontSize: isSmall ? '0.78rem' : '0.86rem', 
									color: '#0f172a',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis'
								}}
							>
								${getUserName(selectedUser)}
							</span>
							<span 
								style=${{
									fontSize: '0.68rem',
									backgroundColor: roleInfo.bg,
									color: roleInfo.color,
									padding: '1px 7px',
									borderRadius: '4px',
									border: `1px solid ${roleInfo.border}`,
									fontWeight: '700',
									whiteSpace: 'nowrap'
								}}
							>
								${roleInfo.label}
							</span>
						`;
					})() : html`
						<span className="icon is-small" style=${{ color: '#94a3b8' }}>
							<i className="dashicons dashicons-admin-users" style=${{ fontSize: '16px', width: '16px', height: '16px' }}></i>
						</span>
						<span style=${{ color: '#94a3b8', fontSize: isSmall ? '0.78rem' : '0.85rem' }}>
							${defaultPlaceholder}
						</span>
					`}
				</div>

				<div style=${{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
					${selectedUser && allowClear && !disabled && html`
						<button 
							type="button"
							onClick=${handleClear}
							title=${ __( 'Clear selection', 'workpress' ) }
							style=${{
								background: 'none',
								border: 'none',
								padding: '2px',
								cursor: 'pointer',
								color: '#94a3b8',
								display: 'flex',
								alignItems: 'center',
								borderRadius: '50%'
							}}
						>
							<i className="dashicons dashicons-no-alt" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
						</button>
					`}
					<span className="icon is-small" style=${{ color: '#64748b' }}>
						<i 
							className=${`dashicons ${isOpen ? 'dashicons-arrow-up-alt2' : 'dashicons-arrow-down-alt2'}`} 
							style=${{ fontSize: '14px', width: '14px', height: '14px', lineHeight: '14px' }}
						></i>
					</span>
				</div>
			</div>

			<!-- Dropdown Menu Popover -->
			${isOpen && html`
				<div 
					style=${{
						position: 'absolute',
						top: 'calc(100% + 4px)',
						right: 0,
						left: 0,
						zIndex: 1500,
						backgroundColor: '#ffffff',
						border: '1px solid #cbd5e1',
						borderRadius: '8px',
						boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12), 0 4px 10px rgba(15, 23, 42, 0.04)',
						overflow: 'hidden',
						animation: 'wpFadeIn 0.15s ease'
					}}
				>
					<!-- Search Field -->
					<div style=${{ padding: '8px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
						<div style=${{ position: 'relative', display: 'flex', alignItems: 'center' }}>
							<span className="icon is-small" style=${{ position: 'absolute', [rtl ? 'right' : 'left']: '8px', color: '#94a3b8' }}>
								<i className="dashicons dashicons-search" style=${{ fontSize: '14px', width: '14px', height: '14px' }}></i>
							</span>
							<input 
								ref=${searchInputRef}
								type="text"
								value=${searchQuery}
								onInput=${e => setSearchQuery(e.target.value)}
								placeholder=${ __( 'Search by name, role or email...', 'workpress' ) }
								style=${{
									width: '100%',
									height: '30px',
									padding: rtl ? '0 28px 0 8px' : '0 8px 0 28px',
									fontSize: '0.8rem',
									border: '1px solid #cbd5e1',
									borderRadius: '4px',
									outline: 'none',
									backgroundColor: '#ffffff'
								}}
							/>
						</div>
					</div>

					<!-- List of Members -->
					<div style=${{ maxHeight: '220px', overflowY: 'auto', padding: '4px' }}>
						${filteredUsers.length === 0 ? html`
							<div style=${{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
								<span className="icon"><i className="dashicons dashicons-warning"></i></span>
								<p className="mt-1">${ __( 'No members match search query', 'workpress' ) }</p>
							</div>
						` : filteredUsers.map(u => {
							const isSelected = String(u.id) === String(value);
							const roleInfo = getRoleInfo(u);

							return html`
								<div 
									key=${u.id}
									onClick=${() => handleSelect(u)}
									style=${{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
										padding: '6px 10px',
										borderRadius: '6px',
										cursor: 'pointer',
										backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
										transition: 'background-color 0.1s ease',
										marginBottom: '2px'
									}}
									onMouseEnter=${e => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
									onMouseLeave=${e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
								>
									<div style=${{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
										${renderAvatar(u, 28)}
										<div style=${{ display: 'flex', flexDirection: 'column', textAlign: rtl ? 'right' : 'left', overflow: 'hidden' }}>
											<div style=${{ display: 'flex', alignItems: 'center', gap: '6px' }}>
												<span style=${{ fontWeight: '700', fontSize: '0.84rem', color: '#0f172a' }}>
													${getUserName(u)}
												</span>
												<span 
													style=${{
														fontSize: '0.66rem',
														backgroundColor: roleInfo.bg,
														color: roleInfo.color,
														border: `1px solid ${roleInfo.border}`,
														padding: '1px 6px',
														borderRadius: '4px',
														fontWeight: '700'
													}}
												>
													${roleInfo.label}
												</span>
											</div>
											${u.email && html`
												<span style=${{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
													${u.email}
												</span>
											`}
										</div>
									</div>

									${isSelected && html`
										<span className="icon is-small" style=${{ color: '#6366f1' }}>
											<i className="dashicons dashicons-yes" style=${{ fontSize: '18px', width: '18px', height: '18px' }}></i>
										</span>
									`}
								</div>
							`;
						})}
					</div>
				</div>
			`}
		</div>
	`;
}
