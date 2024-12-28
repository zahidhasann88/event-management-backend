import { ApiProperty } from '@nestjs/swagger';

export class AttendeeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  registrationCount?: number;

  @ApiProperty({ required: false, type: [Object] })
  events?: Array<{
    id: string;
    name: string;
    date: Date;
  }>;
}

export interface AttendeeResponse extends AttendeeResponseDto {}

export interface AttendeeSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  includeEvents?: boolean;
} 