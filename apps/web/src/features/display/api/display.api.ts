import { apiClient } from "@/lib/axios";
import {
    DisplayShelf, DisplayProduct, DisplayLog,
    CreateShelfDto, UpdateShelfDto, AddProductToShelfDto, MoveProductDto, ReduceProductDto,
    ProductListResponse,
    ProductListParams
} from "../types";

export const displayApi = {
    // --- SHELVES ---
    getShelves: async () => (await apiClient.get<DisplayShelf[]>("/display/shelfs")).data,
    getShelfById: async (id: string) => (await apiClient.get<{ id: string; displayProducts: DisplayProduct[] } & DisplayShelf>(`/display/shelfs/${id}`)).data,
    createShelf: async (data: CreateShelfDto) => (await apiClient.post("/display/shelf", data)).data,
    updateShelf: async (id: string, data: UpdateShelfDto) => (await apiClient.patch(`/display/shelfs/${id}`, data)).data,
    deleteShelf: async (id: string) => (await apiClient.delete(`/display/shelfs/${id}`)).data,

    // --- PRODUCTS ---
    getDisplayProducts: async (params?: any) => (await apiClient.get<DisplayProduct[]>("/display/products", { params })).data,
    addProduct: async (data: AddProductToShelfDto) => (await apiClient.post("/display/product", data)).data,
    updateProduct: async (id: string, data: any) => (await apiClient.patch(`/display/products/${id}`, data)).data,
    moveProduct: async (id: string, data: MoveProductDto) => (await apiClient.post(`/display/products/${id}/move`, data)).data,
    reduceProduct: async (id: string, data: ReduceProductDto) => (await apiClient.patch(`/display/products/${id}/reduce`, data)).data,
    removeProduct: async (id: string) => (await apiClient.delete(`/display/products/${id}`)).data,

    // --- LOGS ---
    getLogs: async (params?: any) => (await apiClient.get<DisplayLog[]>("/display/logs", { params })).data,

    // --- API MỚI: Lấy danh sách sản phẩm để chọn ---
    getProductsForSelection: async (params?: ProductListParams) => {
        // Gọi API /products nhưng ngữ cảnh là dùng cho display
        const response = await apiClient.get<ProductListResponse>("/products", {
            params: {
                ...params,
                status: 'active' // Mặc định chỉ lấy sản phẩm đang hoạt động
            }
        });
        return response.data;
    },
};