import { IsString, IsOptional, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Tech Conference 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Annual technology conference', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-12-25T09:00:00Z' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ example: 'Convention Center', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAttendees: number;
} 