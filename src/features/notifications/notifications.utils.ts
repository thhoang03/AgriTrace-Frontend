export function formatRelativeTime(dateStr: string, lang: string = "en"): string {
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

export function parseLocalizedText(text: string, lang: string): string {
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed[lang] || parsed["en"] || text;
    }
    return text;
  } catch {
    return text;
  }
}

export function notificationTypeRoute(type?: string): string {
  switch ((type ?? "").toUpperCase()) {
    case "RECALL": return "/app/recall";
    case "INSPECTION": return "/app/inspection";
    case "BATCH": return "/app/batches";
    case "CERTIFICATE": return "/app/products";
    default: return "/app/notifications";
  }
}
