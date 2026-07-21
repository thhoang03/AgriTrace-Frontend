import type { AxiosRequestConfig } from "axios";
import type { MockResponse } from "../utils";
import { ok } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

export const productHandlers: Record<string, MockHandler> = {
  "GET /products": () =>
    ok([
      { id: "PRD-001", name: "Dragon Fruit", category: "Fruits", description: "Fresh organic dragon fruit", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80", status: "Active" },
      { id: "PRD-002", name: "Jasmine Rice", category: "Grains", description: "Premium aromatic rice", image: "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=80&q=80", status: "Active" },
      { id: "PRD-003", name: "Robusta Coffee", category: "Beverages", description: "High-quality coffee beans", image: "https://images.unsplash.com/photo-1529304344766-6b537de190f8?w=80&q=80", status: "Active" },
    ]),

  "GET /products/:id": (config) => {
    const id = config.url?.split("/").pop() ?? "";
    return ok({ id, name: "Dragon Fruit", category: "Fruits", description: "Fresh organic dragon fruit", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=80&q=80", status: "Active" });
  },

  "POST /products": (config) =>
    ok({ id: "PRD-00" + String(Math.floor(Math.random() * 100)), ...config.data, status: "Active" }),

  "PUT /products/:id": (config) => ok({ ...config.data, id: config.url?.split("/").pop() }),
};
