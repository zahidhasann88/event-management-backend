import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Not } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { CreateEventDto } from '../dto/event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventGateway } from '../../websocket/gateways/event.gateway';
import { CacheService } from '../../cache/services/cache.service';
import { EVENT_CAPACITY, EVENT_WEBSOCKET_EVENTS } from 'src/shared/constants/event.constants';
import { CACHE_PREFIX } from 'src/shared/constants/cache.constants'
import { DateUtil } from 'src/shared/utils/date.util';
import { PaginationUtil } from 'src/shared/utils/pagination.util';
import { PaginationParams } from 'src/shared/interfaces/pagination.interface';
import { PaginatedResponse } from 'src/shared/interfaces/pagination.interface';
import { LoggerService } from 'src/shared/services/logger.service';

@Injectable()
export class EventService {
  private readonly logger = new LoggerService(EventService.name);

  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private eventGateway: EventGateway,
    private cacheService: CacheService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Creating new event: ${createEventDto.name}`);
    try {
      // Check for overlapping events
      const overlappingEvent = await this.eventRepository.findOne({
        where: {
          date: Between(
            new Date(createEventDto.date.getTime() - 1000 * 60 * 60), // 1 hour before
            new Date(createEventDto.date.getTime() + 1000 * 60 * 60), // 1 hour after
          ),
          location: createEventDto.location,
        },
      });

      if (overlappingEvent) {
        throw new BadRequestException('An event already exists at this time and location');
      }

      const event = this.eventRepository.create(createEventDto);
      const savedEvent = await this.eventRepository.save(event);
      
      this.logger.log(`Event created successfully: ${savedEvent.id}`);
      this.eventGateway.notifyNewEventCreated(savedEvent);
      
      return savedEvent;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(params: PaginationParams): Promise<PaginatedResponse<Event>> {
    this.logger.log(`Fetching events with params: ${JSON.stringify(params)}`);
    try {
      const { skip, limit } = PaginationUtil.getPaginationParams(params);
      
      const queryBuilder = this.eventRepository.createQueryBuilder('event')
        .leftJoinAndSelect('event.registrations', 'registrations')
        .leftJoinAndSelect('registrations.attendee', 'attendee');

      // Add date filters if provided
      if (params.startDate) {
        queryBuilder.andWhere('event.date >= :startDate', { startDate: params.startDate });
      }
      if (params.endDate) {
        queryBuilder.andWhere('event.date <= :endDate', { endDate: params.endDate });
      }

      const [events, total] = await queryBuilder
        .orderBy('event.date', 'ASC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return PaginationUtil.createPaginatedResponse(events, total, params);
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Event> {
    this.logger.log(`Fetching event with id: ${id}`);
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
        relations: ['registrations', 'registrations.attendee'],
      });

      if (!event) {
        this.logger.warn(`Event not found with id: ${id}`);
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return event;
    } catch (error) {
      this.logger.error(`Failed to fetch event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findEventWithMostRegistrations(): Promise<Event> {
    const result = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.registrations', 'registration')
      .leftJoinAndSelect('registration.attendee', 'attendee')
      .addSelect('COUNT(registration.id)', 'registrationCount')
      .groupBy('event.id')
      .addGroupBy('registration.id')
      .addGroupBy('attendee.id')
      .orderBy('COUNT(registration.id)', 'DESC')
      .limit(1)
      .getOne();

    if (!result) {
      throw new NotFoundException('No events found');
    }

    return result;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    this.logger.log(`Updating event ${id} with data: ${JSON.stringify(updateEventDto)}`);
    try {
      const event = await this.findOne(id);

      if (updateEventDto.date || updateEventDto.location) {
        const overlappingEvent = await this.eventRepository.findOne({
          where: {
            id: Not(id), // Exclude current event
            date: Between(
              new Date(updateEventDto.date?.getTime() || event.date.getTime() - 1000 * 60 * 60),
              new Date(updateEventDto.date?.getTime() || event.date.getTime() + 1000 * 60 * 60),
            ),
            location: updateEventDto.location || event.location,
          },
        });

        if (overlappingEvent) {
          throw new BadRequestException('An event already exists at this time and location');
        }
      }

      if (updateEventDto.maxAttendees) {
        const currentRegistrations = await this.registrationRepository.count({
          where: { eventId: id },
        });

        if (updateEventDto.maxAttendees < currentRegistrations) {
          throw new BadRequestException('Cannot reduce max attendees below current registration count');
        }
      }

      const updatedEvent = await this.eventRepository.save({
        ...event,
        ...updateEventDto,
      });

      // Invalidate cache
      await this.cacheService.del(`events:${id}`);
      await this.cacheService.del('events:all');

      // Notify via WebSocket
      this.eventGateway.notifyEventUpdated(updatedEvent);

      return updatedEvent;
    } catch (error) {
      this.logger.error(`Failed to update event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing event with id: ${id}`);
    try {
      const event = await this.findOne(id);

      const hasRegistrations = await this.registrationRepository.count({
        where: { eventId: id },
      });

      if (hasRegistrations) {
        throw new BadRequestException('Cannot delete event with existing registrations');
      }

      await this.eventRepository.remove(event);

      // Invalidate cache
      await this.cacheService.del(`events:${id}`);
      await this.cacheService.del('events:all');

      // Notify via WebSocket
      this.eventGateway.notifyEventDeleted(id);
    } catch (error) {
      this.logger.error(`Failed to remove event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async checkOverlapping(date: Date, location: string, excludeEventId?: string): Promise<boolean> {
    const overlappingEvent = await this.eventRepository.findOne({
      where: {
        id: Not(excludeEventId),
        location,
      },
    });

    if (overlappingEvent) {
      return DateUtil.isOverlapping(date, overlappingEvent.date);
    }

    return false;
  }

  private async invalidateCache(eventId?: string): Promise<void> {
    if (eventId) {
      await this.cacheService.del(`${CACHE_PREFIX.EVENT}${eventId}`);
    }
    await this.cacheService.del(`${CACHE_PREFIX.EVENT}all`);
  }
} 