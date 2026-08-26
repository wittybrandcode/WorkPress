/**
 * WorkPress Central Role Registry & User Scope Classifier
 * 
 * Single Source of Truth for:
 * 1. Unified Canonical Role Names ("مستفيد", "مشترك", "منفذ رئيسي", etc.)
 * 2. Visual Badge Tokens (Color, BG, Border)
 * 3. Boundary Isolation between Staff, Stakeholders, and Subscribers
 * 
 * @package WorkPress
 * @subpackage Assets/Utils
 */

export const PORTAL_STAKEHOLDER_ROLES = ['workpress_client', 'workpress_portal_user'];
export const STAFF_ROLES = ['administrator', 'editor', 'author', 'contributor', 'manager', 'member'];
export const SITE_SUBSCRIBER_ROLES = ['subscriber'];

/**
 * Canonical Role Definitions & Styling Map (Single Source of Truth)
 */
export const CANONICAL_ROLES = {
	administrator: {
		key: 'administrator',
		label: 'مدير عام',
		color: '#6d28d9',
		bg: '#f5f3ff',
		border: '#ddd6fe',
		isStaff: true,
		isStakeholder: false
	},
	editor: {
		key: 'editor',
		label: 'قائد مشروع',
		color: '#1d4ed8',
		bg: '#eff6ff',
		border: '#bfdbfe',
		isStaff: true,
		isStakeholder: false
	},
	manager: {
		key: 'manager',
		label: 'مدير مشروع',
		color: '#1d4ed8',
		bg: '#eff6ff',
		border: '#bfdbfe',
		isStaff: true,
		isStakeholder: false
	},
	author: {
		key: 'author',
		label: 'منفذ رئيسي',
		color: '#047857',
		bg: '#ecfdf5',
		border: '#a7f3d0',
		isStaff: true,
		isStakeholder: false
	},
	contributor: {
		key: 'contributor',
		label: 'مساهم فني',
		color: '#334155',
		bg: '#f8fafc',
		border: '#cbd5e1',
		isStaff: true,
		isStakeholder: false
	},
	member: {
		key: 'member',
		label: 'عضو فريق',
		color: '#334155',
		bg: '#f8fafc',
		border: '#cbd5e1',
		isStaff: true,
		isStakeholder: false
	},
	workpress_client: {
		key: 'workpress_client',
		label: 'مستفيد',
		color: '#b45309',
		bg: '#fffbeb',
		border: '#fde68a',
		isStaff: false,
		isStakeholder: true
	},
	workpress_portal_user: {
		key: 'workpress_portal_user',
		label: 'مستفيد',
		color: '#b45309',
		bg: '#fffbeb',
		border: '#fde68a',
		isStaff: false,
		isStakeholder: true
	},
	subscriber: {
		key: 'subscriber',
		label: 'مشترك',
		color: '#64748b',
		bg: '#f8fafc',
		border: '#e2e8f0',
		isStaff: false,
		isStakeholder: false
	}
};

/**
 * Standard Pure Role Labels Map for All Dropdowns
 */
export const CANONICAL_ROLE_LABELS = {
	'administrator': 'مدير عام',
	'editor': 'قائد مشروع',
	'author': 'منفذ رئيسي',
	'contributor': 'مساهم فني',
	'workpress_client': 'مستفيد',
	'subscriber': 'مشترك'
};

/**
 * Extracts normalized role key from any user object
 * 
 * @param {Object} user User object
 * @returns {string} Normalized role key
 */
export const getUserRoleKey = (user) => {
	if (!user) return 'subscriber';
	if (user.project_role) return user.project_role;
	if (user.role) return user.role;
	if (user.system_role) return user.system_role;
	if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles[0];
	if (user.capabilities && typeof user.capabilities === 'object') {
		const capKeys = Object.keys(user.capabilities);
		const found = ['administrator', 'editor', 'author', 'contributor', 'workpress_client', 'subscriber', 'manager', 'member'].find(k => capKeys.includes(k));
		if (found) return found;
	}
	return 'subscriber';
};

/**
 * Gets Canonical Label for a user or role key
 * 
 * @param {Object|string} userOrRole 
 * @returns {string} Pure canonical label (e.g. "مستفيد", "مشترك", "مدير عام")
 */
export const getUserRoleLabel = (userOrRole) => {
	const key = typeof userOrRole === 'string' ? userOrRole : getUserRoleKey(userOrRole);
	if (CANONICAL_ROLES[key]) return CANONICAL_ROLES[key].label;
	return key ? (key.charAt(0).toUpperCase() + key.slice(1)) : 'عضو فني';
};

/**
 * Gets Full Visual Badge Info for a user or role key
 * 
 * @param {Object|string} userOrRole 
 * @returns {Object} { label, color, bg, border }
 */
export const getUserRoleBadgeInfo = (userOrRole) => {
	const key = typeof userOrRole === 'string' ? userOrRole : getUserRoleKey(userOrRole);
	return CANONICAL_ROLES[key] || {
		label: getUserRoleLabel(key),
		color: '#475569',
		bg: '#f1f5f9',
		border: '#e2e8f0'
	};
};

/**
 * Checks if a user belongs to internal technical staff / executors.
 * 
 * @param {Object} user User object
 * @returns {boolean}
 */
export const isStaffUser = (user) => {
	if (!user) return false;
	const roles = Array.isArray(user.roles) 
		? user.roles 
		: (user.system_roles || [user.role || user.system_role || '']);
	
	const nonStaffRoles = [...PORTAL_STAKEHOLDER_ROLES, ...SITE_SUBSCRIBER_ROLES];
	return !roles.some(r => nonStaffRoles.includes(r));
};

/**
 * Checks if a user is an explicit portal stakeholder / requester.
 * 
 * @param {Object} user User object
 * @returns {boolean}
 */
export const isStakeholderUser = (user) => {
	if (!user) return false;
	const roles = Array.isArray(user.roles) 
		? user.roles 
		: (user.system_roles || [user.role || user.system_role || '']);
	
	return roles.some(r => PORTAL_STAKEHOLDER_ROLES.includes(r));
};

/**
 * Checks if a user is a standard WordPress site subscriber / reader.
 * 
 * @param {Object} user User object
 * @returns {boolean}
 */
export const isStandardSubscriber = (user) => {
	if (!user) return false;
	const roles = Array.isArray(user.roles) 
		? user.roles 
		: (user.system_roles || [user.role || user.system_role || '']);
	
	return roles.includes('subscriber') && !roles.some(r => PORTAL_STAKEHOLDER_ROLES.includes(r));
};
