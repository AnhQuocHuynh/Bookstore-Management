import React from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";

export interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "Hoạt động" | "Ngưng hoạt động";
  taxCode: string;
  contactPerson: string;
  note: string;
}

interface SupplierAddPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 600,
  color: "#102e3c",
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  fontSize: "22px",
  color: "#102e3c",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid #102e3c",
  borderRadius: 20,
  padding: "4px 0",
};

export const SupplierAddPanel: React.FC<SupplierAddPanelProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
      message.success("Nhà cung cấp đã được thêm thành công");
    } catch {
      message.error("Vui lòng kiểm tra lại thông tin");
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      width={1100}
      centered
      footer={null}
      closeIcon={<span style={{ fontSize: 28, color: "#102e3c" }}>✕</span>}
      styles={{
        header: {
          backgroundColor: "#D4E5E4",
          marginBottom: 30,
          borderBottom: "none",
        },
        body: {
          backgroundColor: "#D4E5E4",
        }
      }}
      title={
        <div
          style={{
            textAlign: "center",
            fontSize: 32,
            fontWeight: "bold",
            color: "#102e3c",
            marginTop: 10,
            position: "relative",
            zIndex: 10,
          }}
        >
          Thêm Nhà cung cấp mới
        </div>
      }
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#D4E5E4",
          borderRadius: 12,
          zIndex: 0,
        }}
      />
      <Form
        style={{ paddingLeft: 50, paddingRight: 50, position: "relative", zIndex: 1 }}
        form={form}
        layout="horizontal"
        labelAlign="left"
        colon={false}
        labelCol={{ flex: "0 0 220px" }}
        wrapperCol={{ flex: "1" }}
        requiredMark={false}
      >
        <Form.Item name="name" label={<span style={labelStyle}>Tên Nhà cung cấp:</span>}>
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item name="email" label={<span style={labelStyle}>Email:</span>}>
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item name="phone" label={<span style={labelStyle}>SĐT:</span>}>
          <Input style={inputStyle} />
        </Form.Item>

        <Form.Item name="address" label={<span style={labelStyle}>Địa chỉ:</span>}>
          <Input.TextArea autoSize style={{ ...inputStyle, resize: "none" }} />
        </Form.Item>

        <Form.Item name="status" label={<span style={labelStyle}>Trạng thái</span>}>
          <Select
            variant="borderless"
            style={{
              width: "100%",
              fontSize: 22,
              borderBottom: "2px solid #102e3c",
            }}
            suffixIcon={<span style={{ fontSize: 16 }}>▼</span>}
            options={[
              { value: "Hoạt động", label: "Hoạt động" },
              { value: "Ngưng hoạt động", label: "Ngưng hoạt động" },
            ]}
          />
        </Form.Item>

        <Form.Item name="taxCode" label={<span style={labelStyle}>Người liên lạc</span>}>
          <Select
            variant="borderless"
            style={{
              width: "100%",
              fontSize: 22,
              borderBottom: "2px solid #102e3c",
            }}
            suffixIcon={<span style={{ fontSize: 16 }}>▼</span>}
            options={[
              {
                value: "nguyenvana@email.com.vn",
                label: "nguyenvana@email.com.vn",
              },
            ]}
          />
        </Form.Item>

        <Form.Item name="note" label={<span style={labelStyle}>Ghi chú</span>}>
          <Input style={inputStyle} />
        </Form.Item>

        <div style={{ marginTop: 60, display: "flex", justifyContent: "center" }}>
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{
              height: 50,
              width: 480,
              borderRadius: 20,
              backgroundColor: "#1a998f",
              fontSize: 28,
              fontWeight: "bold",
              border: "none",
            }}
          >
            Thêm Nhà Cung cấp
          </Button>
        </div>
      </Form>
    </Modal>
  );
};