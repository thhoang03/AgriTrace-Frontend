import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventRequestsApi } from "./event-requests.api";
import type { CreateEventRequestPayload, GetEventRequestsParams } from "./event-requests.api";

const QUERY_KEY = "event-requests";

export function useEventRequests(params?: GetEventRequestsParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => eventRequestsApi.getEventRequests(params),
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateEventRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventRequestPayload) => eventRequestsApi.createEventRequest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useApproveEventRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventRequestsApi.approveEventRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      qc.invalidateQueries({ queryKey: ["supply-chain"] });
    },
  });
}

export function useRejectEventRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      eventRequestsApi.rejectEventRequest(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
