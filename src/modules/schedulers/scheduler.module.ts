import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventReminderScheduler } from './event-reminder.scheduler';
import { Event } from '../events/entities/event.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Event]),
    EmailModule,
  ],
  providers: [EventReminderScheduler],
})
export class SchedulerModule {} 