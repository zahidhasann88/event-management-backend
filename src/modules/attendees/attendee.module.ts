import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { AttendeeController } from './controllers/attendee.controller';
import { AttendeeService } from './services/attendee.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendee, Registration]),
    CacheModule,
  ],
  controllers: [AttendeeController],
  providers: [AttendeeService],
  exports: [AttendeeService],
})
export class AttendeeModule {} 