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

export interface ProductImage {
  imageId: number;
  url: string;
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

export interface ProductFilters {
  organizationId?: number;
  categoryId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}
