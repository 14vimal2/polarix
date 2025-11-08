import type { StorybookConfig } from "@storybook/react-vite";
import postcssConfig from "../postcss.config.mjs"; // PostCSS config must export an array of plugins

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (viteConfig) => {
    const plugins = Array.isArray(postcssConfig.plugins)
      ? postcssConfig.plugins
      : Object.values(postcssConfig.plugins); // Convert object → arra
    //
    return {
      ...viteConfig,
      css: {
        ...(viteConfig.css || {}), // fallback to empty object if undefined
        postcss: {
          plugins: plugins, // ensure it's an array
        },
      },
    };
  },
};

export default config;
