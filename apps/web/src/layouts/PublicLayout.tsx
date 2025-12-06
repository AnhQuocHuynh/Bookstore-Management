import { Layout } from "antd";
import { ReactNode } from "react";

const { Content } = Layout;

interface PublicLayoutProps {
  children: ReactNode;
}

export const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        {children}
      </Content>
    </Layout>
  );
};

