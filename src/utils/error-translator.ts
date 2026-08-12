/**
 * Helper utility to translate API and backend error messages to the active language ('vi' | 'en').
 */

const ERROR_MAP: Record<string, { vi: string; en: string }> = {
  "không thể thay đổi gtin vì sản phẩm đã được sử dụng trong các lô hàng.": {
    vi: "Không thể thay đổi GTIN vì sản phẩm đã được sử dụng trong các lô hàng.",
    en: "Cannot change GTIN because the product is already used in batches.",
  },
  "cannot change gtin because the product is already used in batches.": {
    vi: "Không thể thay đổi GTIN vì sản phẩm đã được sử dụng trong các lô hàng.",
    en: "Cannot change GTIN because the product is already used in batches.",
  },
  "gtin đã được sử dụng cho một sản phẩm khác.": {
    vi: "GTIN đã được sử dụng cho một sản phẩm khác.",
    en: "GTIN is already in use by another product.",
  },
  "gtin is already in use by another product.": {
    vi: "GTIN đã được sử dụng cho một sản phẩm khác.",
    en: "GTIN is already in use by another product.",
  },
  "product not found.": {
    vi: "Không tìm thấy sản phẩm.",
    en: "Product not found.",
  },
  "lưu sản phẩm thất bại": {
    vi: "Lưu sản phẩm thất bại.",
    en: "Failed to save product.",
  },
  "failed to save product": {
    vi: "Lưu sản phẩm thất bại.",
    en: "Failed to save product.",
  },
  "cập nhật trạng thái thất bại": {
    vi: "Cập nhật trạng thái thất bại.",
    en: "Failed to update status.",
  },
  "category name already exists": {
    vi: "Tên danh mục đã tồn tại.",
    en: "Category name already exists.",
  },
  "organization name already exists": {
    vi: "Tên tổ chức đã tồn tại.",
    en: "Organization name already exists.",
  },
  "an error occurred": {
    vi: "Đã xảy ra lỗi hệ thống.",
    en: "An error occurred.",
  },
};

export function translateApiError(errorMsg: string | undefined | null, lang: string): string {
  if (!errorMsg) {
    return lang === "vi" ? "Đã xảy ra lỗi không xác định." : "An unknown error occurred.";
  }

  const cleanKey = errorMsg.trim().toLowerCase();

  // Exact match
  if (ERROR_MAP[cleanKey]) {
    return lang === "vi" ? ERROR_MAP[cleanKey].vi : ERROR_MAP[cleanKey].en;
  }

  // Partial pattern match for GTIN errors
  if (cleanKey.includes("gtin") && (cleanKey.includes("lô hàng") || cleanKey.includes("batch"))) {
    return lang === "vi"
      ? "Không thể thay đổi GTIN vì sản phẩm đã được sử dụng trong các lô hàng."
      : "Cannot change GTIN because the product is already used in batches.";
  }
  if (cleanKey.includes("gtin") && (cleanKey.includes("sản phẩm khác") || cleanKey.includes("another product"))) {
    return lang === "vi"
      ? "GTIN đã được sử dụng cho một sản phẩm khác."
      : "GTIN is already in use by another product.";
  }

  return errorMsg;
}
