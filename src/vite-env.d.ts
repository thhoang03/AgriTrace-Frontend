/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MOCKS?: string;
  readonly VITE_MOCK_AUTH?: string;
  readonly VITE_MOCK_ORGANIZATIONS?: string;
  readonly VITE_MOCK_CATEGORIES?: string;
  readonly VITE_MOCK_BATCHES?: string;
  readonly VITE_MOCK_RECALLS?: string;
  readonly VITE_MOCK_USERS?: string;
  readonly VITE_MOCK_INSPECTIONS?: string;
  readonly VITE_MOCK_SUPPLY_CHAIN?: string;
  readonly VITE_MOCK_REPORTS?: string;
  readonly VITE_MOCK_ANALYTICS?: string;
  readonly VITE_MOCK_DASHBOARD?: string;
  readonly VITE_MOCK_NOTIFICATIONS?: string;
  readonly VITE_MOCK_CERTIFICATES?: string;
  readonly VITE_MOCK_PRODUCTS?: string;
  readonly VITE_MOCK_SPLIT_MERGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
