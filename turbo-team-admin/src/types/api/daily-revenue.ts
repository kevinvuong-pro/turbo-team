import { SuccessResponse } from '../';

interface DailyRevenue {
  id: string;
  date: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
  covers: number;
}

interface DailyRevenueLookup {
  exists: boolean;
  data: DailyRevenue | null;
}

interface UpsertDailyRevenueRequest {
  date: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCosts: number;
}

interface GetDailyRevenueResponse extends SuccessResponse<DailyRevenueLookup> {}
interface UpsertDailyRevenueResponse extends SuccessResponse<DailyRevenue> {}

export type {
  DailyRevenue,
  DailyRevenueLookup,
  GetDailyRevenueResponse,
  UpsertDailyRevenueRequest,
  UpsertDailyRevenueResponse,
};
