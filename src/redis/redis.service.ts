import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    // اتصال به کانتینر ردیس در داکر
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.client.on('connect', () => {
      console.log('اتصال به Redis با موفقیت برقرار شد');
    });

    this.client.on('error', (err) => {
      console.error('❌ خطای اتصال به Redis:', err);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  // ۱. متد قفل کردن اتمیک صندلی
  // خروجی: اگر صندلی آزاد بود true، اگر قبلاً گرفته شده بود false
  async acquireSeatHold(
    showtimeId: string,
    seatId: string,
    userId: string,
    ttlSeconds = 600,
  ) {
    const key = `hold:showtime:${showtimeId}:seat:${seatId}`;

    // دستور اتمیک SET با فلگ‌های NX (عدم وجود) و EX (انقضا به ثانیه)
    const result = await this.client.set(key, userId, 'EX', ttlSeconds, 'NX');

    return result === 'OK';
  }

  // ۲. استعلام مالک فعلی قفل صندلی
  async getSeatHolder(
    showtimeId: string,
    seatId: string,
  ): Promise<string | null> {
    const key = `hold:showtime:${showtimeId}:seat:${seatId}`;
    return this.client.get(key);
  }

  // ۳. آزادسازی دستی صندلی (در صورت انصراف کاربر)
  async releaseSeatHold(showtimeId: string, seatId: string) {
    const key = `hold:showtime:${showtimeId}:seat:${seatId}`;
    await this.client.del(key);
  }
}
