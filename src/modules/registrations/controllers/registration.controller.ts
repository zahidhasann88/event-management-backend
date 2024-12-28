import { Controller, Post, Get, Body, Param, UseInterceptors, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrationService } from '../services/registration.service';
import { CreateRegistrationDto } from '../dto/registration.dto';
import { Registration } from '../entities/registration.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('registrations')
@Controller('registrations')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @ApiOperation({ summary: 'Register an attendee for an event' })
  @ApiResponse({ status: 201, description: 'Registration successful', type: Registration })
  create(@Body() createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    return this.registrationService.create(createRegistrationDto);
  }

  @Get('event/:eventId')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all registrations for an event' })
  @ApiResponse({ status: 200, description: 'Return all registrations for an event', type: [Registration] })
  findByEventId(@Param('eventId') eventId: string): Promise<Registration[]> {
    return this.registrationService.findByEventId(eventId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a registration' })
  @ApiResponse({ status: 200, description: 'Registration cancelled successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.registrationService.remove(id);
  }
} 