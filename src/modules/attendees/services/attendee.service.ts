import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from '../entities/attendee.entity';
import { CreateAttendeeDto } from '../dto/attendee.dto';
import { Registration } from '../../registrations/entities/registration.entity';
import { CacheService } from '../../cache/services/cache.service';
import { LoggerService } from 'src/shared/services/logger.service';
import { AttendeeUtil } from 'src/shared/utils/attendee.util';
import { ATTENDEE_CACHE_PREFIX } from 'src/shared/constants/attendee.constants';
import { AttendeeSearchParams, AttendeeResponse } from 'src/shared/interfaces/attendee.interface';

@Injectable()
export class AttendeeService {
  private readonly logger = new LoggerService(AttendeeService.name);

  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
    @InjectRepository(Registration)
    private cacheService: CacheService,
  ) {}

  async create(createAttendeeDto: CreateAttendeeDto): Promise<AttendeeResponse> {
    this.logger.log(`Creating attendee with email: ${createAttendeeDto.email}`);

    if (!AttendeeUtil.validateEmail(createAttendeeDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email: createAttendeeDto.email },
    });

    if (existingAttendee) {
      throw new BadRequestException('Email already registered');
    }

    const attendee = this.attendeeRepository.create(createAttendeeDto);
    const savedAttendee = await this.attendeeRepository.save(attendee);

    return AttendeeUtil.formatResponse(savedAttendee);
  }

  async findAll(params: AttendeeSearchParams): Promise<AttendeeResponse[]> {
    const { search, includeEvents } = params;
    const queryBuilder = this.attendeeRepository.createQueryBuilder('attendee');

    if (includeEvents) {
      queryBuilder
        .leftJoinAndSelect('attendee.registrations', 'registration')
        .leftJoinAndSelect('registration.event', 'event');
    }

    if (search) {
      queryBuilder.where(
        'attendee.name ILIKE :search OR attendee.email ILIKE :search',
        { search: `%${search}%` }
      );
    }

    const attendees = await queryBuilder.getMany();
    return attendees.map(AttendeeUtil.formatResponse);
  }

  async findOne(id: string): Promise<AttendeeResponse> {
    const cacheKey = AttendeeUtil.generateCacheKey(id);
    const cached = await this.cacheService.get<AttendeeResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const attendee = await this.attendeeRepository.findOne({
      where: { id },
      relations: ['registrations', 'registrations.event'],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }

    const response = AttendeeUtil.formatResponse(attendee);
    await this.cacheService.set(cacheKey, response);

    return response;
  }

  async findAttendeesWithMultipleRegistrations(): Promise<Attendee[]> {
    this.logger.log('Fetching attendees with multiple registrations');
    try {
      const result = await this.attendeeRepository
        .createQueryBuilder('attendee')
        .leftJoinAndSelect('attendee.registrations', 'registration')
        .leftJoinAndSelect('registration.event', 'event')
        .select([
          'attendee.id',
          'attendee.name',
          'attendee.email',
          'registration',
          'event'
        ])
        .groupBy('attendee.id')
        .addGroupBy('registration.id')
        .addGroupBy('event.id')
        .having('COUNT(DISTINCT registration.eventId) > 1')
        .getMany();

      if (!result.length) {
        this.logger.warn('No attendees found with multiple registrations');
        throw new NotFoundException('No attendees found with multiple registrations');
      }

      this.logger.log(`Found ${result.length} attendees with multiple registrations`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch attendees: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAttendeesWithMultipleRegistrationsRaw(): Promise<any> {
    const result = await this.attendeeRepository.query(`
      SELECT 
        a.*,
        COUNT(DISTINCT r.event_id) as event_count,
        json_agg(json_build_object(
          'event_id', e.id,
          'event_name', e.name,
          'event_date', e.date
        )) as events
      FROM attendees a
      JOIN registrations r ON a.id = r.attendee_id
      JOIN events e ON e.id = r.event_id
      GROUP BY a.id
      HAVING COUNT(DISTINCT r.event_id) > 1
    `);

    return result;
  }

  async remove(id: string): Promise<void> {
    const attendee = await this.attendeeRepository.findOne({
      where: { id },
      relations: ['registrations'],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }

    if (attendee.registrations?.length) {
      throw new BadRequestException('Cannot delete attendee with existing registrations');
    }

    await this.attendeeRepository.remove(attendee);
    await this.cacheService.del(`${ATTENDEE_CACHE_PREFIX}${id}`);
    await this.cacheService.del(`${ATTENDEE_CACHE_PREFIX}all`);
  }
} 