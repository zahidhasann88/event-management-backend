import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bull';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health';
import { BullHealthIndicator } from './bull.health';
import { EmailHealthIndicator } from './email.health';
import { WebSocketHealthIndicator } from './websocket.health';
import { EmailModule } from '../../modules/email/email.module';
import { WebsocketModule } from '../../modules/websocket/websocket.module';

@Module({
  imports: [
    TerminusModule,
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    BullHealthIndicator,
    EmailHealthIndicator,
    WebSocketHealthIndicator,
  ],
})
export class HealthModule {} 