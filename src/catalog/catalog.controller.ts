import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('events')
  @ApiOperation({ summary: 'دریافت لیست تمام رویدادها به همراه سانس‌ها' })
  async getEvents() {
    return this.catalogService.getEvents();
  }

  @Get('showtimes/:id/seats')
  @ApiOperation({
    summary: 'مشاهده وضعیت صندلی‌های یک سانس (آزاد، قفل موقت یا فروخته‌شده)',
  })
  @ApiParam({ name: 'id', description: 'شناسه سانس (UUID)' })
  async getSeatsByShowtime(@Param('id') showtimeId: string) {
    return this.catalogService.getSeatsByShowtime(showtimeId);
  }
}
