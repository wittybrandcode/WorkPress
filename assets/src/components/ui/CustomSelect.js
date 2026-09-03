import { html, useState, useEffect, useRef, __, isRtl } from '../../utils/html.js';

/**
 * CustomSelect Component
 * 
 * Compact, accessible, width-controlled select dropdown for WorkPress toolbars & forms.
 */
export default function CustomSelect({
	value,
	onChange,
	options = [],
	placeholder = null,
	icon = null,
	width = null,
	style = {},
	className = '',
	disabled = false,
	dropdownAlign = 'auto' // 'auto' | 'start' | 'end'
}) {
	const defaultPlaceholder = placeholder || __( 'Select...', 'workpress' );
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const [effectiveAlign, setEffectiveAlign] = useState('start');

	useEffect(() => {
		if (isOpen && containerRef.current) {
			if (dropdownAlign === 'auto') {
				const rect = containerRef.current.getBoundingClientRect();
				const isRtlMode = isRtl();
				// If element is on the outer/end side of the screen, open inwards:
				const isEndSide = isRtlMode ? (rect.left < window.innerWidth / 2) : (rect.right > window.innerWidth / 2);
				setEffectiveAlign(isEndSide ? 'end' : 'start');
			} else {
				setEffectiveAlign(dropdownAlign);
			}
		}
	}, [isOpen, dropdownAlign]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleKeyDown = (e) => {
		if (disabled) return;
		if (!isOpen) {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
				e.preventDefault();
				setIsOpen(true);
			}
			return;
		}

		if (e.key === 'Escape') {
			setIsOpen(false);
			const btn = containerRef.current?.querySelector('[role="combobox"]');
			if (btn) btn.focus();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			setFocusedIndex(prev => (prev + 1) % options.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (focusedIndex >= 0 && focusedIndex < options.length) {
				onChange(options[focusedIndex].value);
				setIsOpen(false);
				const btn = containerRef.current?.querySelector('[role="combobox"]');
				if (btn) btn.focus();
			}
		}
	};

	const selectedOption = options.find(opt => String(opt.value) === String(value));

	return html`
		<div 
			ref=${containerRef} 
			className=${ `wp-custom-select-wrapper ${ className }` }
			style=${{ 
				width: width || 'auto',
				minWidth: width ? width : '130px',
				maxWidth: width ? width : '210px',
				position: 'relative', 
				zIndex: isOpen ? 1100 : 'auto',
				flexShrink: 0,
				...style 
			}}
		>
			<div 
				role="combobox"
				aria-expanded=${isOpen}
				aria-haspopup="listbox"
				aria-label=${defaultPlaceholder}
				tabIndex=${ disabled ? -1 : 0 }
				onKeyDown=${handleKeyDown}
				onClick=${() => !disabled && setIsOpen(!isOpen)}
				style=${{
					width: '100%',
					height: '32px',
					minHeight: '32px',
					padding: '0 8px',
					fontSize: '0.8rem',
					fontWeight: '600',
					color: selectedOption ? '#0f172a' : '#64748b',
					backgroundColor: disabled ? '#f8fafc' : '#ffffff',
					border: isOpen ? '1px solid #10b981' : '1px solid #cbd5e1',
					cursor: disabled ? 'not-allowed' : 'pointer',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					userSelect: 'none',
					borderRadius: 0,
					boxSizing: 'border-box',
					gap: '6px',
					transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
					boxShadow: isOpen ? '0 0 0 1px #10b981' : 'none'
				}}
			>
				${ icon && html`
					<span className="icon is-small" style=${{ color: '#64748b', marginInlineEnd: '2px', flexShrink: 0 }}>
						<i className=${ `dashicons ${ icon }` } style=${{ fontSize: '13px', width: '13px', height: '13px' }}></i>
					</span>
				` }
				<span style=${{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'start' }}>
					${selectedOption ? selectedOption.label : defaultPlaceholder}
				</span>
				<span className="icon is-small" style=${{ marginInlineStart: 'auto', flexShrink: 0 }}>
					<i className="dashicons dashicons-arrow-down-alt2" style=${{ fontSize: '12px', height: '12px', lineHeight: '12px', color: '#64748b' }}></i>
				</span>
			</div>
			${isOpen && html`
				<div 
					role="listbox"
					aria-label=${ __( 'Options', 'workpress' ) }
					style=${{
						position: 'absolute',
						top: 'calc(100% + 2px)',
						insetInlineStart: effectiveAlign === 'end' ? 'auto' : 0,
						insetInlineEnd: effectiveAlign === 'end' ? 0 : 'auto',
						minWidth: '100%',
						width: 'max-content',
						maxWidth: 'calc(100vw - 32px)',
						zIndex: 1200,
						backgroundColor: '#ffffff',
						border: '1px solid #cbd5e1',
						borderRadius: 0,
						boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
						maxHeight: '240px',
						overflowY: 'auto'
					}}
				>
					${options.map((opt, index) => html`
						<div
							key=${opt.value}
							role="option"
							aria-selected=${value === opt.value}
							tabIndex="-1"
							onClick=${() => {
								onChange(opt.value);
								setIsOpen(false);
							}}
							style=${{
								padding: '7px 10px',
								fontSize: '0.8rem',
								fontWeight: String(opt.value) === String(value) ? '700' : '500',
								backgroundColor: (String(opt.value) === String(value) || index === focusedIndex) ? '#f0fdfa' : '#ffffff',
								color: String(opt.value) === String(value) ? '#10b981' : '#0f172a',
								cursor: 'pointer',
								borderBottom: '1px solid #f8fafc',
								transition: 'background-color 0.15s ease',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								gap: '8px',
								whiteSpace: 'nowrap'
							}}
							onMouseEnter=${(e) => {
								if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = '#f8fafc';
							}}
							onMouseLeave=${(e) => {
								if (String(opt.value) !== String(value)) e.currentTarget.style.backgroundColor = '#ffffff';
							}}
						>
							<span>${opt.label}</span>
							${ String(opt.value) === String(value) && html`
								<i className="dashicons dashicons-yes" style=${{ color: '#10b981', fontSize: '14px', width: '14px', height: '14px' }}></i>
							` }
						</div>
					`)}
				</div>
			`}
		</div>
	`;
}
