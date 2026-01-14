import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { LlmMetricsResponse, sendChat } from "../api/client";

export type ChatThreadMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sentAt: string;
};

type ReviewerChatProps = {
  messages: ChatThreadMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatThreadMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  isChatting: boolean;
  setIsChatting: React.Dispatch<React.SetStateAction<boolean>>;
  accessToken?: string;
  reviewText?: string | LlmMetricsResponse;
};

const createChatId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ReviewerChat = ({
  messages,
  setMessages,
  input,
  setInput,
  error,
  setError,
  isChatting,
  setIsChatting,
  accessToken,
  reviewText
}: ReviewerChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const chatThreadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatThreadRef.current?.scrollTo({
      top: chatThreadRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages.length, isChatting]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isChatting) return;

    const userMessage: ChatThreadMessage = {
      id: createChatId(),
      role: "user",
      content: trimmed,
      sentAt: new Date().toISOString()
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsChatting(true);

    try {
      const historyPayload = messages.map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }]
      }));

      const response = await sendChat(
        {
          query: trimmed,
          reviewText: reviewText,
          history: historyPayload
        },
        accessToken
      );

      const reply =
        typeof response === "string"
          ? response
          : response.answer ??
            response.last_message ??
            response.response ??
            response.output ??
            response.message ??
            "";

      if (!reply) {
        throw new Error("Empty response from chat service.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createChatId(),
          role: "assistant",
          content: reply,
          sentAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat request failed.";
      setError(message);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className={`chat-popup ${isOpen ? "is-open" : "is-closed"}`}>
      <button
        type="button"
        className="chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="reviewer-chat-panel"
      >
        <span>Reviewer Chat</span>
        <span className="chat-toggle-meta">
          {isChatting ? "Drafting..." : isOpen ? "Collapse" : "Expand"}
        </span>
      </button>

      <div
        id="reviewer-chat-panel"
        className={`chat-panel ${isOpen ? "is-open" : "is-closed"}`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          className="chat-header"
          onClick={() => setIsOpen(false)}
          aria-expanded={isOpen}
        >
          <div>
            <p className="eyebrow">Ask the desk</p>
            <h2>Chat</h2>
          </div>
          <span className="chat-status">{isChatting ? "Drafting response..." : "Live"}</span>
        </button>
        <div className="chat-thread" ref={chatThreadRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble ${
                message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
              }`}
            >
              <div className="chat-message">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    p: (props) => <p className="chat-line" {...props} />,
                    h1: (props) => <h3 className="chat-heading" {...props} />,
                    h2: (props) => <h4 className="chat-heading" {...props} />,
                    h3: (props) => <h5 className="chat-heading" {...props} />,
                    ul: (props) => <ul className="chat-list" {...props} />,
                    ol: (props) => <ol className="chat-list" {...props} />,
                    li: (props) => <li className="chat-list-item" {...props} />
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <span className="chat-bubble-meta">
                {message.role === "user" ? "You" : "Reviewer"} ·{" "}
                {new Date(message.sentAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          ))}
          {isChatting ? (
            <div className="chat-bubble chat-bubble-assistant chat-bubble-pending">
              <p>Thinking through the paper...</p>
            </div>
          ) : null}
        </div>
        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            id="paper-chat-input"
            className="chat-input"
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about compliance gaps, rewrite ideas, or key takeaways..."
            disabled={isChatting}
          />
          {error ? <p className="chat-error">{error}</p> : null}
          <div className="chat-controls">
            <button className="chat-send" type="submit" disabled={isChatting || !input.trim()}>
              {isChatting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewerChat;
