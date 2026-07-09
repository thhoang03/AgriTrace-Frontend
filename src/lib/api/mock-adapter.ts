import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { matchHandler } from "./mock-handlers";

const MOCK_DELAY_MS = 300;

export function enableMockAdapter(http: AxiosInstance) {
  http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const handler = matchHandler(
      (config.method ?? "get").toUpperCase(),
      config.url ?? "",
    );

    if (!handler) return config;

    const response = handler(config);

    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));

    const axiosResponse: AxiosResponse = {
      data: response,
      status: response.status,
      statusText: response.status === 200 ? "OK" : "Not Found",
      headers: {},
      config,
    };

    config.adapter = () => Promise.resolve(axiosResponse);
    return config;
  });
}
