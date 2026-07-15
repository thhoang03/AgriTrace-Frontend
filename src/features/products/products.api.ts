import { getPaginated, getList, get, post, put, patch, del } from "../../lib/api";
import type {
  Product,
  ProductListItem,
  ProductImage,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductsListResponse,
  ProductFilters,
} from "./products.types";

export const productsApi = {
  // GET /products - Danh sách products
  getProducts: (filters?: ProductFilters) =>
    get<ProductsListResponse>("/products", { params: filters }),

  getAll: (filters?: ProductFilters) =>
    getPaginated<Product>("/products", { params: filters }),

  // GET /products/{id} - Chi tiết product
  getProduct: (id: number) => get<Product>(`/products/${id}`),

  getById: (id: number | string) =>
    get<Product>(`/products/${id}`),

  // POST /products - Tạo product
  createProduct: (data: CreateProductRequest) =>
    post<{ productId: number }>("/products", data),

  create: (data: CreateProductRequest) =>
    post<Product>("/products", data),

  // PUT /products/{id} - Cập nhật product
  updateProduct: (id: number, data: UpdateProductRequest) =>
    put<void>(`/products/${id}`, data),

  update: (id: number | string, data: UpdateProductRequest) =>
    put<Product>(`/products/${id}`, data),

  // PATCH /products/{id}/status - Thay đổi status
  updateProductStatus: (id: number, data: UpdateProductStatusRequest) =>
    patch<void>(`/products/${id}/status`, data),

  updateStatus: (id: number | string, data: UpdateProductStatusRequest) =>
    patch<void>(`/products/${id}/status`, data),

  // DELETE /products/{id} - Xóa product
  deleteProduct: (id: number) => del(`/products/${id}`),

  delete: (id: number | string) => del(`/products/${id}`),

  // GET /products/{id}/images - Danh sách images
  getProductImages: (productId: number) =>
    get<ProductImage[]>(`/products/${productId}/images`),

  getImages: (id: number | string) =>
    getList<ProductImage>(`/products/${id}/images`),

  // POST /products/{id}/images - Upload image
  uploadProductImage: (productId: number, formData: FormData) =>
    post<{ imageId: number }>(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  uploadImage: (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return post<ProductImage>(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // DELETE /products/images/{imageId} - Xóa image
  deleteProductImage: (imageId: number) => del(`/products/images/${imageId}`),

  deleteImage: (imageId: number | string) => del(`/products/images/${imageId}`),
};
