import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { displayApi } from "../api/display.api";
import { message } from "antd";
import { ProductListParams } from "../types";

// --- QUERIES ---
export const useShelves = () => useQuery({ queryKey: ["shelves"], queryFn: displayApi.getShelves });
export const useShelfDetail = (id: string) => useQuery({ queryKey: ["shelf", id], queryFn: () => displayApi.getShelfById(id), enabled: !!id });
export const useDisplayProducts = (params?: any) => useQuery({ queryKey: ["display-products", params], queryFn: () => displayApi.getDisplayProducts(params) });
export const useDisplayLogs = (params?: any) => useQuery({ queryKey: ["display-logs", params], queryFn: () => displayApi.getLogs(params) });

// --- MUTATIONS ---
export const useDisplayMutations = () => {
    const queryClient = useQueryClient();

    const onSuccess = (msg: string) => {
        message.success(msg);
        queryClient.invalidateQueries({ queryKey: ["shelves"] });
        queryClient.invalidateQueries({ queryKey: ["shelf"] });
        queryClient.invalidateQueries({ queryKey: ["display-products"] });
        queryClient.invalidateQueries({ queryKey: ["display-logs"] });
    };

    return {
        createShelf: useMutation({ mutationFn: displayApi.createShelf, onSuccess: () => onSuccess("Tạo kệ thành công") }),
        updateShelf: useMutation({ mutationFn: ({ id, data }: any) => displayApi.updateShelf(id, data), onSuccess: () => onSuccess("Cập nhật kệ thành công") }),
        deleteShelf: useMutation({ mutationFn: displayApi.deleteShelf, onSuccess: () => onSuccess("Xóa kệ thành công") }),

        addProduct: useMutation({ mutationFn: displayApi.addProduct, onSuccess: () => onSuccess("Đã thêm hàng lên kệ") }),
        moveProduct: useMutation({ mutationFn: ({ id, data }: any) => displayApi.moveProduct(id, data), onSuccess: () => onSuccess("Di chuyển hàng thành công") }),
        reduceProduct: useMutation({ mutationFn: ({ id, data }: any) => displayApi.reduceProduct(id, data), onSuccess: () => onSuccess("Đã rút hàng về kho") }),
        removeProduct: useMutation({ mutationFn: displayApi.removeProduct, onSuccess: () => onSuccess("Đã gỡ sản phẩm khỏi kệ") }),
    };
};


// --- HOOK MỚI ---
export const useProductsForSelection = (params?: ProductListParams) => {
    return useQuery({
        // Key riêng biệt để tránh conflict cache với module products chính
        queryKey: ["display-module-products", params],
        queryFn: () => displayApi.getProductsForSelection(params),
        // Giữ cache ngắn hơn chút vì tồn kho thay đổi liên tục
        staleTime: 1000 * 30,
    });
}