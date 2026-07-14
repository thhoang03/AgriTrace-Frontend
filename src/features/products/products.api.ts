import { get, post, put, patch, del } from "../../lib/api";
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

  // GET /products/{id} - Chi tiết product
  getProduct: (id: number) => get<Product>(`/products/${id}`),

  // POST /products - Tạo product
  createProduct: (data: CreateProductRequest) =>
    post<{ productId: number }>("/products", data),

  // PUT /products/{id} - Cập nhật product
  updateProduct: (id: number, data: UpdateProductRequest) =>
    put<void>(`/products/${id}`, data),

  // PATCH /products/{id}/status - Thay đổi status
  updateProductStatus: (id: number, data: UpdateProductStatusRequest) =>
    patch<void>(`/products/${id}/status`, data),

  // DELETE /products/{id} - Xóa product
  deleteProduct: (id: number) => del(`/products/${id}`),

  // GET /products/{id}/images - Danh sách images
  getProductImages: (productId: number) =>
    get<ProductImage[]>(`/products/${productId}/images`),

  // POST /products/{id}/images - Upload image
  uploadProductImage: (productId: number, formData: FormData) =>
    post<{ imageId: number }>(`/products/${productId}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // DELETE /products/images/{imageId} - Xóa image
  deleteProductImage: (imageId: number) =>
    del(`/products/images/${imageId}`),
};
