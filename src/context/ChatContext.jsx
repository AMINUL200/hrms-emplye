import {
  createContext,
  useContext,
  useState,
} from "react";

const ChatContext =
  createContext();

export const ChatProvider =
({ children }) => {

  const [messages,
    setMessages] =
    useState([]);

  const [replyTo,
    setReplyTo] =
    useState(null);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,

        replyTo,
        setReplyTo,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () =>
  useContext(ChatContext);