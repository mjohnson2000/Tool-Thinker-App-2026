"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "What tools can help me validate my business idea?",
  "How do I create a business plan?",
  "I need help with my pitch deck",
  "What's the best framework for my startup?",
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello 👋 I'm Marcus, your AI assistant. How can I help you today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [messages, isOpen, isMinimized])

  async function handleSend(message?: string) {
    const messageToSend = message || input.trim()
    if (!messageToSend || isLoading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/consultation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: messageToSend }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleNewConversation() {
    setMessages([
      {
        role: "assistant",
        content: "Hello 👋 I'm Marcus, your AI assistant. How can I help you today?",
      },
    ])
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="bg-gray-900 text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 group"
          aria-label="Open Marcus chatbot"
        >
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg font-bold">M</span>
          </div>
          <span className="font-semibold pr-2 hidden sm:block">Ask Marcus</span>
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col" style={{ height: isMinimized ? "60px" : "600px", transition: "height 0.3s ease" }}>
        {/* Header */}
        <div className="bg-gray-900 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold">M</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Marcus</h3>
              <p className="text-xs text-gray-300">AI Assistant</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isMinimized) {
                setIsMinimized(false)
              } else {
                setIsMinimized(true)
              }
            }}
            className="text-white hover:text-gray-300 transition"
            aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 mb-3">Suggested questions:</p>
                  {SUGGESTED_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(question)}
                      className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition text-sm text-gray-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 items-start ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold mt-0.5">
                      M
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                      message.role === "user"
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-white text-gray-900 border border-gray-200 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} className="leading-relaxed text-gray-900" />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold mt-0.5">
                      You
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-semibold">
                    M
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Marcus anything..."
                    rows={1}
                    className="resize-none bg-gray-50 border-gray-300 focus:border-gray-900 focus:ring-gray-900 text-sm"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="bg-gray-900 hover:bg-gray-800 px-4 py-2 h-auto"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </Button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Marcus can make mistakes. Double-check replies.</p>
                {messages.length > 1 && (
                  <button
                    onClick={handleNewConversation}
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    New chat
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

