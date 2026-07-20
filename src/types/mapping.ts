/**
 * Type mapping file to bridge old manual types with new generated API types
 * This file provides adapters and type aliases for gradual migration
 */

import type { components } from "./api";

// Re-export generated types with simpler names
export type ApiResponse<T = unknown> = components["schemas"]["ApiResponse"];
export type PagedMeta = components["schemas"]["PagedMeta"];
export type LookupItem = components["schemas"]["LookupItem"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type LoginData = components["schemas"]["LoginData"];
export type TokenPair = components["schemas"]["TokenPair"];
export type RefreshTokenRequest = components["schemas"]["RefreshTokenRequest"];
export type ChangePasswordRequest = components["schemas"]["ChangePasswordRequest"];
export type UserBasic = components["schemas"]["UserBasic"];

// Organization types
export type OrganizationRequest = components["schemas"]["OrganizationRequest"];
export type OrganizationDetail = components["schemas"]["OrganizationDetail"];
export type OrganizationListItem = components["schemas"]["OrganizationListItem"];
export type OrganizationPagedResponse = components["schemas"]["OrganizationPagedResponse"];
export type StatusRequest = components["schemas"]["StatusRequest"];

// Category types
export type CategoryRequest = components["schemas"]["CategoryRequest"];
export type CategoryDetail = components["schemas"]["CategoryDetail"];
export type CategoryListItem = components["schemas"]["CategoryListItem"];
export type CategoryPagedResponse = components["schemas"]["CategoryPagedResponse"];

// Product types
export type ProductRequest = components["schemas"]["ProductRequest"];
export type ProductDetail = components["schemas"]["ProductDetail"];
export type ProductListItem = components["schemas"]["ProductListItem"];
export type ProductPagedResponse = components["schemas"]["ProductPagedResponse"];

// User types
export type UserListItem = components["schemas"]["UserListItem"];
export type UserPagedResponse = components["schemas"]["UserPagedResponse"];
export type CreateUserRequest = components["schemas"]["CreateUserRequest"];
export type UpdateUserRequest = components["schemas"]["UpdateUserRequest"];
export type UserStatusRequest = components["schemas"]["UserStatusRequest"];

// Organization types
export type OrganizationCreatedData = components["schemas"]["OrganizationCreatedData"];

// Batch types
export type BatchListItem = components["schemas"]["BatchListItem"];
export type BatchDetail = components["schemas"]["BatchDetail"];
export type BatchPagedResponse = components["schemas"]["BatchPagedResponse"];
export type BatchStatusRequest = components["schemas"]["BatchStatusRequest"];
export type CreateBatchRequest = components["schemas"]["CreateBatchRequest"];
export type UpdateBatchRequest = components["schemas"]["UpdateBatchRequest"];
export type BatchCreatedData = components["schemas"]["BatchCreatedData"];
export type QrCodeData = components["schemas"]["QrCodeData"];

// Image types
export type ImageItem = components["schemas"]["ImageItem"];
export type ImageListData = components["schemas"]["ImageListData"];
export type ImageCreatedData = components["schemas"]["ImageCreatedData"];

// Split/Merge types
export type SplitBatchRequest = components["schemas"]["SplitBatchRequest"];
export type SplitBatchData = components["schemas"]["SplitBatchData"];
export type MergeBatchRequest = components["schemas"]["MergeBatchRequest"];
export type MergeBatchData = components["schemas"]["MergeBatchData"];

// Inspection types
export type CreateInspectionRequest = components["schemas"]["CreateInspectionRequest"];
export type UpdateInspectionRequest = components["schemas"]["UpdateInspectionRequest"];
export type InspectionDetail = components["schemas"]["InspectionDetail"];
export type InspectionPagedResponse = components["schemas"]["InspectionPagedResponse"];

// Certificate types
export type CreateCertificateRequest = components["schemas"]["CreateCertificateRequest"];
export type CertificateDetail = components["schemas"]["CertificateDetail"];
export type CertificatePagedResponse = components["schemas"]["CertificatePagedResponse"];

// Recall types
export type CreateRecallRequest = components["schemas"]["CreateRecallRequest"];
export type ResolveRecallRequest = components["schemas"]["ResolveRecallRequest"];
export type RecallDetail = components["schemas"]["RecallDetail"];
export type RecallPagedResponse = components["schemas"]["RecallPagedResponse"];

// Notification types
export type NotificationItem = components["schemas"]["NotificationItem"];
export type NotificationPagedResponse = components["schemas"]["NotificationPagedResponse"];

// Event types
export type EventDetail = components["schemas"]["EventDetail"];
export type EventListItem = components["schemas"]["EventListItem"];
export type EventPagedResponse = components["schemas"]["EventPagedResponse"];
export type EventCreatedData = components["schemas"]["EventCreatedData"];
export type CreateEventRequest = components["schemas"]["CreateEventRequest"];

// Analytics types
export type OverviewData = components["schemas"]["OverviewData"];
export type BatchDistributionData = components["schemas"]["BatchDistributionData"];
export type ProcessingTimeData = components["schemas"]["ProcessingTimeData"];
export type TracebackData = components["schemas"]["TracebackData"];

// Public trace types
export type PublicTraceData = components["schemas"]["PublicTraceData"];
export type LineageData = components["schemas"]["LineageData"];

// Auth types - adapted from generated types
// Keep legacy User type for backward compatibility during migration
export type User = LegacyUser;

// Legacy type compatibility - will be removed after full migration
export type LegacyUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  avatar: string;
};

export type LegacyLoginRequest = {
  username: string;
  password: string;
  role?: string;
};

// Adapter functions to convert between old and new types
export function adaptUserBasicToUser(basic: UserBasic): LegacyUser {
  return {
    id: String(basic.id ?? ""),
    name: basic.name ?? "",
    username: basic.email ?? "",
    email: basic.email ?? "",
    phone: "",
    role: basic.role ?? "",
    organization: "",
    avatar: "",
  };
}

export function adaptLoginRequestToNew(legacy: LegacyLoginRequest): LoginRequest {
  // Old API uses username, new API uses email
  return {
    email: legacy.username, // Map username to email
    password: legacy.password,
  };
}

export function adaptLoginDataToResponse(data: LoginData) {
  return {
    user: adaptUserBasicToUser(data.user ?? {}),
    accessToken: data.accessToken ?? "",
    refreshToken: data.refreshToken ?? "",
  };
}
