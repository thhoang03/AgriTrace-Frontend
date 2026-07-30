import { get, post, put, patch, del } from "../../lib/api";
import type {
  ProductDetail,
  ProductPagedResponse,
  ProductRequest,
  ImageListData,
  ImageCreatedData,
} from "../../types/mapping";
import type {
  Product,
  ProductListItem as FeProductListItem,
  ProductImage,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductFilters,
} from "./products.types";

function adaptProductFromListItem(item: any): FeProductListItem {
  const isAct = item.status === "Active" || (item.status !== "Inactive" && item.isDeleted !== true && item.isActive !== false);
  const idStr = String(item.id || item.productId || "");
  return {
    id: idStr,
    productId: idStr,
    name: item.name ?? "",
    categoryId: item.categoryId ? String(item.categoryId) : undefined,
    categoryName: item.categoryName ?? "",
    unit: item.unit ?? "",
    unitId: item.unitId ? String(item.unitId) : undefined,
    organizationId: item.organizationId ? String(item.organizationId) : undefined,
    organizationName: item.organizationName ?? "",
    isActive: isAct,
    status: isAct ? "Active" : "Inactive",
  };
}

function adaptProductFromDetail(item: any): Product {
  const isAct = item.status === "Active" || item.isActive === true || item.isActive === undefined;
  const idStr = String(item.id || item.productId || "");
  return {
    id: idStr,
    productId: idStr,
    name: item.name ?? "",
    categoryId: item.category?.id ? String(item.category.id) : (item.categoryId ? String(item.categoryId) : undefined),
    categoryName: item.category?.name ?? item.categoryName ?? "",
    category: item.category ? { id: String(item.category.id), name: item.category.name } : undefined,
    unit: item.unit ?? "",
    unitId: item.unitId ? String(item.unitId) : undefined,
    organizationId: item.organizationId ? String(item.organizationId) : undefined,
    organizationName: item.organizationName ?? "",
    isActive: isAct,
    status: item.status ?? (isAct ? "Active" : "Inactive"),
  };
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
    const pagedData = response.data as any;
    return {
      data: {
        items: (pagedData.items ?? []).map(adaptProductFromListItem),
        totalCount: pagedData.totalCount ?? 0,
        page: pagedData.page ?? 1,
        pageSize: pagedData.pageSize ?? 20,
        totalPages: pagedData.totalPages ?? 1,
      }
    };
  },

  getProduct: async (id: string) => {
    const response = await get<ProductDetail>(`/products/${id}`);
    return { data: adaptProductFromDetail(response.data) };
  },

  createProduct: async (data: CreateProductRequest) => {
    const payload: ProductRequest = {
      name: data.name,
      categoryId: data.categoryId || undefined,
      unit: data.unit,
      unitId: data.unitId || undefined,
      organizationId: data.organizationId || undefined,
    };
    const response = await post<{ id?: string; productId?: string }>("/products", payload);
    const createdId = (response.data as any)?.id || (response.data as any)?.productId || "";
    return { data: { productId: createdId, id: createdId } };
  },

  updateProduct: async (id: string, data: UpdateProductRequest) => {
    const payload: ProductRequest = {
      name: data.name || "",
      categoryId: data.categoryId || undefined,
      unit: data.unit,
      unitId: data.unitId || undefined,
      organizationId: data.organizationId || undefined,
    };
    return put<void>(`/products/${id}`, payload);
  },

  updateProductStatus: async (id: string, data: UpdateProductStatusRequest) => {
    const newStatus = data.status || (data.isActive ? "Active" : "Inactive");
    return patch<void>(`/products/${id}/status`, { status: newStatus });
  },

  deleteProduct: async (id: string) => del<void>(`/products/${id}`),

  getProductImages: async (productId: string) => {
    const response = await get<ImageListData>(`/products/${productId}/images`);
    const imageData = response.data as any;
    return { data: (imageData.items ?? []).map((item: any) => ({
      imageId: String(item.imageId || item.id || ""),
      imageUrl: item.url ?? "",
      url: item.url ?? "",
      isPrimary: item.isPrimary ?? false,
      fileName: item.fileName ?? item.url?.split("/").pop(),
      uploadedAt: item.uploadedAt ?? "",
    })) as ProductImage[] };
  },

  uploadProductImage: async (productId: string, formData: FormData) => {
    const response = await post<ImageCreatedData>(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: { imageId: String((response.data as any).imageId || (response.data as any).id || "") } };
  },

  deleteProductImage: async (imageId: string) => del(`/products/images/${imageId}`),

  // Legacy alias methods
  getAll: async (filters?: ProductFilters) => productsApi.getProducts(filters),
  getById: async (id: string) => productsApi.getProduct(id),
  create: async (data: CreateProductRequest) => productsApi.createProduct(data),
  update: async (id: string, data: UpdateProductRequest) => productsApi.updateProduct(id, data),
  updateStatus: async (id: string, data: UpdateProductStatusRequest) => productsApi.updateProductStatus(id, data),
  delete: async (id: string) => productsApi.deleteProduct(id),
  getImages: async (id: string) => productsApi.getProductImages(id),
  uploadImage: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return productsApi.uploadProductImage(id, formData);
  },
  deleteImage: async (imageId: string) => productsApi.deleteProductImage(imageId),
};
