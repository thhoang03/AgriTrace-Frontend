import { getList } from "./http";

export interface LookupItem {
  value: string;
  label: string;
}

function getLookup(endpoint: string) {
  return getList<LookupItem>(endpoint);
}

export const lookupApi = {
  getRoles: () => getLookup("/roles"),
  getOrganizationTypes: () => getLookup("/organization-types"),
  getEventTypes: () => getLookup("/event-types"),
  getUnits: () => getLookup("/units"),
  getInspectionResults: () => getLookup("/inspection-results"),
  getCertificateTypes: () => getLookup("/certificate-types"),
  getRecallSeverities: () => getLookup("/recall-severities"),
};
