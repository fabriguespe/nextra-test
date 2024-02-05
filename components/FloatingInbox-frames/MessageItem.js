import React, { useState, useEffect } from "react";
import { useClient } from "@xmtp/react-sdk";
import { getFrameInfo, Frame } from "./Frame"; // Ensure this path is correct
import { FramesClient } from "@xmtp/frames-client";

const MessageItem = ({ message, senderAddress, isPWA = false }) => {
  const { client } = useClient();

  const [frameInfo, setFrameInfo] = useState(null);
  const [frameButtonUpdating, setFrameButtonUpdating] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Add a loading state

  // Example function to handle frame button click

  const handleFrameButtonClick = async (buttonNumber) => {
    if (!frameInfo) {
      return;
    }
    const url = frameInfo.image;
    const messageId = String(message.id);

    setFrameButtonUpdating(buttonNumber);

    const framesClient = new FramesClient(client);
    const conversationTopic = message.conversationTopic;
    const payload = await framesClient.signFrameAction(
      url,
      buttonNumber,
      conversationTopic,
      messageId
    );
    const updatedFrameMetadata = await FramesClient.postToFrame(
      frameInfo.postUrl,
      payload
    );
    const updatedFrameInfo = getFrameInfo(updatedFrameMetadata.extractedTags);

    setFrameInfo(updatedFrameInfo);
    setFrameButtonUpdating(0);
  };

  useEffect(() => {
    setIsLoading(true);
    try {
      if (typeof message.content === "string") {
        const words = message.content?.split(/(\r?\n|\s+)/);
        const urlRegex =
          /^(http[s]?:\/\/)?([a-z0-9.-]+\.[a-z0-9]{1,}\/.*|[a-z0-9.-]+\.[a-z0-9]{1,})$/i;

        // Split potential concatenated URLs based on "http" appearing in the middle of the string
        const splitUrls = (word) => {
          const splitPattern = /(?=http)/g;
          return word.split(splitPattern);
        };

        // Then, in your Promise.all block, adjust the logic to first split words that could be concatenated URLs
        void Promise.all(
          words.flatMap(splitUrls).map(async (word) => {
            // Use flatMap with the splitUrls function
            const isUrl = !!word.match(urlRegex)?.[0];
            if (isUrl) {
              console.log(isUrl, word);
              const metadata = await FramesClient.readMetadata(word);
              console.log(isUrl, word, metadata);
              if (metadata) {
                const info = getFrameInfo(metadata.extractedTags);
                setFrameInfo(info);
              }
            }
          })
        );
      }
    } catch {
      console.log("Error parsing message content");
    }
    setIsLoading(false);
  }, [message?.content]);

  const styles = {
    messageContent: {
      backgroundColor: "lightblue",
      padding: isPWA == true ? "10px 20px" : "5px 10px",
      alignSelf: "flex-start",
      textAlign: "left",
      display: "inline-block",
      margin: isPWA == true ? "10px" : "5px",
      borderRadius: isPWA == true ? "10px" : "5px",
      maxWidth: "80%",
      wordBreak: "break-word",
      cursor: "pointer",
      listStyle: "none",
    },
    renderedMessage: {
      fontSize: isPWA == true ? "16px" : "12px",
      wordBreak: "break-word",
      padding: "0px",
    },
    senderMessage: {
      alignSelf: "flex-start",
      textAlign: "left",
      listStyle: "none",
      width: "100%",
    },
    receiverMessage: {
      alignSelf: "flex-end",
      listStyle: "none",
      textAlign: "right",
      width: "100%",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    timeStamp: {
      fontSize: isPWA == true ? "12px" : "8px",
      color: "grey",
    },
  };

  const renderMessage = (message) => {
    try {
      if (message?.content.length > 0) {
        return <div style={styles.renderedMessage}>{message?.content}</div>;
      }
    } catch {
      return message?.contentFallback ? (
        message?.contentFallback
      ) : (
        <div style={styles.renderedMessage}>{message?.content}</div>
      );
    }
  };

  const isSender = senderAddress === client?.address;

  return (
    <li
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}
    >
      <div style={styles.messageContent}>
        {!frameInfo && renderMessage(message)}
        <div style={styles.footer}>
          <span style={styles.timeStamp}>
            {`${new Date(message.sentAt).getHours()}:${String(
              new Date(message.sentAt).getMinutes()
            ).padStart(2, "0")}`}
          </span>
        </div>
        {isLoading && <div>Loading...</div>}
        {frameInfo && (
          <Frame
            info={frameInfo}
            handleClick={handleFrameButtonClick}
            frameButtonUpdating={frameButtonUpdating}
          />
        )}
      </div>
    </li>
  );
};
export default MessageItem;
