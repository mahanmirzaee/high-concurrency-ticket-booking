import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { BullModule } from '@nestjs/bullmq';
import { BookingProcessor } from './booking.processor';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    // ثبت صف اختصاصی صندلی‌ها
    BullModule.registerQueue({
      name: 'seat-hold-queue',
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingProcessor],
  exports: [BookingService],
})
export class BookingModule {}
