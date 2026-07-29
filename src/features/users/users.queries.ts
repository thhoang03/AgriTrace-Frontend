import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "./users.api";
import type { UpdateUserRequest, UserFilters } from "./users.types";

const QUERY_KEY = "users";

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => usersApi.getAll(filters),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}


export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useToggleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.toggleStatus(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
