import React, { useState, useEffect, useRef } from 'react';
import { sendPrompt, getChatHistory } from '../api.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  requestMicrophoneAccess,
} from '../utils/speechRecognition.ts';

export default function Chat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState('');
  const [screenshotStatus, setScreenshotStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptCapturedRef = useRef(false);
  const recognitionErrorRef = useRef(false);

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
  }, [messages, isLoading, isCapturingScreenshot, isRecording, isTranscribing, screenshotError, voiceError]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = { sender: 'user', content: trimmedMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setScreenshotError('');
    setScreenshotStatus('');
    setVoiceError('');
    setVoiceStatus('');

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

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    setVoiceStatus('Transcribing...');
    setIsTranscribing(true);
    recognitionRef.current.stop();
  };

  const startRecording = async () => {
    if (isLoading || isTranscribing) return;

    if (!isSpeechRecognitionSupported()) {
      setVoiceError('Speech recognition is not supported in this app.');
      return;
    }

    setVoiceError('');
    setVoiceStatus('Requesting microphone...');

    try {
      await requestMicrophoneAccess();
    } catch (err) {
      const message = err?.name === 'NotAllowedError'
        ? 'Microphone permission was denied. Please allow microphone access and try again.'
        : 'Unable to access your microphone. Please check your device settings.';
      setVoiceError(message);
      setVoiceStatus('');
      return;
    }

    transcriptCapturedRef.current = false;
    recognitionErrorRef.current = false;
    setVoiceStatus('Listening...');
    setIsRecording(true);

    recognitionRef.current = createSpeechRecognition(
      async (transcript) => {
        transcriptCapturedRef.current = true;
        setIsTranscribing(false);
        setVoiceStatus('');

        if (!transcript) {
          setVoiceError('No speech was detected. Please try again.');
          return;
        }

        setInput(transcript);
        await sendMessage(transcript);
      },
      (message) => {
        recognitionErrorRef.current = true;
        setIsRecording(false);
        setIsTranscribing(false);
        setVoiceStatus('');
        setVoiceError(message);
      },
      () => {
        setIsRecording(false);

        if (!transcriptCapturedRef.current && !recognitionErrorRef.current) {
          setIsTranscribing(false);
          setVoiceStatus('');
          setVoiceError('No speech was detected. Please try again.');
        }
      },
    );

    recognitionRef.current.start();
  };

  const handleVoiceClick = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    await startRecording();
  };

  const handleScreenshotClick = async () => {
    if (isLoading || isRecording || isTranscribing || isCapturingScreenshot) return;

    if (!window.electronAPI?.captureScreenshot) {
      setScreenshotError('Screenshot capture is not available in this app.');
      return;
    }

    setScreenshotError('');
    setVoiceError('');
    setVoiceStatus('');
    setIsCapturingScreenshot(true);
    setScreenshotStatus('Capturing screenshot...');

    try {
      const result = await window.electronAPI.captureScreenshot();
      setScreenshotStatus(`Screenshot saved as ${result.fileName}`);
    } catch (err) {
      setScreenshotError('Unable to capture screenshot. Please try again.');
      setScreenshotStatus('');
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendMessage(input);
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
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Send a message or use the microphone to start chatting.</p>
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
        <form onSubmit={handleSend} className="chat-form">
          <input 
            type="text" 
            className="chat-input" 
            placeholder={isRecording ? 'Listening...' : 'Ask me anything...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isCapturingScreenshot || isRecording || isTranscribing}
          />
          <button
            type="button"
            className="screenshot-button"
            onClick={handleScreenshotClick}
            disabled={isLoading || isCapturingScreenshot || isRecording || isTranscribing}
            title="Take Screenshot"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h3l2-2h6l2 2h3v12H4z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          <button
            type="button"
            className={`voice-button ${isRecording ? 'voice-button-recording' : ''}`}
            onClick={handleVoiceClick}
            disabled={isLoading || isCapturingScreenshot || isTranscribing}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"></path>
              <path d="M19 10a7 7 0 0 1-14 0"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
              <line x1="8" y1="22" x2="16" y2="22"></line>
            </svg>
          </button>
          <button type="submit" className="send-button" disabled={!input.trim() || isLoading || isCapturingScreenshot || isRecording || isTranscribing} title="Send Message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
        {(screenshotStatus || screenshotError) && (
          <p className={`voice-feedback ${screenshotError ? 'voice-feedback-error' : ''}`}>
            {screenshotError || screenshotStatus}
          </p>
        )}
        {(voiceStatus || voiceError) && (
          <p className={`voice-feedback ${voiceError ? 'voice-feedback-error' : ''}`}>
            {voiceError || voiceStatus}
          </p>
        )}
      </div>
    </div>
  );
}
