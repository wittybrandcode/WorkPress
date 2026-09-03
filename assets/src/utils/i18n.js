/**
 * WorkPress Core Admin Plaza Internationalization & Localization Engine
 *
 * Systematic & Reactive Client-Side i18n Architecture:
 * - English as Canonical Base Source String Standard (msgid)
 * - Bundled 1st-Class Arabic Translation Catalog with 100% Offline & Instant Availability
 * - Reactive Language Switcher with Instant DOM dir & Font State Management
 * - Full Compatibility with WordPress Backend & Rest APIs
 *
 * @package WorkPress
 * @subpackage Utils/i18n
 * @version 2.3.0
 */

import arCatalog from './translations/ar.js';
import frCatalog from './translations/fr.js';
import esCatalog from './translations/es.js';

// Reactive Listeners for Instant UI Updates
const listeners = new Set();

// Active Locale Resolution Strategy
const detectInitialLocale = () => {
    if (typeof window === 'undefined') return 'ar';
    
    const wpLocale = (window.workpressSettings?.wpLocale === 'en') ? 'en_US' : (window.workpressSettings?.wpLocale || 'en_US');
    const syncSetting = window.workpressSettings?.syncWpLocale;

    // 1. Check if sync with WordPress is explicitly enabled or default
    let isSync = true;
    try {
        const storedSync = localStorage.getItem('workpress_locale_sync');
        if (storedSync === 'false') {
            isSync = false;
        } else if (storedSync === 'true') {
            isSync = true;
        } else if (syncSetting !== undefined) {
            isSync = !!syncSetting;
        }
    } catch (e) {
        if (syncSetting !== undefined) isSync = !!syncSetting;
    }

    if (isSync) {
        return wpLocale;
    }

    // 2. If sync is off, check custom saved locale in localStorage
    try {
        const saved = localStorage.getItem('workpress_locale');
        if (saved && (saved === 'ar' || saved === 'en_US' || saved === 'en' || saved === 'fr_FR' || saved === 'es_ES')) {
            return (saved === 'en') ? 'en_US' : saved;
        }
    } catch (e) {}

    // 3. Cookie preference
    try {
        const match = document.cookie.match(/workpress_user_locale=([^;]+)/);
        if (match && match[1]) {
            return (match[1] === 'en') ? 'en_US' : match[1];
        }
    } catch (e) {}

    // 4. Settings passed from PHP
    if (window.workpressSettings?.locale) {
        return (window.workpressSettings.locale === 'en') ? 'en_US' : window.workpressSettings.locale;
    }

    return wpLocale || 'ar';
};

let currentLocale = detectInitialLocale();

// Apply direction and language strictly to WorkPress container element
const applyDOMDirectionAndFont = (locale) => {
    if (typeof document === 'undefined') return;
    const rtl = locale === 'ar' || locale.startsWith('ar');
    
    // Confine direction strictly to the WorkPress container, never mutate WordPress root document
    const appEl = document.getElementById('workpress-app');
    if (appEl) {
        appEl.dir = rtl ? 'rtl' : 'ltr';
        appEl.lang = locale.startsWith('ar') ? 'ar' : (locale.startsWith('fr') ? 'fr' : (locale.startsWith('es') ? 'es' : 'en'));
    }
};

applyDOMDirectionAndFont(currentLocale);

if (typeof document !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyDOMDirectionAndFont(currentLocale));
}

export const getLocale = () => currentLocale;

export const isRtl = () => {
    return currentLocale === 'ar' || currentLocale.startsWith('ar');
};

export const isSyncWithWp = () => {
    if (typeof window === 'undefined') return true;
    try {
        const stored = localStorage.getItem('workpress_locale_sync');
        if (stored === 'false') return false;
        if (stored === 'true') return true;
    } catch (e) {}
    return window.workpressSettings?.syncWpLocale !== false;
};

export const getWpLocale = () => {
    if (typeof window === 'undefined') return 'en_US';
    const wpLoc = window.workpressSettings?.wpLocale || 'en_US';
    return (wpLoc === 'en') ? 'en_US' : wpLoc;
};

export const setLocale = (newLocale, syncWp = null) => {
    if (!newLocale) return;

    const wpLocale = getWpLocale();
    const shouldSync = (newLocale === 'auto' || syncWp === true);

    if (shouldSync) {
        newLocale = wpLocale;
    } else if (newLocale === 'en') {
        newLocale = 'en_US';
    }

    currentLocale = newLocale;

    try {
        if (shouldSync) {
            localStorage.setItem('workpress_locale_sync', 'true');
            localStorage.removeItem('workpress_locale');
            document.cookie = 'workpress_user_locale=; path=/; max-age=0; SameSite=Lax';
            if (window.workpressSettings) {
                window.workpressSettings.syncWpLocale = true;
                window.workpressSettings.locale = newLocale;
            }
        } else {
            localStorage.setItem('workpress_locale_sync', 'false');
            localStorage.setItem('workpress_locale', newLocale);
            document.cookie = `workpress_user_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
            if (window.workpressSettings) {
                window.workpressSettings.syncWpLocale = false;
                window.workpressSettings.locale = newLocale;
            }
        }
    } catch (e) {}

    applyDOMDirectionAndFont(newLocale);

    // Notify all active React / Preact subscribers
    listeners.forEach((fn) => {
        try { fn(newLocale); } catch (err) { console.error('i18n listener error', err); }
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('workpress_locale_changed', { 
            detail: { locale: newLocale, isRtl: isRtl(), syncWp: shouldSync, wpLocale } 
        }));
    }
};

export const onLocaleChange = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

export const __ = (text, domain = 'workpress') => {
    if (!text) return '';
    
    // If English, return canonical msgid immediately
    if (currentLocale === 'en_US' || currentLocale === 'en') {
        return text;
    }

    // If Arabic, return translation from bundled catalog
    if (currentLocale === 'ar' || currentLocale.startsWith('ar')) {
        if (arCatalog && arCatalog[text]) {
            return arCatalog[text];
        }
    }

    // If French, return translation from bundled catalog
    if (currentLocale === 'fr_FR' || currentLocale.startsWith('fr')) {
        if (frCatalog && frCatalog[text]) {
            return frCatalog[text];
        }
    }

    // If Spanish, return translation from bundled catalog
    if (currentLocale === 'es_ES' || currentLocale.startsWith('es')) {
        if (esCatalog && esCatalog[text]) {
            return esCatalog[text];
        }
    }

    // Standard WordPress wp.i18n fallback if available
    if (typeof window !== 'undefined' && window.wp?.i18n?.__) {
        const translated = window.wp.i18n.__(text, domain);
        if (translated && translated !== text) {
            return translated;
        }
    }

    return text;
};

export const _x = (text, context, domain = 'workpress') => {
    return __(text, domain);
};

export const _n = (single, plural, number, domain = 'workpress') => {
    if (!single) return '';
    if (currentLocale === 'en_US' || currentLocale === 'en') {
        return number === 1 ? single : plural;
    }
    if (number === 1) {
        return __(single, domain);
    }
    const pluralTrans = __(plural, domain);
    return pluralTrans !== plural ? pluralTrans : __(single, domain);
};

export const sprintf = (format, ...args) => {
    if (!format) return '';
    let result = __(format);
    
    // First handle positional arguments: %1$s, %2$d, etc.
    result = result.replace(/%(\d+)\$[sdf]/g, (match, index) => {
        const idx = parseInt(index, 10) - 1;
        return args[idx] !== undefined ? args[idx] : '';
    });
    
    // Then handle sequential arguments: %s, %d, %f
    let i = 0;
    result = result.replace(/%[sdf]/g, () => {
        const val = args[i++];
        return val !== undefined ? val : '';
    });
    
    // Handle escaped percent %%
    result = result.replace(/%%/g, '%');
    
    return result;
};

export const getSupportedLanguages = () => {
    return [
        { code: 'ar',    short: 'ar', label: 'العربية (Arabic)', flag: '🇩🇿', dir: 'rtl' },
        { code: 'en_US', short: 'en', label: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
        { code: 'fr_FR', short: 'fr', label: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
        { code: 'es_ES', short: 'es', label: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' },
    ];
};
