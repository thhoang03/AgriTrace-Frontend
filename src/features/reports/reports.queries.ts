import { useQuery, useMutation } from "@tanstack/react-query";
import { reportsApi } from "./reports.api";
import type { GenerateReportRequest } from "./reports.types";

const QUERY_KEY = "reports";

export function useReports() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => reportsApi.list(),
  });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (data: GenerateReportRequest) => reportsApi.generate(data),
  });
}
