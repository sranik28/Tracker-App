import moment from 'moment-timezone';
import env from '../config/env';

/**
 * Get start and end of day in configured timezone
 */
export const getDayBoundaries = (date: Date): { start: Date; end: Date } => {
    const startOfDay = moment.tz(date, env.TIMEZONE).startOf('day').toDate();
    const endOfDay = moment.tz(date, env.TIMEZONE).endOf('day').toDate();

    return { start: startOfDay, end: endOfDay };
};

/**
 * Get current time in configured timezone
 */
export const getCurrentTime = (): Date => {
    return moment.tz(env.TIMEZONE).toDate();
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
    return moment.tz(date, env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
};
