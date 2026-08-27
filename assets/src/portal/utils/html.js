/**
 * WorkPress Portal HTML & Preact Bridge
 * 
 * Supports Preact UMD, Preact Hooks, WordPress Element, and React.
 * 
 * @package WorkPress
 * @subpackage Portal
 */

const preact = window.preact || {};
const hooks = window.preactHooks || window.preact?.hooks || window.preact || window.wp?.element || window.React || {};
const htm = window.htm || {};

export const h = preact.h || window.wp?.element?.createElement || window.React?.createElement;
export const render = preact.render || window.ReactDOM?.render;
export const Component = preact.Component || window.wp?.element?.Component || class {};

export const html = (htm && typeof htm.bind === 'function') 
    ? htm.bind(h) 
    : (window.htm && typeof window.htm.bind === 'function') 
        ? window.htm.bind(h) 
        : (strings, ...values) => strings[0];

export const useState = (...args) => (hooks.useState || window.wp?.element?.useState)(...args);
export const useEffect = (...args) => (hooks.useEffect || window.wp?.element?.useEffect)(...args);
export const useCallback = (...args) => (hooks.useCallback || window.wp?.element?.useCallback)(...args);
export const useMemo = (...args) => (hooks.useMemo || window.wp?.element?.useMemo)(...args);
export const useRef = (...args) => (hooks.useRef || window.wp?.element?.useRef)(...args);
