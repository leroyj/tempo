import { IsDateString, IsArray, ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateTimesheetEntryDto } from './create-timesheet-entry.dto';
import { TimesheetStatus } from '../entities/timesheet.entity';

export class CreateTimesheetDto {
  @ApiProperty({ example: '2025-01-06', description: 'Date du lundi de la semaine (format ISO)' })
  @IsDateString()
  weekStartDate: string;

  @ApiProperty({ enum: TimesheetStatus, default: TimesheetStatus.DRAFT, required: false })
  @IsEnum(TimesheetStatus)
  @IsOptional()
  status?: TimesheetStatus;

  @ApiProperty({ type: [CreateTimesheetEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimesheetEntryDto)
  entries: CreateTimesheetEntryDto[];
}

