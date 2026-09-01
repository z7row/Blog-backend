import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class CreateBlogDto {
  @ApiProperty({ example: 'title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'the content' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ example: 'the content' })
  @IsString()
  @IsNotEmpty()
  category!: string;


  @ApiProperty({ enum: ["post" , "blog"]})
  @IsString()
  @IsIn(["post", "blog"])
  type!: string;

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