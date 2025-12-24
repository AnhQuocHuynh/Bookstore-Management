import { Card, Button } from "antd";
import { BookStore } from "../types/bookstore.types";
import { BookOpen } from "lucide-react";

interface SelectStoreCardProps {
  store: BookStore;
  onSelect: (store: BookStore) => void;
}

export const SelectStoreCard = ({ store, onSelect }: SelectStoreCardProps) => {
  return (
    <Card
      className="group shadow-lg transition-shadow duration-300 rounded-xl 
      overflow-hidden border border-teal-200 transform cursor-pointer"
      cover={
        <div className="overflow-hidden">
          <img
            alt={store.name}
            src={store.logoUrl || "/default-store.jpg"}
            className="h-48 w-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
      }
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-xl font-bold text-teal-800">{store.name}</h3>
          <p className="text-gray-600 mt-2 text-sm">
            <strong>Mã:</strong> {store.code}
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Địa chỉ:</strong> {store.address || "Chưa cập nhật"}
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Điện thoại:</strong> {store.phoneNumber || "Chưa cập nhật"}
          </p>
        </div>
        <Button
          type="primary"
          block
          size="large"
          className="mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold flex items-center justify-center gap-2"
          onClick={() => onSelect(store)}
        >
          <BookOpen className="w-5 h-5" />
          Chọn nhà sách
        </Button>
      </div>
    </Card>
  );
};
