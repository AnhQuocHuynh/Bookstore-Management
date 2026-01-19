import React, { useState } from "react";
import { Form, Input, DatePicker, Button, Select, message } from "antd";
import dayjs from "dayjs";
import { EmployeeRole } from "../types";
import { useInviteEmployee } from "../hooks/useEmployees";

const roleOptions = [
  { label: "Quản lý cửa hàng", value: "STORE_MANAGER"},
  { label: "Nhân viên", value: 'STAFF' },
  { label: "Thu ngân", value:'CASHIER' },
  { label: "Kho hàng", value: "INVENTORY"},
  { label: "Kế toán", value: "ACCOUNTANT"},
];

interface EmployeeAddPageProps {
  onSuccess?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

interface FormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate?: dayjs.Dayjs;
  role: EmployeeRole;
}

export const EmployeeAddPage: React.FC<EmployeeAddPageProps> = ({ onSuccess, onClose, isModal = false }) => {
  const [form] = Form.useForm<FormValues>();
  const inviteEmployee = useInviteEmployee();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      const payload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        role: values.role,
        employeeEmail: values.email,
        birthDate: values.birthDate ? values.birthDate.toISOString() : undefined,
      } as const;

      console.log('[EmployeeAddPage] submit payload', payload);

      inviteEmployee.mutate(payload, {
        onSuccess: () => {
          message.success("Tạo nhân viên thành công");
          form.resetFields();
          onSuccess?.();
        },
        onError: (error) => {
          message.error(error.message || "Không thể tạo nhân viên");
        },
        onSettled: () => {
          setIsUploading(false);
        },
      });
    } catch (err) {
      message.error("Vui lòng kiểm tra lại thông tin");
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#D4E5E4] rounded-xl p-8 relative" style={{ zIndex: 1 }}>
      <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Thêm Nhân Viên</h2>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Form
            form={form}
            layout="vertical"
            initialValues={{ role: "STORE_MANAGER" as EmployeeRole }}
            requiredMark={false}
            className="space-y-4"
          >
            <Form.Item
              name="fullName"
              label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>}
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>}
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" }
              ]}
            >
              <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
            >
              <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
            </Form.Item>

            <Form.Item
              name="birthDate"
              label={<span className="text-lg font-semibold text-[#102e3c]">Ngày Sinh:</span>}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]"
                style={{ fontSize: 18 }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label={<span className="text-lg font-semibold text-[#102e3c]">Vai Trò:</span>}
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg hover:border-[#1a998f] focus:border-[#1a998f]"
                options={roleOptions}
              />
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={isUploading || inviteEmployee.isPending}
          disabled={isUploading || inviteEmployee.isPending}
          className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]"
        >
          {isUploading || inviteEmployee.isPending ? "Đang xử lý..." : "Tạo Nhân Viên"}
        </Button>
      </div>
    </div>
  );
};
