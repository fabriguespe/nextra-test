const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
});

module.exports = withNextra({
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.experiments = {
      asyncWebAssembly: true,
    };

    return config;
  },
});
