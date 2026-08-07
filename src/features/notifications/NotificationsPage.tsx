import { useState } from "react";
import {
  Bell, CheckCircle, AlertTriangle, Package, FlaskConical, Shield,
  RefreshCw, Check, X, Inbox,
} from "lucide-react";
import { notificationsApi } from "./notifications.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "../../contexts/LanguageContext";

type NotifType = "ALL" | "RECALL" | "INSPECTION" | "BATCH" | "SYSTEM" | "CERTIFICATE";

const NOTIF_TYPE_CONFIG: Record<string, {
  icon: React.ElementType; color: string; bg: string; label: string
}> = {
  RECALL:      { icon: AlertTriangle, color: "#C62828", bg: "#FFEBEE", label: "Recall Alert"  },
  INSPECTION:  { icon: FlaskConical,  color: "#1565C0", bg: "#E3F2FD", label: "Inspection"    },
  BATCH:       { icon: Package,       color: "#2E7D32", bg: "#E8F5E9", label: "Batch Update"  },
  SYSTEM:      { icon: Shield,        color: "#6A1B9A", bg: "#F3E5F5", label: "System"        },
  CERTIFICATE: { icon: CheckCircle,   color: "#00695C", bg: "#E0F2F1", label: "Certificate"   },
};

const DEFAULT_CONFIG = { icon: Bell, color: "#6B7280", bg: "#F3F4F6", label: "Notification" };

const BANNER_IMG = "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=1400&q=80";

const FILTER_TABS_EN: { key: NotifType; label: string }[] = [
  { key: "ALL",         label: "All"         },
  { key: "RECALL",      label: "Recall"      },
  { key: "INSPECTION",  label: "Inspection"  },
  { key: "BATCH",       label: "Batch"       },
  { key: "CERTIFICATE", label: "Certificate" },
  { key: "SYSTEM",      label: "System"      },
];
const FILTER_TABS_VI: { key: NotifType; label: string }[] = [
  { key: "ALL",         label: "Tất cả"      },
  { key: "RECALL",      label: "Thu hồi"     },
  { key: "INSPECTION",  label: "Kiểm định"   },
  { key: "BATCH",       label: "Lô hàng"     },
  { key: "CERTIFICATE", label: "Chứng nhận"  },
  { key: "SYSTEM",      label: "Hệ thống"   },
];

function formatRelativeTime(dateStr: string, lang: string = "en"): string {
  try {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return lang === "vi" ? `${s} giây trước` : `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return lang === "vi" ? `${m} phút trước` : `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return lang === "vi" ? `${h} giờ trước` : `${h}h ago`;
    return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function parseLocalizedText(text: string, lang: string): string {
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed[lang] || parsed["en"] || text;
    }
    return text;
  } catch {
    return text; // fallback to raw string if not JSON
  }
}

export function NotificationsPage() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState<NotifType>("ALL");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll({ page: 1, pageSize: 50 }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: any[] = data?.data?.items ?? [];
  const filtered = notifications.filter((n) =>
    filter === "ALL" ? true : (n.type ?? "SYSTEM").toUpperCase() === filter
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="pb-10">
      {/* Banner */}
      <div className="relative h-44 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BANNER_IMG})` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(27,94,32,0.94) 0%, rgba(46,125,50,0.80) 60%, rgba(0,0,0,0.4) 100%)",
          }}
        />
        <div className="relative z-10 h-full flex items-center justify-between px-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-5 h-5 text-green-300" />
              <span className="text-green-200 text-sm font-medium">{lang === "vi" ? "Trung tâm thông báo" : "Notification Center"}</span>
            </div>
            <h1 className="text-white font-extrabold" style={{ fontSize: 26 }}>
              {lang === "vi" ? "Thông Báo" : "Notifications"}
            </h1>
            <p className="text-green-200 text-xs mt-1">
              {lang === "vi" ? "Cập nhật thông tin các sự kiện lô hàng, thu hồi và cảnh báo" : "Stay updated on batch events, recalls, and system alerts"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div
                className="px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#E53935" }}
              >
                {unreadCount} {lang === "vi" ? "chưa đọc" : "unread"}
              </div>
            )}
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {lang === "vi" ? "Đọc tất cả" : "Mark all read"}
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl text-white border border-white/20 hover:bg-white/10 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        {/* Summary stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: lang === "vi" ? "Tổng số" : "Total",       value: notifications.length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: lang === "vi" ? "Chưa đọc" : "Unread",      value: unreadCount,          color: "#E53935", bg: "#FFEBEE" },
            {
              label: lang === "vi" ? "Cảnh báo thu hồi" : "Recall Alerts",
              value: notifications.filter((n) => (n.type ?? "").toUpperCase() === "RECALL").length,
              color: "#C62828", bg: "#FFEBEE",
            },
            {
              label: lang === "vi" ? "Kiểm định" : "Inspections",
              value: notifications.filter((n) => (n.type ?? "").toUpperCase() === "INSPECTION").length,
              color: "#1565C0", bg: "#E3F2FD",
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-5 flex items-center gap-4"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Bell style={{ color, width: 18, height: 18 }} />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
        >
          {/* Filter tabs */}
          <div className="flex items-center gap-1 px-5 pt-5 pb-0 border-b border-gray-100 overflow-x-auto">
            {(lang === "vi" ? FILTER_TABS_VI : FILTER_TABS_EN).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  filter === key
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
                {key === "ALL" && unreadCount > 0 && (
                  <span
                    className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "#E53935" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notification list */}
          {isLoading ? (
            <div className="p-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <X className="w-10 h-10 mb-3 text-red-300" />
              <p className="font-semibold text-red-500">Failed to load notifications</p>
              <button
                onClick={() => refetch()}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: "#2E7D32" }}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Inbox className="w-14 h-14 mb-4 text-gray-300" />
              <p className="font-semibold text-gray-500 text-lg">No notifications</p>
              <p className="text-sm mt-1">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((n: any) => {
                const type = (n.type ?? "SYSTEM").toUpperCase();
                const cfg = NOTIF_TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
                const Icon = cfg.icon;

                return (
                  <div
                    key={n.notificationId}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-gray-50 group ${
                      !n.isRead ? "bg-green-50/30" : ""
                    }`}
                  >
                    {/* Type icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: cfg.bg }}
                    >
                      <Icon style={{ color: cfg.color, width: 18, height: 18 }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {!n.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                            title="Unread"
                          />
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          {formatRelativeTime(n.createdAt, lang)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-1">
                        {parseLocalizedText(n.title, lang) || "System Notification"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{parseLocalizedText(n.message, lang)}</p>
                    </div>

                    {/* Mark as read button (on hover) */}
                    {!n.isRead && (
                      <button
                        onClick={() => markReadMutation.mutate(n.notificationId)}
                        className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 rounded-lg hover:bg-green-100 transition-all"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
