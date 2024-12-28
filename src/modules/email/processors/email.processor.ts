import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';

@Processor('email')
export class EmailProcessor {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      auth: {
        user: this.configService.get('email.user'),
        pass: this.configService.get('email.password'),
      },
    });
  }

  @Process('registration-confirmation')
  async handleRegistrationConfirmation(job: Job) {
    const { to, subject, template, context } = job.data;
    
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject,
      html: this.getRegistrationConfirmationTemplate(context),
    });
  }

  @Process('event-reminder')
  async handleEventReminder(job: Job) {
    const { to, subject, template, context } = job.data;
    
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject,
      html: this.getEventReminderTemplate(context),
    });
  }

  @Process('registration-cancellation')
  async handleRegistrationCancellation(job: Job) {
    const { to, subject, template, context } = job.data;
    
    await this.transporter.sendMail({
      from: this.configService.get('email.from'),
      to,
      subject,
      html: this.getRegistrationCancellationTemplate(context),
    });
  }

  private getRegistrationConfirmationTemplate(context: any): string {
    return `
      <h1>Registration Confirmed!</h1>
      <p>You have successfully registered for ${context.eventName}.</p>
      <p>Event Date: ${context.eventDate}</p>
      <p>We look forward to seeing you there!</p>
    `;
  }

  private getEventReminderTemplate(context: any): string {
    return `
      <h1>Event Reminder</h1>
      <p>This is a reminder that ${context.eventName} is tomorrow!</p>
      <p>Event Date: ${context.eventDate}</p>
      <p>We look forward to seeing you there!</p>
    `;
  }

  private getRegistrationCancellationTemplate(context: any): string {
    return `
      <h1>Registration Cancelled</h1>
      <p>Your registration for ${context.eventName} has been cancelled.</p>
      <p>Event Date: ${context.eventDate}</p>
      <p>If you did not request this cancellation, please contact us.</p>
    `;
  }
} 