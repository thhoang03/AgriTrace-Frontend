import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mock } from "../../mocks/config";
import { mockDelay } from "../../mocks/utils";
import {
  authHandlers,
} from "../../mocks/handlers/auth.mock";
import {
  organizationHandlers,
} from "../../mocks/handlers/organizations.mock";
import {
  batchHandlers,
} from "../../mocks/handlers/batches.mock";
import {
  categoryHandlers,
} from "../../mocks/handlers/categories.mock";
import {
  recallHandlers,
} from "../../mocks/handlers/recalls.mock";
import {
  userHandlers,
} from "../../mocks/handlers/users.mock";
import {
  inspectionHandlers,
} from "../../mocks/handlers/inspection.mock";
import {
  supplyChainHandlers,
} from "../../mocks/handlers/supply-chain.mock";
import {
  reportHandlers,
} from "../../mocks/handlers/reports.mock";
import {
  analyticsHandlers,
} from "../../mocks/handlers/analytics.mock";
import {
  dashboardHandlers,
} from "../../mocks/handlers/dashboard.mock";
import {
  notificationHandlers,
} from "../../mocks/handlers/notifications.mock";
import {
  certificateHandlers,
} from "../../mocks/handlers/certificates.mock";
import {
  productHandlers,
} from "../../mocks/handlers/products.mock";
import {
  splitMergeHandlers,
} from "../../mocks/handlers/split-merge.mock";

type MockHandler = (config: InternalAxiosRequestConfig) => { data: unknown; message: string; status: number };

interface RouteRule {
  pattern: RegExp;
  moduleFlag: keyof typeof mock;
  handlers: Record<string, MockHandler>;
}

const ROUTING_TABLE: RouteRule[] = [
  // More specific routes first
  { pattern: /^\/api\/batches\/[^/]+\/split$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  { pattern: /^\/api\/batches\/[^/]+\/merge$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  { pattern: /^\/api\/auth/, moduleFlag: "auth", handlers: authHandlers },
  { pattern: /^\/api\/organizations/, moduleFlag: "organizations", handlers: organizationHandlers },
  { pattern: /^\/api\/categories/, moduleFlag: "categories", handlers: categoryHandlers },
  { pattern: /^\/api\/batches/, moduleFlag: "batches", handlers: batchHandlers },
  { pattern: /^\/api\/recalls/, moduleFlag: "recalls", handlers: recallHandlers },
  { pattern: /^\/api\/users/, moduleFlag: "users", handlers: userHandlers },
  { pattern: /^\/api\/inspections/, moduleFlag: "inspections", handlers: inspectionHandlers },
  { pattern: /^\/api\/supply-chain/, moduleFlag: "supplyChain", handlers: supplyChainHandlers },
  { pattern: /^\/api\/reports/, moduleFlag: "reports", handlers: reportHandlers },
  { pattern: /^\/api\/analytics/, moduleFlag: "analytics", handlers: analyticsHandlers },
  { pattern: /^\/api\/dashboard/, moduleFlag: "dashboard", handlers: dashboardHandlers },
  { pattern: /^\/api\/notifications/, moduleFlag: "notifications", handlers: notificationHandlers },
  { pattern: /^\/api\/certificates/, moduleFlag: "certificates", handlers: certificateHandlers },
  { pattern: /^\/api\/products/, moduleFlag: "products", handlers: productHandlers },
];

function matchHandler(method: string, url: string): MockHandler | undefined {
  let normalizedUrl = url;
  if (normalizedUrl.includes("://")) {
    const parsed = new URL(normalizedUrl);
    normalizedUrl = parsed.pathname;
  }
  normalizedUrl = normalizedUrl.replace(/^\/api/, "") || "/";

  // Find the first matching route
  for (const rule of ROUTING_TABLE) {
    if (!rule.pattern.test(normalizedUrl)) continue;

    // Check if module is enabled
    if (!mock[rule.moduleFlag]) return undefined;

    // Try to find exact match first
    const exactKey = `${method} ${normalizedUrl}`;
    if (rule.handlers[exactKey]) return rule.handlers[exactKey];

    // Try pattern matching
    for (const [key, handler] of Object.entries(rule.handlers)) {
      const [keyMethod, keyPattern] = key.split(" ");
      if (keyMethod !== method.toUpperCase()) continue;

      const keyParts = keyPattern.split("/");
      const urlParts = normalizedUrl.split("/");
      if (keyParts.length !== urlParts.length) continue;

      const match = keyParts.every(
        (part, i) => part.startsWith(":") || part === urlParts[i],
      );
      if (match) return handler;
    }
  }

  return undefined;
}

export function enableMockAdapter(http: AxiosInstance) {
  http.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    // Check global mock flag first
    if (!mock.global) return config;

    const handler = matchHandler(
      (config.method ?? "get").toUpperCase(),
      config.url ?? "",
    );

    if (!handler) return config;

    const response = handler(config);

    await mockDelay();

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
