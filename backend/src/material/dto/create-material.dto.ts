import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({ example: '三年级数学课件' })
  @IsString()
  title!: string;

  @ApiProperty({ example: '数学' })
  @IsString()
  subject!: string;

  @ApiProperty({ example: '三年级' })
  @IsString()
  grade!: string;

  @ApiProperty({ example: '课件' })
  @IsString()
  type!: string;

  @ApiProperty({ example: '三年级数学上册第一单元课件', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
