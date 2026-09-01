import htm from '../vendor/htm.module.js';
import { __, _x, _n, sprintf, isRtl, getLocale, getSupportedLanguages } from './i18n.js';

// Universal Element Provider: Supports window.wp.element (Admin React) and window.preact (Standalone Portal)
const elementProvider = window.wp?.element || window.preact || {};

const createElement = elementProvider.createElement || elementProvider.h || window.React?.createElement;
const useState = elementProvider.useState || window.React?.useState;
const useEffect = elementProvider.useEffect || window.React?.useEffect;
const useRef = elementProvider.useRef || window.React?.useRef;
const Fragment = elementProvider.Fragment || window.React?.Fragment;
const Component = elementProvider.Component || window.React?.Component || class {};
const createPortal = elementProvider.createPortal || window.ReactDOM?.createPortal;

// Bind htm to createElement
export const html = (htm && typeof htm.bind === 'function') 
    ? htm.bind(createElement) 
    : (window.htm && typeof window.htm.bind === 'function') 
        ? window.htm.bind(createElement) 
        : (strings, ...values) => strings[0];

// Export React / Preact hooks, Component, and i18n helpers for convenience
export { 
    createElement, 
    useState, 
    useEffect, 
    useRef, 
    Fragment, 
    Component, 
    createPortal,
    __,
    _x,
    _n,
    sprintf,
    isRtl,
    getLocale,
    getSupportedLanguages
};
