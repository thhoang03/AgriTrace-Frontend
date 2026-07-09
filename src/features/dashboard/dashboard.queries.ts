import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "./dashboard.api";

const QUERY_KEY = "dashboard";

export function useDashboardOverview() {
  return useQuery({
    queryKey: [QUERY_KEY, "overview"],
    queryFn: () => dashboardApi.getOverview(),
    refetchInterval: 30_000,
  });
}
