import React, { useEffect, useState } from "react";
import { Client } from "@xmtp/react-sdk";
import { ethers } from "ethers";

export function Subscribe({
  theme = "default",
  size = "medium",
  wallet,
  onSubscribe,
  onUnsubscribe,
  checkSubscriptionStatus,
  onError,
  env,
  labels = {
    loading: "Loading...",
    subscribed: "Subscribed",
    unsubscribed: "Unsubscribed",
    default: "Subscribe with your wallet",
  },
}) {
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("none");

  const spin = `
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
  const styles = {
    SubscribeButtonContainer: {
      position: "relative",
      display: "inline-block",
      borderRadius: "5px",
      animation: `${loading ? spin : ""} 0.5s linear infinite`,
    },
    SubscribeButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 20px",
      borderRadius: "5px",
      marginBottom: "2px",
      textAlign: "left",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
      fontWeight: "bold",
      color: theme === "dark" ? "#ffffff" : "#333333",
      backgroundColor:
        theme === "dark" ? "#333333" : theme === "light" ? "#fff" : "#ededed",
      border: theme === "light" ? "1px solid #333333" : "none",
      fontSize: size === "large" ? "16px" : "12px",
    },
    logoIcon: {
      width: size === "medium" ? "12px" : size === "large" ? "16px" : "10px",
      height: size === "medium" ? "12px" : size === "large" ? "16px" : "10px",
      marginRight: "5px",
      transition: "all 0.5s ease",
    },
  };

  const getAddress = async (signer) => {
    try {
      if (signer && typeof signer.getAddress === "function") {
        return await signer.getAddress();
      }
      if (signer && typeof signer.getAddresses === "function") {
        //viem
        const [address] = await signer.getAddresses();
        return address;
      }
      return null;
    } catch (e) {
      console.log(e);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        return provider.getSigner();
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      console.error("Metamask not found");
    }
  };
  const handleClick = async () => {
    setLoading(true);
    let currentSigner = wallet || (await connectWallet());
    if (currentSigner) {
      await connect(currentSigner);
    }
    setLoading(false);
  };

  const connect = async (signer) => {
    try {
      const address = await getAddress(signer);
      console.log(address);
      let isSubscribed = false;
      if (checkSubscriptionStatus)
        isSubscribed = await checkSubscriptionStatus(address);
      if (isSubscribed) {
        await unsubscribe(signer);
      } else {
        await subscribe(signer);
      }
    } catch (error) {
      if (typeof onError === "function") onError(error);
      console.log(error);
    }
  };

  async function unsubscribe(signer) {
    const address = await getAddress(signer);
    setSubscriptionStatus("unsubscribed");
    if (onUnsubscribe) onUnsubscribe(address);
    setTimeout(() => {
      setSubscriptionStatus("none");
    }, 5000);
  }

  async function subscribe(signer) {
    const xmtp = await Client.create(signer, { env: env });
    setSubscriptionStatus("subscribed");
    if (onSubscribe) onSubscribe(xmtp.address);
    setTimeout(() => {
      setSubscriptionStatus("none");
    }, 5000);
  }

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      if (checkSubscriptionStatus && wallet) {
        const address = await getAddress(wallet);
        const isSubscribed = await checkSubscriptionStatus(address);
        if (isMounted) {
          setSubscriptionStatus(isSubscribed ? "subscribed" : "unsubscribed");
        }
      }
      setLoading(false);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [checkSubscriptionStatus, wallet]);

  return (
    <div
      style={styles.SubscribeButtonContainer}
      className={`Subscribe ${loading ? "loading" : ""}`}
    >
      <button style={styles.SubscribeButton} onClick={handleClick}>
        {loading
          ? labels.loading
          : subscriptionStatus === "subscribed"
          ? labels.subscribed
          : subscriptionStatus === "unsubscribed"
          ? labels.unsubscribed
          : labels.default}
      </button>
    </div>
  );
}
