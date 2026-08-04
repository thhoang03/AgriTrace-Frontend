import type { UserRole, OrganizationType, EventType } from "./auth.types";

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/inspection", "/app/recall",
    "/app/reports", "/app/organizations", "/app/categories",
    "/app/users", "/app/products", "/app/profile",
    "/app/analytics", "/app/notifications",
  ],
  MANAGER: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/recall",
    "/app/reports", "/app/categories",
    "/app/users", "/app/products", "/app/profile",
    "/app/analytics", "/app/notifications",
  ],
  STAFF: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/profile",
    "/app/notifications",
  ],
};

export const ORG_EVENT_PERMISSIONS: Record<OrganizationType, EventType[]> = {
  FARM: ["HARVEST"],
  PROCESSOR: ["RECEIVE", "PROCESSING", "PACKAGING", "SPLIT", "MERGE"],
  DISTRIBUTOR: ["RECEIVE", "TRANSPORT", "DISTRIBUTION", "SPLIT", "MERGE"],
  RETAILER: ["RECEIVE", "RETAIL", "SPLIT"],
  INSPECTION: ["INSPECTION"],
  SYSTEM: ["HARVEST", "RECEIVE", "PROCESSING", "PACKAGING", "TRANSPORT", "DISTRIBUTION", "RETAIL", "INSPECTION", "RECALL", "SPLIT", "MERGE"],
};

export const RECALL_CREATOR_ROLES: UserRole[] = ["ADMIN"];
export const RECALL_REQUESTER_ORG_TYPES: OrganizationType[] = ["SYSTEM"];

export function canAccessRoute(
  role: UserRole | undefined,
  path: string,
  organizationType?: OrganizationType
): boolean {
  if (!role) return false;

  if (path === "/app/inspection" || path.startsWith("/app/inspection/")) {
    return role === "ADMIN" || organizationType === "INSPECTION";
  }

  // Batch Management (/app/batches) is accessible ONLY by ADMIN or FARM (Farmer) organization type
  if (path === "/app/batches" || path.startsWith("/app/batches/")) {
    return role === "ADMIN" || organizationType === "FARM";
  }

  // Supply Chain (/app/supply-chain) is hidden/disabled for INSPECTION (Inspector) organization type
  if (path === "/app/supply-chain" || path.startsWith("/app/supply-chain/")) {
    if (organizationType === "INSPECTION") return false;
  }

  const allowed = ROLE_ACCESS[role] || [];
  return allowed.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

export function canCreateEvent(
  orgType: OrganizationType | undefined,
  eventType: EventType,
  role?: UserRole,
  extraAllowedEvents?: EventType[]
): boolean {
  if (role === "ADMIN") return true;
  if (!orgType) return false;
  const baseAllowed = ORG_EVENT_PERMISSIONS[orgType] || [];
  const extraAllowed = extraAllowedEvents || [];
  return baseAllowed.includes(eventType) || extraAllowed.includes(eventType);
}

export function getAllowedEventTypes(
  orgType: OrganizationType | undefined,
  role?: UserRole,
  extraAllowedEvents?: EventType[]
): EventType[] {
  if (role === "ADMIN") {
    return [
      "HARVEST", "RECEIVE", "PROCESSING", "PACKAGING", "TRANSPORT",
      "DISTRIBUTION", "RETAIL", "INSPECTION", "RECALL", "SPLIT", "MERGE"
    ];
  }
  if (!orgType) return [];
  const baseAllowed = ORG_EVENT_PERMISSIONS[orgType] || [];
  const extraAllowed = extraAllowedEvents || [];
  return Array.from(new Set([...baseAllowed, ...extraAllowed]));
}
