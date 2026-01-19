import React, { useState } from "react";
import { Card, Form, Input, DatePicker, Button, Select, message } from "antd";
import dayjs from "dayjs";
import { EmployeeRole } from "../types";
import { useInviteEmployee } from "../hooks/useEmployees";

const roleOptions = [
  { label: "Quản lý cửa hàng", value: "STORE_MANAGER" as EmployeeRole },
  { label: "Chủ cửa hàng", value: EmployeeRole.OWNER },
  { label: "Quản lý", value: EmployeeRole.MANAGER },
  { label: "Thu ngân", value: EmployeeRole.CASHIER },
  { label: "Kho hàng", value: EmployeeRole.WAREHOUSE },
  { label: "Bán hàng", value: EmployeeRole.SALES },
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
  address?: string;
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
    <div className={isModal ? "w-full" : "flex justify-center w-full py-8 px-4 bg-[#f7f9fa] min-h-screen"}>
      <div className={isModal ? "w-full" : "w-full max-w-3xl"}>
        <div className="bg-[#D4E5E4] rounded-xl p-8 relative shadow-sm" style={{ zIndex: 1 }}>
          <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Thêm Nhân Viên</h2>

          <Form<FormValues>
            form={form}
            layout="vertical"
            initialValues={{ role: "STORE_MANAGER" as EmployeeRole }}
            requiredMark={false}
            onFinish={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="fullName"
                label={<span className="text-lg font-semibold text-[#102e3c]">Họ và Tên:</span>}
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="email"
                label={<span className="text-lg font-semibold text-[#102e3c]">Email:</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="nguyenvana@example.com" />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label={<span className="text-lg font-semibold text-[#102e3c]">Số Điện Thoại:</span>}
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="0912345678" />
              </Form.Item>

              <Form.Item
                name="address"
                label={<span className="text-lg font-semibold text-[#102e3c]">Địa Chỉ:</span>}
              >
                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" placeholder="123 Đường ABC, Hà Nội" />
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
                label={<span className="text-lg font-semibold text-[#102e3c]">Vai trò:</span>}
                rules={[{ required: true, message: "Chọn vai trò" }]}
              >
                <Select
                  size="large"
                  options={roleOptions}
                  placeholder="Chọn vai trò"
                  className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]"
                  dropdownMatchSelectWidth
                />
              </Form.Item>
            </div>

            <div className="flex justify-center mt-8 gap-3">
              {isModal && (
                <Button onClick={onClose} size="large">Hủy</Button>
              )}
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                loading={isUploading || inviteEmployee.isPending}
                className="h-12 px-10 rounded-2xl bg-[#1a998f] text-xl font-bold border-none hover:bg-[#158f85]"
              >
                {isUploading || inviteEmployee.isPending ? "Đang xử lý..." : "Tạo nhân viên"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};
