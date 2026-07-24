import type { UserRole, OrganizationType, EventType } from "./auth.types";

export const ROLE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/inspection", "/app/recall",
    "/app/reports", "/app/organizations", "/app/categories",
    "/app/users", "/app/products", "/app/profile",
  ],
  MANAGER: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/reports",
    "/app/users", "/app/products", "/app/profile",
  ],
  STAFF: [
    "/app/dashboard", "/app/batches", "/app/batches/new",
    "/app/supply-chain", "/app/profile",
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

export const RECALL_CREATOR_ROLES: UserRole[] = ["ADMIN", "MANAGER"];
export const RECALL_REQUESTER_ORG_TYPES: OrganizationType[] = [
  "FARM", "PROCESSOR", "DISTRIBUTOR", "RETAILER", "INSPECTION",
];

export function canAccessRoute(role: UserRole | undefined, path: string): boolean {
  if (!role) return false;
  const allowed = ROLE_ACCESS[role] || [];
  return allowed.some(
    (route) => path === route || path.startsWith(route + "/")
  );
}

export function canCreateEvent(
  orgType: OrganizationType | undefined,
  eventType: EventType
): boolean {
  if (!orgType) return false;
  return (ORG_EVENT_PERMISSIONS[orgType] || []).includes(eventType);
}

export function getAllowedEventTypes(orgType: OrganizationType | undefined): EventType[] {
  if (!orgType) return [];
  return ORG_EVENT_PERMISSIONS[orgType] || [];
}
