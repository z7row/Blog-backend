import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export class CreateUserDto {
  @ApiProperty({ example: 'Zeyad' })
  @IsString()
  name!: string;
  @ApiProperty({ example: 'Zeyad' })
  @IsString()
  pio?: string;


  @ApiProperty({ example: 'Devoloper' })
  @IsString()
  goal?: string;

  @ApiProperty({ example: 'zeyad@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password!: string;



  @ApiProperty({ example: '/src/photo1.png' })
  @IsString()
  @IsOptional()
  profilephoto?: string;

  @ApiProperty({ example: '/src/banner1.png' })
  @IsString()
  @IsOptional()
  banner?: string;

  googleId?: string;
  provider?: string;

}