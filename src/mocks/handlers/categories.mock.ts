import type { AxiosRequestConfig } from "axios";
import { categories } from "../data";
import type { MockResponse } from "../utils";
import { ok, conflict } from "../utils";

type MockHandler = (config: AxiosRequestConfig) => MockResponse<unknown>;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

export const categoryHandlers: Record<string, MockHandler> = {
  "GET /categories": (config) => {
    const { search } = config.params || {};
    let result = [...categories];
    if (search) {
      const q = normalizeText(search);
      result = result.filter(
        (c) =>
          normalizeText(c.name).includes(q) ||
          normalizeText(c.description ?? "").includes(q),
      );
    }
    return ok({
      items: result,
      totalCount: result.length,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  },

  "GET /categories/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const cat = categories.find((c) => c.categoryId === id);
    if (!cat) return { data: null, message: "Not found", status: 404 };
    return ok(cat);
  },

  "POST /categories": (config) => {
    const body = config.data as { name?: string };
    const name = (body?.name ?? "").trim().toLowerCase();
    const exists = categories.some(
      (c) => c.name.trim().toLowerCase() === name,
    );
    if (exists) return conflict("Category name already exists");
    const newCat = {
      categoryId: Math.max(...categories.map((c) => c.categoryId)) + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      ...(config.data as object),
    } as (typeof categories)[number];
    categories.push(newCat);
    return ok(newCat);
  },

  "PUT /categories/:id": (config) => {
    const id = Number(config.url?.split("/").pop() ?? "");
    const idx = categories.findIndex((c) => c.categoryId === id);
    if (idx === -1) return { data: null, message: "Not found", status: 404 };
    categories[idx] = { ...categories[idx], ...(config.data as object) };
    return ok(categories[idx]);
  },

  "PATCH /categories/:id/status": (config) => {
    const id = Number(config.url?.split("/").slice(-2, -1)[0] ?? "");
    const idx = categories.findIndex((c) => c.categoryId === id);
    if (idx === -1) return { data: null, message: "Not found", status: 404 };
    categories[idx] = {
      ...categories[idx],
      ...(config.data as object),
    } as (typeof categories)[number];
    return ok(categories[idx]);
  },
};
