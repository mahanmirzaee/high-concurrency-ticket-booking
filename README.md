# 🎟️ High-Concurrency Ticket Booking Engine with Autonomous AI Agent

یک موتور رزرواسیون فوق‌سریع و مقیاس‌پذیر با معماری دفاع در عمق (Defense in Depth) برای مدیریت فروش‌های لحظه‌ای با ترافیک سنگین (Flash Sales)، به همراه دستیار صوتی/متنی مبتنی بر مهندسی عامل‌های هوشمند (Agentic AI).

---

## ⚡ ویژگی‌های کلیدی فنی (Key Architectural Features)

- **Zero-Overselling Concurrency Engine:** استفاده از قفل‌های اتمیک توزیع‌شده با Redis (`SET ... NX EX`) جهت مدیریت رویدادهای همزمانی بدون تحمیل بار سنگین روی دیتابیس رابطه‌ای.
- **ACID Transaction Assurance:** تضمین ثبات داده‌ها با تراکنش‌های سطح ایزولاسیون در PostgreSQL و Prisma ORM.
- **Automated Hold Expiration via BullMQ:** آزادسازی خودکار و بدون خطای صندلی‌های معلق بعد از ۱۰ دقیقه با استفاده از صف‌های تاخیری (Delayed Jobs).
- **Autonomous AI Agent (Zero-Trust Tool Calling):** اتصال به مدل Google Gemini با قابلیت Native Function Calling جهت اجرای سفارش‌ها و استعلام صندلی‌ها به زبان طبیعی، با اعتبارسنجی امن هویت کاربر از طریق هدر Authorization.
- **Race Condition Stress Testing:** دارای اسکریپت تست همزمانی اثبات‌شده با شلیک موازی ۵۰ درخواست بر یک صندلی واحد (نتیجه: ۱ موفق، ۴۹ مسدود).

---

## 🛠️  (Tech Stack)

| لایه معماری | فناوری | نقش در سیستم |
| :--- | :--- | :--- |
| **Framework** | NestJS (TypeScript) | هسته ماژولار و کنترلرها |
| **Database** | PostgreSQL | پایگاه داده پایدار و منبع حقیقت (SSOT) |
| **Cache & Locks** | Redis (ioredis) | قفل موقت اتمیک (Hold) زیر میلی‌ثانیه |
| **Job Queue** | BullMQ | صف تاخیری برای انقضای رزرو موقت |
| **ORM** | Prisma | ارتباط لایه دیتابیس به صورت کاملاً Type-safe |
| **Agentic AI** | Google Gemini SDK | ابزار هوشمند با قابلیت Tool Calling چندمرحله‌ای |
| **Documentation** | Swagger / OpenAPI | مستندسازی تعاملی اندپوینت‌ها |
| **DevOps** | Docker, Compose, GitHub Actions | کانتینرسازی و پایپ‌لاین ادغام مداوم (CI) |

---

## 🚀  (Quick Start)

### ۱. پیش‌نیازها
- نصب بودن داکر (Docker & Docker Compose)
- یک API Key معتبر از Google AI Studio

### ۲. تنظیم متغیرهای محیطی
یک فایل `.env` بر اساس نمونه بسازید:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/ticket_booking_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
JWT_SECRET="super-secret-jwt-key-2026"
GEMINI_API_KEY="your-gemini-api-key"