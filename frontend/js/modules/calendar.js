/**
 * @module calendar
 * @description Generates .ics calendar files for event downloads.
 */

/**
 * Formats a date string for iCalendar format (YYYYMMDDTHHmmssZ).
 * @param {string} dateStr - ISO 8601 date string
 * @returns {string} Formatted iCal date
 */
function formatICalDate(dateStr) {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates an .ics file content string for a given event.
 * @param {Object} event - Schema.org MusicEvent object
 * @returns {string} iCalendar file content
 */
export function generateICS(event) {
  const start = formatICalDate(event.startDate);
  const end = formatICalDate(event.endDate);
  const now = formatICalDate(new Date().toISOString());

  const location = event.location
    ? `${event.location.name}, ${event.location.address.streetAddress}, ${event.location.address.addressLocality}`
    : '';

  const performers = Array.isArray(event.performer)
    ? event.performer.map(p => p.name).join(', ')
    : event.performer?.name || '';

  const description = `${event.description}${performers ? `\\n\\nArtistes: ${performers}` : ''}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dona\'m Bauxa//CA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${now}`,
    `UID:${event['@id']}@donamBauxa`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers a download of an .ics file for the given event.
 * @param {Object} event - Schema.org MusicEvent object
 */
export function downloadICS(event) {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
