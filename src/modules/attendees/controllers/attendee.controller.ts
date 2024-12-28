import { Controller, Get, Post, Body, Param, Query, Delete, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttendeeService } from '../services/attendee.service';
import { CreateAttendeeDto } from '../dto/attendee.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AttendeeResponse, AttendeeSearchParams } from 'src/shared/interfaces/attendee.interface';
import { SEARCH_DEFAULTS } from 'src/shared/constants/attendee.constants';
import { AttendeeResponseDto } from 'src/shared/interfaces/attendee.interface';

@ApiTags('attendees')
@Controller('attendees')
export class AttendeeController {
  constructor(private readonly attendeeService: AttendeeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendee' })
  @ApiResponse({ status: 201, description: 'Attendee created successfully', type: AttendeeResponseDto })
  create(@Body() createAttendeeDto: CreateAttendeeDto): Promise<AttendeeResponse> {
    return this.attendeeService.create(createAttendeeDto);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get all attendees' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeEvents', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Return all attendees', type: [AttendeeResponseDto] })
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('includeEvents') includeEvents?: boolean,
  ): Promise<AttendeeResponse[]> {
    const params: AttendeeSearchParams = {
      search,
      page: page || SEARCH_DEFAULTS.PAGE,
      limit: limit || SEARCH_DEFAULTS.LIMIT,
      includeEvents: includeEvents || false,
    };
    return this.attendeeService.findAll(params);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Get attendee by id' })
  @ApiResponse({ status: 200, description: 'Return attendee by id', type: AttendeeResponseDto })
  findOne(@Param('id') id: string): Promise<AttendeeResponse> {
    return this.attendeeService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendee' })
  @ApiResponse({ status: 200, description: 'Attendee deleted successfully' })
  remove(@Param('id') id: string): Promise<void> {
    return this.attendeeService.remove(id);
  }
} 