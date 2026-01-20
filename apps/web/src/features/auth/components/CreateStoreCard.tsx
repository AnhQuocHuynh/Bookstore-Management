import { Button, Card } from "antd";
import { PlusCircle } from "lucide-react";

interface CreateStoreCardProps {
  onClick: () => void;
}

export const CreateStoreCard = ({ onClick }: CreateStoreCardProps) => {
  return (
    <Card
      className="group shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden border border-teal-200 transform cursor-pointer"
      cover={
        <div className="overflow-hidden">
          <div
            className="h-48 w-full bg-gradient-to-br from-teal-100 to-cyan-100"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="w-20 h-20 rounded-full bg-white/80 border border-teal-200"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusCircle className="w-10 h-10 text-teal-700" />
            </div>
          </div>
        </div>
      }
      onClick={onClick}
    >
      <div className="p-4 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-xl font-bold text-teal-800">Tạo chi nhánh</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Thêm một chi nhánh nhà sách mới để bắt đầu quản lý.
          </p>
        </div>
        <Button
          type="primary"
          block
          size="large"
          className="mt-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <PlusCircle className="w-5 h-5" />
          Tạo chi nhánh
        </Button>
      </div>
    </Card>
  );
};

