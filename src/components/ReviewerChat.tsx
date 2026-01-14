import { useEffect, useRef } from "react";
import { sendChat } from "../api/client";

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
  accessToken
}: ReviewerChatProps) => {
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
      const response = await sendChat(
        {
          query: trimmed
        },
        accessToken
      );

      const reply =
        typeof response === "string"
          ? response
          : response.response ?? response.output ?? response.message ?? "";

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
    <div className="paper-viewer-card chat-card">
      <div className="chat-header">
        <div>
          <p className="eyebrow">Ask the desk</p>
          <h2>Reviewer Chat</h2>
        </div>
        <span className="chat-status">{isChatting ? "Drafting response..." : "Live"}</span>
      </div>
      <div className="chat-thread" ref={chatThreadRef}>
        {messages.length === 0 ? (
          <p className="chat-empty">
            Ask for a recap, compliance help, or improvements to the draft.
          </p>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble ${
              message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"
            }`}
          >
            <p>{message.content}</p>
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
        <label className="chat-label" htmlFor="paper-chat-input">
          Send a note to the reviewers
        </label>
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
          <p className="chat-hint">
            Chat history is sent with each request to the Lambda backend.
          </p>
          <button className="chat-send" type="submit" disabled={isChatting || !input.trim()}>
            {isChatting ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewerChat;
