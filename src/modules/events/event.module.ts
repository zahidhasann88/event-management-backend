import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { EventController } from './controllers/event.controller';
import { EventService } from './services/event.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Registration]),
    WebsocketModule,
    CacheModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {} 