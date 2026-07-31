import { useQuery } from "@tanstack/react-query";
import { organizationTypeApi } from "./organizationType.api";

export function useOrganizationTypes() {
  return useQuery({
    queryKey: ["organization-types"],
    queryFn: organizationTypeApi.getAll,
    staleTime: 30 * 60 * 1000, // lookup data hiếm khi đổi, cache lâu hơn danh sách organizations
  });
}
