import type { Preview } from "@storybook/nextjs";
import "../src/app/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "paper",
      values: [
        { name: "paper", value: "#f5f7fa" },
        { name: "surface", value: "#ffffff" },
        { name: "dark", value: "#090d14" },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Color scheme",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      if (theme === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.documentElement.style.background = "#090d14";
      } else {
        document.documentElement.removeAttribute("data-theme");
        document.documentElement.style.background = "#f5f7fa";
      }
      return <Story />;
    },
  ],
};

export default preview;