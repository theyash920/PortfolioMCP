"use client";

import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import type { CHAT_PROFILE_QUERYResult } from "@/sanity.types";
import { useSidebar } from "../ui/sidebar";
import { X, Send, User, Bot, Loader2 } from "lucide-react";

export function Chat({
  profile,
}: {
  profile: CHAT_PROFILE_QUERYResult | null;
}) {
  const { toggleSidebar } = useSidebar();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedModel] = useState("llama-3.3-70b-versatile");

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } =
    useChat({
      api: "/api/chat",
      body: {
        model: selectedModel,
      },
      streamProtocol: "text",
      onFinish: (message) => {
        console.log("Chat Stream Finished:", message);
      },
      onError: (error) => {
        console.error("Chat Stream Error:", error);
      },
    });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ")
    : "Me";

  const starterPrompts = [
    {
      icon: "💼",
      label: "What's your experience?",
      prompt: "Tell me about your professional experience and previous roles",
    },
    {
      icon: "💻",
      label: "What skills do you have?",
      prompt: "What technologies and programming languages do you specialize in?",
    },
    {
      icon: "🚀",
      label: "What have you built?",
      prompt: "Show me some of your most interesting projects",
    },
    {
      icon: "👤",
      label: "Who are you?",
      prompt: "Tell me more about yourself and your background",
    },
  ];

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Chat with {profile?.firstName || "Me"}
        </h2>
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Hi! I'm {fullName}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Ask me anything about my work, experience, or projects.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {starterPrompts.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => handlePromptClick(item.prompt)}
                  className="flex flex-col items-start p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-2">
              <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-2 text-center">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          This is an AI-powered twin. Responses may not be 100% accurate.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything..."
            className="flex-1 px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
