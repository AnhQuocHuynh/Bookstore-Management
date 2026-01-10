import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { SupplierFormData } from "../types";

interface SupplierAddPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

export const SupplierAddPanel: React.FC<SupplierAddPanelProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);

  // --- ĐÃ XÓA useEffect GÂY LỖI ---

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      // Logic reset sẽ được xử lý tự động bởi afterClose hoặc destroyOnClose
      setIsDirty(false);
    } catch {
      // Validate fail
    }
  };

  const handleClose = () => {
    if (isDirty) {
      Modal.confirm({
        title: "Bạn có chắc muốn hủy?",
        content: "Dữ liệu chưa lưu sẽ bị mất.",
        okText: "Đóng",
        cancelText: "Tiếp tục nhập",
        onOk: onClose, // onClose sẽ kích hoạt đóng modal -> sau đó afterClose chạy
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      // SỬA LỖI: Reset form và state sau khi modal đã đóng hoàn toàn
      afterClose={() => {
        form.resetFields();
        setIsDirty(false);
      }}
      width={800}
      centered
      footer={null}
      destroyOnClose={true} // Tự động hủy DOM khi đóng
      title={null}
      styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
      closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
    >
      <div className="bg-[#D4E5E4] rounded-lg p-6">
        <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Thêm Nhà Cung Cấp</h2>

        {/* Thêm prop form={form} */}
        <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label={<span className="font-semibold">Tên Nhà Cung Cấp</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="contactPerson" label={<span className="font-semibold">Người Liên Hệ</span>}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ required: true, message: "Bắt buộc nhập" }, { type: 'email', message: "Email không hợp lệ" }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="phoneNumber" label={<span className="font-semibold">Số Điện Thoại</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="address" label={<span className="font-semibold">Địa Chỉ</span>} rules={[{ required: true, message: "Bắt buộc nhập" }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="taxCode" label={<span className="font-semibold">Mã Số Thuế</span>}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <Form.Item name="note" label={<span className="font-semibold">Ghi Chú</span>}>
            <Input.TextArea rows={3} className="border-[#102e3c]" />
          </Form.Item>

          <div className="flex justify-center mt-6">
            <Button type="primary" onClick={handleSubmit} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-10 font-bold rounded-xl border-none">
              Lưu Thông Tin
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};