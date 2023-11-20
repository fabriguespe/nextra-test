import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>XMTP Prototypes</span>,
  project: {
    link: "https://github.com/xmtp",
  },
  docsRepositoryBase: "https://github.com/xmtp",
  footer: {
    text: "XMTP Prototypes",
  },
  themes: ["light"],
  useNextSeoProps() {
    return {
      titleTemplate: "%s – XMTP Prototypes",
    };
  },
  head: (
    <>
      <meta name="title" content="XMTP Prototypes" />
      <meta
        name="description"
        content="XMTP Prototypes is a collection of interactive widgets, tutorials and blog posts."
      />
      <meta name="og:title" content="XMTP Prototypes" />
      <meta
        name="og:description"
        content="XMTP Prototypes is a collection of interactive widgets, tutorials and blog posts."
      />
    </>
  ),
};

export default config;
