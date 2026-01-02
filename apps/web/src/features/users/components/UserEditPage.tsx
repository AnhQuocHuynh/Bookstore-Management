import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Typography,
  Form,
  Input,
  DatePicker,
  Select,
  Switch,
  Checkbox,
  Upload,
  message,
  Modal,
  Spin,
  Empty,
  Space,
  theme,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useCurrentUser, useUpdateCurrentUser } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export const UserEditPage = () => {
  const [form] = Form.useForm();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const { data: apiResponse, isLoading, isPending, error } = useCurrentUser();
  const { mutateAsync: updateUser, isPending: isSaving } =
    useUpdateCurrentUser();
  const loadingUser = (isLoading ?? false) || (isPending ?? false);
  const navigate = useNavigate();
  const userData = apiResponse?.data;
  const logoUrl = Form.useWatch("logoUrl", form);
  const { token } = theme.useToken();

  useEffect(() => {
    if (!userData) return;
    form.setFieldsValue({
      fullName: userData.fullName || "",
      phoneNumber: userData.phoneNumber || "",
      address: userData.address || "",
      logoUrl: userData.logoUrl || userData.avatarUrl || "",
      birthDate: userData.birthDate ? dayjs(userData.birthDate) : undefined,
      username: userData.username || "",
      email: userData.email || "",
      role: userData.role || "",
      isActive: userData.isActive ?? false,
    });
  }, [userData, form]);

  const handleCancel = () => {
    if (!isChanged) {
      navigate("/users");
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc muốn hủy những thay đổi?",
      icon: <ExclamationCircleOutlined />,
      okText: "Có",
      cancelText: "Không",
      onOk() {
        navigate("/users");
      },
    });
  };

  const handleSave = () => {
    Modal.confirm({
      title: "Bạn có chắc muốn lưu những thay đổi?",
      icon: <ExclamationCircleOutlined />,
      okText: "Có",
      cancelText: "Không",
      onOk() {
        form.submit();
      },
    });
  };

  const handleFinish = (values: any) => {
    const isValidHttpUrl = (input: string) => {
      try {
        const parsed = new URL(input);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch (e) {
        return false;
      }
    };

    const payload: Record<string, any> = {};
    const addIfPresent = (key: string, value?: string) => {
      if (typeof value !== "string") return;
      const trimmed = value.trim();
      if (trimmed) {
        payload[key] = trimmed;
      }
    };

    addIfPresent("fullName", values.fullName);
    addIfPresent("phoneNumber", values.phoneNumber);
    addIfPresent("address", values.address);

    if (values.logoUrl && typeof values.logoUrl === "string") {
      const logoValue = values.logoUrl.trim();
      if (logoValue) {
        if (isValidHttpUrl(logoValue)) {
          payload.logoUrl = logoValue;
        } else {
          message.warning(
            "Logo không phải URL hợp lệ, trường này sẽ không được cập nhật.",
          );
        }
      }
    }

    if (values.birthDate) {
      payload.birthDate = values.birthDate.toISOString();
    }

    if (Object.keys(payload).length === 0) {
      message.info("Không có thay đổi hợp lệ để lưu.");
      return;
    }

    updateUser(payload)
      .then(() => {
        message.success("Lưu thay đổi thành công!");
        navigate("/users");
      })
      .catch((err) => {
        const apiMessage = err?.response?.data?.message;
        const detail = Array.isArray(apiMessage)
          ? apiMessage.join(", ")
          : apiMessage;
        message.error(detail || "Không thể lưu thay đổi. Vui lòng thử lại.");
      });
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Xác nhận xóa tài khoản",
      icon: <ExclamationCircleOutlined />,
      content:
        "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk() {
        message.success("Đã xóa tài khoản.");
      },
    });
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleUploadChange = async ({ file }: any) => {
    const raw = file?.originFileObj as File | undefined;
    if (!raw) return;
    try {
      const base64 = await toBase64(raw);
      form.setFieldsValue({ logoUrl: base64 });
      message.success("Đã chọn logo từ file");
    } catch (e) {
      message.error("Không thể đọc file ảnh");
    }
  };

  if (loadingUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Empty description="Không thể tải thông tin người dùng" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "24px 48px" }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", width: "100%" }}>
        {/* --- HEADER & ACTIONS --- */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Chỉnh sửa người dùng
          </Title>
          <Space>
            <Button onClick={handleCancel}>Hủy bỏ</Button>
            <Button type="primary" onClick={handleSave} loading={isSaving}>
              ✓ Lưu thay đổi
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            fullName: "",
            phoneNumber: "",
            address: "",
            logoUrl: "",
            birthDate: undefined,
            username: "",
            email: "",
            role: "",
            isActive: false,
          }}
          onFinish={handleFinish}
          onValuesChange={() => setIsChanged(true)}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "350px 1fr",
              gap: "32px",
            }}
          >
            {/* ================= LEFT COLUMN (Sidebar) ================= */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* --- CARD 1: AVATAR UPLOAD --- */}
              <Card
                bordered={false}
                style={{ borderRadius: "12px", boxShadow: token.boxShadow }}
              >
                <div
                  style={{
                    height: "100px",
                    backgroundColor: token.colorPrimary,
                  }}
                ></div>
                <div
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "-50px",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <Upload showUploadList={false} onChange={handleUploadChange}>
                    <div style={{ cursor: "pointer", position: "relative" }}>
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={
                          logoUrl ||
                          userData?.logoUrl ||
                          userData?.avatarUrl ||
                          "https://joeschmoe.io/api/v1/random"
                        }
                        style={{
                          border: `4px solid ${token.colorBgContainer}`,
                          boxShadow: token.boxShadow,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.3)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.3s",
                          color: "white",
                          fontSize: "20px",
                        }}
                      >
                        <UploadOutlined />
                      </div>
                    </div>
                  </Upload>
                  <Text
                    style={{
                      textAlign: "center",
                      marginTop: "16px",
                      color: token.colorTextSecondary,
                      fontSize: "12px",
                    }}
                  >
                    Nhấn vào ảnh để tải lên mới.
                    <br />
                    Định dạng JPG, PNG tối đa 2MB.
                  </Text>
                  <div style={{ width: "100%", marginTop: "16px" }}>
                    <Form.Item label="Logo URL" name="logoUrl">
                      <Input size="large" placeholder="https://..." />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* --- CARD 2: STATUS & ROLE --- */}
              <Card
                title={
                  <span style={{ fontWeight: "bold" }}>
                    Trạng thái & Vai trò
                  </span>
                }
                bordered={false}
                style={{ borderRadius: "12px", boxShadow: token.boxShadow }}
              >
                <Form.Item
                  label="Vai trò"
                  name="role"
                  style={{ fontWeight: "500" }}
                >
                  <Select size="large" disabled>
                    <Select.Option value="manager">Quản Lý</Select.Option>
                    <Select.Option value="staff">Nhân Viên</Select.Option>
                    <Select.Option value="admin">Quản Trị Viên</Select.Option>
                  </Select>
                </Form.Item>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    backgroundColor: token.colorBgElevated,
                    borderRadius: "8px",
                    border: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500" }}>Đang hoạt động</div>
                    <div
                      style={{
                        color: token.colorTextSecondary,
                        fontSize: "12px",
                      }}
                    >
                      Người dùng có thể đăng nhập
                    </div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch disabled />
                  </Form.Item>
                </div>
              </Card>
            </div>

            {/* ================= RIGHT COLUMN (Content) ================= */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* --- CARD 3: GENERAL INFO --- */}
              <Card
                bordered={false}
                style={{ borderRadius: "12px", boxShadow: token.boxShadow }}
                title={
                  <div
                    style={{
                      borderLeft: `4px solid ${token.colorPrimary}`,
                      paddingLeft: "12px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Thông tin chung
                  </div>
                }
              >
                <Form.Item
                  label="Tên đầy đủ"
                  name="fullName"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input size="large" />
                </Form.Item>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <Form.Item label="Số điện thoại" name="phoneNumber">
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item label="Ngày sinh" name="birthDate">
                    <DatePicker
                      size="large"
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Địa chỉ thường trú" name="address">
                  <Input size="large" />
                </Form.Item>
              </Card>

              {/* --- CARD 4: SECURITY --- */}
              <Card
                bordered={false}
                style={{ borderRadius: "12px", boxShadow: token.boxShadow }}
                title={
                  <div
                    style={{
                      borderLeft: `4px solid ${token.colorWarning}`,
                      paddingLeft: "12px",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Bảo mật & Đăng nhập
                  </div>
                }
              >
                {/* --- CHANGED: Grid Layout for Email and Username --- */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <Form.Item label="Email đăng nhập">
                    <Input
                      size="large"
                      prefix={
                        <MailOutlined
                          style={{
                            color: token.colorTextSecondary,
                            marginRight: "8px",
                          }}
                        />
                      }
                      value={userData?.email}
                      disabled
                      style={{
                        backgroundColor: token.colorBgElevated,
                        color: token.colorTextSecondary,
                      }}
                    />
                    <div
                      style={{
                        color: token.colorTextTertiary,
                        fontSize: "12px",
                        marginTop: "8px",
                      }}
                    >
                      Không thể thay đổi Email.
                    </div>
                  </Form.Item>

                  <Form.Item label="Tên đăng nhập" name="username">
                    <Input
                      size="large"
                      prefix={
                        <UserOutlined
                          style={{
                            color: token.colorTextSecondary,
                            marginRight: "8px",
                          }}
                        />
                      }
                      placeholder="Nhập username"
                      disabled
                    />
                  </Form.Item>
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                    backgroundColor: token.colorBgElevated,
                    borderRadius: "8px",
                    border: `1px solid ${token.colorBorder}`,
                  }}
                >
                  <Checkbox
                    checked={isChangingPassword}
                    onChange={(e) => setIsChangingPassword(e.target.checked)}
                    disabled
                  >
                    <span style={{ fontWeight: "500" }}>
                      Đổi mật khẩu cho người dùng này
                    </span>
                  </Checkbox>

                  {/* Conditional Password Inputs */}
                  {isChangingPassword && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginTop: "16px",
                        paddingTop: "16px",
                        borderTop: `1px solid ${token.colorBorder}`,
                      }}
                    >
                      <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[
                          { required: true, message: "Nhập mật khẩu mới" },
                        ]}
                      >
                        <Input.Password
                          size="large"
                          placeholder="••••••••"
                          disabled
                        />
                      </Form.Item>
                      <Form.Item
                        label="Xác nhận lại"
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          { required: true, message: "Nhập lại mật khẩu" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (
                                !value ||
                                getFieldValue("newPassword") === value
                              ) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Mật khẩu xác nhận không khớp!"),
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          size="large"
                          placeholder="••••••••"
                          disabled
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </Card>

              {/* --- CARD 5: DELETE ZONE --- */}
              <Card
                bordered={false}
                style={{
                  borderRadius: "12px",
                  boxShadow: token.boxShadow,
                  backgroundColor: token.colorErrorBg,
                  borderColor: token.colorErrorBorder,
                  border: `1px solid ${token.colorErrorBorder}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        fontWeight: "bold",
                        color: token.colorError,
                      }}
                    >
                      Xóa tài khoản
                    </Title>
                    <Text style={{ color: token.colorError }}>
                      Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan
                      sẽ bị ẩn.
                    </Text>
                  </div>
                  <Button
                    danger
                    size="large"
                    style={{ minWidth: "150px" }}
                    onClick={handleDeleteAccount}
                  >
                    Xóa người dùng
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserEditPage;
