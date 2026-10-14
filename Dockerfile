# ------------------------------------
# مرحله ۱: ساخت و کامپایل پروژه (Build Stage)
# ------------------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# کپی فایل‌های مدیریت پکیج
COPY package*.json ./
COPY prisma ./prisma/

# نصب پکیج‌ها و تولید کلاینت پریزما
RUN npm ci
RUN npx prisma generate

# کپی کل سورس‌کد و ساخت خروجی پروداکشن
COPY . .
RUN npm run build

# ------------------------------------
# مرحله ۲: ایمیج نهایی پروداکشن (Production Stage)
# ------------------------------------
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# نصب بسته‌های ضروری سیستمی
RUN apk add --no-cache openssl

# کپی فایل‌های بیلدشده و پکیج‌ها از مرحله قبلی
COPY package*.json ./
COPY prisma ./prisma/

# نصب فقط پکیج‌های وابسته محیط پروداکشن
RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

# پورت پیش‌فرض
EXPOSE 3000

# فرمان استارت سرور
CMD ["sh", "-c", "if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]