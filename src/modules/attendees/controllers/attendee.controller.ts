import { Controller, Get, Post, Body, Param, Query, UseInterceptors, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendeeService } from '../services/attendee.service';
import { CreateAttendeeDto } from '../dto/attendee.dto';
import { Attendee } from '../entities/attendee.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('attendees')
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendee' })
  @ApiResponse({ status: 201, description: 'Attendee created successfully', type: Attendee })
  create(@Body() createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    return this.attendeeService.create(createAttendeeDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all attendees' })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Return all attendees', type: [Attendee] })
  findAll(@Query('search') search?: string): Promise<Attendee[]> {
    return this.attendeeService.findAll(search);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get attendee by id' })
  @ApiResponse({ status: 200, description: 'Return attendee by id', type: Attendee })
  findOne(@Param('id') id: string): Promise<Attendee> {
    return this.attendeeService.findOne(id);
  }

  @Get('stats/multiple-registrations')
  @ApiOperation({ summary: 'Get attendees with multiple registrations' })
  @ApiResponse({ status: 200, description: 'Return attendees with multiple registrations', type: [Attendee] })
  getAttendeesWithMultipleRegistrations(): Promise<Attendee[]> {
    return this.attendeeService.findAttendeesWithMultipleRegistrations();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendee' })
  @ApiResponse({ status: 200, description: 'Attendee deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.attendeeService.remove(id);
  }
} 