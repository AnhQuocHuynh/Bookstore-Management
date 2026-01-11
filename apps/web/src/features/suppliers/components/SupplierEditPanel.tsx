import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Switch, Tag } from "antd"; // Import Switch, Tag
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

  useEffect(() => {
    if (initialData) {
      // Map dữ liệu từ API vào Form
      form.setFieldsValue({
        ...initialData,
        // Chuyển đổi status string -> boolean cho Switch
        isActive: initialData.status === 'active',
      });
    }
  }, [initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Chuyển đổi ngược lại: boolean (Switch) -> status string (API)
      const submitData: SupplierFormData = {
        ...values,
        status: values.isActive ? 'active' : 'inactive',
      };

      // Xóa trường tạm isActive trước khi gửi (nếu cần sạch sẽ object, dù gửi thừa cũng không sao)
      delete (submitData as any).isActive;

      onSubmit(submitData);
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

        <Form form={form} layout="vertical" onValuesChange={() => setIsDirty(true)}>

          {/* Hàng 1: Tên & Trạng thái */}
          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="name" label={<span className="font-semibold">Tên Nhà Cung Cấp</span>} rules={[{ required: true }]} className="col-span-2">
              <Input className="border-[#102e3c]" />
            </Form.Item>

            {/* --- TOGGLE TRẠNG THÁI --- */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="font-semibold text-[#102e3c]">Trạng thái hợp tác:</span>
              <div className="flex items-center gap-3 h-[32px]">
                <Form.Item name="isActive" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
                  {({ getFieldValue }) =>
                    getFieldValue("isActive") ? (
                      <Tag color="success">Đang hoạt động</Tag>
                    ) : (
                      <Tag color="error">Ngừng hợp tác</Tag>
                    )
                  }
                </Form.Item>
              </div>
            </div>
            {/* ------------------------- */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="contactPerson" label={<span className="font-semibold">Người Liên Hệ</span>}>
              <Input className="border-[#102e3c]" />
            </Form.Item>
            <Form.Item name="taxCode" label={<span className="font-semibold">Mã Số Thuế</span>}>
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

          <Form.Item name="address" label={<span className="font-semibold">Địa Chỉ</span>} rules={[{ required: true }]}>
            <Input className="border-[#102e3c]" />
          </Form.Item>

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