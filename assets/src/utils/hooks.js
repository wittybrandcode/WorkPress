/**
 * Frontend Hooks Engine for WorkPress
 * Full PubSub implementation mimicking WordPress' addFilter/applyFilters & addAction/doAction.
 */

class Hooks {
	constructor() {
		this.filters = {};
		this.actions = {};
	}

	addFilter(hookName, namespace, callback, priority = 10) {
		if (!this.filters[hookName]) {
			this.filters[hookName] = [];
		}
		this.filters[hookName].push({ namespace, callback, priority });
		this.filters[hookName].sort((a, b) => a.priority - b.priority);
	}

	applyFilters(hookName, value, ...args) {
		if (!this.filters[hookName]) {
			return value;
		}
		let result = value;
		for (const filter of this.filters[hookName]) {
			result = filter.callback(result, ...args);
		}
		return result;
	}

	removeFilter(hookName, namespace) {
		if (this.filters[hookName]) {
			this.filters[hookName] = this.filters[hookName].filter(f => f.namespace !== namespace);
		}
	}

	addAction(hookName, namespace, callback, priority = 10) {
		if (!this.actions[hookName]) {
			this.actions[hookName] = [];
		}
		this.actions[hookName].push({ namespace, callback, priority });
		this.actions[hookName].sort((a, b) => a.priority - b.priority);
	}

	doAction(hookName, ...args) {
		if (!this.actions[hookName]) {
			return;
		}
		for (const action of this.actions[hookName]) {
			action.callback(...args);
		}
	}

	removeAction(hookName, namespace) {
		if (this.actions[hookName]) {
			this.actions[hookName] = this.actions[hookName].filter(a => a.namespace !== namespace);
		}
	}

	hasFilter(hookName) {
		return !!(this.filters[hookName] && this.filters[hookName].length);
	}

	hasAction(hookName) {
		return !!(this.actions[hookName] && this.actions[hookName].length);
	}
}

// Initialize globally
window.wp = window.wp || {};
window.wp.workpress = window.wp.workpress || {};
if (!window.wp.workpress.hooks) {
	window.wp.workpress.hooks = new Hooks();
}

export const hooks = window.wp.workpress.hooks;
