import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message, Spin } from "antd";
import { InventoryFormData } from "../types";
import { uploadApi } from "@/api/upload"; // Import API upload

interface InventoryEditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
  initialData?: InventoryFormData;
}

export const InventoryEditPanel: React.FC<InventoryEditPanelProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [rawFile, setRawFile] = useState<File | null>(null); // State lưu file mới
  const [isUploading, setIsUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      form.setFieldsValue(initialData);
      setImageUrl(initialData.image || "");
      setRawFile(null); // Reset file raw mỗi khi mở form mới
      setIsDirty(false);
    } else if (!isOpen) {
      form.resetFields();
      setImageUrl("");
      setRawFile(null);
      setIsDirty(false);
    }
  }, [isOpen, initialData, form]);

  const handleClose = () => {
    if (isDirty || rawFile) {
      Modal.confirm({
        title: "Bạn có chắc muốn hủy những thay đổi?",
        okText: "Có",
        cancelText: "Không",
        onOk: () => {
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file); // Lưu file để upload
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl); // Preview
      setIsDirty(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      let finalImageUrl = imageUrl; // Mặc định lấy URL hiện tại (ảnh cũ)

      // Nếu có chọn file mới -> Upload lên server lấy URL mới
      if (rawFile) {
        try {
          finalImageUrl = await uploadApi.uploadFile(rawFile);
        } catch (error) {
          message.error("Upload ảnh thất bại. Vui lòng thử lại.");
          setIsUploading(false);
          return;
        }
      }

      const formData = { ...values, image: finalImageUrl };
      onSubmit(formData as InventoryFormData);

      setIsDirty(false);
      setRawFile(null); // Clear file sau khi submit
      message.success("Hàng hóa đã được cập nhật thành công");
    } catch {
      message.error("Vui lòng kiểm tra lại thông tin");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      width={1200}
      centered
      footer={null}
      destroyOnClose={true}
      closeIcon={<span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">×</span>}
      styles={{
        body: { backgroundColor: "#D4E5E4", padding: 0 },
        mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" },
      }}
      title={null}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#D4E5E4", borderRadius: 12, zIndex: 0 }} />

      <div className="bg-[#D4E5E4] rounded-xl p-8 relative" style={{ zIndex: 1 }}>
        <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Sửa Hàng hóa</h2>

        <div className="flex gap-8 justify-center">
          {/* Image Upload Area */}
          <div className="flex-shrink-0 w-[320px] flex flex-col items-center">
            <div className="relative w-80 h-80 bg-black rounded-2xl border-2 border-[#102e3c] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#1a998f] transition-colors">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />

              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <Spin size="large" />
                </div>
              )}
            </div>
            <p className="text-center text-sm text-[#102e3c] mt-4">Chọn ảnh cho Hàng hóa (320 × 320)</p>
          </div>

          <div className="flex-1">
            <Form form={form} layout="vertical" requiredMark={false} className="space-y-4" onValuesChange={() => setIsDirty(true)}>
              <Form.Item name="name" label={<span className="text-lg font-semibold text-[#102e3c]">Tên Sản Phẩm:</span>} rules={[{ required: true }]}>
                <Input className="border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0 focus:shadow-none hover:border-[#1a998f] focus:border-[#1a998f]" />
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item name="purchasePrice" label={<span className="text-lg font-semibold text-[#102e3c]">Giá nhập:</span>} rules={[{ required: true }]}>
                  <InputNumber min={0} controls={false} className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0" />
                </Form.Item>
                <Form.Item name="sellingPrice" label={<span className="text-lg font-semibold text-[#102e3c]">Giá Bán:</span>} rules={[{ required: true }]}>
                  <InputNumber min={0} controls={false} className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0" />
                </Form.Item>
              </div>

              <Form.Item name="stock" label={<span className="text-lg font-semibold text-[#102e3c]">Tồn Kho:</span>} rules={[{ required: true }]}>
                <InputNumber min={0} controls={false} className="w-full border-0 border-b-2 border-[#102e3c] rounded-none bg-transparent text-lg px-0" />
              </Form.Item>

              <Form.Item name="supplier" label={<span className="text-lg font-semibold text-[#102e3c]">Nhà Cung Cấp:</span>}>
                <Input variant="borderless" style={{ width: "100%", fontSize: 18, borderBottom: "2px solid #102e3c", padding: "4px 0", backgroundColor: "transparent" }} />
              </Form.Item>

              {initialData?.category === "Sách" && (
                <>
                  <Form.Item name="author" label={<span className="text-lg font-semibold text-[#102e3c]">Tác Giả:</span>}>
                    <Input variant="borderless" style={{ fontSize: 18, borderBottom: "2px solid #102e3c", backgroundColor: "transparent" }} />
                  </Form.Item>
                </>
              )}

              <Form.Item name="description" label={<span className="text-lg font-semibold text-[#102e3c]">Mô Tả:</span>}>
                <Input.TextArea rows={3} className="border-2 border-[#102e3c] rounded-lg bg-transparent text-lg resize-none focus:border-[#1a998f] hover:border-[#1a998f]" />
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isUploading}
            disabled={isUploading}
            className="h-12 px-20 rounded-2xl bg-[#1a998f] text-2xl font-bold border-none hover:bg-[#158f85]"
          >
            {isUploading ? "Đang xử lý..." : "Cập nhật Hàng hóa"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};