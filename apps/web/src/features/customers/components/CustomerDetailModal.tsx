"use client";

import { Modal } from "antd";
import { type Customer } from "@/features/customers/data/customers";

interface CustomerDetailModalProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

const CustomerDetailModal = ({
  customer,
  open,
  onClose,
}: CustomerDetailModalProps) => {
  return (
    <Modal
      open={open}
      title="Chi tiết khách hàng"
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      bodyStyle={{ padding: "24px" }}
    >
      {customer && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Mã KH:</span>
            <span className="text-gray-900">{customer.id}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Tên:</span>
            <span className="text-gray-900">{customer.name}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Số điện thoại:</span>
            <span className="text-gray-900">{customer.phone}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Email:</span>
            <span className="text-gray-900">{customer.email}</span>
          </div>

          <div className="bg-gray-50 p-3 rounded-md shadow-sm flex flex-col">
            <span className="font-semibold text-gray-700">Địa chỉ:</span>
            <span className="text-gray-900 wrap-break-word">
              {customer.address}
            </span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Loại KH:</span>
            <span className="text-gray-900">{customer.type}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Trạng thái:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                customer.status === "Hoạt động"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {customer.status}
            </span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Ngày đăng ký:</span>
            <span className="text-gray-900">{customer.createdAt}</span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
