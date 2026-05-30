import { useState, useRef, useEffect } from 'react';
import '../styles/AIAssistant.css';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hi! 👋 I\'m your Prime SMS Hub assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: input,
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
      
      // Build conversation history for context
      const conversationHistory = messages
        .filter((m) => m.sender !== 'system')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }));

      const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const fullText = data.message;

      // Start typing effect
      setIsLoading(false);
      const aiMessageId = Date.now();
      const newAiMessage = {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true
      };

      setMessages((prev) => [...prev, newAiMessage]);

      const words = fullText.split(' ');
      let currentText = '';
      
      for (let i = 0; i < words.length; i++) {
        currentText += (i === 0 ? '' : ' ') + words[i];
        setMessages((prev) => 
          prev.map(msg => msg.id === aiMessageId ? { ...msg, text: currentText } : msg)
        );
        // Delay between words for typing effect
        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
      }

      // Mark typing as finished
      setMessages((prev) => 
        prev.map(msg => msg.id === aiMessageId ? { ...msg, isTyping: false } : msg)
      );

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now(),
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: 'Hi! 👋 I\'m your Prime SMS Hub assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* AI Assistant Button */}
      <button
        className="ai-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Assistant"
        aria-label="Open AI Assistant"
      >
        <span className="ai-icon">🤖</span>
      </button>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="ai-assistant-modal">
          <div className="ai-assistant-header">
            <h3>Prime SMS Hub Assistant</h3>
            <div className="ai-header-actions">
              <button
                className="ai-clear-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                🔄
              </button>
              <button
                className="ai-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close assistant"
                aria-label="Close assistant"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="ai-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-content">
                  {msg.sender === 'ai' && <span className="ai-badge">🤖</span>}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-message ai-message">
                <div className="message-content">
                  <span className="ai-badge">🤖</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="ai-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              📤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
