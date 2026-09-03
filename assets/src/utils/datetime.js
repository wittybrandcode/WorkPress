/**
 * WorkPress Central DateTime & Localization Engine
 *
 * Implements standard Western Arabic numerals (1, 2, 3...)
 * and Maghrebi month naming conventions with WordPress timezone support.
 */

export const MONTH_NAMES = {
	maghrebi: [
		'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
		'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
	],
	mashriqi: [
		'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
		'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
	],
	syriac: [
		'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
		'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
	],
	en: [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	],
	fr: [
		'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
		'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
	],
	es: [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
		'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	],
};

export const DAY_NAMES_LOCALIZED = {
	ar: [
		'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
	],
	en: [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
	],
	fr: [
		'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
	],
	es: [
		'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
	],
};

export const DAY_NAMES = new Proxy( DAY_NAMES_LOCALIZED.ar, {
	get( target, prop ) {
		const settings = getRuntimeSettings();
		const list = DAY_NAMES_LOCALIZED[ settings.lang ] || DAY_NAMES_LOCALIZED.ar;
		if ( prop === 'length' ) return list.length;
		if ( typeof list[ prop ] === 'function' ) {
			return list[ prop ].bind( list );
		}
		if ( prop in list ) {
			return list[ prop ];
		}
		return target[ prop ];
	}
} );

/**
 * Get current active runtime settings
 */
export function getRuntimeSettings() {
	const wpSettings = window.workpressSettings || {};
	const rawLocale = wpSettings.userLocale || wpSettings.locale || 'ar';
	const lang = String( rawLocale ).split( '_' )[ 0 ].toLowerCase();
	return {
		timezone: wpSettings.timezone || 'Africa/Algiers',
		monthNaming: wpSettings.monthNaming || 'maghrebi',
		dateFormat: wpSettings.dateFormat || 'D MMMM YYYY',
		relativeTime: wpSettings.relativeTime !== undefined ? wpSettings.relativeTime : true,
		gmtOffset: wpSettings.gmtOffset !== undefined ? parseFloat( wpSettings.gmtOffset ) : 1,
		lang: lang || 'ar',
	};
}

/**
 * Convert any date input into a clean JS Date object
 */
export function parseDate( dateInput ) {
	if ( ! dateInput ) return null;
	if ( dateInput instanceof Date ) return isNaN( dateInput.getTime() ) ? null : dateInput;
	
	let cleanStr = String( dateInput ).trim();
	if ( /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test( cleanStr ) ) {
		cleanStr = cleanStr.replace( ' ', 'T' );
	} else if ( /^\d{4}-\d{2}-\d{2}$/.test( cleanStr ) ) {
		cleanStr = cleanStr + 'T00:00:00';
	}
	
	const d = new Date( cleanStr );
	return isNaN( d.getTime() ) ? null : d;
}

/**
 * Format a number using standard Western Arabic numerals (1, 2, 3...)
 */
export function formatNumber( num ) {
	if ( num === null || num === undefined || isNaN( Number( num ) ) ) return '0';
	return new Intl.NumberFormat( 'en-US' ).format( Number( num ) );
}

/**
 * Format percentage
 */
export function formatPercent( rate ) {
	const val = Math.round( Number( rate ) || 0 );
	return `${ formatNumber( val ) }%`;
}

/**
 * Get localized month name
 */
export function getMonthName( monthIndex, namingStyle = null ) {
	const settings = getRuntimeSettings();
	const lang = settings.lang;
	if ( lang === 'en' || lang === 'fr' || lang === 'es' ) {
		const months = MONTH_NAMES[ lang ] || MONTH_NAMES.en;
		return months[ monthIndex ] || '';
	}
	const style = namingStyle || settings.monthNaming;
	const months = MONTH_NAMES[ style ] || MONTH_NAMES.maghrebi;
	return months[ monthIndex ] || '';
}

/**
 * Format date as "18 أوت 2026"
 */
export function formatDate( dateInput, options = {} ) {
	const date = parseDate( dateInput );
	if ( ! date ) return '';

	const day = date.getDate();
	const month = getMonthName( date.getMonth(), options.monthNaming );
	const year = date.getFullYear();

	if ( options.short ) {
		const m = String( date.getMonth() + 1 ).padStart( 2, '0' );
		const d = String( day ).padStart( 2, '0' );
		return `${ d }/${ m }/${ year }`;
	}

	if ( options.hideYear ) {
		return `${ day } ${ month }`;
	}

	return `${ day } ${ month } ${ year }`;
}

/**
 * Format time as "16:30"
 */
export function formatTime( dateInput ) {
	const date = parseDate( dateInput );
	if ( ! date ) return '';

	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	return `${ hours }:${ minutes }`;
}

/**
 * Format full date & time as "18 أوت 2026، 16:30"
 */
export function formatDateTime( dateInput, options = {} ) {
	const date = parseDate( dateInput );
	if ( ! date ) return '';

	const formattedDate = formatDate( date, options );
	const formattedTime = formatTime( date );
	return `${ formattedDate }، ${ formattedTime }`;
}

/**
 * Break down date & time into discrete visual segments:
 * { day, month, year, time, isValid }
 * Implements standard: أيقونة | اليوم | الشهر | السنة | الساعة
 *
 * @param {any} dateInput
 * @param {Object} [options]
 * @return {{ day: string, month: string, year: string, time: string, isValid: boolean }}
 */
export function formatDateTimeSegments( dateInput, options = {} ) {
	const date = parseDate( dateInput );
	if ( ! date ) {
		return {
			day: '—',
			month: '—',
			year: '—',
			time: '—',
			isValid: false
		};
	}

	const day = String( date.getDate() ).padStart( 2, '0' );
	const month = getMonthName( date.getMonth(), options.monthNaming );
	const year = String( date.getFullYear() );
	const hours = String( date.getHours() ).padStart( 2, '0' );
	const minutes = String( date.getMinutes() ).padStart( 2, '0' );
	const time = `${ hours }:${ minutes }`;

	return {
		day,
		month,
		year,
		time,
		isValid: true
	};
}

/**
 * Smart Relative Time Formatter ("الآن", "منذ 5 دقائق", "منذ ساعتين", "أمس في 16:30"...)
 */
export function formatRelativeTime( dateInput, options = {} ) {
	const date = parseDate( dateInput );
	if ( ! date ) return '';

	const settings = getRuntimeSettings();
	if ( options.forceAbsolute || settings.relativeTime === false ) {
		return formatDateTime( date, options );
	}

	const now = new Date();
	const diffInSeconds = Math.floor( ( now - date ) / 1000 );

	// If in the future or within 30 seconds
	if ( diffInSeconds < 30 && diffInSeconds >= -30 ) {
		return 'الآن';
	}

	// Within 1 hour
	if ( diffInSeconds >= 30 && diffInSeconds < 3600 ) {
		const minutes = Math.floor( diffInSeconds / 60 );
		if ( minutes <= 1 ) return 'منذ دقيقة';
		if ( minutes === 2 ) return 'منذ دقيقتين';
		if ( minutes >= 3 && minutes <= 10 ) return `منذ ${ minutes } دقائق`;
		return `منذ ${ minutes } دقيقة`;
	}

	// Within 24 hours
	if ( diffInSeconds >= 3600 && diffInSeconds < 86400 ) {
		const hours = Math.floor( diffInSeconds / 3600 );
		if ( hours === 1 ) return 'منذ ساعة';
		if ( hours === 2 ) return 'منذ ساعتين';
		if ( hours >= 3 && hours <= 10 ) return `منذ ${ hours } ساعات`;
		return `منذ ${ hours } ساعة`;
	}

	// Yesterday
	const yesterday = new Date( now );
	yesterday.setDate( now.getDate() - 1 );
	if ( date.getDate() === yesterday.getDate() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getFullYear() === yesterday.getFullYear() ) {
		return `أمس في ${ formatTime( date ) }`;
	}

	// Within this calendar year
	if ( date.getFullYear() === now.getFullYear() ) {
		return `${ date.getDate() } ${ getMonthName( date.getMonth(), options.monthNaming ) } في ${ formatTime( date ) }`;
	}

	// Older years
	return formatDate( date, options );
}

/**
 * Calculate deep temporal intelligence metrics for a project/task timeline.
 * Computes elapsed time, remaining time, overdue duration, and Gantt extension.
 *
 * @param {Object} params
 * @param {any} params.startDate - Start timestamp or date string
 * @param {any} params.dueDate - Target deadline timestamp or date string
 * @param {boolean} [params.isCompleted=false] - Whether the entity is completed
 * @param {any} [params.completedAt] - When the entity was completed
 * @param {any} [params.originalDueDate] - Initial scheduled due date before Gantt extension
 * @return {Object} Detailed metrics
 */
export function calculateTimelineInsights( {
	startDate,
	dueDate,
	isCompleted = false,
	completedAt = null,
	originalDueDate = null,
} ) {
	const start = parseDate( startDate );
	const due = parseDate( dueDate );
	const now = new Date();
	const end = isCompleted && completedAt ? parseDate( completedAt ) : now;

	const DAY_MS = 86400000;
	const HOUR_MS = 3600000;

	// Total planned duration
	let totalPlannedDays = 0;
	if ( start && due && due >= start ) {
		totalPlannedDays = Math.max( 1, Math.round( ( due.getTime() - start.getTime() ) / DAY_MS ) );
	}

	// Elapsed duration
	let elapsedDays = 0;
	let elapsedHours = 0;
	if ( start ) {
		const elapsedDiff = Math.max( 0, end.getTime() - start.getTime() );
		elapsedDays = Math.floor( elapsedDiff / DAY_MS );
		elapsedHours = Math.floor( ( elapsedDiff % DAY_MS ) / HOUR_MS );
	}

	// Remaining or Overdue duration
	let remainingDays = 0;
	let remainingHours = 0;
	let overdueDays = 0;
	let isOverdue = false;

	if ( due ) {
		const diff = due.getTime() - end.getTime();
		if ( diff < 0 && ! isCompleted ) {
			isOverdue = true;
			const absDiff = Math.abs( diff );
			overdueDays = Math.max( 1, Math.floor( absDiff / DAY_MS ) );
		} else if ( diff >= 0 ) {
			remainingDays = Math.floor( diff / DAY_MS );
			remainingHours = Math.floor( ( diff % DAY_MS ) / HOUR_MS );
		}
	}

	// Gantt Extension / Extra Time Added
	let extensionDays = 0;
	const origDue = parseDate( originalDueDate );
	if ( origDue && due && due > origDue ) {
		extensionDays = Math.round( ( due.getTime() - origDue.getTime() ) / DAY_MS );
	}

	const elapsedDetailed = start ? formatDetailedDuration( start, end ) : '—';
	const remainingDetailed = due ? formatDetailedDuration( end, due ) : '—';

	let insightType = 'in_progress'; // 'completed' | 'overdue' | 'in_progress'

	if ( isCompleted ) {
		insightType = 'completed';
	} else if ( isOverdue ) {
		insightType = 'overdue';
	} else {
		insightType = 'in_progress';
	}

	return {
		totalPlannedDays,
		elapsedDays,
		elapsedHours,
		elapsedDetailed,
		remainingDays,
		remainingHours,
		remainingDetailed,
		overdueDays,
		isOverdue,
		extensionDays,
		insightType,
	};
}

/**
 * Format duration with institutional precision:
 * Format: 1 سنة | 4 أشهر | 12 يوما | hh:mm:ss
 *
 * @param {any} fromDate
 * @param {any} [toDate]
 * @return {string}
 */
export function formatDetailedDuration( fromDate, toDate = new Date() ) {
	const d1 = parseDate( fromDate );
	const d2 = parseDate( toDate );
	if ( ! d1 || ! d2 ) return '—';

	const diffMs = Math.abs( d2.getTime() - d1.getTime() );

	const totalSeconds = Math.floor( diffMs / 1000 );
	const seconds = totalSeconds % 60;
	const totalMinutes = Math.floor( totalSeconds / 60 );
	const minutes = totalMinutes % 60;
	const totalHours = Math.floor( totalMinutes / 60 );
	const hours = totalHours % 24;
	const totalDays = Math.floor( totalHours / 24 );

	const years = Math.floor( totalDays / 365 );
	const remainingDaysAfterYears = totalDays % 365;
	const months = Math.floor( remainingDaysAfterYears / 30 );
	const days = remainingDaysAfterYears % 30;

	const hh = String( hours ).padStart( 2, '0' );
	const mm = String( minutes ).padStart( 2, '0' );
	const ss = String( seconds ).padStart( 2, '0' );
	const timePart = `${ hh }:${ mm }:${ ss }`;

	const parts = [];
	if ( years > 0 ) {
		parts.push( `${ years } سنة` );
	}
	if ( months > 0 ) {
		parts.push( `${ months } أشهر` );
	}
	if ( days > 0 || ( years === 0 && months === 0 ) ) {
		parts.push( `${ days } يوما` );
	}
	parts.push( timePart );

	return parts.join( ' | ' );
}

