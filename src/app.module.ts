import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './core/health/health.module';
import configuration from './config/configuration';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { EventModule } from './modules/events/event.module';
import { AttendeeModule } from './modules/attendees/attendee.module';
import { RegistrationModule } from './modules/registrations/registration.module';
import { EmailModule } from './modules/email/email.module';
import { CacheModule } from './modules/cache/cache.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('bull.redis.host'),
          port: configService.get('bull.redis.port'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    CoreModule,
    SharedModule,
    EventModule,
    AttendeeModule,
    RegistrationModule,
    EmailModule,
    CacheModule,
    WebsocketModule,
  ],
})
export class AppModule {}
