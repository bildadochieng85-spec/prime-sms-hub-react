import { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/AIAssistant.css';

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
      const BACKEND_URL = import.meta.env.DEV
        ? 'http://localhost:5000'
        : (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://backend-uxkx.onrender.com');

      // Use ref to get current messages (avoids stale closure)
      const conversationHistory = messagesRef.current
        .filter((m) => m.sender !== 'system')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
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
      >
        <span className="ai-icon">🤖</span>
      </button>

      {isOpen && (
        <div className="ai-assistant-modal">
          {/* Header */}
          <div className="ai-assistant-header">
            <div className="ai-header-info">
              <div className="ai-header-avatar">🤖</div>
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
                {msg.sender === 'ai' && <div className="ai-avatar">🤖</div>}
                <div className="message-bubble">
                  {msg.sender === 'ai' ? renderMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="ai-message">
                <div className="ai-avatar">🤖</div>
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
