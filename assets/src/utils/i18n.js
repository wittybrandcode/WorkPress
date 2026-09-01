/**
 * WorkPress Core Admin Plaza Internationalization (i18n) Helper
 *
 * Wraps @wordpress/i18n with safe fallbacks and runtime utilities.
 *
 * @package WorkPress
 * @subpackage Utils/i18n
 * @version 2.3.0
 */

// Initialize Locale Data if provided by server
const getLoadedLocaleData = () => {
    if (typeof window === 'undefined') return null;
    return window.workpressSettings?.localeData || null;
};

if (typeof window !== 'undefined' && window.wp?.i18n?.setLocaleData) {
    const data = getLoadedLocaleData();
    if (data) {
        try {
            const domainData = data.locale_data?.workpress || data;
            window.wp.i18n.setLocaleData(domainData, 'workpress');
        } catch (e) {
            // Safe fallback
        }
    }
}

export const __ = (text, domain = 'workpress') => {
    if (!text) return '';
    
    // 1. Try standard WordPress i18n
    if (typeof window !== 'undefined' && window.wp?.i18n?.__) {
        const translated = window.wp.i18n.__(text, domain);
        if (translated && translated !== text) {
            return translated;
        }
    }

    // 2. Direct fallback from embedded locale data
    const data = getLoadedLocaleData();
    if (data) {
        const domainData = data.locale_data?.workpress || data;
        if (domainData && domainData[text]) {
            const val = domainData[text];
            return Array.isArray(val) ? (val[0] || text) : val;
        }
    }

    return text;
};

export const _x = (text, context, domain = 'workpress') => {
    if (!text) return '';
    return __(text, domain);
};

export const _n = (single, plural, number, domain = 'workpress') => {
    if (!single) return '';
    if (window.wp?.i18n?._n) {
        return window.wp.i18n._n(single, plural, number, domain);
    }
    return number === 1 ? single : plural;
};

export const sprintf = (format, ...args) => {
    if (!format) return '';
    if (window.wp?.i18n?.sprintf) {
        return window.wp.i18n.sprintf(format, ...args);
    }
    return format.replace(/%[s|d|f]/g, (_, i = 0) => args[i++] || '');
};

export const getLocale = () => {
    if (typeof window !== 'undefined' && window.workpressSettings?.locale) {
        return window.workpressSettings.locale;
    }
    return 'en_US';
};

export const isRtl = () => {
    if (typeof window !== 'undefined' && typeof window.workpressSettings?.isRtl === 'boolean') {
        return window.workpressSettings.isRtl;
    }
    const loc = (typeof window !== 'undefined' && window.workpressSettings?.locale) || '';
    if (loc.startsWith('ar') || loc.startsWith('he') || loc.startsWith('fa') || loc.startsWith('ur')) {
        return true;
    }
    return typeof document !== 'undefined' ? document.dir === 'rtl' : false;
};

export const getSupportedLanguages = () => {
    return window.workpressSettings?.supportedLanguages || [
        { code: 'en_US', short: 'en', label: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
        { code: 'ar', short: 'ar', label: 'العربية (Arabic)', flag: '🇩🇿', dir: 'rtl' },
        { code: 'fr_FR', short: 'fr', label: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
        { code: 'es_ES', short: 'es', label: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' }
    ];
};
