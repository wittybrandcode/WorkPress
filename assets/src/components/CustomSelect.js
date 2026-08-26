import { html, useState, useEffect, useRef } from '../utils/html.js';

export default function CustomSelect({ value, onChange, options, placeholder = 'اختر...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const [focusedIndex, setFocusedIndex] = useState(-1);

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
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        if (e.key === 'Escape') {
            setIsOpen(false);
            containerRef.current.querySelector('[role="combobox"]').focus();
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
                containerRef.current.querySelector('[role="combobox"]').focus();
            }
        }
    };

    const selectedOption = options.find(opt => opt.value === value);

    return html`
        <div ref=${containerRef} style=${{ width: '100%', position: 'relative', zIndex: isOpen ? 1100 : 'auto' }}>
            <div 
                role="combobox"
                aria-expanded=${isOpen}
                aria-haspopup="listbox"
                aria-label=${placeholder}
                tabIndex="0"
                onKeyDown=${handleKeyDown}
                onClick=${() => setIsOpen(!isOpen)}
                style=${{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: isOpen ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    userSelect: 'none',
                    borderRadius: 0,
                    boxSizing: 'border-box'
                }}
            >
                <span>${selectedOption ? selectedOption.label : placeholder}</span>
                <span className="icon is-small" style=${{ marginRight: '8px' }}>
                    <i className="dashicons dashicons-arrow-down-alt2" style=${{ fontSize: '14px', height: '14px', lineHeight: '14px', color: '#0f172a' }}></i>
                </span>
            </div>
            ${isOpen && html`
                <div 
                    role="listbox"
                    aria-label="الخيارات"
                    style=${{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        left: 0,
                        zIndex: 1200,
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        marginTop: '2px',
                        maxHeight: '200px',
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
                                padding: '8px 12px',
                                fontSize: '0.85rem',
                                color: '#0f172a',
                                fontWeight: opt.value === value ? 'bold' : '500',
                                backgroundColor: (opt.value === value || index === focusedIndex) ? '#f1f5f9' : '#ffffff',
                                cursor: 'pointer',
                                borderBottom: '1px solid #f8fafc',
                                transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter=${(e) => {
                                if (opt.value !== value) e.target.style.backgroundColor = '#f8fafc';
                            }}
                            onMouseLeave=${(e) => {
                                if (opt.value !== value) e.target.style.backgroundColor = '#ffffff';
                            }}
                        >
                            ${opt.label}
                        </div>
                    `)}
                </div>
            `}
        </div>
    `;
}
