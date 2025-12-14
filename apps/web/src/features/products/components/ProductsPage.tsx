import { Card, Table, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export const ProductsPage = () => {
  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price.toLocaleString("vi-VN")} đ`,
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Hành động",
      key: "action",
      render: () => (
        <Space>
          <Button type="link">Sửa</Button>
          <Button type="link" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: "1",
      code: "SP001",
      name: "Sách lập trình React",
      price: 150000,
      stock: 50,
    },
    {
      key: "2",
      code: "SP002",
      name: "Sách TypeScript",
      price: 120000,
      stock: 30,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};


