import { Injectable } from '@nestjs/common';
import { DailyRevenue } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { UpsertDailyRevenueDto } from '@/daily-revenue/dto/upsert-daily-revenue.dto';
import {
  EventImpact,
  addUtcDays,
  formatDateOnly,
  getMondayOfWeek,
  getWeekDates,
  parseDateOnly,
  roundCurrency,
  roundPercent,
  toNumber,
} from '@/daily-revenue/daily-revenue.util';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type SerializedDailyRevenue = {
  id: string;
  date: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
};

type WeekDay = {
  date: string;
  dayOfWeek: (typeof DAY_LABELS)[number];
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
  totalRevenue: number;
  eventImpact: EventImpact;
};

type WeekSummary = {
  totalRevenue: number;
  averagePerDay: number;
  totalCovers: number;
};

type WeekStats = {
  weekStart: string;
  weekEnd: string;
  summary: WeekSummary;
  days: WeekDay[];
};

@Injectable()
export class DailyRevenueService {
  constructor(private readonly prisma: PrismaService) {}

  async getByDate(date: string) {
    const record = await this.prisma.dailyRevenue.findUnique({
      where: { date: parseDateOnly(date) },
    });

    return {
      exists: Boolean(record),
      data: record ? this.serialize(record) : null,
    };
  }

  async upsert(dto: UpsertDailyRevenueDto) {
    const date = parseDateOnly(dto.date);

    const record = await this.prisma.dailyRevenue.upsert({
      where: { date },
      create: {
        date,
        posRevenue: dto.posRevenue,
        eatclubRevenue: dto.eatclubRevenue,
        labourCosts: dto.labourCosts,
      },
      update: {
        posRevenue: dto.posRevenue,
        eatclubRevenue: dto.eatclubRevenue,
        labourCosts: dto.labourCosts,
      },
    });

    return this.serialize(record);
  }

  async getCurrentWeek() {
    const monday = getMondayOfWeek();

    return this.buildWeekStats(monday);
  }

  async getCurrentWeekComparison() {
    const currentMonday = getMondayOfWeek();
    const previousMonday = addUtcDays(currentMonday, -7);
    const current = await this.buildWeekStats(currentMonday);
    const previous = await this.buildWeekStats(previousMonday);

    return {
      current,
      previous,
      comparison: {
        totalRevenue: this.compareMetric(
          current.summary.totalRevenue,
          previous.summary.totalRevenue,
        ),
        averagePerDay: this.compareMetric(
          current.summary.averagePerDay,
          previous.summary.averagePerDay,
        ),
        totalCovers: this.compareMetric(current.summary.totalCovers, previous.summary.totalCovers),
      },
    };
  }

  private async buildWeekStats(monday: Date): Promise<WeekStats> {
    const dates = getWeekDates(monday);
    const previousDates = getWeekDates(addUtcDays(monday, -7));
    const records = await this.prisma.dailyRevenue.findMany({
      where: {
        date: {
          gte: previousDates[0],
          lte: dates[6],
        },
      },
    });
    const byDate = new Map(records.map((record) => [formatDateOnly(record.date), record]));

    const days: WeekDay[] = dates.map((date, index) => {
      const current = byDate.get(formatDateOnly(date));
      const previous = byDate.get(formatDateOnly(previousDates[index]));
      const posRevenue = roundCurrency(toNumber(current?.posRevenue));
      const eatclubRevenue = roundCurrency(toNumber(current?.eatclubRevenue));
      const labourCosts = roundCurrency(toNumber(current?.labourCosts));
      const covers = current?.covers ?? 0;
      const totalRevenue = roundCurrency(posRevenue + eatclubRevenue);
      const previousTotal = previous
        ? roundCurrency(toNumber(previous.posRevenue) + toNumber(previous.eatclubRevenue))
        : 0;

      return {
        date: formatDateOnly(date),
        dayOfWeek: DAY_LABELS[index],
        posRevenue,
        eatclubRevenue,
        labourCosts,
        covers,
        totalRevenue,
        eventImpact: this.resolveEventImpact(totalRevenue, previousTotal, Boolean(previous)),
      };
    });

    const totalRevenue = roundCurrency(days.reduce((sum, day) => sum + day.totalRevenue, 0));
    const totalCovers = days.reduce((sum, day) => sum + day.covers, 0);

    return {
      weekStart: formatDateOnly(dates[0]),
      weekEnd: formatDateOnly(dates[6]),
      summary: {
        totalRevenue,
        averagePerDay: Math.round(totalRevenue / 7),
        totalCovers,
      },
      days,
    };
  }

  private resolveEventImpact(
    currentTotal: number,
    previousTotal: number,
    hasPrevious: boolean,
  ): EventImpact {
    if (!hasPrevious || currentTotal === previousTotal) return null;

    return currentTotal > previousTotal ? 'positive' : 'negative';
  }

  private compareMetric(current: number, previous: number) {
    const percentChange =
      previous === 0
        ? current === 0
          ? 0
          : 100
        : roundPercent(((current - previous) / previous) * 100);

    return { current, previous, percentChange };
  }

  private serialize(record: DailyRevenue): SerializedDailyRevenue {
    return {
      id: record.id,
      date: formatDateOnly(record.date),
      posRevenue: roundCurrency(toNumber(record.posRevenue)),
      eatclubRevenue: roundCurrency(toNumber(record.eatclubRevenue)),
      labourCosts: roundCurrency(toNumber(record.labourCosts)),
      covers: record.covers,
    };
  }
}
