import { Injectable } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { CatalogService } from '../catalog/catalog.service';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class AgentService {
  private ai: GoogleGenAI;

  constructor(
    private readonly catalogService: CatalogService,
    private readonly bookingService: BookingService,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  // ۱. تعریف مشخصات ابزارهای رزرو (Tool Declarations)
  private getBookingTools(): any[] {
    return [
      {
        name: 'get_events_and_showtimes',
        description:
          'دریافت لیست تمام رویدادها، فیلم‌ها و سانس‌های موجود به همراه شناسه‌های آنها',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        },
      },
      {
        name: 'get_showtime_seats',
        description:
          'مشاهده لیست صندلی‌های یک سانس مشخص و بررسی وضعیت آزاد بودن آنها',
        parameters: {
          type: Type.OBJECT,
          properties: {
            showtimeId: {
              type: Type.STRING,
              description: 'شناسه سانس مورد نظر (UUID)',
            },
          },
          required: ['showtimeId'],
        },
      },
      {
        name: 'hold_seat',
        description:
          'رزرو موقت و قفل کردن یک صندلی مشخص به مدت ۱۰ دقیقه برای پرداخت',
        parameters: {
          type: Type.OBJECT,
          properties: {
            showtimeId: {
              type: Type.STRING,
              description: 'شناسه سانس (UUID)',
            },
            seatId: {
              type: Type.STRING,
              description: 'شناسه صندلی (UUID)',
            },
          },
          required: ['showtimeId', 'seatId'],
        },
      },
    ];
  }

  // ۲. پردازش پیام در چرخه چندمرحله‌ای (Multi-turn Tool Execution)
  async processMessage(userMessage: string, userId: string): Promise<string> {
    const tools = this.getBookingTools();
    const targetModel = 'gemini-3.8-flash';

    // تاریخچه تعاملات این درخواست
    const contents: any[] = [{ role: 'user', parts: [{ text: userMessage }] }];

    const config = {
      systemInstruction: `
        تو یک دستیار هوشمند، بسیار مودب و دقیق برای سامانه رزرواسیون بلیت سینما هستی.
        قوانین:
        ۱. برای بررسی فیلم‌ها و وضعیت صندلی‌ها و رزرو حتماً از ابزارها استفاده کن.
        ۲. از خودت هیچ شناسه صندلی یا سانسی نساز.
        ۳. پس از قفل صندلی با hold_seat به کاربر اطلاع بده صندلی برای ۱۰ دقیقه رزرو موقت شد.
        ۴. پاسخ نهایی را به صورت کامل، روان و فارسی ارائه کن.
      `,
      tools: [{ functionDeclarations: tools }] as any,
    };

    // حلقه تکرار برای پشتیبانی از چند ابزار متوالی (حداکثر ۵ دور جهت جلوگیری از حلقه بی‌نهایت)
    let turns = 0;
    while (turns < 5) {
      turns++;

      const response = await this.ai.models.generateContent({
        model: targetModel,
        contents,
        config,
      });

      const candidate = response.candidates?.[0];
      if (!candidate || !candidate.content) {
        break;
      }

      // افزودن پاسخ کامل مدل (همراه با امضای تفکر) به تاریخچه
      contents.push(candidate.content);

      const functionCalls = response.functionCalls;

      // اگر مدل دیگر ابزاری صدا نزد، یعنی پاسخ متنی نهایی آماده است
      if (!functionCalls || functionCalls.length === 0) {
        return response.text || 'درخواست شما بررسی شد.';
      }

      // اجرای ابزار درخواست‌شده توسط مدل در لایه بک‌اند
      const call = functionCalls[0];
      let toolResult: any;

      try {
        if (call.name === 'get_events_and_showtimes') {
          toolResult = await this.catalogService.getEvents();
        } else if (call.name === 'get_showtime_seats') {
          const { showtimeId } = call.args as { showtimeId: string };
          toolResult = await this.catalogService.getSeatsByShowtime(showtimeId);
        } else if (call.name === 'hold_seat') {
          const { showtimeId, seatId } = call.args as {
            showtimeId: string;
            seatId: string;
          };
          toolResult = await this.bookingService.holdSeat(
            { showtimeId, seatId },
            userId,
          );
        }
      } catch (error: any) {
        toolResult = { error: error.message || 'خطا در اجرای ابزار' };
      }

      // برگرداندن پاسخ ابزار به تاریخچه گفتگو برای نوبت بعدی مدل
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: call.name,
              response: { result: toolResult },
            },
          },
        ],
      });
    }

    return 'عملیات با موفقیت پردازش شد.';
  }
}
