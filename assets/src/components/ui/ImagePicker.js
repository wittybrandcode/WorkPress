import { html, useState, useEffect } from '../../utils/html.js';

export default function ImagePicker({ value, onChange, placeholder = 'Ø§Ø®ØªØ± ØµÙˆØ±Ø© Ù…ØµØºØ±Ø©', compact = false }) {
    const [preview, setPreview] = useState(value || '');

    useEffect(() => {
        setPreview(value);
    }, [value]);

    const handleSelect = () => {
        if (!window.wp || !window.wp.media) {
            console.error('WP Media is not loaded');
            return;
        }

        const frame = window.wp.media({
            title: 'Ø§Ø®ØªØ± ØµÙˆØ±Ø©',
            button: {
                text: 'Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù‡Ø°Ù‡ Ø§Ù„ØµÙˆØ±Ø©'
            },
            multiple: false
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            setPreview(attachment.url);
            if (onChange) {
                onChange(attachment.id, attachment.url);
            }
        });

        frame.open();
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview('');
        if (onChange) {
            onChange(null, '');
        }
    };

    if ( compact ) {
        return html`
            <button 
                type="button"
                className="button wp-compact-image-btn"
                onClick=${handleSelect}
                title=${preview ? 'ØªØºÙŠÙŠØ± Ø§Ù„ØµÙˆØ±Ø© Ø§Ù„Ù…ØµØºØ±Ø©' : 'Ø¥Ø¶Ø§ÙØ© ØµÙˆØ±Ø© Ù…ØµØºØ±Ø©'}
            >
                ${preview ? html`
                    <img src=${preview} alt="Thumbnail" style=${{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div 
                        className="wp-remove-badge"
                        onClick=${handleRemove}
                        title="Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©"
                        style=${{
                            position: 'absolute',
                            top: '2px',
                            left: '2px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            width: '16px',
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Ã—
                    </div>
                ` : html`
                    <span className="icon" style=${{ margin: 0 }}>
                        <i className="dashicons dashicons-format-image"></i>
                    </span>
                `}
            </button>
        `;
    }

    return html`
        <div className="field">
            <label className="label">ØµÙˆØ±Ø© Ø§Ù„ØºÙ„Ø§Ù (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)</label>
            <div className="control">
                <div 
                    className="wp-image-picker-modern"
                    onClick=${handleSelect}
                >
                    ${preview ? html`
                        <img src=${preview} alt="Preview" />
                        <button 
                            className="button is-danger is-rounded" 
                            style=${{ position: 'absolute', top: '10px', right: '10px', width: '36px', height: '36px', padding: '0' }}
                            onClick=${handleRemove}
                            title="Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©"
                        >
                            <span className="icon"><i className="dashicons dashicons-trash"></i></span>
                        </button>
                    ` : html`
                        <div className="has-text-centered">
                            <span className="icon is-large has-text-grey mb-2">
                                <i className="dashicons dashicons-format-image" style=${{ fontSize: '2.5rem', width: '2.5rem', height: '2.5rem' }}></i>
                            </span>
                            <p className="has-text-weight-bold has-text-grey-dark mb-1">Ø±ÙØ¹ ØµÙˆØ±Ø© Ù„Ù„ØºÙ„Ø§Ù</p>
                            <p className="is-size-7 has-text-grey">Ø§Ø³Ø­Ø¨ Ø£Ùˆ Ø§Ù†Ù‚Ø± Ù„Ù„Ø§Ø®ØªÙŠØ§Ø±</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}
