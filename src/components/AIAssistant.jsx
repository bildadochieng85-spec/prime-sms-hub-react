import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/AIAssistant.css';
import { API_BASE_URL } from '../utils/apiConfig';

function AssistantMark({ className }) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.25 8.25A3.25 3.25 0 0 1 10.5 5h11A3.25 3.25 0 0 1 24.75 8.25v8.5A3.25 3.25 0 0 1 21.5 20H15l-5.5 4v-4.25a3.25 3.25 0 0 1-2.25-3V8.25Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.5h.01M16 12.5h.01M20 12.5h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="m24 22 .65 1.6L26.25 24l-1.6.65L24 26.25l-.65-1.6-1.6-.65 1.6-.4L24 22Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Simple markdown renderer: bold, bullet lists
function renderMessage(text) {
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`}>
          {listItems.map((item, i) => (
            <li key={i} dangerouslySetInnerColor={{ __html: boldText(item) }} />
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const boldText = (str) =>
    str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(trimmed.replace(/^[-•]\s+/, ''));
    } else {
      flushList();
      if (trimmed !== '') {
        elements.push(
          <p key={idx} dangerouslySetInnerHTML={{ __html: boldText(trimmed) }} />
        );
      }
    }
  });

  flushList();
  return elements;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm your Prime SMS Hub assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef(messages);

  // Keep ref updated with current messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();
    const userMessage = {
      id: Date.now() + Math.random(),
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use ref to get current messages (avoids stale closure)
      const conversationHistory = messagesRef.current
        .filter((m) => m.sender !== 'system')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const response = await fetch(`${API_BASE_URL}/api/prime-intent-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, conversationHistory }),
      });

      if (!response.ok) throw new Error(`API error: ${response.statusText}`);

      const data = await response.json();
      const fullText = data.message;

      const aiMessageId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, text: '', sender: 'ai', timestamp: new Date(), isTyping: true },
      ]);

      const words = fullText.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setMessages((prev) =>
          prev.map(msg => msg.id === aiMessageId ? { ...msg, text: currentText } : msg)
        );
        scrollToBottom();
        await new Promise(resolve => setTimeout(resolve, 15));
      }

      setMessages((prev) =>
        prev.map(msg => msg.id === aiMessageId ? { ...msg, isTyping: false } : msg)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, scrollToBottom]);

  const handleClearChat = useCallback(() => {
    setMessages([
      {
        id: 1,
        text: "Hi! 👋 I'm your Prime SMS Hub assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
    setInput('');
  }, []);

  return (
    <>
      <button
        className="ai-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
        aria-expanded={isOpen}
      >
        <AssistantMark className="ai-icon" />
      </button>

      {isOpen && (
        <div className="ai-assistant-modal">
          {/* Header */}
          <div className="ai-assistant-header">
            <div className="ai-header-info">
              <div className="ai-header-avatar">
                <AssistantMark className="ai-brand-mark" />
              </div>
              <div className="ai-header-text">
                <h3>Prime SMS Hub</h3>
                <span>● Online</span>
              </div>
            </div>
            <div className="ai-header-actions">
              <button className="ai-clear-btn" onClick={handleClearChat} title="Clear conversation">🔄</button>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message ${msg.sender === 'user' ? 'user-message' : ''}`}
              >
                {msg.sender === 'ai' && (
                  <div className="ai-avatar">
                    <AssistantMark className="ai-brand-mark" />
                  </div>
                )}
                <div className="message-bubble">
                  {msg.sender === 'ai' ? renderMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message">
                <div className="ai-avatar">
                  <AssistantMark className="ai-brand-mark" />
                </div>
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="ai-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="ai-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
