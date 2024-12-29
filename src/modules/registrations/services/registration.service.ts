import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from '../entities/registration.entity';
import { Event } from '../../events/entities/event.entity';
import { Attendee } from '../../attendees/entities/attendee.entity';
import { CreateRegistrationDto } from '../dto/registration.dto';
import { EmailService } from '../../email/services/email.service';
import { CacheService } from '../../cache/services/cache.service';
import { EventGateway } from '../../websocket/gateways/event.gateway';
import { LoggerService } from 'src/shared/services/logger.service';
import { RegistrationUtil } from 'src/shared/utils/registration.util';
import { WEBSOCKET_EVENTS } from 'src/shared/constants/registration.constants';
import { RegistrationResponse } from 'src/shared/interfaces/registration.interface';

@Injectable()
export class RegistrationService {
  private readonly logger = new LoggerService(RegistrationService.name);

  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private emailService: EmailService,
    private cacheService: CacheService,
    private eventGateway: EventGateway,
  ) {}

  async create(createRegistrationDto: CreateRegistrationDto): Promise<RegistrationResponse> {
    this.logger.log(`Creating registration for event: ${createRegistrationDto.eventId}`);

    const event = await this.eventRepository.findOne({
      where: { id: createRegistrationDto.eventId },
      relations: ['registrations'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const stats = RegistrationUtil.calculateStats(event.registrations.length, event.maxAttendees);
    
    if (stats.isFullyBooked) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    // Create registration
    const registration = await this.createRegistration(createRegistrationDto);
    const response = RegistrationUtil.formatResponse(registration);

    // Handle notifications
    await this.handlePostRegistrationTasks(event, registration);

    return response;
  }

  private async createRegistration(dto: CreateRegistrationDto): Promise<Registration> {
    const existingRegistration = await this.registrationRepository.findOne({
      where: {
        eventId: dto.eventId,
        attendeeId: dto.attendeeId,
      },
    });

    if (existingRegistration) {
      throw new BadRequestException('Attendee is already registered for this event');
    }

    const registration = this.registrationRepository.create(dto);
    return this.registrationRepository.save(registration);
  }

  private async handlePostRegistrationTasks(event: Event, registration: Registration): Promise<void> {
    const stats = RegistrationUtil.calculateStats(
      event.registrations.length + 1,
      event.maxAttendees
    );

    // Cache invalidation
    const cacheKey = RegistrationUtil.generateCacheKey(event.id);
    await this.cacheService.del(cacheKey);

    // WebSocket notifications
    if (RegistrationUtil.shouldSendCapacityWarning(stats.availableSpots)) {
      this.eventGateway.server.emit(WEBSOCKET_EVENTS.CAPACITY_WARNING, {
        eventId: event.id,
        availableSpots: stats.availableSpots,
      });
    }

    if (stats.isFullyBooked) {
      this.eventGateway.server.emit(WEBSOCKET_EVENTS.FULLY_BOOKED, {
        eventId: event.id,
      });
    }

    // Send confirmation email
    await this.emailService.sendRegistrationConfirmation(
      registration.attendee.email,
      event.name,
      event.date,
    );
  }

  async findByEventId(eventId: string): Promise<Registration[]> {
    this.logger.log(`Fetching registrations for event: ${eventId}`);
    try {
      const registrations = await this.registrationRepository.find({
        where: { eventId },
        relations: ['attendee', 'event'],
      });

      if (!registrations.length) {
        this.logger.warn(`No registrations found for event ${eventId}`);
        throw new NotFoundException(`No registrations found for event ${eventId}`);
      }

      return registrations;
    } catch (error) {
      this.logger.error(`Failed to fetch registrations: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRegistrationCount(eventId: string): Promise<number> {
    return this.registrationRepository.count({
      where: { eventId },
    });
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing registration: ${id}`);
    try {
      const registration = await this.registrationRepository.findOne({
        where: { id },
        relations: ['event', 'attendee'],
      });

      if (!registration) {
        this.logger.warn(`Registration not found: ${id}`);
        throw new NotFoundException(`Registration with ID ${id} not found`);
      }

      await this.registrationRepository.remove(registration);
      this.logger.log(`Registration removed successfully: ${id}`);

      await this.cacheService.del(`registrations:${registration.eventId}`);
      await this.cacheService.del(`events:${registration.eventId}`);

      const remainingSpots = registration.event.maxAttendees - 
        (registration.event.registrations?.length || 0) + 1;
      this.eventGateway.notifyEventCapacityUpdate(registration.eventId, remainingSpots);

      await this.emailService.sendRegistrationCancellation(
        registration.attendee.email,
        registration.event.name,
        registration.event.date,
      );
    } catch (error) {
      this.logger.error(`Failed to remove registration: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEventWithRegistrations(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['registrations'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }
} 