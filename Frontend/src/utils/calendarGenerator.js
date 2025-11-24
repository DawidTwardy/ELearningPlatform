export const downloadCalendarEvent = (courseTitle, startTime, selectedDays) => {
    // startTime: string "HH:mm" (np. "18:30")
    // selectedDays: array ["MO", "TU", ...]

    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Ustawiamy DTSTART na dzisiaj o wybranej godzinie
    const startDate = new Date(now);
    startDate.setHours(hours, minutes, 0, 0);

    // Formatowanie daty do standardu ICS: YYYYMMDDTHHmmSS
    const formatDate = (date) => {
        const pad = (n) => n < 10 ? '0' + n : n;
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    };

    const start = formatDate(startDate);
    // Zakładamy sesję 1h
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); 
    const end = formatDate(endDate);

    // Budowanie reguły powtarzania
    // FREQ=WEEKLY;BYDAY=MO,WE,FR
    const rrule = selectedDays.length > 0 
        ? `RRULE:FREQ=WEEKLY;BYDAY=${selectedDays.join(',')}`
        : 'RRULE:FREQ=DAILY;COUNT=30'; // Fallback jeśli nic nie wybrano

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ELearningPlatform//StudyReminder//PL',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `SUMMARY:Nauka: ${courseTitle}`,
        `DESCRIPTION:Przypomnienie o zaplanowanej sesji nauki kursu "${courseTitle}".`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        rrule,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-PT10M', // Przypomnienie 10 min przed
        'DESCRIPTION:Czas na naukę!',
        'ACTION:DISPLAY',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Harmonogram_${courseTitle.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};