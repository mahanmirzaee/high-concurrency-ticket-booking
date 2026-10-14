import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { HoldSeatDto } from './dto/hold-seat.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    @InjectQueue('seat-hold-queue') private readonly seatQueue: Queue, // تزریق صف
  ) {}

  // ۱. منطق قفل موقت صندلی (Hold) به همراه ثبت در صف تاخیری
  async holdSeat(dto: HoldSeatDto, userId: string) {
    const { showtimeId, seatId } = dto;

    // الف) بررسی وجود صندلی و سانس
    const seat = await this.prisma.seat.findFirst({
      where: { id: seatId, showtimeId },
    });

    if (!seat) {
      throw new NotFoundException('صندلی مورد نظر در این سانس یافت نشد');
    }

    // ب) بررسی لایه دیتابیس (Defense in Depth)
    const confirmedBooking = await this.prisma.booking.findFirst({
      where: {
        showtimeId,
        seatId,
        status: 'CONFIRMED',
      },
    });

    if (confirmedBooking) {
      throw new ConflictException(
        'این صندلی قبلاً به صورت قطعی فروخته شده است',
      );
    }

    // ج) قفل اتمیک در Redis به مدت ۶۰۰ ثانیه (۱۰ دقیقه)
    const holdTtlSeconds = 600;
    const lockAcquired = await this.redisService.acquireSeatHold(
      showtimeId,
      seatId,
      userId,
      holdTtlSeconds,
    );

    if (!lockAcquired) {
      throw new ConflictException(
        'این صندلی در حال حاضر توسط کاربر دیگری در حال خرید است',
      );
    }

    // د) افزودن کار تاخیری به صف BullMQ (اجرا سر ۱۰ دقیقه)
    await this.seatQueue.add(
      'check-hold-expiration',
      { showtimeId, seatId, userId },
      {
        delay: holdTtlSeconds * 1000, // تبدیل ثانیه به میلی‌ثانیه برای BullMQ
        removeOnComplete: true, // پاک کردن کار از صف پس از پایان موفق
      },
    );

    return {
      message: 'صندلی به مدت ۱۰ دقیقه برای شما رزرو موقت شد',
      showtimeId,
      seatId,
      expiresInSeconds: holdTtlSeconds,
    };
  }

  // ۲. منطق تایید و ثبت نهایی بلیت (Confirm)
  async confirmBooking(dto: ConfirmBookingDto, userId: string) {
    const { showtimeId, seatId } = dto;

    // الف) استعلام از Redis
    const currentHolder = await this.redisService.getSeatHolder(
      showtimeId,
      seatId,
    );

    if (!currentHolder || currentHolder !== userId) {
      throw new BadRequestException(
        'مهلت رزرو موقت شما به پایان رسیده یا صندلی متعلق به شما نیست',
      );
    }

    // ب) تراکنش ACID در PostgreSQL
    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          showtimeId,
          seatId,
          status: 'CONFIRMED',
        },
      });

      return newBooking;
    });

    // ج) آزادسازی کلید ردیس
    await this.redisService.releaseSeatHold(showtimeId, seatId);

    return {
      message: 'خرید بلیت با موفقیت نهایی شد',
      bookingId: booking.id,
      status: booking.status,
    };
  }
}
