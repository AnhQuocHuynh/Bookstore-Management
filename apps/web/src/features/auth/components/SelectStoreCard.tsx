// src/features/auth/components/SelectStoreCard.tsx
import { Card, Button } from "antd";
import { BookStore } from "../types/bookstore.types";

interface SelectStoreCardProps {
    store: BookStore;
    onSelect: (store: BookStore) => void;
}

export const SelectStoreCard = ({ store, onSelect }: SelectStoreCardProps) => {
    return (
        <Card
            hoverable
            className="shadow-md transition-all hover:shadow-xl border border-teal-200"
            cover={
                store.logoUrl ? (
                    <img
                        alt={store.name}
                        src={store.logoUrl}
                        className="h-48 object-cover"
                    />
                ) : (
                    <div className="h-48 bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                        <span className="text-6xl font-bold text-teal-600">
                            {store.name.charAt(0)}
                        </span>
                    </div>
                )
            }
        >
            <Card.Meta
                title={<div className="text-xl font-bold text-teal-800">{store.name}</div>}
                description={
                    <div className="space-y-1 mt-2 text-gray-600">
                        <p><strong>Mã:</strong> {store.code}</p>
                        <p><strong>Địa chỉ:</strong> {store.address}</p>
                        <p><strong>Điện thoại:</strong> {store.phoneNumber}</p>
                    </div>
                }
            />
            <Button
                type="primary"
                block
                size="large"
                className="mt-6 bg-teal-600 hover:bg-teal-700"
                onClick={() => onSelect(store)}
            >
                Chọn nhà sách này
            </Button>
        </Card>
    );
};