import React from "react";

const styles = {
  ContactLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "0px",
    backgroundColor: "transparent",
    color: "#000",
    textDecoration: "none",
    borderRadius: "4px",
    transition: "background-color 0.3s ease",
  },
};

export function ContactLink({
  domain,
  walletAddress,
  defaultApp = "xmtp",
  deepLinkApps = {
    xmtp: {
      url: `https://xmtp-react-widgets.vercel.app/link/${domain}`,
      icon: "https://xmtp.chat/favicon.ico",
      device: ["All"],
      name: "xmtp",
    },
  },
  theme = "default",
  size = "small",
  showText = true,
}) {
  const selectedApp = deepLinkApps[defaultApp];

  return (
    <div style={{ height: "100%" }}>
      <a
        href={selectedApp.url
          .replace("{walletAddress}", walletAddress)
          .replace("{domain}", domain)}
        target="_newtab"
        rel="noopener noreferrer"
        style={styles.ContactLink}
        className={`ContactLink ${theme}`}
      >
        {showText && domain}
      </a>
    </div>
  );
}
