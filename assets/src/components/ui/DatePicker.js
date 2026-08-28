import { html, useState, useEffect } from '../../utils/html.js';
import { getMonthName, DAY_NAMES, formatDate, parseDate, formatNumber } from '../../utils/datetime.js';
import sound from '../../utils/sound.js';

/**
 * WorkPress World-Class Custom Institutional Date & Time Picker
 *
 * Fully custom zero-build interactive calendar & time engine.
 * Includes:
 * 1. Quick Days Row: +1, +3, +7, +14, +30
 * 2. Quick Hours Row: +1Ø³, +3Ø³, +6Ø³
 * 3. Interactive Full Month Calendar Grid (1 to 31)
 * 4. Time Picker Section with Presets
 * 5. High-Contrast Institutional Confirmation
 */
export default function DatePicker( {
	initialDate,
	onSelect,
	onClose,
	showTime = true,
	title = 'Ø¥Ø¹Ø§Ø¯Ø© Ø¬Ø¯ÙˆÙ„Ø© Ø§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù'
} ) {
	const currentInitial = initialDate ? parseDate( initialDate ) : new Date();
	const [ viewMonth, setViewMonth ] = useState( currentInitial ? currentInitial.getMonth() : new Date().getMonth() );
	const [ viewYear, setViewYear ] = useState( currentInitial ? currentInitial.getFullYear() : new Date().getFullYear() );
	const [ selectedDate, setSelectedDate ] = useState( currentInitial || new Date() );
	const [ selectedTime, setSelectedTime ] = useState( () => {
		if ( initialDate && String( initialDate ).includes( ' ' ) ) {
			const parts = String( initialDate ).split( ' ' )[ 1 ].split( ':' );
			return `${ parts[ 0 ] }:${ parts[ 1 ] }`;
		}
		return '18:00';
	} );

	const today = new Date();
	today.setHours( 0, 0, 0, 0 );

	const handlePrevMonth = () => {
		if ( viewMonth === 0 ) {
			setViewMonth( 11 );
			setViewYear( prev => prev - 1 );
		} else {
			setViewMonth( prev => prev - 1 );
		}
		sound.play( 'click' );
	};

	const handleNextMonth = () => {
		if ( viewMonth === 11 ) {
			setViewMonth( 0 );
			setViewYear( prev => prev + 1 );
		} else {
			setViewMonth( prev => prev + 1 );
		}
		sound.play( 'click' );
	};

	// Quick extend days (+1, +3, +7, +14, +30)
	const handleQuickExtendDays = ( daysToAdd ) => {
		const base = selectedDate ? new Date( selectedDate ) : new Date();
		const target = new Date( base );
		target.setDate( target.getDate() + daysToAdd );
		target.setHours( 0, 0, 0, 0 );

		setSelectedDate( target );
		setViewMonth( target.getMonth() );
		setViewYear( target.getFullYear() );
		sound.play( 'button' );
	};

	// Quick extend hours (+1, +3, +6)
	const handleQuickExtendHours = ( hoursToAdd ) => {
		const timeParts = ( selectedTime || '18:00' ).split( ':' );
		let curHour = parseInt( timeParts[ 0 ], 10 ) || 0;
		const curMin = timeParts[ 1 ] || '00';

		let newHour = curHour + hoursToAdd;
		if ( newHour >= 24 ) {
			newHour = newHour % 24;
			// Also advance date by 1 day if hour wraps around
			const base = selectedDate ? new Date( selectedDate ) : new Date();
			base.setDate( base.getDate() + 1 );
			setSelectedDate( base );
			setViewMonth( base.getMonth() );
			setViewYear( base.getFullYear() );
		}

		const formattedHour = String( newHour ).padStart( 2, '0' );
		setSelectedTime( `${ formattedHour }:${ curMin }` );
		sound.play( 'button' );
	};

	// Calculate days in the current view month
	const firstDayOfMonth = new Date( viewYear, viewMonth, 1 );
	const lastDayOfMonth = new Date( viewYear, viewMonth + 1, 0 );
	const totalDays = lastDayOfMonth.getDate();
	const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

	const daysGrid = [];
	
	// Empty padding for start of month
	for ( let p = 0; p < startDayOfWeek; p++ ) {
		daysGrid.push( { empty: true, key: `empty_start_${ p }` } );
	}

	// Active days
	for ( let day = 1; day <= totalDays; day++ ) {
		const cellDate = new Date( viewYear, viewMonth, day );
		cellDate.setHours( 0, 0, 0, 0 );

		const isToday = cellDate.getTime() === today.getTime();
		const isSelected = selectedDate && (
			selectedDate.getFullYear() === viewYear &&
			selectedDate.getMonth() === viewMonth &&
			selectedDate.getDate() === day
		);
		const isWeekend = cellDate.getDay() === 5 || cellDate.getDay() === 6; // Friday / Saturday

		daysGrid.push( {
			empty: false,
			dayNum: day,
			date: cellDate,
			isToday,
			isSelected,
			isWeekend,
			key: `day_${ viewYear }_${ viewMonth }_${ day }`
		} );
	}

	const handleDayClick = ( cellDate ) => {
		setSelectedDate( cellDate );
		sound.play( 'button' );
	};

	const handleConfirm = () => {
		if ( ! selectedDate ) return;
		const y = selectedDate.getFullYear();
		const m = String( selectedDate.getMonth() + 1 ).padStart( 2, '0' );
		const d = String( selectedDate.getDate() ).padStart( 2, '0' );
		const dateStr = `${ y }-${ m }-${ d }`;
		const timeStr = showTime ? ( selectedTime || '18:00' ) : '00:00';
		const fullDateTime = `${ dateStr } ${ timeStr }:00`;

		if ( onSelect ) {
			onSelect( { dateStr, timeStr, fullDateTime, dateObj: selectedDate } );
		}
	};

	const quickTimePresets = [ '09:00', '12:00', '15:00', '18:00', '23:59' ];

	return html`
		<div dir="rtl" className="workpress-custom-datepicker" style=${{ backgroundColor: '#ffffff', border: '2px solid #0f172a', width: '330px', boxShadow: '0 16px 40px rgba(0,0,0,0.25)', userSelect: 'none', borderRadius: 0 }} onClick=${ ( e ) => e.stopPropagation() }>
			
			<!-- Calendar Header Bar -->
			<div style=${{ backgroundColor: '#0f172a', color: '#ffffff', padding: '0.65rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div style=${{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '900' }}>
					<i className="dashicons dashicons-calendar-alt" style=${{ color: '#38bdf8', fontSize: '16px' }}></i>
					<span>${ title }</span>
				</div>

				${ onClose ? html`
					<button 
						type="button" 
						onClick=${ onClose }
						title="Ø¥ØºÙ„Ø§Ù‚"
						style=${{ background: 'transparent', border: 'none', color: '#ffffff', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '18px', padding: 0 }}
					>
						<i className="dashicons dashicons-no-alt" style=${{ fontSize: '16px' }}></i>
					</button>
				` : null }
			</div>

			<!-- Quick Extensions Toolbar (Ø§Ù„Ø³Ø·Ø±ÙŠÙ† Ø§Ù„Ø³Ø±ÙŠØ¹ÙŠÙ†) -->
			<div style=${{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.6rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
				
				<!-- Row 1: Days Extension (+1, +3, +7, +14, +30) -->
				<div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
					<span style=${{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', minWidth: '46px' }}>
						Ø§Ù„Ø£ÙŠØ§Ù…:
					</span>
					<div style=${{ display: 'flex', gap: '4px', flex: 1 }}>
						${ [ 1, 3, 7, 14, 30 ].map( d => html`
							<button 
								key=${ d }
								type="button" 
								className="button is-small is-white wp-sharp-button"
								style=${{ 
									flex: 1,
									height: '26px', 
									padding: 0, 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center', 
									border: '1px solid #cbd5e1',
									backgroundColor: '#ffffff',
									fontSize: '0.75rem',
									fontWeight: '900',
									color: '#0f172a'
								}}
								onClick=${ () => handleQuickExtendDays( d ) }
								title=${ `ØªÙ…Ø¯ÙŠØ¯ +${ d } ÙŠÙˆÙ…` }
							>
								+${ d }
							</button>
						` ) }
					</div>
				</div>

				<!-- Row 2: Hours Extension (+1, +3, +6) -->
				<div style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
					<span style=${{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', minWidth: '46px' }}>
						Ø§Ù„Ø³Ø§Ø¹Ø§Øª:
					</span>
					<div style=${{ display: 'flex', gap: '4px', flex: 1 }}>
						${ [ 1, 3, 6 ].map( h => html`
							<button 
								key=${ h }
								type="button" 
								className="button is-small is-white wp-sharp-button"
								style=${{ 
									flex: 1,
									height: '26px', 
									padding: 0, 
									display: 'flex', 
									alignItems: 'center', 
									justifyContent: 'center', 
									border: '1px solid #cbd5e1',
									backgroundColor: '#ffffff',
									fontSize: '0.75rem',
									fontWeight: '900',
									color: '#2563eb'
								}}
								onClick=${ () => handleQuickExtendHours( h ) }
								title=${ `ØªÙ…Ø¯ÙŠØ¯ +${ h } Ø³Ø§Ø¹Ø§Øª` }
							>
								+${ h }Ø³
							</button>
						` ) }
					</div>
				</div>
			</div>

			<!-- Month Navigation Header -->
			<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.45rem 0.85rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
				<button 
					type="button" 
					className="wp-icon-btn is-small"
					onClick=${ handleNextMonth }
					title="Ø§Ù„Ø´Ù‡Ø± Ø§Ù„Ø³Ø§Ø¨Ù‚"
				>
					<i className="dashicons dashicons-arrow-right-alt2"></i>
				</button>

				<div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<span style=${{ fontWeight: '900', fontSize: '0.85rem', color: '#0f172a' }}>
						${ getMonthName( viewMonth ) } ${ viewYear }
					</span>
					<button
						type="button"
						className="wp-dense-chip is-danger"
						onClick=${ () => {
							const now = new Date();
							setSelectedDate( now );
							setViewMonth( now.getMonth() );
							setViewYear( now.getFullYear() );
							sound.play( 'button' );
						} }
						title="Ø§Ù„Ø±Ø¬ÙˆØ¹ Ø§Ù„ÙÙˆØ±ÙŠ Ù„ØªØ§Ø±ÙŠØ® Ø§Ù„ÙŠÙˆÙ…"
						style=${{ cursor: 'pointer' }}
					>
						Ø§Ù„ÙŠÙˆÙ…
					</button>
				</div>

				<button 
					type="button" 
					className="wp-icon-btn is-small"
					onClick=${ handlePrevMonth }
					title="Ø§Ù„Ø´Ù‡Ø± Ø§Ù„ØªØ§Ù„ÙŠ"
				>
					<i className="dashicons dashicons-arrow-left-alt2"></i>
				</button>
			</div>

			<!-- Weekday Names Header -->
			<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '6px 4px', textAlign: 'center' }}>
				${ [ 'Ø­', 'Ù†', 'Ø«', 'Ø±', 'Ø®', 'Ø¬', 'Ø³' ].map( ( dName, idx ) => html`
					<div key=${ idx } style=${{ fontSize: '0.72rem', fontWeight: '800', color: ( idx === 5 || idx === 6 ) ? '#94a3b8' : '#334155' }}>
						${ dName }
					</div>
				` ) }
			</div>

			<!-- Days Grid -->
			<div style=${{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', padding: '6px', backgroundColor: '#ffffff' }}>
				${ daysGrid.map( cell => {
					if ( cell.empty ) {
						return html`<div key=${ cell.key } style=${{ height: '32px' }}></div>`;
					}

					let bg = '#ffffff';
					let color = '#0f172a';
					let border = '1px solid transparent';

					if ( cell.isSelected ) {
						bg = '#0f172a';
						color = '#ffffff';
						border = '1px solid #0f172a';
					} else if ( cell.isToday ) {
						bg = '#fef2f2';
						color = '#dc2626';
						border = '1px solid #fca5a5';
					} else if ( cell.isWeekend ) {
						bg = '#f8fafc';
						color = '#64748b';
					}

					return html`
						<button 
							key=${ cell.key }
							type="button" 
							onClick=${ () => handleDayClick( cell.date ) }
							style=${{ 
								height: '32px', 
								display: 'flex', 
								alignItems: 'center', 
								justifyContent: 'center', 
								fontSize: '0.8rem', 
								fontWeight: cell.isSelected || cell.isToday ? '900' : '700', 
								backgroundColor: bg, 
								color: color, 
								border: border, 
								borderRadius: 0, 
								cursor: 'pointer',
								transition: 'all 0.1s ease'
							}}
						>
							${ cell.dayNum }
						</button>
					`;
				} ) }
			</div>

			<!-- Time Selection & Presets -->
			${ showTime ? html`
				<div style=${{ borderTop: '1px solid #e2e8f0', padding: '0.55rem 0.85rem', backgroundColor: '#f8fafc' }}>
					<div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
						<span style=${{ fontSize: '0.74rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
							<i className="dashicons dashicons-clock" style=${{ color: '#64748b', fontSize: '14px' }}></i>
							<span>ØªÙˆÙ‚ÙŠØª Ø§Ù„ØªØ³Ù„ÙŠÙ…:</span>
						</span>
						
						<input 
							type="time" 
							className="input is-small" 
							value=${ selectedTime } 
							onChange=${ ( e ) => setSelectedTime( e.target.value ) }
							style=${{ width: '90px', height: '26px', fontSize: '0.78rem', fontWeight: '800', borderRadius: 0, border: '1px solid #cbd5e1', textAlign: 'center' }}
						/>
					</div>

					<!-- Quick Time Presets -->
					<div style=${{ display: 'flex', gap: '3px', justifyContent: 'space-between' }}>
						${ quickTimePresets.map( tp => html`
							<button 
								key=${ tp }
								type="button" 
								className="button is-small is-white" 
								style=${{ 
									flex: 1, 
									height: '24px', 
									padding: 0, 
									fontSize: '0.68rem', 
									fontWeight: selectedTime === tp ? '900' : '600', 
									borderRadius: 0, 
									border: `1px solid ${ selectedTime === tp ? '#0f172a' : '#e2e8f0' }`,
									backgroundColor: selectedTime === tp ? '#0f172a' : '#ffffff',
									color: selectedTime === tp ? '#ffffff' : '#475569'
								}}
								onClick=${ () => { setSelectedTime( tp ); sound.play( 'click' ); } }
							>
								${ tp }
							</button>
						` ) }
					</div>
				</div>
			` : null }

			<!-- Action Footer -->
			<div style=${{ padding: '0.65rem 0.85rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
				<div style=${{ fontSize: '0.72rem', color: '#475569', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
					<span>Ø§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ù…Ø®ØªØ§Ø±:</span>
					<strong style=${{ color: '#0f172a' }}>
						${ formatDate( selectedDate ) } ${ showTime ? `(${ selectedTime })` : '' }
					</strong>
				</div>

				<button 
					type="button" 
					className="button is-primary is-fullwidth wp-sharp-button"
					style=${{ height: '34px', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: '900', fontSize: '0.82rem', border: '1px solid #0f172a' }}
					onClick=${ handleConfirm }
				>
					<span>Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆØ­ÙØ¸ Ø§Ù„Ù…ÙˆØ¹Ø¯ Ø§Ù„Ù…Ø³ØªÙ‡Ø¯Ù</span>
				</button>
			</div>
		</div>
	`;
}
