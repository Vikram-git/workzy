import { describe, expect, it } from 'vitest';
import { canTransitionBooking, estimateBooking } from './bookingRules';

describe('booking transition rules', () => {
  it('allows only the documented next states', () => {
    expect(canTransitionBooking('pending', 'accepted')).toBe(true);
    expect(canTransitionBooking('pending', 'rejected')).toBe(true);
    expect(canTransitionBooking('pending', 'cancelled')).toBe(true);
    expect(canTransitionBooking('accepted', 'completed')).toBe(true);
    expect(canTransitionBooking('accepted', 'cancelled')).toBe(true);
    expect(canTransitionBooking('completed', 'accepted')).toBe(false);
    expect(canTransitionBooking('rejected', 'accepted')).toBe(false);
    expect(canTransitionBooking('cancelled', 'completed')).toBe(false);
  });
});

describe('booking estimate', () => {
  it('calculates hourly and daily estimates for the UI summary', () => {
    expect(estimateBooking(250, 3, 'hourly')).toBe(750);
    expect(estimateBooking(1600, 9, 'daily')).toBe(3200);
  });

  it('rejects invalid client values without displaying a fake amount', () => {
    expect(estimateBooking(-1, 2, 'hourly')).toBe(0);
    expect(estimateBooking(250, Number.NaN, 'hourly')).toBe(0);
  });
});
