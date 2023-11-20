import React, { useState, useCallback, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import {
  ContentTypeRemoteAttachment,
  RemoteAttachmentCodec,
  AttachmentCodec,
} from "@xmtp/content-type-remote-attachment";
import {
  useMessages,
  useSendMessage,
  useStreamMessages,
  useClient,
  ContentTypeId,
} from "@xmtp/react-sdk";
import MessageItem from "./MessageItem";

export const MessageContainer = ({
  conversation,
  isPWA = false,
  isContained = false,
}) => {
  const messagesEndRef = useRef(null);

  const [imageSources, setImageSources] = useState({});
  const { client } = useClient();
  const { messages, isLoading } = useMessages(conversation);
  const [streamedMessages, setStreamedMessages] = useState([]);

  // Add these states at the beginning of your component
  const [loadingText, setLoadingText] = useState("");
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [image, setImage] = useState(null);

  // Add this function to handle file uploads
  const handleFileUpload = (file) => {
    setImage(file);
  };

  const getImageSrcFromMessage = async (message, client) => {
    try {
      const attachment = await RemoteAttachmentCodec.load(
        message.content,
        client
      );
      if (attachment && attachment.data) {
        const objectURL = URL.createObjectURL(
          new Blob([Buffer.from(attachment.data)], {
            type: attachment.mimeType,
          })
        );
        return objectURL;
      }
    } catch (error) {
      console.error("Failed to load and render attachment:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchImageSources = async () => {
      let newImageSources = {};

      for (const message of messages) {
        const contentType = ContentTypeId.fromString(message.contentType);

        if (contentType.sameAs(ContentTypeRemoteAttachment)) {
          newImageSources[message.id] = await getImageSrcFromMessage(
            message,
            client
          );
          // newImageSources[message.id] = await getAttachment(message);
        }
      }

      setImageSources(newImageSources);
    };

    fetchImageSources();
  }, [messages, client]);
  const styles = {
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      fontSize: isPWA == true ? "1.2em" : ".9em", // Increased font size
    },
    loadingText: {
      textAlign: "center",
    },
    messagesList: {
      paddingLeft: "5px",
      paddingRight: "5px",
      margin: "0px",
      alignItems: "flex-start",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
    },
  };

  const onMessage = useCallback(
    (message) => {
      setStreamedMessages((prev) => [...prev, message]);
    },
    [streamedMessages]
  );

  useStreamMessages(conversation, { onMessage });
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    setStreamedMessages([]);
  }, [conversation]);

  useEffect(() => {
    if (!isContained)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLargeFile = async (image) => {
    setIsLoadingUpload(true);
    setLoadingText("Uploading...");
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error("Not an ArrayBuffer"));
          }
        };
        reader.readAsArrayBuffer(image);
      });

      const attachment = {
        filename: image?.name,
        mimeType: image?.type,
        data: new Uint8Array(data),
      };

      const encryptedEncoded = await RemoteAttachmentCodec.encodeEncrypted(
        attachment,
        new AttachmentCodec()
      );

      class Upload {
        constructor(name, data) {
          this.name = name;
          this.data = data;
        }

        stream() {
          const self = this;
          return new ReadableStream({
            start(controller) {
              controller.enqueue(Buffer.from(self.data));
              controller.close();
            },
          });
        }
      }
      const upload = new Upload(attachment.filename, encryptedEncoded.payload);
      const { Web3Storage } = require("web3.storage");
      const web3Storage = new Web3Storage({
        token: process.env.REACT_APP_WEB3STORAGE_KEY
          ? process.env.REACT_APP_WEB3STORAGE_KEY
          : process.env.NEXT_PUBLIC_WEB3STORAGE_KEY,
      });

      const cid = await web3Storage.put([upload]);
      const url = `https://${cid}.ipfs.w3s.link/` + attachment.filename;

      setLoadingText(url);
      const remoteAttachment = {
        url: url,
        contentDigest: encryptedEncoded.digest,
        salt: encryptedEncoded.salt,
        nonce: encryptedEncoded.nonce,
        secret: encryptedEncoded.secret,
        scheme: "https://",
        filename: attachment.filename,
        contentLength: attachment.data.byteLength,
      };

      setLoadingText("Sending...");

      await sendMessage(
        conversation,
        remoteAttachment,
        ContentTypeRemoteAttachment
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingUpload(false);
    }
  };
  // Modify your handleSendMessage function to handle image uploads
  const handleSendMessage = async (newMessage) => {
    if (!newMessage.trim() && !image) {
      alert("empty message");
      return;
    }
    if (image) {
      await handleLargeFile(image);
    } else {
      if (conversation && conversation.peerAddress) {
        await sendMessage(conversation, newMessage);
      }
    }

    setImage(null);
  };
  return (
    <div style={styles.messagesContainer}>
      {isLoading ? (
        <small style={styles.loadingText}>Loading messages...</small>
      ) : (
        <>
          <ul style={styles.messagesList}>
            {messages.slice().map((message) => {
              return (
                <MessageItem
                  isPWA={isPWA}
                  key={message.id}
                  message={message}
                  imgSrc={imageSources[message.id]}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
          <MessageInput
            isPWA={isPWA}
            isLoadingUpload={isLoadingUpload}
            loadingText={loadingText}
            onSendMessage={(msg) => {
              handleSendMessage(msg);
            }}
            onFileUpload={handleFileUpload}
          />
        </>
      )}
    </div>
  );
};
