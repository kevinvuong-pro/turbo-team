import {
  GetDailyRevenueResponse,
  UpsertDailyRevenueRequest,
  UpsertDailyRevenueResponse,
} from '@/types';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/error-handler';

const getDailyRevenue = async (date: string) => {
  try {
    const response: GetDailyRevenueResponse = await apiClient.get('/daily-revenues', {
      params: { date },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

const upsertDailyRevenue = async (data: UpsertDailyRevenueRequest) => {
  try {
    const response: UpsertDailyRevenueResponse = await apiClient.put('/daily-revenues', data);

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export { getDailyRevenue, upsertDailyRevenue };
