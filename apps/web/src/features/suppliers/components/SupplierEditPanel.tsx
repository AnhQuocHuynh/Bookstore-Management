import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { SupplierFormData } from "../types";

interface SupplierEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
  initialData?: SupplierFormData;
}

export const SupplierEditPanel: React.FC<SupplierEditPanelProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);

  // SỬA LỖI: Chỉ sync data khi initialData thay đổi. 
  // Bỏ logic reset form khi !isOpen ở đây (chuyển xuống afterClose)
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      // setIsDirty(false); // Không cần thiết set ở đây nếu logic clean tốt
    }
  }, [initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      setIsDirty(false);
    } catch {
      // Validate fail
    }
  };

  const handleClose = () => {
    if (isDirty) {
      Modal.confirm({
        title: "Hủy thay đổi?",
        content: "Các thay đổi chưa lưu sẽ bị mất.",
        okText: "Đóng",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      // SỬA LỖI: Reset form tại đây
      afterClose={() => {
        form.resetFields();
        setIsDirty(false);
      }}
      width={800}
      centered
      footer={null}
      destroyOnClose={true}
      title={null}
      styles={{ body: { padding: 0 }, mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" } }}
      closeIcon={<span className="text-2xl text-[#102e3c] hover:opacity-70">×</span>}
    >
      <div className="bg-[#D4E5E4] rounded-lg p-6">
        <h2 className="text-center text-2xl font-bold text-[#102e3c] mb-6">Cập Nhật Nhà Cung Cấp</h2>

        {/* Thêm prop form={form} */}
        <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="name" label={<span className="font-semibold">Tên Nhà Cung Cấp</span>} rules={[{ required: true }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="contactPerson" label={<span className="font-semibold">Người Liên Hệ</span>}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="email" label={<span className="font-semibold">Email</span>} rules={[{ required: true }, { type: 'email' }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="phoneNumber" label={<span className="font-semibold">Số Điện Thoại</span>} rules={[{ required: true }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="address" label={<span className="font-semibold">Địa Chỉ</span>} rules={[{ required: true }]}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="taxCode" label={<span className="font-semibold">Mã Số Thuế</span>}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
          </div>

          <Form.Item name="note" label={<span className="font-semibold">Ghi Chú</span>}>
            <Input.TextArea rows={3} className="border-[#102e3c]" />
          </Form.Item>

          <div className="flex justify-center mt-6 gap-3">
            <Button onClick={onClose} className="h-10 px-6 rounded-xl border-[#102e3c]">Hủy</Button>
            <Button type="primary" onClick={handleSubmit} className="bg-[#1a998f] hover:bg-[#158f85] h-10 px-8 font-bold rounded-xl border-none">
              Cập Nhật
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};