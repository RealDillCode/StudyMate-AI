/**
 * Format milliseconds to a human-readable time string
 * @param ms Time in milliseconds
 * @param format Format of the output (short, medium, long)
 * @returns Formatted time string
 */
export function formatTime(ms: number, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!ms || ms < 0) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  
  if (format === 'short') {
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } else if (format === 'medium') {
    // Digital clock format for better readability
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

/**
 * Format a date to a human-readable string
 * @param date Date to format
 * @param format Format of the output (time, date, datetime)
 * @returns Formatted date string
 */
export function formatDate(date: Date, format: 'time' | 'date' | 'datetime' = 'datetime'): string {
  if (!date) return '';
  
  const timeOptions: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  };
  
  const datetimeOptions: Intl.DateTimeFormatOptions = { 
    ...dateOptions,
    ...timeOptions
  };
  
  if (format === 'time') {
    return new Intl.DateTimeFormat('en-US', timeOptions).format(date);
  } else if (format === 'date') {
    return new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  } else {
    return new Intl.DateTimeFormat('en-US', datetimeOptions).format(date);
  }
}

/**
 * Calculate the duration between two dates in milliseconds
 * @param startDate Start date
 * @param endDate End date
 * @returns Duration in milliseconds
 */
export function calculateDuration(startDate: Date, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;
  return endDate.getTime() - startDate.getTime();
}

/**
 * Get the current time formatted as HH:MM
 * @returns Current time as HH:MM
 */
export function getCurrentTimeFormatted(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if the current time is within work hours
 * @param startTime Work start time (format: "HH:MM")
 * @param endTime Work end time (format: "HH:MM")
 * @returns Boolean indicating if current time is within work hours
 */
export function isWithinWorkHours(startTime: string, endTime: string): boolean {
  const currentTime = getCurrentTimeFormatted();
  return currentTime >= startTime && currentTime <= endTime;
}