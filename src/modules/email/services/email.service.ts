import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  async sendRegistrationConfirmation(email: string, eventName: string, eventDate: Date) {
    await this.emailQueue.add('registration-confirmation', {
      to: email,
      subject: `Registration Confirmed: ${eventName}`,
      template: 'registration-confirmation',
      context: {
        eventName,
        eventDate: eventDate.toLocaleDateString(),
      },
    });
  }

  async sendEventReminder(email: string, eventName: string, eventDate: Date) {
    await this.emailQueue.add('event-reminder', {
      to: email,
      subject: `Reminder: ${eventName} Tomorrow`,
      template: 'event-reminder',
      context: {
        eventName,
        eventDate: eventDate.toLocaleDateString(),
      },
    });
  }

  async sendRegistrationCancellation(email: string, eventName: string, eventDate: Date) {
    await this.emailQueue.add('registration-cancellation', {
      to: email,
      subject: `Registration Cancelled: ${eventName}`,
      template: 'registration-cancellation',
      context: {
        eventName,
        eventDate: eventDate.toLocaleDateString(),
      },
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      throw new Error(`Email service not available: ${error.message}`);
    }
  }
} 