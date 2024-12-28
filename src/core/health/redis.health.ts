import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CacheService } from '../../modules/cache/services/cache.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.cacheService.set('health-check-test', 'ok', 10);
      const result = await this.cacheService.get('health-check-test');
      
      const isHealthy = result === 'ok';

      if (isHealthy) {
        return this.getStatus(key, true);
      }

      throw new Error('Redis check failed');
    } catch (error) {
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false),
      );
    }
  }
} 