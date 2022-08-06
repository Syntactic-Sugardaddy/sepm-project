import type { EventShowDetail } from '@/dtos/eventshow/event-show-detail';
import type { SeatingPlanSector } from '@/dtos/seatingplan/seating-plan-sector';
import type { TicketSeating } from '@/dtos/ticket/ticket-seating';

export function useSeatingPlanUtils() {
  const isFreeReservation = (reservation: TicketSeating | undefined) => {
    return reservation === undefined || reservation.placeType === 'STANDING';
  };

  const getPrice = (sector: SeatingPlanSector, eventShow: EventShowDetail) => {
    return Math.floor((sector.pricePercent / 100.0) * eventShow.price);
  };

  return {
    isFreeReservation,
    getPrice,
  };
}
