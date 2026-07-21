import { get, post, put, patch, del } from "../../lib/api";
import type {
  ProductListItem,
  ProductDetail,
  ProductPagedResponse,
  ProductRequest,
  ImageListData,
  ImageCreatedData,
  ActiveStatusRequest,
} from "../../types/mapping";

// Legacy types for backward compatibility
export interface ProductCategoryRef {
  id: number;
  name: string;
}

export interface Product {
  productId: number;
  name: string;
  categoryId: number;
  categoryName?: string;
  category?: ProductCategoryRef;
  unit: string;
  organizationId: number;
  isActive: boolean;
}

export interface ProductListItem {
  productId: number;
  name: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  organizationId: number;
  isActive: boolean;
}

export interface ProductImage {
  imageId: number;
  imageUrl: string;
  url: string;
  isPrimary: boolean;
  fileName?: string;
  uploadedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  categoryId: number;
  unit: string;
  organizationId: number;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: number;
  unit?: string;
}

export interface UpdateProductStatusRequest {
  isActive: boolean;
}

export interface ProductsListResponse {
  items: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  organizationId?: number;
  categoryId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Adapter functions
function adaptProductFromListItem(item: Record<string, unknown>): ProductListItem {
  return {
    productId: item.productId ?? 0,
    name: item.name ?? "",
    categoryId: item.categoryId ?? 0,
    categoryName: item.categoryName ?? "",
    unit: item.unit ?? "",
    organizationId: item.organizationId ?? 0,
    isActive: item.isActive ?? true,
  };
}

function adaptProductFromDetail(item: Record<string, unknown>): Product {
  return {
    productId: item.productId ?? 0,
    name: item.name ?? "",
    categoryId: item.category?.id ?? item.categoryId ?? 0,
    categoryName: item.category?.name ?? item.categoryName ?? "",
    category: item.category ? { id: item.category.id, name: item.category.name } : { id: item.categoryId ?? 0, name: item.categoryName ?? "" },
    unit: item.unit ?? "",
    organizationId: item.organizationId ?? 0,
    isActive: item.isActive ?? true,
  };
}

function adaptImageFromItem(item: Record<string, unknown>): ProductImage {
  return {
    imageId: Number(item.imageId ?? 0),
    imageUrl: item.url ?? "",
    url: item.url ?? "",
    isPrimary: item.isPrimary ?? false,
    fileName: item.fileName ?? item.url?.split("/").pop(),
    uploadedAt: item.uploadedAt ?? "",
  };
}

function adaptCreateToRequest(legacy: CreateProductRequest): ProductRequest {
  return {
    name: legacy.name,
    categoryId: legacy.categoryId,
    unit: legacy.unit,
    organizationId: legacy.organizationId,
  };
}

function adaptUpdateToRequest(legacy: UpdateProductRequest): Partial<ProductRequest> {
  const req: Partial<ProductRequest> = {};
  if (legacy.name !== undefined) req.name = legacy.name;
  if (legacy.categoryId !== undefined) req.categoryId = legacy.categoryId;
  if (legacy.unit !== undefined) req.unit = legacy.unit;
  return req;
}

export const productsApi = {
  getProducts: async (filters?: ProductFilters) => {
    const response = await get<ProductPagedResponse>("/products", {
      params: {
        organizationId: filters?.organizationId,
        categoryId: filters?.categoryId,
        search: filters?.search,
        page: filters?.page,
        pageSize: filters?.pageSize,
      }
    });
    return {
      data: {
        items: (response.data.items ?? []).map(adaptProductFromListItem) ?? [],
        totalCount: response.data.totalCount ?? 0,
        page: response.data.page ?? 1,
        pageSize: response.data.pageSize ?? 20,
        totalPages: response.data.totalPages ?? 1,
      }
    };
  },

  getProduct: async (id: number) => {
    const response = await get<ProductDetail>(`/products/${id}`);
    return { data: adaptProductFromDetail(response.data) };
  },

  createProduct: async (data: CreateProductRequest) => {
    const newRequest = adaptCreateToRequest(data);
    const response = await post<{ productId: number }>("/products", newRequest);
    return { data: { productId: response.data.productId ?? 0 } };
  },

  updateProduct: async (id: number, data: UpdateProductRequest) => {
    const newRequest = adaptUpdateToRequest(data);
    return put<void>(`/products/${id}`, newRequest);
  },

  updateProductStatus: async (id: number, data: UpdateProductStatusRequest) => {
    return patch<void>(`/products/${id}/status`, data as ActiveStatusRequest);
  },

  deleteProduct: async (id: number) => del(`/products/${id}`),

  getProductImages: async (productId: number) => {
    const response = await get<ImageListData>(`/products/${productId}/images`);
    const imageData = response.data as unknown as Record<string, unknown>;
    return { data: ((imageData.items ?? []) as Record<string, unknown>[]).map(adaptImageFromItem) as ProductImage[] };
  },

  uploadProductImage: async (productId: number, formData: FormData) => {
    const response = await post<ImageCreatedData>(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: { imageId: Number((response.data as unknown as Record<string, unknown>).imageId ?? 0) } };
  },

  deleteProductImage: async (imageId: number) => del(`/products/images/${imageId}`),

  // Legacy API methods (maintain backward compatibility)
  getAll: async (filters?: ProductFilters) => {
    return productsApi.getProducts(filters);
  },

  getById: async (id: number | string) => {
    return productsApi.getProduct(Number(id));
  },

  create: async (data: CreateProductRequest) => {
    return productsApi.createProduct(data);
  },

  update: async (id: number | string, data: UpdateProductRequest) => {
    return productsApi.updateProduct(Number(id), data);
  },

  updateStatus: async (id: number | string, data: UpdateProductStatusRequest) => {
    return productsApi.updateProductStatus(Number(id), data);
  },

  delete: async (id: number | string) => productsApi.deleteProduct(Number(id)),

  getImages: async (id: number | string) => {
    return productsApi.getProductImages(Number(id));
  },

  uploadImage: async (id: number | string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await post<ImageCreatedData>(`/products/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const imgData = response.data as unknown as Record<string, unknown>;
    return {
      data: {
        imageId: Number(imgData.imageId ?? 0),
        imageUrl: String(imgData.url ?? ""),
        url: String(imgData.url ?? ""),
        isPrimary: false,
      } as ProductImage
    };
  },

  deleteImage: async (imageId: number | string) => del(`/products/images/${imageId}`),
};
