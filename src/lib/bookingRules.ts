import type { BookingStatus, RateType } from '../types';

const transitions: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['completed', 'cancelled'],
  rejected: [],
  completed: [],
  cancelled: [],
};

export function canTransitionBooking(status: BookingStatus, next: BookingStatus) {
  return transitions[status].includes(next);
}

export function scheduledDurationHours(durationHours: number, rateType: RateType) {
  return rateType === 'daily' ? Math.ceil(durationHours / 8) * 8 : durationHours;
}

export function estimateBooking(rate: number, durationHours: number, rateType: RateType) {
  if (!Number.isFinite(rate) || !Number.isFinite(durationHours) || rate <= 0 || durationHours <= 0) return 0;
  return rateType === 'hourly' ? rate * durationHours : rate * Math.max(1, Math.ceil(durationHours / 8));
}
