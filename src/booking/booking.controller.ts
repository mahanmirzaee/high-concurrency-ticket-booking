import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { HoldSeatDto } from './dto/hold-seat.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('hold')
  @ApiOperation({ summary: 'قفل موقت صندلی با Redis (مهلت ۱۰ دقیقه)' })
  async holdSeat(@Body() dto: HoldSeatDto, @Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.holdSeat(dto, userId);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'ثبت قطعی و نهایی‌سازی خرید بلیت در دیتابیس' })
  async confirmBooking(@Body() dto: ConfirmBookingDto, @Req() req: any) {
    const userId = req.user.id;
    return this.bookingService.confirmBooking(dto, userId);
  }
}
