import type { UserRole, OrganizationType, EventType } from "./auth.types";

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/inspection", "/app/inspections", "/app/recall",
    "/app/reports", "/app/organizations", "/app/organization-approvals", "/app/categories",
    "/app/users", "/app/products", "/app/profile",
    "/app/analytics", "/app/notifications", "/app/change-password",
  ],
  MANAGER: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/inspection", "/app/inspections", "/app/recall",
    "/app/reports", "/app/categories",
    "/app/users", "/app/products", "/app/profile",
    "/app/analytics", "/app/notifications", "/app/change-password",
  ],
  STAFF: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/event-requests", "/app/inspection", "/app/inspections", "/app/profile",
    "/app/notifications", "/app/change-password",
  ],
};

export const ORG_EVENT_PERMISSIONS: Record<OrganizationType, EventType[]> = {
  FARM: ["CREATED", "HARVEST"],
  PROCESSOR: ["RECEIVE", "PROCESSING", "PACKAGING", "SPLIT", "MERGE"],
  DISTRIBUTOR: ["RECEIVE", "TRANSPORT", "DISTRIBUTION", "SPLIT", "MERGE"],
  RETAILER: ["RECEIVE", "RETAIL", "SPLIT"],
  INSPECTION: ["INSPECTION"],
  SYSTEM: ["CREATED", "HARVEST", "RECEIVE", "PROCESSING", "PACKAGING", "TRANSPORT", "DISTRIBUTION", "RETAIL", "INSPECTION", "RECALL", "SPLIT", "MERGE"],
};

export const RECALL_CREATOR_ROLES: UserRole[] = ["ADMIN"];
export const RECALL_REQUESTER_ORG_TYPES: OrganizationType[] = ["SYSTEM"];

export function canAccessRoute(
  role: UserRole | undefined,
  path: string,
  organizationType?: OrganizationType,
  extraAllowedEvents?: EventType[]
): boolean {
  if (!role) return false;

  // Batch Management (/app/batches) is accessible by ADMIN, FARM, or if extraAllowedEvents includes CREATED or HARVEST
  if (path === "/app/batches" || path.startsWith("/app/batches/")) {
    const hasFarmerEvents = (extraAllowedEvents || []).some(
      (e) => e === "CREATED" || e === "HARVEST"
    );
    return role === "ADMIN" || organizationType === "FARM" || hasFarmerEvents;
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
      "CREATED", "HARVEST", "RECEIVE", "PROCESSING", "PACKAGING", "TRANSPORT",
      "DISTRIBUTION", "RETAIL", "INSPECTION", "RECALL", "SPLIT", "MERGE"
    ];
  }
  if (!orgType) return [];
  const baseAllowed = ORG_EVENT_PERMISSIONS[orgType] || [];
  const extraAllowed = extraAllowedEvents || [];
  return Array.from(new Set([...baseAllowed, ...extraAllowed]));
}
