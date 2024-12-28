export const ATTENDEE_CACHE_PREFIX = 'attendees:';
export const ATTENDEE_CACHE_TTL = 3600; // 1 hour

export const SEARCH_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
};

export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
}; 