export interface SupplyChainNode {
  id: string;
  name: string;
  role: string;
  location: string;
  date: string;
  status: string;
  hash: string;
  prevHash: string;
  verified: boolean;
  children?: SupplyChainNode[];
}

export interface SupplyChainFilters {
  batchId?: string;
  page?: number;
  limit?: number;
}
