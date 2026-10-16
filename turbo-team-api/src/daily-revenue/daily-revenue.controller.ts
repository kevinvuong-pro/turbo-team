import { Body, Controller, Get, HttpCode, HttpStatus, Put, Query } from '@nestjs/common';

import { DailyRevenueService } from '@/daily-revenue/daily-revenue.service';
import { GetDailyRevenueDto } from '@/daily-revenue/dto/get-daily-revenue.dto';
import { UpsertDailyRevenueDto } from '@/daily-revenue/dto/upsert-daily-revenue.dto';

@Controller('daily-revenues')
export class DailyRevenueController {
  constructor(private readonly dailyRevenueService: DailyRevenueService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getByDate(@Query() query: GetDailyRevenueDto) {
    return this.dailyRevenueService.getByDate(query.date);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() dto: UpsertDailyRevenueDto) {
    return this.dailyRevenueService.upsert(dto);
  }
}
