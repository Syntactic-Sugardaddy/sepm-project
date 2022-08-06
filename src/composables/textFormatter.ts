import type { IsoDateTimeString } from './../dtos/iso-date-time-string';
import { format, formatDuration, intervalToDuration, parseISO } from 'date-fns';

export function useTextFormatter() {
  const noBreakSpace = '\xA0';

  const date = (date: IsoDateTimeString) => {
    const time = parseISO(date);
    return format(time, 'yyyy/MM/dd');
  };

  const dateTime = (date: IsoDateTimeString) => {
    const time = parseISO(date);
    return format(time, 'yyyy/MM/dd HH:mm');
  };

  const duration = (start: IsoDateTimeString, end: IsoDateTimeString) => {
    if (!start || !end) {
      return '';
    }
    const startTime = parseISO(start);
    const endTime = parseISO(end);

    const duration = intervalToDuration({
      start: startTime,
      end: endTime,
    });

    return formatDuration(duration, { format: ['weeks', 'days', 'hours', 'minutes'] });
  };

  const euro = (cent: number) => {
    return (cent / 100).toFixed(2) + noBreakSpace + '€';
  };

  return {
    date,
    dateTime,
    duration,
    euro,
  };
}
