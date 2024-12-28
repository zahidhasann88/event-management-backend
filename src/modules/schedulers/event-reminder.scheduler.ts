import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, Between } from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { EmailService } from '../email/services/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventReminderScheduler {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendEventReminders() {
    const reminderHours = this.configService.get<number>('reminder.beforeEventHours');
    const reminderDate = new Date();
    reminderDate.setHours(reminderDate.getHours() + reminderHours);

    const events = await this.eventRepository.find({
      where: {
        date: Between(new Date(), reminderDate)
      },
      relations: ['registrations', 'registrations.attendee'],
    });

    for (const event of events) {
      for (const registration of event.registrations) {
        await this.emailService.sendEventReminder(
          registration.attendee.email,
          event.name,
          event.date,
        );
      }
    }
  }
} 