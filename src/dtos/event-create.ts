import type { EventType } from './event-type';

export interface EventCreate {
  title: string;
  type: EventType | null;
  description: string;
}
