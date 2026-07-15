import { getPaginated, getList, get, post, put, patch, del } from "../../lib/api";
import type {
  Product,
  ProductImage,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductFilters,
} from "./products.types";

export const productsApi = {
  getAll: (filters?: ProductFilters) =>
    getPaginated<Product>("/products", { params: filters }),

  getById: (id: number | string) =>
    get<Product>(`/products/${id}`),

  create: (data: CreateProductRequest) =>
    post<Product>("/products", data),

  update: (id: number | string, data: UpdateProductRequest) =>
    put<Product>(`/products/${id}`, data),

  updateStatus: (id: number | string, data: UpdateProductStatusRequest) =>
    patch<void>(`/products/${id}/status`, data),

  delete: (id: number | string) =>
    del(`/products/${id}`),

  getImages: (id: number | string) =>
    getList<ProductImage>(`/products/${id}/images`),

  uploadImage: (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return post<ProductImage>(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (imageId: number | string) =>
    del(`/products/images/${imageId}`),
};
