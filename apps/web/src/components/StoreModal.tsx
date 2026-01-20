import { useState, useEffect } from "react";
import { Modal, Input, Button } from "antd";

interface StoreModalProps {
  store: {
    name: string;
    address?: string;
    phone?: string;
    logo?: string;
  };
  onSave: (data: { name: string; address: string; phone: string }) => void;
}

export default function StoreModal({ store, onSave }: StoreModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeName, setStoreName] = useState(store.name);
  const [address, setAddress] = useState(store.address || "");
  const [phone, setPhone] = useState(store.phone || "");

  // Sync state khi props store thay đổi
  useEffect(() => {
    setStoreName(store.name);
    setAddress(store.address || "");
    setPhone(store.phone || "");
  }, [store.name, store.address, store.phone]);

  const handleSave = () => {
    onSave({ name: storeName, address, phone });
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center gap-3 px-1 cursor-pointer z-10"
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src={store.logo || "/default-store.jpg"}
          alt="Logo nhà sách"
          className="h-12 w-12 flex-shrink-0 select-none rounded-lg object-cover"
        />
        <div className="flex flex-col min-w-0 text-left">
          <h1 className="text-base font-bold leading-normal text-white truncate">
            {store.name}
          </h1>
          <p className="text-xs font-normal leading-normal text-gray-300 truncate">
            {store.address || "Chưa có địa chỉ"}
          </p>
        </div>
      </div>

      <Modal
        title="Thông tin nhà sách"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSave}>
            Lưu
          </Button>,
        ]}
      >
        <div className="flex flex-col gap-3">
          <label>Tên nhà sách</label>
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <label>Địa chỉ</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />

          <label>Số điện thoại</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}
