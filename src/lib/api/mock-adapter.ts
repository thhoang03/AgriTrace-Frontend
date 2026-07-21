import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { mock } from "../../mocks/config";
import { mockDelay } from "../../mocks/utils";
import { env } from "../../config/env";
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
  { pattern: /^\/batches\/[^/]+\/split$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  { pattern: /^\/batches\/[^/]+\/merge$/, moduleFlag: "splitMerge", handlers: splitMergeHandlers },
  { pattern: /^\/auth\//, moduleFlag: "auth", handlers: authHandlers },
  { pattern: /^\/organizations\//, moduleFlag: "organizations", handlers: organizationHandlers },
  { pattern: /^\/categories\//, moduleFlag: "categories", handlers: categoryHandlers },
  { pattern: /^\/batches\//, moduleFlag: "batches", handlers: batchHandlers },
  { pattern: /^\/recalls\//, moduleFlag: "recalls", handlers: recallHandlers },
  { pattern: /^\/users\//, moduleFlag: "users", handlers: userHandlers },
  { pattern: /^\/inspections\//, moduleFlag: "inspections", handlers: inspectionHandlers },
  { pattern: /^\/supply-chain\//, moduleFlag: "supplyChain", handlers: supplyChainHandlers },
  { pattern: /^\/reports\//, moduleFlag: "reports", handlers: reportHandlers },
  { pattern: /^\/analytics\//, moduleFlag: "analytics", handlers: analyticsHandlers },
  { pattern: /^\/dashboard\//, moduleFlag: "dashboard", handlers: dashboardHandlers },
  { pattern: /^\/notifications\//, moduleFlag: "notifications", handlers: notificationHandlers },
  { pattern: /^\/certificates\//, moduleFlag: "certificates", handlers: certificateHandlers },
  { pattern: /^\/products\//, moduleFlag: "products", handlers: productHandlers },
];

function matchHandler(method: string, url: string): MockHandler | undefined {
  let normalizedUrl = url;
  if (normalizedUrl.includes("://")) {
    const parsed = new URL(normalizedUrl);
    normalizedUrl = parsed.pathname;
  }

  const basePath = new URL(env.apiBaseUrl).pathname.replace(/\/$/, "");
  if (basePath && normalizedUrl.startsWith(basePath)) {
    normalizedUrl = normalizedUrl.slice(basePath.length) || "/";
  } else {
    normalizedUrl = normalizedUrl.replace(/^\/api/, "") || "/";
  }

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
