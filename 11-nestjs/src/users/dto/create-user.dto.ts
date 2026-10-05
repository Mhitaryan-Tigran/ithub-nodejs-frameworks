import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'alice@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Alice', minLength: 2, maxLength: 50 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(2, 50)
  name!: string;

  @ApiProperty({ example: 'Password123', minLength: 8, description: 'At least 8 characters with letters and digits' })
  @IsString()
  @Length(8, 72)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, { message: 'password must contain letters and digits' })
  password!: string;

  @ApiProperty({ enum: ['USER', 'ADMIN'], default: 'USER', required: false })
  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: string;
}
