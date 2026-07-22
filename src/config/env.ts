const metaEnv = (import.meta as any).env ?? {};

export const env = {
  apiBaseUrl: metaEnv.VITE_API_BASE_URL ?? "http://localhost:3000/api",
  appName: "AgriTrace Vietnam",
  version: "1.0.0",
  enableMocks: metaEnv.VITE_ENABLE_MOCKS !== "false",
};