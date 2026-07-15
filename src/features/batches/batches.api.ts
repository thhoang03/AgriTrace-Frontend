import { getList, get, post, put, del } from "../../lib/api";
import type { Batch, TimelineEvent, BatchFilters, CreateBatchRequest, UpdateBatchRequest, BatchQrCode, BatchImage } from "./batches.types";

export const batchesApi = {
  getAll: (filters?: BatchFilters) =>
    getList<Batch>("/batches", { params: filters }),

  getById: (id: string) =>
    get<Batch>(`/batches/${id}`),

  create: (data: CreateBatchRequest) =>
    post<Batch>("/batches", data),

  update: (id: string, data: UpdateBatchRequest) =>
    put<Batch>(`/batches/${id}`, data),

  delete: (id: string) =>
    del(`/batches/${id}`),

  getTimeline: (batchId: string) =>
    getList<TimelineEvent>(`/batches/${batchId}/timeline`),

  getQrCode: (batchId: string) =>
    get<BatchQrCode>(`/batches/${batchId}/qr-code`),

  getImages: (batchId: string) =>
    getList<BatchImage>(`/batches/${batchId}/images`),

  uploadImage: (batchId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return post<BatchImage>(`/batches/${batchId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (imageId: number | string) =>
    del(`/batches/images/${imageId}`),
};
