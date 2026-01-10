import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message, Spin, Switch, Tag } from "antd";
import { InventoryFormData } from "../types";
import { uploadApi } from "@/api/upload";

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
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      console.log("Dữ liệu nhận được:", initialData.isActive); // Debug log

      form.setFieldsValue({
        sku: initialData.sku,
        name: initialData.name,
        sellingPrice: initialData.sellingPrice,
        description: initialData.description,
        isActive: initialData.isActive, // Binding dữ liệu
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

  const handleClose = () => {
    if (isDirty || rawFile) {
      Modal.confirm({
        title: "Bạn có chắc muốn hủy những thay đổi?",
        okText: "Có",
        cancelText: "Không",
        onOk: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      setImageUrl(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      let finalImageUrl = imageUrl;
      if (rawFile) {
        try {
          finalImageUrl = await uploadApi.uploadFile(rawFile);
        } catch {
          message.error("Upload ảnh thất bại");
          setIsUploading(false);
          return;
        }
      }

      const formData = {
        ...values,
        image: finalImageUrl
      };

      onSubmit(formData as InventoryFormData);

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
      onCancel={handleClose}
      width={900}
      centered
      footer={null}
      destroyOnClose={true} // AntD mới có thể yêu cầu destroyOnHidden, nhưng destroyOnClose vẫn phổ biến. Nếu warning vẫn còn, hãy đổi thành destroyOnHidden={true}
      closeIcon={<span className="text-3xl text-[#102e3c] cursor-pointer hover:opacity-70">×</span>}
      styles={{
        body: { backgroundColor: "#D4E5E4", padding: 0 },
        mask: { backgroundColor: "rgba(16, 46, 60, 0.5)" },
      }}
      title={null}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#D4E5E4", borderRadius: 12, zIndex: 0 }} />

      <div className="bg-[#D4E5E4] rounded-xl p-8 relative" style={{ zIndex: 1 }}>
        <h2 className="text-center text-3xl font-bold text-[#102e3c] mb-8">Cập Nhật Sản Phẩm</h2>

        <div className="flex gap-8">
          {/* Cột Trái: Ảnh */}
          <div className="flex-shrink-0 w-[280px] flex flex-col items-center">
            <div className="relative w-64 h-64 bg-white rounded-2xl border-2 border-[#102e3c] flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#1a998f] transition-colors shadow-sm">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <span className="block text-4xl mb-2">+</span>
                  <span>Tải ảnh lên</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Spin /></div>}
            </div>
            <p className="text-center text-sm text-[#102e3c] mt-3 italic">Nhấn vào ảnh để thay đổi</p>
          </div>

          {/* Cột Phải: Form */}
          <div className="flex-1">
            {/* QUAN TRỌNG: Thêm prop form={form} vào đây để sửa lỗi Warning "not connected" */}
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="space-y-3"
              onValuesChange={() => setIsDirty(true)}
            >

              <div className="grid grid-cols-3 gap-4">
                <Form.Item name="sku" label={<span className="font-semibold text-[#102e3c]">Mã SKU</span>} className="col-span-1">
                  <Input disabled className="bg-gray-100 border-[#102e3c] text-[#102e3c] font-medium" />
                </Form.Item>
                <Form.Item name="name" label={<span className="font-semibold text-[#102e3c]">Tên Sản Phẩm</span>} className="col-span-2" rules={[{ required: true }]}>
                  <Input className="border-[#102e3c] focus:border-[#1a998f]" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <Form.Item name="sellingPrice" label={<span className="font-semibold text-[#102e3c]">Giá Bán (VNĐ)</span>} rules={[{ required: true }]}>
                  <InputNumber<number>
                    min={0}
                    className="w-full border-[#102e3c]"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => {
                      const parsed = value?.replace(/\$\s?|(,*)/g, '');
                      return parsed ? Number(parsed) : 0;
                    }}
                  />
                </Form.Item>

                {/* --- FIX LỖI SWITCH KHÔNG BẬT --- */}
                <div className="flex flex-col gap-2 mb-6">
                  <span className="font-semibold text-[#102e3c]">Trạng thái kinh doanh:</span>
                  <div className="flex items-center gap-3">
                    {/* Form.Item phải bao bọc trực tiếp Switch, không được qua thẻ div trung gian */}
                    <Form.Item name="isActive" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>

                    {/* Dùng Form.Item noStyle để lắng nghe thay đổi và hiển thị Tag */}
                    <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isActive !== curr.isActive}>
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
                {/* --------------------------------- */}

              </div>

              <Form.Item name="description" label={<span className="font-semibold text-[#102e3c]">Mô Tả Chi Tiết</span>}>
                <Input.TextArea rows={4} className="border-[#102e3c] rounded-lg" />
              </Form.Item>

              <div className="bg-[#1a998f]/10 p-3 rounded-lg text-sm text-[#102e3c]">
                <span className="font-bold">Lưu ý:</span> Để cập nhật <strong>Tồn kho</strong> hoặc <strong>Giá nhập</strong>, vui lòng sử dụng chức năng <strong>Nhập Kho</strong>.
              </div>

            </Form>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl border-[#102e3c] text-[#102e3c]">Hủy bỏ</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isUploading}
            disabled={isUploading}
            className="h-10 px-8 rounded-xl bg-[#1a998f] font-bold border-none hover:bg-[#158f85]"
          >
            Lưu Thay Đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};