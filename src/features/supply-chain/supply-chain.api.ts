import { getList, get } from "../../lib/api";
import type { SupplyChainNode, SupplyChainFilters } from "./supply-chain.types";

export const supplyChainApi = {
  getChain: (batchId: string) =>
    getList<SupplyChainNode>(`/supply-chain/${batchId}`, { params: { batchId } }),

  getNode: (nodeId: string) =>
    get<SupplyChainNode>(`/supply-chain/node/${nodeId}`),

  traceByQR: (qrCode: string) =>
    get<SupplyChainNode[]>(`/supply-chain/trace`, { params: { qrCode } }),
};
