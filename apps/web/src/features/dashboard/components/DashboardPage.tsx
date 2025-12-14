import { Card, Row, Col, Statistic, Button } from "antd";
import {
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  InboxOutlined,
  ApiOutlined,
} from "@ant-design/icons";

export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu hôm nay"
              value={11280}
              prefix={<DollarOutlined />}
              suffix="đ"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={156}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={89}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tồn kho"
              value={234}
              prefix={<InboxOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Tổng quan">
        <p>Trang dashboard đang được phát triển...</p>
        <div className="mt-4">
          <Button
            type="primary"
            icon={<ApiOutlined />}
            href="/api"
            target="_blank"
          >
            Mở Swagger API Documentation
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Swagger được proxy qua Vite dev server từ{" "}
            <code>http://localhost:3001/api</code>
          </p>
        </div>
      </Card>
    </div>
  );
};
