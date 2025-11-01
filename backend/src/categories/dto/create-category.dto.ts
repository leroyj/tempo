import { IsString, IsBoolean, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'PROJET_A' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Projet A' })
  @IsString()
  label: string;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ required: false, description: 'ID de la catégorie parente pour sous-activité' })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  displayOrder?: number;
}

