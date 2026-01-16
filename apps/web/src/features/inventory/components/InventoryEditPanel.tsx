import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Spin,
  Switch,
  Tag,
} from "antd";
import { InventoryFormData } from "../types";
import { uploadApi } from "@/api/upload";

interface InventoryEditPanelProps {
  isOpen: boolean;
  initialData: InventoryFormData | null;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
}

export const InventoryEditPanel: React.FC<InventoryEditPanelProps> = ({
  isOpen,
  initialData,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue({
        sku: initialData.sku,
        name: initialData.name,
        sellingPrice: initialData.sellingPrice,
        description: initialData.description,
        isActive: initialData.isActive ?? true,
      });
      setImageUrl(initialData.image || "");
      setRawFile(null);
      setIsDirty(false);
    } else if (!isOpen) {
      form.resetFields();
      setImageUrl("");
      setRawFile(null);
      setIsDirty(false);
    }
  }, [isOpen, initialData, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setImageUrl(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      let finalImageUrl = imageUrl;
      if (rawFile) {
        finalImageUrl = await uploadApi.uploadFile(rawFile);
      }

      await onSubmit({
        ...initialData,
        ...values,
        image: finalImageUrl,
      } as InventoryFormData);

      message.success("Cập nhật thành công");
      setIsDirty(false);
      setRawFile(null);
    } catch {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      centered
      width={900}
      footer={null}
      destroyOnClose
      className="inventory-edit-modal"
      closeIcon={
        <span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">
          ×
        </span>
      }
      styles={{
        content: {
          backgroundColor: "#D4E5E4",
          padding: 0,
          borderRadius: 12,
          overflow: "hidden",
        },
        body: {
          backgroundColor: "#D4E5E4",
          padding: 0,
          overflow: "hidden",
        },
      }}
    >
      <style>{`
        .inventory-edit-modal .ant-modal-content {
          background-color: #D4E5E4 !important;
          border: none !important;
          overflow: hidden !important;
        }
        .inventory-edit-modal .ant-modal-body {
          background-color: #D4E5E4 !important;
          padding: 0 !important;
        }
      `}</style>

      <div className="absolute inset-0 bg-[#D4E5E4]" />
      <div className="relative z-10 bg-[#D4E5E4] p-8 rounded-xl">
        <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">
          Cập Nhật Sản Phẩm
        </h2>

        <div className="flex gap-8">
          {/* IMAGE */}
          <div className="w-[280px] flex flex-col items-center">
            <div className="relative w-64 h-64 bg-white rounded-2xl border-2 border-[#102e3c] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#1a998f] transition">
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-4xl">+</div>
                  <div>Tải ảnh lên</div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Spin />
                </div>
              )}
            </div>
            <p className="text-sm italic mt-3 text-[#102e3c]">
              Nhấn vào ảnh để thay đổi
            </p>
          </div>

          {/* FORM */}
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onValuesChange={() => setIsDirty(true)}
            >
              <div className="grid grid-cols-3 gap-4">
                <Form.Item name="sku" label="Mã SKU">
                  <Input disabled className="bg-gray-100" />
                </Form.Item>

                <Form.Item
                  name="name"
                  label="Tên Sản Phẩm"
                  className="col-span-2"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <Form.Item
                  name="sellingPrice"
                  label="Giá Bán (VNĐ)"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    className="w-full"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(v) =>
                      v!.replace(/,/g, "") as unknown as number
                    }
                  />
                </Form.Item>

                <div className="mb-6">
                  <div className="font-semibold mb-2">
                    Trạng thái kinh doanh:
                  </div>
                  <div className="flex gap-3 items-center">
                    <Form.Item
                      name="isActive"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) =>
                        getFieldValue("isActive") ? (
                          <Tag color="success">Đang bán</Tag>
                        ) : (
                          <Tag color="error">Ngừng kinh doanh</Tag>
                        )
                      }
                    </Form.Item>
                  </div>
                </div>
              </div>

              <Form.Item name="description" label="Mô Tả Chi Tiết">
                <Input.TextArea rows={4} />
              </Form.Item>

              <div className="bg-[#1a998f]/10 p-3 rounded-lg text-sm">
                <b>Lưu ý:</b> Để cập nhật <b>Tồn kho</b> hoặc <b>Giá nhập</b>,
                vui lòng sử dụng chức năng <b>Nhập Kho</b>.
              </div>
            </Form>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={onClose}>Hủy bỏ</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isUploading}
            disabled={!isDirty && !rawFile}
            className="bg-[#1a998f]"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default InventoryEditPanel;