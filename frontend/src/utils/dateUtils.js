import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { arSA } from 'date-fns/locale';

export const formatLastActive = (date, isRTL = false) => {
  if (!date) return '';
  
  try {
    // Parse the date and handle timezone
    const lastActiveDate = new Date(date);
    if (isNaN(lastActiveDate.getTime())) return '';

    // Debug logging
    console.log('Last Active Debug:', {
      inputDate: date,
      parsedDate: lastActiveDate,
      currentTime: new Date(),
      timezoneOffset: lastActiveDate.getTimezoneOffset(),
      localISOString: lastActiveDate.toLocaleString()
    });

    const now = new Date();
    // Convert both dates to UTC for comparison
    const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60));

    // If less than 1 hour ago, show minutes
    if (diffMinutes < 60) {
      if (diffMinutes < 1) return isRTL ? 'الآن' : 'just now';
      return formatDistanceToNow(lastActiveDate, {
        addSuffix: true,
        locale: isRTL ? arSA : undefined
      });
    }

    // If today, show time
    if (isToday(lastActiveDate)) {
      return format(lastActiveDate, isRTL ? 'HH:mm' : 'h:mm a', {
        locale: isRTL ? arSA : undefined
      });
    }

    // If yesterday, show 'Yesterday at TIME'
    if (isYesterday(lastActiveDate)) {
      const timeStr = format(lastActiveDate, isRTL ? 'HH:mm' : 'h:mm a', {
        locale: isRTL ? arSA : undefined
      });
      return isRTL ? `${timeStr} أمس` : `Yesterday at ${timeStr}`;
    }

    // If within 7 days, show day and time
    const diffDays = Math.floor(diffMinutes / (24 * 60));
    if (diffDays < 7) {
      return format(lastActiveDate, isRTL ? 'eeee HH:mm' : 'eeee h:mm a', {
        locale: isRTL ? arSA : undefined
      });
    }

    // Otherwise show the full date
    return format(lastActiveDate, isRTL ? 'dd/MM/yyyy HH:mm' : 'MMM dd, yyyy h:mm a', {
      locale: isRTL ? arSA : undefined
    });
  } catch (error) {
    console.error('Error formatting last active date:', error, {
      inputDate: date,
      error: error.message,
      stack: error.stack
    });
    return '';
  }
};

export const formatDateTime = (date, isRTL = false) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return format(dateObj, isRTL ? 'dd/MM/yyyy HH:mm' : 'MMM dd, yyyy h:mm a', {
      locale: isRTL ? arSA : undefined
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
};
