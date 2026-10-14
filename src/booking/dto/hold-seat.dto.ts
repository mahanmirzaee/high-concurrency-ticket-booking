import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HoldSeatDto {
  @ApiProperty({
    description: 'شناسه سانس (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID('4', { message: 'شناسه سانس باید یک UUID معتبر باشد' })
  @IsNotEmpty()
  showtimeId: string;

  @ApiProperty({
    description: 'شناسه صندلی (UUID)',
    example: 'f1e2d3c4-b5a6-7890-abcd-ef0987654321',
  })
  @IsUUID('4', { message: 'شناسه صندلی باید یک UUID معتبر باشد' })
  @IsNotEmpty()
  seatId: string;
}
