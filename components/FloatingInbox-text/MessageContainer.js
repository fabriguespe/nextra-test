import React, { useState, useRef, useEffect } from "react";
import { MessageInput } from "./MessageInput";
import { MessageItem } from "./MessageItem";

export const MessageContainer = ({
  conversation,
  client,
  searchTerm,
  isContained = false,
  selectConversation,
}) => {
  const isFirstLoad = useRef(true);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const styles = {
    loadingText: {
      textAlign: "center",
    },
    messagesContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
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

  const updateMessages = (prevMessages, newMessage) => {
    const doesMessageExist = prevMessages.some(
      (existingMessage) => existingMessage.id === newMessage.id
    );

    if (!doesMessageExist) {
      return [...prevMessages, newMessage];
    }

    return prevMessages;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (conversation && conversation.peerAddress && isFirstLoad.current) {
        setIsLoading(true);
        const initialMessages = await conversation?.messages();

        let updatedMessages = [];
        initialMessages.forEach((message) => {
          updatedMessages = updateMessages(updatedMessages, message);
        });

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
      }
    };

    fetchMessages();
  }, [conversation]);

  const startMessageStream = async () => {
    let stream = await conversation.streamMessages();
    for await (const message of stream) {
      setMessages((prevMessages) => {
        return updateMessages(prevMessages, message);
      });
    }
  };

  useEffect(() => {
    if (conversation && conversation.peerAddress) {
      startMessageStream();
    }
    return () => {};
  }, [conversation]);

  useEffect(() => {
    if (!isContained)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (newMessage) => {
    if (!newMessage.trim()) {
      alert("empty message");
      return;
    }
    if (conversation && conversation.peerAddress) {
      await conversation.send(newMessage);
    } else if (conversation) {
      const conv = await client.conversations.newConversation(searchTerm);
      selectConversation(conv);
      await conv.send(newMessage);
    }
  };

  return (
    <div style={styles.messagesContainer}>
      {isLoading ? (
        <div style={styles.loadingText}>Loading messages...</div>
      ) : (
        <>
          <ul style={styles.messagesList}>
            {messages.slice().map((message) => {
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </ul>
          <MessageInput
            onSendMessage={(msg) => {
              handleSendMessage(msg);
            }}
          />
        </>
      )}
    </div>
  );
};
