import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Client } from "@xmtp/xmtp-js";
import { AvatarResolver } from "@ensdomains/ens-avatar";

export function ContactPage({
  walletAddress: initialWalletAddress,
  deepLinkApps = {
    xmtp: {
      url: `https://xmtp.chat/dm/${initialWalletAddress}`,
      icon: "https://xmtp.chat/favicon.ico",
      device: ["All"],
      name: "xmtp.chat",
    },
  },
  domain = "cryptocornerstore.eth",
  device = "All",
}) {
  const [isLoadingResolveDomain, setIsLoadingResolveDomain] = useState(true);
  const [isLoadingCanMessage, setIsLoadingCanMessage] = useState(true);

  const [walletAddress, setWalletAddress] = useState(initialWalletAddress);

  const [deviceSpecificApps, setDeviceSpecificApps] = useState([]);

  const styles = {
    avatar: {
      borderRadius: "50%",
      width: "100px",
      cursor: "pointer",
    },
    ContactPageWrapper: {
      maxWidth: "800px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    ContactPageContainer: {
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      pointerEvents: "auto",
      margin: "0 auto",
      paddingTop: "30px",
      paddingBottom: "30px",
    },
    linkDomain: {
      fontSize: "3rem",
      fontWeight: "700",
      lineHeight: "1em",
      textAlign: "center",
      marginBottom: "0.5em",
      marginTop: "40px",
    },
    instructions: {
      marginBottom: "2rem",
      textAlign: "center",
      fontSize: "1.3rem",
      width: "90%",
    },
    listItemButton: {
      fontWeight: "bold",
      display: "inline-flex",
      width: "80%",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: "auto",
      padding: "12px 20px",
      borderRadius: "20px",
      border: "1px solid #333333",
      color: "#000",
      fontSize: "1.3rem",
      fontWeight: "500",
      transition: "color 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      textDecoration: "none",
      marginBottom: "30px",
      // existing styles...
      backgroundColor: isLoadingResolveDomain ? "lightgrey" : "white",
      cursor: isLoadingResolveDomain ? "not-allowed" : "pointer",
    },
    ContactPageIcon: {
      width: "28px",
      height: "28px",
      marginRight: "8px",
      borderRadius: "5px",
      cursor: "pointer",
      transition: "transform 0.5s ease",
    },
  };

  useEffect(() => {
    const devicep = detectDevice(device);
    const deepLinkAppsArray = Object.values(deepLinkApps);
    const filteredApps = filterAppsByDevice(deepLinkAppsArray, devicep);
    setDeviceSpecificApps(filteredApps);
  }, []);

  const [avatar, setAvatar] = useState(null);

  // Function to resolve domain to address
  const resolveDomainToAddress = async () => {
    // Set loading state
    setIsLoadingResolveDomain(true);
    try {
      // Create new provider
      const provider = new ethers.providers.CloudflareProvider();
      // Resolve domain to address
      const resolvedAddress = await provider.resolveName(domain);
      // Check if domain is an Ethereum domain
      const isEthDomain = /\.eth$/.test(domain);
      // Check if resolved address is a valid Ethereum address
      const isValidEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(
        resolvedAddress
      );

      // If address is resolved, domain is Ethereum domain and address is valid
      if (resolvedAddress && isEthDomain && isValidEthereumAddress) {
        // Set wallet address
        setWalletAddress(resolvedAddress);
        // Create new avatar resolver
        const avt = new AvatarResolver(provider);
        // Get avatar URI
        const avatarURI = await avt.getAvatar(domain);
        // Set avatar
        setAvatar(avatarURI);
      } else {
        // If address is not resolved or domain is not Ethereum domain or address is not valid, set wallet address to null
        setWalletAddress(null);
      }
    } catch (error) {
      // Log any errors
      console.log(error);
    } finally {
      // Reset loading state
      setIsLoadingResolveDomain(false);
    }
  };

  useEffect(() => {
    if (domain) {
      resolveDomainToAddress();
    }
  }, [domain]);

  const detectDevice = (device) => {
    const userAgent = window.navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return "Android";
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
    return device ? device : "Desktop";
  };

  const filterAppsByDevice = (apps, device) => {
    return apps.filter(
      (app) => app.device.includes(device) || app.device.includes("All")
    );
  };

  const [canMessage, setCanMessage] = useState(null);

  useEffect(() => {
    const checkCanMessage = async () => {
      setIsLoadingCanMessage(true);
      try {
        const result = await Client.canMessage(walletAddress);
        setCanMessage(result);
      } catch (error) {
        console.log("Error checking canMessage:", error);
        setCanMessage(false);
      } finally {
        setIsLoadingCanMessage(false);
      }
    };

    checkCanMessage();
  }, [walletAddress]);

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `


    .instructions {
      @media (max-width: 800px) {
        font-size: 1rem !important;
        line-height: 1.5rem !important;
      }
    }
  `,
        }}
      />
      <div
        className="ContactPageContainer ContactPage"
        style={styles.ContactPageContainer}
      >
        {avatar ? (
          <img
            style={styles.avatar}
            src={avatar}
            alt="User Avatar"
            width={100}
          />
        ) : (
          <div> Logo here</div>
        )}
        <div style={styles.ContactPageWrapper}>
          <div style={styles.linkDomain}>{domain}</div>
          {!isLoadingResolveDomain && canMessage && (
            <div className="instructions" style={styles.instructions}>
              Just send a message to <b>{domain}</b>
              using your preferred XMTP inbox, and hit send!
            </div>
          )}

          {isLoadingResolveDomain ? (
            <p>Loading ...</p>
          ) : isLoadingCanMessage ? (
            <p>Loading canMessage...</p>
          ) : canMessage === null ? (
            <p>Error or not initialized.</p>
          ) : canMessage ? (
            deviceSpecificApps.map((app, index) => (
              <a
                style={styles.listItemButton}
                key={index}
                className="listItemButton"
                target="_newtab"
                href={app.url
                  .replace("{walletAddress}", walletAddress)
                  .replace("{domain}", domain)}
              >
                <img
                  style={styles.ContactPageIcon}
                  src={app.icon}
                  alt={`${app.name} Icon`}
                  width="50px"
                  className="logo"
                />
                Message on {app.name}
              </a>
            ))
          ) : (
            <p>
              You cannot send a message because this wallet is not on the xmtp
              network.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
