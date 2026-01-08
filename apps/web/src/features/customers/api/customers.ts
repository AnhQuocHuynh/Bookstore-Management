import { apiClient } from "../../../lib/axios";

export const customersApi = {
  getAll: () => apiClient.get("/customers"),
};
