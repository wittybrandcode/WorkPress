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

// Reactive Listeners for Instant UI Updates
const listeners = new Set();

// Active Locale Resolution Strategy
const detectInitialLocale = () => {
    if (typeof window === 'undefined') return 'ar';
    
    // 1. LocalStorage has highest user priority
    try {
        const saved = localStorage.getItem('workpress_locale');
        if (saved && (saved === 'ar' || saved === 'en_US' || saved === 'en' || saved === 'fr_FR' || saved === 'es_ES')) {
            return (saved === 'en') ? 'en_US' : saved;
        }
    } catch (e) {}

    // 2. Cookie preference
    try {
        const match = document.cookie.match(/workpress_user_locale=([^;]+)/);
        if (match && match[1]) {
            return (match[1] === 'en') ? 'en_US' : match[1];
        }
    } catch (e) {}

    // 3. Settings passed from PHP
    if (window.workpressSettings?.locale) {
        return (window.workpressSettings.locale === 'en') ? 'en_US' : window.workpressSettings.locale;
    }

    return 'ar'; // Default institutional Arabic
};

let currentLocale = detectInitialLocale();

// Apply document direction and fonts immediately
const applyDOMDirectionAndFont = (locale) => {
    if (typeof document === 'undefined') return;
    const rtl = locale === 'ar' || locale.startsWith('ar');
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = locale.startsWith('ar') ? 'ar' : (locale.startsWith('fr') ? 'fr' : (locale.startsWith('es') ? 'es' : 'en'));
    if (document.body) {
        document.body.dir = rtl ? 'rtl' : 'ltr';
    }
};

applyDOMDirectionAndFont(currentLocale);

export const getLocale = () => currentLocale;

export const isRtl = () => {
    return currentLocale === 'ar' || currentLocale.startsWith('ar');
};

export const setLocale = (newLocale) => {
    if (!newLocale) return;
    if (newLocale === 'en') newLocale = 'en_US';
    if (newLocale === currentLocale) return;

    currentLocale = newLocale;
    try {
        localStorage.setItem('workpress_locale', newLocale);
        document.cookie = `workpress_user_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {}

    applyDOMDirectionAndFont(newLocale);

    // Notify all active React / Preact subscribers
    listeners.forEach((fn) => {
        try { fn(newLocale); } catch (err) { console.error('i18n listener error', err); }
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('workpress_locale_changed', { detail: { locale: newLocale, isRtl: isRtl() } }));
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
    return __(single, domain);
};

export const sprintf = (format, ...args) => {
    if (!format) return '';
    let result = __(format);
    let i = 0;
    return result.replace(/%[s|d|f]/g, () => (args[i++] !== undefined ? args[i - 1] : ''));
};

export const getSupportedLanguages = () => {
    return [
        { code: 'en_US', short: 'en', label: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
        { code: 'ar',    short: 'ar', label: 'العربية (Arabic)', flag: '🇩🇿', dir: 'rtl' },
        { code: 'fr_FR', short: 'fr', label: 'Français (French)', flag: '🇫🇷', dir: 'ltr' },
        { code: 'es_ES', short: 'es', label: 'Español (Spanish)', flag: '🇪🇸', dir: 'ltr' },
    ];
};
