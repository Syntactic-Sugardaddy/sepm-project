import type { IsoDateTimeString } from './../dtos/iso-date-time-string';
import { isAfter, parseISO } from 'date-fns';
import type { Ref } from 'vue';
import type { EventType } from '@/dtos/event-type';
import { assertUnreachable } from '@/assert';

export function useCustomValidators() {
  const notBlank = helpers.withMessage('This field cannot contain only whitespace', (stringRef: Ref<string>) => {
    return !unref(stringRef).match(/^ +$/);
  });

  const validEventType = helpers.withMessage(
    'Event type must be MOVIE, THEATRE, OPERA, CONCERT, COMEDY or SPORTS',
    (stringRef: Ref<string>) => {
      const typeIn = unref(stringRef) as EventType;
      if (!typeIn) {
        return true;
      }

      switch (typeIn) {
        case 'MOVIE':
        case 'THEATRE':
        case 'OPERA':
        case 'CONCERT':
        case 'COMEDY':
        case 'SPORTS':
          return true;
        default:
          assertUnreachable(typeIn);
          return false;
      }
    }
  );

  const dateNotInPast = helpers.withMessage('date must not be prior to today', (stringRef: Ref<IsoDateTimeString>) => {
    const timeString = unref(stringRef);
    const time = parseISO(timeString);
    return isAfter(time, new Date());
  });

  const isAfterDateTime = (second: Ref<IsoDateTimeString>) =>
    helpers.withParams({ second }, (first: Ref<IsoDateTimeString>) => {
      const firstString = unref(first);
      const secondString = unref(second);
      if (!secondString || !firstString) {
        return true;
      }

      const firstTime = parseISO(firstString);
      const secondTime = parseISO(secondString);
      return isAfter(firstTime, secondTime);
    });

  return { notBlank, validEventType, dateNotInPast, isAfterDateTime };
}
