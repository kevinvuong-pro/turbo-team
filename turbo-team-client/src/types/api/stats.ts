import { SuccessResponse } from '../';

type EventImpact = 'positive' | 'negative' | null;

interface WeekDayStats {
  date: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
  totalRevenue: number;
  eventImpact: EventImpact;
}

interface WeekSummary {
  totalRevenue: number;
  averagePerDay: number;
  totalCovers: number;
}

interface WeekStats {
  weekStart: string;
  weekEnd: string;
  summary: WeekSummary;
  days: WeekDayStats[];
}

interface MetricComparison {
  current: number;
  previous: number;
  percentChange: number;
}

interface WeekComparison {
  current: WeekStats;
  previous: WeekStats;
  comparison: {
    totalRevenue: MetricComparison;
    averagePerDay: MetricComparison;
    totalCovers: MetricComparison;
  };
}

interface GetWeekStatsResponse extends SuccessResponse<WeekStats> {}
interface GetWeekComparisonResponse extends SuccessResponse<WeekComparison> {}

export type {
  EventImpact,
  GetWeekComparisonResponse,
  GetWeekStatsResponse,
  MetricComparison,
  WeekComparison,
  WeekDayStats,
  WeekStats,
  WeekSummary,
};
