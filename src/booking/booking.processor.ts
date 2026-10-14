import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Processor('seat-hold-queue')
export class BookingProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  // متدی که با رسیدن نوبت هر (Job) در صف اجرا می‌شود
  async process(
    job: Job<{ showtimeId: string; seatId: string; userId: string }>,
  ) {
    const { showtimeId, seatId, userId } = job.data;

    console.log(
      `⏱️ در حال بررسی انقضای قفل صندلی: ${seatId} در سانس: ${showtimeId}`,
    );

    // ۱. بررسی اینکه آیا بلیت در دیتابیس قطعی (CONFIRMED) شده است؟
    const confirmedBooking = await this.prisma.booking.findFirst({
      where: {
        showtimeId,
        seatId,
        status: 'CONFIRMED',
      },
    });

    if (confirmedBooking) {
      console.log(
        `✅ صندلی ${seatId} با موفقیت خریداری شده بود. نیازی به آزادسازی نیست.`,
      );
      return;
    }

    // ۲. بررسی در ردیس: آیا هنوز این صندلی توسط همان کاربر قفل است؟
    const currentHolder = await this.redisService.getSeatHolder(
      showtimeId,
      seatId,
    );
    if (currentHolder === userId) {
      await this.redisService.releaseSeatHold(showtimeId, seatId);
      console.log(
        `🔓 زمان خرید به پایان رسید. صندلی ${seatId} برای سایر کاربران آزاد شد.`,
      );
    }
  }
}
