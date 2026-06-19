// Helper to get all date parts in IST (Asia/Kolkata) timezone
export const getISTDateParts = (date: Date) => {
    const d = isNaN(date.getTime()) ? new Date() : date;
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(d);
    const partMap = new Map(parts.map(p => [p.type, p.value]));
    return {
        year: parseInt(partMap.get('year')!, 10),
        month: parseInt(partMap.get('month')!, 10), // 1-12
        day: parseInt(partMap.get('day')!, 10),
        hour: parseInt(partMap.get('hour')!, 10),
        minute: parseInt(partMap.get('minute')!, 10),
        second: parseInt(partMap.get('second')!, 10)
    };
};

// Create a timezone-safe Date object for a specific year, month index, and day in IST
export const createISTDate = (year: number, monthIndex: number, day: number): Date => {
    // Create UTC Date at 12:00:00 (noon) to be completely safe from timezone shifting in any part of the world
    return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
};

// Format date to YYYY-MM-DD in IST
export const formatDateForAPI = (date: Date): string => {
    const { year, month, day } = getISTDateParts(date);
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
};

// Parse date string to Date object anchored to IST noon
export const parseDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const datePart = dateString.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-11
        const day = parseInt(parts[2], 10);
        return createISTDate(year, month, day);
    }
    return new Date(dateString);
};

// Get current month and year in IST
export const getCurrentMonthYear = (): { year: number; month: number } => {
    const { year, month } = getISTDateParts(new Date());
    return { year, month };
};

// Get days in month (timezone-independent)
export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

// Format month name
export const getMonthName = (month: number): string => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
};

// Format date for display in IST
export const formatDisplayDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseDate(date) : date;
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

// Format date with weekday in IST
export const formatFullDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseDate(date) : date;
    return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
};

// Get date range for a week
export const getWeekDateRange = (endDate: Date): { start: Date; end: Date } => {
    const end = new Date(endDate);
    const start = new Date(endDate);
    start.setDate(start.getDate() - 6);
    return { start, end };
};

// Check if date is today in IST
export const isToday = (date: Date | string): boolean => {
    const dObj = typeof date === 'string' ? parseDate(date) : date;
    const dateStr = formatDateForAPI(dObj);
    const todayStr = formatDateForAPI(new Date());
    return dateStr === todayStr;
};

// Get month start and end dates in IST
export const getMonthRange = (year: number, month: number): { start: Date; end: Date } => {
    const start = createISTDate(year, month - 1, 1);
    const end = createISTDate(year, month, 0);
    return { start, end };
};
