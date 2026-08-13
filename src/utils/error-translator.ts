/**
 * Helper utility to translate API and backend error messages to the active language ('vi' | 'en').
 */

const ERROR_MAP: Record<string, { vi: string; en: string }> = {
  // ─── RBAC / Permission Errors ───────────────────────────────────────────────
  "không thể thay đổi vai trò của tài khoản system admin.": {
    vi: "Không thể thay đổi vai trò của tài khoản System Admin.",
    en: "Cannot change the role of the System Admin account.",
  },
  "chỉ admin mới có quyền thay đổi vai trò của người dùng.": {
    vi: "Chỉ Admin mới có quyền thay đổi vai trò của người dùng.",
    en: "Only Admin can change user roles.",
  },
  "chỉ admin mới có quyền thăng cấp người dùng lên manager.": {
    vi: "Chỉ Admin mới có quyền thăng cấp người dùng lên Manager.",
    en: "Only Admin can promote users to Manager.",
  },
  "only admin can change user roles.": {
    vi: "Chỉ Admin mới có quyền thay đổi vai trò của người dùng.",
    en: "Only Admin can change user roles.",
  },
  "you do not have permission to perform this action.": {
    vi: "Bạn không có quyền thực hiện thao tác này.",
    en: "You do not have permission to perform this action.",
  },
  "bạn không có quyền thực hiện thao tác này.": {
    vi: "Bạn không có quyền thực hiện thao tác này.",
    en: "You do not have permission to perform this action.",
  },
  "forbidden": {
    vi: "Truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này.",
    en: "Access denied. You do not have permission to perform this action.",
  },
  "unauthorized": {
    vi: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.",
    en: "Session expired. Please log in again.",
  },
  "access denied": {
    vi: "Truy cập bị từ chối.",
    en: "Access denied.",
  },

  // ─── User Errors ─────────────────────────────────────────────────────────────
  "user not found.": {
    vi: "Không tìm thấy người dùng.",
    en: "User not found.",
  },
  "email already exists": {
    vi: "Email đã được sử dụng.",
    en: "Email already exists.",
  },
  "email already in use": {
    vi: "Email đã được sử dụng.",
    en: "Email already in use.",
  },
  "invalid password": {
    vi: "Mật khẩu không hợp lệ.",
    en: "Invalid password.",
  },
  "password must be at least 6 characters": {
    vi: "Mật khẩu phải có ít nhất 6 ký tự.",
    en: "Password must be at least 6 characters.",
  },

  // ─── Organization Errors ─────────────────────────────────────────────────────
  "organization name already exists": {
    vi: "Tên tổ chức đã tồn tại.",
    en: "Organization name already exists.",
  },
  "organization not found": {
    vi: "Không tìm thấy tổ chức.",
    en: "Organization not found.",
  },

  // ─── Category Errors ─────────────────────────────────────────────────────────
  "category name already exists": {
    vi: "Tên danh mục đã tồn tại.",
    en: "Category name already exists.",
  },
  "category not found": {
    vi: "Không tìm thấy danh mục.",
    en: "Category not found.",
  },

  // ─── Product Errors ──────────────────────────────────────────────────────────
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

  // ─── Generic ─────────────────────────────────────────────────────────────────
  "an error occurred": {
    vi: "Đã xảy ra lỗi hệ thống.",
    en: "An error occurred.",
  },
  "something went wrong": {
    vi: "Đã có lỗi xảy ra. Vui lòng thử lại.",
    en: "Something went wrong. Please try again.",
  },
  "network error": {
    vi: "Lỗi mạng. Vui lòng kiểm tra kết nối.",
    en: "Network error. Please check your connection.",
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

  // Partial pattern matching
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
  // RBAC patterns
  if (cleanKey.includes("rbac") || cleanKey.includes("forbidden") || cleanKey.includes("permission") || cleanKey.includes("quyền")) {
    return lang === "vi"
      ? "Bạn không có quyền thực hiện thao tác này."
      : "You do not have permission to perform this action.";
  }
  if (cleanKey.includes("unauthorized") || cleanKey.includes("unauthenticated") || cleanKey.includes("401")) {
    return lang === "vi"
      ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
      : "Session expired. Please log in again.";
  }
  if (cleanKey.includes("403")) {
    return lang === "vi"
      ? "Truy cập bị từ chối. Bạn không có quyền thực hiện thao tác này."
      : "Access denied. You do not have permission to perform this action.";
  }

  return errorMsg;
}
