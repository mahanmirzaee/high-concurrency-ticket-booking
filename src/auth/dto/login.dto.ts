import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'فرمت ایمیل نامعتبر است' })
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd!' })
  @IsString()
  password: string;
}
