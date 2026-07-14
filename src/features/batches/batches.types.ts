export type BatchStatus =
  | "Harvested"
  | "Processing"
  | "Packaged"
  | "In Transit"
  | "Distributed"
  | "At Retail"
  | "Recalled";

export interface Batch {
  id: string;
  product: string;
  category: string;
  image: string;
  farm: string;
  farmer: string;
  harvestDate: string;
  quantity: number;
  weight: string;
  status: BatchStatus;
  location: string;
  gps: string;
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
  category: string;
  farm: string;
  farmer: string;
  harvestDate: string;
  quantity: number;
  weight: string;
  location: string;
  gps: string;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  status?: BatchStatus;
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
