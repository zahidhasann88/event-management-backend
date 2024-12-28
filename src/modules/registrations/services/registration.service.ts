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

@Injectable()
export class RegistrationService {
  private readonly logger = new LoggerService(RegistrationService.name);

  constructor(
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
    private emailService: EmailService,
    private cacheService: CacheService,
    private eventGateway: EventGateway,
  ) {}

  async create(createRegistrationDto: CreateRegistrationDto): Promise<Registration> {
    this.logger.log(`Creating registration for event: ${createRegistrationDto.eventId}`);
    try {
      const event = await this.eventRepository.findOne({
        where: { id: createRegistrationDto.eventId },
        relations: ['registrations'],
      });

      if (!event) {
        this.logger.warn(`Event not found: ${createRegistrationDto.eventId}`);
        throw new NotFoundException('Event not found');
      }

      const attendee = await this.attendeeRepository.findOne({
        where: { id: createRegistrationDto.attendeeId },
      });

      if (!attendee) {
        this.logger.warn(`Attendee not found: ${createRegistrationDto.attendeeId}`);
        throw new NotFoundException('Attendee not found');
      }

      const existingRegistration = await this.registrationRepository.findOne({
        where: {
          eventId: createRegistrationDto.eventId,
          attendeeId: createRegistrationDto.attendeeId,
        },
      });

      if (existingRegistration) {
        this.logger.warn(`Duplicate registration attempt: ${JSON.stringify(createRegistrationDto)}`);
        throw new BadRequestException('Attendee is already registered for this event');
      }

      if (event.registrations.length >= event.maxAttendees) {
        this.logger.warn(`Event ${event.id} has reached maximum capacity`);
        throw new BadRequestException('Event has reached maximum capacity');
      }

      const registration = this.registrationRepository.create({
        eventId: event.id,
        attendeeId: attendee.id,
        event,
        attendee,
      });

      const savedRegistration = await this.registrationRepository.save(registration);
      this.logger.log(`Registration created successfully: ${savedRegistration.id}`);

      await this.emailService.sendRegistrationConfirmation(
        attendee.email,
        event.name,
        event.date,
      );

      await this.checkAndNotifyCapacity(event);

      return savedRegistration;
    } catch (error) {
      this.logger.error(`Failed to create registration: ${error.message}`, error.stack);
      throw error;
    }
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

  private async checkAndNotifyCapacity(event: Event): Promise<void> {
    const remainingSpots = event.maxAttendees - event.registrations.length;
    if (remainingSpots <= 2) {
      this.logger.warn(`Event ${event.id} has only ${remainingSpots} spots remaining`);
      this.eventGateway.notifyEventCapacityUpdate(event.id, remainingSpots);
    }
  }
} 