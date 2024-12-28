import { RegistrationResponse, RegistrationStats } from '../interfaces/registration.interface';
import { CAPACITY_THRESHOLDS } from '../constants/registration.constants';

export class RegistrationUtil {
  static formatResponse(data: any): RegistrationResponse {
    return {
      id: data.id,
      eventId: data.eventId,
      attendeeId: data.attendeeId,
      registeredAt: data.registeredAt,
      event: data.event ? {
        name: data.event.name,
        date: data.event.date,
        location: data.event.location,
      } : undefined,
      attendee: data.attendee ? {
        name: data.attendee.name,
        email: data.attendee.email,
      } : undefined,
    };
  }

  static calculateStats(currentRegistrations: number, maxAttendees: number): RegistrationStats {
    const availableSpots = maxAttendees - currentRegistrations;
    return {
      totalRegistrations: currentRegistrations,
      availableSpots,
      isFullyBooked: availableSpots <= CAPACITY_THRESHOLDS.CRITICAL,
    };
  }

  static shouldSendCapacityWarning(availableSpots: number): boolean {
    return availableSpots <= CAPACITY_THRESHOLDS.WARNING && 
           availableSpots > CAPACITY_THRESHOLDS.CRITICAL;
  }

  static generateCacheKey(eventId: string): string {
    return `registrations:event:${eventId}`;
  }
} 