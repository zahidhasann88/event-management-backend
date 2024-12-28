import { Controller, Post, Get, Body, Param, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrationService } from '../services/registration.service';
import { CreateRegistrationDto } from '../dto/registration.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RegistrationResponseDto } from 'src/shared/interfaces/registration.interface';
import { RegistrationUtil } from 'src/shared/utils/registration.util';

@ApiTags('registrations')
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Register an attendee for an event' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful', 
    type: RegistrationResponseDto 
  })
  create(@Body() createRegistrationDto: CreateRegistrationDto): Promise<RegistrationResponseDto> {
    return this.registrationService.create(createRegistrationDto);
  }

  @Get('event/:eventId')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all registrations for an event' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all registrations for an event', 
    type: [RegistrationResponseDto] 
  })
  findByEventId(@Param('eventId') eventId: string): Promise<RegistrationResponseDto[]> {
    return this.registrationService.findByEventId(eventId);
  }

  @Get('stats/:eventId')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get registration statistics for an event' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return registration statistics', 
    type: 'RegistrationStats' 
  })
  async getEventStats(@Param('eventId') eventId: string) {
    const event = await this.registrationService.getEventWithRegistrations(eventId);
    return RegistrationUtil.calculateStats(
      event.registrations.length,
      event.maxAttendees
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a registration' })
  @ApiResponse({ status: 200, description: 'Registration cancelled successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.registrationService.remove(id);
  }
} 