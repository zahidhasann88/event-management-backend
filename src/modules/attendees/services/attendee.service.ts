import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Attendee } from '../entities/attendee.entity';
import { CreateAttendeeDto } from '../dto/attendee.dto';
import { Registration } from '../../registrations/entities/registration.entity';
import { CacheService } from '../../cache/services/cache.service';
import { LoggerService } from 'src/shared/services/logger.service';

@Injectable()
export class AttendeeService {
  private readonly logger = new LoggerService(AttendeeService.name);

  constructor(
    @InjectRepository(Attendee)
    private attendeeRepository: Repository<Attendee>,
    @InjectRepository(Registration)
    private registrationRepository: Repository<Registration>,
    private cacheService: CacheService,
  ) {}

  async create(createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
    const existingAttendee = await this.attendeeRepository.findOne({
      where: { email: createAttendeeDto.email },
    });

    if (existingAttendee) {
      throw new BadRequestException('Email already registered');
    }

    const attendee = this.attendeeRepository.create(createAttendeeDto);
    return this.attendeeRepository.save(attendee);
  }

  async findAll(search?: string): Promise<Attendee[]> {
    if (search) {
      return this.attendeeRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ],
      });
    }
    return this.attendeeRepository.find();
  }

  async findOne(id: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findOne({
      where: { id },
      relations: ['registrations', 'registrations.event'],
    });

    if (!attendee) {
      throw new NotFoundException(`Attendee with ID ${id} not found`);
    }

    return attendee;
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
    const attendee = await this.findOne(id);

    const hasRegistrations = await this.registrationRepository.count({
      where: { attendeeId: id },
    });

    if (hasRegistrations) {
      throw new BadRequestException('Cannot delete attendee with existing registrations');
    }

    await this.attendeeRepository.remove(attendee);

    // Invalidate cache
    await this.cacheService.del(`attendees:${id}`);
    await this.cacheService.del('attendees:all');
  }
} 