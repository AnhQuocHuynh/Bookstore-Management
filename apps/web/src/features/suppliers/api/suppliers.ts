import { apiClient } from '../../../lib/axios';

export const supplierApi = {
  getAll: () => apiClient.get("/supplier"),
  getById: (id: string) => apiClient.get(`/supplier/${id}`),
  create: (data: any) => apiClient.post("/supplier", data),
};