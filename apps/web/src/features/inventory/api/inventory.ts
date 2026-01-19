import { apiClient } from "@/lib/axios";
import { InventoryLogItem, InventoryLogParams, InventoryLogResponse, InventoryParams } from "../types";

export const inventoryApi = {
	// Lấy danh sách sản phẩm
	getAll: (params?: InventoryParams) => {
		return apiClient.get("/products", { params });
	},

	// Lấy chi tiết
	getById: (id: string) => apiClient.get(`/products/${id}`),

	// Tạo mới
	create: (data: unknown) => apiClient.post("/products", data),

	// --- CẬP NHẬT: Sửa sản phẩm (PATCH) ---
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

	getLogs: async (params: InventoryLogParams) => {
		// Thêm từ khóa async/await và return response.data
		const response = await apiClient.get<InventoryLogResponse>("/inventories/logs", { params });
		return response.data;
	},

	getLogDetail: async (id: string) => {
		// Tương tự cho chi tiết log
		const response = await apiClient.get<InventoryLogItem>(`/inventories/logs/${id}`);
		return response.data;
	}
};