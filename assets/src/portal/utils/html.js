/**
 * WorkPress Portal HTML & Preact Bridge
 * 
 * @package WorkPress
 * @subpackage Portal
 */

const preact = window.preact || {};
const htm = window.htm || {};

export const h = preact.h || window.React?.createElement;
export const render = preact.render || window.ReactDOM?.render;
export const Component = preact.Component || class {};

export const html = htm.bind ? htm.bind(h) : (strings, ...values) => strings[0];

export const useState = preact.useState || window.React?.useState;
export const useEffect = preact.useEffect || window.React?.useEffect;
export const useCallback = preact.useCallback || window.React?.useCallback;
export const useMemo = preact.useMemo || window.React?.useMemo;
export const useRef = preact.useRef || window.React?.useRef;
