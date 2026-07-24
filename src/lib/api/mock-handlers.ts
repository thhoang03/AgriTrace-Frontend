import type { AxiosRequestConfig } from "axios";
import {
  batches,
  timelineEvents,
  recalls,
  users,
  recentActivities,
  batchStatusData,
  categories,
  products,
  productImages,
} from "../data/mockData";
import type {
  Batch,
  TimelineEvent,
  BatchStatus,
} from "../../features/batches/batches.types";
import type {
  RecallItem,
  RecallStatus,
  RecallSeverity,
} from "../../features/recall/recalls.types";
import type { UserItem } from "../../features/users/users.types";
import type { User, UserRole } from "../../features/auth/auth.types";
import type { OrganizationType } from "../../features/auth/permissions";

export interface MockResponse<T> {
  data: T;
  message: string;
  status: number;
}

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function ok<T>(data: T, message = "OK"): MockResponse<T> {
  return { data, message, status: 200 };
}

const ROLE_TO_ORG_TYPE: Record<string, OrganizationType> = {
  ADMIN: "SYSTEM",
  MANAGER: "SYSTEM",
  STAFF: "FARM",
  Farmer: "FARM",
  Processor: "PROCESSOR",
  Distributor: "DISTRIBUTOR",
  Retailer: "RETAILER",
  Inspector: "INSPECTION",
};

function toUser(item: UserItem, roleOverride?: UserRole): User {
  const apiRole = roleOverride ?? (item.role as any);
  const orgType = ROLE_TO_ORG_TYPE[apiRole] || ROLE_TO_ORG_TYPE[item.role] || "FARM";
  return {
    id: item.id,
    name: item.fullName,
    email: item.email,
    phone: item.phone,
    role: apiRole,
    organizationType: orgType,
    organizationName: item.organization,
    avatar: item.avatar,
  };
}

function paginated<T>(all: T[], config: AxiosRequestConfig) {
  const page = Number(config.params?.page) || 1;
  const limit = Number(config.params?.limit) || 10;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);
  return {
    ...ok(items, "OK"),
    data: {
      data: items,
      total: all.length,
      page,
      limit,
      totalPages: Math.ceil(all.length / limit),
    },
  };
}

function filterBatches(list: Batch[], config: AxiosRequestConfig): Batch[] {
  const { search, status } = config.params || {};
  let result = [...list];
  if (status && status !== "All") result = result.filter((b) => b.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (b) =>
        b.product.toLowerCase().includes(q) ||
        b.farm.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q),
    );
  }
  return result;
}

function filterRecalls(list: RecallItem[], config: AxiosRequestConfig): RecallItem[] {
  const { status, severity } = config.params || {};
  let result = [...list];
  if (status && status !== "All") result = result.filter((r) => r.status === status);
  if (severity && severity !== "All") result = result.filter((r) => r.severity === severity);
  return result;
}

function filterUsers(list: UserItem[], config: AxiosRequestConfig): UserItem[] {
  const { search, role, status } = config.params || {};
  let result = [...list];
  if (role) result = result.filter((u) => u.role === role);
  if (status && status !== "All") result = result.filter((u) => u.status === status);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }
  return result;
}

function filterCategories(list: typeof categories, config: AxiosRequestConfig) {
  const { search, isActive } = config.params || {};
  let result = [...list];
  if (isActive !== undefined) result = result.filter((c) => c.isActive === isActive);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }
  return result;
}

function filterProducts(list: typeof products, config: AxiosRequestConfig) {
  const { search, categoryId, isActive, organizationId } = config.params || {};
  let result = [...list];
  if (categoryId) result = result.filter((p) => p.categoryId === categoryId);
  if (isActive !== undefined) result = result.filter((p) => p.isActive === isActive);
  if (organizationId) result = result.filter((p) => p.organizationId === organizationId);
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }
  return result;
}

export const handlers: Record<string, MockHandler> = {
  // ── Auth ──
  "POST /auth/login": (config) => {
    const body = config.data as { username?: string; role?: string } | undefined;
    const role = body?.role as UserRole | undefined;
    const mappedRole = role || "STAFF";
    return ok({ user: toUser(users[0], mappedRole), accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });
  },

  "POST /auth/logout": () => ok(null),

  "GET /auth/profile": (config) => ok(toUser(users[0])),

  "POST /auth/refresh": () => ok({ accessToken: "mock-refreshed-token" }),

  // ── Batches ──
  "GET /batches": (config) => ok(filterBatches(batches, config)),

  "GET /batches/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const batch = batches.find((b) => b.id === id);
    if (!batch) return { data: null, message: "Not found", status: 404 };
    return ok(batch);
  },

  "POST /batches": (config) => {
    let data = config.data as Partial<Batch>;
    if (typeof config.data === "string") {
      try { data = JSON.parse(config.data); } catch (_) {}
    }
    const newBatch: Batch = {
      product: "",
      category: "",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&q=60",
      farm: "",
      farmer: "",
      harvestDate: new Date().toISOString().split("T")[0],
      quantity: 0,
      weight: "0 kg",
      status: "Harvested",
      location: "",
      gps: "",
      ...data,
      id: "BTH-2024-0" + String(batches.length + 1).padStart(2, "0"),
    };
    batches.push(newBatch);
    return ok(newBatch);
  },

  "PUT /batches/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const index = batches.findIndex(b => b.id === id);
    let data = config.data as Partial<Batch>;
    if (typeof config.data === 'string') {
        try { data = JSON.parse(config.data); } catch (e) {}
    }
    if (index !== -1) {
      batches[index] = { ...batches[index], ...data };
      return ok(batches[index]);
    }
    return ok({ ...data, id, status: "Harvested" as BatchStatus } as Batch);
  },

  "DELETE /batches/:id": () => ok(null),

  "GET /batches/:id/timeline": () => ok(timelineEvents),

  // ── Recalls ──
  "GET /recalls": (config) => ok(filterRecalls(recalls, config)),

  "GET /recalls/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const recall = recalls.find((r) => r.id === id);
    if (!recall) return { data: null, message: "Not found", status: 404 };
    return ok(recall);
  },

  "POST /recalls": (config) =>
    ok({
      ...config.data,
      id: "RCL-2024-00" + (recalls.length + 1),
      status: "Pending",
      createdDate: new Date().toISOString().split("T")[0],
    } as RecallItem),

  "PATCH /recalls/:id/resolve": () => ok({ ...recalls[0], status: "Resolved" }),

  "POST /recalls/:id/notify": () => ok(null),

  // ── Users ──
  "GET /users": (config) => ok(filterUsers(users, config)),

  "GET /users/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    const user = users.find((u) => u.id === id);
    if (!user) return { data: null, message: "Not found", status: 404 };
    return ok(user);
  },

  "POST /users": (config) =>
    ok({ ...config.data, id: "USR-00" + (users.length + 1), status: "Active" } as UserItem),

  "PUT /users/:id": (config) => ok({ ...config.data, id: config.url?.split("/").pop() } as UserItem),

  "DELETE /users/:id": () => ok(null),

  "POST /users/:id/reset-password": () => ok(null),

  // ── Inspections ──
  "GET /inspections": () =>
    ok([
      { id: "INS-001", batchId: "BTH-2024-001", product: "Dragon Fruit", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-20", category: "Quality", status: "Passed", score: 96, notes: "Đạt chuẩn xuất khẩu" },
      { id: "INS-002", batchId: "BTH-2024-002", product: "Jasmine Rice", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-18", category: "Safety", status: "Passed", score: 92, notes: "Không phát hiện hóa chất" },
      { id: "INS-003", batchId: "BTH-2024-006", product: "Durian Monthong", inspector: "Trần Văn An", organization: "Bộ NN", date: "2024-06-22", category: "Regulatory", status: "Failed", score: 45, notes: "Dư lượng thuốc BVTV vượt ngưỡng" },
      { id: "INS-004", batchId: "BTH-2024-003", product: "Robusta Coffee", inspector: "Lý Thị Ngọc", organization: "VFA", date: "2024-06-15", category: "Quality", status: "Passed", score: 94, notes: "Đạt tiêu chuẩn" },
    ]),

  "POST /inspections": (config) =>
    ok({ ...config.data, id: "INS-00" + String(Math.floor(Math.random() * 100)), score: 0, status: "Pending", organization: "VFA" }),

  "PATCH /inspections/:id": (config) =>
    ok({ ...config.data, id: config.url?.split("/").pop() }),

  // ── Supply Chain ──
  "GET /supply-chain/:id": () =>
    ok([
      { id: "SC-001", name: "Binh Thuan Dragon Fruit Farm", role: "Producer", location: "Bình Thuận", date: "2024-06-15", status: "verified", hash: "0x4a7...", prevHash: "0x000...", verified: true },
      { id: "SC-002", name: "Binh Thuan Processing Center", role: "Processor", location: "Bình Thuận", date: "2024-06-16", status: "verified", hash: "0x5b8...", prevHash: "0x4a7...", verified: true },
      { id: "SC-003", name: "Vietnam Fresh Logistics", role: "Transporter", location: "Bình Thuận → HCMC", date: "2024-06-17", status: "verified", hash: "0x7d0...", prevHash: "0x6c9...", verified: true },
    ]),

  "GET /supply-chain/trace": () =>
    ok([
      { id: "SC-001", name: "Binh Thuan Dragon Fruit Farm", role: "Producer", location: "Bình Thuận", date: "2024-06-15", status: "verified", hash: "0x4a7...", prevHash: "0x000...", verified: true },
    ]),

  // ── Dashboard ──
  "GET /dashboard/overview": () =>
    ok({
      stats: {
        totalBatches: 2847,
        activeBatches: 1234,
        totalUsers: 8562,
        activeRecalls: 3,
        totalInspections: 456,
        passedInspections: 423,
      },
      recentActivity: recentActivities.map((a) => ({
        ...a,
        id: String(a.id),
        userId: "USR-001",
        userName: a.user,
      })),
      batchStatusDistribution: batchStatusData.map((d) => ({ status: d.name, count: d.value })),
      inspectionPassRate: 92.8,
    }),

  // ── Categories ──
  "GET /categories": (config) => {
    const filtered = filterCategories(categories, config);
    const page = Number(config.params?.page) || 1;
    const pageSize = Number(config.params?.pageSize) || 10;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return ok({
      items,
      totalCount: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    });
  },

  "GET /categories/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const cat = categories.find((c) => c.categoryId === id);
    if (!cat) return { data: null, message: "Not found", status: 404 };
    return ok(cat);
  },

  "POST /categories": (config) => {
    const newCat = {
      categoryId: Math.max(...categories.map((c) => c.categoryId)) + 1,
      isActive: true,
      ...(config.data as object),
    } as (typeof categories)[number];
    categories.push(newCat);
    return ok(newCat);
  },

  "PUT /categories/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const idx = categories.findIndex((c) => c.categoryId === id);
    if (idx === -1) return { data: null, message: "Not found", status: 404 };
    categories[idx] = { ...categories[idx], ...(config.data as object) };
    return ok(categories[idx]);
  },

  "PATCH /categories/:id/status": (config) => {
    const id = Number(config.url?.split("/").slice(-2, -1)[0] ?? "");
    const idx = categories.findIndex((c) => c.categoryId === id);
    if (idx === -1) return { data: null, message: "Not found", status: 404 };
    categories[idx] = {
      ...categories[idx],
      ...(config.data as object),
    } as (typeof categories)[number];
    return ok(categories[idx]);
  },

  "DELETE /categories/:id": () => ok(null),

  // ── Reports ──
  "GET /reports": () =>
    ok([
      { id: "RPT-001", type: "batch_summary", format: "pdf", generatedAt: "2024-07-01T10:00:00Z", generatedBy: "Nguyễn Văn An", url: "/reports/rpt-001.pdf", size: 245760 },
      { id: "RPT-002", type: "inspection_log", format: "csv", generatedAt: "2024-07-02T15:30:00Z", generatedBy: "Lý Thị Ngọc", url: "/reports/rpt-002.csv", size: 102400 },
    ]),

  "POST /reports/generate": (config) =>
    ok({ id: "RPT-00" + String(Math.floor(Math.random() * 100)), ...config.data, generatedAt: new Date().toISOString(), generatedBy: "Current User", url: "/reports/rpt-new.pdf", size: 0 }),

  // ── Products ──
  "GET /products": (config) => {
    const filtered = filterProducts(products, config);
    const page = Number(config.params?.page) || 1;
    const pageSize = Number(config.params?.pageSize) || 10;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return ok({
      items,
      totalCount: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    });
  },

  "GET /products/:id": (config) => {
    const id = Number(config.url?.split("/").pop());
    const product = products.find((p) => p.productId === id);
    if (!product) return { data: null, message: "Not found", status: 404 };
    const category = categories.find((c) => c.categoryId === product.categoryId);
    return ok({
      ...product,
      category: category ? { id: category.categoryId, name: category.name } : null,
    });
  },

  "POST /products": (config) => {
    const category = categories.find((c) => c.categoryId === config.data.categoryId);
    const newProduct = {
      productId: products.length + 1,
      ...config.data,
      categoryName: category?.name || "Unknown",
      isActive: true,
    };
    products.push(newProduct);
    return ok(newProduct);
  },

  "PUT /products/:id": (config) => {
    const id = Number(config.url?.split("/").pop());
    const productIndex = products.findIndex((p) => p.productId === id);
    if (productIndex === -1) return { data: null, message: "Not found", status: 404 };
    const category = categories.find((c) => c.categoryId === config.data.categoryId);
    products[productIndex] = {
      ...products[productIndex],
      ...config.data,
      categoryId: Number(config.data.categoryId) || products[productIndex].categoryId,
      organizationId: Number(config.data.organizationId) || products[productIndex].organizationId,
      categoryName: category?.name || products[productIndex].categoryName,
    };
    return ok(products[productIndex]);
  },

  "PATCH /products/:id/status": (config) => {
    const id = Number(config.url?.split("/").pop());
    const productIndex = products.findIndex((p) => p.productId === id);
    if (productIndex === -1) return { data: null, message: "Not found", status: 404 };
    products[productIndex] = { ...products[productIndex], ...config.data };
    return ok(products[productIndex]);
  },

  "DELETE /products/:id": (config) => {
    const id = Number(config.url?.split("/").pop());
    const productIndex = products.findIndex((p) => p.productId === id);
    if (productIndex === -1) return { data: null, message: "Not found", status: 404 };
    products.splice(productIndex, 1);
    return ok(null);
  },

  "GET /products/:id/images": (config) => {
    const productId = Number(config.url?.split("/")[3]);
    return ok(productImages.filter((img) => img.imageId === productId));
  },

  "POST /products/:id/images": (config) =>
    ok({
      imageId: productImages.length + 1,
      imageUrl: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80",
      url: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80",
      isPrimary: false,
    }),

  "DELETE /products/images/:imageId": () => ok(null),
};

export function matchHandler(method: string, url: string): MockHandler | undefined {
  let normalizedUrl = url;
  if (normalizedUrl.includes("://")) {
    const parsed = new URL(normalizedUrl);
    normalizedUrl = parsed.pathname;
  }
  normalizedUrl = normalizedUrl.replace(/^\/api/, "") || "/";

  const exact = handlers[`${method} ${normalizedUrl}`];
  if (exact) return exact;

  for (const [key, handler] of Object.entries(handlers)) {
    const [keyMethod, keyPattern] = key.split(" ");
    if (keyMethod !== method) continue;

    const keyParts = keyPattern.split("/");
    const urlParts = normalizedUrl.split("/");
    if (keyParts.length !== urlParts.length) continue;

    const match = keyParts.every(
      (part, i) => part.startsWith(":") || part === urlParts[i],
    );
    if (match) return handler;
  }

  return undefined;
}
