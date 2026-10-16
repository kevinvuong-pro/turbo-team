import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { StatsController } from '@/daily-revenue/stats.controller';
import { DailyRevenueService } from '@/daily-revenue/daily-revenue.service';
import { DailyRevenueController } from '@/daily-revenue/daily-revenue.controller';

@Module({
  imports: [PrismaModule],
  providers: [DailyRevenueService],
  controllers: [DailyRevenueController, StatsController],
})
export class DailyRevenueModule {}
