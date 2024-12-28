import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { EmailService } from '../../modules/email/services/email.service';

@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  constructor(private emailService: EmailService) {
    super();
  }

  async checkHealth(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.emailService.verifyConnection();
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, {
        message: error.message,
      });
    }
  }
} 