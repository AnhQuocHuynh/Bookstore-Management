"use client";

import {
  Customer,
  CUSTOMER_TYPE_LABEL,
} from "@/features/customers/types/customer.type";
import { Modal } from "antd";
import { format } from "date-fns";

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
            <span className="text-gray-900">{customer.customerCode}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Tên:</span>
            <span className="text-gray-900">{customer.fullName}</span>
          </div>

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Số điện thoại:</span>
            <span className="text-gray-900">{customer.phoneNumber}</span>
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
            <span className="text-gray-900">
              {" "}
              {CUSTOMER_TYPE_LABEL[customer.customerType] ?? "Không xác định"}
            </span>
          </div>

          {customer.note && (
            <div className="bg-gray-50 p-3 rounded-md shadow-sm flex flex-col">
              <span className="font-semibold text-gray-700">Ghi chú:</span>
              <span className="text-gray-900 wrap-break-word">
                {customer.note}
              </span>
            </div>
          )}

          <div className="flex justify-between bg-gray-50 p-3 rounded-md shadow-sm">
            <span className="font-semibold text-gray-700">Ngày tạo hồ sơ:</span>
            <span className="text-gray-900">
              {format(new Date(customer.createdAt), "dd/MM/yyyy")}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
