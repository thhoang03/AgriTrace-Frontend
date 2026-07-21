import { get, post, put, del } from "../../lib/api";
import type {
  BatchDetail,
  BatchListItem,
  BatchPagedResponse,
  BatchCreatedData,
  QrCodeData,
  ImageListData,
  ImageCreatedData,
  ImageItem,
  CreateBatchRequest as NewCreateBatchRequest,
  UpdateBatchRequest as NewUpdateBatchRequest,
  BatchStatusRequest,
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
function adaptBatchFromListItem(item: any): Batch {
  return {
    id: item.batchId ?? item.id ?? "",
    batchCode: item.batchCode ?? "",
    product: item.productName ?? "",
    productName: item.productName ?? "",
    categoryId: item.categoryId ? Number(item.categoryId) : undefined,
    category: item.categoryName ?? "",
    farmId: undefined,
    farm: item.organizationName ?? "",
    farmerId: undefined,
    farmer: "",
    harvestDate: item.createdAt?.split("T")[0] ?? "",
    quantity: item.quantity ?? 0,
    unit: item.unitCode ?? "",
    weight: String(item.quantity ?? ""),
    productionArea: "",
    status: (item.statusName ?? item.status) as BatchStatus,
    location: "",
    gps: "",
    gpsLocation: "",
    description: "",
    image: item.qrCodeUrl ?? "",
    productImage: item.qrCodeUrl ?? "",
    qrCodeUrl: item.qrCodeUrl ?? "",
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
    isDeleted: false,
  };
}

function adaptBatchFromDetail(item: any): Batch {
  return {
    id: item.batchId ?? item.id ?? "",
    batchCode: item.batchCode ?? "",
    product: item.productName ?? "",
    productName: item.productName ?? "",
    categoryId: item.categoryId ? Number(item.categoryId) : undefined,
    category: item.categoryName ?? "",
    farmId: undefined,
    farm: item.organizationName ?? "",
    farmerId: undefined,
    farmer: "",
    harvestDate: item.productionDate ?? item.createdAt?.split("T")[0] ?? "",
    quantity: item.quantity ?? 0,
    unit: item.unitCode ?? "",
    weight: String(item.quantity ?? ""),
    productionArea: "",
    status: (item.statusName ?? String(item.status ?? "")) as BatchStatus,
    location: item.location ?? "",
    gps: "",
    gpsLocation: "",
    description: "",
    image: item.qrCodeUrl ?? "",
    productImage: item.qrCodeUrl ?? "",
    qrCodeUrl: item.qrCodeUrl ?? "",
    createdAt: item.createdAt ?? "",
    updatedAt: item.updatedAt ?? "",
    isDeleted: false,
  };
}

function adaptEventFromItem(item: any): TimelineEvent {
  return {
    id: item.eventId ?? item.id ?? "",
    stage: item.eventTypeCode ?? item.stage ?? "",
    icon: "",
    date: item.eventTime?.split("T")[0] ?? "",
    time: item.eventTime?.split("T")[1]?.split(".")[0] ?? "",
    organization: item.organizationName ?? "",
    location: item.location ?? "",
    employee: item.performedByUserId ?? "",
    description: item.eventData ?? "",
    temp: "",
    humidity: "",
    hash: item.currentHash ?? "",
    prevHash: item.previousHash ?? "",
    verified: !!item.currentHash,
  };
}

function adaptImageFromItem(item: any): BatchImage {
  return {
    imageId: Number(item.imageId ?? 0),
    url: item.url ?? "",
    fileName: item.fileName ?? "",
    uploadedAt: item.uploadedAt ?? "",
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
    const pagedData = response.data as any;
    return {
      data: pagedData.items?.map(adaptBatchFromListItem) ?? [],
    };
  },

  getById: async (id: string) => {
    const response = await get<BatchDetail>(`/batches/${id}`);
    return { data: adaptBatchFromDetail(response.data) };
  },

  create: async (data: CreateBatchRequest) => {
    const newRequest = adaptCreateToNew(data);
    const response = await post<BatchCreatedData>("/batches", newRequest);
    const createdData = response.data as any;
    return { data: { id: createdData.batchId ?? "" } };
  },

  update: async (id: string, data: UpdateBatchRequest) => {
    const newRequest = adaptUpdateToNew(data);
    return put<void>(`/batches/${id}`, newRequest);
  },

  delete: async (id: string) => del(`/batches/${id}`),

  getTimeline: async (batchId: string) => {
    const response = await get<any>(`/batches/${batchId}/timeline`);
    const data = response.data as any;
    const items = Array.isArray(data) ? data : data?.items ?? [];
    return { data: items.map(adaptEventFromItem) as TimelineEvent[] };
  },

  getQrCode: async (batchId: string) => {
    const response = await get<QrCodeData>(`/batches/${batchId}/qr-code`);
    const qrData = response.data as any;
    return {
      data: {
        batchId: Number(qrData.batchId ?? 0),
        batchCode: qrData.batchCode ?? "",
        qrCodeUrl: qrData.qrCodeUrl ?? "",
      } as BatchQrCode
    };
  },

  getImages: async (batchId: string) => {
    const response = await get<ImageListData>(`/batches/${batchId}/images`);
    const imageData = response.data as any;
    return {
      data: (imageData.items ?? []).map(adaptImageFromItem) as BatchImage[]
    };
  },

  uploadImage: async (batchId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await post<ImageCreatedData>(`/batches/${batchId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const imgData = response.data as any;
    return { data: { imageId: Number(imgData.imageId ?? 0), url: imgData.url ?? "" } as BatchImage };
  },

  deleteImage: async (imageId: number | string) => del(`/batches/images/${imageId}`),
};
