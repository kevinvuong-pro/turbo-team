import { GetWeekComparisonResponse, GetWeekStatsResponse } from '@/types';
import { apiClient } from '@/lib/api-client';
import { handleApiError } from '@/lib/error-handler';

const getWeekStats = async () => {
  try {
    const response: GetWeekStatsResponse = await apiClient.get('/stats/week');

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

const getWeekComparison = async () => {
  try {
    const response: GetWeekComparisonResponse = await apiClient.get('/stats/week/compare');

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export { getWeekComparison, getWeekStats };
