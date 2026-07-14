import { getList, get, post } from "../../lib/api";
import type {
  SupplyChainNode,
  SupplyChainFilters,
  SupplyChainEvent,
  CreateEventRequest,
  HashChainVerifyResult,
} from "./supply-chain.types";

export const supplyChainApi = {
  getChain: (batchId: string) =>
    getList<SupplyChainNode>(`/supply-chain/${batchId}`, { params: { batchId } }),

  getNode: (nodeId: string) =>
    get<SupplyChainNode>(`/supply-chain/node/${nodeId}`),

  traceByQR: (qrCode: string) =>
    get<SupplyChainNode[]>(`/supply-chain/trace`, { params: { qrCode } }),

  getEvents: (batchId: string, filters?: SupplyChainFilters) =>
    getList<SupplyChainEvent>(`/batches/${batchId}/events`, { params: filters }),

  getEventById: (eventId: number | string) =>
    get<SupplyChainEvent>(`/events/${eventId}`),

  createEvent: (batchId: string, data: CreateEventRequest) =>
    post<SupplyChainEvent>(`/batches/${batchId}/events`, data),

  verifyHashChain: (batchId: string) =>
    get<HashChainVerifyResult>(`/batches/${batchId}/events/verify`),
};
