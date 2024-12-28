import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EventService } from '../services/event.service';
import { CreateEventDto } from '../dto/event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Event } from '../entities/event.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PaginationParams, PaginatedResponse } from 'src/shared/interfaces/pagination.interface';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully', type: Event })
  create(@Body() createEventDto: CreateEventDto): Promise<Event> {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Return all events', type: [Event] })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedResponse<Event>> {
    const params: PaginationParams = {
      page: 1,
      limit: 10,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.eventService.findAll(params);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get event by id' })
  @ApiResponse({ status: 200, description: 'Return event by id', type: Event })
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @Get('stats/most-registrations')
  @ApiOperation({ summary: 'Get event with most registrations' })
  @ApiResponse({ status: 200, description: 'Return event with most registrations', type: Event })
  getMostRegisteredEvent(): Promise<Event> {
    return this.eventService.findEventWithMostRegistrations();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully', type: Event })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.eventService.remove(id);
  }
} 