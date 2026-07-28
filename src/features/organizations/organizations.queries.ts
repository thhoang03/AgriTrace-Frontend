import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "./organizations.api";

export function useOrganizationsList() {
  return useQuery({
    queryKey: ["organizations", "list"],
    queryFn: () => organizationsApi.getAll({ pageSize: 100 }),
    staleTime: 5 * 60 * 1000,
  });
}
