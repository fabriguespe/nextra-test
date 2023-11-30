import React, { useState } from "react";
import { ethers } from "ethers";

export function ConnectWallet({
  onWalletConnected,
  labels = {
    loading: "Loading...",
    default: "Connect Wallet",
  },
}) {
  const [loading, setLoading] = useState(false);

  const styles = {
    SubscribeButtonContainer: {
      position: "relative",
      display: "inline-block",
      borderRadius: "5px",
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
      color: "#333333",
      backgroundColor: "#ededed",
      border: "none",
      fontSize: "12px",
    },
    label: {
      fontSize: "10px",
      textAlign: "center",
      marginTop: "5px",
      cursor: "pointer",
    },
  };

  const createNewWallet = () => {
    const newWallet = ethers.Wallet.createRandom();
    if (typeof onWalletConnected === "function") {
      onWalletConnected(newWallet);
    }
  };
  const connectWallet = async () => {
    if (typeof window.ethereum !== undefined) {
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
    const signer = await connectWallet();
    if (signer && typeof onWalletConnected === "function") {
      onWalletConnected(signer);
    }
    setLoading(false);
  };

  return (
    <div
      style={styles.SubscribeButtonContainer}
      className={`ConnectWallet ${loading ? "loading" : ""}`}
    >
      <button style={styles.SubscribeButton} onClick={handleClick}>
        {loading ? labels.loading : labels.default}
      </button>
      <div style={styles.label} onClick={createNewWallet}>
        or create new one
      </div>
    </div>
  );
}
