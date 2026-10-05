"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Globe,
  Paperclip,
  Sparkles,
  ArrowUp,
  X,
  Terminal,
} from "lucide-react";
import RIVENHeadline from "./RIVENHeadline";
import Reveal from "./Reveal";

export default function RIVENSection() {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [attachment, setAttachment] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const conversationRef = useRef(null);
  const replyTimerRef = useRef(null);

  // Clean up the pending simulated reply if the section unmounts.
  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  // Keep the latest message in view as the conversation grows.
  useEffect(() => {
    const el = conversationRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSubmit = (textToSend) => {
    const prompt = typeof textToSend === "string" ? textToSend : value;
    const trimmed = prompt.trim();

    if (!trimmed || isThinking) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setValue("");
    setIsThinking(true);

    // Temporary frontend response.
    // Replace this later with your real RIVEN API call.
    replyTimerRef.current = setTimeout(() => {
      const RIVENMessage = {
        id: Date.now() + 1,
        role: "RIVEN",
        content:
          "RIVEN is ready. The RAG backend will be connected here later.",
      };

      setMessages((current) => [...current, RIVENMessage]);
      setIsThinking(false);
    }, 900);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachment(file);
    // Reset the input so the same file can be picked again.
    event.target.value = "";
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <section id="RIVEN" className="RIVEN-section">
      {/* Ambient background glow */}
      <div className="RIVEN-ambient" aria-hidden="true" />
      <div className="RIVEN-ambient-accent" aria-hidden="true" />

      <div className="RIVEN-content">
        {/* Header Block */}
        <Reveal>
          <div className="section-pill">
            <span className="RIVEN-status-dot" />
            <Sparkles className="h-3 w-3" />
            <span>TRIVENTS INTELLIGENCE SYSTEM</span>
          </div>

          <RIVENHeadline />

          <p className="RIVEN-subtitle">
            Your interactive intelligence interface for everything happening
            across the Trivents universe — from events and stories to community
            collaborations.
          </p>
        </Reveal>

        {/* Command Center Card */}
        <Reveal delay={1} className="RIVEN-console-shell">
          <div className="RIVEN-console-topbar">
            <div className="RIVEN-topbar-left">
              <span className="RIVEN-window-btn red" />
              <span className="RIVEN-window-btn yellow" />
              <span className="RIVEN-window-btn green" />
              <span className="RIVEN-console-id">
                <Terminal className="h-3 w-3" />
                riven-core-v1.0
              </span>
            </div>
            <div className="RIVEN-topbar-right">
              <span className="RIVEN-mode-tag">
                {showSearch ? "LIVE WEB ENABLED" : "LOCAL CONTEXT"}
              </span>
            </div>
          </div>

          {/* Conversation Stream */}
          {(messages.length > 0 || isThinking) && (
            <div className="RIVEN-conversation" ref={conversationRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "RIVEN-message-row user"
                      : "RIVEN-message-row"
                  }
                >
                  {message.role === "RIVEN" ? (
                    <div className="RIVEN-response">
                      <div className="RIVEN-response-icon">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="RIVEN-response-body">
                        <div className="RIVEN-response-header">
                          <span className="RIVEN-response-label">RIVEN</span>
                          <span className="RIVEN-response-time">Just now</span>
                        </div>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="RIVEN-user-message">
                      <p>{message.content}</p>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="RIVEN-message-row">
                  <div className="RIVEN-response">
                    <div className="RIVEN-response-icon">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="RIVEN-response-body">
                      <div className="RIVEN-response-header">
                        <span className="RIVEN-response-label">RIVEN</span>
                        <span className="RIVEN-thinking-tag">PROCESSING</span>
                      </div>
                      <div className="RIVEN-thinking">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachment Preview */}
          {attachment && (
            <div className="RIVEN-attachment-wrap">
              <div className="RIVEN-attachment">
                <Paperclip className="h-3.5 w-3.5 text-accent" />
                <span className="RIVEN-attachment-name">{attachment.name}</span>
                <button
                  type="button"
                  onClick={removeAttachment}
                  aria-label="Remove attachment"
                  className="RIVEN-attachment-remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Main Input Shell */}
          <div className="RIVEN-input-shell">
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask RIVEN about events, clubs, creators, or projects..."
              rows={2}
              className="RIVEN-textarea"
              aria-label="Ask RIVEN"
            />

            <div className="RIVEN-controls">
              <div className="RIVEN-controls-left">
                <label
                  className="RIVEN-icon-button"
                  title="Attach file (PDF, image, doc)"
                >
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                  />
                  <Paperclip className="h-4 w-4" />
                </label>

                <button
                  type="button"
                  onClick={() => setShowSearch((current) => !current)}
                  className={`RIVEN-search ${showSearch ? "active" : ""}`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>{showSearch ? "Web Search Active" : "Web Search Off"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!value.trim() || isThinking}
                className={`RIVEN-send ${value.trim() && !isThinking ? "active" : ""}`}
                aria-label="Send query"
                title="Send query (Enter)"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="RIVEN-hint">
            <span>PRESS ENTER TO SEND</span>
            <span className="hint-divider">•</span>
            <span>SHIFT + ENTER FOR NEW LINE</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}