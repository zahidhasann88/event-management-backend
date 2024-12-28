import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  attendeeId: string;

  @ApiProperty()
  registeredAt: Date;

  @ApiProperty({ required: false })
  event?: {
    name: string;
    date: Date;
    location?: string;
  };

  @ApiProperty({ required: false })
  attendee?: {
    name: string;
    email: string;
  };
}

// Keep the interface for internal use
export interface RegistrationResponse extends RegistrationResponseDto {}

export interface RegistrationStats {
  totalRegistrations: number;
  availableSpots: number;
  isFullyBooked: boolean;
} 