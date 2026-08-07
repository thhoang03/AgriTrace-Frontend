import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../notifications/notifications.api";

const QUERY_KEY = "dashboard";

const ACTIVITY_ICONS = [
  "batch_created", "batch_updated", "recall_issued", "inspection_completed", "user_joined",
] as const;

export interface DashboardActivity {
  id: string;
  type: typeof ACTIVITY_ICONS[number];
  message: string;
  rawTitle?: string;
  rawMessage?: string;
  timestamp: string;
  userId: string;
  userName: string;
}

function inferActivityType(title: string, message: string): DashboardActivity["type"] {
  const text = `${title} ${message}`.toLowerCase();
  if (text.includes("recall")) return "recall_issued";
  if (text.includes("inspection") || text.includes("inspector")) return "inspection_completed";
  if (text.includes("batch") && (text.includes("update") || text.includes("edit") || text.includes("change"))) return "batch_updated";
  if (text.includes("batch") || text.includes("create")) return "batch_created";
  if (text.includes("user") || text.includes("joined") || text.includes("register")) return "user_joined";
  return "batch_updated";
}

export function useRecentActivities() {
  return useQuery({
    queryKey: [QUERY_KEY, "recent-activities"],
    queryFn: async () => {
      const result = await notificationsApi.getAll({ pageSize: 5 });
      const items = result.data?.items ?? [];
      return items.map((n): DashboardActivity => ({
        id: String(n.notificationId),
        type: inferActivityType(n.title ?? "", n.message ?? ""),
        message: n.title && n.message ? `${n.title}: ${n.message}` : (n.title ?? n.message ?? ""),
        rawTitle: n.title,
        rawMessage: n.message,
        timestamp: n.createdAt ?? new Date().toISOString(),
        userId: n.userId ?? "",
        userName: "",
      }));
    },
    refetchInterval: 60_000,
  });
}
