import sound from './sound.js';

/**
 * WorkPress World-Class Central Actionable Decision & Toast Engine
 *
 * Full Compliance with WorkPress Constitution:
 * - 0px sharp geometry, zero emojis
 * - Strict 'Cairo' typography across all notifications
 * - Full-Container rich atmosphere color schemes (Color imposed on entire container)
 * - Bottom-Left docking (اسفل في الجهة المقابلة)
 * - Promise-based decisions (toast.decision / toast.confirm)
 * - Undoable actions with linear countdown progress bar (toast.action / toast.undo)
 * - Async promise tracking (toast.promise)
 * - Action links with Dashicons
 * - Smart stacked deck with expand-on-hover & Dismiss-All toolbar
 * - Sound engine integration
 */

let toastContainer = null;
let dismissAllBtn = null;
const activeToasts = new Set();

function ensureContainer() {
	if ( ! toastContainer || ! document.body.contains( toastContainer ) ) {
		toastContainer = document.createElement( 'div' );
		toastContainer.className = 'wp-toast-deck-container';
		toastContainer.setAttribute( 'dir', 'rtl' );
		document.body.appendChild( toastContainer );
	}
}

function updateDismissAllButton() {
	if ( ! toastContainer ) return;

	if ( activeToasts.size > 1 ) {
		if ( ! dismissAllBtn ) {
			dismissAllBtn = document.createElement( 'div' );
			dismissAllBtn.className = 'wp-toast-dismiss-all-wrapper';
			
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'wp-toast-dismiss-all-btn';
			btn.onclick = () => toast.clearAll();
			dismissAllBtn.appendChild( btn );
			
			if ( toastContainer.firstChild ) {
				toastContainer.insertBefore( dismissAllBtn, toastContainer.firstChild );
			} else {
				toastContainer.appendChild( dismissAllBtn );
			}
		}
		
		const innerBtn = dismissAllBtn.querySelector( 'button' );
		if ( innerBtn ) {
			innerBtn.innerHTML = `<i class="dashicons dashicons-no-alt"></i> <span>إغلاق الكل (${ activeToasts.size })</span>`;
		}
	} else if ( dismissAllBtn ) {
		if ( dismissAllBtn.parentNode ) {
			dismissAllBtn.parentNode.removeChild( dismissAllBtn );
		}
		dismissAllBtn = null;
	}
}

/**
 * Main Toast Dispatcher
 *
 * @param {string} message - Message text or HTML.
 * @param {string|object} typeOrOptions - Type string ('success'|'error'|'warning'|'info'|'decision') or options object.
 * @param {number|object} durationOrOptions - Duration in ms or options object.
 * @returns {object} Toast controller
 */
export function toast( message, typeOrOptions = 'info', durationOrOptions = 3500 ) {
	ensureContainer();

	let options = {};
	let type = 'info';
	let duration = 3500;

	if ( typeof typeOrOptions === 'object' && typeOrOptions !== null ) {
		options = typeOrOptions;
		type = options.type || 'info';
		duration = options.duration !== undefined ? options.duration : ( options.sticky ? 0 : 3500 );
	} else {
		type = typeOrOptions || 'info';
		if ( typeof durationOrOptions === 'object' && durationOrOptions !== null ) {
			options = durationOrOptions;
			duration = options.duration !== undefined ? options.duration : ( options.sticky ? 0 : 3500 );
		} else if ( typeof durationOrOptions === 'number' ) {
			duration = durationOrOptions;
		}
	}

	if ( type === 'danger' ) type = 'error';

	const toastEl = document.createElement( 'div' );
	toastEl.className = `wp-toast-card wp-toast-${ type }`;
	
	// Icon selection based on type
	let iconClass = 'dashicons-info';
	if ( type === 'success' ) iconClass = 'dashicons-yes-alt';
	else if ( type === 'error' ) iconClass = 'dashicons-dismiss';
	else if ( type === 'warning' ) iconClass = 'dashicons-warning';
	else if ( type === 'decision' ) iconClass = 'dashicons-lightbulb';

	if ( options.icon ) iconClass = options.icon;

	// 1. Icon Column
	const iconCol = document.createElement( 'div' );
	iconCol.className = 'wp-toast-icon-col';
	iconCol.innerHTML = `<i class="dashicons ${ iconClass }"></i>`;
	toastEl.appendChild( iconCol );

	// 2. Body Column
	const bodyCol = document.createElement( 'div' );
	bodyCol.className = 'wp-toast-body-col';

	if ( options.title ) {
		const titleEl = document.createElement( 'div' );
		titleEl.className = 'wp-toast-title';
		titleEl.innerHTML = options.title;
		bodyCol.appendChild( titleEl );
	}

	const msgEl = document.createElement( 'div' );
	msgEl.className = 'wp-toast-message';
	msgEl.innerHTML = message;
	bodyCol.appendChild( msgEl );

	// Action Link (if single action link provided)
	if ( options.action && ! Array.isArray( options.actions ) ) {
		const actionEl = document.createElement( 'a' );
		actionEl.className = 'wp-toast-action-btn';
		actionEl.href = options.action.url || '#';
		const actIcon = options.action.icon || 'dashicons-admin-links';
		actionEl.innerHTML = `<i class="dashicons ${ actIcon }"></i> <span>${ options.action.label || 'انتقال' }</span>`;
		
		actionEl.onclick = ( e ) => {
			if ( ! options.action.url || options.action.url === '#' ) e.preventDefault();
			if ( options.action.onClick ) options.action.onClick( e );
			if ( ! options.action.preventDismiss ) removeToast( toastEl );
		};
		bodyCol.appendChild( actionEl );
	}

	// Multiple Interactive Decision Buttons
	if ( Array.isArray( options.actions ) && options.actions.length > 0 ) {
		const actionsRow = document.createElement( 'div' );
		actionsRow.className = 'wp-toast-actions-row';

		options.actions.forEach( act => {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			const isPrimary = act.isPrimary !== false;
			const variantClass = act.variant ? `wp-toast-btn-${ act.variant }` : ( isPrimary ? 'wp-toast-btn-primary' : 'wp-toast-btn-secondary' );
			btn.className = `wp-toast-interactive-btn ${ variantClass }`;
			
			const btnIcon = act.icon ? `<i class="dashicons ${ act.icon }"></i> ` : '';
			btn.innerHTML = `${ btnIcon }<span>${ act.label }</span>`;

			btn.onclick = async ( e ) => {
				e.stopPropagation();
				sound.play( 'button' );
				if ( act.onClick ) {
					btn.classList.add( 'is-loading' );
					btn.disabled = true;
					try {
						await act.onClick( e );
					} catch ( err ) {
						console.error( 'Toast action error:', err );
					}
				}
				if ( ! act.preventDismiss ) {
					removeToast( toastEl );
				}
			};

			actionsRow.appendChild( btn );
		} );

		bodyCol.appendChild( actionsRow );
	}

	toastEl.appendChild( bodyCol );

	// 3. Close Button (×)
	if ( options.showClose !== false ) {
		const closeBtn = document.createElement( 'button' );
		closeBtn.type = 'button';
		closeBtn.className = 'wp-toast-close-btn';
		closeBtn.setAttribute( 'title', 'إغلاق الإشعار' );
		closeBtn.innerHTML = '<i class="dashicons dashicons-no-alt"></i>';
		closeBtn.onclick = ( e ) => {
			e.stopPropagation();
			if ( options.onClose ) options.onClose();
			removeToast( toastEl );
		};
		toastEl.appendChild( closeBtn );
	}

	// 4. Progress Countdown Bar (if duration > 0 and not sticky)
	let progressFill = null;
	if ( duration > 0 && ! options.sticky && options.showProgress !== false ) {
		const progressBar = document.createElement( 'div' );
		progressBar.className = 'wp-toast-progress-track';

		progressFill = document.createElement( 'div' );
		progressFill.className = 'wp-toast-progress-fill';
		progressFill.style.animationDuration = `${ duration }ms`;
		progressBar.appendChild( progressFill );

		toastEl.appendChild( progressBar );
	}

	// Append to container and register
	toastContainer.appendChild( toastEl );
	activeToasts.add( toastEl );
	updateDismissAllButton();

	// Auto dismiss timer with pause-on-hover
	let timerId = null;
	let remainingMs = duration;
	let startTime = Date.now();

	if ( duration > 0 && ! options.sticky ) {
		const startTimer = ( ms ) => {
			startTime = Date.now();
			remainingMs = ms;
			if ( progressFill ) progressFill.style.animationPlayState = 'running';
			timerId = setTimeout( () => {
				removeToast( toastEl );
			}, ms );
		};

		startTimer( duration );

		toastEl.onmouseenter = () => {
			if ( timerId ) {
				clearTimeout( timerId );
				timerId = null;
				remainingMs = Math.max( 500, remainingMs - ( Date.now() - startTime ) );
				if ( progressFill ) progressFill.style.animationPlayState = 'paused';
			}
		};

		toastEl.onmouseleave = () => {
			if ( ! timerId ) {
				startTimer( remainingMs );
			}
		};
	}

	return {
		element: toastEl,
		close: () => removeToast( toastEl ),
		update: ( newMsg, newType = null ) => {
			if ( newMsg ) msgEl.innerHTML = newMsg;
			if ( newType ) {
				toastEl.className = `wp-toast-card wp-toast-${ newType }`;
			}
		}
	};
}

function removeToast( toastEl ) {
	if ( ! toastEl || ! toastEl.parentNode ) return;
	
	toastEl.classList.add( 'wp-toast-exit' );
	activeToasts.delete( toastEl );
	updateDismissAllButton();

	setTimeout( () => {
		if ( toastEl.parentNode ) {
			toastEl.parentNode.removeChild( toastEl );
		}
		updateDismissAllButton();
	}, 250 );
}

// -------------------------------------------------------------
// Extended Central Decision & Action APIs
// -------------------------------------------------------------

toast.success = ( message, options = {} ) => toast( message, { ...options, type: 'success' } );
toast.error = ( message, options = {} ) => toast( message, { ...options, type: 'error', duration: options.duration || 5000 } );
toast.warning = ( message, options = {} ) => toast( message, { ...options, type: 'warning', duration: options.duration || 4500 } );
toast.info = ( message, options = {} ) => toast( message, { ...options, type: 'info' } );

/**
 * Interactive Decision Prompt (Promise-Based)
 *
 * @example
 * const decision = await toast.decision( 'مساهمة جديدة بانتظار الاعتماد', {
 *     actions: [
 *         { label: 'اعتماد فوري', value: 'approve', isPrimary: true },
 *         { label: 'طلب تعديل', value: 'revise', variant: 'secondary' }
 *     ]
 * } );
 */
toast.decision = ( message, options = {} ) => {
	return new Promise( ( resolve ) => {
		let isResolved = false;

		const userActions = options.actions || [
			{ label: 'تأكيد', value: true, isPrimary: true },
			{ label: 'إلغاء', value: false, variant: 'secondary' }
		];

		const wrappedActions = userActions.map( act => ( {
			...act,
			onClick: async ( e ) => {
				isResolved = true;
				if ( act.onClick ) await act.onClick( e );
				resolve( act.value !== undefined ? act.value : act.label );
			}
		} ) );

		toast( message, {
			type: 'decision',
			sticky: true,
			...options,
			actions: wrappedActions,
			onClose: () => {
				if ( ! isResolved ) resolve( null );
			}
		} );
	} );
};

/**
 * Quick Confirmation Prompt (Promise-Based Boolean)
 *
 * @example
 * if ( await toast.confirm( 'هل تريد بالتأكيد حذف هذه القائمة؟' ) ) { ... }
 */
toast.confirm = ( message, options = {} ) => {
	return toast.decision( message, {
		type: options.type || 'warning',
		title: options.title || 'تأكيد الإجراء',
		actions: [
			{ 
				label: options.confirmLabel || 'تأكيد الإجراء', 
				value: true, 
				isPrimary: true, 
				variant: options.isDanger ? 'danger' : 'primary',
				icon: options.isDanger ? 'dashicons-trash' : 'dashicons-yes'
			},
			{ 
				label: options.cancelLabel || 'إلغاء', 
				value: false, 
				variant: 'secondary' 
			}
		],
		...options
	} );
};

/**
 * Undoable Action Prompt with Countdown
 *
 * @example
 * toast.action( 'تم حذف المهمة بنجاح', {
 *     undoLabel: 'تراجع (Undo)',
 *     onUndo: async () => { ... }
 * } );
 */
toast.action = ( message, options = {} ) => {
	const actions = [];
	if ( options.onUndo ) {
		actions.push( {
			label: options.undoLabel || 'تراجع (Undo)',
			icon: 'dashicons-undo',
			isPrimary: true,
			variant: 'undo',
			onClick: async () => {
				await options.onUndo();
				toast.info( 'تم التراجع عن الإجراء بنجاح' );
			}
		} );
	}

	return toast( message, {
		type: options.type || 'success',
		duration: options.duration || 6000,
		actions: actions,
		...options
	} );
};

/**
 * Async Promise Tracker
 *
 * @example
 * await toast.promise( apiCall(), {
 *     loading: 'جارٍ التصدير...',
 *     success: 'تم التصدير بنجاح!',
 *     error: 'فشل التصدير'
 * } );
 */
toast.promise = async ( promiseInstance, messages = {}, options = {} ) => {
	const loadingToast = toast( messages.loading || 'جارٍ معالجة الطلب...', {
		type: 'info',
		sticky: true,
		showClose: false,
		icon: 'dashicons-update'
	} );

	try {
		const result = await promiseInstance;
		loadingToast.close();
		const successMsg = typeof messages.success === 'function' ? messages.success( result ) : ( messages.success || 'تمت العملية بنجاح!' );
		toast.success( successMsg, options );
		return result;
	} catch ( err ) {
		loadingToast.close();
		const errorMsg = typeof messages.error === 'function' ? messages.error( err ) : ( messages.error || err.message || 'حدث خطأ أثناء المعالجة' );
		toast.error( errorMsg, options );
		throw err;
	}
};

toast.clearAll = () => {
	const all = Array.from( activeToasts );
	all.forEach( el => removeToast( el ) );
};

export default toast;
