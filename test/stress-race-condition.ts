import axios from 'axios';

// آدرس پایه سرور در حال اجرا
const BASE_URL = 'http://localhost:3000';

async function runRaceConditionTest() {
  console.log(
    '🏁 در حال آماده‌سازی تست شرایط رقابت همزمان (Race Condition Test)...',
  );

  // ۱. ورود کاربر و دریافت توکن معتبر
  let token = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'mahanmirzaee11@gmail.com',
      password: '12345678',
    });
    token = loginRes.data.access_token;
    console.log('🔑 کاربر تست با موفقیت احراز هویت شد.');
  } catch (err: any) {
    console.error(
      '❌ خطا در لاگین! لطفاً مطمئن شوید کاربر john@example.com ثبت شده است.',
    );
    return;
  }

  // ۲. استعلام شناسه‌های معتبر از کاتالوگ
  const eventsRes = await axios.get(`${BASE_URL}/catalog/events`);
  const showtimeId = eventsRes.data[0].showtimes[0].id;

  const seatsRes = await axios.get(
    `${BASE_URL}/catalog/showtimes/${showtimeId}/seats`,
  );

  // انتخاب اولین صندلی خالی
  const availableSeat = seatsRes.data.seats.find(
    (s: any) => s.status === 'AVAILABLE',
  );
  if (!availableSeat) {
    console.error('❌ هیچ صندلی آزادی برای اجرای تست پیدا نشد!');
    return;
  }

  const seatId = availableSeat.id;
  const seatName = availableSeat.seatNumber;
  console.log(
    `🎯 صندلی هدف برای شبیه‌سازی رقابت: ${seatName} (شناسه: ${seatId})`,
  );

  // ۳. آماده‌سازی ۵۰ درخواست همزمان برای قفل کردن یک صندلی واحد!
  const TOTAL_REQUESTS = 50;
  console.log(
    `🚀 در حال شلیک همزمان ${TOTAL_REQUESTS} درخواست برای تصاحب صندلی ${seatName}...`,
  );

  const requests: any[] = [];
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const req = axios
      .post(
        `${BASE_URL}/booking/hold`,
        { showtimeId, seatId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => ({ success: true, status: res.status, data: res.data }))
      .catch((err) => ({
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message,
      }));

    requests.push(req);
  }

  // ۴. ارسال در کسری از میلی‌ثانیه با Promise.all
  const results = await Promise.all(requests);

  // ۵. پردازش و تحلیل آماری نتایج
  const successCount = results.filter((r) => r.success).length;
  const failedCount = results.filter((r) => !r.success).length;

  console.log('\n================ نتایج تست همزمانی ================');
  console.log(`📊 کل درخواست‌های ارسالی: ${TOTAL_REQUESTS}`);
  console.log(`✅ درخواست‌های برنده و موفق (201 Created): ${successCount}`);
  console.log(
    `🛡️ درخواست‌های مسدود و محافظت‌شده (409 Conflict): ${failedCount}`,
  );

  if (successCount === 1 && failedCount === TOTAL_REQUESTS - 1) {
    console.log('\n🏆 نتیجه تست: کاملاً موفق! (Zero Overselling Guarantee)');
    console.log(
      'هیچ شرایط رقابتی رخ نداد و قفل توزیع‌شده ردیس جلوی فروش مضاعف را گرفت.',
    );
  } else {
    console.log('\n⚠️ هشدار: رفتار نامتعارف همزمانی کشف شد!');
  }
}

runRaceConditionTest();
