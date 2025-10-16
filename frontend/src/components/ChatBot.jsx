import React, { useState, useEffect, useRef } from "react";
import { MessageSquareText, X, Send, Minimize2, User, Bot } from "lucide-react";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import api from "../lib/api";

const ChatBot = () => {
  const { backendUrl } = useContext(AppContent);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef(null);

  // List of passenger pages where chatbot should be shown
  const passengerRoutes = [
    '/',
    '/login',
    '/email-verify',
    '/reset-password',
    '/journeys',
    '/aboutus',
    '/contactus',
    '/faqs',
    '/passengerDashboard',
  ];

  // Check if current path is a passenger page or starts with passenger route prefixes
  const isPassengerPage = passengerRoutes.some(route => {
    if (route === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(route);
  }) || location.pathname.startsWith('/journeys/') || location.pathname.startsWith('/booking/');

  // Only render chatbot on passenger pages
  if (!isPassengerPage) {
    return null;
  }

  // Generate a unique session ID for the chat session or restore from localStorage
  useEffect(() => {
    const generateSessionId = () => {
      return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };
    
    // Check if there's an existing session ID in localStorage
    const existingSessionId = localStorage.getItem('chatbot_session_id');
    
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      localStorage.setItem('chatbot_session_id', newSessionId);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts
  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.get(`/api/chatbot/history/${sessionId}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message to chat immediately
    const newUserMessage = {
      type: "user",
      message: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await api.post("/api/chatbot/send-message", {
        message: userMessage,
        sessionId: sessionId,
      });

      if (response.data.success) {
        // Add bot response to chat
        const botMessage = {
          type: "bot",
          message: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      const errorMessage = {
        type: "bot",
        message: "Sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearChat = async () => {
    try {
      await api.delete(`/api/chatbot/clear/${sessionId}`);
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear chat:", error);
    }
  };

  const startNewChat = () => {
    // Clear current session and create a new one
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatbot_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setIsLoadingHistory(false); // Reset loading state since we're starting fresh
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const maximizeChat = () => {
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          title="Chat with us"
        >
          <MessageSquareText size={24} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
          isMinimized
            ? "w-80 h-16"
            : "w-96 h-[500px]"
        } border border-gray-200`}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot size={20} />
            <h3 className="font-semibold">Chat Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <>
                <button
                  onClick={startNewChat}
                  className="hover:bg-blue-700 rounded p-1 transition-colors"
                  title="Start New Chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </button>
                <button
                  onClick={minimizeChat}
                  className="hover:bg-blue-700 rounded p-1 transition-colors"
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
              </>
            )}
            {isMinimized && (
              <button
                onClick={maximizeChat}
                className="hover:bg-blue-700 rounded p-1 transition-colors"
                title="Maximize"
              >
                <MessageSquareText size={16} />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="hover:bg-blue-700 rounded p-1 transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-[350px]">
              {isLoadingHistory ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquareText size={32} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-sm">
                    Loading chat history...
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquareText size={32} className="mx-auto mb-2 text-blue-500" />
                  <p className="text-sm">
                    Hi! I'm your bus booking assistant. How can I help you today?
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "bot" && (
                            <Bot size={16} className="mt-1 flex-shrink-0" />
                          )}
                          {message.type === "user" && (
                            <User size={16} className="mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.message}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.type === "user"
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot size={16} className="text-gray-500" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  onClick={clearChat}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear Chat
                </button>
                <p className="text-xs text-gray-400">
                  Press Enter to send
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
