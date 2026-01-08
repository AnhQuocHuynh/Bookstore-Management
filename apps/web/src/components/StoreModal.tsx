import { useState } from "react";
import { Modal, Input, Button } from "antd";

export default function StoreModal({ store, onSave }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeName, setStoreName] = useState(store.name);
  const [address, setAddress] = useState(store.address);
  const [phone, setPhone] = useState(store.phone);

  const handleSave = () => {
    onSave({ name: storeName, address, phone });
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="
    flex flex-col items-center gap-2 px-1 cursor-pointer z-10
    lg:flex-row lg:items-start lg:gap-3
  "
        onClick={() => setIsModalOpen(true)}
      >
        <img
          src="/default-store.jpg"
          alt="Logo nhà sách"
          className="h-15 md:w-15 w-20 select-none rounded-lg object-cover"
        />
        <div className="flex flex-col text-nowrap md:text-left text-center">
          <h1 className="text-base font-bold leading-normal text-white">
            {store.name}
          </h1>
          <p className="text-sm font-normal leading-normal text-gray-300">
            {store.address}
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
