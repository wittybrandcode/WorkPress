const apiFetch = window.wp.apiFetch;

const fetchWithPagination = ( path ) => {
	return apiFetch( { path, parse: false } ).then( res => {
		const total = res.headers.get( 'X-WP-Total' );
		const totalPages = res.headers.get( 'X-WP-TotalPages' );
		return res.json().then( data => ( {
			items: data,
			total: total ? parseInt( total, 10 ) : 0,
			totalPages: totalPages ? parseInt( totalPages, 10 ) : 1,
		} ) );
	} );
};

export const usersApi = {
	list: ( filters = {} ) => {
		const params = { context: 'edit', per_page: 100, ...filters };
		const query = new URLSearchParams( params ).toString();
		return apiFetch( { path: `/wp/v2/users?${ query }` } );
	},
	updateRole: ( id, roles ) => apiFetch( { path: `/wp/v2/users/${ id }`, method: 'POST', data: { roles: Array.isArray( roles ) ? roles : [ roles ] } } ),
};

export const projectsApi = {
	list: ( filters = {} ) => {
		const withPagination = filters.withPagination;
		delete filters.withPagination;
		const query = new URLSearchParams( filters ).toString();
		if ( withPagination ) return fetchWithPagination( `/workpress/v1/projects${ query ? '?' + query : '' }` );
		return apiFetch( { path: `/workpress/v1/projects${ query ? '?' + query : '' }` } );
	},
	get: ( id ) => apiFetch( { path: `/workpress/v1/projects/${ id }` } ),
	create: ( data ) => apiFetch( { path: '/workpress/v1/projects', method: 'POST', data } ),
	update: ( id, data ) => apiFetch( { path: `/workpress/v1/projects/${ id }`, method: 'PUT', data } ),
	delete: ( id ) => apiFetch( { path: `/workpress/v1/projects/${ id }`, method: 'DELETE' } ),
	trashRequest: ( id, reason ) => apiFetch( { path: '/workpress/v1/trash/request', method: 'POST', data: { entity_type: 'project', entity_id: id, reason } } ),
	members: {
		list: ( pid ) => apiFetch( { path: `/workpress/v1/projects/${ pid }/members` } ),
		add: ( pid, data ) => apiFetch( { path: `/workpress/v1/projects/${ pid }/members`, method: 'POST', data } ),
		update: ( pid, uid, role ) => apiFetch( { path: `/workpress/v1/projects/${ pid }/members/${ uid }`, method: 'PUT', data: { role } } ),
		remove: ( pid, uid ) => apiFetch( { path: `/workpress/v1/projects/${ pid }/members/${ uid }`, method: 'DELETE' } ),
	},
};

export const tasksApi = {
	list: ( filters = {} ) => {
		const withPagination = filters.withPagination;
		delete filters.withPagination;
		const query = new URLSearchParams( filters ).toString();
		if ( withPagination ) return fetchWithPagination( `/workpress/v1/tasks?${ query }` );
		return apiFetch( { path: `/workpress/v1/tasks?${ query }` } );
	},
	get: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }` } ),
	create: ( data ) => apiFetch( { path: '/workpress/v1/tasks', method: 'POST', data } ),
	update: ( id, data ) => apiFetch( { path: `/workpress/v1/tasks/${ id }`, method: 'POST', data } ),
	delete: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }`, method: 'DELETE' } ),
	trashRequest: ( id, reason ) => apiFetch( { path: '/workpress/v1/trash/request', method: 'POST', data: { entity_type: 'task', entity_id: id, reason } } ),
	updateState: ( id, status ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/state`, method: 'PUT', data: { status } } ),
	close: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/close`, method: 'POST' } ),
	reopen: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/reopen`, method: 'POST' } ),
	checklists: {
		list: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/checklists` } ),
		add: ( id, title ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/checklists`, method: 'POST', data: { title } } ),
		toggle: ( id, itemId ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/checklists/${ itemId }`, method: 'PUT', data: { action: 'toggle' } } ),
		update: ( id, itemId, title ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/checklists/${ itemId }`, method: 'PUT', data: { action: 'update', title } } ),
		delete: ( id, itemId ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/checklists/${ itemId }`, method: 'DELETE' } ),
	},
	estimate: ( id, hours ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/estimate`, method: 'POST', data: { estimated_hours: hours } } ),
	worklogs: {
		list: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/worklogs` } ),
		add: ( id, data ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/worklogs`, method: 'POST', data } ),
		delete: ( id, logId ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/worklogs/${ logId }`, method: 'DELETE' } ),
	},
	attachments: {
		list: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/attachments` } ),
		add: ( id, attachmentId ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/attachments`, method: 'POST', data: { attachment_id: attachmentId } } ),
		delete: ( id, attId ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/attachments/${ attId }`, method: 'DELETE' } ),
	},
	assignment: {
		get: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/assignment` } ),
		update: ( id, assignees ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/assignment`, method: 'PUT', data: { assignees } } ),
	},
	contributions: {
		list: ( id ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/contributions` } ),
		create: ( id, data ) => apiFetch( { path: `/workpress/v1/tasks/${ id }/contributions`, method: 'POST', data } ),
	},
};

export const contributionsApi = {
	list: ( filters = {} ) => {
		const cleanFilters = {};
		Object.keys(filters).forEach(k => {
			if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
				cleanFilters[k] = filters[k];
			}
		});
		const query = new URLSearchParams( cleanFilters ).toString();
		return apiFetch( { path: `/workpress/v1/contributions?${ query }` } );
	},
	accept: ( id ) => apiFetch( { path: `/workpress/v1/contributions/${ id }/accept`, method: 'PUT' } ),
	revoke: ( id ) => apiFetch( { path: `/workpress/v1/contributions/${ id }/revoke`, method: 'PUT' } ),
	update: ( id, data ) => apiFetch( { path: `/workpress/v1/contributions/${ id }`, method: 'PUT', data } ),
	delete: ( id ) => apiFetch( { path: `/workpress/v1/contributions/${ id }`, method: 'DELETE' } ),
	trashRequest: ( id, reason ) => apiFetch( { path: '/workpress/v1/trash/request', method: 'POST', data: { entity_type: 'contribution', entity_id: id, reason } } ),
	types: {
		list: () => apiFetch( { path: '/workpress/v1/contributions/types' } ),
		update: ( types ) => apiFetch( { path: '/workpress/v1/contributions/types', method: 'POST', data: { types } } ),
		createCustom: ( data ) => apiFetch( { path: '/workpress/v1/contributions/types/custom', method: 'POST', data } ),
		deleteCustom: ( key ) => apiFetch( { path: `/workpress/v1/contributions/types/custom/${ key }`, method: 'DELETE' } ),
	},
	comments: {
		list: ( id ) => apiFetch( { path: `/workpress/v1/contributions/${ id }/comments` } ),
		create: ( id, data ) => apiFetch( { path: `/workpress/v1/contributions/${ id }/comments`, method: 'POST', data } ),
		delete: ( id, commentId ) => apiFetch( { path: `/workpress/v1/contributions/${ id }/comments/${ commentId }`, method: 'DELETE' } ),
	},
};

export const knowledgeApi = {
	list: ( filters = {} ) => {
		const query = new URLSearchParams( filters ).toString();
		return apiFetch( { path: `/workpress/v1/knowledge?${ query }` } );
	},
};

export const commentsApi = {
	list: ( filters = {} ) => {
		const query = new URLSearchParams( filters ).toString();
		return apiFetch( { path: `/wp/v2/comments?${ query }` } );
	},
};

export const rolesApi = {
	list: () => apiFetch( { path: '/workpress/v1/roles' } ),
	update: ( updates ) => apiFetch( { path: '/workpress/v1/roles', method: 'POST', data: { updates } } ),
	updateAliases: ( aliases ) => apiFetch( { path: '/workpress/v1/roles/aliases', method: 'PUT', data: { aliases } } ),
	createCustom: ( data ) => apiFetch( { path: '/workpress/v1/roles/custom', method: 'POST', data } ),
	deleteCustom: ( id ) => apiFetch( { path: `/workpress/v1/roles/custom/${ id }`, method: 'DELETE' } ),
};

export const settingsApi = {
	get: () => apiFetch( { path: '/workpress/v1/settings' } ),
	update: ( data ) => apiFetch( { path: '/workpress/v1/settings', method: 'POST', data } ),
	updateLocale: ( locale ) => apiFetch( { path: '/workpress/v1/user/locale', method: 'POST', data: { locale } } ),
};

export const devApi = {
	seed: () => apiFetch( { path: '/workpress/v1/dev/seed', method: 'POST' } ),
	purge: () => apiFetch( { path: '/workpress/v1/dev/purge', method: 'POST' } ),
};

export const exportApi = {
	getAll: () => apiFetch( { path: '/workpress/v1/export/all' } ),
};

export const reportsApi = {
	getProjectReport: ( id ) => apiFetch( { path: `/workpress/v1/projects/${ id }/report` } ),
	getKnowledgeBook: ( id ) => apiFetch( { path: `/workpress/v1/projects/${ id }/knowledge-book` } ),
	getWorkspaceAnalytics: () => apiFetch( { path: '/workpress/v1/analytics/overview' } ),
};

export const webhooksApi = {
	list: () => apiFetch( { path: '/workpress/v1/webhooks' } ),
	save: ( data ) => apiFetch( { path: '/workpress/v1/webhooks', method: 'POST', data } ),
	delete: ( id ) => apiFetch( { path: `/workpress/v1/webhooks/${ id }`, method: 'DELETE' } ),
	test: ( data ) => apiFetch( { path: '/workpress/v1/webhooks/test', method: 'POST', data } ),
};



