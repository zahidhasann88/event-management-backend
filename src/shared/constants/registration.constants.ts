export const REGISTRATION_CACHE_PREFIX = 'registrations:';
export const REGISTRATION_CACHE_TTL = 1800; // 30 minutes

export const CAPACITY_THRESHOLDS = {
  WARNING: 2, // Notify when only 2 spots left
  CRITICAL: 0, // Fully booked
};

export const WEBSOCKET_EVENTS = {
  REGISTRATION_CREATED: 'registrationCreated',
  REGISTRATION_CANCELLED: 'registrationCancelled',
  CAPACITY_WARNING: 'capacityWarning',
  FULLY_BOOKED: 'fullyBooked',
}; 