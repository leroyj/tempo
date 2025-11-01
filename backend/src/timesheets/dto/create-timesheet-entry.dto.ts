import { IsUUID, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTimesheetEntryDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subactivity?: string;

  @ApiProperty({ example: 0.25, description: 'Valeur en jours (0, 0.25, 0.5, 0.75, 1, etc.)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monday: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  tuesday: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  wednesday: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  thursday: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  friday: number;
}

