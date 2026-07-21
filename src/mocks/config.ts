const globalMockEnabled = import.meta.env.VITE_ENABLE_MOCKS !== "false";

export const mock = {
  global: globalMockEnabled,

  // Module flags are derived from global flag
  auth: globalMockEnabled && import.meta.env.VITE_MOCK_AUTH !== "false",
  organizations: globalMockEnabled && import.meta.env.VITE_MOCK_ORGANIZATIONS !== "false",
  categories: globalMockEnabled && import.meta.env.VITE_MOCK_CATEGORIES !== "false",
  batches: globalMockEnabled && import.meta.env.VITE_MOCK_BATCHES !== "false",
  recalls: globalMockEnabled && import.meta.env.VITE_MOCK_RECALLS !== "false",
  users: globalMockEnabled && import.meta.env.VITE_MOCK_USERS !== "false",
  inspections: globalMockEnabled && import.meta.env.VITE_MOCK_INSPECTIONS !== "false",
  supplyChain: globalMockEnabled && import.meta.env.VITE_MOCK_SUPPLY_CHAIN !== "false",
  reports: globalMockEnabled && import.meta.env.VITE_MOCK_REPORTS !== "false",
  analytics: globalMockEnabled && import.meta.env.VITE_MOCK_ANALYTICS !== "false",
  dashboard: globalMockEnabled && import.meta.env.VITE_MOCK_DASHBOARD !== "false",
  notifications: globalMockEnabled && import.meta.env.VITE_MOCK_NOTIFICATIONS !== "false",
  certificates: globalMockEnabled && import.meta.env.VITE_MOCK_CERTIFICATES !== "false",
  products: globalMockEnabled && import.meta.env.VITE_MOCK_PRODUCTS !== "false",
  splitMerge: globalMockEnabled && import.meta.env.VITE_MOCK_SPLIT_MERGE !== "false",
};
