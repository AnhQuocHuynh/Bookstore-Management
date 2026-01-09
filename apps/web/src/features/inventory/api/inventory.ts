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

	// API lấy danh mục (cho combobox lọc)
	getCategories: () => apiClient.get("/categories"),

	// API lấy nhà cung cấp (cho combobox lọc)
	getSuppliers: () => apiClient.get("/suppliers"),
};