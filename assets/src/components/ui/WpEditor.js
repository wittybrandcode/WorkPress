import { html, useEffect, useRef, useState } from '../../utils/html.js';

export default function WpEditor({ id, value, onChange, placeholder = '' }) {
    const [editorId] = useState(() => id || `wp-editor-${Math.random().toString(36).substr(2, 9)}`);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (!window.wp || !window.wp.editor) {
            console.error('WP Editor is not loaded');
            return;
        }

        const initEditor = () => {
            // Ensure clean state if previously initialized
            if (window.tinymce && window.tinymce.get(editorId)) {
                window.wp.editor.remove(editorId);
            }

            // Initialize WP Editor (TinyMCE)
            window.wp.editor.initialize(editorId, {
                tinymce: {
                    wpautop: true,
                    plugins: 'charmap colorpicker hr lists paste tabfocus textcolor fullscreen wordpress wpautoresize wpeditimage wpemoji wpgallery wplink wptextpattern image',
                    external_plugins: {
                        'table': 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/plugins/table/plugin.min.js',
                        'code': 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/plugins/code/plugin.min.js'
                    },
                    toolbar1: 'formatselect | bold italic strikethrough | bullist numlist | blockquote | alignleft aligncenter alignright alignjustify | link unlink | fullscreen',
                    toolbar2: 'forecolor backcolor | table | hr | outdent indent | undo redo | removeformat | code',
                    setup: function(editor) {
                        editor.on('change keyup', () => {
                            editor.save(); // Sync back to textarea
                            if (onChange) {
                                onChange(editor.getContent());
                            }
                        });
                    }
                },
                quicktags: true,
                mediaButtons: true,
            });
        };

        // Delay initialization to ensure DOM is fully ready
        const timerId = setTimeout(initEditor, 100);

        // Cleanup on unmount
        return () => {
            clearTimeout(timerId);
            if (window.wp && window.wp.editor) {
                window.wp.editor.remove(editorId);
            }
        };
    }, [editorId]);

    // Sync external value changes into TinyMCE
    useEffect(() => {
        if (window.tinymce) {
            const editor = window.tinymce.get(editorId);
            if (editor && editor.getContent() !== value) {
                editor.setContent(value || '');
            }
        }
    }, [value, editorId]);

    return html`
        <div className="field wp-editor-wrapper wp-editor-borderless" style=${{ minHeight: '200px' }}>
            <div className="control">
                <textarea 
                    id=${editorId}
                    ref=${textareaRef} 
                    defaultValue=${value} 
                    placeholder=${placeholder} 
                    style=${{ width: '100%', minHeight: '200px' }}
                ></textarea>
            </div>
        </div>
    `;
}
