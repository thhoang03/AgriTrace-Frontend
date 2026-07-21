import { get, post, put, del } from "../../lib/api";
import type {
  BatchDetail,
  BatchPagedResponse,
  BatchCreatedData,
  QrCodeData,
  ImageListData,
  ImageCreatedData,
  CreateBatchRequest as NewCreateBatchRequest,
  UpdateBatchRequest as NewUpdateBatchRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export type BatchStatus =
  | "HARVESTED"
  | "PROCESSING"
  | "PACKAGING"
  | "TRANSPORTING"
  | "DISTRIBUTING"
  | "RETAIL"
  | "COMPLETED"
  | "RECALLED"
  | "Harvested"
  | "Processing"
  | "Packaged"
  | "In Transit"
  | "Distributed"
  | "At Retail"
  | "Recalled";

export interface Batch {
  id: string;
  batchCode?: string;
  product: string;
  productName?: string;
  categoryId?: number;
  category: string;
  farmId?: number;
  farm: string;
  farmerId?: number;
  farmer: string;
  harvestDate: string;
  quantity: number;
  unit?: string;
  weight: string;
  productionArea?: string;
  status: BatchStatus;
  location: string;
  gps: string;
  gpsLocation?: string;
  description?: string;
  image: string;
  productImage?: string;
  qrCodeUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
}

export interface TimelineEvent {
  id: string;
  stage: string;
  icon: string;
  date: string;
  time: string;
  organization: string;
  location: string;
  employee: string;
  description: string;
  temp?: string;
  humidity?: string;
  hash: string;
  prevHash: string;
  verified: boolean;
}

export interface BatchFilters {
  search?: string;
  status?: BatchStatus | "All";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateBatchRequest {
  product: string;
  productName?: string;
  categoryId?: number;
  category: string;
  farmId?: number;
  farm: string;
  farmerId?: number;
  farmer: string;
  harvestDate: string;
  quantity: number;
  unit?: string;
  weight: string;
  productionArea?: string;
  location: string;
  gps: string;
  gpsLocation?: string;
  description?: string;
  productImage?: string;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  status?: BatchStatus;
  isDeleted?: boolean;
}

export interface BatchQrCode {
  batchId: number;
  batchCode: string;
  qrCodeUrl: string;
}

export interface BatchImage {
  imageId: number;
  url: string;
  fileName?: string;
  uploadedAt?: string;
}

// Adapter functions
function adaptBatchFromListItem(item: Record<string, unknown>): Batch {
  return {
    id: String(item.batchId ?? item.id ?? ""),
    batchCode: String(item.batchCode ?? ""),
    product: String(item.productName ?? ""),
    productName: String(item.productName ?? ""),
    categoryId: item.categoryId ? Number(item.categoryId) : undefined,
    category: String(item.categoryName ?? ""),
    farmId: undefined,
    farm: String(item.organizationName ?? ""),
    farmerId: undefined,
    farmer: "",
    harvestDate: String(item.createdAt?.toString().split("T")[0] ?? ""),
    quantity: Number(item.quantity ?? 0),
    unit: String(item.unitCode ?? ""),
    weight: String(item.quantity ?? ""),
    productionArea: "",
    status: String(item.statusName ?? item.status ?? "") as BatchStatus,
    location: "",
    gps: "",
    gpsLocation: "",
    description: "",
    image: String(item.qrCodeUrl ?? ""),
    productImage: String(item.qrCodeUrl ?? ""),
    qrCodeUrl: String(item.qrCodeUrl ?? ""),
    createdAt: String(item.createdAt ?? ""),
    updatedAt: String(item.updatedAt ?? ""),
    isDeleted: false,
  };
}

function adaptBatchFromDetail(item: Record<string, unknown>): Batch {
  return {
    id: String(item.batchId ?? item.id ?? ""),
    batchCode: String(item.batchCode ?? ""),
    product: String(item.productName ?? ""),
    productName: String(item.productName ?? ""),
    categoryId: item.categoryId ? Number(item.categoryId) : undefined,
    category: String(item.categoryName ?? ""),
    farmId: undefined,
    farm: String(item.organizationName ?? ""),
    farmerId: undefined,
    farmer: "",
    harvestDate: String(item.productionDate ?? item.createdAt?.toString().split("T")[0] ?? ""),
    quantity: Number(item.quantity ?? 0),
    unit: String(item.unitCode ?? ""),
    weight: String(item.quantity ?? ""),
    productionArea: "",
    status: String(item.statusName ?? item.status ?? "") as BatchStatus,
    location: String(item.location ?? ""),
    gps: "",
    gpsLocation: "",
    description: "",
    image: String(item.qrCodeUrl ?? ""),
    productImage: String(item.qrCodeUrl ?? ""),
    qrCodeUrl: String(item.qrCodeUrl ?? ""),
    createdAt: String(item.createdAt ?? ""),
    updatedAt: String(item.updatedAt ?? ""),
    isDeleted: false,
  };
}

function adaptEventFromItem(item: Record<string, unknown>): TimelineEvent {
  return {
    id: String(item.eventId ?? item.id ?? ""),
    stage: String(item.eventTypeCode ?? item.stage ?? ""),
    icon: "",
    date: String(item.eventTime?.toString().split("T")[0] ?? ""),
    time: String(item.eventTime?.toString().split("T")[1]?.toString().split(".")[0] ?? ""),
    organization: String(item.organizationName ?? ""),
    location: String(item.location ?? ""),
    employee: String(item.performedByUserId ?? ""),
    description: String(item.eventData ?? ""),
    temp: "",
    humidity: "",
    hash: String(item.currentHash ?? ""),
    prevHash: String(item.previousHash ?? ""),
    verified: !!item.currentHash,
  };
}

function adaptImageFromItem(item: Record<string, unknown>): BatchImage {
  return {
    imageId: Number(item.imageId ?? 0),
    url: String(item.url ?? ""),
    fileName: String(item.fileName ?? ""),
    uploadedAt: String(item.uploadedAt ?? ""),
  };
}

function adaptCreateToNew(legacy: CreateBatchRequest): NewCreateBatchRequest {
  return {
    productId: legacy.product,
    quantity: legacy.quantity,
    unitId: legacy.unit ?? "",
    productionDate: legacy.harvestDate,
    expiryDate: null,
  };
}

function adaptUpdateToNew(legacy: UpdateBatchRequest): NewUpdateBatchRequest {
  const req: NewUpdateBatchRequest = {};
  if (legacy.quantity !== undefined) req.quantity = legacy.quantity;
  if (legacy.expiryDate !== undefined) req.expiryDate = legacy.expiryDate;
  return req;
}

export const batchesApi = {
  getAll: async (filters?: BatchFilters) => {
    const response = await get<BatchPagedResponse>("/batches", {
      params: {
        search: filters?.search,
        status: filters?.status && filters?.status !== "All" ? filters.status : undefined,
        page: filters?.page,
        pageSize: filters?.limit,
      }
    });
    return {
      data: (response.data.items ?? []).map(adaptBatchFromListItem),
    };
  },

  getById: async (id: string) => {
    const response = await get<BatchDetail>(`/batches/${id}`);
    return { data: adaptBatchFromDetail(response.data as unknown as Record<string, unknown>) };
  },

  create: async (data: CreateBatchRequest) => {
    const newRequest = adaptCreateToNew(data);
    const response = await post<BatchCreatedData>("/batches", newRequest);
    return { data: { id: String((response.data as unknown as Record<string, unknown>).batchId ?? "") } };
  },

  update: async (id: string, data: UpdateBatchRequest) => {
    const newRequest = adaptUpdateToNew(data);
    return put<void>(`/batches/${id}`, newRequest);
  },

  delete: async (id: string) => del(`/batches/${id}`),

  getTimeline: async (batchId: string) => {
    const response = await get<unknown>(`/batches/${batchId}/timeline`);
    const data = response.data as Record<string, unknown>;
    const raw = Array.isArray(data) ? data : (data?.items as Record<string, unknown>[] ?? []);
    return { data: raw.map(adaptEventFromItem) as TimelineEvent[] };
  },

  getQrCode: async (batchId: string) => {
    const response = await get<QrCodeData>(`/batches/${batchId}/qr-code`);
    const qrData = response.data as unknown as Record<string, unknown>;
    return {
      data: {
        batchId: Number(qrData.batchId ?? 0),
        batchCode: String(qrData.batchCode ?? ""),
        qrCodeUrl: String(qrData.qrCodeUrl ?? ""),
      } as BatchQrCode
    };
  },

  getImages: async (batchId: string) => {
    const response = await get<ImageListData>(`/batches/${batchId}/images`);
    const imageData = response.data as unknown as Record<string, unknown>;
    return {
      data: ((imageData.items ?? []) as Record<string, unknown>[]).map(adaptImageFromItem) as BatchImage[]
    };
  },

  uploadImage: async (batchId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await post<ImageCreatedData>(`/batches/${batchId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const imgData = response.data as unknown as Record<string, unknown>;
    return { data: { imageId: Number(imgData.imageId ?? 0), url: String(imgData.url ?? "") } as BatchImage };
  },

  deleteImage: async (imageId: number | string) => del(`/batches/images/${imageId}`),
};
