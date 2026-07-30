export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  productId?: string;
  name: string;
  categoryId?: string;
  categoryName?: string;
  category?: ProductCategoryRef;
  unit: string;
  unitId?: string;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  status?: string;
}

export interface ProductListItem {
  id: string;
  productId?: string;
  name: string;
  categoryId?: string;
  categoryName: string;
  unit: string;
  unitId?: string;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  status?: string;
}

export interface ProductImage {
  imageId: string;
  imageUrl: string;
  url: string;
  isPrimary: boolean;
  fileName?: string;
  uploadedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  categoryId?: string;
  unit?: string;
  unitId?: string;
  organizationId?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  unit?: string;
  unitId?: string;
  organizationId?: string;
}

export interface UpdateProductStatusRequest {
  status: string;
  isActive?: boolean;
}

export interface ProductsListResponse {
  items: ProductListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductFilters {
  organizationId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
