import AvatarUpload from "@/features/users/components/AvatarUpload";
import { useUploadAvt } from "@/features/users/hooks/use-upload-avt";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  ExclamationCircleOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  theme,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser, useUpdateCurrentUser } from "../hooks/useUsers";

const { Title, Text } = Typography;
const softShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";

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
  const [localAvatar, setLocalAvatar] = useState(userData?.avatarUrl || "");
  const { token } = theme.useToken();
  const { mutate, isPending: isUploadPending } = useUploadAvt();
  const { setStoreToken, currentStore, user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!userData) return;
    form.setFieldsValue({
      fullName: userData.fullName || "",
      phoneNumber: userData.phoneNumber || "",
      address: userData.address || "",
      avatarUrl: userData.avatarUrl || "",
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
      centered: true,
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
      centered: true,
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
        console.error(e);
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

    if (values.avatarUrl && typeof values.avatarUrl === "string") {
      const avatarValue = values.avatarUrl.trim();
      if (avatarValue) {
        if (isValidHttpUrl(avatarValue)) {
          payload.avatarUrl = avatarValue;
        } else {
          message.warning(
            "Avatar không phải URL hợp lệ, trường này sẽ không được cập nhật.",
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
        if (accessToken && currentStore && user) {
          setStoreToken(accessToken, currentStore, {
            ...user,
            avatarUrl: values.avatarUrl,
          });
        }

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
      centered: true,
      onOk() {
        message.success("Đã xóa tài khoản.");
      },
    });
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
            Chỉnh sửa hồ sơ
          </Title>
          <Space>
            <Button onClick={handleCancel}>Hủy bỏ</Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSaving}
              className="flex items-center"
            >
              <SaveIcon size={15} /> Lưu thay đổi
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
            avatarUrl: "",
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
                style={{ borderRadius: "12px", boxShadow: softShadow }}
              >
                <div
                  style={{
                    height: "80px",
                    backgroundColor: token.colorPrimary,
                  }}
                ></div>

                <div
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "-80px",
                    position: "relative",
                    zIndex: 10,
                  }}
                >
                  <Form.Item
                    name="avatarUrl"
                    valuePropName="avatarUrl"
                    getValueFromEvent={(fileUrl) => fileUrl}
                    noStyle
                  >
                    <AvatarUpload
                      avatarUrl={localAvatar || userData?.avatarUrl}
                      onUpload={(file) => {
                        mutate(file, {
                          onSuccess: (data) => {
                            const imageUrl = data.url;
                            setLocalAvatar(imageUrl);
                            form.setFieldsValue({ avatarUrl: imageUrl });
                            message.success("Tải ảnh lên thành công!");
                          },
                          onError: (err) => {
                            console.error("Upload lỗi:", err);
                            message.error(
                              "Hệ thống lưu trữ file đang quá tải. Vui lòng thử lại sau.",
                            );
                          },
                        });
                      }}
                      isUploading={isUploadPending}
                    />
                  </Form.Item>

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
                    Định dạng JPG, PNG tối đa 10MB.
                  </Text>
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
                style={{ borderRadius: "12px", boxShadow: softShadow }}
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
                style={{ borderRadius: "12px", boxShadow: softShadow }}
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
                style={{ borderRadius: "12px", boxShadow: softShadow }}
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
                  boxShadow: softShadow,
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
