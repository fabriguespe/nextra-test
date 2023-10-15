import React, { useState, useEffect, useRef } from "react";
import { Client } from "@xmtp/react-sdk";
import { ethers } from "ethers";

import { ConversationContainer } from "./ConversationContainer";
import {
  AttachmentCodec,
  RemoteAttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import { ReactionCodec } from "@xmtp/content-type-reaction";
import { ReplyCodec } from "@xmtp/content-type-reply";
import { ReadReceiptCodec } from "@xmtp/content-type-read-receipt";

export function FloatingInbox({ wallet, env }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initialIsOpen =
      localStorage.getItem("isWidgetOpen") === "true" || false;
    const initialIsOnNetwork =
      localStorage.getItem("isOnNetwork") === "true" || false;
    const initialIsConnected =
      (localStorage.getItem("isConnected") && wallet === "true") || false;

    setIsOpen(initialIsOpen);
    setIsOnNetwork(initialIsOnNetwork);
    setIsConnected(initialIsConnected);
  }, []);

  const [xmtpClient, setXmtpClient] = useState();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [signer, setSigner] = useState();

  useEffect(() => {
    if (wallet) {
      setSigner(wallet);
      setIsConnected(true);
    }
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem("isOnNetwork", isOnNetwork.toString());
    localStorage.setItem("isWidgetOpen", isOpen.toString());
    localStorage.setItem("isConnected", isConnected.toString());
  }, [isOpen, isConnected, isOnNetwork]);

  useEffect(() => {
    if (signer && isOnNetwork) {
      initXmtpWithKeys();
    }
  }, [signer, isOnNetwork]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.enable();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setSigner(provider.getSigner());
        setIsConnected(true);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      console.error("Metamask not found");
    }
  };

  const getAddress = async (signer) => {
    try {
      return await signer?.getAddress();
    } catch (e) {
      console.log(e);
      console.log("entra3");
    }
  };

  async function initXmtpWithKeys() {
    if (!signer) {
      handleLogout();
      return;
    }
    console.log("entra7");
    let address = await getAddress(signer);
    let keys = loadKeys(address);
    const clientOptions = {
      env: env ? env : getEnv(),
    };
    if (!keys) {
      keys = await Client.getKeys(signer, {
        ...clientOptions,
        skipContactPublishing: true,
        persistConversations: false,
      });
      storeKeys(address, keys);
    }
    const xmtp = await Client.create(null, {
      ...clientOptions,
      privateKeyOverride: keys,
    });

    xmtp.registerCodec(new AttachmentCodec());
    xmtp.registerCodec(new RemoteAttachmentCodec());
    xmtp.registerCodec(new ReplyCodec());
    xmtp.registerCodec(new ReactionCodec());
    xmtp.registerCodec(new ReadReceiptCodec());

    setIsOnNetwork(!!xmtp.address);
    setXmtpClient(xmtp);
  }

  const openWidget = () => {
    setIsOpen(true);
  };

  const closeWidget = () => {
    setIsOpen(false);
  };

  if (typeof window !== "undefined") {
    window.FloatingInbox = {
      open: openWidget,
      close: closeWidget,
    };
  }
  const handleLogout = async () => {
    setIsConnected(false);
    setIsOnNetwork(false);
    const address = await getAddress(signer);
    wipeKeys(address);
    setSigner(null);
    setSelectedConversation(null);
    localStorage.removeItem("isOnNetwork");
    localStorage.removeItem("isConnected");
  };
  const styles = {
    spinCounterClockwise: {
      animation: "spinCounterClockwise 0.5s linear",
      transformOrigin: "center",
    },
    spinClockwise: {
      animation: "spinClockwise 0.5s linear",
      transformOrigin: "center",
    },
    FloatingLogo: {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "white",
      display: "flex",
      alignItems: "center",
      border: "1px solid #ccc",
      justifyContent: "center",
      boxShadow: "0 2px 10px #ccc",
      cursor: "pointer",
      transition: "transform 0.3s ease",
      padding: "5px",
      ":active": {
        transform: "scale(0.9)",
      },
      ":hover": {
        transform: "scale(1.05)",
      },
      ":hover path": {
        transform: "rotate(360deg)",
        fill: "#ef4444",
      },
    },
    Button: {
      position: "fixed",
      bottom: "70px",
      right: "20px",
      width: "300px",
      height: "400px",
      border: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      borderRadius: "10px",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      zIndex: "1000",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      "&.expanded": {
        height: "400px",
      },
    },
    WidgetHeader: {
      padding: "5px",
      margin: "5px",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    WidgetContent: {
      flexGrow: "1",
      overflowY: "auto",
    },
    BtnXmtp: {
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid grey",
      padding: "10px",
      borderRadius: "5px",
    },
    XmtpContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    },
    LogoutBtn: {
      position: "absolute",
      top: "10px",
      left: "5px",
      textDecoration: "none",
      color: "#000",
      background: "transparent",
      border: "none",
      fontSize: "10px",
      cursor: "pointer",
    },
    ConversationHeader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "none",
      border: "none",
      width: "auto",
      margin: "0 auto",
    },
    conversationHeaderH4: {
      margin: "0px",
      padding: "4px",
    },
    BackButton: {
      border: "0px",
      background: "transparent",
      cursor: "pointer",
    },
  };
  return (
    <>
      <div
        onClick={isOpen ? closeWidget : openWidget}
        className={
          "FloatingInbox " +
          (isOpen ? "spin-clockwise" : "spin-counter-clockwise")
        }
        style={styles.FloatingLogo}
      >
        <SVGLogo parentClass={"FloatingInbox"} />
      </div>
      {isOpen && (
        <div className={isOnNetwork ? "expanded" : ""} style={styles.Button}>
          {isConnected && (
            <button onClick={handleLogout} style={styles.LogoutBtn}>
              Logout
            </button>
          )}
          {isConnected && isOnNetwork && (
            <div style={styles.WidgetHeader}>
              <div style={styles.ConversationHeader}>
                {isOnNetwork && selectedConversation && (
                  <button
                    onClick={() => {
                      setSelectedConversation(null);
                    }}
                    style={styles.BackButton}
                  >
                    ←
                  </button>
                )}
                <h4 style={styles.conversationHeaderH4}>Conversations</h4>
              </div>
            </div>
          )}
          <div style={styles.WidgetContent}>
            {!isConnected && (
              <div style={styles.XmtpContainer}>
                <button onClick={connectWallet} style={styles.BtnXmtp}>
                  Connect Wallet
                </button>
              </div>
            )}
            {isConnected && !isOnNetwork && (
              <div style={styles.XmtpContainer}>
                <button onClick={initXmtpWithKeys} style={styles.BtnXmtp}>
                  Connect to XMTP
                </button>
              </div>
            )}
            {isConnected && isOnNetwork && xmtpClient && (
              <ConversationContainer
                client={xmtpClient}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SVGLogo() {
  const svgRef = useRef(null);

  useEffect(() => {
    const svgElement = svgRef.current;

    const rotateElement = () => {
      svgElement.style.transition = "transform 0.5s ease";
      svgElement.style.transform = "rotate(360deg)";
    };

    const resetRotation = () => {
      svgElement.style.transform = "rotate(0deg)";
    };

    svgElement.addEventListener("mouseover", rotateElement);
    svgElement.addEventListener("mouseout", resetRotation);

    return () => {
      svgElement.removeEventListener("mouseover", rotateElement);
      svgElement.removeEventListener("mouseout", resetRotation);
    };
  }, []);

  return (
    <>
      <svg
        ref={svgRef}
        className={"logo"}
        viewBox="0 0 462 462"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={"#fc4f37"}
          d="M1 231C1 103.422 104.422 0 232 0C359.495 0 458 101.5 461 230C461 271 447 305.5 412 338C382.424 365.464 332 369.5 295.003 349C268.597 333.767 248.246 301.326 231 277.5L199 326.5H130L195 229.997L132 135H203L231.5 184L259.5 135H331L266 230C266 230 297 277.5 314 296C331 314.5 362 315 382 295C403.989 273.011 408.912 255.502 409 230C409.343 131.294 330.941 52 232 52C133.141 52 53 132.141 53 231C53 329.859 133.141 410 232 410C245.674 410 258.781 408.851 271.5 406L283.5 456.5C265.401 460.558 249.778 462 232 462C104.422 462 1 358.578 1 231Z"
        />
      </svg>
    </>
  );
}
const ENCODING = "binary";

export const getEnv = () => {
  // "dev" | "production" | "local"
  return typeof process !== "undefined" && process.env.REACT_APP_XMTP_ENV
    ? process.env.REACT_APP_XMTP_ENV
    : "production";
};
export const buildLocalStorageKey = (walletAddress) => {
  return walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";
};

export const loadKeys = (walletAddress) => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress, keys) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};

export const wipeKeys = (walletAddress) => {
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
