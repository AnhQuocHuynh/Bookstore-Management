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
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  MailOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useCurrentUser, useUpdateCurrentUser } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

export const UserEditPage = () => {
  const [form] = Form.useForm();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const { data: apiResponse, isLoading, isPending, error } = useCurrentUser();
  const { mutateAsync: updateUser, isPending: isSaving } = useUpdateCurrentUser();
  const loadingUser = (isLoading ?? false) || (isPending ?? false);
  const navigate = useNavigate();
  const userData = apiResponse?.data;
  const logoUrl = Form.useWatch("logoUrl", form);

  useEffect(() => {
    if (!userData) return;
    form.setFieldsValue({
      fullName: userData.fullName || "",
      phoneNumber: userData.phoneNumber || "",
      address: userData.address || "",
      logoUrl: userData.logoUrl || userData.avatarUrl || "",
      birthDate: userData.birthDate ? moment(userData.birthDate) : undefined,
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
          message.warning("Logo không phải URL hợp lệ, trường này sẽ không được cập nhật.");
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
        const detail = Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage;
        message.error(detail || "Không thể lưu thay đổi. Vui lòng thử lại.");
      });
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Xác nhận xóa tài khoản",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?",
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
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Empty description="Không thể tải thông tin người dùng" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 w-full">
      <div className="w-full mx-auto space-y-6">
        
        {/* --- HEADER & ACTIONS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Title level={2} style={{ margin: 0 }}>
            Chỉnh sửa người dùng
          </Title>
          <div className="flex space-x-3">
            <Button className="bg-white border-gray-300 font-medium" onClick={handleCancel}> 
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSaving}
              className="bg-teal-500 hover:bg-teal-400 border-none font-medium"
            >
              ✓ Lưu thay đổi
            </Button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* ================= LEFT COLUMN (Sidebar) ================= */}
            <div className="space-y-6 lg:col-span-1">
              {/* --- CARD 1: AVATAR UPLOAD --- */}
              <Card
                bordered={false}
                bodyStyle={{ padding: 0 }}
                className="rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="h-[100px] bg-teal-600"></div>
                <div className="px-6 pb-6 flex flex-col items-center -mt-[50px] relative z-10">
                  <Upload showUploadList={false} onChange={handleUploadChange}>
                    <div className="cursor-pointer group relative">
                      <Avatar
                        size={100}
                        icon={<UserOutlined />}
                        src={logoUrl || userData?.logoUrl || userData?.avatarUrl || "https://joeschmoe.io/api/v1/random"}
                        className="border-4 border-white shadow-md bg-gray-200 group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xl">
                        <UploadOutlined />
                      </div>
                    </div>
                  </Upload>
                  <Text className="text-center mt-4 text-gray-500 text-sm">
                    Nhấn vào ảnh để tải lên mới.
                    <br />
                    Định dạng JPG, PNG tối đa 2MB.
                  </Text>
                  <div className="w-full mt-4">
                    <Form.Item label="Logo URL" name="logoUrl">
                      <Input size="large" placeholder="https://..." />
                    </Form.Item>
                  </div>
                </div>
              </Card>

              {/* --- CARD 2: STATUS & ROLE --- */}
              <Card
                title={<span className="font-bold">Trạng thái & Vai trò</span>}
                bordered={false}
                className="rounded-2xl shadow-sm"
              >
                <Form.Item label="Vai trò" name="role" className="font-medium">
                  <Select size="large" className="rounded-md w-full" disabled>
                    <Option value="manager">Quản Lý</Option>
                    <Option value="staff">Nhân Viên</Option>
                    <Option value="admin">Quản Trị Viên</Option>
                  </Select>
                </Form.Item>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <div className="font-medium">Đang hoạt động</div>
                    <div className="text-gray-500 text-sm">
                      Người dùng có thể đăng nhập
                    </div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" noStyle>
                    <Switch className="bg-gray-300" disabled />
                  </Form.Item>
                </div>
              </Card>
            </div>

            {/* ================= RIGHT COLUMN (Content) ================= */}
            <div className="space-y-6 lg:col-span-3">
              {/* --- CARD 3: GENERAL INFO --- */}
              <Card
                bordered={false}
                className="rounded-2xl shadow-sm"
                title={
                  <div className="border-l-4 border-teal-500 pl-3 font-bold text-lg">
                    Thông tin chung
                  </div>
                }
              >
                <Form.Item label="Tên đầy đủ" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                  <Input size="large" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Số điện thoại" name="phoneNumber">
                    <Input size="large" />
                  </Form.Item>
                  <Form.Item label="Ngày sinh" name="birthDate">
                    <DatePicker size="large" format="DD/MM/YYYY" className="w-full" />
                  </Form.Item>
                </div>

                <Form.Item label="Địa chỉ thường trú" name="address">
                  <Input size="large" />
                </Form.Item>
              </Card>

              {/* --- CARD 4: SECURITY --- */}
              <Card
                bordered={false}
                className="rounded-2xl shadow-sm"
                title={
                  <div className="border-l-4 border-orange-500 pl-3 font-bold text-lg">
                    Bảo mật & Đăng nhập
                  </div>
                }
              >
                {/* --- CHANGED: Grid Layout for Email and Username --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Email đăng nhập">
                    <Input
                      size="large"
                      prefix={<MailOutlined className="text-gray-400 mr-2" />}
                      value={userData?.email}
                      disabled
                      className="bg-gray-50 text-gray-500"
                    />
                    <div className="text-gray-400 text-xs mt-2">
                      Không thể thay đổi Email.
                    </div>
                  </Form.Item>

                  <Form.Item 
                    label="Tên đăng nhập" 
                    name="username"
                    //rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined className="text-gray-400 mr-2" />}
                      placeholder="Nhập username"
                      disabled
                    />
                  </Form.Item>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Checkbox
                    checked={isChangingPassword}
                    onChange={(e) => setIsChangingPassword(e.target.checked)}
                    disabled
                  >
                    <span className="font-medium">Đổi mật khẩu cho người dùng này</span>
                  </Checkbox>

                  {/* Conditional Password Inputs */}
                  {isChangingPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <Form.Item
                        label="Mật khẩu mới"
                        name="newPassword"
                        rules={[{ required: true, message: "Nhập mật khẩu mới" }]}
                      >
                        <Input.Password size="large" placeholder="••••••••" disabled />
                      </Form.Item>
                      <Form.Item
                        label="Xác nhận lại"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: "Nhập lại mật khẩu" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password size="large" placeholder="••••••••" disabled />
                      </Form.Item>
                    </div>
                  )}
                </div>
              </Card>

              {/* --- CARD 5: DELETE ZONE --- */}
              <Card
                bordered={false}
                className="rounded-2xl shadow-sm bg-red-50 border border-red-100"
                bodyStyle={{ padding: '24px' }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <Title level={4} type="danger" style={{ margin: 0, fontWeight: 'bold' }}>
                      Xóa tài khoản
                    </Title>
                    <Text type="danger">
                      Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị ẩn.
                    </Text>
                  </div>
                  <Button
                    danger
                    size="large"
                    className="bg-white font-medium min-w-[150px]"
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