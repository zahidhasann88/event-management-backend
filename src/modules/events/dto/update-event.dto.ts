import { IsString, IsOptional, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Tech Conference 2024' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Annual technology conference' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-12-25T09:00:00Z' })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({ example: 'Convention Center' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxAttendees?: number;
} 