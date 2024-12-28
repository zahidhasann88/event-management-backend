import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { BullHealthIndicator } from './bull.health';
import { EmailHealthIndicator } from './email.health';
import { WebSocketHealthIndicator } from './websocket.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private bull: BullHealthIndicator,
    private email: EmailHealthIndicator,
    private websocket: WebSocketHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check all services health' })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
      () => this.bull.checkHealth('bull'),
      () => this.email.checkHealth('email'),
      () => this.websocket.checkHealth('websocket'),
    ]);
  }
} 