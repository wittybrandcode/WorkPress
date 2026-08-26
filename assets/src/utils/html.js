import htm from '../vendor/htm.module.js';

const { createElement, useState, useEffect, useRef, Fragment, Component, createPortal } = window.wp.element;

// Bind htm to wp.element.createElement
export const html = htm.bind(createElement);

// Export React hooks and Component for convenience
export { useState, useEffect, useRef, Fragment, Component, createPortal };
