# پروژه سامانه سلامت (Health System Project)

این پروژه یک سامانه مدیریت سلامت جامع است که با استفاده از تکنولوژی‌های مدرن وب توسعه یافته است.

## تکنولوژی‌های مورد استفاده (Tech Stack)

- **Next.js 16**: فریم‌ورک React برای توسعه سمت سرور و کلاینت.
- **Prisma**: ORM برای مدیریت پایگاه داده.
- **Tailwind CSS**: برای طراحی رابط کاربری زیبا و ریسپانسیو.
- **Radix UI**: مجموعه‌ای از کامپوننت‌های دسترسی‌پذیر و بدون استایل.
- **Lucide React**: برای آیکون‌های زیبا و سبک.
- **Zod**: برای اعتبارسنجی داده‌ها.

## ساختار پروژه (Project Structure)

ساختار پروژه به صورت منظم و طبق استانداردهای روز سازماندهی شده است:

- `src/`: شامل کدهای منبع اصلی پروژه (app, components, lib, etc.)
- `docs/`: مستندات پروژه و راهنمای استفاده.
- `tests/`: تست‌های واحد و یکپارچه‌سازی.
- `public/`: فایل‌های استاتیک و عمومی.

## نحوه راه‌اندازی (Getting Started)

1. ابتدا وابستگی‌ها را نصب کنید:
   ```bash
   npm install
   ```

2. فایل `.env` را بر اساس نیاز خود تنظیم کنید.

3. دیتابیس را آماده کنید:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. سرور توسعه را اجرا کنید:
   ```bash
   npm run dev
   ```

## برنچ‌بندی (Branching Strategy)

- **main**: نسخه پایدار و نهایی پروژه.
- **develop**: نسخه‌های در حال توسعه.

---

This is a comprehensive Health Management System built with modern web technologies.

## Features

- Doctor and Patient management.
- Diet plan generation.
- Real-time chat integration.
- Responsive design.

## License

این پروژه تحت لایسنس MIT است.
