import { AttendeeResponse } from '../interfaces/attendee.interface';
import { VALIDATION_RULES } from '../constants/attendee.constants';

export class AttendeeUtil {
  static validateEmail(email: string): boolean {
    return VALIDATION_RULES.EMAIL_PATTERN.test(email);
  }

  static formatResponse(data: any): AttendeeResponse {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      registrationCount: data.registrations?.length,
      events: data.registrations?.map(reg => ({
        id: reg.event.id,
        name: reg.event.name,
        date: reg.event.date,
      })),
    };
  }

  static generateCacheKey(id: string): string {
    return `attendees:${id}`;
  }
} 