// src/features/inventory/api/inventory.ts
import { apiClient } from "@/lib/axios";
import { InventoryParams } from "../types";

export const inventoryApi = {
	// Lấy danh sách sản phẩm (Inventory)
	getAll: (params?: InventoryParams) => {
		return apiClient.get("/products", { params });
	},

	// Lấy chi tiết
	getById: (id: string) => apiClient.get(`/products/${id}`),

	// Tạo mới (Dùng endpoint products)
	create: (data: unknown) => apiClient.post("/products", data),

	// API lấy danh mục để đổ vào Combobox lọc
	getCategories: () => apiClient.get("/categories"),

	// API lấy nhà cung cấp để đổ vào Combobox lọc
	getSuppliers: () => apiClient.get("/suppliers"),
};