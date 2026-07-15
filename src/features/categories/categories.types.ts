export interface Category {
  categoryId: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CategoriesListResponse {
  items: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface UpdateCategoryStatusRequest {
  isActive: boolean;
}

export interface CategoryFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}
