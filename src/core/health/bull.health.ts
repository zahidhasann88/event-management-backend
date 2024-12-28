import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class BullHealthIndicator extends HealthIndicator {
  constructor(@InjectQueue('email') private emailQueue: Queue) {
    super();
  }

  async checkHealth(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.emailQueue.client;
      const isHealthy = client.status === 'ready';

      return this.getStatus(key, isHealthy, {
        queueName: 'email',
        jobCount: await this.emailQueue.count(),
      });
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
      });
    }
  }
} 