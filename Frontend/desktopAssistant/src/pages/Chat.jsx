import React, { useState, useEffect, useRef } from 'react';
import { sendPrompt, getChatHistory } from '../api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getChatHistory(user.id);
        if (data.history && data.history.length > 0) {
          // Use the most recent conversation's messages
          const latestConv = data.history[data.history.length - 1]; // or [0] depending on sorting, assuming last is newest
          if (latestConv) {
             setConversationId(latestConv.conversationId);
             setMessages(latestConv.messages || []);
          }
        }
      } catch (err) {
        console.error('Failed to load history', err);
      }
    };
    if (user && user.id) {
       fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await sendPrompt(user.id, userMessage.content, conversationId);
      if (data.conversationId) setConversationId(data.conversationId);
      const botMessage = { sender: 'ai', content: data.aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = { sender: 'ai', content: 'Sorry, I encountered an error. Please try again.', isError: true, timestamp: new Date() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card chat-container" style={{ padding: 0 }}>
      {/* Header */}
      <div className="chat-header" style={{ padding: '20px 20px 0 20px', marginBottom: '10px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Desktop Assistant</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Logged in as {user.username}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <h3>How can I help you today?</h3>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Send a message to start chatting.</p>
          </div>
        )}
        
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={index} className={`message-bubble ${isUser ? 'message-user' : 'message-bot'}`} style={{ color: msg.isError ? 'var(--error)' : undefined }}>
              {isUser ? (
                msg.content
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', gap: '12px' }}>
          <input 
            type="text" 
            className="chat-input" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="send-button" disabled={!input.trim() || isLoading} title="Send Message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
