import { uploadApi } from "@/api/upload";
import { Modal, Form, Input, Button, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useCreateBookStore } from "../hooks/useCreateBookStore";

interface CreateStoreModalProps {
  open: boolean;
  onClose: () => void;
}

type CreateStoreFormValues = {
  name: string;
  phoneNumber: string;
  address: string;
};

export const CreateStoreModal = ({ open, onClose }: CreateStoreModalProps) => {
  const [form] = Form.useForm<CreateStoreFormValues>();
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync, isPending } = useCreateBookStore();

  const isSubmitting = useMemo(
    () => isPending || isUploading,
    [isPending, isUploading],
  );

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setRawFile(null);
      setPreviewUrl("");
      setIsUploading(false);
    }
  }, [open, form]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setRawFile(file);
    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsUploading(true);

      let logoUrl: string | undefined = undefined;
      if (rawFile) {
        try {
          logoUrl = await uploadApi.uploadFile(rawFile);
        } catch (e) {
          console.error(e);
          message.error("Upload logo thất bại. Vui lòng thử lại.");
          return;
        }
      }

      await mutateAsync({
        ...values,
        logoUrl,
      });

      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-teal-800">Tạo chi nhánh</h2>
          <p className="text-sm text-gray-500 font-normal">
            Vui lòng nhập thông tin chi nhánh mới.
          </p>
        </div>
      }
      open={open}
      onCancel={() => {
        if (!isSubmitting) onClose();
      }}
      centered
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        className="space-y-2"
      >
        <Form.Item
          label="Tên chi nhánh"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên chi nhánh" }]}
        >
          <Input placeholder="Ví dụ: Nhà sách Kim Đồng" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              validator: async (_, value) => {
                const v = String(value ?? "").trim();
                if (!v) return;
                // Basic VN formats (+84 / 0) - backend will enforce strictly
                const ok = /^(\+?84|0)\d{9,10}$/.test(v);
                if (!ok) throw new Error("Số điện thoại không hợp lệ");
              },
            },
          ]}
        >
          <Input placeholder="Ví dụ: 0393877632 hoặc +84393873630" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
        >
          <Input.TextArea
            placeholder="Ví dụ: 123 Đường Lê Lợi, Quận 1, TP.HCM"
            rows={3}
          />
        </Form.Item>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Logo (tuỳ chọn)</div>
          <div className="flex items-start gap-4">
            <div className="w-28 h-28 rounded-lg border border-teal-200 overflow-hidden bg-teal-50 flex items-center justify-center shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-gray-500 text-center px-2">
                  Chưa chọn ảnh
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                disabled={isSubmitting}
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              {rawFile && (
                <Button
                  type="default"
                  disabled={isSubmitting}
                  onClick={() => {
                    setRawFile(null);
                    setPreviewUrl("");
                  }}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            className="flex-1"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="flex-1 bg-teal-600 hover:bg-teal-700"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Tạo chi nhánh"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

