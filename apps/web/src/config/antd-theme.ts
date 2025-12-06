import { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    borderRadius: 6,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  components: {
    Layout: {
      bodyBg: "#f0f2f5",
      headerBg: "#ffffff",
      siderBg: "#001529",
    },
    Menu: {
      darkItemBg: "#001529",
      darkSubMenuItemBg: "#000c17",
    },
  },
};

