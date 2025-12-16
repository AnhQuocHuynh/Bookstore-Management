import { AuthLayout } from "@/layouts/AuthLayout";
import {
  ArrowLeftOutlined,
  MailOutlined,
  SafetyOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  List,
  message,
  Space,
  Steps,
  Typography,
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, OtpTypeEnum, type StoreInfo } from "../";

const { Title, Text } = Typography;

type StepType = "email" | "store" | "otp" | "reset";

interface FormValues {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [currentStep, setCurrentStep] = useState<StepType>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [authCode, setAuthCode] = useState<string | null>(null);

  // Step 1: Check Email
  const handleCheckEmail = async (values: { email: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.checkEmail(values.email);
      setEmail(values.email);

      // Check if backend returns stores
      if (response.stores && response.stores.length > 0) {
        setStores(response.stores);

        // Case A: Only 1 store - auto select and move to OTP
        if (response.stores.length === 1) {
          setSelectedStoreId(response.stores[0].id);
          await handleSendOtp(response.stores[0].id);
        } else {
          // Case B: Multiple stores - show selection UI
          setCurrentStep("store");
        }
      } else {
        // No stores returned - proceed directly to OTP (existing flow)
        await handleSendOtp();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Email không tồn tại trong hệ thống.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send OTP (with optional storeId - for future use when backend supports it)
  const handleSendOtp = async (_storeId?: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.sendOtp({
        email,
        type: OtpTypeEnum.RESET_PASSWORD,
      });
      setCurrentStep("otp");
      message.success("Mã OTP đã được gửi đến email của bạn.");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể gửi mã OTP. Vui lòng thử lại.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Select Store (if multiple stores)
  const handleSelectStore = async (storeId: string) => {
    setSelectedStoreId(storeId);
    await handleSendOtp(storeId);
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (values: { otp: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOtp({
        email,
        otp: values.otp,
        type: OtpTypeEnum.RESET_PASSWORD,
      });

      if (response.authCode) {
        setAuthCode(response.authCode);
        setCurrentStep("reset");
        message.success("Mã OTP đã được xác thực thành công.");
      } else {
        setError("Không nhận được mã xác thực. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Mã OTP không hợp lệ hoặc đã hết hạn.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Reset Password
  const handleResetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!authCode) {
      message.error("Mã xác thực không hợp lệ. Vui lòng thử lại.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        email,
        newPassword: values.newPassword,
        authCode,
      });
      message.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể đặt lại mật khẩu. Vui lòng thử lại.";
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    await handleSendOtp(selectedStoreId || undefined);
  };

  const getCurrentStepIndex = () => {
    switch (currentStep) {
      case "email":
        return 0;
      case "store":
        return 1;
      case "otp":
        return stores.length > 1 ? 2 : 1;
      case "reset":
        return stores.length > 1 ? 3 : 2;
      default:
        return 0;
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full shadow-lg">
        <Space direction="vertical" size="large" className="w-full">
          {/* Header */}
          <div>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/auth/login")}
              className="mb-4"
            >
              Quay lại đăng nhập
            </Button>
            <Title level={2} className="mb-2">
              Quên mật khẩu
            </Title>
            <Text type="secondary">
              Nhập email của bạn để nhận mã OTP đặt lại mật khẩu
            </Text>
          </div>

          {/* Steps Indicator */}
          <Steps
            current={getCurrentStepIndex()}
            items={[
              {
                title: "Nhập email",
                icon: <MailOutlined />,
              },
              ...(stores.length > 1
                ? [
                    {
                      title: "Chọn cửa hàng",
                      icon: <ShopOutlined />,
                    },
                  ]
                : []),
              {
                title: "Xác thực OTP",
                icon: <SafetyOutlined />,
              },
              {
                title: "Đặt lại mật khẩu",
              },
            ]}
          />

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Step 1: Email Input */}
          {currentStep === "email" && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCheckEmail}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email của bạn"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Tiếp tục
                </Button>
              </Form.Item>
            </Form>
          )}

          {/* Step 2: Store Selection (Only if multiple stores) */}
          {currentStep === "store" && stores.length > 1 && (
            <div>
              <Text className="mb-4 block">
                Bạn có nhiều cửa hàng. Vui lòng chọn cửa hàng bạn muốn đặt lại
                mật khẩu:
              </Text>
              <List
                dataSource={stores}
                renderItem={(store) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50 rounded-lg p-4 border border-gray-200 mb-2"
                    onClick={() => handleSelectStore(store.id)}
                  >
                    <List.Item.Meta
                      avatar={<ShopOutlined className="text-2xl" />}
                      title={store.name}
                      description={
                        <Space direction="vertical" size={0}>
                          {store.code && (
                            <Text type="secondary">Mã: {store.code}</Text>
                          )}
                          {store.address && (
                            <Text type="secondary">{store.address}</Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              {loading && (
                <div className="text-center mt-4">
                  <Text type="secondary">Đang gửi mã OTP...</Text>
                </div>
              )}
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {currentStep === "otp" && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleVerifyOtp}
              autoComplete="off"
            >
              <Form.Item
                name="otp"
                label="Mã OTP"
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP" },
                  {
                    len: 6,
                    message: "Mã OTP phải có 6 chữ số",
                  },
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Nhập mã OTP 6 chữ số"
                  size="large"
                  maxLength={6}
                />
              </Form.Item>

              <Form.Item>
                <Space direction="vertical" className="w-full" size="middle">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                  >
                    Xác thực OTP
                  </Button>
                  <Button
                    type="link"
                    onClick={handleResendOtp}
                    loading={loading}
                    block
                  >
                    Gửi lại mã OTP
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}

          {/* Step 4: Reset Password */}
          {currentStep === "reset" && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleResetPassword}
              autoComplete="off"
            >
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  {
                    min: 8,
                    message: "Mật khẩu phải có ít nhất 8 ký tự",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Nhập lại mật khẩu mới"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </Form>
          )}
        </Space>
      </Card>
    </AuthLayout>
  );
};
