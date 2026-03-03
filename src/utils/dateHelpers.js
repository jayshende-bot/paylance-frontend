import { format, formatDistanceToNow, isAfter, parseISO } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'MMM dd, yyyy');
export const formatDateTime = (date) => format(new Date(date), 'MMM dd, yyyy HH:mm');
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });
export const isExpired = (date) => !isAfter(new Date(date), new Date());
