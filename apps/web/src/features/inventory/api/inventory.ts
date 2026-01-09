import { apiClient } from "@/lib/axios";
import { InventoryParams } from "../types";

export const inventoryApi = {
	// Lấy danh sách sản phẩm
	getAll: (params?: InventoryParams) => {
		return apiClient.get("/products", { params });
	},

	// Lấy chi tiết
	getById: (id: string) => apiClient.get(`/products/${id}`),

	// Tạo mới
	create: (data: unknown) => apiClient.post("/products", data),

	// Cập nhật
	update: (id: string, data: unknown) => apiClient.patch(`/products/${id}`, data),

	// --- THÊM MỚI: Xóa mềm sản phẩm ---
	delete: (id: string) => {
		// API yêu cầu truyền id qua query params (VD: /products/detail?id=...)
		return apiClient.delete("/products/detail", {
			params: { id }
		});
	},

	// API lấy danh mục
	getCategories: () => apiClient.get("/categories"),

	// API lấy nhà cung cấp
	getSuppliers: () => apiClient.get("/suppliers"),
};