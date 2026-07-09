export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:3000/api",
  appName: "AgriTrace Vietnam",
  version: "1.0.0",
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS !== "false",
};
