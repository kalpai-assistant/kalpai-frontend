import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Avatar,
  ConversationHeader,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import styles from "./Chat.module.scss";
import { useParams } from "react-router-dom";
import useWebSocket from "../../../api/websocketHandler/WSHook";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import classNames from "classnames";
import { GoDotFill } from "react-icons/go";
import { FaPhone } from "react-icons/fa";
import DOMPurify from "dompurify";
import { useQuery } from "react-query";
import { ChatQueryNames } from "../../../api/requests_responses/chat";
import { getChatHeadDetails } from "../../../api/chat";
import ImageCarousel from "../../../utils/components/ImageCarousel";
import ImageModal from "../../../utils/components/ImageModal";
import CallModal from "../../common/voice/CallModal";
import CallStrip from "./CallStrip";

type MessageDirection = "incoming" | "outgoing";

const rolesMapping: { [key: string]: MessageDirection } = {
  user: "outgoing",
  assistant: "incoming",
};

interface ChatProps {
  sessionId?: string;
  showMessageInputBox?: boolean;
  renderAsComponent?: boolean;
  isAdmin?: boolean;
}

const Chat: React.FC<ChatProps> = ({
  sessionId,
  showMessageInputBox = true,
  renderAsComponent = false,
  isAdmin = false,
}) => {
  const [lastMessageID, setLastMessageID] = useState<number | null>(0);
  const sessionID = useParams().sessionID! || sessionId!;
  const [initialLoading, setInitialLoading] = useState(true);
  const [chatHead, setChatHead] = useState<string>("/aria-logo.jpeg");
  const [chatHeadName, setChatHeadName] = useState<string>("Kalp AI");
  const [typing, setTyping] = useState(false);
  const [currentMsgTime, setCurrentMsgTime] = useState("");
  const [messages, setMessages] = useState<
    {
      message: string;
      direction: MessageDirection;
      time: string;
      message_type: "in_call" | "in_chat";
      image_urls?: string; // '|' separated urls
    }[]
  >([]);
  const localRenderAsComponent =
    renderAsComponent || sessionID === "business/talk";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalMessages, setModalMessages] = useState<string[]>([]);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isChatWebSocketActive, setIsChatWebSocketActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  useQuery(
    ChatQueryNames.GET_CHAT_HEAD_DETAILS,
    () =>
      getChatHeadDetails({ session_token: sessionID }).then((res) => res.data),
    {
      onSuccess: (data) => {
        setChatHead(data.chat_head_url);
        setChatHeadName(data.chat_head_name);
      },
      enabled: sessionID !== "business/talk",
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    setMessages([]);
    setLastMessageID(0);
  }, [sessionID]);

  // setInitialLoading to false on initial mount
  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => setInitialLoading(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setInitialLoading(false);
    }
  }, [messages]);

  // Callback for handling incoming WebSocket messages
  const handleIncomingMessage = useCallback(
    (data: string) => {
      try {
        const parsed = JSON.parse(data);

        // Handle voice-specific messages (single objects with type property)
        if (
          parsed.type &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          // This is a voice message, ignore it in the chat UI
          return;
        }

        // Handle regular chat messages (array format)
        const parsedMessages: {
          message_id: number;
          role: string;
          content: string;
          time: string;
          notification_id?: number;
          message_type: "in_call" | "in_chat";
          image_urls?: string; // '|' separated urls
        }[] = Array.isArray(parsed) ? parsed : [parsed];

        const newMessages = parsedMessages.filter(
          (msg) => msg.message_id && msg.message_id > (lastMessageID ?? 0),
        );

        if (newMessages.length === 0) return;

        setMessages((prevMessages) =>
          prevMessages.concat(
            newMessages.map((msg) => ({
              message: msg.content,
              direction: rolesMapping[msg.role],
              time: msg.time || new Date().toLocaleTimeString(),
              notificationId: msg.notification_id,
              image_urls: msg.image_urls,
              message_type: msg.message_type,
            })),
          ),
        );

        setLastMessageID(newMessages[newMessages.length - 1].message_id);
        setTyping(false);
      } catch (error) {
        console.error("Failed to parse incoming message:", error);
      }
    },
    [lastMessageID],
  );

  // Initialize WebSocket connection (called at top level) - only when chat is active
  const { sendMessage, disconnectWS } = useWebSocket(
    isChatWebSocketActive ? sessionID : "",
    handleIncomingMessage,
    isAdmin,
  );

  // Cleanup WebSocket connection on unmount
  useEffect(() => {
    return () => {
      if (disconnectWS) {
        disconnectWS();
      }
    };
  }, [disconnectWS]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      const container =
        messageListRef.current.querySelector(".cs-message-list");
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!sessionID) {
    return <div>Invalid session ID</div>;
  }

  // Handle sending a message
  const handleSend = (message: string) => {
    const sanitizedMessage = DOMPurify.sanitize(message);

    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: sanitizedMessage,
        direction: "outgoing",
        time: new Date().toLocaleTimeString(),
        message_type: "in_chat",
      },
    ]);
    if (sendMessage) {
      sendMessage(sanitizedMessage);
    }
    setTyping(true);
  };

  const handleImageClick = (
    images: string | undefined,
    messages: string | undefined,
    index: number,
  ) => {
    if (!images) return;
    setModalImages(images.split("|"));
    setModalMessages(messages?.split("|") ?? []);
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const handleCallButtonClick = () => {
    // Disconnect chat WebSocket before starting call
    if (disconnectWS) {
      disconnectWS();
    }
    setIsChatWebSocketActive(false);
    setIsCallModalOpen(true);
  };

  const handleCloseCallModal = () => {
    // Reconnect chat WebSocket after ending call
    setIsCallModalOpen(false);
    setIsChatWebSocketActive(true);
  };

  return (
    <div
      className={classNames(styles.chatWindow, {
        [styles.renderAsComponent]: localRenderAsComponent,
        [styles.businessTalk]: sessionID === "business/talk",
      })}
    >
      <MainContainer className={styles.mainChatContainer} responsive>
        {/* Conversation Header */}
        <ConversationHeader
          className={classNames(styles.conversationHeader, {
            [styles.renderAsComponent]: localRenderAsComponent,
          })}
        >
          <Avatar name={chatHeadName} src={chatHead} />
          <ConversationHeader.Content
            className={styles.conversationHeaderContent}
            info={
              <div className={styles.headerText}>
                <GoDotFill color={initialLoading ? "#ff4d4f" : "#34c759"} />
                <div>
                  {typing ? "Thinking with Kalp AI..." : "Replying instantly"}
                </div>
              </div>
            }
            userName={chatHeadName}
          />
          <ConversationHeader.Actions>
            <button
              className={styles.callButton}
              onClick={handleCallButtonClick}
              title="Start Call"
            >
              <FaPhone />
            </button>
          </ConversationHeader.Actions>
        </ConversationHeader>

        {/* Chat Container */}
        <div className={styles.chatContainer} ref={messageListRef}>
          <MessageList
            scrollBehavior="auto"
            loadingMorePosition="bottom"
            typingIndicator={typing ? <TypingIndicator /> : null}
            loading={initialLoading}
            onYReachStart={() => setInitialLoading(false)}
            className={styles.messageContainer}
          >
            {messages.length === 0 ? (
              <div className={styles.noMessages}>No messages yet</div>
            ) : (
              messages.map((msg, index) => (
                <Message
                  key={index}
                  model={{
                    type: "html",
                    direction: msg.direction,
                    position: "single",
                  }}
                  onMouseEnter={() => setCurrentMsgTime(msg.time)}
                  onMouseLeave={() => setCurrentMsgTime("")}
                >
                  <Message.CustomContent>
                    {msg.message_type === "in_call" ? (
                      <CallStrip label={msg.message} time={msg.time} />
                    ) : msg.direction === rolesMapping.user ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(msg.message),
                        }}
                      />
                    ) : (
                      <>
                        {msg.image_urls && msg.image_urls !== "" ? (
                          <ImageCarousel
                            images={msg.image_urls.split("|")}
                            messages={msg.message.split("|")}
                            slideSize="90%"
                            height="100%"
                            slideGap="md"
                            align="center"
                            onClick={(index) =>
                              handleImageClick(
                                msg.image_urls,
                                msg.message,
                                index,
                              )
                            }
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 5%",
                            }}
                          />
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.message}
                          </ReactMarkdown>
                        )}
                      </>
                    )}
                  </Message.CustomContent>
                  <Message.Footer
                    className={classNames(styles.messageFooter, {
                      [styles.showTime]: currentMsgTime === msg.time,
                    })}
                    sentTime={msg.time}
                  />
                </Message>
              ))
            )}
            <div ref={messagesEndRef} />
          </MessageList>

          {/* Message Input */}
          {showMessageInputBox && (
            <MessageInput
              placeholder="Start talking!"
              onSend={(message) => handleSend(message)}
              autoFocus
              attachButton={false}
              className={styles.messageInput}
            />
          )}
        </div>
      </MainContainer>

      <ImageModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        images={modalImages}
        messages={modalMessages}
        initialSlide={currentImageIndex}
      />

      <CallModal
        isOpen={isCallModalOpen}
        onClose={handleCloseCallModal}
        chatHeadName={chatHeadName}
        chatHead={chatHead}
        sessionToken={sessionID}
      />
    </div>
  );
};

export default Chat;
