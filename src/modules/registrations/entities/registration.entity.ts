import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Attendee } from '../../attendees/entities/attendee.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, event => event.registrations, { nullable: false })
  event: Event;

  @Column({ name: 'event_id', nullable: false })
  eventId: string;

  @ManyToOne(() => Attendee, attendee => attendee.registrations, { nullable: false })
  attendee: Attendee;

  @Column({ name: 'attendee_id', nullable: false })
  attendeeId: string;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
} 