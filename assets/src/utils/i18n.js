/**
 * WorkPress Core Admin Plaza Internationalization (i18n) Helper
 *
 * Wraps @wordpress/i18n with safe fallbacks and runtime utilities.
 *
 * @package WorkPress
 * @subpackage Utils/i18n
 * @version 2.3.0
 */

export const __ = (text, domain = 'workpress') => {
    if (!text) return '';
    return window.wp?.i18n?.__(text, domain) || text;
};

export const _x = (text, context, domain = 'workpress') => {
    if (!text) return '';
    return window.wp?.i18n?._x(text, context, domain) || text;
};

export const _n = (single, plural, number, domain = 'workpress') => {
    if (!single) return '';
    return window.wp?.i18n?._n(single, plural, number, domain) || (number === 1 ? single : plural);
};

export const sprintf = (format, ...args) => {
    if (!format) return '';
    return window.wp?.i18n?.sprintf(format, ...args) || format.replace(/%[s|d|f]/g, (_, i = 0) => args[i++] || '');
};

export const getLocale = () => {
    return window.workpressSettings?.locale || 'ar';
};

export const isRtl = () => {
    if (typeof window.workpressSettings?.isRtl === 'boolean') {
        return window.workpressSettings.isRtl;
    }
    return document.dir === 'rtl';
};

export const getSupportedLanguages = () => {
    return window.workpressSettings?.supportedLanguages || [
        { code: 'en_US', short: 'en', label: 'English', dir: 'ltr' },
        { code: 'ar', short: 'ar', label: 'العربية', dir: 'rtl' },
        { code: 'fr_FR', short: 'fr', label: 'Français', dir: 'ltr' },
        { code: 'es_ES', short: 'es', label: 'Español', dir: 'ltr' }
    ];
};
