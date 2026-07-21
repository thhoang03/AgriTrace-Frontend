import { get, post, del } from "../../lib/api";
import type {
  CertificateDetail,
  CertificatePagedResponse,
  CreateCertificateRequest as NewCreateCertificateRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface Certificate {
  certificateId: string;
  batchId?: string;
  batchCode?: string;
  inspectionId?: string;
  certificateType?: string;
  fileUrl?: string;
  issuedDate?: string;
  createdAt?: string;
}

export interface CreateCertificateRequest {
  type: string;
  certificateNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  file?: File;
}

// Adapter functions
function adaptCertificateFromDetail(item: Record<string, unknown>): Certificate {
  return {
    certificateId: item.certificateId ?? "",
    batchId: item.batchId ?? "",
    batchCode: item.batchCode ?? "",
    inspectionId: item.inspectionId ?? "",
    certificateType: item.certificateType ?? "",
    fileUrl: item.fileUrl ?? "",
    issuedDate: item.issuedDate ?? "",
    createdAt: item.createdAt ?? "",
  };
}

export const certificatesApi = {
  getByBatchId: async (batchId: string) => {
    const response = await get<CertificatePagedResponse>(`/batches/${batchId}/certificates`);
    const pagedData = response.data as unknown as Record<string, unknown>;
    return {
      data: ((pagedData.items ?? []) as Record<string, unknown>[]).map(adaptCertificateFromDetail) ?? [],
    };
  },

  getById: async (id: number | string) => {
    const response = await get<CertificateDetail>(`/certificates/${id}`);
    return { data: adaptCertificateFromDetail(response.data) };
  },

  create: async (batchId: string, data: CreateCertificateRequest) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("inspectionId", data.certificateNumber ?? "");
      formData.append("certificateType", data.type);
      formData.append("fileUrl", "");
      formData.append("issuedDate", data.issuedAt ?? new Date().toISOString().split("T")[0]);
      formData.append("file", data.file);
      const response = await post<{ certificateId: string }>(
        `/batches/${batchId}/certificates`, formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return { data: { certificateId: String((response.data as unknown as Record<string, unknown>).certificateId ?? "") } as Certificate };
    }
    const newRequest: NewCreateCertificateRequest = {
      inspectionId: data.certificateNumber ?? "",
      certificateType: data.type,
      fileUrl: "",
      issuedDate: data.issuedAt ?? new Date().toISOString().split("T")[0],
    };
    const response = await post<{ certificateId: string }>(`/batches/${batchId}/certificates`, newRequest);
    return { data: { certificateId: String((response.data as unknown as Record<string, unknown>).certificateId ?? "") } as Certificate };
  },

  revoke: async (id: number | string) => del(`/certificates/${id}`),
};
