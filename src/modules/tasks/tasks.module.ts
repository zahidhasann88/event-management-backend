import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { CleanupTask } from './cleanup.task';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [CleanupTask],
})
export class TasksModule {} 