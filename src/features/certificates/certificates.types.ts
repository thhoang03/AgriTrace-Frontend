export interface Certificate {
  certificateId: number;
  batchId: number;
  type: string;
  certificateNumber?: string;
  issuedBy?: string;
  issuedAt: string;
  expiresAt?: string;
  fileUrl?: string;
  notes?: string;
}

export interface CreateCertificateRequest {
  type: string;
  certificateNumber?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  file?: File;
}

export interface CertificateFilters {
  page?: number;
  pageSize?: number;
}
