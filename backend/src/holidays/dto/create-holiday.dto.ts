import { IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: '2025-01-01' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Jour de l\'an' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'FR', default: 'FR', required: false })
  @IsString()
  @IsOptional()
  country?: string;
}

