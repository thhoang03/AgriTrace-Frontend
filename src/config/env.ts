export const env = {
 feature/an-branch
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api",

  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) ?? "https://api.agritrace.vn/api/v1",
 main
  appName: "AgriTrace Vietnam",
  version: "1.0.0",
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS !== "false",
};
