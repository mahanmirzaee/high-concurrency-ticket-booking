import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmBookingDto {
  @ApiProperty({ description: 'شناسه سانس (UUID)' })
  @IsUUID('4')
  @IsNotEmpty()
  showtimeId: string;

  @ApiProperty({ description: 'شناسه صندلی (UUID)' })
  @IsUUID('4')
  @IsNotEmpty()
  seatId: string;
}
