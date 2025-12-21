// src/features/auth/pages/SelectStorePage.tsx
import { useNavigate } from "react-router-dom";
import { message, Spin, Button } from "antd";
import { useBookStores } from "../hooks/useBookStores";
import { SelectStoreCard } from "../components/SelectStoreCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { authApi } from "../api/auth.api";
import { BookStore } from "../types/bookstore.types";

const SelectStorePage = () => {
    const navigate = useNavigate();
    // Lấy accessToken (đang là system token) và credentials tạm
    const { accessToken, tempCredentials, setStoreToken } = useAuthStore();
    
    // API getBookStores dùng accessToken hiện tại (system token)
    const { data: stores, isLoading, error } = useBookStores(accessToken || "");

    const handleSelectStore = async (store: BookStore) => {
        if (!accessToken || !tempCredentials) {
            message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            navigate("/auth/login");
            return;
        }

        try {
            const body = {
                email: tempCredentials.email,
                username: tempCredentials.username,
                password: tempCredentials.password, // Pass lấy từ store
                bookStoreId: store.id,
            };

            // Gọi API login bước 2, truyền token hiện tại vào query param
            const response = await authApi.bookstoreLogin(accessToken, body);

            const newAccessToken = response.accessToken;
            if (!newAccessToken) throw new Error("Không nhận được Access Token");

            // Lúc này cả Owner và Employee đều trả về profile đầy đủ -> Map lại user
            const finalUser = {
                id: response.profile.id,
                email: response.profile.email,
                name: response.profile.fullName,
                role: response.profile.role,
                avatar: response.profile.avatarUrl,
            };

            const storeInfo = {
                id: response.bookStoreId,
                name: store.name, 
                address: response.profile.address, 
                phone: response.profile.phoneNumber,
            };

            // CẬP NHẬT STORE: Ghi đè accessToken cũ bằng cái mới
            setStoreToken(newAccessToken, storeInfo, finalUser);

            message.success(`Đã vào cửa hàng: ${store.name}`);
            navigate("/dashboard");

        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message || "Đăng nhập vào cửa hàng thất bại");
        }
    };

    if (!accessToken) {
        navigate("/auth/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-teal-800 mb-3">
                        Chọn chi nhánh làm việc
                    </h1>
                </div>

                {isLoading && <div className="flex justify-center py-20"><Spin size="large" /></div>}
                
                {error && (
                    <div className="text-center text-red-500">
                        {error.message} <br/>
                        <Button onClick={() => window.location.reload()}>Thử lại</Button>
                    </div>
                )}

                {!isLoading && stores && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stores.map((store) => (
                            <SelectStoreCard 
                                key={store.id} 
                                store={store} 
                                onSelect={handleSelectStore} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectStorePage;