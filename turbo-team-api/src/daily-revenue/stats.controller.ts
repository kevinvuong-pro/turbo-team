import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { Public } from '@/common/decorators';
import { DailyRevenueService } from '@/daily-revenue/daily-revenue.service';

@Public()
@Controller('stats')
export class StatsController {
  constructor(private readonly dailyRevenueService: DailyRevenueService) {}

  @Get('week')
  @HttpCode(HttpStatus.OK)
  getCurrentWeek() {
    return this.dailyRevenueService.getCurrentWeek();
  }

  @Get('week/compare')
  @HttpCode(HttpStatus.OK)
  getCurrentWeekComparison() {
    return this.dailyRevenueService.getCurrentWeekComparison();
  }
}
