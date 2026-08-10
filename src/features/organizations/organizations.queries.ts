import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "./organizations.api";

export function useOrganizationsList(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  organizationTypeId?: string;
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["organizations", "list", params],
    queryFn: () => organizationsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
