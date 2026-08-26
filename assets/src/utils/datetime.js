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
};

export const DAY_NAMES = [
	'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

/**
 * Get current active runtime settings
 */
export function getRuntimeSettings() {
	const wpSettings = window.workpressSettings || {};
	return {
		timezone: wpSettings.timezone || 'Africa/Algiers',
		monthNaming: wpSettings.monthNaming || 'maghrebi',
		dateFormat: wpSettings.dateFormat || 'D MMMM YYYY',
		relativeTime: wpSettings.relativeTime !== undefined ? wpSettings.relativeTime : true,
		gmtOffset: wpSettings.gmtOffset !== undefined ? parseFloat( wpSettings.gmtOffset ) : 1,
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
	const style = namingStyle || getRuntimeSettings().monthNaming;
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
