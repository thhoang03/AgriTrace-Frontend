import { getList, get, post, del } from "../../lib/api";
import type { Certificate, CreateCertificateRequest } from "./certificates.types";

export const certificatesApi = {
  getByBatchId: (batchId: string) =>
    getList<Certificate>(`/batches/${batchId}/certificates`),

  getById: (id: number | string) =>
    get<Certificate>(`/certificates/${id}`),

  create: (batchId: string, data: CreateCertificateRequest) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("type", data.type);
      if (data.certificateNumber) formData.append("certificateNumber", data.certificateNumber);
      if (data.issuedAt) formData.append("issuedAt", data.issuedAt);
      if (data.expiresAt) formData.append("expiresAt", data.expiresAt);
      if (data.notes) formData.append("notes", data.notes);
      formData.append("file", data.file);
      return post<Certificate>(`/batches/${batchId}/certificates`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    const { file: _, ...payload } = data;
    return post<Certificate>(`/batches/${batchId}/certificates`, payload);
  },

  revoke: (id: number | string) =>
    del(`/certificates/${id}`),
};
