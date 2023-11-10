import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>XMTP Prototypes</span>,
  project: {
    link: "https://github.com/xmtp",
  },
  layout: {
    // ...
    nav: ({ nav }) => {
      const { asPath } = useRouter();
      if (asPath === "/Frames/Subscribe") return null;
      return nav;
    },
  },
  docsRepositoryBase: "https://github.com/xmtp",
  footer: {
    text: "Nextra Docs Template",
  },
};

export default config;
