import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "./analytics.api";
import type {
  AnalyticsOverview,
  BatchDistribution,
  ProcessingTime,
} from "./analytics.types";

export const analyticsQueries = {
  overview: () => ({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.getOverview(),
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  }),

  batchDistribution: (params?: {
    organizationId?: number;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
  }) => ({
    queryKey: ["analytics", "batch-distribution", params],
    queryFn: () => analyticsApi.getBatchDistribution(params),
  }),

  processingTime: (params?: {
    organizationId?: number;
    startDate?: string;
    endDate?: string;
  }) => ({
    queryKey: ["analytics", "processing-time", params],
    queryFn: () => analyticsApi.getProcessingTime(params),
  }),

  traceback: (batchId: string) => ({
    queryKey: ["analytics", "traceback", batchId],
    queryFn: () => analyticsApi.getTraceback(batchId),
    enabled: !!batchId,
  }),
};

export function useAnalyticsOverview() {
  return useQuery(analyticsQueries.overview());
}

export function useBatchDistribution(params?: {
  organizationId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery(analyticsQueries.batchDistribution(params));
}

export function useProcessingTime(params?: {
  organizationId?: number;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery(analyticsQueries.processingTime(params));
}

export function useTraceback(batchId: string) {
  return useQuery(analyticsQueries.traceback(batchId));
}
