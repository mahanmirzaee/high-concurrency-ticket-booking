import 'dotenv/config';
import { PrismaClient, SeatType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 در حال تزریق داده‌های آزمایشی به پایگاه داده...');

  // ۱. ساخت رویداد (فیلم سینمایی)
  const event = await prisma.event.create({
    data: {
      title: 'Interstellar (میان‌ستاره‌ای)',
      description: 'یک فیلم علمی‌تخیلی به کارگردانی کریستوفر نولان',
      durationMin: 169,
    },
  });

  // ۲. ساخت یک سانس برای فردا ساعت ۲۰:۰۰
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0);

  const showtime = await prisma.showtime.create({
    data: {
      eventId: event.id,
      startTime: tomorrow,
      price: 150000, // مبلغ به تومان
    },
  });

  // ۳. تولید ۱۰ صندلی (از A1 تا A10) برای این سانس
  const seatsData: any[] = [];
  for (let i = 1; i <= 10; i++) {
    seatsData.push({
      seatNumber: `A${i}`,
      type: SeatType.STANDARD,
      showtimeId: showtime.id,
    });
  }

  await prisma.seat.createMany({
    data: seatsData,
  });

  console.log('✅ داده‌های اولیه با موفقیت ثبت شدند:');
  console.log(`🎬 فیلم: ${event.title} (شناسه: ${event.id})`);
  console.log(
    `⏰ سانس: ${showtime.startTime.toISOString()} (شناسه: ${showtime.id})`,
  );
  console.log(`💺 تعداد ۱۰ صندلی از A1 تا A10 ثبت شد.`);
}

main()
  .catch((e) => {
    console.error('❌ خطا در Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
