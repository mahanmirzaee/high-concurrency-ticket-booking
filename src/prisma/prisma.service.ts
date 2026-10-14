import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // ۱. ساخت یک استخر اتصالات (Connection Pool - کانِکشن پول) به سمت دیتابیس
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // ۲. متصل کردن درایور به پریزما (Driver Adapter Pattern)
    const adapter = new PrismaPg(pool);

    // ۳. ارسال تنظیمات آداپتور به کلاینت والد پریزما
    super({ adapter });
  }

  // برقراری ارتباط با دیتابیس در زمان استارت اپلیکیشن
  async onModuleInit() {
    await this.$connect();
  }

  // بستن امن کانکشن‌ها هنگام خاموش شدن سرور (Graceful Shutdown)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
