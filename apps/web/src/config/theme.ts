import { ThemeConfig } from "antd";

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: "#13c2c2", // Teal color
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
    Button: {
      borderRadius: 6,
    },
  },
};

