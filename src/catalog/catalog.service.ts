import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // دریافت تمام فیلم‌ها همراه با سانس‌های آن‌ها
  async getEvents() {
    return this.prisma.event.findMany({
      include: {
        showtimes: true,
      },
    });
  }

  // بررسی وضعیت صندلی‌های یک سانس (آزاد، Hold یا قطعی)
  async getSeatsByShowtime(showtimeId: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        seats: true,
        bookings: {
          where: { status: 'CONFIRMED' },
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException('سانس مورد نظر یافت نشد');
    }

    const { seats, bookings } = showtime;

    // شناسه‌های صندلی‌هایی که در PostgreSQL رزرو قطعی شده‌اند
    const confirmedSeatIds = new Set(bookings.map((b) => b.seatId));

    // استخراج وضعیت هر صندلی با ترکیب دیتابیس و قفل موقت ردیس
    const seatsWithStatus = await Promise.all(
      seats.map(async (seat) => {
        const { id, seatNumber, type } = seat;

        if (confirmedSeatIds.has(id)) {
          return { id, seatNumber, type, status: 'BOOKED' };
        }

        // بررسی اینکه آیا صندلی هم‌اکنون در حافظه ردیس Hold شده است؟
        const holderId = await this.redisService.getSeatHolder(showtimeId, id);
        if (holderId) {
          return { id, seatNumber, type, status: 'HELD' };
        }

        return { id, seatNumber, type, status: 'AVAILABLE' };
      }),
    );

    return {
      showtimeId,
      startTime: showtime.startTime,
      price: showtime.price,
      seats: seatsWithStatus,
    };
  }
}
