import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ example: 'title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'the content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  banner?: string;


  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  media?: string[];
}