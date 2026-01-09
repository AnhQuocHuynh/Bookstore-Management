import { apiClient } from "../../../lib/axios";

export const inventoryApi = {
	getAll: () => apiClient.get("/inventory"),
	getById: (id: string) => apiClient.get(`/inventory/${id}`),
	create: (data: unknown) => apiClient.post("/inventory", data),
};
