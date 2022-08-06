/** File Hash: ea49fb0ed7e812c854992c297004cf70eecca2ce2b4a3c7b481009f53e2d7bed */

/** Autogenerated Code - Do Not Touch */
/* eslint-disable */

import type { EventType } from "@/dtos/event-type"
import type { IsoDateTimeString } from "@/dtos/iso-date-time-string"

export interface EventDetail {
  id: number;
  title: string;
  type: EventType;
  startTime: IsoDateTimeString;
  endTime: IsoDateTimeString;
  description: string;
}
