import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'ایمیل منحصر‌به‌فرد کاربر',
  })
  @IsEmail({}, { message: 'فرمت ایمیل وارد شده نامعتبر است' })
  email: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'رمز عبور با حداقل ۶ کاراکتر',
  })
  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل شامل ۶ کاراکتر باشد' })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'نام کامل کاربر' })
  @IsString()
  @IsNotEmpty({ message: 'نام کاربر نمی‌تواند خالی باشد' })
  fullName: string;
}
