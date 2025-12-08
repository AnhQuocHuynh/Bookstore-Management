import { Layout } from "antd";
import { ReactNode } from "react";

const { Content } = Layout;

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <Content className="flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8">{children}</div>
      </Content>
    </Layout>
  );
};
