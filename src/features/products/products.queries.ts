import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "./products.api";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductStatusRequest,
  ProductFilters,
} from "./products.types";

export const productsQueries = {
  list: (filters?: ProductFilters) => ({
    queryKey: ["products", "list", filters],
    queryFn: () => productsApi.getProducts(filters),
  }),

  detail: (id: string) => ({
    queryKey: ["products", "detail", id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  }),

  images: (productId: string) => ({
    queryKey: ["products", "images", productId],
    queryFn: () => productsApi.getProductImages(productId),
    enabled: !!productId,
  }),
};

export function useProductsList(filters?: ProductFilters) {
  return useQuery(productsQueries.list(filters));
}

export function useProductDetail(id: string) {
  return useQuery(productsQueries.detail(id));
}

export function useProductImages(productId: string) {
  return useQuery(productsQueries.images(productId));
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productsApi.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductStatusRequest }) =>
      productsApi.updateProductStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products", "detail", id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUploadProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
      productsApi.uploadProductImage(productId, formData),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products", "images", productId] });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => productsApi.deleteProductImage(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "images"] });
    },
  });
}
