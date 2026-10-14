import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatPromptDto {
  @ApiProperty({
    description: 'پیام متنی کاربر به زبان طبیعی',
    example:
      'سلام، صندلی A2 رو برای سانس فردا شب فیلم Interstellar برام رزرو کن',
  })
  @IsString()
  @IsNotEmpty({ message: 'متن درخواست نمی‌تواند خالی باشد' })
  message: string;
}
