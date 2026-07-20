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
function adaptCertificateFromDetail(item: any): Certificate {
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
    const pagedData = response.data as any;
    return {
      data: pagedData.items?.map(adaptCertificateFromDetail) ?? [],
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
      const createdData = response.data as any;
      return { data: { certificateId: createdData.certificateId ?? "" } as Certificate };
    }
    const newRequest: NewCreateCertificateRequest = {
      inspectionId: data.certificateNumber ?? "",
      certificateType: data.type,
      fileUrl: "",
      issuedDate: data.issuedAt ?? new Date().toISOString().split("T")[0],
    };
    const response = await post<{ certificateId: string }>(`/batches/${batchId}/certificates`, newRequest);
    const createdData = response.data as any;
    return { data: { certificateId: createdData.certificateId ?? "" } as Certificate };
  },

  revoke: async (id: number | string) => del(`/certificates/${id}`),
};
