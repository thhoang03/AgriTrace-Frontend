import { get, post, put, del } from "../../lib/api";
import type {
  InspectionItem,
  InspectionStatus,
  CreateInspectionRequest,
  RequestInspectionRequest,
  ConcludeInspectionRequest,
  InspectionFilters,
  LabTest,
  CreateLabTestRequest,
} from "./inspection.types";

interface InspectionResponse {
  inspectionId: string;
  batchId: string;
  batchCode?: string;
  inspectorId: string;
  inspectorName?: string;
  inspectionType: number;
  status: number;
  overallResult?: string;
  inspectionDate: string;
  notes?: string;
  createdAt: string;
  labTests: LabTestResponse[];
}

interface LabTestResponse {
  id: string;
  testName: string;
  measuredValue?: string;
  unit?: string;
  minStandardValue?: string;
  maxStandardValue?: string;
  isPassed: boolean;
  remark?: string;
  createdAt: string;
}

interface PagedResponse {
  items: InspectionResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const STATUS_MAP: Record<number, InspectionStatus> = {
  1: "Pending",
  2: "Passed",
  3: "Failed",
};

function adaptInspection(res: InspectionResponse): InspectionItem {
  return {
    id: res.inspectionId,
    batchId: res.batchId,
    batchCode: res.batchCode ?? "",
    inspectorId: res.inspectorId,
    inspector: res.inspectorName ?? "",
    inspectionType: res.inspectionType as InspectionItem["inspectionType"],
    status: STATUS_MAP[res.status] ?? "Pending",
    overallResult: res.overallResult,
    inspectionDate: res.inspectionDate?.split("T")[0] ?? "",
    notes: res.notes ?? "",
    createdAt: res.createdAt,
    labTests: (res.labTests ?? []).map(adaptLabTest),
  };
}

function adaptLabTest(lt: LabTestResponse): LabTest {
  return {
    id: lt.id,
    inspectionId: "",
    testName: lt.testName,
    measuredValue: lt.measuredValue,
    unit: lt.unit,
    minStandardValue: lt.minStandardValue,
    maxStandardValue: lt.maxStandardValue,
    isPassed: lt.isPassed,
    remark: lt.remark,
    createdAt: lt.createdAt,
  };
}

export const inspectionApi = {
  getAll: async (filters?: InspectionFilters) => {
    const response = await get<PagedResponse>("/inspections", {
      params: { page: filters?.page, pageSize: filters?.limit },
    });
    const data = response.data as PagedResponse;
    return { data: data.items?.map(adaptInspection) ?? [] };
  },

  getByBatchId: async (batchId: string) => {
    const response = await get<PagedResponse>(`/batches/${batchId}/inspections`, {
      params: { pageSize: 100 },
    });
    const data = response.data as PagedResponse;
    return { data: data.items?.map(adaptInspection) ?? [] };
  },

  getById: async (id: string) => {
    const response = await get<InspectionResponse>(`/inspections/${id}`);
    const data = response.data as InspectionResponse;
    return { data: adaptInspection(data) };
  },

  create: async (data: CreateInspectionRequest) => {
    const response = await post<{ inspectionId: string }>(
      `/batches/${data.batchId}/inspections`,
      {
        inspectionType: data.inspectionType,
        inspectionDate: data.inspectionDate,
        notes: data.notes,
      }
    );
    const result = response.data as any;
    return { data: { inspectionId: result.inspectionId ?? "" } };
  },

  request: async (data: RequestInspectionRequest) => {
    const response = await post<{ inspectionId: string }>(
      `/batches/${data.batchId}/inspections/request`,
      {
        targetOrganizationId: data.targetOrganizationId,
        inspectionType: data.inspectionType,
        notes: data.notes,
      }
    );
    const result = response.data as any;
    return { data: { inspectionId: result.inspectionId ?? "" } };
  },

  conclude: async (data: ConcludeInspectionRequest) => {
    return put<void>(`/inspections/${data.id}`, {
      overallResult: data.overallResult,
      notes: data.notes,
    });
  },

  addLabTest: async (inspectionId: string, data: CreateLabTestRequest) => {
    return post<LabTestResponse>(`/inspections/${inspectionId}/lab-tests`, data);
  },

  getLabTests: async (inspectionId: string) => {
    const response = await get<LabTestResponse[]>(`/inspections/${inspectionId}/lab-tests`);
    const data = response.data as LabTestResponse[];
    return { data: (data ?? []).map(adaptLabTest) };
  },

  removeLabTest: async (labTestId: string) => {
    return del(`/lab-tests/${labTestId}`);
  },
};
