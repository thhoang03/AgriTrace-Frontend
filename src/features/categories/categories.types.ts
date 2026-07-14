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
