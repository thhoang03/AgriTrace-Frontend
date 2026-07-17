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
